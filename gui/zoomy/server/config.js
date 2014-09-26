module.exports = {
  mosaicDir : "../../../data/big-dataset/mosaic/",
  // a queue is used to serve requests, this is its concurrency param
  concurrency : 5,

  // when queue.length() is ge than queueLimit, request is not enqueued but
  // rather 503-ed
  queueLimit : 100,
  kRows : 32,
  kCols : 32,
  kWidth : 256,
  kHeight : 144,

  cacheControl : "public,max-age=31536000,s-maxage=31536000",

};
