import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { poseCorrida, type EstiloCorrida } from "../../estilo2d/corrida";
import { LUCAS } from "../../estilo2d/personagens";

/** 8 fases do ciclo de corrida lado a lado, por estilo (conferência) */
export const FolhaCorrida: React.FC = () => (
  <AbsoluteFill style={{ background: "#d9d6d0" }}>
    <svg width={3200} height={2400}>
      {(["normal", "rapida", "ninja", "panico"] as EstiloCorrida[]).map((e, r) => (
        <g key={e}>
          <line x1={0} x2={3200} y1={560 + r * 600} y2={560 + r * 600} stroke="#888" strokeWidth={4} />
          <text x={20} y={80 + r * 600} fontFamily="Fredoka" fontSize={50} fill="#333">
            {e}
          </text>
          {new Array(8).fill(0).map((_, i) => {
            const c = poseCorrida(i / 8, e);
            return <Boneco2D key={i} id={`${e}${i}`} d={LUCAS} pose={{ ...PERFIL_BASE, ...c, x: 200 + i * 390, y: 560 + r * 600, escala: 0.42 }} rosto={ROSTO_BASE} />;
          })}
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
