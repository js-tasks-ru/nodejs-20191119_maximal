const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    
    this.limit = options.limit;
    this.count = 0;
  }

  _transform(chunk, encoding, callback) {
    this.count += chunk.length;

    if (this.count > this.limit) {
      callback(new LimitExceededError());
    } else {
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
