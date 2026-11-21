#!/bin/sh
set -e

# Apply pending database migrations, then start the Astro server (see start.mjs)
exec node ./start.mjs
