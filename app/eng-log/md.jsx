// markdown-lite -> JSX, zero zależności. Obsługuje: ## nagłówki, - listy,
// ``` bloki kodu, akapity; inline: **bold**, `code`, [tekst](url).

function inline(text, keyBase) {
  const out = [];
  // tokenizacja inline: link, code, bold
  const re = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;
  let i = 0, m, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > i) out.push(text.slice(i, m.index));
    if (m[1]) out.push(<a key={`${keyBase}-${k++}`} href={m[2]} target="_blank" rel="noopener">{m[1]}</a>);
    else if (m[3]) out.push(<code key={`${keyBase}-${k++}`}>{m[3]}</code>);
    else if (m[4]) out.push(<b key={`${keyBase}-${k++}`}>{inline(m[4], `${keyBase}-b${k}`)}</b>);
    i = m.index + m[0].length;
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}

export function MdLite({ src }) {
  const lines = src.split("\n");
  const blocks = [];
  let para = [], list = null, code = null;
  const flushPara = () => { if (para.length) { blocks.push({ t: "p", v: para.join(" ") }); para = []; } };
  const flushList = () => { if (list) { blocks.push({ t: "ul", v: list }); list = null; } };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (code !== null) {
      if (line.startsWith("```")) { blocks.push({ t: "code", v: code.join("\n") }); code = null; }
      else code.push(raw);
      continue;
    }
    if (line.startsWith("```")) { flushPara(); flushList(); code = []; continue; }
    if (line.startsWith("## ")) { flushPara(); flushList(); blocks.push({ t: "h2", v: line.slice(3) }); continue; }
    if (line.startsWith("- ")) { flushPara(); (list = list || []).push(line.slice(2)); continue; }
    if (!line.trim()) { flushPara(); flushList(); continue; }
    para.push(line.trim());
  }
  flushPara(); flushList();
  if (code) blocks.push({ t: "code", v: code.join("\n") });

  return (
    <>
      {blocks.map((b, i) => {
        if (b.t === "h2") return <h2 key={i}>{inline(b.v, `h${i}`)}</h2>;
        if (b.t === "code") return <pre key={i}><code>{b.v}</code></pre>;
        if (b.t === "ul") return <ul key={i}>{b.v.map((li, j) => <li key={j}>{inline(li, `l${i}-${j}`)}</li>)}</ul>;
        return <p key={i}>{inline(b.v, `p${i}`)}</p>;
      })}
    </>
  );
}
