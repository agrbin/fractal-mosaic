var fs = require("fs"),
  getImageMosaic = require("./provider.js").getImageMosaic,
  emptyArray = require("./array.js").emptyArray,
  path = require('path'),
  montage = require("./montage.js"),
  flattenArray = require("./array.js").flattenArray,
  explodeArray = require("./array.js").explodeArray,
  async = require("async");

require('http')
  .createServer(handleRequest)
  .listen(8080);

function error(res, msg) {
  res.statusCode = 400;
  res.end("error: " + msg.toString());
}

function hardMontage(arr, res) {
  async.map(flattenArray(arr), getImageMosaic, function (err, mosaics) {
    if (err) {
      return error(res, err);
    }
    montage(explodeArray(arr.length, arr[0].length, mosaics), res);
  });
}

function spitImage(id, f, mx, my, res) {
  getImageMosaic(id, function (err, mosaic) {
    if (err) {
      return error(res, err);
    }
    var arr = emptyArray(f, f);
    for (var it = 0; it < f; ++it) {
      for (var jt = 0; jt < f; ++jt) {
        arr[it][jt] = mosaic[it + mx][jt + my];
      }
    }
    if (f < 8) {
      hardMontage(arr, res);
    } else {
      montage(arr, res);
    }
  });
}

function handleRequest(req, res) {
  if (req.url.indexOf('?nocache') > 0) {
    req.url = req.url.substr(0, req.url.length - '?nocache'.length);
  }
  var vars = path.basename(req.url, '.jpg').split('-'),
    id = Number(vars[0]),
    f = Number(vars[1]),
    mx = Number(vars[2]),
    my = Number(vars[3]);
  if (id >= 0 && f > 1 && ((f&(-f)) === f) && f <= 32 && mx >= 0 && my >= 0
      && mx < 32 && my < 32 && mx + f <= 32 && my + f <= 32) {
    return spitImage(id, f, mx, my, res);
  }

  id = Number(path.basename(req.url, '.mosaic.json'));
  if (id >= 0 && id < 65536) {
    return getImageMosaic(id, function (err, result) {
      if (err) {
        return error(err);
      }
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-control': 'public,max-age=3000,s-maxage=9000',
      });
      res.end(JSON.stringify(result));
    });
  }
  error(res, 'wrong input params');
}

