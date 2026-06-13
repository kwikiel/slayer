# Polish Morpheme Boundary Benchmark Protocol

## Goal

This benchmark is not a tokenizer demo. It is a Polish gold-standard morpheme-boundary benchmark designed to test whether morphology-aware tokenization helps Polish language modeling.

The core research question is deliberately empirical:

> Does Polish morphology-aware tokenization improve intrinsic tokenizer quality and downstream language-model behavior over strong BPE-style baselines?

A negative result is still valuable. For fusional languages, literature does not make the downstream uplift obvious.

## Positioning

The benchmark should not compete with SOTA morpheme segmenters by hand-written rules. The relevant comparison axes are:

- neural morpheme segmentation quality,
- tokenizer morphology alignment and fertility,
- downstream language-model evidence.

The intended contribution is the Polish evaluation resource and protocol:

- Polish is absent from the SIGMORPHON 2022 morpheme segmentation languages, while Czech and Russian are present.
- Polish has high-value fusional edge cases: root allomorphy, palatalization, stem extensions, suppletion, syncretism, and prefixal verbs.
- Morfeusz2 and Concraft-pl are strong form-analysis baselines, but they do not directly provide morpheme boundaries.

## Systems To Compare

### Form Analyzers

These systems are evaluated for coverage and tag disambiguation, not boundary F1 unless an additional boundary adapter is supplied.

- `morfeusz2`: lemma, POS, morphosyntactic tags, ambiguity.
- `concraft-pl`: contextual disambiguation over Morfeusz analyses.

Metrics:

- recognized rate,
- expected tag match,
- ambiguity count before and after disambiguation,
- coverage by category.

### Morpheme Segmenters

These systems are evaluated on gold morpheme boundaries.

- supervised char-level seq2seq segmenter trained on the benchmark train split,
- SIGMORPHON-style neural baseline where available,
- current `polish_morph_current` prototype as a weak baseline,
- phoneme-syllable fallback as a control.

Metrics:

- boundary precision,
- boundary recall,
- boundary F1,
- exact segmentation,
- role accuracy as diagnostic only.

### LLM Tokenizers

These systems are evaluated as tokenizers, not as linguistic analyzers.

- standard BPE,
- WordPiece or Unigram where available,
- `tiktoken_cl100k` as a widely used production BPE reference,
- MorphBPE-style morphology-aware BPE,
- SKMT-style root-preserving BPE adapted to Polish,
- SuperBPE / BoundlessBPE / PickyBPE-style compression-oriented baselines where implemented.

Metrics:

- fertility: tokens per whitespace word,
- morphological alignment precision: proportion of tokenizer boundaries that match gold morpheme boundaries,
- morphological alignment recall: proportion of gold morpheme boundaries recovered by tokenizer boundaries,
- MorphBPE-style consistency metrics when implemented,
- vocabulary size and token frequency balance.

## Annotation Format

The canonical JSON format stores typed morpheme spans:

```json
{
  "id": "noun_alt_psem",
  "split": "dev",
  "category": "nominal_root_alternation",
  "surface": "psem",
  "lemma": "pies",
  "expected_morph_tags": ["subst:sg:inst"],
  "gold": [
    ["ps", "ROOT_ALLOMORPH"],
    ["em", "INST_SG"]
  ]
}
```

Required fields:

- `id`: stable unique case identifier,
- `surface`: surface word form,
- `category`: linguistic phenomenon,
- `gold`: ordered `[text, role]` morpheme sequence.

Recommended fields:

- `split`: `train`, `dev`, `test`, or `holdout`,
- `lemma`: canonical lemma,
- `expected_morph_tags`: acceptable Morfeusz/Concraft tag prefixes,
- `notes`: annotator rationale for controversial boundaries.

Boundary metrics use only `text` spans. Role labels are diagnostic and should not dominate leaderboard ranking.

## SIGMORPHON-Compatible Export

For word-level segmentation, export one word per line:

```text
psem    ps @@ em
przemierzają    prze @@ mierz @@ aj @@ ą
```

Roles can be exported as an auxiliary TSV:

