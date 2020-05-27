const net = require('net');
const parse = require('./html-parser');
const render = require('./render')
const images = require('images')

class Request {
  constructor(options) {
    // method, url = host + port + path
    // body: k/v
    // headers
    this.method = options.method || 'get';
    this.host = options.host;
    this.port = options.port || '8080';
    this.path = options.path || '/';
    this.body = options.body || {};
    this.headers = options.headers || {};
    if (!this.headers['Content-type']) {
      this.headers['Content-type'] = 'application/x-www-form-urlencoded';
    }

    if (this.headers['Content-type'] == 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    } else if (
      this.headers['Content-type'] === 'application/x-www-form-urlencoded'
    ) {
      this.bodyText = Object.keys(this.body)
        .map(key => `${key}=${encodeURIComponent(this.body[key])}`)
        .join('&');
    }
    this.headers['Content-length'] = this.bodyText.length;
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
  .map(key => `${key}: ${this.headers[key]}`)
  .join(',')}\r\n
${this.bodyText}
    `;
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      const responseParser = new ResponseParser();
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port
          },
          () => {
            connection.write(this.toString());
          }
        );
      }

      connection.on('data', data => {
        responseParser.receive(data.toString());
        if (responseParser.isFinished) {
          resolve(responseParser.response);
          connection.end();
        }
      });

      connection.on('error', error => {
        reject(error.toString());
        connection;
      });
    });
  }
}

class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0;
    this.WAITING_STATUS_LINE_END = 1;
    this.WAITING_HEADER_NAME = 2;
    this.WAITING_HEADER_SPACE = 3;
    this.WAITING_HEADER_VALUE = 4;
    this.WAITING_HEADER_LINE_END = 5;
    this.WAITING_HEADER_BLOCK_END = 6;
    this.WAITING_BODY = 7;

    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = '';
    this.headers = {};
    this.headerName = '';
    this.headerValue = '';
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join('')
    };
  }

  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
  }

  receiveChar(char) {
    if (this.current == this.WAITING_STATUS_LINE) {
      if (char == '\r') {
        this.current = this.WAITING_STATUS_LINE_END;
      } else {
        this.statusLine += char;
      }
    } else if (this.current == this.WAITING_STATUS_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME;
      }
    } else if (this.current == this.WAITING_HEADER_NAME) {
      if (char == ':') {
        this.current = this.WAITING_HEADER_SPACE;
      } else if (char == '\r') {
        this.current = this.WAITING_HEADER_BLOCK_END;
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new TrunkBodyParser();
        }
      } else {
        this.headerName += char;
      }
    } else if (this.current == this.WAITING_HEADER_SPACE) {
      if (char == ' ') {
        this.current = this.WAITING_HEADER_VALUE;
      }
    } else if (this.current == this.WAITING_HEADER_VALUE) {
      if (char == '\r') {
        this.current = this.WAITING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName = '';
        this.headerValue = '';
      } else {
        this.headerValue += char;
      }
    } else if (this.current == this.WAITING_HEADER_LINE_END) {
      if (char == '\n') {
        this.current = this.WAITING_HEADER_NAME;
      }
    } else if (this.current == this.WAITING_HEADER_BLOCK_END) {
      if (char == '\n') {
        this.current = this.WAITING_BODY;
      }
    } else if (this.current == this.WAITING_BODY) {
      this.bodyParser.receiveChar(char);
    }
  }
}

class TrunkBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0;
    this.WAITING_LENGTH_LINE_END = 1;
    this.READING_THUNK = 2;
    this.WAITING_NEW_LINE = 3;
    this.WAITING_NEW_LINE_END = 4;
    this.RECEIVE_FINISHED = 5;
    this.length = 0;
    this.content = [];
    this.isFinished = false;

    this.current = this.WAITING_LENGTH;
  }
  receiveChar(char) {
    if (this.current === this.WAITING_LENGTH) {
      if (char == '\r') {
        this.current = this.WAITING_LENGTH_LINE_END;
      } else {
        this.length *= 16;
        this.length += parseInt(char, 16);

        if (this.length == 0) {
          this.isFinished = true;
          this.current = this.RECEIVE_FINISHED;
        }
      }
    } else if (this.current === this.WAITING_LENGTH_LINE_END) {
      if (char === '\n') {
        this.current = this.READING_THUNK;
      }
    } else if (this.current === this.READING_THUNK) {
      this.content.push(char);
      this.length--;
      this.current = this.READING_THUNK;

      if (this.length == 0) {
        this.current = this.WAITING_NEW_LINE;
      }
    } else if (this.current === this.WAITING_NEW_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_NEW_LINE_END;
      }
    } else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_LENGTH;
      }
    }
  }
}

void (async function() {
  let request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: '8088',
    path: '/',
    headers: {
      'x-foo2': 'x-foo2'
    },
    body: {
      name: 'zhswu'
    }
  });

  let response = await request.send();
  let html = parse.parseHTML(response.body);

  let viewport = images(800,600)
  render(viewport,html)
  viewport.save('html.jpg')
})();
