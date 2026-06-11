#!/usr/bin/env python3
"""Generic MCQ benchmark via ollama. Accuracy = decisive metric. Aggregates only
(per-category accuracy COUNTS; no per-item inspection). Idempotent: skips if a
result for (bench, seed) already exists. Usage: bench_mcq.py <bench> [N] [seed]
benches: llmzszl belebele belebele_en pes include mmlu arc
"""
import json, re, sys, time, random, csv, urllib.request, os, glob
from collections import defaultdict
from huggingface_hub import hf_hub_download, HfApi

OLLAMA = "http://127.0.0.1:11434/api/chat"
OUT = os.environ.get("BENCH_OUT", os.path.expanduser("~/bench_results"))
MODELS = [
    ("Bielik-11B-v3.0-Instruct", "hf.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF:Q4_K_M"),
    ("Qwen3.5-9B",               "qwen3.5:9b"),
]
SYS_PL = ("Rozwiązujesz test wielokrotnego wyboru. Wybierz dokładnie jedną poprawną odpowiedź. "
          "Odpowiedz WYŁĄCZNIE literą odpowiedzi (np. B). Bez uzasadnienia.")
SYS_EN = ("You are answering a multiple-choice test. Choose exactly one correct answer. "
          "Reply with ONLY the answer letter (e.g. B). No explanation.")

def sample_strat(items, n, seed):
    if not n or n >= len(items):
        random.seed(seed); random.shuffle(items); return items
    by = defaultdict(list)
    for it in items: by[it["cat"]].append(it)
    random.seed(seed); out = []; tot = len(items)
    for c, lst in by.items():
        k = max(1, round(n * len(lst) / tot))
        out += random.sample(lst, min(k, len(lst)))
    random.shuffle(out); return out[:n]

def load_llmzszl(n, seed):
    p = hf_hub_download("amu-cai/llmzszl-dataset", "llmzszl-test.jsonl", repo_type="dataset")
    rows = [json.loads(l) for l in open(p, encoding="utf-8")]
    rows = [r for r in rows if r.get("answers") and r.get("correct_answer_index") is not None
            and r["correct_answer_index"] < len(r["answers"])]
    items = [{"q": r["question"], "options": r["answers"], "gold": r["correct_answer_index"],
              "cat": r.get("name", "?")} for r in rows]
    return sample_strat(items, n, seed)

def _belebele(n, seed, cfg):
    from datasets import load_dataset
    ds = load_dataset("facebook/belebele", cfg, split="test")
    items = [{"q": r["flores_passage"] + "\n\nQuestion: " + r["question"],
              "options": [r["mc_answer1"], r["mc_answer2"], r["mc_answer3"], r["mc_answer4"]],
              "gold": int(r["correct_answer_num"]) - 1, "cat": cfg} for r in ds]
    return sample_strat(items, n, seed)

def load_belebele(n, seed): return _belebele(n, seed, "pol_Latn")
def load_belebele_en(n, seed): return _belebele(n, seed, "eng_Latn")

def load_pes(n, seed):
    api = HfApi()
    csvs = [f for f in api.list_repo_files("speakleash/PES-2018-2022", repo_type="dataset") if f.endswith(".csv")]
    L2I = {c: i for i, c in enumerate("ABCDE")}
    items = []
    for fn in csvs:
        p = hf_hub_download("speakleash/PES-2018-2022", fn, repo_type="dataset")
        for r in csv.DictReader(open(p, encoding="utf-8")):
            lab = (r.get("label") or "").strip().upper()
            qf = r.get("question_final") or r.get("question")
            if lab in L2I and qf:
                items.append({"q": qf, "options": None, "gold": L2I[lab],
                              "cat": r.get("specialization", "?"), "noptions": 5})
    return sample_strat(items, n, seed)

def load_include(n, seed):
    from datasets import load_dataset
    ds = load_dataset("CohereForAI/include-base-44", "Polish", split="test")
    items = []
    for r in ds:
        opts = [r["option_a"], r["option_b"], r["option_c"], r["option_d"]]
        a = str(r["answer"]).strip()
        gold = "abcdABCD".find(a) % 4 if a and a[0].lower() in "abcd" else int(a)  # 0-based int
        if 0 <= gold < 4:
            items.append({"q": r["question"], "options": opts, "gold": gold, "cat": r.get("domain", "?")})
    return sample_strat(items, n, seed)

def load_mmlu(n, seed):
    from datasets import load_dataset
    ds = load_dataset("cais/mmlu", "all", split="test")
    items = [{"q": r["question"], "options": list(r["choices"]), "gold": int(r["answer"]),
              "cat": r.get("subject", "?")} for r in ds]
    return sample_strat(items, n, seed)

