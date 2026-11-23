import { AbsoluteFill } from "remotion";
import { Boneco2D, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";

/** Folha de personagens renderizada (para conferir o visual) */
export const Folha: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#8b82c4,#4c3f7c)" }}>
    <svg width={1600} height={1500} viewBox="0 0 1600 1500">
      <Boneco2D id="l" d={LUCAS} pose={{ ...POSE_BASE, x: 430, y: 1290, escala: 0.95 }} rosto={ROSTO_BASE} />
      <Boneco2D
        id="d"
        d={DIEGO}
        pose={{ ...POSE_BASE, x: 1170, y: 1290, escala: 0.95, cruzado: 1 }}
        rosto={{ ...ROSTO_BASE, olhos: 0.55, canto: 0.8, sorriso: 0.35, sobrancelha: 6 }}
      />
    </svg>
  </AbsoluteFill>
);
