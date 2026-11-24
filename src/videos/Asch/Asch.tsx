import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile } from "remotion";
import { C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11 } from "./cenas";
import { Legenda } from "./hud";
import { CENA, DURACAO, FPS } from "./tempo";

export { DURACAO };

/**
 * "Experimento de Asch" — Roteiro 1 (produção). 1080×1920, 60 qps, 79,80 s. Cenas C01–C11 nos tempos do roteiro.
 * Plano e revisões: producao/asch/. Áudio sintetizado: python3 scripts/gerar_asch_audio.py
 */
const CENAS: [keyof typeof CENA, React.FC<{ t0: number }>][] = [
  ["C01", C01],
  ["C02", C02],
  ["C03", C03],
  ["C04", C04],
  ["C05", C05],
  ["C06", C06],
  ["C07", C07],
  ["C08", C08],
  ["C09", C09],
  ["C10", C10],
  ["C11", C11],
];
const ORDEM = Object.keys(CENA) as (keyof typeof CENA)[];

/** efeitos sonoros: [segundo, arquivo, volume, duração máx (s)?] — mapa de sons do roteiro */
const SFX: [number, string, number, number?][] = [
  [2.2, "as-papel", 0.5],
  [2.2, "as-whoosh-grave", 0.55],
  [5.0, "as-tic", 0.35],
  [5.27, "as-tic", 0.3],
  [8.1, "as-risadinha", 0.45],
  [10.5, "as-relogio", 0.35, 4.6],
  [19.2, "as-giz", 0.5],
  [22.5, "pop", 0.45],
  [24.8, "as-papel", 0.3],
  [26.5, "as-papel", 0.45],
  [28.7, "as-papel", 0.3],
  [30.2, "as-cadeiras", 0.55],
  [33.6, "as-coracao", 0.5, 4.6],
  [36.6, "as-cochicho", 0.45],
  [38.2, "as-coracao-rapido", 0.5, 4.8],
  [43.0, "impacto", 0.55],
  [46.2, "as-drone", 0.0],
  [47.3, "as-carimbo", 0.4],
  [47.42, "as-carimbo", 0.38],
  [47.54, "as-carimbo", 0.36],
  [47.66, "as-carimbo", 0.36],
  [47.78, "as-carimbo", 0.36],
  [47.9, "as-carimbo", 0.36],
  [48.02, "as-carimbo", 0.38],
  [54.9, "as-risadas", 0.35],
  [58.1, "brilho", 0.45],
  [64.0, "as-pop-grave", 0.5],
  [64.23, "as-pop-grave", 0.5],
  [64.47, "as-pop-grave", 0.5],
  [65.6, "pop", 0.5],
  [71.3, "as-acorde", 0.45],
  [74.4, "as-papel", 0.4],
  [78.5, "as-relogio", 0.3],
];

export const Asch: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CENAS.map(([id, Cena]) => {
      const de = CENA[id];
      const ate = CENA[ORDEM[ORDEM.indexOf(id) + 1]];
      return (
        <Sequence key={id} from={de} durationInFrames={ate - de}>
          <Cena t0={de} />
        </Sequence>
      );
    })}
    <Legenda y={1600} />
    <Html5Audio src={staticFile("narracao/asch.mp3")} volume={1} />
    <Html5Audio src={staticFile("musica/asch.wav")} volume={(f) => interpolate(f, [0, 30, DURACAO - 20, DURACAO], [0, 0.16, 0.16, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    {SFX.filter(([, , v]) => v > 0).map(([s, src, vol, max], i) => (
      <Sequence key={i} from={Math.round(s * FPS)} durationInFrames={max ? Math.round(max * FPS) : undefined} layout="none">
        <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
