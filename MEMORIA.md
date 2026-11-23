# Memória do projeto (leia no início de toda sessão)

Diário de tudo o que já foi feito, decidido e aprendido com o dono do canal, para nenhuma sessão nova perder o
progresso. **Atualize este arquivo ao fim de cada pedido** (o que foi feito, o que ele aprovou/rejeitou, o que ficou
pendente) e faça commit + push junto com o trabalho.

## Quem é o usuário e como trabalhar com ele
- Fala português, **não é programador**: explique em linguagem simples, sem jargão.
- Sempre quer: **estimativa de tempo**, **duas revisões** antes de entregar (1: mecânica/rigidez, 2: ritmo/fluidez/peso),
  e no final **"o que ainda dá para melhorar"** + tempo gasto. Liste o que foi encontrado e o que foi ajustado em cada revisão.
- Entrega: mandar o MP4 no chat (SendUserFile) e salvar no GitHub. O GitHub não aceita arquivo > 100 MB:
  o vídeo em qualidade máxima vai só no chat (`out/*-alta.mp4`, no .gitignore); no git vai a versão leve
  (`ffmpeg -c:v libx264 -preset slow -b:v 7200k -maxrate 8500k -bufsize 14000k -c:a copy`).
- Às vezes manda o roteiro em prints (não consegue copiar texto). Transcreva para `roteiros/<nome>.txt`.
- Quando pede "só pra deixar no seu sistema", é para criar a ferramenta sem refazer vídeo.
- Não instalar skills/plugins de terceiros: trazer as técnicas para dentro do nosso Remotion.
- Ele quer que **toda a memória/progresso fique salva no repositório** (este arquivo + CLAUDE.md + skills).

## Decisões de estilo (aprovado ✅ / rejeitado ❌)
- ✅ Estilo 2D vetorial com Lucas (camiseta amarela nº 3, cacheado) e Diego (topete marrom, camiseta verde).
- ✅ Estilo "JJK S2" (24 qps, personagens de 2 em 2 quadros, sombra dura por partes, luz de recorte, grade de cor,
  granulado 4). No Broly pediu "tudo no estilo JJK, adaptando os protagonistas ao ambiente" (luz/cor do cenário).
- ✅ **Vista de cima** (VistaCima.tsx) — "ficou incrível".
- ✅ `FilmeMudo` para flashback. ❌ Os outros acabamentos de Pintura.tsx (contorno fervendo, anos 50, aquarela...) só se pedir.
- ❌ **Câmera em perspectiva (rotateX) nos bonecos 2D** — ficou estranho (boneco esticado). Use Camera2D (camBaixa,
  camAlta, camDetalhe, Camada, PrimeiroPlano).
