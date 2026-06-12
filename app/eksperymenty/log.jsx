"use client";
import { useEffect, useState } from "react";

const SRCLABEL = { style: "styl", klej_train_split: "KLEJ train", klej_synth: "KLEJ synth", replay: "replay", distill_pl: "destylacja PL", aya_pl: "Aya-PL", oasst_pl: "OASST-PL", en_retention: "EN retencja" };

function Chart({ cv }) {
  if (!cv || ((!cv.train || !cv.train.length) && (!cv.eval || !cv.eval.length))) return null;
  const W = 520, H = 130, pl = 34, pr = 8, pt = 10, pb = 18;
  const all = [...(cv.train || []), ...(cv.eval || [])];
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y1 === y0) { y1 += 0.05; y0 -= 0.05; }
  if (x1 === x0) x1 = x0 + 1;
  const sx = (s) => pl + ((s - x0) / (x1 - x0)) * (W - pl - pr);
  const sy = (v) => pt + (1 - (v - y0) / (y1 - y0)) * (H - pt - pb);
  const path = (pts) => pts.map((p, i) => (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1)).join(" ");
  return (
    <>
      <div className="secline">krzywa loss</div>
      <div className="chartwrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="chart" preserveAspectRatio="none">
          <line x1={pl} y1={sy(y1).toFixed(1)} x2={W - pr} y2={sy(y1).toFixed(1)} className="grid" />
          <line x1={pl} y1={sy(y0).toFixed(1)} x2={W - pr} y2={sy(y0).toFixed(1)} className="grid" />
          <text x="2" y={(sy(y1) + 3).toFixed(1)} className="ax">{y1.toFixed(2)}</text>
          <text x="2" y={(sy(y0) + 3).toFixed(1)} className="ax">{y0.toFixed(2)}</text>
          {cv.train && cv.train.length ? <path d={path(cv.train)} className="ltrain" /> : null}
          {cv.eval && cv.eval.length ? (
            <>
              <path d={path(cv.eval)} className="leval" />
              {cv.eval.map((p, i) => <circle key={i} cx={sx(p[0]).toFixed(1)} cy={sy(p[1]).toFixed(1)} r="2.8" className="deval" />)}
            </>
          ) : null}
          <text x={pl} y={H - 4} className="ax">step {x0}</text>
          <text x={W - pr} y={H - 4} className="ax" textAnchor="end">{x1}</text>
        </svg>
        <div className="leg">
          {cv.train && cv.train.length ? <span className="lg t">train loss</span> : null}
          {cv.eval && cv.eval.length ? <span className="lg e">eval loss</span> : null}
        </div>
      </div>
    </>
  );
}

