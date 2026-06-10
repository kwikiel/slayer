# Plan: Slayer style-tuning v2 — anti-forgetting protocol — 2026-06-09

---

## v2.1 update — KLEJ task-learning (2026-06-10)

**Scope change (user-confirmed):** v2 is no longer style-only. It becomes a **Polish-NLU +
style** adapter that **crushes the 6 KLEJ tasks** while holding every general axis flat.
Thesis: *"naturalny polski styl AND mocne polskie NLU — mierzalne, bez regresji na EN/kod/matematyce."*

**Clean method (no benchmaxxing, consistent with bench-purity):** train on the official
**TRAIN splits** of the KLEJ tasks, formatted as instructions; **evaluate only on TEST**.
Train/test are disjoint by construction — this is task-learning, not contamination. We still
never inspect test items, only aggregates.

### KLEJ baseline (→ `results/klej_baseline_v1.json`)
Slayer **v1 already beats Bielik on the KLEJ average** and improves on base in 5/6 tasks.
Numbers below: Bielik @temp 0.2, Qwen @temp 0.7 (**not matched — see caveat**).

| task (n) | Bielik-7B | Bielik-11B | Qwen-27B base | **slayer v1** | v1−base | v1 − best-Bielik |
|---|---|---|---|---|---|---|
| polish_psc (1078) | **91.93** | 83.77 | 85.25 | 86.55 | +1.30 | **−5.38** ← biggest gap |
| polish_ppc (1000) | **76.10** | 73.60 | 70.50 | 72.60 | +2.10 | **−3.50** |
| polemo2_in (722) | 76.45 | **79.92** | 77.42 | 78.67 | +1.25 | −1.25 |
| polish_8tags (4372) | **79.32** | 79.16 | 77.70 | 78.25 | +0.55 | −1.07 |
| polish_dyk (1029) | 79.01 | **89.31** | 87.07 | 89.02 | +1.95 | −0.29 (≈parity) |
| polish_belebele (900) | 88.11 | 88.33 | 93.89 | 92.67 | **−1.22** | +4.34 (already #1) |
| **PL AVG** | 81.82 | 82.35 | 81.97 | **82.96** | +0.99 | best overall |

### What v2 must do
1. **Crush the 5 trainable tasks** (psc ≫ ppc > polemo > 8tags > dyk). psc/ppc are the prize —
   the only places we trail Bielik by >3 pp. Each has a TRAIN split → direct SFT lift.
2. **Recover the belebele regression** (−1.22 vs base). **Belebele has NO train split** (eval-only)
   → cannot task-train it. Fix structurally: lower LR + replay (RC anchors) + DoRA smaller delta;
   re-check it's back ≥ base 93.89. This is also our cleanest forgetting signal.
3. **Hold every general axis flat** (EN/code/math/multilingual per `GATES.md` §B) — same Δ≈0 gate.

### Methodology fix (do before crediting any v2 gain)
The board compares **Bielik @0.2 vs Qwen @0.7** — not apples-to-apples; deterministic
classification (psc/ppc/8tags/polemo) favors lower temp, so Qwen/slayer are likely **understated**.
**Re-baseline all models at matched temp** (greedy / temp 0, or answer-likelihood scoring like
`bench_llmzszl_likelihood.py`) so v2 deltas are real, not a temperature artifact. (Some of the psc/ppc
gap may already close just from matched-temp scoring — measure before training to it.)

### Train-split SFT data plan (→ `slayer-data/klej/`)
- **psc** (`allegro/klej-psc`): given article extract + summary → binary semantic-similarity label.
  Balance the two classes; this is the highest-leverage set.
- **ppc** (`sdadas/ppc`): sentence pair → paraphrase class (exact / close / non-paraphrase).
- **dyk** (`allegro/klej-dyk`): question + candidate answer → correct/incorrect.
- **8tags** (`sdadas/8tags`): text → 1 of 8 topics. Cap per-class to avoid the 4372-item set dominating.
- **polemo2_in** (`allegro/klej`): review → sentiment (positive/negative/neutral/ambiguous).
- **belebele**: NOT trained (no train split). Held out as a gate only.
- **Format/discipline:** instruction-style chat `messages`, prompt-masked, `source`-tagged per task,
  **LIMA-style balanced** (quality+coverage > volume per [[data-quality-over-quantity]]), label-string
  matched exactly to how the test harness parses answers. **Contamination guard:** n-gram dedup each
  task's train prompts vs its own test split AND vs all §B gate sets; emit "0 overlap" report.
- **Volume:** target ~600–900 KLEJ examples total (≈120–180/task, 8tags capped), mixed into the
  ~1000–1300 style+replay base → `train_v2_mix.jsonl`. KLEJ should be a *minority* of the mix so
  style/general capability isn't crowded out (it's the anti-forgetting budget).

