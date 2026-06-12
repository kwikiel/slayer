"use client";
import { useEffect, useRef, useState } from "react";

const NB = "Bielik-11B-v3.0-Instruct";
const NQ = "Qwen3.5-9B";
const KEYL = { belebele: "Belebele (PL)", llmzszl: "LLMzSzŁ (full)", pes: "PES (medyczny, full)", poquad: "PoQuAD + sędzia", flores: "FLORES-200", include: "INCLUDE-44 (PL)", belebele_en: "Belebele (EN)", arc: "ARC-C (EN)", mmlu: "MMLU (EN)", gsm8k: "GSM8K (EN)" };
const STL = { done: "gotowe", running: "liczę…", queued: "w kolejce", fail: "błąd" };

const fmt = (s) => {
  s = Math.max(0, Math.round(s));
  if (s >= 3600) return Math.floor(s / 3600) + "h " + Math.round((s % 3600) / 60) + "m";
  if (s >= 60) return Math.floor(s / 60) + "m " + (s % 60) + "s";
  return s + "s";
};

export default function Console() {
  const [D, setD] = useState(null);
  const [fail, setFail] = useState(false);
  const atRef = useRef(0);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const load = () =>
      fetch("/results/status.json?ts=" + Date.now())
        .then((r) => r.json())
        .then((d) => { setD(d); atRef.current = Date.now() / 1000; setFail(false); })
        .catch(() => setFail(true));
    load();
    const t1 = setInterval(load, 15000);
    const t2 = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const srv = () => (D ? D.now_ts + (Date.now() / 1000 - atRef.current) : 0);
  const c = D?.current;
  const running = c && c.total;
  const pct = running ? Math.min(100, (c.done / c.total) * 100) : 0;
  const eta = running && c.eta_secs != null ? c.eta_secs - (srv() - D.now_ts) : null;
  const dl = D?.deadline_ts ? D.deadline_ts - srv() : null;
  const fa = D?.faza_a;
  const oeta = fa && fa.eta_secs != null ? fa.eta_secs - (srv() - D.now_ts) : null;
  const R = D?.results || [];

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><span className="kick"><span className="ac">POMIAR</span> — autonomiczna kolejka · simp / RTX 3090</span><h1>Konsola pomiaru</h1></div>
        <span className="live"><span className="d"></span><span>{fail ? "brak danych" : D ? D.phase || "—" : "łączenie…"}</span></span>
      </div>

      <div className="g2" style={{ marginTop: 26 }}>
        <div className="panel"><div className="panel-top"><span>aktualny benchmark</span></div>
          <div className="panel-bd">
            <div className="cur-job">{running ? c.label : D ? ((D.phase || "").includes("zakończ") ? "kolejka zakończona " : "przygotowanie…") : "—"}</div>
            <div className="tags" style={{ margin: "8px 0 16px" }}>
              {running && c.model ? <span className="chip acc">{c.model}</span> : null}
              {running && c.stage ? <span className="chip">{c.stage}</span> : null}
            </div>
            <div className={"bigbar" + (running ? " run" : "")}>
              <i style={{ width: pct + "%" }}></i>
              <span className="pc">{running ? pct.toFixed(0) + "%" : ""}</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <span className="big">{running ? c.done.toLocaleString("pl") : "—"}</span>{" "}
              <span className="muted mono" style={{ fontSize: ".86rem" }}>{running ? "/ " + c.total.toLocaleString("pl") + " pytań" : ""}</span>
            </div>
            <div className="ticks">
              <div className="tick"><div className="v acc">{eta != null ? "≈ " + fmt(eta) : "—"}</div><div className="k">ETA benchmarku</div></div>
              <div className="tick"><div className="v">{(running && c.rate_per_s) || "—"}</div><div className="k">pyt/s</div></div>
            </div>
          </div>
        </div>
        <div className="panel"><div className="panel-top"><span>wynik zbiorczy</span></div>
          <div className="panel-bd">
            <div className="scoreline"><span className="b">{D?.tally?.[NB] ?? 0}</span><span className="d">:</span><span className="q">{D?.tally?.[NQ] ?? 0}</span></div>
            <div className="muted mono" style={{ textAlign: "center", fontSize: ".72rem" }}>Bielik-11B-v3 · Qwen3.5-9B</div>
            <div className="ticks">
              <div className="tick"><div className="v">{D?.benchmarks_done ?? 0}</div><div className="k">benchmarków</div></div>
              <div className="tick"><div className="v acc">{dl != null ? fmt(dl) : "—"}</div><div className="k">do końca kolejki</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}><div className="panel-top"><span>postęp całości — faza A</span></div>
        <div className="panel-bd">
          <div className="bigbar">
            <i style={{ background: "linear-gradient(90deg,var(--acc),var(--blue))", width: (fa ? fa.overall_pct : 0) + "%" }}></i>
            <span className="pc">{fa ? fa.overall_pct + "%" : ""}</span>
          </div>
          <div className="ticks">
            <div className="tick"><div className="v">{fa ? fa.done_jobs + " / " + fa.total_jobs : "—"}</div><div className="k">ukończone</div></div>
            <div className="tick"><div className="v acc">{oeta != null ? "≈ " + fmt(oeta) : "—"}</div><div className="k">ETA fazy A</div></div>
            <div className="tick"><div className="v">{fa?.projected_done_ts ? new Date(fa.projected_done_ts * 1000).toLocaleTimeString("pl", { hour: "2-digit", minute: "2-digit" }) : "—"}</div><div className="k">przewidywany koniec</div></div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}><div className="panel-top"><span>wyniki — ukończone benchmarki</span></div>
        <div className="panel-bd">
          {!R.length ? (
            <div className="muted mono">pierwsze wyniki po ukończeniu benchmarków…</div>
          ) : (
            <div className="tbl">
              <table>
                <thead><tr><th>Benchmark</th><th className="c">Bielik-11B-v3</th><th className="c">Qwen3.5-9B</th><th className="c">Wynik</th></tr></thead>
                <tbody>
                  {R.map((r) => {
                    const wb = r.winner === NB && r.margin > 0, wq = r.winner === NQ && r.margin > 0;
                    const u = r.unit === "chrF" ? "" : "%";
                    return (
                      <tr key={r.label}>
                        <td><div className="dn">{r.label}</div><div className="ds">{(r.metric || "").replace(" (MCQ, exact letter)", "")} · n={r.n}{r.runs > 1 ? " · " + r.runs + " runów" : ""}</div></td>
                        <td className={"s " + (wb ? "win" : "")}>{r.bielik != null ? r.bielik + u : "—"}</td>
                        <td className={"s " + (wq ? "win" : "")}>{r.qwen != null ? r.qwen + u : "—"}</td>
                        <td className="c">{r.bielik != null && r.qwen != null ? (wb ? <span className="vb b">▲ Bielik +{r.margin}</span> : wq ? <span className="vb q">Qwen +{r.margin}</span> : "remis") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="panel"><div className="panel-top"><span>pipeline — faza A</span></div>
        <div className="panel-bd">
          <div className="steps">
            {(D?.jobs_faza_a || []).map((j) => (
              <div key={j.key || j.label} className={"step " + j.state}>
                <div className="ic">{j.state === "running" ? "⟳" : ""}</div>
                <div className="nm">{KEYL[j.key] || j.label}</div>
                <div className="st">{STL[j.state] || j.state}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="muted mono" style={{ textAlign: "center", fontSize: ".78rem", marginTop: 18 }}>
        {D ? "prawdziwe wartości · źródło: simp · stan z " + (D.now || "—") + " · publikacja co ~60 s" : "—"}
      </p>
    </>
  );
}
