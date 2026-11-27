# 02 — Direção visual: "O homem que vendeu a Torre Eiffel"

Entrada: `01-roteiro.md`, `01-cenas.json`, `img/` (fichas ref-01..07, storyboards c01..c12), `src/videos/TorreEiffel/legenda.json`.
Áudio `public/narracao/torre-eiffel.mp3` = 81,24 s = **4874 quadros a 60 qps**. Todos os números abaixo são quadros (q) a 60 qps.

## 0. Decisões gerais (valem para o episódio inteiro)
- **Estilo**: vetorial limpo das fichas (contorno `#1d1424`, cores do roteiro, sombra suave do lado direito). **Sem**
  `GradeJJK`, sem `CelJJK`, sem granulado pesado (finalizar com granulado 0 ou 1). Luz por cena = camada de cor por cima
  do cenário + leve tingimento dos bonecos (ver tabela 1). Única exceção de acabamento: `FilmeMudo` no flashback sépia (C06), já aprovado.
- **60 qps, desenho a cada quadro**, mas com **holds** de 18–40 q nas poses de efeito (o boneco só respira/pisca).
  Tempos de movimento dobram em relação ao canal a 30 qps: antecipação 8–14 q, ação 6–12 q, follow-through cabeça +4 q,
  antebraço +4–6 q, gravata/lenço/chapéu +8–12 q, acomodação por `mola(..., fps = 60)`.
  **Atenção**: `piscar`, `respira`, `fala`, `andar` e `mola` de `anim.ts`/`movimento.ts` assumem 30 qps — chamar com `f/2`
  (ou passar `fps = 60` na `mola`), senão piscam/respiram rápido demais.
- **"3D" = câmera em camadas com z** (escala de cada camada = F / (F − z + camZ), F ≈ 1000) + parallax em x/y pela mesma fórmula.
  Objetos podem girar com volume (documento, mini torre, crachá, envelope, tampo da mesa, carimbos). **Personagens: sempre
  chapados**, só escalam/deslocam com a camada deles. Proibido rotateX/rotateY em boneco.
- **Mesa do hotel**: o storyboard desenha a toalha na altura dos pés. Na animação, a mesa fica **na frente** (z −300) com o
  tampo na altura da cintura dos personagens (z −450) — é o que permite "por baixo da mesa" na C08. Proporções e roupas iguais às fichas.
- **Sincronia com a voz**: quando o tempo do `01-cenas.json` cai antes da palavra, o golpe visual vai **na palavra**
  (legenda.json). Diferenças relevantes: carimbo PROVISÓRIA (palavra em 1673, não 1590), SEGREDO (1946), puf (3535),
  URGENTE (3870), flip GOLPISTA (4200). Indicado em cada cena.
- **Braços**: na vista de frente, `bracoD` = lado DIREITO da tela, `bracoE` = lado esquerdo.
- **Legenda**: 1 palavra por vez a partir do legenda.json, `destaque` em laranja `#ff9b2f`; y ≈ 1620. Sobe para y ≈ 1500
  quando houver HUD embaixo (C04 "À VENDA", C09 etiqueta do peixe, C11 texto).

### Rostos de referência (valores para `Rosto`)
| Personagem / expressão | olhos | olhar | sobrancelha | sobrancelhaY | sorriso | boca | canto | bochecha |
|---|---|---|---|---|---|---|---|---|
| Lustig calmo/oficial | 0,9 | [0,0] | 0 | 0 | 0,15 | 0 | 0 | 0,4 |
| Lustig sorriso de vendedor | 0,78 | [0,0] | 6 | 3 | 0,6 | 0 | 0,35 | 0,6 |
| Lustig segredo ("shh") | 0,7 | [0,2;0] | 8 | 2 | 0,3 | 0 | 0,6 | 0,5 |
| Lustig pedindo propina | 0,6 | [0,8;0,1] | 10 | −2 | 0,2 | 0 | 0,7 | 0,4 |
| Lustig fugindo feliz | 1,2 | [0,−0,2] | −4 | 10 | 1 | 0,7 | 0 | 0,9 |
| Poisson rindo/deboche | 0,5 | [0,0] | −4 | 6 | 1 | 0,85 | 0 | 0,9 |
| Poisson interessado | 1,25 | [0,0] | −2 | 9 | 0 | 0,1 | 0 | 0,4 |
| Poisson ganancioso | 0,75 | [0,2;0] | 6 | 0 | 0,7 | 0 | 0,3 | 0,7 |
| Poisson desconfiado | 0,62 | [−0,3;0] | 14 | −2 | −0,1 | 0 | −0,2 | 0,3 |
| Poisson envergonhado | 0,6 | [0;0,6] | −12 | 4 | −0,3 | 0 | 0 | 1,5 + pele vermelha |
| Comerciante sério | 0,95 | alvo | 2 | 0 | 0,05 | 0 | 0 | 0,4 |
| Comerciante curioso / dúvida | 1,15 | alvo | −6 | 6 | −0,1 | 0,1 | 0 | 0,4 |
Nunca usar sorriso ≤ −0,7 (vira boca de fúria). Trocas de expressão por `trocaRosto` (já dá o "pulinho" de corpo).

