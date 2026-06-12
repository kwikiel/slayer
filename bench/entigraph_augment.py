#!/usr/bin/env python3
"""EntiGraph-style synthetic augmentation for the Slayer v2 knowledge-adapter (Stanford 2024).

Take a small source corpus (Polish Wikipedia), and for each chunk: extract entities, then generate
DIVERSE grounded synthetic text — entity-relation statements, paraphrases, summaries, QA — that
re-expresses the chunk's knowledge many ways. The union is a much larger synthetic corpus whose
closed-book-QA value scales ~log-linearly with synthetic tokens (EntiGraph). Output = plain-text
docs for QLoRA continued-pretraining (the knowledge adapter), NOT chat/SFT.

Provenance: generation by an OPEN teacher via GEN_MODEL (default deepseek-v4-pro; the bulk corpora
on disk were generated with deepseek-v4-flash — per-row lineage in the "gen_model" field is the
source of truth, not this docstring). No Anthropic/OpenAI. No per-item judge (this is unsupervised
CPT text; faithfulness is enforced by grounding the prompt in the source — spot-check a sample with
verify_external_sft-style judging before scaling up).

Usage: entigraph_augment.py [target_M_tokens] [out.jsonl]
Env: OPENROUTER_API_KEY/~/.openrouter_key; GEN_MODEL, GEN_WORKERS.
"""
import hashlib, json, re, sys, os, time
from concurrent.futures import ThreadPoolExecutor
import urllib.request

API = "https://openrouter.ai/api/v1/chat/completions"
TEACHER = os.environ.get("GEN_MODEL", "deepseek/deepseek-v4-pro")
if re.search(r"anthropic|claude|openai/(?!gpt-oss)", TEACHER, re.I):
    raise SystemExit(f"GEN_MODEL={TEACHER} łamie regułę provenance (zero Anthropic/OpenAI).")
KEY = os.environ.get("OPENROUTER_API_KEY") or (open(os.path.expanduser("~/.openrouter_key")).read().strip()
        if os.path.exists(os.path.expanduser("~/.openrouter_key")) else "")
ERRS = {"chat_fail": 0, "future_fail": 0}  # widoczność cichych strat generacji
WORKERS = int(os.environ.get("GEN_WORKERS", "10"))
TARGET_TOKENS = (float(sys.argv[1]) if len(sys.argv) > 1 else 5.0) * 1_000_000   # default 5M (smoke)
OUT = sys.argv[2] if len(sys.argv) > 2 else "slayer-data/knowledge/entigraph_pl.jsonl"
approx_tokens = lambda s: max(1, len(s) // 4)   # ~4 chars/token (PL)

def chat(sysp, usr, maxt=1200, temp=0.7):
    body = {"model": TEACHER, "temperature": temp, "max_tokens": maxt, "reasoning": {"enabled": False},
            "messages": [{"role": "system", "content": sysp}, {"role": "user", "content": usr}]}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY,
                     "HTTP-Referer": "https://slayer.fabryka.ai", "X-Title": "Slayer-EntiGraph"})
    for a in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return re.sub(r"<think>.*?</think>", "", json.loads(r.read())["choices"][0]["message"]["content"], flags=re.S).strip()
        except Exception:
            if a == 3:
                ERRS["chat_fail"] += 1
                return ""
            time.sleep(3)

# Prompty UTWARDZONE (2026-06-12): spot-check wykazał konfabulację w generacji swobodnej
# (flash 20.5-74.5%, pro 33.5-36.5% niewiernych; kind=relation najgorszy). Twarda zasada:
# każdy fakt MUSI wynikać wprost z fragmentu — lepiej napisać mniej niż dodać cokolwiek.
GROUND = ("TWARDA ZASADA: każde zdanie musi wynikać WPROST z podanego fragmentu. NIE dodawaj "
          "żadnych dat, liczb, nazw, tytułów ani związków spoza fragmentu, NAWET JEŚLI je znasz "
          "i są prawdziwe. Jeśli fragment nie zawiera dość informacji, napisz mniej albo pomiń. ")
