@echo off
set "ffmpeg=C:\tools\ffmpeg.exe"

:: Fallback check for bin folder
if not exist "%ffmpeg%" (
    if exist "C:\tools\bin\ffmpeg.exe" (
        set "ffmpeg=C:\tools\bin\ffmpeg.exe"
    ) else (
        echo ERROR: ffmpeg.exe not found at C:\tools or C:\tools\bin
        pause
        exit /b
    )
)

:: Check if a file was dropped
if "%~1"=="" (
    cls
    echo ======================================================
    echo           UNIVERSAL VIDEO CONVERTER (FFmpeg)
    echo ======================================================
    echo.
    echo  INSTRUCTIONS:
    echo  1. Select your video file(s).
    echo  2. Drag and drop them directly onto this .bat file.
    echo  3. Choose your desired output format.
    echo.
    echo  Supported: MP4 (H.264) and WebM (VP9)
    echo ======================================================
    pause
    exit /b
)

cls
echo ======================================================
echo           VIDEO CONVERSION UTILITY
echo ======================================================
echo  This tool will convert your dropped files into a 
echo  web-ready format. The new files will be saved in 
echo  the same folder as your originals.
echo ======================================================
echo.

echo Select output format:
echo [1] MP4 (High Compatibility - H.264/AAC)
echo [2] WebM (High Quality/Web Optimized - VP9/Opus)
echo.

choice /c 12 /m "Enter your choice:"
set "format_choice=%errorlevel%"

:: Set descriptions for the summary
if %format_choice%==1 (
    set "out_ext=MP4"
    set "out_desc=H.264 Video + AAC Audio"
) else (
    set "out_ext=WebM"
    set "out_desc=VP9 Video + Opus Audio"
)

cls
echo ======================================================
echo  STATUS: Processing to %out_ext%
echo  FORMAT: %out_desc%
echo ======================================================
echo.

:process
if "%~1"=="" goto end

echo [Working] --^> "%~nx1"

if %format_choice%==1 (
    :: MP4 High Compatibility
    "%ffmpeg%" -i "%~1" -c:v libx264 -crf 23 -c:a aac -b:a 128k -movflags +faststart "%~dpn1.mp4" -y -loglevel error
) else (
    :: WebM High Quality VP9
    "%ffmpeg%" -i "%~1" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "%~dpn1.webm" -y -loglevel error
)

shift
if not "%~1"=="" goto process

:end
echo.
echo ======================================================
echo  SUCCESS: All files have been processed.
echo ======================================================
pause