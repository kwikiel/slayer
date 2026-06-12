#!/usr/bin/env python3
"""Slayer v3 — assembler CZYSTEGO miksu SFT (V3_DATA_PLAN, krok 4).

Warstwy (proporcje z V3_DATA_PLAN „buildable today"):
  ~60%  destylacja        distill/distill_pl.verified.jsonl (po sędzi otwartym!)
  ~10%  human PL          v3/human_pl_aya.clean.jsonl + v3/human_pl_oasst2.jsonl
  ~5%   styl (re-judged)  style/style_pl_sft_v3_openjudge_disjoint.jsonl
  ~20%  EN retention      v3/en_retention_tulu3.jsonl
  ~5%   rezerwa           (DPO osobno, po SFT)

Gwarancje: ZERO train/test splitów benchmarków; dedup vs runs/test_atoms.txt
(ostatnia linia obrony, warstwy już deduplikowane); dedup między warstwami;
filtr myślników na odpowiedziach; raport per źródło; udziały liczone PO filtrach;
brak pliku warstwy = twardy błąd (chyba że --allow-missing); na końcu OBOWIĄZKOWA
bramka decon_audit na gotowym miksie (exit != 0 gdy trafienia).

Out: slayer-data/v3/train_v3.jsonl + public/results/train_v3_mix_report.json
Usage: python3 bench/build_v3_mix.py [--distill-share 0.60] [--seed 42]
"""
import argparse
import hashlib
import json
import os
import random
import subprocess
import sys
from collections import Counter

ATOMS_F = "runs/test_atoms.txt"
OUT = "slayer-data/v3/train_v3.jsonl"
REPORT = "public/results/train_v3_mix_report.json"

# bielik_distill USUNIĘTY z treningu (2026-06-12): słaby teacher (50.6% fakty=powazne
# u sędziego), 78% próbek to faktograficzne QA. Dane zostają w slayer-data/external/
# WYŁĄCZNIE jako materiał do analizy/benchmarku wiedzy Bielika — patrz README tamże.
# Styl wydzielony z human_pl (uczciwość etykiet: to dane syntetyczne, nie ludzkie).
LAYERS = {
    "distill": ["slayer-data/distill/distill_pl.verified.jsonl"],
    "human_pl": ["slayer-data/v3/human_pl_aya.verified.jsonl",
                 "slayer-data/v3/human_pl_oasst2.verified.jsonl"],
    "style": ["slayer-data/style/style_pl_sft_v3_openjudge_disjoint.jsonl"],
    "en_retention": ["slayer-data/v3/en_retention_tulu3.clean.jsonl"],
}
FORBIDDEN_SOURCES = ("klej", "synth_psc", "synth_ppc", "synth_dyk", "synth_8tags",
                     "synth_polemo")  # twardy bezpiecznik: nic KLEJ-owego


def norm(s):
    return " ".join(str(s).lower().split())


def dash_overuse(text):
    """AI-tell: NADUŻYCIE myślników. Pojedynczy myślnik w krótkiej odpowiedzi
    (np. format NER 'Jan Kowalski — postać') nie jest nadużyciem; >=2 przy
    wysokiej częstości — tak."""
    n = text.count("—") + text.count("–")
    words = max(len(text.split()), 1)
    return n >= 2 and n / words * 100 > 1.5


