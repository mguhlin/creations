#!/bin/bash
if ! command -v ffmpeg &> /dev/null; then
    echo "[ERROR] ffmpeg not found." [cite: 1]
    exit 1
fi

if [ -z "$1" ]; then
    echo "Usage: ./audio_convert.sh file1 file2 ..."
    exit 0
fi

echo -e "Choose output format:\n1) MP3\n2) OGG\n3) MP4 (AAC)" [cite: 2]
read -p "Enter 1, 2, or 3: " FMT

case $FMT in
    1) OUTFMT="mp3"; echo -e "1) Low (48k)\n2) Med (96k)\n3) High (160k)"; read -p "Choice: " Q
       [[ $Q == "1" ]] && OPTS="-vn -codec:a libmp3lame -b:a 48k" [cite: 3]
       [[ $Q == "2" ]] && OPTS="-vn -codec:a libmp3lame -b:a 96k" [cite: 3]
       [[ $Q == "3" ]] && OPTS="-vn -codec:a libmp3lame -b:a 160k"[cite: 3];;
    2) OUTFMT="ogg"; read -p "Quality (2-Low, 4-Med, 6-High): " Q
       OPTS="-vn -codec:a libvorbis -qscale:a $Q"[cite: 4];;
    3) OUTFMT="mp4"; read -p "Quality (64k, 96k, 128k): " Q
       OPTS="-vn -codec:a aac -b:a ${Q}k -movflags +faststart"[cite: 5];;
esac

for f in "$@"; do
    ffmpeg -i "$f" $OPTS "${f%.*}.$OUTFMT" [cite: 6]
done
echo "Finished." [cite: 7]