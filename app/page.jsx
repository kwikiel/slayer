import { BenchCount, MeasureNote } from "./home-live";

export const metadata = {
  title: "Slayer — applied research lab dla polskich modeli",
  description:
    "Slayer to niezależne applied research lab dla polskich modeli językowych: protokoły ewaluacji, lineage danych, recepty treningowe i jawne koszty. Dobry smak plus twardy pomiar.",
};

const css = `
    /* ---------- hero ---------- */
    .hero{position:relative;padding:132px clamp(18px,5vw,72px) 0;overflow:hidden;min-height:96vh}
    .hero::before{content:"";position:absolute;inset:0;background:
      linear-gradient(90deg,rgba(9,9,7,.95) 0%,rgba(9,9,7,.80) 38%,rgba(9,9,7,.36) 72%,rgba(9,9,7,.82) 100%),
      linear-gradient(180deg,rgba(9,9,7,.18) 0%,rgba(9,9,7,.64) 72%,var(--bg) 100%),
      url('/assets/img/hermes-lab-threshold.png') center right/cover no-repeat;
      pointer-events:none;filter:saturate(.88) contrast(1.05)}
    .hero::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.38;background:
      repeating-linear-gradient(90deg,transparent 0 56px,rgba(222,202,154,.08) 56px 57px),
      repeating-linear-gradient(0deg,transparent 0 56px,rgba(222,202,154,.055) 56px 57px);
      -webkit-mask-image:radial-gradient(ellipse 82% 72% at 58% 22%,#000 0%,transparent 76%);
      mask-image:radial-gradient(ellipse 82% 72% at 58% 22%,#000 0%,transparent 76%)}
    /* hero jednoszpaltowy: prawa strona w całości dla obrazu pracowni */
    .hgrid{position:relative;z-index:1;width:min(var(--max),100%);margin:0 auto;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);align-items:center;min-height:72vh;padding-bottom:clamp(54px,7vw,84px)}
    @media(max-width:940px){.hgrid{grid-template-columns:1fr;min-height:0}}
    /* księga pomiarów pod hero: wpisy w dwóch kolumnach */
    .loggrid{display:grid;grid-template-columns:1fr 1fr;gap:0 34px;padding:6px 18px 8px}
    @media(max-width:820px){.loggrid{grid-template-columns:1fr}}
    .loggrid .logrow:nth-child(2){border-top:0}
    .htag{display:inline-flex;align-items:center;gap:10px;margin-bottom:26px}
    .htag .dot{width:7px;height:7px;border-radius:50%;background:var(--acc);animation:pl 2s infinite}
    .hero h1{margin:0 0 24px;font-family:var(--serif);font-size:clamp(3rem,6.8vw,5.9rem);line-height:.96;font-weight:360;letter-spacing:-.018em;color:var(--ink);max-width:10.6ch;text-wrap:balance;text-shadow:0 18px 70px rgba(0,0,0,.55)}
    .hero h1 em{font-style:italic;color:var(--acc)}
    .lede{max-width:620px;margin:0 0 32px;color:#cfc1a5;font-size:clamp(1.08rem,1.7vw,1.3rem);line-height:1.55;text-shadow:0 10px 34px rgba(0,0,0,.5)}
    .lede b{color:var(--ink);font-weight:600}
    .lede a{color:var(--acc);border-bottom:1px solid var(--acc-soft)}

    /* staggered reveal */
    .rv{opacity:0;transform:translateY(14px);animation:rv .7s cubic-bezier(.2,.7,.3,1) forwards}
    .rv.d1{animation-delay:.06s}.rv.d2{animation-delay:.16s}.rv.d3{animation-delay:.26s}
    .rv.d4{animation-delay:.36s}.rv.d5{animation-delay:.48s}
    @keyframes rv{to{opacity:1;transform:none}}
    @media(prefers-reduced-motion:reduce){.rv{animation:none;opacity:1;transform:none}}

    /* lab log panel */
    .loghead{display:flex;align-items:center;gap:8px}
    .logrow{display:grid;grid-template-columns:86px 1fr auto;gap:12px;align-items:baseline;padding:13px 2px;border-top:1px solid var(--line2);font-size:.92rem}
    .logrow:first-child{border-top:0}
    .logrow .dt{font-family:var(--mono);font-size:.72rem;color:var(--dim);letter-spacing:.04em}
    .logrow .what{color:var(--txt)}
    .logrow .what b{font-weight:600;color:var(--ink)}
    .logrow .what .sub{display:block;font-family:var(--mono);font-size:.72rem;color:var(--dim);margin-top:2px}
    .logrow .go{font-family:var(--mono);font-size:.78rem;color:var(--acc);white-space:nowrap}
    a.logrow{transition:background .15s}
    a.logrow:hover{background:rgba(199,148,72,.07)}
    @media(max-width:480px){.logrow{grid-template-columns:1fr auto}.logrow .dt{display:none}}

    /* stat strip */
    .stats{position:relative;z-index:1;border-top:1px solid var(--line);background:rgba(9,9,7,.78);backdrop-filter:blur(14px)}
    .stats .inner{display:grid;grid-template-columns:repeat(4,1fr);width:min(var(--max),100%);margin:0 auto}
    @media(max-width:820px){.stats .inner{grid-template-columns:repeat(2,1fr)}}
    .stat{padding:22px clamp(14px,2vw,28px);border-left:1px solid var(--line2)}
    .stat:first-child{border-left:0}
    @media(max-width:820px){.stat:nth-child(3){border-left:0}.stat:nth-child(n+3){border-top:1px solid var(--line2)}}
    .stat .v{font-family:var(--serif);font-size:clamp(1.7rem,3vw,2.3rem);color:var(--ink);line-height:1.1}
    .stat .v .ac{color:var(--acc)}
    .stat .k{font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-top:5px}

    /* principles: editorial numbered list */
    .princ{display:grid;gap:0;border:1px solid var(--line);border-radius:var(--rad);background:linear-gradient(180deg,rgba(199,148,72,.06),rgba(255,255,255,.012)),var(--panel);overflow:hidden}
    .pr{display:grid;grid-template-columns:92px 1fr;gap:clamp(14px,3vw,34px);padding:clamp(20px,3vw,30px) clamp(18px,3vw,32px);border-top:1px solid var(--line2)}
    .pr:first-child{border-top:0}
    .pr .no{font-family:var(--serif);font-style:italic;font-size:clamp(1.9rem,3.4vw,2.7rem);color:var(--acc);line-height:1;opacity:.85}
    .pr h3{margin:2px 0 6px;font-size:1.16rem;font-weight:600;letter-spacing:0}
    .pr p{margin:0;color:var(--mut);font-size:.97rem;max-width:74ch}
    .pr p b{color:var(--ink)}
    @media(max-width:560px){.pr{grid-template-columns:1fr;gap:8px}}

    /* research areas */
    .area h3{font-family:var(--serif);font-weight:400;font-size:1.42rem;letter-spacing:-.01em;margin:12px 0 8px}
    .area .meta{margin-top:auto;padding-top:16px}
`;

