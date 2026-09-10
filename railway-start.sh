#!/bin/sh
set -e

echo "==> Starting API server..."
exec node --enable-source-maps ./artifacts/api-server/dist/index.mjs
