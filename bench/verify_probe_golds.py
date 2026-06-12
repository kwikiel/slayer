#!/usr/bin/env python3
"""Niezależna weryfikacja goldów sondy wiedzy (probe_v1) względem ŹRÓDEŁ.

Audyt v3: golds sondy to niezweryfikowane odpowiedzi flash — jeśli część jest błędna,
target CPT (Bielik 28.9 vs Qwen 15.8) stoi na szumie. Ten skrypt dla każdego itemu
sondy odnajduje źródłowy artykuł (wiki_pl_focus po source_title) i otwarty sędzia
ocenia, czy gold jest poprawną, ugruntowaną w źródle odpowiedzią na pytanie.

BENCH PURITY: itemy przetwarza wyłącznie model-sędzia; raport zawiera TYLKO agregaty
(+ indeksy linii złych itemów, bez treści). Sanctioned use: walidacja evalu, nie trening.

Decyzja (z góry): <10% złych goldów => sonda zostaje (raport błędu w metadanych);
>=10% => sonda do przebudowy i baseline'y do powtórki.

Usage: python3 bench/verify_probe_golds.py [--workers 16]
Out:   results/probe_golds_verification.json
"""
import argparse
import json
import os
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

PROBE_F = "slayer-data/knowledge/probe_v1.jsonl"
SRC_F = "slayer-data/knowledge/sources/wiki_pl_focus.jsonl"
OUT = "results/probe_golds_verification.json"

SYS = ("Weryfikujesz pytanie testowe. Dostajesz ŹRÓDŁO (fragmenty artykułu), PYTANIE i GOLD "
       "(wzorcową odpowiedź). Oceń: 'ok' = gold poprawnie odpowiada na pytanie i wynika ze źródła; "
       "'nieugruntowany' = gold może być prawdziwy, ale źródło go nie potwierdza; "
       "'zly' = gold błędny, sprzeczny ze źródłem albo nie odpowiada na pytanie; "
       "dodatkowo 'niejednoznaczne'=true gdy pytanie ma wiele poprawnych odpowiedzi bez kontekstu. "
       "Zwróć WYŁĄCZNIE JSON: {\"gold\":\"ok|nieugruntowany|zly\",\"niejednoznaczne\":true/false}")


def judge(src, q, gold):
    body = {"model": JUDGE, "temperature": 0.0, "max_tokens": 100, "reasoning": {"enabled": False},
            "messages": [{"role": "system", "content": SYS},
                         {"role": "user", "content": f"ŹRÓDŁO:\n{src[:5000]}\n\nPYTANIE: {q}\nGOLD: {gold}"}]}
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=16)
    a = ap.parse_args()

    items = [json.loads(l) for l in open(PROBE_F, encoding="utf-8")]
    titles = {it["source_title"] for it in items}
    by_title = defaultdict(list)
    for ln in open(SRC_F, encoding="utf-8"):
        try:
            r = json.loads(ln)
        except json.JSONDecodeError:
            continue
        if r.get("title") in titles:
            by_title[r["title"]].extend(r.get("paras") or ([r["text"]] if r.get("text") else []))
    print(f"[golds] itemów {len(items)}, źródła odnalezione dla "
          f"{sum(1 for it in items if it['source_title'] in by_title)}", flush=True)

    def work(idx_it):
        idx, it = idx_it
        paras = by_title.get(it["source_title"])
        if not paras:
            return idx, it, {"gold": "brak_zrodla"}
        return idx, it, judge("\n\n".join(paras[:6]), it["q"], it["gold"]) or {"gold": "brak"}

    verdicts = Counter()
    by_strata = defaultdict(Counter)
    ambiguous = 0
    bad_lines = []
    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        for idx, it, v in ex.map(work, enumerate(items, 1)):
            g = v.get("gold", "brak")
            verdicts[g] += 1
            by_strata[it["strata"]][g] += 1
            if v.get("niejednoznaczne"):
                ambiguous += 1
            if g in ("zly", "nieugruntowany", "brak_zrodla"):
                bad_lines.append(idx)

    n_judged = sum(c for k, c in verdicts.items() if k not in ("brak", "brak_zrodla"))
    pct_bad = round((verdicts.get("zly", 0) + verdicts.get("nieugruntowany", 0))
                    / max(n_judged, 1) * 100, 1)
    report = {"judge": JUDGE, "n": len(items), "verdicts": dict(verdicts),
              "by_strata": {k: dict(v) for k, v in by_strata.items()},
              "ambiguous": ambiguous, "pct_bad_gold": pct_bad,
              "bad_line_indices": sorted(bad_lines),
              "decision_rule": "<10% zlych => sonda zostaje z raportem bledu; >=10% => przebudowa"}
    os.makedirs("results", exist_ok=True)
    json.dump(report, open(OUT, "w"), ensure_ascii=False, indent=2)
    print(f"[golds] werdykty: {dict(verdicts)} | niejednoznaczne: {ambiguous} | "
          f"złe goldy: {pct_bad}% -> {OUT}", flush=True)


if __name__ == "__main__":
    main()
