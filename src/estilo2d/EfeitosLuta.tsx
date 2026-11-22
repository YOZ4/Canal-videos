import { interpolate, random } from "remotion";
import { CONTORNO } from "./personagens";

/** Efeitos de luta (SVG, coordenadas do mundo). */

/** arco de corte (meia-lua branca que aparece e some) */
export const CorteArco: React.FC<{ x: number; y: number; r: number; de: number; ate: number; f: number; inicio: number; fim: number; dur?: number; cor?: string }> = ({
  x,
  y,
  r,
  de,
  ate,
  f,
  inicio,
  fim,
  dur = 8,
  cor = "#ffffff",
}) => {
  const t = (f - inicio) / dur;
  if (t < 0 || t > 1.2 || f > fim) return null;
  const prog = Math.min(1, t * 1.6);
  const a0 = (de * Math.PI) / 180;
  const a1 = ((de + (ate - de) * prog) * Math.PI) / 180;
  const larg = r * 0.28 * (1 - Math.max(0, t - 0.4));
  const pts: string[] = [];
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push(`${x + Math.cos(a) * r} ${y + Math.sin(a) * r}`);
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / n;
    const w = larg * Math.sin((i / n) * Math.PI) ** 0.7;
    pts.push(`${x + Math.cos(a) * (r - w)} ${y + Math.sin(a) * (r - w)}`);
  }
  return <path d={`M ${pts.join(" L ")} Z`} fill={cor} opacity={1 - Math.max(0, t - 0.5) * 2} />;
};

/** explosão de faíscas (linhas que saem de um ponto) */
export const Faiscas: React.FC<{ x: number; y: number; f: number; de: number; dur?: number; cor?: string; n?: number; alcance?: number }> = ({
  x,
  y,
  f,
  de,
  dur = 12,
  cor = "#bfeaff",
  n = 16,
  alcance = 320,
}) => {
  const t = (f - de) / dur;
  if (t < 0 || t > 1) return null;
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const a = random(`fa${de}${i}`) * Math.PI * 2;
        const v = 0.4 + random(`fv${de}${i}`) * 0.6;
        const r0 = alcance * v * t;
        const r1 = r0 + 40 + 80 * v * (1 - t);
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r0}
            y1={y + Math.sin(a) * r0 + t * t * 80}
            x2={x + Math.cos(a) * r1}
            y2={y + Math.sin(a) * r1 + t * t * 80}
            stroke={cor}
            strokeWidth={8 * (1 - t) + 2}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={x} cy={y} r={90 * (1 - t)} fill="#ffffff" opacity={1 - t} />
    </g>
  );
};

/** anel de onda de choque */
export const OndaChoque: React.FC<{ x: number; y: number; f: number; de: number; dur?: number; raio?: number; cor?: string; achatado?: number }> = ({
  x,
  y,
  f,
  de,
  dur = 14,
  raio = 700,
  cor = "#ffffff",
  achatado = 1,
}) => {
  const t = (f - de) / dur;
  if (t < 0 || t > 1) return null;
  const e = 1 - (1 - t) ** 3;
  return <ellipse cx={x} cy={y} rx={raio * e} ry={raio * e * achatado} fill="none" stroke={cor} strokeWidth={40 * (1 - t) + 2} opacity={1 - t} />;
};

