#!/usr/bin/env python3
"""PolNative — generator leaderboardu (LEADERBOARD.md, natywny dla GitHuba).

Jedno źródło prawdy: results/polnative_v1.json (agregaty per model, akumulowane
przez polnative_eval.py). Renderuje ranking + macierz per domena + legendę.
Reprodukowalny: po każdym nowym runie odpal ponownie.

Tylko agregaty — itemy i odpowiedzi pozostają prywatne (eval_only, anti-leak).

Usage:
  python3 bench/polnative_leaderboard.py [--in results/polnative_v1.json]
                                         [--out LEADERBOARD.md] [--date 2026-06-13]
"""
import argparse
import datetime
import json

DOM_ORDER = ["fleksja", "skladnia", "ortografia", "leksyka", "frazeologia",
             "literatura", "realia", "kalibracja", "rejestr", "EQ", "naturalnosc"]
DOM_LABEL = {"skladnia": "składnia", "naturalnosc": "naturalność"}
MEDAL = {1: "🥇", 2: "🥈", 3: "🥉"}

# metadane modeli (params + link); klucz = klucz w results.json
META = {
    "bielik": ("Bielik-11B-v3", "11B", "https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct"),
    "qwen27b": ("Qwen3.5-27B", "27B", "https://huggingface.co/Qwen/Qwen3.5-27B"),
    "qwen9b": ("Qwen3.5-9B", "9B", "https://huggingface.co/Qwen/Qwen3.5-9B"),
    "slayer": ("Slayer-27B", "27B", "https://slayer.fabryka.ai"),
}


def meta(k):
    return META.get(k, (k, "—", None))


def dlabel(d):
    return DOM_LABEL.get(d, d)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", default="results/polnative_v1.json")
    ap.add_argument("--out", default="LEADERBOARD.md")
    ap.add_argument("--date", default=datetime.date.today().isoformat())
    a = ap.parse_args()

    d = json.load(open(a.inp, encoding="utf-8"))
    models = d["results"]
    n = d.get("n", "—")
    judge = d.get("judge", "—")
    ranked = sorted(models.items(), key=lambda kv: -kv[1]["score"]["all"])
    doms = [x for x in DOM_ORDER if any("dom:" + x in m["score"] for _, m in ranked)]

    L = []
    L.append("# PolNative — Leaderboard")
    L.append("")
    L.append("> Natywność polszczyzny: czy model pisze po polsku jak rodzimy użytkownik.")
    L.append("> Wyższy lepszy. Skala 0–100 (pass=1, mixed=0.5, fail=0).")
    L.append(f"> Generowane z `{a.inp}` przez `polnative_leaderboard.py`. `eval_only`, itemy prywatne.")
    L.append("")
    L.append(f"## v1 · {n} itemów · sędzia {judge}")
    L.append("")
    L.append("| # | Model | Params | Overall | Auto (formy) | Sędzia (styl) | Data |")
    L.append("|--:|---|--:|--:|--:|--:|---|")
    for i, (k, m) in enumerate(ranked, 1):
        name, params, url = meta(k)
        rank = f"{MEDAL.get(i,'')} {i}".strip()
        nm = f"[{name}]({url})" if url else name
        if i == 1:
            nm = f"**{nm}**"
        sc = m["score"]
        L.append(f"| {rank} | {nm} | {params} | **{sc['all']:.1f}** | "
                 f"{sc.get('tryb:auto',0):.1f} | {sc.get('tryb:judge',0):.1f} | {a.date} |")
    L.append("")
    L.append("### Per domena")
    L.append("")
    head = "| Model | " + " | ".join(dlabel(x) for x in doms) + " |"
    sep = "|---|" + "|".join("--:" for _ in doms) + "|"
    L.append(head)
    L.append(sep)
    for k, m in ranked:
        name = meta(k)[0]
        cells = []
        for x in doms:
            v = m["score"].get("dom:" + x)
            cells.append(f"{v:.0f}" if v is not None else "—")
        # pogrub najlepszy w kolumnie
        L.append(f"| {name} | " + " | ".join(cells) + " |")
    # zaznacz lidera kolumny
    best = {x: max(ranked, key=lambda km: km[1]["score"].get("dom:" + x, -1))[0] for x in doms}
    L.append("")
    leaders = ", ".join(f"{dlabel(x)} → {meta(best[x])[0]}" for x in doms)
    L.append(f"_Liderzy domen: {leaders}._")
    L.append("")
    L.append("### Metoda")
    L.append("")
    L.append("- **auto** — deterministyczne grupy substringów/regexów (formy w użyciu); odporne na echo promptu.")
    L.append("- **sędzia** — otwarty model z rubryką pass/mixed/fail per item (styl, EQ, kalibracja).")
    L.append("- Każdy model na rekomendowanym samplingu wydawcy (nie handicap).")
    L.append("- Tylko agregaty. Itemy benchmarku są prywatne (`eval_only`); web-scrape → pretrain → benchmark martwy.")
    L.append("")
    L.append("### Wizualny raport")
    L.append("")
    L.append("[`results/polnative_v1_report.html`](results/polnative_v1_report.html) — słupki per domena, delty, split auto/sędzia.")
    L.append("")
    L.append("### Jak dodać model")
    L.append("")
    L.append("```bash")
    L.append("export OPENROUTER_API_KEY=...")
    L.append("python3 polnative_eval.py --models <twój-model>   # dopisuje do results/polnative_v1.json")
    L.append("python3 polnative_leaderboard.py                  # regeneruje ten plik")
    L.append("python3 polnative_report.py                       # regeneruje raport HTML")
    L.append("```")
    L.append("")

    open(a.out, "w", encoding="utf-8").write("\n".join(L) + "\n")
    print(f"[polnative-lb] {len(ranked)} modeli, {len(doms)} domen -> {a.out}")


if __name__ == "__main__":
    main()
