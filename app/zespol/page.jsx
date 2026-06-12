import Join from "./join";

export const metadata = {
  title: "Dołącz — zespół, fundatorzy, firmy, naukowcy | Slayer",
  description: "Publiczny zapis: kontrybutorzy, naukowcy, fundatorzy compute i firmy (zgłoś use case). Wpisz się i zobacz, kto już dołączył.",
};

const css = `
    .aud{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
    .ac button{margin-top:auto;border:0;background:var(--ink);color:var(--bg);font:inherit;font-weight:600;font-size:.86rem;padding:8px 13px;border-radius:7px;cursor:pointer;transition:.15s}.ac button:hover{background:var(--acc);color:var(--acc-ink)}
    .cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:start}@media(max-width:820px){.cols{grid-template-columns:1fr}}
    form{display:grid;gap:16px}
    .roles{display:flex;flex-wrap:wrap;gap:8px}
    .roles label{display:inline-flex;align-items:center;gap:7px;font-weight:400;margin:0;padding:7px 12px;border:1px solid var(--line);border-radius:99px;background:var(--panel);cursor:pointer;font-size:.9rem}
    .roles input{accent-color:var(--acc)}
    .hp{position:absolute;left:-9999px;opacity:0}
    .msg{font-size:.9rem;font-weight:500;min-height:1.2em}.msg.ok{color:var(--good)}.msg.err{color:#b3402a}
    .person{padding:13px 0;border-top:1px solid var(--line2)}.person:first-of-type{border-top:0}
    .person .pn{font-weight:600}.person .pr{display:flex;flex-wrap:wrap;gap:5px;margin:5px 0}.person .pa{color:var(--mut);font-size:.88rem}.person .pd{float:right;color:var(--dim);font-family:var(--mono);font-size:.72rem}
    .cnt{color:var(--acc);font-family:var(--mono)}
    h1 .a{color:var(--acc);font-style:italic}
`;

export default function Zespol() {
  return (
    <>
      <style>{css}</style>
      <section className="phero"><div className="inner">
        <span className="kick">dołącz · publiczny zapis</span>
        <h1>Zbuduj z nami <em>polski model</em></h1>
        <p>Wpisz się — od razu widać, kto już jest i co oferuje. Kontrybutorzy, naukowcy, fundatorzy mocy obliczeniowej i firmy (zgłoście zastosowanie). Kontakt zostaje prywatny; publicznie widać imię, rolę i opis.</p>
      </div></section>
      <Join />
    </>
  );
}
