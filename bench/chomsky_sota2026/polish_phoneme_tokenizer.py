from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable


WORD_RE = re.compile(r"[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+", re.UNICODE)


VOWELS = {"a", "e", "i", "o", "u", "y", "ą", "ę"}


MULTIGRAPHS = [
    ("dzi", "dź"),
    ("ch", "h"),
    ("cz", "cz"),
    ("dz", "dz"),
    ("dż", "dż"),
    ("dź", "dź"),
    ("rz", "ż"),
    ("sz", "sz"),
]


PALATALIZING = {
    "b": "b'",
    "p": "p'",
    "m": "m'",
    "f": "f'",
    "w": "w'",
    "n": "ń",
    "s": "ś",
    "z": "ź",
    "c": "ć",
    "d": "dź",
    "t": "t'",
}


VOICELESS = {"p", "t", "k", "f", "s", "ś", "sz", "ć", "cz", "h"}
VOICED_TO_VOICELESS = {
    "b": "p",
    "d": "t",
    "g": "k",
    "w": "f",
    "z": "s",
    "ź": "ś",
    "ż": "sz",
    "dz": "c",
    "dź": "ć",
    "dż": "cz",
}


@dataclass(frozen=True)
class TokenizedWord:
    surface: str
    phonemes: tuple[str, ...]
    syllables: tuple[str, ...]


def words(text: str) -> list[str]:
    return WORD_RE.findall(text)


def g2p(word: str) -> list[str]:
    """A compact rule-based Polish grapheme-to-phoneme pass.

    It handles the most important tokenizer-level phenomena:
    multigraphs, palatalization before i+vowel, rz/ch normalization,
    and final devoicing. It intentionally avoids narrow phonetics.
    """

    w = word.lower()
    out: list[str] = []
    i = 0

    while i < len(w):
        # Softening before a pronounced following vowel: bia -> b' a.
        if i + 2 < len(w) and w[i + 1] == "i" and w[i + 2] in VOWELS and w[i] in PALATALIZING:
            out.append(PALATALIZING[w[i]])
            i += 2
            continue

        if w.startswith("rz", i):
            out.append("sz" if _rz_is_devoiced(w, i) else "ż")
            i += 2
            continue

        matched = False
        for graph, phone in MULTIGRAPHS:
            if w.startswith(graph, i):
                out.append(phone)
                i += len(graph)
                matched = True
                break
        if matched:
            continue

        ch = w[i]
        if ch == "ó":
            out.append("u")
        elif ch == "ł":
            out.append("ł")
        elif ch == "ń":
            out.append("ń")
        elif ch == "ś":
            out.append("ś")
        elif ch == "ź":
            out.append("ź")
        elif ch == "ż":
            out.append("ż")
        elif ch in VOWELS or ch.isalpha():
            out.append(ch)
        i += 1

    return _apply_final_devoicing(out)


def _rz_is_devoiced(word: str, idx: int) -> bool:
    if idx == 0:
        return False
    if idx >= 2 and word[idx - 2 : idx] == "ch":
        return True
    return word[idx - 1] in {"p", "t", "k"}


def _apply_final_devoicing(phones: list[str]) -> list[str]:
    if not phones:
        return phones
    last = phones[-1]
    if last in VOICED_TO_VOICELESS:
        phones = phones.copy()
        phones[-1] = VOICED_TO_VOICELESS[last]
    return phones


def syllabify(phones: list[str]) -> list[str]:
    """Group phones around vowel nuclei using a simple Polish-friendly onset rule."""

    if not phones:
        return []

    vowel_positions = [idx for idx, phone in enumerate(phones) if _is_vowel(phone)]
    if not vowel_positions:
        return ["".join(phones)]

    boundaries = [0]
    for left_vowel, right_vowel in zip(vowel_positions, vowel_positions[1:]):
        cluster_start = left_vowel + 1
        cluster_end = right_vowel
        cluster_len = cluster_end - cluster_start
        if cluster_len <= 0:
            boundary = right_vowel
        elif cluster_len == 1:
            boundary = cluster_start
        else:
            # Keep the last consonant or common sonority-friendly pair as onset.
            onset_len = 2 if _good_onset_pair(phones[cluster_end - 2], phones[cluster_end - 1]) else 1
            boundary = cluster_end - onset_len
        boundaries.append(boundary)
    boundaries.append(len(phones))

    return ["".join(phones[start:end]) for start, end in zip(boundaries, boundaries[1:]) if start < end]


def _is_vowel(phone: str) -> bool:
    return phone in VOWELS


def _good_onset_pair(first: str, second: str) -> bool:
    return (
        first in {"p", "b", "t", "d", "k", "g", "f", "w", "s", "z", "ś", "ź", "sz", "ż", "h"}
        and second in {"r", "l", "ł", "j", "w"}
    )


def tokenize_word(word: str) -> TokenizedWord:
    phones = tuple(g2p(word))
    return TokenizedWord(surface=word, phonemes=phones, syllables=tuple(syllabify(list(phones))))


def phoneme_tokens(text: str) -> list[str]:
    return [phone for word in words(text) for phone in g2p(word)]


def phoneme_syllable_tokens(text: str) -> list[str]:
    tokens: list[str] = []
    for word in words(text):
        tokens.extend(syllabify(g2p(word)))
    return tokens


def tokenized_words(text: str) -> list[TokenizedWord]:
    return [tokenize_word(word) for word in words(text)]


def detokenize_phoneme_syllables(tokens: Iterable[str]) -> str:
    return " ".join(tokens)
