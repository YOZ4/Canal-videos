# Canal-videos

Vídeos do canal feitos com [Remotion](https://www.remotion.dev/) + 3D ([@remotion/three](https://www.remotion.dev/docs/three) / React Three Fiber).

## Estrutura

- `src/Root.tsx` – registra as composições
- `src/estilo/` – kit reutilizável do estilo do canal:
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
npm run render:teste  # gera out/teste-estilo.mp4
npm run render        # gera out/lucas-saiyajin.mp4
```

Em máquinas sem GPU (servidor/CI), renderize com GL por software:

```bash
npx remotion render LucasSaiyajin out/lucas-saiyajin.mp4 --gl=swangle
```
