import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, alcancar, posCabeca, type Pose } from "../../estilo2d/Boneco2D";
import { COMERCIANTES_1, COMERCIANTES_2, LUSTIG, LUSTIG_RUA, POISSON, POISSON_RUA, POISSON_VERMELHO } from "../../estilo2d/personagens";

/** Folha dos personagens de 1925: 0 = Lustig/Poisson (com e sem chapéu), 1 = comerciantes grupo 1 e 2, 2 = perfis + "shh" */
export const Folha1925: React.FC = () => {
  const f = useCurrentFrame();
  const p = (x: number, y: number, e = 0.42): Pose => ({ ...POSE_BASE, x, y, escala: e });
  const shh0: Pose = { ...p(780, 1800, 0.6) };
  const boca = posCabeca(shh0);
  const shh: Pose = { ...shh0, bracoD: alcancar(shh0, "D", [boca[0] + 10, boca[1] + 60]), maoD: "aponta", maoNaFrente: "D" };
  return (
    <AbsoluteFill style={{ background: "#3a2a4a" }}>
      <svg width={1080} height={1920}>
        {f === 0 ? (
          <>
            <Boneco2D id="a" d={LUSTIG} pose={p(270, 900)} rosto={{ ...ROSTO_BASE, sorriso: 0.6, canto: 0.5, olhos: 0.8 }} />
            <Boneco2D id="b" d={LUSTIG_RUA} pose={p(800, 900)} rosto={ROSTO_BASE} />
            <Boneco2D id="c" d={POISSON} pose={p(270, 1800)} rosto={{ ...ROSTO_BASE, boca: 0.8, sorriso: 0.8, olhos: 0.5 }} />
            <Boneco2D id="d" d={POISSON_RUA} pose={p(800, 1800)} rosto={ROSTO_BASE} />
          </>
        ) : null}
        {f === 1 ? (
          <>
            {COMERCIANTES_1.map((d, i) => <Boneco2D key={i} id={`g1${i}`} d={d} pose={p(120 + i * 210, 900, 0.32)} rosto={ROSTO_BASE} />)}
            {COMERCIANTES_2.map((d, i) => <Boneco2D key={i} id={`g2${i}`} d={d} pose={p(120 + i * 210, 1800, 0.32)} rosto={ROSTO_BASE} />)}
          </>
        ) : null}
        {f === 2 ? (
          <>
            <Boneco2D id="e" d={LUSTIG_RUA} pose={{ ...PERFIL_BASE, x: 280, y: 900, escala: 0.42 }} rosto={ROSTO_BASE} />
            <Boneco2D id="f" d={POISSON_RUA} pose={{ ...PERFIL_BASE, x: 800, y: 900, escala: 0.42, lado: -1 }} rosto={ROSTO_BASE} />
            <Boneco2D id="g" d={POISSON_VERMELHO} pose={p(280, 1800, 0.6)} rosto={{ ...ROSTO_BASE, olhos: 0.5, sorriso: -0.3 }} />
            <Boneco2D id="h" d={LUSTIG} pose={shh} rosto={{ ...ROSTO_BASE, olhos: 0.55, sorriso: 0.5, canto: 0.6 }} />
          </>
        ) : null}
        {f === 2 ? <circle cx={boca[0] + 10} cy={boca[1] + 60} r={8} fill="red" /> : null}
      </svg>
    </AbsoluteFill>
  );
};
