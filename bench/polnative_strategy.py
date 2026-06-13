#!/usr/bin/env python3
"""PolNative — wizualizacja strategii SFT vs CPT (self-contained HTML).

Realne liczby (baza Qwen27B, Bielik) z results/polnative_v1.json; prognozy SFT/CPT
i klasyfikacja domen z POLNATIVE_SFT_PLAN.md (osadzone, jawnie oznaczone jako prognoza).
Overall per faza liczony wagami liczby itemów per domena — baza odtwarza realne 58.6,
więc projekcje są na tej samej skali.

Usage:
  python3 bench/polnative_strategy.py [--in public/results/polnative_v1.json]
                                      [--out public/results/polnative_strategy.html]
"""
import argparse
import json

# n itemów per domena (waga overall) + prognoza po fazach + klasa dźwigni
# klasa: SFT (skill/behavior/styl) | CPT (wiedza) | MIX (wiedza-użycie: SFT trochę, CPT reszta)
STRAT = {
    "literatura":  dict(n=16, sft=30, cpt=88, cls="CPT", lever="atrybucja = pamięć parametryczna; CPT na Wolnych Lekturach/wiki"),
    "realia":      dict(n=9,  sft=90, cpt=96, cls="CPT", lever="długi ogon tradycji; CPT na korpusie PL"),
    "frazeologia": dict(n=11, sft=74, cpt=90, cls="MIX", lever="znaczenie/dokończenie SFT-em; głęboki recall CPT"),
    "fleksja":     dict(n=18, sft=82, cpt=84, cls="SFT", lever="Morfeusz2 → gold deterministyczny; correction-pairs"),
    "skladnia":    dict(n=12, sft=84, cpt=86, cls="SFT", lever="inwentarz rekcji/imiesłów/swój; correction-pairs"),
    "ortografia":  dict(n=11, sft=85, cpt=86, cls="SFT", lever="skończona lista confusables + reforma 1997"),
    "leksyka":     dict(n=10, sft=88, cpt=89, cls="SFT", lever="pleonazmy/paronimy PRESKRYPTYWNIE (bijemy permisywizm Bielika)"),
    "kalibracja":  dict(n=5,  sft=72, cpt=74, cls="SFT", lever="granica wiedzy: 'nie wiem' + pytania odwrotne (Bielik fabrykuje)"),
    "rejestr":     dict(n=4,  sft=85, cpt=86, cls="SFT", lever="przepisywanie między rejestrami; styl"),
    "EQ":          dict(n=8,  sft=78, cpt=80, cls="SFT", lever="krótkie ludzkie odpowiedzi, anty-coaching"),
    "naturalnosc": dict(n=7,  sft=78, cpt=80, cls="SFT", lever="de-translationese, anty-AI-tell (mamy pipeline)"),
}
DOM_LABEL = {"skladnia": "składnia", "naturalnosc": "naturalność"}
CLS_COLOR = {"SFT": "#74a37a", "CPT": "#c79448", "MIX": "#b8935a"}

C_NOW = "#8a93a3"     # baza (teraz)
C_SFT = "#74a37a"     # przyrost SFT
C_CPT = "#c79448"     # przyrost CPT
C_BIE = "#c98a78"     # Bielik (do pobicia)


def dl(d):
    return DOM_LABEL.get(d, d)


