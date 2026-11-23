import { AbsoluteFill, Easing, Freeze, Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import { Diretor, type Efeito, type Plano } from "../../estilo2d/Diretor";
import { CenaBrutal, CenaLuta, CenaNinja, CenaPulo } from "../Movimento/TesteMovimento2";
import { LutaTeste } from "../Luta/LutaTeste";

/**
 * Testes da direção de câmera (15 s cada, 30 qps). Movimentos reaproveitados dos testes aprovados
 * (TesteMovimento2 e LutaTeste); a câmera nova vem do Diretor (src/estilo2d/Diretor.tsx).
 */
export const DURACAO_CAM = 450;
const sai = Easing.out(Easing.cubic);

// ---------------- 1) corrida, pulo e acrobacia ----------------
// Pulo 0–150 (impulso 64, pouso ~98) · Ninja 150–270 (freada 236) · Brutal 270–420 (freada 366) · pose final congelada 420–450
const PLANOS_ACRO: Plano[] = [
  { de: 0, ate: 26, zoom: [2.3, 1.15], foco: [0.5, 0.8], curva: sai }, // começa nos pés e abre
  { de: 26, ate: 62, zoom: [1.15, 1.38], foco: [0.5, 0.62] }, // push: tensão antes do pulo
  { de: 62, ate: 94, zoom: [1.38, 0.9], rot: [0, -6], y: [0, 50], foco: [0.5, 0.55], curva: sai }, // pulo: abre + holandês
  { de: 94, ate: 150, zoom: [1.12, 1.25], rot: [-3, 0], foco: [0.5, 0.6] },
  { de: 150, ate: 230, zoom: [1.3, 1.45], rot: [6, 4], foco: [0.5, 0.6] }, // ninja: holandês acompanhando
  { de: 230, ate: 270, zoom: [1.45, 1.75], rot: [5, 0], foco: [0.5, 0.55], curva: sai },
  { de: 270, ate: 360, zoom: [1.4, 1.22], y: [-60, -20], foco: [0.5, 0.86] }, // brutal: câmera baixa, pés no chão
  { de: 360, ate: 450, zoom: [1.3, 0.96], foco: [0.22, 0.6], curva: sai },
];
const EFEITOS_ACRO: Efeito[] = [
  { tipo: "velocidade", de: 6, ate: 60, dir: 1, forca: 0.6 },
  { tipo: "crash", em: 98, forca: 0.4 },
  { tipo: "treme", em: 98, dur: 8, forca: 16 },
  { tipo: "chicote", em: 150, dir: -1 },
  { tipo: "velocidade", de: 156, ate: 228, dir: 1 },
  { tipo: "crash", em: 236, forca: 0.3 },
  { tipo: "faixas", de: 236, ate: 266 },
  { tipo: "chicote", em: 270, dir: -1 },
  { tipo: "treme", em: 292, dur: 5, forca: 8 },
  { tipo: "treme", em: 316, dur: 5, forca: 9 },
  { tipo: "treme", em: 340, dur: 5, forca: 10 },
  { tipo: "crash", em: 366, forca: 0.45, foco: [0.22, 0.55] },
  { tipo: "treme", em: 366, dur: 12, forca: 22 },
  { tipo: "flash", em: 366, dur: 4 },
  { tipo: "faixas", de: 382, ate: 460 },
];

export const TesteCameraAcrobacia: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Diretor planos={PLANOS_ACRO} efeitos={EFEITOS_ACRO} fundo="#efe4d2">
      <Sequence durationInFrames={150}>
        <CenaPulo semSelo />
      </Sequence>
      <Sequence from={150} durationInFrames={120}>
        <CenaNinja semSelo />
      </Sequence>
      <Sequence from={270} durationInFrames={150}>
        <CenaBrutal semSelo />
      </Sequence>
      <Sequence from={420} durationInFrames={30}>
        <Freeze frame={149}>
          <CenaBrutal semSelo />
        </Freeze>
      </Sequence>
    </Diretor>
    <Html5Audio src={staticFile("musica/trilha-leve.wav")} volume={(f) => interpolate(f, [0, 360, 366, 380, 450], [0.1, 0.1, 0.0, 0.0, 0.08], { extrapolateRight: "clamp" })} />
    <Sequence from={366} layout="none">
      <Html5Audio src={staticFile("sfx/impacto.wav")} volume={0.5} />
    </Sequence>
    <Sequence from={148} layout="none">
      <Html5Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
    </Sequence>
    <Sequence from={268} layout="none">
      <Html5Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
    </Sequence>
  </AbsoluteFill>
);

