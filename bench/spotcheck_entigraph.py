#!/usr/bin/env python3
"""Spot-check wierności korpusu EntiGraph względem źródeł (decyzja flash vs pro).

Korpusy CPT wygenerował deepseek-v4-flash (model odrzucony w bake-offie stylu jako
„za płytki"). Dla CPT płytkość stylu nie szkodzi, ale NIEWIERNOŚĆ źródłu tak — to
byłby ten sam błąd co destylacja z Bielika, tylko rozmyty. Ten skrypt losuje N doków
syntetycznych, odnajduje ŹRÓDŁOWY artykuł (wiki_pl_focus/zpe po tytule), i otwarty
sędzia ocenia: czy wszystkie fakty z doku syntetycznego wynikają ze źródła.

Werdykt per dok: wierny / drobne (nieistotne rozszerzenia) / niewierny (fakty spoza
źródła lub sprzeczne). Wynik: rozkład per korpus i per kind — TYLKO AGREGATY.
Próg decyzji (zapisany z góry): >=5% 'niewierny' => flash NIE nadaje się do skali,
regeneracja na deepseek-v4-pro albo filtr wierności na całości.

Usage: python3 bench/spotcheck_entigraph.py [--n 200] [--seed 42] [--workers 24]
Out:   results/entigraph_faithfulness.json
"""
import argparse
import json
import os
import random
import re
import time
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor

API = "https://openrouter.ai/api/v1/chat/completions"
JUDGE = os.environ.get("VERIFY_JUDGE", "qwen/qwen3.5-122b-a10b")
if re.search(r"anthropic|claude|openai/(?!gpt-oss)", JUDGE, re.I):
    raise SystemExit(f"VERIFY_JUDGE={JUDGE} łamie regułę provenance.")
KEY = os.environ.get("OPENROUTER_API_KEY") or (
    open(os.path.expanduser("~/.openrouter_key")).read().strip()
    if os.path.exists(os.path.expanduser("~/.openrouter_key")) else "")
if not KEY:
    raise SystemExit("BRAK klucza: OPENROUTER_API_KEY albo ~/.openrouter_key")

CORPORA = {
    "pl_focus": ("slayer-data/knowledge/entigraph_pl_focus.clean.jsonl",
                 "slayer-data/knowledge/sources/wiki_pl_focus.jsonl"),
    "zpe": ("slayer-data/knowledge/entigraph_zpe.clean.jsonl",
            "slayer-data/knowledge/sources/zpe.jsonl"),
}
OUT = "results/entigraph_faithfulness.json"

SYS = ("Jesteś surowym weryfikatorem wierności źródłu. Dostajesz ŹRÓDŁO (fragmenty artykułu) "
       "i TEKST SYNTETYCZNY wygenerowany na jego podstawie. Oceń, czy KAŻDY fakt z tekstu "
       "syntetycznego wynika ze źródła: 'wierny' = wszystko wynika; 'drobne' = nieistotne "
       "przeformułowania/oczywistości spoza źródła; 'niewierny' = fakty sprzeczne ze źródłem "
       "albo konkretne twierdzenia (daty, liczby, nazwy, związki), których w źródle nie ma. "
       "Zwróć WYŁĄCZNIE JSON: {\"wiernosc\":\"wierny|drobne|niewierny\",\"uwaga\":\"<=12 słów\"}")


def judge(src, syn):
    body = {"model": JUDGE, "temperature": 0.0, "max_tokens": 120, "reasoning": {"enabled": False},
            "messages": [{"role": "system", "content": SYS},
                         {"role": "user", "content": f"ŹRÓDŁO:\n{src[:5000]}\n\nTEKST SYNTETYCZNY:\n{syn[:2500]}"}]}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + KEY,
                                          "Content-Type": "application/json"})
    for t in range(4):
        try:
            c = json.loads(urllib.request.urlopen(req, timeout=90).read())["choices"][0]["message"]["content"]
            m = re.search(r"\{.*\}", c, re.S)
            if m:
                return json.loads(m.group(0))
        except Exception:
            time.sleep(2 * (t + 1))
    return None


