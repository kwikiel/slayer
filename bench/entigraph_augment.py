#!/usr/bin/env python3
"""EntiGraph-style synthetic augmentation for the Slayer v2 knowledge-adapter (Stanford 2024).

Take a small source corpus (Polish Wikipedia), and for each chunk: extract entities, then generate
DIVERSE grounded synthetic text — entity-relation statements, paraphrases, summaries, QA — that
re-expresses the chunk's knowledge many ways. The union is a much larger synthetic corpus whose
closed-book-QA value scales ~log-linearly with synthetic tokens (EntiGraph). Output = plain-text
docs for QLoRA continued-pretraining (the knowledge adapter), NOT chat/SFT.

Provenance: generation by the OPEN teacher (deepseek-v4-pro, MIT). No Anthropic/OpenAI. No per-item
judge (this is unsupervised CPT text; faithfulness is enforced by grounding the prompt in the source).

Usage: entigraph_augment.py [target_M_tokens] [out.jsonl]
Env: OPENROUTER_API_KEY/~/.openrouter_key; GEN_MODEL, GEN_WORKERS.
"""
import json, re, sys, os, time
from concurrent.futures import ThreadPoolExecutor
import urllib.request

API = "https://openrouter.ai/api/v1/chat/completions"
TEACHER = os.environ.get("GEN_MODEL", "deepseek/deepseek-v4-pro")
KEY = os.environ.get("OPENROUTER_API_KEY") or (open(os.path.expanduser("~/.openrouter_key")).read().strip()
        if os.path.exists(os.path.expanduser("~/.openrouter_key")) else "")
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
            if a == 3: return ""
            time.sleep(3)

REL_SYS = ("Jesteś autorem rzetelnych polskich tekstów encyklopedycznych. Z podanego fragmentu: "
           "(1) wybierz 4-8 najważniejszych encji (osoby, miejsca, organizacje, pojęcia, daty); "
           "(2) dla 3-4 PAR encji napisz po jednym zwięzłym, faktograficznie wiernym akapicie "
           "wyjaśniającym ich związek WYŁĄCZNIE na podstawie fragmentu. Nie zmyślaj. "
           "Zwróć każdy akapit po linii '### AKAPIT', bez innych nagłówków i bez markdownu w treści.")
PARA_SUM_SYS = ("Na podstawie WYŁĄCZNIE poniższego fragmentu zwróć dwie rzeczy: "
                "po linii '### PARAFRAZA' przeredagowany własnymi słowami fragment (wszystkie fakty i nazwy "
                "zachowane, naturalna współczesna polszczyzna, bez kalk i markdownu), "
                "a po linii '### STRESZCZENIE' streszczenie w 2-4 zdaniach.")
QA_SYS = ("Na podstawie WYŁĄCZNIE fragmentu ułóż 5 pytań i wyczerpujące odpowiedzi (wiedza zamknięta, "
          "pytania samodzielne, bez odwołań do 'fragmentu/tekstu'). "
          "Format: 'Pytanie: ...\\nOdpowiedź: ...' — każda para w nowej linii. Nie zmyślaj.")

ATOMS_F = "runs/test_atoms.txt"
_atoms = []
if os.path.exists(ATOMS_F):
    _atoms = [t.strip() for t in open(ATOMS_F, encoding="utf-8")]
    _atoms = [t for t in _atoms if 20 <= len(t) <= 200]
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

def passages(skip_titles=()):
    if SRC_FILE:
        for ln in open(SRC_FILE, encoding="utf-8"):
            try: r = json.loads(ln)
            except Exception: continue
            txt, title = (r.get("text") or "").strip(), r.get("title", "")
            if title in skip_titles or not (300 <= len(txt) <= 2000) or contaminated(txt):
                continue
            yield txt, title
        return
    from datasets import load_dataset
    ds = load_dataset("wikimedia/wikipedia", "20231101.pl", split="train", streaming=True)
    for r in ds:
        txt = (r.get("text") or "").strip()
        title = r.get("title", "")
        if title in skip_titles:
            continue
        if PL_FOCUS and not PL_PAT.search(title + " " + txt[:800]):
            continue
        # take a few substantial paragraphs per article
        paras = [p.strip() for p in txt.split("\n") if 400 <= len(p.strip()) <= 1800]
        for p in paras[:3]:
            if contaminated(p):  # źródło pokrywa się z testem -> wypada
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
    return [{"text": t, "kind": k, "source_title": title, "gen_model": TEACHER}
            for t, k in out if not contaminated(t)]

def main():
    if not KEY: print("BRAK klucza OpenRouter"); sys.exit(1)
    os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
    from collections import Counter
    kinds = Counter(); tok = 0; ndoc = 0; done_titles = set()
    if os.path.exists(OUT):  # resume: doliczamy istniejące, pomijamy przerobione artykuły
        for ln in open(OUT, encoding="utf-8"):
            try: d = json.loads(ln)
            except Exception: continue
            tok += approx_tokens(d.get("text", "")); ndoc += 1
            kinds[d.get("kind", "?")] += 1; done_titles.add(d.get("source_title", ""))
        print(f"  resume: {ndoc} docs / ~{tok/1e6:.2f}M tok / {len(done_titles)} artykułów", flush=True)
    src = passages(done_titles); t0 = time.time(); tok0 = tok
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
                except Exception: continue
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

if __name__ == "__main__":
    main()
