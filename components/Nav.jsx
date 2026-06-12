"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

const GROUPS = [
  {
    label: "protokół",
    links: [
      ["/kierunki", "kierunki modelu"],
      ["/propozycja", "propozycja v3"],
      ["/v3", "miks danych v3"],
      ["/rules", "zasady"],
      ["/roadmap", "harmonogram"],
      ["/drabina", "drabina kontrybutora"],
    ],
  },
  {
    label: "dane & trening",
    links: [
      ["/datasety", "datasety"],
      ["/trening", "trening"],
      ["/styl", "styl"],
      ["/zadania", "zadania"],
      ["/wiedza", "wiedza (CPT)"],
    ],
  },
  {
    label: "benchmarki",
    links: [
      ["/leaderboard", "leaderboard"],
      ["/benchmarks", "metodologia"],
      ["/bench-explorer", "przeglądarka + zgłoszenia"],
      ["/closed-benchmarks", "benchmarki zamknięte"],
      ["/progress", "pomiar na żywo"],
      ["/eksperymenty", "log eksperymentów"],
    ],
  },
  {
    label: "bielik",
    links: [
      ["/bielik-dane", "dane treningowe"],
      ["/bielik-benchmarki", "benchmarki v3"],
    ],
  },
  {
    label: "zespół",
    links: [
      ["/team", "zespół"],
      ["/zespol", "dołącz"],
    ],
  },
];

export default function Nav() {
  const pathname = (usePathname() || "/").replace(/\/+$/, "") || "/";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="nav">
      <a className="brand" href="/" onClick={close}>
        <span className="mk">S</span>slayer<span className="sl">·</span>protocol
      </a>
      <button
        className="navtoggle"
        aria-label="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={open ? "nlinks open" : "nlinks"}>
        {GROUPS.map((g) => {
          const active = g.links.some(([href]) => href === pathname);
          return (
            <div className={active ? "navgroup active" : "navgroup"} key={g.label}>
              <span className="navtop">{g.label}</span>
              <div className="navmenu">
                {g.links.map(([href, label]) => (
                  <a key={href} className={pathname === href ? "active" : ""} href={href} onClick={close}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
        <a className="ncta" href="https://discord.gg/HnTkVR4c5T" rel="noopener" target="_blank" onClick={close}>
          wejście →
        </a>
      </nav>
    </header>
  );
}
