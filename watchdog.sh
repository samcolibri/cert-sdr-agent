#!/bin/bash
# Self-healing loop for the demo: keeps the brain server + tunnel alive.
# If the tunnel rotates, updates live-config.json and pushes (site follows in ~1 min).
# Start:  nohup bash watchdog.sh > /tmp/cert-sdr-watchdog.log 2>&1 & disown
cd "$(dirname "$0")"
RK=$(python3 -c "
for l in open('.env'):
    if l.startswith('REQUESTY_API_KEY='): print(l.strip().split('=',1)[1]); break")

tunnel_ip() { dig +short "$1" 2>/dev/null | head -1; }

while true; do
  # server
  if ! curl -s --max-time 6 localhost:4321/health | grep -q '"ok"'; then
    echo "$(date -u +%FT%TZ) server down, restarting"
    lsof -ti :4321 | xargs kill 2>/dev/null; sleep 1
    nohup env REQUESTY_API_KEY="$RK" PORT=4321 node server/server.mjs > /tmp/cert-sdr-server.log 2>&1 &
    sleep 4
  fi
  # tunnel
  TURL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/cert-sdr-tunnel.log 2>/dev/null | head -1)
  HOST="${TURL#https://}"
  IP=$(tunnel_ip "$HOST"); IP="${IP:-104.16.231.132}"
  ALIVE=0
  if [ -n "$TURL" ] && pgrep -f "cloudflared tunnel" > /dev/null; then
    curl -s --max-time 10 --resolve "$HOST:443:$IP" "$TURL/health" 2>/dev/null | grep -q '"ok"' && ALIVE=1
  fi
  if [ "$ALIVE" = "0" ]; then
    echo "$(date -u +%FT%TZ) tunnel down, restarting"
    pkill -f "cloudflared tunnel" 2>/dev/null; sleep 2
    nohup /opt/homebrew/opt/cloudflared/bin/cloudflared tunnel --url http://localhost:4321 --protocol http2 > /tmp/cert-sdr-tunnel.log 2>&1 &
    sleep 15
    TURL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/cert-sdr-tunnel.log 2>/dev/null | head -1)
  fi
  # pointer file
  if [ -n "$TURL" ]; then
    CUR=$(python3 -c "import json;print(json.load(open('live-config.json')).get('api',''))" 2>/dev/null)
    if [ "$CUR" != "$TURL" ]; then
      printf '{"api":"%s","updated":"%s"}\n' "$TURL" "$(date -u +%FT%TZ)" > live-config.json
      git add live-config.json && git commit -m "watchdog: tunnel rotated" --quiet && env -u GITHUB_TOKEN git push --quiet
      echo "$(date -u +%FT%TZ) repointed live-config -> $TURL"
    fi
  fi
  sleep 45
done
