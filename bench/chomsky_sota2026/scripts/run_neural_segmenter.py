from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.sota2026_utils import REPORT_DIR, boundary_prf, load_gold_words, load_multiple_word_sets


def require_torch():
    try:
        import torch
        from torch import nn
    except Exception as exc:  # pragma: no cover - optional dependency
        raise SystemExit("PyTorch is required for neural segmenter training.") from exc
    return torch, nn


class BoundaryTagger:
    def __init__(self, chars: list[str], hidden_size: int = 48) -> None:
        torch, nn = require_torch()
        self.torch = torch
        self.nn = nn
        self.char_to_id = {ch: idx + 1 for idx, ch in enumerate(chars)}
        self.id_to_char = {idx: ch for ch, idx in self.char_to_id.items()}
        self.model = nn.Sequential()
        self.embedding = nn.Embedding(len(self.char_to_id) + 1, hidden_size)
        self.encoder = nn.LSTM(hidden_size, hidden_size, batch_first=True, bidirectional=True)
        self.classifier = nn.Linear(hidden_size * 2, 1)

    def parameters(self):
        return list(self.embedding.parameters()) + list(self.encoder.parameters()) + list(self.classifier.parameters())

    def encode_word(self, word: str):
        ids = [self.char_to_id.get(ch, 0) for ch in word]
        return self.torch.tensor(ids, dtype=self.torch.long).unsqueeze(0)

    def logits(self, word: str):
        ids = self.encode_word(word)
        emb = self.embedding(ids)
        encoded, _ = self.encoder(emb)
        return self.classifier(encoded).squeeze(0).squeeze(-1)

    def predict_boundaries(self, word: str) -> set[int]:
        self.embedding.eval()
        self.encoder.eval()
        self.classifier.eval()
        with self.torch.no_grad():
            probs = self.torch.sigmoid(self.logits(word))
        return {idx + 1 for idx, prob in enumerate(probs[:-1]) if float(prob) >= 0.5}


def labels_for(word: str, boundaries: set[int], torch):
    return torch.tensor([1.0 if idx + 1 in boundaries else 0.0 for idx in range(len(word))], dtype=torch.float32)


def split_word(word: str, boundaries: set[int]) -> list[str]:
    pieces = []
    start = 0
    for boundary in sorted(boundaries):
        pieces.append(word[start:boundary])
        start = boundary
    pieces.append(word[start:])
    return [piece for piece in pieces if piece]


def main() -> None:
    parser = argparse.ArgumentParser(description="Train a small SIGMORPHON-style neural char boundary tagger.")
    parser.add_argument("--epochs", type=int, default=400)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--train", type=Path, nargs="*", default=None)
    parser.add_argument("--eval", type=Path, default=ROOT / "data" / "morph_benchmark.json")
    parser.add_argument("--out", type=Path, default=REPORT_DIR / "neural_segmenter_results.json")
    args = parser.parse_args()

    torch, nn = require_torch()
    random.seed(args.seed)
    torch.manual_seed(args.seed)

    train_paths = args.train or [ROOT / "data" / "morph_benchmark.json"]
    train_words = load_multiple_word_sets(train_paths)
    eval_words = load_gold_words(args.eval)
    chars = sorted({ch for word in train_words for ch in word.surface})
    tagger = BoundaryTagger(chars)
    optimizer = torch.optim.Adam(tagger.parameters(), lr=0.03)
    criterion = nn.BCEWithLogitsLoss()

    for epoch in range(args.epochs):
        random.shuffle(train_words)
        total_loss = 0.0
        for item in train_words:
            optimizer.zero_grad()
            logits = tagger.logits(item.surface)
            labels = labels_for(item.surface, item.boundary_offsets, torch)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            total_loss += float(loss.detach())
        if epoch in {0, args.epochs - 1}:
            print(f"epoch={epoch + 1} loss={total_loss / len(train_words):.4f}")

    rows = []
    for item in eval_words:
        predicted = tagger.predict_boundaries(item.surface)
        precision, recall, f1 = boundary_prf(predicted, item.boundary_offsets)
        rows.append(
            {
                "surface": item.surface,
                "category": item.category,
                "gold": list(item.pieces),
                "predicted": split_word(item.surface, predicted),
                "boundary_precision": precision,
                "boundary_recall": recall,
                "boundary_f1": f1,
            }
        )

    summary = {
        "system": "neural_char_boundary_tagger_smoke",
        "train_paths": [str(path) for path in train_paths],
        "eval_path": str(args.eval),
        "train_cases": len(train_words),
        "cases": len(rows),
        "boundary_f1": sum(row["boundary_f1"] for row in rows) / len(rows),
        "warning": "Smoke run on the tiny current gold set. This is pipeline validation, not a SOTA result.",
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps({"summary": summary, "rows": rows}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
