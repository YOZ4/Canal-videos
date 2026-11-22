import { AbsoluteFill, Html5Audio, Sequence, staticFile } from "remotion";
import { PERFIL_BASE, POSE_BASE, ROSTO_BASE, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { fala, piscar } from "../../estilo2d/anim";

export const ESC = 0.72;
export type Cam = { x: number; y: number; zoom: number; rot?: number };

/** palco SVG com câmera */
export const Palco: React.FC<{ cam: Cam; children: React.ReactNode; fundo?: string }> = ({ cam, children, fundo }) => (
  <AbsoluteFill style={{ background: fundo }}>
    <svg width={1080} height={1920}>
      <g transform={`translate(540 960) rotate(${cam.rot ?? 0}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
    </svg>
  </AbsoluteFill>
);

/** fundo azul quadriculado dos infográficos */
export const Grade: React.FC<{ cor?: string }> = ({ cor = "#26476b" }) => (
  <>
    <rect x={0} y={0} width={1080} height={1920} fill={cor} />
    {new Array(12).fill(0).map((_, i) => (
      <line key={`v${i}`} x1={i * 100 + 40} y1={0} x2={i * 100 + 40} y2={1920} stroke="#fff" strokeOpacity={0.07} strokeWidth={2} />
    ))}
    {new Array(20).fill(0).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 100 + 20} x2={1080} y2={i * 100 + 20} stroke="#fff" strokeOpacity={0.07} strokeWidth={2} />
    ))}
  </>
);

export const frente = (x: number, extra: Partial<Pose> = {}): Pose => ({ ...POSE_BASE, escala: ESC, y: CHAO_Y, x, ...extra });
export const perfil = (x: number, extra: Partial<Pose> = {}): Pose => ({ ...PERFIL_BASE, escala: ESC, y: CHAO_Y, x, ...extra });

export const ROSTO_DIEGO: Rosto = { ...ROSTO_BASE, olhos: 0.6, canto: 0.8, sorriso: 0.35, sobrancelha: 6 };
export const ROSTO_AVO: Rosto = { ...ROSTO_BASE, olhos: 0.75, sorriso: 0.5 };

/** pisca e (opcional) fala entre os frames [falaDe, falaAte) */
export const vivo = (r: Rosto, f: number, semente: string, falaDe = -1, falaAte = -1): Rosto => ({
  ...r,
  olhos: r.olhos * piscar(f, semente),
  boca: f >= falaDe && f < falaAte ? fala(f, semente) : r.boca,
});

/** efeito sonoro posicionado (frame relativo ao componente onde está) */
export const Som: React.FC<{ src: string; de: number; volume?: number }> = ({ src, de, volume = 0.5 }) => (
  <Sequence from={de} layout="none">
    <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

/** lembrança (sépia + vinheta) */
export const Lembranca: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "sepia(0.75) contrast(1.05) brightness(1.02)" }}>
    {children}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(40,20,0,0.65) 100%)" }} />
  </AbsoluteFill>
);
