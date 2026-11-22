# Estilo do canal

## Personagens (src/estilo2d/personagens.ts)
- **Lucas** (protagonista, "você" do roteiro; personalidade inspirada no Sanji; apelido "Cachinho"):
  cabelo cacheado preto, olhos castanhos, camiseta AMARELA com o número **3** (frente e costas), jeans, tênis branco.
  Aura **ciano** (`AURA_LUCAS`).
- **Diego** (rival/amigo; inspirado no Zoro; apelido "Topete"): topete MARROM, olhos verdes, olhar meio fechado,
  sorriso de canto, sobrancelhas grossas, camiseta VERDE. Pose padrão: braços cruzados. Luta com espada.
  Aura **verde** (`AURA_DIEGO`). Rosto padrão: `ROSTO_DIEGO` (comum.tsx).
- Extras: `AVO` (cabelo branco cacheado, bigode, óculos; aparece em lembrança sépia), `EXAMINADOR` (terno roxo,
  gravata, bigode), `CANDIDATOS[0..4]` (figurantes coloridos).
- Folhas de referência: composições `Folha`, `FolhaPoses`, `FolhaVistas` (PNG em `out/personagens/`).

## Visual
- 2D vetorial: contorno `#1d1424`, sombra suave à direita, olhos grandes com íris, braços curvos tipo macarrão.
- Vistas: `frente`, `perfil` (lado -1 olha pra esquerda), `costas`, e 3/4 com `vira` (-1..1). `giro()` vira cartoon.
- Mãos: bola | aberta | punho | aponta | joia. `biceps` incha o braço. `naMao` + `naMaoGira` (espada).
- Legenda: 1 palavra por vez, Fredoka branca com contorno, palavras-chave em laranja.

## Acabamento (aprendido do vídeo de referência "cidade dos dias da semana")
- Estilo escolhido: **B** = personagens atuais + mundo "pintado". Cenários dentro de `<Fundo>` (Acabamento.tsx:
  dessatura + névoa), rua detalhada `RuaLonga` (casas, postes, fios, pássaros, placa, rachaduras, folhas).
- Câmera nunca parada (o `Palco` já faz push-in + deriva), sombras suaves, `PoeiraFlutuante` + `Textura` globais.
- Legenda menor e no meio: `<LegendaPalavra y={1270} tamanho={78} />`.
- Piadas visuais e objetos com física (`ObjetosFisica`: folhas, gotas, pedras, pratos), cachorro dormindo etc.
- Protótipo do estilo A (chibi) fica em `src/estilo2d/chibi/` caso queiram no futuro.

## Ritmo e animação (o que faz o vídeo ficar bom)
- Plano novo a cada 1,5–2,5 s; tensão = cortes de 0,3–1 s, close nos olhos, silêncio antes do golpe.
- Antecipação antes de toda ação (`CURVA.antecipa`), overshoot ao parar (`CURVA.exagera`).
- Cabeça/cabelo atrasados em relação ao corpo (`balancoCabelo`), squash & stretch (`estica`) em pulos e impactos.
- Impacto = hit-stop 4–8 frames + 1–2 frames de cor invertida + tremor de câmera + faíscas/onda de choque + som.
- Ninguém 100% parado: piscar, respirar, câmera sempre com push-in leve.
- Aura forte: `AuraForte` com `forca` 0.5–1.3 e `caos` 0 (calma) a 1 (explodindo); para "concentrar", use
  `CorrentesAura` + `PunhoBrilhando`.
- Toda explicação vira infográfico (fundo azul quadriculado `Grade`) **com o Lucas interagindo**.
- Fases/capítulos: `Selo` colorido no topo + `Cortina` na troca. Conquistas estilo jogo: `Conquista`.
- Final: chamada para comentar + "SEGUE → PARTE 2", personagens com aura calma apontando/joinha.

## Som
- Narração volume 1. Trilha leve ~0.1 por baixo; trilha de luta ~0.12–0.14 na fase de briga; abaixe (0.03) em
  lembranças e momentos emotivos; silêncio total antes do golpe final.
- Efeitos em `public/sfx/`: whoosh, pop, plim, impacto, brilho, rumble, carga, ronco, clang, fogo, corte,
  explosao, coracao, aura. Gerar trilhas: `scripts/gerar_trilha.py` (leve) e `scripts/gerar_trilha_luta.py`.
- Se o usuário fornecer sons/músicas profissionais, coloque em `public/` e prefira eles.

## O usuário
- Fala português do Brasil; quer estimativa de tempo antes de tarefas grandes; quer sempre saber
  "o que ainda dá pra melhorar" no fim; gosta de comparar versões (mantenha v1/v2/v3).
- Não copiar personagens, marcas ou @ de outros canais (referências usadas: rmhkaiser, Visar, Mr. Opus etc.).
