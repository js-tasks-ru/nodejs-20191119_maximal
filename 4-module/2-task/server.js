const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { finished } = require('stream');
const LimitSizeStream = require('./LimitSizeStream');
//const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('request', (req, res) => {

  function SendError(err, errCode, file) {
    //console.log('MAX: SendError ' + err + ' --- ' + file.path);

    if (file) {
      file.once('close', () => {
        if (fs.existsSync(file.path)) 
          fs.unlinkSync(file.path);    
          //console.log('MAX: SendError unlink');  
          res.statusCode = errCode;
          res.end(`Server Error: ${err.message}`); 
      })

      file.close();
      //console.log('MAX: SendError close');
    }
  }

  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
        //console.log('MAX: NEW POST ' + pathname);
    
        if (/\//.test(pathname)) {
          res.statusCode = 400;
          res.end('File Not Found (SubDirectories are Not supported)');
          break;        
        }

        if (fs.existsSync(filepath)) {
          res.statusCode = 409;
          res.end('File allready exists');
          break;
        }        

      const file = fs.createWriteStream(filepath);
      file.on('error', SendError);
      
      const limitStream = new LimitSizeStream({limit: 1*1024*1024});
        limitStream.on('error', (err) => {
          SendError(err, 413, file);
      });
      
      finished(req, (err) => {
        if (err) {
          //console.log('MAX:finished: Stream error');
          SendError(err, 500, file);
        } else {
          //console.log('MAX:finished: Stream is done reading.');
          file.close;
          res.statusCode = 201;
          res.end('File Saved.');        
         }
        req.resume();
        //console.log('MAX:finished: Resumed.');
      });   

      req.pipe(limitStream).pipe(file);
      break;    

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
