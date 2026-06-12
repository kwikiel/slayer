export const metadata = {
  title: "v3 — propozycja miksu danych (czysta linia) | Slayer",
  description:
    "Slayer v3: czysty miks SFT (zero train/test splitów benchmarków), program wiedzy synthetic CPT i plan DPO. Skład, proporcje, provenance i bramki jakości — wszystko audytowalne.",
};

const css = `
    .mixbar{display:flex;height:46px;border-radius:10px;overflow:hidden;border:1px solid var(--line);margin:16px 0 8px}
    .mixbar div{display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.72rem;color:#090907;font-weight:600;white-space:nowrap}
    .mlegend{display:flex;flex-wrap:wrap;gap:14px;font-family:var(--mono);font-size:.74rem;color:var(--mut);margin-bottom:6px}
    .mlegend .sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:middle}
    .lay{display:grid;grid-template-columns:130px 1fr;gap:clamp(14px,3vw,30px);padding:clamp(18px,2.6vw,26px) clamp(16px,2.6vw,28px);border-top:1px solid var(--line2)}
    .lay:first-child{border-top:0}
    .lay .pct{font-family:var(--serif);font-size:clamp(1.6rem,3vw,2.2rem);color:var(--acc);line-height:1}
    .lay .pct .n{display:block;font-family:var(--mono);font-size:.7rem;color:var(--dim);margin-top:6px;letter-spacing:.05em}
    .lay h3{margin:0 0 6px;font-size:1.12rem;font-weight:600}
    .lay p{margin:0;color:var(--mut);font-size:.95rem;max-width:74ch}
    .lay .src{margin-top:8px;font-family:var(--mono);font-size:.72rem;color:var(--dim)}
    @media(max-width:600px){.lay{grid-template-columns:1fr}}
    .gate{display:flex;gap:12px;align-items:baseline;padding:10px 0;border-top:1px solid var(--line2);font-size:.95rem;color:var(--mut)}
    .gate:first-child{border-top:0}
    .gate .ic{font-family:var(--mono);color:var(--good);font-size:.85rem;flex:0 0 auto}
    .gate b{color:var(--ink);font-weight:600}
    .gate .num{margin-left:auto;font-family:var(--mono);font-size:.78rem;color:var(--dim);white-space:nowrap}
`;

