# Polish Morphological Boundary Benchmark v0.1.0

Small gold set for Polish morpheme boundary evaluation. Cases are grouped by failure mode rather than by frequency.

## Summary

| system | cases | boundary F1 | fertility | morph alignment P | morph alignment R | fallback |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| polish_morph_current | 12 | 0.833 | 2.583 | 0.833 | 0.833 | 0.000 |
| phoneme_syllable_baseline | 12 | 0.361 | 2.833 | 0.278 | 0.389 | 1.000 |
| tiktoken_cl100k | 12 | 0.325 | 3.583 | 0.340 | 0.333 | 0.000 |

## Diagnostics

| system | exact segments | exact roles | source distribution |
| --- | ---: | ---: | --- |
| polish_morph_current | 0.833 | 0.750 | `{'rule:adverb_comparative': 2, 'rule:indefinite_pronoun': 2, 'rule:present_3pl_aja': 2, 'rule:adjective_stem_extension': 2, 'heuristic': 3, 'ladder_entry': 1}` |
| phoneme_syllable_baseline | 0.000 | 0.000 | `{'phoneme_syllable': 12}` |
| tiktoken_cl100k | 0.083 | 0.000 | `{'tiktoken_cl100k': 12}` |

## Analyzer Coverage

| analyzer | status | recognized | expected tag match | note |
| --- | --- | ---: | ---: | --- |
| morfeusz2 | available | 1.000 | 1.000 | form analyzer baseline; does not provide morpheme boundaries |
| concraft-pl | missing | 0.000 | 0.000 | not installed in this environment |

## Category Breakdown

### polish_morph_current

| category | cases | boundary F1 | fertility | align P | align R | exact roles | fallback |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adjective_stem_extension | 2 | 1.000 | 3.000 | 1.000 | 1.000 | 1.000 | 0.000 |
| adverb_comparative | 2 | 1.000 | 2.500 | 1.000 | 1.000 | 1.000 | 0.000 |
| indefinite_pronoun | 2 | 1.000 | 2.000 | 1.000 | 1.000 | 1.000 | 0.000 |
| nominal_root_alternation | 3 | 0.333 | 1.667 | 0.333 | 0.333 | 0.000 | 0.000 |
| prefixed_verb_theme | 2 | 1.000 | 4.000 | 1.000 | 1.000 | 1.000 | 0.000 |
| verbal_root_alternation | 1 | 1.000 | 3.000 | 1.000 | 1.000 | 1.000 | 0.000 |

### phoneme_syllable_baseline

| category | cases | boundary F1 | fertility | align P | align R | exact roles | fallback |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adjective_stem_extension | 2 | 0.500 | 3.000 | 0.500 | 0.500 | 0.000 | 1.000 |
| adverb_comparative | 2 | 0.250 | 2.500 | 0.250 | 0.250 | 0.000 | 1.000 |
| indefinite_pronoun | 2 | 0.500 | 4.000 | 0.333 | 1.000 | 0.000 | 1.000 |
| nominal_root_alternation | 3 | 0.000 | 1.333 | 0.000 | 0.000 | 0.000 | 1.000 |
| prefixed_verb_theme | 2 | 0.667 | 4.000 | 0.333 | 0.333 | 0.000 | 1.000 |
| verbal_root_alternation | 1 | 0.500 | 3.000 | 0.500 | 0.500 | 0.000 | 1.000 |

### tiktoken_cl100k

| category | cases | boundary F1 | fertility | align P | align R | exact roles | fallback |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adjective_stem_extension | 2 | 0.583 | 2.500 | 0.750 | 0.500 | 0.000 | 0.000 |
| adverb_comparative | 2 | 0.200 | 3.000 | 0.167 | 0.250 | 0.000 | 0.000 |
| indefinite_pronoun | 2 | 0.000 | 6.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| nominal_root_alternation | 3 | 0.333 | 2.333 | 0.333 | 0.333 | 0.000 | 0.000 |
| prefixed_verb_theme | 2 | 0.500 | 4.000 | 0.500 | 0.500 | 0.000 | 0.000 |
| verbal_root_alternation | 1 | 0.333 | 5.000 | 0.250 | 0.500 | 0.000 | 0.000 |

## Failures

### polish_morph_current

- `psem` (nominal_root_alternation, heuristic):
  - gold: `ps|ROOT_ALLOMORPH em|INST_SG`
  - pred: `pse|ROOT m|INST_LOC_SG_ADJ`
- `psu` (nominal_root_alternation, heuristic):
  - gold: `ps|ROOT_ALLOMORPH u|GEN_LOC_SG`
  - pred: `psu|ROOT`
- `ręce` (nominal_root_alternation, heuristic):
  - gold: `ręc|ROOT_ALLOMORPH e|NOM_ACC_PL`
  - pred: `ręc|ROOT e|NOM_ACC_PL`

### phoneme_syllable_baseline

- `bardziej` (adverb_comparative, phoneme_syllable):
  - gold: `bardz|ROOT_ALLOMORPH iej|ADV_COMPARATIVE`
  - pred: `bar|PHON_FALLBACK dźej|PHON_FALLBACK`
- `najbardziej` (adverb_comparative, phoneme_syllable):
  - gold: `naj|PREFIX bardz|ROOT_ALLOMORPH iej|ADV_COMPARATIVE`
  - pred: `naj|PHON_FALLBACK bar|PHON_FALLBACK dźej|PHON_FALLBACK`
- `kogokolwiek` (indefinite_pronoun, phoneme_syllable):
  - gold: `kogo|PRONOUN_BASE kolwiek|INDEF_PARTICLE`
  - pred: `ko|PHON_FALLBACK go|PHON_FALLBACK kol|PHON_FALLBACK w'ek|PHON_FALLBACK`
