const http = require('http');
const https = require('https');
const unzip = require('unzipper');

const server = http.createServer((req, res) => {
  if (req.url.match(/\/auth/)) {
    return auth(req, res);
  }

  if (!req.url.match(/^\/?/)) {
    res.writeHead(404, { 'content-type': 'text-plain' });
    res.end('not found');
    return;
  }

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/user',
    method: 'GET',
    headers: {
      Authorization: 'token ' + req.headers.token,
      'user-Agent': 'toy-publish-server'
    }
  };

  const request = http.request(options, response => {
    let body = '';
    response.on('data', d => {
      body += d;
    });

    response.on('end', () => {
      let user = JSON.parse(body);
      console.log(user);
      let writeStream = unzip.Extract({ path: '../server/public' });
      req.pipe(writeStream);

      req.on('end', () => {
        res.writeHead(200, {
          'Content-type': 'text-plain'
        });
        res.end('okay');
      });
    });
  });

  request.on('error', e => {
    console.log(e);
  });

  request.end();
});

server.listen(8081);

function auth(req, res) {
  let code = req.url.match(/code=([^&]+)/)[1];
  let state = '123abc';
  let client_id = 'Iv1.9014fc3effdd4989';
  let client_secret = 'ff661e8069c36bf7fbf889216c70b087212dd981';
  let redirect_url = encodeURIComponent('http://localhost:8081/auth');
  let params = `code=${code}&state=${state}&client_id=${client_id}&client_secret=${client_secret}&redirect_url=${redirect_url}`;

  const options = {
    hostname: 'github.com',
    port: 443,
    path: `/login/oauth/access_token?${params}`,
    method: 'POST'
  };
  const request = https.request(options, response => {
    response.on('data', d => {
      console.log(1);
      let result = d.toString().match(/access_token=([^&]+)/);
      console.log(result);
      if (result) {
        let token = result[1];
        res.writeHeader(200, {
          access_token: token,
          'Content-type': 'text/html'
        });
        res.end(`<a href="localhost:8080/publish?token=${token}">publish</a>`);
      } else {
        res.writeHeader(200, {
          'Content-type': 'text/plain'
        });
        res.end('error');
      }
    });
  });

  request.on('error', e => {
    console.error(e);
  });

  request.end();
}
