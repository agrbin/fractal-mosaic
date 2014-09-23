module.exports.emptyArray = function (n, m) {
  var sol = new Array(n);
  for (var it = 0; it < n; ++it) {
    sol[it] = new Array(m);
    for (var jt = 0; jt < m; ++jt) {
      sol[it][jt] = 0;
    }
  }
  return sol;
};

module.exports.collateArray = function (flat, n, m) {
  var sol = module.exports.emptyArray(n, m);
  for (var it = 0; it < n; ++it) {
    for (var jt = 0; jt < m; ++jt) {
      sol[it][jt] = flat[it * m + jt];
    }
  }
  return sol;
}

module.exports.flattenArray = function (arr) {
  var sol = [];
  for (var it = 0; it < arr.length; ++it) {
    for (var jt = 0; jt < arr[it].length; ++jt) {
      sol.push(arr[it][jt]);
    }
  }
  return sol;
};

/*
 * arrays should have n * m arrays of same dimension N M
 * resulting array will have n*N x m*M dimensions
 *
 */
module.exports.explodeArray = function (n, m, arrays) {
  var N = arrays[0].length,
    M = arrays[0][0].length,
    sol = module.exports.emptyArray(n * N, m * M),
    wot = 0;
  if (n * m !== arrays.length) {
    throw "n * m should be arrays.length";
  }
  for (var it = 0; it < n; ++it) {
    for (var jt = 0; jt < m; ++jt) {
      for (var It = 0; It < N; ++It) {
        for (var Jt = 0; Jt < M; ++Jt) {
          sol[it * N + It][jt * M + Jt] = arrays[wot][It][Jt];
        }
      }
      ++wot;
    }
  }
  return sol;
};

