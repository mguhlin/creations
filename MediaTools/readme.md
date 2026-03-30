# Media and Document Processing Tools

This repository contains a collection of batch script utilities designed for Windows to streamline media conversion, image optimization, and document merging. These tools primarily utilize **FFmpeg**, **ImageMagick**, and **Pandoc** to perform high-quality transformations via a simple drag-and-drop interface.

-----

## Core Utilities

### Audio and Video Conversion

  * **[Tool1\_Convert\_Audio\_or\_Video\_to\_MP3.bat](https://www.google.com/search?q=Tool1_Convert_Audio_or_Video_to_MP3.bat)**: Converts dropped files into **MP3**, **OGG (Vorbis)**, or **MP4 (AAC)**[cite: 2]. [cite_start]It offers three quality levels (Low, Medium, and High) for each format.
  * **[Tool2\_BulkVideoConversion.bat](https://www.google.com/search?q=Tool2_BulkVideoConversion.bat)**: Converts video files into web-ready formats. [cite_start]Users can choose between **MP4 (H.264/AAC)** for high compatibility or **WebM (VP9/Opus)** for high-quality web optimization.
  * **[Tool7\_Convert\_Vid\_to\_WebM.bat](https://www.google.com/search?q=Tool7_Convert_Vid_to_WebM.bat)**: Specifically focused on WebM conversion. It allows users to select between High Quality, Standard, or Small File (high compression) presets.

### Audio Enhancement

  * **[Tool3\_AudioFix.bat](https://www.google.com/search?q=Tool3_AudioFix.bat)**: An automated script that applies noise reduction and boosts frequencies below 100Hz by 6dB for "depth".
  * **Loudness Processing**: It uses a compressor and limiter to increase "loudness" and "solidity" while preventing digital clipping.

### Image Optimization and Shrinking

  * **[Tool4\_ImageShrinker\_CompressToPNG.bat](https://www.google.com/search?q=Tool4_ImageShrinker_CompressToPNG.bat)**: Reduces images to a maximum dimension of **1600px**. It converts files to PNG, strips metadata, and applies strong compression.
  * **[Tool5\_ImgShrinker\_ConvertMediaToImages.bat](https://www.google.com/search?q=Tool5_ImgShrinker_ConvertMediaToImages.bat)**: Converts images and videos into **WEBP, JPG, PNG, or GIF**. For videos, it extracts a thumbnail frame at the one-second mark and scales it according to user settings.
  * **[Tool6\_ImgShrinker\_ShrinkPNG.bat](https://www.google.com/search?q=Tool6_ImgShrinker_ShrinkPNG.bat)**: Focuses on aggressive file-size reduction by scaling dimensions (e.g., 60%, 50%, or 40% of original pixels). It utilizes ImageMagick to resize and compress PNG files.

### Document Management

  * **[Tool8\_UniversalTextConverter.bat](https://www.google.com/search?q=Tool8_UniversalTextConverter.bat)**: A dual-engine converter that takes inputs like PDF, DOCX, RTF, and TXT. It can merge multiple files into a single document in formats such as **Markdown, MS Word, PDF, or HTML**.

-----

## Requirements

To use these tools, ensure the following applications are installed and added to your system **PATH**:

| Tool Category | Required Dependency | Source |
| :--- | :--- | :--- |
| **Video/Audio** | [FFmpeg](https://ffmpeg.org) ||
| **Images** | [ImageMagick](https://imagemagick.org) |  |
| **Documents** | [Pandoc](https://pandoc.org) | |

-----

## How to Use

1.  **Select** the files or folders you wish to process.
2.  **Drag and drop** them directly onto the relevant `.bat` file.
3.  **Follow the on-screen prompts** to select quality levels or output formats.
4.  The processed files will be saved in the **same folder** as your original files.

All processes conclude with a "Finished" or "Success" message once the queue is clear.
