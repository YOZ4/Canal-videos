# Evolução do sistema de animação — Etapa 1 (diagnóstico + câmera lenta + biblioteca de golpes)

Decisão do usuário: manter o sistema VETORIAL (Boneco2D) e evoluir sem reconstruir o que funciona.

## Diagnóstico (o que já existe e funciona — preservado)
- `Boneco2D.tsx`: rig vetorial com hierarquia (quadril → tronco → ombro/cotovelo → mão; quadril → pernas com IK de pé
  plantado), `gira` (corpo inteiro), `inclina`, `agacha`, `estica` (squash/stretch), vistas frente/perfil/costas/3-4, cabelo
  com balanço, rosto com 25 expressões e campos de intensidade, figurinos (`egito`), sombra por partes (`cel`).
- `anim.ts` (keyframes com curva por trecho, piscar, respirar, fala), `movimento.ts` (molas, atraso em cadeia, passadas
  variadas, ritmos brutal/ninja), `corrida.ts` (ciclos e pé plantado), `Camera2D`, `VistaCima`, efeitos de luta.
- Ponto fraco encontrado: cada golpe/ação era escrito À MÃO dentro da cena (posições absolutas e tempos fixos, ex.:
  `lucasD`/`diegoD` em TesteMovimento2, LutaTeste) → nada reaproveitável entre episódios.
- Câmera lenta não existia (só congelar).

## Criado nesta etapa
- `src/estilo2d/tempo.tsx` — câmera lenta VERDADEIRA: remapeia o tempo (a cena é calculada em quadros fracionados,
  `Freeze` com tempo contínuo). `CameraLenta`, `tempoCena`, `duracaoSaida`, `momentoLento`. Desacelera e volta com curva suave.
- `src/estilo2d/golpes.ts` — biblioteca de movimentos relativos à base (qualquer personagem, lado, posição, escala):
  jab, direto, chuteAlto, esquivaTras, esquivaBaixa, defesa, levaGolpe, queda (cai, quica, fica, levanta), cambalhota
  (mortal pra frente), salto (squash/stretch), mortalTras, voadora, avanca, recua. Cada golpe tem `contato` (para
  reação/som/câmera), `desloca` e `cadeia` (follow-through por parte). `combate()` encadeia passos com deslocamento
  acumulado e guarda viva entre eles; `contatoDe()` dá o quadro do impacto.
- `src/estilo2d/Diretor.tsx` (da etapa anterior) usado junto.
- Prévias: `FolhaGolpes` (8 momentos de cada golpe, contato marcado; `out/personagens/folha-golpes.png`) e `DemoGolpes`
  (luta de ~14 s montada SÓ com listas de passos, câmera lenta em 3 contatos; `out/demo-golpes.mp4`).

## Testes / revisão
- Folha de golpes: jab/direto chegavam ao contato com o braço ainda subindo (atraso de follow-through no braço que bate)
  → golpes rápidos ganharam `cadeia` própria (braço que bate sem atraso). Cambalhota rente ao chão virava "parada de mão"
  (o `gira` roda em volta do peito) → trocada por mortal pra frente no ar.
- Demo: depois de se cruzarem os dois ficavam colados → passo de `recua` dos dois depois do cruzamento.

## Pendente (próximas etapas)
- Rolamento no chão de verdade: precisa de um ponto de giro configurável no Boneco2D (girar em volta do quadril/chão).
- Atuação: reações do outro personagem (olhar acompanhando, tomar fôlego, provocar), gestos de fala, expressões por golpe.
- Caminhadas/corridas integradas no `combate()` (hoje ficam em corrida.ts/movimento.ts, separadas).
- Mais golpes: chute giratório, gancho, rasteira, agarrão/arremesso, cotovelada, joelhada.
