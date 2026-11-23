import { PERFIL_BASE, type Pose } from "./Boneco2D";
import { CURVA, kPose, respira, type Curva } from "./anim";
import { emCadeia, type Atrasos } from "./movimento";

/**
 * Biblioteca de movimentos de ação/combate (vista de PERFIL), reutilizável em qualquer episódio.
 *
 * Cada golpe = keyframes RELATIVOS a uma base (posição, lado, escala do personagem), em quadros de 30 qps,
 * sempre com as fases: antecipação → ação (rápida, curva de saída) → contato/segura (2–4 q) → recuperação
 * (com exagero/mola) → guarda. Deslocamentos em unidades do boneco (multiplicados pela escala e pelo lado).
 *
 *   const p = poseGolpe(GOLPES.chuteAlto, u, base)        // u = quadro dentro do golpe
 *   const p = combate(f, base, [{ g: GOLPES.jab, em: 40 }, ...])  // sequência com deslocamento acumulado
 *
 * Em vídeo de 60 qps passe u/f divididos por 2.
 */

export type Parcial = Partial<Pose> & { dx?: number; dy?: number };
export type Golpe = {
  nome: string;
  /** duração em quadros (30 qps) */
  dur: number;
  /** quadro do contato/impacto (para sincronizar reação, som, câmera lenta, tremida) */
  contato?: number;
  /** quanto o personagem anda até o fim (unidades do boneco, + = pra frente) */
  desloca?: number;
  keys: [number, Parcial, Curva?][];
  /** atraso por parte (follow-through). Golpes rápidos: o braço que bate quase sem atraso */
  cadeia?: Atrasos;
};

/** guarda de luta (perfil): pés afastados, joelhos dobrados, punhos na altura do queixo */
export const GUARDA: Parcial = {
  agacha: 34,
  inclina: 6,
  cabeca: 0,
  estica: 1,
  gira: 0,
  dx: 0,
  dy: 0,
  peE: { dx: -78, dy: 0 },
  peD: { dx: 74, dy: 0 },
  bracoD: { ombro: 22, cotovelo: 110 },
  bracoE: { ombro: 30, cotovelo: 100 },
  maoD: "punho",
  maoE: "punho",
};

/** aplica um parcial sobre a base (dx/dy em unidades do boneco → mundo) */
export const aplica = (b: Pose, p: Parcial): Pose => {
  const { dx = 0, dy = 0, ...resto } = { ...GUARDA, ...p };
  return { ...b, ...resto, x: b.x + dx * b.lado * b.escala, y: b.y + dy * b.escala };
};

const G = (p: Parcial = {}): Parcial => ({ ...GUARDA, ...p });

/** pose crua (sem atraso entre partes) do golpe no quadro u */
export const poseCrua = (g: Golpe, u: number, b: Pose): Pose => kPose(u, g.keys.map(([t, p, c]) => [t, aplica(b, G(p)), c] as [number, Pose, Curva?]));

/** pose final: com atraso em cadeia (cabeça +2, braço +2/+3, antebraço +4/+5) = follow-through e overlap */
export const poseGolpe = (g: Golpe, u: number, b: Pose): Pose =>
  emCadeia((uu) => poseCrua(g, uu, b), u, g.cadeia ?? { cabeca: 2, ombroD: 1, cotoveloD: 3, ombroE: 2, cotoveloE: 4 });

const SOCO_FRENTE: Atrasos = { cabeca: 2, ombroD: 0, cotoveloD: 1, ombroE: 2, cotoveloE: 3 };
const SOCO_TRAS: Atrasos = { cabeca: 2, ombroD: 2, cotoveloD: 3, ombroE: 0, cotoveloE: 1 };

/** guarda viva: respira, balança o peso e quica levemente (nunca 100% parado) */
export const guardaViva = (f: number, b: Pose, semente = 0): Pose => {
  const r = respira(f, semente);
  const quica = Math.abs(Math.sin((f + semente * 7) * 0.16));
  return aplica(b, { agacha: 34 + quica * 8, inclina: 6 + r * 1.5, cabeca: r * 1.5, bracoD: { ombro: 22 + r * 3, cotovelo: 110 - r * 4 }, bracoE: { ombro: 30 - r * 2, cotovelo: 100 + r * 3 } });
};

// ---------------------------------------------------------------- biblioteca
const S = CURVA.sai;
const E = CURVA.entra;
const X = CURVA.exagera;
const A = CURVA.antecipa;
const SU = CURVA.suave;


/** altura do arco de salto (unidades do boneco) */
const arco = (h: number) => -h;

