import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C01, C02, C03, C04, C05, C06 } from "./cenas1";
import { C07, C08, C09, C10, C11, C12 } from "./cenas2";
import { Legenda } from "./hud";
import { CENA, DURACAO, s2f } from "./tempo";

export { DURACAO };

/**
 * "Egito: a areia molhada" — Roteiro 1 (produção). 1080×1920, 60 qps, 75,55 s.
 * Cenas C01–C12 nos tempos do roteiro; transições: corte seco, chicote com borrão, luz azul, clarão, fade e loop.
 */

type Trans = "corte" | "chicote" | "flash" | "fade";
const ENTRADA: Record<string, Trans> = { C03: "chicote", C07: "chicote", C10: "flash", C12: "fade" };

/** embrulho da cena: aplica chicote (borrão + deslize) ou clarão na entrada */
const Cena: React.FC<{ de: number; ate: number; trans: Trans; children: React.ReactNode }> = ({ de, ate, trans, children }) => {
  const f = useCurrentFrame();
  let estilo: React.CSSProperties = {};
  if (trans === "chicote" && f < 8) {
    const t = 1 - f / 8;
    estilo = { filter: `blur(${t * 26}px)`, transform: `translateX(${t * 260}px)` };
  }
  if (trans === "fade") estilo = { opacity: interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" }) };
  return (
    <AbsoluteFill style={estilo}>
      {children}
      {trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 10], [1, 0], { extrapolateRight: "clamp" }) }} /> : null}
      {/* chicote de saída: últimos 4 quadros borram pro lado */}
      {ate - de > 10 ? null : null}
    </AbsoluteFill>
  );
};

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
  ["C12", C12],
];
const ORDEM = Object.keys(CENA) as (keyof typeof CENA)[];

/** efeitos sonoros (segundos do mapa de sons) */
const SFX: [number, string, number, number?][] = [
  [0.0, "eg-agua", 0.35, 2.2],
  [2.2, "whoosh", 0.45],
  [4.4, "whoosh", 0.3],
  [4.6, "pop", 0.4],
  [7.9, "eg-boing", 0.4],
  [12.4, "eg-tick", 0.3],
  [12.6, "eg-tick", 0.3],
  [12.8, "eg-tick", 0.3],
  [13.0, "eg-tick", 0.3],
  [13.2, "eg-tick", 0.3],
  [13.5, "eg-tick", 0.3],
  [13.8, "pop", 0.35],
  [15.2, "pop", 0.4],
  [17.4, "ronco", 0.45],
  [19.5, "eg-eco", 0.5],
  [19.5, "impacto", 0.35],
  [21.3, "eg-agua", 0.3, 1.1],
  [22.5, "eg-areia", 0.25, 3.0],
  [25.5, "eg-areia", 0.25, 3.0],
  [27.4, "brilho", 0.4],
  [29.0, "passo", 0.3],
  [29.4, "passo", 0.3],
  [29.8, "passo", 0.3],
  [30.2, "passo", 0.25],
  [31.5, "eg-wahwah", 0.4],
  [31.5, "eg-tick", 0.25],
  [31.9, "eg-tick", 0.25],
  [34.8, "eg-boing", 0.35],
  [37.1, "whoosh", 0.4],
  [41.2, "deslize", 0.45],
  [43.4, "whoosh", 0.4],
  [44.4, "impacto", 0.55],
  [45.1, "whoosh", 0.25],
  [56.8, "eg-tick", 0.3],
  [57.1, "eg-tick", 0.3],
  [57.4, "eg-tick", 0.3],
  [57.7, "eg-tick", 0.3],
  [58.0, "eg-tick", 0.3],
  [58.6, "pop", 0.35],
  [59.4, "whoosh", 0.3],
  [61.6, "eg-splash", 0.55],
  [62.6, "eg-glub", 0.5],
  [63.6, "eg-afunda", 0.45],
  [64.8, "brilho", 0.45],
  [74.0, "eg-carimbo", 0.6],
  [75.0, "eg-agua", 0.35, 0.55],
];

/** volume da música (o arquivo já tem as 4 partes do mapa); abaixa sob a fala */
const volMusica = (fr: number) => {
  const s = fr / 60;
  if (s >= 44.4 && s < 45.05) return 0.0; // "travou": música para
  if (s >= 64.8 && s < 68.3) return interpolate(s, [64.8, 65.3, 68.3], [0.2, 0.34, 0.26]);
  if (s >= 45.05 && s < 59.4) return 0.3;
  return 0.17;
};

export const Egito: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CENAS.map(([nome, Comp], i) => {
      const de = CENA[nome];
      const prox = ORDEM[ORDEM.indexOf(nome) + 1];
      const ate = CENA[prox];
      const trans = ENTRADA[nome] ?? "corte";
      const ini = trans === "fade" ? de - 12 : de;
      return (
        <Sequence key={nome} from={ini} durationInFrames={ate - ini} name={nome}>
          <Cena de={ini} ate={ate} trans={trans}>
            <Comp t0={ini} />
          </Cena>
        </Sequence>
      );
    })}
    {/* loop: os últimos quadros viram o 1º quadro do vídeo (close da água) */}
    <Sequence from={DURACAO - 24} durationInFrames={24} name="loop">
      <LoopFinal />
    </Sequence>
    <Legenda />
    <Html5Audio src={staticFile("narracao/egito.mp3")} />
    <Html5Audio src={staticFile("musica/egito.wav")} volume={(f) => volMusica(f)} />
    {SFX.map(([s, nome, vol, dur], i) => (
      <Sequence key={i} from={s2f(s)} durationInFrames={dur ? s2f(dur) : undefined} layout="none">
        <Html5Audio src={staticFile(`sfx/${nome}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const LoopFinal: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" }) }}>
      <C01 t0={-f} />
    </AbsoluteFill>
  );
};
