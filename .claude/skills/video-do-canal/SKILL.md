---
name: video-do-canal
description: Produz um vídeo completo do canal (vertical 1080x1920, estilo 2D com Lucas e Diego) a partir de uma narração em áudio + roteiro — alinhamento, cenas sincronizadas, legendas palavra por palavra, aura/luta/infográficos, trilha, efeitos sonoros e render final. Use quando o usuário mandar um áudio de narração e/ou roteiro para virar vídeo, pedir um episódio novo, uma "parte 2", ou pedir para refazer/melhorar um vídeo do canal.
---

# Vídeo do canal: da narração ao MP4

Este projeto já tem tudo pronto para fazer vídeos no estilo do canal. **Não recrie nada do zero**: reaproveite
`src/estilo2d/` (personagens, animação, efeitos, cenários, UI) e use o vídeo **`src/videos/Cacadores/`**
(2:10, 46 cenas) como exemplo de referência para qualquer coisa.

Leia também, quando precisar:
- `referencias/estilo.md` — personagens, regras de animação e de ritmo (o que deixa o vídeo bom).
- `referencias/receitas.md` — trechos de código prontos para cada tipo de cena (copie e adapte).

## Antes de começar
- Episódio novo: rode a esteira de agentes (`producao/README.md`): roteiro-visual → direcao-visual → animador-remotion → revisor-qualidade.
- Leia `MEMORIA.md` (preferências e decisões do usuário). Para episódio no estilo JJK, copie a estrutura de `src/videos/Broly`.
- Ao entregar, atualize `MEMORIA.md` (histórico + pendências) e faça commit + push.
1. Diga ao usuário uma **estimativa de tempo** (ele sempre quer saber). Referência: vídeo de ~2 min ≈ 1h30–2h de
   trabalho + ~4 min de render. Ajustes em vídeo existente ≈ 30–60 min.
2. Confirme que tem: **áudio da narração** (mp3/wav) e **roteiro com o texto exato** da fala. Sem roteiro, peça;
   não há transcrição automática aqui (a rede bloqueia os modelos do Whisper).

## Passo a passo

