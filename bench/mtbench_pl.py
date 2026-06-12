#!/usr/bin/env python3
"""MT-Bench-PL — wewnętrzna bramka jakości czatu PL (druga połowa kryterium publikacji).

Pytania: lightblue/mt_bench_polish (80 pytań MT-Bench po polsku, 8 kategorii, 2 tury).
UWAGA metodologiczna: to NIE jest oficjalny MT-Bench-PL speakleasha (niepubliczny) —
wyniki służą WYŁĄCZNIE jako delta base-vs-tuned na tym samym sędzi i tych samych
pytaniach (bramka wewnętrzna). Claim publiczny = oficjalna ewaluacja leaderboardu.

Sędzia: otwarty qwen/qwen3.5-122b-a10b (single-answer grading 1-10 per tura,
z referencją dla math/reasoning gdy dostępna). Zero Anthropic/OpenAI.
Temperatury per kategoria jak w oryginalnym MT-Bench.

Usage:
  python3 bench/mtbench_pl.py --model qwen/qwen3.5-27b                 # OpenRouter
  OLLAMA_URL=http://127.0.0.1:11435 python3 bench/mtbench_pl.py \
      --model ollama:slayer-style-27b                                  # lokalny GGUF
  python3 bench/mtbench_pl.py --compare results/mtbench_pl_A.json results/mtbench_pl_B.json
Out: results/mtbench_pl_<model>.json (tylko agregaty + werdykty per pytanie bez treści)
"""
import argparse
import json
import os
import re
import time
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

API = "https://openrouter.ai/api/v1/chat/completions"
JUDGE = os.environ.get("VERIFY_JUDGE", "qwen/qwen3.5-122b-a10b")
if re.search(r"anthropic|claude|openai/(?!gpt-oss)", JUDGE, re.I):
    raise SystemExit(f"VERIFY_JUDGE={JUDGE} łamie regułę provenance.")
KEY = os.environ.get("OPENROUTER_API_KEY") or (
    open(os.path.expanduser("~/.openrouter_key")).read().strip()
    if os.path.exists(os.path.expanduser("~/.openrouter_key")) else "")
OLLAMA = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11435")
QUESTIONS = "lightblue/mt_bench_polish"

# temperatury per kategoria (oryginalny MT-Bench)
TEMP = {"writing": 0.7, "roleplay": 0.7, "extraction": 0.0, "math": 0.0, "coding": 0.0,
        "reasoning": 0.0, "stem": 0.1, "humanities": 0.1}

SYS_GEN = "Odpowiadasz po polsku, rzeczowo i naturalnie."

JSYS = ("Jesteś bezstronnym sędzią jakości odpowiedzi asystenta AI po polsku. Oceń odpowiedź na "
        "pytanie użytkownika: poprawność, pomocność, głębię, naturalność polszczyzny (kalki i drętwy "
        "styl obniżają ocenę). Jeśli podano REFERENCJĘ, porównaj z nią poprawność merytoryczną. "
        "Najpierw JEDNO zdanie uzasadnienia, potem werdykt w formacie [[X]] gdzie X = ocena 1-10.")


def http_json(url, body, headers, timeout=180, tries=4):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
    for a in range(tries):
        try:
            return json.loads(urllib.request.urlopen(req, timeout=timeout).read())
        except Exception as e:
            if a == tries - 1:
                print("  err:", str(e)[:80], flush=True)
                return None
            time.sleep(2 * (a + 1))


def gen_answer(model, messages, temp):
    if model.startswith("ollama:"):
        d = http_json(f"{OLLAMA}/api/chat",
                      {"model": model[7:], "stream": False, "think": False,
                       "options": {"temperature": temp, "num_predict": 1400},
                       "messages": messages},
                      {"Content-Type": "application/json"})
        ans = (d or {}).get("message", {}).get("content", "")
    else:
        d = http_json(API, {"model": model, "temperature": temp, "max_tokens": 1400,
                            "reasoning": {"enabled": False}, "messages": messages},
                      {"Content-Type": "application/json", "Authorization": "Bearer " + KEY})
        ans = ((d or {}).get("choices") or [{}])[0].get("message", {}).get("content") or ""
    return re.sub(r"<think>.*?</think>", " ", ans, flags=re.S).strip()


