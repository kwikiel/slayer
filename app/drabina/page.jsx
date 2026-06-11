export const metadata = {
  title: "Drabina — od obserwatora do core teamu | Slayer",
  description:
    "Drabina społeczności Slayer: 7 poziomów statusu, odpowiedzialności i dowodów pracy. Awans za artefakty, nie za gadanie. Lejek: Discord → starter task → Contributor → Builder → Fellow → Maintainer → Core.",
};

const css = `
    .funnel{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-family:var(--mono);font-size:.78rem;color:var(--mut);margin:18px 0 0}
    .funnel b{color:var(--ink);font-weight:500;padding:6px 12px;border:1px solid var(--line);border-radius:99px;background:var(--panel)}
    .funnel .ar{color:var(--acc)}
    .lvl{border:1px solid var(--line);border-radius:var(--rad);background:var(--panel);margin:18px 0;overflow:hidden}
    .lvl-top{display:flex;align-items:baseline;gap:16px;padding:18px clamp(16px,3vw,26px) 6px}
    .lvl-top .no{font-family:var(--serif);font-style:italic;font-size:clamp(1.8rem,3vw,2.4rem);color:var(--acc);opacity:.85;line-height:1}
    .lvl-top h3{margin:0;font-family:var(--serif);font-weight:400;font-size:clamp(1.3rem,2.4vw,1.7rem);letter-spacing:-.01em}
    .lvl-top .cel{font-size:.92rem;color:var(--mut)}
    .lvl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid var(--line2);margin-top:12px}
    @media(max-width:820px){.lvl-grid{grid-template-columns:1fr}}
    .lvl-col{padding:14px clamp(16px,3vw,26px);border-left:1px solid var(--line2)}
    .lvl-col:first-child{border-left:0}
    @media(max-width:820px){.lvl-col{border-left:0;border-top:1px solid var(--line2)}.lvl-col:first-child{border-top:0}}
    .lvl-col .h{font-family:var(--mono);font-size:.64rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:8px}
    .lvl-col ul{margin:0;padding-left:16px;color:var(--mut);font-size:.88rem;line-height:1.6}
    .lvl-col .h.acc{color:var(--acc)}
    .qcard{font-family:var(--mono);font-size:.82rem;line-height:1.8;color:var(--txt);background:var(--panel2);border:1px solid var(--line);border-radius:var(--rad);padding:18px 22px;white-space:pre}
    .qcard .k{color:var(--acc)}
    .tags2{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
`;

const LEVELS = [
  {
    no: "01", name: "Lurker", cel: "obserwuje, czyta, uczy się języka projektu",
    dostajesz: ["publiczne kanały i weekly updates", "roadmapę i reading listę", "dostęp do demo, modeli i leaderboardów"],
    oczekiwanie: ["zero presji", "czytaj, reaguj, zadawaj pytania"],
    dalejLabel: "dalej, gdy",
    dalej: ["pierwsza sensowna wiadomość lub zgłoszenie błędu", "próba odpalenia modelu albo benchmarku"],
  },
  {
    no: "02", name: "User", cel: "realnie używa i daje feedback",
    dostajesz: ["narzędzia, modele, playground", "kanał feedbackowy i early access do buildów", "możliwość proponowania use-case'ów"],
    oczekiwanie: ["raportujesz jakość: gdzie model się wywala", "przykłady promptów, porażek, edge-case'ów"],
    dalejLabel: "dalej, gdy",
    dalej: ["3-5 użytecznych feedbacków z konkretami", "aktywność bez chaotycznego spamu"],
  },
  {
    no: "03", name: "Contributor", cel: "dokłada małe, mierzalne cegły",
    dostajesz: ["rolę, kanały robocze, zadania z backlogu", "publiczny credit w changelogu i README", "opcjonalnie bounty"],
    oczekiwanie: ["dane, evale, kod, research notes albo onboarding innych", "kończenie małych zadań, komunikacja async, brak ego-dramy"],
    dalejLabel: "dalej, gdy",
    dalej: ["2-3 zaakceptowane contribution", "powtarzalność zamiast jednorazowego zrywu"],
  },
  {
    no: "04", name: "Operator / Builder", cel: "człowiek, któremu można dać fragment systemu",
    dostajesz: ["ownership małego obszaru (eval suite, pipeline danych, harness, docs, inference…)", "prywatniejsze kanały robocze i mini-projekt", "priorytet przy bounty i płatnej współpracy"],
    oczekiwanie: ["dowozisz co tydzień i sam rozbijasz problem na taski", "raportujesz status, przyciągasz 1-2 kolejnych ludzi"],
    dalejLabel: "dalej, gdy",
    dalej: ["zamknięty projekt z widocznym artefaktem", "powtarzalna praca przez 3-4 tygodnie"],
  },
  {
    no: "05", name: "Research Fellow", cel: "semi-core, prowadzi eksperymenty",
    dostajesz: ["compute, dane, prywatny kanał research", "eksperymenty pod brandem labu, współautorstwo raportów", "potencjalnie grant, bounty albo stypendium"],
    oczekiwanie: ["hipotezy, eksperymenty z logami, krótkie technical notes", "nie „ma opinie”, tylko generuje evidence"],
    dalejLabel: "dalej, gdy",
    dalej: ["1 solidny publiczny artefakt (np. „Eval Failure Taxonomy”, „Synthetic Data Recipe”)", "1 eksperyment użyteczny dla modelu, bez prowadzenia za rękę"],
  },
  {
    no: "06", name: "Maintainer", cel: "pilnuje jakości części labu",
    dostajesz: ["merge i review rights w wybranym repo", "realny wpływ na roadmapę, strategiczne calle", "ścieżkę revenue / bounty / kontraktów"],
    oczekiwanie: ["review contribution, utrzymywanie standardów", "zamykanie pętli, projektowanie procesów, bycie filtrem jakości"],
    dalejLabel: "dalej, gdy",
    dalej: ["dowozi 2-3 miesiące, inni chcą z nim pracować", "umie powiedzieć „nie” i ma techniczny smak"],
  },
  {
    no: "07", name: "Core Team", cel: "buduje instytucję, nie tylko robi taski",
    dostajesz: ["upside zależny od struktury (equity / revenue share)", "pełny kontekst strategiczny i decyzyjność", "ownership filaru: Models, Data, Evals, Inference, Community, Research Ops, Commercial"],
    oczekiwanie: ["działa jak founder obszaru i rekrutuje innych", "reprezentuje lab na zewnątrz"],
    dalejLabel: "kryteria",
    dalej: ["trust ponad skill, długoterminowość", "wysoka energia, niski chaos"],
  },
];

