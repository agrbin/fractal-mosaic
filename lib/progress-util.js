// returns a function that will be called with arguments 0..1 and that call
// will be forwarded to progress with arguments
// k / n + x / n
module.exports.part = function (k, n, progress) {
  var last_called = 0;
  return function (x) {
    var sol = k / n + x / n;
    if (Math.abs(sol - last_called) >= 0.001) {
      last_called = sol;
      progress(sol);
    }
  };
}
