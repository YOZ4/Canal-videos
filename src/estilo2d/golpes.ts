import { PERFIL_BASE, type Pose } from "./Boneco2D";
import { CURVA, kPose, respira, type Curva } from "./anim";
import { emCadeia, type Atrasos } from "./movimento";

/**
 * Biblioteca de movimentos de ação/combate (vista de PERFIL), reutilizável em qualquer episódio.
 *
 * Cada golpe = keyframes RELATIVOS a uma base (posição, lado, escala do personagem), em quadros de 30 qps,
 * sempre com as FASES marcadas:
 *   0 ──preparo──▶ prep ──ação──▶ contato ──recuperação──▶ dur
 * (antecipação com o peso indo pra perna de trás → ação rápida com quadril/ombro/pé juntos → contato →
 *  follow-through que passa do ponto → volta pra guarda). Deslocamentos em unidades do boneco.
 *
 * Etapa 2 (qualidade): pés com passos ESCRITOS (dy < 0 quando o pé sai do chão — o resto fica plantado pelo
 * sistema de luta, `luta.ts`), saltos com arco de parábola de verdade (`voo`), reações em que a CABEÇA lidera e
 * os braços chicoteiam atrasados, queda que tomba, bate, quica e levanta apoiada (giro no quadril: `giraEm`).
 *
 *   const p = poseGolpe(GOLPES.chuteAlto, u, base)        // u = quadro dentro do golpe
 *   const p = combate(f, base, [{ g: GOLPES.jab, em: 40 }, ...])  // sequência simples (sem hit-stop / pés plantados)
 *   coreografias completas: `luta.ts`
 */

export type Parcial = Partial<Pose> & { dx?: number; dy?: number };
export type Golpe = {
  nome: string;
  /** ataque | reacao (leva golpe) | defesa (bloqueio/esquiva) | movimento (passos, saltos) */
  tipo?: "ataque" | "reacao" | "defesa" | "movimento";
  /** duração em quadros (30 qps) */
  dur: number;
  /** fim da antecipação / começo da ação (para som de "whoosh", câmera lenta e `ritmo`) */
  prep?: number;
  /** quadro do contato/impacto (ataques) */
  contato?: number;
  /** reações/defesas: quadro deste movimento que coincide com o contato do atacante */
  recebe?: number;
  /** quadro em que pousa/bate no chão (saltos, quedas) → poeira, som, tremida */
  pouso?: number;
  /** membro que acerta (para o alcance automático e o ponto do impacto) */
  membro?: "maoD" | "maoE" | "peD";
  /** altura do alvo: cabeça ou peito */
  mira?: "cabeca" | "peito";
  /** quanto o personagem anda até o fim (unidades do boneco, + = pra frente) */
  desloca?: number;
  /** trecho no ar com arco de PARÁBOLA (gravidade) e velocidade horizontal constante */
  voo?: { de: number; ate: number; altura: number };
  /** quadros em que o corpo escorrega de propósito (pés não ficam plantados; o sistema solta poeira) */
  desliza?: [number, number];
  keys: [number, Parcial, Curva?][];
  /** atraso por parte (follow-through). Negativo = a parte LIDERA (cabeça no golpe recebido) */
  cadeia?: Atrasos;
};

