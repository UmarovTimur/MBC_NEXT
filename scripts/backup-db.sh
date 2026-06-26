#!/usr/bin/env bash
# Backs up the local "mbc" PostgreSQL database (native postgresql@16-main service
# on localhost:5432, the one apps actually connect to via DATABASE_URL) into backups/.
#
# Usage:
#   ./scripts/backup-db.sh
#
# Reads POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DATABASE from .env at the repo root.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
BACKUP_DIR="$ROOT_DIR/backups"
HOST="127.0.0.1"
PORT="5432"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

if [[ -z "${POSTGRES_USER:-}" || -z "${POSTGRES_DATABASE:-}" ]]; then
  echo "POSTGRES_USER / POSTGRES_DATABASE not set in .env" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT_PATH="$BACKUP_DIR/mbc_${TIMESTAMP}.dump"

echo "Dumping database '$POSTGRES_DATABASE' from $HOST:$PORT..."
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$HOST" -p "$PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -F c -f "$OUT_PATH"

echo "Backup saved to $OUT_PATH"