def weighted(get):
    tot = sum(s["n"] for s in STRAT.values())
    return sum(s["n"] * get(d, s) for d, s in STRAT.items()) / tot


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", default="public/results/polnative_v1.json")
    ap.add_argument("--out", default="public/results/polnative_strategy.html")
    a = ap.parse_args()

    res = json.load(open(a.inp, encoding="utf-8"))["results"]
    base = {d[4:]: v for d, v in res["qwen27b"]["score"].items() if d.startswith("dom:")}
    bie = {d[4:]: v for d, v in res["bielik"]["score"].items() if d.startswith("dom:")}

    ov_base = weighted(lambda d, s: base[d])
    ov_sft = weighted(lambda d, s: s["sft"])
    ov_cpt = weighted(lambda d, s: s["cpt"])
    ov_bie = weighted(lambda d, s: bie[d])

    # ── trajektoria: baza -> +SFT -> +CPT, linia Bielika ──────────────────────
    W, H = 900, 240
    pad_l, pad_r, pad_t, pad_b = 60, 30, 40, 46
    xs = {"baza": pad_l, "sft": W / 2, "cpt": W - pad_r}
    lo, hi = 50, 90

    def Y(v):
        return pad_t + (1 - (v - lo) / (hi - lo)) * (H - pad_t - pad_b)
    nodes = [("Qwen3.5-27B\n(baza)", xs["baza"], ov_base, C_NOW),
             ("+ capability-SFT", xs["sft"], ov_sft, C_SFT),
             ("+ CPT (faza 2)", xs["cpt"], ov_cpt, C_CPT)]
    traj = [f'<svg viewBox="0 0 {W} {H}" class="tj" role="img" aria-label="Trajektoria overall">']
    yb = Y(ov_bie)
    traj.append(f'<line class="tj-bie" x1="{pad_l}" y1="{yb:.1f}" x2="{W-pad_r}" y2="{yb:.1f}"/>')
    traj.append(f'<text class="tj-bielab" x="{W-pad_r}" y="{yb-7:.1f}" text-anchor="end">Bielik-11B-v3 · {ov_bie:.1f} — do pobicia</text>')
    pts = [(x, Y(v)) for _, x, v, _ in nodes]
    traj.append('<polyline class="tj-line" points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + '"/>')
    for (lab, x, v, c), (px, py) in zip(nodes, pts):
        traj.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="7" fill="{c}" stroke="#0d0f12" stroke-width="2"/>')
        traj.append(f'<text class="tj-val" x="{px:.1f}" y="{py-16:.1f}" text-anchor="middle" fill="{c}">{v:.1f}</text>')
        for li, line in enumerate(lab.split("\n")):
            traj.append(f'<text class="tj-cap" x="{px:.1f}" y="{H-pad_b+18+li*13:.1f}" text-anchor="middle">{line}</text>')
    # delty między węzłami
    for i in range(len(nodes) - 1):
        x0, x1 = pts[i][0], pts[i + 1][0]
        dv = nodes[i + 1][2] - nodes[i][2]
        traj.append(f'<text class="tj-d" x="{(x0+x1)/2:.1f}" y="{pad_t-12:.1f}" text-anchor="middle">+{dv:.1f}</text>')
    traj.append("</svg>")

    # ── pasek domen: teraz | +SFT | +CPT, kreska Bielika ─────────────────────
    groups = [("SFT — bijemy Bielika zachowaniem i formą", [d for d in STRAT if STRAT[d]["cls"] == "SFT"]),
              ("MIX / CPT — wiedza, dźwignia to korpus PL", [d for d in STRAT if STRAT[d]["cls"] in ("MIX", "CPT")])]
    for _, ds in groups:
        ds.sort(key=lambda d: base[d])
    DW, lab_w, val_w = 900, 165, 40
    bx, bw = lab_w, DW - lab_w - val_w
    rh, gap_h, head_h = 30, 6, 30
    H2 = head_h
    for _, ds in groups:
        H2 += head_h + len(ds) * (rh + gap_h)
    dom = [f'<svg viewBox="0 0 {DW} {H2+10}" class="dm" role="img" aria-label="Domeny: dźwignia SFT vs CPT">']
    for gx in (0, 25, 50, 75, 100):
        x = bx + bw * gx / 100
        dom.append(f'<line class="dm-grid" x1="{x:.1f}" y1="22" x2="{x:.1f}" y2="{H2}"/>')
        dom.append(f'<text class="dm-ax" x="{x:.1f}" y="14" text-anchor="middle">{gx}</text>')
    y = head_h
    for gtitle, ds in groups:
        dom.append(f'<text class="dm-gh" x="0" y="{y+4}">{gtitle}</text>')
        y += head_h - 8
        for d in ds:
            s = STRAT[d]
            nb, ns, nc, nbie = base[d], s["sft"], s["cpt"], bie[d]
            cc = CLS_COLOR[s["cls"]]
            dom.append(f'<text class="dm-dom" x="{lab_w-30}" y="{y+rh/2+1}" text-anchor="end">{dl(d)}</text>')
            dom.append(f'<rect class="dm-tag" x="{lab_w-26}" y="{y+rh/2-6}" width="22" height="12" rx="3" fill="{cc}" opacity=".18" stroke="{cc}" stroke-opacity=".5"/>')
            dom.append(f'<text class="dm-tagt" x="{lab_w-15}" y="{y+rh/2+3}" text-anchor="middle" fill="{cc}">{s["cls"]}</text>')
            dom.append(f'<rect x="{bx}" y="{y+7}" width="{bw}" height="{rh-14}" rx="4" class="dm-track"/>')
            # teraz (baza)
            dom.append(f'<rect x="{bx}" y="{y+7}" width="{bw*nb/100:.1f}" height="{rh-14}" rx="4" fill="{C_NOW}" opacity=".8"/>')
            # +SFT
            if ns > nb:
                dom.append(f'<rect x="{bx+bw*nb/100:.1f}" y="{y+7}" width="{bw*(ns-nb)/100:.1f}" height="{rh-14}" fill="{C_SFT}"/>')
            # +CPT
            if nc > ns:
                dom.append(f'<rect x="{bx+bw*ns/100:.1f}" y="{y+7}" width="{bw*(nc-ns)/100:.1f}" height="{rh-14}" fill="{C_CPT}"/>')
            # kreska Bielika
            xb = bx + bw * nbie / 100
            dom.append(f'<line x1="{xb:.1f}" y1="{y+3}" x2="{xb:.1f}" y2="{y+rh-3}" stroke="{C_BIE}" stroke-width="2"/>')
            beat = nc >= nbie
            dom.append(f'<text class="dm-val" x="{bx+bw+6}" y="{y+rh/2+3}" fill="{C_CPT if beat else C_NOW}">{nc:.0f}{"✓" if beat else ""}</text>')
            y += rh + gap_h
        y += 8
    dom.append("</svg>")

    legend = (f'<span><i style="background:{C_NOW}"></i>teraz (baza 58.6)</span>'
              f'<span><i style="background:{C_SFT}"></i>+ SFT (capability)</span>'
              f'<span><i style="background:{C_CPT}"></i>+ CPT (wiedza)</span>'
              f'<span><i class="tick" style="background:{C_BIE}"></i>Bielik — do pobicia</span>')

    rows = "".join(
        f'<tr><td>{dl(d)}</td><td class="mono">{STRAT[d]["n"]}</td>'
        f'<td><span class="pill" style="--c:{CLS_COLOR[STRAT[d]["cls"]]}">{STRAT[d]["cls"]}</span></td>'
        f'<td class="mono">{base[d]:.0f}</td><td class="mono" style="color:{C_BIE}">{bie[d]:.0f}</td>'
        f'<td class="mono" style="color:{C_SFT}">{STRAT[d]["sft"]}</td>'
        f'<td class="mono" style="color:{C_CPT}">{STRAT[d]["cpt"]}</td>'
        f'<td class="lev">{STRAT[d]["lever"]}</td></tr>'
        for d in sorted(STRAT, key=lambda d: (STRAT[d]["cls"] != "SFT", base[d])))

    page = f"""<!doctype html><html lang="pl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PolNative — strategia SFT vs CPT</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:opsz,wght@6..72,300..500&display=swap" rel="stylesheet">
<style>
:root{{--bg:#0d0f12;--panel:#13161b;--ink:#eef0f3;--txt:#d7dade;--mut:#a3a9b2;--dim:#6c727c;--line:#252a31;--line2:#1d2127;--acc:#c79448;--good:#74a37a}}
*{{box-sizing:border-box}}body{{margin:0;background:radial-gradient(1200px 700px at 70% -10%,rgba(199,148,72,.05),transparent),var(--bg);color:var(--txt);font-family:'Hanken Grotesk',system-ui,sans-serif;line-height:1.55}}
.wrap{{max-width:980px;margin:0 auto;padding:40px 24px 80px}}
.stamp{{border:1px solid var(--line2);border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01)),var(--panel);padding:20px 24px}}
.stamp-row{{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;font-family:'IBM Plex Mono',monospace;font-size:.72rem;letter-spacing:.14em;color:var(--dim)}}.stamp-row .id{{color:var(--acc)}}
.rule{{border:0;border-top:1px solid var(--line2);margin:14px 0}}
h1{{font-family:'Newsreader',Georgia,serif;font-weight:400;font-size:clamp(2rem,5vw,2.9rem);letter-spacing:-.015em;margin:6px 0 6px}}
.sub{{color:var(--mut);max-width:66ch;margin:0}}
h2{{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin:44px 0 14px;padding-top:14px;border-top:1px solid var(--line2)}}
.card{{border:1px solid var(--line2);border-radius:10px;background:var(--panel);padding:18px 20px}}
svg{{width:100%;height:auto;display:block}}
.tj-bie{{stroke:{C_BIE};stroke-width:1.4;stroke-dasharray:5 4;opacity:.85}}
.tj-bielab{{font-family:'IBM Plex Mono',monospace;font-size:10.5px;fill:{C_BIE}}}
.tj-line{{fill:none;stroke:url(#g);stroke-width:2.4}}
.tj-line{{stroke:var(--mut)}}
.tj-val{{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:18px}}
.tj-cap{{font-family:'IBM Plex Mono',monospace;font-size:10.5px;fill:var(--mut)}}
.tj-d{{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;fill:var(--good)}}
.dm-grid{{stroke:var(--line2);stroke-width:.7}}.dm-ax{{font-family:'IBM Plex Mono',monospace;font-size:9.5px;fill:var(--dim)}}
.dm-gh{{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;fill:var(--dim)}}
.dm-dom{{font-family:'IBM Plex Mono',monospace;font-size:11.5px;fill:var(--mut)}}
.dm-tagt{{font-family:'IBM Plex Mono',monospace;font-size:8px;font-weight:600}}
.dm-track{{fill:rgba(255,255,255,.04)}}
.dm-val{{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:11px}}
.legend{{display:flex;gap:18px;flex-wrap:wrap;font-family:'IBM Plex Mono',monospace;font-size:.74rem;color:var(--mut);margin:4px 0 10px}}
.legend i{{display:inline-block;width:18px;height:10px;border-radius:2px;vertical-align:middle;margin-right:7px}}.legend i.tick{{width:3px;height:14px;border-radius:1px}}
table{{width:100%;border-collapse:collapse;font-size:.86rem;margin-top:4px}}
th,td{{text-align:left;padding:7px 10px;border-bottom:1px solid var(--line2)}}
th{{font-family:'IBM Plex Mono',monospace;font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);font-weight:500}}
td.mono{{font-family:'IBM Plex Mono',monospace;text-align:right;width:1%;white-space:nowrap}}
td.lev{{color:var(--mut);font-size:.8rem}}
.pill{{font-family:'IBM Plex Mono',monospace;font-size:.64rem;font-weight:600;padding:2px 8px;border-radius:20px;color:var(--c);background:color-mix(in srgb,var(--c) 16%,transparent);border:1px solid color-mix(in srgb,var(--c) 40%,transparent)}}
.note{{display:grid;gap:10px;margin:0;padding-left:20px}}.note li{{color:var(--mut);font-size:.93rem;line-height:1.6}}.note b{{color:var(--ink)}}
.prov{{margin-top:40px;padding-top:16px;border-top:1px solid var(--line2);font-family:'IBM Plex Mono',monospace;font-size:.72rem;color:var(--dim);line-height:1.7}}.prov b{{color:var(--mut)}}
</style></head><body><div class="wrap">

<div class="stamp">
  <div class="stamp-row"><span class="id">SLAYER PROTOCOL · STRATEGIA</span><span>POLNATIVE · SFT vs CPT</span></div>
  <hr class="rule">
  <h1>Jak pobić Bielika — rozkład na SFT i CPT</h1>
  <p class="sub">Każda domena benchmarku ma inną dźwignię. Skille i zachowania (fleksja, kalibracja,
  styl) bije <b>capability-SFT</b>. Pamięć kulturowa (literatura, realia) wymaga <b>CPT</b> na korpusie PL.
  Liczby bazy i Bielika są realne (PolNative v1); SFT/CPT to prognoza z planu.</p>
</div>

<h2>Trajektoria overall</h2>
<div class="card">{''.join(traj)}</div>
<p class="sub" style="margin-top:10px">Sama capability-SFT zbliża nas do Bielika, ale literatura (waga 16/111, +75 dla Bielika)
trzyma overall poniżej — dopiero <b>CPT</b> przeskakuje linię 79.7. SFT to ~2/3 drogi.</p>

<h2>Dźwignia per domena</h2>
<div class="legend">{legend}</div>
<div class="card">{''.join(dom)}</div>

<h2>Tabela decyzyjna</h2>
<div class="card" style="padding:6px 10px"><table>
<thead><tr><th>domena</th><th>n</th><th>klasa</th><th>baza</th><th>Bielik</th><th>+SFT</th><th>+CPT</th><th>dźwignia</th></tr></thead>
<tbody>{rows}</tbody></table></div>

<h2>Czytanie</h2>
<div class="card"><ul class="note">
<li><b>SFT (8 domen):</b> fleksja, składnia, ortografia, leksyka, kalibracja, rejestr, EQ, naturalność.
  To skille i zachowania uczalne przykładami. W leksyce, kalibracji i EQ Bielik jest <b>słabszy od bazy</b> — najłatwiejsze punkty.</li>
<li><b>CPT (literatura, realia) + MIX (frazeologia):</b> pamięć parametryczna. SFT da częściowy lift
  (literatura 16→30), pełne 88 dowozi CPT na korpusie PL (Wolne Lektury, wiki, ZPE — Polish DynaWord).</li>
<li><b>Reguła anti-benchmaxx:</b> trenujemy zdolność, nie test. PolNative zostaje held-out; iteracja na
  osobnym dev secie; decon vs itemy. „Win" liczy się na held-out + arenie, nie na danych treningowych.</li>
</ul></div>

<div class="prov">
  <b>Realne (PolNative v1, n=111):</b> baza Qwen3.5-27B {ov_base:.1f} · Bielik-11B-v3 {ov_bie:.1f}.
  <b>Prognoza:</b> +SFT {ov_sft:.1f} · +CPT {ov_cpt:.1f} (wagi = liczba itemów per domena).<br>
  Plan: <b>POLNATIVE_SFT_PLAN.md</b>. Tylko agregaty; itemy prywatne (eval_only).
</div>

</div></body></html>"""
    open(a.out, "w", encoding="utf-8").write(page)
    print(f"[strategy] baza {ov_base:.1f} -> +SFT {ov_sft:.1f} -> +CPT {ov_cpt:.1f} (Bielik {ov_bie:.1f}) -> {a.out}")


if __name__ == "__main__":
    main()
