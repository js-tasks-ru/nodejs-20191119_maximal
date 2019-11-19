function sum(a, b) {
  if (typeof(a) != 'number' || typeof(b) != 'number')
    throw new TypeError('Arguments Must be a Numbers!');
  
  return a + b;
}

module.exports = sum;
