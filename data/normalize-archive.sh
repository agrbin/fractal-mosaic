#!/bin/bash

if [ $# -ne 2 ]; then
  echo $0
  echo " (input tar file, not compressed with images)";
  echo " (outdir that will be populated with normalized images)";
  echo
  echo take input tar archive that may contain image files and normalize them
  echo into two directories named by image sizes, default 1024x576 and 32x18.
  echo each image will have name ID.something and ID will rise
  echo from 0 onwards.
  echo big pictures will be jpeg will default 40 jepg quality.
  echo small picitures will be bmps. 
  exit;
fi 

PROCESS=$(dirname $0)/lib/process.sh

export OUT_SIZE=1024x576
export THUMB_SIZE=32x18
export JPEG_QUALITY=40
export OUT_DIR=$2
export ID_FILE=$OUT_DIR/"img.id"

[ -e $OUT_DIR ] && echo "$OUT_DIR exists." && exit 1

mkdir -p $OUT_DIR/$OUT_SIZE
mkdir -p $OUT_DIR/$THUMB_SIZE

echo "0" > $ID_FILE
tar xf $1 --to-command=$PROCESS
rm $ID_FILE