// ---------------- 2) luta ----------------
// Luta do TesteMovimento2 0–215 (choque 65 com hit-stop) · trecho 100–335 do LutaTeste em 215–450
// (dash 215, choque 233, corte 257, pouso 279, fogo 290, lâmina 340, olhos 377/385, choque final 407)
const PLANOS_LUTA: Plano[] = [
  { de: 0, ate: 40, zoom: [1.6, 1.25], rot: [0, 3], foco: [0.5, 0.56], curva: sai }, // encarada
  { de: 40, ate: 64, zoom: [1.25, 1.5], rot: [3, 0], foco: [0.5, 0.56], curva: Easing.in(Easing.cubic) }, // investida
  { de: 71, ate: 120, zoom: [1.35, 1.0], rot: [5, -3], foco: [0.5, 0.55], curva: sai },
  { de: 120, ate: 215, zoom: [1.0, 1.22], rot: [-4, 4], foco: [0.5, 0.55] },
  { de: 215, ate: 233, zoom: [1.0, 1.12], foco: [0.5, 0.55], curva: Easing.in(Easing.cubic) },
  { de: 233, ate: 290, zoom: [1.15, 1.0], rot: [-3, 2], foco: [0.5, 0.55], curva: sai },
  { de: 290, ate: 377, zoom: [1.05, 1.15], rot: [2, -2], foco: [0.5, 0.55] },
  { de: 377, ate: 405, zoom: [1.0, 1.06], foco: [0.5, 0.5] },
  { de: 410, ate: 450, zoom: [1.15, 0.95], rot: [-5, 0], foco: [0.5, 0.55], curva: sai },
];
const EFEITOS_LUTA: Efeito[] = [
  { tipo: "faixas", de: 0, ate: 50 },
  { tipo: "crash", em: 65, forca: 0.45 },
  { tipo: "treme", em: 65, dur: 10, forca: 20 },
  { tipo: "inverte", em: 65, dur: 2 },
  { tipo: "velocidade", de: 120, ate: 170, dir: -1, forca: 0.7 },
  { tipo: "chicote", em: 215, dir: 1 },
  { tipo: "crash", em: 233, forca: 0.3 },
  { tipo: "treme", em: 233, dur: 8, forca: 14 },
  { tipo: "crash", em: 279, forca: 0.22 },
  { tipo: "faixas", de: 290, ate: 340 },
  { tipo: "faixas", de: 377, ate: 400, tam: 260 },
  { tipo: "crash", em: 407, forca: 0.5 },
  { tipo: "treme", em: 407, dur: 14, forca: 24 },
  { tipo: "flash", em: 407, dur: 4 },
];

export const TesteCameraLuta: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Diretor planos={PLANOS_LUTA} efeitos={EFEITOS_LUTA} fundo="#efe4d2">
      <Sequence durationInFrames={215}>
        <CenaLuta semSelo />
      </Sequence>
      <Sequence from={215} durationInFrames={235}>
        <Sequence from={-100}>
          <LutaTeste />
        </Sequence>
      </Sequence>
    </Diretor>
    <Sequence durationInFrames={215}>
      <Html5Audio
        src={staticFile("musica/trilha-luta.wav")}
        volume={(g) => interpolate(g, [0, 40, 58, 65, 75, 200, 215], [0.1, 0.12, 0.02, 0.0, 0.1, 0.1, 0.0], { extrapolateRight: "clamp" })}
      />
    </Sequence>
    <Sequence from={213} layout="none">
      <Html5Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} />
    </Sequence>
  </AbsoluteFill>
);
