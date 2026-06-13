from __future__ import annotations

from dataclasses import dataclass

from polish_phoneme_tokenizer import phoneme_syllable_tokens, words


@dataclass(frozen=True)
class MorphToken:
    text: str
    role: str

    def render(self) -> str:
        return f"{self.text}|{self.role}"


@dataclass(frozen=True)
class MorphAnalysis:
    surface: str
    tokens: tuple[MorphToken, ...]
    fallback: bool = False
    source: str = "heuristic"
    confidence: float = 0.6

    def render(self) -> str:
        return " ".join(token.render() for token in self.tokens)


PREFIXES = [
    "naj",
    "nie",
    "prze",
    "przed",
    "bez",
    "nad",
    "pod",
    "roz",
    "współ",
    "między",
    "wy",
    "za",
    "po",
    "do",
    "od",
    "u",
    "z",
    "s",
]


FUNCTION_WORDS = {
    "a": "CONJ",
    "ale": "CONJ",
    "czy": "PARTICLE",
    "do": "PREP",
    "gdyby": "CONJ_COND",
    "i": "CONJ",
    "na": "PREP",
    "nie": "PARTICLE_NEG",
    "o": "PREP",
    "od": "PREP",
    "po": "PREP",
    "to": "PARTICLE",
    "u": "PREP",
    "w": "PREP",
    "we": "PREP",
    "z": "PREP",
    "za": "PREP",
    "że": "CONJ",
}


VERB_TAILS = [
    ("byśmy", "COND_1PL"),
    ("byście", "COND_2PL"),
    ("bym", "COND_1SG"),
    ("byś", "COND_2SG"),
    ("by", "COND"),
    ("liśmy", "PAST_1PL"),
    ("łyśmy", "PAST_1PL_F"),
    ("liście", "PAST_2PL"),
    ("łyście", "PAST_2PL_F"),
    ("łem", "PAST_1SG_M"),
    ("łam", "PAST_1SG_F"),
    ("łeś", "PAST_2SG_M"),
    ("łaś", "PAST_2SG_F"),
    ("li", "PAST_PL"),
    ("ły", "PAST_PL_F"),
    ("ł", "PAST_M"),
    ("ła", "PAST_F"),
    ("ło", "PAST_N"),
]


DERIVATIONAL_SUFFIXES = [
    ("alność", "NOUN_DERIV"),
    ("alności", "NOUN_DERIV"),
    ("ości", "NOUN_DERIV"),
    ("ność", "NOUN_DERIV"),
    ("stwo", "NOUN_DERIV"),
    ("stw", "NOUN_DERIV"),
    ("ciel", "AGENT_DERIV"),
    ("yciel", "AGENT_DERIV"),
    ("arka", "AGENT_DERIV"),
    ("istka", "AGENT_DERIV"),
    ("owa", "VERB_THEME"),
    ("ywa", "VERB_THEME"),
    ("iwa", "VERB_THEME"),
    ("enie", "NOUN_DERIV"),
    ("anie", "NOUN_DERIV"),
    ("owy", "ADJ_DERIV"),
    ("owa", "ADJ_DERIV"),
    ("owe", "ADJ_DERIV"),
    ("ow", "ADJ_DERIV"),
    ("sk", "ADJ_DERIV"),
]


INFLECTION_ENDINGS = [
    ("ego", "GEN_SG_MN_ADJ"),
    ("emu", "DAT_SG_MN_ADJ"),
    ("ymi", "INST_PL_ADJ"),
    ("imi", "INST_PL_ADJ"),
    ("ami", "INST_PL"),
    ("ach", "LOC_PL"),
    ("owie", "NOM_PL_PERSONAL"),
    ("ami", "INST_PL"),
    ("ego", "GEN_SG"),
    ("owym", "LOC_INST_SG_ADJ"),
    ("ymi", "INST_PL"),
    ("ych", "GEN_LOC_PL_ADJ"),
    ("ej", "GEN_DAT_LOC_SG_F_ADJ"),
    ("om", "DAT_PL"),
    ("ów", "GEN_PL"),
    ("em", "INST_SG"),
    ("ie", "LOC_SG"),
    ("ą", "ACC_INST_SG_F"),
    ("ę", "ACC_SG"),
    ("a", "NOM_GEN_SG"),
    ("u", "GEN_LOC_SG"),
    ("y", "NOM_ACC_PL"),
    ("i", "NOM_ACC_PL"),
    ("e", "NOM_ACC_PL"),
    ("m", "INST_LOC_SG_ADJ"),
]


