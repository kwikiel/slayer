"use client";
import { useEffect, useMemo, useState } from "react";

const KATEGORIE = { "pl-core": "polski rdzeń", "en-regression": "regresja EN", closed: "zamknięte" };
const STATUSY = { verified: "zweryfikowany", draft: "draft", deprecated: "wycofany" };

function toCsv(rows) {
  const cols = ["id", "nazwa", "opis", "kategoria", "typ_zadania", "metryka", "rozmiar", "licencja", "status", "tagi", "link", "modele_zmierzone"];
  const escCell = (v) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("|") : String(v);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => escCell(r[c])).join(","))].join("\n");
}

export default function Explorer() {
  const [benchmarks, setBenchmarks] = useState(null);
  const [results, setResults] = useState(null);
  const [err, setErr] = useState(false);

  const [fTyp, setFTyp] = useState("");
  const [fKat, setFKat] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fMetryka, setFMetryka] = useState("");
  const [fModel, setFModel] = useState("");
  const [fTagi, setFTagi] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "nazwa", dir: 1 });

  useEffect(() => {
    fetch("/data/benchmarks.json?ts=" + Date.now())
      .then((r) => r.json())
      .then(setBenchmarks)
      .catch(() => setErr(true));
    fetch("/results/leaderboard.json?ts=" + Date.now())
      .then((r) => r.json())
      .then(setResults)
      .catch(() => setResults(false));
  }, []);

  // benchmark id -> lista modeli, które mają na nim wynik (join po id z leaderboard.json)
  const modelsByBench = useMemo(() => {
    const m = {};
    if (results) {
      (results.benchmarks || []).forEach((b) => {
        m[b.benchmark] = (b.models || []).map((x) => x.display_name);
      });
    }
    return m;
  }, [results]);

  const allModels = useMemo(() => [...new Set(Object.values(modelsByBench).flat())].sort(), [modelsByBench]);
  const allTypy = useMemo(() => [...new Set((benchmarks || []).map((b) => b.typ_zadania).filter(Boolean))].sort(), [benchmarks]);
  const allMetryki = useMemo(() => [...new Set((benchmarks || []).map((b) => b.metryka).filter(Boolean))].sort(), [benchmarks]);
  const allTagi = useMemo(() => [...new Set((benchmarks || []).flatMap((b) => b.tagi || []))].sort(), [benchmarks]);

  const rows = useMemo(() => {
    if (!benchmarks) return [];
    let r = benchmarks.map((b) => ({ ...b, modele_zmierzone: modelsByBench[b.id] || [] }));
    if (fTyp) r = r.filter((b) => b.typ_zadania === fTyp);
    if (fKat) r = r.filter((b) => b.kategoria === fKat);
    if (fStatus) r = r.filter((b) => b.status === fStatus);
    if (fMetryka) r = r.filter((b) => b.metryka === fMetryka);
    if (fModel) r = r.filter((b) => b.modele_zmierzone.includes(fModel));
    if (fTagi.length) r = r.filter((b) => fTagi.every((t) => (b.tagi || []).includes(t)));
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      r = r.filter((b) => (b.nazwa + " " + b.opis + " " + b.id).toLowerCase().includes(needle));
    }
    const { key, dir } = sort;
    r.sort((a, b) => {
      const av = a[key], bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (typeof av === "number" ? av - bv : String(av).localeCompare(String(bv), "pl")) * dir;
    });
    return r;
  }, [benchmarks, modelsByBench, fTyp, fKat, fStatus, fMetryka, fModel, fTagi, q, sort]);

  const toggleTag = (t) => setFTagi((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  const clickSort = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }));

  const exportCsv = () => {
    const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slayer-benchmarki-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (err) return <div className="muted mono" style={{ marginTop: 24 }}>brak danych (data/benchmarks.json)</div>;
  if (!benchmarks) return <div className="muted mono" style={{ marginTop: 24 }}>wczytuję benchmarki…</div>;

  const arrow = (key) => (sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "");

  return (
    <>
      <div className="fbar">
        <input className="fq" type="search" placeholder="szukaj po nazwie / opisie…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={fTyp} onChange={(e) => setFTyp(e.target.value)}>
          <option value="">typ zadania: wszystkie</option>
          {allTypy.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={fKat} onChange={(e) => setFKat(e.target.value)}>
          <option value="">kategoria: wszystkie</option>
          {Object.entries(KATEGORIE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={fMetryka} onChange={(e) => setFMetryka(e.target.value)}>
          <option value="">metryka: wszystkie</option>
          {allMetryki.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={fModel} onChange={(e) => setFModel(e.target.value)}>
          <option value="">model: wszystkie</option>
          {allModels.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">status: wszystkie</option>
          {Object.entries(STATUSY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn btn-s csv" onClick={exportCsv}>eksport CSV ({rows.length})</button>
      </div>

      <div className="tagbar">
        {allTagi.map((t) => (
          <button key={t} className={"ftag" + (fTagi.includes(t) ? " on" : "")} onClick={() => toggleTag(t)}>{t}</button>
        ))}
        {(fTagi.length || fTyp || fKat || fStatus || fMetryka || fModel || q) ? (
          <button className="ftag clear" onClick={() => { setFTagi([]); setFTyp(""); setFKat(""); setFStatus(""); setFMetryka(""); setFModel(""); setQ(""); }}>× wyczyść filtry</button>
        ) : null}
      </div>

      <div className="tbl" style={{ marginTop: 14 }}>
        <table>
          <thead>
            <tr>
              <th className="sortable" onClick={() => clickSort("nazwa")}>Benchmark{arrow("nazwa")}</th>
              <th className="sortable" onClick={() => clickSort("typ_zadania")}>Typ zadania{arrow("typ_zadania")}</th>
              <th className="sortable" onClick={() => clickSort("kategoria")}>Kategoria{arrow("kategoria")}</th>
              <th className="sortable" onClick={() => clickSort("metryka")}>Metryka{arrow("metryka")}</th>
              <th className="sortable c" onClick={() => clickSort("rozmiar")}>n{arrow("rozmiar")}</th>
              <th>Tagi</th>
              <th className="sortable c" onClick={() => clickSort("status")}>Status{arrow("status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className={b.status === "deprecated" ? "dep" : ""}>
                <td>
                  <div className="dn">{b.link ? <a href={b.link} rel="noopener">{b.nazwa}</a> : b.nazwa}</div>
                  <div className="ds">{b.opis}{b.modele_zmierzone.length ? ` · zmierzone: ${b.modele_zmierzone.length} modele` : ""}</div>
                </td>
                <td className="mono-s">{b.typ_zadania || "—"}</td>
                <td className="mono-s">{KATEGORIE[b.kategoria] || b.kategoria}</td>
                <td className="mono-s">{b.metryka}</td>
                <td className="c mono-s">{b.rozmiar != null ? b.rozmiar.toLocaleString("pl") : "—"}</td>
                <td><div className="tags">{(b.tagi || []).map((t) => <span key={t} className="chip">{t}</span>)}</div></td>
                <td className="c">
                  <span className={"stchip " + b.status}>{STATUSY[b.status] || b.status}</span>
                  {b.uwagi_review ? <div className="ds" style={{ marginTop: 4 }}>{b.uwagi_review}</div> : null}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="muted mono" style={{ textAlign: "center", padding: 30 }}>nic nie pasuje do filtrów</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