- ✅ Personagem inspirado em anime pode ter visual parecido quando ele pede explicitamente (pediu "o Broly normal
  mesmo" → Lucas transformado de cabelo verde espetado, sem camisa, faixa amarela). Nunca copiar personagens/marcas/@ de outros canais.

## Histórico (mais antigo → mais novo)
1. **Primeiros testes**: LucasSaiyajin (3D girando), TesteEstilo (bonecos 3D), TesteAnimacao (2D). Escolhido o 2D.
2. **"E se você virasse um Saiyajin?"** (`src/videos/Saiyajin2D`, v1→v3; `out/saiyajin-v3.mp4`).
3. **Luta teste** Lucas × Diego (`src/videos/Luta/LutaTeste.tsx`, cartão VS, hit-stop, inversão de cor).
4. **Caçadores parte 1** (`src/videos/Cacadores`, narração + roteiro, v1→v4 com duas revisões; `out/cacadores-parte1-v4.mp4`).
   Criada a skill `video-do-canal` (fluxo narração → MP4). PR #1 juntado na main.
5. **Corrida real** (corrida.ts, TesteCorrida/TesteCorrida2): pé plantado, vistas frente/costas/3/4.
6. **Acabamentos à mão** (Pintura.tsx, TesteAcabamento). Só o FilmeMudo agradou.
7. **Skill `analise-movimento-remotion`** (referência de vídeo → movimento anti-robótico, 3 passos, 2 revisões).
   Testes: TesteMovimento (v1) e TesteMovimento2 (pulo melhorado, corrida brutal v2, corrida ninja `ninja2`, luta com
   mortal/choque/cruzamento). Volume final passou a −14 LUFS com compressor + ajuste em laço (`finalizar.sh`).
8. **Estilo JJK S2** (EstiloJJK.tsx, TesteJJK v1/v2): parâmetros tirados de 3 vídeos de referência. Sombra por partes
   (`cel` no Boneco2D, pesa ~25% no render). Pergunta dele "isso deixa o vídeo mais lento?": sim, no render
   (estilo antigo ~12 s por 2 s de vídeo; JJK completo ~64 s por 2 s), não no vídeo.
9. **Ângulos 2D** (Camera2D.tsx, FolhaAngulos) + **vista de cima animada** (BonecoCima, PlanoCima, RastroCima, RachaCima)
   — feitos "só para o sistema", sem refazer vídeo.
10. **Episódio "Fúria Verde" / Broly** (`src/videos/Broly`, composição `Broly`, 24 qps, 1 min 34 s):
    - Áudio `public/narracao/broly.mp3`, roteiro `roteiros/broly.txt` (`D|fala`/`L|fala`, 36 falas), `tempo.ts` com
      `F(n)`/`FF(n)` (início/fim da fala n), `falando()`, `LEGENDAS`. Mesma voz para os dois: quem fala segue o roteiro.
    - 6 cenas: gancho noturno com cidade destruída → "CINCO MINUTOS ANTES" (rua de dia) → transformação (cabelo verde,
      cresce, camiseta rasga, clarão) → efeito colateral → esfera de energia explode no céu → "DIEGO!" e perseguição.
    - Novos: `LUCAS_FURIA`/`LUCAS_PODER` (personagens.ts: `cabeloPoder`, `olhosVazios`, `musculos`, `faixa`),
      boca de fúria (sorriso ≤ −0.7), `posMao()`, `RuaAnime`/`Carro`/`ColunaFumaca`/`CeuExplosao` (CenariosBroly.tsx),
      `GradeJJK tom` (teal | dia | verde | noiteVerde).
    - v1 (`out/furia-verde.mp4`): revisões corrigiram personagens encostando, Diego atrás do Lucas, rosto de susto
      que parecia sorriso, aura/brilho verde fortes demais, grito com a cabeça cortada.
    - v2 (`out/furia-verde-v2.mp4`), pedida por ele ("adicionar todos"): gestos do Lucas gigante nas falas (lista
      `GESTOS` com mola e antebraço atrasado 2 quadros), corrida pesada (ciclo 26 quadros, afunda/achata, tremor +
      racha + poeira + som a cada pisada), Diego tremendo e suando de medo (`MEDO`/`GOTAS`), close de baixo da esfera
      com energia sendo puxada (CorrentesAura), sons de rua de dia (`passaros.wav`, `transito.wav`) e silêncio da
      música antes do "DIEGO!". Render final: ~66 min em resolução total.
    - PR #2 aberto para juntar tudo na main.
11. **Memória do projeto**: criado este `MEMORIA.md` (ele pediu para guardar todo o progresso no repositório).
12. **Equipe de 4 agentes** (pedido e desenhado pelo usuário), em `.claude/agents/`, rodando em esteira com arquivos em
    `producao/<episodio>/` (guia: `producao/README.md`):
    1. `roteiro-visual` — roteiro por cenas (ação, emoção, ritmo, cenário exato) + kit de imagens de referência ligado a cada momento.
    2. `direcao-visual` — paleta, sombra dura, luz de recorte, planos/câmera, expressões e movimento em fases (2 em 2, holds, smears, tremor).
    3. `animador-remotion` — código Remotion anti-robótico (modelo: src/videos/Broly) e aplica os ajustes do revisor.
    4. `revisor-qualidade` — revisões 1 e 2 com ajustes cirúrgicos (não edita código).
    Ainda não foram usados num episódio: o próximo vídeo é o primeiro teste da esteira.

13. **3 skills próprias a partir de prints de skills de terceiros** (ele mandou 11 prints; não tinha os links).
    Análise: valiam motion design, 3D (Three.js) e desenho à mão; descartadas Animation Designer/Flutter (interface de app),
    HyperFrames (faz o mesmo que o Remotion), Motion Skill (Nano Banana/Kling, IA paga externa), Manim, 77 estilos,
    Huashu e JS animation (já temos trilha/SFX por código). Criadas, sem instalar nada de fora:
    `motion-design` (`coreografia.ts`), `desenho-a-mao` (`Desenho.tsx` + fonte Patrick Hand OFL), `cena-3d` (`Objeto3D.tsx`,
    toon + contorno, esfera de energia/planeta). Ligadas aos 4 agentes. Teste: composição `TesteFerramentas`
    (`out/teste-ferramentas.mp4`, 17 s: infográfico em cascata → Lucas no quadro branco → esfera 3D nas mãos do Lucas).
    Os agentes e esta memória estavam num branch que não tinha ido para a main; foram trazidos para o branch desta sessão.

## Pendências / ideias que ele ainda pode pedir
- Testar a esteira de 4 agentes no próximo episódio e ajustar os arquivos dos agentes com o que ele achar.
- Gesto de "mão na cabeça" no Lucas gigante (o braço atual não alcança a cabeça; virou punho tremendo).
- Fuga do Diego com corrida de pânico (braços se debatendo, olhando para trás) — hoje usa a corrida comum.
- Usar as 3 skills novas num episódio de verdade e ver o que ele acha (3D: medir tempo de render antes).
- Som de caneta (`caneta.wav`) para o quadro branco ainda não foi sintetizado.
- Mais episódios no estilo JJK reaproveitando `src/videos/Broly` como modelo.

## Lições técnicas (para não repetir erros)
- Render: sempre `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
- Para conferir quadros soltos: `npx remotion bundle --out-dir=<pasta>` uma vez e depois `npx remotion still <pasta> Broly x.png --frame=N --scale=0.25`
  **um por vez** (vários em paralelo estouram a memória).
- `interpolate` exige entrada estritamente crescente: no volume de trilha dentro de `<Sequence from=X>`, o tempo é local (f − X).
- Rodar `npm ci` se o tsc reclamar de dependências. Alinhamento: `alinhamento.json` é `{duracao, trechos, palavras}`.
- No estilo JJK, o desenho anda de 2 em 2 (`dois(f)`), mas câmera, aura e partículas andam a cada quadro.
- Lado do braço no Boneco2D de frente: `bracoD` fica do lado direito da tela; ombro 90° = braço na horizontal.
- Revisão rápida: folha de quadros `ffmpeg -vf "fps=0.5,scale=180:-1,tile=8x6"` + `scripts/tira.sh` nos momentos-chave.
