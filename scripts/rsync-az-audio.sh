#!/usr/bin/env bash
set -euo pipefail

# Заливает озвучку Библии AZB (~5.2 ГБ) на VPS.
#
# Аудио не хранится в git (см. .gitignore), поэтому обычный деплой его не
# доставляет. Но и не удаляет: `git reset --hard` в .github/workflows/deploy.yml
# не трогает gitignored-файлы, так что залить достаточно один раз.
#
# Использование:
#   scripts/rsync-az-audio.sh             # залить
#   scripts/rsync-az-audio.sh --dry-run   # показать, что будет передано

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/apps/az/public/audio/"

DRY_RUN=()
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=(--dry-run)

if [[ ! -d "$SRC" ]]; then
  echo "Аудио не найдено: $SRC" >&2
  echo "Сначала выполните scripts/move-az-audio.sh" >&2
  exit 1
fi

read -rp "SSH хост:  " SSH_HOST
read -rp "Логин:     " SSH_USER
read -rp "SSH порт [22]: " SSH_PORT
SSH_PORT="${SSH_PORT:-22}"
read -rp "Путь к проекту на сервере [/home/ubuntu/srv/MBC_NEXT]: " APP_PATH
APP_PATH="${APP_PATH:-/home/ubuntu/srv/MBC_NEXT}"

DEST="$SSH_USER@$SSH_HOST:$APP_PATH/apps/az/public/audio/"

echo "Заливаю $SRC → $DEST ..."

# --partial: 5.2 ГБ одним заходом почти наверняка оборвутся, нужна докачка.
# Ретраи — на случай обрыва соединения; каждый следующий проход досылает остаток.
for attempt in 1 2 3; do
  if rsync -avz --progress --partial --human-readable \
      "${DRY_RUN[@]}" \
      -e "ssh -p $SSH_PORT" \
      "$SRC" "$DEST"; then
    echo "Готово."
    exit 0
  fi
  echo "Попытка $attempt оборвалась, продолжаю с места обрыва..." >&2
  sleep 5
done

echo "Не удалось залить за 3 попытки." >&2
exit 1