def judge_turn(q, ans, ref):
    refpart = f"\n\nREFERENCJA (wzorcowa odpowiedź):\n{ref[:2000]}" if ref else ""
    d = http_json(API, {"model": JUDGE, "temperature": 0.0, "max_tokens": 300,
                        "reasoning": {"enabled": False},
                        "messages": [{"role": "system", "content": JSYS},
                                     {"role": "user", "content":
                                      f"PYTANIE:\n{q[:2000]}{refpart}\n\nODPOWIEDŹ ASYSTENTA:\n{ans[:6000]}"}]},
                  {"Content-Type": "application/json", "Authorization": "Bearer " + KEY})
    c = ((d or {}).get("choices") or [{}])[0].get("message", {}).get("content") or ""
    m = re.search(r"\[\[(\d+(?:\.\d+)?)\]\]", c)
    return float(m.group(1)) if m else None


def run_model(model, workers):
    from datasets import load_dataset
    qs = list(load_dataset(QUESTIONS, split="train"))
    print(f"[mtb] {len(qs)} pytań | model={model} | judge={JUDGE}", flush=True)

    def work(q):
        temp = TEMP.get(q["category"], 0.7)
        msgs = [{"role": "system", "content": SYS_GEN}]
        answers = []
        for turn in q["turns"]:
            msgs.append({"role": "user", "content": turn})
            a = gen_answer(model, msgs, temp)
            msgs.append({"role": "assistant", "content": a})
            answers.append(a)
        refs = q.get("references") or []
        scores = []
        for i, (t, a) in enumerate(zip(q["turns"], answers)):
            scores.append(judge_turn(t, a, refs[i] if i < len(refs) else ""))
        return q, answers, scores

    per_cat = defaultdict(list)
    items = []
    empty = 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        for q, answers, scores in ex.map(work, qs):
            ok = [s for s in scores if s is not None]
            if any(not a.strip() for a in answers):
                empty += 1
            if ok:
                per_cat[q["category"]].extend(ok)
            items.append({"question_id": q["question_id"], "category": q["category"],
                          "scores": scores})
    cat_means = {c: round(sum(v) / len(v), 2) for c, v in sorted(per_cat.items())}
    allv = [s for v in per_cat.values() for s in v]
    result = {"model": model, "judge": JUDGE, "questions": QUESTIONS,
              "overall": round(sum(allv) / max(len(allv), 1), 2),
              "per_category": cat_means, "n_scored_turns": len(allv),
              "empty_answers": empty, "items": items,
              "note": "wewnętrzna bramka: porównywalne TYLKO między modelami na tym samym sędzi/pytaniach"}
    safe = re.sub(r"[^a-zA-Z0-9.-]", "_", model)
    out = f"results/mtbench_pl_{safe}.json"
    os.makedirs("results", exist_ok=True)
    json.dump(result, open(out, "w"), ensure_ascii=False, indent=2)
    print(f"[mtb] overall {result['overall']} | {cat_means}" +
          (f" | PUSTE: {empty} (artefakt harnessu!)" if empty else ""), flush=True)
    print(f"[mtb] -> {out}", flush=True)


def compare(a_path, b_path):
    a, b = json.load(open(a_path)), json.load(open(b_path))
    if a["judge"] != b["judge"] or a["questions"] != b["questions"]:
        print("UWAGA: różny sędzia/pytania — delta NIEPORÓWNYWALNA")
    print(f"{'kategoria':<14} {a['model'][:24]:>26} {b['model'][:24]:>26}  delta")
    for c in sorted(set(a["per_category"]) | set(b["per_category"])):
        av, bv = a["per_category"].get(c), b["per_category"].get(c)
        d = (bv - av) if (av is not None and bv is not None) else None
        print(f"{c:<14} {av!s:>26} {bv!s:>26}  {f'{d:+.2f}' if d is not None else '—'}")
    print(f"{'OVERALL':<14} {a['overall']:>26} {b['overall']:>26}  {b['overall']-a['overall']:+.2f}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--compare", nargs=2, metavar=("A.json", "B.json"))
    a = ap.parse_args()
    if a.compare:
        compare(*a.compare)
        return
    if not a.model:
        raise SystemExit("podaj --model (openrouter id albo ollama:<tag>) lub --compare")
    if not a.model.startswith("ollama:") and not KEY:
        raise SystemExit("BRAK klucza: OPENROUTER_API_KEY albo ~/.openrouter_key")
    run_model(a.model, a.workers)


if __name__ == "__main__":
    main()
