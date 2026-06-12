# Slayer v3 — Data Pipeline Audit (2026-06-12)

> **PASS METODOLOGICZNY (ten sam dzień, „fix until methodologically correct"):**
> 1. **Sondaż wierności EntiGraph rozstrzygnięty pomiarem:** flash pl_focus 20.5% / zpe 74.5%
>    niewiernych źródłu; **pro gorszy, nie lepszy (33.5/36.5%)** -> wina metody, nie teachera;
>    utwardzanie promptów bez efektu (20.0%); sędzia skalibrowany (50/50 kontrola, 1/100 retest).
>    **Receptura: flash + filtr per dok (122b) = 1.0% niewiernych pod NIEZALEŻNYM sędzią (pro).**
>    Korpus zpe = kwarantanna; pl_focus wymaga filtra przed CPT. `slayer-data/knowledge/README.md`.
> 2. **Golds sondy wiedzy zweryfikowane niezależnie:** 70/71 ok (1.4% złych) — target CPT
>    (Bielik 28.9 vs Qwen 15.8) stoi na solidnym evalu. `results/probe_golds_verification.json`.
> 3. **Warstwa human PL osądzona** (była jedyną nieosądzoną): aya 535/1108, oasst 54/96 —
>    połowa „ludzkich" danych odpadła na faktach/jakości. Miks bierze tylko verified.
> 4. **Miks zrównoważony pod MT-Bench-PL:** +4 zdolności generatywne (writing/reasoning/
>    summarize/rewrite, osądzone --grounded). Near-dup w distill: 1 para/1139 (nie-problem).
> 5. **Runner MT-Bench-PL zbudowany** (`bench/mtbench_pl.py`): pytania lightblue/mt_bench_polish,
>    sędzia otwarty 122b, temp per kategoria jak w oryginale, tryb --compare. Bramka wewnętrzna
>    (delta base-vs-tuned na tym samym sędzi); claim publiczny nadal przez oficjalny eval.
> 6. **Finalny miks: 2233 ex** (distill 65.1% w 14 zdolnościach / en 21.7% / human 7.8% /
>    styl 5.4%), bramka decon: CZYSTY. Słaby punkt: summarize 27/120 po sędzi (do regeneracji).
> Koszt całego passu: ~$6-7 API. Następny wydatek (korpus CPT 455M tok wiernych): ~$1.1-1.2k.

> **FIX PASS (same day, „fix all issues"):** wszystkie pozycje CRITICAL i MAJOR oraz większość MINOR
> naprawione. Stan po naprawach:
> - **Bramka decon obowiązkowa** w `build_v3_mix.py` (exit != 0 blokuje); indeks rozszerzony o pełny
>   test LLMzSzŁ z HF (141,7k shingli), `probe_v1.jsonl`, exclusion list sondy (100 hashy, typ
>   `probe_excluded`), pliki `external/` i `knowledge/`; historia audytów w
>   `results/decon_audit_history.jsonl`; niesparsowalne linie skanowane jako surowy tekst.
> - **Cap 200 znaków usunięty** ze wszystkich 6 konsumentów atomów (pełne 17,7k atomów).
> - **Warstwa distill po sędzi otwartym**: `distill_pl.verified.jsonl` (1139/1249 ok; 91 powazne,
>   19 drobne odrzucone — 10% warstwy miało poważne błędy faktów, vs 50.6% u Bielika).
> - **Egzekucja exclusion list sondy działa**: pierwsze uruchomienie zdjęło 118 rekordów
>   z `entigraph_pl_focus.clean.jsonl` (92,084 po czyszczeniu) — sonda wiedzy znów miarodajna.
> - Udziały miksu liczone PO filtrach; brak pliku warstwy = twardy błąd; styl wydzielony jako
>   osobna warstwa (uczciwe etykiety); `make_test_atoms.py` nie zapisuje częściowego pliku.
> - `make_style_disjoint.py` (nowy): reprodukcja pliku disjoint zweryfikowana 1:1, potem zaostrzona
>   (prompt+odpowiedź vs cały holdout, slim rekordy bez meta) -> 502 rekordy.
> - Naprawione: reservoir Tulu3 (kod; dane nie regenerowane), zapis atomowy w `gen_distill_pl.py`,
>   allowlist provenance (blokada Anthropic/OpenAI w GEN_MODEL/VERIFY_JUDGE), liczniki cichych strat
>   w EntiGraph, resume per akapit (`src_sha`) w `entigraph_augment.py`, resume bez dublowania
>   ścieżek w `entigraph_hops.py`, fallback kluczy na env, ścieżki w `pipeline/daily.yaml`,
>   3 urwane rekordy Tulu usunięte, NER przegenerowany (format „Nazwa: kategoria", sędzia
>   `--grounded` dla treści fikcyjnych: 67 verified vs 44).
> - **Finalny miks: `train_v3.jsonl` = 1,771 ex** (distill 63.2% / en 21.1% / human_pl 10.5% /
>   styl 5.2%), bramka decon: CZYSTY.
> - **Nadal otwarte:** trener CPT + replay mix (nie istnieją), spot-check wierności flash w EntiGraph,
>   golds sondy bez niezależnego weryfikatora, dump wiki 2023-11, regeneracja Tulu poprawionym
>   reservoirem (opcjonalna).

Audit of the v3 dataset creation process: build/gen code, actual artifacts on disk, CPT layer.
Method: 3 parallel audit passes (code, data, CPT/status). Bench purity respected (no eval items inspected, aggregates only).

> **Addendum (same day):** following this audit the **bielik_distill layer was dropped from training
> entirely** (weak-teacher decision; 50.6% serious fact errors at source, 78% of the layer was factual
> QA, plus one EN→PL translation found in a 3-record peek). Mix rebuilt without it:
> `train_v3.jsonl` = 1,742 ex (distill 58.7 / human_pl 17.5 / en 23.9). The 10k corpus is retained in
> `slayer-data/external/` as a Bielik-knowledge analysis asset only (see README there). Funnel/judge
> findings below kept for the record.

## Verdict

**SFT mix (`slayer-data/v3/train_v3.jsonl`, 2,239 ex) is close to plan and passes the contamination
checks that were actually run.** But there are 3 critical gaps to close before training, and the CPT
phase is at ~6% of pilot scale with no trainer.

What's good:
- Composition: distill 45.6% + bielik 16.7% (= 62.3% distillation) / human_pl 15.4% / EN 22.3% ≈ plan targets.
- 0 records with 8-gram overlap vs `style/holdout_v1.jsonl`; 0 KLEJ-pattern sources; `FORBIDDEN_SOURCES` fail-fast works.
- 0 duplicate prompts; 0 EN/PL cross-language leakage; dash rate 1.8% (low).
- Bielik funnel works as designed: 10,304 raw → 9,769 judged → 4,091 verified → 374 sampled.
  **Judge (qwen3.5-122b, open) flagged `fakty: powazne` in 50.6% of raw Bielik-11B outputs** (hallucinated
  facts). Never widen this faucet without re-judging.
- Provenance compliant where implemented: teacher deepseek-v4-pro (SFT distill), judge open Qwen3.5, Opus verdicts purged.

## CRITICAL (fix before any v3 training run)

1. **Decon coverage holes** (`bench/decon_audit.py:28-44`):
   - `knowledge/probe_v1.jsonl` absent from eval sources entirely.
   - LLMzSzŁ entry is the 200-item local sample (`llmzszl_R_eval.jsonl`), not the full
     `amu-cai/llmzszl-dataset` test pull that `bench_llmzszl_likelihood.py:34` actually evaluates on.
   - `GEN_DEFAULT` glob omits `slayer-data/external/*.jsonl` (Bielik layer never re-audited by `--all`).
   - `results/decon_audit.json` is overwritten per run; no evidence the final `train_v3.jsonl` was ever audited.
   - Fix: add the missing sources, include external/, append-don't-overwrite the report, and make a
     hit-free decon pass on the assembled mix a **mandatory gate** (non-zero exit blocks training).

2. **200-char atom cap drops 21% of test atoms from every inline substring guard.**
   `make_test_atoms.py` writes all lengths, but consumers filter `20 <= len <= 200`
   (`build_v3_sources.py:37`, `build_v3_mix.py:83`, `gen_distill_pl.py:97`): 3,747/17,707 atoms
   (the long PSC/belebele passages, the likeliest leaks) are silently excluded. Proof it matters:
   the 8-gram decon still found 1,274 hits in `entigraph_zpe.jsonl` after the inline guard passed.
   Fix: drop the cap or replace atom-substring guards with the shingle index from `decon_audit.py`.

3. **~46% of the mix (main distill layer) was never judge-filtered.** Plan requires teacher gen →
   open-judge filter (V3_DATA_PLAN.md:43); `gen_distill_pl.py` has no judge step and `build_v3_mix.py:30`
   consumes the decon-only `.clean` file. The Bielik 50.6%-hallucination result shows exactly why
   unjudged teacher output is risky. Fix: run a `verify_external_sft.py`-style judge pass over
   `distill_pl.clean.jsonl` before mixing.

## MAJOR

4. **Unreproducible artifacts:** no tracked script generates `external/bielik_distill_10k.jsonl`
   (raw records carry no teacher metadata) nor `style_pl_sft_v3_openjudge_disjoint.jsonl` (the
   holdout-disjoint step). Reconstruct or document both in DATA_LINEAGE.md.
5. **Mix shares computed pre-filter** (`build_v3_mix.py:91-96`): distill loses ~18% to dash/contam
   drops after targets are set → realized 45.6% vs 50% target. Also CLI default 0.50 contradicts the
   file's own "~60%" docstring. Compute targets after filtering; validate shares sum to ≤1.0.
6. **Silent degradation:** missing layer file → "pomijam" + exit 0, can write an empty/skewed mix
   (`build_v3_mix.py:53-55`); failed HF download in `make_test_atoms.py:50-51` still writes a
   **partial** atoms file with exit 0, silently weakening every downstream dedup guarantee.
7. **Label honesty:** `layer=human_pl` includes 124 `qwen_raw_teacher_rewrite` records (5.5% of mix,
   exact copies of the style-SFT file). True human PL (Aya+OASST) is 9.8%, not 15%. Relabel
   (e.g. `style`) or disclose in the model card.

## CPT track (Phase 1) — not ready

- **Volume:** ~124M tokens total available (~20M clean EntiGraph synthetic + ~104M raw wiki/ZPE)
  vs 2-3B pilot target → ~4-6%. At observed gen throughput (~8k tok/s) the v2.2-era 455M synthetic
  target ≈ 16h of API time. Feasible, not done.
- **No CPT trainer / mix builder / replay plan exists.** `sft_style_qlora.py` is chat-SFT with prompt
  masking, unusable for next-token CPT. Replay 20-40% general data is the plan's own "most common
  failure mode" and nothing implements it.
- **`probe_v1.excluded_hashes.txt` enforced nowhere** (`knowledge_probe.py:9-11,127` writes it, zero
  consumers). The knowledge probe will be contaminated by construction unless wired into the CPT builder.
- **Teacher drift:** corpora are 99.7-100% **deepseek-v4-flash**, docs claim v4-pro
  (`entigraph_augment.py:10`). Per-row `gen_model` lineage is intact; fix the docs/claims and decide
  if flash quality is acceptable for CPT bulk.
- Probe golds are unverified flash output (no independent verifier, unlike `polknowledge.py`); n≈36/stratum is noisy.
- `entigraph_hops.py:171-175` resume reprocesses already-done paths (same seeded RNG) → duplicate docs, double spend.
- Wiki dump pinned to 20231101 (`harvest_wiki_sources.py:31`), 2.5y stale; can't serve the
  "współczesność" probe domain.
- Nothing enforces `.clean`-only inputs downstream; training on non-`.clean` EntiGraph files = contamination.

## MINOR

- Tulu3 reservoir sampling biased (`build_v3_sources.py:158-163`: wrong index base + non-uniform replacement). Seeded, so reproducible, just not uniform.
- `gen_distill_pl.py:129-130` rewrites the whole output file every round; crash mid-write loses the run.
- `GEN_MODEL`/`VERIFY_JUDGE` env overrides have no provenance allowlist (Anthropic/OpenAI possible by accident).
- Silent `except: pass/continue` in `gen_distill_pl.py:107`, `entigraph_augment.py:149-150`, `entigraph_hops.py:196-197`; decon passes unparseable lines into `.clean` unscanned (`decon_audit.py:113-115`).
- `distill_ner` underrepresented in mix (25 used vs 127 available); check if intentional.
- One truncated tulu3 math response found; sweep tulu3 records for mid-sentence endings.
- `pipeline/daily.yaml` mix paths stale (`slayer-data/human_pl/`, `slayer-data/en/` don't exist); a daily run would silently train on 2 of 5 layers.
- `.clean` steps strip records, never strip dashes from kept records; train_v3's low dash rate is sampling luck, not enforcement.

## Recommended order of work

1. Close decon holes + make the gate mandatory (CRITICAL 1, 2) — cheap, protects everything else.
2. Judge pass over `distill_pl` (CRITICAL 3) — directly improves the 46% of the mix most at risk.
3. Fix mix-share math + fail-loud on missing layers (MAJOR 5, 6), rebuild `train_v3.jsonl`, run the
   mandatory decon gate, relabel the style layer (MAJOR 7).
4. Then SFT can train. For CPT: wire the probe exclusion list + `.clean`-only enforcement into a new
   CPT mix builder, scale EntiGraph ~20×, write the packing/next-token trainer with replay, before
   spending on H100s.
