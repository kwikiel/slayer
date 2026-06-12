export const metadata = {
  title: 'Bielik v3 — wszystkie benchmarki + Qwen3.6-27B | Slayer',
  description:
    'Komplet wyników Bielik-11B-v3.0-Instruct na 9 benchmarkach (arXiv:2601.11579): Open PL LLM, EQ-Bench, CPTUB, Medical/PES, PLCC, Open LLM EN, INCLUDE-44, Belebele, FLORES. Plus uczciwe porównanie z Qwen3.6-27B.',
};

export default function BielikBenchmarki() {
  return (
    <>
      <section className="phero"><div className="inner">
          <span className="kick">wyniki · źródło zewnętrzne</span>
          <h1>Bielik v3 — <em>wszystkie benchmarki</em></h1>
          <p>Komplet ewaluacji <strong style={{ color: "var(--txt)" }}>Bielik-11B-v3.0-Instruct</strong> z dedykowanego raportu technicznego v3 (<a href="https://arxiv.org/abs/2601.11579" rel="noopener">arXiv:2601.11579</a>, wersja wstępna) — 9 zestawów, plus uczciwe porównanie z <strong style={{ color: "var(--txt)" }}>Qwen3.6-27B</strong>. Na czym trenowano model → <a href="/bielik-dane" style={{ color: "var(--acc)", fontWeight: "500" }}>/bielik-dane</a>.</p>
        </div></section>

        <section className="sec tight"><div className="inner">
          <div className="ghead"><h2>Wyniki — wszystkie benchmarki v3</h2><span className="c">9 zestawów · <a href="https://arxiv.org/abs/2601.11579" rel="noopener">arXiv:2601.11579</a></span></div>
          <p className="muted" style={{ maxWidth: "74ch", margin: "0 0 18px" }}>Każdy benchmark, na którym <b style={{ color: "var(--ink)" }}>Bielik-11B-v3.0-Instruct</b> był odpalony. Pomiar PL w trybie 5-shot, agregat znormalizowany do baseline'ów.</p>
          <div className="tbl"><table><thead><tr><th>Benchmark</th><th>Metryka</th><th>Wynik</th><th>Pozycja / kontekst</th></tr></thead><tbody>
            <tr><td><div className="dn">Open PL LLM Leaderboard</div><div className="ds">rdzeń PL: sentyment, NER, QA, podobieństwo (5-shot)</div></td><td>śr. acc/F1</td><td><b>65,93</b></td><td>bije Llama-3.1-70B-Instruct (65,49) i Mixtral-8x22B-Instruct (65,23)</td></tr>
            <tr><td><div className="dn">Polish EQ-Bench</div><div className="ds">inteligencja emocjonalna PL</div></td><td>score</td><td><b>71,20</b></td><td>na poziomie Qwen2.5-32B (71,15), Llama-3.3-70B (70,73); spadek vs v2.6 (73,8)</td></tr>
            <tr><td><div className="dn">CPTUB</div><div className="ds">implikatury, pragmatyka, „tricky questions"</div></td><td>śr. 1–5</td><td><b>3,73</b></td><td>&gt; Qwen2.5-14B-Instruct i Mixtral-8x22B; tricky 3,19</td></tr>
            <tr><td><div className="dn">Polish Medical Leaderboard</div><div className="ds">PES 2018–2022, egzaminy specjalizacyjne (5-shot)</div></td><td>accuracy</td><td><b>50,21</b></td><td>&gt; Qwen2.5-14B-Instruct (49,60); baza v3 = 45,86</td></tr>
            <tr><td><div className="dn">PLCC</div><div className="ds">kompetencja kulturowa i językowa PL</div></td><td>accuracy %</td><td><b>71,83</b></td><td><span className="chip acc">1. open-source</span> &gt; DeepSeek-V3-0324 (71,00), Llama-3.1-405B (60,00)</td></tr>
            <tr><td><div className="dn">Open LLM Leaderboard (EN)</div><div className="ds">kontrola regresji EN: ARC, HellaSwag, MMLU, GSM8K…</div></td><td>śr.</td><td><b>72,45</b></td><td>GSM8K 85,60 · MMLU 71,11 · ARC-C 64,59 (rozbicie niżej)</td></tr>
            <tr><td><div className="dn">INCLUDE-base-44</div><div className="ds">wiedza/rozumowanie, 20 języków EU</div></td><td>accuracy</td><td><b>64,8</b> <span className="muted">(PL 69,0)</span></td><td>najwyżej wśród testowanych; &gt; Qwen2.5-14B-Instruct (61,7)</td></tr>
            <tr><td><div className="dn">Belebele</div><div className="ds">rozumienie tekstu, 28 wariantów EU</div></td><td>accuracy</td><td><b>82,98</b></td><td>2. za Qwen2.5-14B-Instruct (85,91), &gt; phi-4 (81,71)</td></tr>
            <tr><td><div className="dn">FLORES</div><div className="ds">tłumaczenie, 20 par językowych EU</div></td><td>BLEU</td><td><b>19,22</b></td><td>2. za EuroLLM-9B (20,61, trenowany na FLORES); do PL 18,54 / z PL 19,91</td></tr>
          </tbody></table></div>

          <div className="ghead"><h2 style={{ fontSize: "1.3rem" }}>Open LLM Leaderboard (EN) — rozbicie</h2><span className="c">Tabela 11 raportu · instruct</span></div>
          <div className="tbl"><table><thead><tr><th>Model</th><th>AVG</th><th>ARC-C</th><th>HellaSwag</th><th>TruthfulQA</th><th>MMLU</th><th>WinoGrande</th><th>GSM8K</th></tr></thead><tbody>
            <tr><td className="dn">Bielik-11B-v3.0-Instruct</td><td><b>72,45</b></td><td>64,59</td><td>81,96</td><td>54,25</td><td>71,11</td><td>77,19</td><td>85,60</td></tr>
            <tr><td className="dn">Bielik-11B-v3 (baza)</td><td>68,45</td><td>61,43</td><td>81,38</td><td>47,65</td><td>67,55</td><td>78,53</td><td>74,15</td></tr>
            <tr><td className="dn">Bielik-4.5B-v3-Instruct</td><td>64,89</td><td>56,06</td><td>73,90</td><td>50,79</td><td>63,66</td><td>71,19</td><td>73,69</td></tr>
          </tbody></table></div>

          <div className="ghead"><h2 style={{ fontSize: "1.3rem" }}>Warianty rodziny v3</h2><span className="c">gdzie raport podaje mniejsze modele</span></div>
          <div className="tbl"><table><thead><tr><th>Model</th><th>Open PL LLM</th><th>EQ-Bench</th><th>CPTUB</th><th>Medical</th><th>PLCC</th></tr></thead><tbody>
            <tr><td className="dn">Bielik-11B-v3.0-Instruct</td><td><b>65,93</b></td><td><b>71,20</b></td><td><b>3,73</b></td><td><b>50,21</b></td><td><b>71,83</b></td></tr>
            <tr><td className="dn">Bielik-11B-v3 (baza, 20250730)</td><td>55,16</td><td>—</td><td>—</td><td>45,86</td><td>—</td></tr>
            <tr><td className="dn">Bielik-4.5B-v3.0-Instruct</td><td>56,13</td><td>53,58</td><td>3,38</td><td>43,55</td><td>41,47</td></tr>
            <tr><td className="dn">Bielik-1.5B-v3.0-Instruct</td><td>—</td><td>—</td><td>—</td><td>—</td><td>27,50</td></tr>
          </tbody></table></div>
          <p className="muted" style={{ marginTop: "8px", fontSize: ".88rem" }}>Uwaga: raport oznaczony jako wersja wstępna („results may change"). Liczby cytowane z tabel 4–14 arXiv:2601.11579. Porównania z modelami zamkniętymi (GPT, Gemini, Claude) raport podaje tylko dla PLCC — tam Bielik 71,83 plasuje się poniżej frontier (Gemini-3.0-Pro 95,83), ale jako 1. open-source.</p>
        </div></section>

        <section className="sec tight alt"><div className="inner">
          <div className="ghead"><h2>Bielik v3 ↔ <em>Qwen3.6-27B</em></h2><span className="c">brak wspólnej osi — porównanie uczciwe, nie apples-to-apples</span></div>
          <div className="note"><p><b>Ostrzeżenie metodologiczne:</b> <a href="https://huggingface.co/Qwen/Qwen3.6-27B" rel="noopener">Qwen3.6-27B</a> (wyd. 22.04.2026) <b>nie był odpalony na żadnym polskim benchmarku</b> z raportu Bielika. Zespół Qwen publikuje tylko benchmarki agentic/coding/general. Poniżej zestawiamy specyfikację oraz to, co <b>każdy zespół faktycznie zmierzył</b> — to <b>rozłączne</b> zestawy zadań, nie wolno ich odejmować.</p></div>

          <div className="ghead"><h2 style={{ fontSize: "1.3rem" }}>Specyfikacja</h2></div>
          <div className="tbl"><table><thead><tr><th>Cecha</th><th>Bielik-11B-v3.0-Instruct</th><th>Qwen3.6-27B</th></tr></thead><tbody>
            <tr><td className="dn">Parametry</td><td>11B (dense, depth up-scaling z Mistral 7B v0.2)</td><td>27B (dense)</td></tr>
            <tr><td className="dn">Architektura</td><td>GQA + SwiGLU + RoPE, 50 warstw</td><td>hybryda Gated DeltaNet (linear attn) + Gated Attention, 3/4 warstw liniowe</td></tr>
            <tr><td className="dn">Kontekst</td><td>32 768 → 131 072 (YaRN)</td><td>262 144 → ~1 010 000 (YaRN)</td></tr>
            <tr><td className="dn">Języki</td><td>32 (PL-first)</td><td>201</td></tr>
            <tr><td className="dn">Licencja</td><td><span className="chip acc">Apache-2.0</span></td><td><span className="chip acc">Apache-2.0</span></td></tr>
            <tr><td className="dn">Wydanie</td><td>31.12.2025 (rynek UE)</td><td>22.04.2026</td></tr>
            <tr><td className="dn">Optymalizacja</td><td>polski NLP, wiedza kulturowa, prawo/urząd</td><td>agentic coding, reasoning, tool-use, multilingual general</td></tr>
          </tbody></table></div>

          <div className="ghead"><h2 style={{ fontSize: "1.3rem" }}>Co każdy zespół zmierzył</h2><span className="c">różne benchmarki — nie da się zsumować na jedną liczbę</span></div>
          <div className="grid auto">
            <div className="cell"><div className="n">BIELIK v3 · PL</div><h3 className="sm">Polski + regresja EN</h3><p>PLCC <b>71,83</b> (1. open-source) · Open PL LLM <b>65,93</b> · Belebele-EU <b>82,98</b> · EQ-Bench-PL <b>71,20</b> · Medical/PES <b>50,21</b> · Open LLM EN (stary) <b>72,45</b> (GSM8K 85,60, MMLU 71,11).</p></div>
            <div className="cell"><div className="n">QWEN3.6-27B · CODE</div><h3 className="sm">Agentic / coding / reasoning</h3><p>SWE-bench Verified <b>77,2</b> · SWE-bench Pro <b>53,5</b> · Terminal-Bench 2.0 <b>59,3</b> · SkillsBench <b>48,2</b> · GPQA Diamond <b>87,8</b>. Brak jakichkolwiek wyników na PLCC / Open PL LLM / PES.</p></div>
          </div>
          <div className="note"><p><b>Wniosek:</b> nawet na EN osie się rozjeżdżają — Bielik mierzony <b>starszym</b> Open LLM Leaderboard (ARC / MMLU / GSM8K), Qwen3.6 <b>nowymi</b> agentic (SWE-bench / GPQA Diamond). Jedyny realny apples-to-apples wymaga <b>odpalenia Qwen3.6-27B na polskich benchmarkach</b> — czego nikt jeszcze nie zrobił. To dokładnie luka, którą <a href="/kierunki" style={{ color: "var(--acc)", fontWeight: "500" }}>wypełnia Slayer</a>: mocny, świeży backbone klasy Qwen-27B zmierzony na polskim rdzeniu, którego Qwen nie raportuje.</p></div>
        </div></section>
    </>
  );
}
