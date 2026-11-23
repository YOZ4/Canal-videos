import type { Design } from "../personagens";

/**
 * Estilo "chibi" (inspirado na referência): cabeça ~50% da altura, sem contorno,
 * olhos pequenos escuros com brilho, sobrancelhas grossas, sombras suaves.
 * Origem no chão entre os pés; altura total ≈ 1000 px na escala 1.
 */

export type PoseChibi = {
  x: number;
  y: number;
  escala: number;
  cruzado?: number;
  cabeca?: number;
  inclina?: number;
};

export type RostoChibi = {
  /** 0 fechado / 1 aberto */
  olhos: number;
  /** pálpebra de cima caída (olhar "meio fechado") 0..1 */
  palpebra: number;
  /** graus das sobrancelhas: + bravo / - preocupado */
  sobrancelha: number;
  sorriso: number;
  boca: number;
  canto: number;
  olhar: [number, number];
};

export const ROSTO_CHIBI: RostoChibi = { olhos: 1, palpebra: 0, sobrancelha: 0, sorriso: 0.4, boca: 0, canto: 0, olhar: [0, 0] };

const escurece = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
};

const HEAD_Y = -700;
const HEAD_R = 255;

const CabeloCachos: React.FC<{ d: Design }> = ({ d }) => {
  const bolhas: [number, number, number][] = [
    [-235, -770, 66], [-250, -690, 54], [-205, -860, 78], [-130, -930, 84], [-40, -965, 88], [55, -960, 88],
    [145, -925, 82], [215, -850, 76], [250, -760, 64], [255, -685, 50], [-150, -820, 70], [-60, -860, 74],
    [40, -865, 74], [130, -830, 70], [-190, -770, 60], [190, -770, 60],
  ];
  return (
    <g>
      <ellipse cx={0} cy={-855} rx={235} ry={120} fill={d.corCabelo} />
      {bolhas.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={d.corCabelo} />
      ))}
      {bolhas.map(([x, y], i) => (
        <path key={`c${i}`} d={`M ${x - 22} ${y + 6} Q ${x} ${y - 18} ${x + 22} ${y + 6}`} stroke={d.corCabeloSombra} strokeWidth={9} fill="none" strokeLinecap="round" />
      ))}
      {/* franja de cachos na testa */}
      {[-170, -95, -15, 65, 145].map((x, i) => (
        <circle key={`f${i}`} cx={x} cy={-858 + Math.abs(x) * 0.25} r={46} fill={d.corCabelo} />
      ))}
    </g>
  );
};

const CabeloTopeteChibi: React.FC<{ d: Design }> = ({ d }) => (
  <g>
    <path
      d="M -262 -640 Q -290 -860 -150 -940 Q -30 -1000 90 -985 Q 220 -1010 320 -935 Q 270 -925 250 -895 Q 290 -800 262 -660 Q 240 -700 210 -730 Q 80 -790 -60 -770 Q -180 -755 -230 -690 Z"
      fill={d.corCabelo}
    />
    <path d="M 210 -730 Q 270 -790 250 -895 Q 290 -800 262 -660 Q 240 -700 210 -730 Z" fill={d.corCabeloSombra} opacity={0.6} />
    {["M -200 -700 Q -190 -860 -60 -930", "M -110 -770 Q -60 -900 60 -960", "M -10 -775 Q 50 -900 170 -955", "M 90 -770 Q 160 -860 250 -900"].map((p, i) => (
      <path key={i} d={p} stroke={d.corCabeloSombra} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
    ))}
    <path d="M -120 -900 Q -40 -950 60 -955" stroke={d.brilhoCabelo} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.45} />
  </g>
);

const Olho: React.FC<{ cx: number; r: RostoChibi; pele: string }> = ({ cx, r, pele }) => {
  const cy = HEAD_Y + 10;
  if (r.olhos < 0.1) {
    return <path d={`M ${cx - 30} ${cy} Q ${cx} ${cy + 18} ${cx + 30} ${cy}`} stroke="#2a1d22" strokeWidth={10} fill="none" strokeLinecap="round" />;
  }
  const ox = r.olhar[0] * 8;
  const oy = r.olhar[1] * 6;
  const ry = 36 * r.olhos;
  const tampa = ry * 2 * r.palpebra;
  return (
    <g>
      <ellipse cx={cx + ox} cy={cy + oy} rx={27} ry={ry} fill="#2a1d22" />
      <circle cx={cx + ox - 9} cy={cy + oy - ry * 0.4} r={9} fill="#ffffff" />
      <circle cx={cx + ox + 9} cy={cy + oy + ry * 0.35} r={4} fill="#ffffff" opacity={0.7} />
      {r.palpebra > 0.05 ? (
        <>
          <rect x={cx - 40} y={cy - ry - 6} width={80} height={tampa + 6} fill={pele} />
          <path d={`M ${cx - 38} ${cy - ry + tampa} Q ${cx} ${cy - ry + tampa - 8} ${cx + 38} ${cy - ry + tampa}`} stroke="#2a1d22" strokeWidth={9} fill="none" strokeLinecap="round" />
        </>
      ) : null}
    </g>
  );
};

