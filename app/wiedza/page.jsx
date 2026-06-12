export const metadata = {
  title: "Wiedza — wstrzykiwanie polskiego długiego ogona (synthetic CPT) | Slayer",
  description:
    "Program badawczy: ile wiedzy o Polsce można wstrzyknąć w model syntetycznym CPT i za ile. Fermi-rachunek jądra wiedzy, probe długiego ogona, koszt vs pokrycie, hipotezy z falsyfikatorami.",
};

const css = `
    .figbox{border:1px solid var(--line);border-radius:var(--rad);background:var(--panel);padding:22px 22px 14px;margin:18px 0}
    .figbox h3{margin:0 0 4px;font-family:var(--serif);font-weight:400;font-size:1.3rem;letter-spacing:-.01em}
    .figbox .fc{font-family:var(--mono);font-size:.72rem;color:var(--dim);letter-spacing:.06em;margin-bottom:14px}
    .figbox svg{width:100%;height:auto;display:block}
    .figbox .src{font-family:var(--mono);font-size:.68rem;color:var(--dim);margin-top:10px}
    svg text{font-family:"IBM Plex Mono",monospace}
    .axis{stroke:rgba(222,202,154,.20);stroke-width:1}
    .gridl{stroke:rgba(222,202,154,.07);stroke-width:1}
    .lbl{fill:#6f6653;font-size:11px}
    .lblb{fill:#a89b82;font-size:11.5px}
    .val{fill:#f2ead7;font-size:12px;font-weight:600}
    .hyp{display:grid;grid-template-columns:92px 1fr auto;gap:clamp(12px,2.5vw,28px);padding:clamp(18px,2.6vw,26px) clamp(16px,2.6vw,28px);border-top:1px solid var(--line2);align-items:start}
    .hyp:first-child{border-top:0}
    .hyp .no{font-family:var(--serif);font-style:italic;font-size:clamp(1.7rem,3vw,2.3rem);color:var(--acc);line-height:1;opacity:.85}
    .hyp h3{margin:2px 0 6px;font-size:1.1rem;font-weight:600}
    .hyp p{margin:0;color:var(--mut);font-size:.95rem;max-width:70ch}
    .hyp .fals{margin-top:8px;font-family:var(--mono);font-size:.74rem;color:var(--dim)}
    .hyp .fals b{color:var(--amber);font-weight:500}
    .st{font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:99px;white-space:nowrap}
    .st.ok{color:var(--good);border:1px solid rgba(116,163,122,.4);background:rgba(116,163,122,.08)}
    .st.part{color:var(--amber);border:1px solid rgba(199,148,72,.4);background:var(--acc-soft)}
    .st.open{color:var(--dim);border:1px solid var(--line)}
    @media(max-width:640px){.hyp{grid-template-columns:1fr}.hyp .no{font-size:1.5rem}}
    .pyr td{font-size:.92rem}
    .pyr .bar{height:10px;border-radius:99px;background:var(--acc);opacity:.85}
`;

