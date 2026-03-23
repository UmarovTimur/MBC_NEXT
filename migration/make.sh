#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/docx/48"
OUT_DIR="$SCRIPT_DIR/html/48"

mkdir -p "$OUT_DIR"

for f in "$SRC_DIR"/*.docx; do
  filename=$(basename "$f" .docx)
  pandoc "$f" -f docx -t html -o "$OUT_DIR/$filename.html"
done

echo "Готово! Все .docx сконвертированы в HTML." 
