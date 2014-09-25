var config = require('./config.js'),
  collateArray = require('./array.js').collateArray,
  fs = require('graceful-fs');

function getImageMosaic(id, done) {
  var file = config.mosaicDir + id + ".mosaic.json";
  fs.readFile(file, function (err, result) {
    var parsed;
    if (err) {
      return done(err);
    }
    try {
      parsed = JSON.parse(result);
    } catch (err) {
      return done(err);
    }
    done(null, parsed);
  });
}

module.exports.getImageMosaic = getImageMosaic;
