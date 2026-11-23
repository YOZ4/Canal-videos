---
name: desenho-a-mao
description: Efeito "quadro branco / desenhado à mão" no Remotion — gráficos, setas, círculos, sublinhados e textos que se desenham com uma caneta seguindo a ponta, em sincronia com a narração. Use em trechos explicativos (números, comparações, "E se você...?", passo a passo, linha do tempo), quando o usuário pedir estilo whiteboard/rascunho/desenho à mão, ou quando um infográfico precisar "ser construído" na frente do espectador.
---

# Desenho à mão (whiteboard) no estilo do canal

Ferramenta: `src/estilo2d/Desenho.tsx`. Fonte de mão: `FONTE_MAO` (Patrick Hand, em `public/fonts`, licença OFL).
Exemplo funcionando: parte B de `src/videos/Ferramentas/TesteFerramentas.tsx` (Lucas explica juros compostos).

## O que tem
| Peça | Uso |
|---|---|
| `<Papel grade />` | fundo de papel com vinheta (grade opcional) |
| `<Desenho f de tracos velocidade />` | desenha traços em sequência, com caneta na ponta e viajando entre traços |
| `<TextoMao f de texto x y tamanho ancora id />` | texto sendo escrito da esquerda pra direita |
| `eixos(x, y, larg, alt)` | eixos de gráfico com setinhas |
| `curvaGrafico(x, y, larg, alt, valores, max)` | pontos da linha do gráfico a partir de números reais |
| `seta(a, b, {bojo})` · `circulado(cx, cy, rx, ry)` · `sublinhado(x0, x1, y)` | marcações em laranja `#e0603a` |
| `duracaoDesenho(tracos, vel)` · `planoDesenho()` · `duracaoTexto()` | quanto tempo cada parte leva (para encaixar na fala) |

## Regras para parecer desenho de verdade
1. **Velocidade de caneta constante** (px por quadro: 40 calmo · 55 normal · 80 apressado), não duração fixa:
   traço longo demora mais. O `<Desenho>` já faz isso e acelera/freia em cada traço.
2. **Ordem natural**: título → eixos → dados → destaque (círculo/seta) → valor escrito. Uma coisa por vez,
   começando um pouco ANTES da palavra da narração (`T("trecho") - 6`).
3. **Pausa entre traços** (`pausa` 3–8 quadros) e caneta saindo de cena no fim. Destaques em outra cor de caneta (`corCaneta`).
4. **Tremido fixo** (`tremor` 1,5–3 px). **Não** fazer contorno "fervendo" (muda a cada quadro) — o usuário rejeitou.
5. **Personagem interage**: Lucas/Diego apontam (mão `aponta`, braço com mola) para o que acabou de ser desenhado,
   olham para lá (`olhar`) e reagem ao destaque. Use `posMao`/`posCabeca` para posicionar balões.
6. Os números do gráfico vêm do roteiro (dado real) — infográfico reforça o que a narração diz.
7. Pode misturar com a cena 2D: um quadro/caderno dentro do cenário, ou corte para "tela de papel" de 2–4 s.

## Receita
```tsx
import { Desenho, Papel, TextoMao, eixos, curvaGrafico, seta, circulado, duracaoDesenho } from "../../estilo2d/Desenho";
const EIXOS = eixos(150, 1080, 800, 560);
const LINHA = [{ pontos: curvaGrafico(150, 1080, 800, 560, VALORES), cor: "#2b6cff", largura: 11 }];
const t1 = T("cresce") - 6, t2 = t1 + duracaoDesenho(EIXOS) + 6;
<svg viewBox="0 0 1080 1920"><Papel grade />
  <TextoMao f={f} de={T("titulo")} id="t" texto="Juros compostos" x={540} y={300} tamanho={110} ancora="middle" />
  <Desenho f={f} de={t1} tracos={EIXOS} semente="e" />
  <Desenho f={f} de={t2} tracos={LINHA} velocidade={45} semente="l" />
</svg>
```
`id` do TextoMao e `semente` do Desenho precisam ser únicos na cena. Som: risco de caneta baixo (pode sintetizar
um `caneta.wav` com ruído filtrado, como os outros SFX) durante cada traço.
