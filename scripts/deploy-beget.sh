#!/usr/bin/env bash
set -euo pipefail

if ! command -v rsync >/dev/null 2>&1; then
  echo "Error: rsync is not installed or not in PATH." >&2
  exit 1
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "Error: ssh is not installed or not in PATH." >&2
  exit 1
fi

BEGET_HOST="${BEGET_HOST:-}"
BEGET_USER="${BEGET_USER:-}"
BEGET_PORT="${BEGET_PORT:-22}"
BEGET_REMOTE_PATH="${BEGET_REMOTE_PATH:-~/public_html/}"

if [[ -z "$BEGET_HOST" ]]; then
  echo "Error: BEGET_HOST is not set." >&2
  exit 1
fi

if [[ -z "$BEGET_USER" ]]; then
  echo "Error: BEGET_USER is not set." >&2
  exit 1
fi

LOCAL_PATH="deploy/beget/public_html/"

if [[ ! -d "$LOCAL_PATH" ]]; then
  echo "Error: local path '$LOCAL_PATH' not found." >&2
  exit 1
fi

echo "Deploying to Beget..."
echo "Host: $BEGET_HOST"
echo "User: $BEGET_USER"
echo "Port: $BEGET_PORT"
echo "Remote path: $BEGET_REMOTE_PATH"

rsync -avz --delete \
  --exclude 'config.local.php' \
  --exclude 'uploads/' \
  -e "ssh -p ${BEGET_PORT}" \
  "${LOCAL_PATH}" \
  "${BEGET_USER}@${BEGET_HOST}:${BEGET_REMOTE_PATH}"

echo "Deploy complete."
