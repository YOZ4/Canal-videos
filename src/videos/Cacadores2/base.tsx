import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { ROSTO_BASE, type Rosto } from "../../estilo2d/Boneco2D";
import { CURVA, fala, k, piscar, type Curva } from "../../estilo2d/anim";
import { Palco } from "../Cacadores/comum";
import { FPS, T, TF } from "../Cacadores/tempo";

/**
 * Base do REMAKE "Caçadores — parte 1" (mesma narração e tempos do original, animação refeita com tudo o que o
 * sistema ganhou: camada de naturalidade, rosto atuado, torção de tronco, golpes com fases, luta.ts com hit-stop,
 * câmera que enquadra, desenho à mão, 3D estratégico no copo do Nen, FilmeMudo nas lembranças do avô).
 * Cada ATO recebe t0 e trabalha em quadros ABSOLUTOS (f = local + t0), então bate com a narração (T/TF).
 */
export { FPS, T, TF };
export const useF = (t0: number) => useCurrentFrame() + t0;
export const ip = (f: number, a: number[], b: number[], e?: Curva) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
export const mola = (f: number, de: number, cfg = { mass: 1, stiffness: 110, damping: 14 }) => (f < de ? 0 : spring({ frame: f - de, fps: FPS, config: cfg }));
export const S = CURVA.suave;

export type CamV = { x: number; y: number; zoom: number };
type CK = [number, CamV, Curva?];
/** câmera por keyframes (zoom em escala log = lente natural) */
export const camK = (f: number, keys: CK[]): CamV => ({
  x: k(f, keys.map(([t, c, cv]) => [t, c.x, cv])),
  y: k(f, keys.map(([t, c, cv]) => [t, c.y, cv])),
  zoom: Math.exp(k(f, keys.map(([t, c, cv]) => [t, Math.log(c.zoom), cv]))),
});
export const mixCam = (a: CamV, b: CamV, t: number): CamV => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t) });

/** cena num Palco parado (a câmera já vem calculada) + fundo */
export const Cena: React.FC<{ cam: CamV; children: React.ReactNode; fundo?: string; tremor?: { x: number; y: number } }> = ({ cam, children, fundo = "#efe4d2", tremor }) => (
  <AbsoluteFill style={{ background: fundo, transform: tremor ? `translate(${tremor.x}px, ${tremor.y}px)` : undefined }}>
    <Palco cam={cam} parado>
      {children}
    </Palco>
  </AbsoluteFill>
);

/** escolhe o plano (corte) atual: lista de [quadro de início, render] */
export const planos = (f: number, lista: [number, () => React.ReactNode][]) => {
  let atual = lista[0][1];
  for (const [de, r] of lista) if (f >= de) atual = r;
  return atual();
};

/** rosto vivo: pisca e mexe a boca enquanto fala (intervalos [de, ate) de quadros) */
export const vivo = (r: Rosto, f: number, sem: string, falas: [number, number][] = []): Rosto => {
  const falando = falas.some(([a, b]) => f >= a && f < b);
  return { ...r, olhos: r.olhos * piscar(f, sem), boca: falando ? Math.max(r.boca, fala(f, sem)) : r.boca };
};

/** expressões do episódio */
export const R = {
  normal: { ...ROSTO_BASE },
  feliz: { ...ROSTO_BASE, sorriso: 0.8, olhos: 0.9, bochecha: 0.8 },
  nervoso: { ...ROSTO_BASE, olhos: 1.15, pupila: 0.75, sobrancelha: -18, sobrancelhaY: 8, sorriso: -0.35, boca: 0.12, suor: 0.8 },
  branco: { ...ROSTO_BASE, olhos: 1.25, pupila: 0.45, sobrancelha: -12, sobrancelhaY: 16, sorriso: -0.2, boca: 0.3, espiral: 0, suor: 1 },
  medo: { ...ROSTO_BASE, olhos: 1.3, pupila: 0.5, sobrancelha: -20, sobrancelhaY: 18, sorriso: -0.6, boca: 0.5, suor: 1, palido: 0.4 },
  serio: { ...ROSTO_BASE, olhos: 0.85, sobrancelha: 14, sorriso: 0.05 },
  foco: { ...ROSTO_BASE, olhos: 0.62, sobrancelha: 22, sorriso: -0.15 },
  grito: { ...ROSTO_BASE, olhos: 0.55, sobrancelha: 28, sorriso: -0.9, boca: 0.95 },
  calmo: { ...ROSTO_BASE, olhos: 0.12, sorriso: 0.25, sobrancelha: -4 },
  sorrisoCanto: { ...ROSTO_BASE, olhos: 0.6, canto: 1, sorriso: 0.4, sobrancelha: 8 },
  debochado: { ...ROSTO_BASE, olhos: 0.55, canto: 1, sorriso: 0.5, sobrancelha: 10 },
  dormindo: { ...ROSTO_BASE, olhos: 0, dormindo: 0.6, sorriso: 0.1 },
  meioFechado: { ...ROSTO_BASE, olhos: 0.45, canto: 0.8, sorriso: 0.3, sobrancelha: 6 },
  surpreso: { ...ROSTO_BASE, olhos: 1.25, pupila: 0.7, sobrancelha: -8, sobrancelhaY: 14, sorriso: -0.3, boca: 0.4 },
  cansado: { ...ROSTO_BASE, olhos: 0.5, sobrancelha: -10, sorriso: -0.2, boca: 0.45, suor: 1 },
  dor: { ...ROSTO_BASE, olhos: 0.1, sobrancelha: -18, sobrancelhaY: 6, sorriso: -0.8, boca: 0.6, suor: 0.5 },
  tonto: { ...ROSTO_BASE, espiral: 1, sorriso: -0.3, boca: 0.3 },
  envergonhado: { ...ROSTO_BASE, olhos: 0.7, sorriso: 0.3, vergonha: 0.8, olhar: [0.6, 0.3] },
  determinado: { ...ROSTO_BASE, olhos: 0.75, sobrancelha: 20, sorriso: 0.1, canto: 0.3 },
} satisfies Record<string, Rosto>;

export const ROSTO_AVO_C: Rosto = { ...ROSTO_BASE, olhos: 0.55, sorriso: 0.55, sobrancelha: -4 };
export const falaDe = (trecho: string): [number, number] => [T(trecho), TF(trecho)];