REL_SYS = ("Jesteś autorem rzetelnych polskich tekstów encyklopedycznych. " + GROUND +
           "Z podanego fragmentu: (1) wybierz encje (osoby, miejsca, organizacje, pojęcia, daty); "
           "(2) dla 2-4 PAR encji, których związek fragment OPISUJE WPROST, napisz po jednym "
           "zwięzłym akapicie wyjaśniającym ten związek wyłącznie słowami faktów z fragmentu; "
           "pary bez opisanego związku POMIŃ. "
           "Zwróć każdy akapit po linii '### AKAPIT', bez innych nagłówków i bez markdownu w treści.")
PARA_SUM_SYS = ("Jesteś autorem rzetelnych polskich tekstów encyklopedycznych. " + GROUND +
                "Na podstawie WYŁĄCZNIE poniższego fragmentu zwróć dwie rzeczy: "
                "po linii '### PARAFRAZA' przeredagowany własnymi słowami fragment (wszystkie fakty i nazwy "
                "zachowane, ŻADNYCH nowych, naturalna współczesna polszczyzna, bez kalk i markdownu), "
                "a po linii '### STRESZCZENIE' streszczenie w 2-4 zdaniach.")
QA_SYS = ("Jesteś autorem rzetelnych polskich tekstów encyklopedycznych. " + GROUND +
          "Na podstawie WYŁĄCZNIE fragmentu ułóż 5 pytań i odpowiedzi, przy czym ODPOWIEDŹ ma być "
          "w całości zawarta we fragmencie (wiedza zamknięta, pytania samodzielne, bez odwołań do "
          "'fragmentu/tekstu'). Format: 'Pytanie: ...\\nOdpowiedź: ...' — każda para w nowej linii.")

# Inline filtr wierności (FAITH_FILTER=1): sędzia ocenia każdy dok vs fragment źródłowy,
# zostają tylko 'wierny'/'drobne' — korpus wierny z konstrukcji. Koszt: +1 wywołanie/dok.
FAITH_FILTER = os.environ.get("FAITH_FILTER", "") == "1"
FAITH_JUDGE = os.environ.get("FAITH_JUDGE", "qwen/qwen3.5-122b-a10b")
if re.search(r"anthropic|claude|openai/(?!gpt-oss)", FAITH_JUDGE, re.I):
    raise SystemExit(f"FAITH_JUDGE={FAITH_JUDGE} łamie regułę provenance.")
# UWAGA (zmierzono 2026-06-12): ocena wsadowa (3-7 tekstów/wywołanie) ROZMYWA rygor sędziego
# (14-21% niewiernych przechodziło mimo progu 5%; test-retest sędziego per-dok: 1/100 flipów).
# Dlatego filtr = pojedyncze wywołanie per dok, DOKŁADNIE ten sam format co spotcheck_entigraph.
FAITH_SYS = ("Jesteś surowym weryfikatorem wierności źródłu. Dostajesz ŹRÓDŁO (fragmenty artykułu) "
             "i TEKST SYNTETYCZNY wygenerowany na jego podstawie. Oceń, czy KAŻDY fakt z tekstu "
             "syntetycznego wynika ze źródła: 'wierny' = wszystko wynika; 'drobne' = nieistotne "
             "przeformułowania/oczywistości spoza źródła; 'niewierny' = fakty sprzeczne ze źródłem "
             "albo konkretne twierdzenia (daty, liczby, nazwy, związki), których w źródle nie ma. "
             "Zwróć WYŁĄCZNIE JSON: {\"wiernosc\":\"wierny|drobne|niewierny\",\"uwaga\":\"<=12 słów\"}")


