# Receitas de cena (copie e adapte)

Imports usuais numa cena:
```tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Boneco2D, ROSTO_BASE, posCabeca } from "../../estilo2d/Boneco2D";
import { Arena, CHAO_Y, Praca, Sala, Cozinha, RuaNoite, Quarto, Savana } from "../../estilo2d/Cenario2D";
import { AURA_DIEGO, AURA_LUCAS, AuraForte, CorrentesAura, PunhoBrilhando } from "../../estilo2d/Aura";
import { Brilhos, Gota, Impacto, LinhasFoco, Poeira, Simbolo, Veia } from "../../estilo2d/Efeitos2D";
import { CorteArco, Faiscas, Fumaca, OndaChoque, Onomatopeia, Rastro } from "../../estilo2d/EfeitosLuta";
import { Copo, Coracao, Espada, Garrafa, Hamburguer, Pulmoes } from "../../estilo2d/Objetos";
import { Placar, Rotulo2, Selo } from "../../estilo2d/UI";
import { CURVA, andarPerfil, giro, k, kPose, respira, tremor } from "../../estilo2d/anim";
import { AVO, CANDIDATOS, DIEGO, EXAMINADOR, LUCAS } from "../../estilo2d/personagens";
import { ESC, Grade, Lembranca, Palco, ROSTO_DIEGO, Som, frente, perfil, vivo } from "../Cacadores/comum";
import { T, TF } from "./tempo";
```

## Conferir alinhamento
```bash
python3 -c "
import json;d=json.load(open('src/videos/<Nome>/alinhamento.json'));cur=[]
for w in d['palavras']:
  cur.append(w)
  if w['w'][-1] in '.?!\"': print(f\"{cur[0]['s']:7.2f}  \"+' '.join(x['w'] for x in cur)); cur=[]"
```

## Personagem falando uma fala do roteiro
```tsx
const falaDe = T("Tenta não chorar") - t0;
const falaAte = TF("chorar Cachinho") - t0;
<Boneco2D id="d" d={DIEGO} pose={frente(1500, { cruzado: 1, vira: -0.5 })}
  rosto={vivo({ ...ROSTO_DIEGO, canto: 1, olhar: [-1, 0] }, f, "d", falaDe, falaAte)} />
```

## Dois personagens conversando (plano médio)
`Palco cam={{ x: 1250, y: 1000, zoom: 1.05 }}`, Lucas `frente(900, { vira: 0.5 })`, Diego `frente(1500, { vira: -0.5 })`.
Close de rosto: zoom 1.6–1.8 com `y` ~760. Close de olho: `posCabeca(pose)` + zoom 4.6–5.

## Correndo DE VERDADE (ciclo novo — prefira este)
`src/estilo2d/corrida.ts`: `poseCorrida(fase, "normal"|"rapida"|"ninja"|"panico", intensidade)` dá pernas (FK com
fase no ar e pé de apoio sem escorregar), braços opostos, inclinação e squash. `xCorrida(f, ciclo, estilo, escala)`
dá o deslocamento que mantém o pé plantado. Ciclos: normal 20, rápida 13–15, ninja 13, pânico 9 frames.
Poeira a cada passo: `contatos(fase, de, ate)` + `posPe`. Pulo: `pernasFK(...)` (ver `src/videos/Corrida/TesteCorrida.tsx`:
antecipa 4 frames → voo parabólico com joelhos encolhidos → pouso com squash). Câmera acompanha a altura do pulo.

## Correndo (câmera acompanha — versão antiga, simples)
```tsx
const camX = 1000 + f * 12;
const w = andarPerfil(f, 1, 8);
<Palco cam={{ x: camX + 60, y: 900, zoom: 1.3 }}>
  <Praca camX={camX} />
  <Boneco2D id="l" d={LUCAS} pose={perfil(1000 + f * 12, { y: CHAO_Y - w.bob, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: w.bracoD, inclina: 7 })} rosto={vivo(ROSTO_BASE, f, "l")} />
</Palco>
```

## Infográfico com o Lucas interagindo
Fundo `<Grade />` dentro de `<svg width={1080} height={1920}>`; o Lucas entra direto no svg com
`frente(x, { y: 1600..1720, escala: 0.5..0.75 })`. Ideias que funcionaram (ver Cacadores/Cenas1 S12, S13 e Cenas2 S23, S31, S36, S37):
- apontando para um gráfico de barras (`maoE: "aponta"`, depois `"joia"`);
- lupa (círculo com clipPath) ligada ao braço por linha tracejada, mostrando o "por dentro";
- órgão em raio-X sobre o peito (`<Pulmoes>`, `<Coracao>` em `translate(x, y - 600*escala)`);
- medidor/barra em cima da cabeça, rosto mudando conforme o valor;
- cutucar algo com o dedo e ele reagir (mola: `cos(t*0.5)*exp(-t*0.12)`).

## Aura
```tsx
// calma
<AuraForte x={x} chao={CHAO_Y} altura={1220 * ESC} f={f} forca={0.5} caos={0} id="a1" />
// explodindo (com tremor e tela piscando)
<AuraForte x={x} chao={CHAO_Y} altura={1220 * ESC} f={f} forca={1.3} caos={1} id="a2" />
// Diego
<AuraForte ... cor={AURA_DIEGO.cor} clara={AURA_DIEGO.clara} />
// concentrando no punho
<CorrentesAura x={x} chao={CHAO_Y} altura={1220*ESC} alvoX={mx} alvoY={my} f={f} prog={0..1} id="c" />
<PunhoBrilhando x={mx} y={my} f={f} forca={0..1} id="p" />
```
Desenhe a aura ANTES do personagem (fica atrás). Some com `forca` indo a 0 + `<Fumaca>`.

## Golpe com contato (soco/corte)
Atacante avança com `k(f, [[0, x0], [HIT, x1, CURVA.entra]])`; pare a ~300 px do outro (escala 0.72).
No frame HIT: `filter: invert(1)` em HIT e HIT+2, `tremor` 12 frames, `Faiscas` + `OndaChoque` + `Impacto` +
`Onomatopeia` no ponto de contato, sons `explosao`/`impacto`. Quem apanha: `inclina` pra trás + olhos 1.3.
Corte de espada: `<CorteArco x y r={420} de={280} ate={150} inicio={...} fim={...} />`.

## Lembrança (avô)
`<Lembranca>` (sépia + vinheta) em volta de um `<Palco>` com `AVO`; transição `<Iris>` no arquivo principal.

## Contagem com closes
Ver `S40` (Cacadores/Cenas2): 3 = olho do Lucas, 2 = olho do Diego, 1 = punho brilhando + `<Contagem>` global.

## Sons numa cena
`<Som src="whoosh" de={0} volume={0.4} />` (de = frame local). Batidas de coração aceleradas: vários `coracao`
com intervalos diminuindo (0, 14, 24, 32, 39).
