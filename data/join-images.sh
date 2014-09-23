#!/bin/bash

if [ $# -ne 4 ]; then
  echo "usage: $0"
  echo "  (.out.json file with images)";
  echo "  (image id from .out.json)";
  echo "  (thumbnail directory)";
  echo "  (output image file to write)";
  echo
  echo this script will take output json file that contains an array of ids of
  echo images that needs to be tiled together. it will use image-magick colage
  echo to tile them up.
  echo
  echo this script operates on packed output files. you dont need to call
  echo flatten-output to use it. thumbnail directory should contain ID.bmp
  echo for all IDs that appear in out.json
  exit 1
fi

transform=$(cat <<EOF
console.log(
  JSON.parse(require('fs').readFileSync('$1'))[$2]
  .map(function (x) {return '$3/' + x + '.bmp';})
  .join(' ')
);
EOF
)

images=$(node -e "$transform")
if [ -z "$images" ]; then
  echo "transform failed. check your .out.json file"
  exit
fi

montage -mode concatenate -tile 32x32 $images $4
