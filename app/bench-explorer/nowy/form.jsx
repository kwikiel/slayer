"use client";
import { useMemo, useState } from "react";

const REPO = "slayerlabs/slayer";
const TYPY = ["klasyfikacja", "ner", "qa-mcq", "qa-ekstrakcyjne", "generowanie", "tłumaczenie", "rozumowanie", "matematyka"];
const KATEGORIE = [["pl-core", "polski rdzeń"], ["en-regression", "regresja EN"], ["closed", "zamknięte"]];

const slugOk = (s) => /^[a-z0-9_-]{2,40}$/.test(s);
const urlOk = (s) => !s || /^https:\/\/.+\..+/.test(s);

export default function SubmitForm() {
  const [f, setF] = useState({
    id: "", nazwa: "", opis: "", link: "", repo: "", metryka: "", metryka_klucz: "accuracy",
    rozmiar: "", licencja: "", kategoria: "pl-core", rola: "", typ_zadania: "qa-mcq", tagi: "", dodal: "",
  });
  const [touched, setTouched] = useState({});
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setCopied(false); };
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const errors = useMemo(() => {
    const e = {};
    if (!slugOk(f.id)) e.id = "id: 2–40 znaków, tylko a-z 0-9 _ - (np. klej_psc)";
    if (f.nazwa.trim().length < 2) e.nazwa = "podaj nazwę";
    if (f.opis.trim().length < 10) e.opis = "opis: minimum 10 znaków";
    if (!urlOk(f.link)) e.link = "link musi być https://…";
    if (!urlOk(f.repo)) e.repo = "repo musi być https://…";
    if (!f.metryka.trim()) e.metryka = "podaj metrykę (np. accuracy MCQ)";
    if (f.rozmiar && !/^\d+$/.test(f.rozmiar)) e.rozmiar = "rozmiar: liczba całkowita (albo puste)";
    if (!f.dodal.trim()) e.dodal = "podaj nick (trafia do pola dodal)";
    return e;
  }, [f]);

  const valid = Object.keys(errors).length === 0;

  const record = useMemo(() => ({
    id: f.id,
    nazwa: f.nazwa.trim(),
    opis: f.opis.trim(),
    link: f.link.trim() || null,
    repo: f.repo.trim() || null,
    metryka: f.metryka.trim(),
    metryka_klucz: f.metryka_klucz.trim() || "accuracy",
    rozmiar: f.rozmiar ? parseInt(f.rozmiar, 10) : null,
    licencja: f.licencja.trim() || null,
    kategoria: f.kategoria,
    rola: f.rola.trim() || null,
    typ_zadania: f.typ_zadania,
    tagi: f.tagi.split(",").map((t) => t.trim()).filter(Boolean),
    status: "draft",
    dodal: f.dodal.trim(),
    data_dodania: new Date().toISOString().slice(0, 10),
    uwagi_review: null,
  }), [f]);

  const json = useMemo(() => JSON.stringify(record, null, 2) + "\n", [record]);

  const prUrl = useMemo(() => {
    const filename = `public/data/submissions/${f.id || "nowy-benchmark"}.json`;
    return `https://github.com/${REPO}/new/main?filename=${encodeURIComponent(filename)}&value=${encodeURIComponent(json)}`;
  }, [f.id, json]);

  const copy = () => navigator.clipboard.writeText(json).then(() => setCopied(true));

  const err = (k) => (touched[k] && errors[k] ? <div className="ferr">{errors[k]}</div> : null);

  return (
    <div className="cols">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="field"><label htmlFor="id">id <span className="opt">(slug, klucz złączenia z wynikami)</span></label>
          <input id="id" type="text" value={f.id} onChange={set("id")} onBlur={blur("id")} placeholder="np. klej_psc" />{err("id")}</div>
        <div className="field"><label htmlFor="nazwa">nazwa</label>
          <input id="nazwa" type="text" value={f.nazwa} onChange={set("nazwa")} onBlur={blur("nazwa")} maxLength={80} placeholder="np. KLEJ PSC" />{err("nazwa")}</div>
        <div className="field"><label htmlFor="opis">opis</label>
          <textarea id="opis" value={f.opis} onChange={set("opis")} onBlur={blur("opis")} maxLength={300} placeholder="co mierzy, skąd pochodzi, ile domen…"></textarea>{err("opis")}</div>
        <div className="grid2">
          <div className="field"><label htmlFor="typ">typ zadania</label>
            <select id="typ" value={f.typ_zadania} onChange={set("typ_zadania")}>{TYPY.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="field"><label htmlFor="kat">kategoria</label>
            <select id="kat" value={f.kategoria} onChange={set("kategoria")}>{KATEGORIE.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        </div>
        <div className="grid2">
          <div className="field"><label htmlFor="metryka">metryka <span className="opt">(wyświetlana)</span></label>
            <input id="metryka" type="text" value={f.metryka} onChange={set("metryka")} onBlur={blur("metryka")} placeholder="np. accuracy MCQ" />{err("metryka")}</div>
          <div className="field"><label htmlFor="mk">metryka_klucz <span className="opt">(pole w leaderboard.json)</span></label>
            <input id="mk" type="text" value={f.metryka_klucz} onChange={set("metryka_klucz")} placeholder="accuracy" /></div>
        </div>
        <div className="grid2">
          <div className="field"><label htmlFor="rozmiar">rozmiar (n) <span className="opt">(opcjonalnie)</span></label>
            <input id="rozmiar" type="text" inputMode="numeric" value={f.rozmiar} onChange={set("rozmiar")} onBlur={blur("rozmiar")} placeholder="np. 1078" />{err("rozmiar")}</div>
          <div className="field"><label htmlFor="licencja">licencja <span className="opt">(opcjonalnie)</span></label>
            <input id="licencja" type="text" value={f.licencja} onChange={set("licencja")} placeholder="np. CC-BY-4.0" /></div>
        </div>
        <div className="field"><label htmlFor="link">link <span className="opt">(HuggingFace / strona, opcjonalnie)</span></label>
          <input id="link" type="url" value={f.link} onChange={set("link")} onBlur={blur("link")} placeholder="https://huggingface.co/datasets/…" />{err("link")}</div>
        <div className="field"><label htmlFor="repo">repo źródłowe <span className="opt">(opcjonalnie — np. repo z danymi/harnessem)</span></label>
          <input id="repo" type="url" value={f.repo} onChange={set("repo")} onBlur={blur("repo")} placeholder="https://github.com/…" />{err("repo")}</div>
        <div className="grid2">
          <div className="field"><label htmlFor="rola">rola <span className="opt">(opcjonalnie)</span></label>
            <input id="rola" type="text" value={f.rola} onChange={set("rola")} placeholder="np. regresja / wiedza PL" /></div>
          <div className="field"><label htmlFor="tagi">tagi <span className="opt">(po przecinku)</span></label>
            <input id="tagi" type="text" value={f.tagi} onChange={set("tagi")} placeholder="pl, eval, mcq" /></div>
        </div>
        <div className="field"><label htmlFor="dodal">twój nick</label>
          <input id="dodal" type="text" value={f.dodal} onChange={set("dodal")} onBlur={blur("dodal")} maxLength={40} placeholder="np. kamil" />{err("dodal")}</div>
      </form>

      <div>
        <div className="ghead"><h2>Podgląd zgłoszenia</h2><span className="c">status: draft · review przez PR</span></div>
        <pre className="preview">{json}</pre>
        <div className="cta-row" style={{ marginTop: 14 }}>
          <a
            className={"btn btn-p" + (valid ? "" : " off")}
            href={valid ? prUrl : undefined}
            target="_blank"
            rel="noopener"
            aria-disabled={!valid}
            onClick={(e) => { if (!valid) { e.preventDefault(); setTouched({ id: true, nazwa: true, opis: true, metryka: true, dodal: true, rozmiar: true, link: true, repo: true }); } }}
          >
            utwórz PR na GitHubie →
          </a>
          <button className="btn btn-s" onClick={copy} disabled={!valid}>{copied ? "skopiowano ✓" : "kopiuj JSON"}</button>
        </div>
        <p className="muted" style={{ fontSize: ".84rem", marginTop: 12 }}>
          Przycisk otwiera GitHuba z gotowym plikiem <code>public/data/submissions/{f.id || "…"}.json</code> —
          tworzysz PR na własnym koncie (wymagane konto GitHub). Po review maintainer scala wpis do{" "}
          <code>data/benchmarks.json</code> i zmienia status na <b>verified</b>. Nie masz GitHuba? Skopiuj JSON i wrzuć na Discord.
        </p>
      </div>
    </div>
  );
}
