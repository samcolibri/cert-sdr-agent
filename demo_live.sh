#!/bin/bash
# One command to bring the demo fully live after a reboot. The watchdog keeps it alive:
# server + tunnel self-heal every 45s, and tunnel rotation auto-updates live-config.json.
cd "$(dirname "$0")"
pkill -f "watchdog.sh" 2>/dev/null
pkill -f "cloudflared tunnel" 2>/dev/null
lsof -ti :4321 | xargs kill 2>/dev/null
sleep 2
nohup bash watchdog.sh > /tmp/cert-sdr-watchdog.log 2>&1 &
disown
echo "watchdog started; demo self-heals from here."
echo "Watch:  tail -f /tmp/cert-sdr-watchdog.log"
echo "LIVE:   https://samcolibri.github.io/cert-sdr-agent/demo.html"
