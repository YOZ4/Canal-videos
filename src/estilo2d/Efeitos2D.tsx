import { interpolate, random } from "remotion";
import { CONTORNO } from "./personagens";

/**
 * Efeitos de desenho animado (SVG). Todos recebem o frame atual `f` e
 * o frame de início `de` para animar a entrada.
 */

const pop = (f: number, de: number, dur = 8) =>
  interpolate(f - de, [0, dur * 0.6, dur], [0, 1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ---------- linhas de foco (anime) ----------
export const LinhasFoco: React.FC<{ f: number; cx: number; cy: number; forca: number; cor?: string; raio?: number }> = ({
  f,
  cx,
  cy,
  forca,
  cor = "#ffffff",
  raio = 380,
}) => {
  if (forca <= 0) return null;
  const n = 46;
  const semente = Math.floor(f / 2);
  return (
    <g opacity={forca}>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`lf${i}-${semente}`) * 0.1;
        const r0 = raio + random(`lr${i}-${semente}`) * 200;
        const largura = 6 + random(`lw${i}-${semente}`) * 16;
        const r1 = 2200;
        const p0 = [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0];
        const pa = [cx + Math.cos(a - largura / r1) * r1, cy + Math.sin(a - largura / r1) * r1];
        const pb = [cx + Math.cos(a + largura / r1) * r1, cy + Math.sin(a + largura / r1) * r1];
        return <path key={i} d={`M ${p0[0]} ${p0[1]} L ${pa[0]} ${pa[1]} L ${pb[0]} ${pb[1]} Z`} fill={cor} opacity={0.75} />;
      })}
    </g>
  );
};

// ---------- linhas de movimento (velocidade horizontal) ----------
export const LinhasMovimento: React.FC<{ f: number; x: number; y: number; dir: number; forca: number }> = ({ f, x, y, dir, forca }) => {
  if (forca <= 0) return null;
  return (
    <g opacity={forca}>
      {new Array(7).fill(0).map((_, i) => {
        const yy = y - 120 - i * 95 + random(`lm${i}`) * 40;
        const len = 120 + random(`ll${i}-${Math.floor(f / 2)}`) * 160;
        const x0 = x - dir * (170 + random(`lx${i}`) * 60);
        return <path key={i} d={`M ${x0} ${yy} L ${x0 - dir * len} ${yy}`} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.85} />;
      })}
    </g>
  );
};

// ---------- símbolos de emoção ----------

export const Gota: React.FC<{ x: number; y: number; f: number; de: number; escala?: number }> = ({ x, y, f, de, escala = 1 }) => {
  if (f < de) return null;
  const s = pop(f, de) * escala;
  const desce = Math.min(30, (f - de) * 0.8);
  return (
    <g transform={`translate(${x} ${y + desce}) scale(${s})`}>
      <path d="M 0 -60 Q 34 -6 22 24 Q 0 48 -22 24 Q -34 -6 0 -60 Z" fill="#9fd8ff" stroke={CONTORNO} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -8 -10 Q -14 8 -6 18" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" fill="none" />
    </g>
  );
};

export const Veia: React.FC<{ x: number; y: number; f: number; de: number; escala?: number }> = ({ x, y, f, de, escala = 1 }) => {
  if (f < de) return null;
  const pulsa = 1 + Math.sin((f - de) * 0.9) * 0.12;
  const s = pop(f, de) * escala * pulsa;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 90, 180, 270].map((r) => (
        <path key={r} transform={`rotate(${r})`} d="M 8 -8 Q 14 -30 36 -34" stroke="#e8343f" strokeWidth={13} strokeLinecap="round" fill="none" />
      ))}
    </g>
  );
};

export const Brilhos: React.FC<{ x: number; y: number; f: number; de: number; raio?: number; cor?: string }> = ({ x, y, f, de, raio = 140, cor = "#ffe14a" }) => {
  if (f < de) return null;
  return (
    <g>
      {new Array(5).fill(0).map((_, i) => {
        const t = (f - de - i * 3) / 14;
        if (t < 0) return null;
        const vida = (t % 1.2) / 1.2;
        const a = random(`br${i}`) * Math.PI * 2;
        const r = raio * (0.5 + random(`brr${i}`) * 0.6);
        const s = Math.sin(vida * Math.PI) * (0.5 + random(`brs${i}`) * 0.6);
        return (
          <path
            key={i}
            transform={`translate(${x + Math.cos(a) * r} ${y + Math.sin(a) * r}) scale(${s}) rotate(${f * 3})`}
            d="M 0 -40 L 9 -9 L 40 0 L 9 9 L 0 40 L -9 9 L -40 0 L -9 -9 Z"
            fill={cor}
            stroke={CONTORNO}
            strokeWidth={4}
          />
        );
      })}
    </g>
  );
};

export const Simbolo: React.FC<{ texto: "?" | "!" | "!!" | "?!"; x: number; y: number; f: number; de: number; ate?: number; cor?: string; escala?: number }> = ({
  texto,
  x,
  y,
  f,
  de,
  ate = 99999,
  cor = "#ffd23f",
  escala = 1,
}) => {
  if (f < de || f > ate) return null;
  const s = pop(f, de, 7) * escala;
  const balanca = Math.sin((f - de) * 0.4) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${balanca})`}>
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Fredoka"
        fontWeight={700}
        fontSize={150}
        fill={cor}
        stroke={CONTORNO}
        strokeWidth={14}
        paintOrder="stroke"
      >
        {texto}
      </text>
    </g>
  );
};

/** traços de "impacto" em volta de um ponto */
export const Impacto: React.FC<{ x: number; y: number; f: number; de: number; dur?: number; cor?: string }> = ({ x, y, f, de, dur = 10, cor = "#ffffff" }) => {
  const t = (f - de) / dur;
  if (t < 0 || t > 1) return null;
  return (
    <g opacity={1 - t}>
      {new Array(10).fill(0).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r0 = 60 + t * 140;
        const r1 = r0 + 70 * (1 - t);
        return (
          <path key={i} d={`M ${x + Math.cos(a) * r0} ${y + Math.sin(a) * r0} L ${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1}`} stroke={cor} strokeWidth={12} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

/** poeira/fumacinha */
export const Poeira: React.FC<{ x: number; y: number; f: number; de: number; dur?: number; largura?: number }> = ({ x, y, f, de, dur = 18, largura = 1 }) => {
  const t = (f - de) / dur;
  if (t < 0 || t > 1) return null;
  return (
    <g opacity={1 - t}>
      {[-1, 1].map((s) =>
        [0, 1, 2].map((i) => (
          <circle
            key={`${s}${i}`}
            cx={x + s * (50 + t * (130 + i * 60)) * largura}
            cy={y - 20 - i * 16 - t * 30}
            r={(22 + i * 8) * (0.6 + t)}
            fill="#efe6da"
            stroke={CONTORNO}
            strokeWidth={4}
          />
        )),
      )}
    </g>
  );
};
