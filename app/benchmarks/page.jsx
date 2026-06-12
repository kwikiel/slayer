import { ScoreBoard, StartingFive } from "./live";

export const metadata = {
  title: "Benchmarki — metodologia | Slayer",
  description:
    "Metodologia pomiaru: piątka startowa (LLMzSzŁ, PES, PoQuAD, Belebele, FLORES) + kontrola regresji EN. Publiczne, deterministyczne, liczone czysto — bez benchmaxxingu.",
};

const css = `
    .board{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:clamp(16px,5vw,44px);margin:8px 0 4px;padding:24px clamp(16px,4vw,30px);border:1px solid var(--line);border-radius:10px;background:var(--panel);box-shadow:0 10px 30px rgba(0,0,0,.28)}
    .team{text-align:center}.team .tg{font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}.team .nm{font-weight:600;font-size:clamp(1rem,2.2vw,1.35rem);margin-top:5px}
    .cnt{display:flex;align-items:baseline;gap:14px;font-family:var(--serif);font-weight:400;font-size:clamp(2.6rem,9vw,4.2rem)}
    .cnt .b{color:var(--acc)}.cnt .q{color:var(--mut)}.cnt .d{color:var(--dim)}
    .bfoot{grid-column:1/-1;border-top:1px solid var(--line2);margin-top:16px;padding-top:14px;text-align:center;font-family:var(--mono);font-size:.78rem;color:var(--mut)}.bfoot b{color:var(--acc)}
    td.score{text-align:center;font-family:var(--mono);font-weight:600;font-size:1.1rem;color:var(--mut);white-space:nowrap}
    td.verdict{text-align:center}
    @media(max-width:760px){.board{grid-template-columns:1fr;gap:14px}}
`;

export default function Benchmarks() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">metodologia · piątka startowa</span>
        <h1>Jak <em>mierzymy</em>, żeby wynik znaczył</h1>
        <p>Publiczne zbiory, deterministycznie, przez lm-eval-harness. „Wyżej = lepiej&quot;. Wszystko liczone czysto — <strong style={{ color: "var(--txt)" }}>bez inspekcji itemów, bez benchmaxxingu</strong>. Pełna tablica na żywo: <a href="/leaderboard">/leaderboard</a>.</p>
      </div></section>

      <section className="sec tight"><div className="inner">
        <ScoreBoard />

        <div className="ghead" style={{ marginTop: 34 }}><h2>Piątka startowa</h2><span className="c">live · wyniki z leaderboard.json</span></div>
        <StartingFive />
        <p className="muted" style={{ marginTop: 10, fontSize: ".9rem" }}>Pełna lista 10 benchmarków (z kontrolą regresji EN): <a href="/leaderboard" style={{ color: "var(--acc)" }}>/leaderboard</a> · zamknięte: <a href="/closed-benchmarks" style={{ color: "var(--acc)" }}>/closed-benchmarks</a></p>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Zasady pomiaru</h2></div>
        <div className="grid auto">
          <div className="cell"><div className="n">RÓWNE WARUNKI</div><h3 className="sm">Ten sam harness</h3><p>Identyczny tryb, few-shot i szablon promptu dla obu modeli.</p></div>
          <div className="cell"><div className="n">CZYSTOŚĆ</div><h3 className="sm">Tylko liczymy</h3><p>Bez inspekcji pojedynczych itemów — agregaty. Zero benchmaxxingu.</p></div>
          <div className="cell"><div className="n">REGRESJA</div><h3 className="sm">Pod kontrolą</h3><p>Belebele (PL/EN) i FLORES pilnują, by zysk na PL nie zjadł angielskiego.</p></div>
          <div className="cell"><div className="n">ODTWARZALNOŚĆ</div><h3 className="sm">Publiczny kod</h3><p>Skrypty, configi i wersje datasetów do repo. Każdy wynik da się powtórzyć.</p></div>
        </div>
      </div></section>
    </>
  );
}
