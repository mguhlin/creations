#!/bin/bash
MAXSIZE=1600 [cite: 24]
for f in "$@"; do
    magick "$f" -auto-orient -resize "${MAXSIZE}x${MAXSIZE}>" -strip -define png:compression-level=9 "${f%.*}_small.png" [cite: 27]
done
echo "All done." [cite: 28]