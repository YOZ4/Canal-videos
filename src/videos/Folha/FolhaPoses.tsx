import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { andarPerfil } from "../../estilo2d/anim";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";

/** Folha de poses: gestos de mão e vista de perfil (para conferência) */
export const FolhaPoses: React.FC = () => {
  const w = andarPerfil(6);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#8b82c4,#4c3f7c)" }}>
      <svg width={2600} height={1400} viewBox="0 0 2600 1400">
        <Boneco2D id="a" d={LUCAS} pose={{ ...POSE_BASE, x: 260, y: 1300, escala: 0.85, bracoE: { ombro: 100, cotovelo: 50 }, maoE: "aberta", bracoD: { ombro: 90, cotovelo: 0 }, maoD: "aponta" }} rosto={ROSTO_BASE} />
        <Boneco2D id="b" d={LUCAS} pose={{ ...POSE_BASE, x: 760, y: 1300, escala: 0.85, bracoE: { ombro: 30, cotovelo: -100 }, maoE: "punho", bracoD: { ombro: 45, cotovelo: -120 }, maoD: "joia" }} rosto={{ ...ROSTO_BASE, sorriso: 1 }} />
        <Boneco2D id="c" d={LUCAS} pose={{ ...PERFIL_BASE, x: 1250, y: 1300, escala: 0.85 }} rosto={ROSTO_BASE} />
        <Boneco2D id="d" d={LUCAS} pose={{ ...PERFIL_BASE, x: 1700, y: 1300, escala: 0.85, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: w.bracoD, inclina: w.inclina }} rosto={ROSTO_BASE} />
        <Boneco2D id="e" d={DIEGO} pose={{ ...PERFIL_BASE, x: 2250, y: 1300, escala: 0.85, lado: -1, bracoD: { ombro: 80, cotovelo: 10 }, maoD: "aponta" }} rosto={{ ...ROSTO_BASE, olhos: 0.6, canto: 0.8 }} />
      </svg>
    </AbsoluteFill>
  );
};
