# 03 — Animação: "O homem que vendeu a Torre Eiffel"

O papel do `animador-remotion` foi feito pela sessão principal, que já tinha o contexto do pacote e da direção.

## Onde está
- Composição `TorreEiffel` (60 qps, 4874 quadros): `src/videos/TorreEiffel/`.
  - `comum.tsx`: tempos, molas a 60 qps (`M`), `resp`/`pisca` calibrados (anim.ts conta a 30 qps), rostos (RL/RP/RC),
    `tremor`, `mistura` de cor e legendas do `legenda.json`.
  - `CenasA.tsx`: C01, C02, C03, C04, C05 e C12.
  - `CenasB.tsx`: C06 a C11.
  - `TorreEiffel.tsx`: troca de cena, legenda, música e sons.
- Personagens: `homem1925()` em `personagens.ts` gera LUSTIG, LUSTIG_RUA, POISSON, POISSON_RUA, POISSON_VERMELHO e
  COMERCIANTES_1/2. O Boneco2D ganhou:
  - `terno` (lapela, camisa em V, botões, lenço e mangas compridas com punho branco);
  - `bigodeTipo` fino ou grosso, com `corBigode`;
  - `chapeu`: fedora, coco ou boina (componente exportado como `Chapeu`);
  - cabelos `penteado`, `careca` e `curto`;
  - `maoNaFrente`, que desenha o braço na frente do rosto (para o "shh" e para cobrir o rosto);
  - `alcancar(pose, "E"|"D", alvo, ombroMax)`, que acha o ângulo do braço para a mão chegar num ponto.
- Cenários e objetos (`src/estilo2d/Cenarios1925.tsx`):
  - cenários: SalaoHotel (cortina animável, lustre, abajur), MesaToalha, CeuParis, PredisParis, Calcamento
    (variações dia, sépia e nublado);
  - torres: TorrePlana e **Torre3D**, uma treliça projetada de verdade, com 4 faces ordenadas por profundidade,
    giro, contra-plongée e ferrugem;
  - objetos: Documento, Envelope, Nota, Carro1925, Anzol, Peixe, Cracha (vira), PortaPolicia, Caderno;
  - HUD: EtiquetaHUD, Carimbo (vem de perto e bate) e Numero3D (contador extrudado).
- Sons: `scripts/gerar_sons_1925.py`. Gera o jazz anos 20 normal, com filtro de rádio e rápido, o drone do mar e 26 efeitos.

## Como a profundidade ("3D") foi feita
- C01/C12: as camadas (parede z=1500, comerciantes 800, Lustig 700, mesa 650, documento 300) escalam por
  `(z − camZf)/(z − camZ)` em torno do documento. A câmera anda em z: o close (E0) fica em −130 e o geral em −700.
  O loop funciona porque a C12 termina com a câmera e o documento no mesmo estado do quadro 0, e o documento continua
  deslizando através do corte.
- C04, C06 e C07: Torre3D (mini torre girando 360°, órbita de ~24° no flashback, contra-plongée na base).
- C08: a câmera desce. Acima do tampo vemos a toalha em perspectiva; abaixo, o tampo escuro cobre tudo o que está em cima,
  e o envelope passa por baixo da mesa.
- Personagens sempre chapados (só escala e posição), como o usuário pediu.

## Diferenças em relação ao brief
- Esfregar as mãos (C08) e ajeitar a gravata (C03) usam `alcancar` com alvo no peito.
- Cobrir o rosto (C11): as duas mãos vão ao rosto e o chapéu-coco aparece na frente.
- Meia-volta (C11): `giro` para a vista de perfil e Poisson sai andando curvado.
- Granulado: 1. Só a C06a usa `FilmeMudo`.
