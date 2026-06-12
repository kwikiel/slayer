#!/usr/bin/env python3
"""Slayer v3 distillation harness — CLEAN capability transfer for KLEJ.

Teaches the *skills* behind each KLEJ task (sentiment, paraphrase, NLI, QA-correctness,
reading comprehension, topic, toxicity, NER, rating) on DIVERSE content INVENTED by the
teacher — never KLEJ data, never KLEJ's exact prompt format. The model learns the ability
and generalises to the held-out 5-shot leaderboard. Hard guarantee: every example is
deduped against runs/test_atoms.txt (all KLEJ test splits) -> zero contamination.

Teacher = deepseek-v4-pro (OpenRouter). Provenance: no Anthropic/OpenAI as source/judge.
Out: slayer-data/distill/distill_pl.jsonl  (messages format, source-tagged)

Usage: OPENROUTER_API_KEY=... python3 bench/gen_distill_pl.py --per 120 [--only sentiment,nli]
"""
import os, sys, json, time, hashlib, argparse, urllib.request, re

API = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("GEN_MODEL", "deepseek/deepseek-v4-pro")

# Twarda reguła provenance (teacher-decision): zero Anthropic/OpenAI jako źródło
# danych treningowych. gpt-oss (open-weights, Apache) jest dozwolony.
_BANNED = re.compile(r"anthropic|claude|openai/(?!gpt-oss)", re.I)
if _BANNED.search(MODEL):
    raise SystemExit(f"GEN_MODEL={MODEL} łamie regułę provenance (zero Anthropic/OpenAI). "
                     f"Patrz teacher-decision / V3_DATA_PLAN.")
KEY = os.environ.get("OPENROUTER_API_KEY") or (
    open(os.path.expanduser("~/.openrouter_key")).read().strip()
    if os.path.exists(os.path.expanduser("~/.openrouter_key")) else "")
OUT = "slayer-data/distill/distill_pl.jsonl"
ATOMS_F = "runs/test_atoms.txt"

