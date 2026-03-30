# Media and Document Processing Tools (Linux Edition)

This repository contains a collection of Bash scripts for Linux to streamline media conversion and document processing using **FFmpeg**, **ImageMagick**, and **Pandoc**.

## Core Utilities

### Audio and Video

* **[audio_convert.sh](audio_convert.sh)**: Extract audio to MP3, OGG, or AAC with selectable quality levels.
* **[video_convert.sh](video_convert.sh)**: Convert videos to web-optimized MP4 (H.264) or WebM (VP9).
* **[audio_fix.sh](audio_fix.sh)**: Professional audio enhancement script using noise reduction, 6dB bass boost, and peak limiting.

### Image Optimization

* **[image_shrink.sh](image_shrink.sh)**: Resizes images to a maximum of 1600px, strips metadata, and applies high-level PNG compression.

### Document Management

* **[text_converter.sh](text_converter.sh)**: Uses Pandoc to merge various document types (PDF, DOCX, TXT) into a single Markdown, PDF, or Word file.

## Requirements

### Installation for Debian
Install Dependencies:

> sudo apt update && sudo apt install ffmpeg imagemagick pandoc

* **FFmpeg**: For all audio/video tasks.
* **ImageMagick (magick)**: For image resizing and conversion.
* **Pandoc**: For document merging and conversion.

## Usage

1. Make scripts executable: `chmod +x *.sh`
2. Run a script and pass files as arguments:
    ```bash
    ./audio_convert.sh song.wav video.mp4
    ```
3. The processed files will be saved in the same directory as the originals.

All scripts will notify you upon successful completion.
