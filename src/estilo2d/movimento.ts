import { random, spring } from "remotion";
import type { Braco, Pose } from "./Boneco2D";
import { peApoioX, pernasFK, type EstiloCorrida } from "./corrida";

/**
 * Ferramentas "anti-robô" (skill analise-movimento-remotion):
 *  - fasePassadas: ciclo com passadas de duração diferente (esquerda ≠ direita) e variação de um ciclo para o outro
 *  - faseBrutal:   ritmo "pisa-explode-plana" (corrida brutal: segura a pose no ar e acelera no impulso)
 *  - xPorFase:     deslocamento com o pé de apoio plantado para QUALQUER função de fase
 *  - emCadeia:     cada parte do corpo avaliada alguns frames atrasada (tronco lidera, cabeça/braços/antebraços seguem)
 *  - mola:         spring do Remotion com atalhos de "sensação" (pesado, natural, solto)
 */

const FPS = 30;

/** variação determinística (−amp..amp) para o índice i */
export const vari = (semente: string, i: number, amp: number) => (random(`${semente}-${i}`) - 0.5) * 2 * amp;

/**
 * fase (em ciclos) de uma corrida cujas passadas NÃO são todas iguais.
 * cicloBase: frames por ciclo (2 passadas). assimetria: diferença entre passada D e E (0.07 = 7%).
 * variacao: quanto cada passada muda (0.06 = ±6%).
 */
export const fasePassadas = (f: number, cicloBase: number, semente: string, assimetria = 0.07, variacao = 0.06): number => {
  if (f <= 0) return f / cicloBase;
  let t = 0;
  let i = 0;
  for (;;) {
    const dur = (cicloBase / 2) * (1 + (i % 2 === 0 ? -assimetria : assimetria) + vari(semente, i, variacao));
    if (t + dur > f) return (i + (f - t) / dur) * 0.5;
    t += dur;
    i++;
  }
};

/**
 * Ritmo da corrida brutal (medido na referência, 30 fps, ~14 frames por passada):
 *  0–2   pisa e absorve (devagar, afunda)      → fase 0.00–0.12
 *  2–4   explode (muito rápido)                → fase 0.12–0.36
 *  4–11  plana segurando a pose (quase parado) → fase 0.36–0.42
 *  11–14 estica para pisar                     → fase 0.42–0.50
 * Cada passada varia ±1 frame.
 */
export const faseBrutal = (f: number, semente: string, passo = 14): number => {
  if (f <= 0) return 0;
  const trechos: [number, number, number][] = [
    [2, 0, 0.12],
    [2, 0.12, 0.36],
    [7, 0.36, 0.42],
    [3, 0.42, 0.5],
  ];
  let t = 0;
  let i = 0;
  for (;;) {
    const escala = (passo + vari(semente, i, 1)) / passo;
    for (const [d0, a, b] of trechos) {
      const d = d0 * escala;
      if (t + d > f) {
        const u = (f - t) / d;
        // explosão sai rápido (ease-out); planar desacelera; o resto suave
        const e = a === 0.12 ? 1 - (1 - u) * (1 - u) : u * u * (3 - 2 * u);
        return i * 0.5 + a + (b - a) * e;
      }
      t += d;
    }
    i++;
  }
};

/**
 * Ritmo genérico "segura a pose": cada passada (meio ciclo de fase) é dividida em trechos
 * [duração em frames, fase inicial, fase final, curva]. Útil para corridas estilizadas (brutal, ninja).
 * variacao = ±frames por passada.
 */
export type Trecho = [number, number, number, "sai" | "suave" | "linear" | "entra"];
const CURVAS = {
  sai: (u: number) => 1 - (1 - u) * (1 - u),
  entra: (u: number) => u * u,
  suave: (u: number) => u * u * (3 - 2 * u),
  linear: (u: number) => u,
};
export const faseRitmo = (f: number, semente: string, trechos: Trecho[], variacao = 1): number => {
  if (f <= 0) return 0;
  const passo = trechos.reduce((a, t) => a + t[0], 0);
  let t = 0;
  let i = 0;
  for (;;) {
    const escala = (passo + vari(semente, i, variacao)) / passo;
    for (const [d0, a, b, c] of trechos) {
      const d = d0 * escala;
      if (t + d > f) return i * 0.5 + a + (b - a) * CURVAS[c]((f - t) / d);
      t += d;
    }
    i++;
  }
};

/** corrida brutal v2: pisa fundo (2f) → explode (2f) → plana SEGURANDO a pose aberta no ar (7f) → estica para pisar (3f) */
export const RITMO_BRUTAL: Trecho[] = [
  [2, 0, 0.12, "sai"],
  [2, 0.12, 0.4, "sai"],
  [7, 0.4, 0.44, "linear"],
  [3, 0.44, 0.5, "entra"],
];
/** ninja2 (referência "Naruto run", ~8 frames por passada): pisa/encolhe → empurra → plana esticado → estende */
export const RITMO_NINJA: Trecho[] = [
  [1.5, 0, 0.12, "sai"],
  [1.5, 0.12, 0.3, "sai"],
  [4, 0.3, 0.42, "linear"],
  [1, 0.42, 0.5, "entra"],
];

