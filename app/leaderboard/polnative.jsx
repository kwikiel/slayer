"use client";
import { useEffect, useState } from "react";

const META = {
  bielik: { name: "Bielik-11B-v3", tag: "punkt odniesienia", params: "11B" },
  qwen27b: { name: "Qwen3.5-27B", tag: "nasza baza", params: "27B" },
  qwen27b_local: { name: "Qwen3.5-27B", tag: "nasza baza", params: "27B" },
  slayer: { name: "Slayer-27B v3", tag: "nasz model", params: "27B" },
  slayer_v3: { name: "Slayer-27B v3", tag: "nasz model", params: "27B" },
  qwen9b: { name: "Qwen3.5-9B", tag: "", params: "9B" },
};
const meta = (k) => META[k] || { name: k, tag: "", params: "—" };

export default function PolNativeBoard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    fetch("/results/polnative_v1.json?ts=" + Date.now())
      .then((r) => r.json())
      .then(setD)
      .catch(() => setD(false));
  }, []);
  if (d === false || (d && !d.results)) return null;

  const rows = d
    ? Object.entries(d.results)
        .map(([k, m]) => ({ k, ...meta(k), score: m.score.all, auto: m.score["tryb:auto"], judge: m.score["tryb:judge"] }))
        .sort((a, b) => b.score - a.score)
    : [];
  const max = rows.length ? Math.max(...rows.map((r) => r.score)) : 100;

  return (
    <div style={{ marginTop: 40 }}>
      <style>{`
        .pnb-h{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:14px}
        .pnb-h h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.5rem,3.4vw,2.1rem);letter-spacing:-.015em;margin:6px 0 0}
        .pnb-sub{color:var(--mut);font-size:.9rem;max-width:60ch;margin:6px 0 0}
        .pnb{border:1px solid var(--line);border-radius:10px;background:linear-gradient(180deg,var(--panel),var(--bg2));overflow:hidden}
        .pnb-row{display:grid;grid-template-columns:200px 1fr 132px;align-items:center;gap:14px;padding:15px 18px;border-bottom:1px solid var(--line2)}
        .pnb-row:last-child{border-bottom:0}
        .pnb-row.lead{background:rgba(199,148,72,.05)}
        .pnb-row.slay{background:rgba(116,163,122,.07)}
        .pnb-nm{font-weight:500;font-size:1.02rem}
        .pnb-tag{font-family:var(--mono);font-size:.64rem;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);margin-top:2px}
        .pnb-bar{height:14px;border-radius:7px;background:rgba(255,255,255,.05);overflow:hidden}
        .pnb-bar i{display:block;height:100%;border-radius:7px}
        .pnb-sc{font-family:var(--mono);text-align:right}
        .pnb-sc .big{font-weight:600;font-size:1.5rem}
        .pnb-sc .split{font-size:.66rem;color:var(--dim)}
        .pnb-foot{padding:13px 18px;font-family:var(--mono);font-size:.76rem;color:var(--mut);display:flex;gap:18px;flex-wrap:wrap}
        .pnb-foot a{color:var(--acc)}
        @media(max-width:680px){.pnb-row{grid-template-columns:1fr auto;gap:8px}.pnb-bar{display:none}}
      `}</style>
      <div className="pnb-h">
        <div>
          <span className="kick"><span className="ac">POLNATIVE</span> — nasz benchmark</span>
          <h2>Natywność polszczyzny</h2>
          <p className="pnb-sub">Czy model pisze po polsku jak rodzimy użytkownik: fleksja, składnia, leksyka,
          frazeologia, literatura, realia, kalibracja, styl. 111 itemów, sędzia otwarty. Mierzy to,
          czego nie łapią benchmarki MCQ.</p>
        </div>
        <span className="live"><span className="d"></span>eval_only · czysto</span>
      </div>
      <div className="pnb">
        {!d && <div style={{ padding: 36, textAlign: "center" }} className="muted mono">wczytuję…</div>}
        {rows.map((r, i) => {
          const color = r.k.startsWith("slayer") ? "var(--good)" : i === 0 ? "var(--acc)" : "#9aa3b2";
          return (
            <div className={"pnb-row" + (i === 0 ? " lead" : "") + (r.k.startsWith("slayer") ? " slay" : "")} key={r.k}>
              <div>
                <div className="pnb-nm">{r.name} {i === 0 && <span style={{ color: "var(--acc)" }}>🥇</span>}</div>
                <div className="pnb-tag">{r.tag} · {r.params}</div>
              </div>
              <div className="pnb-bar"><i style={{ width: (r.score / max) * 100 + "%", background: color }} /></div>
              <div className="pnb-sc">
                <div className="big" style={{ color }}>{r.score.toFixed(1)}</div>
                <div className="split">auto {r.auto?.toFixed(0)} · sędzia {r.judge?.toFixed(0)}</div>
              </div>
            </div>
          );
        })}
        <div className="pnb-foot">
          <span>skala 0–100 · pass=1, mixed=0.5, fail=0</span>
          <a href="/results/polnative_v1_report.html" target="_blank" rel="noopener">wizualny raport →</a>
          <a href="/results/polnative_strategy.html" target="_blank" rel="noopener">strategia SFT/CPT →</a>
        </div>
      </div>
    </div>
  );
}
