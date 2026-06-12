export const metadata = {
  title: "Zespół — Slayer",
  description: "Ludzie budujący Slayer — applied research lab dla polskich modeli językowych.",
};

const css = `
    .phero { padding-top: 100px; padding-bottom: 38px; }
    .sec.tight { padding-top: 28px; padding-bottom: 48px; }

    .hero-lead {
      font-size: clamp(1.05rem, 1.6vw, 1.22rem);
      color: var(--mut);
      max-width: 58ch;
      line-height: 1.65;
      margin-top: 20px;
    }
    .hero-lead em { color: var(--txt); font-style: italic; }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: clamp(12px, 2vw, 20px);
      margin-top: 24px;
    }

    .member {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .av {
      width: 100%;
      aspect-ratio: 3 / 4;
      border-radius: var(--rad);
      background: linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.012)), var(--bg2);
      border: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .av img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
    .av-init {
      font-family: var(--serif);
      font-size: 4.5rem;
      font-weight: 300;
      color: var(--acc);
      opacity: .28;
      letter-spacing: -.02em;
      user-select: none;
    }

    .member-info {}
    .member-title-label {
      font-family: var(--mono);
      font-size: .68rem;
      letter-spacing: .13em;
      text-transform: uppercase;
      color: var(--acc);
      margin-bottom: 8px;
    }
    .member-name {
      font-family: var(--serif);
      font-size: clamp(1.7rem, 3vw, 2.2rem);
      font-weight: 400;
      letter-spacing: -.02em;
      line-height: 1.05;
      margin: 0 0 4px;
    }
    .member-specialty {
      font-family: var(--mono);
      font-size: .75rem;
      color: var(--dim);
      letter-spacing: .04em;
      margin-bottom: 12px;
    }
    .member-bio {
      font-size: .95rem;
      color: var(--mut);
      line-height: 1.65;
      margin: 0;
    }

    /* CTA section */
    .join-cta {
      margin-top: clamp(56px, 8vw, 96px);
      padding: clamp(36px, 5vw, 56px);
      border: 1px solid var(--line);
      border-radius: var(--rad);
      background: linear-gradient(180deg, rgba(199,148,72,.06), rgba(255,255,255,.012)), var(--panel);
      box-shadow: 0 22px 60px rgba(0,0,0,.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
      flex-wrap: wrap;
    }
    .join-cta h2 {
      font-family: var(--serif);
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 400;
      letter-spacing: -.015em;
      margin: 0 0 8px;
    }
    .join-cta p {
      margin: 0;
      color: var(--mut);
      font-size: .96rem;
      max-width: 48ch;
    }
`;

const MEMBERS = [
  { img: "/assets/team/kacper-wikiel.png", name: "Kacper Wikieł", specialty: "ML · Infrastruktura", bio: "ML, infrastruktura treningowa i optymalizacja modeli." },
  { img: "/assets/team/kamil-dzieniszewski.jpeg", name: "Kamil Dzieniszewski", specialty: "Frontend · Produkt", bio: "Frontend, doświadczenie produktowe i narzędzia deweloperskie." },
  { img: "/assets/team/piotr-nalepa.webp", name: "Piotr Nalepa", specialty: "Fullstack · Narzędzia developerskie", bio: "Fullstack, zarządzanie projektem i tworzenie narzędzi dla developerów." },
  { img: "/assets/team/piotr-rozek.jpeg", name: "Piotr Rożek", specialty: "Python · Fizyka", bio: "Fizyk z wykształcenia, Python developer, człowiek renesansu." },
  { img: "/assets/team/piotr-styla.webp", name: "Piotr Styła", specialty: "Rekrutacja · Agenci LLM", bio: "Za dnia rekrutuje i onboarduje talenty, po zmroku LLM Slayer: buduje zespoły agentów (call center dla branży medycznej) oraz aplikacje webowe i na Androida. AGH." },
  { img: "/assets/team/bartlomiej-boczylo.jpg", name: "Bartłomiej Boczyło", specialty: "ML · Frontend", bio: "Student II roku inżynierii AI. Frontend dev, rozwija się w ML/DL, CV, NLP, RL i modelach generatywnych. Stack: Python, TensorFlow, PyTorch, MLOps." },
  { img: "/assets/team/kuba6.jpg", name: "Kuba", specialty: "AI Engineer · Fullstack", bio: "Fizyk-teoretyk z wykształcenia. AI Engineer w projekcie onkologicznym (CV), ostatnie 2 lata w GenAI i agentach. Chce trenować LLM, robi datasety i benchmarki." },
];

export default function Team() {
  return (
    <>
      <style>{css}</style>
      <section className="phero">
        <div className="inner">
          <span className="kick">zespół · operatorzy protokołu</span>
          <h1>Ludzie przy<br /><em>warsztacie</em></h1>
          <p className="hero-lead">
            Slayer to praktyczne laboratorium modeli. Każda osoba tutaj zostawia
            ślad w danych, treningu, ewaluacji albo infrastrukturze. Mniej manifestu,
            więcej pomiaru.
          </p>
        </div>
      </section>

      <section className="sec tight">
        <div className="inner">
          <div className="team-grid">
            {MEMBERS.map((m) => (
              <article className="member" key={m.name}>
                <div className="av">
                  <img src={m.img} alt={m.name} />
                </div>
                <div className="member-info">
                  <div className="member-title-label">Member of Technical Staff</div>
                  <h2 className="member-name">{m.name}</h2>
                  <div className="member-specialty">{m.specialty}</div>
                  <p className="member-bio">{m.bio}</p>
                </div>
              </article>
            ))}

            <article className="member">
              <a href="/zespol" style={{ display: "block", textDecoration: "none" }}>
                <div className="av" style={{ borderStyle: "dashed", borderColor: "var(--line)", background: "transparent", transition: ".18s" }}>
                  <span style={{ fontSize: "2rem", color: "var(--dim)", lineHeight: 1 }}>+</span>
                </div>
              </a>
              <div className="member-info">
                <div className="member-title-label">Member of Technical Staff</div>
                <h2 className="member-name" style={{ color: "var(--dim)" }}>Twoje imię tutaj</h2>
                <div className="member-specialty">Twój stack · Twoja domena</div>
                <p className="member-bio"><a href="https://discord.gg/HnTkVR4c5T" target="_blank" rel="noopener" style={{ color: "var(--acc)" }}>Dołącz do zespołu →</a></p>
              </div>
            </article>
          </div>

          <div className="join-cta">
            <div>
              <h2>Wejście do warsztatu</h2>
              <p>Szukamy ludzi, którzy potrafią domykać artefakty: kod, dane, evale, infra, dokumentację. Governance projektu opisują <a href="/rules" style={{ color: "var(--acc)" }}>rules</a>.</p>
            </div>
            <a className="btn btn-p" href="https://discord.gg/HnTkVR4c5T" target="_blank" rel="noopener">wejście przez Discord →</a>
          </div>
        </div>
      </section>
    </>
  );
}
