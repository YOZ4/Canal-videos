# Evolução do sistema de animação — Etapa 2 (qualidade do combate)

Pedido: avaliação técnica do `demo-golpes.mp4` + segunda etapa do sistema de combate, preservando o Boneco2D,
melhorando a QUALIDADE dos movimentos existentes (peso, força, velocidade, impacto) — não a quantidade.

## Diagnóstico do demo-golpes.mp4 (antes)
1. Articulações: corretas, mas cada golpe mexia uma parte por vez (jab só com o braço; quadril/ombro/pé de trás parados).
   Na reação a cabeça vinha ATRASADA (deveria liderar quando é ela que leva o golpe).
2. Antecipação: jab com 2 quadros quase invisíveis; chute com 3 quadros; o peso não ia para a perna de trás.
3. Impacto: câmera lenta começava NO contato (golpe chegava devagar e "flutuava"); sem hit-stop; nada no ponto do contato.
4. Reação: braços erguidos ("me rendo") ao levar o chute; queda dura como tábua que DESLIZAVA 230 unidades deitada, com
   pernas dobradas no ar; levantava FLUTUANDO em 8 quadros.
5. Saltos: arco feito de retas (quinas); a cambalhota e a voadora se cruzavam e os dois ficavam um DENTRO do outro (~1 s).
6. Aterrissagem: squash ok, mas pousavam encavalados; virar de lado era instantâneo.
7. Continuidade: todo golpe voltava à guarda exata e a guarda viva tinha outra altura → pulinho de pose entre golpes.
8. Pés: o deslocamento movia o corpo com os pés colados → patinavam (avanço, jab, chute, reação, queda).
9. Secundários: cabelo parado; braços de quem apanha sem chicote.
10. Câmera: as FAIXAS PRETAS eram o efeito "faixas de cinema", ligado/desligado 5 vezes em 14 s (parecia defeito); a
    conta que evitava borda ignorava o foco fora do centro; crash zoom em ponto fixo cortava rosto/cabeça; Diego deitado
    com a cabeça fora do quadro; câmera só seguia em x (não abria para salto nem para afastamento).

## Criado / mudado nesta etapa
- `Boneco2D.tsx`: campo opcional `giraEm` (altura do ponto de giro; padrão 600 = igual a antes). 396 = quadril.
- `golpes.ts` refeito (mesmos nomes): fases marcadas (`prep`, `contato`, `recebe`, `pouso`), `tipo`, `membro`, `mira`,
  `voo` (arco de PARÁBOLA real: x com velocidade constante, y com gravidade), `desliza` (escorregar de propósito),
  pés com passos escritos (pé sai do chão quando anda), reações com a cabeça liderando (`cadeia` negativa) e braços
  chicoteando, queda que tomba (giro no quadril), bate, quica, pernas assentam, senta e levanta apoiada, chute no peito
  (o boneco não alcança a cabeça com a perna), voadora que rebate no alvo, mortal com arco alto (passa por cima).
  `Ritmo` = escala de tempo por fase (`preparo`, `acao`, `recupera`). `combate()` antigo continua funcionando.
- `luta.ts` (NOVO) — sistema de coreografia por LANCES: `criarLuta(atores, lances)`. Resolve sozinho: alinhamento da
  resposta no contato, alcance automático (punho/pé chega no alvo; limitado para nunca "andar pra trás"), hit-stop
  (3–8 q pela força, vítima vibra e já mostra o desenho do impacto), pés plantados com passo automático, guarda viva que
  entra/sai aos poucos, virada de lado com giro, cabelo com mola pela aceleração da cabeça, câmera que enquadra os dois
  (mola + antecipação + TRAVA que nunca deixa ninguém sair do quadro), eventos (contato, pouso, whoosh, deslize, passo)
  para efeitos e sons. Opções do lance: `forca`, `hitstop`, `ritmo`, `ritmoResposta`, `amplitude`, `distancia`
  (movimento termina a X px do alvo, do outro lado se cruza), `vira`, `viraAlvo`, `escorrega`, `alcance`.
- `Diretor.tsx`: `zoomQueCobre` — a conta de "nunca mostrar borda" agora testa os 4 cantos com foco/rotação/deslocamento.
- Demo nova: `src/videos/Luta2/` (`coreo.ts` = só a lista de lances; `DemoGolpes2.tsx` = rosto por fase, efeitos no ponto
  do contato, câmera lenta no ápice do mortal e na CARGA do golpe final, que acelera e volta ao normal no contato;
  sem faixas de cinema; crash zoom mira o ponto do golpe). Composição `DemoGolpes2`.

## Revisões
- Revisão 1 (mecânica): chute acertava a cintura → virou chute no peito com o pé bem mais alto; voadora pousava colada no
  Lucas → rebate mais e o Diego recua logo; "POW!" cortado no topo → mais baixo; mortal quase raspava a cabeça → arco mais
  alto; virada de 8 quadros parecia papel → 6 quadros. Bugs do próprio sistema achados e corrigidos: conta de "corpo em
  pé" invertida (pés nunca plantavam), tremor do hit-stop que não alternava, mortal com distância fixa (pousava em cima
  do Diego → opção `distancia`), alcance que puxava o Lucas para trás no golpe final.
- Revisão 2 (ritmo/peso): pé do Lucas cortado no ápice do mortal (câmera com atraso) → antecipação de 5 quadros + trava
  com folga; Diego levantava da esquiva com o Lucas ainda em cima → abaixa mais tarde e segura mais.

## Pendente / dá para melhorar
- Torção do tronco (o perfil não gira ombros/quadril separadamente; hoje é simulado com inclina + passo).
- Reação específica para golpe no corpo (dobrar pra frente) — hoje o chute no peito usa a mesma reação do soco no rosto.
- Roupas: a camiseta não tem pano solto para balançar (só cabelo e braços têm movimento secundário).
- Expressões com `trocaRosto` (troca atuada) em vez de troca seca por fase.
