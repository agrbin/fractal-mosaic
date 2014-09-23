/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};


zz.Repeat = function (interval) {
  var inExecution = false,
    lastExecution = -1e12;

  function clock() {
    return new Date().getTime();
  }

  this.callHimNextTime = function () {
    lastExecution = -1e12;
  };

  this.callMeMaybe = function (callback) {
    if (inExecution) {
      return false;
    }
    if (clock() - lastExecution > interval) {
      lastExecution = clock();
      callback();
    }
    return true;
  };
};

