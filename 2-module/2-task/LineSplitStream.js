const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.encoding = options.encoding;
    this.data = '';
  }

  _transform(chunk, encoding, callback) {
    this.data += chunk;

    callback(null);
  }

  _flush(callback) {
    let data_s = this.data.toString(this.encoding);
    let lines = data_s.split(os.EOL);
    
    lines.forEach(line => {
      this.push(line);
    });

    callback(null);
  }
}

module.exports = LineSplitStream;
