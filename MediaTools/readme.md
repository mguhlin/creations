# Media and Document Processing Tools

This repository contains a collection of batch script utilities designed for Windows to streamline media conversion, image optimization, and document merging. These tools primarily utilize **FFmpeg**, **ImageMagick**, and **Pandoc** to perform high-quality transformations via a simple drag-and-drop interface.

-----

## Core Utilities

### Audio and Video Conversion

  * [cite_start]**[Tool1\_Convert\_Audio\_or\_Video\_to\_MP3.bat](https://www.google.com/search?q=Tool1_Convert_Audio_or_Video_to_MP3.bat)**: Converts dropped files into **MP3**, **OGG (Vorbis)**, or **MP4 (AAC)**[cite: 2]. [cite_start]It offers three quality levels (Low, Medium, and High) for each format[cite: 3, 4, 5].
  * [cite_start]**[Tool2\_BulkVideoConversion.bat](https://www.google.com/search?q=Tool2_BulkVideoConversion.bat)**: Converts video files into web-ready formats[cite: 10]. [cite_start]Users can choose between **MP4 (H.264/AAC)** for high compatibility or **WebM (VP9/Opus)** for high-quality web optimization[cite: 12].
  * [cite_start]**[Tool7\_Convert\_Vid\_to\_WebM.bat](https://www.google.com/search?q=Tool7_Convert_Vid_to_WebM.bat)**: Specifically focused on WebM conversion[cite: 55]. [cite_start]It allows users to select between High Quality, Standard, or Small File (high compression) presets[cite: 58, 59].

### Audio Enhancement

  * [cite_start]**[Tool3\_AudioFix.bat](https://www.google.com/search?q=Tool3_AudioFix.bat)**: An automated script that applies noise reduction and boosts frequencies below 100Hz by 6dB for "depth"[cite: 16, 17].
  * [cite_start]**Loudness Processing**: It uses a compressor and limiter to increase "loudness" and "solidity" while preventing digital clipping[cite: 18, 19].

### Image Optimization and Shrinking

  * [cite_start]**[Tool4\_ImageShrinker\_CompressToPNG.bat](https://www.google.com/search?q=Tool4_ImageShrinker_CompressToPNG.bat)**: Reduces images to a maximum dimension of **1600px**[cite: 24]. [cite_start]It converts files to PNG, strips metadata, and applies strong compression[cite: 27].
  * [cite_start]**[Tool5\_ImgShrinker\_ConvertMediaToImages.bat](https://www.google.com/search?q=Tool5_ImgShrinker_ConvertMediaToImages.bat)**: Converts images and videos into **WEBP, JPG, PNG, or GIF**[cite: 32]. [cite_start]For videos, it extracts a thumbnail frame at the one-second mark and scales it according to user settings[cite: 36].
  * [cite_start]**[Tool6\_ImgShrinker\_ShrinkPNG.bat](https://www.google.com/search?q=Tool6_ImgShrinker_ShrinkPNG.bat)**: Focuses on aggressive file-size reduction by scaling dimensions (e.g., 60%, 50%, or 40% of original pixels)[cite: 47, 49, 51]. [cite_start]It utilizes ImageMagick to resize and compress PNG files[cite: 53].

### Document Management

  * [cite_start]**[Tool8\_UniversalTextConverter.bat](https://www.google.com/search?q=Tool8_UniversalTextConverter.bat)**: A dual-engine converter that takes inputs like PDF, DOCX, RTF, and TXT[cite: 62]. [cite_start]It can merge multiple files into a single document in formats such as **Markdown, MS Word, PDF, or HTML**[cite: 65, 66].

-----

## Requirements

To use these tools, ensure the following applications are installed and added to your system **PATH**:

| Tool Category | Required Dependency | Source |
| :--- | :--- | :--- |
| **Video/Audio** | [cite_start][FFmpeg](https://ffmpeg.org) | [cite: 1, 8] |
| **Images** | [cite_start][ImageMagick](https://imagemagick.org) | [cite: 22, 29, 42] |
| **Documents** | [cite_start][Pandoc](https://pandoc.org) | [cite: 63] |

-----

## How to Use

1.  **Select** the files or folders you wish to process.
2.  [cite_start]**Drag and drop** them directly onto the relevant `.bat` file[cite: 9, 25, 30, 56].
3.  [cite_start]**Follow the on-screen prompts** to select quality levels or output formats[cite: 2, 32, 59, 66].
4.  [cite_start]The processed files will be saved in the **same folder** as your original files[cite: 11, 57].

[cite_start]All processes conclude with a "Finished" or "Success" message once the queue is clear[cite: 7, 15, 21, 28, 41, 61, 71].
