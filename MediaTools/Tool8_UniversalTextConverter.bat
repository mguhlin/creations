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
echo [1] .md (Markdown)     [5] .odt (OpenOffice)
echo [2] .docx (MS Word)    [6] .html (Web Page)
echo [3] .pdf (Via Edge)    [7] .txt (Plain Text)
echo [4] .rtf (Rich Text)   [8] .csv (Table data)
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
echo [STATUS] Processing files into temporary Markdown...
echo ------------------------------------------------------

:process
if "%~1"=="" goto :FINALIZE
set "FILE=%~1"
set "F_EXT=%~x1"

echo [WORKING] Processing: "%~nx1"

REM --- Logic for PDFs (Extraction) ---
if /I "%F_EXT%"==".pdf" (
    if %HAS_PDFTEXT%==1 (
        "%PDFTOTEXT%" "%FILE%" "temp_chunk.txt"
        echo # Source: %~nx1 >> "combined_temp.md"
        echo --- >> "combined_temp.md"
        type "temp_chunk.txt" >> "combined_temp.md"
        echo. >> "combined_temp.md"
        del "temp_chunk.txt"
        goto :NEXT
    )
)

REM --- Logic for all other files via Pandoc ---
if %HAS_PANDOC%==1 (
    pandoc "%FILE%" -t markdown -o "temp_chunk.md" --wrap=none >nul 2>&1
    if exist "temp_chunk.md" (
        echo # Source: %~nx1 >> "combined_temp.md"
        echo --- >> "combined_temp.md"
        type "temp_chunk.md" >> "combined_temp.md"
        echo. >> "combined_temp.md"
        del "temp_chunk.md"
    ) else (
        goto :FALLBACK
    )
) else (
    :FALLBACK
    echo # Source: %~nx1 >> "combined_temp.md"
    echo --- >> "combined_temp.md"
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

if %HAS_PANDOC%==1 (
    if /I "%EXT%"=="pdf" (
        echo [INFO] Using Microsoft Edge as PDF Engine...
        :: Using msedge as the engine (requires Pandoc 2.11+)
        pandoc "combined_temp.md" -o "%OUT_FILE%" --pdf-engine=msedge --metadata title="Merged Document" 2>nul
        
        if not exist "%OUT_FILE%" (
            echo [WARNING] PDF creation failed. Falling back to Word format...
            set "OUT_FILE=%cd%\merged_document.docx"
            pandoc "combined_temp.md" -o "!OUT_FILE!"
            echo [NOTICE] Created .docx instead. Open and Save as PDF manually.
        )
    ) else (
        pandoc "combined_temp.md" -o "%OUT_FILE%"
    )
) else (
    move /y "combined_temp.md" "merged_document.md"
    echo [NOTE] Pandoc not found. Result saved as .md file.
)

if exist "combined_temp.md" del "combined_temp.md"
echo.
echo ------------------------------------------------------
echo [SUCCESS] Operation Finished.
echo Output: %OUT_FILE%
echo ------------------------------------------------------
pause