def faithful(src, syn):
    body = {"model": FAITH_JUDGE, "temperature": 0.0, "max_tokens": 120, "reasoning": {"enabled": False},
            "messages": [{"role": "system", "content": FAITH_SYS},
                         {"role": "user", "content": f"ŹRÓDŁO:\n{src[:5000]}\n\nTEKST SYNTETYCZNY:\n{syn[:2500]}"}]}
    req = urllib.request.Request(API, data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY})
    for a in range(3):
        try:
            c = json.loads(urllib.request.urlopen(req, timeout=120).read())["choices"][0]["message"]["content"]
            m = re.search(r"\{.*\}", c, re.S)
            if m:
                return json.loads(m.group(0)).get("wiernosc") in ("wierny", "drobne")
        except Exception:
            time.sleep(2 * (a + 1))
    ERRS["chat_fail"] += 1
    return False  # brak werdyktu = nie przepuszczamy

ATOMS_F = "runs/test_atoms.txt"
_atoms = []
if os.path.exists(ATOMS_F):
    _atoms = [t.strip() for t in open(ATOMS_F, encoding="utf-8")]
    _atoms = [t for t in _atoms if len(t) >= 20]  # BEZ górnego capu
_norm = lambda s: " ".join(str(s).lower().split())
def contaminated(s):
    n = _norm(s)
    return any(a in n for a in _atoms)

# PL_FOCUS=1 -> tylko artykuły o Polsce (długi ogon: regionalia, prawo, kultura, historia PL)
PL_FOCUS = os.environ.get("PL_FOCUS", "") == "1"
PL_PAT = re.compile(
    r"\b(Polsk|Polak|Rzeczypospolit|Rzeczpospolit|wojewódz|powiat|gmin[aiy]|Sejm|Senat RP|"
    r"ustaw[aiy]|kodeks|Warszaw|Krak[oó]w|Gda[ńn]sk|Wroc[łl]aw|Pozna[ńn]|[ŁL][oó]d[źz]|Szczecin|"
    r"Lublin|Katowic|Bia[łl]ystok|Mazowsz|Ma[łl]opolsk|Wielkopolsk|Pomorz|[ŚS]l[ąa]sk|Podlasi|"
    r"Podkarpaci|Kaszub|G[oó]ral|Mazur|Warmi|Kujaw|piastows|jagiello[ńn]s|PRL|Solidarno[śs][ćc])",
    re.I)

SRC_FILE = os.environ.get("SRC_FILE", "")  # lokalny korpus JSONL {"text","title"} zamiast Wikipedii

_sha = lambda s: hashlib.sha1(s.encode()).hexdigest()


def passages(done_shas=frozenset(), legacy_titles=frozenset()):
    """Resume per AKAPIT (src_sha), nie per tytuł — tytuł ma wiele akapitów i skip
    po tytule gubił resztę. legacy_titles: stare rekordy bez src_sha (skip po tytule)."""
    if SRC_FILE:
        for ln in open(SRC_FILE, encoding="utf-8"):
            try: r = json.loads(ln)
            except Exception: continue
            txt, title = (r.get("text") or "").strip(), r.get("title", "")
            if _sha(txt) in done_shas or title in legacy_titles \
                    or not (300 <= len(txt) <= 2000) or contaminated(txt):
                continue
            yield txt, title
        return
    from datasets import load_dataset
    ds = load_dataset("wikimedia/wikipedia", "20231101.pl", split="train", streaming=True)
    for r in ds:
        txt = (r.get("text") or "").strip()
        title = r.get("title", "")
        if title in legacy_titles:
            continue
        if PL_FOCUS and not PL_PAT.search(title + " " + txt[:800]):
            continue
        # take a few substantial paragraphs per article
        paras = [p.strip() for p in txt.split("\n") if 400 <= len(p.strip()) <= 1800]
        for p in paras[:3]:
            if _sha(p) in done_shas or contaminated(p):
                continue
            yield p, title

