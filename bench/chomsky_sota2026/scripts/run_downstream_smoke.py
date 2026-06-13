from __future__ import annotations

import argparse
import json
from pathlib import Path

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.sota2026_utils import REPORT_DIR, BigramLM, SimpleBPE, load_gold_words, load_multiple_word_sets


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a cheap downstream smoke test over tokenizer outputs.")
    parser.add_argument("--merges", type=int, default=64)
    parser.add_argument("--train", type=Path, nargs="*", default=None)
    parser.add_argument("--eval", type=Path, default=ROOT / "data" / "morph_benchmark.json")
    parser.add_argument("--out", type=Path, default=REPORT_DIR / "downstream_smoke_results.json")
    args = parser.parse_args()

    train_paths = args.train or [ROOT / "data" / "morph_benchmark.json"]
    train_words = load_multiple_word_sets(train_paths)
    eval_words = load_gold_words(args.eval)

    tokenizers = {
        "standard_bpe_smoke": SimpleBPE.train(train_words, args.merges, respect_boundaries=False),
        "morph_bpe_constrained_smoke": SimpleBPE.train(train_words, args.merges, respect_boundaries=True),
    }

    results = []
    for name, tokenizer in tokenizers.items():
        train_sequences = [tokenizer.encode(word.surface) for word in train_words]
        eval_sequences = [tokenizer.encode(word.surface) for word in eval_words]
        lm = BigramLM()
        lm.fit(train_sequences)
        results.append(
            {
                "system": name,
                "train_words": len(train_words),
                "eval_words": len(eval_words),
                "train_paths": [str(path) for path in train_paths],
                "eval_path": str(args.eval),
                "eval_bigram_perplexity": lm.perplexity(eval_sequences),
                "eval_fertility": sum(len(seq) for seq in eval_sequences) / len(eval_sequences),
                "warning": "Bigram smoke test only. Replace with fixed-budget Polish LM pretraining for publishable downstream proof.",
            }
        )

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps({"results": results}, ensure_ascii=False, indent=2), encoding="utf-8")
    for row in results:
        print(f"{row['system']}: ppl={row['eval_bigram_perplexity']:.3f} fertility={row['eval_fertility']:.3f}")
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
