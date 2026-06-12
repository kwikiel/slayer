export const metadata = {
  title: "Datasety — ewaluacja i trening | Slayer",
  description:
    "Zbiory danych: publiczne benchmarki ewaluacyjne (held-out) i niezależne korpusy treningowe (prawo, urzędy). Z licencjami i linkami HuggingFace.",
};

export default function Datasety() {
  return (
    <>
      <section className="phero"><div className="inner">
        <span className="kick">zbiory danych</span>
        <h1>Datasety — <em>ewaluacja</em> i <em>trening</em></h1>
        <p>Twardy podział: zbiory <strong style={{ color: "var(--txt)" }}>ewaluacyjne</strong> służą TYLKO do pomiaru (held-out, nigdy w treningu), a <strong style={{ color: "var(--txt)" }}>treningowe</strong> są niezależne — <a href="/benchmarks">bez benchmaxxingu</a>.</p>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>Ewaluacja — polski rdzeń</h2><span className="c">held-out · tylko pomiar</span></div>
        <div className="tbl"><table><thead><tr><th>Dataset</th><th>Rola</th><th>Metryka</th><th>Rozmiar</th><th>Status</th></tr></thead><tbody>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/amu-cai/llmzszl-dataset" rel="noopener">LLMzSzŁ</a></div><div className="ds">egzaminy państwowe CKE · 154 domeny</div></td><td>główny agregat</td><td>accuracy MCQ</td><td>18 821</td><td><span className="chip acc">publiczny</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/speakleash/PES-2018-2022" rel="noopener">PES</a></div><div className="ds">egzaminy specjalizacyjne</div></td><td>egzamin zawodowy</td><td>accuracy</td><td>70 010</td><td><span className="chip acc">publiczny</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/clarin-pl/poquad" rel="noopener">PoQuAD</a></div><div className="ds">SQuAD 2.0, natywnie PL, no-answer</div></td><td>grounding / refusal</td><td>F1 + sędzia-LLM</td><td>~52 000</td><td><span className="chip acc">CC-BY-4.0</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/facebook/belebele" rel="noopener">Belebele (PL)</a></div><div className="ds">reading comprehension</div></td><td>rozumienie</td><td>accuracy MCQ</td><td>900</td><td><span className="chip acc">CC-BY-SA</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/CohereForAI/include-base-44" rel="noopener">INCLUDE-44 (PL)</a></div><div className="ds">wiedza kulturowo-regionalna</div></td><td>wiedza PL</td><td>accuracy MCQ</td><td>config PL</td><td><span className="chip acc">publiczny</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/openlanguagedata/flores_plus" rel="noopener">FLORES-200 (PL)</a></div><div className="ds">tłumaczenie PL↔</div></td><td>regresja generacji</td><td>BLEU / chrF</td><td>1 012</td><td><span className="chip blue">gated · dostęp</span></td></tr>
        </tbody></table></div>

        <div className="ghead"><h2>Ewaluacja — kontrola regresji (EN)</h2><span className="c">czy angielski/rozumowanie nie spadły</span></div>
        <div className="tbl"><table><thead><tr><th>Dataset</th><th>Rola</th><th>Metryka</th><th>Licencja</th></tr></thead><tbody>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/facebook/belebele" rel="noopener">Belebele (EN)</a></div><div className="ds">ten sam task → regres PL↔EN</div></td><td>regresja</td><td>accuracy MCQ</td><td><span className="chip acc">CC-BY-SA</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/allenai/ai2_arc" rel="noopener">ARC-Challenge</a></div><div className="ds">rozumowanie EN</div></td><td>regresja</td><td>accuracy MCQ</td><td><span className="chip acc">CC-BY-SA</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/cais/mmlu" rel="noopener">MMLU</a></div><div className="ds">wiedza EN, 57 dziedzin</div></td><td>regresja</td><td>accuracy MCQ</td><td><span className="chip acc">MIT</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/openai/gsm8k" rel="noopener">GSM8K</a></div><div className="ds">matematyka / rozumowanie EN</div></td><td>regresja</td><td>exact match</td><td><span className="chip acc">MIT</span></td></tr>
        </tbody></table></div>

        <div className="ghead"><h2>Ewaluacja — zamknięte</h2><span className="c">nie mierzymy — brak otwartych danych</span></div>
        <div className="tbl"><table><thead><tr><th>Dataset</th><th>Domena</th><th>Dlaczego pominięte</th></tr></thead><tbody>
          <tr><td className="dn">Polish EQ-Bench</td><td>inteligencja emocjonalna</td><td>zbiór testowy niepubliczny</td></tr>
          <tr><td className="dn">CPTUB</td><td>pragmatyka / implikatury</td><td>tylko leaderboard, brak datasetu</td></tr>
          <tr><td className="dn">PLCC</td><td>kompetencja kulturowa</td><td>publiczne tylko przykłady</td></tr>
        </tbody></table></div>
        <p className="muted" style={{ marginTop: 8, fontSize: ".88rem" }}>Szczegóły: <a href="/closed-benchmarks" style={{ color: "var(--acc)" }}>/closed-benchmarks</a>.</p>

        <div className="ghead"><h2>Trening — niezależne korpusy</h2><span className="c">NIGDY w ewaluacji · moat = dane prawno-urzędowe</span></div>
        <div className="tbl"><table><thead><tr><th>Źródło</th><th>Zastosowanie</th><th>Status</th></tr></thead><tbody>
          <tr><td><div className="dn">ISAP / akty prawne</div><div className="ds">ustawy, rozporządzenia</div></td><td>grounded QA, wiedza prawna</td><td><span className="chip">do zebrania</span></td></tr>
          <tr><td><div className="dn">Orzeczenia (SAOS)</div><div className="ds">baza orzeczeń sądów</div></td><td>rozumowanie prawne</td><td><span className="chip">do zebrania</span></td></tr>
          <tr><td><div className="dn">Interpretacje (KIS/MF)</div><div className="ds">podatki, objaśnienia</div></td><td>wariant podatkowy</td><td><span className="chip">do zebrania</span></td></tr>
          <tr><td><div className="dn">Instrukcje PL (SFT)</div><div className="ds">kurowane + syntetyczne</div></td><td>instruction tuning</td><td><span className="chip">do budowy</span></td></tr>
          <tr><td><div className="dn">Pary preferencji (DPO)</div><div className="ds">lepsza/gorsza odpowiedź</div></td><td>alignment</td><td><span className="chip">do budowy</span></td></tr>
          <tr><td><div className="dn">Prywatny held-out</div><div className="ds">najnowsze egzaminy CKE/PES</div></td><td>wykrywanie benchmaxxingu</td><td><span className="chip">do budowy</span></td></tr>
        </tbody></table></div>

        <div className="note"><p><b>Zasada:</b> ewaluacyjne i treningowe to rozłączne światy; korpusy treningowe przechodzą dekontaminację. Masz dobre dane prawno-urzędowe? <a href="/zespol" style={{ color: "var(--acc)", fontWeight: 500 }}>Dołącz / zgłoś →</a></p></div>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Dane pod <em>LLMzSzŁ</em></h2><span className="c">jedyna oś, gdzie Bielik wygrywa — i nasz target</span></div>
        <p className="muted" style={{ maxWidth: "70ch", margin: "0 0 22px" }}>LLMzSzŁ to w przewadze <b style={{ color: "var(--ink)" }}>egzaminy zawodowe</b> (przepisy branżowe, BHP, prawo) → „wygrać LLMzSzŁ&quot; pokrywa się z naszą specjalizacją prawno-urzędową. Wszystko niezależne od test-splitu, dekontaminowane.</p>

        <div className="ghead"><h2 style={{ fontSize: "1.3rem" }}>A · Najwyższa dźwignia</h2><span className="c">on-target</span></div>
        <div className="tbl"><table><thead><tr><th>Źródło</th><th>Co buduje</th><th>Status</th></tr></thead><tbody>
          <tr><td><div className="dn">Arkusze CKE/OKE + klucze</div><div className="ds">matura, ósmoklasista, <b>egzaminy zawodowe/kwalifikacje</b> — starsze roczniki</div></td><td>umiejętność + format MCQ (to samo źródło, inne pozycje)</td><td><span className="chip">do zebrania</span></td></tr>
          <tr><td><div className="dn"><a href="https://isap.sejm.gov.pl" rel="noopener">ISAP</a> + BHP / normy</div><div className="ds">ustawy, rozporządzenia, przepisy branżowe, bezpieczeństwo</div></td><td>rdzeń części zawodowej + specjalizacja prawna</td><td><span className="chip">do zebrania</span></td></tr>
        </tbody></table></div>

        <div className="ghead"><h2 style={{ fontSize: "1.3rem" }}>B · Wiedza ogólna i program szkolny</h2></div>
        <div className="tbl"><table><thead><tr><th>Źródło</th><th>Co buduje</th><th>Status</th></tr></thead><tbody>
          <tr><td><div className="dn"><a href="https://huggingface.co/datasets/wikimedia/wikipedia" rel="noopener">Wikipedia / Wikibooks / Wikisource PL</a></div><div className="ds">wiedza + treści podręcznikowe</div></td><td>szerokość (matura/ósmoklasista)</td><td><span className="chip">publiczne</span></td></tr>
          <tr><td><div className="dn"><a href="https://huggingface.co/speakleash" rel="noopener">Korpusy SpeakLeash</a> · CulturaX-pl / OSCAR-pl</div><div className="ds">polski pretraining/CPT</div></td><td>nie regresować polskiego</td><td><span className="chip">publiczne</span></td></tr>
        </tbody></table></div>

        <div className="ghead"><h2 style={{ fontSize: "1.3rem" }}>C · Format MCQ + rozumowanie</h2><span className="c">to test wielokrotnego wyboru</span></div>
        <div className="grid auto">
          <div className="cell"><div className="n">SYNTETYCZNE</div><h3 className="sm">Polskie MCQ z korpusów</h3><p>Generowane z Wikipedia/ISAP (Evol/Magpie) + weryfikacja → uczy „odpowiedz literą&quot; i szerokości.</p></div>
          <div className="cell"><div className="n">CoT</div><h3 className="sm">Distylacja rozumowania PL</h3><p>Łańcuchy myślenia z mocnego nauczyciela na trudniejsze pozycje.</p></div>
          <div className="cell"><div className="n">RLVR</div><h3 className="sm">GRPO na polskich MCQ</h3><p>Nagroda = poprawna litera → optymalizuje dokładnie to, co mierzy LLMzSzŁ, czysto.</p></div>
        </div>

        <div className="note"><p><b>Przepis:</b> CPT (Wikipedia + ISAP/BHP) → SFT (arkusze zawodowe + syntetyczne MCQ, dekontaminowane) → GRPO/RLVR na polskich MCQ. Pomiar na <b>prywatnym held-out</b> (świeże arkusze). Masz arkusze/przepisy/dane? <a href="/zespol" style={{ color: "var(--acc)", fontWeight: 500 }}>Zgłoś →</a></p></div>
      </div></section>
    </>
  );
}
