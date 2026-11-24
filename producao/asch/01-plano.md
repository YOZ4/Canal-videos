# Experimento de Asch — plano (skill roteiro-imagens-remotion)

1080×1920, 60 qps, 79,80 s = 4788 quadros. Áudio `public/narracao/asch.mp3`. Legenda: `src/videos/Asch/legenda.json`
(tempos reais por palavra + `destaque`). Cenas: `src/videos/Asch/cenas.json` (tempos do Roteiro 1).

## Etapa 1 — mapa de cenas
| Cena | Quadros | Fala (resumo) | Intenção | Ação / câmera | Tela / sons |
|---|---|---|---|---|---|
| C01 | 0–288 | Sete homens… disseram que era a maior | estranheza, gancho | close no cartão (anel vermelho na A, zoom 1,8) → 2,2 s abre com mola nos 7; cartões A sobem em cascata (2–4 q) | papel em cascata, whoosh grave |
| C02 | 288–624 | O oitavo… "Tá precisando de óculos?" | constrangimento | estudante pisca 2×, confuso; zombador se inclina e ri; 8,7 s push-in nele | tic da piscada, risadinha |
| C03 | 624–912 | EUA, 1951. Teste de visão | contexto | plano geral (0,6), pan da janela até o quadro; 8 sentados + pesquisador | "EUA • 1951", tique-taque |
| C04 | 912–1434 | Uma linha de referência… menos de 1% | clareza | close nos cartões (1,4); 19,1 s desliza da referência até a B; régua pontilhada | giz, pop, "SOZINHO, ERRA < 1%" |
| C05 | 1434–1920 | Rodada 1… rodada 3… a sala vira pra ele | tensão subindo | rodada 1 todos B; rodada 3 os 7 A, estudante B verde; cabeças viram em onda (2 q); 30,1 s zoom rápido | RODADA 1/18 → 3/18; silêncio + cadeiras |
| C06 | 1920–2286 | Na quinta… suor na nuca… cochicho | angústia | close rosto (1,4) → close extremo na nuca com gota → pan até o zombador cochichando; luz mais fria | RODADA 5/18; batimento; cochicho |
| C07 | 2286–2766 | Na sétima… responde a errada. "Agora sim" | queda | pesquisador pergunta; olhos indo e voltando, push-in, hold 12 q; corte no cartão A subindo; zombador sorri; luz azul em 15 q | RODADA 7/18; batimento acelera → para + impacto; música para |
| C08 | 2766–3756 | Sabe por quê? Atores… pílula azul | revelação | fundo azul; etiquetas ATOR em cascata; anel de luz no estudante; inset do grupo rindo; pílula azul simples | drone, 7 carimbos, risadas, brilho |
| C09 | 3756–4068 | Três de cada quatro | dado | 4 bonequinhos: 3 ficam vermelhos, 1 branco | "3 DE 4", 3 pops graves + 1 agudo |
| C10 | 4068–4452 | Um único ator dizia a verdade | esperança | sala com luz quente; fileira A, o 4º levanta B (cartão e anel verdes); zoom no aliado | "UM ÚNICO ATOR DIZ A VERDADE", acorde |
| C11 | 4452–4788 | Bastava uma voz… | alívio, loop | estudante calmo levanta B; zombador boquiaberto; câmera desce até o cartão e termina no close da linha A (= quadro 0) | cartão, tique-taque |

### Imagens
As imagens de referência (ref-01…06 e os 11 storyboards) **não foram enviadas** nesta conversa (só áudio, roteiro e os
2 JSON). Decisão: produzir pelas descrições do roteiro (cores em hex, figurino, cenário, enquadramento por cena).
Mapa imagem → cena respeitado pelo texto: sala só em C01–C07, C10, C11; fundo azul só em C08 e C09.

### Decisões registradas
- Cartão grande (referência + A, B, C) preso no quadro-negro, no fundo da sala, atrás da fileira — assim o close do C01/C04/C11
  e o plano geral são o mesmo lugar (mundo contínuo) e o loop final casa com o quadro 0.
- Os 8 ficam "sentados" atrás de carteiras (a carteira cobre as pernas), de frente pra câmera; o estudante é o último à direita,
  o zombador ao lado dele, o aliado do C10 é o 4º.
- C01: os cartões sobem em cascata junto com a abertura da câmera (2,2 s) para a cascata aparecer na tela.

## Etapa 2 — plano visual e de movimento
- Camadas: parede bege #d9c9a3 + rodapé, quadro-negro #2f5a45 com "TESTE DE VISÃO" a giz e o cartão, relógio (ponteiro anda),
  janela com feixes de luz e poeira flutuando, piso de madeira #8a5a3c; carteiras na frente dos personagens; HUD e legenda por cima.
- Luz (overlay de cor + vinheta): quente C01–C05 → mais fria C06 → fria com vinheta forte C07 → azul C08–C09 → quente C10–C11.
- Movimento: camada de naturalidade (`criarAnimacao`: cabelo com mola, rosto atuado com `rostoAtuado`); cartões sobem com
  antecipação (abaixa 4 q), sobem com mola e balançam; braço e antebraço defasados; cascatas com 2–4 q por pessoa e variação
  `random`; cabeças em onda com 2 q de atraso; respiração/piscada sempre; hold de 12 q antes de ceder; impacto seco com tremida.
- Câmera: keyframes por cena com curva e mola (abertura do C01 com mola, snap de 6 q no C05, push-ins lentos), sem cortar rostos.
- 60 qps: funções do anim.ts recebem f/2.
