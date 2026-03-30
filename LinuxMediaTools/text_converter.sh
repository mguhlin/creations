#!/bin/bash

# ======================================================
#       UNIVERSAL DOCUMENT CONVERTER & MERGER
# ======================================================

# Check for dependencies
HAS_PANDOC=$(command -v pandoc)
HAS_PDFTEXT=$(command -v pdftotext)

if [ -z "$HAS_PANDOC" ]; then
    echo "[ERROR] Pandoc is not installed. Run: sudo apt install pandoc"
    exit 1
fi

if [ -z "$1" ]; then
    echo "[ERROR] Usage: ./text_converter.sh file1.pdf file2.docx ..."
    exit 1
fi

# Select Output Format
echo "Select your desired output format:"
echo "[1] .md (Markdown)"
echo "[2] .docx (MS Word)"
echo "[3] .pdf (Requires wkhtmltopdf or texlive)"
echo "[4] .rtf (Rich Text)"
echo "[5] .odt (OpenOffice)"
echo "[6] .html (Web Page)"
echo "[7] .txt (Plain Text)"
echo "[8] .csv (Table data)"
read -p "Enter choice [1-8]: " sel

case $sel in
    1) EXT="md" ;;
    2) EXT="docx" ;;
    3) EXT="pdf" ;;
    4) EXT="rtf" ;;
    5) EXT="odt" ;;
    6) EXT="html" ;;
    7) EXT="txt" ;;
    8) EXT="csv" ;;
    *) EXT="md" ;;
esac

OUT_FILE="$(pwd)/merged_document.$EXT"
TEMP_COMBINED="combined_temp.md"

# Clear existing temp files
[ -f "$TEMP_COMBINED" ] && rm "$TEMP_COMBINED"

echo "[STATUS] Creating $OUT_FILE..."
echo "------------------------------------------------------"

# Processing Loop
for FILE in "$@"; do
    FILENAME=$(basename "$FILE")
    FILE_EXT="${FILE##*.}"
    
    echo "[WORKING] Processing: $FILENAME"

    # Logic for PDFs (Prioritize pdftotext for cleaner text)
    if [[ "${FILE_EXT,,}" == "pdf" && -n "$HAS_PDFTEXT" ]]; then
        echo "   [ENGINE] Using pdftotext..."
        echo -e "# Source: $FILENAME\n---\n" >> "$TEMP_COMBINED"
        pdftotext "$FILE" - >> "$TEMP_COMBINED"
        echo -e "\n" >> "$TEMP_COMBINED"
    
    # Logic for all other files using Pandoc
    else
        echo "   [ENGINE] Using Pandoc..."
        echo -e "# Source: $FILENAME\n---\n" >> "$TEMP_COMBINED"
        pandoc "$FILE" -t markdown --wrap=none >> "$TEMP_COMBINED"
        echo -e "\n" >> "$TEMP_COMBINED"
    fi
done

# Finalizing
if [ -f "$TEMP_COMBINED" ]; then
    echo "[FINALIZING] Building final $EXT file..."
    pandoc "$TEMP_COMBINED" -o "$OUT_FILE"
    rm "$TEMP_COMBINED"
    echo "[SUCCESS] File created: $OUT_FILE"
else
    echo "[ERROR] No files were processed."
fi