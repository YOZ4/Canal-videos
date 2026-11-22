import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Boneco2D, POSE_BASE, ROSTO_BASE, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y, Praca } from "../../estilo2d/Cenario2D";
import { CURVA, andar, fala, k, kPose, kRosto, piscar, respira, tremor } from "../../estilo2d/anim";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Etiqueta, LegendaPalavra, Placar, Selo, frase } from "../../estilo2d/UI";

// ---------------- roteiro (frames a 30fps) ----------------
const CHICOTE = [92, 108] as const; // whip pan
const CORTE_2 = 170; // dois personagens
const PULO_SAI = 278;
const PULO_CAI = 316;
const CORTE_3 = 382; // close no Diego
export const DURACAO = 450;

const ESCALA = 0.62;
const PX_POR_METRO = (1220 * ESCALA) / 1.6;
const ALTURA_PULO = 1.2 * PX_POR_METRO;

const PALAVRAS = [
  ...frase("Esse é o *Lucas.*", 6, 92),
  ...frase("E esse é o *Diego.*", 100, 168),
  ...frase("O Diego apostou que o Lucas não pula *1 metro.*", 172, 254),
  ...frase("Ele agacha... e *PULA!*", 258, 314),
  ...frase("Um metro e *vinte!*", 318, 380),
  ...frase("O Diego ficou sem *palavras.*", 384, 450),
];

// ---------------- câmera ----------------
type Cam = { x: number; y: number; zoom: number };

const camera = (f: number): Cam => {
  if (f < CORTE_2) {
    const x = k(f, [
      [0, 620],
      [60, 800, CURVA.suave],
      [CHICOTE[0], 800],
      [CHICOTE[1], 2000, CURVA.suave],
    ]);
    const zoom = k(f, [
      [0, 1],
      [CHICOTE[0], 1.04],
      [CHICOTE[1], 1.04],
      [CORTE_2, 1.12],
    ]);
    return { x, y: 1060, zoom };
  }
  if (f < CORTE_3) {
    const x = k(f, [
      [CORTE_2, 1755],
      [250, 1755],
      [268, 1560, CURVA.suave],
    ]);
    const pulo = alturaPulo(f);
    const y = k(f, [
      [CORTE_2, 1060],
      [250, 1060],
      [268, 980, CURVA.suave],
    ]) - pulo * 0.45;
    const zoom = k(f, [
      [CORTE_2, 0.98],
      [250, 1.0],
      [268, 1.06, CURVA.suave],
      [PULO_CAI, 1.0],
      [CORTE_3, 1.08],
    ]);
    const sh = f >= PULO_CAI && f < PULO_CAI + 10 ? tremor(f, (PULO_CAI + 10 - f) * 2.2) : { x: 0, y: 0 };
    return { x: x + sh.x, y: y + sh.y, zoom };
  }
  const zoom = k(f, [
    [CORTE_3, 2.0],
    [DURACAO, 2.3, CURVA.sai],
  ]);
  const sh = f >= CORTE_3 + 2 && f < CORTE_3 + 12 ? tremor(f, (CORTE_3 + 12 - f) * 1.6) : { x: 0, y: 0 };
  return { x: 2000 + sh.x, y: 790 + sh.y, zoom };
};

const paraTela = (c: Cam, wx: number, wy: number) => ({
  x: (wx - c.x) * c.zoom + 540,
  y: (wy - c.y) * c.zoom + 960,
});

// ---------------- Lucas ----------------
const alturaPulo = (f: number) => {
  if (f < PULO_SAI || f > PULO_CAI) return 0;
  const t = (f - PULO_SAI) / (PULO_CAI - PULO_SAI);
  return 4 * ALTURA_PULO * t * (1 - t);
};

const L0: Pose = { ...POSE_BASE, escala: ESCALA, y: CHAO_Y };

