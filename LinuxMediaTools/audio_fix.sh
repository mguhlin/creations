#!/bin/bash
# Enhances audio with noise reduction, bass boost, and compression [cite: 16, 17, 18]
for f in "$@"; do
    ffmpeg -i "$f" -af "afftdn=nr=12, bass=g=6:f=100:w=0.5, acompressor=threshold=-20dB:ratio=6:makeup=8, aecho=0.8:0.88:20:0.2, alimiter=limit=0.95" -c:a libmp3lame -q:a 2 "${f%.*}_deep_loud.mp3" -y [cite: 20]
done
echo "Processing Complete." [cite: 21]