from __future__ import annotations

import argparse
import json
import random
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "data" / "synthetic_morph_examples.json"


PREFIXES = ["prze", "od", "do", "wy", "za", "po", "roz", "pod", "nad"]
VERB_ROOTS = ["mierz", "licz", "pis", "czyt", "nos", "woł", "bier", "kroj", "szuk", "staw"]
PRON_BASES = ["kogo", "czego", "komu", "kim", "czym", "gdzie", "kiedy", "jak"]
ADVERB_BASES = ["bardz", "szybc", "mocn", "łatw", "trudn", "woln", "częśc", "rzadz", "bliż", "dalej"]
ADJ_ROOTS = ["in", "czyn", "win", "bier", "dzien", "rodzin", "szkol", "gmin", "praw", "sien"]
NOUN_ALLOMORPHS = [
    ("ps", "pies"),
    ("ręc", "ręka"),
    ("nóż", "noga"),
    ("ludz", "człowiek"),
    ("dziec", "dziecko"),
    ("ocz", "oko"),
]


def make_case(idx: int, rng: random.Random) -> dict:
    category = rng.choice(
        [
            "synthetic_prefixed_verb",
            "synthetic_indefinite_pronoun",
            "synthetic_adverb_comparative",
            "synthetic_adjective_stem_extension",
            "synthetic_nominal_allomorph",
        ]
    )

    if category == "synthetic_prefixed_verb":
        prefix = rng.choice(PREFIXES)
        root = rng.choice(VERB_ROOTS)
        surface = f"{prefix}{root}ają"
        gold = [[prefix, "PREFIX"], [root, "ROOT"], ["aj", "VERB_THEME"], ["ą", "PRES_3PL"]]
        expected = ["fin:pl:ter"]
    elif category == "synthetic_indefinite_pronoun":
        base = rng.choice(PRON_BASES)
        surface = f"{base}kolwiek"
        gold = [[base, "PRONOUN_BASE"], ["kolwiek", "INDEF_PARTICLE"]]
        expected = []
    elif category == "synthetic_adverb_comparative":
        base = rng.choice(ADVERB_BASES)
        if base.endswith("j"):
            base = base[:-1]
        surface = f"{base}iej"
        gold = [[base, "ROOT_ALLOMORPH"], ["iej", "ADV_COMPARATIVE"]]
        expected = ["adv:com"]
    elif category == "synthetic_adjective_stem_extension":
        root = rng.choice(ADJ_ROOTS)
        surface = f"{root}nego"
        gold = [[root, "ROOT"], ["n", "STEM_EXT"], ["ego", "GEN_SG_MN_ADJ"]]
        expected = ["adj:sg:gen", "adj:sg:acc"]
    else:
        root, lemma = rng.choice(NOUN_ALLOMORPHS)
        ending, role, expected = rng.choice(
            [
                ("em", "INST_SG", ["subst:sg:inst"]),
                ("u", "GEN_LOC_SG", ["subst:sg:gen", "subst:sg:loc", "subst:sg:dat"]),
                ("e", "NOM_ACC_PL", ["subst:pl:nom", "subst:pl:acc"]),
            ]
        )
        surface = f"{root}{ending}"
        gold = [[root, "ROOT_ALLOMORPH"], [ending, role]]

    return {
        "id": f"synthetic_{idx:03d}",
        "split": "synthetic",
        "category": category,
        "surface": surface,
        "expected_morph_tags": expected,
        "gold": gold,
        "provenance": "synthetic_template_generator",
        "verified": False,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic Polish morphology examples for stress testing.")
    parser.add_argument("--count", type=int, default=100)
    parser.add_argument("--seed", type=int, default=2026)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    rng = random.Random(args.seed)
    seen = set()
    cases = []
    attempts = 0
    while len(cases) < args.count and attempts < args.count * 20:
        attempts += 1
        case = make_case(len(cases) + 1, rng)
        key = (case["surface"], case["category"])
        if key in seen:
            continue
        seen.add(key)
        cases.append(case)

    payload = {
        "name": "Synthetic Polish Morphology Stress Set",
        "version": "0.1.0",
        "description": "Random template-generated examples for pipeline stress testing. These are not manually verified gold examples.",
        "seed": args.seed,
        "cases": cases,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(cases)} examples to {args.out}")


if __name__ == "__main__":
    main()
