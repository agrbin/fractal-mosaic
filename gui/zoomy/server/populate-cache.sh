#!/bin/bash

for i in {0..65535}; do
  for mx in {0..7}; do
    for my in {0..7}; do
      echo 'curl -s http://fractal-mosaic.xfer.hr/$i-4-$mx-$my.jpg >/dev/null';
    done
  done
done | parallel --progress -j2