## 1. Paleta e luz por cena
| Cena | Cenário / céu | Direção da luz | Cor da luz / recorte | Sombra (força) | Atmosfera | Personagens se adaptam |
|---|---|---|---|---|---|---|
| C01 | Hotel A, janela com torre aberta → cortina fecha em 172–200 | −60° (lustre em cima à esquerda) + janela à direita | quente `#ffd99a`; recorte claro da janela `#cfe8ff` até 200, depois some | 0,25 | brilho radial do lustre pulsando ±4%; poeira dourada lenta (6 partículas) | ao fechar a cortina a sala escurece 12% e o recorte azul some: "ficou secreto" |
| C02 | Hotel A, close | −60° | quente `#ffd99a` | 0,25 | desfoque do fundo 6 px; bokeh do lustre | Poisson com brilho dourado no topo da careca |
| C03 | Rua B, céu `#8fc8f0`→`#ffe2b0` | −120° (sol à esquerda alto) | branco-quente `#fff2d6` | 0,2 | 3 pombos cruzando no crane; leve névoa azul na torre (z −2500) | Lustig com sombra no lado direito, aba do fedora sombreia os olhos (faixa 15% mais escura) |
| C04 | Hotel A | −60° | quente `#ffd99a`; mini torre com brilho dourado `#ffd23f` | 0,25 | partículas douradas sobem do contador | comerciantes iluminados por igual; Lustig ganha +10% de brilho no push-in |
| C05 | azul-escuro chapado `#14203a` | — (frontal) | contorno branco fino 3 px em volta de cada retrato | 0 | nada (pausa) | rostos sem tingimento |
| C06a (1431–1836) | Rua B em sépia `#c9a77a`→`#f0d9a8` | −90° | sépia | 0,15 | `FilmeMudo` (riscos, vinheta, tremida de projetor 1 px) | — |
| C06b (1836–1985) | Hotel A, close de Lustig | −60° | quente, vinheta escura 25% nas bordas | 0,3 | lustre desfocado atrás | Lustig com meia sombra no lado do dedo (segredo) |
| C07 | Rua B, céu de dia | −120° | `#fff2d6` | 0,2 | fumaça do escapamento (bolinhas cinza); na base da torre, faixas de luz entre as vigas | quando entram na sombra da torre, bonecos −15% de brilho |
| C08 | Hotel A, **abajur** (lustre apagado) | −20° (abajur na mesa, baixo) | âmbar `#ffb45a`; embaixo da mesa: quase preto `#1a1020` com fio de luz âmbar na borda do tampo | 0,4 | círculo de luz do abajur na mesa; fumaça de charuto lenta | rostos iluminados por baixo (sombra no alto da testa); sob a mesa só silhuetas das pernas com recorte âmbar |
| C09 | fundo do mar `#14304a`→`#081422` | 90° (de cima) | raios azul-claro `#7fc7ff` (opacidade 0,15, balançando) | 0 | bolhas subindo, poeira em suspensão | bonecos-símbolo em azul-acinzentado, contorno mantido |
| C10 | trem: paisagem verde `#9cc98a`/céu `#bfe3ff`; depois roxo `#3a2752` em volta da janela | −90° | dia claro | 0,2 | notas voando, fumaça da locomotiva | Lustig feliz com luz cheia no rosto |
| C11 | Rua B nublada `#5a6a8a`→`#a0a8b8`, porta POLICE `#2f3f62` | −100° difusa | fria `#c8d0e0` | 0,1 | garoa fina opcional (linhas 1 px, 20% opacidade) | Poisson dessaturado 15%; o vermelho do rosto é a única cor quente do quadro |
| C12 | Hotel A, igual à C01 (cortina **aberta**) | igual à C01 | igual à C01 | 0,25 | igual à C01 | comerciantes do grupo 2 com a mesma luz |

## 2. Decupagem, atuação, HUD e som — cena por cena
Formato do plano: **Pn início–fim q** · tipo · enquadramento · câmera · profundidade/desfoque.

