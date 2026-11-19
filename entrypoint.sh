#!/bin/sh
set -e

# Apply pending database migrations, then start the Astro server
node ./src/utils/migrate.ts
exec node ./dist/server/entry.mjs
