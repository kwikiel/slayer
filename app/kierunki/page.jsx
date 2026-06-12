export const metadata = {
  title: "Kierunki modelu | Slayer",
  description:
    "Lista kierunków dla modelu: prawniczy, medyczny, agentowy, administracja, RAG, edukacyjny i więcej — gdzie polski model ma realny moat.",
};

const css = `.moat{font-family:var(--mono);font-size:.64rem;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:5px}.moat.h{color:var(--acc);background:var(--acc-soft);border:1px solid rgba(199,148,72,.32)}.moat.m{color:var(--ink);background:var(--panel2);border:1px solid var(--line)}.moat.l{color:var(--dim);background:var(--panel2);border:1px solid var(--line2)}`;

export default function Kierunki() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">pomysły do decyzji</span>
        <h1>Jakim modelem <em>ma być</em> Slayer?</h1>
        <p>Polski model 11–14B wygrywa tam, gdzie ma <strong style={{ color: "var(--txt)" }}>moat</strong>: polskie dane, których nie ma globalna konkurencja. Ocena moatu jest wstępna — weryfikujemy ją pomiarem na <a href="/leaderboard">leaderboardzie</a>.</p>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="note" style={{ margin: "0 0 30px", borderLeftColor: "var(--acc)" }}><p><b>Decyzja (Faza 0):</b> <b style={{ color: "var(--ink)" }}>baza = Qwen3.5-9B</b> — wg <a href="/leaderboard" style={{ color: "var(--acc)" }}>leaderboardu</a> bije Bielika 8:1, w tym na większości osi polskich. Bielik wygrywa tylko <b style={{ color: "var(--ink)" }}>LLMzSzŁ</b> (egzaminy państwowe/zawodowe). Stąd kierunek: <b style={{ color: "var(--ink)" }}>specjalizacja prawno-urzędowa</b> na bazie Qwen — celowana w LLMzSzŁ i przepisy. <a href="/datasety" style={{ color: "var(--acc)" }}>dane pod LLMzSzŁ →</a></p></div>
        <div className="ghead"><h2>Specjalizacje domenowe</h2><span className="c">wąska wiedza · wysoki moat</span></div>
        <div className="grid auto-lg">
          <div className="cell"><div className="top"><span className="moat h">moat wysoki</span></div><h3 className="sm">Prawniczy</h3><p>Analiza umów, pisma, orzecznictwo, przepisy (KC/KPC/KK).</p><div className="meta"><div><span className="k">dane</span> ISAP, SAOS, wzory pism</div><div><span className="k">eval</span> legal QA + reasoning</div></div></div>
          <div className="cell"><div className="top"><span className="moat h">moat wysoki</span></div><h3 className="sm">Medyczny</h3><p>Wsparcie kliniczne, PES/LEK, streszczanie dokumentacji.</p><div className="meta"><div><span className="k">dane</span> egzaminy PES/LEK, ChPL</div><div><span className="k">eval</span> PES leaderboard</div></div></div>
          <div className="cell"><div className="top"><span className="moat h">moat wysoki</span></div><h3 className="sm">Finansowo-podatkowy</h3><p>Interpretacje podatkowe, faktury, JPK, KPiR.</p><div className="meta"><div><span className="k">dane</span> interpretacje KIS, ustawy</div><div><span className="k">eval</span> QA + dokładność liczb</div></div></div>
          <div className="cell"><div className="top"><span className="moat h">moat wysoki</span></div><h3 className="sm">Administracja publiczna</h3><p>ZUS, US, urzędy, wnioski. „Urzędowy&quot; na ludzki.</p><div className="meta"><div><span className="k">dane</span> gov.pl, druki, ePUAP</div><div><span className="k">eval</span> benchmark biurokracji</div></div></div>
        </div>
        <div className="ghead"><h2>Zdolności horyzontalne</h2><span className="c">przekrojowe · moat niższy</span></div>
        <div className="grid auto-lg">
          <div className="cell"><div className="top"><span className="moat m">moat średni</span></div><h3 className="sm">Agentowy / tool-use</h3><p>Function calling, planowanie, orkiestracja, RAG po polsku.</p><div className="meta"><div><span className="k">eval</span> tool-use + instrukcyjność</div></div></div>
          <div className="cell"><div className="top"><span className="moat m">moat średni</span></div><h3 className="sm">RAG / enterprise</h3><p>Odpowiedzi z firmowych dokumentów z cytatem, on-prem.</p><div className="meta"><div><span className="k">eval</span> rozumienie tekstu + faithfulness</div></div></div>
          <div className="cell"><div className="top"><span className="moat m">moat średni</span></div><h3 className="sm">Tłumaczeniowy PL↔</h3><p>Tłumaczenia wysokiej jakości — oś, gdzie polskie modele są mocne.</p><div className="meta"><div><span className="k">eval</span> FLORES-200 (BLEU/chrF)</div></div></div>
          <div className="cell"><div className="top"><span className="moat l">moat niski</span></div><h3 className="sm">Coding po polsku</h3><p>Asystent dev z polskim kontekstem, code review, docs.</p><div className="meta"><div><span className="k">eval</span> code + EN regresja</div></div></div>
        </div>
        <div className="ghead"><h2>Profil ogólny i obsługa</h2><span className="c">szeroki zasięg</span></div>
        <div className="grid auto-lg">
          <div className="cell"><div className="top"><span className="moat m">moat średni</span></div><h3 className="sm">Flagowy ogólny PL</h3><p>Naturalny styl, idiomy, rejestry, wiedza kulturowa.</p><div className="meta"><div><span className="k">eval</span> Open PL LLM (agregat)</div></div></div>
          <div className="cell"><div className="top"><span className="moat m">moat średni</span></div><h3 className="sm">Edukacyjny</h3><p>Korepetytor pod podstawę programową, matura, ósmoklasista.</p><div className="meta"><div><span className="k">eval</span> QA przedmiotowe + reasoning</div></div></div>
          <div className="cell"><div className="top"><span className="moat l">moat niski</span></div><h3 className="sm">Obsługa klienta</h3><p>Centrum obsługi: ton, deeskalacja, polityki firmowe.</p><div className="meta"><div><span className="k">eval</span> instrukcyjność + ton</div></div></div>
          <div className="cell"><div className="top"><span className="moat m">moat średni</span></div><h3 className="sm">Guard / moderacja</h3><p>Mały model-strażnik: moderacja, ryzyka, bezpieczeństwo po polsku.</p><div className="meta"><div><span className="k">eval</span> klasyfikacja (P/R)</div></div></div>
        </div>
        <div className="note"><p><b>Jak wybieramy:</b> najlepszy stosunek moatu danych do kosztu w budżecie 15–20k zł. Masz pomysł albo use case? <a href="/zespol" style={{ color: "var(--acc)", fontWeight: 500 }}>Dołącz / zgłoś →</a></p></div>
      </div></section>
    </>
  );
}
