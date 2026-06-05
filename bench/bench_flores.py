#!/usr/bin/env python3
"""FLORES-200 (openlanguagedata/flores_plus) translation: Bielik vs Qwen via ollama.
PL->EN and EN->PL, scored with sacrebleu (BLEU + chrF). chrF is the decisive metric
(robust for morphologically-rich Polish). Usage: bench_flores.py [N_per_dir] [seed]
Needs HF_TOKEN in env (gated dataset). Writes bench_results/flores_n<N>_s<seed>.json
"""
import json, re, sys, os, time, random, urllib.request
import sacrebleu
from huggingface_hub import hf_hub_download

OLLAMA = "http://127.0.0.1:11434/api/chat"
OUT = "/home/kacper/bench_results"
N = int(sys.argv[1]) if len(sys.argv) > 1 else 300
SEED = int(sys.argv[2]) if len(sys.argv) > 2 else 42
TOKEN = os.environ.get("HF_TOKEN")
MODELS = [
    ("Bielik-11B-v3.0-Instruct", "hf.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF:Q4_K_M"),
    ("Qwen3.5-9B",               "qwen3.5:9b"),
]

def load_pairs():
    pl = hf_hub_download("openlanguagedata/flores_plus", "devtest/pol_Latn.jsonl", repo_type="dataset", token=TOKEN)
    en = hf_hub_download("openlanguagedata/flores_plus", "devtest/eng_Latn.jsonl", repo_type="dataset", token=TOKEN)
    P = [json.loads(l)["text"] for l in open(pl, encoding="utf-8")]
    E = [json.loads(l)["text"] for l in open(en, encoding="utf-8")]
    pairs = list(zip(P, E))
    random.seed(SEED)
    return random.sample(pairs, min(N, len(pairs)))

def translate(model, text, target):
    sysp = (f"Jesteś profesjonalnym tłumaczem. Przetłumacz podany tekst na język {target}. "
            f"Zwróć WYŁĄCZNIE tłumaczenie — bez komentarzy, bez oryginału, bez cudzysłowów.")
    body = {"model": model, "stream": False, "think": False,
            "options": {"temperature": 0, "num_predict": 220, "num_ctx": 2048},
            "messages": [{"role": "system", "content": sysp}, {"role": "user", "content": text}]}
    req = urllib.request.Request(OLLAMA, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                out = json.loads(r.read())["message"]["content"]
                return re.sub(r"<think>.*?</think>", " ", out, flags=re.S).strip().strip('"').strip()
        except Exception as e:
            if a == 2: return ""
            time.sleep(2)

def score_dir(model, pairs, direction):
    # direction: "pl_en" => src=PL, ref=EN, target=angielski ; "en_pl" => src=EN, ref=PL, target=polski
    hyps, refs = [], []
    target = "angielski" if direction == "pl_en" else "polski"
    t0 = time.time()
    for i, (pl, en) in enumerate(pairs):
        src, ref = (pl, en) if direction == "pl_en" else (en, pl)
        hyps.append(translate(model, src, target)); refs.append(ref)
        if (i+1) % 100 == 0:
            print(f"  [{model}] {direction} {i+1}/{len(pairs)} ({time.time()-t0:.0f}s)", flush=True)
    bleu = sacrebleu.corpus_bleu(hyps, [refs]).score
    chrf = sacrebleu.corpus_chrf(hyps, [refs]).score
    return round(bleu, 1), round(chrf, 1), round(time.time()-t0, 1)

def main():
    if os.path.exists(f"{OUT}/flores_n{N}_s{SEED}.json"):
        print(f"[flores] SKIP — n{N} s{SEED} już jest", flush=True); return
    pairs = load_pairs()
    print(f"[flores] {len(pairs)} zdań/kierunek seed={SEED}", flush=True)
    results = []
    for name, tag in MODELS:
        pe_b, pe_c, t1 = score_dir(tag, pairs, "pl_en")
        ep_b, ep_c, t2 = score_dir(tag, pairs, "en_pl")
        results.append({"display_name": name, "tag": tag, "n": len(pairs),
                        "pl_en_bleu": pe_b, "pl_en_chrf": pe_c,
                        "en_pl_bleu": ep_b, "en_pl_chrf": ep_c,
                        "chrf_overall": round((pe_c+ep_c)/2, 1),
                        "bleu_overall": round((pe_b+ep_b)/2, 1),
                        "secs": round(t1+t2, 1)})
        print(f"  [{name}] chrF={results[-1]['chrf_overall']} BLEU={results[-1]['bleu_overall']}", flush=True)
    winner = max(results, key=lambda r: r["chrf_overall"])
    payload = {"benchmark": "flores", "metric": "chrF (PL↔EN, sacrebleu)",
               "n": len(pairs), "seed": SEED, "date": os.environ.get("RUN_DATE", ""),
               "models": results, "winner": winner["display_name"],
               "margin": round(abs(results[0]["chrf_overall"]-results[1]["chrf_overall"]), 1)}
    os.makedirs(OUT, exist_ok=True)
    json.dump(payload, open(f"{OUT}/flores_n{len(pairs)}_s{SEED}.json", "w"), ensure_ascii=False, indent=2)
    print(f"[flores] winner={winner['display_name']} +{payload['margin']} chrF", flush=True)

if __name__ == "__main__":
    main()
