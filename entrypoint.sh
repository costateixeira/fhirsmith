#!/bin/sh
set -e

# Caminho dos arquivos de origem (ajuste se necessário)
DEFAULTS_DIR="/app/config-defaults"
DATA_DIR="/app/data"

# Cria a pasta data se não existir
mkdir -p "$DATA_DIR"

# Copia config.json se não existir
if [ ! -f "$DATA_DIR/config.json" ]; then
  cp "$DEFAULTS_DIR/config.json" "$DATA_DIR/config.json"
fi

# Copia library.yml se não existir
if [ ! -f "$DATA_DIR/library.yml" ]; then
  cp "$DEFAULTS_DIR/library.yml" "$DATA_DIR/library.yml"
fi

# Executa o comando padrão do container
if [ "$#" -eq 0 ]; then
  exec node server.js
else
  exec "$@"
fi
