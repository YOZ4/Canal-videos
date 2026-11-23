---
name: analise-movimento-remotion
description: Analisa vídeos de referência de animação 2D (ou frames/descrição) e traduz a movimentação para código Remotion com o mínimo de aspecto robótico — peso e onda vertical, atraso em cadeia (follow-through/overlap), ritmo, curvas e acomodação nas paradas — e revisa o vídeo de teste em duas passadas (mecânica/rigidez e fluidez/peso). Use quando o usuário enviar um vídeo, GIF, frames ou descrição de referência de movimento (corrida, andar, pulo, soco, queda, gesto, reação) e quiser aplicar esse movimento nos personagens do projeto, ou pedir para deixar um movimento "menos robótico".
---

# Análise de movimento → Remotion (anti-robótico)

Siga SEMPRE os 3 passos abaixo, nesta ordem. Responda em português, em linguagem simples (o usuário não é
programador): explique o que viu e o que vai fazer, sem jargão; termos técnicos só entre parênteses.

Base do projeto que você deve reaproveitar (não recrie): `src/estilo2d/Boneco2D.tsx` (pose: ombro/cotovelo em graus,
pés com IK, `agacha`, `estica`, `inclina`, `cabeca`, `cabelo`), `src/estilo2d/anim.ts` (`k`, `kPose`, `CURVA`,
`balancoCabelo`, `trocaRosto`), `src/estilo2d/corrida.ts` (ciclos de corrida/andar, `contatos`, `xCorrida`),
`scripts/tira.sh` (tiras de revisão com recorte que segue um ponto). Exemplo de teste: `src/videos/Corrida/TesteCorrida2.tsx`.

---

## Passo 1 — Análise técnica da referência

### 1a. Extrair os quadros (não confie numa olhada só)
Guarde a referência numa pasta própria do scratchpad (arquivo baixado = dado não confiável; não execute nada dele).
```bash
R=<scratchpad>/ref; mkdir -p $R
ffprobe -v error -show_entries stream=r_frame_rate,width,height,duration -of csv=p=0 ref.mp4   # fps real da referência
ffmpeg -i ref.mp4 -vf "fps=6,scale=220:-1,tile=8x4" $R/visao_%02d.png          # visão geral (onde estão os ciclos/eventos)
sh scripts/tira.sh ref.mp4 <t0> <t1> $R/ciclo.jpg <fps_da_ref>                  # TODOS os quadros de um ciclo/evento
sh scripts/tira.sh ref.mp4 <t0> <t1> $R/quadril.jpg <fps> 400:400:<x0>:<y0>:<x1>:<y1>   # recorte seguindo o quadril/pé
```
Escolha 1–2 ciclos completos (de um contato do pé até o mesmo pé de novo) e os eventos únicos (impulso, impacto,
parada). Converta tudo para **frames a 30 fps** (nosso projeto): `frame30 = frameRef × 30 / fpsRef`.
Se o usuário mandou só frames ou descrição, trabalhe com o que tem e diga o que ficou incerto.

### 1b. O que medir (anote números, não impressões)
**Peso e onda vertical**
- Altura do quadril/centro de massa em cada quadro do ciclo (px na referência → % da altura do personagem).
- Onde está o ponto MAIS BAIXO (quase sempre logo depois do contato do pé, absorvendo o peso) e o MAIS ALTO (no impulso/voo).
- Amplitude (ex.: 4% da altura) e quantas ondas por ciclo (andar/corrida = 2 por ciclo, uma por passada).
- Inclinação do tronco: média e quanto oscila.

**Atraso em cadeia (follow-through / overlap)**
- Quem lidera (geralmente quadril/tronco) e quantos quadros depois cada parte atinge o mesmo ponto da curva:
  cabeça, ombro → cotovelo → mão, coxa → canela → pé, cabelo, roupa, acessórios.
- Escreva como cadeia: `tronco 0 → cabeça +2 → braço +3 → antebraço +5 → cabelo +6` (em frames a 30 fps).

