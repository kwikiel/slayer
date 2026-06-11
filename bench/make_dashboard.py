#!/usr/bin/env python3
"""Aggregate bench_results/*.json -> leaderboard.json + SUMMARY.txt + dashboard.html.
Run after each job so partial results are always viewable. Partial-safe."""
import json, os, glob, datetime

OUT = "/home/kacper/bench_results"
NAMES = ["Bielik-11B-v3.0-Instruct", "Qwen3.5-9B"]
SHORT = {"Bielik-11B-v3.0-Instruct": "Bielik-11B-v3", "Qwen3.5-9B": "Qwen3.5-9B"}
PRIMARY = {"poquad": "judged_accuracy", "llmzszl": "accuracy", "belebele": "accuracy",
           "pes": "accuracy", "flores": "chrf_overall", "include": "accuracy",
           "belebele_en": "accuracy", "mmlu": "accuracy", "arc": "accuracy", "gsm8k": "accuracy"}
LABEL = {"llmzszl": "LLMzSzŁ", "belebele": "Belebele (PL)", "pes": "PES (medyczny)",
         "poquad": "PoQuAD", "flores": "FLORES-200 (PL↔EN)", "include": "INCLUDE-44 (PL)",
         "belebele_en": "Belebele (EN)", "mmlu": "MMLU (EN)", "arc": "ARC-C (EN)", "gsm8k": "GSM8K (EN)"}

def load():
    out = []
    for f in sorted(glob.glob(f"{OUT}/*.json")):
        if os.path.basename(f) in ("leaderboard.json", "status.json"): continue
        try:
            p = json.load(open(f, encoding="utf-8"))
            if isinstance(p, dict) and "benchmark" in p and "models" in p:
                out.append(p)
        except Exception: pass
    return out

def val(p, model):
    key = PRIMARY.get(p["benchmark"], "accuracy")
    for m in p["models"]:
        if m["display_name"] == model: return m.get(key)
    return None

def main():
    raw = load()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    # group by benchmark; headline = largest sample (then most recent); mean across all runs
    groups = {}
    for p in raw: groups.setdefault(p["benchmark"], []).append(p)
    benches = []
    for bn, runs in groups.items():
        head = max(runs, key=lambda r: r["n"])
        head = dict(head); head["runs"] = len(runs)
        # mean of primary metric per model across all runs of this bench
        means = {}
        for nm in NAMES:
            vs = [val(r, nm) for r in runs if val(r, nm) is not None]
            if vs: means[nm] = round(sum(vs)/len(vs), 1)
        head["mean_across_runs"] = means
        head["seeds"] = sorted({r.get("seed") for r in runs})
        benches.append(head)
    order = {"llmzszl": 0, "pes": 1, "include": 2, "belebele": 3, "poquad": 4, "flores": 5,
             "belebele_en": 6, "arc": 7, "mmlu": 8, "gsm8k": 9}
    benches.sort(key=lambda p: order.get(p["benchmark"], 9))
    tally = {n: 0 for n in NAMES}
    for p in benches:
        if p.get("winner") in tally and p.get("margin", 0) > 0:
            tally[p["winner"]] += 1
    json.dump({"generated_at": now, "tally": tally, "benchmarks": benches},
              open(f"{OUT}/leaderboard.json", "w"), ensure_ascii=False, indent=2)

    # SUMMARY.txt
    lines = [f"BIELIK SLAYER — LEADERBOARD  (aktualizacja: {now})", "=" * 64,
             f"Wynik zbiorczy:  Bielik {tally[NAMES[0]]} : {tally[NAMES[1]]} Qwen3.5-9B", ""]
    lines.append(f"{'Benchmark':<16}{'metryka':<22}{'Bielik':>8}{'Qwen':>8}{'zwycięzca':>16}")
    lines.append("-" * 70)
    for p in benches:
        b, q = val(p, NAMES[0]), val(p, NAMES[1])
        lines.append(f"{LABEL.get(p['benchmark'],p['benchmark']):<16}{p['metric'][:21]:<22}"
                     f"{(str(b)):>8}{(str(q)):>8}{SHORT.get(p['winner'],p['winner'])+' +'+str(p['margin']):>16}")
    lines.append("")
    for p in benches:
        lines.append(f"[{LABEL.get(p['benchmark'],p['benchmark'])}] n={p['n']} seed={p.get('seed','-')} "
                     f"judge={p.get('judge','-')}")
    open(f"{OUT}/SUMMARY.txt", "w", encoding="utf-8").write("\n".join(lines))

    # dashboard.html (self-contained)
    rows = ""
    for p in benches:
        b, q = val(p, NAMES[0]), val(p, NAMES[1])
        wb = "win" if p["winner"] == NAMES[0] else ""
        wq = "win" if p["winner"] == NAMES[1] else ""
        rows += (f"<tr><td><b>{LABEL.get(p['benchmark'],p['benchmark'])}</b>"
                 f"<div class=meta>{p['metric']} · n={p['n']}</div></td>"
                 f"<td class='s {wb}'>{b}</td><td class='s {wq}'>{q}</td>"
                 f"<td>{SHORT.get(p['winner'],p['winner'])} +{p['margin']}</td></tr>")
    html = f"""<!doctype html><html lang=pl><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>Bielik Slayer — Leaderboard</title><style>
body{{margin:0;background:#0d1016;color:#e8eaee;font:16px/1.5 ui-sans-serif,system-ui;padding:32px}}
h1{{font-size:1.8rem;margin:0 0 4px}}.t{{color:#8b93a3;margin:0 0 24px;font-size:.9rem}}
.score{{font-size:2.6rem;font-weight:900;margin:14px 0 28px}}.score .b{{color:#23f49a}}.score .q{{color:#9aa3b2}}
table{{border-collapse:collapse;width:100%;max-width:780px}}td,th{{padding:12px 14px;border-bottom:1px solid #232936;text-align:left}}
td.s{{text-align:center;font-variant-numeric:tabular-nums;font-weight:800;font-size:1.1rem}}
td.s.win{{color:#23f49a}}.meta{{color:#8b93a3;font-size:.8rem;margin-top:3px;font-weight:400}}
th{{color:#8b93a3;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}}</style></head><body>
<h1>Bielik Slayer — Leaderboard</h1><div class=t>Bielik-11B-v3 vs Qwen3.5-9B · aktualizacja {now}</div>
<div class=score><span class=b>Bielik {tally[NAMES[0]]}</span> : <span class=q>{tally[NAMES[1]]} Qwen3.5-9B</span></div>
<table><tr><th>Benchmark</th><th>Bielik-11B-v3</th><th>Qwen3.5-9B</th><th>zwycięzca</th></tr>{rows}</table>
</body></html>"""
    open(f"{OUT}/dashboard.html", "w", encoding="utf-8").write(html)
    print(f"[dashboard] {len(benches)} benchmarków, Bielik {tally[NAMES[0]]}:{tally[NAMES[1]]} Qwen @ {now}")

if __name__ == "__main__":
    main()
