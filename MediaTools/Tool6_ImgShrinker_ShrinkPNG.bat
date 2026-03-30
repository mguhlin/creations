@echo off
setlocal EnableDelayedExpansion

REM ==========================
REM User Settings
REM ==========================

REM Target scale factor to shrink dimensions.
REM 70 means output is 70% of original width & height → ~49% of original pixels.
REM | Goal                                   | New Setting       | Effect                 |
REM | -------------------------------------- | ----------------- | ---------------------- |
REM | **~60–75% file-size reduction**        | `set SCALEPCT=60` | 36% of original pixels |
REM | **~75–85% reduction**                  | `set SCALEPCT=50` | 25% of original pixels |
REM | **~85–92% reduction**                  | `set SCALEPCT=40` | 16% of original pixels |
REM | **AGGRESSIVE** (still usable for docs) | `set SCALEPCT=30` | 9% of original pixels  |

set SCALEPCT=60

REM PNG compression level (0–9)
set COMPRESSION_LEVEL=9

REM Suffix for output filename
set SUFFIX=_shrunk

REM ==========================
REM Verify ImageMagick
REM ==========================
where magick >nul 2>nul
if errorlevel 1 (
    echo [ERROR] ImageMagick not found. Install from imagemagick.org and add to PATH.
    pause
    exit /b 1
)

if "%~1"=="" (
    echo Drag-and-drop images onto this .bat file.
    pause
    exit /b 0
)

REM ==========================
REM Process Each File
REM ==========================
:next
if "%~1"=="" goto done

set "INFILE=%~1"
set "DIR=%~dp1"
set "BASE=%~n1"
set "OUT=%DIR%%BASE%_%SCALEPCT%%%_%SUFFIX%.png"

echo Processing "%INFILE%"
echo Creating "%OUT%"

magick "%INFILE%" ^
  -auto-orient ^
  -strip ^
  -resize %SCALEPCT%%% ^
  -define png:compression-level=%COMPRESSION_LEVEL% ^
  -define png:compression-strategy=1 ^
  "%OUT%"

if errorlevel 1 (
    echo   [FAILED] %INFILE%
) else (
    echo   [OK] Output saved.
)

shift
goto next

:done
echo All finished.
pause
endlocal
