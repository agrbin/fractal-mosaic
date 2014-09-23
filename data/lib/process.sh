#!/bin/bash

# this script is part of the parent script and its called with
# --to-command=./process.sh in tar

[ -z $OUT_DIR ] && echo "set OUT_DIR!" && exit
[ -z $ID_FILE ] && echo "set TAR_FILENAME prior to calling this" && exit
[ ! -f $ID_FILE ] && echo "create $ID_FILE" && exit
[ -z "$TAR_FILENAME" ] && echo "arrrrgh" && exit

MYCROP=$(dirname $0)/mycrop.sh

# process only images!
img="$TAR_FILENAME"

id=$(cat $ID_FILE)
out=$OUT_DIR/$OUT_SIZE/${id}.jpg
out_thumb=$OUT_DIR/$THUMB_SIZE/${id}.bmp

ext="${img##*.}"
ext=$(echo $ext | tr '[:upper:]' '[:lower:]')
tmp=$OUT_DIR/tmp.$ext
cat - > $tmp

# process
crop=$($MYCROP $tmp $out $out_thumb 2>> $OUT_DIR/errors.log)

function die {
  echo "conversion failed: $img" >> $OUT_DIR/errors.log;
  rm -f $tmp
  exit;
}

[ $? -ne 0 -o -z "$crop" ] && die

echo $id "'$img'" $crop >> $OUT_DIR/crop-index.txt
echo $(($id+1)) > $ID_FILE
rm -f $tmp

