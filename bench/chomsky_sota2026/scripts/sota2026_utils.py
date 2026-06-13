from __future__ import annotations

import json
import math
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BENCHMARK_PATH = ROOT / "data" / "morph_benchmark.json"
REPORT_DIR = ROOT / "reports"


@dataclass(frozen=True)
class SegmentedWord:
    surface: str
    pieces: tuple[str, ...]
    category: str = ""

    @property
    def boundary_offsets(self) -> set[int]:
        offsets = set()
        cursor = 0
        for piece in self.pieces[:-1]:
            cursor += len(piece)
            offsets.add(cursor)
        return offsets


def load_gold_words(path: Path = BENCHMARK_PATH) -> list[SegmentedWord]:
    benchmark = json.loads(path.read_text(encoding="utf-8"))
    return [
        SegmentedWord(
            surface=case["surface"],
            pieces=tuple(piece for piece, _ in case["gold"]),
            category=case["category"],
        )
        for case in benchmark["cases"]
    ]


def load_multiple_word_sets(paths: list[Path]) -> list[SegmentedWord]:
    words: list[SegmentedWord] = []
    for path in paths:
        words.extend(load_gold_words(path))
    return words


def boundary_prf(predicted: set[int], gold: set[int]) -> tuple[float, float, float]:
    if not predicted and not gold:
        return 1.0, 1.0, 1.0
    tp = len(predicted & gold)
    precision = tp / len(predicted) if predicted else 0.0
    recall = tp / len(gold) if gold else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, f1


def pieces_to_boundaries(pieces: list[str] | tuple[str, ...]) -> set[int]:
    offsets = set()
    cursor = 0
    for piece in pieces[:-1]:
        cursor += len(piece)
        offsets.add(cursor)
    return offsets


def avg(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


@dataclass
class BPESymbol:
    text: str
    start: int
    end: int


class SimpleBPE:
    def __init__(self, merges: list[tuple[str, str]], name: str) -> None:
        self.merges = merges
        self.name = name

    @staticmethod
    def train(words: list[SegmentedWord], num_merges: int, respect_boundaries: bool) -> "SimpleBPE":
        sequences = []
        for word in words:
            boundary_offsets = word.boundary_offsets
            seq = [BPESymbol(ch, idx, idx + 1) for idx, ch in enumerate(word.surface)]
            sequences.append((seq, boundary_offsets))

        merges: list[tuple[str, str]] = []
        for _ in range(num_merges):
            counts: Counter[tuple[str, str]] = Counter()
            for seq, boundary_offsets in sequences:
                for left, right in zip(seq, seq[1:]):
                    if respect_boundaries and any(left.start < boundary < right.end for boundary in boundary_offsets):
                        continue
                    counts[(left.text, right.text)] += 1
            if not counts:
                break
            pair, _ = counts.most_common(1)[0]
            merges.append(pair)
            sequences = [(merge_sequence(seq, pair), boundary_offsets) for seq, boundary_offsets in sequences]

        return SimpleBPE(merges, "morph_bpe" if respect_boundaries else "standard_bpe")

    def encode(self, word: str) -> list[str]:
        seq = [BPESymbol(ch, idx, idx + 1) for idx, ch in enumerate(word)]
        for pair in self.merges:
            seq = merge_sequence(seq, pair)
        return [symbol.text for symbol in seq]


def merge_sequence(seq: list[BPESymbol], pair: tuple[str, str]) -> list[BPESymbol]:
    merged = []
    idx = 0
    while idx < len(seq):
        if idx + 1 < len(seq) and (seq[idx].text, seq[idx + 1].text) == pair:
            merged.append(BPESymbol(seq[idx].text + seq[idx + 1].text, seq[idx].start, seq[idx + 1].end))
            idx += 2
        else:
            merged.append(seq[idx])
            idx += 1
    return merged


def evaluate_piece_tokenizer(name: str, words: list[SegmentedWord], encode) -> dict:
    rows = []
    for word in words:
        pieces = encode(word.surface)
        pred_boundaries = pieces_to_boundaries(pieces)
        gold_boundaries = word.boundary_offsets
        precision, recall, f1 = boundary_prf(pred_boundaries, gold_boundaries)
        rows.append(
            {
                "surface": word.surface,
                "category": word.category,
                "gold": list(word.pieces),
                "predicted": pieces,
                "boundary_precision": precision,
                "boundary_recall": recall,
                "boundary_f1": f1,
                "fertility": len(pieces),
                "alignment_precision": precision,
                "alignment_recall": recall,
            }
        )

    category_rows: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        category_rows[row["category"]].append(row)

    return {
        "system": name,
        "summary": {
            "cases": len(rows),
            "boundary_f1": avg([row["boundary_f1"] for row in rows]),
            "fertility": avg([row["fertility"] for row in rows]),
            "alignment_precision": avg([row["alignment_precision"] for row in rows]),
            "alignment_recall": avg([row["alignment_recall"] for row in rows]),
        },
        "categories": {
            category: {
                "cases": len(items),
                "boundary_f1": avg([row["boundary_f1"] for row in items]),
                "fertility": avg([row["fertility"] for row in items]),
                "alignment_precision": avg([row["alignment_precision"] for row in items]),
                "alignment_recall": avg([row["alignment_recall"] for row in items]),
            }
            for category, items in sorted(category_rows.items())
        },
        "rows": rows,
    }


class BigramLM:
    def __init__(self) -> None:
        self.unigram: Counter[str] = Counter()
        self.bigram: Counter[tuple[str, str]] = Counter()
        self.vocab: set[str] = set()

    def fit(self, sequences: list[list[str]]) -> None:
        for sequence in sequences:
            tokens = ["<s>", *sequence, "</s>"]
            self.vocab.update(tokens)
            self.unigram.update(tokens[:-1])
            self.bigram.update(zip(tokens, tokens[1:]))

    def perplexity(self, sequences: list[list[str]]) -> float:
        vocab_size = max(1, len(self.vocab))
        nll = 0.0
        count = 0
        for sequence in sequences:
            tokens = ["<s>", *sequence, "</s>"]
            for left, right in zip(tokens, tokens[1:]):
                prob = (self.bigram[(left, right)] + 1) / (self.unigram[left] + vocab_size)
                nll -= math.log(prob)
                count += 1
        return math.exp(nll / count) if count else float("inf")
