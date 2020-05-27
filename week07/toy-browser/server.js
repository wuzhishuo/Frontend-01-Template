const http = require('http');
const server = http.createServer((req, res) => {
  console.log('request received');
  console.log(req.headers);
  res.setHeader('Content-type', 'text-plain');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-type': 'text-plain' });
  res.end(`<html maaa=a >
  <head>
      <style>
        body {
            display: flex;
            flex-direction: row;
        }

        .block1 {
            display: flex;
            width: 100px;
            height: 200px;
            background-color: rgb(154,20,39)
        }

        .section {
            display: flex;
            flexDirection: column;
            background-color: rgb(255,255,255)
        }

        .block2 {
            display: flex;
            width: 100px;
            height: 100px;
            background-color: rgb(169,149,5);
        }

        .block3 {
            display: flex;
            width: 100px;
            height: 100px;
            background-color: rgb(40,86,34)
        }
      </style>
  </head>
  <body>
      <div class="block1">
          
      </div>
      <div class="section">
        <div class="block2"></div>
        <div class="block3"></div>
      </div>
  </body>
  </html>  
  `);
});

server.listen(8088);