def load_layer(paths, allow_missing=False):
    rows = []
    for p in paths:
        if not os.path.exists(p):
            if allow_missing:
                print(f"  UWAGA: brak {p} (pomijam — --allow-missing)")
                continue
            raise SystemExit(f"BRAK pliku warstwy: {p} — miks byłby cicho wykrzywiony. "
                             f"Zbuduj plik albo uruchom z --allow-missing.")
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
    ap.add_argument("--human-share", type=float, default=0.10)
    ap.add_argument("--style-share", type=float, default=0.05)
    ap.add_argument("--en-share", type=float, default=0.20)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--allow-missing", action="store_true",
                    help="brakujący plik warstwy = warning zamiast twardego błędu")
    ap.add_argument("--skip-decon-gate", action="store_true",
                    help="pomiń obowiązkowy decon_audit na gotowym miksie (tylko debug)")
    a = ap.parse_args()
    rng = random.Random(a.seed)

    shares = {"distill": a.distill_share, "human_pl": a.human_share,
              "style": a.style_share, "en_retention": a.en_share}
    if not 0 < sum(shares.values()) <= 1.0:
        raise SystemExit(f"udziały warstw sumują się do {sum(shares.values()):.2f} — muszą być w (0, 1]")

    atoms = [t.strip() for t in open(ATOMS_F, encoding="utf-8")] if os.path.exists(ATOMS_F) else []
    atoms = [t for t in atoms if len(t) >= 20]  # BEZ górnego capu: długie pasaże PSC/belebele też
    print(f"[mix] atomów test: {len(atoms)}")

    pools = {k: load_layer(v, a.allow_missing) for k, v in LAYERS.items()}

    # filtry jakości PRZED wyznaczeniem celów — inaczej udziały kłamią (liczone z puli,
    # która potem traci rekordy na myślnikach/kontaminacji)
    contam, dropped_dash = 0, 0
    for layer, rows in pools.items():
        kept = []
        for r in rows:
            asst = r["messages"][-1]["content"]
            txt = norm(r["messages"][0]["content"] + " " + asst)
            if any(at in txt for at in atoms):
                contam += 1
                continue
            if layer != "en_retention" and dash_overuse(asst):
                dropped_dash += 1
                continue
            kept.append(r)
        pools[layer] = kept
        print(f"[mix] pula {layer}: {len(rows)} -> po filtrach {len(kept)}")

    # skala miksu wyznaczana przez destylację (nośna warstwa), już po filtrach
    n_d = len(pools["distill"])
    if n_d == 0:
        raise SystemExit("pula destylacji po filtrach = 0 — nie buduję pustego miksu")
    total = int(n_d / a.distill_share)
    targets = {k: (n_d if k == "distill" else int(total * shares[k])) for k in pools}

    seen, mix = set(), []
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
            h = hashlib.sha1(norm(r["messages"][0]["content"]).encode()).hexdigest()
            if h in seen:
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
        "shares_target": shares,
        "by_layer": dict(Counter(r["layer"] for r in mix)),
        "by_source": dict(Counter(r["source"] for r in mix)),
        "contam_dropped": contam, "dash_dropped": dropped_dash,
        "clean_guarantee": "zero benchmark train/test splits; dedup vs runs/test_atoms.txt; "
                           "obowiązkowa bramka decon_audit na gotowym miksie",
    }
    os.makedirs(os.path.dirname(REPORT), exist_ok=True)
    json.dump(report, open(REPORT, "w"), ensure_ascii=False, indent=2)
    print(f"[mix] DONE {len(mix)} -> {OUT}\n[mix] raport -> {REPORT}")
    print(json.dumps(report["by_layer"], indent=2))

    # OBOWIĄZKOWA bramka: pełny decon (8-gram + exclusion list sondy) na gotowym miksie.
    # Trafienia => exit != 0, miks NIE nadaje się do treningu.
    if a.skip_decon_gate:
        print("[mix] !!! bramka decon POMINIĘTA (--skip-decon-gate) — nie trenować na tym pliku")
        return
    print("[mix] bramka decon_audit na gotowym miksie...")
    rc = subprocess.run([sys.executable, "bench/decon_audit.py", OUT,
                         "--report", "results/decon_train_v3.json"]).returncode
    if rc != 0:
        raise SystemExit(f"[mix] BRAMKA DECON NIE PRZESZŁA (exit {rc}) — {OUT} skażony, nie trenować")
    print("[mix] bramka decon: CZYSTY")


if __name__ == "__main__":
    main()