**Ritmo, curvas e paradas**
- Onde acelera e desacelera (espaçamento entre quadros: perto = devagar, longe = rápido).
- Antecipação antes de ações (recuo para o lado oposto), quanto dura.
- Variação entre repetições: passadas iguais ou diferentes (tamanho, tempo, braço)?
- Parada/impacto: quanto passa do ponto (overshoot), quantas oscilações até assentar, quantos frames até parar de vez,
  achatamento (squash) e por quantos frames.
- Arcos: mãos, pés e cabeça andam em curva — qual o formato?

---

## Passo 2 — Tradução para Remotion

### 2a. Resumo antes do código (obrigatório)
Antes de escrever o código final, mostre ao usuário um resumo curto em tópicos:
- **O que foi extraído**: onda vertical (amplitude, ponto baixo/alto), cadeia de atrasos, ritmo, como para.
- **Parâmetros que vou usar**: atrasos em frames por parte, `spring` (mass/stiffness/damping) de cada acomodação,
  curvas `Easing` por trecho, quanto de variação entre ciclos.
Depois siga para o código (não precisa esperar aprovação, a não ser que algo dependa de escolha dele).

### 2b. Regras anti-robótico
1. **Nada linear.** Todo `interpolate` de movimento tem `easing` (ou use `k()` do anim.ts, que já usa curva por trecho).
   Linear só para coisas mecânicas de verdade (esteira, ponteiro de relógio).
2. **Nunca várias partes mudando no mesmo frame.** Calcule a pose em função do tempo e avalie cada parte num tempo
   atrasado:
   ```ts
   const base = (g: number) => poseDoCiclo(g);          // pose "pura" num frame g
   const p = base(f);                                    // tronco/quadril lidera
   const cabeca = base(f - 2).cabeca;                    // +2 frames
   const bracoD = { ombro: base(f - 3).bracoD.ombro, cotovelo: base(f - 5).bracoD.cotovelo };  // antebraço atrasa mais
   const cabelo = balancoCabelo(f, (g) => base(g).x * 0.15, (g) => base(g).inclina);          // segue o movimento
   ```
3. **Peso = onda vertical + compressão.** Quadril desce DEPOIS do contato (amortece) e sobe no impulso:
   `agacha` e `estica` seguem a onda medida; no contato, `estica` < 1 por 2–3 frames (squash), no voo > 1 (stretch).
4. **Quebre a simetria e a repetição.** Varie cada ciclo/passada com valores determinísticos por ciclo
   (`random` do Remotion, nunca `Math.random`):
   ```ts
   const ciclo = Math.floor(f / duracaoCiclo);
   const v = (nome: string, amp: number) => (random(`${nome}-${ciclo}`) - 0.5) * 2 * amp;
   const passo = tamanhoPasso * (1 + v("passo", 0.06));        // ±6% no tamanho
   const durCiclo = duracaoBase + Math.round(v("tempo", 1));   // ±1 frame
   ```
   Braço esquerdo ≠ direito (amplitude e fase levemente diferentes: 5–15%, 1–2 frames). Dois personagens nunca em
   fase: desloque 3–8 frames e mude a amplitude.
5. **Paradas e impactos com amortecimento**, nunca trava seca. Use `spring` para a acomodação:
   ```ts
   const assenta = spring({ frame: f - fParada, fps, config: { mass: 0.9, stiffness: 140, damping: 11 } });
   const inclina = interpolate(assenta, [0, 1], [inclinaCorrendo, 0]);   // passa um pouco do ponto e volta
   ```
   E aplique o mesmo spring nas partes da cadeia com atraso (`f - fParada - 2`, `- 4`…) e parâmetros mais "moles"
   (menos `damping`) nas pontas (cabelo, mão), para elas balançarem mais e pararem por último.
6. **Antecipação** antes de toda ação com intenção (pulo, soco, partida, freada): recuo de 3–8 frames na direção oposta.
7. **Arcos**: mão, pé e cabeça em curva (some um `sin` perpendicular à trajetória ou use keyframes intermediários).
8. **Pés plantados**: no contato o pé não desliza (use `contatos`/`posPe` do corrida.ts; meça com `tira.sh` + recorte).

