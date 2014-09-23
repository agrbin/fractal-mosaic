var seed = 0xdedababa;

function rand() {
  seed *= 3133;
  seed += 0xbabadeda;
  seed %= 0xffffffff;
  return seed / 0xffffffff;
}

function srand(newSeed) {
  seed = newSeed;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randIndex = Math.floor(module.exports.rand() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randIndex];
    array[randIndex] = temporaryValue;
  }

  return array;
}

module.exports.rand = rand;
module.exports.srand = srand;
module.exports.shuffle = shuffle;
