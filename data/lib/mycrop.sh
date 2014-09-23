#!/bin/bash

# this file crops an image to 16x9 format
# it's ugly, i know.
# it creates a thumb also.
# it will echo dimensions and crop geometry on success

set -e

in=$1
out=$2
out_thumb=$3

size=$(identify $in | cut -f3 -d' ')
w=$(echo $size | cut -f1 -dx)
h=$(echo $size | cut -f2 -dx)

[[ ! $w =~ ^[0-9]+$ ]] && exit 0
[[ ! $h =~ ^[0-9]+$ ]] && exit 0
[ $w -lt 256 -o $h -lt 256 ] && exit 0

ratio=$(( 1000 * $w / $h ))

if [ $ratio -le 1777 ]; then
  x0=0
  tmp=$(( 1000 * $h * $w / ($h + $w) ))
  [ $ratio -ge 1000 ] && tmp=$(( 1000 * $h - $tmp ))
  y0=$(( ($tmp - 9000 / 32 * $w) / 1000 ))
  nw=$w
  nh=$(( ($nw * 9000 / 16) / 1000 ))
else
  nh=$h
  nw=$(( ($nh * 16000 / 9) / 1000 ))
  y0=0
  x0=$(( $w / 2 - $nw / 2 ))
fi

if [ $y0 -lt 0 ]; then
  y0=$(( ($h - $nh) / 2 ))
fi

echo \
  "${w}x${h} -crop ${nw}x${nh}+${x0}+${y0} -resize $OUT_SIZE!";

convert $in \
  -crop ${nw}x${nh}+${x0}+${y0} \
  -quality $JPEG_QUALITY \
  -resize $OUT_SIZE! $out

convert $out -resize $THUMB_SIZE $out_thumb


