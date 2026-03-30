@echo off
setlocal enabledelayedexpansion

REM ======================================================
REM        UNIVERSAL DOCUMENT CONVERTER & MERGER
REM ======================================================
cls
echo ======================================================
echo        UNIVERSAL DOCUMENT CONVERTER ^& MERGER
echo ======================================================
echo.

REM === PATHS AND ENGINE CHECKS ===
set "PDFTOTEXT=%~dp0pdftotext.exe"

where pandoc >nul 2>&1
if %errorlevel% neq 0 (set "HAS_PANDOC=0") else (set "HAS_PANDOC=1")

if exist "%PDFTOTEXT%" (set "HAS_PDFTEXT=1") else (set "HAS_PDFTEXT=0")

REM === INPUT VALIDATION ===
if "%~1"=="" (
    echo [ERROR] Please drag and drop files/folders onto this script.
    pause
    exit /b
)

REM === SELECT OUTPUT FORMAT ===
echo Select your desired output format:
echo [1] .md (Markdown)      [5] .odt (OpenOffice)
echo [2] .docx (MS Word)     [6] .html (Web Page)
echo [3] .pdf (Browser-Print) [7] .txt (Plain Text)
echo [4] .rtf (Rich Text)    [8] .csv (Table Data)
echo.
choice /c 12345678 /m "Enter choice:"
set "sel=%errorlevel%"

if %sel%==1 set "EXT=md"
if %sel%==2 set "EXT=docx"
if %sel%==3 set "EXT=pdf"
if %sel%==4 set "EXT=rtf"
if %sel%==5 set "EXT=odt"
if %sel%==6 set "EXT=html"
if %sel%==7 set "EXT=txt"
if %sel%==8 set "EXT=csv"

set "OUT_FILE=%cd%\merged_document.%EXT%"
if exist "combined_temp.md" del "combined_temp.md" >nul 2>&1

echo.
echo [STATUS] Processing files...
echo ------------------------------------------------------

:process
if "%~1"=="" goto :FINALIZE
set "FILE=%~1"
set "F_EXT=%~x1"

echo [WORKING] Processing: "%~nx1"

REM --- Extraction Logic ---
if /I "%F_EXT%"==".pdf" (
    if %HAS_PDFTEXT%==1 (
        :: Use -layout to help preserve table alignment for the interim text
        "%PDFTOTEXT%" -layout "%FILE%" "temp_chunk.txt"
        echo # Source: %~nx1 >> "combined_temp.md"
        type "temp_chunk.txt" >> "combined_temp.md"
        echo. >> "combined_temp.md"
        del "temp_chunk.txt"
        goto :NEXT
    )
)

if %HAS_PANDOC%==1 (
    :: Use pipe_tables extension to try and force table recognition
    pandoc "%FILE%" -f docx+pipe_tables -t markdown+pipe_tables -o "temp_chunk.md" --wrap=none >nul 2>&1
    if exist "temp_chunk.md" (
        echo # Source: %~nx1 >> "combined_temp.md"
        type "temp_chunk.md" >> "combined_temp.md"
        echo. >> "combined_temp.md"
        del "temp_chunk.md"
    ) else (
        goto :FALLBACK
    )
) else (
    :FALLBACK
    echo # Source: %~nx1 >> "combined_temp.md"
    type "%FILE%" >> "combined_temp.md" 2>nul
    echo. >> "combined_temp.md"
)

:NEXT
shift
goto :process

:FINALIZE
if not exist "combined_temp.md" (
    echo [ERROR] No content was processed.
    pause
    exit /b
)

echo.
echo [FINALIZING] Building %OUT_FILE%...

if /I "%EXT%"=="rtf" (
    :: Use standalone mode and enable pipe_tables for the final output
    pandoc "combined_temp.md" -f markdown+pipe_tables -s -o "%OUT_FILE%"
) else if /I "%EXT%"=="pdf" (
    set "TEMP_HTML=%cd%\temp_print.html"
    pandoc "combined_temp.md" -f markdown+pipe_tables -s -o "!TEMP_HTML!" --metadata title="Merged Document"
    set "EDGE_EXE="
    if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    if defined EDGE_EXE (
        "!EDGE_EXE!" --headless --disable-gpu --print-to-pdf="%OUT_FILE%" "file:///!TEMP_HTML!" 2>nul
        timeout /t 2 >nul
    )
    if exist "!TEMP_HTML!" del "!TEMP_HTML!"
) else if /I "%EXT%"=="csv" (
    move /y "combined_temp.md" "%OUT_FILE%" >nul
) else (
    pandoc "combined_temp.md" -f markdown+pipe_tables -o "%OUT_FILE%"
)

if exist "combined_temp.md" del "combined_temp.md"
echo.
echo ------------------------------------------------------
echo [SUCCESS] Operation Finished.
echo Output: %OUT_FILE%
echo ------------------------------------------------------
pause
