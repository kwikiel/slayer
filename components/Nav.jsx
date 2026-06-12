"use client";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/propozycja", "propozycja v3"],
  ["/kierunki", "kierunki"],
  ["/trening", "trening"],
  ["/styl", "styl"],
  ["/eksperymenty", "log"],
  ["/rules", "rules"],
  ["/zadania", "zadania"],
  ["/datasety", "datasety"],
  ["/bielik-dane", "dane bielika"],
  ["/bielik-benchmarki", "benchmarki bielika"],
  ["/wiedza", "wiedza"],
  ["/v3", "v3"],
  ["/leaderboard", "leaderboard"],
  ["/bench-explorer", "benchmarki"],
  ["/progress", "na żywo"],
  ["/team", "zespół"],
];

export default function Nav() {
  const pathname = (usePathname() || "/").replace(/\/+$/, "") || "/";
  return (
    <header className="nav">
      <a className="brand" href="/">
        <span className="mk">S</span>slayer<span className="sl">·</span>protocol
      </a>
      <nav className="nlinks">
        {LINKS.map(([href, label]) => (
          <a key={href} className={pathname === href ? "active" : ""} href={href}>
            {label}
          </a>
        ))}
        <a className="ncta" href="https://discord.gg/HnTkVR4c5T" rel="noopener" target="_blank">
          wejście →
        </a>
      </nav>
    </header>
  );
}
