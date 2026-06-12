#!/usr/bin/env python3
"""Knowledge probe — mini smoke benchmark z korpusu EntiGraph (wymiarowanie CPT).

Losuje N pytań z doków QA korpusu (stratyfikacja: polonica / ogólne 50/50), pyta modele
CLOSED-BOOK, sędzia (otwarty Qwen3.5-122B) porównuje odpowiedź z goldem ugruntowanym
w źródle. Wynik: accuracy per model i per warstwa. Tylko agregaty.

CZYSTOŚĆ: wylosowane doki QA zapisują się do exclusion list
(slayer-data/knowledge/probe_v1.excluded_hashes.txt) i MUSZĄ być wykluczone z CPT,
żeby probe mierzył wiedzę z relacji/parafraz, nie pamięć itemu.
EGZEKUCJA: bench/decon_audit.py czyta tę listę i flaguje rekordy o sha1(text)
z listy jako trafienia (typ probe_excluded) — bramka decon = wymuszenie.

Backendy: ollama (np. tunel na simp) i OpenRouter. Konfiguracja w MODELS.

Usage:
  ssh -N -L 11435:127.0.0.1:11434 simp &   # tunel
  python3 bench/knowledge_probe.py --n 100 [--models bielik,qwen9b,qwen27b]
"""
import argparse
import hashlib
import json
import os
import random
import re
import time
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

CORPUS = "slayer-data/knowledge/entigraph_pl_focus.clean.jsonl"
PROBE_F = "slayer-data/knowledge/probe_v1.jsonl"
EXCL_F = "slayer-data/knowledge/probe_v1.excluded_hashes.txt"
OUT = "public/results/knowledge_probe_v1.json"
OLLAMA = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11435")
OR_KEY = os.environ.get("OPENROUTER_API_KEY") or (
    open(os.path.expanduser("~/.openrouter_key")).read().strip()
    if os.path.exists(os.path.expanduser("~/.openrouter_key")) else "")
if not OR_KEY:
    raise SystemExit("BRAK klucza: OPENROUTER_API_KEY albo ~/.openrouter_key")
JUDGE = "qwen/qwen3.5-122b-a10b"

MODELS = {
    "bielik": ("ollama", "hf.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF:Q4_K_M"),
    "qwen9b": ("ollama", "qwen3.5:9b"),
    "qwen27b": ("openrouter", "qwen/qwen3.5-27b"),
}
SYS = ("Odpowiadasz po polsku, krótko i konkretnie, z własnej wiedzy. "
       "Jeśli nie znasz odpowiedzi, napisz dokładnie: nie wiem.")
PL = re.compile(r"\b(Polsk|Polak|polsk|Rzeczypospolit|wojewódz|powiat|Sejm|Warszaw|Krak[oó]w|Gda[ńn]sk|"
                r"Wroc[łl]aw|Pozna[ńn]|Szczecin|Lublin|Mazowsz|Pomorz|[ŚS]l[ąa]sk|PRL|Solidarno)", re.I)


def http_json(url, body, headers, timeout=120, tries=3):
    for a in range(tries):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
            return json.loads(urllib.request.urlopen(req, timeout=timeout).read())
        except Exception as e:
            if a == tries - 1:
                print("  err:", str(e)[:70]); return None
            time.sleep(2 * (a + 1))


def ask(backend, tag, q):
    if backend == "ollama":
        d = http_json(f"{OLLAMA}/api/chat",
                      {"model": tag, "stream": False, "think": False,
                       "options": {"temperature": 0.0, "num_predict": 500},
                       "messages": [{"role": "system", "content": SYS}, {"role": "user", "content": q}]},
                      {"Content-Type": "application/json"}, timeout=180)
        ans = (d or {}).get("message", {}).get("content", "")
    else:
        d = http_json("https://openrouter.ai/api/v1/chat/completions",
                      {"model": tag, "temperature": 0.0, "max_tokens": 500, "reasoning": {"enabled": False},
                       "messages": [{"role": "system", "content": SYS}, {"role": "user", "content": q}]},
                      {"Content-Type": "application/json", "Authorization": "Bearer " + OR_KEY})
        ans = ((d or {}).get("choices") or [{}])[0].get("message", {}).get("content") or ""
    return re.sub(r"<think>.*?</think>", " ", ans, flags=re.S).strip()


JSYS = ("Porównujesz odpowiedź modelu ze wzorcową odpowiedzią (gold). Model odpowiada poprawnie, "
        "jeśli podaje te same kluczowe fakty (parafraza OK, dodatkowe szczegóły OK, sprzeczne fakty NIE; "
        "'nie wiem' = niepoprawna). Zwróć WYŁĄCZNIE JSON: {\"poprawna\": true/false}")