export default function Home() {
  return (
    <>
      <style>{css}</style>

      <section className="hero">
        <div className="hgrid">
          <div>
            <div className="htag rv"><span className="dot"></span><span className="kick"><span className="ac">GOOD TASTE APPLIED RESEARCH LAB</span> · POLSKIE MODELE</span></div>
            <h1 className="rv d1">Protokół dla polskiej inteligencji.</h1>
            <p className="lede rv d2">Slayer bada modele językowe jak rzemiosło: smak odpowiedzi, czystość pomiaru, koszt treningu i ślady danych. Nie robimy widowiska. Zostawiamy <b>artefakty</b>: harnessy, lineage, recepty, modele i wyniki, które da się odtworzyć.</p>
            <div className="cta-row rv d3">
              <a className="btn btn-p" href="/benchmarks">otwórz protokoły →</a>
              <a className="btn btn-s" href="https://discord.gg/HnTkVR4c5T" rel="noopener" target="_blank">wejście do labu</a>
            </div>
          </div>
        </div>
        <div className="stats rv d5" style={{ margin: "0 calc(clamp(18px,5vw,72px) * -1)" }}>
          <div className="inner">
            <div className="stat"><BenchCount /><div className="k">osi ewaluacji</div></div>
            <div className="stat"><div className="v">24<span className="ac">k</span></div><div className="k">rekordów z widocznym rodowodem</div></div>
            <div className="stat"><div className="v">100<span className="ac">%</span></div><div className="k">claimów z held-out</div></div>
            <div className="stat"><div className="v">~18<span className="ac">k zł</span></div><div className="k">koszt wpisany w wynik</div></div>
          </div>
        </div>
      </section>

      <section className="sec tight">
        <div className="inner">
          <div className="panel rv d4">
            <div className="panel-top"><span className="loghead">księga pomiarów</span><span className="live"><span className="d"></span>NA ŻYWO</span></div>
            <div className="panel-bd loggrid">
              <a className="logrow" href="/eksperymenty">
                <span className="dt">2026-06</span>
                <span className="what"><b>slayer-style-27b</b>: smak odpowiedzi bez amnezji<span className="sub">LLMzSzŁ 65.0 vs baza 58.5 (likelihood, n=400)</span></span>
                <span className="go">otwórz →</span>
              </a>
              <a className="logrow" href="/datasety">
                <span className="dt">2026-06</span>
                <span className="what"><b>datasets</b>: dane treningowe + karty + lineage<span className="sub">miksy 1:1, disclosure kontaminacji v2</span></span>
                <span className="go">ślady →</span>
              </a>
              <a className="logrow" href="/benchmarks">
                <span className="dt">2026-06</span>
                <span className="what"><b>benchmarks</b>: karty 10 osi pomiaru<span className="sub">metryki, train policy, znane pułapki</span></span>
                <span className="go">osie →</span>
              </a>
              <a className="logrow" href="https://arena.fabryka.ai" rel="noopener" target="_blank">
                <span className="dt">2026-06</span>
                <span className="what"><b>arena</b>: ślepe porównania modeli PL<span className="sub">oceniaj odpowiedzi bez etykiet</span></span>
                <span className="go">wejdź →</span>
              </a>
            </div>
            <MeasureNote />
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="inner">
          <div className="shead"><div><span className="kick">01 · komnaty</span><h2>Cztery drzwi, jeden warsztat.</h2></div>
            <p>Każdy obszar ma własny protokół, artefakty i ślady. Bez ozdobnych deklaracji, bez wyników na słowo.</p></div>
          <div className="grid c2">
            <a className="cell area" href="/benchmarks"><div className="top"><span>ewaluacja</span><span className="ar">→</span></div>
              <h3>Czysty pomiar polszczyzny</h3>
              <p>Karty benchmarków: co mierzy każda oś, jaka metryka decyduje, gdzie leży pułapka. Likelihood i generacja rozdzielone, stały seed, tylko agregaty.</p>
              <div className="meta"><div><span className="k">artefakt</span>harness + karty 10 osi (LLMzSzŁ, KLEJ, PoQuAD…)</div></div></a>
            <a className="cell area" href="/datasety"><div className="top"><span>dane</span><span className="ar">→</span></div>
              <h3>Kuracja zamiast masy</h3>
              <p>Małe, świetne zbiory biją duże i brudne. Pełny lineage każdego miksu treningowego, dekontaminacja względem ewaluacji, provenance per rekord.</p>
              <div className="meta"><div><span className="k">artefakt</span>karty datasetów + miksy treningowe 1:1 z lineage</div></div></a>
            <a className="cell area" href="/trening"><div className="top"><span>trening</span><span className="ar">→</span></div>
              <h3>Recepty, które przechodzą próg</h3>
              <p>QLoRA SFT, preferencje (DPO/ORPO), RL na weryfikowalnych nagrodach. Każdy run z gate&apos;ami regresji: zysk na celu bez utraty kompetencji bazowych.</p>
              <div className="meta"><div><span className="k">artefakt</span>cooking recipe + training log + decyzje z pomiarów</div></div></a>
            <a className="cell area" href="/kierunki"><div className="top"><span>styl</span><span className="ar">→</span></div>
              <h3>Naturalna polszczyzna</h3>
              <p>Model ma pisać jak ktoś, kto ma ucho: bez kalek z angielskiego, bez asystenckiej waty, z natywną fleksją. Mierzone twardymi metrykami i otwartym sędzią.</p>
              <div className="meta"><div><span className="k">artefakt</span>style-SFT 1.6k przykładów + eval stylu held-out</div></div></a>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="sec alt">
        <div className="inner">
          <div className="shead"><div><span className="kick">02 · reguły przejścia</span><h2>Co wpuszczamy do twierdzeń.</h2></div>
            <p>Rygor ewaluacyjny jest częścią smaku. Te reguły obowiązują w każdym runie.</p></div>
          <div className="princ">
            <div className="pr"><div className="no">01</div><div><h3>Held-out albo nic</h3><p>Publiczne twierdzenia wyłącznie z danych, których model nie widział, mierzone tym samym protokołem co baseline&apos;y. Wynik na zadaniu trenowanym oznaczamy jako trenowany i nie liczymy do claimów.</p></div></div>
            <div className="pr"><div className="no">02</div><div><h3>Agregaty, nie itemy</h3><p>Analizujemy accuracy per kategoria, domena, rok. Nie oglądamy pojedynczych pytań benchmarków i nie piszemy na ich podstawie danych treningowych. Pliki ewaluacji wchodzą do pipeline&apos;u wyłącznie jako wejście dekontaminacji.</p></div></div>
            <div className="pr"><div className="no">03</div><div><h3>Lineage i disclosure</h3><p>Każdy model ma audytowalną listę: co dokładnie weszło do treningu, skąd, z jaką licencją. Gdy popełniliśmy błąd (skażony miks v2), <b>opublikowaliśmy go z pełnym disclosure</b> zamiast chować.</p></div></div>
            <div className="pr"><div className="no">04</div><div><h3>Otwarci sędziowie</h3><p>Tam, gdzie ocenia LLM, sędzią jest model o otwartych wagach, z podanym promptem i wersją. Zamknięte API nie filtrują danych i nie wystawiają ocen, na których stoi wynik.</p></div></div>
            <div className="pr"><div className="no">05</div><div><h3>Koszt jest wynikiem</h3><p>Budżet, sprzęt i czas każdego runu są częścią publikacji. Teza kosztowa (konkurencyjny model za ~15–20k zł) jest falsyfikowalna jak każda inna.</p></div></div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="sec">
        <div className="inner">
          <div className="shead"><div><span className="kick">03 · wejścia</span><h2>Wybierz ślad.</h2></div>
            <p>Sześć modułów na żywo. Pomiary aktualizują się automatycznie, logi pisze pipeline.</p></div>
          <div className="grid auto">
            <a className="cell" href="/leaderboard"><div className="top"><span>pomiary</span><span className="ar">→</span></div><h3 className="sm">Ewaluacje na żywo</h3><p>Wyniki wszystkich mierzonych modeli, oś po osi.</p></a>
            <a className="cell" href="/eksperymenty"><div className="top"><span>log</span><span className="ar">→</span></div><h3 className="sm">Eksperymenty</h3><p>Dziennik runów: hipoteza, setup, wynik, decyzja.</p></a>
            <a className="cell" href="/benchmarks"><div className="top"><span>metoda</span><span className="ar">→</span></div><h3 className="sm">Benchmarki</h3><p>Karty osi pomiaru i zasady czystości.</p></a>
            <a className="cell" href="/datasety"><div className="top"><span>dane</span><span className="ar">→</span></div><h3 className="sm">Datasety</h3><p>Ewaluacja vs trening, lineage, licencje.</p></a>
            <a className="cell" href="/trening"><div className="top"><span>recepty</span><span className="ar">→</span></div><h3 className="sm">Trening</h3><p>SFT, DPO/ORPO, GRPO/RLVR i gate&apos;y regresji.</p></a>
            <a className="cell" href="/zespol"><div className="top"><span>ludzie</span><span className="ar">→</span></div><h3 className="sm">Zespół</h3><p>Kto buduje i jak dołączyć.</p></a>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="sec">
        <div className="inner">
          <div className="shead"><div><span className="kick">04 · kontekst</span><h2>Bez teatru zwycięstwa.</h2></div>
            <p>Polska scena AI rośnie wtedy, gdy laby publikują i weryfikują nawzajem swoje wyniki.</p></div>
          <div className="grid c2">
            <div className="cell"><h3 className="sm">Ekosystem, nie pojedynek</h3><p>Bielik (SpeakLeash) to ważny punkt odniesienia w naszych ewaluacjach i wzór otwartego raportowania. Nasz wkład jest komplementarny: niezależna replikacja, tańsza ścieżka treningu i publiczny warsztat pomiarowy, z którego może korzystać każdy polski projekt.</p></div>
            <div className="cell"><h3 className="sm">Baza i licencja</h3><p>Budujemy na Qwen3.5-27B (Apache 2.0): pochodne można trenować, wydawać i komercjalizować otwarcie. Mniejsze modele nie wystarczają jeszcze na polskie SOTA; 9B służy nam tylko do tanich iteracji. Trening i hosting w Polsce, receptura jawna.</p></div>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="inner narrow" style={{ textAlign: "center" }}>
          <span className="kick">dołącz</span>
          <h2 className="serif" style={{ fontSize: "clamp(2.1rem,4.2vw,3.1rem)", fontWeight: 400, letterSpacing: "-.015em", margin: "14px 0 14px" }}>Wejdź, jeśli chcesz mierzyć.</h2>
          <p className="muted" style={{ maxWidth: "54ch", margin: "0 auto 26px", fontSize: "1.06rem" }}>Kontrybutorzy, naukowcy, firmy z use case&apos;ami i fundatorzy compute. Publiczny zapis, od razu widać, kto już jest.</p>
          <div className="cta-row" style={{ justifyContent: "center" }}><a className="btn btn-p" href="https://discord.gg/HnTkVR4c5T" rel="noopener" target="_blank">wejście do labu →</a><a className="btn btn-s" href="/zespol">zapisz się</a></div>
        </div>
      </section>
    </>
  );
}
