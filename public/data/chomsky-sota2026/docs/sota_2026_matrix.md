# SOTA 2026 Baseline Matrix

Last checked: 2026-06-14.

This project should start from the 2026 tokenization landscape, not from hand-written segmentation rules.

## Research Axes

There are three different tasks that must not be collapsed into one leaderboard:

1. **Morpheme segmentation**: predict morpheme boundaries for a word.
2. **Morphosyntactic analysis/disambiguation**: identify lemma, POS, morphosyntactic tag, and contextually correct interpretation.
3. **LLM tokenization**: produce a vocabulary and segmentation that improves compression, training dynamics, and downstream quality.

The Polish contribution should be a benchmark and evaluation protocol crossing these axes, not a claim that one rule-based tokenizer is SOTA.

## Current Baselines

| system family | role in this project | why it matters | implementation status |
| --- | --- | --- | --- |
| SIGMORPHON-style neural char seq2seq segmenters | SOTA morpheme segmentation baseline | Strong supervised morpheme segmenters are the real segmentation competition, not Morfessor-era baselines. SIGMORPHON 2022 reports 97.29 average F1 for the best word-level system over 9 languages including Czech and Russian. | Not implemented. Needs train/dev/test export and training adapter. |
| Morfeusz2 | Polish form-analysis baseline | Provides Polish lemma/POS/tag coverage and ambiguity graph, but not morpheme boundaries. | Implemented as analyzer coverage in benchmark runner. |
| Concraft-pl | Polish disambiguation baseline | Contextual disambiguation over Morfeusz analyses; needed for sentence-level gold analysis. | Slot present; not installed locally. |
| MorphBPE | Main morphology-aware BPE baseline | Constrains BPE merges with morpheme boundaries while preserving LLM pipeline compatibility. | Not implemented. Needs adapter around gold boundary data. |
| SKMT-style root-preserving BPE | Closest Slavic precedent | Slovak morphology+BPE template; useful structure for a Polish PMT paper. | Not implemented. |
| Unigram tokenizer | Algorithmic counter-baseline | Recent work argues algorithm choice can matter more than morphological alignment. | Not implemented. |
| tiktoken/cl100k | Production BPE reference | Useful real-world BPE fragmentation baseline. | Implemented. |
| SuperBPE / BoundlessBPE | Compression-oriented counter-baseline | Tests whether compression/superwords beat morphology for downstream efficiency. | Not implemented. |
| Morfessor2 / WordPiece / ULM as segmentation baselines | Historical lower baselines | SIGMORPHON 2022 shows these are dramatically weaker for morpheme segmentation than the best neural systems. They are useful only to show that old statistical segmentation is not enough. | Not implemented; low priority. |

## Non-Negotiable SOTA Point

The current rule-based prototype is not a SOTA morpheme segmenter. It should stay in the benchmark as `polish_morph_current`, a weak and interpretable baseline.

The SOTA segmentation comparison must be against neural, supervised, character-level morpheme segmenters in the SIGMORPHON line. The important 2022 reference point is:

- word-level task: 5 million words, 9 languages, including Czech and Russian,
- 13 systems from 7 teams,
- best system average: 97.29 F1,
- English to Latin range: 93.84 to 99.38 F1,
- sentence-level task: best systems outperform BPE, ULM, and Morfessor2 by 30.71 absolute points.

Implication for this project:

- `-kolwiek`, `-iej`, `-ają` rules are useful as failure labels and sanity checks.
- They are not the research contribution.
- The research contribution is a Polish gold benchmark plus a comparison that includes neural segmenters, Polish analyzers, MorphBPE-style tokenizers, and downstream LLM evidence.

## What To Measure

### Intrinsic Morpheme Segmentation

- boundary precision,
- boundary recall,
- boundary F1,
- exact segmentation as secondary diagnostic,
- per-category breakdown.

### Intrinsic LLM Tokenizer Quality

- fertility: tokens per whitespace word,
- morphological alignment precision,
- morphological alignment recall,
- vocabulary size,
- token frequency balance,
- MorphBPE-style consistency metrics when adapter is implemented.

### Extrinsic LLM Evidence

- held-out Polish perplexity under fixed model/training budget,
- morphosyntactic probe task,
- Open PL LLM Leaderboard-style task subset,
- correlation between intrinsic alignment and downstream score.

## 2026 Research Interpretation

### What Seems Established

