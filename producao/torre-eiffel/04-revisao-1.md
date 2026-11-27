# 04 — Revisão 1: "O homem que vendeu a Torre Eiffel" (rascunho 540x960, 60 qps)

Material olhado (tudo em `/tmp/claude-0/-home-user-Canal-videos/24c6bb4d-5603-52de-bac3-4bbcd741da09/scratchpad/torre/rev1/`):
folhas gerais 1 qps `geral0..3.jpg`; tiras por cena `c01.jpg … c12.jpg`; quadro a quadro `q_mao.jpg` (C01 mão),
`q_cort.jpg` (cortina), `q_vend.jpg` (À VENDA), `q_prov.jpg` (PROVISÓRIA), `q_aperto.jpg` (aperto de mão),
`q_baixo.jpg` (por baixo da mesa), `q_nhac.jpg`, `q_urg.jpg` (URGENTE), `q_flip.jpg` (crachá), `q_c12mao.jpg` (C12 mão);
loop `loop.jpg` + `loop_lado.jpg` (0 | 4873 | diferença); quadros soltos `detalhes.jpg`.
Tempos em mm:ss,s e quadro (q) a 60 qps. Coordenadas em px do vídeo cheio (1080x1920).

**O que está bom (não mexer):** golpes na palavra de PROVISÓRIA (bate em q 1673), URGENTE (q 3870), puf (q 3535),
contador 7.000 em "mil" e 7.300 em "toneladas", SEGREDO (q 1946), GOLPISTA (vira em q 4194–4200), → ÁUSTRIA (q 4296).
Loop: o q 4873 casa com o q 0 (mesma câmera, mão, giro e carimbo; desvio ≤ 3 px a meia resolução, coerente com o
documento continuando a deslizar). Nenhum item rejeitado voltou: bonecos sempre chapados, sem câmera em perspectiva,
só o `FilmeMudo` na C06a.

---

## Revisão 1 — mecânica, rigidez, enquadramento e roteiro

1. **[alta] 01:18,7–01:20,0 (q 4720–4800) — C12** | Um braço gigante (a `MaoEmpurra`, na camada do documento, z 300)
   desce do canto de cima e a mão cobre o ROSTO do Lustig por ~70 q, enquanto o próprio Lustig também estica o `bracoE`
   até o papel: são dois braços, um 3x maior que a cabeça dele. | `q_c12mao.jpg`, `c12.jpg` (78,69–79,44 s) |
   `CenasA.tsx` C12: trocar `const maoSai = f < 4720 ? 1.2 : 0` por `const maoSai = camZ > -260 ? 0 : 1.2` (a mão grande só
   aparece nos últimos ~35 q do dolly, quando Lustig já saiu do quadro) e dar entrada de 6 q de opacidade na `MaoEmpurra`.
   No plano geral, o empurrão é só o `bracoE` do Lustig, com a mão tocando o papel (`alcancar(base, "E", cantoDoDoc)`).

2. **[alta] 00:01,6–00:04,2 (q 96–252) e 01:16–01:19 (q 4556–4740) — C01/C12** | O documento fica "boiando" na frente
   da mesa, sobre o chão (y≈1450, maior que um comerciante), e o Lustig está a 1 m dele com as mãos para baixo:
   ninguém está tocando o papel e ele não está na mesa. A direção pedia que, no dolly-out, o documento passasse à frente
   e saísse pela borda de baixo-esquerda. | `c01.jpg` (1,83–4,0 s), `q_mao.jpg` (q 104–130), `c12.jpg` |
   C01: durante 96–206 somar ao documento um deslocamento `x −= 700*CURVA.entra(t)`, `y += 650*CURVA.entra(t)`
   (t = (f−96)/110), para sair do quadro por baixo-esquerda antes de q 206. C12: na posição inicial `docEm(0)` usar
   `y: 1095` (em cima do tampo, que está em y 1110) e `inclina: 30` (deitado), e só depois de q 4720 ele "sobe" para E0.

3. **[alta] 00:09,7–00:11,4 (q 585–685) — C03 crane** | Abre uma faixa PRETA entre os prédios e o calçamento (e sob a
   torre): a camada do calçamento (fator 1) desce 1100 px e os prédios (fator 0,7) só 770 px, sem nada pintado no vão.
   E o crane não chega ao topo da torre (topo fica em y≈−165 no fim). | `c03.jpg` (9,75–11,25 s), `detalhes.jpg` (1º) |
   `CenasA.tsx` C03: dentro do `<g transform={camada(0.7)}>` desenhar antes dos prédios um
   `<rect x={-400} y={1200} width={1900} height={2400} fill="#8a8478" />` (o chão continua atrás deles). Torre: camada
   `0.35 → 0.55` (topo chega em y≈55 no q 690; a base continua escondida atrás dos prédios).