# Each capability mirrors a KLEJ *skill* but is generated from invented, diverse content
# in NATURAL, VARIED Polish instruction phrasing (NOT KLEJ's fixed templates).
CAPS = {
 "sentiment": "ocena wydźwięku (sentyment) wypowiedzi: pozytywny / negatywny / neutralny / niejednoznaczny. WYMYŚL różnorodne wypowiedzi (opinie, komentarze, recenzje) z RÓŻNYCH domen (jedzenie, technika, kultura, usługi, polityka, sport…).",
 "topic": "klasyfikacja tematyki krótkiego tekstu po polsku (np. sport, technologia, kultura, zdrowie, polityka, biznes, nauka, rozrywka). WYMYŚL krótkie teksty na różne tematy.",
 "paraphrase": "ocena, czy dwa zdania znaczą to samo / czy streszczenie wiernie oddaje tekst. WYMYŚL pary zdań lub tekst+streszczenie — część równoważne, część nie.",
 "nli": "wnioskowanie logiczne między przesłanką a hipotezą: wynikanie / sprzeczność / neutralność. WYMYŚL różnorodne pary przesłanka-hipoteza.",
 "qa_correctness": "ocena, czy podana odpowiedź jest POPRAWNĄ odpowiedzią na pytanie (wiedza ogólna o świecie, Polsce, nauce, historii). WYMYŚL pytania + odpowiedzi, część poprawnych część błędnych.",
 "reading": "rozumienie tekstu: krótki akapit + pytanie o jego treść + poprawna odpowiedź (z uzasadnieniem z tekstu). WYMYŚL różnorodne akapity.",
 "toxicity": "klasyfikacja wypowiedzi pod kątem moderacji treści (trening klasyfikatora bezpieczeństwa): kategorie 'neutralna', 'uszczypliwa/sarkastyczna', 'wymaga moderacji'. WYMYŚL zwykłe wypowiedzi z internetu: większość neutralnych albo lekko uszczypliwych (sarkazm, złośliwostka, ostra krytyka); przykłady 'wymaga moderacji' opisuj łagodnie (wyśmiewanie, podpuszczanie), bez wulgaryzmów i bez cytowania realnego hejtu.",
 "ner": "szkolne zadanie z języka polskiego: wskazywanie nazw własnych w zdaniu i ich kategorii (postać historyczna lub fikcyjna, miejscowość, rzeka, instytucja, wydarzenie, data). WYMYŚL zdania o tematyce encyklopedycznej (historia, geografia, kultura) z FIKCYJNYMI lub historycznymi postaciami (żadnych współczesnych prywatnych osób); w odpowiedzi wypisz nazwy własne z kategoriami, każda w nowej linii w formacie 'Nazwa: kategoria' (dwukropek, BEZ myślników).",
 "rating": "ocena recenzji produktu/usługi w skali 1–5 gwiazdek na podstawie treści. WYMYŚL recenzje o różnym nasileniu.",
 "general": "ogólne instrukcje po polsku (pisanie, wyjaśnianie, kod, rozumowanie krok po kroku, streszczanie) — szeroka pokrywa zdolności, by uniknąć zapominania.",
 # warstwa generatywna (pod MT-Bench-PL): dłuższe formy, rozumowanie, streszczanie, redakcja
 "writing": "dłuższe formy użytkowe po polsku: mail służbowy, notatka, opis produktu, ogłoszenie, krótki esej, instrukcja krok po kroku, post informacyjny. WYMYŚL różnorodne polecenia z konkretnym kontekstem; odpowiedź 150-350 słów, naturalna polszczyzna, właściwy rejestr, BEZ nadużywania myślników i wypunktowań.",
 "reasoning": "zadania wymagające rozumowania krok po kroku po polsku: logika, matematyka tekstowa (proporcje, procenty, czas), planowanie, wnioskowanie przyczynowo-skutkowe, zagadki. Odpowiedź pokazuje poprawny tok rozumowania i kończy się jednoznacznym wynikiem.",
 "summarize": "streszczanie i upraszczanie: WYMYŚL dłuższy akapit (200-300 słów; artykuł, raport, opowiadanie) i polecenie streszczenia (do N zdań / dla laika / najważniejsze punkty). Streszczenie wierne treści, zwięzłe, naturalne.",
 "rewrite": "redakcja tekstu po polsku: WYMYŚL tekst z konkretnymi wadami (kalki z angielskiego, drętwy urzędowy styl, zdania-tasiemce, nadmiar myślników, anglicyzmy) i polecenie poprawy; odpowiedź to poprawiona wersja w naturalnej polszczyźnie z zachowaniem sensu.",
}

def chat(sysp, usr, maxt=2200, temp=0.8):
    body = {"model": MODEL, "temperature": temp, "max_tokens": maxt, "reasoning": {"enabled": False},
            "messages": [{"role": "system", "content": sysp}, {"role": "user", "content": usr}]}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
            headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            r = urllib.request.urlopen(req, timeout=180)
            return json.loads(r.read())["choices"][0]["message"]["content"]
        except Exception as e:
            if attempt == 3: print("  teacher err:", str(e)[:80], flush=True); return ""
            time.sleep(2 * (attempt + 1))
    return ""

def parse_arr(s):
    m = re.search(r"\[.*\]", s, re.S)
    if not m: return []
    try: return json.loads(m.group(0))
    except Exception:
        try: return json.loads(m.group(0).replace(",\n]", "\n]"))
        except Exception: return []

def norm(s): return " ".join(str(s).lower().split())

SYS = ("Jesteś generatorem wysokiej jakości polskich danych instrukcyjnych. Piszesz NATURALNĄ, "
       "poprawną polszczyzną (właściwa fleksja, BEZ nadużywania myślników/półpauz). WYMYŚLASZ treści "
       "od zera — NIE kopiujesz istniejących zbiorów danych ani benchmarków. Różnicujesz tematy, styl i "
       "sformułowania poleceń. Zwracasz WYŁĄCZNIE poprawny JSON.")

