#!/bin/bash
if [ -z "$1" ]; then
    echo "Drop files here or provide as arguments." [cite: 9]
    exit 1
fi

echo -e "Select format:\n1) MP4 (H.264)\n2) WebM (VP9)" [cite: 12]
read -p "Choice: " choice

for f in "$@"; do
    if [ "$choice" == "1" ]; then
        ffmpeg -i "$f" -c:v libx264 -crf 23 -c:a aac -b:a 128k -movflags +faststart "${f%.*}.mp4" -y [cite: 14]
    else
        ffmpeg -i "$f" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "${f%.*}.webm" -y [cite: 14]
    fi
done
echo "Success." [cite: 15]