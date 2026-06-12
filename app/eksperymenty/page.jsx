import ExperimentLog from "./log";

export const metadata = {
  title: "Log eksperymentów | Slayer",
  description: "Uczciwy log eksperymentów Slayer: każdy model, co trenowane, na czym, z jakim wynikiem. Kontaminacja benchmarkowa oznaczona jawnie.",
};

const css = `
    h1{font-family:var(--serif);font-weight:400;font-size:clamp(1.9rem,4.4vw,2.8rem);letter-spacing:-.015em;margin:10px 0 0}
    .log{display:grid;gap:16px;margin-top:26px}
    .xp{border:1px solid var(--line2);border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01)),var(--panel);overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.18)}
    .xp-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid var(--line2);background:rgba(255,255,255,.02)}
    .xp-date{font-family:var(--mono);font-size:.78rem;color:var(--dim)}
    .xp-name{font-family:var(--serif);font-size:1.35rem;color:var(--ink)}
    .badge{font-family:var(--mono);font-size:.68rem;font-weight:600;padding:3px 9px;border-radius:20px;letter-spacing:.03em}
    .badge.clean{background:rgba(116,163,122,.13);color:var(--good);border:1px solid rgba(116,163,122,.32)}
    .badge.contaminated{background:rgba(143,59,49,.16);color:#c98a78;border:1px solid rgba(143,59,49,.36)}
    .xp-macro{margin-left:auto;font-family:var(--mono);font-weight:600;font-size:1.4rem;color:var(--ink)}
    .xp-macro .d{font-size:.8rem;color:var(--dim);font-weight:400}
    .xp-bd{padding:16px 18px;display:grid;gap:12px}
    .meta{display:flex;flex-wrap:wrap;gap:8px 18px;font-family:var(--mono);font-size:.76rem;color:var(--mut)}
    .meta b{color:var(--ink);font-weight:500}
    .chips{display:flex;flex-wrap:wrap;gap:6px}
    .chip{font-family:var(--mono);font-size:.72rem;padding:3px 9px;border-radius:5px;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--mut)}
    .chip.contam{border-color:rgba(143,59,49,.36);color:#c98a78}
    .tasks{display:flex;flex-wrap:wrap;gap:14px;font-family:var(--mono);font-size:.78rem;margin-top:2px}
    .tasks .t .k{color:var(--dim);font-size:.7rem}.tasks .t .v{color:var(--ink);font-weight:600}
    .xp-note{font-size:.9rem;color:var(--mut);line-height:1.5;border-left:2px solid var(--line2);padding-left:12px}
    .xp-links{display:flex;gap:14px;font-family:var(--mono);font-size:.74rem}.xp-links a{color:var(--acc)}
    .banner{border:1px solid var(--line2);border-radius:10px;padding:16px 18px;background:rgba(199,148,72,.06);font-size:.92rem;color:var(--mut);line-height:1.55;margin-top:22px}
    .banner b{color:var(--ink)}
    .chartwrap{margin-top:4px;border:1px solid var(--line2);border-radius:8px;padding:10px 12px 6px;background:rgba(255,255,255,.015)}
    .chart{width:100%;height:130px;display:block}
    .chart .ltrain{fill:none;stroke:var(--mut);stroke-width:1.2;opacity:.85}
    .chart .leval{fill:none;stroke:var(--acc);stroke-width:1.8}
    .chart .deval{fill:var(--acc)}
    .chart .grid{stroke:var(--line2);stroke-width:.6;stroke-dasharray:3 3}
    .chart .ax{fill:var(--dim);font-family:var(--mono);font-size:9px}
    .leg{display:flex;gap:14px;font-family:var(--mono);font-size:.68rem;color:var(--dim);margin-top:4px}
    .leg .lg::before{content:"";display:inline-block;width:14px;height:2px;vertical-align:middle;margin-right:5px}
    .leg .lg.t::before{background:var(--mut)}.leg .lg.e::before{background:var(--acc)}
    .xp-es{font-family:var(--mono);font-size:.74rem;color:var(--acc);margin-top:2px}
    .secline{font-family:var(--mono);font-size:.68rem;color:var(--dim);letter-spacing:.04em;text-transform:uppercase;margin:6px 0 2px}
    .lossimg{width:100%;max-width:640px;border:1px solid var(--line2);border-radius:8px;display:block}
    .dataset{display:flex;flex-direction:column;gap:7px}
    .dspill{align-self:flex-start;font-family:var(--mono);font-size:.76rem;padding:5px 11px;border-radius:6px;background:var(--acc-soft);border:1px solid rgba(199,148,72,.25);color:var(--acc);text-decoration:none}
    .dspill:hover{background:rgba(199,148,72,.16)}
    .dsdesc{font-size:.86rem;color:var(--mut);line-height:1.5}
`;

export default function Eksperymenty() {
  return (
    <div className="sec page-top">
      <style>{css}</style>
      <div className="inner">
        <ExperimentLog />
      </div>
    </div>
  );
}
