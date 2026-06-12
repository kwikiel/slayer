#!/usr/bin/env bash
# Pull latest leaderboard + status from simp and redeploy the public site.
set -uo pipefail
cd /Users/kacper/Local/Ventures/Slayer
ok=0
for f in leaderboard status; do
  ssh -o ConnectTimeout=20 -o BatchMode=yes simp "cat /home/kacper/bench_results/$f.json" > public/results/$f.json.tmp 2>/dev/null
  if [ -s public/results/$f.json.tmp ] && python3 -c "import json;json.load(open('public/results/$f.json.tmp'))" 2>/dev/null; then
    mv public/results/$f.json.tmp public/results/$f.json; ok=1
  else rm -f public/results/$f.json.tmp; fi
done
[ "$ok" = 1 ] && { vercel --prod --yes >/dev/null 2>&1 && echo "$(date '+%F %T') published OK" || echo "$(date '+%F %T') deploy failed"; } || echo "$(date '+%F %T') no data"
