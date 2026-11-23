import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, type Pose } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { AuraForte } from "../../estilo2d/Aura";
import { DIEGO, LUCAS_FURIA, LUCAS_PODER } from "../../estilo2d/personagens";

/** Folha do Lucas em fúria verde: 0 = frente, 1 = perfil com aura, 2 = meio da transformação, 3 = lado a lado com o Diego */
const CEL = { luz: -160, sombra: 34, forca: 0.6, recorte: 10, corRecorte: "#b6ff4a" };
const AURA = { cor: "#5cff2e", clara: "#e4ffb0" };
export const FolhaFuria: React.FC = () => {
  const f = useCurrentFrame();
  const furia = { ...ROSTO_BASE, olhos: 0.9, sobrancelha: 30, boca: 0.7, sorriso: -0.4 };
  const grande: Pose = { ...POSE_BASE, x: 540, y: CHAO_Y + 200, escala: 1.15, largura: 1.3, biceps: 1, agacha: 40, bracoE: { ombro: 40, cotovelo: -60 }, bracoD: { ombro: 40, cotovelo: -60 }, maoE: "punho", maoD: "punho", peE: { dx: -60, dy: 0 }, peD: { dx: 60, dy: 0 } };
  return (
    <AbsoluteFill style={{ background: "#1b2a22" }}>
      <svg width={1080} height={1920}>
        {f === 0 ? <Boneco2D id="a" d={LUCAS_FURIA} pose={grande} rosto={furia} poder={1} cel={CEL} /> : null}
        {f === 1 ? (
          <>
            <AuraForte x={540} chao={CHAO_Y + 200} altura={1500} f={10} forca={1} caos={0.6} cor={AURA.cor} clara={AURA.clara} id="au" />
            <Boneco2D id="b" d={LUCAS_FURIA} pose={{ ...PERFIL_BASE, x: 520, y: CHAO_Y + 200, escala: 1.15, largura: 1.25, biceps: 1, agacha: 50, inclina: 12, bracoD: { ombro: 20, cotovelo: 60 }, bracoE: { ombro: -10, cotovelo: 50 }, maoD: "punho", maoE: "punho" }} rosto={furia} poder={1} cel={CEL} />
          </>
        ) : null}
        {f === 2 ? <Boneco2D id="c" d={LUCAS_PODER} pose={{ ...POSE_BASE, x: 540, y: CHAO_Y, escala: 0.9 }} rosto={{ ...ROSTO_BASE, olhos: 1.1, sobrancelha: -6 }} poder={0.4} cel={CEL} /> : null}
        {f === 3 ? (
          <>
            <Boneco2D id="d1" d={LUCAS_FURIA} pose={{ ...grande, x: 380, escala: 1.0 }} rosto={furia} poder={1} cel={CEL} />
            <Boneco2D id="d2" d={DIEGO} pose={{ ...PERFIL_BASE, x: 820, y: CHAO_Y + 200, escala: 0.5, lado: -1 }} rosto={{ ...ROSTO_BASE, olhos: 1.1, olhar: [0, -1] }} cel={CEL} />
          </>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
