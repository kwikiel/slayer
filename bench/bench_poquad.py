#!/usr/bin/env python3
"""PoQuAD via ollama + LLM-judge (decisive). Usage: bench_poquad.py [N] [seed]
Phase 1: inference (Bielik, Qwen3.5-9B). Phase 2: judge each answerable answer
for semantic correctness with an ollama judge model (JUDGE_TAG). Also keeps SQuAD-F1
as a subcategory. Writes /home/kacper/bench_results/poquad.json
"""
import json, re, sys, time, random, os, urllib.request
from collections import Counter
from huggingface_hub import hf_hub_download

OLLAMA = "http://127.0.0.1:11434/api/chat"
OUT = "/home/kacper/bench_results"
N = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
SEED = int(sys.argv[2]) if len(sys.argv) > 2 else 42
ABSTAIN = "Brak odpowiedzi w tekście"
JUDGE_TAG = os.environ.get("JUDGE_TAG", "gemma2:27b")
MODELS = [
    ("Bielik-11B-v3.0-Instruct", "hf.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF:Q4_K_M"),
    ("Qwen3.5-9B",               "qwen3.5:9b"),
]
SYS = ("Jesteś asystentem QA. Odpowiadasz WYŁĄCZNIE na podstawie podanego fragmentu. "
       "Odpowiedz maksymalnie krótko. Jeśli w tekście nie ma odpowiedzi, odpowiedz dokładnie: " + ABSTAIN)

def norm(s):
    s = re.sub(r"<think>.*?</think>", " ", s.lower(), flags=re.S)
    return " ".join(re.sub(r"[^\w\s]", " ", s, flags=re.U).split())

def f1(pred, gold):
    p, g = norm(pred).split(), norm(gold).split()
    if not p or not g: return float(p == g)
    common = sum((Counter(p) & Counter(g)).values())
    if not common: return 0.0
    pr, rc = common/len(p), common/len(g)
    return 2*pr*rc/(pr+rc)

def is_abstain(p): return "brak odpowiedzi" in norm(p)

def sample():
    p = hf_hub_download("clarin-pl/poquad", "poquad-dev.json", repo_type="dataset")
    items = []
    for art in json.load(open(p))["data"]:
        for para in art["paragraphs"]:
            for qa in para["qas"]:
                golds = []
                for a in qa.get("answers", []):
                    if a.get("text"): golds.append(a["text"])
                    if a.get("generative_answer"): golds.append(a["generative_answer"])
                items.append({"context": para["context"], "q": qa["question"],
                              "impossible": bool(qa.get("is_impossible")), "golds": list(dict.fromkeys(golds))})
    random.seed(SEED); return random.sample(items, min(N, len(items)))

def chat(model, sys_p, usr, npred, think=False):
    body = {"model": model, "stream": False, "think": think,
            "options": {"temperature": 0, "num_predict": npred, "num_ctx": 8192},
            "messages": [{"role": "system", "content": sys_p}, {"role": "user", "content": usr}]}
    req = urllib.request.Request(OLLAMA, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read())["message"]["content"].strip()
        except Exception as e:
            if a == 2: return f"__ERR__{e}"
            time.sleep(2)

def judge(q, golds, pred):
    sysp = ("Oceniasz poprawność odpowiedzi. Dostajesz pytanie, złote (poprawne) odpowiedzi i odpowiedź modelu. "
            "Czy odpowiedź modelu jest merytorycznie poprawna — zawiera właściwą informację ze złotej odpowiedzi, "
            "niezależnie od formy, odmiany i dodatkowych słów? Odpowiedz jednym słowem: TAK albo NIE.")
    usr = f"Pytanie: {q}\nZłote odpowiedzi: {' | '.join(golds)}\nOdpowiedź modelu: {pred}\n\nWerdykt (TAK/NIE):"
    out = chat(JUDGE_TAG, sysp, usr, 8).upper()
    toks = re.findall(r"\b(TAK|NIE)\b", re.sub(r"<think>.*?</think>", " ", out, flags=re.S))
    return toks[-1] == "TAK" if toks else out.strip().startswith("T")

def main():
    if os.path.exists(f"{OUT}/poquad_n{N}_s{SEED}.json"):
        print(f"[poquad] SKIP — n{N} s{SEED} już jest", flush=True); return
    smp = sample()
    nimp = sum(x["impossible"] for x in smp)
    print(f"[poquad] n={len(smp)} ({len(smp)-nimp} odp + {nimp} nieodp) seed={SEED} judge={JUDGE_TAG}", flush=True)
    raw = {}
    # Phase 1: inference
    for name, tag in MODELS:
        rows = []; t0 = time.time()
        for i, it in enumerate(smp):
            pred = chat(tag, SYS, f"Tekst:\n{it['context']}\n\nPytanie: {it['q']}\n\nOdpowiedź:", 96)
            rows.append({"q": it["q"], "impossible": it["impossible"], "golds": it["golds"], "pred": pred})
            if (i+1) % 200 == 0: print(f"  [{name}] infer {i+1}/{len(smp)} ({time.time()-t0:.0f}s)", flush=True)
        raw[name] = {"tag": tag, "rows": rows, "infer_secs": round(time.time()-t0, 1)}
        print(f"  [{name}] inference done", flush=True)
    # Phase 2: judge
    results = []
    for name, tag in MODELS:
        rows = raw[name]["rows"]
        ans_ok = ans_n = no_ok = no_n = 0; f1s = []; t0 = time.time()
        for i, r in enumerate(rows):
            if r["impossible"]:
                no_n += 1; no_ok += int(is_abstain(r["pred"]))
            else:
                ans_n += 1
                if r["golds"]:
                    f1s.append(max(f1(r["pred"], g) for g in r["golds"]))
                if is_abstain(r["pred"]) or not r["golds"]:
                    correct = False
                else:
                    correct = judge(r["q"], r["golds"], r["pred"])
                ans_ok += int(correct)
            if (i+1) % 200 == 0: print(f"  [{name}] judge {i+1}/{len(rows)} ({time.time()-t0:.0f}s)", flush=True)
        n = ans_n + no_n
        # aggregate metrics only — no per-item inspection / sample dumps
        results.append({"display_name": name, "tag": tag, "n": n,
                        "judged_accuracy": round((ans_ok+no_ok)/n*100, 1),
                        "judged_answerable_acc": round(ans_ok/ans_n*100, 1) if ans_n else None,
                        "squad_f1_answerable": round(sum(f1s)/len(f1s)*100, 1) if f1s else None,
                        "unanswerable_abstain": f"{no_ok}/{no_n}",
                        "secs": round(raw[name]["infer_secs"] + time.time()-t0, 1)})
        print(f"  [{name}] judged_acc={results[-1]['judged_accuracy']}%", flush=True)
    winner = max(results, key=lambda r: r["judged_accuracy"])
    payload = {"benchmark": "poquad", "metric": "judged_accuracy (sędzia-LLM)", "judge": JUDGE_TAG,
               "n": len(smp), "seed": SEED, "date": os.environ.get("RUN_DATE", ""),
               "models": results, "winner": winner["display_name"],
               "margin": round(abs(results[0]["judged_accuracy"]-results[1]["judged_accuracy"]), 1)}
    os.makedirs(OUT, exist_ok=True)
    json.dump(payload, open(f"{OUT}/poquad_n{len(smp)}_s{SEED}.json", "w"), ensure_ascii=False, indent=2)
    print(f"[poquad] winner={winner['display_name']} +{payload['margin']}", flush=True)

if __name__ == "__main__":
    main()
