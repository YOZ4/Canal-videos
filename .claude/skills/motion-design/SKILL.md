---
name: motion-design
description: Timing, easing e coreografia para tudo o que NÃO é o boneco — títulos, legendas especiais, cartões, listas, placares, infográficos, setas, ícones, objetos de cena, transições e câmera — para o vídeo parecer profissional e não "PowerPoint". Use ao criar ou revisar cenas com gráficos/textos/infográficos, quando algo "aparece do nada", entra tudo junto, fica parado/morto ou sai devagar demais. Para movimento dos personagens use analise-movimento-remotion.
---

# Motion design do canal (gráficos, textos, objetos, câmera)

Ferramenta: `src/estilo2d/coreografia.ts`. Exemplo funcionando: parte A de `src/videos/Ferramentas/TesteFerramentas.tsx`
(composição `TesteFerramentas`). Responda ao usuário em português simples (ele não é programador).

## As 8 regras
1. **Ninguém entra sozinho do nada**: todo elemento tem entrada (`entrada()` / `vida()`), vida enquanto está na tela
   (`flutua()` — nunca 100% parado) e saída (`saida()`).
2. **Saída mais curta que a entrada** (entra ~10 quadros com mola, sai ~6 acelerando — `Easing.in`). Sair devagar = cansativo.
3. **Cascata, nunca tudo junto**: listas e grupos entram com `escalonado(de, i, 3–7)`. Ordem = ordem de leitura
   (cima→baixo, esquerda→direita) ou do mais importante para o detalhe. Na saída, a cascata pode ser inversa e mais rápida.
4. **Uma coisa importante por vez**: enquanto o destaque acontece, o resto fica quieto. Antes do destaque, `TEMPO.pausa`
   (~12 quadros) de respiro. Destaque = `pulso()` no item que a narração cita, no quadro exato da palavra (use `T()`/`F()`).
5. **Curva certa para cada caso** (nunca linear em movimento):
   | Situação | Use |
   |---|---|
   | Elemento chegando | mola `natural` (cartões, textos) ou `solto` (ícones, selos, números) |
   | Algo pesado caindo/pousando | `entrada(..., "desce")` + poeira/tremor se for grande |
   | Saindo | `saida()` (Easing.in.cubic) |
   | Número subindo | `conta()` (Easing.out.exp — desacelera no final) |
   | Câmera indo de A a B | `CURVA.suave` e chegada com mola `firme` (sem balanço) |
   | Chicote / impacto | `CURVA.antecipa` + `CameraMotionBlur` só nesses quadros |
6. **Profundidade**: fundo se mexe menos e mais devagar que o primeiro plano (parallax; círculos de fundo com mola mais
   pesada). Elementos maiores = mais lentos e com menos overshoot; pequenos = mais rápidos e elásticos.
7. **Durações** (`TEMPO`, a 30 qps; em vídeo 24 qps use `qd(n, 24)`): instante 4 · rápido 6 · médio 10 · lento 16 ·
   pausa 12 · cascata 4. Nada de informação na tela por menos de ~1 s (o olho não lê).
8. **Sincronia com a narração e o som**: o elemento chega (não começa) na palavra — comece a entrada ~3–5 quadros antes.
   Todo "pop" de entrada importante ganha `pop.wav`/`plim.wav`; contadores ganham som contínuo baixo.

## Receita rápida
```tsx
import { vida, escalonado, pulso, conta, estiloCss, transformSvg, compoe, entrada, saida, TEMPO } from "../../estilo2d/coreografia";
const e = vida(f, T("fala-3") - 4, TF("fala-4"), "sobe");               // entra, flutua, sai
<div style={estiloCss(e)}>...</div>                                       // HTML
<g transform={transformSvg(e, cx, cy)}>...</g>                            // SVG (gira/escala em volta de cx,cy)
ITENS.map((it, i) => vida(f, escalonado(de, i, 6), ate, "esquerda", { semente: i }))
const valor = Math.round(conta(f, de, 40, 96));                           // placar
const s = pulso(f, T("noventa"), 0.15);                                   // destaque na palavra
```

## Checklist (o revisor-qualidade cobra isto)
- [ ] Algum elemento surge/some num quadro só (sem entrada/saída)? 
- [ ] Mais de 2 coisas começam no mesmo quadro?
- [ ] Algum texto/ícone fica completamente parado por mais de 1 s?
- [ ] A saída é mais lenta que a entrada?
- [ ] O destaque bate com a palavra da narração (± 3 quadros)?
- [ ] Algum `interpolate` de movimento sem `easing`?
- [ ] Texto fica na tela tempo suficiente para ler (≥ 1 s + 0,3 s por palavra)?
