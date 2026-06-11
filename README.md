# Slayer — open Polish LLM lab

**Teza:** konkurencyjny polski model językowy (11–14B) da się złożyć *super tanio* (~15–20k zł compute), nowoczesnymi metodami, w pełni **otwarcie i odtwarzalnie** — i być o **epsilon lepszym** od punktu odniesienia. Wszystko jawne: od pomiaru po trening, **bez benchmaxxingu**.

🌐 **Na żywo:** [slayer.fabryka.ai](https://slayer.fabryka.ai) · [leaderboard](https://slayer.fabryka.ai/leaderboard) · [pomiar na żywo](https://slayer.fabryka.ai/progress)

> *Bielik-11B-v3 jest tu **punktem odniesienia** (rzetelne porównanie), nie celem ataku. To niezależny, komplementarny lab — więcej prób na bramkę dla całej polskiej sceny AI.*

---

## Aktualny wynik — Bielik-11B-v3 vs Qwen3.5-9B

Pomiar Fazy 0 (baseline). Oba modele: 4-bit GGUF, ollama @ RTX 3090, deterministycznie, mierzone czysto (agregaty, zero inspekcji itemów), wiele seedów.

| Benchmark | Metryka | Bielik-11B-v3 | Qwen3.5-9B | Wynik |
|---|---|---|---|---|
| **LLMzSzŁ** (egz. państwowe PL) | accuracy MCQ | **61.1** | 58.2 | 🟢 Bielik +2.9 |
| PES (medyczny) | accuracy | 48.0 | **52.7** | Qwen +4.7 |
| Belebele (PL) | accuracy MCQ | 86.3 | **89.4** | Qwen +3.1 |
| PoQuAD | trafność (sędzia-LLM) | 80.6 | **82.8** | Qwen +2.2 |
| FLORES-200 (PL↔) | chrF | 53.0 | **55.0** | Qwen +2.0 |
| Belebele (EN) | accuracy MCQ | 92.4 | **94.9** | Qwen +2.5 |
| ARC-Challenge (EN) | accuracy MCQ | 89.2 | **94.1** | Qwen +4.9 |
| MMLU (EN) | accuracy MCQ | 67.2 | **77.1** | Qwen +9.9 |
| GSM8K (EN) | exact match | — | **+34.5** | Qwen +34.5 |

**Stan: Bielik 1 : 8 Qwen3.5-9B** (9 ważnych osi).
*INCLUDE-44 wykluczony — loader poniżej losowego (błąd mapowania gold; do naprawy).*

**Wniosek:** Qwen3.5-9B jest wyraźnie mocniejszy (zwłaszcza rozumowanie EN), a wąsko wygrywa na większości osi polskich. Bielik trzyma jedynie **LLMzSzŁ** (egzaminy państwowe/zawodowe PL) — czyli dokładnie oś naszego targetu urzędniczo-prawniczego. **Decyzja: baza = Qwen3.5-9B + polska specjalizacja.**

---

## Zasada czystości (no benchmaxxing)

- Zbiory **ewaluacyjne** (LLMzSzŁ, PES, PoQuAD, Belebele, FLORES, regresja EN) służą **wyłącznie do pomiaru** — nigdy w treningu.
- Zdolności budujemy na **niezależnych danych**; benchmark tylko weryfikuje uogólnienie na held-out.
- Mierzymy **tylko publiczne, pobieralne, deterministyczne** zbiory. Zamknięte (EQ-Bench, CPTUB, PLCC) — [osobno](https://slayer.fabryka.ai/closed-benchmarks).
- Korpusy treningowe przechodzą dekontaminację względem zbiorów testowych.

## Strategia treningu — tańsza ścieżka vs Bielik

Bielik-11B-v3 (raport techniczny) trenowano pełnym, kosztownym pipeline'em: Mistral 7B → Depth Up-Scaling → **CPT ~1.1T tokenów** → SFT (~20M instrukcji) → DPO/DPO-P (114k) → **GRPO/RLVR** (143k, weryfikatory matma/STEM-MCQ/tool-use). Tokenizera PL **nie rozszerzano**; pary preferencji generowano m.in. **DeepSeek-V3**.

Nasza teza „super tanio + epsilon": **startujemy z Qwen3.5-9B** (bije Bielika 8:1 wg leaderboardu) → **pomijamy najdroższy etap (CPT)** → tani **QLoRA SFT + GRPO/RLVR z weryfikatorem MCQ**, celowany w jedyną oś Bielika (LLMzSzŁ) i prawo/administrację. Generowanie danych: DeepSeek (jak Bielik). Pełna metodyka: [/trening](https://slayer.fabryka.ai/trening).

**Licencja bazy:** Qwen3.5-9B jest na **Apache 2.0** — wolno komercyjnie używać, fine-tunować i otwarcie wydać pochodną (z zachowaniem noty licencyjnej), bez klauzul typu MAU. Kompromis: bazujemy na zagranicznych wagach (mniejsza suwerenność łańcucha niż własna baza Bielika), ale trening/hosting w PL i pełna jawność receptury.

## Reprodukcja

Wymagania: [ollama](https://ollama.com), Python 3.10+, `pip install datasets huggingface_hub sacrebleu`.

```bash
ollama pull qwen3.5:9b
ollama pull hf.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF:Q4_K_M

# pojedynczy benchmark (MCQ): bench <nazwa> <N|0=full> <seed>
python3 bench/bench_mcq.py llmzszl 400 42
python3 bench/bench_poquad.py 1000 42      # PoQuAD + sędzia-LLM
python3 bench/bench_flores.py 600 42       # FLORES (gated — wymaga HF_TOKEN)

# pełna kolejka + dashboard
bash bench/run_all.sh
python3 bench/make_dashboard.py            # -> results/leaderboard.json
```

## Struktura

```
bench/        harness ewaluacyjny (MCQ, PoQuAD+judge, FLORES, GSM8K), orkiestrator, dashboard
results/      wyniki (leaderboard.json, status.json)
*.html        strona (slayer.fabryka.ai) — modularny system: assets/lab.css + assets/site.js
```

## Współpraca

Szukamy ludzi: dane (korpusy prawno-urzędowe), ewaluacje, trening (SFT/DPO/GRPO), infra — oraz firm (use case) i fundatorów compute.

- 📋 [Zadania od początkujących](https://slayer.fabryka.ai/zadania) · 🧪 [Metody treningu](https://slayer.fabryka.ai/trening)
- ✍️ [Dołącz / zapisz się](https://slayer.fabryka.ai/zespol) · [Discord](https://discord.gg/HnTkVR4c5T)

## Licencja

MIT — patrz [LICENSE](LICENSE). Wyniki i metodyka są otwarte.
