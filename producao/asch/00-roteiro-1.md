# Roteiro 1 — Experimento de Asch (produção)

Nov 24, 2026 · @Oliver Tavares Da Silva

## Resumo e como levar pro Claude Code

Estados Unidos, 1951: num falso teste de visão, 7 atores escolhem de propósito a linha errada e um estudante, o único testado, acaba cedendo. Na explicação (luz azul): ninguém gosta de ser o único diferente, e 3 de cada 4 cederam pelo menos uma vez. Virada: com um único aliado na sala, quase ninguém cedeu. O fim emenda no começo (loop na linha curta).

| Item | Valor |
| --- | --- |
| Formato | vertical 1080×1920, 60 fps |
| Duração | 79,80 s (áudio real) = 4788 frames |
| Cenas | 11 (C01 a C11) |
| Narração | 3ª pessoa, personagens da época (sem Lucas e Diego) |

Pra não repetir o problema do vídeo do Egito, desta vez:

1. Todos os arquivos vêm soltos no chat (além do .zip), então nada fica escondido dentro do pacote.
2. O `roteiro-1-asch.md` já tem o roteiro de produção inteiro, então não precisa exportar este documento.
3. Estrutura de pastas no projeto Remotion: `asch/` com o áudio, os dois JSON e o roteiro; `asch/img/` com todas as imagens.
4. No Claude Code: "Use a skill roteiro-imagens-remotion com os arquivos da pasta asch/".

## Personagens, figurino e cenário

Sem Lucas e Diego neste vídeo: personagens da época, no estilo do canal (contorno fino, cores chapadas, braços estilo borracha).

| Personagem | Roupa e cores | Expressões | Ficha |
| --- | --- | --- | --- |
| Estudante (o testado) | camisa azul-clara #cfe3f5, gravata #1f3a6b, calça cinza #6b6f78, sapato marrom, cabelo castanho-escuro com risca lateral | normal, confuso, nervoso suando, cedendo, alívio | ref-02 |
| Ator do lado (zombador) | camisa branca, colete de tricô vinho #8e2f3a, gravata #7a1f2b, calça bege #8a7253, cabelo loiro-escuro penteado | deboche, rindo, cochichando, sorriso "agora sim", surpreso | ref-03 |
| Outros 6 atores | camisas claras, gravatas estreitas, alguns com colete (verde, azul, bege, cinza), tons de pele variados | sérios, encarando | ref-04 |
| Pesquisador | genérico, óculos de armação grossa, colete marrom, gravata; NÃO imitar o rosto do Solomon Asch real | neutro | ref-01 |

**Sala de aula 1951** (C01–C07, C10, C11): parede bege #d9c9a3, piso de madeira #8a5a3c, quadro-negro verde #2f5a45 com "TESTE DE VISÃO" a giz, relógio de parede e janela com feixes de luz. A luz esfria e a vinheta aumenta da rodada 5 em diante. **Explicação** (C08, C09): fundo azul-escuro, sem sala. **Cartões** (ref-05): referência com 1 linha; opções A (curta), B (igual à referência, a certa) e C (média). Os atores sempre dizem A.

&#91;image: Figurino anos 50: estudante, ator do lado e pesquisador\]

&#91;image: Ficha do estudante com expressões\]

&#91;image: Ficha do ator do lado (zombador) com expressões\]

&#91;image: Cartões do teste: referência e opções A, B, C\]

## Cena por cena (tempos reais)

### C01 · 0,00–4,80 s (frames 0–288)

- **Fala:** Sete homens olharam pra uma linha claramente curta… e disseram que era a maior.
- **Ação:** os 7 homens levantam um cartão com a letra A (a linha curta), com atraso de 2–4 frames entre eles. Close no cartão de opções com anel VERMELHO na linha A.
- **Câmera:** 0 s close no cartão (zoom 1,8) → 2,2 s abre com spring mostrando os 7 (zoom 0,62)
- **Sons:** 0,3 s cartões em cascata; 2,2 s whoosh grave
- **Imagens (SÓ estas):** c01-abertura-sete-homens-storyboard.png, ref-04, ref-05, ref-06

