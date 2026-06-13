from __future__ import annotations

import subprocess
import sys
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run(args: list[str]) -> None:
    print("$", " ".join(args))
    subprocess.run(args, cwd=ROOT, check=True)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Run the local SOTA 2026 smoke pipeline.")
    parser.add_argument("--neural-python", default=shutil.which("python3") or sys.executable)
    args = parser.parse_args()

    py = sys.executable
    run([py, "scripts/generate_synthetic_morph_examples.py", "--count", "100"])
    train_paths = ["data/morph_benchmark.json", "data/synthetic_morph_examples.json"]
    run([py, "scripts/export_sigmorphon_format.py"])
    run([py, "scripts/evaluate_morph_segmentation.py"])
    run([py, "scripts/run_morph_bpe.py", "--train", *train_paths])
    run([py, "scripts/run_downstream_smoke.py", "--train", *train_paths])
    run([args.neural_python, "scripts/run_neural_segmenter.py", "--epochs", "200", "--train", *train_paths])


if __name__ == "__main__":
    main()
