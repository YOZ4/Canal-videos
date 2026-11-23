# Canal-videos — guia para o Claude

Projeto Remotion de vídeos verticais (1080x1920, 30 fps) para o canal.

**LEIA `MEMORIA.md` NO INÍCIO DE TODA SESSÃO** (quem é o usuário, o que ele aprovou/rejeitou, histórico de todos os
vídeos, pendências). Ao terminar cada pedido, atualize o `MEMORIA.md` e faça commit + push junto.

**Equipe de agentes** (`.claude/agents/`): roteiro-visual → direcao-visual → animador-remotion → revisor-qualidade,
trocando arquivos em `producao/<episodio>/` (guia em `producao/README.md`). Use a esteira em episódios novos.

**Para fazer um vídeo novo (narração + roteiro → MP4), use a skill `video-do-canal`**
(`.claude/skills/video-do-canal/`). Esqueleto automático: `python3 scripts/novo_video.py <Nome> <audio> <roteiro>`.

## Estilo principal: 2D vetorial (`src/estilo2d/`)
- Personagens oficiais em `personagens.ts`. Lucas (personalidade inspirada no Sanji): cacheado preto,
  camiseta AMARELA com o número 3. Diego (inspirado no Zoro): topete MARROM, camiseta VERDE, olhar "meio fechado"
  e sorriso de canto, pose padrão braços cruzados. Folhas renderizadas: composições `Folha` e `FolhaPoses`.
- Visual: contorno escuro `#1d1424`, sombra suave no lado direito, olhos grandes com íris, braços "macarrão".
- `Boneco2D.tsx`: pose (ombro/cotovelo em graus, pernas com IK — pés ficam plantados, `agacha`, `estica`
  para squash & stretch, `cruzado`) e rosto (olhos, olhar, sobrancelha, sorriso, boca, canto).
- `anim.ts`: keyframes com curva por trecho (`k`, `kPose`, `kRosto`), `CURVA.antecipa/exagera/...`,
  automáticos `piscar`, `respira`, `fala`, `andar`, `tremor`.
- Vista 3/4: `vira` (-1..1) na vista de frente. `biceps` (0..1) incha o braço. `naMao` segura objeto (`Objetos.tsx`).
- Cenários: `Praca`, `Quarto`, `Cozinha`, `RuaNoite`. Transições (`Transicoes.tsx`): `Iris`, `Cortina`, `ZoomRapido`.
- Trilha: `scripts/gerar_trilha.py` gera `public/musica/trilha-leve.wav` (abaixe o volume nos momentos de tensão).
- Vistas: `vista: "frente" | "perfil" | "costas"` (folha de vistas: composição `FolhaVistas`, PNG em out/personagens/) (PERFIL_BASE; lado -1 = olha pra esquerda). `giro()` faz a virada cartoon.
- Mãos: `maoE/maoD`: bola | aberta | punho | aponta | joia. Braços são curvos.
- Aura (`Aura.tsx`): `AuraForte` (chamas em camadas; forca, caos, cor por personagem: AURA_LUCAS ciano, AURA_DIEGO verde),
  `CorrentesAura` (energia indo até um ponto), `PunhoBrilhando`. Sons: aura.wav, coracao.wav.
- `Efeitos2D.tsx`: LinhasFoco, LinhasMovimento, Gota, Veia, Brilhos, Simbolo (?/!), Impacto, Poeira.
- Cabelo balança sozinho: `balancoCabelo()` (ver `comCabelo` em SaiyajinV2). `posCabeca(pose)` dá a posição da cabeça.
- Sons sintetizados em `public/sfx/` (whoosh, pop, plim, impacto, brilho, rumble, carga, ronco) com `<Html5Audio>`.
- `UI.tsx`: legenda palavra-por-palavra (`frase("texto *destaque*", de, ate)`), `Selo` (tópico no topo),
  `Etiqueta` (nome sobre o personagem), `Placar` (contador).
- `Cenario2D.tsx`: praça ao pôr do sol com parallax. Câmera = transform do SVG (x, y, zoom).
- Acabamento (`Pintura.tsx`) — só o `FilmeMudo` (flashback) foi aprovado; o resto só se o usuário pedir: `Ferve` (contorno fervendo 12x/s), `NoDois`, `SombraCel` (anime 80), `Desencaixe`
  (anos 50), `Aquarela`, `FilmeMudo` (flashback), `Luz` (aditiva). `trocaRosto()` em anim.ts = troca de expressão atuada.
  Guia: `.claude/skills/video-do-canal/referencias/acabamento.md`. Exemplo: composição `TesteAcabamento`.
- Final: `scripts/finalizar.sh bruto.mp4 final.mp4 [granulado]` (granulado no ffmpeg + áudio −14 LUFS). Revisão em
  tiras: `scripts/tira.sh video t0 t1 saida.jpg [fps] [recorte que segue um ponto]`.
- Movimento anti-robô (`movimento.ts`, skill `analise-movimento-remotion`): `fasePassadas` (passadas variadas), `faseRitmo` +
  `RITMO_BRUTAL`/`RITMO_NINJA` (corridas que seguram a pose), `xPorFase` (pé plantado), `emCadeia` (atraso por parte),
  `mola` (pesado/natural/solto), `pernasNoChao`, `seguir` (câmera com atraso). Estilo de corrida `ninja2` (corpo a 52°).
  Exemplos: `TesteMovimento2` (pulo, brutal, ninja, luta com mortal/choque/cruzamento).