### C01 · 0–252 · Gancho (3D forte)
- **Estado E0 (quadro 0 = último quadro da C12)**: close no documento sobre a mesa, zoom 1,6; documento no centro-baixo
  (centro em x 540, y 1250), girado 15° para a câmera, mão aberta do Lustig (`bracoE`) encostada na borda de cima; Lustig
  cortado no peito (só gravata e mão), comerciantes **fora do quadro** (para o loop não denunciar o grupo). Fundo desfocado 10 px.
- **P1 0–96** · detalhe · documento chegando: desliza de z −300 → 0 (escala 0,85 → 1,1), giro 15° → 8° com sombra no tampo
  andando junto; mão sai do papel em 70 (follow-through dos dedos +4 q). Câmera fixa, tremor 0. Som: papel deslizando em 6.
- **P2 96–252** · dolly-out contínuo zoom 1,6 → 0,75 (curva sai, 110 q, acomoda em 206): o documento passa à frente e sai
  pela borda de baixo-esquerda (z 0, escala até 1,6 e desfoque 8 px); revela mesa (z −300), Lustig à direita e os 5
  comerciantes do grupo 1 à esquerda (z −450), parede/janela (z −1200) quase parada. Sem desfoque no fim.
- **Atuação**: Lustig sorriso de vendedor até 150; em "secreta" (172) olhar vai para a janela (olhar primeiro, cabeça +4 q). Cortina: antecipação `bracoD` recua 10 q (ombro 30° → 15°), estica até a cortina (ombro 80°,
  mão aberta) em 180, puxa até 200 com a cortina seguindo 6 q atrás e balançando 2 vezes (mola solta). Rosto passa para
  calmo/oficial em 200 e **hold** até 252 olhando para a câmera. Comerciantes: sério, olhar no documento, um deles engole
  seco (cabeça desce 3 px em 210). Carimbo vermelho no documento (já desfocado na borda) pulsa 1,3 → 1 em 216 + tremor 4 px 8 q.
- **Som**: papel 6, cortina 172, carimbo "tum" 216. Jazz (piano + contrabaixo) entra em 0 já em ~50%.
- Transição: corte seco com whoosh em 250.

### C02 · 252–540 · Zombaria
- **P3 252–342** · close de Poisson (peito pra cima), zoom 1,35, chão fora do quadro, careca no terço de cima. Fundo do
  hotel em z −1200 anda 0,3× (deriva de 20 px para a direita). Desfoque fundo 6 px.
  Atuação: desconfiado em 264 ("Vender"), inclina para a câmera (escala 1 → 1,05 + cabeça desce 6 px, 18 q). Segurando o riso
  314–330: bochecha 0,9 → 1,3, canto treme ±0,1 a cada 4 q, boca 0. Antecipação 330–342: ombros sobem (estica 1,03), olhos 0,3.
- **P4 342–420** · mesmo close, câmera **tremida 12 q** (amplitude 8 px) em 342 ("Só"). Gargalhada: cabeça −8°, rindo/deboche,
  ombros sacudindo (agacha oscila 6 px a cada 8 q), barriga respira (estica 1 ± 0,02), lagrimazinha (`Gota` no olho em 380).
- **P5 420–540** · mesmo close + **inset** de Lustig no canto superior direito (retângulo 300×380, borda dourada 6 px, entra
  com mola 10 q em 420): Lustig calmo/oficial, ergue a taça 4 cm e pisca uma vez devagar (12 q) — só isso. Poisson continua
  rindo, decaindo até 500, termina limpando o olho com `bracoD`. Inset sai em 528 (escala → 0, 10 q).
- **Som**: gargalhada 342, tilintar de taça 420. Música a 40% enquanto ele ri.

### C03 · 540–840 · Paris 1925 (profundidade)
- **P6 540–690** · geral, crane up: começa com calçamento no terço de baixo, sobe até o topo da torre no terço de cima.
  Camadas: calçamento z 0, prédios z −600 (andam ~3× mais que a torre), torre z −2500, céu z −4000 (quase parado). Curva suave.
  Etiqueta `PARIS • 1925` em 546 (cai de cima com mola, overshoot 8 px), pulsa em "1925" (583), sai em 680.
- **P7 690–702** · whip pan para baixo, 12 q, borrão vertical (`CameraMotionBlur` só nesses quadros), whoosh em 690.
- **P8 702–840** · médio de Lustig na calçada, chão no terço de baixo, câmera levemente de baixo (`camBaixa`, ocupa 0,7):
  "autoridade". Prédios desfocados 4 px. Atuação: chega do whip já com o fedora; em "diretor" (736) mostra o papel com
  `bracoD` (lado direito da tela): antecipação 8 q (papel recua ao peito), estica em 10 q, overshoot 6 px, **hold** 30 q, cabeça
  +4 q, rosto sorriso de vendedor. Em 780 ajeita a gravata com `bracoE` (mão bola na gravata, 2 puxões de 8 q, queixo sobe 3°),
  calmo/oficial, hold até 840.
