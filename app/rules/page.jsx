export const metadata = {
  title: "Zasady projektu | Slayer",
  description: "Zasady organizacyjne Slayer: autorstwo Kacper Wikieł, początkowy model BDFL, reguły decyzji i udział kontrybutorów.",
};

const css = `
    .rulegrid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:18px;align-items:start}
    .rulebox{border:1px solid var(--line);border-radius:var(--rad);background:linear-gradient(180deg,rgba(255,255,255,.032),rgba(255,255,255,.012)),var(--panel);padding:24px;box-shadow:0 18px 48px rgba(0,0,0,.18)}
    .rulebox h2{margin:0 0 10px;font-family:var(--serif);font-weight:400;font-size:clamp(1.55rem,3vw,2.1rem);letter-spacing:-.015em}
    .rulebox p{margin:0;color:var(--mut);font-size:1rem;line-height:1.65}
    .rulebox p+p{margin-top:12px}
    .rulebox b{color:var(--ink);font-weight:600}
    .rulelist{display:grid;gap:0;border:1px solid var(--line);border-radius:var(--rad);overflow:hidden;background:linear-gradient(180deg,rgba(199,148,72,.055),rgba(255,255,255,.012)),var(--panel)}
    .ruleitem{display:grid;grid-template-columns:82px 1fr;gap:18px;padding:22px 24px;border-top:1px solid var(--line2)}
    .ruleitem:first-child{border-top:0}
    .ruleitem .no{font-family:var(--serif);font-style:italic;font-size:2.2rem;line-height:1;color:var(--acc)}
    .ruleitem h3{margin:1px 0 5px;font-size:1.08rem}
    .ruleitem p{margin:0;color:var(--mut);font-size:.96rem;line-height:1.6}
    @media(max-width:860px){.rulegrid{grid-template-columns:1fr}.ruleitem{grid-template-columns:1fr;gap:8px}}
`;

export default function Rules() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">zasady · zarządzanie · autorstwo</span>
        <h1>Zasady <em>projektu</em></h1>
        <p>Slayer zaczyna jako otwarty warsztat badawczy: publikujemy metody, pomiary i część artefaktów tak, by społeczność mogła je weryfikować i rozwijać. Otwartość dotyczy standardu pracy badawczej, nie deklaracji nonprofit. Slayer może w przyszłości działać jako organizacja komercyjna, jeśli będzie to najlepszy sposób finansowania compute, utrzymania zespołu i wdrażania polskich modeli w praktyce.</p>
      </div></section>

      <section className="sec tight"><div className="inner rulegrid">
        <div className="rulebox">
          <span className="kick">autorstwo</span>
          <h2>Slayer jest projektem autorstwa Kacpra Wikieła.</h2>
          <p><b>Kacper Wikieł</b> jest inicjatorem, autorem kierunku i osobą odpowiedzialną za początkową strukturę projektu: zakres badań, standard publikacji, ton marki, priorytety techniczne i decyzje o tym, co trafia do oficjalnego Slayera.</p>
          <p>Kontrybucje są mile widziane, ale oficjalna linia projektu musi pozostać spójna: dobry smak, twardy pomiar, jawny koszt i brak benchmaxxingu. Wkład społeczności nie wyklucza przyszłej struktury for-profit.</p>
        </div>

        <div className="rulebox">
          <span className="kick">struktura początkowa</span>
          <h2>Benevolent Dictator For Life.</h2>
          <p>Początkowy model organizacyjny Slayera to <b>BDFL</b>, czyli <b>Benevolent Dictator For Life</b> — model znany z wczesnej historii Pythona. W praktyce oznacza to, że Kacper Wikieł ma ostatnie słowo w sprawach kierunku, jakości, publikacji, nazwy, marki i konfliktów decyzyjnych.</p>
          <p>To nie jest zamknięcie projektu. To mechanizm utrzymania spójności, dopóki Slayer nie ma dojrzałego governance, stałych maintainerów i jasnych procesów rozstrzygania sporów.</p>
        </div>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Reguły pracy</h2><span className="c">obowiązują od startu</span></div>
        <div className="rulelist">
          <div className="ruleitem"><div className="no">01</div><div><h3>Jedna oficjalna linia</h3><p>Każdy może eksperymentować, forkować i proponować zmiany. Oficjalny Slayer zachowuje jednak jedną linię decyzyjną i jedną odpowiedzialność redakcyjną.</p></div></div>
          <div className="ruleitem"><div className="no">02</div><div><h3>Merit, nie hałas</h3><p>Decyzje techniczne zapadają na podstawie artefaktów: kodu, danych, pomiarów, kosztu, replikowalności i jakości odpowiedzi. Sama opinia nie wystarcza.</p></div></div>
          <div className="ruleitem"><div className="no">03</div><div><h3>Wkład daje głos</h3><p>Realni kontrybutorzy mają wpływ na plan działania i priorytety. Wpływ rośnie z odpowiedzialnością za dowożone rzeczy, a nie z deklaracjami.</p></div></div>
          <div className="ruleitem"><div className="no">04</div><div><h3>Spory domykamy</h3><p>Jeśli dyskusja nie prowadzi do decyzji, BDFL domyka temat. Celem jest ruch projektu, nie nieskończona debata.</p></div></div>
          <div className="ruleitem"><div className="no">05</div><div><h3>Governance może dorosnąć</h3><p>Gdy projekt będzie miał stabilnych maintainerów, regularnych kontrybutorów i większą powierzchnię odpowiedzialności, struktura może przejść w bardziej formalny model. Do tego czasu obowiązuje BDFL.</p></div></div>
        </div>
      </div></section>

      <section className="sec tight"><div className="inner narrow" style={{ textAlign: "center" }}>
        <span className="kick">prosty kontrakt</span>
        <h2 className="serif" style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 400, letterSpacing: "-.015em", margin: "12px 0" }}>Pracujemy publicznie. Decydujemy spójnie.</h2>
        <p className="muted" style={{ margin: "0 auto 24px", maxWidth: "56ch" }}>Jeśli chcesz dołożyć kod, dane, ewaluację albo compute, wejście jest otwarte. Jeśli chcesz zmienić kierunek projektu, przynieś dowód.</p>
        <div className="cta-row" style={{ justifyContent: "center" }}><a className="btn btn-p" href="/zespol">dołącz do projektu →</a><a className="btn btn-s" href="/team">zespół</a></div>
      </div></section>
    </>
  );
}
