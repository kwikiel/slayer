import SubmitForm from "./form";

export const metadata = {
  title: "Zgłoś benchmark | Slayer",
  description: "Formularz zgłaszania nowego benchmarku do katalogu Slayer — walidacja, podgląd JSON i gotowy pull request na GitHubie.",
};

const css = `
    h1{font-family:var(--serif);font-weight:400;font-size:clamp(1.9rem,4.4vw,2.8rem);letter-spacing:-.015em;margin:10px 0 0}
    .cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px;align-items:start;margin-top:26px}
    @media(max-width:880px){.cols{grid-template-columns:1fr}}
    form{display:grid;gap:14px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:520px){.grid2{grid-template-columns:1fr}}
    .field label{display:block;font-family:var(--mono);font-size:.74rem;letter-spacing:.04em;color:var(--mut);margin-bottom:6px}
    .field .opt{color:var(--dim);text-transform:none;letter-spacing:0}
    .field input,.field textarea,.field select{width:100%;font:inherit;font-size:.92rem;color:var(--txt);background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:9px 11px}
    .field textarea{min-height:74px;resize:vertical}
    .field input:focus,.field textarea:focus,.field select:focus{outline:none;border-color:rgba(199,148,72,.5)}
    .ferr{font-family:var(--mono);font-size:.72rem;color:#c98a78;margin-top:5px}
    .preview{font-family:var(--mono);font-size:.76rem;line-height:1.55;color:var(--mut);background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:16px;overflow-x:auto;max-height:520px;margin:0}
    .btn.off{opacity:.45;cursor:not-allowed}
`;

export default function NowyBenchmark() {
  return (
    <div className="sec page-top">
      <style>{css}</style>
      <div className="inner">
        <span className="kick"><span className="ac">ZGŁOSZENIE</span> — nowy benchmark · review przez PR</span>
        <h1>Zgłoś benchmark do katalogu</h1>
        <p className="muted" style={{ maxWidth: "72ch", marginTop: 12, fontSize: ".94rem" }}>
          Wypełnij pola — podgląd JSON aktualizuje się na żywo. Zgłoszenie trafia jako plik do{" "}
          <code>public/data/submissions/</code> przez pull request; review odbywa się w PR. Zasada „benchmark = blocklista i miara&quot; obowiązuje:
          zgłaszamy tylko zbiory z publicznie dostępnym test-setem (inaczej trafi do <a href="/closed-benchmarks" style={{ color: "var(--acc)" }}>zamkniętych</a>).
        </p>
        <SubmitForm />
      </div>
    </div>
  );
}
