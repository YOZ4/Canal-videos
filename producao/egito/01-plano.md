# Egito: a areia molhada — Etapas 1 e 2 (skill roteiro-imagens-remotion)

Fonte: `Roteiro 1 — Egito: a areia molhada (produção)`, áudio `public/narracao/egito.mp3` (75,55 s), 60 qps, 4533 quadros.

## 1.1 Tabela de cenas (tempos do roteiro; palavras pelo alinhamento do áudio real)

| Cena | Quadros | Fala (resumo) | Intenção | Ação / câmera | HUD / sons |
|---|---|---|---|---|---|
| C01 | 0–264 | Lucas despeja água na frente da estátua | curiosidade (ação estranha no 1º s) | close na água (zoom 2,2) → 2,2 s abre com mola revelando a estátua gigante | água, whoosh grave |
| C02 | 264–645 | Diego zomba: "Cachinho… Minecraft…" | deboche antes dos 6 s | close Diego braços cruzados, ri em "Cachinho", nega em "Minecraft", aponta em "Água não faz" | pop, boing |
| C03 | 645–1104 | 172 homens, prazo do pôr do sol | escala/pressão | plano geral, pan pela fila (puxada defasada) | HOMENS 0→172, PRAZO, ticks, ronco |
| C04 | 1104–1344 | chefe grita; Lucas nem olha | tensão × calma | chefe aponta e grita (tremida 6 q) → 21,2 s câmera desliza até o Lucas | eco + impacto, água |
| C05 | 1344–1710 | equipe do Diego na areia seca; "Força resolve" | confiança | monte de areia cresce; push até o Diego flexionando o braço | areia raspando, ting |
| C06 | 1710–1983 | chefe tira metade; sobram 86 | castigo | metade solta a corda e vai embora | HOMENS 172→86 vermelho, passos, wah-wah |
| C07 | 1983–2460 | Diego comemora; Lucas responde | provocação | Diego aponta e ri → pan contínuo com borrão até o Lucas (sorriso de canto) | boing, whoosh |
| C08 | 2460–2703 | trenó do Lucas desliza; o do Diego trava | virada | trenó desliza com linhas de velocidade → câmera vai ao trenó travado, hold em "travou" | deslize, impacto + música para; luz vira azul |
| C09 | 2703–3564 | "Sabe por quê?" explicação | entendimento | diagrama em corte: seco (monte + seta vermelha), carrinho de praia, molhado (grãos grudados + seta verde) | AREIA MOLHADA NA MEDIDA, AMSTERDÃ • 2014, FORÇA 100→50% |
| C10 | 3564–3879 | Diego joga o balde: lama, atola | castigo cômico | antecipação, balde por cima da cabeça, arremesso, splash, trenó afunda inclinado | splash, glub, afundando, tremida |
| C11 | 3879–4098 | os 86 chegam ao templo | vitória | pôr do sol, trenó chega com mola, Lucas comemora, Diego mudo e sujo ao fundo | 86 HOMENS • NO PRAZO (brilho), música sobe |
| C12 | 4098–4533 | pintura da tumba; "só um ritual" | revelação + loop | parede ocre com figuras em perfil, câmera desliza até o homem com a água e desce ao close; RITUAL? riscado; últimos 24 q viram o 1º quadro | carimbo, água (loop) |

Dúvida/decisão: o pacote `.zip` (imagens `ref-*`, `c*-storyboard.png`, `egito-legenda.json`, `egito-cenas.json`) **não veio**.
Decisão: seguir pelos textos do roteiro (descrições detalhadas de figurino, cores, cenários e câmera), tempos das cenas do
roteiro e palavras pelo `scripts/alinhar.py` (bateu com os tempos do roteiro em ±0,3 s).

## 1.2 Triagem das imagens

Nenhuma imagem recebida. Referências usadas: as fichas oficiais do canal (`out/personagens/ficha-lucas.png`,
`ficha-diego.png` = "aparência oficial" citada no roteiro) e as tabelas de cor/figurino/cenário do próprio roteiro.
Mapa de cenários respeitado: deserto à tarde só em C01–C08 e C10; fundo azul só no C09; pôr do sol só no C11; tumba só no C12.

## 2. Plano visual e de movimento

- **Figurino** (novo no `Boneco2D`, campo `egito` do Design): peito nu com linhas leves, saiote de linho com pregas até o
  joelho, cinto na cor do personagem com fivela dourada, colar largo em arcos (dourado / cor / verde-água), braceletes
  dourados + braçadeira na cor, sandálias; chefe com pano listrado na cabeça (khat). Elenco: `src/videos/Egito/elenco.ts`.
- **Camadas**: céu (tela) → pirâmides (parallax 0,15) → dunas (0,4) → chão → equipe de trás (menor, com névoa) →
  trenó + estátua → equipe da frente → personagens principais → grãos de areia ao vento → HUD → legenda.
- **Luz**: sol alto à direita descendo de C01 a C10 (céu esquenta), sombras chapadas puxadas pro roxo; C11 com luz de
  recorte laranja; C09 luz fria azul.
- **Movimento**: puxadores com ciclo próprio (atraso 3–6 q a 30 qps entre um e outro, amplitude e duração variando),
  respiração e piscadas irregulares, antecipação antes de apontar/flexionar/arremessar, molas (`mola` 60 qps) em todas
  as poses, trocas de expressão em 6–9 quadros no frame da palavra, tremida só nos impactos, holds em "travou".
- **Câmera**: abre com mola no C01, push-in lento nos closes, pan contínuo com borrão (C04, C07, C08), chicote nas
  transições C02→C03 e C06→C07, clarão no C10, fade no C12, loop no fim.