export const BonecoChibi: React.FC<{ d: Design; pose: PoseChibi; rosto: RostoChibi; id: string }> = ({ d, pose, rosto, id }) => {
  const pele = d.pele;
  const sombraPele = escurece(d.pele, 0.86);
  const cruz = pose.cruzado ?? 0;
  const gid = `cb-${id}`;
  return (
    <g transform={`translate(${pose.x} ${pose.y}) scale(${pose.escala})`}>
      <defs>
        <radialGradient id={`${gid}-rosto`} cx="0.4" cy="0.4" r="0.75">
          <stop offset="0.55" stopColor={pele} />
          <stop offset="1" stopColor={sombraPele} />
        </radialGradient>
        <linearGradient id={`${gid}-camisa`} x1="0" x2="1">
          <stop offset="0.55" stopColor={d.camisa} />
          <stop offset="1" stopColor={escurece(d.camisa, 0.82)} />
        </linearGradient>
        <filter id={`${gid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>
      {/* sombra macia no chão */}
      <ellipse cx={0} cy={6} rx={210} ry={34} fill="#1d1424" opacity={0.22} filter={`url(#${gid}-blur)`} />

      {/* pernas + tênis */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s * 70 - 52} y={-240} width={104} height={200} rx={30} fill={s > 0 ? d.calcaSombra : d.calca} />
          <ellipse cx={s * 82} cy={-22} rx={82} ry={40} fill={d.tenis} />
          <rect x={s * 82 - 82} y={-8} width={164} height={18} rx={9} fill={d.sola} />
        </g>
      ))}

      {/* tronco */}
      <g transform={`rotate(${pose.inclina ?? 0} 0 -240)`}>
        <path d="M -160 -470 Q -175 -470 -178 -440 L -168 -250 Q -165 -205 -120 -205 L 120 -205 Q 165 -205 168 -250 L 178 -440 Q 175 -470 160 -470 Z" fill={`url(#${gid}-camisa)`} />
        <path d="M -70 -472 Q 0 -420 70 -472 Z" fill={escurece(d.camisa, 0.75)} />
        {d.numero ? (
          <text x={0} y={-262} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={150} fill={escurece(d.camisa, 0.35)}>
            {d.numero}
          </text>
        ) : null}

        {/* braços */}
        {cruz > 0.5 ? (
          <g>
            <rect x={-200} y={-420} width={110} height={130} rx={50} fill={d.camisa} />
            <rect x={90} y={-420} width={110} height={130} rx={50} fill={escurece(d.camisa, 0.85)} />
            <rect x={-175} y={-345} width={350} height={78} rx={39} fill={sombraPele} />
            <rect x={-170} y={-372} width={340} height={78} rx={39} fill={pele} />
            <circle cx={150} cy={-333} r={46} fill={pele} />
            <circle cx={-150} cy={-306} r={46} fill={sombraPele} />
          </g>
        ) : (
          [-1, 1].map((s) => (
            <g key={s}>
              <path d={`M ${s * 170} -430 Q ${s * 215} -330 ${s * 205} -230`} stroke={s > 0 ? sombraPele : pele} strokeWidth={72} fill="none" strokeLinecap="round" />
              <rect x={s * 170 - 62} y={-470} width={124} height={130} rx={55} fill={s > 0 ? escurece(d.camisa, 0.85) : d.camisa} />
              <circle cx={s * 205} cy={-215} r={48} fill={s > 0 ? sombraPele : pele} />
            </g>
          ))
        )}
      </g>

      {/* pescoço + cabeça */}
      <rect x={-48} y={-500} width={96} height={60} rx={20} fill={sombraPele} />
      <g transform={`rotate(${pose.cabeca ?? 0} 0 -470)`}>
        {[-1, 1].map((s) => (
          <g key={s}>
            <circle cx={s * 250} cy={HEAD_Y + 10} r={52} fill={s > 0 ? sombraPele : pele} />
            <circle cx={s * 255} cy={HEAD_Y + 12} r={26} fill={escurece(d.pele, 0.78)} opacity={0.6} />
          </g>
        ))}
        <ellipse cx={0} cy={HEAD_Y} rx={HEAD_R} ry={HEAD_R * 0.97} fill={`url(#${gid}-rosto)`} />
        {d.cabelo === "cacheado" ? <CabeloCachos d={d} /> : <CabeloTopeteChibi d={d} />}
        {/* bochechas */}
        {[-1, 1].map((s) => (
          <ellipse key={s} cx={s * 140} cy={HEAD_Y + 95} rx={48} ry={26} fill="#f07f84" opacity={0.35} />
        ))}
        {/* sobrancelhas grossas */}
        {[-1, 1].map((s) => (
          <rect
            key={s}
            x={s * 95 - 48}
            y={HEAD_Y - 90}
            width={96}
            height={d.sobrancelhaGrossa ? 26 : 20}
            rx={12}
            fill={d.sobrancelha}
            transform={`rotate(${rosto.sobrancelha * s} ${s * 95} ${HEAD_Y - 78})`}
          />
        ))}
        <Olho cx={-95} r={rosto} pele={pele} />
        <Olho cx={95} r={rosto} pele={pele} />
        {/* nariz */}
        <ellipse cx={8} cy={HEAD_Y + 70} rx={22} ry={16} fill={escurece(d.pele, 0.8)} />
        {/* boca */}
        {rosto.boca > 0.15 ? (
          <path d={`M -40 ${HEAD_Y + 130} Q 0 ${HEAD_Y + 125 + 60 * rosto.boca} 40 ${HEAD_Y + 130} Z`} fill="#5a1e2a" />
        ) : (
          <path
            d={`M -36 ${HEAD_Y + 135 + rosto.canto * 6} Q 0 ${HEAD_Y + 135 + rosto.sorriso * 26} 40 ${HEAD_Y + 135 - rosto.canto * 14}`}
            stroke="#3a1f26"
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </g>
    </g>
  );
};
