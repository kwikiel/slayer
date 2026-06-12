export const metadata = {
  title: "Zadania — od początkującego do zaawansowanego | Slayer",
  description: "Zadania dla kontrybutorów: od prostych (odpal benchmark, czyść dane) po zaawansowane (GRPO/RLVR, trening odmowy, tokenizer PL).",
};

const css = `.lv{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:6px;font-size:.8rem}.num{font-family:var(--mono);color:var(--dim);font-size:.8rem}`;

export default function Zadania() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">dla kontrybutorów</span>
        <h1>Zadania — od <em>prostych</em> po zaawansowane</h1>
        <p>Wejdź na dowolnym poziomie. Każde zadanie małe, sprawdzalne, mierzone na held-out. Metodyka: <a href="/trening">/trening</a>.</p>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><span className="lv" style={{ background: "var(--acc-d)" }}></span><h2>Początkujący</h2><span className="c">kilka godzin · zero treningu</span></div>
        <div className="grid auto">
          <div className="cell"><div className="top"><span className="num">01</span></div><h3 className="sm">Odpal benchmark lokalnie</h3><p>Ollama + nasz skrypt MCQ na 200 pytaniach, zgłoś wynik.</p><div className="meta"><span className="chip acc">eval</span></div></div>
          <div className="cell"><div className="top"><span className="num">02</span></div><h3 className="sm">Zweryfikuj dataset</h3><p>Licencja, schemat, czy publiczny (kolejka vs zamknięte).</p><div className="meta"><span className="chip blue">dane</span></div></div>
          <div className="cell"><div className="top"><span className="num">03</span></div><h3 className="sm">Czyść / anotuj instrukcje PL</h3><p>Oznacz śmieci, popraw odpowiedzi. Jakość &gt; ilość.</p><div className="meta"><span className="chip blue">dane</span></div></div>
          <div className="cell"><div className="top"><span className="num">04</span></div><h3 className="sm">Dodaj loader MCQ</h3><p>Nowy publiczny zbiór → mapowanie pól do harnessu.</p><div className="meta"><span className="chip acc">eval</span><span className="chip">kod</span></div></div>
          <div className="cell"><div className="top"><span className="num">05</span></div><h3 className="sm">Poprawki strony / docs</h3><p>Treści, tłumaczenia, drobne fixy UI.</p><div className="meta"><span className="chip">strona</span></div></div>
        </div>
        <div className="ghead"><span className="lv" style={{ background: "var(--amber)", color: "#1a1300" }}></span><h2>Średnio</h2><span className="c">trochę kodu/compute · pierwszy trening</span></div>
        <div className="grid auto">
          <div className="cell"><div className="top"><span className="num">06</span></div><h3 className="sm">Skrypt dekontaminacji</h3><p>n-gram/embedding overlap korpusu vs zbiory testowe.</p><div className="meta"><span className="chip blue">dane</span><span className="chip acc">eval</span></div></div>
          <div className="cell"><div className="top"><span className="num">07</span></div><h3 className="sm">QLoRA SFT (mały zbiór)</h3><p>Dostrojenie 11–14B na 1 GPU, wynik na held-out.</p><div className="meta"><span className="chip amber">trening</span></div></div>
          <div className="cell"><div className="top"><span className="num">08</span></div><h3 className="sm">Pary preferencji (DPO)</h3><p>Zbiór „lepsza/gorsza&quot; (człowiek lub sędzia-LLM).</p><div className="meta"><span className="chip blue">dane</span><span className="chip amber">trening</span></div></div>
          <div className="cell"><div className="top"><span className="num">09</span></div><h3 className="sm">Dane syntetyczne</h3><p>Pipeline Magpie/Evol-Instruct + filtr jakości.</p><div className="meta"><span className="chip blue">dane</span></div></div>
          <div className="cell"><div className="top"><span className="num">10</span></div><h3 className="sm">Model merging</h3><p>mergekit (TIES/DARE/SLERP), pomiar na held-out.</p><div className="meta"><span className="chip amber">trening</span><span className="chip">infra</span></div></div>
          <div className="cell"><div className="top"><span className="num">11</span></div><h3 className="sm">Prywatny held-out</h3><p>Świeży zestaw (najnowsze CKE/PES) — anty-benchmaxxing.</p><div className="meta"><span className="chip acc">eval</span><span className="chip blue">dane</span></div></div>
        </div>
        <div className="ghead"><span className="lv" style={{ background: "#8f3b31" }}></span><h2>Zaawansowane</h2><span className="c">pełne treningi · RL · infra</span></div>
        <div className="grid auto">
          <div className="cell"><div className="top"><span className="num">12</span></div><h3 className="sm">DPO / ORPO full + ablacje</h3><p>Pełny alignment, porównanie wariantów, raport.</p><div className="meta"><span className="chip amber">trening</span></div></div>
          <div className="cell"><div className="top"><span className="num">13</span></div><h3 className="sm">GRPO / RLVR na egzaminach</h3><p>RL z weryfikowalną nagrodą. Killer pod target.</p><div className="meta"><span className="chip amber">trening</span><span className="chip">infra</span></div></div>
          <div className="cell"><div className="top"><span className="num">14</span></div><h3 className="sm">Trening odmowy / grounding</h3><p>„Brak podstawy w dokumencie&quot;, RAG-aware.</p><div className="meta"><span className="chip amber">trening</span><span className="chip blue">dane</span></div></div>
          <div className="cell"><div className="top"><span className="num">15</span></div><h3 className="sm">Continued pre-training PL</h3><p>Doczytanie korpusu PL przed SFT.</p><div className="meta"><span className="chip amber">trening</span></div></div>
          <div className="cell"><div className="top"><span className="num">16</span></div><h3 className="sm">Tokenizer PL</h3><p>Polski słownik + init embeddingów.</p><div className="meta"><span className="chip amber">trening</span><span className="chip">infra</span></div></div>
          <div className="cell"><div className="top"><span className="num">17</span></div><h3 className="sm">Distylacja rozumowania</h3><p>Łańcuchy CoT z mocnego nauczyciela.</p><div className="meta"><span className="chip amber">trening</span></div></div>
          <div className="cell"><div className="top"><span className="num">18</span></div><h3 className="sm">Long-context + koszt</h3><p>YaRN pod długie akta, profilowanie compute.</p><div className="meta"><span className="chip">infra</span></div></div>
        </div>
        <div className="note"><p><b>Jak zacząć:</b> wybierz zadanie, odezwij się na <a href="https://discord.gg/HnTkVR4c5T" style={{ color: "var(--acc)" }}>Discordzie</a>, weź je „na siebie&quot;. Wynik liczy się tylko, gdy jest odtwarzalny i mierzony na held-out.</p></div>
      </div></section>
    </>
  );
}
