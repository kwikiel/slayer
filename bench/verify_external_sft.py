#!/usr/bin/env python3
"""Weryfikacja zewnętrznego SFT per item otwartym sędzią (fakty + polszczyzna).

Każdy rekord ocenia sędzia (qwen/qwen3.5-122b-a10b, Apache-2.0, niezależny od teachera).
Zostają tylko: fakty=ok AND jezyk=ok. Werdykty zapisywane przy rekordzie (audyt).
Idempotentny: pomija już ocenione (po hashu promptu).

Usage: python3 bench/verify_external_sft.py <in.jsonl> <out_verified.jsonl> [--workers 24]
"""
import argparse
import hashlib
import json
import os
import re
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

API = "https://openrouter.ai/api/v1/chat/completions"
JUDGE = os.environ.get("VERIFY_JUDGE", "qwen/qwen3.5-122b-a10b")
KEY = open(os.path.expanduser("~/.openrouter_key")).read().strip()

SYS = ("Jesteś surowym weryfikatorem faktów i polszczyzny. Oceń odpowiedź asystenta: "
       "(1) FAKTY: poprawne / drobne błędy / poważne błędy (zmyślenia, błędne daty, nieistniejące "
       "pojęcia, urwana odpowiedź); (2) POLSZCZYZNA: naturalna / sztuczna. Jeśli nie możesz "
       "zweryfikować bardzo niszowego faktu, a odpowiedź podaje szczegóły z dużą pewnością, oceń 'powazne'. "
       "Zwróć WYŁĄCZNIE JSON: {\"fakty\":\"ok|drobne|powazne\",\"jezyk\":\"ok|sztuczny\",\"uwaga\":\"<=10 słów\"}")


def hid(r):
    return hashlib.sha1(" ".join(r["messages"][0]["content"].lower().split()).encode()).hexdigest()


def judge(u, a):
    body = {"model": JUDGE, "temperature": 0.0, "max_tokens": 150, "reasoning": {"enabled": False},
            "messages": [{"role": "system", "content": SYS},
                         {"role": "user", "content": f"PYTANIE:\n{u[:800]}\n\nODPOWIEDŹ:\n{a[:2500]}"}]}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"})
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
    ap.add_argument("inp"); ap.add_argument("out")
    ap.add_argument("--workers", type=int, default=24)
    a = ap.parse_args()
    verd_f = a.out + ".verdicts.jsonl"
    done = {}
    if os.path.exists(verd_f):
        for ln in open(verd_f):
            try:
                v = json.loads(ln); done[v["hid"]] = v
            except Exception:
                pass
    rows = [json.loads(l) for l in open(a.inp)]
    todo = [r for r in rows if hid(r) not in done]
    print(f"[verify] {len(rows)} rekordów, ocenionych {len(done)}, do oceny {len(todo)} | judge={JUDGE}", flush=True)

    def work(r):
        return r, judge(r["messages"][0]["content"], r["messages"][1]["content"])

    n = 0
    with open(verd_f, "a", encoding="utf-8") as vf, ThreadPoolExecutor(max_workers=a.workers) as ex:
        for r, v in ex.map(work, todo):
            n += 1
            rec = {"hid": hid(r), "verdict": v or {"fakty": "brak", "jezyk": "brak"}}
            vf.write(json.dumps(rec, ensure_ascii=False) + "\n")
            done[rec["hid"]] = rec
            if n % 200 == 0:
                vf.flush(); print(f"  ocenionych {n}/{len(todo)}", flush=True)

    kept = 0
    from collections import Counter
    fk = Counter()
    with open(a.out, "w", encoding="utf-8") as f:
        for r in rows:
            v = done.get(hid(r), {}).get("verdict") or {}
            fk[v.get("fakty", "brak")] += 1
            if v.get("fakty") == "ok" and v.get("jezyk") == "ok":
                r["verified_by"] = JUDGE
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
                kept += 1
    print(f"[verify] DONE: zostaje {kept}/{len(rows)} -> {a.out} | rozkład faktów: {dict(fk)}", flush=True)


if __name__ == "__main__":
    main()
