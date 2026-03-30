@echo off
setlocal EnableDelayedExpansion

REM =======================================
REM User settings
REM =======================================

REM Percentage to scale width/height
REM 70 = 70% of original dimensions (~50% of pixels)
set SCALEPCT=70

REM =======================================
REM Check for ImageMagick
REM =======================================
where magick >nul 2>nul
if errorlevel 1 (
    echo [ERROR] ImageMagick "magick" command not found in PATH.
    echo Install ImageMagick and add it to PATH.
    pause
    exit /b 1
)

REM =======================================
REM Check for FFmpeg (optional for videos)
REM =======================================
where ffmpeg >nul 2>nul
if errorlevel 1 (
    echo [WARNING] FFmpeg not found. Video files will be skipped.
    set FFMPEG_AVAILABLE=0
) else (
    set FFMPEG_AVAILABLE=1
)

REM =======================================
REM Check for dropped files
REM =======================================
if "%~1"=="" (
    echo Drag-and-drop image and/or video files onto this .bat file.
    pause
    exit /b 0
)

REM =======================================
REM Choose output format
REM =======================================
echo.
echo Choose output image format:
echo   1^) WEBP  (small, good for photos)
echo   2^) JPG   (good general-purpose)
echo   3^) PNG   (lossless)
echo   4^) GIF   (limited colors, simple graphics)
echo.

set /p FMTC=Enter 1-4 (default 1^): 
if "%FMTC%"=="" set FMTC=1

set OUTEXT=
if "%FMTC%"=="1" set OUTEXT=webp
if "%FMTC%"=="2" set OUTEXT=jpg
if "%FMTC%"=="3" set OUTEXT=png
if "%FMTC%"=="4" set OUTEXT=gif

if "%OUTEXT%"=="" (
    echo [ERROR] Invalid choice.
    pause
    exit /b 1
)

echo.
echo Output format: %OUTEXT%
echo Scale: %SCALEPCT%%% of original dimensions
echo.

REM =======================================
REM Process each dropped file
REM =======================================
:nextfile
if "%~1"=="" goto done

set "INFILE=%~1"
set "DIR=%~dp1"
set "BASENAME=%~n1"
set "EXT=%~x1"

REM Remove quotes just in case
set "INFILE=%INFILE%"
set "DIR=%DIR%"
set "BASENAME=%BASENAME%"
set "EXT=%EXT%"

set "OUTFILE=%DIR%%BASENAME%_conv.%OUTEXT%"

echo ---------------------------------------
echo Input : "%INFILE%"
echo Output: "%OUTFILE%"

REM Decide if this is a video (simple extension check)
set ISVIDEO=0
if /I "%EXT%"==".MP4" set ISVIDEO=1
if /I "%EXT%"==".MOV" set ISVIDEO=1
if /I "%EXT%"==".MKV" set ISVIDEO=1
if /I "%EXT%"==".WEBM" set ISVIDEO=1
if /I "%EXT%"==".AVI" set ISVIDEO=1
if /I "%EXT%"==".M4V" set ISVIDEO=1

if "%ISVIDEO%"=="1" (
    REM ===================================
    REM Handle video: grab a frame as image
    REM ===================================
    if "%FFMPEG_AVAILABLE%"=="0" (
        echo   [SKIP] Video file, but FFmpeg is not available.
    ) else (
        echo   Detected video. Extracting thumbnail...
        REM Take a frame at 1 second and scale it
        ffmpeg -y -ss 00:00:01.000 -i "%INFILE%" -vframes 1 ^
          -vf scale=iw*%SCALEPCT%/100:ih*%SCALEPCT%/100 "%OUTFILE%"
        if errorlevel 1 (
            echo   [FAILED] Could not process video "%INFILE%"
        ) else (
            echo   [OK] Thumbnail saved as "%OUTFILE%"
        )
    )
) else (
    REM ===================================
    REM Handle image via ImageMagick
    REM ===================================
    echo   Detected image. Converting with ImageMagick...

    if /I "%OUTEXT%"=="webp" (
        magick "%INFILE%" ^
          -auto-orient -strip -resize %SCALEPCT%%% ^
          -quality 70 -define webp:method=6 ^
          "%OUTFILE%"
    ) else if /I "%OUTEXT%"=="jpg" (
        magick "%INFILE%" ^
          -auto-orient -strip -resize %SCALEPCT%%% ^
          -quality 82 ^
          "%OUTFILE%"
    ) else if /I "%OUTEXT%"=="png" (
        magick "%INFILE%" ^
          -auto-orient -strip -resize %SCALEPCT%%% ^
          -define png:compression-level=9 ^
          -define png:compression-strategy=1 ^
          "%OUTFILE%"
    ) else if /I "%OUTEXT%"=="gif" (
        magick "%INFILE%" ^
          -auto-orient -strip -resize %SCALEPCT%%% ^
          -colors 256 -layers Optimize ^
          "%OUTFILE%"
    )

    if errorlevel 1 (
        echo   [FAILED] Could not process image "%INFILE%"
    ) else (
        echo   [OK] Converted image saved as "%OUTFILE%"
    )
)

shift
goto nextfile

:done
echo.
echo All files processed.
pause
endlocal
