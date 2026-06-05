#!/usr/bin/env python3
"""Decisive LLM-judge re-scoring of the saved PoQuAD run.

Judge = Qwen3.5-35B-A3B served by llama.cpp on :8088 (neutral-ish, reference-based).
For each answerable question the judge decides TAK/NIE: czy odpowiedz modelu jest
merytorycznie poprawna wzgledem zlotej odpowiedzi (niezaleznie od formy/odmiany).
Unanswerable: correct iff model abstained (already flagged). Output: single accuracy.
"""
import json, re, urllib.request, time

JUDGE = "http://127.0.0.1:8088/v1/chat/completions"
JUDGE_MODEL = "qwen3.5-35b-a3b"

def strip_think(s):
    return re.sub(r"<think>.*?</think>", " ", s, flags=re.S).strip()

def is_abstain(pred):
    return "brak odpowiedzi" in re.sub(r"[^\w\s]", " ", pred.lower())

def judge(question, golds, pred):
    sys = ("Jesteś surowym sędzią poprawności odpowiedzi na pytania. "
           "Dostajesz pytanie, listę poprawnych (złotych) odpowiedzi oraz odpowiedź modelu. "
           "Oceń, czy odpowiedź modelu jest merytorycznie poprawna — czyli zawiera właściwą informację "
           "ze złotej odpowiedzi — niezależnie od formy gramatycznej, odmiany, dodatkowych słów czy pełnego zdania. "
           "Jeśli odpowiedź modelu jest błędna, niepełna w kluczowym fakcie albo zmyślona, oceń jako NIE. "
           "Odpowiedz wyłącznie jednym słowem: TAK albo NIE.")
    usr = (f"Pytanie: {question}\n"
           f"Złote odpowiedzi: {' | '.join(golds)}\n"
           f"Odpowiedź modelu: {pred}\n\nWerdykt (TAK/NIE):")
    body = {"model": JUDGE_MODEL, "temperature": 0, "max_tokens": 16,
            "chat_template_kwargs": {"enable_thinking": False},
            "messages": [{"role": "system", "content": sys}, {"role": "user", "content": usr}]}
    req = urllib.request.Request(JUDGE, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                out = strip_think(json.loads(r.read())["choices"][0]["message"]["content"]).upper()
                # robust: take the last explicit verdict token
                toks = re.findall(r"\b(TAK|NIE)\b", out)
                if toks:
                    return toks[-1] == "TAK"
                return out.startswith("T")
        except Exception as e:
            if a == 2:
                print("  judge err:", e)
                return None
            time.sleep(2)

def main():
    d = json.load(open("/home/kacper/poquad_results.json"))
    summary = []
    for r in d:
        name = r["display_name"]
        ans_ok = ans_n = no_ok = no_n = 0
        print(f"=== judging {name} ===", flush=True)
        for i, row in enumerate(r["rows"]):
            if row["impossible"]:
                no_n += 1
                if is_abstain(row["pred"]):
                    no_ok += 1
            else:
                ans_n += 1
                # wrong if it abstained on an answerable q
                if is_abstain(row["pred"]) or not row["gold"]:
                    verdict = False
                else:
                    verdict = judge(row["q"], row["gold"], row["pred"])
                if verdict:
                    ans_ok += 1
            if (i + 1) % 20 == 0:
                print(f"  {i+1}/100", flush=True)
        n = ans_n + no_n
        acc = (ans_ok + no_ok) / n * 100
        s = {"model": name, "judged_accuracy": round(acc, 1),
             "answerable_correct": ans_ok, "answerable_n": ans_n,
             "answerable_acc": round(ans_ok / ans_n * 100, 1) if ans_n else None,
             "unanswerable_abstain": no_ok, "unanswerable_n": no_n}
        summary.append(s)
        print(json.dumps(s, ensure_ascii=False), flush=True)
    json.dump(summary, open("/home/kacper/poquad_judged.json", "w"), ensure_ascii=False, indent=2)
    print("\n===== DECISIVE (LLM-judge, n=100) =====")
    print(f"{'Model':<28}{'acc':>8}{'odp.acc':>10}{'abst.':>8}")
    for s in summary:
        print(f"{s['model']:<28}{s['judged_accuracy']:>7}%{s['answerable_acc']:>9}%"
              f"{s['unanswerable_abstain']:>5}/{s['unanswerable_n']}")
    if len(summary) == 2:
        a, b = summary
        win = a if a["judged_accuracy"] > b["judged_accuracy"] else b
        diff = abs(a["judged_accuracy"] - b["judged_accuracy"])
        print(f"\nZwycięzca: {win['model']}  (+{round(diff,1)} pkt)")

if __name__ == "__main__":
    main()