- **Som**: rua (buzina antiga em 560, sanfona baixinha 540–840), whoosh 690. Jazz cai para 30% sob a sanfona.

### C04 · 840–1305 · Seis comerciantes e 7.300 t (3D forte)
- **P9 840–1098** · geral da mesa, zoom 0,72, ligeiramente de cima (chão no terço de baixo, lustre no topo). Mesa z −300.
  Comerciantes entram pela esquerda andando (`andar(f/2)`) e **sentam em cascata a cada 10 q** a partir de 864; Poisson é o
  6º (912). Cada sentada: antecipação sobe 4 px (4 q) → desce 8 q → afunda 6 px (squash estica 0,96) → mola pesada. Chapéus
  e cabeças +4 q. Comerciantes curiosos olhando para Lustig; Poisson rindo/deboche, braços cruzados no fim (hold).
  Etiqueta `6 COMERCIANTES` em 852, o número faz "tic" a cada sentada, sai em 1000. Em 1040–1090 Lustig põe a mini torre na
  mesa com as duas mãos (desce 14 q, quique 3 px).
- **P10 1098–1260** · push-in zoom 0,72 → 1,5 até a mini torre (curva entra-sai, 70 q) e segue lento até 1260.
  Lustig apoia as mãos na mesa em 1098 (inclina o tronco à frente: escala +3%, sorriso de vendedor, hold). **Mini torre gira 360°**
  em 1098–1260 (objeto 3D). Contador `7.300 t` + "DE FERRO": entra de z −800 → 0 em 1098–1120 (escala 0,3 → 1, mola), texto
  extrudado dourado; valor: 0 → 7.000 até 1130 ("mil"), → 7.300 até 1190 ("toneladas"), hold. Partículas douradas.
- **P11 1260–1305** · close da mini torre (zoom 1,6): etiqueta vermelha `À VENDA` cai de z +300 (fora da tela, grande) e bate na
  torre em 1272 ("venda"): **hit-stop 8 q**, squash da etiqueta, tremor 6 px por 8 q, clang.
- **Som**: cadeiras arrastando 6× (864…914), tic-tic do contador 1098–1190, clang 1272.

### C05 · 1305–1431 · Pergunta aberta (2D puro)
- **P12 1305–1431** · tela dividida 2×2, fixa, fundo `#14203a`. Retratos (peito pra cima): comerciante 1, comerciante 2 (boina),
  comerciante 3, Poisson (baixo-direita). Entram com mola em 1314, 1322, 1330, 1338 (pop cada). Texto `POR QUE ALGUÉM
  ACREDITARIA?` no centro em 1318; "acreditaria" (1367) pulsa. Rosto dúvida, olhar para o texto do centro.
  **Piscam juntos** em 1380 (8 q) — o gag; cabeças inclinam 4° ao mesmo tempo em 1395. Hold até 1431.
- **Som**: 4 pops. **Jazz para** (pausa de um compasso) 1314–1420 e volta no "Primeiro".

### C06 · 1431–1985 · Escalada 1: provisória + segredo
- **P13 1431–1660** · geral da torre 1889 em sépia com bandeirinhas, `FilmeMudo`. Órbita lenta de ~20° em volta da torre
  (objeto girando, prédios em parallax). Etiqueta `1889: SÓ PRA EXPOSIÇÃO` em 1440 (mola), sai em 1650.
- **P14 1660–1722** · mesmo plano, zoom 1,0 → 1,1. Carimbo `PROVISÓRIA` vem de z +400 (enorme, desfocado) e **bate em 1673**
  (palavra "provisória"; o json dizia 1590): hit-stop 6 q, tremor 10 px por 8 q, 1 q de clarão sépia.
- **P15 1722–1830** · zoom na ferrugem (1,1 → 1,8 no meio da torre, 40 q): manchas de ferrugem se espalham 1726–1790; em
  "caro demais" (1765) notas e moedas saem voando para fora do quadro pela direita (12 notas, giro aleatório). Texto
  `CONSERTO CARO DEMAIS` em 1765.
