# Media and Document Processing Tools

This repository contains a collection of batch script utilities designed for Windows to streamline media conversion, image optimization, and document merging. These tools primarily utilize **FFmpeg**, **ImageMagick**, and **Pandoc** to perform high-quality transformations via a simple drag-and-drop interface.

---

## ## Core Utilities

### ### Audio and Video Conversion
* [cite_start]**Tool1_Convert_Audio_or_Video_to_MP3.bat**: A versatile audio extractor that converts dropped files into **MP3**, **OGG (Vorbis)**, or **MP4 (AAC)**[cite: 2]. [cite_start]It offers three quality levels (Low, Medium, and High) for each format[cite: 3, 4, 5].
* [cite_start]**Tool2_BulkVideoConversion.bat**: Converts video files into web-ready formats[cite: 10]. [cite_start]Users can choose between **MP4 (H.264/AAC)** for high compatibility or **WebM (VP9/Opus)** for high-quality web optimization[cite: 12].
* [cite_start]**Tool7_Convert_Vid_to_WebM.bat**: Specifically focused on WebM conversion, allowing users to select between High Quality, Standard, or Small File presets[cite: 58]. [cite_start]It can process individual files or entire folders[cite: 55].

### ### Audio Enhancement
* [cite_start]**Tool3_AudioFix.bat**: An automated mastering script that applies noise reduction, boosts bass frequencies below 100Hz [cite: 17][cite_start], and uses a compressor and limiter to increase "loudness" and "solidity" without digital clipping[cite: 18, 19].

### ### Image Optimization and Shrinking
* [cite_start]**Tool4_ImageShrinker_CompressToPNG.bat**: Reduces images to a maximum dimension of **1600px** [cite: 24] [cite_start]while converting them to PNG with strong compression and stripped metadata[cite: 27].
* [cite_start]**Tool5_ImgShrinker_ConvertMediaToImages.bat**: A multi-purpose tool that converts both images and videos into **WEBP, JPG, PNG, or GIF**[cite: 32]. [cite_start]For videos, it automatically extracts a thumbnail frame from the one-second mark[cite: 36].
* **Tool6_ImgShrinker_ShrinkPNG.bat**: Focuses on aggressive file-size reduction by scaling dimensions. [cite_start]The default is 60%, but it includes documented settings for up to 92% reduction[cite: 47, 50].

### ### Document Management
* [cite_start]**Tool8_UniversalTextConverter.bat**: A dual-engine converter and merger[cite: 62]. [cite_start]It takes various inputs (PDF, DOCX, RTF, TXT, etc.) and merges them into a single file in formats like **Markdown, MS Word, PDF, or HTML**[cite: 65, 66].

---

## ## Requirements

To use these tools, ensure the following applications are installed and added to your system **PATH**:

| Tool Category | Required Dependency | Purpose |
| :--- | :--- | :--- |
| **Video/Audio** | [FFmpeg](https://ffmpeg.org) | [cite_start]Encoding and audio filtering [cite: 1] |
| **Images** | [ImageMagick](https://imagemagick.org) | [cite_start]Resizing and format conversion [cite: 22, 29] |
| **Documents** | [Pandoc](https://pandoc.org) | [cite_start]Document conversion and merging [cite: 63] |
| **PDF Text** | pdftotext.exe | [cite_start]Local engine for PDF extraction [cite: 63] |

---

## ## How to Use

1.  **Select** the files or folders you wish to process.
2.  **Drag and drop** them directly onto the desired `.bat` file.
3.  [cite_start]**Follow the on-screen prompts** to select quality levels or output formats[cite: 12, 33, 66].
4.  [cite_start]The processed files will be saved in the **same folder** as the originals[cite: 11, 57].


---

## ## Summary of Conversions
| Script | Input Types | Output Formats |
| :--- | :--- | :--- |
| **Tool 1** | Audio/Video | [cite_start]MP3, OGG, M4A [cite: 2] |
| **Tool 2** | Video | [cite_start]MP4, WebM [cite: 12] |
| **Tool 5** | Image/Video | [cite_start]WEBP, JPG, PNG, GIF [cite: 32] |
| **Tool 8** | PDF, DOCX, MD, HTML, etc. | [cite_start]MD, DOCX, PDF, RTF, ODT, HTML, TXT, CSV [cite: 65, 66] |

[cite_start]All processes conclude with a "Finished" or "Success" message once the queue is clear[cite: 7, 15, 21, 28, 41].

How would you like to refine the documentation for specific user groups (e.g., educators or developers)?
