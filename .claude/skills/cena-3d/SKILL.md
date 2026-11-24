---
name: cena-3d
description: Objetos e câmera 3D (Three.js via @remotion/three) misturados com as cenas 2D do canal, no mesmo visual — sombra em faixas duras, contorno escuro #1d1424, luz da esquerda. Use para esfera de energia, planetas, objetos girando, cristais, moedas, câmera orbitando um objeto, ou quando o usuário pedir algo em 3D. Os personagens Lucas e Diego continuam 2D.
---

# Cena 3D no estilo do canal

Ferramenta: `src/estilo2d/Objeto3D.tsx`. Exemplo funcionando: parte C de `src/videos/Ferramentas/TesteFerramentas.tsx`
(Lucas 2D carregando uma esfera de energia 3D, planeta e cristais girando ao fundo).
Já instalado: `three`, `@react-three/fiber`, `@remotion/three`. Regras gerais do Remotion: `.claude/skills/remotion-markup/3d.md`.

## Decisão: quando usar 3D
- ✅ Objetos que giram ou que a câmera rodeia (esfera de energia, planeta, cristal, moeda, troféu, dado, Terra),
  transições curtas e planos de 1–3 s de "impacto".
- ❌ **Personagens em 3D** (precisaria modelar e montar esqueleto: projeto à parte). ❌ Câmera em perspectiva nos bonecos
  2D (rejeitado pelo usuário). ❌ Cenas longas: sem GPU o render 3D é bem mais lento — use em planos curtos.

## Peças
| Peça | Uso |
|---|---|
| `<Camada3D cam={{pos, alvo, fov}}>` | camada transparente do tamanho do vídeo, por cima do `<svg>` 2D (ou antes dele, para ficar atrás) |
| `<Luzes3D />` | luz do canal (principal quente de cima/esquerda, recorte frio por trás) — já vem na Camada3D |
| `<Solido3D forma cor pos rot escala contorno tons />` | esfera, caixa, cone, cilindro, toro, icosaedro, octaedro, cápsula com toon + contorno |
| `<MaterialDesenho cor tons />` | material com sombra em faixas (2 tons = mais anime, 3 = padrão) para malhas próprias |
| `<EsferaEnergia3D f carga cor clara />` | esfera de energia com núcleo, camadas somando luz e anéis girando |
| `<Planeta3D f raio cor anel />` | planeta toon com anel |
| `orbita(angulo, distancia, altura, alvo)` | câmera girando em volta do objeto |

## Regras
1. **Tudo vem do quadro**: rotação, posição, carga e câmera calculadas com `f` (useCurrentFrame de quem chama) e as
   curvas do `anim.ts`/`movimento.ts`. **Proibido** `useFrame()` do react-three-fiber. `<Sequence>` dentro do 3D com `layout="none"`.
2. **Mesmo visual do 2D**: cores da paleta do episódio, contorno `0.05–0.08`, luz principal da esquerda (sombra à direita),
   aura com as cores `AURA_LUCAS`/`AURA_DIEGO`. Brilho no chão/personagem é feito no 2D (elipse/gradiente), acompanhando o 3D.
3. **Encaixar 3D com 2D**: câmera fixa `pos [0,0,10]`, `fov 35` ⇒ ~305 px por unidade no plano z=0, centro da tela = (0,0).
   Converta posição de tela → 3D com `telaPara3D` (ver exemplo) para pôr a esfera exatamente acima das mãos (`posMao`).
   Se mover a câmera 3D, mova o 2D junto (ou deixe o 3D só no fundo/objeto isolado).
4. **Movimento**: mesmas regras de antecipação/mola do canal — a carga cresce com `CURVA.sai`, pulsa de leve, os anéis
   giram em velocidades diferentes; nada gira em velocidade constante perfeita por muito tempo.
5. **Render**: sempre com `--gl=swangle` além do `--browser-executable`. Para conferir quadros: `npx remotion still ... --gl=swangle`.
   Avise o usuário do tempo extra (meça com um trecho curto antes do render final).
6. Modelos prontos (.glb) só se o usuário mandar o arquivo e a licença permitir; colocar em `public/modelos/` e carregar
   com `useGLTF` + `staticFile` (sem internet no render).

7. **Híbrido com câmera 3D movendo (órbita, dolly em profundidade)** — modelo: `src/videos/SaiyajinRemake/` (`mundo3d.tsx`):
   o cenário vira 3D (chão, pedras, rachaduras, onda de choque) e o personagem continua 2D, posto na tela pela projeção da
   câmera (`projeta(cam, [0,0,0])` = pés; altura pela projeção de [0,1.85,0]); duas camadas 3D (`Fundo3D` atrás e `Frente3D`
   na frente do personagem, separando objetos pela profundidade). Na órbita, o personagem vira com `vira = -sin(ângulo)`.
   Pedras e poses de 2 em 2 (`dois(f)`), câmera a 24. Revisão de 3D: checklist no agente `revisor-qualidade`.