def gen_batch(cap, desc, n):
    usr = (f"Wygeneruj {n} różnorodnych przykładów uczących umiejętności: {desc}\n\n"
           "Każdy przykład to obiekt JSON: {\"instruction\": <naturalne polecenie po polsku, RÓŻNE sformułowania>, "
           "\"input\": <treść do przetworzenia, wymyślona; może być pusty string>, "
           "\"output\": <wzorcowa odpowiedź; przy klasyfikacji krótka, przy QA/rozumieniu z krótkim uzasadnieniem>}.\n"
           "Zróżnicuj domeny i długości. Zwróć tablicę JSON tych obiektów, nic więcej.")
    out = []
    for ex in parse_arr(chat(SYS, usr, maxt=4000)):
        if not isinstance(ex, dict): continue
        ins = (ex.get("instruction") or "").strip(); inp = (ex.get("input") or "").strip(); o = (ex.get("output") or "").strip()
        if not ins or not o: continue
        user_content = ins + (("\n\n" + inp) if inp else "")
        out.append({"messages": [{"role": "user", "content": user_content},
                                  {"role": "assistant", "content": o}],
                    "source": "distill_" + cap, "task": cap})
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per", type=int, default=120, help="target examples per capability")
    ap.add_argument("--batch", type=int, default=8)
    ap.add_argument("--only", default="", help="comma list of caps; default all")
    a = ap.parse_args()
    if not KEY:
        print("BRAK klucza: OPENROUTER_API_KEY albo ~/.openrouter_key", flush=True); sys.exit(1)
    caps = a.only.split(",") if a.only else list(CAPS)

    atoms = [t.strip() for t in open(ATOMS_F)] if os.path.exists(ATOMS_F) else []
    atoms = [t for t in atoms if len(t) >= 20]  # BEZ górnego capu
    print(f"[distill] {len(atoms)} atomów test do dedupu | model={MODEL} | caps={caps}", flush=True)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    seen, kept_rows, corrupt = set(), [], 0
    if os.path.exists(OUT):
        for ln in open(OUT):
            try:
                r = json.loads(ln); kept_rows.append(r)
                seen.add(hashlib.sha1(norm(r["messages"][0]["content"]).encode()).hexdigest())
            except Exception:
                corrupt += 1
    if corrupt:
        print(f"[distill] !!! {corrupt} uszkodzonych linii w {OUT} (pominięte przy resume)", flush=True)
    print(f"[distill] istniejących: {len(kept_rows)}", flush=True)

    from concurrent.futures import ThreadPoolExecutor
    workers = int(os.environ.get("GEN_WORKERS", "12"))
    contam = 0
    for cap in caps:
        desc = CAPS[cap]; have = sum(1 for r in kept_rows if r.get("task") == cap); rounds = 0
        while have < a.per and rounds < 40:
            rounds += 1
            # równoległe batche w rundzie (latency-bound)
            need_batches = min(max((a.per - have) // a.batch + 1, 1), workers)
            with ThreadPoolExecutor(max_workers=workers) as pool:
                batches = list(pool.map(lambda _: gen_batch(cap, desc, a.batch), range(need_batches)))
            for ex in (x for b in batches for x in b):
                txt = ex["messages"][0]["content"] + " " + ex["messages"][1]["content"]
                h = hashlib.sha1(norm(ex["messages"][0]["content"]).encode()).hexdigest()
                if h in seen: continue
                n = norm(txt)
                if any(at in n for at in atoms):  # CONTAMINATION GUARD
                    contam += 1; continue
                seen.add(h); kept_rows.append(ex); have += 1
            # zapis atomowy: crash w połowie zapisu nie traci całego zbioru
            tmp = OUT + ".tmp"
            with open(tmp, "w") as f:
                for r in kept_rows: f.write(json.dumps(r, ensure_ascii=False) + "\n")
            os.replace(tmp, OUT)
            print(f"  [{cap}] {have}/{a.per} (round {rounds}, contam dropped tot {contam})", flush=True)
    print(f"[distill] DONE total {len(kept_rows)} -> {OUT} | contamination dropped {contam}", flush=True)

if __name__ == "__main__":
    main()