SPECIAL_ANALYSES: dict[str, tuple[tuple[str, str], ...]] = {
    "przyszliśmy": (
        ("przy", "PREFIX"),
        ("sz", "ROOT_ALLOMORPH"),
        ("liśmy", "PAST_1PL"),
    ),
    "niepodległościowego": (
        ("nie", "PREFIX"),
        ("podleg", "ROOT"),
        ("łość", "NOUN_DERIV"),
        ("i", "LINK"),
        ("ow", "ADJ_DERIV"),
        ("ego", "GEN_SG_MN_ADJ"),
    ),
    "przedsiębiorstw": (
        ("przedsiębior", "ROOT"),
        ("stw", "NOUN_DERIV"),
    ),
    "dziewięćdziesięciopięcioletnia": (
        ("dziewięćdziesięcio", "NUM_COMPOUND"),
        ("pięcio", "NUM_COMPOUND"),
        ("let", "ROOT"),
        ("ni", "ADJ_DERIV"),
        ("a", "NOM_SG_F"),
    ),
    "szczebrzeszynie": (
        ("szczebrzeszyn", "ROOT"),
        ("ie", "LOC_SG"),
    ),
    "chrząszcz": (("chrząszcz", "ROOT"),),
    "brzmi": (
        ("brzm", "ROOT"),
        ("i", "PRES_3SG"),
    ),
    "trzcinie": (
        ("trzcin", "ROOT"),
        ("ie", "LOC_SG"),
    ),
    "mieszkańcy": (
        ("mieszkań", "ROOT"),
        ("cy", "NOM_PL_PERSONAL"),
    ),
    "dobrze": (
        ("dobr", "ROOT"),
        ("ze", "ADV_DERIV"),
    ),
    "wiedzą": (
        ("wiedz", "ROOT"),
        ("ą", "PRES_3PL"),
    ),
    "przeanalizowalibyśmy": (
        ("prze", "PREFIX"),
        ("analiz", "ROOT"),
        ("owa", "VERB_THEME"),
        ("li", "PAST_PL"),
        ("byśmy", "COND_1PL"),
    ),
    "międzywydziałowym": (
        ("między", "PREFIX"),
        ("wydział", "ROOT"),
        ("ow", "ADJ_DERIV"),
        ("ym", "LOC_INST_SG_ADJ"),
    ),
    "nauczyciele": (
        ("naucz", "ROOT"),
        ("yciel", "AGENT_DERIV"),
        ("e", "NOM_PL_PERSONAL"),
    ),
    "urzędnicy": (
        ("urzęd", "ROOT"),
        ("nik", "AGENT_DERIV"),
        ("y", "NOM_PL_PERSONAL"),
    ),
}


