import { Html5Audio, Sequence, staticFile } from "remotion";
import { POSE_BASE, ROSTO_BASE, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CURVA, k, piscar, respira } from "../../estilo2d/anim";
import { mola } from "../../estilo2d/movimento";
import ALIN from "./legenda.json";
import type { Palavra } from "../../estilo2d/UI";

/** Episódio "O homem que vendeu a Torre Eiffel" — 60 qps. Todos os tempos em quadros a 60 qps. */
export const FPS = 60;
export const DURACAO = 4874;
export const s2f = (s: number) => Math.round(s * FPS);

/** mola a 60 qps */
export const M = (f: number, de: number, s: Parameters<typeof mola>[2] = "natural") => mola(f, de, s, FPS);
/** entra com mola em `de` e sai (encolhe) em `ate` */
export const entraSai = (f: number, de: number, ate: number, s: Parameters<typeof mola>[2] = "solto") => Math.max(0, M(f, de, s) - (f >= ate ? M(f, ate, "firme") : 0));
export const lin = (f: number, a: number, b: number, va: number, vb: number, curva: (t: number) => number = CURVA.suave) => {
  if (f <= a) return va;
  if (f >= b) return vb;
  return va + (vb - va) * curva((f - a) / (b - a));
};
export { k, CURVA };

/** respiração e piscada calibradas para 60 qps (as funções do anim.ts contam a 30) */
export const resp = (f: number, fase = 0) => respira(f / 2, fase);
export const pisca = (r: Rosto, f: number, semente: string): Rosto => ({ ...r, olhos: r.olhos * piscar(f / 2, semente) });
export const vivo = (p: Pose, f: number, fase = 0): Pose => ({ ...p, estica: p.estica * (1 + 0.012 * resp(f, fase)) });

/** pose de frente rápida */
export const P = (x: number, y: number, escala: number, extra: Partial<Pose> = {}): Pose => ({ ...POSE_BASE, x, y, escala, ...extra });

// rostos de referência (tabela da direção visual)
const R = (o: Partial<Rosto>): Rosto => ({ ...ROSTO_BASE, ...o });
export const RL = {
  calmo: R({ olhos: 0.9, sorriso: 0.15, bochecha: 0.4 }),
  vendedor: R({ olhos: 0.78, sobrancelha: 6, sobrancelhaY: 3, sorriso: 0.6, canto: 0.35, bochecha: 0.6 }),
  segredo: R({ olhos: 0.7, olhar: [0.2, 0], sobrancelha: 8, sobrancelhaY: 2, sorriso: 0.3, canto: 0.6, bochecha: 0.5 }),
  propina: R({ olhos: 0.6, olhar: [0.8, 0.1], sobrancelha: 10, sobrancelhaY: -2, sorriso: 0.2, canto: 0.7, bochecha: 0.4 }),
  feliz: R({ olhos: 1.2, olhar: [0, -0.2], sobrancelha: -4, sobrancelhaY: 10, sorriso: 1, boca: 0.7, bochecha: 0.9 }),
};
export const RP = {
  rindo: R({ olhos: 0.5, sobrancelha: -4, sobrancelhaY: 6, sorriso: 1, boca: 0.85, bochecha: 0.9 }),
  segura: R({ olhos: 0.55, sobrancelha: -2, sobrancelhaY: 4, sorriso: 0.5, boca: 0, canto: 0.3, bochecha: 1.3 }),
  interessado: R({ olhos: 1.25, sobrancelha: -2, sobrancelhaY: 9, sorriso: 0, boca: 0.1, bochecha: 0.4 }),
  ganancioso: R({ olhos: 0.75, olhar: [0.2, 0], sobrancelha: 6, sorriso: 0.7, canto: 0.3, bochecha: 0.7 }),
  desconfiado: R({ olhos: 0.62, olhar: [-0.3, 0], sobrancelha: 14, sobrancelhaY: -2, sorriso: -0.1, canto: -0.2, bochecha: 0.3 }),
  vergonha: R({ olhos: 0.6, olhar: [0, 0.6], sobrancelha: -12, sobrancelhaY: 4, sorriso: -0.3, bochecha: 1.5 }),
};
export const RC = {
  serio: R({ olhos: 0.95, sobrancelha: 2, sorriso: 0.05, bochecha: 0.4 }),
  curioso: R({ olhos: 1.15, sobrancelha: -6, sobrancelhaY: 6, sorriso: -0.1, boca: 0.1, bochecha: 0.4 }),
};

/** mistura de cores #rrggbb */
export const mistura = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = Math.max(0, Math.min(1, t));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * c).toString(16).padStart(2, "0")).join("")}`;
};

/** tremor de câmera que decai: lista de [quadro, força px] */
export const tremor = (f: number, impactos: [number, number][]) => {
  let x = 0;
  let y = 0;
  for (const [de, forca] of impactos) {
    const t = f - de;
    if (t < 0 || t > 16) continue;
    const a = forca * Math.exp(-t / 5);
    x += Math.sin(t * 2.9 + de) * a;
    y += Math.cos(t * 3.7 + de) * a;
  }
  return { x, y };
};

// legenda palavra por palavra (legenda.json do pacote; destaque = palavra-chave em laranja)
type W = { text: string; startMs: number; endMs: number; destaque?: boolean };
const PAL = ALIN as W[];
export const LEGENDAS: Palavra[] = PAL.map((p, i) => {
  const prox = PAL[i + 1];
  const fim = prox && prox.startMs - p.endMs < 500 ? prox.startMs : p.endMs + 250;
  return { texto: p.text.trim().replace(/["“”]/g, ""), de: Math.round((p.startMs * FPS) / 1000), ate: Math.round((fim * FPS) / 1000), destaque: !!p.destaque };
});

/** som curto num quadro */
export const Som: React.FC<{ src: string; de: number; volume?: number }> = ({ src, de, volume = 0.5 }) => (
  <Sequence from={de} layout="none">
    <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);