const lucasPose = (f: number): Pose => {
  // --- cena 1: entra andando e acena ---
  if (f < CORTE_2) {
    const andando = f < 50;
    const w = andar(f, andando ? 1 : 0);
    const x = k(f, [
      [0, 260],
      [50, 800, CURVA.sai],
    ]);
    // parada com "freada": inclina pra frente e volta (follow-through)
    const inclina = andando
      ? 5 + w.balanco
      : k(f, [
          [50, 5],
          [56, 9, CURVA.sai],
          [64, -3, CURVA.suave],
          [72, 0, CURVA.suave],
        ]);
    const aceno = f >= 62 ? Math.sin((f - 62) * 0.55) * 22 : 0;
    const acenoBraco = k(f, [
      [58, 0],
      [66, 1, CURVA.exagera],
      [86, 1],
      [94, 0, CURVA.suave],
    ]);
    const base: Pose = {
      ...L0,
      x,
      y: CHAO_Y + (andando ? -w.bob * 0.4 : 0),
      inclina,
      cabeca: -inclina * 0.7 + (f >= 62 ? 5 : 0) * acenoBraco,
      peE: w.peE,
      peD: w.peD,
      bracoE: w.bracoE,
      bracoD: {
        ombro: w.bracoD.ombro * (1 - acenoBraco) + 150 * acenoBraco,
        cotovelo: w.bracoD.cotovelo * (1 - acenoBraco) + (25 + aceno) * acenoBraco,
      },
      estica: 1 + respira(f) * 0.006,
    };
    return base;
  }

  // --- cena 2/3: escuta o Diego e depois pula ---
  const x = 1500;
  const pulo = alturaPulo(f);
  const noAr = f >= PULO_SAI && f <= PULO_CAI;
  const tAr = noAr ? (f - PULO_SAI) / (PULO_CAI - PULO_SAI) : 0;

  const escuta: Pose = { ...L0, x, cabeca: 4, inclina: 2 };
  const agachado: Pose = {
    ...escuta,
    cabeca: 6,
    inclina: 0,
    agacha: 150,
    estica: 0.92,
    bracoE: { ombro: 40, cotovelo: -20 },
    bracoD: { ombro: 40, cotovelo: -20 },
  };
  const decolando: Pose = {
    ...escuta,
    cabeca: -4,
    inclina: 0,
    agacha: -10,
    estica: 1.2,
    bracoE: { ombro: 168, cotovelo: 6 },
    bracoD: { ombro: 168, cotovelo: 6 },
  };
  const encolhido: Pose = {
    ...decolando,
    estica: 1,
    peE: { dx: -20, dy: -150 },
    peD: { dx: 20, dy: -150 },
    bracoE: { ombro: 130, cotovelo: 30 },
    bracoD: { ombro: 130, cotovelo: 30 },
  };
  const caindo: Pose = { ...encolhido, estica: 1.08, peE: { dx: -10, dy: -40 }, peD: { dx: 10, dy: -40 }, bracoE: { ombro: 100, cotovelo: 20 }, bracoD: { ombro: 100, cotovelo: 20 } };
  const impacto: Pose = { ...agachado, estica: 0.78, agacha: 170, bracoE: { ombro: 70, cotovelo: -10 }, bracoD: { ombro: 70, cotovelo: -10 } };
  const vitoria: Pose = {
    ...escuta,
    cabeca: -6,
    inclina: 0,
    bracoE: { ombro: 150, cotovelo: -14 },
    bracoD: { ombro: 150, cotovelo: -14 },
  };

  let p = kPose(f, [
    [CORTE_2, escuta],
    [258, escuta],
    [272, agachado, CURVA.antecipa],
    [PULO_SAI, decolando, CURVA.sai],
    [PULO_SAI + 18, encolhido, CURVA.sai],
    [PULO_CAI - 2, caindo, CURVA.entra],
    [PULO_CAI + 3, impacto, CURVA.sai],
    [PULO_CAI + 22, escuta, CURVA.exagera],
    [340, vitoria, CURVA.exagera],
  ]);
  // aceno de vitória: braços balançando
  if (f > 340) {
    const v = Math.sin((f - 340) * 0.5) * 14;
    p = { ...p, bracoE: { ombro: p.bracoE.ombro + v, cotovelo: p.bracoE.cotovelo }, bracoD: { ombro: p.bracoD.ombro - v, cotovelo: p.bracoD.cotovelo }, estica: 1 + Math.abs(Math.sin((f - 340) * 0.25)) * 0.04 };
  }
  // aceno de cabeça "beleza" (238-252)
  const nod = f > 238 && f < 252 ? Math.sin(((f - 238) / 14) * Math.PI * 2) * 6 : 0;
  return { ...p, y: CHAO_Y - pulo, cabeca: p.cabeca + nod + (noAr ? -6 * (1 - tAr) : 0) };
};