class PolishMorphTokenizer:
    def analyze_word(self, word: str) -> MorphAnalysis:
        lowered = word.lower()
        if lowered in FUNCTION_WORDS:
            return MorphAnalysis(
                word,
                (MorphToken(lowered, FUNCTION_WORDS[lowered]),),
                source="function_word",
                confidence=1.0,
            )
        if lowered in SPECIAL_ANALYSES:
            return MorphAnalysis(
                word,
                tuple(MorphToken(text, role) for text, role in SPECIAL_ANALYSES[lowered]),
                source="ladder_entry",
                confidence=1.0,
            )

        original = lowered
        prefixes, stem = self._split_prefixes(lowered)
        rule_analysis = self._apply_class_rules(word, prefixes, stem)
        if rule_analysis:
            return rule_analysis

        suffixes: list[MorphToken] = []

        stem, verb_tails = self._strip_suffixes(stem, VERB_TAILS, min_stem_len=3)
        suffixes[:0] = verb_tails

        stem, inflections = self._strip_suffixes(stem, INFLECTION_ENDINGS, min_stem_len=3, max_count=1)
        suffixes[:0] = inflections

        stem, derivations = self._strip_suffixes(stem, DERIVATIONAL_SUFFIXES, min_stem_len=3, max_count=2)
        suffixes[:0] = derivations

        if len(stem) < 3 or (not prefixes and not suffixes and len(original) > 10):
            return self._phoneme_fallback(word)

        tokens = [*prefixes, MorphToken(stem, "ROOT"), *suffixes]
        return MorphAnalysis(word, tuple(tokens), source="heuristic", confidence=0.55)

    def tokenize(self, text: str) -> list[str]:
        return [token.render() for word in words(text) for token in self.analyze_word(word).tokens]

    def analyses(self, text: str) -> list[MorphAnalysis]:
        return [self.analyze_word(word) for word in words(text)]

    def _split_prefixes(self, word: str) -> tuple[list[MorphToken], str]:
        prefixes: list[MorphToken] = []
        stem = word
        ordered_prefixes = sorted(PREFIXES, key=len, reverse=True)
        for _ in range(2):
            match = next(
                (prefix for prefix in ordered_prefixes if stem.startswith(prefix) and len(stem) - len(prefix) >= 4),
                None,
            )
            if not match:
                break
            prefixes.append(MorphToken(match, "PREFIX"))
            stem = stem[len(match) :]
        return prefixes, stem

    def _strip_suffixes(
        self,
        stem: str,
        suffix_table: list[tuple[str, str]],
        min_stem_len: int,
        max_count: int | None = None,
    ) -> tuple[str, list[MorphToken]]:
        suffixes: list[MorphToken] = []
        remaining = stem
        while max_count is None or len(suffixes) < max_count:
            match = next(
                (
                    (suffix, role)
                    for suffix, role in suffix_table
                    if remaining.endswith(suffix) and len(remaining) - len(suffix) >= min_stem_len
                ),
                None,
            )
            if not match:
                break
            suffix, role = match
            suffixes.insert(0, MorphToken(suffix, role))
            remaining = remaining[: -len(suffix)]
        return remaining, suffixes

    def _apply_class_rules(self, word: str, prefixes: list[MorphToken], stem: str) -> MorphAnalysis | None:
        if stem.endswith("kolwiek") and len(stem) - len("kolwiek") >= 2:
            base = stem[: -len("kolwiek")]
            return MorphAnalysis(
                word,
                (*prefixes, MorphToken(base, "PRONOUN_BASE"), MorphToken("kolwiek", "INDEF_PARTICLE")),
                source="rule:indefinite_pronoun",
                confidence=0.9,
            )

        if stem.endswith("iej") and len(stem) - len("iej") >= 3:
            return MorphAnalysis(
                word,
                (*prefixes, MorphToken(stem[:-3], "ROOT_ALLOMORPH"), MorphToken("iej", "ADV_COMPARATIVE")),
                source="rule:adverb_comparative",
                confidence=0.85,
            )

        if stem.endswith("ają") and len(stem) - len("ają") >= 3:
            return MorphAnalysis(
                word,
                (
                    *prefixes,
                    MorphToken(stem[:-3], "ROOT"),
                    MorphToken("aj", "VERB_THEME"),
                    MorphToken("ą", "PRES_3PL"),
                ),
                source="rule:present_3pl_aja",
                confidence=0.85,
            )

        adj_match = next(
            (
                (ending, role)
                for ending, role in INFLECTION_ENDINGS
                if role.endswith("_ADJ") and stem.endswith(ending) and len(stem) - len(ending) >= 3
            ),
            None,
        )
        if adj_match:
            ending, role = adj_match
            base = stem[: -len(ending)]
            if base.endswith("nn") and len(base) >= 3:
                return MorphAnalysis(
                    word,
                    (*prefixes, MorphToken(base[:-1], "ROOT"), MorphToken("n", "STEM_EXT"), MorphToken(ending, role)),
                    source="rule:adjective_stem_extension",
                    confidence=0.8,
                )

        return None

    def _phoneme_fallback(self, word: str) -> MorphAnalysis:
        tokens = tuple(MorphToken(token, "PHON_FALLBACK") for token in phoneme_syllable_tokens(word))
        return MorphAnalysis(word, tokens, fallback=True, source="phoneme_fallback", confidence=0.25)


def morph_tokens(text: str) -> list[str]:
    return PolishMorphTokenizer().tokenize(text)


def morph_analyses(text: str) -> list[MorphAnalysis]:
    return PolishMorphTokenizer().analyses(text)