export default function V3() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">propozycja · linia v3 · czysta z konstrukcji</span>
        <h1>v3: <em>miks danych</em> bez długu</h1>
        <p>v2 nauczyło nas, jak wygląda skażenie train-splitami; v3 jest czyste z konstrukcji: benchmarki są
        wyłącznie miarą i blocklistą, każda warstwa przechodzi audyt verbatim, a wszystko, co weszło do treningu,
        da się wskazać co do rekordu. Claim publiczny: tylko held-out, 5-shot.</p>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>1 · Miks SFT</h2><span className="c">train_v3.jsonl · 2 239 przykładów · seed 42 · stan 2026-06-11</span></div>
        <div className="mlegend">
          <span><span className="sw" style={{ background: "#c79448" }}></span>destylacja własna 46%</span>
          <span><span className="sw" style={{ background: "#b0a062" }}></span>Bielik-distill verified 17%</span>
          <span><span className="sw" style={{ background: "#74a37a" }}></span>human PL 15%</span>
          <span><span className="sw" style={{ background: "#7e9eb0" }}></span>EN retention 22%</span>
        </div>
        <div className="mixbar">
          <div style={{ width: "45.6%", background: "#c79448" }}>1022</div>
          <div style={{ width: "16.7%", background: "#b0a062" }}>374</div>
          <div style={{ width: "15.4%", background: "#74a37a" }}>344</div>
          <div style={{ width: "22.3%", background: "#7e9eb0" }}>499</div>
        </div>

        <div className="princ" style={{ marginTop: 22 }}>
          <div className="lay"><div className="pct">46%<span className="n">1022 ex</span></div><div>
            <h3>Destylacja własna — 10 zdolności</h3>
            <p>Teacher (deepseek-v4-pro) WYMYŚLA różnorodne przykłady uczące umiejętności stojących za zadaniami PL:
            sentyment, temat, parafraza, NLI, poprawność QA, rozumienie tekstu, moderacja, nazwy własne, oceny recenzji
            plus instrukcje ogólne. Naturalne, zmienne sformułowania — nigdy format ani treść benchmarków.</p>
            <div className="src">sentiment 111 · topic 120 · paraphrase 98 · nli 104 · qa_correctness 116 · reading 117 · toxicity 125 · ner 25 · rating 106 · general 100</div>
          </div></div>
          <div className="lay"><div className="pct">17%<span className="n">374 ex</span></div><div>
            <h3>Bielik-distill, frakcja zweryfikowana</h3>
            <p>Zewnętrzny zbiór destylacji z Bielika-11B (Apache-2.0). Surowy miał 51% poważnych błędów faktograficznych,
            więc każdy rekord ocenił niezależny otwarty sędzia; do miksu wchodzą wyłącznie przykłady z czystymi faktami
            i naturalną polszczyzną (4 091 z 9 769 w puli). Werdykty per rekord opublikowane do audytu.</p>
            <div className="src">źródło: bielik11b_distill_external · sędzia: Qwen3.5-122B (open) · pula verified: 4091</div>
          </div></div>
          <div className="lay"><div className="pct">15%<span className="n">344 ex</span></div><div>
            <h3>Human PL + styl</h3>
            <p>Ludzkie polskie instrukcje (Aya, OASST2) plus nasz re-judged zbiór stylu w wersji rozłącznej z holdoutem
            ewaluacji (wyciek 85 promptów wykryty audytem i usunięty zanim cokolwiek trenowaliśmy).</p>
            <div className="src">aya_pl_human 124 · oasst2_pl_human 96 · qwen_raw_teacher_rewrite (styl, holdout-disjoint) 124</div>
          </div></div>
          <div className="lay"><div className="pct">22%<span className="n">499 ex</span></div><div>
            <h3>EN retention — anty-zapominanie</h3>
            <p>Osiem podzbiorów Tulu 3 (odc-by): matematyka, kod, nauka. Pilnuje, żeby tuning polski nie zjadał
            kompetencji bazowych; czytane razem z gate&apos;ami regresji (MMLU, ARC, GSM8K, HumanEval, Δ ≥ −0.5 pp).</p>
            <div className="src">personahub_math 77 · personas-code 74 · math-grade 73 · gsm8k 66 · numinamath 66 · algebra 62 · evol_code 62 · sciriff 19</div>
          </div></div>
        </div>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>2 · Warstwa wiedzy (CPT, osobny tor)</h2><span className="c">szczegóły i hipotezy: <a href="/wiedza" style={{ color: "var(--acc)" }}>/wiedza</a></span></div>
        <div className="grid c3">
          <div className="cell"><div className="top"><span>entigraph</span></div><h3 className="sm">10M tokenów · 92k doków</h3><p>Fakty z 6.5k artykułów PL-focus zmultiplikowane w relacje, parafrazy, streszczenia i QA. ~100k faktów.</p></div>
          <div className="cell"><div className="top"><span>graf 2-hop</span></div><h3 className="sm">2k doków kompozycyjnych</h3><p>Graf 274k encji / 2M krawędzi; ścieżki A→B→C dają pomosty i wielohopowe QA (wiedza składana, nie odtwarzana).</p></div>
          <div className="cell"><div className="top"><span>ZPE</span></div><h3 className="sm">60k+ akapitów egzaminacyjnych</h3><p>Rządowe e-materiały (podstawa programowa) w kolejce do multiplikacji: materiał dokładnie pod LLMzSzŁ.</p></div>
        </div>
        <div className="note" style={{ marginTop: 18 }}><p><b>Kolejność treningu (V3_PROPOSAL):</b> wiedza (CPT, high-rank QLoRA) → umiejętności (SFT, miks wyżej) → preferencje (DPO na parach on-policy ocenianych otwartym sędzią; pula par stylu: 1 581). Każdy etap z probe&apos;em wiedzy i gate&apos;ami regresji przed przejściem dalej.</p></div>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>3 · Bramki jakości</h2><span className="c">co musiał przejść każdy rekord</span></div>
        <div className="figbox" style={{ border: "1px solid var(--line)", borderRadius: "var(--rad)", background: "var(--panel)", padding: "10px 24px" }}>
          <div className="gate"><span className="ic">[1]</span><span><b>Zero benchmarków.</b> Twardy bezpiecznik w assemblerze: jakiekolwiek źródło KLEJ-owe w puli przerywa budowę miksu.</span><span className="num">forbidden-sources guard</span></div>
          <div className="gate"><span className="ic">[2]</span><span><b>Audyt verbatim 8-gram</b> vs wszystkie zbiory testowe i held-outy (328k n-gramów). Złapał m.in. 9% kolizji w syntetycznych MCQ i wyciek 85 promptów stylu.</span><span className="num">decon_audit.py</span></div>
          <div className="gate"><span className="ic">[3]</span><span><b>Weryfikacja faktów</b> zewnętrznych danych otwartym sędzią, rekord po rekordzie; odpadło 51% zbioru Bielik-distill.</span><span className="num">verify_external_sft.py</span></div>
          <div className="gate"><span className="ic">[4]</span><span><b>Filtr stylu:</b> nadużycie myślników wycina rekord (AI-tell); 229 przykładów odpadło z miksu.</span><span className="num">dash-rate ≤ 1.5/100 słów</span></div>
          <div className="gate"><span className="ic">[5]</span><span><b>Dedup</b> promptów między warstwami + balans per źródło (cap, żaden podzbiór nie dominuje).</span><span className="num">sha1 + per-source cap</span></div>
          <div className="gate"><span className="ic">[6]</span><span><b>Provenance per rekord:</b> źródło, teacher, sędzia i ścieżka grafu zapisane przy każdym przykładzie; raport miksu publikowany.</span><span className="num">train_v3_mix_report.json</span></div>
        </div>
        <div className="note" style={{ marginTop: 18 }}><p><b>Status:</b> miks SFT i warstwa wiedzy gotowe; trening v3 jeszcze nie wystartował.
        Pełne dane, werdykty sędziów i lineage w wewnętrznym repo datasets (dostęp do audytu na życzenie);
        metodologia i karty benchmarków: <a href="/benchmarks" style={{ color: "var(--acc)" }}>/benchmarks</a>.</p></div>
      </div></section>
    </>
  );
}
