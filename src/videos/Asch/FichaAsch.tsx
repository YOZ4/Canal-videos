import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { FILEIRA, ESTUDANTE, ZOMBADOR, PESQUISADOR } from "./elenco";

/** ficha de conferência do elenco do Asch (frente, perfil e costas) */
export const FichaAsch: React.FC = () => (
  <AbsoluteFill style={{ background: "#e9e2d6" }}>
    <svg width={2400} height={1400}>
      {[...FILEIRA, PESQUISADOR].map((d, i) => (
        <Boneco2D key={i} id={`fa${i}`} d={d} pose={{ ...POSE_BASE, x: 140 + i * 260, y: 700, escala: 0.45 }} rosto={ROSTO_BASE} />
      ))}
      <Boneco2D id="fp1" d={ESTUDANTE} pose={{ ...PERFIL_BASE, x: 300, y: 1360, escala: 0.45 }} rosto={ROSTO_BASE} />
      <Boneco2D id="fp2" d={ZOMBADOR} pose={{ ...PERFIL_BASE, x: 600, y: 1360, escala: 0.45, lado: -1 }} rosto={ROSTO_BASE} />
      <Boneco2D id="fp3" d={ESTUDANTE} pose={{ ...POSE_BASE, vista: "costas", x: 900, y: 1360, escala: 0.45 }} rosto={ROSTO_BASE} />
      <Boneco2D id="fp4" d={ZOMBADOR} pose={{ ...POSE_BASE, vira: 0.6, x: 1200, y: 1360, escala: 0.45 }} rosto={ROSTO_BASE} />
    </svg>
  </AbsoluteFill>
);
