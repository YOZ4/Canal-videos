import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { BIA, DIEGO, LUCAS } from "../../estilo2d/personagens";

/** conferência: Lucas músculo 0 / 0.45 / 1, perfil forte, Diego com olheiras, Bia */
export const FolhaTreino: React.FC = () => (
  <AbsoluteFill style={{ background: "#d9d6d0" }}>
    <svg width={3000} height={1300}>
      {[0, 0.45, 1].map((m, i) => (
        <Boneco2D key={m} id={`l${i}`} d={LUCAS} pose={{ ...POSE_BASE, x: 230 + i * 440, y: 1240, escala: 0.82, musculo: m }} rosto={ROSTO_BASE} />
      ))}
      <Boneco2D id="lp" d={LUCAS} pose={{ ...PERFIL_BASE, x: 1550, y: 1240, escala: 0.82, musculo: 1, bracoD: { ombro: 80, cotovelo: 0 } }} rosto={ROSTO_BASE} />
      <Boneco2D id="d" d={DIEGO} pose={{ ...POSE_BASE, x: 2050, y: 1240, escala: 0.82, cruzado: 1 }} rosto={{ ...ROSTO_BASE, olhos: 0.55, canto: 0.3, olheiras: 1, sobrancelha: -6 }} />
      <Boneco2D id="b" d={BIA} pose={{ ...POSE_BASE, x: 2600, y: 1240, escala: 0.8, vira: -0.3 }} rosto={{ ...ROSTO_BASE, olhos: 1.15, sorriso: 0.8, boca: 0.3 }} />
    </svg>
  </AbsoluteFill>
);
