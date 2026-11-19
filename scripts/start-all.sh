#!/bin/sh
# Single-container start: apply DB migrations, run the API in the background, run the web in the foreground.
# If either process dies the container exits, so the platform restarts it.
set -e
cd /app/packages/db && pnpm exec prisma migrate deploy
cd /app/apps/api && node dist/main.js &
API_PID=$!
cd /app/web/apps/web && node server.js &
WEB_PID=$!
while kill -0 $API_PID 2>/dev/null && kill -0 $WEB_PID 2>/dev/null; do sleep 2; done
kill $API_PID $WEB_PID 2>/dev/null || true
exit 1