def load_sources(path):
    by_title = defaultdict(list)
    for ln in open(path, encoding="utf-8"):
        try:
            r = json.loads(ln)
        except json.JSONDecodeError:
            continue
        title = r.get("title", "")
        if "paras" in r:
            by_title[title].extend(r["paras"])
        elif r.get("text"):
            by_title[title].append(r["text"])
    return by_title


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=200, help="doków na korpus")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--workers", type=int, default=24)
    ap.add_argument("--corpus", default="", help="tylko jeden korpus (pl_focus|zpe)")
    ap.add_argument("--syn", default="", help="własny plik syntetyczny (z --src i --name)")
    ap.add_argument("--src", default="", help="własny plik źródłowy {text|paras, title}")
    ap.add_argument("--name", default="custom")
    a = ap.parse_args()
    rng = random.Random(a.seed)

    todo = ({a.name: (a.syn, a.src)} if a.syn
            else {k: v for k, v in CORPORA.items() if not a.corpus or k == a.corpus})
    report = {"judge": JUDGE, "n_per_corpus": a.n, "seed": a.seed, "corpora": {}}
    if (a.corpus or a.syn) and os.path.exists(OUT):  # częściowy re-run: zachowaj resztę wyników
        report["corpora"] = json.load(open(OUT)).get("corpora", {})
    for name, (syn_path, src_path) in todo.items():
        print(f"[faith] {name}: indeksuję źródła ({src_path})...", flush=True)
        by_title = load_sources(src_path)
        docs = []
        for ln in open(syn_path, encoding="utf-8"):
            d = json.loads(ln)
            if d.get("source_title") in by_title:
                docs.append(d)
        rng.shuffle(docs)
        sample = docs[:a.n]
        print(f"[faith] {name}: {len(docs)} doków z odnalezionym źródłem, próbka {len(sample)}", flush=True)

        def work(d):
            # PEŁNE okno źródła (do ~14k znaków): tytuł w ZPE ma dziesiątki akapitów,
            # wąskie okno fałszywie zawyża 'niewierny' (sędzia nie widzi właściwego akapitu)
            paras, src, used = by_title[d["source_title"]], [], 0
            for p in paras:
                if used + len(p) > 14000:
                    break
                src.append(p)
                used += len(p)
            return d, judge("\n\n".join(src), d["text"])

        verdicts = Counter()
        by_kind = defaultdict(Counter)
        gen_models = Counter()
        with ThreadPoolExecutor(max_workers=a.workers) as ex:
            for d, v in ex.map(work, sample):
                w = (v or {}).get("wiernosc", "brak")
                verdicts[w] += 1
                by_kind[d.get("kind", "?")][w] += 1
                gen_models[d.get("gen_model", "?")] += 1
        n_ok = verdicts.get("wierny", 0) + verdicts.get("drobne", 0)
        n_judged = sum(c for k, c in verdicts.items() if k != "brak")
        report["corpora"][name] = {
            "sampled": len(sample), "verdicts": dict(verdicts),
            "by_kind": {k: dict(v) for k, v in by_kind.items()},
            "gen_models": dict(gen_models),
            "pct_niewierny": round(verdicts.get("niewierny", 0) / max(n_judged, 1) * 100, 1),
            "pct_ok": round(n_ok / max(n_judged, 1) * 100, 1),
        }
        print(f"[faith] {name}: {dict(verdicts)} -> niewierny "
              f"{report['corpora'][name]['pct_niewierny']}%", flush=True)

    report["decision_rule"] = ">=5% niewierny => flash nie skaluje się; regeneracja pro albo filtr wierności"
    os.makedirs("results", exist_ok=True)
    json.dump(report, open(OUT, "w"), ensure_ascii=False, indent=2)
    print(f"[faith] raport -> {OUT}", flush=True)


if __name__ == "__main__":
    main()
