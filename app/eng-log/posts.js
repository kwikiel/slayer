// Engineer's log — notatki z treningu Slayera.
// Nowy wpis = nowy obiekt na POCZĄTKU tablicy. Body w markdown-lite:
// "## " nagłówek, "- " lista, ``` blok kodu, **bold**, `code`, [tekst](url), puste linie dzielą akapity.

export const POSTS = [
  {
    slug: "munin-nie-zrobil-cpt",
    date: "2026-06-13",
    title: "Munin 1.0 nie zrobił CPT. Receptura wyciekła w nazwie katalogu",
    tags: ["recon", "post-training", "CPT", "qwen3.5"],
    lead:
      "Danish Foundation Models wypuścili Munina na Qwen3.5-9B-Base, czyli na bazie z tej samej rodziny, w którą celuje nasz plan CPT. Release note nie zdradza nic. Ale w repo modelu leży plik prime_rl_finalized.json, a w nim pełna ścieżka runu treningowego. Nazwa katalogu to cała receptura.",
    body: `
## Co znaleźliśmy

W repo \`danish-foundation-models/munin-qwen3.5-9B\` na HF leży plik \`prime_rl_finalized.json\` z polem \`source_step_dir\`:

\`\`\`
qwen3_5-9b-base-official-apertus-wildchat-ifbench-when2call-agentic-code-danish-v1
-4n-prime-cp1-ac-fla-bs64-mbs1-lr1e4-warmup50-steps1521
\`\`\`

Rozbiór tej nazwy mówi więcej niż release note:

- **Munin 1.0 to NIE jest CPT.** Katalog \`post/outputs\`, framework prime-rl, 1521 kroków przy batchu 64 to około 97k przykładów, rzędu 0.3-0.8B tokenów. Czysty, krótki post-training (SFT) na **Qwen3.5-9B-Base**. CPT na korpusie DynaWord robili tylko w paperze, na modelach 1B.
- **Chat template zbudowali sami na bazie** (w repo: \`tokenizer_build_manifest.json\`, \`chat_template.jinja\`, EOS \`<|im_end|>\`). Nie wzięli instructa Qwena.
- **Mix SFT wprost z nazwy runu:** apertus (otwarte dane instrukcyjne Swiss AI) + wildchat + ifbench (instruction following) + when2call (tool calling) + agentic-code + danish-v1 (ich warstwa narodowa).
- **Hiperparametry:** 4 nody (LUMI), bs 64, mbs 1, LR 1e-4, warmup 50, 1521 kroków.
- Smaczek operacyjny: \`dropped_extra_tensors: 333\`, czyli wycinanie wieży multimodalnej z Qwen3.5. Ta sama klasa zabaw co nasze łatanie GGUF (blk.64 / nextn).

## Ile za to zapłacili

Wyniki vs goła baza (EuroEval, z ich pełnego raportu):

- duński: NLI **+11.8**, knowledge +1.7, reading comprehension +1.1
- duński w dół: word-in-context −4.5, instruction following −3.7, common sense −2.4
- angielski: **MMLU-Pro −19.8** (80.6 → 60.9), RULER 32k −12.6, GSM8K −2.6

Zysk narodowy jest realny, ale replay (apertus + wildchat + code) nie uratował trudnych zdolności ogólnych. Przy LR 1e-4 na pełnym SFT wygląda to na przepalenie.

## Co z tego bierzemy dla Slayera

1. **Walidacja sekwencji SFT-first.** Narodowy projekt z superkomputerem pod ręką też zaczął od post-trainingu na mocnej bazie, nie od drogiego CPT. Nasza kolejność v3 (styl SFT teraz, CPT wiedzy jako następna faza) dostała zewnętrzne potwierdzenie.
2. **LR ma znaczenie.** Ich 1e-4 kosztowało 20 punktów MMLU-Pro. Nasz QLoRA z niższym efektywnym LR jest z natury łagodniejszy, ale bramka en-regression zostaje obowiązkowa przy każdym runie.
3. **Brakuje nam checku long-context.** RULER 32k −12.6 to kategoria regresji, której w ogóle nie mierzymy. Do dodania przy v3.
4. **Lista mixów retention do podejrzenia:** apertus-SFT, wildchat, ifbench, when2call, agentic-code. Tool calling w mixie narodowego modelu to też sygnał, czego oczekuje rynek.

## Źródła

[munin-qwen3.5-9B](https://huggingface.co/danish-foundation-models/munin-qwen3.5-9B) · [release note](https://foundationmodels.dk/news/2026/06/11/munin-10-release-note.html) · [pełne wyniki](https://foundationmodels.dk/news/results/munin-10-full-results.html) · [prime-rl](https://github.com/PrimeIntellect-ai/prime-rl) · [Dynaword paper](https://arxiv.org/pdf/2508.02271)
`,
  },
];
