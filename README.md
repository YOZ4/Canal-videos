# Canal-videos

Vídeos do canal feitos com [Remotion](https://www.remotion.dev/) + 3D ([@remotion/three](https://www.remotion.dev/docs/three) / React Three Fiber).

## Estrutura

- `MEMORIA.md` – **memória do projeto**: histórico, decisões aprovadas/rejeitadas, pendências
- `src/videos/Broly/` – episódio "Fúria Verde" (estilo JJK, v1 e v2)
- `src/videos/Cacadores/` – "Caçadores" parte 1 (v4)

- `src/Root.tsx` – registra as composições
- `src/estilo2d/` – **estilo principal 2D**: Lucas e Diego articulados, animação por keyframes, legendas, cenário (ver CLAUDE.md)
- `src/videos/Saiyajin2D/` – "E se você virasse um Saiyajin?" em 2D (v1, v2 e **v3** — versão mais recente, com visual novo, transições, trilha e sons)
- `src/videos/Luta/` – teste de luta Lucas × Diego (15 s)
- `src/videos/TesteAnimacao/` – teste 2D de 15 s (Lucas e Diego)
- `src/estilo/` – kit 3D (bonecos 3D, usado no TesteEstilo):
  - `Puppet.tsx` – personagem "boneco" articulado (poses + expressões) e o visual do Lucas
  - `Cenario.tsx` – cena 3D com desfoque de fundo, árvores, chão, capim, luzes, câmera
  - `Overlays.tsx` – legendas com destaque amarelo (`*palavra*`), rótulos, flash, vinheta e granulado
  - `fontes.ts` – fontes locais (Roboto Condensed para legendas, Fredoka para rótulos)
- `src/videos/TesteEstilo/` – teste de 15 s no estilo boneco 3D (4 cenas)
- `src/videos/LucasSaiyajin.tsx` – primeiro teste (cartoon girando)
- `public/fonts/` – fontes locais (renderiza sem depender da internet)
- `out/` – vídeos renderizados
- `.claude/skills/` – skills oficiais do Remotion (`npx skills add remotion-dev/skills`)

## Comandos

```bash
npm install
npm run dev       # abre o Remotion Studio para editar/pré-visualizar
npm run render:animacao  # gera out/teste-animacao.mp4
npm run render:teste  # gera out/teste-estilo.mp4
npm run render        # gera out/lucas-saiyajin.mp4
```

Em máquinas sem GPU (servidor/CI), renderize com GL por software:

```bash
npx remotion render LucasSaiyajin out/lucas-saiyajin.mp4 --gl=swangle
```