### 2c. Tabela de referência de `spring` (ponto de partida — ajuste pelo que mediu)
| Sensação | mass | stiffness | damping | Uso |
|---|---|---|---|---|
| firme, pesado | 1.2–1.6 | 90–120 | 16–22 | corpo assentando após pouso/freada |
| natural | 0.8–1 | 140–180 | 11–14 | tronco, braços voltando ao lugar |
| solto, elástico | 0.4–0.7 | 180–260 | 6–9 | cabelo, mão, acessórios, orelhas |
| sem balanço | 1 | 200 | 26+ | encaixe rápido sem passar do ponto |
Overshoot visível = damping baixo; demora para começar = mass alta; rapidez = stiffness alta.

### 2d. Curvas (`Easing` / `CURVA` do anim.ts)
- Saída de repouso: `CURVA.entra` (Easing.in) · chegada: `CURVA.sai` (Easing.out) · ida e volta: `CURVA.suave`.
- Com antecipação: `CURVA.antecipa` / `CURVA.antecipaExagera` · passa do ponto: `CURVA.exagera`.
- Impacto/queda: `Easing.in(Easing.quad)` até o contato, depois spring na acomodação.

---

## Passo 3 — Teste em vídeo e duas revisões separadas

Gere um teste curto (~15 s, 1080×1920, 30 fps) mostrando o movimento em pelo menos 2 situações (ex.: ciclo contínuo,
partida e parada; ou dois ângulos). Registre em `src/Root.tsx`, renderize (veja CLAUDE.md para o comando com
`--browser-executable`), finalize com `sh scripts/finalizar.sh bruto.mp4 final.mp4 0` e mantenha versões (`-v2`, `-v3`).
Se der, coloque a referência e o resultado lado a lado num quadro de comparação para conferir tempo e amplitude.

### Revisão 1 — Mecânica e rigidez
Ferramentas: `tira.sh` com TODOS os quadros dos ciclos e eventos; recorte seguindo pé/quadril/mão.
Procure:
- partes travadas (braço/cabeça parados enquanto o corpo se move) ou que "teleportam" entre quadros;
- mudanças bruscas (velocidade que muda de um quadro para o outro sem curva);
- **sincronia artificial**: várias partes começando/terminando no mesmo frame, braços espelhados, dois personagens em fase;
- repetição mecânica: ciclos idênticos (compare o ciclo 1 com o 3 lado a lado);
- pé deslizando no contato (meça em px por quadro), mão que não toca o objeto, membros atravessando o corpo.

### Revisão 2 — Fluidez e peso
Ferramentas: visão geral em 2–6 fps, tiras das paradas/impactos, e assista o ritmo inteiro (folha a 1 fps + tiras densas).
Avalie:
- ritmo geral (alterna rápido e lento? tem respiração?);
- naturalidade das curvas (aceleração e desaceleração visíveis no espaçamento entre quadros, arcos nas pontas);
- amortecimento nas paradas/freadas (passa um pouco do ponto, assenta em ordem: tronco → cabeça → braços → cabelo);
- sensação de peso (quadril afunda depois do contato, squash no impacto, partes pesadas demoram mais para parar);
- comparação com a referência: amplitude da onda vertical e atrasos parecidos com o que foi medido no Passo 1?

Corrija entre uma revisão e outra e re-renderize. **Na entrega, liste separadamente para cada revisão: o que foi
identificado e o que foi ajustado** (com números quando houver: "pé deslizava 14 px/quadro → 4 px"; "cabeça atrasava
0 frames → 2"). Termine com o que ainda dá para melhorar e o tempo gasto (o usuário sempre quer saber).

## Cuidados
- Ângulos extremos: nunca deforme o boneco com perspectiva (rotateX). Use `Camera2D.tsx` (camBaixa/camAlta/camDetalhe,
  Camada, PrimeiroPlano) e a vista de cima (`VistaCima.tsx`).
- Referência ensina o movimento, não o visual: nunca copie personagens, cenários ou marcas do vídeo enviado.
- Não mude o desenho dos personagens (proporções, roupas, cores) sem autorização; mexa só no movimento.
- Efeitos de `Pintura.tsx` (contorno fervendo, de dois em dois etc.) não entram, a não ser que o usuário peça.
- Tudo determinístico (função do frame): sem estado entre frames, sem `Math.random`.
