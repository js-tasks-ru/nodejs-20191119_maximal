const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('File Not Found (SubDirectories are Not supported)');
        break;        
      }
    
      if (!fs.existsSync(filepath)) {
        res.statusCode = 404;
        res.end('File Not Found');
        break;
      }
      
      fs.unlink(filepath, (error) => {
        if (error) {
          res.statusCode = 500;
          res.end('Server Error' + error);
        } else {
          res.statusCode = 200;
          res.end('File Deleted')
        }
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
