#!/bin/bash

function usage {
  echo  "usage: $0 "
  echo  "  (input: tiler output/ dir with mosaic arrays)"
  echo  "  (output: separate mosaic files dir)"
  echo
  echo "This script takes output files from tiler which are mosaic arrays for
  multiple images (K, used in prepare-input.sh) and it will create a fail for
  each image in output dir in format $ID.mosaic.json";
  exit 1
}

[ $# -ne 2 ] && usage

set -e

output_dir=$1
mosaic_dir=$2
mkdir -p $mosaic_dir
kRows=32
kCols=32

ls $output_dir | while read group; do
  jscode=$(
  cat <<EOF
    var fs = require('fs'),
      group=JSON.parse(fs.readFileSync('$output_dir/$group')),
      key,
      it,
      sol = new Array($kRows);
    for (key = 0; key < $kRows; ++key) {
      sol[key] = new Array($kCols);
    }
    for (key in group) {
      for (it = 0; it < group[key].length; ++it) {
        sol[ (it / $kRows) | 0 ][ it % $kRows ] = group[key][it];
      }
      fs.writeFileSync(
        '$mosaic_dir/'+key+'.mosaic.json', JSON.stringify(sol)
      );
    }
EOF
  )
  node -e "$jscode"
  echo $group
done