def load_arc(n, seed):
    from datasets import load_dataset
    ds = load_dataset("allenai/ai2_arc", "ARC-Challenge", split="test")
    items = []
    for r in ds:
        labels = list(r["choices"]["label"]); texts = list(r["choices"]["text"])
        if r["answerKey"] in labels:
            items.append({"q": r["question"], "options": texts,
                          "gold": labels.index(r["answerKey"]), "cat": "arc-challenge"})
    return sample_strat(items, n, seed)

BENCHES = {
    "llmzszl": (load_llmzszl, "pl"), "belebele": (load_belebele, "pl"),
    "belebele_en": (load_belebele_en, "en"), "pes": (load_pes, "pl"),
    "include": (load_include, "pl"), "mmlu": (load_mmlu, "en"), "arc": (load_arc, "en"),
}

def ask(model, it, sysp):
    if it["options"]:
        block = "\n".join(f"{chr(65+i)}. {o}" for i, o in enumerate(it["options"]))
        content = f"{it['q']}\n\n{block}\n\n" + ("Answer (letter only):" if sysp is SYS_EN else "Odpowiedź (sama litera):")
        nopt = len(it["options"])
    else:
        content = f"{it['q']}\n\nOdpowiedź (sama litera):"; nopt = it.get("noptions", 5)
    body = {"model": model, "stream": False, "think": False,
            "options": {"temperature": 0, "num_predict": 8, "num_ctx": 4096},
            "messages": [{"role": "system", "content": sysp}, {"role": "user", "content": content}]}
    req = urllib.request.Request(OLLAMA, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())["message"]["content"], nopt
        except Exception as e:
            if a == 2: return f"__ERR__{e}", nopt
            time.sleep(2)

def parse_letter(out, nopt):
    out = re.sub(r"<think>.*?</think>", " ", out, flags=re.S).strip().upper()
    m = re.search(r"\b([A-Z])\b", out) or re.search(r"([A-Z])", out)
    if m:
        idx = ord(m.group(1)) - 65
        if 0 <= idx < nopt: return idx
    return -1

def run(bench, n, seed):
    if glob.glob(f"{OUT}/{bench}_n*_s{seed}.json"):
        print(f"[{bench}] SKIP — wynik dla seed={seed} już istnieje", flush=True); return
    loader, lang = BENCHES[bench]
    sysp = SYS_EN if lang == "en" else SYS_PL
    sample = loader(n, seed)
    print(f"[{bench}] sample={len(sample)} seed={seed} lang={lang}", flush=True)
    results = []
    for name, tag in MODELS:
        ok = bad = 0; ct_ok = defaultdict(int); ct_n = defaultdict(int); t0 = time.time()
        for i, it in enumerate(sample):
            out, nopt = ask(tag, it, sysp)
            pred = parse_letter(out, nopt)
            if pred == -1: bad += 1
            c = int(pred == it["gold"]); ok += c
            ct_ok[it["cat"]] += c; ct_n[it["cat"]] += 1
            if (i+1) % 200 == 0:
                print(f"  [{name}] {i+1}/{len(sample)} acc={ok/(i+1)*100:.1f}% ({time.time()-t0:.0f}s)", flush=True)
        nn = len(sample)
        bycat_all = {c: round(ct_ok[c]/ct_n[c]*100, 1) for c in ct_n if ct_n[c] >= 15}
        bycat = {c: v for c, v in bycat_all.items() if ct_n[c] >= 20}
        results.append({"display_name": name, "tag": tag, "n": nn,
                        "accuracy": round(ok/nn*100, 1), "unparsed": bad,
                        "by_category_top": dict(sorted(bycat.items(), key=lambda x:-x[1])),
                        "by_category": bycat_all,
                        "category_n": {c: ct_n[c] for c in ct_n if ct_n[c] >= 15},
                        "secs": round(time.time()-t0, 1)})
        print(f"  [{name}] DONE acc={results[-1]['accuracy']}%", flush=True)
    winner = max(results, key=lambda r: r["accuracy"])
    payload = {"benchmark": bench, "metric": "accuracy (MCQ, exact letter)" + (" [EN regresja]" if lang == "en" else ""),
               "n": len(sample), "seed": seed, "lang": lang, "date": os.environ.get("RUN_DATE", ""),
               "models": results, "winner": winner["display_name"],
               "margin": round(abs(results[0]["accuracy"]-results[1]["accuracy"]), 1)}
    os.makedirs(OUT, exist_ok=True)
    json.dump(payload, open(f"{OUT}/{bench}_n{len(sample)}_s{seed}.json", "w"), ensure_ascii=False, indent=2)
    print(f"[{bench}] winner={winner['display_name']} +{payload['margin']}", flush=True)

if __name__ == "__main__":
    run(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 0, int(sys.argv[3]) if len(sys.argv) > 3 else 42)