- `czegokolwiek` (indefinite_pronoun, phoneme_syllable):
  - gold: `czego|PRONOUN_BASE kolwiek|INDEF_PARTICLE`
  - pred: `cze|PHON_FALLBACK go|PHON_FALLBACK kol|PHON_FALLBACK w'ek|PHON_FALLBACK`
- `przemierzają` (prefixed_verb_theme, phoneme_syllable):
  - gold: `prze|PREFIX mierz|ROOT aj|VERB_THEME ą|PRES_3PL`
  - pred: `psze|PHON_FALLBACK m'e|PHON_FALLBACK ża|PHON_FALLBACK ją|PHON_FALLBACK`
- `odmierzają` (prefixed_verb_theme, phoneme_syllable):
  - gold: `od|PREFIX mierz|ROOT aj|VERB_THEME ą|PRES_3PL`
  - pred: `od|PHON_FALLBACK m'e|PHON_FALLBACK ża|PHON_FALLBACK ją|PHON_FALLBACK`
- `innego` (adjective_stem_extension, phoneme_syllable):
  - gold: `in|ROOT n|STEM_EXT ego|GEN_SG_MN_ADJ`
  - pred: `in|PHON_FALLBACK ne|PHON_FALLBACK go|PHON_FALLBACK`
- `czynnego` (adjective_stem_extension, phoneme_syllable):
  - gold: `czyn|ROOT n|STEM_EXT ego|GEN_SG_MN_ADJ`
  - pred: `czyn|PHON_FALLBACK ne|PHON_FALLBACK go|PHON_FALLBACK`
- `psem` (nominal_root_alternation, phoneme_syllable):
  - gold: `ps|ROOT_ALLOMORPH em|INST_SG`
  - pred: `psem|PHON_FALLBACK`
- `psu` (nominal_root_alternation, phoneme_syllable):
  - gold: `ps|ROOT_ALLOMORPH u|GEN_LOC_SG`
  - pred: `psu|PHON_FALLBACK`
- `ręce` (nominal_root_alternation, phoneme_syllable):
  - gold: `ręc|ROOT_ALLOMORPH e|NOM_ACC_PL`
  - pred: `rę|PHON_FALLBACK ce|PHON_FALLBACK`
- `przyszliśmy` (verbal_root_alternation, phoneme_syllable):
  - gold: `przy|PREFIX sz|ROOT_ALLOMORPH liśmy|PAST_1PL`
  - pred: `pszy|PHON_FALLBACK szliś|PHON_FALLBACK my|PHON_FALLBACK`

### tiktoken_cl100k

- `bardziej` (adverb_comparative, tiktoken_cl100k):
  - gold: `bardz|ROOT_ALLOMORPH iej|ADV_COMPARATIVE`
  - pred: `bard|BPE ziej|BPE`
- `najbardziej` (adverb_comparative, tiktoken_cl100k):
  - gold: `naj|PREFIX bardz|ROOT_ALLOMORPH iej|ADV_COMPARATIVE`
  - pred: `n|BPE aj|BPE bard|BPE ziej|BPE`
- `kogokolwiek` (indefinite_pronoun, tiktoken_cl100k):
  - gold: `kogo|PRONOUN_BASE kolwiek|INDEF_PARTICLE`
  - pred: `k|BPE og|BPE ok|BPE ol|BPE w|BPE iek|BPE`
- `czegokolwiek` (indefinite_pronoun, tiktoken_cl100k):
  - gold: `czego|PRONOUN_BASE kolwiek|INDEF_PARTICLE`
  - pred: `cz|BPE eg|BPE ok|BPE ol|BPE w|BPE iek|BPE`
- `przemierzają` (prefixed_verb_theme, tiktoken_cl100k):
  - gold: `prze|PREFIX mierz|ROOT aj|VERB_THEME ą|PRES_3PL`
  - pred: `pr|BPE zem|BPE ierz|BPE ają|BPE`
- `odmierzają` (prefixed_verb_theme, tiktoken_cl100k):
  - gold: `od|PREFIX mierz|ROOT aj|VERB_THEME ą|PRES_3PL`
  - pred: `od|BPE m|BPE ierz|BPE ają|BPE`
- `innego` (adjective_stem_extension, tiktoken_cl100k):
  - gold: `in|ROOT n|STEM_EXT ego|GEN_SG_MN_ADJ`
  - pred: `inn|BPE ego|BPE`
- `czynnego` (adjective_stem_extension, tiktoken_cl100k):
  - gold: `czyn|ROOT n|STEM_EXT ego|GEN_SG_MN_ADJ`
  - pred: `cz|BPE yn|BPE nego|BPE`
- `psem` (nominal_root_alternation, tiktoken_cl100k):
  - gold: `ps|ROOT_ALLOMORPH em|INST_SG`
  - pred: `p|BPE sem|BPE`
- `psu` (nominal_root_alternation, tiktoken_cl100k):
  - gold: `ps|ROOT_ALLOMORPH u|GEN_LOC_SG`
  - pred: `ps|BPE u|BPE`
- `ręce` (nominal_root_alternation, tiktoken_cl100k):
  - gold: `ręc|ROOT_ALLOMORPH e|NOM_ACC_PL`
  - pred: `r|BPE ę|BPE ce|BPE`
- `przyszliśmy` (verbal_root_alternation, tiktoken_cl100k):
  - gold: `przy|PREFIX sz|ROOT_ALLOMORPH liśmy|PAST_1PL`
  - pred: `pr|BPE z|BPE ysz|BPE li|BPE śmy|BPE`
