#!/usr/bin/env python3
"""Test fertility tokenizerów (tokeny/słowo) na PL i EN.

Fertility (TpW) = subtokeny / słowa — niżej = wydajniej. CpT = znaki / token.
Porównuje tokenizery na tej samej próbce (Wikipedia PL + EN), liczy też ratio PL/EN
(o ile bardziej „token-głodny" jest polski). Pobiera tylko pliki tokenizera (szybko).

Usage: tokenizer_fertility.py [n_paragraphs]
Gated tokenizery (Mistral/Llama/Gemma) wymagają HF_TOKEN z zaakceptowanym dostępem;
brak dostępu -> pomijane z notką.
"""
import re, sys, statistics

N = int(sys.argv[1]) if len(sys.argv) > 1 else 400

# repo_id -> etykieta
TOKENIZERS = {
    "Qwen/Qwen3.5-9B": "Qwen3.5-9B",
    "speakleash/Bielik-11B-v3.0-Instruct": "Bielik-11B-v3",
    "mistralai/Mistral-7B-Instruct-v0.2": "Mistral-7B-v0.2 (baza Bielika)",
    "utter-project/EuroLLM-9B": "EuroLLM-9B",
    "google/gemma-2-9b": "Gemma-2-9B",
    "meta-llama/Llama-3.1-8B": "Llama-3.1-8B",
}

WORD = re.compile(r"\w+", re.UNICODE)

def sample(lang, n):
    from datasets import load_dataset
    cfg = {"pl": "20231101.pl", "en": "20231101.en"}[lang]
    ds = load_dataset("wikimedia/wikipedia", cfg, split="train", streaming=True)
    out, c = [], 0
    for r in ds:
        for para in (r.get("text") or "").split("\n"):
            para = para.strip()
            if 200 <= len(para) <= 1500:
                out.append(para); c += 1; break
        if c >= n: break
    return "\n".join(out)

def load_tok(repo):
    from transformers import AutoTokenizer
    return AutoTokenizer.from_pretrained(repo, trust_remote_code=True)

def measure(tok, text):
    words = len(WORD.findall(text))
    chars = len(text)
    toks = len(tok.encode(text, add_special_tokens=False))
    return toks, words, chars

def main():
    print(f"Pobieram próbki Wikipedii (PL+EN, {N} akapitów każda)…", flush=True)
    txt = {"pl": sample("pl", N), "en": sample("en", N)}
    print(f"  PL: {len(txt['pl'])} znaków, {len(WORD.findall(txt['pl']))} słów | "
          f"EN: {len(txt['en'])} znaków, {len(WORD.findall(txt['en']))} słów\n", flush=True)

    rows = []
    for repo, label in TOKENIZERS.items():
        try:
            tok = load_tok(repo)
        except Exception as e:
            print(f"  [pominięto] {label}: {str(e)[:80]}", flush=True); continue
        m = {}
        for lang in ("pl", "en"):
            t, w, c = measure(tok, txt[lang])
            m[lang] = {"tpw": t / w, "cpt": c / t}
        vocab = getattr(tok, "vocab_size", len(tok))
        rows.append((label, vocab, m["pl"]["tpw"], m["pl"]["cpt"],
                     m["en"]["tpw"], m["en"]["cpt"], m["pl"]["tpw"] / m["en"]["tpw"]))
        print(f"  zmierzono: {label}", flush=True)

    rows.sort(key=lambda r: r[2])  # po fertility PL rosnąco (najlepszy u góry)
    print("\n" + "=" * 78)
    print(f"{'Tokenizer':<30}{'vocab':>8}{'TpW_PL':>8}{'CpT_PL':>8}{'TpW_EN':>8}{'PL/EN':>8}")
    print("-" * 78)
    for label, vocab, tpw_pl, cpt_pl, tpw_en, cpt_en, ratio in rows:
        print(f"{label:<30}{vocab:>8}{tpw_pl:>8.3f}{cpt_pl:>8.2f}{tpw_en:>8.3f}{ratio:>8.2f}")
    print("=" * 78)
    print("TpW (fertility) = tokeny/słowo, niżej = wydajniej.  CpT = znaki/token, wyżej = wydajniej.")
    print("PL/EN = ile razy bardziej token-głodny polski niż angielski (1.0 = tak samo).")

if __name__ == "__main__":
    main()
