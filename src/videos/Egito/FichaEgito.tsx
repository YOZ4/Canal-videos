import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { CHEFE, DIEGO_EG, LUCAS_EG, TRABALHADORES } from "./elenco";

/** conferência do figurino egípcio */
export const FichaEgito: React.FC = () => {
  const lista = [LUCAS_EG, DIEGO_EG, CHEFE, TRABALHADORES[0], TRABALHADORES[3]];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#6fb4e8,#ffe3a8 60%,#f0cf8a 60%,#c99a52)" }}>
      <svg width={2400} height={1500} viewBox="0 0 2400 1500">
        {lista.map((d, i) => (
          <g key={i}>
            <Boneco2D id={`fe${i}`} d={d} pose={{ ...POSE_BASE, x: 240 + i * 480, y: 720, escala: 0.55, cruzado: d === DIEGO_EG ? 1 : 0 }} rosto={ROSTO_BASE} />
            <Boneco2D id={`fp${i}`} d={d} pose={{ ...PERFIL_BASE, x: 240 + i * 480, y: 1440, escala: 0.55, inclina: 14, bracoD: { ombro: 80, cotovelo: 10 }, bracoE: { ombro: 70, cotovelo: 20 } }} rosto={ROSTO_BASE} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