def explode(item):
    """One source chunk -> grounded synthetic docs in 3 batched calls (latency-bound -> batched)."""
    para, title = item
    usr = f"Fragment ({title}):\n{para}"
    out = []
    rel = chat(REL_SYS, usr, maxt=1400)
    for t in re.split(r"###\s*AKAPIT\s*", rel):
        t = t.strip()
        if len(t) > 60: out.append((t, "relation"))
    ps = chat(PARA_SUM_SYS, usr, maxt=1200)
    m = re.split(r"###\s*(PARAFRAZA|STRESZCZENIE)\s*", ps)
    for i in range(1, len(m) - 1, 2):
        t = m[i + 1].strip()
        if len(t) > 40: out.append((t, "paraphrase" if m[i] == "PARAFRAZA" else "summary"))
    qa = chat(QA_SYS, usr, maxt=1300)
    if len(qa) > 60: out.append((qa, "qa"))
    docs = [{"text": t, "kind": k, "source_title": title, "src_sha": _sha(para),
             "gen_model": TEACHER}
            for t, k in out if not contaminated(t)]
    if FAITH_FILTER:
        verdicts = [faithful(para, d["text"]) for d in docs]
        kept = []
        for d, ok in zip(docs, verdicts):
            if ok:
                d["faith_judge"] = FAITH_JUDGE
                kept.append(d)
            else:
                ERRS["unfaithful_dropped"] = ERRS.get("unfaithful_dropped", 0) + 1
        return kept
    return docs

def main():
    if not KEY: print("BRAK klucza OpenRouter"); sys.exit(1)
    os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
    from collections import Counter
    kinds = Counter(); tok = 0; ndoc = 0; done_shas = set(); legacy_titles = set()
    if os.path.exists(OUT):  # resume: doliczamy istniejące, pomijamy przerobione AKAPITY
        for ln in open(OUT, encoding="utf-8"):
            try: d = json.loads(ln)
            except Exception: continue
            tok += approx_tokens(d.get("text", "")); ndoc += 1
            kinds[d.get("kind", "?")] += 1
            if d.get("src_sha"):
                done_shas.add(d["src_sha"])
            else:  # stare rekordy bez src_sha: skip po tytule (zachowanie historyczne)
                legacy_titles.add(d.get("source_title", ""))
        print(f"  resume: {ndoc} docs / ~{tok/1e6:.2f}M tok / "
              f"{len(done_shas)} akapitów + {len(legacy_titles)} tytułów legacy", flush=True)
    src = passages(done_shas, legacy_titles); t0 = time.time(); tok0 = tok
    print(f"EntiGraph augment -> target ~{TARGET_TOKENS/1e6:.0f}M tokens | teacher={TEACHER} | {WORKERS} workers", flush=True)
    from concurrent.futures import FIRST_COMPLETED, wait
    last_report = 0
    with open(OUT, "a", encoding="utf-8") as f, ThreadPoolExecutor(max_workers=WORKERS) as ex:
        pending = set()
        exhausted = False
        while tok < TARGET_TOKENS and (pending or not exhausted):
            # rolling window: dosypujemy do pełna, żaden straggler nie blokuje reszty
            while not exhausted and len(pending) < WORKERS:
                try: pending.add(ex.submit(explode, next(src)))
                except StopIteration: exhausted = True; break
            if not pending: break
            done, pending = wait(pending, return_when=FIRST_COMPLETED)
            for fut in done:
                try: docs = fut.result()
                except Exception:
                    ERRS["future_fail"] += 1
                    continue
                for d in docs:
                    f.write(json.dumps(d, ensure_ascii=False) + "\n")
                    tok += approx_tokens(d["text"]); ndoc += 1; kinds[d["kind"]] += 1
            f.flush()
            if ndoc - last_report >= 200:
                last_report = ndoc
                rate = (tok - tok0) / max(time.time() - t0, 1)
                print(f"  ~{tok/1e6:.2f}M tok / {ndoc} docs ({rate:.0f} tok/s marginalnie, {time.time()-t0:.0f}s) {dict(kinds)}", flush=True)
    print(f"\nDONE ~{tok/1e6:.2f}M tokens, {ndoc} synthetic docs -> {OUT}", flush=True)
    print(f"  kinds: {dict(kinds)}", flush=True)
    if any(ERRS.values()):
        print(f"  !!! straty generacji: {ERRS} (nieudane wywołania teachera / taski)", flush=True)

if __name__ == "__main__":
    main()