### 1. Esqueleto automático
```bash
python3 scripts/novo_video.py <NomePascalCase> <caminho/audio.mp3> <caminho/roteiro.txt>
```
Cria `src/videos/<Nome>/` (alinhamento.json, tempo.ts, <Nome>.tsx com 1 cena por frase), copia áudio/roteiro,
gera trilha do tamanho certo e registra a composição em `src/Root.tsx`.
Confira o alinhamento imprimindo as frases com o tempo de início (ver `referencias/receitas.md` → "Conferir
alinhamento"). Se uma frase estiver muito curta/estranha, é sinal de pausa juntada; ±0,2 s é normal.

### 2. Planeje as cenas (antes de codar)
Leia o roteiro e faça uma tabela: **trecho da fala → o que aparece → personagens/cenário → efeito/infográfico → som**.
Regras de ritmo: plano novo a cada ~1,5–2,5 s; nos momentos de tensão, cortes de 0,3–1 s.
**Escreva as "leituras" de cada cena** (o que o espectador precisa entender, em ordem, com início e fim em frames).
O espectador vê uma vez só, na velocidade normal, sem saber o que vem: cada leitura precisa de tempo para o olho
achar, entender e registrar antes da próxima. Exemplo:
```
Cena 7 (T("tomou um susto") → +75)
  0–12   Lucas olha para a porta (o olhar dele leva o olho do espectador até lá)
  12–30  a porta abre e aparece o Diego            ← causa
  30–55  Lucas leva o susto (antecipação + reação)  ← reação só DEPOIS da causa, nunca junto
  55–75  segura a cara assustada (tempo para entender)
```
- Uma leitura de cada vez. Duas coisas importantes ao mesmo tempo = o espectador só vê uma.
- Ação rápida, significado lento: o movimento pode ser rápido se tiver antecipação; o que ele significa precisa de pausa.
- Conduza o olho antes de cada leitura importante (alguém olha para lá, a câmera vai para lá, a coisa brilha/mexe primeiro).
- Se as leituras não cabem no trecho da fala, corte uma leitura; não espreme.
- Evite gêmeos: os dois personagens nunca reagem no mesmo frame nem com o mesmo gesto (desloque 4–8 frames, um faz menos).

**Direção (som, ritmo e câmera):**
- Toda ação visível tem um som (pouso, passo, porta, papel, pop). Ambiente + efeitos + trilha; trilha abaixa sob a voz.
- Pelo menos **dois silêncios** (ou quase) antes da virada/clímax; o primeiro som depois do silêncio é dos mais importantes.
- Use o som como transição pelo menos 2 vezes: o som da cena seguinte entra antes do corte, ou o da anterior continua depois.
- Varie o ritmo: alterne rápido e lento, tenha uma aceleração clara e uma "respiração" (plano mais longo e calmo).
- Pelo menos **4 movimentos de câmera diferentes** (aproximar, afastar, parallax, chicote, panorâmica) e **um plano assinatura**
  que fique na memória. Nos momentos-chave, o personagem ocupa pelo menos 1/3 da altura da tela.
- Legenda: nunca em cima do rosto ou da ação principal.

Toda afirmação "científica" do roteiro ganha um **infográfico com o Lucas interagindo** (apontando, com lupa,
órgão em raio-X no peito, medidor em cima da cabeça). Falas entre aspas = o personagem fala (boca mexendo).

### 3. Escreva as cenas
- **Camada de naturalidade em TODA cena com personagem** (`src/estilo2d/naturalidade.ts`): escreva só a pose crua de
  cada personagem por quadro e passe por `criarAnimacao(DUR, (f) => ({ L: poseL(f), D: poseD(f) }), { chao: CHAO_Y })`
  (no nível do módulo, fora do componente). Use `.pose(id, f)` no Boneco2D e `.camera(f)` no `<Palco cam parado>`.
  Ela dá: pés plantados (passo automático em vez de patinar), cabelo e barra da camiseta com mola, câmera que enquadra
  sem cortar ninguém. Rosto: `rostoAtuado(n, escolha)` (troca atuada). Só desligue partes com motivo
  (`camera: false` num close fixo, `pes: false` num plano de busto). Luta: `luta.ts` (que já usa esta camada).
- Ações prontas (perfil): `golpes.ts` (com fases, torção do tronco `torce`, saltos com parábola). Servem fora de luta
  também: `avanca`/`recua` (passos), `salto`, `esquiva*` (susto), `levaGolpe*`/`queda` (tropeço, tombo, levar bolada).
- Cada cena é `React.FC<{ t0: number }>` com `const f = useCurrentFrame()` (frame **local** da cena).
- Momentos dentro da cena: `T("trecho") - t0` (início do trecho) e `TF("trecho") - t0` (fim).
- Lista `CENAS: [Componente, T("trecho onde começa")]` no arquivo principal define os cortes.
- Separe em `Cenas1.tsx`/`Cenas2.tsx` se ficar grande; helpers comuns estão em `src/videos/Cacadores/comum.tsx`
  (`Palco`, `Grade`, `frente`, `perfil`, `vivo`, `Som`, `Lembranca`, `ESC`).
- Personagem SEMPRE vivo: `vivo(rosto, f, "id")` (pisca) e respira (`estica: 1 + respira(f) * 0.01`).
- Falas: `vivo(rosto, f, "id", falaDe, falaAte)` mexe a boca só nesse intervalo.
- Mudança de expressão: use `trocaRosto(f, [[frame, rosto, tamanho], ...])` (anim.ts) em vez de trocar a cara direto.
  Ele aperta os olhos antes, troca a cara escondida e faz a reação com mola. Some `corpo.estica`/`corpo.agacha` na pose.
- Flashback antigo (o avô, "antigamente"): envolva a cena em `<FilmeMudo>` (`src/estilo2d/Pintura.tsx`) — aprovado
  pelo usuário. Os outros efeitos de `Pintura.tsx` (Ferve, NoDois, SombraCel, Desencaixe, Aquarela) o usuário NÃO
  curtiu no teste: não use por padrão, só se ele pedir.

### 4. Sobreposições globais (arquivo principal)
Legendas `LegendaPalavra` (+ palavras em laranja no `DESTAQUES` do tempo.ts), `Selo` de fase, `Conquista`
("DESBLOQUEADO!"), `Contagem`, transições (`Iris` p/ lembranças, `Cortina` p/ troca de fase, `ZoomRapido`),
narração (volume 1), trilha leve (~0.1) e trilha de luta (~0.12–0.14), abaixando em momentos de tensão.

### 5. Confira ANTES de renderizar tudo
Renderize stills espalhados e veja-os (você só enxerga quadros parados — confira cada cena nova):
```bash
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx tsc   # tem que passar sem erro
npx remotion still <Nome> /tmp/.../f300.png --frame=300 --browser-executable=$B --log=error --scale=0.3
# junte vários com: ffmpeg ... -filter_complex "[0][1]...hstack=N" folha.png
```
Procure: personagens se atravessando, coisas cobrindo rostos, enquadramento cortando cabeça, legenda em cima
de algo importante, expressões erradas (medo que parece sorriso), textos/emoji quebrados (não use emoji).

### 5b. Revise o vídeo renderizado DUAS vezes (o usuário pede isso)
- Revisão 1: `ffmpeg -i out/x.mp4 -vf "fps=1,scale=200:-1,drawtext=...,tile=11x3" folha_%02d.png` e olhe TODAS as folhas.
- Revisão 2: mesma coisa deslocada 0,5 s (`-ss 0.5`) + tiras densas nas cenas de ação:
  `sh scripts/tira.sh out/x.mp4 12.0 12.8 tira.jpg 30` (todos os quadros do trecho, com o tempo escrito).
  Para seguir algo que se move (pé, mão, objeto) com recorte em tamanho real:
  `sh scripts/tira.sh out/x.mp4 12.0 12.8 pe.jpg 30 400:300:300:1480:700:1480` (janela 400×300 indo de (300,1480) a (700,1480)).
- Em cada tira, pergunte: onde o espectador está olhando agora e ele já entendeu? Conte os quadros de cada leitura
  (30 = 1 s). Leitura que passa em poucos quadros ou divide quadros com outra vai ser perdida.
- Corrija tudo que achar (sobreposição de corpos/braços, rótulo em cima da legenda, objeto cobrindo rosto) e re-renderize.

### 6. Render final (em background, ~4 min para 2 min de vídeo)
```bash
npx remotion render <Nome> out/<slug>.mp4 --browser-executable=$B --log=error --concurrency=4
```
Use `run_in_background`. Renderize como `out/<slug>-bruto.mp4` e finalize com
`sh scripts/finalizar.sh out/<slug>-bruto.mp4 out/<slug>.mp4 3` — granulado de filme (3; 0 = nenhum; menos em fundo
claro) + áudio a −14 LUFS em duas passadas com limitador; ele imprime o volume e o pico medidos (pico abaixo de −1 dB).
Não desenhe granulado animado nos quadros (deixa o render lento e o arquivo pesado). Não faça commit do `-bruto`. Depois: confira alguns frames do MP4, commit + push (código e vídeo em commits
separados), envie o MP4 ao usuário com `SendUserFile` e o link `https://github.com/YOZ4/Canal-videos/raw/<branch>/out/<arquivo>.mp4`.

### 7. Entrega
Resumo em português: o que tem no vídeo, tempo gasto, e **o que ainda dá para melhorar** (o usuário sempre pede).
Mantenha versões anteriores (`-v2`, `-v3`) para comparação.

## Armadilhas conhecidas
- Render: sempre `--browser-executable` (o download do Chrome do Remotion é bloqueado). 3D precisa `--gl=swangle`.
- Fontes: só as locais (`public/fonts`, carregadas em `src/estilo/fontes.ts`). Google Fonts não carrega no render.
- Emoji não renderiza (sem fonte de emoji). Use símbolos simples (★ ✦ ≋) ou texto.
- `Sequence` reinicia o frame: dentro de cena use frame local; `T()` é global → subtraia `t0`.
- `noUnusedLocals` está ligado: remova imports não usados ou o `tsc` falha.
- Copo/mesa/objetos: confira altura em relação ao rosto. Braços da frente de um personagem invadem o outro se
  estiverem a < ~450 px de distância (escala 0.72).
- Direitos autorais: visual sempre original. Se o roteiro citar obra protegida (anime etc.), avise o usuário do
  risco para monetização, sem desenhar personagens dessa obra.
