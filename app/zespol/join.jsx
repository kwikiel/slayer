"use client";
import { useEffect, useRef, useState } from "react";

const API = "https://rocky.fabryka.ai/slayer/signups";
const ROLES = ["Kontrybutor", "Dane", "Ewaluacja", "Trening/ML", "Infra/DevOps", "Naukowiec/badania", "Firma/use-case", "Fundator/compute"];
const ROLE_LABELS = { "Kontrybutor": "Kontrybutor", "Dane": "Dane", "Ewaluacja": "Ewaluacja", "Trening/ML": "Trening / ML", "Infra/DevOps": "Infra", "Naukowiec/badania": "Naukowiec", "Firma/use-case": "Firma / zastosowanie", "Fundator/compute": "Fundator / compute" };

export default function Join() {
  const [people, setPeople] = useState(null);
  const [count, setCount] = useState(null);
  const [listErr, setListErr] = useState(false);
  const [checked, setChecked] = useState({});
  const [msg, setMsg] = useState({ cls: "msg", text: "" });
  const [sending, setSending] = useState(false);
  const formTitleRef = useRef(null);
  const nameRef = useRef(null);
  const contactRef = useRef(null);
  const aboutRef = useRef(null);
  const hpRef = useRef(null);
  const formRef = useRef(null);

  const load = () =>
    fetch(API + "?ts=" + Date.now())
      .then((r) => r.json())
      .then((d) => {
        setPeople((d.people || []).slice().reverse());
        setCount(d.count);
        setListErr(false);
      })
      .catch(() => setListErr(true));

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const pickRole = (r) => {
    setChecked((c) => ({ ...c, [r]: true }));
    formTitleRef.current?.scrollIntoView({ behavior: "smooth" });
    nameRef.current?.focus();
  };

  const submit = (e) => {
    e.preventDefault();
    const name = nameRef.current.value.trim();
    const contact = contactRef.current.value.trim();
    if (!name || !contact) {
      setMsg({ cls: "msg err", text: "Podaj imię i kontakt." });
      return;
    }
    const payload = {
      name,
      contact,
      about: aboutRef.current.value.trim(),
      website: hpRef.current.value,
      roles: ROLES.filter((r) => checked[r]),
    };
    setSending(true);
    setMsg({ cls: "msg", text: "Wysyłam…" });
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then((r) => r.json().then((j) => ({ s: r.status, j })))
      .then(({ s, j }) => {
        if (s === 201 || j.ok) {
          setMsg({ cls: "msg ok", text: "Dodano. Dzięki." });
          formRef.current.reset();
          setChecked({});
          load();
        } else {
          setMsg({ cls: "msg err", text: j.error || "Coś poszło nie tak." });
        }
      })
      .catch(() => setMsg({ cls: "msg err", text: "Błąd sieci — spróbuj ponownie." }))
      .finally(() => setSending(false));
  };

  return (
    <>
      <section className="sec tight"><div className="inner">
        <div className="ghead"><h2>Dla kogo</h2></div>
        <div className="aud">
          <div className="cell ac"><div className="n">RĘCE</div><h3 className="sm">Kontrybutorzy</h3><p>Kod, dane, ewaluacje, infra. Start od <a href="/zadania" style={{ color: "var(--acc)" }}>zadań</a>.</p><button onClick={() => pickRole("Kontrybutor")}>Zapisz się →</button></div>
          <div className="cell ac"><div className="n">NAUKA</div><h3 className="sm">Naukowcy</h3><p>Metodyka, ewaluacje, współautorstwo.</p><button onClick={() => pickRole("Naukowiec/badania")}>Zapisz się →</button></div>
          <div className="cell ac"><div className="n">RYNEK</div><h3 className="sm">Firmy</h3><p>Zgłoś zastosowanie (prawo, urzędy, branża), zostań wczesnym użytkownikiem.</p><button onClick={() => pickRole("Firma/use-case")}>Zgłoś zastosowanie →</button></div>
          <div className="cell ac"><div className="n">COMPUTE</div><h3 className="sm">Fundatorzy</h3><p>Sfinansuj GPU (15–20k zł) albo daj kredyty.</p><button onClick={() => pickRole("Fundator/compute")}>Wesprzyj →</button></div>
        </div>
      </div></section>

      <section className="sec tight"><div className="inner cols">
        <div>
          <div className="ghead" ref={formTitleRef}><h2>Zapisz się</h2></div>
          <form ref={formRef} autoComplete="off" onSubmit={submit}>
            <input type="text" className="hp" ref={hpRef} tabIndex={-1} aria-hidden="true" />
            <div className="field"><label htmlFor="name">Imię / nick / firma</label><input type="text" id="name" ref={nameRef} maxLength={60} required placeholder="np. Kasia / kasia_ml / Acme sp. z o.o." /></div>
            <div className="field"><label>W jakiej roli? <span className="opt">(zaznacz dowolne)</span></label>
              <div className="roles">
                {ROLES.map((r) => (
                  <label key={r}>
                    <input type="checkbox" name="role" value={r} checked={!!checked[r]} onChange={(e) => setChecked((c) => ({ ...c, [r]: e.target.checked }))} /> {ROLE_LABELS[r]}
                  </label>
                ))}
              </div></div>
            <div className="field"><label htmlFor="contact">Kontakt <span className="opt">(Discord / e-mail / GitHub — prywatny)</span></label><input type="text" id="contact" ref={contactRef} maxLength={120} required placeholder="np. discord: kasia#1234" /></div>
            <div className="field"><label htmlFor="about">Co oferujesz / zastosowanie <span className="opt">(opcjonalnie, publiczne)</span></label><textarea id="about" ref={aboutRef} maxLength={400} placeholder="np. robię evale w lm-eval-harness; albo: firma prawnicza, use case: analiza umów"></textarea></div>
            <button className="btn btn-p" type="submit" disabled={sending}>Dołącz publicznie</button>
            <div className={msg.cls}>{msg.text}</div>
            <p className="muted" style={{ fontSize: ".84rem", margin: 0 }}>Publicznie pokażemy imię, role i opis. Kontakt trafia tylko do organizatora.</p>
          </form>
        </div>
        <div>
          <div className="ghead"><h2>Już dołączyli <span className="cnt">{count != null ? "· " + count : ""}</span></h2></div>
          <div className="panel"><div className="panel-bd">
            {listErr && <div className="muted">Lista chwilowo niedostępna.</div>}
            {!listErr && people === null && <div className="muted">Wczytuję…</div>}
            {!listErr && people !== null && !people.length && <div className="muted">Jeszcze nikt — bądź pierwszy.</div>}
            {!listErr && people !== null && people.map((p, i) => (
              <div className="person" key={i}>
                <span className="pd">{p.date}</span>
                <div className="pn">{p.name}</div>
                {p.roles && p.roles.length ? <div className="pr">{p.roles.map((r) => <span key={r} className="chip acc">{r}</span>)}</div> : null}
                {p.about ? <div className="pa">{p.about}</div> : null}
              </div>
            ))}
          </div></div>
        </div>
      </div></section>
    </>
  );
}
