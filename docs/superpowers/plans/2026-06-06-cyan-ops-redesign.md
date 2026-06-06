# Cyan Ops Redesign — Implementation Plan (delta od Amber HUD)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. Uwaga: kroki są ciasno sprzężone (tokeny → strony) — dopuszczalne wykonanie inline w jednej sesji z weryfikacją po każdym tasku.

**Goal:** Przestylizować stronę z Amber HUD na Cyan Ops (klasyczny Arwes) wg speca `docs/superpowers/specs/2026-06-06-cyan-ops-redesign-design.md`.

**Architecture:** Delta na gałęzi `redesign-cyan-ops` (od `BrunatnyCzar`): rewrite wartości w `assets/lab.css`, czyszczenie terminalowych detali w `index.html`, mechaniczne sedy na podstronach. `site.js` bez zmian.

**Tech Stack:** czysty CSS + istniejący vanilla JS; Google Fonts (Titillium Web, IBM Plex Mono); `npx serve -l 8000` (czyste URL-e).

**Wzorzec:** `docs/superpowers/specs/2026-06-06-cyan-ops-preview.html`.

---

### Task 1: `assets/lab.css` — wartości i detale Cyan Ops

- [ ] Przepisz tokeny `:root` wg tabeli ze speca (w tym `--sec`/`--sec-soft`; `--dim:#5f8489`; fonty Titillium+Plex Mono; import bez Share Tech Mono).
- [ ] Body na `var(--sans)` 16px/1.62; `.kick::before` → `"▸ "`; usuń `.cell .n::before`; nav active bez nawiasów (glow); `.ncta` i `.brand .mk` z `clip-path`; `.btn*` ścięte rogi wg podglądu; wszystkie `dashed` → `solid`; `.phero` siatka 24px zamiast scanlines (`::after` z dwóch linear-gradientów); `.panel::after` (scanlines) usunięte; `.vb.q`/`.track i.q` na `--sec`; `.live` na `--acc`; `@keyframes pl` na łagodne (`50%{opacity:.3}` ease); stopka bez promptu; usuń regułę `.cursor`; reduced-motion bez `.cursor`.
- [ ] Verify: `grep -c 'Share Tech\|ffb000\|ff5a26\|dashed\|cursor\|slayer@lab' assets/lab.css` → 0; `grep -c '00f8ff' assets/lab.css` ≥ 1; `grep -c -- '--sec' assets/lab.css` ≥ 4; curl `http://localhost:8000/` → 200.
- [ ] Commit: `redesign: lab.css — Cyan Ops (klasyczny Arwes): tokeny, Titillium, siatka, bez terminalowych detali`

### Task 2: `index.html` — czyszczenie detali + cyjan

- [ ] Usuń `<span class="cursor"></span>` z h1; usuń linię `.hmeta span::before{content:"["}.hmeta span::after{content:"]"}`.
- [ ] `.hero::after`: scanlines → `background-image:linear-gradient(rgba(0,248,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,248,255,.045) 1px,transparent 1px);background-size:24px 24px` (reszta deklaracji bez zmian).
- [ ] `.hero h1`: `font-size:clamp(2.4rem,5.4vw,4rem)`, `letter-spacing:.03em`; swap `rgba(255,176,0,…)` → `rgba(0,248,255,…)` w h1/em/dot (sed w Task 3 i tak złapie — wystarczy sed).
- [ ] JS `upd()`: `$("lq-v").style.color=q>b?"var(--acc)":""` → `"var(--sec)"`.
- [ ] Verify: `grep -c 'cursor\|hmeta span' index.html` → 0; curl 200.
- [ ] Commit: `redesign: index — Cyan Ops (bez kursora/nawiasów, siatka w hero, Qwen=sec)`

### Task 3: podstrony — sedy

- [ ] `sed -i '' 's/255,176,0/0,248,255/g' index.html benchmarks.html kierunki.html roadmap.html trening.html zespol.html progress.html`
- [ ] `sed -i '' 's/#ffc94d/#7ffcff/g; s/rgba(11,7,0,.65)/rgba(2,12,16,.65)/g' progress.html`
- [ ] Verify: `grep -rn '255,176,0\|ffc94d' *.html` → pusto; 11×curl czyste URL-e → 200.
- [ ] Commit: `redesign: podstrony — cyjan zamiast bursztynu (sedy)`

### Task 4: weryfikacja końcowa

- [ ] Kontrast (skrypt z planu bazowego, pary: `b8d4d8/020c10`, `00f8ff/020c10`, `7fa3a9/06181f`, `5f8489/020c10`, `ffd76e/020c10`, `ff6b5e/020c10`, `021114/00f8ff`) — wszystkie ≥4.5:1.
- [ ] Przegląd wzrokiem 11 stron vs podgląd; poprawki → commity `redesign: fix — …`.
- [ ] `git status --short` → pusto.

---

## Faza 2 — efekty Arwes (zatwierdzone: decipher, rysowanie ramek, canvas hero)

### Task 5: lab.css — rysowanie ramek + pozycja canvasa
- [ ] W bloku `prefers-reduced-motion:no-preference`: `.panel .cnr{transition:width .45s ease .25s,height .45s ease .25s}`, `.panel.rev:not(.in) .cnr{width:0;height:0}`, `.panel{transition:border-color .6s ease .1s}` w obrębie reguł `.rev`, `.panel.rev:not(.in){border-color:transparent}` — narożniki rosną, ramka wyłania się przy wejściu. Stan docelowy = stan bazowy, więc zdjęcie `.rev`/`.in` po transitionend nie powoduje skoku.
- [ ] `.hero-fx{position:absolute;inset:0;z-index:0;pointer-events:none}` (canvas pod treścią hero; `.hgrid` ma z-index:1).
- [ ] Verify: braces zbalansowane, `curl /` 200. Commit.

### Task 6: site.js — decipher + canvas MovingLines
- [ ] `decipher(el)`: TreeWalker po text nodes (zachowuje `<em>`), ~40 kroków co 30 ms, znaki locked rosnąco od lewej, spacje nieruszane, na końcu przywrócenie oryginału. Gated: reduced-motion → skip.
- [ ] Trigger: osobny IntersectionObserver na `h1, .shead h2` (threshold .2, once). Progressive enhancement: bez JS tekst po prostu stoi.
- [ ] `heroFx()`: canvas wstrzykiwany jako pierwsze dziecko `.hero` (tylko index), 26 pionowych linii dryfujących w górę (gradientowe końce, alpha .04–.16, prędkość .4–1.5), DPR≤2, resize handler, rAF (auto-pauza w ukrytej karcie). Gated: reduced-motion → brak canvasa.
- [ ] Verify: `node --check`, 11×200, reduced-motion: brak canvasa, brak decipheru, treść widoczna. Commit.