def judge(q, gold, ans):
    if not ans.strip():
        return False  # pusta odpowiedź = błędna (i artefakt harnessu, liczony osobno)
    d = http_json("https://openrouter.ai/api/v1/chat/completions",
                  {"model": JUDGE, "temperature": 0.0, "max_tokens": 60, "reasoning": {"enabled": False},
                   "messages": [{"role": "system", "content": JSYS},
                                {"role": "user", "content": f"PYTANIE: {q}\nGOLD: {gold}\nODPOWIEDŹ MODELU: {ans[:800]}"}]},
                  {"Content-Type": "application/json", "Authorization": "Bearer " + OR_KEY})
    c = ((d or {}).get("choices") or [{}])[0].get("message", {}).get("content") or ""
    m = re.search(r"\{.*\}", c, re.S)
    try:
        return bool(json.loads(m.group(0)).get("poprawna"))
    except Exception:
        return None


def build_probe(n, seed):
    rng = random.Random(seed)
    qa_docs = []
    for ln in open(CORPUS, encoding="utf-8"):
        r = json.loads(ln)
        if r["kind"] != "qa":
            continue
        pairs = re.findall(r"Pytanie:\s*(.+?)\s*Odpowiedź:\s*(.+?)(?=Pytanie:|$)", r["text"], re.S)
        pairs = [(q.strip(), a.strip()) for q, a in pairs if len(q.strip()) > 15 and len(a.strip()) > 5]
        if pairs:
            qa_docs.append((r, pairs))
    rng.shuffle(qa_docs)
    pl, gen = [], []
    excl = []
    for r, pairs in qa_docs:
        if len(pl) >= n // 2 and len(gen) >= n - n // 2:
            break
        q, a = rng.choice(pairs)
        item = {"q": q, "gold": a, "source_title": r["source_title"],
                "strata": "polonica" if PL.search(r["text"]) else "ogolne"}
        bucket = pl if item["strata"] == "polonica" else gen
        if (item["strata"] == "polonica" and len(pl) < n // 2) or \
           (item["strata"] == "ogolne" and len(gen) < n - n // 2):
            bucket.append(item)
            excl.append(hashlib.sha1(r["text"].encode()).hexdigest())
    probe = pl + gen
    rng.shuffle(probe)
    with open(PROBE_F, "w", encoding="utf-8") as f:
        for p in probe:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
    with open(EXCL_F, "w") as f:
        f.write("\n".join(excl) + "\n")
    print(f"[probe] {len(probe)} pytań ({len(pl)} polonica / {len(gen)} ogólne) -> {PROBE_F}")
    print(f"[probe] exclusion list: {len(excl)} doków QA -> {EXCL_F}")
    return probe


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=100)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--models", default="bielik,qwen9b,qwen27b")
    ap.add_argument("--workers", type=int, default=8)
    a = ap.parse_args()

    if os.path.exists(PROBE_F):
        probe = [json.loads(l) for l in open(PROBE_F, encoding="utf-8")]
        print(f"[probe] istniejący probe: {len(probe)} pytań (idempotencja)")
    else:
        probe = build_probe(a.n, a.seed)

    results = {}
    for name in a.models.split(","):
        backend, tag = MODELS[name]
        print(f"[{name}] pytam ({backend}: {tag})...")
        workers = a.workers if backend == "openrouter" else 2  # ollama: nie zalewać 3090
        with ThreadPoolExecutor(max_workers=workers) as ex:
            answers = list(ex.map(lambda p: ask(backend, tag, p["q"]), probe))
        print(f"[{name}] sędziuję...")
        with ThreadPoolExecutor(max_workers=12) as ex:
            verdicts = list(ex.map(lambda pa: judge(pa[0]["q"], pa[0]["gold"], pa[1]), zip(probe, answers)))
        by = defaultdict(lambda: [0, 0])
        for p, v in zip(probe, verdicts):
            if v is None:
                continue
            by[p["strata"]][1] += 1; by["all"][1] += 1
            if v:
                by[p["strata"]][0] += 1; by["all"][0] += 1
        acc = {k: round(c / max(t, 1) * 100, 1) for k, (c, t) in by.items()}
        empty = sum(1 for a_ in answers if not a_.strip())
        results[name] = {"backend": backend, "tag": tag, "acc": acc,
                         "n_judged": by["all"][1], "empty_answers": empty}
        flag = f" | PUSTE: {empty} (artefakt harnessu!)" if empty else ""
        print(f"[{name}] acc: {acc}{flag}")

    os.makedirs("results", exist_ok=True)
    json.dump({"probe": PROBE_F, "n": len(probe), "seed": a.seed, "judge": JUDGE,
               "note": "probe z korpusu CPT; doki QA z exclusion list NIE moga wejsc do treningu",
               "results": results}, open(OUT, "w"), ensure_ascii=False, indent=2)
    print(f"[probe] raport -> {OUT}")


if __name__ == "__main__":
    main()
