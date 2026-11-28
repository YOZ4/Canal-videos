import { AbsoluteFill, Html5Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTE_ROTULO } from "../../estilo/fontes";
import { PoeiraFlutuante } from "../../estilo2d/Acabamento";
import { Textura } from "../../estilo2d/chibi/RuaTexturizada";
import * as C from "./Cenas";
import { DURACAO, LEGENDAS, cena } from "./tempo";

export { DURACAO };

const CENAS: [string, React.FC<{ de: number }>][] = [
  ["C01", C.C01],
  ["C02", C.C02],
  ["C03", C.C03],
  ["C04", C.C04],
  ["C05", C.C05],
  ["C06", C.C06],
  ["C07", C.C07],
  ["C08", C.C08],
  ["C09", C.C09],
  ["C10", C.C10],
  ["C11", C.C11],
  ["C12", C.C12],
];

/** legenda palavra por palavra; palavras-chave maiores, maiúsculas e amarelas */
const Legenda: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = LEGENDAS.find((w) => f >= w.de && f < w.ate);
  if (!p) return null;
  const sp = spring({ frame: f - p.de, fps, config: { damping: 12, stiffness: 320 }, durationInFrames: 12 });
  const tam = p.destaque ? 104 : 80;
  return (
    <div
      style={{
        position: "absolute",
        top: 1290,
        width: "100%",
        textAlign: "center",
        fontFamily: FONTE_ROTULO,
        fontWeight: 700,
        fontSize: tam,
        color: p.destaque ? "#ffd23f" : "#ffffff",
        textTransform: p.destaque ? "uppercase" : "none",
        WebkitTextStroke: `${Math.round(tam / 8.5)}px #1d1424`,
        paintOrder: "stroke fill",
        textShadow: "0 8px 0 rgba(29,20,36,0.55)",
        transform: `translateY(-50%) scale(${0.72 + 0.28 * sp})`,
      }}
    >
      {p.texto}
    </div>
  );
};

/** clarão branco (transição C10 → C11) */
const Clarao: React.FC<{ em: number }> = ({ em }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [em - 8, em, em + 14], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return o > 0 ? <AbsoluteFill style={{ background: "#fffbe8", opacity: o }} /> : null;
};

export const Treino: React.FC = () => {
  const c8 = cena("C08").de;
  const c11 = cena("C11").de;
  const c12 = cena("C12").de;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CENAS.map(([id, Comp]) => {
        const { de, ate } = cena(id);
        return (
          <Sequence key={id} from={de} durationInFrames={ate - de}>
            <Comp de={de} />
          </Sequence>
        );
      })}
      <Clarao em={c11} />
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1080} height={1920}>
          <PoeiraFlutuante quantidade={18} />
          <Textura />
        </svg>
      </AbsoluteFill>
      <Legenda />

      {/* narração */}
      <Html5Audio src={staticFile("narracao/treino-1-ano.mp3")} volume={1} />
      {/* música: batida (0–39.1) → drone (39.1–64.4) → épico (64.4–) → calma no quarto */}
      <Html5Audio src={staticFile("musica/treino-batida.wav")} volume={(f) => interpolate(f, [0, 20, c8 - 6, c8], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sequence from={c8 + 6} layout="none">
        <Html5Audio src={staticFile("musica/drone-explicacao.wav")} volume={(f) => interpolate(f, [0, 30, c11 - c8 - 30, c11 - c8], [0, 0.16, 0.16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
      <Sequence from={c11} layout="none">
        <Html5Audio src={staticFile("musica/treino-epico.wav")} volume={(f) => interpolate(f, [0, 6, c12 - c11 - 20, c12 - c11 + 40, DURACAO - c11 - 60, DURACAO - c11], [0, 0.17, 0.17, 0.05, 0.05, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
    </AbsoluteFill>
  );
};