### C02 · 4,80–10,40 s (frames 288–624)

- **Fala:** O oitavo, um estudante magrinho, piscou. O do lado riu: "Tá precisando de óculos, garoto?"
- **Ação:** o estudante pisca 2x, confuso. O zombador se inclina e ri.
- **Câmera:** plano dos dois (zoom 1,25) → 8,7 s push-in no zombador
- **Sons:** 5,2 s piscada; 7,9 s risadinha
- **Imagens:** c02-zombaria-oculos-storyboard.png, ref-02, ref-03

### C03 · 10,40–15,20 s (frames 624–912)

- **Fala:** Estados Unidos, 1951. Um teste de visão numa faculdade.
- **Ação:** plano geral: quadro-negro "TESTE DE VISÃO", carteiras, os 8 sentados, pesquisador de óculos com prancheta.
- **Câmera:** pan lento da janela até o quadro · **Tela:** 10,7 s "EUA • 1951" · **Sons:** tique-taque de relógio
- **Imagens:** c03-eua-1951-faculdade-storyboard.png, ref-06

### C04 · 15,20–23,90 s (frames 912–1434)

- **Fala:** Uma linha de referência, três opções e uma pergunta simples: qual tem o mesmo tamanho? Sozinha, quase ninguém erra: menos de um por cento.
- **Ação:** close nos cartões; em "qual tem o mesmo tamanho?" uma régua pontilhada liga a referência à B.
- **Tela:** 22,5 s "SOZINHO, ERRA < 1%" · **Sons:** 19,2 s giz; 22,5 s pop
- **Imagens:** c04-cartoes-menos-de-1-storyboard.png, ref-05

### C05 · 23,90–32,00 s (frames 1434–1920)

- **Fala:** Na primeira rodada, todo mundo acerta. Na terceira, os sete escolhem a linha errada. Ele fala a certa. A sala inteira vira pra ele.
- **Ação:** rodada 1 todos levantam B. Rodada 3: os 7 levantam A e o estudante levanta B (cartão verde). Em "vira pra ele" as 7 cabeças viram em onda, 2 frames de atraso entre elas.
- **Câmera:** plano geral → 30,1 s zoom rápido no estudante (6 frames)
- **Tela:** "RODADA 1 / 18" → 26,2 s "RODADA 3 / 18" · **Sons:** 30,2 s silêncio súbito + cadeiras rangendo
- **Imagens:** c05-rodada-1-e-3-storyboard.png, ref-04

### C06 · 32,00–38,10 s (frames 1920–2286)

- **Fala:** Na quinta, de novo. Ele sente o suor escorrer na nuca. O do lado cochicha: "Esse aí não enxerga nada."
- **Ação:** close no estudante; close extremo na nuca com a gota; o zombador cochicha cobrindo a boca. Luz mais fria.
- **Tela:** "RODADA 5 / 18" · **Sons:** 33,6 s batimento cardíaco começa; 36,6 s cochicho
- **Imagens:** c06-rodada-5-suor-storyboard.png, ref-02

### C07 · 38,10–46,10 s (frames 2286–2766)

- **Fala:** Na sétima, o pesquisador pergunta. Ele olha pras linhas, olha pros homens… e responde a errada. O do lado sorri: "Agora sim."
- **Ação:** olhos indo e voltando, push-in lento, hold de 12 frames… e ele levanta o cartão A. Zombador sorri satisfeito.
- **Tela:** "RODADA 7 / 18" · **Sons:** batimento acelerando; 43,0 s batimento para + impacto seco; 45,2 s música para
- **Transição:** a luz vai pra azul (15 frames)
- **Imagens:** c07-rodada-7-cede-storyboard.png, ref-02, ref-03

### C08 · 46,10–62,60 s (frames 2766–3756)