- **Transição** 1830–1836: clarão sépia (branco-creme 6 q) → corte.
- **P16 1836–1985** · close de Lustig no hotel (ombros pra cima), push lento 1,2 → 1,35. "O governo quer desmontar": calmo,
  olhar para a câmera, inclina à frente (escala +4%). Em 1918 antecipação: olhar para os lados (esq 6 q, dir 6 q).
  "mas" (1928): dedo nos lábios com `bracoE` (mão `aponta`, dedo para cima, sobe em 10 q, overshoot 4 px), rosto segredo,
  sobrancelha sobe; **hold** 1940–1985. Etiqueta `SEGREDO` em 1946 (palavra).
- **Som**: projetor 1431–1830 (baixo), carimbo forte 1673, rangido + moedas 1765, "shhh" 1928. Jazz com filtro "rádio antigo" no sépia.

### C07 · 1985–2434 · Escalada 2: inspeção
- **P17 1985–2130** · dolly lateral seguindo o carro (`seguir`, 8 q de atraso): carro z 0 da esquerda para a direita, prédios
  z −600 a 0,35×, torre z −2500 crescendo (escala 0,7 → 1,0, dolly-in). Carro quica 3 px nas pedras (ruído), rodas giram,
  silhuetas de chapéus dentro balançam +4 q. Etiqueta `INSPEÇÃO "OFICIAL"` em 1992, sai em 2120.
- **P18 2130–2256** · contra-plongée na base: vigas da torre (cenário) convergindo para cima, preenchendo os 2/3 de cima;
  Lustig grande no terço de baixo (`camBaixa`, chão no rodapé), comerciantes pequenos atrás olhando para cima. Personagens
  chapados, sem distorção. Em "torre" (2148) Lustig aponta para cima com `bracoD` (antecipação 8 q, ombro 150°, mão `aponta`,
  hold 24 q); em "deles" (2214) abre os dois braços (mãos abertas, ombros 110°) como dono, peito estufado (estica 1,03), hold.
- **P19 2256–2358** · mesmo plano + inset (quadro com borda dourada, canto superior esquerdo) com Poisson rindo da C02 (reaproveitar
  o desenho, 30% sépia = "memória"). Inset entra em 2256, sai em 2352.
- **P20 2358–2434** · close no caderno + rosto de Poisson_rua (chapéu-coco), olhos interessado (1,25), suando (`Gota` em 2390).
  Caderno no `bracoE`, lápis no `bracoD` rabiscando rápido (zigue-zague 10 Hz, linhas aparecendo). Câmera fixa, tremor 2 px.
- **Som**: motor antigo 1986, buzina "fom-fom" 2050, lápis 2364. Jazz a 45%.

### C08 · 2434–3230 · Escalada 3: propina (3D forte)
- **P21 2434–2537** · médio dos dois na mesa: Lustig à esquerda, Poisson à direita, tampo em primeiro plano na altura da cintura,
  abajur no centro da mesa. Câmera fixa, respira 0,5%. Ambos esperando (Poisson ganancioso contido, Lustig calmo).
- **P22 2537–2640** · mesmo plano, push 1,0 → 1,1. Aperto de mão em "vence" (2556): Lustig usa `bracoD` (lado direito da
  tela, rumo a Poisson); Poisson usa `bracoE`. Antecipação de Poisson recuando a mão 8 q; mãos se encontram em 2562; 3 sacudidas
  de 12 q, cabeças balançando +4 q. Etiqueta `VENCEDOR: POISSON` em 2556, sai em 2635. Sorriso de vendedor × ganancioso.
- **P23 2640–2700** · close a dois mais apertado: Lustig inclina 10° para Poisson ("diretor pede", 2645), rosto pedindo propina,
  hold. Poisson pisca 2 vezes (8 q cada). Etiqueta `PROPINA` em 2693 (palavra).
- **P24 2700–2790** · câmera **desce e passa por baixo do tampo** (40 q, 2700–2740): o tampo é um plano 3D — primeiro vemos a
  toalha de cima, depois a borda virando uma faixa, depois a parte de baixo escura ocupando o terço de cima do quadro. Embaixo:
  pernas dos dois em silhueta com recorte âmbar; a mão de Poisson (vindo da direita) passa o envelope gordo para a mão de Lustig
  (da esquerda) em 2746–2775; pé de Poisson batendo nervoso. Sobe de volta em 2775–2790.
- **P25 2790–3050** · close de Poisson (pensamento): ganancioso, olhos semicerrados, esfrega as mãos (as duas mãos juntas na frente
  do peito, 4 esfregadas de 10 q). Balão de pensamento simples (nuvem branca, 3 bolinhas) com ícones genéricos: prancheta com
  ✓✓✓ — nada da série. Em "Papel" (2960) faz que sim com a cabeça (2 acenos), sorriso 0,7 → 0,9, hold até 3050.
