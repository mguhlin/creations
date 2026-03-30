@echo off
setlocal EnableDelayedExpansion

REM ==========================
REM Configurable settings
REM ==========================

REM Maximum width/height in pixels (longest side).
REM Images larger than this will be reduced; smaller images are left as-is.
set MAXSIZE=1600

REM Output filename suffix (before .png)
set SUFFIX=_small

REM ==========================
REM Check that ImageMagick is available
REM ==========================
where magick >nul 2>nul
if errorlevel 1 (
    echo [ERROR] ImageMagick "magick" command not found in PATH.
    echo Install ImageMagick and be sure to add it to your PATH.
    echo https://imagemagick.org
    pause
    exit /b 1
)

REM ==========================
REM Process each dropped file
REM ==========================
if "%~1"=="" (
    echo Drag and drop one or more image files onto this .bat file.
    pause
    exit /b 0
)

:process_next
if "%~1"=="" goto done

set "INFILE=%~1"
set "FOLDER=%~dp1"
set "BASENAME=%~n1"

REM Build output file path (same folder, PNG, with suffix).
set "OUTFILE=%FOLDER%%BASENAME%%SUFFIX%.png"

echo.
echo Processing:
echo   Input : "%INFILE%"
echo   Output: "%OUTFILE%"

REM Convert to PNG, auto-orient, resize only if larger, strip metadata,
REM and use strong PNG compression.
magick "%INFILE%" ^
  -auto-orient ^
  -resize %MAXSIZE%x%MAXSIZE%^> ^
  -strip ^
  -define png:compression-level=9 ^
  -define png:compression-strategy=1 ^
  "%OUTFILE%"

if errorlevel 1 (
    echo   [FAILED] Could not process "%INFILE%"
) else (
    echo   [OK] Created "%OUTFILE%"
)

shift
goto process_next

:done
echo.
echo All done.
pause
endlocal
