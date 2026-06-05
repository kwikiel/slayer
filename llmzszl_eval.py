#!/usr/bin/env python3
"""LLMzSzŁ (amu-cai/llmzszl-dataset) MCQ benchmark: Bielik vs Qwen via ollama.

Accuracy is the decisive metric. Stratified sample by exam 'type' (seed 42).
Subcategory breakdown per exam type. Usage: python3 llmzszl_eval.py [N]
"""
import json, re, sys, time, random, urllib.request
from collections import defaultdict
from huggingface_hub import hf_hub_download

OLLAMA = "http://127.0.0.1:11434/api/chat"
N = int(sys.argv[1]) if len(sys.argv) > 1 else 400
SEED = 42
MODELS = [
    ("Bielik-11B-v3.0-Instruct", "hf.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF:Q4_K_M"),
    ("Qwen3.5-9B",               "qwen3.5:9b"),
]
SYS = ("Rozwiązujesz test wielokrotnego wyboru z polskich egzaminów państwowych. "
       "Wybierz dokładnie jedną poprawną odpowiedź. Odpowiedz WYŁĄCZNIE literą odpowiedzi (np. B). "
       "Bez uzasadnienia, bez dodatkowych słów.")

def build_sample():
    p = hf_hub_download("amu-cai/llmzszl-dataset", "llmzszl-test.jsonl", repo_type="dataset")
    rows = [json.loads(l) for l in open(p, encoding="utf-8")]
    rows = [r for r in rows if r.get("answers") and r.get("correct_answer_index") is not None
            and r["correct_answer_index"] < len(r["answers"])]
    by_type = defaultdict(list)
    for r in rows:
        by_type[r.get("type", "?")].append(r)
    random.seed(SEED)
    sample = []
    total = len(rows)
    for t, lst in by_type.items():
        k = max(1, round(N * len(lst) / total))
        sample += random.sample(lst, min(k, len(lst)))
    random.shuffle(sample)
    return sample[:N] if len(sample) > N else sample

def ask(model, q, options):
    block = "\n".join(f"{chr(65+i)}. {opt}" for i, opt in enumerate(options))
    body = {"model": model, "stream": False, "think": False,
            "options": {"temperature": 0, "num_predict": 8},
            "messages": [{"role": "system", "content": SYS},
                         {"role": "user", "content": f"{q}\n\n{block}\n\nOdpowiedź (sama litera):"}]}
    req = urllib.request.Request(OLLAMA, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())["message"]["content"]
        except Exception as e:
            if a == 2:
                return f"__ERROR__ {e}"
            time.sleep(2)

def parse_letter(out, n):
    out = re.sub(r"<think>.*?</think>", " ", out, flags=re.S).strip().upper()
    m = re.search(r"\b([A-Z])\b", out)
    if m:
        idx = ord(m.group(1)) - 65
        if 0 <= idx < n:
            return idx
    m = re.search(r"([A-Z])", out)  # fallback: first letter anywhere
    if m:
        idx = ord(m.group(1)) - 65
        if 0 <= idx < n:
            return idx
    return -1

def score(model, sample):
    ok = 0
    by_type_ok = defaultdict(int); by_type_n = defaultdict(int)
    bad = 0
    t0 = time.time()
    for i, r in enumerate(sample):
        out = ask(model, r["question"], r["answers"])
        pred = parse_letter(out, len(r["answers"]))
        if pred == -1:
            bad += 1
        correct = int(pred == r["correct_answer_index"])
        ok += correct
        t = r.get("type", "?")
        by_type_ok[t] += correct; by_type_n[t] += 1
        if (i + 1) % 50 == 0:
            print(f"  [{model}] {i+1}/{len(sample)} acc={ok/(i+1)*100:.1f}% ({time.time()-t0:.0f}s)", flush=True)
    n = len(sample)
    return {
        "model": model, "n": n,
        "accuracy": round(ok / n * 100, 1),
        "unparsed": bad,
        "by_type": {t: round(by_type_ok[t] / by_type_n[t] * 100, 1) for t in by_type_n},
        "by_type_n": dict(by_type_n),
        "secs": round(time.time() - t0, 1),
    }

def main():
    sample = build_sample()
    types = defaultdict(int)
    for r in sample: types[r.get("type", "?")] += 1
    print(f"Sample: {len(sample)} pytań MCQ, seed={SEED}")
    for t, c in types.items(): print(f"  {t}: {c}")
    print(flush=True)
    results = []
    for name, tag in MODELS:
        print(f"=== {name} ({tag}) ===", flush=True)
        res = score(tag, sample); res["display_name"] = name
        results.append(res)
        print(json.dumps(res, ensure_ascii=False, indent=2), flush=True)
    json.dump(results, open("/home/kacper/llmzszl_results.json", "w"), ensure_ascii=False, indent=2)
    print("\n===== LLMzSzŁ (MCQ, decisive accuracy) =====")
    print(f"{'Model':<28}{'accuracy':>10}{'unparsed':>10}{'czas':>8}")
    for r in results:
        print(f"{r['display_name']:<28}{r['accuracy']:>9}%{r['unparsed']:>10}{r['secs']:>7.0f}s")
    if len(results) == 2:
        w = max(results, key=lambda r: r["accuracy"])
        d = abs(results[0]["accuracy"] - results[1]["accuracy"])
        print(f"\nZwycięzca: {w['display_name']}  (+{round(d,1)} pkt)")

if __name__ == "__main__":
    main()
