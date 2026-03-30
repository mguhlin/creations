@echo off
set "ffmpeg=C:\tools\ffmpeg.exe"

if not exist "%ffmpeg%" (
    echo ERROR: ffmpeg.exe not found at %ffmpeg%
    pause
    exit /b
)

if "%~1"=="" (
    echo Drag and drop files onto this .bat file.
    pause
    exit /b
)

:process
if "%~1"=="" goto end

echo Processing: "%~nx1"

:: FILTER BREAKDOWN:
:: afftdn: Noise reduction.
:: bass: Boosts frequencies below 100Hz by 6dB for "depth."
:: acompressor: Lower threshold (-20dB) and higher makeup (8dB) for "solidity" and "loudness."
:: aecho: Short delay to add thickness.
:: alimiter: Prevents digital distortion (clipping) from the volume boost.

"%ffmpeg%" -i "%~1" -af "afftdn=nr=12, bass=g=6:f=100:w=0.5, acompressor=threshold=-20dB:ratio=6:makeup=8, aecho=0.8:0.88:20:0.2, alimiter=limit=0.95" -c:a libmp3lame -q:a 2 "%~n1_deep_loud.mp3" -y

shift
if not "%~1"=="" goto process

:end
echo.
echo Processing Complete.
pause