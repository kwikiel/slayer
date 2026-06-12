#!/usr/bin/env python3
"""Decon audit — silnik wykrywania verbatim/near-verbatim z testów w danych generowanych.

Buduje indeks n-gramów słów (domyślnie 8) ze WSZYSTKICH zbiorów ewaluacyjnych:
  - runs/test_atoms.txt                       (KLEJ + belebele test)
  - PEŁNY test LLMzSzŁ (amu-cai/llmzszl-dataset, auto-pobranie z HF; fallback:
    lokalna próbka slayer-data/llmzszl_R_eval.jsonl z GŁOŚNYM ostrzeżeniem)
  - slayer-data/polknowledge/bench.jsonl      (PolKnowledge held-out)
  - slayer-data/knowledge/probe_v1.jsonl      (knowledge probe Q+gold)
  - slayer-data/mcq_heldout.jsonl, mcq_test.jsonl
  - slayer-data/style/holdout_v1.jsonl        (held-out prompty stylu)
i skanuje wskazane pliki wygenerowane. Trafienie = wspólny ciąg >= N słów z evalem
(verbatim span). Raport: liczba trafień per plik + przykładowe spany (to jest
sankcjonowane użycie plików testowych: wejście dekontaminacji, nie trening).

Dodatkowo egzekwuje exclusion list sondy wiedzy
(slayer-data/knowledge/probe_v1.excluded_hashes.txt): rekord, którego pole "text"
ma sha1 z listy, jest trafieniem (typ probe_excluded) — te doki QA NIE mogą wejść
do CPT, inaczej sonda mierzy pamięć itemu zamiast wiedzy.

Usage:
  python3 bench/decon_audit.py <plik.jsonl> [...]            # audyt, raport
  python3 bench/decon_audit.py <plik.jsonl> --strip          # + zapis <plik>.clean.jsonl
  python3 bench/decon_audit.py --all                         # audyt wszystkich artefaktów gen
Opcje: --ngram 8 --report results/decon_audit.json
Raport bieżący jest nadpisywany, ale każdy przebieg dopisuje się też do
results/decon_audit_history.jsonl (trwały ślad audytu).
"""
import argparse
import glob
import hashlib
import json
import os
import re
import time
import unicodedata
from collections import defaultdict

EVAL_SOURCES = [
    "runs/test_atoms.txt",
    "slayer-data/polknowledge/bench.jsonl",
    "slayer-data/knowledge/probe_v1.jsonl",
    "slayer-data/mcq_heldout.jsonl",
    "slayer-data/mcq_test.jsonl",
    "slayer-data/style/holdout_v1.jsonl",
]
LLMZSZL_FALLBACK = "slayer-data/llmzszl_R_eval.jsonl"
EXCL_HASHES_F = "slayer-data/knowledge/probe_v1.excluded_hashes.txt"
GEN_DEFAULT = [
    "slayer-data/distill/*.jsonl",
    "slayer-data/external/*.jsonl",
    "slayer-data/knowledge/entigraph_*.jsonl",
    "slayer-data/mcq/mcq_synth_v3.jsonl",
    "slayer-data/mcq/mcq_train.jsonl",
    "slayer-data/mcq/agri_train.jsonl",
    "slayer-data/v3/*.jsonl",
    "slayer-data/style/style_pl_sft_v3_openjudge.jsonl",
    "slayer-data/style/style_pl_sft_v3_openjudge_disjoint.jsonl",
]


def llmzszl_test_path():
    """Pełny test LLMzSzŁ z HF (ten sam plik, na którym liczy bench_llmzszl_likelihood)."""
    try:
        from huggingface_hub import hf_hub_download
        return hf_hub_download("amu-cai/llmzszl-dataset", "llmzszl-test.jsonl",
                               repo_type="dataset")
    except Exception as e:
        print(f"[decon] !!! NIE POBRANO pełnego LLMzSzŁ ({str(e)[:60]}) — "
              f"fallback na próbkę {LLMZSZL_FALLBACK} (POKRYCIE NIEPEŁNE)")
        return LLMZSZL_FALLBACK

WORD_RE = re.compile(r"[a-ząćęłńóśźż0-9]+")


def words(s):
    s = unicodedata.normalize("NFC", str(s).lower())
    return WORD_RE.findall(s)


def texts_of(obj):
    """Wszystkie stringi z rekordu JSONL (dowolny schemat)."""
    out = []
    if isinstance(obj, str):
        out.append(obj)
    elif isinstance(obj, dict):
        for v in obj.values():
            out.extend(texts_of(v))
    elif isinstance(obj, list):
        for v in obj:
            out.extend(texts_of(v))
    return out


def iter_texts(path):
    if path.endswith(".txt"):
        for ln in open(path, encoding="utf-8"):
            if ln.strip():
                yield ln.strip()
        return
    for ln in open(path, encoding="utf-8"):
        try:
            obj = json.loads(ln)
        except json.JSONDecodeError:
            continue
        for t in texts_of(obj):
            yield t