export default function Wiedza() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">program badawczy · synthetic CPT</span>
        <h1>Ile <em>wiedzy o Polsce</em> da się wstrzyknąć w model?</h1>
        <p>Bielik przeszedł 1.1T tokenów polskiego CPT i zna 29% naszego długiego ogona. Nasza baza (Qwen3.5-27B) zna 16%.
        Pytanie za kilka tysięcy dolarów: czy syntetyczna multiplikacja faktów (EntiGraph) wstrzykuje ogon taniej
        i głębiej niż surowy korpus? Wszystko poniżej jest mierzone, z falsyfikatorami.</p>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>1 · Ile w ogóle jest faktów</h2><span className="c">Fermi-rachunek, rzędy wielkości</span></div>
        <div className="figbox">
          <h3>Piramida faktów: od świata do naszego korpusu</h3>
          <div className="fc">fakt = atomowe twierdzenie &quot;X ma własność Y&quot; · skala logarytmiczna</div>
          <div className="tbl"><table className="pyr"><tbody>
            <tr><td className="dn">wiedza świata (Wikidata, encyklopedie)</td><td className="s">~10⁹</td><td style={{ width: "42%" }}><div className="bar" style={{ width: "100%" }}></div></td></tr>
            <tr><td className="dn">udokumentowane tylko w polskich źródłach<div className="ds">Wikipedia PL, SAOS, ISAP, prasa lokalna, BIP, GUS</div></td><td className="s">10⁷–10⁸</td><td><div className="bar" style={{ width: "72%" }}></div></td></tr>
            <tr><td className="dn">jądro pytalne<div className="ds">to, o co realnie zapyta egzamin, prawnik, mieszkaniec</div></td><td className="s">1–5M</td><td><div className="bar" style={{ width: "46%" }}></div></td></tr>
            <tr><td className="dn">w kolejce: ZPE (surowe akapity × ~8 faktów)</td><td className="s">~400k</td><td><div className="bar" style={{ width: "38%", background: "var(--blue)" }}></div></td></tr>
            <tr><td className="dn">zmultiplikowane w naszym korpusie (10M tok)</td><td className="s">~100k</td><td><div className="bar" style={{ width: "30%", background: "var(--good)" }}></div></td></tr>
          </tbody></table></div>
          <div className="src">74 616 par QA + 46 713 akapitów relacji z 6 506 artykułów · skala log: każdy stopień to ~rząd wielkości</div>
        </div>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>2 · Probe długiego ogona</h2><span className="c">knowledge_probe_v1 · 71 pytań closed-book · 2026-06-11</span></div>
        <div className="figbox">
          <h3>Kto zna polski długi ogon? (accuracy, %)</h3>
          <div className="fc">pytania z korpusu EntiGraph · sędzia: otwarty Qwen3.5-122B vs gold ugruntowany w źródle · temp 0</div>
          <svg viewBox="0 0 760 300" role="img" aria-label="Wykres słupkowy: accuracy modeli na pytaniach polonica i ogólnych">
            <line className="axis" x1="120" y1="20" x2="120" y2="250" />
            <line className="axis" x1="120" y1="250" x2="740" y2="250" />
            <g>
              <line className="gridl" x1="120" y1="135" x2="740" y2="135" /><text className="lbl" x="112" y="139" textAnchor="end">25</text>
              <line className="gridl" x1="120" y1="20" x2="740" y2="20" /><text className="lbl" x="112" y="24" textAnchor="end">50</text>
              <text className="lbl" x="112" y="254" textAnchor="end">0</text>
            </g>
            {/* grupy: polonica (n=38) / ogólne (n=33) */}
            <text className="lblb" x="265" y="285" textAnchor="middle">polonica · fakty lokalne (n=38)</text>
            <text className="lblb" x="595" y="285" textAnchor="middle">wiedza ogólna (n=33)</text>
            {/* polonica: bielik 28.9, q9 18.4, q27 15.8  (skala: 1% = 4.6px) */}
            <rect x="160" y="117.06" width="60" height="132.94" fill="#c79448" />
            <text className="val" x="190" y="109" textAnchor="middle">28.9</text>
            <text className="lbl" x="190" y="264" textAnchor="middle">Bielik 11B</text>
            <rect x="235" y="165.36" width="60" height="84.64" fill="#7e9eb0" />
            <text className="val" x="265" y="157" textAnchor="middle">18.4</text>
            <text className="lbl" x="265" y="264" textAnchor="middle">Qwen 9B</text>
            <rect x="310" y="177.32" width="60" height="72.68" fill="#74a37a" />
            <text className="val" x="340" y="169" textAnchor="middle">15.8</text>
            <text className="lbl" x="340" y="264" textAnchor="middle">Qwen 27B</text>
            {/* ogólne: 39.4 / 30.3 / 33.3 */}
            <rect x="490" y="68.76" width="60" height="181.24" fill="#c79448" />
            <text className="val" x="520" y="61" textAnchor="middle">39.4</text>
            <text className="lbl" x="520" y="264" textAnchor="middle">Bielik 11B</text>
            <rect x="565" y="110.62" width="60" height="139.38" fill="#7e9eb0" />
            <text className="val" x="595" y="102" textAnchor="middle">30.3</text>
            <text className="lbl" x="595" y="264" textAnchor="middle">Qwen 9B</text>
            <rect x="640" y="96.82" width="60" height="153.18" fill="#74a37a" />
            <text className="val" x="670" y="89" textAnchor="middle">33.3</text>
            <text className="lbl" x="670" y="264" textAnchor="middle">Qwen 27B</text>
          </svg>
          <div className="src">results/knowledge_probe_v1.json · itemy probe = held-out (exclusion list z treningu) · n=71, różnica Bielik↔27B na polonica jeszcze nieistotna statystycznie (potwierdzenie: probe 300–500 + drugi sędzia)</div>
        </div>
        <div className="note"><p><b>Odczyt:</b> długi ogon leży u wszystkich (16–29%). Bielik prowadzi: jego 1.1T CPT częściowo
        kupiło ogon. Nasza baza 27B ma najlepszą wiedzę ogólną (transfer z EN/ZH) i najsłabszą lokalną — bo faktów
        o eksporcie piwa z Mławy nie ma w żadnym nie-polskim korpusie. Tej luki nie da się przetransferować; można ją tylko wstrzyknąć.</p></div>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>3 · Koszt vs pokrycie jądra</h2><span className="c">ekonomia wstrzykiwania · ceny 2026-06</span></div>
        <div className="figbox">
          <h3>Za ile kupuje się pokrycie pytalnego jądra (1–5M faktów)</h3>
          <div className="fc">1 fakt ≈ 10 sformułowań × ~100 tok = ~1k tokenów syntetycznych · generacja (deepseek-flash) + trening (QLoRA 27B, 1 epoka) · oś X logarytmiczna</div>
          <svg viewBox="0 0 760 320" role="img" aria-label="Koszt łączny vs pokrycie jądra wiedzy">
            <line className="axis" x1="90" y1="20" x2="90" y2="260" />
            <line className="axis" x1="90" y1="260" x2="730" y2="260" />
            <g>
              <line className="gridl" x1="90" y1="200" x2="730" y2="200" /><text className="lbl" x="82" y="204" textAnchor="end">25%</text>
              <line className="gridl" x1="90" y1="140" x2="730" y2="140" /><text className="lbl" x="82" y="144" textAnchor="end">50%</text>
              <line className="gridl" x1="90" y1="80" x2="730" y2="80" /><text className="lbl" x="82" y="84" textAnchor="end">75%</text>
              <line className="gridl" x1="90" y1="20" x2="730" y2="20" /><text className="lbl" x="82" y="24" textAnchor="end">100%</text>
            </g>
            {/* X (log $): 10 -> x=150 ; 50 -> 290 ; 1000 -> 530* ; 3500 -> 660 (umowne pozycje log) */}
            <text className="lbl" x="150" y="276" textAnchor="middle">$10</text>
            <text className="lbl" x="295" y="276" textAnchor="middle">$50</text>
            <text className="lbl" x="540" y="276" textAnchor="middle">$1.5k</text>
            <text className="lbl" x="665" y="276" textAnchor="middle">$3.5k</text>
            {/* krzywa log-liniowa (hipoteza H1) */}
            <path d="M150,252 C 240,244 270,222 295,212 C 420,164 470,140 540,110 C 600,84 640,44 665,24" fill="none" stroke="#c79448" strokeWidth="2.5" strokeDasharray="1 0" />
            {/* punkty */}
            <circle cx="150" cy="252" r="6" fill="#74a37a" />
            <text className="val" x="150" y="236" textAnchor="middle">10M tok</text>
            <text className="lbl" x="150" y="222" textAnchor="middle">~3% · MAMY</text>
            <circle cx="295" cy="212" r="6" fill="#c79448" />
            <text className="val" x="295" y="194" textAnchor="middle">50M</text>
            <text className="lbl" x="295" y="180" textAnchor="middle">10–30%</text>
            <circle cx="540" cy="110" r="6" fill="#c79448" />
            <text className="val" x="540" y="93" textAnchor="middle">2B</text>
            <text className="lbl" x="540" y="79" textAnchor="middle">~50%</text>
            <circle cx="665" cy="24" r="6" fill="#7e9eb0" />
            <text className="val" x="640" y="40" textAnchor="end">5B tok</text>
            <text className="lbl" x="640" y="54" textAnchor="end">~100% jądra</text>
            {/* adnotacja Bielik CPT */}
            <line className="gridl" x1="90" y1="232" x2="730" y2="232" strokeDasharray="4 4" />
            <text className="lbl" x="726" y="226" textAnchor="end">poziom Bielika na probe (28.9% ogona) — cel minimum po pierwszym CPT</text>
          </svg>
          <div className="src">kształt krzywej = hipoteza H1 (log-liniowość, EntiGraph); pozycje punktów 50M+ to prognoza do zmierzenia, nie wynik · pełne jądro ≈ $2k generacji + $0.7–1.5k treningu — mieści się w tezie „model za 15–20k zł&quot;</div>
        </div>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>4 · Hipotezy badawcze</h2><span className="c">każda z falsyfikatorem · status na 2026-06-11</span></div>
        <div className="princ">
          <div className="hyp"><div className="no">H1</div><div>
            <h3>Wstrzykiwanie wiedzy skaluje się log-liniowo z tokenami syntetycznymi</h3>
            <p>Za EntiGraph (Stanford 2024): accuracy closed-book rośnie ~log-liniowo z liczbą syntetycznych tokenów multiplikujących fakty. Pierwszy punkt pomiarowy: CPT na 10M tokenów, probe przed/po.</p>
            <div className="fals"><b>falsyfikator:</b> delta na probe po 10M ≤ +3 pp → krzywa płaska, ekonomia z sekcji 3 nieaktualna</div>
          </div><span className="st open">do testu</span></div>
          <div className="hyp"><div className="no">H2</div><div>
            <h3>Lokalnego ogona nie da się przetransferować między językami</h3>
            <p>Fakty istniejące tylko w polskich źródłach (lokalna gospodarka, regionalia, administracja) są nieobecne w modelach trenowanych globalnie, niezależnie od ich rozmiaru. Qwen 27B: 15.8% na polonica przy 33.3% na wiedzy ogólnej.</p>
            <div className="fals"><b>falsyfikator:</b> na probe 300–500 z czystą stratą „fakt lokalny&quot; Qwen 27B osiąga &gt;40% bez CPT</div>
          </div><span className="st part">wstępnie potwierdzona</span></div>
          <div className="hyp"><div className="no">H3</div><div>
            <h3>Surowy korpus kupuje ogon fragmentarycznie</h3>
            <p>1.1T polskich tokenów CPT (Bielik) daje 28.9% ogona: fakt występujący w korpusie raz, w jednym sformułowaniu, zwykle nie zapisuje się w wagach. Multiplikacja sformułowań (×10) powinna być radykalnie tańsza na fakt niż skala surowa.</p>
            <div className="fals"><b>falsyfikator:</b> nasz CPT na 10M tokenów syntetycznych nie zbliża się do poziomu Bielika (≤22%) na polonica</div>
          </div><span className="st part">wstępnie potwierdzona</span></div>
          <div className="hyp"><div className="no">H4</div><div>
            <h3>Pytalne jądro polskiej wiedzy mieści się w budżecie hobbystycznym</h3>
            <p>~5M faktów × 1k tokenów = ~5B tokenów syntetycznych ≈ $2k generacji + $0.7–1.5k treningu. Jeśli H1 i H3 się bronią, pełne jądro to rząd $3–4k, czyli wciąż „super tanio + epsilon&quot;.</p>
            <div className="fals"><b>falsyfikator:</b> koszt za punkt procentowy probe rośnie zamiast maleć między 10M a 250M tokenów</div>
          </div><span className="st open">do testu</span></div>
          <div className="hyp"><div className="no">H5</div><div>
            <h3>Wstrzykiwanie nie może zjadać kompetencji bazowych</h3>
            <p>CPT na 5B tokenów to poważna dywergencja od bazy. Warunek brzegowy każdego etapu: gate&apos;y regresji (MMLU, ARC, GSM8K, HumanEval) z Δ ≥ −0.5 pp; przeciwwaga: replay EN 20–30%.</p>
            <div className="fals"><b>falsyfikator:</b> regresja EN przekracza −0.5 pp przy proporcji replay ≤30% → koszt rośnie o kolejne przebiegi</div>
          </div><span className="st open">warunek brzegowy</span></div>
        </div>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>5 · Metoda i czystość</h2><span className="c">jak to jest mierzone</span></div>
        <div className="grid c3">
          <div className="cell"><div className="top"><span>probe</span></div><h3 className="sm">Held-out z konstrukcji</h3><p>Pytania losowane z doków QA korpusu trafiają na exclusion list i nie wchodzą do treningu CPT. Model musi znać fakt z relacji i parafraz, nie z wykutego itemu.</p></div>
          <div className="cell"><div className="top"><span>sędzia</span></div><h3 className="sm">Otwarte wagi, gold w źródle</h3><p>Otwarty Qwen3.5-122B porównuje odpowiedź z goldem ugruntowanym w akapicie źródłowym. Pusta odpowiedź = błędna. W planie: drugi niezależny sędzia (gpt-oss-120b) i raport zgodności.</p></div>
          <div className="cell"><div className="top"><span>anty-kontaminacja</span></div><h3 className="sm">Audyt verbatim 8-gram</h3><p>Każdy wygenerowany dokument przechodzi przez indeks n-gramów wszystkich zbiorów testowych (KLEJ, LLMzSzŁ, PolKnowledge, held-outy). Kopie wypadają; fakty zostają.</p></div>
        </div>
        <div className="note" style={{ marginTop: 18 }}><p><b>Pipeline (stan na 2026-06-11):</b> korpus EntiGraph 10M tokenów / 92k dokumentów z 6.5k artykułów (PL-focus Wikipedia) · ZPE: 50k+ akapitów materiałów egzaminacyjnych w kolejce do multiplikacji · zewnętrzny zbiór destylacji z Bielika: przyjęte 4 091 z 9 769 po weryfikacji faktów otwartym sędzią (51% surowych odpadło jako konfabulacje). Następny krok: pilot CPT (high-rank QLoRA, 27B) na 10M → probe przed/po → decyzja o skali ze slope&apos;u, nie z wiary.</p></div>
      </div></section>
    </>
  );
}
