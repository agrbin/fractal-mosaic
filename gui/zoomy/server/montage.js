var spawn = require('child_process').spawn,
  fs = require('graceful-fs'),
  path = require('path'),
  config = require('./config.js'),
  provider = require('./provider.js'),
  flattenArray = require('./array.js').flattenArray;

module.exports = function (imageIds, res) {
  var n = imageIds.length,
    m = imageIds[0].length,
    images = flattenArray(imageIds),
    child;

  function bailOut(msg) {
    console.log(msg.toString());
    res.end('error:' + msg.toString());
  }

  child = spawn(path.resolve("./cpp/bin/montage"), [], {
    env : {
      LD_LIBRARY_PATH: process.env["HOME"] + "/install/lib/"
    },
    cwd : path.resolve("./cpp/"),
    stdio : ['pipe', 'pipe', 'pipe'],
  });

  child.on('error', bailOut);
  child.stderr.on('data', bailOut);

  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Cache-control': 'public,max-age=3000,s-maxage=9000',
  });

  child.stdout.pipe(res);
  child.stdin.write(n + " " + m + " " + images.join(" "));
  child.stdin.end();
}

