#!/usr/bin/env bash
# Bielik Slayer — autonomous benchmark queue for simp.
# Frees the GPU (pauses Hermes 35B), runs the full piątka, refreshes the dashboard
# after EVERY job, keeps the GPU warm with multi-seed runs, and ALWAYS restores
# Hermes on exit (success, error, or kill). Viewable anytime: bench_results/SUMMARY.txt
set -uo pipefail

HOME_DIR=/home/kacper
BR="$HOME_DIR/bench_results"
Q="$HOME_DIR/bench"
LOG="$BR/queue.log"
PAUSE="$HOME_DIR/.hermes/hermes-llm.no-autostart"
JUDGE_TAG="${JUDGE_TAG:-gemma2:27b}"
MAX_HOURS="${MAX_HOURS:-22}"          # stop launching new jobs after this; then restore Hermes
export JUDGE_TAG
export RUN_DATE="$(date '+%Y-%m-%d')"
[ -f "$HOME_DIR/.hf_token" ] && export HF_TOKEN="$(cat "$HOME_DIR/.hf_token")"
mkdir -p "$BR" "$HOME_DIR/.hermes"

log(){ printf '%s %s\n' "$(date '+%F %T')" "$*" | tee -a "$LOG"; }
dash(){ python3 "$Q/make_dashboard.py" 2>>"$LOG" | tee -a "$LOG"; }
elapsed_h(){ echo $(( SECONDS / 3600 )); }

restore_hermes(){
  log "=== RESTORE: zdejmuję pauzę i wznawiam Hermes 35B ==="
  rm -f "$PAUSE"
  sudo -n systemctl start hermes-llm.service 2>>"$LOG" || log "WARN: start hermes-llm nieudany"
  for i in $(seq 1 45); do
    curl -fsS -m 3 http://127.0.0.1:8088/health >/dev/null 2>&1 && { log "Hermes HEALTHY"; break; }
    sleep 4
  done
}
trap restore_hermes EXIT

job(){ local label="$1"; shift
  (( SECONDS/3600 >= MAX_HOURS )) && { log "SKIP (limit ${MAX_HOURS}h): $label"; return; }
  log ">>> START: $label  [t+$(elapsed_h)h]"
  if "$@" >>"$LOG" 2>&1; then log "<<< OK: $label"; else log "<<< FAIL: $label (kontynuuję)"; fi
  dash
}

log "########## KOLEJKA START (limit ${MAX_HOURS}h) ##########"
touch "$PAUSE"; log "pause file ustawiony"
sudo -n systemctl stop hermes-llm.service 2>>"$LOG" && log "hermes-llm zatrzymany"
sleep 4; log "GPU: $(nvidia-smi --query-gpu=memory.used --format=csv,noheader)"
log "pull judge $JUDGE_TAG ..."; ollama pull "$JUDGE_TAG" >>"$LOG" 2>&1 || { log "WARN: brak $JUDGE_TAG -> qwen2.5:7b"; export JUDGE_TAG=qwen2.5:7b; }
dash

# ---- FAZA A: definitywny przebieg na pełnych zbiorach (raz) ----
job "Belebele PL (full 900)"      python3 "$Q/bench_mcq.py" belebele 0 42
job "LLMzSzŁ (FULL 18821)"        python3 "$Q/bench_mcq.py" llmzszl 0 42
job "PES medyczny (FULL)"         python3 "$Q/bench_mcq.py" pes 0 42
job "PoQuAD (1500 + sędzia)"      python3 "$Q/bench_poquad.py" 1500 42
job "FLORES-200 PL↔EN (600)"      python3 "$Q/bench_flores.py" 600 42
# --- dokolejkowane: polska wiedza + kontrola regresji EN (Open LLM Leaderboard) ---
job "INCLUDE-44 (PL, full)"       python3 "$Q/bench_mcq.py" include 0 42
job "Belebele EN (full 900)"      python3 "$Q/bench_mcq.py" belebele_en 0 42
job "ARC-Challenge (EN, full)"    python3 "$Q/bench_mcq.py" arc 0 42
job "MMLU (EN, 2000)"             python3 "$Q/bench_mcq.py" mmlu 2000 42
job "GSM8K (EN, 600)"             python3 "$Q/bench_gsm8k.py" 600 42

# ---- FAZA B: keep-warm, wiele seedów (przedziały ufności) aż do limitu czasu ----
seed=43
while (( SECONDS/3600 < MAX_HOURS )); do
  log "=== keep-warm runda seed=$seed [t+$(elapsed_h)h] ==="
  job "LLMzSzŁ (4000, s$seed)"    python3 "$Q/bench_mcq.py" llmzszl 4000 "$seed"
  job "PES (4000, s$seed)"        python3 "$Q/bench_mcq.py" pes 4000 "$seed"
  job "Belebele (full, s$seed)"   python3 "$Q/bench_mcq.py" belebele 0 "$seed"
  job "INCLUDE-44 (PL, s$seed)"   python3 "$Q/bench_mcq.py" include 0 "$seed"
  job "Belebele EN (s$seed)"      python3 "$Q/bench_mcq.py" belebele_en 0 "$seed"
  job "ARC-C EN (s$seed)"         python3 "$Q/bench_mcq.py" arc 0 "$seed"
  job "MMLU EN (2000, s$seed)"    python3 "$Q/bench_mcq.py" mmlu 2000 "$seed"
  job "PoQuAD (1000+sędzia,s$seed)" python3 "$Q/bench_poquad.py" 1000 "$seed"
  job "FLORES (400, s$seed)"      python3 "$Q/bench_flores.py" 400 "$seed"
  job "GSM8K (400, s$seed)"       python3 "$Q/bench_gsm8k.py" 400 "$seed"
  seed=$((seed+1))
done

log "########## KOLEJKA KONIEC [t+$(elapsed_h)h] ##########"
# trap restore_hermes runs on EXIT
