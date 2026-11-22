import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { DIEGO, LUCAS, type Design } from "../../estilo2d/personagens";

/** Folha de vistas (turnaround): frente, lado e costas de cada personagem */
const Linha: React.FC<{ d: Design; y: number; id: string; rosto: typeof ROSTO_BASE; cor: string }> = ({ d, y, id, rosto, cor }) => (
  <g>
    <rect x={40} y={y - 1180} width={2320} height={1200} rx={40} fill={cor} opacity={0.18} />
    <text x={80} y={y - 1100} fontFamily="Fredoka" fontWeight={700} fontSize={90} fill="#fff" stroke="#1d1424" strokeWidth={14} paintOrder="stroke">
      {d.nome.toUpperCase()}
    </text>
    {(["FRENTE", "LADO", "COSTAS"] as const).map((t, i) => (
      <text key={t} x={500 + i * 700} y={y + 0} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={54} fill="#fff" opacity={0.85}>
        {t}
      </text>
    ))}
    <Boneco2D id={`${id}f`} d={d} pose={{ ...POSE_BASE, x: 500, y: y - 70, escala: 0.82 }} rosto={rosto} />
    <Boneco2D id={`${id}l`} d={d} pose={{ ...PERFIL_BASE, x: 1180, y: y - 70, escala: 0.82 }} rosto={rosto} />
    <Boneco2D id={`${id}c`} d={d} pose={{ ...POSE_BASE, vista: "costas", x: 1900, y: y - 70, escala: 0.82 }} rosto={rosto} />
  </g>
);

export const FolhaVistas: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#8b82c4,#4c3f7c)" }}>
    <svg width={2400} height={2560} viewBox="0 0 2400 2560">
      <Linha d={LUCAS} y={1250} id="l" rosto={ROSTO_BASE} cor="#f4c531" />
      <Linha d={DIEGO} y={2500} id="d" rosto={{ ...ROSTO_BASE, olhos: 0.6, canto: 0.8, sorriso: 0.35, sobrancelha: 6 }} cor="#2f9e57" />
    </svg>
  </AbsoluteFill>
);
