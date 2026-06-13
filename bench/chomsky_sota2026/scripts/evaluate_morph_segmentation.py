from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from polish_morph_tokenizer import MorphToken, PolishMorphTokenizer
from polish_phoneme_tokenizer import phoneme_syllable_tokens


BENCHMARK_PATH = ROOT / "data" / "morph_benchmark.json"
REPORT_DIR = ROOT / "reports"


@dataclass(frozen=True)
class Prediction:
    tokens: tuple[MorphToken, ...]
    source: str
    fallback: bool


def boundaries(tokens: Iterable[MorphToken]) -> set[int]:
    offsets = []
    cursor = 0
    token_list = list(tokens)
    for token in token_list[:-1]:
        cursor += len(token.text)
        offsets.append(cursor)
    return set(offsets)


def byte_boundaries(tokens: Iterable[MorphToken]) -> set[int]:
    offsets = []
    cursor = 0
    token_list = list(tokens)
    for token in token_list[:-1]:
        cursor += len(token.text.encode("utf-8"))
        offsets.append(cursor)
    return set(offsets)


def f1(predicted: set[int], gold: set[int]) -> tuple[float, float, float]:
    if not predicted and not gold:
        return 1.0, 1.0, 1.0
    true_positive = len(predicted & gold)
    precision = true_positive / len(predicted) if predicted else 0.0
    recall = true_positive / len(gold) if gold else 0.0
    score = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, score


def alignment(predicted: set[int], gold: set[int]) -> tuple[float, float]:
    if not predicted and not gold:
        return 1.0, 1.0
    precision = len(predicted & gold) / len(predicted) if predicted else 0.0
    recall = len(predicted & gold) / len(gold) if gold else 0.0
    return precision, recall


def exact_tokens(tokens: Iterable[MorphToken]) -> list[list[str]]:
    return [[token.text, token.role] for token in tokens]


def evaluate_system(name: str, cases: list[dict], predictor) -> dict:
    rows = []
    category_scores = defaultdict(list)
    source_counts = Counter()
    fallback_count = 0

    for case in cases:
        gold_tokens = tuple(MorphToken(text, role) for text, role in case["gold"])
        prediction = predictor(case["surface"])
        predicted_tokens = prediction.tokens
        predicted_boundary = boundaries(predicted_tokens)
        gold_boundary = boundaries(gold_tokens)
        precision, recall, boundary_f1 = f1(predicted_boundary, gold_boundary)
        alignment_precision, alignment_recall = alignment(byte_boundaries(predicted_tokens), byte_boundaries(gold_tokens))
        segment_exact = [token.text for token in predicted_tokens] == [token.text for token in gold_tokens]
        role_exact = exact_tokens(predicted_tokens) == exact_tokens(gold_tokens)
        row = {
            "id": case["id"],
            "category": case["category"],
            "surface": case["surface"],
            "gold": exact_tokens(gold_tokens),
            "predicted": exact_tokens(predicted_tokens),
            "source": prediction.source,
            "fallback": prediction.fallback,
            "boundary_precision": precision,
            "boundary_recall": recall,
            "boundary_f1": boundary_f1,
            "fertility": len(predicted_tokens),
            "morph_alignment_precision": alignment_precision,
            "morph_alignment_recall": alignment_recall,
            "segment_exact": segment_exact,
            "role_exact": role_exact,
        }
        rows.append(row)
        category_scores[case["category"]].append(row)
        source_counts[prediction.source] += 1
        fallback_count += int(prediction.fallback)

    def avg(items: list[float]) -> float:
        return sum(items) / len(items) if items else 0.0

    categories = {}
    for category, category_rows in sorted(category_scores.items()):
        categories[category] = {
            "cases": len(category_rows),
            "boundary_f1": avg([row["boundary_f1"] for row in category_rows]),
            "fertility": avg([row["fertility"] for row in category_rows]),
            "morph_alignment_precision": avg([row["morph_alignment_precision"] for row in category_rows]),
            "morph_alignment_recall": avg([row["morph_alignment_recall"] for row in category_rows]),
            "segment_exact": avg([float(row["segment_exact"]) for row in category_rows]),
            "role_exact": avg([float(row["role_exact"]) for row in category_rows]),
            "fallback_rate": avg([float(row["fallback"]) for row in category_rows]),
        }

    return {
        "system": name,
        "summary": {
            "cases": len(rows),
            "boundary_f1": avg([row["boundary_f1"] for row in rows]),
            "fertility": avg([row["fertility"] for row in rows]),
            "morph_alignment_precision": avg([row["morph_alignment_precision"] for row in rows]),
            "morph_alignment_recall": avg([row["morph_alignment_recall"] for row in rows]),
            "segment_exact": avg([float(row["segment_exact"]) for row in rows]),
            "role_exact": avg([float(row["role_exact"]) for row in rows]),
            "fallback_rate": fallback_count / len(rows) if rows else 0.0,
            "sources": dict(source_counts),
        },
        "categories": categories,
        "rows": rows,
    }


