import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { LegendaPalavra } from "../../estilo2d/UI";
import "../../estilo/fontes";
import { C01, C02, C03, C04, C05, C12 } from "./CenasA";
import { C06, C07, C08, C09, C10, C11 } from "./CenasB";
import { DURACAO, LEGENDAS, Som } from "./comum";

export { DURACAO };

/**
 * "O homem que vendeu a Torre Eiffel" (60 qps, 81,24 s). Roteiro, cenas e direção: producao/torre-eiffel/.
 * Cada cena recebe o quadro global; os tempos seguem 01-cenas.json + ajustes da 02-direcao.md (golpes na palavra).
 */
const CENAS: [number, React.FC<{ f: number }>][] = [
  [0, C01],
  [252, C02],
  [540, C03],
  [840, C04],
  [1305, C05],
  [1431, C06],
  [1985, C07],
  [2434, C08],
  [3230, C09],
  [4056, C10],
  [4342, C11],
  [4556, C12],
];

export const TorreEiffel: React.FC = () => {
  const f = useCurrentFrame();
  const Cena = [...CENAS].reverse().find(([de]) => f >= de)![1];
  // volume do jazz (0..1 relativo): ~50% sob a voz, pausa na pergunta, some na C09
  const vj = (q: number) =>
    interpolate(q, [0, 330, 342, 500, 540, 560, 840, 1305, 1314, 1420, 1431], [0.11, 0.11, 0.08, 0.08, 0.07, 0.06, 0.11, 0.11, 0, 0, 0.11], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cena f={f} />
      <LegendaPalavra palavras={LEGENDAS} y={1660} tamanho={88} />
      {/* narração */}
      <Html5Audio src={staticFile("narracao/torre-eiffel.mp3")} volume={1} />
      {/* música */}
      <Sequence durationInFrames={1431}>
        <Html5Audio src={staticFile("musica/jazz-1925.wav")} volume={(q) => vj(q)} />
      </Sequence>
      <Sequence from={1431} durationInFrames={1836 - 1431}>
        <Html5Audio src={staticFile("musica/jazz-1925-radio.wav")} volume={0.12} trimBefore={60 * 24} />
      </Sequence>
      <Sequence from={1836} durationInFrames={3230 - 1836}>
        <Html5Audio src={staticFile("musica/jazz-1925.wav")} trimBefore={60 * 30} volume={(q) => interpolate(q + 1836, [1836, 2434, 2700, 3200, 3214, 3230], [0.1, 0.1, 0.08, 0.08, 0.04, 0], { extrapolateRight: "clamp" })} />
      </Sequence>
      <Sequence from={3230} durationInFrames={4056 - 3230}>
        <Html5Audio src={staticFile("musica/drone-mar.wav")} volume={(q) => interpolate(q, [0, 12, 800, 826], [0, 0.22, 0.22, 0], { extrapolateRight: "clamp" })} loop />
      </Sequence>
      <Sequence from={4056}>
        <Html5Audio src={staticFile("musica/jazz-1925-rapido.wav")} volume={(q) => interpolate(q + 4056, [4056, 4342, 4360, 4556, 4570, 4800, 4874], [0.1, 0.1, 0.05, 0.05, 0.1, 0.1, 0.03], { extrapolateRight: "clamp" })} />
      </Sequence>
      {/* efeitos */}
      <Som src="papel" de={6} volume={0.5} />
      <Som src="cortina" de={172} volume={0.45} />
      <Som src="carimbo" de={216} volume={0.5} />
      <Som src="whoosh" de={248} volume={0.35} />
      <Som src="gargalhada" de={342} volume={0.45} />
      <Som src="taca" de={420} volume={0.35} />
      <Som src="sanfona" de={540} volume={0.12} />
      <Som src="buzina" de={560} volume={0.3} />
      <Som src="whoosh" de={690} volume={0.45} />
      {[864, 874, 884, 894, 904, 914].map((d) => (
        <Som key={d} src="cadeira" de={d} volume={0.25} />
      ))}
      {new Array(15).fill(0).map((_, i) => (
        <Som key={i} src="tic" de={1098 + i * 6} volume={0.25} />
      ))}
      <Som src="clang" de={1272} volume={0.5} />
      {[1314, 1322, 1330, 1338].map((d) => (
        <Som key={d} src="pop" de={d} volume={0.4} />
      ))}
      <Sequence from={1431} durationInFrames={400}>
        <Html5Audio src={staticFile("sfx/projetor.wav")} volume={0.12} loop />
      </Sequence>
      <Som src="carimbo" de={1673} volume={0.7} />
      <Som src="rangido" de={1765} volume={0.35} />
      <Som src="moedas" de={1768} volume={0.35} />
      <Som src="shh" de={1928} volume={0.35} />
      <Som src="motor" de={1986} volume={0.35} />
      <Som src="buzina" de={2050} volume={0.3} />
      <Som src="lapis" de={2364} volume={0.4} />
      <Som src="aperto" de={2562} volume={0.5} />
      <Som src="whoosh" de={2700} volume={0.35} />
      <Som src="notas" de={2746} volume={0.45} />
      <Som src="kaching" de={3060} volume={0.45} />
      <Som src="bolhas" de={3360} volume={0.4} />
      <Som src="nhac" de={3420} volume={0.6} />
      <Som src="puf" de={3535} volume={0.55} />
      <Som src="carimbo" de={3870} volume={0.7} />
      <Som src="flip" de={4195} volume={0.5} />
      <Som src="apito" de={4259} volume={0.35} />
      <Som src="whoosh" de={4335} volume={0.35} />
      <Som src="ahem" de={4416} volume={0.4} />
      <Sequence from={4460} durationInFrames={106}>
        <Html5Audio src={staticFile("sfx/grilo.wav")} volume={0.3} />
      </Sequence>
      <Som src="relogio" de={4562} volume={0.35} />
      <Som src="papel" de={4720} volume={0.5} />
    </AbsoluteFill>
  );
};
