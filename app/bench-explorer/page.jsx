import Explorer from "./explorer";

export const metadata = {
  title: "Benchmarki — przeglądarka i zgłoszenia | Slayer",
  description: "Przeglądarka benchmarków Slayer: filtrowanie po typie zadania, kategorii, metryce, modelu i tagach. Eksport CSV, zgłaszanie nowych benchmarków przez PR.",
};

const css = `
    h1{font-family:var(--serif);font-weight:400;font-size:clamp(1.9rem,4.4vw,2.8rem);letter-spacing:-.015em;margin:10px 0 0}
    .fbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;align-items:center}
    .fbar select,.fbar .fq{font:inherit;font-size:.86rem;color:var(--txt);background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:8px 10px}
    .fbar .fq{flex:1 1 220px;min-width:180px}
    .fbar select{appearance:auto}
    .fbar .csv{margin-left:auto;font-size:.84rem;padding:8px 14px;cursor:pointer}
    .tagbar{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
    .ftag{font-family:var(--mono);font-size:.72rem;padding:4px 10px;border-radius:99px;border:1px solid var(--line);background:var(--panel);color:var(--mut);cursor:pointer;transition:.12s}
    .ftag:hover{border-color:rgba(199,148,72,.4)}
    .ftag.on{color:var(--acc);background:var(--acc-soft);border-color:rgba(199,148,72,.42)}
    .ftag.clear{color:var(--dim);border-style:dashed}
    th.sortable{cursor:pointer;user-select:none;white-space:nowrap}
    th.sortable:hover{color:var(--acc)}
    td.mono-s{font-family:var(--mono);font-size:.78rem;color:var(--mut);white-space:nowrap}
    tr.dep{opacity:.45}
    .stchip{font-family:var(--mono);font-size:.68rem;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:99px;white-space:nowrap}
    .stchip.verified{color:var(--good);border:1px solid rgba(116,163,122,.4);background:rgba(116,163,122,.08)}
    .stchip.draft{color:var(--amber);border:1px solid rgba(199,148,72,.4);background:var(--acc-soft)}
    .stchip.deprecated{color:var(--dim);border:1px solid var(--line2)}
`;

export default function BenchExplorer() {
  return (
    <div className="sec page-top">
      <style>{css}</style>
      <div className="inner">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <span className="kick"><span className="ac">BENCHMARKI</span> — katalog · filtrowanie · zgłoszenia</span>
            <h1>Przeglądarka benchmarków</h1>
          </div>
          <a className="btn btn-p" href="/bench-explorer/nowy">+ zgłoś benchmark</a>
        </div>
        <p className="muted" style={{ maxWidth: "72ch", marginTop: 12, fontSize: ".94rem" }}>
          Jedno źródło prawdy: <code>data/benchmarks.json</code>. Wyniki modeli dochodzą z{" "}
          <a href="/leaderboard" style={{ color: "var(--acc)" }}>leaderboardu</a> (złączenie po id).
          Zgłoszenia przechodzą review jako pull request — status <b style={{ color: "var(--ink)" }}>draft</b> do czasu weryfikacji.
        </p>
        <Explorer />
      </div>
    </div>
  );
}