def render_markdown(results: list[dict], benchmark: dict) -> str:
    lines = [
        f"# {benchmark['name']} v{benchmark['version']}",
        "",
        benchmark["description"],
        "",
        "## Summary",
        "",
        "| system | cases | boundary F1 | fertility | morph alignment P | morph alignment R | fallback |",
        "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for result in results:
        summary = result["summary"]
        lines.append(
            "| {system} | {cases} | {boundary_f1:.3f} | {fertility:.3f} | {morph_alignment_precision:.3f} | {morph_alignment_recall:.3f} | {fallback_rate:.3f} |".format(
                system=result["system"],
                **summary,
            )
        )

    lines.extend(
        [
            "",
            "## Diagnostics",
            "",
            "| system | exact segments | exact roles | source distribution |",
            "| --- | ---: | ---: | --- |",
        ]
    )
    for result in results:
        summary = result["summary"]
        lines.append(
            "| {system} | {segment_exact:.3f} | {role_exact:.3f} | `{sources}` |".format(
                system=result["system"],
                **summary,
            )
        )

    analyzers = benchmark.get("analyzers", [])
    if analyzers:
        lines.extend(
            [
                "",
                "## Analyzer Coverage",
                "",
                "| analyzer | status | recognized | expected tag match | note |",
                "| --- | --- | ---: | ---: | --- |",
            ]
        )
        for analyzer in analyzers:
            lines.append(
                "| {name} | {status} | {recognized_rate:.3f} | {expected_tag_rate:.3f} | {note} |".format(
                    **analyzer
                )
            )

    lines.extend(["", "## Category Breakdown", ""])
    for result in results:
        lines.extend([f"### {result['system']}", ""])
        lines.append("| category | cases | boundary F1 | fertility | align P | align R | exact roles | fallback |")
        lines.append("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
        for category, metrics in result["categories"].items():
            lines.append(
                "| {category} | {cases} | {boundary_f1:.3f} | {fertility:.3f} | {morph_alignment_precision:.3f} | {morph_alignment_recall:.3f} | {role_exact:.3f} | {fallback_rate:.3f} |".format(
                    category=category,
                    **metrics,
                )
            )
        lines.append("")

    lines.extend(["## Failures", ""])
    for result in results:
        lines.extend([f"### {result['system']}", ""])
        failures = [row for row in result["rows"] if not row["role_exact"]]
        if not failures:
            lines.append("No role-level failures.")
            lines.append("")
            continue
        for row in failures:
            lines.append(f"- `{row['surface']}` ({row['category']}, {row['source']}):")
            lines.append(f"  - gold: `{format_tokens(row['gold'])}`")
            lines.append(f"  - pred: `{format_tokens(row['predicted'])}`")
        lines.append("")

    return "\n".join(lines)


def format_tokens(tokens: list[list[str]]) -> str:
    return " ".join(f"{text}|{role}" for text, role in tokens)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--benchmark", type=Path, default=BENCHMARK_PATH)
    parser.add_argument("--json-out", type=Path, default=REPORT_DIR / "morph_benchmark_results.json")
    parser.add_argument("--md-out", type=Path, default=REPORT_DIR / "morph_benchmark_report.md")
    args = parser.parse_args()

    benchmark = json.loads(args.benchmark.read_text(encoding="utf-8"))
    cases = benchmark["cases"]
    tokenizer = PolishMorphTokenizer()

    def current_predictor(surface: str) -> Prediction:
        analysis = tokenizer.analyze_word(surface)
        return Prediction(analysis.tokens, analysis.source, analysis.fallback)

    def phoneme_predictor(surface: str) -> Prediction:
        return Prediction(
            tuple(MorphToken(token, "PHON_FALLBACK") for token in phoneme_syllable_tokens(surface)),
            "phoneme_syllable",
            True,
        )

    results = [
        evaluate_system("polish_morph_current", cases, current_predictor),
        evaluate_system("phoneme_syllable_baseline", cases, phoneme_predictor),
    ]
    try:
        import tiktoken
    except Exception:
        tiktoken = None

    if tiktoken:
        encoder = tiktoken.get_encoding("cl100k_base")

        def tiktoken_predictor(surface: str) -> Prediction:
            token_bytes = encoder.decode_tokens_bytes(encoder.encode(surface))
            return Prediction(
                tuple(MorphToken(piece.decode("utf-8", errors="replace"), "BPE") for piece in token_bytes),
                "tiktoken_cl100k",
                False,
            )

        results.append(evaluate_system("tiktoken_cl100k", cases, tiktoken_predictor))

    analyzer_results = [evaluate_morfeusz(cases), missing_analyzer("concraft-pl", "not installed in this environment")]
    benchmark_with_analyzers = {**benchmark, "analyzers": analyzer_results}

    args.json_out.parent.mkdir(parents=True, exist_ok=True)
    args.json_out.write_text(
        json.dumps({"benchmark": benchmark, "analyzers": analyzer_results, "results": results}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    args.md_out.write_text(render_markdown(results, benchmark_with_analyzers), encoding="utf-8")

    for result in results:
        summary = result["summary"]
        print(
            "{system}: boundary_f1={boundary_f1:.3f} fertility={fertility:.3f} align_p={morph_alignment_precision:.3f} align_r={morph_alignment_recall:.3f}".format(
                system=result["system"],
                **summary,
            )
        )
    print(f"wrote {args.md_out}")
    print(f"wrote {args.json_out}")


def missing_analyzer(name: str, note: str) -> dict:
    return {
        "name": name,
        "status": "missing",
        "recognized_rate": 0.0,
        "expected_tag_rate": 0.0,
        "note": note,
    }


def evaluate_morfeusz(cases: list[dict]) -> dict:
    try:
        import morfeusz2
    except Exception:
        return missing_analyzer("morfeusz2", "not installed for this Python interpreter")

    analyzer = morfeusz2.Morfeusz()
    recognized = 0
    expected_tag = 0
    for case in cases:
        rows = analyzer.analyse(case["surface"])
        tags = [interp[2] for _, _, interp in rows]
        if any(tag != "ign" for tag in tags):
            recognized += 1
        expected = case.get("expected_morph_tags", [])
        if expected and any(any(tag.startswith(prefix) for prefix in expected) for tag in tags):
            expected_tag += 1

    total = len(cases) or 1
    return {
        "name": "morfeusz2",
        "status": "available",
        "recognized_rate": recognized / total,
        "expected_tag_rate": expected_tag / total,
        "note": "form analyzer baseline; does not provide morpheme boundaries",
    }


if __name__ == "__main__":
    main()
