import { POSTS } from "./posts";

export const metadata = {
  title: "Eng log | Slayer",
  description:
    "Dziennik inżynierski Slayera: surowe notatki z treningu, recon cudzych receptur, decyzje i wpadki. Pisane na bieżąco, bez wygładzania.",
};

const css = `
  h1{font-family:var(--serif);font-weight:400;font-size:clamp(1.9rem,4.4vw,2.8rem);letter-spacing:-.015em;margin:10px 0 0}
  .intro{color:var(--mut);max-width:62ch;line-height:1.6;margin-top:10px}
  .posts{display:grid;gap:14px;margin-top:28px}
  .post{display:block;border:1px solid var(--line2);border-radius:10px;padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01)),var(--panel);text-decoration:none;transition:border-color .2s}
  .post:hover{border-color:var(--acc)}
  .post-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-family:var(--mono);font-size:.74rem;color:var(--dim)}
  .post-tag{padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.04);border:1px solid var(--line)}
  .post h2{font-family:var(--serif);font-weight:400;font-size:1.45rem;color:var(--ink);margin:8px 0 6px;letter-spacing:-.01em}
  .post p{color:var(--mut);font-size:.92rem;line-height:1.55;margin:0;max-width:75ch}
  .post .more{display:inline-block;margin-top:10px;font-family:var(--mono);font-size:.76rem;color:var(--acc)}
`;

export default function EngLog() {
  return (
    <div className="sec page-top">
      <style>{css}</style>
      <div className="inner">
        <span className="kick"><span className="ac">DZIENNIK INŻYNIERSKI</span> · NOTATKI Z TRENINGU</span>
        <h1>Eng log</h1>
        <p className="intro">
          Surowe notatki z budowy Slayera: recon cudzych receptur, decyzje treningowe, wpadki i liczby.
          Pisane na bieżąco. Wyniki eksperymentów z metrykami lądują w{" "}
          <a href="/eksperymenty">logu eksperymentów</a>; tutaj jest myślenie pomiędzy.
        </p>
        <div className="posts">
          {POSTS.map((p) => (
            <a className="post" key={p.slug} href={`/eng-log/${p.slug}`}>
              <div className="post-meta">
                <span>{p.date}</span>
                {p.tags.map((t) => <span className="post-tag" key={t}>{t}</span>)}
              </div>
              <h2>{p.title}</h2>
              <p>{p.lead}</p>
              <span className="more">czytaj →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
