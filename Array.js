/*jslint indent: 2, plusplus: true*/
"use strict";

var zz = zz || {};


zz.emptyArray = function (n, m) {
  var sol = new Array(n);
  for (var it = 0; it < n; ++it) {
    sol[it] = new Array(m);
    for (var jt = 0; jt < m; ++jt) {
      sol[it][jt] = null;
    }
  }
  return sol;
};
