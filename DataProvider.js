/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};

zz.DataProvider = function (ajax) {
  var mosaicCallbacks = {};

  this.getImageData = function (spec, done) {
    if (!zz.drawImages) {
      return done('mock image data');
    }
    var sol = new Image();
    sol.src = zz.kApiUrl
      + ([spec.id, spec.f, spec.mx, spec.my].join('-')) + '.jpg';
    sol.onload = done.bind(null, sol);
  };

  function mosaicLoaded(id, err, result) {
    if (err) {
      delete mosaicCallbacks[id];
      return console.log(err);
    }
    for (var it = 0; it < mosaicCallbacks[id].length; ++it) {
      mosaicCallbacks[id][it](result);
    }
    delete mosaicCallbacks[id];
  }

  this.getImageMosaic = function (id, done) {
    if (!mosaicCallbacks.hasOwnProperty(id)) {
      mosaicCallbacks[id] = [];
      ajax.downloadJSON(
        zz.kApiUrl + id + '.mosaic.json',
        mosaicLoaded.bind(null, id)
      );
    }
    mosaicCallbacks[id].push(done);
  };
};
