import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { poseCorrida, poseCorridaFrente, type EstiloCorrida } from "../../estilo2d/corrida";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";

/** fases do ciclo de corrida: perfil (3 estilos) + frente + costas (conferência) */
export const FolhaCorrida: React.FC = () => (
  <AbsoluteFill style={{ background: "#d9d6d0" }}>
    <svg width={3200} height={3000}>
      {(["normal", "rapida", "ninja"] as EstiloCorrida[]).map((e, r) => (
        <g key={e}>
          <line x1={0} x2={3200} y1={560 + r * 600} y2={560 + r * 600} stroke="#888" strokeWidth={4} />
          <text x={20} y={80 + r * 600} fontFamily="Fredoka" fontSize={50} fill="#333">
            {e}
          </text>
          {new Array(8).fill(0).map((_, i) => {
            const c = poseCorrida(i / 8, e);
            return <Boneco2D key={i} id={`${e}${i}`} d={e === "ninja" ? DIEGO : LUCAS} pose={{ ...PERFIL_BASE, ...c, x: 200 + i * 390, y: 560 + r * 600, escala: 0.42 }} rosto={ROSTO_BASE} />;
          })}
        </g>
      ))}
      {(["frente", "costas"] as const).map((v, r) => (
        <g key={v}>
          <line x1={0} x2={3200} y1={2360 + r * 600} y2={2360 + r * 600} stroke="#888" strokeWidth={4} />
          <text x={20} y={1880 + r * 600} fontFamily="Fredoka" fontSize={50} fill="#333">
            {v}
          </text>
          {new Array(8).fill(0).map((_, i) => {
            const c = poseCorridaFrente(i / 8, "normal", 1, v === "costas");
            return <Boneco2D key={i} id={`${v}${i}`} d={LUCAS} pose={{ ...POSE_BASE, ...c, vista: v, x: 200 + i * 390, y: 2360 + r * 600 - c.sobe * 0.42, escala: 0.42 }} rosto={ROSTO_BASE} />;
          })}
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
