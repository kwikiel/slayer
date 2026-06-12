export const metadata = {
  title: "Benchmarki zamknięte | Slayer",
  description:
    "Benchmarki z niepublicznymi zbiorami testowymi — EQ-Bench, CPTUB, PLCC. Nie mierzymy ich, bo nie da się ich odtworzyć ani zweryfikować na otwartych danych.",
};

const css = `.cl{border-left:3px solid var(--acc)}.cl .dm{color:var(--ink);font-weight:600;margin:6px 0 10px}.cl .rs{color:var(--mut);font-size:.94rem;margin:0 0 12px}.cl .rs b{color:var(--ink)}`;

export default function ClosedBenchmarks() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">poza zakresem pomiaru</span>
        <h1>Benchmarki <em>zamknięte</em></h1>
        <p>Tych benchmarków <strong style={{ color: "var(--txt)" }}>nie mierzymy</strong> — ich zbiory testowe nie są publicznie dostępne, więc nie da się ich odtworzyć ani uczciwie zweryfikować. Listujemy je jawnie. Pomiary publiczne: <a href="/leaderboard">leaderboard</a>.</p>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>Trzy benchmarki bez otwartych danych</h2><span className="c">czego nie da się zmierzyć i czemu</span></div>
        <div className="grid auto-lg">
          <div className="cell cl"><div className="top"><span>zamknięty</span></div><h3 className="sm">Polish EQ-Bench</h3><div className="dm">Inteligencja emocjonalna.</div><p className="rs"><b>Dlaczego nie mierzymy:</b> brak publicznego zbioru pytań — zamknięty leaderboard, zestaw testowy held-out. Nie odtworzymy wyniku.</p><div className="tags"><span className="chip">EQ score</span><span className="chip">PL</span><span className="chip">zbiór: niepubliczny</span></div></div>
          <div className="cell cl"><div className="top"><span>zamknięty</span></div><h3 className="sm">CPTUB</h3><div className="dm">Pragmatyka, implikatury, podchwytliwe pytania.</div><p className="rs"><b>Dlaczego nie mierzymy:</b> istnieje jako przestrzeń-leaderboard, ale bez pobieralnego datasetu. Nie powtórzymy ewaluacji na równych warunkach.</p><div className="tags"><span className="chip">accuracy</span><span className="chip">PL</span><span className="chip"><a href="https://huggingface.co/spaces/speakleash/cptu_bench" rel="noopener" style={{ color: "var(--acc)" }}>leaderboard</a></span></div></div>
          <div className="cell cl"><div className="top"><span>zamknięty</span></div><h3 className="sm">PLCC</h3><div className="dm">Kompetencja kulturowo-językowa.</div><p className="rs"><b>Dlaczego nie mierzymy:</b> publiczne są jedynie <b>przykłady</b>; pełny zestaw 600 pytań trzymany prywatnie (anty-kontaminacja). Bez całości brak rzetelnego wyniku.</p><div className="tags"><span className="chip">accuracy</span><span className="chip">PL</span><span className="chip"><a href="https://huggingface.co/spaces/sdadas/plcc" rel="noopener" style={{ color: "var(--acc)" }}>leaderboard</a></span></div></div>
        </div>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Zasada</h2><span className="c">mierzymy tylko to, co odtwarzalne</span></div>
        <div className="grid c3">
          <div className="cell"><h3 className="sm">Odtwarzalność ponad zasięg</h3><p>Jeśli nie możemy pobrać zbioru i powtórzyć runu, benchmark nie trafia na tablicę.</p></div>
          <div className="cell"><h3 className="sm">Równe warunki</h3><p>Porównanie ma sens tylko, gdy oba modele przechodzą identyczny, jawny test.</p></div>
          <div className="cell"><h3 className="sm">Otwarci na zmianę</h3><p>Gdy któryś zbiór zostanie udostępniony — przenosimy go na <a href="/leaderboard" style={{ color: "var(--acc)" }}>leaderboard</a> i mierzymy.</p></div>
        </div>
        <div className="note"><p><b>Masz dostęp do tych danych?</b> Jeśli możesz legalnie udostępnić zbiór testowy lub harness, <a href="/zespol" style={{ color: "var(--acc)" }}>odezwij się →</a></p></div>
      </div></section>
    </>
  );
}
