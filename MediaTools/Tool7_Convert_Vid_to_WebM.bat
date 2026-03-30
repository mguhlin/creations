@echo off
set "ffmpeg=C:\tools\ffmpeg.exe"

:: Check if a file was dropped or if we should look for all videos in the folder
if "%~1"=="" (
    set "target=*.mp4 *.mkv *.mov *.avi *.wmv"
    set "mode=Folder Mode (Common Video Types)"
) else (
    set "target=%~1"
    set "mode=Single File Mode"
)

cls
echo ======================================================
echo           UNIVERSAL WebM CONVERTER
echo ======================================================
echo Target: %mode%
echo.
echo Drop any video file onto this script to convert it.
echo The new .webm file will appear next to the original.
echo ======================================================
echo.

echo Select conversion quality:
echo [1] High Quality (Larger file)
echo [2] Standard (Balanced)
echo [3] Small File (High compression)
echo.

choice /c 123 /m "Enter your choice:"

if errorlevel 3 goto SMALL
if errorlevel 2 goto STANDARD
if errorlevel 1 goto HIGH

:HIGH
set "crf=18" & set "br=2M" & goto PROCESS
:STANDARD
set "crf=24" & set "br=1M" & goto PROCESS
:SMALL
set "crf=30" & set "br=500k" & goto PROCESS

:PROCESS
echo.
echo Starting conversion...
echo.

:: Using %%~dpni ensures the output stays in the original file's folder
for %%i in (%target%) do (
    echo Processing: "%%~nxi"
    "%ffmpeg%" -i "%%i" -c:v libvpx -crf %crf% -b:v %br% -acodec libvorbis -aq 4 -ac 2 -threads 2 "%%~dpni.webm"
)

echo.
echo ======================================================
echo Conversion Complete!
echo ======================================================
pause