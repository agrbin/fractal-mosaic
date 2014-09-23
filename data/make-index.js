#!/usr/local/bin/node
var Flann = require('../lib/external/flann.js/flann.js'),
  toNodeBuffer = require('../lib/buffer-helper').toNodeBuffer,
  path = require('path'),
  fs = require('fs'),
  encoding = {encoding: 'ascii'},
  INPUT_FILE,
  OUT_FILENAME;

if (process.argv.length !== 4) {
  console.log("usage: " + path.basename(process.argv[1]) +
      " (input .features.json file) " +
      " (output index.js file)");
  console.log("\n"
    + "this script will read input JSON file consiting of array of "
    + "vectors of same dimension and produce FLANN index.\n"
    + "index will be written into output .js file as a module "
    + "with public get and free methods. get method will return "
    + "base64 encoded data that can be forwarded to Flann.fromSerialized");
  process.exit();
}

INPUT_FILE = process.argv[2];
OUT_FILENAME = process.argv[3];

function Timer() {
  var t0 = new Date().getTime();
  this.reset = function () {
    t0 = new Date().getTime();
  };
  this.get = function () {
    return Math.round(new Date().getTime() - t0) / 1000 + ' sec';
  }
}

function testLoad(contents) {
  var index;
  index = Flann.fromSerialized(null, contents);
  console.log('load test complete, index size: ', index.getSize());
}

var indexPreamble = "var data;\n"
  + "module.exports.get = function () {return data;};\n"
  + "module.exports.free = function () {data = null;};\n"
  + "data = \"";

fs.readFile(INPUT_FILE, {encoding: 'ascii'}, function (err, data) {
  var index, features, t = new Timer(), params;
  if (err) {
    return console.log('while loading features', err);
  }
  try {
    features = JSON.parse(data);
  } catch (err) {
    return console.log('while parsin json', err);
  }
  t.reset();
  console.log('building index..');
  index = Flann.fromDataset(features);
  params = index.getParameters();
  params.save_dataset = true;
  index = Flann.fromDataset(features, params);

  console.log('done, index has ' + index.getSize()
    + ' vectors with dimension of ' + index.getVeclen()
    + '. took ' + t.get());
  console.log(params);

  console.log('writing serialized gzipped index to file...');
  data = toNodeBuffer(index.serialize());
  fs.writeFile(
      OUT_FILENAME,
      indexPreamble + data.toString('base64') + "\";\n",
      encoding,
      testLoad.bind(this, data));
});

