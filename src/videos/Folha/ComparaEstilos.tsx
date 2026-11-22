import { AbsoluteFill } from "remotion";
import { Boneco2D, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { BonecoChibi, ROSTO_CHIBI } from "../../estilo2d/chibi/BonecoChibi";
import { RuaTexturizada, Textura } from "../../estilo2d/chibi/RuaTexturizada";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";

/** Lucas e Diego nos dois estilos, sobre o mesmo cenário novo (para decidir o visual) */
const Titulo: React.FC<{ x: number; letra: string; texto: string; sub: string }> = ({ x, letra, texto, sub }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={40} y={60} width={1000} height={190} rx={30} fill="#1d1424" opacity={0.82} />
    <circle cx={130} cy={155} r={62} fill="#ff9b2f" />
    <text x={130} y={178} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={72} fill="#fff">
      {letra}
    </text>
    <text x={220} y={145} fontFamily="Fredoka" fontWeight={700} fontSize={56} fill="#fff">
      {texto}
    </text>
    <text x={220} y={212} fontFamily="Fredoka" fontWeight={700} fontSize={34} fill="#ffd23f">
      {sub}
    </text>
  </g>
);

export const ComparaEstilos: React.FC = () => (
  <AbsoluteFill style={{ background: "#1d1424" }}>
    <svg width={2160} height={1920} viewBox="0 0 2160 1920">
      <defs>
        <clipPath id="painelA">
          <rect x={0} y={0} width={1080} height={1920} />
        </clipPath>
        <clipPath id="painelB">
          <rect x={1080} y={0} width={1080} height={1920} />
        </clipPath>
      </defs>
      <g clipPath="url(#painelA)">
        <RuaTexturizada chao={1560} />
        <BonecoChibi id="la" d={LUCAS} pose={{ x: 300, y: 1640, escala: 0.7 }} rosto={{ ...ROSTO_CHIBI, sorriso: 0.6, olhar: [0.4, 0] }} />
        <BonecoChibi id="da" d={DIEGO} pose={{ x: 790, y: 1660, escala: 0.7, cruzado: 1 }} rosto={{ ...ROSTO_CHIBI, palpebra: 0.45, sobrancelha: 6, sorriso: 0.2, canto: 1, olhar: [-0.5, 0.2] }} />
        <Textura />
      </g>
      <g clipPath="url(#painelB)">
        <g transform="translate(1080 0)">
          <RuaTexturizada chao={1560} />
          <Boneco2D id="lb" d={LUCAS} pose={{ ...POSE_BASE, x: 300, y: 1640, escala: 0.62, vira: 0.3 }} rosto={ROSTO_BASE} />
          <Boneco2D id="db" d={DIEGO} pose={{ ...POSE_BASE, x: 790, y: 1660, escala: 0.62, cruzado: 1, vira: -0.3 }} rosto={{ ...ROSTO_BASE, olhos: 0.6, canto: 0.8, sorriso: 0.35, sobrancelha: 6 }} />
          <Textura />
        </g>
      </g>
      <rect x={1074} y={0} width={12} height={1920} fill="#1d1424" />
      <Titulo x={0} letra="A" texto="Estilo da referência" sub="chibi, sem contorno, olhos pequenos" />
      <Titulo x={1080} letra="B" texto="Estilo atual" sub="com cenário e acabamento novos" />
    </svg>
  </AbsoluteFill>
);
