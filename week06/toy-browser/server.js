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
        body div #myid{
            width:100px;
            background-color: #ff5000;
        }
        body div img{
            width:30px;
            background-color: #ff1111;
        }
        .img-test {
            height:30px;
        }
        .img-test2 {
            height: 100px
        }
      </style>
  </head>
  <body>
      <div>
          <img id="myid"/>
          <img class="img-test img-test2"/>
      </div>
  </body>
  </html>  
  `);
});

server.listen(8088);