def shingles(ws, n):
    for i in range(len(ws) - n + 1):
        yield " ".join(ws[i:i + n])


def build_index(n):
    idx = set()
    per_src = {}
    for src in EVAL_SOURCES + [llmzszl_test_path()]:
        if not os.path.exists(src):
            per_src[src] = "BRAK"
            print(f"[decon] !!! BRAK źródła ewaluacyjnego: {src} — pokrycie NIEPEŁNE")
            continue
        before = len(idx)
        for t in iter_texts(src):
            ws = words(t)
            idx.update(shingles(ws, n))
        per_src[src] = len(idx) - before
    return idx, per_src


def load_excluded_hashes():
    """Hashe doków QA z sondy wiedzy — zakaz wejścia do treningu (CPT)."""
    if not os.path.exists(EXCL_HASHES_F):
        print(f"[decon] uwaga: brak {EXCL_HASHES_F} (sonda nie zbudowana?) — "
              f"egzekucja exclusion list pominięta")
        return set()
    return {h.strip() for h in open(EXCL_HASHES_F) if h.strip()}


def audit_file(path, idx, n, strip, excl_hashes):
    rows, hits = [], []
    total = 0
    for ln in open(path, encoding="utf-8"):
        ln = ln.rstrip("\n")
        if not ln.strip():
            continue
        total += 1
        try:
            obj = json.loads(ln)
        except json.JSONDecodeError:
            # niesparsowalna linia NIE przechodzi bez skanu — skanujemy surowy tekst
            ws = words(ln)
            matched = next((sh for sh in shingles(ws, n) if sh in idx), None)
            rows.append((ln, bool(matched)))
            if matched:
                hits.append({"line": total, "span": matched, "type": "ngram_rawline"})
            continue
        matched, mtype = None, "ngram"
        txt = obj.get("text") if isinstance(obj, dict) else None
        if excl_hashes and isinstance(txt, str) \
                and hashlib.sha1(txt.encode()).hexdigest() in excl_hashes:
            matched, mtype = "<dok QA z exclusion list sondy>", "probe_excluded"
        if not matched:
            for t in texts_of(obj):
                ws = words(t)
                for sh in shingles(ws, n):
                    if sh in idx:
                        matched = sh
                        break
                if matched:
                    break
        rows.append((ln, bool(matched)))
        if matched:
            hits.append({"line": total, "span": matched, "type": mtype})
    if strip and hits:
        clean = path.rsplit(".jsonl", 1)[0] + ".clean.jsonl"
        with open(clean, "w", encoding="utf-8") as f:
            for ln, bad in rows:
                if not bad:
                    f.write(ln + "\n")
        print(f"    -> czysty plik: {clean} ({total - len(hits)}/{total})")
    return {"file": path, "records": total, "verbatim_hits": len(hits),
            "rate_pct": round(len(hits) / max(total, 1) * 100, 3),
            "samples": hits[:5]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--ngram", type=int, default=8)
    ap.add_argument("--strip", action="store_true")
    ap.add_argument("--report", default="public/results/decon_audit.json")
    a = ap.parse_args()

    paths = a.paths or []
    if a.all or not paths:
        for pat in GEN_DEFAULT:
            paths.extend(sorted(glob.glob(pat)))
    paths = [p for p in dict.fromkeys(paths)
             if os.path.exists(p) and not p.endswith(".verdicts.jsonl")]

    idx, per_src = build_index(a.ngram)
    excl_hashes = load_excluded_hashes()
    print(f"[decon] indeks: {len(idx)} {a.ngram}-gramów z evali | exclusion hashes: {len(excl_hashes)}")
    for s, c in per_src.items():
        print(f"  {s}: {c}")

    results = []
    for p in paths:
        r = audit_file(p, idx, a.ngram, a.strip, excl_hashes)
        flag = "CZYSTY" if r["verbatim_hits"] == 0 else f"!!! {r['verbatim_hits']} trafień ({r['rate_pct']}%)"
        print(f"[decon] {p}: {r['records']} rekordów -> {flag}")
        for s in r["samples"]:
            print(f"    linia {s['line']} [{s.get('type', 'ngram')}]: \"{s['span'][:90]}\"")
        results.append(r)

    report = {"ts": time.strftime("%Y-%m-%dT%H:%M:%S"), "ngram": a.ngram,
              "index_size": len(idx), "excl_hashes": len(excl_hashes),
              "eval_sources": per_src, "results": results}
    os.makedirs(os.path.dirname(a.report), exist_ok=True)
    json.dump(report, open(a.report, "w"), ensure_ascii=False, indent=2)
    with open("results/decon_audit_history.jsonl", "a", encoding="utf-8") as hf:
        hf.write(json.dumps(report, ensure_ascii=False) + "\n")
    print(f"[decon] raport -> {a.report} (+ historia: results/decon_audit_history.jsonl)")
    bad = [r for r in results if r["verbatim_hits"]]
    raise SystemExit(1 if bad else 0)


if __name__ == "__main__":
    main()
