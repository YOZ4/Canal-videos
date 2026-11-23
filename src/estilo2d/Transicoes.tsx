import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { CONTORNO } from "./personagens";

/**
 * Transições entre cenas (sobrepostas ao vídeo). O corte real das cenas
 * deve acontecer no frame `meio` = de + dur/2, quando a tela está coberta.
 */

const t01 = (f: number, de: number, dur: number) =>
  interpolate(f, [de, de + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** faixa diagonal colorida que atravessa a tela */
export const Cortina: React.FC<{ de: number; dur?: number; cor?: string; cor2?: string }> = ({ de, dur = 14, cor = "#ff9b2f", cor2 = "#ffd23f" }) => {
  const f = useCurrentFrame();
  if (f < de || f > de + dur) return null;
  const t = Easing.inOut(Easing.cubic)(t01(f, de, dur));
  const x = -1700 + t * 3400;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <g transform={`translate(${x} 0) skewX(-18)`}>
          <rect x={-150} y={-200} width={1500} height={2400} fill={cor} stroke={CONTORNO} strokeWidth={10} />
          <rect x={-150 + 1500} y={-200} width={90} height={2400} fill={cor2} stroke={CONTORNO} strokeWidth={10} />
          <rect x={-150 - 90} y={-200} width={90} height={2400} fill={cor2} stroke={CONTORNO} strokeWidth={10} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** círculo que fecha num ponto e abre de novo (estilo desenho clássico) */
export const Iris: React.FC<{ de: number; dur?: number; x?: number; y?: number; x2?: number; y2?: number }> = ({ de, dur = 16, x = 540, y = 900, x2, y2 }) => {
  const f = useCurrentFrame();
  if (f < de || f > de + dur) return null;
  const t = t01(f, de, dur);
  const fechando = t < 0.5;
  const r = fechando ? interpolate(t, [0, 0.5], [1400, 0], { easing: Easing.in(Easing.cubic) }) : interpolate(t, [0.5, 1], [0, 1400], { easing: Easing.out(Easing.cubic) });
  const cx = fechando ? x : x2 ?? x;
  const cy = fechando ? y : y2 ?? y;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <defs>
          <mask id={`iris${de}`}>
            <rect width={1080} height={1920} fill="white" />
            <circle cx={cx} cy={cy} r={r} fill="black" />
          </mask>
        </defs>
        <rect width={1080} height={1920} fill="#141018" mask={`url(#iris${de})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffd23f" strokeWidth={r > 2 ? 12 : 0} />
      </svg>
    </AbsoluteFill>
  );
};

/** "zoom passando": flash + linhas radiais rápidas */
export const ZoomRapido: React.FC<{ de: number; dur?: number }> = ({ de, dur = 10 }) => {
  const f = useCurrentFrame();
  if (f < de || f > de + dur) return null;
  const t = t01(f, de, dur);
  const o = Math.sin(t * Math.PI);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <rect width={1080} height={1920} fill="#ffffff" opacity={o * 0.75} />
        {new Array(36).fill(0).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const r0 = 200 + t * 900;
          const r1 = r0 + 400;
          return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={960 + Math.sin(a) * r1} stroke="#ffd23f" strokeWidth={10} opacity={o} strokeLinecap="round" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
