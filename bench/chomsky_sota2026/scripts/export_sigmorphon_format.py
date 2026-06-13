from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BENCHMARK = ROOT / "data" / "morph_benchmark.json"
DEFAULT_OUT_DIR = ROOT / "reports" / "sigmorphon_export"


def main() -> None:
    parser = argparse.ArgumentParser(description="Export Polish morpheme benchmark to SIGMORPHON-style TSV files.")
    parser.add_argument("--benchmark", type=Path, default=DEFAULT_BENCHMARK)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    args = parser.parse_args()

    benchmark = json.loads(args.benchmark.read_text(encoding="utf-8"))
    args.out_dir.mkdir(parents=True, exist_ok=True)

    role_free_lines = []
    role_lines = []
    metadata_lines = ["id\tsurface\tcategory\tsplit\tlemma\texpected_morph_tags"]

    for case in benchmark["cases"]:
        surface = case["surface"]
        split = case.get("split", "dev")
        lemma = case.get("lemma", "")
        expected_tags = ",".join(case.get("expected_morph_tags", []))
        pieces = [piece for piece, _ in case["gold"]]
        role_pieces = [f"{piece}|{role}" for piece, role in case["gold"]]

        role_free_lines.append(f"{surface}\t{' @@ '.join(pieces)}")
        role_lines.append(f"{surface}\t{' @@ '.join(role_pieces)}")
        metadata_lines.append(f"{case['id']}\t{surface}\t{case['category']}\t{split}\t{lemma}\t{expected_tags}")

    (args.out_dir / "word_level_gold.tsv").write_text("\n".join(role_free_lines) + "\n", encoding="utf-8")
    (args.out_dir / "word_level_gold_with_roles.tsv").write_text("\n".join(role_lines) + "\n", encoding="utf-8")
    (args.out_dir / "metadata.tsv").write_text("\n".join(metadata_lines) + "\n", encoding="utf-8")

    print(f"wrote {args.out_dir / 'word_level_gold.tsv'}")
    print(f"wrote {args.out_dir / 'word_level_gold_with_roles.tsv'}")
    print(f"wrote {args.out_dir / 'metadata.tsv'}")


if __name__ == "__main__":
    main()
