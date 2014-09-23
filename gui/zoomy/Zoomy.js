/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};

zz.Zoomy = function (screen, provider) {
  var fh;

  function clock() {
    return new Date().getTime();
  }

  (function () {
    fh = new zz.FrameHolder(clock, provider);
    screen.drawAlways(fh);
  }());
};
