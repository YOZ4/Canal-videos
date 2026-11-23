#!/bin/bash
# Prepara a sessão na nuvem: dependências do Remotion (npm), numpy (scripts de áudio) e ffmpeg.
# Só reinstala o npm quando package.json / package-lock.json (ou este script) mudarem.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# ferramentas do sistema (só se faltarem)
if ! command -v ffmpeg >/dev/null; then
  apt-get update -qq && apt-get install -y -qq ffmpeg >/dev/null
fi
if ! python3 -I -c "import numpy" 2>/dev/null; then
  python3 -m pip install -q numpy
fi

# dependências do projeto (Remotion, three, etc.)
hashes=node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  npm install --no-audit --no-fund
  sha256sum .claude/hooks/session-start.sh package.json package-lock.json > "$hashes" || rm -f "$hashes"
fi
