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
const mixPe = (a: Pe, b: Pe, t: number): Pe => ({ dx: mixN(a.dx, b.dx, t), dy: mixN(a.dy, b.dy, t), rot: mixN(a.rot ?? 0, b.rot ?? 0, t) });

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: mixN(a.x, b.x, t),
  y: mixN(a.y, b.y, t),
  escala: mixN(a.escala, b.escala, t),
  lado: t < 0.5 ? a.lado : b.lado,
  vista: t < 0.5 ? a.vista : b.vista,
  largura: mixN(a.largura, b.largura, t),
  maoE: t < 0.5 ? a.maoE : b.maoE,
  maoD: t < 0.5 ? a.maoD : b.maoD,
  cabelo: mixN(a.cabelo, b.cabelo, t),
  vira: mixN(a.vira, b.vira, t),
  biceps: mixN(a.biceps, b.biceps, t),
  gira: mixN(a.gira, b.gira, t),
  joelhoFrente: mixN(a.joelhoFrente ?? 0, b.joelhoFrente ?? 0, t),
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

/** caminhada de PERFIL (pernas pra frente/trás). Use com PERFIL_BASE. */
export const andarPerfil = (f: number, intensidade = 1, passo = 12) => {
  const ph = (f / passo) * Math.PI;
  const s = Math.sin(ph);
  const lift = (v: number) => Math.max(0, v);
  return {
    peE: { dx: -s * 85 * intensidade, dy: -lift(-Math.cos(ph)) * 45 * intensidade * (s < 0 ? 1 : 0.2) } as Pe,
    peD: { dx: s * 85 * intensidade, dy: -lift(Math.cos(ph)) * 45 * intensidade * (s > 0 ? 1 : 0.2) } as Pe,
    bob: Math.abs(Math.cos(ph)) * 16 * intensidade,
    bracoE: { ombro: s * 32 * intensidade, cotovelo: 14 + lift(s) * 20 } as Braco,
    bracoD: { ombro: -s * 32 * intensidade, cotovelo: 14 + lift(-s) * 20 } as Braco,
    inclina: 5 * intensidade,
  };
};

/**
 * Giro entre vistas (frente <-> perfil) estilo cartoon: achata na horizontal,
 * troca o desenho no meio e volta. Retorna { largura, trocou }.
 */
export const giro = (f: number, inicio: number, dur = 8) => {
  if (f < inicio) return { largura: 1, trocou: false };
  if (f >= inicio + dur) return { largura: 1, trocou: true };
  const t = (f - inicio) / dur;
  return { largura: Math.max(0.12, Math.abs(Math.cos(t * Math.PI))), trocou: t >= 0.5 };
};

/**
 * Movimento secundário: cabelo balança atrasado em relação ao movimento do corpo.
 * Passe uma função de posição x(f) e de inclinação; retorna graus.
 */
export const balancoCabelo = (f: number, posX: (f: number) => number, inclina: (f: number) => number = () => 0) => {
  let acc = 0;
  // mola amortecida simples: soma dos impulsos recentes com decaimento oscilante
  for (let i = 1; i <= 14; i++) {
    const v = posX(f - i) - posX(f - i - 1);
    const vi = inclina(f - i) - inclina(f - i - 1);
    acc += (-v * 0.35 - vi * 1.2) * Math.exp(-i * 0.22) * Math.cos(i * 0.55);
  }
  return Math.max(-18, Math.min(18, acc));
};

// ---------- troca de expressão "atuada" ----------

/**
 * Troca de expressão como no desenho animado, em vez de pular de uma cara para outra:
 *  1. antecipação: ~5 frames antes, aperta os olhos e o corpo encolhe um pouco;
 *  2. a cara nova entra "escondida" atrás do aperto e se ajusta em 4 frames;
 *  3. reação (take): olhos abrem além do normal e o corpo estica, depois assenta com mola.
 * keys: [frame, rosto, tamanhoDaReação?] — tamanho 0 = troca suave, 1 = normal, 2 = susto grande.
 * Some `corpo.estica` e `corpo.agacha` na pose do personagem (multiplique estica, some agacha).
 */
export const trocaRosto = (f: number, keys: [number, Rosto, number?][]): { rosto: Rosto; corpo: { estica: number; agacha: number } } => {
  let i = 0;
  while (i + 1 < keys.length && f >= keys[i + 1][0]) i++;
  let rosto = keys[i][1];
  let estica = 1;
  let agacha = 0;
  let aperto = 0;
  let abre = 0;
  if (i > 0) {
    const d = f - keys[i][0];
    const tam = keys[i][2] ?? 1;
    if (d < 4) rosto = mixRosto(keys[i - 1][1], keys[i][1], CURVA.sai(d / 4));
    aperto = Math.max(0, 1 - d / 3) * Math.min(1, tam);
    const mola = Math.exp(-d / 6) * Math.cos(d * 0.5);
    if (d >= 2) abre = Math.max(0, mola) * 0.28 * tam;
    estica += 0.08 * tam * mola * (d >= 1 ? 1 : 0);
    agacha -= 10 * tam * Math.max(0, mola);
  }
  if (i + 1 < keys.length) {
    const d = keys[i + 1][0] - f;
    const tam = keys[i + 1][2] ?? 1;
    if (d <= 5) {
      const a = CURVA.entra(1 - d / 5) * Math.min(1, tam);
      aperto = Math.max(aperto, a);
      estica -= 0.045 * a * tam;
      agacha += 14 * a * tam;
    }
  }
  return {
    rosto: { ...rosto, olhos: rosto.olhos * (1 - 0.65 * aperto) * (1 + abre) },
    corpo: { estica, agacha },
  };
};
