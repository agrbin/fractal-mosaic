var Flann = require('./external/flann.js/flann.js'),
  indexBase64 = require('../data/small-dataset/index.js');

module.exports.get = function () {
  var zipped = new Buffer(indexBase64.get(), 'base64');
  indexBase64.free();
  index = Flann.fromSerialized(null, zipped);
  return index;
};

