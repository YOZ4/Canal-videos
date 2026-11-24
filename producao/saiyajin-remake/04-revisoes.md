# Remake "E se você virasse um Saiyajin?" — 2D (JJK S2) + 3D estratégico

Antes: `out/lucas-saiyajin.mp4` (1º vídeo do projeto, 10 s, 30 qps, sem áudio): boneco 3D de brinquedo girando numa base,
fundo de raios, título, cabelo vira loiro em 4–5 s.
Depois: `out/saiyajin-remake.mp4` (13 s, 24 qps). Comparativo lado a lado: `out/saiyajin-antes-depois.mp4`.

| Plano | Tempo | Técnica | Por quê |
|---|---|---|---|
| P1 título, Lucas calmo × Diego braços cruzados | 0–2,5 s | 2D | contraste calmo antes do explosivo |
| P2 close nos olhos (veia, linhas radiais) → chão com pedrinhas pulando | 2,5–4 s | 2D | close de olhos antes do choque |
| P3 órbita de 140° em volta do Lucas, pedras sobem, rachaduras, cabelo dourando | 4–7,5 s | **3D** | giro de câmera em volta do personagem (o 2D não tem perspectiva) |
| P4 hit-stop 6 q → clarão → 2 q invertidos → onda de choque 3D + pedras arremessadas | 7,5–8,5 s | **3D** | explosão com profundidade |
| P5 Diego: protege o rosto, escorrega com poeira, choque | 8,5–11 s | 2D | reação/atuação (2D é melhor em expressão) |
| P6 avanço rápido em profundidade entre pedras + carimbo SAIYAJIN! | 11–13 s | **3D** | avanço em profundidade |

## Revisão 1 — erros técnicos de 3D
| Encontrado | Ajustado |
|---|---|
| Aura 2D grande demais nos planos 3D: estourava a tela e escondia o chão/rachaduras/órbita | força 0,35–1,25 → 0,25–1,05, altura 1,35 → 1,12× |
| Virada do Lucas na órbita parecia não existir | conferido em quadros ampliados: vira de 3/4 direita (início) a 3/4 esquerda (fim), acompanhando a câmera — ficou visível com a aura menor |
| Dolly final chegava perto demais (Lucas enchia a tela) e o carimbo cobria o cabelo | parada em z 4,9→4,45; carimbo mais alto |
| Pedras do caminho a ~0,2 unidade da câmera (a lente atravessaria uma pedra) | corredor livre de ~1 unidade em volta do caminho da câmera |
| Plano do chão (P2) mostrava mais o Lucas que as pedrinhas | plano mais baixo e mais fechado nos pés |
| (achado no comparativo, 6 s) Pedra da camada da frente passava na frente do ROSTO do Lucas na órbita | pedras a < 2,6 unidades flutuam só até o peito; as altas ficam mais longe |
Sem clipping no personagem (ele é 2D: pedras atrás na camada de trás, as da frente na da frente, por profundidade);
câmera sempre acima do chão (0,32–1,15); fov 36–42 (sem distorção); luz só toon 2 faixas + contorno + recorte dourado.

## Revisão 2 — fluidez, peso, impacto
- Transição 2D↔3D sem salto: mesmas cores de chão/pedra/céu, mesma `GradeJJK tom=dia`, grão 4 no final, aura 2D por cima do 3D.
- Cadência: personagens e pedras de 2 em 2 (12 poses/s), câmera e partículas a 24; o hit-stop congela pose e pedras.
- Peso: carga com antecipação (respira fundo, aperta os punhos com overshoot), pedras sobem desacelerando e balançam,
  explosão com hold de 6 q + clarão + 2 q invertidos + tremor forte; pedras arremessadas perdem velocidade; Diego escorrega
  com poeira e só depois mostra a cara de choque; silêncio da música 1 s antes da explosão.

## Pendente / dá para melhorar
- Lucas fica de frente na carga (só gira 3/4): uma vista de costas no meio da órbita exigiria troca de vista com `giro()`.
- A camiseta/cabelo do Lucas não tremulam com o vento da aura (só o Diego tem vento).