const lucasRosto = (f: number): Rosto => {
  const feliz: Rosto = { ...ROSTO_BASE, sorriso: 0.9, boca: 0 };
  const sorrisao: Rosto = { ...ROSTO_BASE, sorriso: 1, boca: 0.55, olhos: 1.05 };
  const olhaDiego: Rosto = { ...ROSTO_BASE, olhar: [1, 0], sorriso: 0.3 };
  const preocupado: Rosto = { ...olhaDiego, olhos: 1.2, sobrancelha: -14, sobrancelhaY: 12, sorriso: -0.3 };
  const determinado: Rosto = { ...ROSTO_BASE, olhar: [0, 0], sobrancelha: 12, sobrancelhaY: -2, sorriso: 0.5 };
  const forca: Rosto = { ...ROSTO_BASE, olhos: 0.75, sobrancelha: 16, sorriso: -0.2, boca: 0.15 };
  const voando: Rosto = { ...ROSTO_BASE, olhos: 1.2, boca: 0.8, sorriso: 0.6, sobrancelhaY: 14 };

  const r = kRosto(f, [
    [0, ROSTO_BASE],
    [58, feliz],
    [66, sorrisao, CURVA.exagera],
    [94, feliz],
    [CORTE_2, olhaDiego],
    [222, olhaDiego],
    [228, preocupado, CURVA.exagera],
    [238, preocupado],
    [244, determinado, CURVA.exagera],
    [266, determinado],
    [272, forca],
    [PULO_SAI + 6, voando, CURVA.exagera],
    [PULO_CAI, voando],
    [PULO_CAI + 3, forca],
    [334, sorrisao, CURVA.exagera],
  ]);
  return { ...r, olhos: r.olhos * piscar(f, "lucas") };
};

// ---------------- Diego ----------------
const D0: Pose = { ...POSE_BASE, escala: ESCALA, y: CHAO_Y, x: 2000, cruzado: 1 };
const DIEGO_ROSTO: Rosto = { ...ROSTO_BASE, olhos: 0.55, canto: 0.8, sorriso: 0.35, sobrancelha: 6 };

const diegoPose = (f: number): Pose => {
  const apontando: Pose = {
    ...D0,
    cruzado: 0,
    inclina: -5,
    cabeca: -5,
    bracoE: { ombro: 84, cotovelo: 6 },
    bracoD: { ombro: 20, cotovelo: -60 },
  };
  const chocado: Pose = { ...D0, cruzado: 0, cabeca: 0, inclina: 0, bracoE: { ombro: 10, cotovelo: -4 }, bracoD: { ombro: 10, cotovelo: -4 }, estica: 1.03 };
  const p = kPose(f, [
    [0, D0],
    [114, D0],
    [120, { ...D0, cabeca: -7, inclina: -2 }, CURVA.exagera],
    [CORTE_2, { ...D0, cabeca: -4 }],
    [178, { ...D0, cabeca: -4 }],
    [186, apontando, CURVA.antecipaExagera],
    [244, apontando],
    [254, { ...D0, cabeca: -6 }, CURVA.suave],
    [CORTE_3, { ...D0, cabeca: -6 }],
    [CORTE_3 + 5, chocado, CURVA.exagera],
  ]);
  // dedo "batendo" enquanto fala
  const batida = f > 188 && f < 244 ? Math.sin(f * 0.6) * 6 : 0;
  return { ...p, bracoE: { ...p.bracoE, cotovelo: p.bracoE.cotovelo + batida }, estica: p.estica + respira(f, 20) * 0.006 };
};

const diegoRosto = (f: number): Rosto => {
  const sobeSobrancelha: Rosto = { ...DIEGO_ROSTO, sobrancelhaY: 16, canto: 1, olhar: [-0.4, 0] };
  const falando: Rosto = { ...DIEGO_ROSTO, olhos: 0.6, olhar: [-1, 0], sobrancelha: 10, canto: 0.6 };
  const chocado: Rosto = { ...ROSTO_BASE, olhos: 1.28, sobrancelha: -12, sobrancelhaY: 26, boca: 1, sorriso: 0, canto: 0, olhar: [-0.6, 0] };
  const r = kRosto(f, [
    [0, DIEGO_ROSTO],
    [114, DIEGO_ROSTO],
    [122, sobeSobrancelha, CURVA.exagera],
    [CORTE_2, sobeSobrancelha],
    [182, falando],
    [246, falando],
    [256, { ...DIEGO_ROSTO, olhar: [-1, 0] }],
    [CORTE_3, { ...DIEGO_ROSTO, olhar: [-1, 0] }],
    [CORTE_3 + 4, chocado, CURVA.exagera],
  ]);
  const boca = f >= 186 && f < 244 ? fala(f, "diego") : r.boca;
  return { ...r, boca, olhos: r.olhos * piscar(f, "diego") };
};

