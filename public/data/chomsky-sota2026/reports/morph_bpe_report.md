# MorphBPE/SKMT-Style Tokenizer Smoke

This is a constrained-BPE pipeline check on the current tiny Polish gold set, not a final tokenizer result.

| system | cases | boundary F1 | fertility | align P | align R |
| --- | ---: | ---: | ---: | ---: | ---: |
| standard_bpe_smoke | 12 | 0.510 | 3.000 | 0.544 | 0.597 |
| morph_bpe_constrained_smoke | 12 | 0.925 | 3.167 | 0.889 | 1.000 |

## Failures

### standard_bpe_smoke

- `bardziej` gold=`bardz @@ iej` pred=`b @@ a @@ r @@ dziej`
- `najbardziej` gold=`naj @@ bardz @@ iej` pred=`n @@ aj @@ b @@ a @@ r @@ dziej`
- `kogokolwiek` gold=`kogo @@ kolwiek` pred=`ko @@ go @@ kolwiek`
- `czegokolwiek` gold=`czego @@ kolwiek` pred=`cz @@ ego @@ kolwiek`
- `przemierzają` gold=`prze @@ mierz @@ aj @@ ą` pred=`prze @@ mierzają`
- `odmierzają` gold=`od @@ mierz @@ aj @@ ą` pred=`od @@ mierzają`
- `innego` gold=`in @@ n @@ ego` pred=`innego`
- `czynnego` gold=`czyn @@ n @@ ego` pred=`czy @@ nnego`
- `przyszliśmy` gold=`przy @@ sz @@ liśmy` pred=`prz @@ y @@ sz @@ li @@ ś @@ m @@ y`

### morph_bpe_constrained_smoke

- `najbardziej` gold=`naj @@ bardz @@ iej` pred=`n @@ aj @@ bardz @@ iej`
- `czynnego` gold=`czyn @@ n @@ ego` pred=`czy @@ n @@ n @@ ego`
- `przyszliśmy` gold=`przy @@ sz @@ liśmy` pred=`prz @@ y @@ sz @@ li @@ ś @@ m @@ y`
