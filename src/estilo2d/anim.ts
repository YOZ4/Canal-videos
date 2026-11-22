import { Easing, random } from "remotion";
import type { Braco, Pe, Pose, Rosto } from "./Boneco2D";

/**
 * Ferramentas de animação:
 *  - keyframes com curva por trecho (k / kPose / kRosto)
 *  - curvas prontas (antecipação, exagero/overshoot, elástico)
 *  - automáticos: piscar, respirar, falar, andar
 */

export type Curva = (t: number) => number;

export const CURVA = {
  linear: (t: number) => t,
  suave: Easing.inOut(Easing.cubic),
  sai: Easing.out(Easing.cubic),
  entra: Easing.in(Easing.cubic),
  /** passa do ponto e volta (overshoot) */
  exagera: Easing.out(Easing.back(1.8)),
  /** recua antes de ir (antecipação) */
  antecipa: Easing.in(Easing.back(1.8)),
  /** recua, vai e passa do ponto */
  antecipaExagera: Easing.inOut(Easing.back(1.6)),
  elastico: Easing.out(Easing.elastic(1.2)),
  quica: Easing.out(Easing.bounce),
} satisfies Record<string, Curva>;

/** keyframes numéricos: [frame, valor, curva para chegar nesse key] */
export type Key<T> = [number, T, Curva?];

const segmento = <T>(f: number, keys: Key<T>[]): { a: T; b: T; t: number } => {
  if (f <= keys[0][0]) return { a: keys[0][1], b: keys[0][1], t: 0 };
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, curva] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) {
      const raw = f1 === f0 ? 1 : (f - f0) / (f1 - f0);
      return { a: v0, b: v1, t: (curva ?? CURVA.suave)(raw) };
    }
  }
  const last = keys[keys.length - 1][1];
  return { a: last, b: last, t: 0 };
};

export const k = (f: number, keys: Key<number>[]): number => {
  const { a, b, t } = segmento(f, keys);
  return a + (b - a) * t;
};

// ---------- mistura de poses ----------

const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const mixB = (a: Braco, b: Braco, t: number): Braco => ({
  ombro: mixN(a.ombro, b.ombro, t),
  cotovelo: mixN(a.cotovelo, b.cotovelo, t),
});
const mixPe = (a: Pe, b: Pe, t: number): Pe => ({ dx: mixN(a.dx, b.dx, t), dy: mixN(a.dy, b.dy, t) });

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: mixN(a.x, b.x, t),
  y: mixN(a.y, b.y, t),
  escala: mixN(a.escala, b.escala, t),
  lado: t < 0.5 ? a.lado : b.lado,
  inclina: mixN(a.inclina, b.inclina, t),
  estica: mixN(a.estica, b.estica, t),
  agacha: mixN(a.agacha, b.agacha, t),
  cabeca: mixN(a.cabeca, b.cabeca, t),
  bracoE: mixB(a.bracoE, b.bracoE, t),
  bracoD: mixB(a.bracoD, b.bracoD, t),
  peE: mixPe(a.peE, b.peE, t),
  peD: mixPe(a.peD, b.peD, t),
  cruzado: mixN(a.cruzado, b.cruzado, t),
});

export const mixRosto = (a: Rosto, b: Rosto, t: number): Rosto => ({
  olhos: mixN(a.olhos, b.olhos, t),
  olhar: [mixN(a.olhar[0], b.olhar[0], t), mixN(a.olhar[1], b.olhar[1], t)],
  sobrancelha: mixN(a.sobrancelha, b.sobrancelha, t),
  sobrancelhaY: mixN(a.sobrancelhaY, b.sobrancelhaY, t),
  sorriso: mixN(a.sorriso, b.sorriso, t),
  boca: mixN(a.boca, b.boca, t),
  canto: mixN(a.canto, b.canto, t),
  bochecha: mixN(a.bochecha, b.bochecha, t),
});

export const kPose = (f: number, keys: Key<Pose>[]): Pose => {
  const { a, b, t } = segmento(f, keys);
  return mixPose(a, b, t);
};

export const kRosto = (f: number, keys: Key<Rosto>[]): Rosto => {
  const { a, b, t } = segmento(f, keys);
  return mixRosto(a, b, t);
};

// ---------- automáticos ----------

/** piscadas em intervalos "aleatórios" (determinísticos). Retorna multiplicador dos olhos. */
export const piscar = (f: number, semente: string): number => {
  let t = 10 + random(`${semente}-0`) * 40;
  let i = 1;
  while (t < f + 10) {
    const d = f - t;
    if (d >= -1 && d <= 5) {
      // fecha rápido (2 frames), abre um pouco mais devagar (3 frames)
      return d < 1 ? 1 - (d + 1) / 2 : Math.min(1, (d - 1) / 4);
    }
    t += 55 + random(`${semente}-${i}`) * 75;
    i++;
  }
  return 1;
};

/** respiração: valor -1..1 lento */
export const respira = (f: number, fase = 0) => Math.sin((f + fase) * 0.11);

/** boca falando (0..1) — padrão irregular de sílabas */
export const fala = (f: number, semente = "f") => {
  const s = random(`${semente}${Math.floor(f / 3)}`);
  const s2 = random(`${semente}${Math.floor(f / 3) + 1}`);
  const t = (f % 3) / 3;
  const v = s + (s2 - s) * t;
  return v < 0.25 ? 0.05 : 0.2 + v * 0.55;
};

/** ciclo de caminhada (vista de frente se deslocando de lado). fase em frames. */
export const andar = (f: number, intensidade = 1, passo = 14) => {
  const ph = (f / passo) * Math.PI;
  const s = Math.sin(ph);
  const lift = (v: number) => Math.max(0, v);
  return {
    peE: { dx: s * 18 * intensidade, dy: -lift(s) * 55 * intensidade } as Pe,
    peD: { dx: -s * 18 * intensidade, dy: -lift(-s) * 55 * intensidade } as Pe,
    bob: Math.abs(Math.cos(ph)) * 14 * intensidade,
    bracoE: { ombro: 14 + s * 16 * intensidade, cotovelo: -8 - lift(s) * 25 * intensidade } as Braco,
    bracoD: { ombro: 14 - s * 16 * intensidade, cotovelo: -8 - lift(-s) * 25 * intensidade } as Braco,
    balanco: s * 3 * intensidade,
  };
};

/** tremor de câmera */
export const tremor = (f: number, forca: number) => ({
  x: (random(`tx${f}`) - 0.5) * 2 * forca,
  y: (random(`ty${f}`) - 0.5) * 2 * forca,
});
