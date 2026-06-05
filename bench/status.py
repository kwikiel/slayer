#!/usr/bin/env python3
"""Parse queue.log + leaderboard.json -> status.json (live queue state + ETA).
No dependency on the queue internals; safe to run on a loop every ~20s."""
import json, re, os, time, glob
from datetime import datetime

BR = "/home/kacper/bench_results"
LOG = f"{BR}/queue.log"
TS = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)\s")
NB, NQ = "Bielik-11B-v3.0-Instruct", "Qwen3.5-9B"
PRIMARY = {"poquad": "judged_accuracy", "llmzszl": "accuracy", "belebele": "accuracy",
           "pes": "accuracy", "flores": "chrf_overall", "include": "accuracy",
           "belebele_en": "accuracy", "mmlu": "accuracy", "arc": "accuracy", "gsm8k": "accuracy"}
LABEL = {"llmzszl": "LLMzSzŁ", "belebele": "Belebele (PL)", "pes": "PES (medyczny)",
         "poquad": "PoQuAD", "flores": "FLORES-200 PL↔EN", "include": "INCLUDE-44 (PL)",
         "belebele_en": "Belebele (EN)", "mmlu": "MMLU (EN)", "arc": "ARC-C (EN)", "gsm8k": "GSM8K (EN)"}
UNIT = {"flores": "chrF", "poquad": "%", "default": "%"}
FAZA_A = [
    ("Belebele PL (full 900)", "belebele"),
    ("LLMzSzŁ (FULL 18821)", "llmzszl"),
    ("PES medyczny (FULL)", "pes"),
    ("PoQuAD (1500 + sędzia)", "poquad"),
    ("FLORES-200 PL↔EN (600)", "flores"),
    ("INCLUDE-44 (PL, full)", "include"),
    ("Belebele EN (full 900)", "belebele_en"),
    ("ARC-Challenge (EN, full)", "arc"),
    ("MMLU (EN, 2000)", "mmlu"),
    ("GSM8K (EN, 600)", "gsm8k"),
]

def to_ts(s):
    try: return datetime.strptime(s, "%Y-%m-%d %H:%M:%S").timestamp()
    except Exception: return None