/** chamas em volta de um ponto (perna de fogo). intensidade 0..1 */
export const Chamas: React.FC<{ x: number; y: number; f: number; intensidade: number; tamanho?: number }> = ({ x, y, f, intensidade, tamanho = 1 }) => {
  if (intensidade <= 0.01) return null;
  return (
    <g>
      <defs>
        <filter id="fogoBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <circle cx={x} cy={y} r={160 * tamanho * intensidade} fill="#ff7a1a" opacity={0.45} filter="url(#fogoBlur)" />
      {new Array(9).fill(0).map((_, i) => {
        const fase = (f * 0.25 + i * 0.37) % 1;
        const dx = (random(`ch${i}`) - 0.5) * 120 * tamanho;
        const h = (90 + random(`chh${i}`) * 90) * tamanho * intensidade * (1 - fase * 0.6);
        const w = h * 0.45;
        const cx = x + dx;
        const cy = y + 20 - fase * 140 * tamanho;
        const cores = ["#ffd23f", "#ff9b2f", "#ff5a1f"];
        return (
          <path
            key={i}
            d={`M ${cx - w / 2} ${cy} Q ${cx - w / 2} ${cy - h * 0.5} ${cx} ${cy - h} Q ${cx + w / 2} ${cy - h * 0.5} ${cx + w / 2} ${cy} Q ${cx} ${cy + w * 0.4} ${cx - w / 2} ${cy} Z`}
            fill={cores[i % 3]}
            stroke={CONTORNO}
            strokeWidth={4}
            opacity={1 - fase}
          />
        );
      })}
    </g>
  );
};

/** nuvem de fumaça que cresce e some */
export const Fumaca: React.FC<{ x: number; y: number; f: number; de: number; dur?: number; tamanho?: number; cor?: string }> = ({ x, y, f, de, dur = 40, tamanho = 1, cor = "#d9d3e6" }) => {
  const t = (f - de) / dur;
  if (t < 0 || t > 1) return null;
  const cresce = 1 - (1 - Math.min(1, t * 2.5)) ** 2;
  const some = t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
  return (
    <g opacity={some}>
      {new Array(14).fill(0).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = (220 + random(`fu${i}`) * 140) * tamanho * cresce;
        const rr = (110 + random(`fr${i}`) * 90) * tamanho * cresce;
        return <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r * 0.55 - 120 * cresce} r={rr} fill={cor} stroke={CONTORNO} strokeWidth={5} />;
      })}
      <ellipse cx={x} cy={y - 120 * cresce} rx={360 * tamanho * cresce} ry={220 * tamanho * cresce} fill={cor} />
    </g>
  );
};

/** traços de velocidade atrás de quem avança (dir = 1 indo pra direita) */
export const Rastro: React.FC<{ x: number; y: number; dir: number; forca: number; f: number; cor?: string }> = ({ x, y, dir, forca, f, cor = "#ffffff" }) => {
  if (forca <= 0.01) return null;
  return (
    <g opacity={forca}>
      {new Array(6).fill(0).map((_, i) => {
        const yy = y - 120 - i * 110 + (random(`ra${i}`) - 0.5) * 40;
        const len = 200 + random(`rl${i}-${Math.floor(f / 2)}`) * 260;
        const x0 = x - dir * 140;
        return <path key={i} d={`M ${x0} ${yy} L ${x0 - dir * len} ${yy}`} stroke={cor} strokeWidth={12 - i} strokeLinecap="round" opacity={0.85} />;
      })}
    </g>
  );
};

/** onomatopeia em quadrinho ("CLANG!", "BUM!") */
export const Onomatopeia: React.FC<{ texto: string; x: number; y: number; f: number; de: number; dur?: number; cor?: string; tamanho?: number; giro?: number }> = ({
  texto,
  x,
  y,
  f,
  de,
  dur = 20,
  cor = "#ffd23f",
  tamanho = 160,
  giro = -8,
}) => {
  const t = (f - de) / dur;
  if (t < 0 || t > 1) return null;
  const s = interpolate(t, [0, 0.15, 0.25, 1], [0.2, 1.25, 1, 1.08]);
  const o = interpolate(t, [0, 0.1, 0.8, 1], [0, 1, 1, 0]);
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${s})`} opacity={o}>
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Fredoka"
        fontWeight={700}
        fontSize={tamanho}
        fill={cor}
        stroke={CONTORNO}
        strokeWidth={tamanho / 7}
        paintOrder="stroke"
        letterSpacing={4}
      >
        {texto}
      </text>
    </g>
  );
};
