import Console from "./console";

export const metadata = {
  title: "Pomiar na żywo | Slayer",
  description: "Podgląd na żywo: autonomiczna kolejka benchmarków na simp (RTX 3090) z paskiem postępu, ETA i wynikami.",
};

const css = `
    .g2{display:grid;grid-template-columns:1.4fr 1fr;gap:14px;margin-bottom:14px}@media(max-width:780px){.g2{grid-template-columns:1fr}}
    .bigbar{height:24px;border-radius:6px;background:rgba(255,255,255,.05);border:1px solid var(--line);overflow:hidden;position:relative}
    .bigbar i{display:block;height:100%;background:linear-gradient(90deg,var(--acc),var(--blue));transition:width .8s ease}
    .bigbar.run i{background-image:linear-gradient(90deg,var(--acc),#74a37a);background-size:200% 100%;animation:str 1s linear infinite}
    @keyframes str{to{background-position:-200% 0}}
    .bigbar .pc{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--mono);font-size:.78rem;font-weight:600;color:var(--ink);text-shadow:0 1px 12px rgba(0,0,0,.5)}
    .big{font-family:var(--mono);font-weight:600;font-size:2.4rem;color:var(--txt)}
    .ticks{display:flex;flex-wrap:wrap;gap:20px;margin-top:16px;padding-top:14px;border-top:1px solid var(--line2)}
    .tick .v{font-family:var(--mono);font-weight:600;font-size:1.3rem}.tick .v.acc{color:var(--acc)}.tick .k{font-family:var(--mono);font-size:.72rem;color:var(--dim)}
    .cur-job{font-family:var(--serif);font-size:1.5rem}
    .steps{display:grid;gap:8px}
    .step{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:6px;background:rgba(255,255,255,.025);border:1px solid var(--line2)}
    .step .ic{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.74rem;font-weight:700;flex:none;font-family:var(--mono)}
    .step.done .ic{background:var(--acc);color:var(--acc-ink)}.step.running .ic{border:2px solid var(--acc);color:var(--acc);animation:sp 1.2s linear infinite}.step.queued .ic{background:var(--panel2);color:var(--dim)}.step.fail .ic{background:#8f3b31;color:var(--ink)}
    @keyframes sp{to{transform:rotate(360deg)}}
    .step .nm{font-weight:400}.step .st{margin-left:auto;font-family:var(--mono);font-size:.74rem;color:var(--dim)}.step.done .st{color:var(--acc)}
    .scoreline{display:flex;align-items:baseline;justify-content:center;gap:14px;font-family:var(--mono);font-weight:600;font-size:2.4rem;margin:6px 0}
    .scoreline .b{color:var(--acc)}.scoreline .q{color:#9aa3b2}.scoreline .d{color:var(--dim);font-weight:400}
    h1{font-family:var(--serif);font-weight:400;font-size:clamp(1.9rem,4.4vw,2.8rem);letter-spacing:-.015em;margin:10px 0 0}
`;

export default function Progress() {
  return (
    <div className="sec page-top">
      <style>{css}</style>
      <div className="inner">
        <Console />
      </div>
    </div>
  );
}
