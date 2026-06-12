export const metadata = {
  title: 'Na czym trenowano Bielika v3 — analiza danych | Slayer',
  description:
    'Analiza danych treningowych Bielika v3 11B Instruct na podstawie oficjalnego EU Public Summary (AI Act): korpusy, licencje, crawl, dane syntetyczne, przetwarzanie — z linkami HuggingFace.',
};

export default function BielikDane() {
  return (
    <>
      <section className="phero"><div className="inner">
          <span className="kick">analiza · źródło zewnętrzne</span>
          <h1>Na czym trenowano <em>Bielika v3</em></h1>
          <p>Rozbiór danych treningowych <strong style={{ color: "var(--txt)" }}>Bielik v3 11B Instruct</strong> na podstawie oficjalnego <a href="https://bielik.ai/downloads/Bielik%2011B%20v3%20EU%20Public%20Summary.pdf" rel="noopener">EU Public Summary</a> — dokumentu, który dostawca GPAI musi opublikować na mocy AI Act. Wszystkie nazwane korpusy z linkami HuggingFace, plus to, czego (wg deklaracji) <strong style={{ color: "var(--txt)" }}>nie</strong> użyto. Wyniki benchmarkowe → <a href="/bielik-benchmarki" style={{ color: "var(--acc)", fontWeight: "500" }}>/bielik-benchmarki</a>.</p>
        </div></section>

        <section className="sec tight"><div className="inner">
          <div className="ghead"><h2>Metryczka modelu</h2><span className="c">z sekcji 1 dokumentu</span></div>
          <div className="tbl"><table><tbody>
            <tr><td className="dn">Model</td><td>Bielik v3 11B Instruct</td></tr>
            <tr><td className="dn">Model bazowy (dependency)</td><td>Mistral 7B v0.2</td></tr>
            <tr><td className="dn">Dostawca</td><td>Fundacja SpeakLeash (KRS 0001099568, Wrocław)</td></tr>
            <tr><td className="dn">Data wejścia na rynek UE</td><td>31.12.2025</td></tr>
            <tr><td className="dn">Modalność</td><td>tylko tekst</td></tr>
            <tr><td className="dn">Rozmiar danych treningowych</td><td><b>1 mld – 10 bln tokenów</b> (zaznaczony przedział środkowy)</td></tr>
            <tr><td className="dn">Najświeższe dane</td><td>maj 2025</td></tr>
            <tr><td className="dn">Skład językowy</td><td>~90% polski + angielski; ~10% inne języki UE; celowo śląski i kaszubski (Wikipedia)</td></tr>
            <tr><td className="dn">Raport techniczny</td><td><a href="https://arxiv.org/abs/2505.02410" rel="noopener">arXiv:2505.02410</a></td></tr>
          </tbody></table></div>
          <p className="muted" style={{ marginTop: "8px", fontSize: ".88rem" }}>Dokument deklaruje typy treści: dokumenty prawne i urzędowe (orzeczenia, ustawy, rozporządzenia), teksty naukowe (Biblioteka Nauki), publikacje prasowe (źródła licencjonowane), web z domen publicznych i forów tematycznych, dyskurs parlamentarny, zasoby wielojęzyczne (Wikipedia, Europeana) oraz dane syntetyczne.</p>
        </div></section>

        <section className="sec tight alt"><div className="inner">
          <div className="ghead"><h2>Duże publiczne korpusy (pretraining)</h2><span className="c">jawnie wymienione w sekcji 2.1 — linki za dostawcą</span></div>
          <div className="tbl"><table><thead><tr><th>Korpus</th><th>Charakter</th><th>Licencja / dostęp</th></tr></thead><tbody>
            <tr><td><div className="dn"><a href="https://hplt-project.org/datasets/v2.0" rel="noopener">HPLT v2.0</a></div><div className="ds">wielojęzyczny web, czyszczony</div></td><td>pretraining web</td><td><span className="chip acc">otwarty</span></td></tr>
            <tr><td><div className="dn"><a href="https://huggingface.co/datasets/uonlp/CulturaX" rel="noopener">CulturaX</a></div><div className="ds">167 języków, dedup + filtr jakości</div></td><td>pretraining web</td><td><span className="chip acc">otwarty (ODC-BY + per-source)</span></td></tr>
            <tr><td><div className="dn"><a href="https://huggingface.co/datasets/HuggingFaceFW/fineweb-2" rel="noopener">FineWeb-2</a></div><div className="ds">wielojęzyczny FineWeb (w tym PL)</div></td><td>pretraining web</td><td><span className="chip acc">ODC-BY</span></td></tr>
            <tr><td><div className="dn"><a href="https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu" rel="noopener">FineWeb-Edu</a></div><div className="ds">web filtrowany pod treści edukacyjne</div></td><td>pretraining jakościowy</td><td><span className="chip acc">ODC-BY</span></td></tr>
            <tr><td><div className="dn"><a href="https://commoncrawl.org/" rel="noopener">Common Crawl</a></div><div className="ds">surowy crawl webu</div></td><td>źródło web</td><td><span className="chip acc">publiczny</span></td></tr>
            <tr><td><div className="dn"><a href="https://huggingface.co/datasets/cerebras/SlimPajama-627B" rel="noopener">SlimPajama-627B</a></div><div className="ds">627 mld tokenów, dedup</div></td><td>pretraining EN</td><td><span className="chip acc">per-source</span></td></tr>
          </tbody></table></div>
          <p className="muted" style={{ marginTop: "8px", fontSize: ".88rem" }}>Dostawca zaznacza: „mieszanka domen web poddana mieszaniu i deduplikacji”. Migawki czasowe ustalono dla spójności; zbiór gromadzony 2022 – listopad 2025.</p>

          <div className="ghead"><h2>Mniejsze publiczne źródła</h2><span className="c">opisowo, bez pełnej listy</span></div>
          <div className="tbl"><table><thead><tr><th>Źródło</th><th>Co wnosi</th></tr></thead><tbody>
            <tr><td><div className="dn"><a href="https://huggingface.co/datasets/wikimedia/wikipedia" rel="noopener">Wikipedia</a> (w tym śląska, kaszubska)</div></td><td>wiedza ogólna + warianty regionalne</td></tr>
            <tr><td><div className="dn">Biblioteka Nauki</div><div className="ds">dostęp przez API</div></td><td>teksty naukowe</td></tr>
            <tr><td><div className="dn">Korpus Dyskursu Parlamentarnego</div></td><td>język urzędowo-polityczny</td></tr>
            <tr><td><div className="dn"><a href="https://www.europeana.eu/" rel="noopener">Europeana</a></div></td><td>zasoby kulturowe, wielojęzyczne</td></tr>
            <tr><td><div className="dn">Zbiory tłumaczeniowe</div></td><td>pary PL↔ (przekład)</td></tr>
            <tr><td><div className="dn">Akty prawne i administracyjne (anonimizowane)</div><div className="ds">orzeczenia, ustawy, uchwały, dzienniki/monitory urzędowe</div></td><td>rdzeń prawno-urzędowy</td></tr>
          </tbody></table></div>
        </div></section>

        <section className="sec tight"><div className="inner">
          <div className="ghead"><h2>Dane licencjonowane komercyjnie</h2><span className="c">sekcja 2.2 — umowa z rightsholderem</span></div>
          <div className="note"><p><b>itwiz.pl</b> — umowa z redakcją (właściciel / redaktor naczelny). Licencjonowany korpus artykułów z ~10 lat, dostarczony bezpośrednio w formacie <code>DOCX</code> na potrzeby treningu. Inne prywatne dane od pośredników/baz danych: <b>nie</b> (sekcja 2.2.2 = No).</p></div>

          <div className="ghead"><h2>Crawl własny</h2><span className="c">sekcja 2.3 — crawler „Speakleash”</span></div>
          <div className="tbl"><table><tbody>
            <tr><td className="dn">Okres zbierania</td><td>11/2022 – 05/2025</td></tr>
            <tr><td className="dn">Cele</td><td>publiczne PDF-y i teksty z forów / źródeł otwartych</td></tr>
            <tr><td className="dn">Domeny sektora publicznego</td><td>portale rządowe/samorządowe (<code>.gov</code>, <code>.bip</code>) — uchwały, rozporządzenia, materiały prawne</td></tr>
            <tr><td className="dn">Fora tematyczne</td><td>motoryzacja, elektronika, ogrodnictwo i in. (treści nie-wrażliwe)</td></tr>
            <tr><td className="dn">Zachowanie</td><td>respekt robots.txt; fora tylko gdy brak jawnego zakazu</td></tr>
          </tbody></table></div>

          <div className="ghead"><h2>Dane syntetyczne</h2><span className="c">sekcja 2.5</span></div>
          <div className="note"><p>Generowane modelami: <b>DeepSeek v3</b> oraz <b>Bielik v2.3 11B</b> (self-distill). Modalność: tekst. To istotny sygnał — część korpusu instrukcyjnego pochodzi z destylacji silniejszego nauczyciela (DeepSeek) i poprzedniej generacji własnego modelu.</p></div>
        </div></section>

        <section className="sec tight alt"><div className="inner">
          <div className="ghead"><h2>Czego — wg deklaracji — NIE użyto</h2><span className="c">jawne „No” w dokumencie</span></div>
          <div className="grid auto">
            <div className="cell"><div className="n">2.4</div><h3 className="sm">Dane użytkowników</h3><p>Brak. Ani prompty/interakcje z modelem, ani dane z innych usług dostawcy.</p></div>
            <div className="cell"><div className="n">2.2.2</div><h3 className="sm">Inne prywatne źródła</h3><p>Brak danych od pośredników / dostawców prywatnych baz (poza licencją itwiz).</p></div>
            <div className="cell"><div className="n">2.6</div><h3 className="sm">Inne źródła</h3><p>Brak źródeł spoza sekcji 2.1–2.5.</p></div>
          </div>

          <div className="ghead"><h2>Przetwarzanie i bezpieczeństwo</h2><span className="c">sekcja 3</span></div>
          <div className="tbl"><table><tbody>
            <tr><td className="dn">Deduplikacja</td><td>na poziomie zbioru i dokumentu (ogranicza memoryzację)</td></tr>
            <tr><td className="dn">Filtr jakości</td><td>własny klasyfikator — odsiewa treści niskiej jakości, wulgarne, seksualne, spam</td></tr>
            <tr><td className="dn">Model guardrail</td><td>mały dedykowany model: self-harm, hate, treści seksualne, przestępcze, wulgaryzmy → wycięte</td></tr>
            <tr><td className="dn">Anonimizacja PII</td><td>obowiązkowy krok: telefony, e-maile, URL-e, PESEL</td></tr>
            <tr><td className="dn">TDM / opt-out</td><td>kontrola robots.txt, meta-tagów i ToS; <b>usuwanie wsteczne</b> przy późniejszym zastrzeżeniu praw</td></tr>
            <tr><td className="dn">Code of Practice (GPAI)</td><td>nie jest formalnym sygnatariuszem; deklaruje zgodność „w duchu”</td></tr>
            <tr><td className="dn">Pre-filtrowane źródła</td><td>opiera się na czyszczeniu wykonanym już w HPLT, FineWeb-2, CulturaX</td></tr>
          </tbody></table></div>
        </div></section>

        <section className="sec tight"><div className="inner">
          <div className="ghead"><h2>Obserwacje dla Slayera</h2><span className="c">interpretacja, nie dokument</span></div>
          <div className="grid auto">
            <div className="cell"><div className="n">A</div><h3 className="sm">Moat prawno-urzędowy jest wspólny</h3><p>Bielik mocno stawia na akty prawne, orzeczenia, BIP-y i dyskurs parlamentarny — dokładnie pole, które <a href="/datasety">my targetujemy</a>. To nie jest niezagospodarowana przestrzeń; przewaga będzie w kuracji i formacie zadań, nie w samym dostępie do ustaw.</p></div>
            <div className="cell"><div className="n">B</div><h3 className="sm">Baza to wciąż Mistral 7B v0.2</h3><p>v3 11B dalej rośnie z Mistrala 7B v0.2 (upscaling). To wspiera naszą <a href="/kierunki">tezę</a>, że sufit jakości PL leży w modelu bazowym — stąd nasz start od mocniejszego backbona.</p></div>
            <div className="cell"><div className="n">C</div><h3 className="sm">Instrukcje = DeepSeek v3 + self-distill</h3><p>Synthetic SFT z DeepSeek v3 i Bielika v2.3. Potwierdza kierunek: jakość instrukcji zależy od siły nauczyciela — my dobieramy <a href="/styl">otwartego, silnego sędziego/nauczyciela</a> świadomie.</p></div>
          </div>
          <div className="note"><p><b>Źródło:</b> <a href="https://bielik.ai/downloads/Bielik%2011B%20v3%20EU%20Public%20Summary.pdf" rel="noopener">Bielik 11B v3 EU Public Summary, wersja 1.0</a> (Fundacja SpeakLeash) · raport techniczny: <a href="https://arxiv.org/abs/2505.02410" rel="noopener">arXiv:2505.02410</a>. Cytowane fakty pochodzą wprost z dokumentu; sekcja „Obserwacje” to nasza interpretacja. Wyniki na benchmarkach → <a href="/bielik-benchmarki" style={{ color: "var(--acc)", fontWeight: "500" }}>/bielik-benchmarki</a>.</p></div>
        </div></section>
    </>
  );
}