### Risk specific to this scope
Task-format SFT can make the model "classification-shaped" and **hurt open-ended style/chat** — the
opposite of Slayer's selling point. Mitigate: keep KLEJ a minority of the mix, keep style data
primary, and **gate style (`eval_style.py`) every checkpoint** alongside KLEJ. If style drops, cut
KLEJ ratio. Pareto score must include style, not just KLEJ accuracy.

---

## v2.2 update — Knowledge-adapter track (EntiGraph synthetic CPT) — 2026-06-10

**Why this exists:** SFT teaches *behavior/elicitation*, not *knowledge*. For benchmarks where the
base genuinely lacks facts (LLMzSzŁ Polish exams — the one PL axis we trail Bielik; PES medical;
legal), no amount of classification SFT helps. The cheap, forgetting-safe way to inject knowledge:

**Recipe (user-directed; EntiGraph, Stanford 2024):**
1. Take a small **domain corpus** (exam textbooks; ISAP/SAOS for legal; medical materials for PES;
   Polish Wikipedia subset as the open proxy).
2. **Explode each chunk into 5–20 synthetic variants** — paraphrases, summaries, QA pairs,
   entity-relation statements — via the **open teacher (deepseek-v4-pro) + open judge** (provenance-clean,
   same as the rest of v2). EntiGraph showed **log-linear** closed-book-QA scaling with synthetic tokens
   from a *small* source; strong results at **~455M synthetic tokens** = QLoRA-trainable (≈1–2 days on 4×3090).
3. Train a **QLoRA "knowledge adapter"** (next-token CPT on the synthetic tokens) with **5–10% general-PL
   replay** + **low LR** + **frozen base** → cheap (no full-parameter run) + forgetting-resistant.

**This dissolves the locked CPT objection:** the plan rejected **full-weight CPT on billions of raw
tokens** (expensive + forgetting-prone). **LoRA-CPT on curated synthetic tokens is neither.** Full-weight
CPT stays rejected; this targeted variant is in.

**Train order: CPT → SFT** (knowledge adapter first, behavior SFT on top). **Stack or merge** the two
adapters afterward — never SFT-then-CPT. Gate the knowledge adapter on the same regression suite: it must
lift the target knowledge bench AND keep general Δ≈0.

**Open decisions:** (a) first target + corpus (LLMzSzŁ via Wikipedia-PL is the cleanest open start; PES/legal
need domain corpora w/ licensing care); (b) compute (455M-token QLoRA wants the 4×3090 rig or vast multi-GPU —
simp is a single 3090); (c) knowledge adapter is SEPARATE from the behavior-SFT adapter we already staged.

---

## Goal
Train **slayer v2**: a *bounded, measured, reversible* Polish-style **DoRA** adapter on
Qwen3.5-27B that improves PL style/grammar with **no measurable regression** on general
capabilities (EN / code / math / reasoning / multilingual) — proven by a slayer-vs-base
**delta table**. Done = chosen checkpoint where PL style ↑ and every general axis Δ within
tolerance (≤ ~0.5 pp / no meaningful drop), shipped with the delta table in the model card.

## Context
- **v1** (current): LoRA on all-linear, r=16, 3 epochs / 150 steps, ~799 PL style examples,
  judge-mixed (opus early batch + open Qwen3.5-122B). Result: llmzszl **65.0** vs base 58.5
  vs Bielik 56.0 — but **only PL knowledge tested**. Reviewer "a" flagged catastrophic-forgetting
  risk on code/math/EN/other-languages (untested). v1 llmzszl ↑ is evidence PL knowledge survived,
  not the other axes.
- **Decisions locked:** base frozen, PEFT-only; **no CPT/pretraining**, no tokenizer extension,
  no full FT, no benchmark data in training, no 3+ epochs without gates. Teacher = deepseek-v4-pro,
  judge = open Qwen3.5-122B (not distilled from Anthropic/OpenAI). Aggregates only (bench-purity).