export const GOLPES = {
  /** soco rápido com o braço da frente */
  jab: {
    nome: "jab",
    dur: 16,
    contato: 5,
    cadeia: SOCO_FRENTE,
    desloca: 0,
    keys: [
      [0, {}],
      [2, { dx: -8, inclina: 2, bracoD: { ombro: 6, cotovelo: 126 } }, S],
      [5, { dx: 26, inclina: 14, cabeca: -4, peD: { dx: 98, dy: 0 }, bracoD: { ombro: 92, cotovelo: 2 }, bracoE: { ombro: 26, cotovelo: 112 } }, S],
      [8, { dx: 24, inclina: 13, peD: { dx: 98, dy: 0 }, bracoD: { ombro: 90, cotovelo: 6 } }],
      [16, {}, X],
    ],
  },
  /** soco forte (braço de trás) com o quadril girando pra frente */
  direto: {
    nome: "direto",
    dur: 24,
    contato: 8,
    cadeia: SOCO_TRAS,
    desloca: 30,
    keys: [
      [0, {}],
      [4, { dx: -18, agacha: 48, inclina: -6, cabeca: 4, bracoE: { ombro: 4, cotovelo: 124 }, bracoD: { ombro: 40, cotovelo: 100 } }, A],
      [8, { dx: 56, agacha: 52, inclina: 24, cabeca: -6, peE: { dx: -128, dy: 0 }, peD: { dx: 112, dy: 0 }, bracoE: { ombro: 96, cotovelo: 0 }, bracoD: { ombro: 6, cotovelo: 124 } }, S],
      [12, { dx: 54, agacha: 50, inclina: 21, peE: { dx: -124, dy: 0 }, peD: { dx: 110, dy: 0 }, bracoE: { ombro: 92, cotovelo: 8 }, bracoD: { ombro: 8, cotovelo: 120 } }],
      [24, { dx: 30 }, X],
    ],
  },
  /** chute alto com a perna da frente: joelho sobe, perna estica, segura, volta com mola */
  chuteAlto: {
    nome: "chuteAlto",
    dur: 28,
    contato: 11,
    desloca: 10,
    keys: [
      [0, {}],
      [3, { agacha: 52, inclina: 12, bracoE: { ombro: -30, cotovelo: 40 } }, A],
      [7, { agacha: 22, inclina: -6, peD: { dx: 120, dy: -210 }, peE: { dx: -40, dy: 0 }, bracoE: { ombro: -60, cotovelo: 30 }, bracoD: { ombro: 40, cotovelo: 60 } }, S],
      [11, { dx: 10, agacha: 14, inclina: -24, cabeca: 6, peD: { dx: 340, dy: -330 }, peE: { dx: -30, dy: 0 }, bracoE: { ombro: -78, cotovelo: 18 }, bracoD: { ombro: 60, cotovelo: 28 }, maoD: "aberta", maoE: "aberta" }, S],
      [14, { dx: 10, agacha: 16, inclina: -22, peD: { dx: 330, dy: -318 }, peE: { dx: -30, dy: 0 }, bracoE: { ombro: -74, cotovelo: 20 }, bracoD: { ombro: 56, cotovelo: 30 }, maoD: "aberta", maoE: "aberta" }],
      [19, { dx: 10, agacha: 30, inclina: -6, peD: { dx: 140, dy: -170 }, peE: { dx: -40, dy: 0 } }, SU],
      [28, { dx: 10 }, X],
    ],
  },
  /** inclina o tronco pra trás (o golpe passa na frente do rosto) */
  esquivaTras: {
    nome: "esquivaTras",
    dur: 20,
    desloca: -40,
    keys: [
      [0, {}],
      [4, { dx: -40, agacha: 70, inclina: -28, cabeca: -14, peE: { dx: -110, dy: 0 }, bracoD: { ombro: 50, cotovelo: 70 }, maoD: "aberta" }, S],
      [10, { dx: -42, agacha: 66, inclina: -24, cabeca: -10, peE: { dx: -110, dy: 0 }, bracoD: { ombro: 48, cotovelo: 72 }, maoD: "aberta" }],
      [20, { dx: -40 }, X],
    ],
  },
  /** abaixa rápido (o golpe passa por cima) */
  esquivaBaixa: {
    nome: "esquivaBaixa",
    dur: 20,
    desloca: 0,
    keys: [
      [0, {}],
      [3, { agacha: 175, inclina: 30, cabeca: 10, peE: { dx: -130, dy: 0 }, peD: { dx: 126, dy: 0 }, bracoD: { ombro: 60, cotovelo: 110 }, bracoE: { ombro: 50, cotovelo: 100 } }, S],
      [10, { agacha: 168, inclina: 28, cabeca: 6, peE: { dx: -130, dy: 0 }, peD: { dx: 126, dy: 0 }, bracoD: { ombro: 60, cotovelo: 110 }, bracoE: { ombro: 50, cotovelo: 100 } }],
      [20, {}, X],
    ],
  },
  /** bloqueio: braços sobem na frente do rosto e o corpo recua com o peso */
  defesa: {
    nome: "defesa",
    dur: 22,
    desloca: -30,
    keys: [
      [0, {}],
      [3, { agacha: 56, inclina: -4, cabeca: 6, bracoD: { ombro: 82, cotovelo: 92 }, bracoE: { ombro: 66, cotovelo: 86 } }, S],
      [6, { dx: -30, agacha: 64, inclina: -10, cabeca: 8, bracoD: { ombro: 84, cotovelo: 96 }, bracoE: { ombro: 68, cotovelo: 90 } }, S],
      [14, { dx: -30, agacha: 58, inclina: -6, bracoD: { ombro: 82, cotovelo: 92 }, bracoE: { ombro: 66, cotovelo: 86 } }],
      [22, { dx: -30 }, X],
    ],
  },
  /** leva o golpe: cabeça e tronco jogados pra trás, braços soltos, escorrega e se recupera */
  levaGolpe: {
    nome: "levaGolpe",
    dur: 30,
    desloca: -110,
    keys: [
      [0, {}],
      [2, { dx: -50, agacha: 40, inclina: -26, cabeca: -20, estica: 0.93, peD: { dx: 50, dy: -40 }, bracoD: { ombro: 120, cotovelo: 30 }, bracoE: { ombro: 110, cotovelo: 40 }, maoD: "aberta", maoE: "aberta" }, S],
      [7, { dx: -100, agacha: 70, inclina: -16, cabeca: -10, peD: { dx: 90, dy: 0 }, bracoD: { ombro: 70, cotovelo: 40 }, bracoE: { ombro: 60, cotovelo: 50 }, maoD: "aberta", maoE: "aberta" }, S],
      [16, { dx: -110, agacha: 80, inclina: 10, cabeca: 8 }, SU],
      [30, { dx: -110 }, X],
    ],
  },
  /** cai de costas, quica no chão, fica um instante e levanta */
  queda: {
    nome: "queda",
    dur: 64,
    contato: 12,
    desloca: -230,
    keys: [
      [0, {}],
      [3, { dx: -40, inclina: -34, cabeca: -22, estica: 0.95, bracoD: { ombro: 140, cotovelo: 20 }, bracoE: { ombro: 130, cotovelo: 30 }, maoD: "aberta", maoE: "aberta" }, S],
      [8, { dx: -150, dy: 120, gira: -60, agacha: 60, peD: { dx: 120, dy: -140 }, peE: { dx: 40, dy: -80 }, bracoD: { ombro: 160, cotovelo: 20 }, bracoE: { ombro: 150, cotovelo: 30 }, maoD: "aberta", maoE: "aberta" }, E],
      [12, { dx: -220, dy: 430, gira: -92, agacha: 40, estica: 0.9, peD: { dx: 150, dy: -60 }, peE: { dx: 60, dy: -30 }, bracoD: { ombro: 170, cotovelo: 10 }, bracoE: { ombro: 160, cotovelo: 20 }, maoD: "aberta", maoE: "aberta" }, E],
      [15, { dx: -226, dy: 400, gira: -86, agacha: 40, peD: { dx: 150, dy: -100 }, peE: { dx: 60, dy: -50 }, bracoD: { ombro: 150, cotovelo: 20 }, bracoE: { ombro: 140, cotovelo: 30 }, maoD: "aberta", maoE: "aberta" }, S],
      [18, { dx: -230, dy: 432, gira: -92, agacha: 40, peD: { dx: 150, dy: -50 }, peE: { dx: 60, dy: -30 }, bracoD: { ombro: 170, cotovelo: 10 }, bracoE: { ombro: 160, cotovelo: 20 }, maoD: "aberta", maoE: "aberta" }, E],
      [38, { dx: -230, dy: 432, gira: -92, agacha: 40, peD: { dx: 150, dy: -50 }, peE: { dx: 60, dy: -30 }, bracoD: { ombro: 170, cotovelo: 10 }, bracoE: { ombro: 160, cotovelo: 20 }, maoD: "aberta", maoE: "aberta" }],
      [48, { dx: -230, dy: 130, gira: -40, agacha: 190, inclina: 20, peD: { dx: 90, dy: 0 }, peE: { dx: -60, dy: 0 }, bracoD: { ombro: 40, cotovelo: 20 }, bracoE: { ombro: -20, cotovelo: 20 }, maoD: "aberta", maoE: "aberta" }, SU],
      [56, { dx: -230, agacha: 120, inclina: 18, cabeca: 8 }, SU],
      [64, { dx: -230 }, X],
    ],
  },
  /** cambalhota no ar (mortal pra frente): agacha, sobe girando 360° pra frente e pousa adiante */
  cambalhota: {
    nome: "cambalhota",
    dur: 36,
    contato: 26,
    desloca: 380,
    cadeia: { cabeca: 1, ombroD: 1, cotoveloD: 2, ombroE: 1, cotoveloE: 2 },
    keys: [
      [0, {}],
      [6, { agacha: 150, inclina: 26, estica: 0.86, bracoD: { ombro: -60, cotovelo: 20 }, bracoE: { ombro: -50, cotovelo: 30 } }, A],
      [10, { dx: 90, dy: arco(260), gira: 90, agacha: 60, estica: 1.08, bracoD: { ombro: 160, cotovelo: 10 }, bracoE: { ombro: 150, cotovelo: 20 }, peD: { dx: 60, dy: -150 }, peE: { dx: 20, dy: -130 } }, S],
      [16, { dx: 200, dy: arco(500), gira: 200, agacha: 120, peD: { dx: 70, dy: -200 }, peE: { dx: 30, dy: -180 }, bracoD: { ombro: 90, cotovelo: 80 }, bracoE: { ombro: 80, cotovelo: 80 } }, CURVA.linear],
      [22, { dx: 320, dy: arco(230), gira: 320, agacha: 60, peD: { dx: 40, dy: -80 }, peE: { dx: -20, dy: -60 } }, CURVA.linear],
      [26, { dx: 380, gira: 360, agacha: 160, inclina: 22, estica: 0.86, bracoD: { ombro: 70, cotovelo: 30 }, bracoE: { ombro: 50, cotovelo: 30 }, maoD: "aberta", maoE: "aberta" }, E],
      [36, { dx: 380, gira: 360 }, X],
    ],
  },
  /** salto vertical com aterrissagem: agacha (squash), impulso (stretch), arco, pouso com squash e recupera */
  salto: {
    nome: "salto",
    dur: 34,
    contato: 24,
    desloca: 120,
    keys: [
      [0, {}],
      [6, { agacha: 140, inclina: 18, estica: 0.86, bracoD: { ombro: -50, cotovelo: 20 }, bracoE: { ombro: -40, cotovelo: 30 } }, A],
      [9, { dx: 20, dy: arco(120), agacha: 0, inclina: 4, estica: 1.14, bracoD: { ombro: 150, cotovelo: 10 }, bracoE: { ombro: 140, cotovelo: 20 }, peE: { dx: -20, dy: 0 }, peD: { dx: 20, dy: 0 } }, S],
      [16, { dx: 70, dy: arco(460), agacha: 60, estica: 1.02, peD: { dx: 60, dy: -120 }, peE: { dx: -30, dy: -90 }, bracoD: { ombro: 120, cotovelo: 40 }, bracoE: { ombro: 110, cotovelo: 50 } }, S],
      [24, { dx: 120, agacha: 170, inclina: 22, estica: 0.84, bracoD: { ombro: 60, cotovelo: 30 }, bracoE: { ombro: 40, cotovelo: 40 }, maoD: "aberta" }, E],
      [34, { dx: 120 }, X],
    ],
  },
  /** mortal pra trás: agacha, sobe girando 360° de costas e pousa */
  mortalTras: {
    nome: "mortalTras",
    dur: 36,
    contato: 26,
    desloca: -160,
    keys: [
      [0, {}],
      [6, { agacha: 150, inclina: 14, estica: 0.86, bracoD: { ombro: -60, cotovelo: 20 }, bracoE: { ombro: -50, cotovelo: 30 } }, A],
      [10, { dx: -40, dy: arco(260), gira: -90, agacha: 60, estica: 1.08, bracoD: { ombro: 160, cotovelo: 10 }, bracoE: { ombro: 150, cotovelo: 20 }, peD: { dx: 60, dy: -150 }, peE: { dx: 20, dy: -130 } }, S],
      [16, { dx: -100, dy: arco(520), gira: -200, agacha: 120, peD: { dx: 70, dy: -200 }, peE: { dx: 30, dy: -180 }, bracoD: { ombro: 90, cotovelo: 80 }, bracoE: { ombro: 80, cotovelo: 80 } }, CURVA.linear],
      [22, { dx: -150, dy: arco(240), gira: -320, agacha: 60, peD: { dx: 40, dy: -80 }, peE: { dx: -20, dy: -60 } }, CURVA.linear],
      [26, { dx: -160, gira: -360, agacha: 160, inclina: 20, estica: 0.86, bracoD: { ombro: 70, cotovelo: 30 }, bracoE: { ombro: 50, cotovelo: 30 }, maoD: "aberta", maoE: "aberta" }, E],
      [36, { dx: -160, gira: -360 }, X],
    ],
  },
  /** voadora: corre/salta pra frente com o chute esticado no ar */
  voadora: {
    nome: "voadora",
    dur: 34,
    contato: 15,
    desloca: 420,
    keys: [
      [0, {}],
      [5, { agacha: 130, inclina: 22, estica: 0.88, bracoD: { ombro: -50, cotovelo: 30 }, bracoE: { ombro: -40, cotovelo: 30 } }, A],
      [9, { dx: 120, dy: arco(260), agacha: 40, inclina: -10, estica: 1.1, peD: { dx: 160, dy: -160 }, peE: { dx: -60, dy: -100 }, bracoD: { ombro: 100, cotovelo: 30 }, bracoE: { ombro: -60, cotovelo: 30 } }, S],
      [15, { dx: 300, dy: arco(300), agacha: 10, inclina: -26, peD: { dx: 340, dy: -260 }, peE: { dx: -40, dy: -140 }, bracoD: { ombro: 60, cotovelo: 30 }, bracoE: { ombro: -80, cotovelo: 20 }, maoD: "aberta", maoE: "aberta" }, S],
      [19, { dx: 360, dy: arco(220), agacha: 20, inclina: -20, peD: { dx: 320, dy: -240 }, peE: { dx: -40, dy: -130 }, bracoD: { ombro: 60, cotovelo: 30 }, bracoE: { ombro: -80, cotovelo: 20 } }],
      [25, { dx: 420, agacha: 160, inclina: 22, estica: 0.86, bracoD: { ombro: 50, cotovelo: 30 }, maoD: "aberta" }, E],
      [34, { dx: 420 }, X],
    ],
  },
  /** passo de luta pra frente (sem cruzar as pernas) */
  avanca: {
    nome: "avanca",
    dur: 12,
    desloca: 140,
    keys: [
      [0, {}],
      [4, { dx: 60, agacha: 40, inclina: 10, peD: { dx: 150, dy: -40 } }, S],
      [8, { dx: 120, agacha: 44, inclina: 9, peE: { dx: -30, dy: -30 } }, SU],
      [12, { dx: 140 }, X],
    ],
  },
  /** passo de luta pra trás */
  recua: {
    nome: "recua",
    dur: 12,
    desloca: -140,
    keys: [
      [0, {}],
      [4, { dx: -60, agacha: 40, inclina: 2, peE: { dx: -150, dy: -40 } }, S],
      [8, { dx: -120, agacha: 44, inclina: 4, peD: { dx: 30, dy: -30 } }, SU],
      [12, { dx: -140 }, X],
    ],
  },
} satisfies Record<string, Golpe>;

export type NomeGolpe = keyof typeof GOLPES;

/** passo de uma coreografia: golpe, quadro de início, e (opcional) virar de lado ao fim */
export type Passo = { g: Golpe; em: number; vira?: boolean };

/**
 * Coreografia: o personagem fica em guarda viva entre os golpes; cada golpe começa onde o anterior terminou
 * (deslocamento acumulado). `vira` troca o lado depois do golpe (ex.: depois de cruzar o adversário).
 */
export const combate = (f: number, base: Pose, passos: Passo[], semente = 0): Pose => {
  let b = { ...PERFIL_BASE, ...base };
  for (const p of passos) {
    if (f < p.em) break;
    const u = f - p.em;
    if (u < p.g.dur) return poseGolpe(p.g, u, b);
    b = { ...b, x: b.x + (p.g.desloca ?? 0) * b.lado * b.escala, ...(p.vira ? { lado: (b.lado * -1) as 1 | -1 } : {}) };
  }
  return guardaViva(f, b, semente);
};

/** quadro absoluto do contato de um passo (para reação, som, câmera lenta) */
export const contatoDe = (p: Passo) => p.em + (p.g.contato ?? 0);