- Estilo "JJK S2" em teste (`EstiloJJK.tsx`, composição `TesteJJK` a 24 qps, personagens de 2 em 2): `CelJJK` (sombra dura +
  luz de recorte ciano + contorno variável), `GradeJJK` (grade escura azul-petróleo + borrão de chicote), `CenarioJJK`,
  `tremorJJK`, `RiscosVelocidade`, `LinhasRadiais`, `EnergiaCiano`, `Particulas`, `QuadroImpacto`, `Racha`, `Desfoque`.
  Finalizar com granulado 4.
- Sombra por partes: `<Boneco2D cel={{ luz: -160, sombra: 34, recorte: 10 }} />` (sombra dura + luz de recorte em cada perna,
  braço, tronco e cabeça, seguindo a direção da luz). Pesa ~25% no render.
- Ângulos com bonecos 2D (`Camera2D.tsx`): **NÃO usar câmera em perspectiva (rotateX) nos personagens** — o usuário achou
  estranho (boneco esticado como pôster). Use `camBaixa`/`camAlta` (ângulo pelo enquadramento: chão embaixo + personagem
  enorme, ou chão no alto + personagem pequeno), `camDetalhe` (close de olhos/mão/pé, `posMao` em Boneco2D), `Camada`
  (parallax por profundidade), `PrimeiroPlano` (pilar/pedras/poeira desfocados perto da câmera), `transformCam`.
- Vista de cima (aprovada! `VistaCima.tsx`): `BonecoCima` (anima pela mesma pose de perfil: pés, pé levantado cresce, braços,
  tronco inclinado põe a cabeça à frente, mortal `gira` achata, cabelo), `PlanoCima` (chão + câmera com giro), `RastroCima`,
  `RachaCima`. Exemplos de tudo: composição `FolhaAngulos` (1 exemplo por frame).
- Sons extras: `python3 scripts/gerar_sfx.py` (passo, pisada, racha, deslize, vento, lamina).
- Chicote de câmera com `CameraMotionBlur` (@remotion/motion-blur) só nos frames do movimento.

- Luta: `gira` (mortal), `posPe(pose)`, `naMaoGira` (espada acompanha o antebraço), `EfeitosLuta.tsx`
  (CorteArco, Faiscas, OndaChoque, Chamas, Fumaca, Rastro, Onomatopeia), trilha `scripts/gerar_trilha_luta.py`.
  Exemplo completo: `src/videos/Luta/LutaTeste.tsx` (cartão VS, close nos olhos, hit-stop, inversão de cor).

## Regras de animação (aprendidas das referências)
- Corte/mudança de plano a cada ~1,5–2,5 s. Legenda 1 palavra por vez, palavra-chave em laranja.
- Sempre: antecipação antes de ações, overshoot ao parar, cabeça atrasada em relação ao corpo,
  squash no impacto (+ poeira + tremor de câmera), personagens nunca 100% parados (respira/pisca).
- Infográficos/medidas (réguas, placares, setas) reforçam o que a narração diz.
- Luta: contraste calmo → explosivo; hit-stop de 4–8 frames no impacto; 1–2 frames com cor invertida;
  silêncio antes do golpe final; cortes de 0,3–1 s nos momentos de tensão; close nos olhos antes do choque.
- Não copiar personagens, marcas ou @ de outros canais.

## Renderizar neste ambiente (sem GPU / sem acesso ao download do Chrome)
npx remotion render <Composicao> out/<arquivo>.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
(3D com @remotion/three: adicionar --gl=swangle). Fontes ficam em public/fonts (sem internet no render).

## Fluxo de um vídeo com narração (ex.: src/videos/Cacadores)
1. Áudio em `public/narracao/<nome>.mp3`, roteiro em `roteiros/<nome>.txt` (texto exato da fala).
2. `python3 scripts/alinhar.py public/narracao/<nome>.mp3 roteiros/<nome>.txt src/videos/<Pasta>/alinhamento.json`
   (sem transcrição automática: divide as palavras do roteiro pelos trechos de fala; precisão ~0,2 s).
3. `tempo.ts`: `T("trecho")` = frame em que o trecho começa; `TF()` = onde termina; `LEGENDAS` prontas.
4. Cada cena é um componente com `t0`; a lista `CENAS` em `<Nome>.tsx` diz em que trecho cada cena começa.
5. Trilhas longas: `python3 scripts/gerar_trilha.py public/musica/x.wav 131` (volume ~0.1 por baixo da voz).
6. Personagens extras: AVO, EXAMINADOR, CANDIDATOS (personagens.ts). Cenários: Sala, Arena, Savana.

## Episódio no estilo JJK com dois personagens conversando (modelo: `src/videos/Broly`, "Fúria Verde")
- 24 qps; roteiro `roteiros/<nome>.txt` no formato `D|fala` / `L|fala`; `tempo.ts` com `F(n)`/`FF(n)`, `falando()`, `LEGENDAS`.
- Rosto por `trocaRosto` (listas RL/RD), poses por cena (`lucasPose`/`diegoPose`), lista `PLANOS` (corte a cada ~1,5–2,5 s,
  `so: "L"|"D"` para close de um só, `cima: true` para vista de cima, `fundo` = desfoque), `IMPACTOS` para tremor.
- `cena(f)` troca céu/destruição/tom da grade/cor da luz de recorte — é assim que os personagens "se adaptam ao ambiente".
- Gestos nas falas: lista `GESTOS` + `comGesto()` (mola na entrada/saída, antebraço 2 quadros atrasado).
- Lucas transformado: `LUCAS_FURIA` / `LUCAS_PODER` (cabelo verde espetado, olhos vazios, músculos, faixa). Cenário de rua: `RuaAnime`.
- Sons de ambiente: `passaros.wav`, `transito.wav` (gerar_sfx.py). Silêncio da música antes do golpe/grito final.
- Entrega: versão `-alta.mp4` só no chat; versão leve (< 100 MB) no git.
