# Canal-videos

Vídeos do canal feitos com [Remotion](https://www.remotion.dev/) + 3D ([@remotion/three](https://www.remotion.dev/docs/three) / React Three Fiber).

## Estrutura

- `src/Root.tsx` – registra as composições
- `src/LucasSaiyajin.tsx` – vídeo de teste: Lucas (personagem 3D cartoon) girando e se transformando
- `public/fonts/` – fontes locais (renderiza sem depender da internet)
- `out/` – vídeos renderizados
- `.claude/skills/` – skills oficiais do Remotion (`npx skills add remotion-dev/skills`)

## Comandos

```bash
npm install
npm run dev       # abre o Remotion Studio para editar/pré-visualizar
npm run render    # gera out/lucas-saiyajin.mp4
```

Em máquinas sem GPU (servidor/CI), renderize com GL por software:

```bash
npx remotion render LucasSaiyajin out/lucas-saiyajin.mp4 --gl=swangle
```