/** deslocamento x (px de mundo) com o pé de apoio parado no chão, para qualquer fase(f). */
const cacheX = new Map<string, number[]>();
const cacheV = new Map<string, number>();
export const xPorFase = (id: string, fase: (g: number) => number, f: number, estilo: EstiloCorrida, escala: number): number => {
  let arr = cacheX.get(id);
  if (!arr) {
    arr = [0];
    cacheX.set(id, arr);
  }
  const alvo = Math.max(0, Math.ceil(f));
  let ultimo = cacheV.get(id) ?? 0;
  const sub = 4;
  while (arr.length <= alvo) {
    const fr = arr.length - 1;
    let x = arr[fr];
    for (let s = 0; s < sub; s++) {
      const xa = peApoioX(fase(fr + s / sub), estilo);
      const xb = peApoioX(fase(fr + (s + 1) / sub), estilo);
      const d = xa !== null && xb !== null && Math.abs(xb - xa) < 200 ? -(xb - xa) * escala : ultimo;
      ultimo = d;
      x += d;
    }
    arr.push(x);
    cacheV.set(id, ultimo);
  }
  const i = Math.floor(Math.max(0, f));
  const t = Math.max(0, f) - i;
  return arr[i] + (arr[Math.min(arr.length - 1, i + 1)] - arr[i]) * t;
};

export type Atrasos = {
  cabeca?: number;
  ombroD?: number;
  cotoveloD?: number;
  ombroE?: number;
  cotoveloE?: number;
};

/** atrasos padrão (frames a 30 fps): braços D e E diferentes para não ficarem espelhados */
export const CADEIA: Required<Atrasos> = { cabeca: 2, ombroD: 2, cotoveloD: 4, ombroE: 3, cotoveloE: 5 };

/**
 * Monta a pose com atraso em cadeia: tronco/pernas no frame f, as outras partes em f − atraso.
 * pose(g) deve ser pura (só depender de g).
 */
export const emCadeia = (pose: (g: number) => Pose, f: number, atrasos: Atrasos = CADEIA): Pose => {
  const a = { ...CADEIA, ...atrasos };
  const p = pose(f);
  const braco = (lado: "D" | "E", ombro: number, cotovelo: number): Braco => {
    const b1 = lado === "D" ? pose(f - ombro).bracoD : pose(f - ombro).bracoE;
    const b2 = lado === "D" ? pose(f - cotovelo).bracoD : pose(f - cotovelo).bracoE;
    return { ombro: b1.ombro, cotovelo: b2.cotovelo };
  };
  return {
    ...p,
    cabeca: pose(f - a.cabeca).cabeca,
    bracoD: braco("D", a.ombroD, a.cotoveloD),
    bracoE: braco("E", a.ombroE, a.cotoveloE),
  };
};

export const SENSACAO = {
  pesado: { mass: 1.4, stiffness: 105, damping: 18 },
  natural: { mass: 0.9, stiffness: 160, damping: 12 },
  solto: { mass: 0.55, stiffness: 220, damping: 7.5 },
  firme: { mass: 1, stiffness: 200, damping: 26 },
} as const;

/** spring 0→1 que começa no frame `de` (antes disso = 0). Passa do ponto conforme a sensação. */
export const mola = (f: number, de: number, sensacao: keyof typeof SENSACAO | { mass: number; stiffness: number; damping: number } = "natural", fps = FPS) =>
  f < de ? 0 : spring({ frame: f - de, fps, config: typeof sensacao === "string" ? SENSACAO[sensacao] : sensacao });

/** mistura entre a e b com a mola (aceita passar do ponto: t > 1) */
export const entre = (a: number, b: number, t: number) => a + (b - a) * t;

/** pernas por ângulos (coxa/joelho em graus) com o pé mais baixo encostado no chão; devolve também o agacha certo */
export const pernasNoChao = (coxaD: number, joelhoD: number, coxaE: number, joelhoE: number, levanta = 0) => {
  const t = pernasFK(coxaD, joelhoD, coxaE, joelhoE, 0);
  const agacha = -Math.max(t.peD.dy, t.peE.dy) - levanta;
  return { ...pernasFK(coxaD, joelhoD, coxaE, joelhoE, agacha), agacha };
};

/** média dos valores de fn nos últimos n frames: câmera que segue com atraso e suaviza (cinegrafista) */
export const seguir = (fn: (g: number) => number, f: number, n = 8) => {
  let s = 0;
  for (let i = 0; i < n; i++) s += fn(f - i);
  return s / n;
};
