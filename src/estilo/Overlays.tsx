import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTE_LEGENDA, FONTE_ROTULO } from "./fontes";

export const AMARELO = "#ffd23f";

// ---------- legendas ----------

/** Texto entre *asteriscos* sai em amarelo. `from`/`to` em frames. */
export type Legenda = { text: string; from: number; to: number };

const renderDestaque = (text: string) =>
  text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") ? (
      <span key={i} style={{ color: AMARELO }}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export const Legendas: React.FC<{ items: Legenda[]; top?: number }> = ({ items, top = 1330 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const atual = items.find((l) => frame >= l.from && frame < l.to);
  if (!atual) return null;
  const pop = spring({ frame: frame - atual.from, fps, config: { damping: 14, stiffness: 260 }, durationInFrames: 8 });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 50,
        right: 50,
        textAlign: "center",
        fontFamily: FONTE_LEGENDA,
        fontWeight: 800,
        fontSize: 82,
        lineHeight: 1.05,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: "white",
        WebkitTextStroke: "9px #141018",
        paintOrder: "stroke fill",
        textShadow: "0 5px 14px rgba(0,0,0,0.45)",
        transform: `scale(${0.86 + pop * 0.14})`,
      }}
    >
      {renderDestaque(atual.text)}
    </div>
  );
};

// ---------- rótulos amarelos soltos na cena ----------

export const Rotulo: React.FC<{
  text: string;
  x: number;
  y: number;
  from: number;
  size?: number;
  color?: string;
}> = ({ text, x, y, from, size = 72, color = AMARELO }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 11, stiffness: 200 } });
  if (frame < from) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s})`,
        fontFamily: FONTE_ROTULO,
        fontWeight: 700,
        fontSize: size,
        color,
        WebkitTextStroke: "8px #1d1720",
        paintOrder: "stroke fill",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// ---------- acabamento "filme": vinheta, granulado e correção de cor ----------

export const Acabamento: React.FC<{ children: React.ReactNode; grain?: number }> = ({
  children,
  grain = 0.09,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ filter: "contrast(1.04) saturate(1.06) sepia(0.06)" }}>
      {children}
      {/* vinheta */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(20,10,30,0.42) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* granulado: ruído novo a cada frame */}
      <AbsoluteFill style={{ opacity: grain, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <svg width="100%" height="100%">
          <filter id={`grain${frame}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 97} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain${frame})`} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** flash branco rápido (para cortes de impacto) */
export const Flash: React.FC<{ at: number; dur?: number }> = ({ at, dur = 10 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 2, at, at + dur], [0, 0.95, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o <= 0) return null;
  return <AbsoluteFill style={{ backgroundColor: "white", opacity: o }} />;
};
