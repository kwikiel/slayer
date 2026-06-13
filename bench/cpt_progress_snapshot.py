#!/usr/bin/env python3
"""Snapshot postępu korpusu CPT do historii publicznego wykresu.

Czyta public/results/cpt_progress.json (aktualny stan licznika) i dopisuje wpis
do public/results/cpt_progress_history.json (oś czasu na stronie /progress).
Idempotentny per dzień: kolejne wywołania tego samego dnia NADPISUJĄ wpis dnia
(historia trzyma ostatni stan dnia, nie każdy tick).

Wołać po każdej aktualizacji cpt_progress.json (ręcznej albo z pipeline'u):
  python3 bench/cpt_progress_snapshot.py [--date YYYY-MM-DD] [--event "opis"]
"""
import argparse
import datetime
import json

CUR = "public/results/cpt_progress.json"
HIST = "public/results/cpt_progress_history.json"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=datetime.date.today().isoformat())
    ap.add_argument("--event", default=None, help="opcjonalna etykieta kamienia na wykresie")
    a = ap.parse_args()

    cur = json.load(open(CUR, encoding="utf-8"))
    try:
        hist = json.load(open(HIST, encoding="utf-8"))
    except FileNotFoundError:
        hist = {"note": "Snapshoty postępu korpusu CPT.", "target_tokens": cur.get("target_tokens", 2_000_000_000), "history": []}

    entry = {
        "date": a.date,
        "accepted_tokens": cur.get("accepted_tokens", 0),
        "accepted_documents": cur.get("accepted_documents", 0),
        "by_bucket": {b["name"]: b.get("accepted_tokens", 0) for b in cur.get("token_budget", [])},
    }
    if a.event:
        entry["event"] = a.event

    rows = [r for r in hist["history"] if r["date"] != a.date]
    # zachowaj event z nadpisywanego wpisu, jeśli nowy go nie podaje
    old = next((r for r in hist["history"] if r["date"] == a.date), None)
    if old and "event" in old and "event" not in entry:
        entry["event"] = old["event"]
    rows.append(entry)
    rows.sort(key=lambda r: r["date"])
    hist["history"] = rows
    hist["target_tokens"] = cur.get("target_tokens", hist.get("target_tokens", 2_000_000_000))

    json.dump(hist, open(HIST, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    pct = 100 * entry["accepted_tokens"] / max(hist["target_tokens"], 1)
    print(f"[cpt-snapshot] {a.date}: {entry['accepted_tokens']:,} tok ({pct:.2f}%) -> {HIST} ({len(rows)} punktów)")


if __name__ == "__main__":
    main()