- **Base-model choice (biggest single lever — locked):** start from the **post-trained
  Qwen3.5-27B (instruct/thinking), NOT `-Base`** — v1 already did (it has a chat template + emits
  `<think>`). Rationale: it already does instruction-following + chat, so the adapter adds *only* PL
  style → **smallest delta → mechanically least forgetting** (our goal is style, not building
  capability from scratch). Downside: we overwrite the vendor's post-training (alignment/format/safety)
  we can't see → **mitigated + measured by the IFEval (format/instruction) + XSTest (safety/over-refusal)
  gates**; ship only if Δ there ≈ 0. (Starting from `-Base` would mean teaching chat+instructions too =
  much bigger delta = more forgetting — rejected.) TODO: fix playbook wording that says "9B Base".
- **Defensive core (parsimony > exotica):** credibility comes from a held-out **Δ≈0 table on general
  axes**, not fancy training. Core that nobody can attack = **DoRA r=16 + replay 15–30% + per-epoch
  regression gates + Pareto selection.** Everything else (DPO, merge, rsLoRA) is *optional* — add ONLY
  if it shows a numeric gain on our own dashboard. Each extra method = new attack surface.
- **Method-fact corrections (reviewer):** (a) **DPO**, not ORPO, anchors to base — DPO has a frozen
  reference + implicit KL; **ORPO is reference-free** (no KL, just saves VRAM). For "don't drift",
  use DPO-with-base-ref (or a small explicit KL added to SFT). (b) DoRA = "better quality at given
  rank"; the forgetting benefit is *plausible* (smaller low-rank perturbation), not proven — don't
  oversell. (c) Prefer **rsLoRA** (neutral scale stabilizer) over **PiSSA** (inits from principal
  weight components → faster but *more* base drift on overfit; skip for a forgetting-minimizing goal).
  (d) CPT rationale: Bielik *did* CPT (only tokenizer-extension was questioned) — our argument is
  simply "the problem is style, not knowledge, and CPT is the most expensive + forgetting-prone tool
  for a problem we don't have."
- **Compute:** GB10 (aarch64 sm_121, base + adapter cached, CUDA torch in `slayer_venv`); vast.ai
  for heavier/sharded runs. **Serve:** simp 3090 (llama-swap) + Modal demo.
- **Assets:** `bench/sft_style_qlora.py`, `bench/bench_llmzszl_likelihood.py` (--adapter, likelihood
  MCQ harness), `slayer-data/style/train_v1.jsonl` (799), `holdout_v1.jsonl` (160),
  `style_pl_pref_v3.jsonl` (pairs), `bench/eval_style.py`, `bench/pl_quality.py`, `bench/grammar_check.py`.
- **Pitch:** "Mierzalna, odwracalna i regresyjnie kontrolowana adaptacja silnego modelu bazowego
  do wysokiej jakości polskiego stylu — bez kosztownego pretrainingu."

## Steps
1. **Build regression-gate eval suite FIRST** (`bench/gates/`) — full competency→benchmark map in
   **`bench/GATES.md`**. Each script runs slayer-vs-base, fixed n + seed, emits `results/gate_*.json`
   (aggregates only). Core ≈10 axes run every checkpoint; extended at final report:
   - MMLU + ARC + HellaSwag subset → likelihood MCQ (reuse `bench_llmzszl_likelihood.py` pattern).
   - GSM8K (n≈200) → generation + exact-match on final number.
   - HumanEval/MBPP-mini → generation + sandboxed exec (start MBPP-mini if exec infra is heavy).
   - EN instruction-following → small judge set (open judge, AlpacaEval-lite).
   - PL grammar (LanguageTool via `pl_quality.py`/`grammar_check.py`) + PL style (`eval_style.py`).
2. **v1 baseline delta table** — run the suite on the **v1 adapter** vs base. Quantifies whether v1
   *already* forgot. This alone answers reviewer "a" immediately, independent of v2.
   → `results/delta_v1_vs_base.json`.
