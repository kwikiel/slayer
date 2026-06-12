export const metadata = {
  title: "Trening — metody fine-tuningu (SOTA 2026) | Slayer",
  description: "Metody fine-tuningu i alignmentu: SFT/QLoRA, DPO, ORPO, SimPO, KTO, GRPO/RLVR, merging — lineage SOTA 2026, pod niski budżet.",
};

const css = `
    .yr{display:grid;grid-template-columns:60px 1fr;gap:16px;align-items:start;padding:12px 0;border-top:1px solid var(--line2)}.yr:first-child{border-top:0}
    .yr .y{font-family:var(--mono);font-weight:600;font-size:1.1rem}
    .ms{display:flex;flex-wrap:wrap;gap:8px}
    .tag{font-family:var(--mono);font-size:.78rem;font-weight:400;line-height:1.2;padding:5px 11px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:var(--mut);white-space:nowrap}
    .tag.g{color:var(--acc);background:var(--acc-soft);border-color:rgba(199,148,72,.34)}
    .tag.b{color:var(--ink);background:var(--panel);border-color:var(--line)}
    .tag.y{color:var(--dim);background:var(--panel);border-color:var(--line2)}
    .tag.leg{color:var(--dim);background:transparent;border-color:var(--line2);text-decoration:line-through}
    .legend{display:flex;flex-wrap:wrap;gap:18px;font-family:var(--mono);font-size:.76rem;color:var(--mut);margin-bottom:18px}
    .legend .sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;vertical-align:middle}
    .ct{font-family:var(--mono);font-size:.64rem;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:5px;color:var(--mut);background:var(--panel2);border:1px solid var(--line)}
    .ct:not(.b):not(.y){color:var(--acc);background:var(--acc-soft);border-color:rgba(199,148,72,.3)}
    .recipe .ph .when{color:var(--acc)}
`;

