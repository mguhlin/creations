@echo off
setlocal EnableDelayedExpansion

REM -----------------------------------------
REM Check ffmpeg
REM -----------------------------------------
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo [ERROR] ffmpeg not found. Install from https://ffmpeg.org and add to PATH.
    pause
    exit /b 1
)

if "%~1"=="" (
    echo Drag and drop one or more files onto this .bat file.
    pause
    exit /b 0
)

REM -----------------------------------------
REM CHOOSE OUTPUT FORMAT
REM -----------------------------------------
:choose_format
echo.
echo =========================================
echo Choose output format:
echo   1) MP3
echo   2) OGG (Vorbis)
echo   3) MP4 (AAC audio-only)
echo =========================================
set "FMT="
set /p "FMT=Enter 1, 2, or 3: "

if "%FMT%"=="1" (
    set "OUTFMT=mp3"
    goto choose_mp3_quality
) else if "%FMT%"=="2" (
    set "OUTFMT=ogg"
    goto choose_ogg_quality
) else if "%FMT%"=="3" (
    set "OUTFMT=mp4"
    goto choose_mp4_quality
) else (
    echo Invalid choice.
    goto choose_format
)

REM -----------------------------------------
REM MP3 QUALITY OPTIONS
REM -----------------------------------------
:choose_mp3_quality
echo.
echo MP3 Quality Levels:
echo   1) Low   - 48 kbps (very small)
echo   2) Med   - 96 kbps
echo   3) High  - 160 kbps
set /p "Q=Choose 1, 2, or 3: "

if "%Q%"=="1" (
    set "FFM_OPTS=-vn -codec:a libmp3lame -b:a 48k"
) else if "%Q%"=="2" (
    set "FFM_OPTS=-vn -codec:a libmp3lame -b:a 96k"
) else if "%Q%"=="3" (
    set "FFM_OPTS=-vn -codec:a libmp3lame -b:a 160k"
) else (
    echo Invalid.
    goto choose_mp3_quality
)
goto begin_processing

REM -----------------------------------------
REM OGG QUALITY OPTIONS
REM -----------------------------------------
:choose_ogg_quality
echo.
echo OGG Quality Levels (Vorbis VBR):
echo   1) Low   - q2  (~64-96 kbps)
echo   2) Med   - q4  (~128 kbps)
echo   3) High  - q6  (~192 kbps)
set /p "Q=Choose 1, 2, or 3: "

if "%Q%"=="1" (
    set "FFM_OPTS=-vn -codec:a libvorbis -qscale:a 2"
) else if "%Q%"=="2" (
    set "FFM_OPTS=-vn -codec:a libvorbis -qscale:a 4"
) else if "%Q%"=="3" (
    set "FFM_OPTS=-vn -codec:a libvorbis -qscale:a 6"
) else (
    echo Invalid.
    goto choose_ogg_quality
)
goto begin_processing

REM -----------------------------------------
REM MP4 QUALITY OPTIONS
REM -----------------------------------------
:choose_mp4_quality
echo.
echo MP4 (AAC) Quality Levels:
echo   1) Low   - 64 kbps
echo   2) Med   - 96 kbps
echo   3) High  - 128 kbps
set /p "Q=Choose 1, 2, or 3: "

if "%Q%"=="1" (
    set "FFM_OPTS=-vn -codec:a aac -b:a 64k -movflags +faststart"
) else if "%Q%"=="2" (
    set "FFM_OPTS=-vn -codec:a aac -b:a 96k -movflags +faststart"
) else if "%Q%"=="3" (
    set "FFM_OPTS=-vn -codec:a aac -b:a 128k -movflags +faststart"
) else (
    echo Invalid.
    goto choose_mp4_quality
)
goto begin_processing


REM -----------------------------------------
REM PROCESS FILES
REM -----------------------------------------
:begin_processing
echo.
echo Output format: %OUTFMT%
echo Encoder opts:  %FFM_OPTS%
echo.

:next
if "%~1"=="" goto done

set "INFILE=%~1"
set "INDIR=%~dp1"
set "BASE=%~n1"
set "OUTFILE=%INDIR%%BASE%.%OUTFMT%"

echo -----------------------------------------
echo Input : "%INFILE%"
echo Output: "%OUTFILE%"
echo -----------------------------------------

if exist "%OUTFILE%" (
    echo Already exists. Skipping.
) else (
    ffmpeg -i "%INFILE%" %FFM_OPTS% "%OUTFILE%"
)

shift
goto next

:done
echo.
echo Finished converting all files.
pause
