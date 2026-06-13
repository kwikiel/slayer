"use client";
import { useEffect, useState } from "react";

const fmtTokens = (n) => {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 2).replace(/\.00$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 100_000_000 ? 0 : 1).replace(/\.0$/, "") + "M";
  return Math.round(n).toLocaleString("pl");
};

const FALLBACK = {
  goal: "CPT 2B high-quality tokens",
  target_tokens: 2_000_000_000,
  accepted_tokens: 10_000_000,
  accepted_documents: 92_000,
  updated_at: "2026-06-13",
  stage: "collection",
  token_budget: [
    { name: "Polski korpus domenowy", target_tokens: 1_000_000_000, accepted_tokens: 10_000_000, description: "Prawo, administracja, edukacja, gospodarka lokalna, dokumenty publiczne i dlugi ogon polskiej wiedzy." },
    { name: "Ogolny polski wysokiej jakosci", target_tokens: 500_000_000, accepted_tokens: 0, description: "Ksiazki, artykuly, poradniki, Wikipedia/encyklopedie po dedupie, materialy edukacyjne." },
    { name: "Replay europejski/angielski", target_tokens: 200_000_000, accepted_tokens: 0, description: "Retencja ogolnych kompetencji i ograniczenie zapominania." },
    { name: "Kod i dokumentacja", target_tokens: 200_000_000, accepted_tokens: 0, description: "Dokumentacja techniczna, kod, API, narzedzia i teksty strukturalne." },
    { name: "Math/reasoning/fakty weryfikowalne", target_tokens: 100_000_000, accepted_tokens: 0, description: "Material pod pozniejsze RLVR/GRPO i sanity-check reasoning." },
  ],
  next_milestones: [
    { tokens: 50_000_000, label: "pierwszy audyt miksu" },
    { tokens: 250_000_000, label: "maly CPT signal run" },
    { tokens: 1_000_000_000, label: "decyzja o pelnym 2B runie" },
    { tokens: 2_000_000_000, label: "CPT 2B ready" },
  ],
};

export default function CptProgress() {
  const [data, setData] = useState(FALLBACK);

  useEffect(() => {
    fetch("/results/cpt_progress.json?ts=" + Date.now())
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const target = data?.target_tokens || 2_000_000_000;
  const accepted = data?.accepted_tokens || 0;
  const pct = Math.min(100, (accepted / target) * 100);
  const remaining = Math.max(0, target - accepted);

  return (
    <div className="panel cpt-panel" style={{ marginBottom: 14 }}>
      <div className="panel-top">
        <span>CPT corpus — cel 2B tokenów</span>
        <span className="live"><span className="d"></span>{data?.stage || "collection"}</span>
      </div>
      <div className="panel-bd">
        <div className="cpt-head">
          <div>
            <span className="kick"><span className="ac">QWEN3.5-9B-BASE</span> · HIGH QUALITY DATA</span>
            <h2>{data?.goal || "CPT 2B high-quality tokens"}</h2>
          </div>
          <a className="btn btn-s" href="/wiedza">program wiedzy →</a>
        </div>

        <div className="bigbar cptbar">
          <i style={{ width: pct + "%" }}></i>
          <span className="pc">{pct.toFixed(2)}%</span>
        </div>

        <div className="ticks">
          <div className="tick"><div className="v acc">{fmtTokens(accepted)}</div><div className="k">zaakceptowane tokeny</div></div>
          <div className="tick"><div className="v">{fmtTokens(target)}</div><div className="k">cel smoke CPT</div></div>
          <div className="tick"><div className="v">{fmtTokens(remaining)}</div><div className="k">brakuje</div></div>
          <div className="tick"><div className="v">{data?.accepted_documents ? data.accepted_documents.toLocaleString("pl") : "—"}</div><div className="k">dokumenty seed</div></div>
        </div>

        <div className="cptgrid">
          {(data?.token_budget || []).map((b) => {
            const bpct = Math.min(100, ((b.accepted_tokens || 0) / (b.target_tokens || 1)) * 100);
            return (
              <div className="cptbucket" key={b.name}>
                <div className="cptbucket-top">
                  <b>{b.name}</b>
                  <span>{fmtTokens(b.accepted_tokens || 0)} / {fmtTokens(b.target_tokens || 0)}</span>
                </div>
                <div className="track"><i style={{ width: bpct + "%" }}></i></div>
                <p>{b.description}</p>
              </div>
            );
          })}
        </div>

        <div className="cpt-milestones">
          {(data?.next_milestones || []).map((m) => {
            const done = accepted >= m.tokens;
            return (
              <div className={done ? "mile done" : "mile"} key={m.tokens}>
                <span>{fmtTokens(m.tokens)}</span>
                <b>{m.label}</b>
              </div>
            );
          })}
        </div>

        <p className="pnote">
          Bramka wejścia: licencja, language ID, boilerplate removal, exact/near dedup, PII policy, contamination check, quality score i split holdout. Stan: {data?.updated_at || "—"}.
        </p>
      </div>
    </div>
  );
}