4. **[alta] 01:07,6–01:10,7 (q 4056–4240) — C10 crachá** | No close a legenda (y 1660) fica em cima da boca e do bigode
   do Lustig (q 4056–4140), e depois o crachá DIRETOR/GOLPISTA fica na CINTURA, exatamente atrás da legenda ("DIRET Lustig,",
   "GOLPISTA golpista."). A direção pedia começar com close no crachá, no peito. | `c10.jpg` (67,6–70,4 s), `q_flip.jpg` |
   `CenasB.tsx` C10: `Cracha y={cab[1] + 420}` → `cab[1] + 240` (peito, lado do lenço) e o boneco `P(540, 2050, 1.0)` →
   `P(540, 1900, 1.0)` (tudo sobe 150 px). Câmera: começar com o foco no crachá (zoom 1,8 com o centro no crachá) e recuar
   até o rosto entre 4126 e 4190, como já está; o rosto não pode passar de y 1450 enquanto houver legenda.

5. **[alta] 01:13,8–01:15,2 (q 4446–4512) — C11 cobrir o rosto** | As duas mãos vão para trás da cabeça (pose de "mãos
   na nuca", parece que ele está se rendendo à polícia), o chapéu continua em cima da cabeça e o rosto aparece inteiro, com
   careta. A piada "vergonha" não se lê. | `c11.jpg` (74,0–75,0 s), `detalhes.jpg` (3º) |
   `CenasB.tsx` C11: alvos `[cab[0] ∓ 40, cab[1] + 20]` → `[cab[0] − 75, cab[1] + 115]` e `[cab[0] + 75, cab[1] + 115]`
   (mãos na frente do queixo, segurando a aba); chapéu solto `translate(cab[0], cab[1] + 30) scale(0.62)` →
   `translate(cab[0], cab[1] + 150) scale(0.85) rotate(-12)` (cobre do nariz para baixo, olhos espiando por cima).
   Em 4480–4500 subir o chapéu 25 px para o "olhinho espiando". Vermelho: `#f0a088` → `#e86f5a` (hoje quase não se vê).

6. **[alta] 00:40,6–00:44,9 e 00:51,0–00:53,8 (q 2434–2700, 3050–3214) — C08** | Os dois ocupam uma faixa de ~13% da
   altura (cabeças de ~80 px), 55% do quadro é papel de parede vazio, e o aperto de mão (q 2556–2630) acontece ATRÁS do
   abajur, no centro (abajur em x 540, mãos em x 550): não se vê o aperto nem a entrega. | `c08.jpg`, `q_aperto.jpg` |
   `CenasB.tsx` C08: escala dos bonecos `0.6 → 0.95` (lus0 x 380 → 330, poi0 x 720 → 760, y 1700 → 1820) e abajur
   `translate(540 …)` → `translate(930 …)` (ponta direita da mesa); o `meio` do aperto sobe para y 1260. Zoom base 1,0 → 1,25
   com o foco em y 1250 (o papel de parede fica com ≤ 30% do quadro).

7. **[alta] 00:14,0–00:21,7 (q 840–1305) — C04** | No geral (zoom 0,72) a ação inteira fica numa faixa de 10% da altura e
   a metade de baixo é chão vazio; ao sentar, os comerciantes afundam 80 px e a toalha cobre o rosto do nariz para baixo
   (só os olhos aparecem por cima da mesa, também no push-in e no "close" final). O "close" de q 1260 é o mesmo
   enquadramento do fim do push: a etiqueta À VENDA na torre fica com ~80 px e não se lê. | `c04.jpg`, `q_vend.jpg` |
   `CenasA.tsx` C04: `y = 1330 + 80 * senta` → `1330 + 22 * senta`; geral com `zoom 0.72 → 0.95` e o foco `[480, 1180]`
   (chão no terço de baixo, como pede a direção); close de 1260: `zoom 1.6 → 2.6`, foco `[540, 1000]` (mini torre e etiqueta
   ocupando a metade do quadro).

8. **[média] Planos parados/longos demais (corte a cada 1,5–2,5 s)** | Estes trechos ficam 3,5–4,8 s no mesmo enquadramento,
   quase sem movimento: C02 q 252–540 (4,8 s); C04 q 840–1098 (4,3 s); C06 q 1431–1660 (3,8 s, órbita imperceptível);
   C08 q 2434–2700 (4,4 s); C08 q 2790–3050 (4,3 s, Poisson e balão parados); C09 q 3572–3790 (3,6 s, dos quais 2,2 s só com o
   tracejado e o ✗); C09 q 3790–4044 (4,2 s). | `geral0..3.jpg`, `c06.jpg` (23,85–27,5 s), `c08.jpg` (46,5–50,5 s) |
   Cortes cirúrgicos: C02 corte em q 342 ("Só") para close apertado (escala 1,05 → 1,55, rosto no terço de cima) e volta ao
   médio em q 420 (inset); C04 corte em q 971 ("pra um hotel") para médio do Poisson sentando de braços cruzados (zoom 1,8 no
   6º comerciante); C06 corte em q 1570 ("só pra") para plano fechado das bandeirinhas (zoom 1,7, foco y 700) e órbita de
   20° → 35°; C08 corte em q 2537 ("Poisson") para o médio a dois do item 6; C08P25 corte em q 2905 ("Professor") para close
   do rosto (zoom 1,5) com aceno de cabeça em 2960; C09 o boneco de terno entra em "funcionário" (q 3673, não 3703); C09 P31
   corte em q 3946 ("chato") para close do carimbo (zoom 1,6).

9. **[média] 00:02,9–00:03,6 (q 172–216) — C01 cortina** | A cortina fecha num estalo de ~3 q (q 181 → 184) e a mão do
   Lustig fica erguida no ar ao lado dela, sem pegar o tecido; o Lustig fica cortado na borda direita (q 178–205). |
   `q_cort.jpg` | `cortina = Math.min(1.05, M(f, 178, "solto"))` → puxada de 22 q: `lin(f, 176, 198, 0, 1, CURVA.sai)` +
   2 balanços da mola solta depois de 198; borda da cortina presa à mão (x da borda = `posMao(lustig, "D")[0]` com 6 q de
   atraso). Lustig `P(910, …)` → `P(860, …)` em C01 e C12 (igual nos dois para não quebrar o loop).

10. **[média] 00:45,3–00:46,5 (q 2716–2790) — C08 por baixo da mesa** | O tampo vira uma faixa no topo, as pernas ficam no
    alto e 70% do quadro é preto vazio; o envelope flutua entre as pernas, sem nenhuma mão segurando (os braços ficam atrás
    do tampo escuro). A passagem de cima para baixo dá um pulo entre q 2716 e 2720. | `q_baixo.jpg` |
    `camY = 900 * desce` → `620 * desce` (o tampo fica em y≈500 e as pernas no meio do quadro); desenhar dois antebraços
    simples (manga + mão aberta) DEPOIS do `rect` escuro, saindo das pernas de cada um até o envelope; recorte âmbar de 3 px
    nas pernas. Descida em 40 q sem salto: trocar o `desce < 0.5` por um corte com whoosh em q 2716.

11. **[média] 00:39,3–00:40,5 (q 2358–2434) — C07 caderno** | O "caderno" é uma folha solta, a mão direita é um punho SEM
    lápis e não rabisca; e ele pisca exatamente em "tudo" (q 2399–2410), perdendo o olho arregalado na palavra. |
    `c07.jpg` (39,4–40,1 s), `detalhes.jpg` (4º) | Desenhar o lápis na `posMao(pose, "D")` com zigue-zague ±12 px a 10 Hz e
    linhas aparecendo na folha; trocar a folha por `Caderno` com capa; desligar a piscada entre q 2380 e 2420.

12. **[média] 01:02,0–01:02,8 (q 3720–3790) e 01:04–01:07 (q 3840–4044) — C09** | A mão estendida do "corrupto" sai pela
    borda direita. A "fila de pessoas" são só 2 bonecos nas bordas (os outros 3 estão atrás do papel) e o braço do relógio
    vira um ">" solto ao lado deles. | `c09.jpg` (62,3; 63,3–66,8 s), `detalhes.jpg` (2º) |
    `CORRUPTO` x 780 → 690. Fila: `P(160 + i * 190, 1250, 0.3)` → `P(120 + i * 210, 980, 0.28)` (acima do papel) e papel
    20% menor, descido 120 px; braço do relógio `{ombro: 60, cotovelo: -100}` → `{ombro: 35, cotovelo: -125}` com a mão na
    frente do peito.

13. **[média] 00:22,1 (q 1325) e 01:14,2 (q 4452) — HUD cortado** | As etiquetas com mola "solto" passam de 100% e saem
    pelas bordas ("OR QUE ALGUÉM ACREDITARIA", "ERGONHA DEMAIS PRA DENUNCIA"); os retratos da C05 se sobrepõem no overshoot
    (q 1320–1330). | `c05.jpg`, `c11.jpg` | C05 `tamanho 66 → 56`; C11 `tamanho 58 → 48`; nas duas, mola `"solto" → "natural"`.
    Retratos: `M(..., "solto")` → `"natural"`.

14. **[baixa] Legenda sobre elementos claros** | Legenda branca sobre a toalha creme (C08 q 2434–2700 e 3050–3214), sobre o
    documento (C01 q 100–252, C12 q 4556–4800) e sobre as rodas do carro (C07 q 1985–2130): perde contraste. | `c08.jpg`,
    `c01.jpg`, `c07.jpg` | Nesses trechos passar a legenda para y 1760, ou baixar a mesa/carro 120 px (C08 `MESA_Y` 1460 → 1380
    junto com o item 6; carro y −120).

15. **[baixa] 00:56,0–00:56,4 (q 3360–3385) — C09** | O peixe sai metade pela borda esquerda na órbita. | `c09.jpg` (56,33 s) |
    Raio x da órbita do peixe −30% (fica ≥ 60 px da borda).

16. **[baixa] Loop q 4873 → 0** | Casa bem; a única diferença são as cabeças desfocadas atrás (grupo 2 vira grupo 1 no corte:
    bonés/cores trocam). | `loop_lado.jpg` | Em C12 a partir de q 4830 e em C01 até q 60: desfoque dos comerciantes 8 → 16 px e
    opacidade 0,6 (a direção pedia comerciantes fora do quadro em E0).

## Revisão 2 — peso, atuação, luz, câmera e gráficos

17. **[média] 00:27,9–00:30,5 (q 1673–1830) — C06 carimbo PROVISÓRIA** | Bate na palavra, mas sai cinza (o sépia tira o
    vermelho) e por BAIXO da treliça da torre: as linhas cortam as letras e o impacto some. | `q_prov.jpg` |
    Desenhar o `Carimbo` depois da torre (por cima) e fora do filtro sépia, vermelho `#c0392b` com opacidade 0,9; squash
    0,9 → 1 em 6 q já existe, manter o hit-stop de 6 q.

18. **[média] 00:36,9–00:39,3 (q 2214–2358) — C07 braços abertos** | Braços perfeitamente espelhados e congelados por 2,4 s
    (parece T-pose), sem atraso entre os lados; antes disso, ao apontar a torre (q 2148–2160), o braço passa pela horizontal
    apontando para o lado antes de subir. | `c07.jpg` (35,7–39,1 s) | Abrir: `bracoD` ombro 118, `bracoE` ombro 100, o
    esquerdo começa 4 q depois; no hold, balanço ±3° com fases diferentes nos dois braços e peito estufado (`estica 1.03`).
    Apontar: cotovelo −70 no meio do movimento (o braço sobe dobrado e estica lá em cima), sem passar pela horizontal.

19. **[média] 00:30,5–00:31,9 (q 1836–1920) e 01:09,2–01:10,6 (q 4152–4240) — braços pendurados** | Lustig fica com os dois
    braços retos ao lado do corpo enquanto o narrador fala (C06b e C10 depois do recuo). | `c06.jpg`, `c10.jpg` |
    C06b: em "O governo quer desmontar" (q 1840) `bracoD` ombro 40 / cotovelo −95 / mão aberta, palma para cima, cotovelo
    4 q atrasado. C10: em "Lustig" (q 4147) mão esquerda no lapel (`alcancar` no peito, `maoNaFrente: "E"`).

20. **[média] 00:05,7–00:07,4 (q 342–444) — C02 gargalhada** | Os braços com `cotovelo −70` e ombro 32 dobram demais e
    formam duas "alças" em volta do corpo; o corpo não sacode (escala do ombro mal muda). | `c02.jpg` (5,7–7,2 s) |
    `bracoE/bracoD: ombro 18 + 14*decai → 22 + 6*decai, cotovelo −70*decai → −40*decai`, mãos na barriga
    (`alcancar` no ponto `[540 ± 70, posCabeca + 330]`); `agacha` oscilando 6 px a cada 8 q como manda a direção.

21. **[baixa] 00:28,8–00:30,5, 00:33–00:35, 01:12,4–01:15,9 — Torre3D** | As plataformas da torre aparecem como lajes chapadas
    que passam para fora da treliça (parecem tábuas flutuando). | `c06.jpg` (28,8–30,2 s), `c07.jpg` (33,4–35 s), `c11.jpg` |
    Largura de cada plataforma = largura da treliça naquela altura +4%; espessura 18 → 8 px.

22. **[baixa] 00:42,5–00:53 — C08 luz** | A direção pede rostos iluminados por baixo pelo abajur (sombra no alto da testa); hoje
    o abajur só pinta um círculo na toalha e os rostos estão com a luz chapada da sala. | `c08.jpg` | Gradiente `#ffb45a` 25% da
    linha do queixo para cima (some na testa) nos dois bonecos e testa 15% mais escura.

23. **[baixa] 01:10,8–01:12,3 (q 4250–4342) — C10 trem** | O vagão flutua no roxo, sem trilho nem fumaça; a metade de baixo
    do quadro fica vazia. | `c10.jpg` (70,6–72,2 s) | Trilho (2 linhas escuras) em y 1340 com dormentes andando a 14 px/q e
    3 bolinhas de fumaça saindo do teto; vagão +20% de escala, centro em y 1000.

24. **[baixa] Áudio** | −22,0 LUFS integrado, pico −5,2 dBTP (rascunho sem finalizar). | `ebur128` |
    Passar por `scripts/finalizar.sh` (alvo −14 LUFS, pico < −1 dB, granulado 1).

---

## Veredito
**Precisa de nova rodada.** Os golpes na palavra e o loop estão certos, mas há falhas graves de leitura: braço gigante
cobrindo o rosto do Lustig no fecho do loop, faixa preta no crane de Paris, legenda em cima do rosto e do crachá na C10,
"cobrir o rosto" que vira "mãos na nuca", e as cenas da mesa (C04, C08) com personagens minúsculos, rostos tapados pela
toalha e o aperto de mão escondido atrás do abajur.

### As 3 falhas mais importantes
1. C12 q 4720–4800: braço gigante da camada do documento cobre o rosto do Lustig (item 1).
2. C08/C04: personagens minúsculos, aperto de mão atrás do abajur e comerciantes com o rosto tapado pela toalha (itens 6 e 7).
3. C03 q 585–685: faixa preta no crane; C10: legenda sobre a boca e o crachá (itens 3 e 4).

## O que ainda dá para melhorar (para o usuário decidir)
- C05: os 4 piscando juntos é o gag; dá para fechar com o Poisson piscando 6 q DEPOIS dos outros (atrasado = mais engraçado).
- C09: ligar visualmente o peixe ao Poisson: o peixe ganha o bigode grosso dele por 1 s quando aparece "POISSON = PEIXE".
- C11 → C12: em vez de corte seco, o grilo continua 10 q por cima do relógio ("meses depois") para emendar a piada.
- C07: buzina "fom-fom" com o carro dando um pulinho (squash 0,94) e os chapéus de dentro do carro subindo 4 q depois.
- C12: um dos comerciantes do grupo 2 de chapéu-coco igual ao do Poisson, de costas, como piada de que pode ser ele de novo.

---

## Ajustes aplicados pelo animador (rodada 2)
- **Feitos:** 1, 2, 3, 4, 5, 6, 7, 8 (cortes em C02, C04, C06, C08-P25, C09-P30 e C09-P31; o corte em 2537 virou
  só enquadramento maior), 9, 10, 11, 12, 13, 15, 16, 17, 18, 19 (C06b e C10), 20, 21, 23 e 24 (finalizar.sh com granulado 1).
- **Ideias extras feitas:** Poisson pisca 6 quadros depois dos outros (C05), peixe com o bigode do Poisson em "PEIXE"
  (C09) e o grilo continua por cima do corte para a C12.
- **Não feitos:**
  - 14: a legenda já tem contorno escuro grosso e continua legível.
  - 22: luz do abajur de baixo para cima.
  - A cortina não fica presa à mão: a mão vai até a borda da cortina, que fecha em 22 quadros.
- **Conferido em quadros soltos depois dos ajustes:**
  - C03 sem faixa preta;
  - C04 com close da etiqueta À VENDA legível;
  - C08 com os bonecos grandes e o aperto de mão visível;
  - C10 com o crachá no peito;
  - C11 com o chapéu cobrindo o rosto vermelho;
  - C12 sem o braço gigante.
