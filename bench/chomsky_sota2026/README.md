# Chomsky SOTA 2026 Tokenizer Smoke

Engineering artifact copied from the Chomsky tokenizer prototype.

## Run

From this directory:

```bash
python3 scripts/generate_synthetic_morph_examples.py --count 100
python3 scripts/run_morph_bpe.py --train data/morph_benchmark.json data/synthetic_morph_examples.json
python3 scripts/run_downstream_smoke.py --train data/morph_benchmark.json data/synthetic_morph_examples.json
python3 scripts/run_neural_segmenter.py --epochs 200 --train data/morph_benchmark.json data/synthetic_morph_examples.json
```

If `morfeusz2` is installed, also run:

```bash
python3 scripts/evaluate_morph_segmentation.py
```

## Static Artifacts

Published dashboard data is mirrored under:

```text
public/data/chomsky-sota2026/
```

Synthetic examples are marked with `verified=false`; they are stress data, not manually verified gold.
