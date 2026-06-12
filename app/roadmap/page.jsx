export const metadata = {
  title: "Harmonogram & call for contributions | Slayer",
  description: "Harmonogram: od pomiaru baseline, przez dane i pierwszy trening, po RL na egzaminach. Plus call for contributions.",
};

export default function Roadmap() {
  return (
    <>
      <section className="phero"><div className="inner">
        <span className="kick">harmonogram · 6–8 tygodni</span>
        <h1>Plan i <em>zaproszenie do współpracy</em></h1>
        <p>Od pomiaru bazowego, przez dane i pierwszy trening, po RL na egzaminach. Wszystko jawne, odtwarzalne, mierzone na held-out. Daty orientacyjne — projekt idzie tak szybko, jak społeczność.</p>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="note" style={{ margin: "0 0 28px", borderLeftColor: "var(--acc)" }}><p><b>Decyzja (wg leaderboardu):</b> <b style={{ color: "var(--ink)" }}>baza = Qwen3.5-9B</b>. W pomiarze Fazy 0 Qwen3.5-9B bije Bielika-11B-v3 8:1 (9 ważnych osi), w tym na większości polskich. Bielik trzyma jedynie <b style={{ color: "var(--ink)" }}>LLMzSzŁ</b> (egzaminy państwowe/zawodowe) — naszą oś docelową. Plan: Qwen jako baza + polska specjalizacja celowana w LLMzSzŁ i prawo/administrację → przebić Bielika szeroko. <a href="/leaderboard" style={{ color: "var(--acc)" }}>wyniki →</a></p></div>
        <div className="ghead"><h2>Harmonogram</h2><span className="c">zakończone · następne · planowane</span></div>
        <div className="tl">
          <div className="ph"><div><div className="when">F0 · czerwiec</div><span className="st" style={{ color: "var(--acc)", background: "var(--acc-soft)", border: "1px solid rgba(199,148,72,.3)" }}>zakończona ✓</span></div><div><h3>Pomiar bazowy</h3><p>Bielik 1 : 8 Qwen3.5-9B (9 ważnych osi, multi-seed). Werdykt: baza = Qwen3.5-9B. <a href="/leaderboard" style={{ color: "var(--acc)" }}>leaderboard</a>.</p></div></div>
          <div className="ph"><div><div className="when">F1 · czerwiec</div><span className="st" style={{ color: "var(--acc)", background: "var(--acc-soft)", border: "1px solid rgba(199,148,72,.3)" }}>w toku</span></div><div><h3>Społeczność i dane</h3><p><a href="https://github.com/slayerlabs" style={{ color: "var(--acc)" }}>Repo</a> otwarte, zespół (<a href="/zespol" style={{ color: "var(--acc)" }}>zapisy</a>), korpusy prawno-urzędowe (<a href="/datasety" style={{ color: "var(--acc)" }}>datasety</a>), dekontaminacja, held-out.</p></div></div>
          <div className="ph"><div><div className="when">F2 · lipiec</div><span className="st" style={{ color: "var(--dim)", background: "var(--panel2)", border: "1px solid var(--line2)" }}>planowane</span></div><div><h3>Pierwszy trening</h3><p>QLoRA SFT na <b>Qwen3.5-9B</b> (PL + egzaminy zawodowe) → ORPO/DPO. <a href="/trening" style={{ color: "var(--acc)" }}>metody</a>.</p></div></div>
          <div className="ph"><div><div className="when">F3 · lipiec/sierpień</div><span className="st" style={{ color: "var(--dim)", background: "var(--panel2)", border: "1px solid var(--line2)" }}>planowane</span></div><div><h3>RL na egzaminach</h3><p>GRPO/RLVR z weryfikowalną nagrodą + trening odmowy/grounding.</p></div></div>
          <div className="ph"><div><div className="when">F4 · sierpień</div><span className="st" style={{ color: "var(--dim)", background: "var(--panel2)", border: "1px solid var(--line2)" }}>planowane</span></div><div><h3>Iteracje i raport</h3><p>Ablacje, merging, pomiar na held-out, publiczny raport. Decyzja: czy o epsilon lepiej.</p></div></div>
        </div>
        <div className="note"><p><b>Cel:</b> otwarty, odtwarzalny polski model 11–14B — super tanio (~15–20k zł) i o epsilon lepszy od punktu odniesienia.</p></div>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Zaproszenie do współpracy</h2><span className="c">czego potrzebujemy teraz (F0→F1)</span></div>
        <div className="grid auto-lg">
          <div className="cell"><div className="n">RĘCE</div><h3 className="sm">Kontrybutorzy</h3><p>Ewaluacje, dekontaminacja, loadery, dane. Wejdź na dowolnym poziomie.</p><div className="meta"><a href="/zadania" style={{ color: "var(--acc)" }}>Lista zadań →</a></div></div>
          <div className="cell"><div className="n">DANE</div><h3 className="sm">Dane prawno-urzędowe</h3><p>ISAP, orzeczenia, interpretacje — to nasz moat.</p><div className="meta"><a href="/datasety" style={{ color: "var(--acc)" }}>Datasety →</a></div></div>
          <div className="cell"><div className="n">RYNEK</div><h3 className="sm">Firmy — zastosowanie</h3><p>Powiedz, czego potrzebujesz. Zostań pierwszym użytkownikiem.</p><div className="meta"><a href="/zespol" style={{ color: "var(--acc)" }}>Zgłoś use case →</a></div></div>
          <div className="cell"><div className="n">ZASOBY</div><h3 className="sm">Fundatorzy</h3><p>GPU lub kredyty (RunPod/Vast). Budżet 15–20k zł, każda złotówka jawna.</p><div className="meta"><a href="/zespol" style={{ color: "var(--acc)" }}>Wesprzyj →</a></div></div>
          <div className="cell"><div className="n">NAUKA</div><h3 className="sm">Naukowcy</h3><p>Metodyka, ewaluacje, współautorstwo wyników.</p><div className="meta"><a href="/zespol" style={{ color: "var(--acc)" }}>Dołącz →</a></div></div>
        </div>
        <div className="cta-row" style={{ marginTop: 24 }}><a className="btn btn-p" href="/zespol">Dołącz / zapisz się →</a><a className="btn btn-s" href="https://discord.gg/HnTkVR4c5T" rel="noopener">Discord</a></div>
      </div></section>
    </>
  );
}