- **P26 3050–3230** · médio da entrega: em "paga" (3058) Poisson empurra documento + envelope para Lustig com `bracoE`
  (antecipação puxa 8 q, empurra 8 q, overshoot). Texto `PREÇO + PROPINA` em 3072; "PREÇO" acende em "preço" (3126),
  "PROPINA" acende em 3196. Lustig guarda o envelope no paletó (hold sorriso de vendedor).
  Transição: **luz apaga** — abajur pisca 2× e apaga em 3214–3230; tudo escurece para azul.
- **Som**: aperto de mão 2562, whoosh grave descendo 2700, papel/notas 2746, ka-ching 3060. Jazz a 35%.

### C09 · 3230–4056 · Explicação: a isca (3D forte, sem música)
- **P27 3230–3360** · geral escuro: anzol desce do topo (3238 → para no centro em 3290, mola solta, balança 3 vezes) com o
  envelope de isca girando devagar (giro ±25° no próprio eixo, objeto). Raios de luz de cima balançando. Texto
  `A PROPINA FOI A ISCA` em 3294; "isca" (3354) pulsa.
- **P28 3360–3440** · mesmo plano, câmera orbita leve (fundo de partículas em parallax). Peixe laranja faz órbita em volta da isca:
  passa na frente (escala 1,15, por cima do envelope) e atrás (0,8, por baixo). Etiqueta `POISSON = "PEIXE" EM FRANCÊS` em 3390
  (palavra "Poisson"), embaixo. **Mordida**: antecipação recua 10 q (3402–3412), boca abre, avança 6 q, "nhac" em 3420,
  hit-stop 6 q, anzol puxa para cima 10 px com tremor.
- **P29 3440–3572** · médio: boneco cinza genérico (Boneco2D cinza, sem detalhes) pega moedas com `bracoD` em "pega" (3481),
  olha para os lados, e em "some" (3535) **puf** (nuvem `Poeira` + pop, 14 q). Lugar vazio fica com contorno tracejado.
- **P30 3572–3790** · bonecos lado a lado: esquerda o contorno tracejado do golpista (✗ vermelho em 3600), direita boneco de terno
  (grave) com a mão estendida, palma para cima (`bracoD`, mão aberta) — aparece com mola em "corrupto" (3703), ✓ verde em
  "verdade" (3740). Câmera fixa.
- **P31 3790–4056** · close no papel com carimbo: papel no centro, atrás uma fila de 5 bonecos pequenos impacientes (batendo o pé,
  olhando o relógio). Carimbo `URGENTE` vem de z +400 e **bate em "urgência" (3870)**: hit-stop 6 q, tremor 8 px. Em "oficial" (4020)
  o papel ganha brilho dourado. Transição: **clarão branco** 4044–4056.
- **Som**: música **corta em 3230** (fade 6 q), drone grave contínuo; bolhas 3360–3440; nhac 3420; puf 3535; carimbo 3870.
  O drone é a única coisa abaixo da voz.

### C10 · 4056–4342 · Revelação e fuga
- **P32 4056–4240** · close no crachá no peito de Lustig_rua (fedora) dentro do trem, janela atrás com paisagem em 2 camadas
  (morros 0,3×, postes 1,5×). Crachá `DIRETOR`. Câmera recua de 1,8 → 1,2 em 4126–4190 mostrando o rosto (sorriso de vendedor →
  canto 0,8). **Flip** do crachá (objeto gira em Y, 14 q) caindo em `GOLPISTA` em "golpista" (4200); etiqueta `VICTOR LUSTIG:
  GOLPISTA` em 4200. Lustig pisca devagar para a câmera em 4215 (piscar normal, 10 q).
- **P33 4240–4342** · geral do trem: janela do vagão vista de fora, centralizada, fundo roxo `#3a2752` em volta, Lustig na janela.
  Em "fugiu" (4259): antecipação agacha 10 px (6 q) → braços para cima (ombros 160°, mãos abertas, estica 1,08), rosto fugindo
  feliz; chapéu sobe girando e volta à cabeça em 4300 (+10 q de atraso); notas saem voando pela janela. Hold com braços balançando.
  Trem começa a sair para a direita em 4300 (janela desliza 300 px até 4342). `→ ÁUSTRIA` em "Áustria" (4288).
- **Som**: jazz **volta em 4056 mais rápido e debochado** (40%); flip 4195, apito de trem 4259. Transição whoosh 4335.

