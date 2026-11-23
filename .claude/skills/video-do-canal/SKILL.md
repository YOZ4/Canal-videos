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
Toda afirmação "científica" do roteiro ganha um **infográfico com o Lucas interagindo** (apontando, com lupa,
órgão em raio-X no peito, medidor em cima da cabeça). Falas entre aspas = o personagem fala (boca mexendo).

### 3. Escreva as cenas
- Cada cena é `React.FC<{ t0: number }>` com `const f = useCurrentFrame()` (frame **local** da cena).
- Momentos dentro da cena: `T("trecho") - t0` (início do trecho) e `TF("trecho") - t0` (fim).
- Lista `CENAS: [Componente, T("trecho onde começa")]` no arquivo principal define os cortes.
- Separe em `Cenas1.tsx`/`Cenas2.tsx` se ficar grande; helpers comuns estão em `src/videos/Cacadores/comum.tsx`
  (`Palco`, `Grade`, `frente`, `perfil`, `vivo`, `Som`, `Lembranca`, `ESC`).
- Personagem SEMPRE vivo: `vivo(rosto, f, "id")` (pisca) e respira (`estica: 1 + respira(f) * 0.01`).
- Falas: `vivo(rosto, f, "id", falaDe, falaAte)` mexe a boca só nesse intervalo.

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
- Revisão 2: mesma coisa deslocada 0,5 s (`-ss 0.5`) + tiras densas (3–4 fps) nas cenas de ação.
- Corrija tudo que achar (sobreposição de corpos/braços, rótulo em cima da legenda, objeto cobrindo rosto) e re-renderize.

### 6. Render final (em background, ~4 min para 2 min de vídeo)
```bash
npx remotion render <Nome> out/<slug>.mp4 --browser-executable=$B --log=error --concurrency=4
```
Use `run_in_background`. Normalize o áudio como na referência: `ffmpeg -i bruto.mp4 -c:v copy -af loudnorm=I=-15:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/x.mp4`. Depois: confira alguns frames do MP4, commit + push (código e vídeo em commits
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
