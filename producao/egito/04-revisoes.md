# Egito — Revisões (Etapa 3)

## Revisão 1 — mecânica, rigidez e coerência com o roteiro
| Encontrado | Cena / quadro | Ajustado |
|---|---|---|
| Contadores e etiquetas não apareciam (usavam o quadro da cena, mas recebiam tempos absolutos) | C03 ~900, C06 ~1900, C09, C11, C12 | HUD ganhou `t0`; as cenas passam o início |
| Estátua só 1,4× maior que um homem (roteiro: "estátua de toneladas") e rosto quadrado | todas | estátua ×1,45 e trenó ×1,3 (`ESC_EST`, `ESC_TRENO`); cabeça refeita de perfil com pano listrado genérico |
| Diego no meio dos trabalhadores dele nos closes (imagem poluída) | C02, C05, C07 | Diego passou para o lado esquerdo da estátua (`DIEGO_X`) |
| Dois Lucas no C08 (um jogando água e outro andando) | C08 ~2530 | no C08 só o Lucas andando junto do trenó |
| Abertura do C01 cortava a estátua gigante | C01 ~200 | câmera abre até zoom 0,86 centrada na estátua |
| Trenó deslizando fora do quadro | C08 ~2530 | câmera segue o trenó (x + 420, zoom 0,72) |
| Diagrama pequeno, baixo (quase na legenda) e setas/textos saindo pela direita | C09 | trenó/estátua/grãos maiores; setas fixas no centro; textos menores |
| Diego escondido atrás da estátua | C11 | Diego entre o Lucas e a equipe |

## Revisão 2 — expressividade, luz, câmera e peso (rascunho em meia resolução, tiras quadro a quadro)
| Encontrado | Cena | Ajustado |
|---|---|---|
| Plano aberto demais: não dava pra ver a metade dos homens indo embora | C06 | zoom 0,6 → 0,78, câmera mais baixa |
| Trenó afundando na lama aparecia só na borda | C10 | câmera centrada entre trenó e Diego; zoom 0,95 → 1,2 |
| Vitória do Lucas pequena; Diego mudo quase invisível | C11 | câmera fechada no Lucas e no Diego (zoom 0,95 → 1,1) |
| OK: abertura revelando a estátua (mola pesada), Diego descruzando antes de apontar, chefe com tremida de 6 q no grito, pan com borrão até o sorriso de canto, hold no "travou", balde com antecipação (agacha → sobe → arremessa), splash + tremida, carimbo girando e riscado, loop | — | — |

## Pendente (para o usuário decidir)
- O pacote com as imagens de referência e storyboards não veio: figurino, cenários e enquadramentos seguiram só o texto do roteiro.
- A legenda veio do alinhamento automático (precisão ~0,2 s), não do `egito-legenda.json`.
- O "grito com eco" é um efeito por baixo da voz (a voz é da narração).
