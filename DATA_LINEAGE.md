# Slayer — Data Lineage (v1 / v2 / v3)

Provenance record of exactly what each model version was trained on. Maintained so the
**v3 "clean" line** has an auditable contrast against the contaminated v2.

## TL;DR — the contamination signature
`belebele` had **0 training examples** in the v2 mix → **+0.0 gain** (base 92.0 → v2 92.0).
Tasks that **did** have train-split data → large gains (`psc` +26.5, `polemo` +10.0).
That zero-vs-tens contrast is proof the KLEJ "win" is a **train-split artifact**, not capability —
the same reason **PLLuM was removed** from the Open PL LLM Leaderboard (it's 5-shot; Bielik never
touched these splits, our v2 did).

---

## v1 — `slayer-style-qwen3.5-27b` (ep1/ep2/ep3, private HF)  ✅ CLEAN
**Goal:** Polish writing *style* (de-translationese, no em-dash overuse, native fleksja).
**Data:** `style/style_pl_sft_full.jsonl` (1600) → curated subset (~1004 best, LIMA-style).
- Source: `qwen_raw_teacher_rewrite` — base Qwen raw outputs rewritten by teacher (deepseek-v4-pro), judged by open Qwen3.5 judge.
- **No benchmark data of any kind.** Pure style. Contamination-free.

## v2 — `slayer-v2-qwen3.5-27b-klej` (private HF)  ⚠️ CONTAMINATED
**Goal (in hindsight, flawed):** beat Bielik on KLEJ by training on KLEJ train splits.
**Data:** `style/train_v2_mix.jsonl` (2482 examples):

| layer | examples | % | clean? |
|---|---|---|---|
| **Style** (`qwen_raw_teacher_rewrite`) | 1004 | 40.5% | ✅ clean |
| **KLEJ real train-split** (psc, ppc, dyk, polemo, 8tags, cbd, ar, cdsc_e, cdsc_r, nkjp_ner) | 1100 | 44.3% | ❌ **benchmark train data** |
| **KLEJ synth** (synth_psc/ppc/dyk/8tags/polemo) | 150 | 6.0% | ⚠️ task-format-targeted |
| **Replay** (math, code, en_qa, multilingual, reasoning, safety, chat, …) | 228 | 9.2% | ✅ clean (anti-forgetting) |

→ **50.3% of the mix (1250 ex) is benchmark-task-targeted.** This is the contamination.
**Note:** `belebele` is NOT in the mix (0 examples) — which is exactly why it showed +0.0, serving as the built-in control that exposes the artifact.

**Measured (our harness, greedy, enable_thinking=False, n=200):** v2 macro 87.83 vs base 81.83.
Real, but inflated by the train-split layer — **not a defensible leaderboard claim.**

## v3 — `slayer-v3` (PLANNED)  🎯 CLEAN
**Rule:** benchmark train splits → **held-out dev validation ONLY**, never in training.
**Mix (target):**
1. **Distillation ~50–60%** — diverse PL prompts (law/code/writing/QA), answers generated *in Polish from scratch* (no translationese), Bielik as PL-language teacher where fleksja matters.
2. **Human PL ~15–20%** — PLLuM organic instructions (pending HF/license check), Aya-PL, OASST-PL + our re-judged style.
3. **EN retention ~15–20%** — Tulu 3 / Olmo 3 (Dolci) SFT subset (reasoning/code/IF) to prevent capability loss.
4. **DPO** at the end — on-policy pairs from our own model, judged by teacher.

**Success metric:** official **5-shot Open PL LLM Leaderboard + MT-Bench-PL** rising together (not train-split accuracy).

---

## HF storage status
- **Models on HF (private):** slayer-style ep1/ep2/ep3, slayer-v2-qwen3.5-27b-klej.
- **Datasets on HF (private):** `slayer-data-v1-style` (clean), `slayer-data-v2-klej-mix` (contaminated, this lineage as README).

---

## DISCLOSURE (paste-ready for any public model card / README)

> **Training/eval separation & contamination disclosure.**
> The v2 KLEJ-targeted adapter was fine-tuned on the **official KLEJ *train* splits** and evaluated
> **only on the held-out *test* splits**, with **atom-level train↔test deduplication** applied
> (`bench/build_klej_sft.py`). **No test-set data entered training** — there is no test-set contamination.
>
> However, training on a task's *train* split produces **in-distribution gains** that are **not
> comparable** to models evaluated few-shot (e.g. Bielik at 5-shot, which never saw these splits).
> We therefore **do not present v2's KLEJ scores as a leaderboard or "beats-X" claim.** They are an
> internal diagnostic only. The built-in control confirms this: **`belebele` (no train-split data in
> the mix) showed +0.0**, while train-split tasks (`psc` +26.5, `polemo` +10.0) gained heavily — the
> signature of train-split fitting, not capability.
>
> **v3 excludes all benchmark train splits entirely** (distillation + open human-PL + EN-retention +
> DPO); benchmarks are used as **held-out evaluation only**, and any public claim will be made solely
> on the **official 5-shot Open PL LLM Leaderboard + MT-Bench-PL** — the same measure as the baselines.

*Full per-example mix composition and the v1/v2 datasets are published privately for audit at*
*`hf.co/datasets/kacperwikiel/slayer-data-v1-style` and `…/slayer-data-v2-klej-mix`.*
