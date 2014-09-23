#!/bin/bash

function usage {
  echo  "usage: $0 "
  echo  "  (block-features dir)"
  echo  "  (output dir (eg. input dir tiler))"
  echo  "  (K number of images per input file)"
  echo  "  [number of input files generated, default: all]"
  echo
  echo "This script will take block features for K images and pack it into one
  input file consumed by tiler. This input file will be gzipped, and
  uncompressed md5 sum will be stored with suffix .md5. Input files will have
  names X-Y.in.json where X is the smallest id in the file and Y-1 largest one."
  echo
  echo "assumptions: block features dir contains files that are labeled 0.* to"
  echo "(N-1).* where N is number of files in dir."
  exit 1
}

function finishFile {
  echo -ne "}\n" >> $1
  md5sum $1 | cut -f1 -d' ' > $1.md5
  gzip $1
}

function nomorefiles {
  echo $2 files created.
  finishFile $3
  exit 0
}

[ $# -le 2 ] && usage

set -e

features_dir=$1
input_dir=$2
k=$3
n=$4
mkdir -p $input_dir

[ -z $n ] && n=0
processed=0
image_count=$(ls $features_dir | wc -l)
image_it=0

max=$(ls $features_dir | sort -n | tail -n1 | xargs basename | cut -f1 -d'.')
max=$(($max + 1))
suffix=$(basename $features_dir/0.* | cut -f2- -d'.')

rm -rf $input_dir/*

while true; do
  next_it=$(($image_it+k))
  file_name=$input_dir/$image_it-$next_it.in.json
  echo -ne "{\n" > $file_name

  upper=$(($next_it<$max?$next_it:$max))

  # first iteration, no coma
  echo -ne "  \"$image_it\":" >> $file_name
  zcat $features_dir/$image_it.* >> $file_name
  image_it=$(($image_it + 1));

  for ((i=$image_it; $i < $upper; i++)); do
    # next iterations
    echo -ne ",  \"$i\":" >> $file_name
    zcat $features_dir/$i.$suffix >> $file_name
  done

  [ $upper -eq $max ] && nomorefiles $i $processed $file_name
  finishFile $file_name
  image_it=$next_it
  processed=$(($processed+1))
  [ $processed -eq $n ] && break;
done