export default function Trening() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">metody fine-tuningu · SOTA 2026</span>
        <h1>Jak <em>trenować</em> — tanio i czysto</h1>
        <p>Każdą zdolność budujemy na <strong style={{ color: "var(--txt)" }}>niezależnych danych</strong> i mierzymy na held-out — <a href="/benchmarks">bez benchmaxxingu</a>.</p>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Lineage — co działa w 2026, co było modą 2025</h2></div>
        <div className="legend"><span><span className="sw" style={{ background: "var(--acc)" }}></span>SOTA 2026</span><span><span className="sw" style={{ background: "var(--ink)" }}></span>nadal użyteczne</span><span><span className="sw" style={{ background: "var(--dim)" }}></span>niszowe / wyparte</span><span><span className="sw" style={{ background: "transparent", border: "1px solid var(--line)" }}></span>legacy</span></div>
        <div>
          <div className="yr"><div className="y">2022</div><div className="ms"><span className="tag leg">RLHF/PPO</span><span className="tag b">LoRA (’21)</span><span className="tag b">Self-Instruct</span></div></div>
          <div className="yr"><div className="y">2023</div><div className="ms"><span className="tag g">DPO</span><span className="tag y">IPO</span><span className="tag g">QLoRA</span><span className="tag b">Evol-Instruct</span></div></div>
          <div className="yr"><div className="y">2024</div><div className="ms"><span className="tag g">ORPO</span><span className="tag b">SimPO</span><span className="tag b">KTO</span><span className="tag y">Self-Rewarding</span><span className="tag g">GRPO</span><span className="tag b">DoRA</span><span className="tag g">Unsloth/Liger</span><span className="tag g">Magpie</span></div></div>
          <div className="yr"><div className="y">2025</div><div className="ms"><span className="tag g">RLVR (R1)</span><span className="tag g">distylacja CoT</span><span className="tag y">PRM</span><span className="tag b">iterative DPO</span><span className="tag b">mergekit</span></div></div>
          <div className="yr"><div className="y">2026</div><div className="ms"><span className="tag g">GRPO+RLVR = domyślne</span><span className="tag g">DPO/ORPO żyją</span><span className="tag g">QLoRA+merging</span></div></div>
        </div>
        <p style={{ marginTop: 16, fontWeight: 500 }}><span className="dim" style={{ textDecoration: "line-through" }}>RLHF/PPO</span> <span className="acc">→</span> <b>DPO</b> (’23) <span className="acc">→</span> <b>GRPO+RLVR</b> (’25, króluje przy weryfikowalnej nagrodzie).</p>
        <div className="note"><p><b>2026:</b> SFT (QLoRA) → DPO/ORPO → GRPO/RLVR na egzaminach. <b>Nie:</b> RLHF-PPO z modelem nagrody (wyparte); IPO i process-reward modele okazały się niszowe. KTO/SimPO = tańsze alternatywy DPO.</p></div>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>1 · Dane</h2><span className="c">fundament</span></div>
        <div className="grid auto"><div className="cell"><div className="top"><span>kurowany SFT</span><span className="ct">rekom.</span></div><p>Mały, czysty zbiór instrukcji PL &gt; duży i brudny (LIMA).</p></div>
          <div className="cell"><div className="top"><span>syntetyczne</span><span className="ct b">tanie</span></div><p>Magpie, Evol-Instruct, self-instruct → filtruj.</p></div>
          <div className="cell"><div className="top"><span>domena prawnicza</span><span className="ct">moat</span></div><p>ISAP, SAOS → pary „kontekst→odpowiedź z cytatem&quot;.</p></div>
          <div className="cell"><div className="top"><span>dekontaminacja</span><span className="ct">czystość</span></div><p>n-gram/embedding overlap vs zbiory testowe.</p></div></div>
        <div className="ghead"><h2>2 · SFT</h2><span className="c">tanio na 1 GPU</span></div>
        <div className="grid auto"><div className="cell"><div className="top"><span>QLoRA / LoRA</span><span className="ct">rekom.</span></div><p>4-bit + adaptery → 11–14B na jednym GPU.</p></div>
          <div className="cell"><div className="top"><span>DoRA / LoRA+</span><span className="ct y">zaawans.</span></div><p>Bliżej full-FT przy podobnym koszcie.</p></div>
          <div className="cell"><div className="top"><span>Unsloth / Liger</span><span className="ct b">tanie</span></div><p>2–4× szybciej, mniej VRAM.</p></div>
          <div className="cell"><div className="top"><span>NEFTune + packing</span><span className="ct b">tanie</span></div><p>Darmowy zysk jakości i przepustowości.</p></div></div>
        <div className="ghead"><h2>3 · Preferencje</h2><span className="c">offline, bez ciężkiego RLHF</span></div>
        <div className="grid auto"><div className="cell"><div className="top"><span>DPO</span><span className="ct">sprawdzone</span></div><p>Pary lepsza/gorsza, stabilne, bez modelu nagrody.</p></div>
          <div className="cell"><div className="top"><span>ORPO</span><span className="ct">1 etap</span></div><p>SFT + preferencje naraz, bez modelu ref.</p></div>
          <div className="cell"><div className="top"><span>SimPO / KTO</span><span className="ct b">tańsze</span></div><p>Ref-free / bez par — łatwiej o dane.</p></div>
          <div className="cell"><div className="top"><span>iterative DPO</span><span className="ct y">zaawans.</span></div><p>Generuj → oceń (RLAIF) → dotrenuj, w pętli.</p></div></div>
        <div className="ghead"><h2>4 · RL na weryfikowalnych nagrodach</h2><span className="c">przełom pod egzaminy</span></div>
        <div className="grid auto"><div className="cell"><div className="top"><span>GRPO</span><span className="ct">pod egzaminy</span></div><p>RL bez modelu wartości. Nagroda = poprawna litera.</p></div>
          <div className="cell"><div className="top"><span>RLVR</span><span className="ct">pod target</span></div><p>Egzaminy mają klucz → tania, mocna nagroda.</p></div>
          <div className="cell"><div className="top"><span>distylacja CoT</span><span className="ct b">tanie</span></div><p>Łańcuchy myślenia z mocnego nauczyciela.</p></div></div>
        <div className="ghead"><h2>5 · Tanie triki budżetowe</h2></div>
        <div className="grid auto"><div className="cell"><div className="top"><span>model merging</span><span className="ct b">0 treningu</span></div><p>mergekit TIES/DARE/SLERP — często darmowy zysk.</p></div>
          <div className="cell"><div className="top"><span>tokenizer PL</span><span className="ct y">hipoteza</span></div><p>Krótsze sekwencje, tańszy inference.</p></div>
          <div className="cell"><div className="top"><span>long-context</span><span className="ct b">tanie</span></div><p>YaRN/RoPE-scaling pod długie pisma.</p></div>
          <div className="cell"><div className="top"><span>wybór bazy</span><span className="ct">najtańsze</span></div><p>Start z mocniejszej bazy — stąd <a href="/leaderboard" style={{ color: "var(--acc)" }}>leaderboard</a>.</p></div></div>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>Jak trenowano <em>Bielika</em></h2><span className="c">referencja · raport techniczny 11B v3</span></div>
        <p className="muted" style={{ maxWidth: "72ch", margin: "0 0 20px" }}>Pełny, kosztowny pipeline. My startujemy z mocniejszej bazy (Qwen3.5-27B) i <b style={{ color: "var(--ink)" }}>pomijamy najdroższy etap (CPT)</b> — to sedno „super tanio + epsilon&quot;.</p>
        <div className="grid c2">
          <div className="cell"><div className="n">BIELIK 11B v3 (referencja)</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "var(--mut)", fontSize: ".94rem", lineHeight: 1.7 }}>
              <li>Baza: Mistral 7B → <b>Depth Up-Scaling</b> do 11B; tokenizer Mistral (<b>bez rozszerzania PL</b>)</li>
              <li><b>CPT ~1.1T tokenów</b> (54% PL/20% EN; akty prawne, orzeczenia, sejm, Wikipedia) + merging</li>
              <li><b>SFT</b> ~20M instrukcji, instruction-masking, sample-packing</li>
              <li><b>DPO + DPO-P</b> 114k par (pary gen. m.in. <b>DeepSeek-V3</b>)</li>
              <li><b>GRPO + Dr.GRPO / RLVR</b> 143k zadań; weryfikatory: matma <code>\boxed</code>, <b>STEM MCQ</b>, tool-use</li>
            </ul></div>
          <div className="cell" style={{ borderLeft: "3px solid var(--acc)" }}><div className="n">NASZA TAŃSZA ŚCIEŻKA</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "var(--mut)", fontSize: ".94rem", lineHeight: 1.7 }}>
              <li>Baza: <b>Qwen3.5-27B</b> — bije Bielika już off-the-shelf → <b>pomijamy CPT</b> (największy koszt); 9B służy tylko do tanich iteracji</li>
              <li><b>QLoRA SFT</b> na kurowanych PL + arkuszach zawodowych (nie pełne 20M)</li>
              <li><b>ORPO/DPO</b> na mniejszym, celowanym zbiorze par</li>
              <li><b>GRPO/RLVR z weryfikatorem MCQ</b> — dokładnie dźwignia pod <b style={{ color: "var(--ink)" }}>LLMzSzŁ</b></li>
              <li>Generowanie danych: <b>DeepSeek</b> (jak Bielik) — <a href="/datasety" style={{ color: "var(--acc)" }}>dane pod LLMzSzŁ</a></li>
            </ul></div>
        </div>
        <div className="note"><p><b>Wniosek z raportu:</b> rozszerzanie tokenizera PL okazało się zbędne (Bielik go nie ruszał), a RLVR z weryfikatorem MCQ to sprawdzona dźwignia na egzaminy — zgodne z naszym planem.</p></div>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>Tokenizer — dlaczego <em>nie</em> rozszerzamy</h2><span className="c">fertility (tokeny/słowo) · niżej = wydajniej</span></div>
        <p className="muted" style={{ maxWidth: "74ch", margin: "0 0 18px" }}>Zmierzyliśmy fertility na tej samej próbce Wikipedii (PL+EN). Tokenizer Qwena jest <b style={{ color: "var(--ink)" }}>~23% wydajniejszy na polskim</b> niż Bielika/Mistrala — tańszy inference i dłuższy efektywny kontekst (ważne dla długich pism). Przewagę dostajemy <b style={{ color: "var(--ink)" }}>za darmo, wyborem bazy</b>. Skrypt: <a href="https://github.com/slayerlabs/slayer/blob/main/bench/tokenizer_fertility.py" rel="noopener" style={{ color: "var(--acc)" }}>tokenizer_fertility.py</a>.</p>
        <div className="tbl"><table><thead><tr><th>Tokenizer</th><th className="c">vocab</th><th className="c">TpW&nbsp;PL ↓</th><th className="c">CpT&nbsp;PL ↑</th><th className="c">TpW&nbsp;EN</th><th className="c">PL/EN</th></tr></thead><tbody>
          <tr><td className="dn">Gemma-2-9B</td><td className="s">256k</td><td className="s">2.244</td><td className="s">3.31</td><td className="s">1.340</td><td className="s">1.68</td></tr>
          <tr><td className="dn">Qwen3.5 (9B/27B) <span className="chip acc">nasza baza: 27B</span></td><td className="s">248k</td><td className="s win">2.357</td><td className="s">3.15</td><td className="s">1.385</td><td className="s">1.70</td></tr>
          <tr><td className="dn">Llama-3.1-8B</td><td className="s">128k</td><td className="s">2.743</td><td className="s">2.71</td><td className="s">1.343</td><td className="s">2.04</td></tr>
          <tr><td><div className="dn">Bielik-11B-v3 = Mistral-7B</div><div className="ds">Bielik zostawił tokenizer Mistrala (32k)</div></td><td className="s">32k</td><td className="s">3.060</td><td className="s">2.43</td><td className="s">1.544</td><td className="s">1.98</td></tr>
        </tbody></table></div>
        <p className="muted" style={{ marginTop: 10, fontSize: ".86rem" }}>TpW = tokeny/słowo (niżej = wydajniej) · CpT = znaki/token (wyżej = wydajniej) · PL/EN = o ile bardziej token-głodny polski. Próbka: ~200 akapitów Wikipedii PL i EN.</p>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Rekomendowana recepta</h2><span className="c">sekwencja, nie wszystko naraz</span></div>
        <div className="tl recipe">
          <div className="ph"><div className="when">01</div><div><h3>Wybierz bazę</h3><p>Wg leaderboardu — start z mocniejszej = najtańszy zysk.</p></div></div>
          <div className="ph"><div className="when">02</div><div><h3>QLoRA SFT</h3><p>Kurowane PL + domenowe, Unsloth/Liger.</p></div></div>
          <div className="ph"><div className="when">03</div><div><h3>ORPO / DPO</h3><p>Preferencje; ORPO oszczędza etap i VRAM.</p></div></div>
          <div className="ph"><div className="when">04</div><div><h3>GRPO/RLVR na egzaminach</h3><p>Weryfikowalna nagroda pod target.</p></div></div>
          <div className="ph"><div className="when">05</div><div><h3>Odmowa + RAG-aware</h3><p>Grounding i „nie wiem&quot; na niezależnych danych.</p></div></div>
          <div className="ph"><div className="when">06</div><div><h3>Merging</h3><p>mergekit między checkpointami; mierz na held-out.</p></div></div>
        </div>
        <div className="note"><p><b>Czystość:</b> żadnej metody nie kierujemy na dane testowe. <a href="/benchmarks" style={{ color: "var(--acc)" }}>Metodologia →</a></p></div>
      </div></section>
    </>
  );
}
