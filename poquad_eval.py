#!/usr/bin/env python3
"""PoQuAD (clarin-pl/poquad) mini-benchmark: Bielik vs Qwen via ollama.

SQuAD 2.0 style scoring:
  - answerable:   EM + token-F1 vs gold (max over text / generative_answer)
  - unanswerable: correct iff model abstains ("Brak odpowiedzi w tekście")
Deterministic 100-question sample (seed=42), identical for both models.
"""
import json, re, sys, time, random, urllib.request
from collections import Counter
from huggingface_hub import hf_hub_download

OLLAMA = "http://127.0.0.1:11434/api/chat"
N = 100
SEED = 42
ABSTAIN = "Brak odpowiedzi w tekście"
MODELS = [
    ("Bielik-11B-v3.0-Instruct", "hf.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF:Q4_K_M"),
    ("Qwen3.5-9B",               "qwen3.5:9b"),
]
SYS = ("Jesteś asystentem QA. Odpowiadasz WYŁĄCZNIE na podstawie podanego fragmentu tekstu. "
       "Odpowiedz maksymalnie krótko (sam fakt z tekstu, bez zdania wprowadzającego). "
       f"Jeśli w tekście nie ma odpowiedzi na pytanie, odpowiedz dokładnie: {ABSTAIN}")

def norm(s):
    s = s.lower()
    s = re.sub(r"<think>.*?</think>", " ", s, flags=re.S)
    s = re.sub(r"[^\w\s]", " ", s, flags=re.U)
    return " ".join(s.split())

def f1(pred, gold):
    p, g = norm(pred).split(), norm(gold).split()
    if not p or not g:
        return float(p == g)
    common = Counter(p) & Counter(g)
    ns = sum(common.values())
    if ns == 0:
        return 0.0
    prec, rec = ns/len(p), ns/len(g)
    return 2*prec*rec/(prec+rec)

def is_abstain(pred):
    return "brak odpowiedzi" in norm(pred)

def build_sample():
    path = hf_hub_download("clarin-pl/poquad", "poquad-dev.json", repo_type="dataset")
    data = json.load(open(path))["data"]
    items = []
    for art in data:
        for para in art["paragraphs"]:
            ctx = para["context"]
            for qa in para["qas"]:
                golds = []
                for a in qa.get("answers", []):
                    if a.get("text"): golds.append(a["text"])
                    if a.get("generative_answer"): golds.append(a["generative_answer"])
                items.append({"context": ctx, "question": qa["question"],
                              "impossible": bool(qa.get("is_impossible")),
                              "golds": list(dict.fromkeys(golds))})
    random.seed(SEED)
    return random.sample(items, N)

def ask(model, ctx, q):
    body = {"model": model, "stream": False, "think": False,
            "options": {"temperature": 0, "num_predict": 96, "num_ctx": 8192},
            "messages": [{"role": "system", "content": SYS},
                         {"role": "user", "content": f"Tekst:\n{ctx}\n\nPytanie: {q}\n\nOdpowiedź:"}]}
    req = urllib.request.Request(OLLAMA, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read())["message"]["content"].strip()
        except Exception as e:
            if attempt == 2:
                return f"__ERROR__ {e}"
            time.sleep(3)

def score(model, sample):
    has_em = has_f1 = has_n = 0
    no_ok = no_n = 0
    rows = []
    t0 = time.time()
    for i, it in enumerate(sample):
        pred = ask(model, it["context"], it["question"])
        ab = is_abstain(pred)
        if it["impossible"]:
            no_n += 1
            ok = 1 if ab else 0
            no_ok += ok
            em = ff = float(ok)
        else:
            has_n += 1
            if ab:
                em = ff = 0.0
            else:
                em = max(float(norm(pred) == norm(g)) for g in it["golds"]) if it["golds"] else 0.0
                ff = max(f1(pred, g) for g in it["golds"]) if it["golds"] else 0.0
            has_em += em; has_f1 += ff
        rows.append({"q": it["question"], "impossible": it["impossible"],
                     "gold": it["golds"], "pred": pred, "em": em, "f1": round(ff, 3)})
        if (i+1) % 10 == 0:
            print(f"  [{model}] {i+1}/{N}  ({time.time()-t0:.0f}s)", flush=True)
    n = len(sample)
    overall_em = (has_em + no_ok) / n * 100
    overall_f1 = (has_f1 + no_ok) / n * 100
    return {
        "model": model, "n": n,
        "overall_EM": round(overall_em, 1),
        "overall_F1": round(overall_f1, 1),
        "answerable_n": has_n,
        "answerable_EM": round(has_em/has_n*100, 1) if has_n else None,
        "answerable_F1": round(has_f1/has_n*100, 1) if has_n else None,
        "unanswerable_n": no_n,
        "unanswerable_abstain_acc": round(no_ok/no_n*100, 1) if no_n else None,
        "secs": round(time.time()-t0, 1),
        "rows": rows,
    }

def main():
    sample = build_sample()
    nimp = sum(x["impossible"] for x in sample)
    print(f"Sample: {len(sample)} pytań ({len(sample)-nimp} odpowiadalnych, {nimp} nieodpowiadalnych), seed={SEED}\n", flush=True)
    results = []
    for name, tag in MODELS:
        print(f"=== {name} ({tag}) ===", flush=True)
        res = score(tag, sample)
        res["display_name"] = name
        results.append(res)
        print(json.dumps({k: v for k, v in res.items() if k != "rows"}, ensure_ascii=False, indent=2), flush=True)
        print(flush=True)
    json.dump(results, open("/home/kacper/poquad_results.json", "w"), ensure_ascii=False, indent=2)
    print("\n================ PODSUMOWANIE (PoQuAD, n=100) ================")
    print(f"{'Model':<28}{'EM':>7}{'F1':>7}{'odp.F1':>9}{'abst.acc':>10}{'czas':>8}")
    for r in results:
        print(f"{r['display_name']:<28}{r['overall_EM']:>7}{r['overall_F1']:>7}"
              f"{r['answerable_F1']:>9}{r['unanswerable_abstain_acc']:>10}{r['secs']:>7.0f}s")

if __name__ == "__main__":
    main()
