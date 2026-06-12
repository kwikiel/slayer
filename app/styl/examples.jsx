"use client";
import { useEffect, useState } from "react";

const KIND = { err: "k-err", tmpl: "k-tmpl", calq: "k-calq", ph: "k-ph" };

export default function StyleExamples() {
  const [examples, setExamples] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch("/results/style_demo.json?ts=" + Date.now())
      .then((r) => r.json())
      .then((d) => setExamples(d.examples || []))
      .catch(() => setErr(true));
  }, []);

  if (err) return <div className="sd"><p style={{ color: "var(--mut)" }}>Nie udało się wczytać przykładów.</p></div>;
  if (!examples) return <div className="sd"><p style={{ color: "var(--mut)", fontFamily: "var(--mono)", fontSize: ".85rem" }}>wczytuję przykłady…</p></div>;

  return (
    <div className="sd">
      {examples.map((e, i) => (
        <article className="ex" key={i}>
          {/* pola *_html pochodzą z naszego results/style_demo.json (kurowane ręcznie) — renderujemy je jako HTML jak w wersji statycznej */}
          <div className="ex-task"><b>Zadanie:</b> <span dangerouslySetInnerHTML={{ __html: e.prompt }} /></div>
          {e.en_html ? (
            <div className="ex-en"><span className="enh">oryginał EN, z którego base kalkuje szablon</span><span dangerouslySetInnerHTML={{ __html: e.en_html }} /></div>
          ) : null}
          <div className="cmp">
            <div className="side base"><div className="side-h">BASE · Qwen3.5-27B <span>(z błędami)</span></div><div className="col-b" dangerouslySetInnerHTML={{ __html: e.base_html }} /></div>
            <div className="side win"><div className="side-h">v1 · fine-tuned <span>(natywny polski)</span></div><div className="col-b ep" dangerouslySetInnerHTML={{ __html: e.ep3_html }} /></div>
          </div>
          {e.errors && e.errors.length ? (
            <div className="errs">
              <div className="errs-h">błędy zaznaczone ręcznie ({e.errors.length})</div>
              <ul>
                {e.errors.map((er, j) => (
                  <li key={j}><span className={"dot " + (KIND[er.k] || "k-err")}></span><span><code>{er.q}</code> → <span dangerouslySetInnerHTML={{ __html: er.fix }} /></span></li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