// ---------------- efeitos ----------------
const Poeira: React.FC<{ f: number; x: number }> = ({ f, x }) => {
  const t = (f - PULO_CAI) / 18;
  if (t < 0 || t > 1) return null;
  return (
    <g opacity={1 - t}>
      {[-1, 1].map((s) =>
        [0, 1, 2].map((i) => (
          <circle key={`${s}${i}`} cx={x + s * (60 + t * (140 + i * 60))} cy={CHAO_Y - 20 - i * 18 - t * 30} r={(22 + i * 8) * (0.6 + t)} fill="#efe6da" />
        )),
      )}
    </g>
  );
};

const Regua: React.FC<{ f: number; x: number }> = ({ f, x }) => {
  const aparece = k(f, [
    [262, 0],
    [272, 1, CURVA.exagera],
    [370, 1],
    [380, 0],
  ]);
  if (aparece <= 0.01) return null;
  const topo = CHAO_Y - 1.3 * PX_POR_METRO;
  const atual = CHAO_Y - alturaPulo(f);
  return (
    <g opacity={aparece} transform={`translate(${x} 0)`}>
      <rect x={-14} y={topo} width={28} height={CHAO_Y - topo} rx={8} fill="#fff8e6" stroke="#1d1424" strokeWidth={5} />
      {[0, 0.25, 0.5, 0.75, 1, 1.25].map((m) => (
        <line key={m} x1={-14} x2={m % 0.5 === 0 ? 24 : 6} y1={CHAO_Y - m * PX_POR_METRO} y2={CHAO_Y - m * PX_POR_METRO} stroke="#1d1424" strokeWidth={5} />
      ))}
      <line x1={-200} x2={30} y1={CHAO_Y - PX_POR_METRO} y2={CHAO_Y - PX_POR_METRO} stroke="#ff9b2f" strokeWidth={6} strokeDasharray="18 12" />
      <text x={34} y={CHAO_Y - PX_POR_METRO + 12} fontFamily="Fredoka" fontWeight={700} fontSize={38} fill="#ff9b2f" stroke="#1d1424" strokeWidth={8} paintOrder="stroke">
        1 m
      </text>
      <line x1={-230} x2={14} y1={atual} y2={atual} stroke="#ffd23f" strokeWidth={6} />
    </g>
  );
};

// ---------------- mundo (o que a câmera vê) ----------------
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const c = camera(f);
  const lp = lucasPose(f);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 960) scale(${c.zoom}) translate(${-c.x} ${-c.y})`}>
          <Praca camX={c.x} />
          {f >= CORTE_2 ? <Regua f={f} x={lp.x + 260} /> : null}
          <Boneco2D id="diego" d={DIEGO} pose={diegoPose(f)} rosto={diegoRosto(f)} />
          <Boneco2D id="lucas" d={LUCAS} pose={lp} rosto={lucasRosto(f)} />
          {f >= CORTE_2 ? <Poeira f={f} x={lp.x} /> : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const TesteAnimacao: React.FC = () => {
  const f = useCurrentFrame();
  const c = camera(f);
  const noChicote = f >= CHICOTE[0] - 1 && f <= CHICOTE[1] + 1;

  const lp = lucasPose(Math.min(f, 95));
  const tagLucas = paraTela(c, lp.x, CHAO_Y - 1240 * ESCALA);
  const tagDiego = paraTela(c, 2000, CHAO_Y - 1240 * ESCALA);
  const apice = (PULO_SAI + PULO_CAI) / 2;
  const alturaM = ((f >= apice ? ALTURA_PULO : alturaPulo(f)) / PX_POR_METRO).toFixed(2).replace(".", ",");

  return (
    <AbsoluteFill style={{ backgroundColor: "#f7c08a" }}>
      {noChicote ? (
        <CameraMotionBlur samples={10} shutterAngle={300}>
          <Mundo />
        </CameraMotionBlur>
      ) : (
        <Mundo />
      )}
      <Etiqueta texto="LUCAS" x={tagLucas.x} y={tagLucas.y} de={52} ate={CHICOTE[0]} cor="#2f6fd6" />
      <Etiqueta texto="DIEGO" x={tagDiego.x} y={tagDiego.y} de={112} ate={CORTE_2 - 1} cor="#d8363c" />
      <Selo texto="DESAFIO: PULAR 1 METRO" de={186} ate={CORTE_3 - 1} cor="#ff9b2f" />
      <Placar titulo="ALTURA" valor={`${alturaM} m`} x={540} y={380} de={268} ate={CORTE_3 - 1} />
      <LegendaPalavra palavras={PALAVRAS} />
    </AbsoluteFill>
  );
};
