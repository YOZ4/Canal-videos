import { random } from "remotion";

/**
 * Rua no estilo da referência: cores dessaturadas, casas, postes com fios,
 * placa de rua, calçada e asfalto com rachaduras, folhas secas, névoa.
 * Chão em y = chao. Ocupa x -400..1500.
 */
export const RuaTexturizada: React.FC<{ chao?: number; placa?: string }> = ({ chao = 1500, placa = "RUA SEGUNDA-FEIRA" }) => (
  <g>
    <defs>
      <linearGradient id="ruaCeu" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#c9ccd6" />
        <stop offset="1" stopColor="#dcd6cc" />
      </linearGradient>
      <filter id="ruaNevoa" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={3} />
      </filter>
    </defs>
    <rect x={-400} y={-400} width={1900} height={2800} fill="url(#ruaCeu)" />
    {/* nuvens suaves */}
    {[[150, 260, 1.2], [700, 180, 1], [980, 330, 0.8]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill="#e9e7ea" opacity={0.8}>
        <ellipse cx={0} cy={0} rx={160} ry={50} />
        <circle cx={-60} cy={-30} r={60} />
        <circle cx={40} cy={-50} r={75} />
      </g>
    ))}
    {/* casas ao fundo (mais claras = mais longe) */}
    <g opacity={0.75} filter="url(#ruaNevoa)">
      {new Array(7).fill(0).map((_, i) => {
        const x = -200 + i * 260;
        const h = 360 + random(`ch${i}`) * 220;
        const cor = ["#cfc6b8", "#c3c7cf", "#d6cbbd", "#bfc3c9"][i % 4];
        return (
          <g key={i}>
            <rect x={x} y={chao - 300 - h} width={230} height={h} fill={cor} />
            <path d={`M ${x - 12} ${chao - 300 - h} L ${x + 115} ${chao - 380 - h} L ${x + 242} ${chao - 300 - h} Z`} fill="#c98f7a" opacity={0.8} />
            {[0, 1].map((r) =>
              [0, 1].map((c) => <rect key={`${r}${c}`} x={x + 35 + c * 100} y={chao - 260 - h + r * 140} width={60} height={80} fill="#a9b3bf" opacity={0.8} />),
            )}
          </g>
        );
      })}
    </g>
    {/* casas da frente */}
    {new Array(5).fill(0).map((_, i) => {
      const x = -300 + i * 380;
      const h = 420 + random(`cf${i}`) * 160;
      const cor = ["#b9b2a7", "#a8adb6", "#bcb3a3", "#aeb4bb", "#b6ada0"][i];
      return (
        <g key={`f${i}`}>
          <rect x={x} y={chao - 140 - h} width={340} height={h + 10} fill={cor} />
          <rect x={x} y={chao - 140 - h} width={340} height={22} fill="#9f978c" />
          {[0, 1].map((c) => (
            <g key={c}>
              <rect x={x + 50 + c * 150} y={chao - 80 - h} width={90} height={120} fill="#7f8b98" />
              <rect x={x + 50 + c * 150} y={chao - 80 - h} width={90} height={14} fill="#c9c2b6" />
            </g>
          ))}
          <rect x={x + 130} y={chao - 330} width={80} height={190} fill="#8a7f72" />
        </g>
      );
    })}
    {/* poste, fios e placa */}
    <rect x={760} y={chao - 1100} width={20} height={1000} fill="#8f8b88" />
    <rect x={700} y={chao - 1090} width={140} height={14} fill="#8f8b88" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M -400 ${chao - 1060 + i * 22} Q 380 ${chao - 980 + i * 22} 770 ${chao - 1080 + i * 20} Q 1150 ${chao - 990 + i * 22} 1500 ${chao - 1050 + i * 22}`} stroke="#5f5a5a" strokeWidth={4} fill="none" opacity={0.7} />
    ))}
    <g transform={`translate(560 ${chao - 900}) rotate(-6)`}>
      <rect x={0} y={0} width={420} height={110} rx={10} fill="#2f4f8f" />
      <rect x={8} y={8} width={404} height={94} rx={8} fill="none" stroke="#e9eef5" strokeWidth={4} />
      <text x={210} y={46} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={26} fill="#e9eef5">
        {placa.split(" ")[0]}
      </text>
      <text x={210} y={86} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={40} fill="#e9eef5">
        {placa.split(" ").slice(1).join(" ")}
      </text>
    </g>
    {/* calçada */}
    <rect x={-400} y={chao - 150} width={1900} height={160} fill="#b9b4ad" />
    {new Array(10).fill(0).map((_, i) => (
      <rect key={i} x={-400 + i * 200} y={chao - 150} width={4} height={160} fill="#a39d95" />
    ))}
    <rect x={-400} y={chao} width={1900} height={22} fill="#8d8882" />
    {/* asfalto */}
    <rect x={-400} y={chao + 22} width={1900} height={1000} fill="#8e9199" />
    {[[100, 120, 220], [620, 260, 160], [900, 90, 120], [300, 420, 260]].map(([x, y, w], i) => (
      <path key={i} d={`M ${x} ${chao + y} l ${w * 0.3} 10 l ${w * 0.25} -8 l ${w * 0.45} 14`} stroke="#767982" strokeWidth={5} fill="none" />
    ))}
    <ellipse cx={420} cy={chao + 300} rx={90} ry={22} fill="#6f727a" />
    <ellipse cx={420} cy={chao + 300} rx={70} ry={14} fill="#62656d" />
    {/* folhas secas */}
    {new Array(14).fill(0).map((_, i) => (
      <ellipse key={i} cx={-300 + random(`fo${i}`) * 1700} cy={chao + 40 + random(`fy${i}`) * 500} rx={10} ry={5} fill={["#a86a3a", "#c48a4a", "#8a5a30"][i % 3]} transform={`rotate(${random(`fr${i}`) * 180} ${-300 + random(`fo${i}`) * 1700} ${chao + 40 + random(`fy${i}`) * 500})`} />
    ))}
    {/* névoa por cima do fundo */}
    <rect x={-400} y={chao - 700} width={1900} height={700} fill="#e6e1d8" opacity={0.18} />
  </g>
);

/** acabamento: granulado de papel + vinheta suave (por cima de tudo) */
export const Textura: React.FC<{ f?: number; w?: number; h?: number }> = ({ f = 0, w = 1080, h = 1920 }) => (
  <g pointerEvents="none">
    <defs>
      <filter id={`grao${f % 3}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 3} />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope={0.09} />
        </feComponentTransfer>
      </filter>
      <radialGradient id="vinhetaSuave" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.6" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#1d1424" stopOpacity={0.35} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={w} height={h} filter={`url(#grao${f % 3})`} />
    <rect x={0} y={0} width={w} height={h} fill="url(#vinhetaSuave)" />
  </g>
);
