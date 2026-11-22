import { random } from "remotion";

/**
 * Aura forte estilo anime: várias camadas de "chamas" subindo, núcleo claro,
 * brilho externo, faíscas subindo e onda no chão.
 *
 * x / chao: posição do personagem no mundo (pés). altura: altura do corpo em px (mundo).
 * forca 0..1 (tamanho/opacidade), caos 0..1 (explosão instável), cor/corClara por personagem.
 */
export const AURA_LUCAS = { cor: "#2fc6ff", clara: "#c9f4ff" };
export const AURA_DIEGO = { cor: "#35e08a", clara: "#d4ffe6" };

const formaChama = (cx: number, cy: number, rx: number, ry: number, f: number, semente: string, caos: number, linguas: number) => {
  const n = 40;
  const pts: string[] = [];
  const passo = Math.floor(f / 2);
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const cima = Math.max(0, -Math.sin(a)); // 1 no topo
    const ponta = i % 2 === 0;
    const r1 = random(`${semente}${i}-${passo}`);
    const r2 = random(`${semente}${i}-${passo + 1}`);
    const r = r1 + (r2 - r1) * ((f % 2) / 2);
    let rr = 1 + (ponta ? 0.12 + r * 0.25 : -0.05) + caos * (r - 0.3) * 0.9;
    // línguas de fogo pro alto
    const lingua = ponta ? cima * cima * linguas * (0.6 + r * 0.8) : 0;
    rr = Math.max(0.6, rr);
    pts.push(`${cx + Math.cos(a) * rx * rr} ${cy + Math.sin(a) * ry * rr - lingua * ry}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

export const AuraForte: React.FC<{
  x: number;
  chao: number;
  altura: number;
  f: number;
  forca: number;
  caos?: number;
  cor?: string;
  clara?: string;
  id: string;
  particulas?: boolean;
}> = ({ x, chao, altura, f, forca, caos = 0, cor = AURA_LUCAS.cor, clara = AURA_LUCAS.clara, id, particulas = true }) => {
  if (forca <= 0.01) return null;
  const cy = chao - altura * 0.5;
  const rx = altura * (0.36 + caos * 0.25) * (0.7 + forca * 0.3);
  const ry = altura * (0.62 + caos * 0.2) * (0.7 + forca * 0.3);
  const pulsa = 1 + Math.sin(f * 0.8) * 0.03;
  return (
    <g opacity={Math.min(1, forca * 1.2)}>
      <defs>
        <filter id={`auraG-${id}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={28} />
        </filter>
        <filter id={`auraS-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={5} />
        </filter>
      </defs>
      {/* brilho grande */}
      <ellipse cx={x} cy={cy} rx={rx * 1.5} ry={ry * 1.3} fill={cor} opacity={0.35} filter={`url(#auraG-${id})`} />
      {/* camadas de chama */}
      <g transform={`translate(${x} ${cy}) scale(${pulsa}) translate(${-x} ${-cy})`}>
        <path d={formaChama(x, cy, rx * 1.12, ry * 1.08, f, `${id}a`, caos, 0.9)} fill={cor} opacity={0.55} filter={`url(#auraS-${id})`} />
        <path d={formaChama(x, cy, rx * 0.92, ry * 0.95, f + 7, `${id}b`, caos, 0.7)} fill={cor} opacity={0.75} />
        <path d={formaChama(x, cy, rx * 0.72, ry * 0.82, f + 13, `${id}c`, caos * 0.6, 0.45)} fill={clara} opacity={0.75} />
        <path d={formaChama(x, cy + ry * 0.08, rx * 0.48, ry * 0.66, f + 21, `${id}d`, caos * 0.4, 0.3)} fill="#ffffff" opacity={0.55} />
      </g>
      {/* faíscas subindo */}
      {particulas
        ? new Array(16).fill(0).map((_, i) => {
            const vel = 9 + random(`${id}pv${i}`) * 12;
            const t = ((f * vel + random(`${id}py${i}`) * 1000) % 1000) / 1000;
            const px = x + (random(`${id}px${i}`) - 0.5) * rx * 2.2;
            const py = chao - t * altura * 1.5;
            const s = (1 - t) * (6 + random(`${id}ps${i}`) * 8) * (1 + caos);
            return <rect key={i} x={px - s / 2} y={py} width={s} height={s * 5} rx={s / 2} fill={clara} opacity={0.9 * (1 - t)} />;
          })
        : null}
      {/* onda no chão */}
      {[0, 1].map((i) => {
        const t = ((f + i * 10) % 20) / 20;
        return <ellipse key={i} cx={x} cy={chao} rx={rx * (0.6 + t * 1.2)} ry={rx * (0.1 + t * 0.18)} fill="none" stroke={clara} strokeWidth={10 * (1 - t)} opacity={0.8 * (1 - t) * forca} />;
      })}
    </g>
  );
};

/** correntes de energia convergindo até um ponto (ex.: o punho). prog 0..1 */
export const CorrentesAura: React.FC<{ x: number; chao: number; altura: number; alvoX: number; alvoY: number; f: number; prog: number; cor?: string; clara?: string; id: string }> = ({
  x,
  chao,
  altura,
  alvoX,
  alvoY,
  f,
  prog,
  cor = AURA_LUCAS.cor,
  clara = AURA_LUCAS.clara,
  id,
}) => {
  if (prog <= 0.01) return null;
  return (
    <g>
      {new Array(14).fill(0).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const ox = x + Math.cos(a) * altura * 0.45;
        const oy = chao - altura * 0.5 + Math.sin(a) * altura * 0.6;
        const t = ((f * 0.05 + random(`${id}c${i}`)) % 1) * prog;
        const px = ox + (alvoX - ox) * t;
        const py = oy + (alvoY - oy) * t;
        const cx = (ox + alvoX) / 2 + Math.sin(a * 3) * 120;
        const cyy = (oy + alvoY) / 2 + Math.cos(a * 2) * 120;
        return (
          <g key={i} opacity={prog}>
            <path d={`M ${ox} ${oy} Q ${cx} ${cyy} ${alvoX} ${alvoY}`} stroke={cor} strokeWidth={6} fill="none" opacity={0.35} />
            <circle cx={px} cy={py} r={10 + 8 * (1 - t)} fill={clara} />
          </g>
        );
      })}
    </g>
  );
};

/** punho brilhando (raios + núcleo) */
export const PunhoBrilhando: React.FC<{ x: number; y: number; f: number; forca: number; cor?: string; clara?: string; id: string }> = ({ x, y, f, forca, cor = AURA_LUCAS.cor, clara = AURA_LUCAS.clara, id }) => {
  if (forca <= 0.01) return null;
  return (
    <g>
      <defs>
        <filter id={`punho-${id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={20} />
        </filter>
      </defs>
      <circle cx={x} cy={y} r={160 * forca} fill={cor} opacity={0.6} filter={`url(#punho-${id})`} />
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + f * 0.05;
        const len = (90 + random(`${id}r${i}-${Math.floor(f / 2)}`) * 120) * forca;
        return <path key={i} d={`M ${x} ${y} L ${x + Math.cos(a - 0.06) * len} ${y + Math.sin(a - 0.06) * len} L ${x + Math.cos(a + 0.06) * len} ${y + Math.sin(a + 0.06) * len} Z`} fill={clara} opacity={0.8} />;
      })}
      <circle cx={x} cy={y} r={56 * forca} fill="#ffffff" opacity={0.9} />
    </g>
  );
};
