#!/usr/bin/env python3
"""Czyste porównanie per-kategoria: gdzie Bielik bije Qwena (i odwrotnie).
Tylko agregaty accuracy per kategoria ze zbioru — żadnej inspekcji itemów.
Czyta /home/kacper/bench_results/*.json (najwiekszy run per benchmark)."""
import json, glob, os
from collections import defaultdict

BR = "/home/kacper/bench_results"
NB, NQ = "Bielik-11B-v3.0-Instruct", "Qwen3.5-9B"
LABEL = {"llmzszl": "LLMzSzŁ (domeny)", "pes": "PES (specjalizacje)", "belebele": "Belebele", "poquad": "PoQuAD"}

def best_per_bench():
    g = defaultdict(list)
    for f in glob.glob(f"{BR}/*_n*_s*.json"):
        try:
            p = json.load(open(f, encoding="utf-8"))
            if "benchmark" in p and "models" in p: g[p["benchmark"]].append(p)
        except Exception: pass
    return {b: max(v, key=lambda r: r["n"]) for b, v in g.items()}

def mcat(p, name):
    m = next((x for x in p["models"] if x["display_name"] == name), None)
    if not m: return {}
    return m.get("by_category") or m.get("by_category_top") or {}

for bench, p in sorted(best_per_bench().items()):
    cb, cq = mcat(p, NB), mcat(p, NQ)
    cats = sorted(set(cb) & set(cq))
    if not cats:
        continue
    rows = sorted(((c, cb[c], cq[c], round(cb[c]-cq[c], 1)) for c in cats), key=lambda r: -r[3])
    print(f"\n===== {LABEL.get(bench, bench)}  (n={p['n']}) =====")
    print(f"{'kategoria':<34}{'Bielik':>8}{'Qwen':>8}{'Δ(B-Q)':>9}")
    loses = [r for r in rows if r[3] > 0]   # Qwen przegrywa = Bielik wyzej
    print("  -- GDZIE QWEN PRZEGRYWA (Bielik wyżej) --")
    for c, b, q, d in loses[:12]:
        print(f"  {c[:33]:<34}{b:>7}%{q:>7}%{('+'+str(d)):>9}")
    print("  -- gdzie Qwen wygrywa --")
    for c, b, q, d in [r for r in rows if r[3] < 0][:6]:
        print(f"  {c[:33]:<34}{b:>7}%{q:>7}%{str(d):>9}")
print()