### C11 · 4342–4556 · Vergonha
- **P34 4342–4416** · médio: Poisson_rua de frente na calçada, porta POLICE à direita (prédio da polícia z −200, torre z −2500,
  parallax leve 15 px). Poisson para (pés plantados, assenta com mola pesada), desconfiado, mão `bracoD` sobe hesitante para a porta e volta.
- **P35 4416–4556** · push-in no rosto (1,0 → 1,6, 50 q). Rosto fica vermelho de cima para baixo em 20 q (4420–4440), envergonhado.
  Em "vergonha" (4446) tira o chapéu-coco com `bracoE` e cobre o rosto (8 q, hold 40 q; olhinho espiando por cima da aba em 4480).
  Texto `VERGONHA DEMAIS PRA DENUNCIAR` em 4446. Meia-volta em 4512 (`giro` para costas, 10 q), anda curvado saindo pela esquerda
  (ombros caídos, cabeça baixa).
- **Som**: "ahem" 4416, grilo 4460–4556. Jazz baixa para 20%.

### C12 · 4556–4874 · Loop
- **P36 4556–4710** · geral, zoom 0,75, **mesmo enquadramento do fim da C01** (quadro 252), mas cortina aberta e grupo 2 sentado.
  Etiqueta `MESES DEPOIS… DE NOVO` em 4562 (mola, sai em 4700). Comerciantes sérios; Lustig calmo, acerta o punho da camisa
  (`bracoE`) em 4600 — pequeno, "tudo de novo".
- **P37 4710–4874** · dolly-in 0,75 → 1,6 (curva entra, 150 q; últimos 14 q bem lentos) **atravessando as camadas no sentido
  inverso da C01**; Lustig desliza o documento com `bracoE` em 4720 (antecipação 10 q), documento sobe de z −300 → posição E0.
  Comerciantes saem pelo canto esquerdo do quadro antes de 4840. **Quadro 4873 = E0 = quadro 0** (mesma câmera, mesma pose de
  mão, mesmo giro do documento, mesmo rosto). Conferir com um still de 0 e 4873 lado a lado.
- **Som**: relógio virando página 4562, papel deslizando 4720 (o mesmo arquivo do 6). Jazz termina num acorde que casa com o começo
  (último compasso dissolve em 4800–4874).

## 3. Movimento em fases (resumo para o animador)
| Ação | Antecipação | Ação | Follow-through | Acomodação |
|---|---|---|---|---|
| Deslizar documento (C01/C12) | mão recua 10 q, ombro −8° | 20 q, curva sai | dedos +4 q, gravata +8 q | natural |
| Puxar cortina (C01) | `bracoD` recua 10 q | 20 q | cortina +6 q, 2 balanços | solto |
| Gargalhada (C02) | ombros sobem 12 q, olhos 0,3 | estoura em 1 q | cabeça −8° +4 q, barriga 8 q | sacode 6 px/8 q, decai até 500 |
| Mostrar papel (C03) | papel ao peito 8 q | 10 q | papel tremula 6 q | overshoot 6 px, hold 30 q |
| Sentar (C04) | sobe 4 px, 4 q | desce 8 q | chapéu/cabeça +4 q | pesado, afunda 6 px |
| Etiqueta/carimbos (C04, C06, C09) | vem de z +300/+400, 10 q | bate em 1 q | squash 0,9 → 1 | **hit-stop 6–8 q** + tremor 6–10 px |
| Shh (C06) | olhar esq/dir 12 q | mão sobe 10 q | sobrancelha +4 q | overshoot 4 px, hold 45 q |
| Apontar/abrir braços (C07) | 8 q | 10 q | antebraço +4–6 q | hold 24 q |
| Aperto de mão (C08) | recua 8 q | encontro 6 q | cabeças +4 q | 3 sacudidas de 12 q, mola natural |
| Empurrar dinheiro (C08) | puxa 8 q | 8 q | envelope desliza +6 q | overshoot, hold |
| Mordida do peixe (C09) | recua 10 q | 6 q | cauda +6 q | hit-stop 6 q |
| Comemorar (C10) | agacha 10 px, 6 q | 8 q | chapéu +10 q, gravata +8 q | solto, braços balançam |
| Cobrir rosto e virar (C11) | chapéu recua 6 q | 8 q | — | hold 40 q; `giro` 10 q |
- Smears: `LinhasMovimento` por 2–3 q no braço que estica rápido (C03, C07, C08 empurrão, C10). Whip da C03 com `CameraMotionBlur`.
- Sem cor invertida neste episódio (tom é comédia). Os "impactos" são os carimbos/etiquetas com hit-stop e tremor.
- Ninguém 100% parado: respira (`respira(f/2)`), pisca (`piscar(f/2)`), boca com `fala` só se o personagem estiver "falando" (Poisson
  em C02 e o pensamento da C08; nos outros momentos a voz é do narrador → boca fechada).