def main():
    now = time.time()
    st = {"now_ts": now, "now": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
          "started_ts": None, "deadline_ts": None, "max_hours": 22, "phase": "start",
          "jobs_faza_a": [], "current": None, "keep_warm": False,
          "hermes": "paused", "tally": {}, "benchmarks_done": 0}
    lines = []
    if os.path.exists(LOG):
        lines = open(LOG, encoding="utf-8", errors="ignore").read().splitlines()

    started = None; max_h = 22
    starts = []; oks = []; fails = []
    for ln in lines:
        m = TS.match(ln)
        if "KOLEJKA START" in ln and m:
            started = to_ts(m.group(1))
            mm = re.search(r"limit (\d+)h", ln)
            if mm: max_h = int(mm.group(1))
        if ">>> START:" in ln:
            starts.append(ln.split(">>> START:", 1)[1].split("[t+")[0].strip())
        if "<<< OK:" in ln: oks.append(ln.split("<<< OK:", 1)[1].strip())
        if "<<< FAIL:" in ln: fails.append(ln.split("<<< FAIL:", 1)[1].strip())
    st["started_ts"] = started
    st["max_hours"] = max_h
    if started: st["deadline_ts"] = started + max_h * 3600

    finished = set(oks) | set(fails)
    current_label = starts[-1] if len(starts) > len(finished) else None

    # phase
    if any("pull judge" in l for l in lines) and not starts:
        st["phase"] = "pobieranie modelu-sędziego"
    elif current_label and any(current_label.startswith(j[0]) for j in FAZA_A):
        st["phase"] = "Faza A — pełne zbiory"
    elif current_label:
        st["phase"] = "Faza B — keep-warm (wiele seedów)"; st["keep_warm"] = True
    elif "KOLEJKA KONIEC" in "\n".join(lines[-5:]) or any("RESTORE" in l for l in lines[-8:]):
        st["phase"] = "zakończona — Hermes wznowiony"; st["hermes"] = "running"
    # Faza A checklist
    done_benches = set()
    for f in glob.glob(f"{BR}/*_n*_s*.json"):
        m = re.match(r"(.+)_n(\d+)_s\d+\.json", os.path.basename(f))
        if not m: continue
        key, nn = m.group(1), int(m.group(2))
        if key == "poquad" and nn < 1000: continue  # manualny n100 nie liczy się jako pełny PoQuAD
        done_benches.add(key)
    for label, key in FAZA_A:
        if any(label == o for o in oks): state = "done"
        elif any(label == f for f in fails): state = "fail"
        elif current_label == label: state = "running"
        elif key in done_benches: state = "done"
        else: state = "queued"
        st["jobs_faza_a"].append({"label": label, "key": key, "state": state})

    # current job progress: last progress line after the last START
    if current_label:
        prog = None
        for ln in reversed(lines):
            mm = re.search(r"\[([^\]]+)\]\s+(?:infer |judge )?(\d+)/(\d+).*?\((\d+)s\)", ln)
            if mm:
                model, done, total, secs = mm.group(1), int(mm.group(2)), int(mm.group(3)), int(mm.group(4))
                rate = done / secs if secs else 0
                eta = round((total - done) / rate) if rate else None
                phase_tag = "sędzia" if "judge" in ln else ("inferencja" if "infer" in ln else "")
                prog = {"label": current_label, "model": model, "done": done, "total": total,
                        "pct": round(done / total * 100, 1) if total else 0,
                        "secs": secs, "rate_per_s": round(rate, 2), "eta_secs": eta, "stage": phase_tag}
                break
            if ">>> START:" in ln: break
        st["current"] = prog or {"label": current_label, "pct": 0, "done": 0, "total": 0, "eta_secs": None}

    # leaderboard
    lb = f"{BR}/leaderboard.json"
    if os.path.exists(lb):
        try:
            d = json.load(open(lb, encoding="utf-8"))
            st["tally"] = d.get("tally", {})
            st["benchmarks_done"] = len(d.get("benchmarks", []))
            res = []
            for b in d.get("benchmarks", []):
                k = PRIMARY.get(b["benchmark"], "accuracy")
                mb = next((x for x in b["models"] if x["display_name"] == NB), {})
                mq = next((x for x in b["models"] if x["display_name"] == NQ), {})
                res.append({"benchmark": b["benchmark"], "label": LABEL.get(b["benchmark"], b["benchmark"]),
                            "unit": UNIT.get(b["benchmark"], UNIT["default"]), "metric": b.get("metric"),
                            "n": b["n"], "runs": b.get("runs", 1),
                            "bielik": mb.get(k), "qwen": mq.get(k),
                            "winner": b.get("winner"), "margin": b.get("margin")})
            st["results"] = res
        except Exception: pass

    # --- estymacja postępu Fazy A vs czas (ważona realnym czasem jobów) ---
    WEIGHTS = {"belebele": 340, "llmzszl": 6300, "pes": 10500, "poquad": 6000,
               "flores": 5000, "include": 500, "belebele_en": 340, "arc": 450,
               "mmlu": 760, "gsm8k": 3800}
    def faza_actual(key):
        best, bn = None, -1
        for f in glob.glob(f"{BR}/{key}_n*_s42.json"):
            m = re.match(rf"{re.escape(key)}_n(\d+)_s42\.json", os.path.basename(f))
            if m and int(m.group(1)) > bn:
                bn = int(m.group(1)); best = f
        if best:
            try: return sum(x.get("secs", 0) for x in json.load(open(best)).get("models", []))
            except Exception: pass
        return None
    total = done = 0.0
    cur_pct = (st["current"] or {}).get("pct", 0) / 100.0 if st.get("current") else 0
    for j in st["jobs_faza_a"]:
        w = WEIGHTS.get(j["key"], 1500)
        if j["state"] in ("done", "fail"):
            a = faza_actual(j["key"]) or w; total += a; done += a
        elif j["state"] == "running":
            total += w; done += w * cur_pct
        else:
            total += w
    eta = max(0, total - done)
    ndone = sum(1 for j in st["jobs_faza_a"] if j["state"] in ("done", "fail"))
    st["faza_a"] = {"done_jobs": ndone, "total_jobs": len(st["jobs_faza_a"]),
                    "overall_pct": round(done / total * 100, 1) if total else 0,
                    "eta_secs": round(eta), "projected_done_ts": round(now + eta)}

    json.dump(st, open(f"{BR}/status.json", "w"), ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