3. **Assemble replay mix** (`bench/build_replay_mix.py`): 70–85% PL style (`train_v1.jsonl`) +
   15–30% **general replay**. **Provenance constraint:** replay must ALSO be free of OpenAI/Anthropic
   outputs or the "not distilled" claim breaks → **exclude** OpenHermes/UltraChat/Alpaca/ShareGPT/GPT-4
   sets. Sources, in priority:
   - **Self-replay (primary):** base Qwen3.5-27B generates answers to ~200–350 general prompts
     (code/math/EN/multilingual/reasoning) → train on its own outputs. Anti-forgetting by construction
     + provenance bulletproof.
   - **Clean human/open sets (supplement):** Aya (multilingual, human, Apache), Dolly-15k (human EN),
     OASST (human); code/math from open-model-gen (e.g. OpenMathInstruct-2) or self-gen — never GPT.
   - **Skill grid (balance > volume, LIMA-style)** — replay must cover every gated axis ≥1:1 so each
     competency has an anchor. ~250–350 examples spread: code ~50 (Py/JS/SQL/bash), math ~40,
     reasoning ~30, EN world-knowledge QA ~30, **multilingual ~50** (EN/DE/ES/FR/UK via Aya),
     instruction/format ~30, summarization/long-ctx ~20, structured-output/JSON/tool ~20,
     safety/refusal ~20, general chat ~20 — each varied by difficulty × length × domain.
   - Same chat-`messages` format, prompt-masked, `source`-tagged.
   - **Contamination guard:** n-gram dedup of replay prompts vs ALL gate datasets (MMLU/GSM8K/HumanEval/
     ARC/HellaSwag); emit "0 overlap" report for the model card.
   Target ~1000–1300 total. → `slayer-data/style/train_v2_mix.jsonl`.
4. **Upgrade trainer** (`bench/sft_style_qlora.py`): `use_dora=True` (DoRA; optional `use_rslora=True`),
   configurable rank (16/32), **exclude `embed_tokens`/`lm_head` from targets** (less output drift),
   per-epoch (or per-N-step) checkpointing, lower LR (~5e-5), 1–2 epochs, base frozen. (No PiSSA.)
5. **Train + gate per checkpoint** on the replay mix (GB10 or vast). Run the full gate suite at each
   checkpoint → N delta tables.
6. **Pareto checkpoint selection** (`bench/select_checkpoint.py`):
   `score = PL_style_gain − λ·max(0, general_regression)`; pick best, **not last epoch**.
7. **Stage 2 (optional, only if SFT plateaus on style)** — **DPO** on style pairs
   (`style_pl_pref_v3.jsonl`, chosen=natural vs rejected=stiff) with **base as frozen reference**
   (implicit KL = the anti-drift anchor we want); re-gate + re-Pareto. Use ORPO *only* if VRAM-bound
   on 4×3090 — but note it's reference-free (no base anchor), so re-check gates extra carefully.
8. **Rescue (only if needed)** — if chosen checkpoint shows small general regression: merge-coefficient
   sweep (scale adapter 0.3–0.7) or TIES/DARE merge with base; re-eval; pick coeff by Pareto.
9. **Ship + report** — quantize chosen adapter → GGUF (existing pipeline → simp + Modal); update model
   cards + playbook with the **full delta table** vs base AND vs Bielik, broken down by axis
   (style / grammar / reasoning / factuality / coding / safety / latency / cost).

## Risks / Unknowns
- **Replay source**: which clean open SFT set (license, quality, language mix) — must NOT overlap gate
  sets (contamination check is mandatory).
- **Code exec**: HumanEval needs a sandbox; may start with MBPP-mini or guarded `exec`.
- **DoRA + QLoRA (4-bit)**: verify PEFT/bitsandbytes support on the train box (recent PEFT supports it).
- **Compute**: 27B × multiple checkpoints × multi-axis eval is heavy; GB10 sm_121 quirks → maybe vast.ai.
- **λ / tolerance**: subjective; set explicit gate (e.g., regression ≤ 0.5 pp per axis) up front.

## Verification
Every step emits a JSON/table. Project gate: **PL style ↑ AND every general-axis Δ within tolerance.**
The shippable artifact is whichever checkpoint (or merge coeff) maximizes the Pareto score with all
general axes inside tolerance — reported as a delta table, not cherry-picked examples.

## Out of scope
CPT / pretraining on a small PL corpus; tokenizer extension; full fine-tuning; training on benchmark
items; 3+ epochs without gates; unqualified "better than Bielik" claims.