## 4. Som e música (mapa)
| Trecho (q) | Música | Ambiente / silêncio |
|---|---|---|
| 0–1314 | jazz anos 20 (piano + contrabaixo), ~50% sob a voz; 40% na gargalhada; 30% na rua da C03 | sanfona baixa + buzina na C03 |
| 1314–1420 | **pausa** do jazz (gag da pergunta) | só os 4 pops |
| 1431–1830 | jazz com filtro de rádio antigo (passa-banda 300–3000 Hz) | projetor |
| 1830–3214 | jazz normal ~45%, cai para 35% na propina | motor/buzina C07; sala silenciosa na C08 |
| 3214–3230 | jazz some com a luz | — |
| 3230–4044 | **sem música**: drone grave + bolhas | silêncio relativo antes do "nhac" (3402–3420) |
| 4044–4056 | clarão branco: corte seco do drone | — |
| 4056–4342 | jazz **volta mais rápido e debochado** (40%) | trem |
| 4342–4556 | jazz 20% | grilo |
| 4556–4874 | jazz 45%, último acorde casa com o quadro 0 | relógio, papel |
Sons que faltam (gerar em `gerar_sfx.py`): papel deslizando, cortina, carimbo, gargalhada (ou "ha-ha" sintético), taça, buzina antiga,
sanfona, cadeira, tic-tic, clang, pop, projetor, rangido + moedas, shhh, motor antigo, lápis, aperto de mão, notas, ka-ching, drone,
bolhas, nhac, puf, flip, apito de trem, ahem, grilo, relógio. Trilha: jazz anos 20 em 2 andamentos (não há gerador de jazz hoje).

## 5. O que falta criar
1. **Personagens** em `personagens.ts` sobre o Boneco2D: `LUSTIG` (terno cinza `#5a5f6b`, gravata vinho `#7a1f2b`, lenço branco,
   bigode fino, cabelo preto para trás com 4 riscos de brilho), `LUSTIG_RUA` (+ fedora), `POISSON` (terno `#7a5a3a`, gravata
   `#3f6b4a`, careca com laterais castanhas, bigode grosso), `POISSON_RUA` (+ chapéu-coco), 5 comerciantes ×2 grupos (cores da ref-04;
   boina e chapéu-coco em dois deles), boneco cinza genérico e boneco de terno genérico (C09). Bigode como peça do rosto (novo).
2. **Pele vermelha progressiva** (envergonhado, C11): parâmetro de cor de pele 0..1 que pinta a cabeça de cima para baixo.
3. **Camera3D por camadas** (z, F ≈ 1000, camX/camY/camZ + escala por profundidade) para C01, C03, C04, C07, C08, C09, C12.
4. **Objetos**: documento com torre e carimbo (plano que gira), mini torre "3D" (treliça desenhada com 4 faces projetadas por
   cos/sen do giro, sem three.js), etiqueta vermelha, envelope com notas, notas/moedas voando, anzol com linha, peixe laranja,
   carro 1925 (quica, rodas giram), caderno + lápis, taça, abajur, crachá DIRETOR/GOLPISTA que vira, chapéus fedora/coco
   soltos (para jogar/tirar), porta POLICE.
5. **Tampo da mesa em 3D** (C08): plano que mostra cima → borda → baixo conforme camY passa por ele.
6. **Cenários**: Hotel A (ref-06, com cortina animável e lustre/abajur que acendem e apagam), Rua B (ref-07) com variantes sépia e
   nublada, base da torre com vigas em perspectiva (C07), trem (interior com janela + exterior sobre roxo), fundo do mar com raios.
7. **HUD**: etiqueta com mola (pode estender `Etiqueta`/`Selo`), carimbo que vem de z (PROVISÓRIA, URGENTE), contador extrudado
   dourado `7.300 t`, texto com partes que acendem (PREÇO + PROPINA), inset com borda dourada, balão de **pensamento** (nuvem — hoje só há `Balao` de fala), ✓ e ✗.
8. **Gestos que o braço atual pode não alcançar**: dedo nos lábios (C06) e chapéu cobrindo o rosto (C11) — conferir com `posMao`;
   se não alcançar, criar pose específica (ombro mais alto + cotovelo dobrado 150°) em vez de trocar por outro gesto.
9. **Esfregar as mãos** (C08) e **mão na gravata** (C03): poses com as duas mãos na frente do peito.

Próximo passo: animador-remotion implementa a partir de 02-direcao.md
