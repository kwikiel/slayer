#!/usr/bin/env python3
"""Slayer v3 — assembler CZYSTEGO miksu SFT (V3_DATA_PLAN, krok 4).

Warstwy (proporcje z V3_DATA_PLAN „buildable today"):
  ~60%  destylacja        slayer-data/distill/distill_pl.jsonl
  ~15%  human PL          v3/human_pl_aya.jsonl + v3/human_pl_oasst2.jsonl
                          + style/style_pl_sft_v3_openjudge.jsonl (re-judged styl)
  ~20%  EN retention      v3/en_retention_tulu3.jsonl
  ~5%   rezerwa           (DPO osobno, po SFT)

Gwarancje: ZERO train/test splitów benchmarków; dedup vs runs/test_atoms.txt
(ostatnia linia obrony, warstwy już deduplikowane); dedup między warstwami;
filtr myślników na odpowiedziach; raport per źródło.

Out: slayer-data/v3/train_v3.jsonl + results/train_v3_mix_report.json
Usage: python3 bench/build_v3_mix.py [--distill-share 0.60] [--seed 42]
"""
import argparse
import hashlib
import json
import os
import random
from collections import Counter

ATOMS_F = "runs/test_atoms.txt"
OUT = "slayer-data/v3/train_v3.jsonl"
REPORT = "results/train_v3_mix_report.json"

LAYERS = {
    "distill": ["slayer-data/distill/distill_pl.clean.jsonl"],
    "human_pl": ["slayer-data/v3/human_pl_aya.clean.jsonl",
                 "slayer-data/v3/human_pl_oasst2.jsonl",
                 "slayer-data/style/style_pl_sft_v3_openjudge_disjoint.jsonl"],
    "en_retention": ["slayer-data/v3/en_retention_tulu3.jsonl"],
}
FORBIDDEN_SOURCES = ("klej", "synth_psc", "synth_ppc", "synth_dyk", "synth_8tags",
                     "synth_polemo")  # twardy bezpiecznik: nic KLEJ-owego


def norm(s):
    return " ".join(str(s).lower().split())


def dash_rate(text):
    words = max(len(text.split()), 1)
    return (text.count("—") + text.count("–")) / words * 100


def load_layer(paths):
    rows = []
    for p in paths:
        if not os.path.exists(p):
            print(f"  UWAGA: brak {p} (pomijam)")
            continue
        for ln in open(p, encoding="utf-8"):
            try:
                r = json.loads(ln)
            except json.JSONDecodeError:
                continue
            ms = r.get("messages") or []
            if len(ms) < 2:
                continue
            src = r.get("source", os.path.basename(p))
            if any(f in src.lower() for f in FORBIDDEN_SOURCES):
                raise SystemExit(f"FORBIDDEN source '{src}' w {p} — to ma być czysty miks v3")
            rows.append({"messages": ms, "source": src})
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--distill-share", type=float, default=0.60)
    ap.add_argument("--human-share", type=float, default=0.15)
    ap.add_argument("--en-share", type=float, default=0.20)
    ap.add_argument("--seed", type=int, default=42)
    a = ap.parse_args()
    rng = random.Random(a.seed)

    atoms = [t.strip() for t in open(ATOMS_F, encoding="utf-8")] if os.path.exists(ATOMS_F) else []
    atoms = [t for t in atoms if 20 <= len(t) <= 200]
    print(f"[mix] atomów test: {len(atoms)}")

    pools = {k: load_layer(v) for k, v in LAYERS.items()}
    for k, v in pools.items():
        print(f"[mix] pula {k}: {len(v)}")

    # skala miksu wyznaczana przez destylację (nośna warstwa)
    n_d = len(pools["distill"])
    total = int(n_d / a.distill_share)
    targets = {"distill": n_d,
               "human_pl": int(total * a.human_share),
               "en_retention": int(total * a.en_share)}

    seen, mix, contam, dropped_dash = set(), [], 0, 0
    for layer, rows in pools.items():
        rng.shuffle(rows)
        # balans per źródło wewnątrz warstwy
        by_src = Counter()
        cap = max(targets[layer] // max(len({r["source"] for r in rows}), 1), 50)
        taken = 0
        for r in rows:
            if taken >= targets[layer]:
                break
            if by_src[r["source"]] >= cap and layer == "human_pl":
                continue
            u = r["messages"][0]["content"]
            asst = r["messages"][-1]["content"]
            h = hashlib.sha1(norm(u).encode()).hexdigest()
            if h in seen:
                continue
            txt = norm(u + " " + asst)
            if any(at in txt for at in atoms):
                contam += 1
                continue
            if layer != "en_retention" and dash_rate(asst) > 1.5:
                dropped_dash += 1
                continue
            seen.add(h)
            by_src[r["source"]] += 1
            r["layer"] = layer
            mix.append(r)
            taken += 1
        print(f"[mix] {layer}: {taken}/{targets[layer]}")

    rng.shuffle(mix)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        for r in mix:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    report = {
        "total": len(mix), "seed": a.seed,
        "shares_target": {"distill": a.distill_share, "human_pl": a.human_share,
                          "en_retention": a.en_share},
        "by_layer": dict(Counter(r["layer"] for r in mix)),
        "by_source": dict(Counter(r["source"] for r in mix)),
        "contam_dropped": contam, "dash_dropped": dropped_dash,
        "clean_guarantee": "zero benchmark train/test splits; dedup vs runs/test_atoms.txt",
    }
    os.makedirs(os.path.dirname(REPORT), exist_ok=True)
    json.dump(report, open(REPORT, "w"), ensure_ascii=False, indent=2)
    print(f"[mix] DONE {len(mix)} -> {OUT}\n[mix] raport -> {REPORT}")
    print(json.dumps(report["by_layer"], indent=2))


if __name__ == "__main__":
    main()
