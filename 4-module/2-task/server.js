const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { finished } = require('stream');

const server = new http.Server();

server.on('request', (req, res) => {
  //let file = '';
  
  function SendError(err, file) {
    console.log('MAX: SendError ' + err + ' --- ' + file.path);

    if (file) {
      file.once('close', () => {
        fs.unlinkSync(file.path);    
        console.log('MAX: SendError unlink');  
      })

      file.close()
      console.log('MAX: SendError close');
    }

    res.statusCode = 500;
    res.end(`Server streams Error: ${err.message}`); 
  }

  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
        console.log('MAX: NEW POST ' + pathname);
    
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
      //req.on('error', SendError);

      finished(req, (err) => {
        if (err) {
          console.log('MAX:finished: Stream error');
          SendError(err, file);
        } else {
          console.log('MAX:finished: Stream is done reading.');
          file.close;
          res.statusCode = 201;
          res.end('File Saved.');        
         }
        req.resume();
        console.log('MAX:finished: Resumed.');
      });   

      req.pipe(file);
      
      /*file.once('finish', () => {  
        console.log('MAX:finish EVENT ' + file);

        file.close;
        res.statusCode = 201;
        res.end('File Saved EVENT.');        
      });*/
      break;    

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

server.on('error', error => {console.error(error());});

module.exports = server;
