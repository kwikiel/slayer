import { notFound } from "next/navigation";
import { POSTS } from "../posts";
import { MdLite } from "../md";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return { title: `${post.title} | Eng log | Slayer`, description: post.lead };
}

const css = `
  .crumb{font-family:var(--mono);font-size:.76rem}.crumb a{color:var(--acc);text-decoration:none}
  article h1{font-family:var(--serif);font-weight:400;font-size:clamp(1.8rem,4vw,2.6rem);letter-spacing:-.015em;margin:12px 0 8px;max-width:26ch}
  .post-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-family:var(--mono);font-size:.74rem;color:var(--dim);margin-bottom:26px}
  .post-tag{padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.04);border:1px solid var(--line)}
  .lead{font-family:var(--serif);font-size:1.15rem;line-height:1.6;color:var(--mut);max-width:68ch;border-left:2px solid var(--acc);padding-left:16px;margin:0 0 26px}
  .body{max-width:72ch}
  .body h2{font-family:var(--serif);font-weight:400;font-size:1.5rem;color:var(--ink);margin:34px 0 10px;letter-spacing:-.01em}
  .body p{color:var(--mut);font-size:.95rem;line-height:1.65;margin:0 0 14px}
  .body ul{margin:0 0 14px;padding-left:20px;display:grid;gap:7px}
  .body li{color:var(--mut);font-size:.95rem;line-height:1.55}
  .body b{color:var(--ink);font-weight:600}
  .body a{color:var(--acc)}
  .body code{font-family:var(--mono);font-size:.84em;background:rgba(255,255,255,.05);border:1px solid var(--line2);border-radius:4px;padding:1px 5px}
  .body pre{background:rgba(0,0,0,.32);border:1px solid var(--line2);border-radius:8px;padding:14px 16px;overflow-x:auto;margin:0 0 14px}
  .body pre code{background:none;border:none;padding:0;font-size:.78rem;line-height:1.5;color:var(--txt);white-space:pre}
`;

export default async function Post({ params }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <div className="sec page-top">
      <style>{css}</style>
      <div className="inner">
        <span className="crumb"><a href="/eng-log">← eng log</a></span>
        <article>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span>{post.date}</span>
            {post.tags.map((t) => <span className="post-tag" key={t}>{t}</span>)}
          </div>
          <p className="lead">{post.lead}</p>
          <div className="body"><MdLite src={post.body} /></div>
        </article>
      </div>
    </div>
  );
}
