from __future__ import annotations

import argparse
import json
from pathlib import Path

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.sota2026_utils import REPORT_DIR, SimpleBPE, evaluate_piece_tokenizer, load_gold_words, load_multiple_word_sets


def render_report(results: list[dict]) -> str:
    lines = [
        "# MorphBPE/SKMT-Style Tokenizer Smoke",
        "",
        "This is a constrained-BPE pipeline check on the current tiny Polish gold set, not a final tokenizer result.",
        "",
        "| system | cases | boundary F1 | fertility | align P | align R |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for result in results:
        s = result["summary"]
        lines.append(
            f"| {result['system']} | {s['cases']} | {s['boundary_f1']:.3f} | {s['fertility']:.3f} | {s['alignment_precision']:.3f} | {s['alignment_recall']:.3f} |"
        )

    lines.extend(["", "## Failures", ""])
    for result in results:
        lines.extend([f"### {result['system']}", ""])
        for row in result["rows"]:
            if row["boundary_f1"] < 1:
                lines.append(f"- `{row['surface']}` gold=`{' @@ '.join(row['gold'])}` pred=`{' @@ '.join(row['predicted'])}`")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train standard BPE vs MorphBPE-style constrained BPE on gold morpheme boundaries.")
    parser.add_argument("--merges", type=int, default=64)
    parser.add_argument("--train", type=Path, nargs="*", default=None)
    parser.add_argument("--eval", type=Path, default=ROOT / "data" / "morph_benchmark.json")
    parser.add_argument("--json-out", type=Path, default=REPORT_DIR / "morph_bpe_results.json")
    parser.add_argument("--md-out", type=Path, default=REPORT_DIR / "morph_bpe_report.md")
    args = parser.parse_args()

    train_paths = args.train or [ROOT / "data" / "morph_benchmark.json"]
    train_words = load_multiple_word_sets(train_paths)
    eval_words = load_gold_words(args.eval)
    standard = SimpleBPE.train(train_words, num_merges=args.merges, respect_boundaries=False)
    morph = SimpleBPE.train(train_words, num_merges=args.merges, respect_boundaries=True)

    results = [
        evaluate_piece_tokenizer("standard_bpe_smoke", eval_words, standard.encode),
        evaluate_piece_tokenizer("morph_bpe_constrained_smoke", eval_words, morph.encode),
    ]

    payload = {
        "warning": "Smoke run on current gold set. Full MorphBPE/SKMT needs corpus-scale training and downstream LLM evaluation.",
        "train_paths": [str(path) for path in train_paths],
        "eval_path": str(args.eval),
        "merges": {
            "standard_bpe": standard.merges,
            "morph_bpe": morph.merges,
        },
        "results": results,
    }
    args.json_out.parent.mkdir(parents=True, exist_ok=True)
    args.json_out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    args.md_out.write_text(render_report(results), encoding="utf-8")

    for result in results:
        s = result["summary"]
        print(f"{result['system']}: boundary_f1={s['boundary_f1']:.3f} fertility={s['fertility']:.3f} align_p={s['alignment_precision']:.3f}")
    print(f"wrote {args.md_out}")
    print(f"wrote {args.json_out}")


if __name__ == "__main__":
    main()