export default function Drabina() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">społeczność · drabina statusu, odpowiedzialności i dowodów pracy</span>
        <h1>Od obserwatora do <em>core teamu</em>.</h1>
        <p>Społeczność labu nie jest tłumem; to lejek rekrutacyjny z publicznym research outputem.
        Każdy poziom ma jasne wejście, oczekiwania i nagrodę, a awans przyznajemy za artefakty, nie za gadanie.</p>
        <div className="funnel">
          <b>Reach</b><span className="ar">→</span><b>Discord</b><span className="ar">→</span><b>Starter task</b><span className="ar">→</span><b>Contributor</b><span className="ar">→</span><b>Builder</b><span className="ar">→</span><b>Fellow</b><span className="ar">→</span><b>Maintainer</b><span className="ar">→</span><b>Core</b>
        </div>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>Siedem poziomów</h2><span className="c">wejście · co dostajesz · dowód przejścia wyżej</span></div>

        {LEVELS.map((l) => (
          <div className="lvl" key={l.no}>
            <div className="lvl-top"><span className="no">{l.no}</span><h3>{l.name}</h3><span className="cel">{l.cel}</span></div>
            <div className="lvl-grid">
              <div className="lvl-col"><div className="h">dostajesz</div><ul>{l.dostajesz.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              <div className="lvl-col"><div className="h">oczekiwanie</div><ul>{l.oczekiwanie.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              <div className="lvl-col"><div className="h acc">{l.dalejLabel}</div><ul>{l.dalej.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            </div>
          </div>
        ))}
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Proof of work</h2><span className="c">awans za artefakty, nie za gadanie</span></div>
        <p className="muted" style={{ maxWidth: "70ch" }}>Każdy poziom ma dowód pracy. Liczą się rzeczy, które można otworzyć, odpalić i ocenić:</p>
        <div className="tags2">
          <span className="chip">dobry issue</span><span className="chip">eval case</span><span className="chip">dataset PR</span>
          <span className="chip">benchmark run</span><span className="chip">technical note</span><span className="chip">onboarding guide</span>
          <span className="chip">eksperyment z logami</span><span className="chip">model comparison</span><span className="chip">bug report</span><span className="chip">pull request</span>
        </div>
        <div className="grid c2" style={{ marginTop: 26 }}>
          <div className="cell"><div className="top"><span>role na discordzie</span></div>
            <div className="tags2"><span className="chip acc">Observer</span><span className="chip acc">User</span><span className="chip acc">Contributor</span><span className="chip acc">Builder</span><span className="chip acc">Research Fellow</span><span className="chip acc">Maintainer</span><span className="chip acc">Core</span></div>
          </div>
          <div className="cell"><div className="top"><span>tagi kompetencji</span></div>
            <div className="tags2"><span className="chip">data</span><span className="chip">evals</span><span className="chip">training</span><span className="chip">inference</span><span className="chip">frontend</span><span className="chip">backend</span><span className="chip">infra</span><span className="chip">research</span><span className="chip">community</span><span className="chip">docs</span><span className="chip">bizdev</span></div>
          </div>
        </div>
      </div></section>

      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>Onboarding: pierwsze 7 dni</h2><span className="c">od wejścia do pierwszego artefaktu</span></div>
        <div className="grid c3">
          <div className="cell"><div className="top"><span>krok 1-3</span></div><h3 className="sm">Wejdź i wybierz ścieżkę</h3><p>Dołącz na Discorda, przeczytaj &quot;Start Here&quot;, wybierz: data / evals / code / research / community.</p></div>
          <div className="cell"><div className="top"><span>krok 4-5</span></div><h3 className="sm">Zrób starter task</h3><p>Jeden mały task z quest boardu. Dostajesz feedback od reviewera w ciągu paru dni.</p></div>
          <div className="cell"><div className="top"><span>krok 6-7</span></div><h3 className="sm">Dowiezione = Contributor</h3><p>Zaakceptowany artefakt to rola Contributor, kanały robocze i kolejne taski z backlogu.</p></div>
        </div>
        <div className="grid c2" style={{ marginTop: 26 }}>
          <div className="cell"><div className="top"><span>przykładowe starter taski</span></div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "var(--mut)", fontSize: ".93rem", lineHeight: 1.8 }}>
              <li>Znajdź 20 polskich promptów, na których Bielik/Qwen failuje.</li>
              <li>Dodaj 10 przykładów do eval suite.</li>
              <li>Uruchom benchmark i wrzuć wynik.</li>
              <li>Napisz 1-stronicowe streszczenie papera.</li>
              <li>Zrób taksonomię błędów modelu na 30 przykładach.</li>
              <li>Popraw docs instalacji albo porównaj 3 modele na jednym tasku.</li>
            </ul>
          </div>
          <div className="cell"><div className="top"><span>quest board · format taska</span></div>
            <div className="qcard"><span className="k">Title:</span>{"     20 promptów, na których pada Bielik\n"}<span className="k">Context:</span>{"   eval stylu PL, sekcja anty-tells\n"}<span className="k">Expected:</span>{"  JSONL: prompt + output + co poszło źle\n"}<span className="k">Difficulty:</span>{" S / M / L\n"}<span className="k">Reward:</span>{"    credit · bounty · progres roli\n"}<span className="k">Reviewer:</span>{"  maintainer obszaru\n"}<span className="k">Deadline:</span>{"  7 dni"}</div>
            <p style={{ margin: "10px 0 0", fontSize: ".85rem", color: "var(--dim)", fontFamily: "var(--mono)" }}>kategorie: good first tasks · bounties · research / eval / data / infra quests · needs owner</p>
          </div>
        </div>
      </div></section>

      <section className="sec tight alt"><div className="inner">
        <div className="ghead"><h2>Prestiż musi być widoczny</h2><span className="c">co dostają ludzie, którzy dowożą</span></div>
        <div className="grid c3">
          <div className="cell"><h3 className="sm">Publiczny credit</h3><p>Leaderboard contributorów, credits w README, monthly builders report, shoutouty na X/LinkedIn.</p></div>
          <div className="cell"><h3 className="sm">Dostęp</h3><p>Compute, priority access do modeli, prywatne calle, współautorstwo raportów.</p></div>
          <div className="cell"><h3 className="sm">Pieniądze</h3><p>Bounty, płatne zlecenia, kontrakty; core team z upside&apos;em zależnym od struktury.</p></div>
        </div>
      </div></section>

      <section className="sec alt"><div className="inner narrow" style={{ textAlign: "center" }}>
        <span className="kick">start</span>
        <h2 className="serif" style={{ fontSize: "clamp(2rem,4vw,2.9rem)", fontWeight: 400, letterSpacing: "-.015em", margin: "14px 0 14px" }}>Wejdź na drabinę.</h2>
        <p className="muted" style={{ maxWidth: "54ch", margin: "0 auto 26px" }}>Pierwszy szczebel to jedna sensowna wiadomość albo jeden starter task. Reszta to powtarzalne artefakty.</p>
        <div className="cta-row" style={{ justifyContent: "center" }}><a className="btn btn-p" href="https://discord.gg/HnTkVR4c5T" rel="noopener" target="_blank">Dołącz na Discord →</a><a className="btn btn-s" href="/zadania">zobacz zadania</a></div>
      </div></section>
    </>
  );
}
