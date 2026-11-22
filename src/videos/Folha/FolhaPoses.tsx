import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";

/** Folha de poses: frente, 3/4, perfil, gestos e muque (para conferência) */
export const FolhaPoses: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#8b82c4,#4c3f7c)" }}>
    <svg width={3000} height={1400} viewBox="0 0 3000 1400">
      <Boneco2D id="a" d={LUCAS} pose={{ ...POSE_BASE, x: 260, y: 1300, escala: 0.85 }} rosto={ROSTO_BASE} />
      <Boneco2D id="b" d={LUCAS} pose={{ ...POSE_BASE, x: 760, y: 1300, escala: 0.85, vira: 0.7, bracoD: { ombro: 60, cotovelo: -60 }, maoD: "joia" }} rosto={{ ...ROSTO_BASE, sorriso: 1 }} />
      <Boneco2D id="c" d={LUCAS} pose={{ ...PERFIL_BASE, x: 1250, y: 1300, escala: 0.85 }} rosto={ROSTO_BASE} />
      <Boneco2D id="d" d={LUCAS} pose={{ ...POSE_BASE, x: 1750, y: 1300, escala: 0.85, bracoD: { ombro: 92, cotovelo: 132 }, maoD: "punho", biceps: 1, cabeca: 8 }} rosto={{ ...ROSTO_BASE, sorriso: 0.8, canto: 0.6, sobrancelha: 10, olhar: [1, -0.4] }} />
      <Boneco2D id="e" d={DIEGO} pose={{ ...POSE_BASE, x: 2250, y: 1300, escala: 0.85, cruzado: 1, vira: -0.6 }} rosto={{ ...ROSTO_BASE, olhos: 0.6, canto: 0.8 }} />
      <Boneco2D id="f" d={DIEGO} pose={{ ...PERFIL_BASE, x: 2720, y: 1300, escala: 0.85, lado: -1 }} rosto={{ ...ROSTO_BASE, olhos: 0.6, canto: 0.8 }} />
    </svg>
  </AbsoluteFill>
);
