import { PERFIL_BASE, type Pose } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { GOLPES as G } from "../../estilo2d/golpes";
import { criarLuta, type Lance } from "../../estilo2d/luta";

/**
 * Demo de golpes v2: os MESMOS tipos de golpe da demo 1, agora pelo sistema de coreografia (luta.ts).
 * Cada lance = quem ataca, com o quê, em quem e como o outro responde. Tempos em "tempo de luta" (30 qps).
 */
const ESC = 0.62;
const LUCAS_BASE: Pose = { ...PERFIL_BASE, x: 330, y: CHAO_Y, escala: ESC, lado: 1 };
const DIEGO_BASE: Pose = { ...PERFIL_BASE, x: 800, y: CHAO_Y, escala: ESC, lado: -1 };

export const LANCES: Lance[] = [
  // 1. estudo: Lucas fecha a distância e testa com um jab — Diego bloqueia
  { quem: "L", golpe: G.avanca, em: 26 },
  { quem: "L", golpe: G.jab, alvo: "D", resposta: G.defesa, forca: 0.6, depois: 1 },
  // 2. contra-ataque do Diego com o direto — Lucas abaixa
  { quem: "D", golpe: G.direto, alvo: "L", resposta: G.esquivaBaixa, noContato: 7, ritmo: { preparo: 1.2 } },
  // 3. Lucas aproveita que está embaixo: sobe com o chute alto (carrega mais) — acerta em cheio
  { quem: "L", golpe: G.chuteAlto, alvo: "D", resposta: G.levaGolpe, forca: 1.7, noContato: 12, ritmo: { preparo: 1.4 } },
  // 4. Diego volta bravo; Lucas passa POR CIMA dele com o mortal enquanto Diego se abaixa — os dois viram
  { quem: "L", golpe: G.cambalhota, alvo: "D", distancia: 330, depois: 16, vira: true },
  { quem: "D", golpe: G.esquivaBaixa, noContato: -20, vira: true, ritmo: { recupera: 1.6 } },
  { quem: "L", golpe: G.recua, depois: 2, amplitude: 1.2 },
  { quem: "D", golpe: G.recua, noContato: -12, amplitude: 1.2 },
  // 5. Diego ataca de voadora — Lucas bloqueia e ESCORREGA pra trás (poeira)
  { quem: "D", golpe: G.voadora, alvo: "L", resposta: G.defesa, forca: 1.5, escorrega: true, depois: 8, ritmo: { preparo: 1.3 } },
  // 6. respiram e se medem
  { quem: "D", golpe: G.recua, depois: -4, amplitude: 1.8 },
  // 7. golpe final: Lucas carrega o direto (preparo bem longo) — nocaute
  { quem: "L", golpe: G.direto, alvo: "D", resposta: G.queda, forca: 2, hitstop: 8, depois: 10, ritmo: { preparo: 2.2, recupera: 1.3 } },
];

export const LUTA = criarLuta({ L: { base: LUCAS_BASE, semente: 0 }, D: { base: DIEGO_BASE, semente: 3 } }, LANCES, { fim: undefined });
