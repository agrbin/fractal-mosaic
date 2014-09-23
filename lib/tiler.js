var random = require('./random');

module.exports = function (index, blocks, progress, log) {
  var kRows = 32,
    kCols = 32,
    kNearestNeighbors = 10,
    kBeta = 2e5;

  // returns array of kRows*kCols two-elem arrays that are filling the whole
  // table in random order.
  function getRandomOrder() {
    var it, jt, order = [];
    for (it = 0; it < kRows; ++it) {
      for (jt = 0; jt < kCols; ++jt) {
        order.push([it, jt]);
      }
    }
    return random.shuffle(order);
  }

  function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }

  function chooseCandidateForBlock(x, y, candidates, where) {
    var id, score, jt,
      minScore = null,
      best = null;
    for (id in candidates) {
      score = candidates[id];
      for (jt = 0; jt < where[id].length; ++jt) {
        score += kBeta / dist(x, y, where[id][jt][0], where[id][jt][1]);
      }
      if (minScore === null || score < minScore) {
        minScore = score;
        best = id;
      }
    }
    return best;
  }

  // candidates.length = blocks.length
  // candidates[0]::count = kNearestNeighbors
  // candidates[0]["solution_ID"] = distance;
  function choose(candidates) {
    var it, jt, pick, x, y, place,
      where = {},
      order = getRandomOrder(),
      sol = new Array(order.length);
    for (it = 0; it < order.length; ++it) {
      for (jt in candidates[it]) {
        where[jt] = new Array();
      }
    }
    log('neighbors calculated');
    for (it = 0; it < order.length; ++it) {
      progress(0.5 + 0.5 * it / order.length);
      x = order[it][0], y = order[it][1];
      place = x * kCols + y;
      pick = chooseCandidateForBlock(x, y, candidates[place], where);
      where[pick].push([x, y]);
      sol[place] = Number(pick);
    }
    return sol;
  }

  log('index loaded');
  progress(0.5);
  return choose(index.multiQuery(blocks, kNearestNeighbors));
};
