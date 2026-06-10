# Slayer v3 — Scenariusz: destylacja + wiedza z podręczników (CZYSTO)

Cel: **wychodzić dobrze na KLEJ bez dotykania train/test KLEJ** — ucząc się na czymś, co **generalizuje**.
Dwa niezależne silniki danych, oba z twardą gwarancją anty-kontaminacji (dedup vs `runs/test_atoms.txt`).

## Zasada nadrzędna
KLEJ (i każdy benchmark) jest **wyłącznie blocklistą i miarą**, nigdy źródłem treningu.
`make_test_atoms.py` → 17707 atomów test → każdy wygenerowany przykład, który je zawiera, **wypada**.

---

## SILNIK 1 — Destylacja zdolności z większego modelu
**Co:** teacher (deepseek-v4-pro, MIT, OpenRouter) **wymyśla od zera** różnorodne przykłady PL ucząc
*umiejętności* stojących za zadaniami KLEJ — w NATURALNYM, zmiennym formacie (nie szablonie KLEJ).
**Skrypt:** `bench/gen_distill_pl.py` (gotowy). Pokrywa: sentyment, temat, parafraza, NLI, QA-poprawność,
rozumienie tekstu, toksyczność, NER, ocena recenzji + ogólne instrukcje (anti-forgetting).

**Dlaczego generalizuje:** model uczy się *jak* oceniać sentyment / wnioskować / rozumieć tekst po polsku
na tysiącach różnych treści. Na leaderboardzie (5-shot) dostaje 5 przykładów zadania i stosuje zdolność —
której nauczył się ogólnie, nie z tego konkretnego zbioru. To legalny transfer, nie benchmaxxing.

**Wzmocnienie (on-policy, opcjonalne):** sędzia = otwarty Qwen3.5 ocenia jakość, odrzuca słabe; później
DPO na parach z naszego modelu ocenianych sędzią.

---

## SILNIK 2 — Wiedza z podręczników (knowledge injection, EntiGraph-style)
**Po co osobno:** sama destylacja uczy *zdolności*, ale część KLEJ (dyk = poprawność faktów, belebele =
rozumienie, a dalej PES/LLMzSzŁ) wymaga **WIEDZY o świecie i o Polsce**. Wiedzy nie wstrzykniesz
kilkoma przykładami — trzeba "przeczytać" materiał i wygenerować z niego dużo wariantów.

**Metoda (tania, działa — EntiGraph / synthetic CPT):**
1. Bierzesz dokument źródłowy (podręcznik / artykuł).
2. Wyciągasz **encje** (osoby, pojęcia, daty, zależności).
3. Teacher generuje **dużo różnorodnego tekstu syntetycznego** łączącego te encje: pytania+odpowiedzi,
   wyjaśnienia, streszczenia, "dlaczego/jak", powiązania między pojęciami.
4. Trenujesz SFT na tym (nie na surowym podręczniku) — wiedza "rozlewa się" na wiele sformułowań,
   więc model ją przyswaja, a nie zapamiętuje dosłownie.

**Otwarte polskie źródła wiedzy (czyste licencyjnie):**
| źródło | co | licencja |
|---|---|---|
| **Wolne Lektury** | literatura, lektury szkolne | public domain / CC |
| **Wikipedia PL / Wikibooks / Wikisource** | encyklopedia, podręczniki | CC-BY-SA |
| **ZPE (zpe.gov.pl)** | rządowe materiały szkolne | otwarte / gov |
| **Open-access akademickie** | skrypty, wykłady | różne (sprawdzać) |
| **NKJP (próbka)** | korpus języka | do języka, nie wiedzy |

Filtr: każdy syntetyczny przykład **dedup vs `test_atoms.txt`** (gdyby źródło przypadkiem pokryło się z
fragmentem testu KLEJ/belebele — wypada).

**Skrypt bazowy:** `bench/entigraph_augment.py` (jest szkielet z wcześniejszego tracku) — do podpięcia
źródeł podręcznikowych + teachera.

---

## Miks v3 (po zbudowaniu obu silników)
| warstwa | udział | źródło |
|---|---|---|
| Destylacja zdolności | ~45% | `gen_distill_pl.py` |
| Wiedza z podręczników | ~20% | `entigraph_augment.py` + otwarte PL |
| Ludzkie PL | ~10% | Aya-PL + OASST-PL + re-judged style |
| EN retencja | ~20% | Tulu 3 / Dolci (odc-by) |
| DPO | ~5% / koniec | on-policy, sędzia |

Wszystko przez `build_mix.py` → **dedup vs test** → trening → eval **tylko held-out** → claim na
**oficjalnym 5-shot leaderboardzie + MT-Bench-PL**.

## Kolejność (nie trenujemy jeszcze!)
1. ✅ `test_atoms.txt` (17707) — gwarancja czystości gotowa.
2. ✅ `gen_distill_pl.py` — harness zdolności gotowy (smoke przed skalą).
3. ⏭ Silnik 2: podłączyć Wolne Lektury / Wiki PL do `entigraph_augment.py`.
4. ⏭ Warstwa 2/3: pobrać Aya-PL/OASST-PL + sample Tulu/Dolci.
5. ⏭ Pierwszy czysty run v3 → leaderboard 5-shot (dopiero to jest claim).