- **Fala:** Sabe por quê? Os sete eram atores. O único sendo testado era ele. Ser o único diferente numa sala incomoda de verdade. É tipo quando todo mundo ri de uma piada que você não entendeu… e você ri junto. Ou escolher a pílula azul do Matrix: é mais confortável fingir que está tudo certo.
- **Ação:** fundo azul. Etiquetas "ATOR" caem em cascata nos 7; anel de luz no estudante. Inset rápido de um grupo rindo e o estudante rindo sem graça. Uma pílula azul simples flutua e gira (nada do filme).
- **Sons:** drone grave; 47,3 s 7 carimbos; 55,0 s risadas abafadas; 58,0 s brilho
- **Imagens:** c08-sabe-por-que-atores-storyboard.png

### C09 · 62,60–67,80 s (frames 3756–4068)

- **Fala:** E não foi só ele. Três de cada quatro pessoas seguiram o grupo errado pelo menos uma vez.
- **Ação:** 4 bonequinhos; 3 ficam vermelhos um a um, 1 fica branco. **Tela:** 64,5 s "3 DE 4"
- **Imagens:** c09-tres-de-quatro-storyboard.png

### C10 · 67,80–74,20 s (frames 4068–4452)

- **Fala:** Mas o psicólogo Solomon Asch testou mais uma coisa. Colocou na sala um único ator que respondia a verdade.
- **Ação:** volta à sala com luz quente; a fileira levanta A, mas o 4º ator levanta B (cartão e anel verdes).
- **Tela:** 71,2 s "UM ÚNICO ATOR DIZ A VERDADE" · **Sons:** acorde positivo
- **Imagens:** c10-um-aliado-storyboard.png, ref-04

### C11 · 74,20–79,80 s (frames 4452–4788)

- **Fala:** E quase ninguém cedeu mais. Bastava uma voz… pra linha curta voltar a ser curta.
- **Ação:** o estudante, calmo, levanta B; o zombador fica de boca aberta. A câmera desce até o cartão e termina no close da linha A curta, igual ao 1º quadro (loop).
- **Sons:** 78,5 s tique-taque (o mesmo do começo)
- **Imagens:** c11-final-uma-voz-storyboard.png, ref-05

## Música, mapa de imagens, legenda e checklist

| Trecho (s) | Música |
| --- | --- |
| 0–46,1 | tensa, piano baixo e relógio; abaixa \~50% sob a narração; batimento entra em 33,6 |
| 46,1–67,8 | drone grave de mistério (luz azul) |
| 67,8–79,8 | volta suave e esperançosa; termina no tique-taque pro loop |

| Imagem | Cenas | Uso |
| --- | --- | --- |
| ref-01-figurino-anos50.png | todas com gente | roupas e cores da época |
| ref-02-ficha-estudante.png | C02, C05–C08, C11 | estudante |
| ref-03-ficha-zombador.png | C02, C06, C07, C11 | zombador |
| ref-04-atores.png | C01, C05, C08, C10 | os 7 atores |
| ref-05-cartoes.png | C01, C04, C11 | cartões das linhas |
| ref-06-cenario-sala.png | C01–C07, C10, C11 | sala de aula |
| cNN-…-storyboard.png | só a cena do número | enquadramento |

O fundo azul é SÓ do C08 e C09; a sala nunca aparece nessas duas cenas.

Legenda: palavra por palavra de `experimento-asch-legenda.json`; `destaque: true` = maior, maiúscula e amarela.

- [ ] Estudante, zombador, 6 atores e pesquisador com figurino anos 50
- [ ] Cartões erguidos (A brancos, B verde-claro) e cartões grandes com anéis vermelho/verde
- [ ] Onda das cabeças virando (C05), gota de suor e close na nuca (C06)
- [ ] Etiquetas ATOR em cascata e pílula azul simples (C08); bonequinhos 3 de 4 (C09)
- [ ] Luz esfriando de C06 a C07, azul em C08–C09, volta quente em C10
- [ ] Batimento em C06–C07; relógio no começo e no fim (loop)
- [ ] Duas revisões da skill roteiro-imagens-remotion antes do render final

## Storyboard

Um quadro por cena (C01 a C11). Os arquivos `cNN-…-storyboard.png` têm o mesmo número da cena.

&#91;image: Storyboard geral: C01 a C11\]
