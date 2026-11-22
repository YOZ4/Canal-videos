# Canal-videos — guia para o Claude

Projeto Remotion de vídeos verticais (1080x1920, 30 fps) para o canal.

## Estilo principal: 2D vetorial (`src/estilo2d/`)
- Personagens oficiais em `personagens.ts` (Lucas: cacheado, camiseta azul; Diego: topete loiro, camiseta vermelha,
  olhar "meio fechado" e sorriso de canto, pose padrão braços cruzados). Folha renderizada: composição `Folha`.
- Visual: contorno escuro `#1d1424`, sombra suave no lado direito, olhos grandes com íris, braços "macarrão".
- `Boneco2D.tsx`: pose (ombro/cotovelo em graus, pernas com IK — pés ficam plantados, `agacha`, `estica`
  para squash & stretch, `cruzado`) e rosto (olhos, olhar, sobrancelha, sorriso, boca, canto).
- `anim.ts`: keyframes com curva por trecho (`k`, `kPose`, `kRosto`), `CURVA.antecipa/exagera/...`,
  automáticos `piscar`, `respira`, `fala`, `andar`, `tremor`.
- `UI.tsx`: legenda palavra-por-palavra (`frase("texto *destaque*", de, ate)`), `Selo` (tópico no topo),
  `Etiqueta` (nome sobre o personagem), `Placar` (contador).
- `Cenario2D.tsx`: praça ao pôr do sol com parallax. Câmera = transform do SVG (x, y, zoom).
- Chicote de câmera com `CameraMotionBlur` (@remotion/motion-blur) só nos frames do movimento.

## Regras de animação (aprendidas das referências)
- Corte/mudança de plano a cada ~1,5–2,5 s. Legenda 1 palavra por vez, palavra-chave em laranja.
- Sempre: antecipação antes de ações, overshoot ao parar, cabeça atrasada em relação ao corpo,
  squash no impacto (+ poeira + tremor de câmera), personagens nunca 100% parados (respira/pisca).
- Infográficos/medidas (réguas, placares, setas) reforçam o que a narração diz.
- Não copiar personagens, marcas ou @ de outros canais.

## Renderizar neste ambiente (sem GPU / sem acesso ao download do Chrome)
npx remotion render <Composicao> out/<arquivo>.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
(3D com @remotion/three: adicionar --gl=swangle). Fontes ficam em public/fonts (sem internet no render).