/** guarda de luta (perfil): pés afastados, joelhos dobrados, punhos na altura do queixo */
export const GUARDA: Parcial = {
  agacha: 34,
  inclina: 6,
  cabeca: 0,
  estica: 1,
  gira: 0,
  giraEm: 600,
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

/** remapeia o tempo de um golpe por fase (ritmo > 1 = fase mais lenta/longa) */
export type Ritmo = { preparo?: number; acao?: number; recupera?: number };
export const duracaoCom = (g: Golpe, r?: Ritmo) => {
  if (!r) return g.dur;
  const prep = g.prep ?? 0;
  const c = g.contato ?? g.recebe ?? prep;
  return prep * (r.preparo ?? 1) + (c - prep) * (r.acao ?? 1) + (g.dur - c) * (r.recupera ?? 1);
};
/** quadro "de relógio" (com ritmo) → quadro do golpe */
export const tempoGolpe = (g: Golpe, v: number, r?: Ritmo) => {
  if (!r) return v;
  const prep = g.prep ?? 0;
  const c = g.contato ?? g.recebe ?? prep;
  const a = prep * (r.preparo ?? 1);
  const b = a + (c - prep) * (r.acao ?? 1);
  if (v < a) return v / (r.preparo ?? 1);
  if (v < b) return prep + (v - a) / (r.acao ?? 1);
  return c + (v - b) / (r.recupera ?? 1);
};
/** quadro do golpe → quadro "de relógio" (inverso de tempoGolpe) */
export const relogioGolpe = (g: Golpe, u: number, r?: Ritmo) => {
  if (!r) return u;
  const prep = g.prep ?? 0;
  const c = g.contato ?? g.recebe ?? prep;
  if (u < prep) return u * (r.preparo ?? 1);
  if (u < c) return prep * (r.preparo ?? 1) + (u - prep) * (r.acao ?? 1);
  return prep * (r.preparo ?? 1) + (c - prep) * (r.acao ?? 1) + (u - c) * (r.recupera ?? 1);
};

/**
 * pose crua (sem atraso entre partes) do golpe no quadro u.
 * `empurra` multiplica os deslocamentos dx (reações mais fortes/fracas); `extra` soma dx (alcance automático).
 */
export const poseCrua = (g: Golpe, u: number, b: Pose, empurra = 1, extra: (u: number) => number = () => 0): Pose => {
  const keyPose = (uu: number) =>
    kPose(
      uu,
      g.keys.map(([t, p, c]) => {
        const q = G(p);
        return [t, aplica(b, { ...q, dx: (q.dx ?? 0) * empurra + extra(t) }), c] as [number, Pose, Curva?];
      }),
    );
  const p = keyPose(u);
  // arco de parábola no ar: x com velocidade constante, y = gravidade (o que as keys dizem de dy é ignorado no voo)
  if (g.voo && u > g.voo.de && u < g.voo.ate) {
    const s = (u - g.voo.de) / (g.voo.ate - g.voo.de);
    const a = keyPose(g.voo.de);
    const z = keyPose(g.voo.ate);
    return { ...p, x: a.x + (z.x - a.x) * s, y: b.y - 4 * g.voo.altura * s * (1 - s) * b.escala };
  }
  return p;
};

/** pose final: com atraso em cadeia (cabeça, braço, antebraço) = follow-through e overlap */
export const poseGolpe = (g: Golpe, u: number, b: Pose, empurra = 1, extra?: (u: number) => number): Pose =>
  emCadeia((uu) => poseCrua(g, Math.max(0, Math.min(g.dur, uu)), b, empurra, extra), u, g.cadeia ?? { cabeca: 2, ombroD: 1, cotoveloD: 3, ombroE: 2, cotoveloE: 4 });

const SOCO_FRENTE: Atrasos = { cabeca: 2, ombroD: 0, cotoveloD: 1, ombroE: 2, cotoveloE: 3 };
const SOCO_TRAS: Atrasos = { cabeca: 2, ombroD: 2, cotoveloD: 3, ombroE: 0, cotoveloE: 1 };
/** golpe recebido: a cabeça LIDERA (é ela que leva o soco), os braços chicoteiam atrasados */
const RECEBE: Atrasos = { cabeca: -1, ombroD: 3, cotoveloD: 6, ombroE: 4, cotoveloE: 7 };

/** guarda viva: respira, balança o peso e quica levemente (nunca 100% parado). amp 0..1 = quanto (0 = guarda exata) */
export const guardaViva = (f: number, b: Pose, semente = 0, amp = 1): Pose => {
  const r = respira(f, semente) * amp;
  const quica = (Math.abs(Math.sin((f + semente * 7) * 0.16)) - 0.5) * amp;
  return aplica(b, { agacha: 34 + quica * 8, inclina: 6 + r * 1.5, cabeca: r * 1.5, bracoD: { ombro: 22 + r * 3, cotovelo: 110 - r * 4 }, bracoE: { ombro: 30 - r * 2, cotovelo: 100 + r * 3 } });
};

// ---------------------------------------------------------------- biblioteca
const S = CURVA.sai;
const E = CURVA.entra;
const SU = CURVA.suave;
const L = CURVA.linear;
/** saída suave com leve overshoot (assentar sem "mola de brinquedo") */
const ASSENTA = (t: number) => {
  const s = 1 - Math.pow(1 - t, 3);
  return s + Math.sin(t * Math.PI) * 0.08 * (1 - t);
};
const AB = { maoD: "aberta", maoE: "aberta" } as const;

export const GOLPES = {
  /** soco rápido com o braço da frente: o pé da frente dá um passinho junto e o de trás empurra */
  jab: {
    nome: "jab",
    tipo: "ataque",
    dur: 20,
    prep: 4,
    contato: 7,
    membro: "maoD",
    mira: "cabeca",
    cadeia: SOCO_FRENTE,
    desloca: 0,
    keys: [
      [0, {}],
      [4, { dx: -12, agacha: 46, inclina: 1, cabeca: 3, peD: { dx: 76, dy: -16 }, bracoD: { ombro: 8, cotovelo: 130 }, bracoE: { ombro: 36, cotovelo: 110 } }, SU],
      [7, { dx: 30, agacha: 40, inclina: 17, cabeca: -3, estica: 1.03, peE: { dx: -108, dy: 0 }, peD: { dx: 100, dy: 0 }, bracoD: { ombro: 92, cotovelo: 0 }, bracoE: { ombro: 42, cotovelo: 120 } }, S],
      [10, { dx: 33, agacha: 42, inclina: 18, peE: { dx: -111, dy: 0 }, peD: { dx: 97, dy: 0 }, bracoD: { ombro: 95, cotovelo: 3 }, bracoE: { ombro: 40, cotovelo: 118 } }, L],
      [14, { dx: 16, agacha: 40, inclina: 9, peE: { dx: -94, dy: 0 }, peD: { dx: 84, dy: -20 }, bracoD: { ombro: 46, cotovelo: 84 } }, SU],
      [20, {}, ASSENTA],
    ],
  },
  /** soco forte (braço de trás): peso vai pra trás, o pé da frente avança e o quadril/ombro entram juntos */
  direto: {
    nome: "direto",
    tipo: "ataque",
    dur: 28,
    prep: 7,
    contato: 10,
    membro: "maoE",
    mira: "cabeca",
    cadeia: SOCO_TRAS,
    desloca: 36,
    keys: [
      [0, {}],
      [7, { dx: -24, agacha: 58, inclina: -9, cabeca: 5, estica: 0.97, peE: { dx: -54, dy: 0 }, peD: { dx: 98, dy: 0 }, bracoE: { ombro: -14, cotovelo: 132 }, bracoD: { ombro: 52, cotovelo: 96 } }, SU],
      [8.5, { dx: 6, agacha: 52, inclina: 6, cabeca: 2, peE: { dx: -84, dy: 0 }, peD: { dx: 96, dy: -28 }, bracoE: { ombro: 40, cotovelo: 90 }, bracoD: { ombro: 30, cotovelo: 112 } }, E],
      [10, { dx: 60, agacha: 50, inclina: 26, cabeca: -6, estica: 1.04, peE: { dx: -138, dy: 0 }, peD: { dx: 94, dy: 0 }, bracoE: { ombro: 98, cotovelo: 0 }, bracoD: { ombro: 4, cotovelo: 128 } }, S],
      [14, { dx: 64, agacha: 52, inclina: 28, cabeca: -4, peE: { dx: -142, dy: 0 }, peD: { dx: 90, dy: 0 }, bracoE: { ombro: 95, cotovelo: 5 }, bracoD: { ombro: 8, cotovelo: 124 } }, L],
      [20, { dx: 44, agacha: 44, inclina: 12, peE: { dx: -112, dy: -24 }, peD: { dx: 74, dy: 0 }, bracoE: { ombro: 50, cotovelo: 80 } }, SU],
      [28, { dx: 36 }, ASSENTA],
    ],
  },
  /** chute alto com a perna da frente: afunda e carrega, joelho sobe (câmara), estica, segura, recolhe e pousa */
  chuteAlto: {
    nome: "chuteAlto",
    tipo: "ataque",
    dur: 34,
    prep: 6,
    contato: 13,
    membro: "peD",
    mira: "peito",
    desloca: 14,
    keys: [
      [0, {}],
      [6, { dx: -6, agacha: 62, inclina: 16, cabeca: 4, estica: 0.96, peE: { dx: -72, dy: 0 }, bracoE: { ombro: -18, cotovelo: 64 }, bracoD: { ombro: 52, cotovelo: 112 } }, SU],
      [9, { dx: 4, agacha: 22, inclina: -8, peE: { dx: -86, dy: 0 }, peD: { dx: 120, dy: -280 }, bracoE: { ombro: -52, cotovelo: 32 }, bracoD: { ombro: 52, cotovelo: 72 } }, S],
      [13, { dx: 12, agacha: 4, inclina: -34, cabeca: 10, estica: 1.04, peE: { dx: -96, dy: 0, rot: 18 }, peD: { dx: 300, dy: -560 }, bracoE: { ombro: -86, cotovelo: 14 }, bracoD: { ombro: 70, cotovelo: 24 }, ...AB }, S],
      [16, { dx: 12, agacha: 8, inclina: -36, cabeca: 11, peE: { dx: -96, dy: 0, rot: 18 }, peD: { dx: 312, dy: -548 }, bracoE: { ombro: -82, cotovelo: 16 }, bracoD: { ombro: 66, cotovelo: 28 }, ...AB }, L],
      [21, { dx: 12, agacha: 26, inclina: -10, peE: { dx: -94, dy: 0 }, peD: { dx: 150, dy: -240 }, bracoE: { ombro: -30, cotovelo: 50 }, bracoD: { ombro: 46, cotovelo: 80 } }, SU],
      [25, { dx: 14, agacha: 54, inclina: 9, estica: 0.97, peE: { dx: -92, dy: 0 }, peD: { dx: 88, dy: 0 } }, E],
      [34, { dx: 14 }, ASSENTA],
    ],
  },
  /** inclina o tronco pra trás com um passo pra trás (o golpe passa na frente do rosto) */
  esquivaTras: {
    nome: "esquivaTras",
    tipo: "defesa",
    dur: 22,
    recebe: 5,
    desloca: -40,
    keys: [
      [0, {}],
      [3, { dx: -20, agacha: 50, inclina: -12, cabeca: -8, peE: { dx: -110, dy: -30 }, bracoD: { ombro: 40, cotovelo: 90 } }, S],
      [5, { dx: -42, agacha: 70, inclina: -28, cabeca: -14, peE: { dx: -112, dy: 0 }, bracoD: { ombro: 50, cotovelo: 70 }, maoD: "aberta" }, S],
      [11, { dx: -44, agacha: 66, inclina: -24, cabeca: -10, peE: { dx: -112, dy: 0 }, bracoD: { ombro: 48, cotovelo: 72 }, maoD: "aberta" }, L],
      [16, { dx: -40, agacha: 44, inclina: 4, peE: { dx: -100, dy: 0 }, peD: { dx: 74, dy: -20 } }, SU],
      [22, { dx: -40 }, ASSENTA],
    ],
  },
  /** abaixa rápido (o golpe passa por cima): os pés ficam, o corpo afunda, a cabeça mergulha e volta com mola */
  esquivaBaixa: {
    nome: "esquivaBaixa",
    tipo: "defesa",
    dur: 22,
    recebe: 4,
    desloca: 0,
    keys: [
      [0, {}],
      [4, { agacha: 172, inclina: 34, cabeca: 12, estica: 0.96, peE: { dx: -92, dy: 0 }, peD: { dx: 84, dy: 0 }, bracoD: { ombro: 62, cotovelo: 116 }, bracoE: { ombro: 52, cotovelo: 108 } }, S],
      [10, { agacha: 166, inclina: 30, cabeca: 8, peE: { dx: -92, dy: 0 }, peD: { dx: 84, dy: 0 }, bracoD: { ombro: 60, cotovelo: 112 }, bracoE: { ombro: 50, cotovelo: 104 } }, L],
      [16, { agacha: 22, inclina: 2, cabeca: -2, estica: 1.03 }, S],
      [22, {}, ASSENTA],
    ],
  },
  /** bloqueio: braços sobem antes do contato; no contato o corpo cede pra trás e os pés seguram (ou escorregam) */
  defesa: {
    nome: "defesa",
    tipo: "defesa",
    dur: 26,
    recebe: 5,
    desloca: -36,
    keys: [
      [0, {}],
      [3, { agacha: 48, inclina: 2, cabeca: 8, bracoD: { ombro: 84, cotovelo: 102 }, bracoE: { ombro: 70, cotovelo: 96 } }, S],
      [5, { agacha: 54, inclina: 0, cabeca: 10, bracoD: { ombro: 86, cotovelo: 106 }, bracoE: { ombro: 72, cotovelo: 100 } }, L],
      [8, { dx: -34, agacha: 70, inclina: -10, cabeca: 14, estica: 0.95, bracoD: { ombro: 76, cotovelo: 120 }, bracoE: { ombro: 62, cotovelo: 114 } }, S],
      [15, { dx: -38, agacha: 60, inclina: -2, cabeca: 6, bracoD: { ombro: 80, cotovelo: 110 }, bracoE: { ombro: 66, cotovelo: 104 } }, SU],
      [26, { dx: -36 }, ASSENTA],
    ],
  },
  /** leva o golpe: a cabeça vai primeiro, o tronco cede, os braços chicoteiam; tropeça 2 passos pra trás e se reequilibra */
  levaGolpe: {
    nome: "levaGolpe",
    tipo: "reacao",
    dur: 36,
    recebe: 0,
    desloca: -120,
    cadeia: RECEBE,
    keys: [
      [0, {}],
      [2, { dx: -36, agacha: 46, inclina: -30, cabeca: -28, estica: 0.93, peD: { dx: 70, dy: -34 }, bracoD: { ombro: 64, cotovelo: 64 }, bracoE: { ombro: 46, cotovelo: 72 }, ...AB }, S],
      [6, { dx: -84, agacha: 64, inclina: -24, cabeca: -18, peE: { dx: -82, dy: 0 }, peD: { dx: 36, dy: -22 }, bracoD: { ombro: 104, cotovelo: 40 }, bracoE: { ombro: 84, cotovelo: 48 }, ...AB }, S],
      [10, { dx: -108, agacha: 78, inclina: -8, cabeca: -6, peE: { dx: -112, dy: -26 }, peD: { dx: 46, dy: 0 }, bracoD: { ombro: 80, cotovelo: 50 }, bracoE: { ombro: 64, cotovelo: 60 }, ...AB }, L],
      [14, { dx: -120, agacha: 88, inclina: 14, cabeca: 10, peE: { dx: -84, dy: 0 }, peD: { dx: 60, dy: 0 }, bracoD: { ombro: 40, cotovelo: 70 }, bracoE: { ombro: 26, cotovelo: 80 } }, SU],
      [22, { dx: -120, agacha: 58, inclina: 8, cabeca: 4 }, SU],
      [36, { dx: -120 }, ASSENTA],
    ],
  },
  /**
   * nocaute: a cabeça vai primeiro, os pés saem do chão, o corpo tomba girando no quadril, BATE (achata), quica
   * com as pernas chicoteando, fica, senta e levanta apoiado (nada de flutuar)
   */
  queda: {
    nome: "queda",
    tipo: "reacao",
    dur: 92,
    recebe: 0,
    pouso: 13,
    desloca: -300,
    cadeia: RECEBE,
    desliza: [13, 24],
    keys: [
      [0, {}],
      [2, { dx: -40, agacha: 40, inclina: -34, cabeca: -32, estica: 0.92, giraEm: 396, peD: { dx: 90, dy: -60 }, bracoD: { ombro: 110, cotovelo: 30 }, bracoE: { ombro: 96, cotovelo: 40 }, ...AB }, S],
      [7, { dx: -170, dy: -70, gira: -46, giraEm: 396, agacha: 20, inclina: -10, cabeca: -14, peD: { dx: 150, dy: -30 }, peE: { dx: 60, dy: -10 }, bracoD: { ombro: 150, cotovelo: 20 }, bracoE: { ombro: 140, cotovelo: 30 }, ...AB }, S],
      [13, { dx: -260, dy: 300, gira: -90, giraEm: 396, agacha: 0, inclina: 0, cabeca: -6, estica: 0.86, peD: { dx: 120, dy: -40 }, peE: { dx: 60, dy: -20 }, bracoD: { ombro: 170, cotovelo: 10 }, bracoE: { ombro: 160, cotovelo: 20 }, ...AB }, E],
      [17, { dx: -284, dy: 262, gira: -82, giraEm: 396, agacha: 0, inclina: 0, cabeca: 4, estica: 1.02, peD: { dx: 190, dy: -90 }, peE: { dx: 140, dy: -70 }, bracoD: { ombro: 140, cotovelo: 40 }, bracoE: { ombro: 130, cotovelo: 50 }, ...AB }, S],
      [22, { dx: -298, dy: 300, gira: -90, giraEm: 396, agacha: 0, inclina: 0, cabeca: -4, estica: 0.95, peD: { dx: 30, dy: -10 }, peE: { dx: 10, dy: -4 }, bracoD: { ombro: 172, cotovelo: 12 }, bracoE: { ombro: 164, cotovelo: 20 }, ...AB }, E],
      [26, { dx: -300, dy: 300, gira: -90, giraEm: 396, agacha: 0, inclina: 0, cabeca: 0, estica: 1, peD: { dx: 40, dy: -10 }, peE: { dx: 16, dy: -4 }, bracoD: { ombro: 168, cotovelo: 16 }, bracoE: { ombro: 160, cotovelo: 24 }, ...AB }, ASSENTA],
      [44, { dx: -300, dy: 300, gira: -90, giraEm: 396, agacha: 0, inclina: 0, cabeca: 14, estica: 1, peD: { dx: 50, dy: -14 }, peE: { dx: 20, dy: -6 }, bracoD: { ombro: 160, cotovelo: 24 }, bracoE: { ombro: 150, cotovelo: 30 }, ...AB }, SU],
      // senta: gira em volta do quadril (o quadril fica no chão), joelhos dobram, mão de trás apoia no chão
      [56, { dx: -300, dy: 300, gira: -32, giraEm: 396, agacha: 0, inclina: 0, cabeca: 6, estica: 1, peD: { dx: 250, dy: -150 }, peE: { dx: 200, dy: -110 }, bracoD: { ombro: 60, cotovelo: 40 }, bracoE: { ombro: -40, cotovelo: 10 }, ...AB }, SU],
      // apoia nos pés e empurra o chão pra subir agachado
      [68, { dx: -300, agacha: 200, inclina: 30, cabeca: 4, giraEm: 396, peE: { dx: -60, dy: 0 }, peD: { dx: 90, dy: 0 }, bracoD: { ombro: 40, cotovelo: 60 }, bracoE: { ombro: 20, cotovelo: 60 } }, SU],
      [80, { dx: -300, agacha: 90, inclina: 16, cabeca: 2 }, SU],
      [92, { dx: -300 }, ASSENTA],
    ],
  },
  /** mortal pra frente no ar (passa POR CIMA do adversário): agacha, sobe esticado, se encolhe girando, abre e pousa */
  cambalhota: {
    nome: "cambalhota",
    tipo: "movimento",
    dur: 42,
    prep: 7,
    pouso: 29,
    desloca: 760,
    voo: { de: 10, ate: 29, altura: 780 },
    cadeia: { cabeca: 1, ombroD: 1, cotoveloD: 2, ombroE: 1, cotoveloE: 2 },
    keys: [
      [0, {}],
      [7, { dx: -6, agacha: 150, inclina: 28, cabeca: 6, estica: 0.86, bracoD: { ombro: -60, cotovelo: 20 }, bracoE: { ombro: -50, cotovelo: 30 } }, SU],
      [10, { dx: 20, agacha: 0, inclina: 10, estica: 1.12, bracoD: { ombro: 170, cotovelo: 6 }, bracoE: { ombro: 160, cotovelo: 12 }, peE: { dx: -40, dy: 0 }, peD: { dx: 30, dy: 0 } }, S],
      [14, { dx: 200, gira: 70, agacha: 80, estica: 1.04, peD: { dx: 80, dy: -170 }, peE: { dx: 40, dy: -150 }, bracoD: { ombro: 120, cotovelo: 60 }, bracoE: { ombro: 110, cotovelo: 60 } }, L],
      [20, { dx: 420, gira: 200, agacha: 140, peD: { dx: 80, dy: -230 }, peE: { dx: 40, dy: -220 }, bracoD: { ombro: 80, cotovelo: 110 }, bracoE: { ombro: 70, cotovelo: 110 } }, L],
      [25, { dx: 640, gira: 310, agacha: 70, peD: { dx: 50, dy: -90 }, peE: { dx: -10, dy: -70 }, bracoD: { ombro: 120, cotovelo: 30 }, bracoE: { ombro: 100, cotovelo: 30 }, ...AB }, L],
      [29, { dx: 760, gira: 360, agacha: 170, inclina: 26, estica: 0.84, peE: { dx: -90, dy: 0 }, peD: { dx: 80, dy: 0 }, bracoD: { ombro: 80, cotovelo: 30 }, bracoE: { ombro: 40, cotovelo: 30 }, ...AB }, L],
      [34, { dx: 760, gira: 360, agacha: 70, inclina: 10, estica: 1.02 }, S],
      [42, { dx: 760, gira: 360 }, ASSENTA],
    ],
  },
  /** salto vertical com aterrissagem: agacha (squash), impulso (stretch), arco de parábola, pouso com squash e recupera */
  salto: {
    nome: "salto",
    tipo: "movimento",
    dur: 36,
    prep: 6,
    pouso: 25,
    desloca: 120,
    voo: { de: 9, ate: 25, altura: 460 },
    keys: [
      [0, {}],
      [6, { agacha: 140, inclina: 18, estica: 0.86, bracoD: { ombro: -50, cotovelo: 20 }, bracoE: { ombro: -40, cotovelo: 30 } }, SU],
      [9, { dx: 20, agacha: 0, inclina: 4, estica: 1.14, bracoD: { ombro: 150, cotovelo: 10 }, bracoE: { ombro: 140, cotovelo: 20 }, peE: { dx: -20, dy: 0 }, peD: { dx: 20, dy: 0 } }, S],
      [17, { dx: 70, agacha: 60, estica: 1.02, peD: { dx: 60, dy: -120 }, peE: { dx: -30, dy: -90 }, bracoD: { ombro: 120, cotovelo: 40 }, bracoE: { ombro: 110, cotovelo: 50 } }, L],
      [25, { dx: 120, agacha: 170, inclina: 22, estica: 0.84, bracoD: { ombro: 60, cotovelo: 30 }, bracoE: { ombro: 40, cotovelo: 40 }, maoD: "aberta" }, L],
      [36, { dx: 120 }, ASSENTA],
    ],
  },
  /** mortal pra trás: agacha, sobe girando 360° de costas e pousa */
  mortalTras: {
    nome: "mortalTras",
    tipo: "movimento",
    dur: 38,
    prep: 6,
    pouso: 27,
    desloca: -160,
    voo: { de: 10, ate: 27, altura: 540 },
    keys: [
      [0, {}],
      [6, { agacha: 150, inclina: 14, estica: 0.86, bracoD: { ombro: -60, cotovelo: 20 }, bracoE: { ombro: -50, cotovelo: 30 } }, SU],
      [10, { dx: -20, agacha: 0, inclina: -6, estica: 1.1, bracoD: { ombro: 170, cotovelo: 10 }, bracoE: { ombro: 160, cotovelo: 20 }, peE: { dx: -30, dy: 0 }, peD: { dx: 20, dy: 0 } }, S],
      [18, { dx: -90, gira: -190, agacha: 130, peD: { dx: 70, dy: -210 }, peE: { dx: 30, dy: -190 }, bracoD: { ombro: 90, cotovelo: 90 }, bracoE: { ombro: 80, cotovelo: 90 } }, L],
      [27, { dx: -160, gira: -360, agacha: 160, inclina: 20, estica: 0.86, peE: { dx: -86, dy: 0 }, peD: { dx: 76, dy: 0 }, bracoD: { ombro: 70, cotovelo: 30 }, bracoE: { ombro: 50, cotovelo: 30 }, ...AB }, L],
      [38, { dx: -160, gira: -360 }, ASSENTA],
    ],
  },
  /** voadora: impulso, sobe com a perna dobrada, ESTICA no contato, recolhe e pousa adiante */
  voadora: {
    nome: "voadora",
    tipo: "ataque",
    dur: 38,
    prep: 6,
    contato: 15,
    pouso: 26,
    membro: "peD",
    mira: "peito",
    desloca: 130,
    voo: { de: 9, ate: 26, altura: 250 },
    keys: [
      [0, {}],
      [6, { dx: -8, agacha: 132, inclina: 24, estica: 0.88, bracoD: { ombro: -50, cotovelo: 30 }, bracoE: { ombro: -40, cotovelo: 30 } }, SU],
      [9, { dx: 40, agacha: 10, inclina: 8, estica: 1.1, peE: { dx: -60, dy: 0 }, peD: { dx: 60, dy: 0 }, bracoD: { ombro: 120, cotovelo: 20 }, bracoE: { ombro: 60, cotovelo: 30 } }, S],
      [12, { dx: 150, agacha: 60, inclina: -6, peD: { dx: 130, dy: -200 }, peE: { dx: -60, dy: -110 }, bracoD: { ombro: 90, cotovelo: 40 }, bracoE: { ombro: -50, cotovelo: 30 } }, L],
      [15, { dx: 230, agacha: 10, inclina: -26, cabeca: 6, peD: { dx: 340, dy: -250 }, peE: { dx: -40, dy: -150 }, bracoD: { ombro: 60, cotovelo: 30 }, bracoE: { ombro: -80, cotovelo: 20 }, ...AB }, L],
      // depois do contato o corpo REBATE no alvo: perde a velocidade e cai um pouco antes dele
      [19, { dx: 200, agacha: 40, inclina: -8, peD: { dx: 220, dy: -150 }, peE: { dx: -40, dy: -120 }, bracoD: { ombro: 90, cotovelo: 40 }, bracoE: { ombro: -40, cotovelo: 30 }, ...AB }, S],
      [26, { dx: 130, agacha: 166, inclina: 24, estica: 0.86, peE: { dx: -90, dy: 0 }, peD: { dx: 80, dy: 0 }, bracoD: { ombro: 50, cotovelo: 30 }, maoD: "aberta" }, L],
      [38, { dx: 130 }, ASSENTA],
    ],
  },
  /** passo de luta pra frente (pé da frente desliza no ar, o de trás acompanha) */
  avanca: {
    nome: "avanca",
    tipo: "movimento",
    dur: 14,
    desloca: 140,
    keys: [
      [0, {}],
      [2, { dx: -6, agacha: 42, inclina: 4 }, SU],
      [6, { dx: 70, agacha: 40, inclina: 11, peD: { dx: 150, dy: -34 }, peE: { dx: -148, dy: 0 } }, S],
      [10, { dx: 132, agacha: 44, inclina: 9, peD: { dx: 82, dy: 0 }, peE: { dx: -40, dy: -30 } }, SU],
      [14, { dx: 140 }, ASSENTA],
    ],
  },
  /** passo de luta pra trás */
  recua: {
    nome: "recua",
    tipo: "movimento",
    dur: 14,
    desloca: -140,
    keys: [
      [0, {}],
      [2, { dx: 6, agacha: 42, inclina: 8 }, SU],
      [6, { dx: -70, agacha: 40, inclina: 2, peE: { dx: -150, dy: -34 }, peD: { dx: 144, dy: 0 } }, S],
      [10, { dx: -132, agacha: 44, inclina: 4, peE: { dx: -82, dy: 0 }, peD: { dx: 40, dy: -30 } }, SU],
      [14, { dx: -140 }, ASSENTA],
    ],
  },
} satisfies Record<string, Golpe>;

export type NomeGolpe = keyof typeof GOLPES;

/** passo de uma coreografia simples: golpe, quadro de início, e (opcional) virar de lado ao fim */
export type Passo = { g: Golpe; em: number; vira?: boolean };

/**
 * Coreografia simples (sem hit-stop/pés plantados — para isso use `luta.ts`): guarda viva entre os golpes;
 * cada golpe começa onde o anterior terminou (deslocamento acumulado). `vira` troca o lado depois do golpe.
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
export const contatoDe = (p: Passo) => p.em + (p.g.contato ?? p.g.pouso ?? 0);
