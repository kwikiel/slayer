# Slayer v3 — Plan (CPT-first: wiedza → umiejętności → preferencje)

> Status: **propozycja otwarta na feedback** · Discord. Zmienia się z komentarzami społeczności.
> Wbudowany feedback: *„Bez pretreningu nie dodasz mu wiedzy o Polsce"* — słuszne → dodajemy fazę CPT.

## 0. Którą grę gramy
- **klejbenchmark.com** — enkodery, fine-tune per zadanie na train-splicie (top: Polish RoBERTa-v2, 88.9). Train-on-train = standard.
- **Open PL LLM Leaderboard** — generatywny, **5-shot**, bez fine-tune na zadaniu. **← gramy to.**

Konsekwencja: **zero train/test splitów benchmarków w treningu**, claim tylko 5-shot.

## 1. Teza
Dźwignią jest **duży, czysty, różnorodny korpus PL** (lekcja Dadasa: 135 GB → #1 KLEJ). Ale samo SFT
**nie dodaje wiedzy** — uczy umiejętności i wydobywa to, co model już zna. Wiedzę dodaje **pretraining**.
Dlatego v3 rozdziela trzy fazy w kolejności: **wiedza (CPT) → umiejętności (SFT) → preferencje (DPO)**.

Z budżetem ~$80k **CPT jest wykonalny** — pytanie brzmi nie „czy", tylko „ile". Argument autora Bielika jest
trafny: **długiego ogona (lokalne realia, prawo, regionalia, idiomy) SFT-em nie dodasz** — tylko CPT.

---

## FAZA 0 — EVAL NAJPIERW (gate przed pierwszym dolarem)
**PolKnowledge bench (known/unknown).** Open PL LLM Leaderboard **nie mierzy długiego ogona** — bez
własnego evalu wiedzy nie zmierzysz, czy CPT cokolwiek dał, ani ile tokenów potrzeba.
- **Co:** sonda wiedzy PL (historia, prawo/orzecznictwo, geografia, regionalia, idiomy, kultura, współczesność), każde pytanie z **weryfikowalną** odpowiedzią. Held-out, dedup, NIE w CPT.
- **Po co:** baseline **Qwen3.5-27B vs Bielik** per domena → mapa luk → **wymiaruje CPT** (10B vs 40B tok, które domeny).
- **Asset:** publiczny bench — dowód, że pobiliśmy Bielika na jego najmocniejszym polu (CodeSOTA/leaderboardy wiedzy).

---

## FAZA 1 — CPT: pre-training na wiedzę o Polsce

**1.1 Korpus (czysty, różnorodny PL)**
- **Wikipedia PL** (CC-BY-SA) — fakty encyklopedyczne o Polsce
- **Wolne Lektury** (public domain) — literatura, lektury szkolne
- **Wikibooks / Wikisource PL**, książki open-access, **akademickie skrypty** (pod LLMzSzŁ)
- skala: Dadas miał 135 GB *od zera*; my **dodajemy** do Qwen → wystarczy **kilka–kilkadziesiąt GB**

**1.2 Przygotowanie**
- dedup (MinHash / near-dup) → filtr jakości (usuń boilerplate, śmieci)
- **dedup vs 17 707 atomów test** (anty-kontaminacja — twarda gwarancja)
- tokenizacja

**1.3 CPT = next-token (causal LM) na korpusie, start z wag Qwen3.5-27B**
- **NIE cienki DoRA** (r=16 nie pomieści wiedzy) → **full-FT** albo **high-rank QLoRA (r=128-256)**
- **replay 20-30% danych oryginalnych** (EN + ogólne) → przeciw katastrofalnemu zapominaniu
- **niski LR** (~1e-5, warmup, cosine), **~1 epoka** (CPT nie potrzebuje wielu)

**1.4 EntiGraph synthetic CPT (tańsza, sample-efficient alternatywa)**
- kluczowe dokumenty → wyciągasz **encje** → teacher generuje **dużo wariantów** łączących encje → CPT na syntetycznym tekście
- czemu lepsze niż raw: surowy CPT na małym korpusie *zapamiętuje dosłownie*; EntiGraph **rozlewa** wiedzę na wiele sformułowań → lepsza generalizacja przy mniejszej liczbie tokenów (Yang i in. 2024)

**1.5 Receptura (Ibrahim i in. 2024, „Simple and Scalable Strategies to Continually Pre-train")**
- **re-warm LR do niskiego peaku ~1e-5** (NIE pretrainingowe 3e-4), cosine decay
- **replay 30-40% danych ogólnych** (EN/kod/matma) — kluczowe; najczęstszy błąd = 100% PL → piękna polszczyzna, model głupszy niż przed treningiem
- miks: **60-70% PL** (SpeakLeash przefiltrowany jakościowo + FineWeb-2 PL + Wikipedia PL + prawo/orzecznictwo) + **30-40% replay**

**1.6 Wykonalność / budżet (~$80k)**
- full-FT 27B bf16 + AdamW ≈ **430-450 GB** stanów → mieści się na **8×H100 (640 GB) z FSDP + activation checkpointing**, bez QLoRA
- ~20k tok/s @ 40% MFU (1 node) → 10B tok ≈ 5-6 dni ≈ $5-6k (capacity blocks ~$40/h)
- **CPT 30-40B tok: $18-25k** · SFT/distyl: $3-5k · bufor ablacje/nieudane runy: $10-15k → **starcza na 2-3 podejścia z ewalem między nimi**
- **dyscyplina:** pipeline (tokenizacja/packing/miks/resume) dopracować na **4×3090**; H100 tylko na właściwe runy; checkpoint co godzinę na S3

## Kolejność (adoptowana)
1. **Eval known/unknown + zbiór wiedzy o Polsce** (PolKnowledge bench)
2. **Pilot CPT 2-3B tok** na małym Qwenie (u nas, 3090) — walidacja miksu, delta na naszym evalu
3. **Pełny CPT 27B** na 8×H100 (FSDP)
4. **Distylacja / SFT** (umiejętności) → DPO
5. **Leaderboard 5-shot + nasz PolKnowledge bench**

---

## FAZA 2 — SFT: umiejętności (dystylacja zdolności)
Teacher (deepseek-v4-pro, MIT) **wymyśla od zera** różnorodne PL ucząc *umiejętności* zadań (sentyment, NLI,
parafraza, QA-poprawność, rozumienie, temat, toksyczność, NER) — naturalny format, nie szablon KLEJ.
Sędzia = **otwarty Qwen3.5** (Apache, niezależny od teachera) filtruje jakość. DoRA wystarczy.
Skrypt: `bench/gen_distill_pl.py` (działa). + ludzkie PL (Aya-PL/OASST-PL) + EN retencja (Tulu/Dolci, odc-by).

## FAZA 3 — DPO: preferencje
On-policy pary z naszego modelu, oceniane otwartym sędzią. Styl, fleksja, brak translationese. DoRA OK.

---

## Gwarancja czystości (wszystkie fazy)
- Każdy przykład (CPT i SFT) **deduplikowany vs `test_atoms.txt` = 17 707 atomów** test-splitów KLEJ.
- Benchmark = **blocklista + miara**, nigdy źródło. Pełny **lineage jawny** na prywatnym HF.
- Provenance: teacher deepseek-v4-pro (MIT), sędzia otwarty Qwen3.5 (Apache). **Zero Anthropic/OpenAI.**

## Korpus regresji (held-out — żeby nie cofać się gdzie indziej)
| wymiar | miara | po co |
|---|---|---|
| PL NLU | **KLEJ test · 5-shot** | główny cel |
| PL czat | MT-Bench-PL | jakość generacji |
| EN retencja | MMLU · ARC-C · GSM8K | czy nie zapomina |
| PL wiedza | **LLMzSzŁ / PES** (held-out) | efekt fazy CPT |
| styl PL | własna sonda ~200 promptów | fleksja, brak myślników/translationese |

**Reguła publikacji:** tylko jeśli **5-shot KLEJ ↑ ORAZ MT-Bench-PL ↑** i EN nie spada. Inaczej = regres.

## Otwarte pytania (feedback → Discord)
1. **CPT: raw vs EntiGraph vs mix?**
2. **CPT: full-FT vs high-rank QLoRA?**
3. **Źródła korpusu wiedzy** — co dorzucić (CCNet-PL, prawo, medycyna, akademickie pod LLMzSzŁ/PES)?
4. **Waga faz** — ile CPT vs SFT vs DPO?
5. **Baza** — Qwen3.5-27B czy linia 11-14B (tańsza)?

🙋 **Zbieramy korpus wiedzy PL** (zwłaszcza akademicki pod LLMzSzŁ, medyczny pod PES). Masz otwarte źródło / dataset? Wrzuć na Discord.
