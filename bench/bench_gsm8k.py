#!/usr/bin/env python3
"""GSM8K (openai/gsm8k) — EN math reasoning regression. Exact-match on final integer.
Aggregate accuracy only. Idempotent. Usage: bench_gsm8k.py [N] [seed]"""
import json, re, sys, os, time, random, glob, urllib.request
from datasets import load_dataset

OLLAMA = "http://127.0.0.1:11434/api/chat"
OUT = "/home/kacper/bench_results"
N = int(sys.argv[1]) if len(sys.argv) > 1 else 0
SEED = int(sys.argv[2]) if len(sys.argv) > 2 else 42
MODELS = [
    ("Bielik-11B-v3.0-Instruct", "hf.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF:Q4_K_M"),
    ("Qwen3.5-9B",               "qwen3.5:9b"),
]
SYS = ("Solve the math word problem. Think step by step briefly, then on the last line output "
       "ONLY the final answer in the form: #### <integer>")

def gold_of(ans):
    m = re.search(r"####\s*(-?[\d,]+)", ans)
    return m.group(1).replace(",", "").strip() if m else None

def pred_of(out):
    out = re.sub(r"<think>.*?</think>", " ", out, flags=re.S)
    m = re.search(r"####\s*(-?[\d,]+)", out)
    if m: return m.group(1).replace(",", "").strip()
    nums = re.findall(r"-?\d[\d,]*", out)
    return nums[-1].replace(",", "") if nums else None

def ask(model, q):
    body = {"model": model, "stream": False, "think": False,
            "options": {"temperature": 0, "num_predict": 512, "num_ctx": 2048},
            "messages": [{"role": "system", "content": SYS}, {"role": "user", "content": q}]}
    req = urllib.request.Request(OLLAMA, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read())["message"]["content"]
        except Exception as e:
            if a == 2: return ""
            time.sleep(2)

def main():
    if glob.glob(f"{OUT}/gsm8k_n*_s{SEED}.json"):
        print(f"[gsm8k] SKIP — seed={SEED} już jest", flush=True); return
    ds = list(load_dataset("openai/gsm8k", "main", split="test"))
    random.seed(SEED); random.shuffle(ds)
    if N: ds = ds[:N]
    print(f"[gsm8k] n={len(ds)} seed={SEED}", flush=True)
    results = []
    for name, tag in MODELS:
        ok = 0; t0 = time.time()
        for i, r in enumerate(ds):
            g = gold_of(r["answer"]); p = pred_of(ask(tag, r["question"]))
            ok += int(g is not None and p == g)
            if (i+1) % 100 == 0:
                print(f"  [{name}] {i+1}/{len(ds)} acc={ok/(i+1)*100:.1f}% ({time.time()-t0:.0f}s)", flush=True)
        results.append({"display_name": name, "tag": tag, "n": len(ds),
                        "accuracy": round(ok/len(ds)*100, 1), "secs": round(time.time()-t0, 1)})
        print(f"  [{name}] DONE acc={results[-1]['accuracy']}%", flush=True)
    winner = max(results, key=lambda r: r["accuracy"])
    payload = {"benchmark": "gsm8k", "metric": "accuracy (exact, final int) [EN regresja]",
               "n": len(ds), "seed": SEED, "lang": "en", "date": os.environ.get("RUN_DATE", ""),
               "models": results, "winner": winner["display_name"],
               "margin": round(abs(results[0]["accuracy"]-results[1]["accuracy"]), 1)}
    os.makedirs(OUT, exist_ok=True)
    json.dump(payload, open(f"{OUT}/gsm8k_n{len(ds)}_s{SEED}.json", "w"), ensure_ascii=False, indent=2)
    print(f"[gsm8k] winner={winner['display_name']} +{payload['margin']}", flush=True)

if __name__ == "__main__":
    main()
