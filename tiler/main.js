var Flann = require('../lib/external/flann.js/flann.js'),
  indexLoader = require('../lib/index-loader.js'),
  tiler = require('../lib/tiler.js'),
  progressUtil = require('../lib/progress-util.js');

function log() {}

module.exports = function main(input) {
  var it, ids, index, output = {};

  // we use this in unit tests.
  if ((typeof input === 'object') && 'eval' in input) {
    return eval(input.eval);
  }

  index = indexLoader.get();
  ids = Object.keys(input);
  
  for (it = 0; it < ids.length; ++it) {
    output[ids[it]] = tiler(
        index,
        input[ids[it]],
        progressUtil.part(it, ids.length, boinc_fraction_done),
        log);
  }

  return output;
};