```text
psem    ps|ROOT_ALLOMORPH @@ em|INST_SG
```

The role-free export is used for cross-system morpheme segmentation evaluation. The role export is used for Polish-specific error analysis.

## Gold Set Categories

The benchmark should be balanced by phenomenon, not corpus frequency. The first useful target is 1,000 held-out forms plus train/dev material for supervised baselines.

Recommended target counts:

| category | target test cases | examples | rationale |
| --- | ---: | --- | --- |
| nominal root alternation | 120 | `pies -> ps-`, `ręka -> ręc-` | Core fusional boundary challenge. |
| verbal root alternation | 120 | `iść -> szedł/przyszliśmy` | Breaks naive stem stability. |
| prefixal verbs | 120 | `prze-mierz-aj-ą` | Tests prefix/root/theme boundaries. |
| stem extensions | 80 | `in-n-ego`, `czyn-n-ego` | Distinguishes root from stem material. |
| palatalization | 100 | `ręka/ręce`, `noga/nodze` | Polish-specific morphophonology. |
| suppletion | 80 | `człowiek/ludzie`, `rok/lata` | Cannot be solved by suffix stripping. |
| indefinite pronouns | 60 | `kogo-kolwiek`, `czego-kolwiek` | Compound-like pronoun morphology. |
| adverb comparison | 60 | `bardz-iej`, `szybc-iej` | Category error trap for adjectival endings. |
| derivational suffixes | 120 | `naucz-yciel`, `mieszka-niec` | Tests derivation beyond inflection. |
| compounds / numerals | 80 | `pięcio-let-ni`, `między-wydział-ow-y` | Long forms and internal boundaries. |
| syncretic endings | 80 | forms with shared endings | Tests ambiguity and tag sensitivity. |
| named/common edge cases | 80 | proper names, rare forms | Measures robustness without overfitting. |

## Splits

Use leakage-resistant splits:

- `train`: for supervised segmenter and MorphBPE boundary training.
- `dev`: for tokenizer hyperparameters and benchmark iteration.
- `test`: locked public leaderboard split.
- `holdout`: private or delayed-release forms with related lemmas held out.

For allomorphy categories, split by lemma family, not by surface form. If `pies/psem/psu` appears in train, the test split should contain a different alternation family.

## Intrinsic Evaluation

Report all of the following:

- boundary precision/recall/F1,
- fertility,
- morphological alignment precision/recall,
- vocabulary size,
- token frequency entropy or Gini coefficient,
- per-category breakdown,
- failure examples.

Do not lead with token accuracy. Token accuracy hides whether wrong cuts cross true morpheme boundaries.

## Extrinsic Evaluation

Intrinsic alignment is not enough. The downstream protocol should include:

- tokenizer training on the same Polish corpus,
- fixed vocabulary budget,
- fixed model architecture and training budget,
- baseline BPE vs morphology-aware BPE vs compression-oriented BPE,
- perplexity on held-out Polish text,
- at least one morphosyntactic task from an Open PL LLM Leaderboard-style suite,
- at least one paradigm/generalization probe.

Minimum defensible experiment:

1. Train three tokenizers on identical corpus slices: standard BPE, MorphBPE-style Polish, and compression-oriented BPE.
2. Train identical small LMs or adapters under the same token budget.
3. Report fertility/alignment plus perplexity and morphosyntactic task score.
4. Analyze whether alignment predicts downstream gains for Polish.

## Publication Claim Boundary

Defensible claims:

- Polish lacks a public SIGMORPHON-style morpheme-boundary benchmark covering fusional edge cases.
- Morfeusz2/Concraft solve form analysis, not boundary-constrained LLM tokenization.
- Morphological alignment and fertility can be measured directly for Polish tokenizers.
- Downstream uplift for Polish is an empirical question, not an assumption.

Claims to avoid until measured:

- morphology-aware tokenization is SOTA for Polish LLM downstream quality,
- higher morpheme alignment necessarily improves all Polish tasks,
- rule-based segmentation can compete with neural morpheme segmenters.