- Pure morpheme segmentation SOTA is neural/supervised, especially char-level seq2seq style systems.
- Classical unsupervised/statistical segmentation baselines such as Morfessor-style approaches are not enough for a SOTA claim.
- A rule-based Polish prototype cannot be positioned as SOTA; it is a weak baseline and debugging surface.
- Morphology-aware BPE is an active and credible line because it changes tokenizer training while keeping LLM pipeline compatibility.
- For LLM quality, morphological alignment is only one axis; it must be tested against algorithm choice, compression, vocabulary distribution, and downstream tasks.

### What Is Not Established For Polish

- Whether morphology-aware tokenization improves Polish downstream LLM quality.
- Whether a Polish MorphBPE/SKMT-style tokenizer beats Unigram or compression-oriented tokenizers under the same budget.
- Which Polish morphology categories are most responsible for BPE boundary failures.
- Whether Morfeusz2 + Concraft disambiguation is enough to create reliable boundary constraints without a manually curated morpheme-boundary lexicon.

## Recommended 2026 Experiment

### Phase 1: Gold Benchmark

Build a SIGMORPHON-compatible Polish morpheme-boundary dataset:

- 1,000 locked test forms,
- train/dev split for supervised segmenters,
- lemma-family holdout for allomorphy and suppletion,
- categories listed in `docs/polish_morpheme_benchmark_protocol.md`.

Deliverables:

- `data/morph_benchmark.json`,
- SIGMORPHON-style TSV exports,
- inter-annotator agreement once multiple annotators exist,
- per-category leaderboard.

### Phase 2: Baseline Matrix

Run:

- Morfeusz2 analyzer coverage,
- Concraft-pl disambiguation where installed,
- current weak segmenter,
- neural seq2seq segmenter,
- Morfessor2/WordPiece/ULM only as historical lower baselines if cheap,
- standard BPE,
- Unigram,
- MorphBPE-style BPE,
- SKMT-style root-preserving BPE,
- SuperBPE/BoundlessBPE if available.

Deliverables:

- intrinsic segmentation table,
- tokenizer fertility/alignment table,
- failure taxonomy.

Current runnable smoke commands:

```bash
python3 scripts/generate_synthetic_morph_examples.py --count 100
.venv/bin/python scripts/run_morph_bpe.py --train data/morph_benchmark.json data/synthetic_morph_examples.json
python3 scripts/run_neural_segmenter.py --train data/morph_benchmark.json data/synthetic_morph_examples.json
```

The neural and MorphBPE scripts are smoke implementations for validating the research pipeline. They are not claimed as final SOTA systems.

### Phase 3: Downstream Check

Train small Polish LMs or adapters with identical budget:

- standard BPE,
- Unigram,
- Polish MorphBPE,
- compression-oriented BPE.

Report:

- training tokens and wall-clock,
- validation perplexity,
- Polish morphosyntactic probe,
- Open PL-style task score,
- relation between alignment and downstream quality.

Current runnable downstream smoke:

```bash
.venv/bin/python scripts/run_downstream_smoke.py --train data/morph_benchmark.json data/synthetic_morph_examples.json
```

This uses a cheap bigram LM as a wiring check. The publishable version must replace it with fixed-budget Polish LM training.

## Claim Discipline

Safe claim now:

> We are building a Polish benchmark and protocol to test whether morphology-aware tokenization helps Polish LLMs.

Unsafe claim now:

> A Polish morphological tokenizer is SOTA for Polish LLMs.

Target claim after experiments:

> Under fixed training conditions, Polish morphology-aware BPE improves or does not improve downstream Polish LLM quality relative to standard BPE, Unigram, and compression-oriented tokenizers; the benchmark identifies which morphology categories drive the result.

## Source Pointers

- SIGMORPHON ACL Anthology index: https://aclanthology.org/sigs/sigmorphon/
- SIGMORPHON 2022 Shared Task on Morpheme Segmentation: https://aclanthology.org/2022.sigmorphon-1.11/
- MorphBPE: https://openreview.net/forum?id=d8WDMqDdky and https://arxiv.org/abs/2502.00894
- Rethinking Tokenization for Rich Morphology: https://aclanthology.org/2025.ijcnlp-srw.20/ and https://arxiv.org/abs/2508.08424
- MorphScore 70 languages: https://arxiv.org/abs/2507.06378
- SKMT / Slovak Morphological Tokenizer: https://pmc.ncbi.nlm.nih.gov/articles/PMC11622830/
- SuperBPE: https://superbpe.github.io/
- Faster Superword Tokenization / BoundlessBPE and SuperBPE: https://arxiv.org/abs/2604.05192
- Morfeusz2: https://morfeusz.sgjp.pl/doc/about/en
- Concraft-pl: https://zil.ipipan.waw.pl/Concraft
