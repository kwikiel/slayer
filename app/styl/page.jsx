import StyleExamples from "./examples";

export const metadata = {
  title: "Styl: co base Qwen robi źle po polsku · Slayer",
  description:
    "Ręczny przegląd odpowiedzi base Qwen3.5-27B po polsku: rażące błędy gramatyczne (Hipoza, Bezpośrednie sprzedaż, samodzielną rozwiązywanie), kalki, liczenie w dolarach, szablon. Fine-tuned v1 obok. Bez regexu, przejrzane ręcznie.",
};

const css = `
    .phero{padding:104px clamp(18px,5vw,72px) 8px}
    .phero .inner{width:min(1080px,100%);margin:0 auto}
    .phero h1{font-family:var(--serif);font-weight:400;letter-spacing:-.02em;line-height:1.04;font-size:clamp(2.1rem,5vw,3.4rem);margin:14px 0 18px;color:var(--ink)}
    .phero h1 em{font-style:italic;color:var(--acc)}
    .phero .lede{max-width:66ch;color:var(--mut);font-size:clamp(1.04rem,1.6vw,1.2rem);line-height:1.55}
    .phero .lede b{color:var(--ink);font-weight:600}
    .legend{display:flex;flex-wrap:wrap;gap:9px 16px;margin:24px 0 4px;font-family:var(--mono);font-size:.76rem;color:var(--mut);align-items:center}
    .legend .lg{display:inline-flex;align-items:center;gap:7px}
    .legend .sw{width:13px;height:13px;border-radius:3px;display:inline-block}
    .sw.err{background:#e8a99d}.sw.tmpl{background:#f4d98a}.sw.calq{background:#bcd6e8}.sw.ph{background:#eec3b8}.sw.good{background:#bfe0bf}
    .sd{width:min(1080px,100%);margin:0 auto;padding:8px clamp(18px,5vw,72px) 40px}
    .ex{border:1px solid var(--line);border-radius:13px;background:var(--panel);box-shadow:0 10px 30px rgba(0,0,0,.28);margin:22px 0;overflow:hidden}
    .ex-task{padding:14px clamp(16px,3vw,24px);background:rgba(255,255,255,.035);border-bottom:1px solid var(--line);font-size:.95rem;color:var(--ink)}
    .ex-task b{font-weight:600;color:var(--acc)}
    .ex-en{padding:11px clamp(16px,3vw,24px);border-bottom:1px solid var(--line);font-size:.8rem;line-height:1.55;color:var(--dim);background:rgba(255,255,255,.018)}
    .ex-en .enh{display:block;font-family:var(--mono);font-size:.66rem;letter-spacing:.05em;text-transform:uppercase;color:var(--dim);margin-bottom:5px}
    .cmp{display:grid;grid-template-columns:1fr 1fr}
    .side{padding:16px clamp(16px,3vw,24px)}
    .side.win{background:var(--acc-soft);border-left:2px solid var(--acc)}
    .side-h{font-family:var(--mono);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin-bottom:9px}
    .side.win .side-h{color:var(--acc-d);font-weight:600}
    .side-h span{text-transform:none;letter-spacing:0;color:var(--mut)}
    .col-b{font-size:.87rem;line-height:1.66;color:var(--mut);word-break:break-word}
    .col-b.ep{font-family:var(--serif);font-size:1rem;line-height:1.6;color:var(--ink)}
    .col-b .muted{color:var(--dim);font-style:italic}
    mark{background:none;color:inherit;padding:.5px 2px;border-radius:2px}
    mark.h-tmpl{background:#f4d98a;color:#3a3320}
    mark.h-calq{background:#bcd6e8;color:#234e63}
    mark.h-ph{background:#eec3b8;color:#5a2b1f}
    mark.h-err{background:#f3c9c2;color:#7a241a;border-bottom:2px solid #c0392b;font-weight:500}
    mark.h-good{background:#cfe6cf;color:#2f6b3f}
    .errs{border-top:1px solid var(--line);padding:13px clamp(16px,3vw,24px);background:rgba(255,255,255,.015)}
    .errs-h{font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin-bottom:9px}
    .errs ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
    .errs li{display:flex;gap:9px;font-size:.85rem;line-height:1.5;color:var(--mut)}
    .errs .dot{flex:0 0 auto;width:9px;height:9px;border-radius:50%;margin-top:6px}
    .dot.k-err{background:#c0392b}.dot.k-tmpl{background:#e0b94a}.dot.k-calq{background:#5a8fb0}.dot.k-ph{background:#c98a78}
    .errs code{background:rgba(255,255,255,.06);padding:1px 6px;border-radius:4px;font-size:.82rem;color:var(--ink);overflow-wrap:anywhere;white-space:normal}
    .wniosek{width:min(1080px,100%);margin:0 auto 64px;padding:0 clamp(18px,5vw,72px)}
    .wniosek .box{border-left:3px solid var(--acc);background:var(--panel);border-radius:0 10px 10px 0;padding:20px 24px;color:var(--mut);font-size:.98rem;line-height:1.6}
    .wniosek .box b{color:var(--ink)}
    @media(max-width:760px){.cmp{grid-template-columns:1fr}.side.win{border-left:0;border-top:2px solid var(--acc)}}
`;

export default function Styl() {
  return (
    <>
      <style>{css}</style>
      <section className="phero">
        <div className="inner">
          <span className="kick">01 · styl · v1 · przegląd ręczny</span>
          <h1>Co base Qwen robi <em>źle</em> po polsku.</h1>
          <p className="lede">Przeczytałem odpowiedzi base Qwen3.5-27B i zaznaczyłem błędy ręcznie, nie regexem. Nie chodzi tylko o szablon. Widać <b>rażące błędy gramatyczne i ortograficzne</b> („Hipoza&quot;, „Bezpośrednie sprzedaż&quot;, „samodzielną rozwiązywanie&quot;), <b>kalki z angielskiego</b>, a nawet <b>liczenie w dolarach</b> przy polskim poleceniu. Po lewej base z zaznaczonymi błędami, po prawej fine-tuned <b>v1</b>. Uczciwie zaznaczam też potknięcia v1.</p>
          <div className="legend">
            <span className="lg"><span className="sw err"></span>rażący błąd gramatyczny / ortograficzny</span>
            <span className="lg"><span className="sw tmpl"></span>szablon / markdown / kalka-otwarcia</span>
            <span className="lg"><span className="sw calq"></span>kalka z angielskiego</span>
            <span className="lg"><span className="sw ph"></span>placeholder</span>
            <span className="lg"><span className="sw good"></span>v1 poprawnie</span>
          </div>
        </div>
      </section>

      <StyleExamples />

      <div className="wniosek">
        <div className="box">
          <b>Wniosek:</b> regex łapie tylko myślniki i słowo „feedback&quot;. Ręczny przegląd pokazuje więcej: błędy fleksyjne, literówki w nagłówkach, walutę liczoną w dolarach, kalkowaną składnię. To zwykłe błędy językowe (fleksja, ortografia, składnia) w modelu, który uchodzi za jeden z lepszych. Fine-tuning v1 usuwa szablon i większość kalek, choć sam też się czasem myli, co zaznaczam. Dane: <code>results/style_demo.json</code>, dobrane i opisane ręcznie. Base Qwen3.5-27B vs <code>slayer-style ep3 (v1)</code>.
        </div>
      </div>
    </>
  );
}
