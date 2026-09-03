#!/bin/bash
# Bring the free live-brain demo back up after a reboot (server + tunnel), and if the
# tunnel URL changed, repoint the public site at it (commit + push).
# Usage: bash demo_live.sh
set -e
cd "$(dirname "$0")"

RK=$(python3 -c "
for l in open('.env'):
    if l.startswith('REQUESTY_API_KEY='): print(l.strip().split('=',1)[1]); break")
[ -z "$RK" ] && { echo 'REQUESTY_API_KEY missing from .env'; exit 1; }

# 1. server
lsof -ti :4321 | xargs kill 2>/dev/null || true
sleep 1
REQUESTY_API_KEY="$RK" PORT=4321 nohup node server/server.mjs > /tmp/cert-sdr-server.log 2>&1 &
until curl -s localhost:4321/health | grep -q '"ok"'; do sleep 0.5; done
echo "server up (full-corpus RAG)"

# 2. tunnel
pkill -f "cloudflared tunnel --url http://localhost:4321" 2>/dev/null || true
sleep 1
nohup /opt/homebrew/opt/cloudflared/bin/cloudflared tunnel --url http://localhost:4321 --protocol http2 > /tmp/cert-sdr-tunnel.log 2>&1 &
TURL=""
for i in $(seq 1 60); do
  TURL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/cert-sdr-tunnel.log | head -1 || true)
  [ -n "$TURL" ] && break; sleep 1
done
[ -z "$TURL" ] && { echo 'tunnel failed to start'; exit 1; }
HOST="${TURL#https://}"
IP=$(dig +short "$HOST" | head -1)
OK=0
for i in $(seq 1 20); do
  if curl -s --max-time 10 --resolve "$HOST:443:${IP:-104.16.231.132}" "$TURL/health" | grep -q '"ok"'; then OK=1; break; fi
  sleep 5
done
[ "$OK" = "1" ] || { echo "tunnel not healthy after 100s"; exit 1; }
echo "tunnel up: $TURL"

# 3. repoint the public site if the URL changed
CUR=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" demo-brain.js | head -1 || true)
if [ "$CUR" != "$TURL" ]; then
  python3 - "$TURL" <<'PYEOF'
import sys, re
url = sys.argv[1]
src = open('demo-brain.js').read()
open('demo-brain.js','w').write(re.sub(r"https://[a-z0-9-]+\.trycloudflare\.com", url, src, count=1))
PYEOF
  git add demo-brain.js
  git commit -m "demo tunnel URL rotated" --quiet
  env -u GITHUB_TOKEN git push --quiet
  echo "public site repointed (Pages redeploys in ~1 min)"
else
  echo "public site already points here"
fi
echo "LIVE: https://samcolibri.github.io/cert-sdr-agent/demo.html"
