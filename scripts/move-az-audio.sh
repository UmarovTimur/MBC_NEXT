#!/usr/bin/env bash
set -euo pipefail

# Переносит озвучку Библии AZB из migration/output/audio в apps/az/public/audio/azb,
# убирая из имён папок названия книг:
#
#   migration/output/audio/01 - Yaradılış Kitabı/01.mp3
#   migration/output/audio/65 Yəhuda/01.mp3            ← без " - ", поэтому парсим цифры
#     ↓
#   apps/az/public/audio/azb/01/01.mp3
#   apps/az/public/audio/azb/65/01.mp3
#
# Имена самих mp3 не трогаем — они уже совпадают с конвенцией HTML-глав
# (2 знака, но 3 у книг со 100+ глав: 19 - Zəbur → 001.mp3 … 150.mp3).
#
# Использование:
#   scripts/move-az-audio.sh --dry-run   # показать, что будет сделано
#   scripts/move-az-audio.sh             # перенести

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/migration/output/audio"
DEST="$REPO/apps/az/public/audio/azb"

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

if [[ ! -d "$SRC" ]]; then
  echo "Источник не найден: $SRC" >&2
  exit 1
fi

# mv между разными ФС копирует 5.2 ГБ вместо мгновенного переименования — предупреждаем.
mkdir -p "$DEST"
if [[ "$(stat -f -c %i "$SRC")" != "$(stat -f -c %i "$DEST")" ]]; then
  echo "ВНИМАНИЕ: источник и цель на разных файловых системах — перенос скопирует ~5.2 ГБ." >&2
fi

moved=0
skipped=0

for dir in "$SRC"/*/; do
  [[ -d "$dir" ]] || continue
  book="$(basename "$dir")"

  # Номер книги — ведущие две цифры. Покрывает и "01 - Yaradılış Kitabı", и "65 Yəhuda".
  if [[ ! "$book" =~ ^([0-9]{2}) ]]; then
    echo "Пропускаю папку без номера книги: $book" >&2
    continue
  fi
  num="${BASH_REMATCH[1]}"

  for file in "$dir"*.mp3; do
    [[ -f "$file" ]] || continue
    target="$DEST/$num/$(basename "$file")"

    # Идемпотентность: файл уже на месте — не трогаем.
    if [[ -f "$target" ]]; then
      skipped=$((skipped + 1))
      continue
    fi

    if [[ $DRY_RUN -eq 1 ]]; then
      echo "$book/$(basename "$file")  →  azb/$num/$(basename "$file")"
    else
      mkdir -p "$DEST/$num"
      mv "$file" "$target"
    fi
    moved=$((moved + 1))
  done
done

if [[ $DRY_RUN -eq 1 ]]; then
  echo
  echo "dry-run: будет перенесено $moved файлов, уже на месте $skipped."
else
  echo "Перенесено: $moved, пропущено (уже на месте): $skipped."
  echo "Итого в $DEST: $(find "$DEST" -name '*.mp3' | wc -l) mp3."
fi
