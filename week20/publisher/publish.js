const http = require('http');
const archiver = require('archiver');
const child_process = require('child_process');

let packageName = './package';
let redirect_uri = encodeURIComponent('http://localhost:8081/auth');

child_process.exec(
  `open http://github.com/login/oauth/authorize?client_id=Iv1.9014fc3effdd4989&redirect_uri=${redirect_uri}&scope=read:user&state=123abc`
);

const server = http.createServer((request, response) => {
  let token = request.url.match(/token=([^&]+)/)[1];

  const options = {
    host: 'localhost',
    port: 8081,
    path: '/?fileName=package.zip',
    method: 'POST',
    headers: {
      token: token,
      'Content-Type': 'application/octet-stream'
    }
  };

  const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${res.rawHeaders}`);
  });

  req.on('error', e => {
    console.error(`problem with request: ${e.message}`);
  });

  var archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.directory(packageName, false);
  archive.finalize();
  archive.pie(req);

  archive.on('end', () => {
    req.end();
    response.end('');
    server.close();
  });
});

server.listen(8080);