function Card({ x }) {
  const clean = x.status === "clean";
  const ev = x.eval || {};
  const links = [
    x.hf ? <a key="m" href={`https://huggingface.co/${x.hf}`} rel="noopener">model ↗</a> : null,
    x.data_hf ? <a key="d" href={`https://huggingface.co/datasets/${x.data_hf}`} rel="noopener">dane ↗</a> : null,
    x.log ? <a key="l" href={x.log} rel="noopener">log ↗</a> : null,
    x.wandb ? <a key="w" href={x.wandb} rel="noopener">W&amp;B ↗</a> : null,
  ].filter(Boolean);
  return (
    <div className="xp">
      <div className="xp-top">
        <span className="xp-date">{x.date}</span>
        <span className="xp-name">{x.name}</span>
        {clean ? <span className="badge clean">CZYSTY</span> : <span className="badge contaminated">KONTAMINACJA</span>}
        {ev.macro != null && (
          <div className="xp-macro">{ev.macro}<span className="d"> macro{ev.base_macro != null ? ` · base ${ev.base_macro} (Δ ${(ev.macro - ev.base_macro).toFixed(1)})` : ""}</span></div>
        )}
      </div>
      <div className="xp-bd">
        <div className="meta">
          <span>baza <b>{x.base}</b></span>
          <span>metoda <b>{x.method}</b></span>
          <span><b>{(x.n_examples || 0).toLocaleString("pl")}</b> przykładów</span>
          {ev.harness ? <span>harness <b>{ev.harness}</b></span> : null}
        </div>
        <div className="secline">skład danych</div>
        <div className="chips">
          {Object.entries(x.data || {}).map(([k, v]) => {
            const contam = k === "klej_train_split" || k === "klej_synth";
            return <span key={k} className={"chip " + (contam ? "contam" : "")}>{SRCLABEL[k] || k} {v}</span>;
          })}
        </div>
        {(x.dataset_desc || x.data_hf) && (
          <>
            <div className="secline">dataset</div>
            <div className="dataset">
              {x.data_hf ? <a className="dspill" href={`https://huggingface.co/datasets/${x.data_hf}`} rel="noopener">🤗 {x.data_hf} ↗</a> : null}
              {x.dataset_desc ? <div className="dsdesc">{x.dataset_desc}</div> : null}
            </div>
          </>
        )}
        {x.train_cfg && (
          <>
            <div className="secline">hiperparametry</div>
            <div className="chips">{Object.entries(x.train_cfg).map(([k, v]) => <span key={k} className="chip">{k}: {String(v)}</span>)}</div>
          </>
        )}
        {x.plot ? (
          <>
            <div className="secline">krzywa loss</div>
            <img className="lossimg" src={x.plot} alt={`loss curve ${x.name}`} loading="lazy" />
          </>
        ) : (
          <Chart cv={x.curves} />
        )}
        {x.early_stop ? <div className="xp-es">⏹ {x.early_stop}</div> : null}
        {x.log_note ? <div className="muted mono" style={{ fontSize: ".72rem" }}>{x.log_note}</div> : null}
        {ev.tasks && (
          <>
            <div className="secline">eval (held-out)</div>
            <div className="tasks">
              {Object.entries(ev.tasks).map(([k, v]) => <div key={k} className="t"><div className="k">{k}</div><div className="v">{v}</div></div>)}
            </div>
          </>
        )}
        <div className="xp-note">{x.note}</div>
        {links.length ? <div className="xp-links">{links}</div> : null}
      </div>
    </div>
  );
}

export default function ExperimentLog() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch("/results/experiments.json?ts=" + Date.now())
      .then((r) => r.json())
      .then(setD)
      .catch(() => setErr(true));
  }, []);
  const xs = d ? (d.experiments || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")) : [];
  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><span className="kick"><span className="ac">LOG</span> — eksperymenty · co · na czym · z jakim wynikiem</span><h1>Log eksperymentów</h1></div>
        <span className="live"><span className="d"></span><span>{d ? "zaktualizowano " + (d.updated || "—") : "—"}</span></span>
      </div>

      <div className="banner">
        <b>Uczciwa zasada:</b> każdy model jest tu z pełnym składem danych i wynikiem. Trening na train-splicie
        benchmarku oznaczamy <b style={{ color: "#c98a78" }}>KONTAMINACJA</b> — bo zawyża wynik i jest nieporównywalny
        z modelami liczonymi 5-shot. Realne twierdzenie stawiamy wyłącznie na <b>oficjalnym 5-shot leaderboardzie + MT-Bench-PL</b>.
      </div>

      <div className="log">
        {err && <div className="muted mono" style={{ marginTop: 20 }}>brak danych (results/experiments.json)</div>}
        {!err && !d && <div className="muted mono" style={{ marginTop: 20 }}>wczytuję log…</div>}
        {d && (xs.length ? xs.map((x) => <Card key={x.name + x.date} x={x} />) : <div className="muted mono">brak eksperymentów</div>)}
      </div>

      <p className="muted mono" style={{ textAlign: "center", fontSize: ".78rem", marginTop: 22 }}>
        {d ? xs.length + " eksperymentów · log auto-aktualizowany przez pipeline (pipeline/run_daily.py)" : "—"}
      </p>
    </>
  );
}
