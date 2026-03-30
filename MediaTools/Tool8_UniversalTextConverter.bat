@echo off
setlocal enabledelayedexpansion

REM ======================================================
REM       UNIVERSAL DOCUMENT CONVERTER & MERGER (Dual-Engine)
REM ======================================================
cls
echo ======================================================
echo       UNIVERSAL DOCUMENT CONVERTER ^& MERGER
echo ======================================================
echo  INPUTS:  pdf, doc, docx, rtf, odt, txt, md, html, 
echo           htm, ppt, pptx, csv
echo.
echo  ENGINES: Pandoc (System Path) + pdftotext (Local)
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
echo [1] .md (Markdown - Default)   [5] .odt (OpenOffice)
echo [2] .docx (MS Word)            [6] .html (Web Page)
echo [3] .pdf (Requires MiKTeX)     [7] .txt (Plain Text)
echo [4] .rtf (Rich Text)           [8] .csv (Table data)
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
if exist "%OUT_FILE%" del "%OUT_FILE%" >nul 2>&1
if exist "combined_temp.md" del "combined_temp.md" >nul 2>&1

echo.
echo [STATUS] Creating %OUT_FILE%...
echo ------------------------------------------------------

REM === PROCESSING LOOP ===
:process
if "%~1"=="" goto :END

set "FILE=%~1"
set "F_EXT=%~x1"

echo [WORKING] Processing: "%~nx1"

REM --- LOGIC FOR PDFS (Prioritize pdftotext) ---
if /I "%F_EXT%"==".pdf" (
    if %HAS_PDFTEXT%==1 (
        echo    [ENGINE] Using pdftotext...
        "%PDFTOTEXT%" "%FILE%" "temp_chunk.txt"
        if exist "temp_chunk.txt" (
            echo # Source: %~nx1 >> "combined_temp.md"
            echo --- >> "combined_temp.md"
            type "temp_chunk.txt" >> "combined_temp.md"
            echo. >> "combined_temp.md"
            del "temp_chunk.txt"
            goto :NEXT
        )
    )
)

REM --- LOGIC FOR ALL OTHER FILES (Using Pandoc) ---
if %HAS_PANDOC%==1 (
    echo    [ENGINE] Using Pandoc...
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
    echo    [FALLBACK] Copying raw text...
    echo # Source: %~nx1 >> "combined_temp.md"
    echo --- >> "combined_temp.md"
    type "%FILE%" >> "combined_temp.md" 2>nul
    echo. >> "combined_temp.md"
)

:NEXT
shift
if not "%~1"=="" goto :process

:END
if exist "combined_temp.md" (
    echo.
    echo [FINALIZING] Building final %EXT% file...
    if %HAS_PANDOC%==1 (
        pandoc "combined_temp.md" -o "%OUT_FILE%"
    ) else (
        move /y "combined_temp.md" "%cd%\merged_document.md" >nul
        echo [NOTE] Pandoc was missing; result saved as .md text only.
    )
    if exist "combined_temp.md" del "combined_temp.md"
    echo [SUCCESS] File created: %OUT_FILE%
) else (
    echo [ERROR] No files were processed.
)

echo.
pause