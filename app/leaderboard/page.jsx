import LeaderboardLive from "./live";

export const metadata = {
  title: "Leaderboard — Bielik-11B-v3 vs Qwen3.5-9B | Slayer",
  description: "Wyniki na żywo: Bielik-11B-v3 vs Qwen3.5-9B na 10 benchmarkach. Autonomiczna kolejka, czysty pomiar.",
};

const css = `
    .top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap}
    .top h1{margin:10px 0 0;font-family:var(--serif);font-size:clamp(1.9rem,4.4vw,3rem);font-weight:400;letter-spacing:-.015em}
    .upd{font-family:var(--mono);font-size:.76rem;color:var(--dim);margin:4px 0 0}
    .board{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:clamp(16px,5vw,48px);margin:24px 0;padding:24px clamp(16px,4vw,32px);border:1px solid var(--line);border-radius:10px;background:linear-gradient(180deg,var(--panel),var(--bg2))}
    .team{text-align:center}.team .tg{font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}.team .nm{font-weight:500;font-size:clamp(1rem,2.2vw,1.4rem);margin-top:5px}
    .cnt{display:flex;align-items:baseline;gap:14px;font-family:var(--mono);font-weight:600;font-size:clamp(2.6rem,9vw,4.4rem);line-height:1}
    .cnt .b{color:var(--acc)}.cnt .q{color:#9aa3b2}.cnt .d{color:var(--dim);font-weight:400}
    .bfoot{grid-column:1/-1;border-top:1px solid var(--line2);margin-top:16px;padding-top:14px;text-align:center;font-family:var(--mono);font-size:.78rem;color:var(--mut)}.bfoot b{color:var(--acc)}
    @media(max-width:760px){.board{grid-template-columns:1fr;gap:16px}}
`;

export default function Leaderboard() {
  return (
    <div className="sec page-top">
      <style>{css}</style>
      <div className="inner">
        <div className="top">
          <div><span className="kick"><span className="ac">LEADERBOARD</span> — bielik vs qwen3.5-9b</span><h1>Wyniki na żywo</h1></div>
          <span className="live"><span className="d"></span>LIVE · AUTO-SYNC</span>
        </div>
        <LeaderboardLive />
      </div>
    </div>
  );
}
