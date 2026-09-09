#!/bin/sh
# Railway startup script:
# 1. Run drizzle-kit push (apply schema to Railway Postgres)
# 2. Seed demo data
# 3. Start the API server

set -e

echo "==> Running DB schema push..."
cd lib/db && npx --yes drizzle-kit push --config=drizzle.config.ts
cd ../..

echo "==> Seeding demo data..."
npx --yes tsx scripts/src/seed.ts

echo "==> Starting API server..."
node --enable-source-maps ./artifacts/api-server/dist/index.mjs
