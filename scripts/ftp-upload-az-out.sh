#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/apps/az/out"

read -rp "FTP хост: " FTP_HOST
read -rp "Логин:    " FTP_USER
read -rsp "Пароль:   " FTP_PASS
echo
read -rp "Путь на сервере (например /public_html): " FTP_PATH

# Временный netrc — безопасно передаёт пароль со спецсимволами
TMPNETRC=$(mktemp)
chmod 600 "$TMPNETRC"
printf 'machine %s login %s password %s\n' "$FTP_HOST" "$FTP_USER" "$FTP_PASS" > "$TMPNETRC"
trap 'rm -f "$TMPNETRC"' EXIT

echo "Заливаю $OUT_DIR → $FTP_HOST$FTP_PATH ..."

lftp -f <(cat <<EOF
set ftp:ssl-allow no
set net:max-retries 3
set net:reconnect-interval-base 5
set netrc:file $TMPNETRC
open ftp://$FTP_HOST
mirror --reverse --delete --verbose --parallel=5 "$OUT_DIR" "$FTP_PATH"
bye
EOF
)

echo "Готово."
