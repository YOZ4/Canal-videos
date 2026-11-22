import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Sequence, interpolate, random, useCurrentFrame } from "remotion";
import { Boneco2D, POSE_BASE, ROSTO_BASE, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y, Praca, Quarto } from "../../estilo2d/Cenario2D";
import { CURVA, andar, k, kPose, kRosto, piscar, respira, tremor } from "../../estilo2d/anim";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { LegendaPalavra, Placar, Selo, frase } from "../../estilo2d/UI";
import { Cena2Musculos } from "../TesteEstilo/Cena2Musculos";

// ---------------- roteiro (30 fps) ----------------
const C_MUSCULO = 90;
const C_PODER = 180;
const FLASH = 268;
const C_FOME = 330;
export const DURACAO = 450;

const PALAVRAS = [
  ...frase("E se o Lucas acordasse com poder *Saiyajin?*", 4, 88),
  ...frase("Os *músculos* dele ficariam *10x* mais densos.", 92, 178),
  ...frase("Ele tenta liberar o *poder...*", 182, 266),
  ...frase("e *consegue!*", FLASH, 326),
  ...frase("Só que isso gasta *muita* energia...", 332, 398),
  ...frase("e ele cai de *fome.*", 400, 448),
];

const ESC = 0.72;
const L0: Pose = { ...POSE_BASE, escala: ESC, y: CHAO_Y };
type Cam = { x: number; y: number; zoom: number };
const transformCam = (c: Cam) => `translate(540 960) scale(${c.zoom}) translate(${-c.x} ${-c.y})`;

// =====================================================================
// CENA 1 — quarto: espreguiça e sente o poder nas mãos
// =====================================================================
const lucasAcordando = (f: number): { pose: Pose; rosto: Rosto } => {
  const base: Pose = { ...L0, x: 600 };
  const espreguica: Pose = {
    ...base,
    inclina: -3,
    cabeca: -8,
    estica: 1.05,
    bracoE: { ombro: 165, cotovelo: 12 },
    bracoD: { ombro: 165, cotovelo: 12 },
  };
  const olhaMaos: Pose = {
    ...base,
    inclina: 2,
    cabeca: 8,
    agacha: 20,
    bracoE: { ombro: 34, cotovelo: -100 },
    bracoD: { ombro: 34, cotovelo: -100 },
  };
  const pose = kPose(f, [
    [0, base],
    [16, espreguica, CURVA.sai],
    [40, espreguica],
    [52, base, CURVA.suave],
    [62, olhaMaos, CURVA.exagera],
  ]);
  // mãos tremendo de energia
  const treme = f > 66 ? Math.sin(f * 2.1) * 3 : 0;
  const bocejo: Rosto = { ...ROSTO_BASE, olhos: 0, boca: 1, sobrancelha: -8, sobrancelhaY: 8, sorriso: 0 };
  const choque: Rosto = { ...ROSTO_BASE, olhos: 1.28, olhar: [0, 1], boca: 0.55, sorriso: 0, sobrancelha: -10, sobrancelhaY: 22 };
  const rosto = kRosto(f, [
    [0, { ...ROSTO_BASE, olhos: 0.4 }],
    [14, bocejo, CURVA.sai],
    [40, bocejo],
    [50, { ...ROSTO_BASE, olhos: 0.7 }],
    [64, choque, CURVA.exagera],
  ]);
  return {
    pose: { ...pose, bracoE: { ...pose.bracoE, cotovelo: pose.bracoE.cotovelo + treme }, bracoD: { ...pose.bracoD, cotovelo: pose.bracoD.cotovelo - treme } },
    rosto: f < 14 || f > 50 ? { ...rosto, olhos: rosto.olhos * piscar(f, "l1") } : rosto,
  };
};

const Faisca: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const r = random(`fa${Math.floor(f / 2)}${x}`);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r * 360})`}>
      <path d="M 0 -50 L 12 -10 L 50 0 L 12 10 L 0 50 L -12 10 L -50 0 L -12 -10 Z" fill="#ffe14a" stroke="#1d1424" strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

const CenaQuarto: React.FC = () => {
  const f = useCurrentFrame();
  const { pose, rosto } = lucasAcordando(f);
  const c: Cam = { x: 560, y: 1020, zoom: k(f, [[0, 1.0], [58, 1.05], [70, 1.32, CURVA.exagera], [90, 1.36]]) };
  const sh = f >= 64 && f < 76 ? tremor(f, 7) : { x: 0, y: 0 };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={transformCam({ ...c, x: c.x + sh.x, y: c.y + sh.y })}>
          <Quarto />
          <Boneco2D id="l1" d={LUCAS} pose={pose} rosto={rosto} />
          {f > 66 ? (
            <>
              <Faisca x={470} y={1060} f={f} s={0.6 + 0.2 * Math.sin(f)} />
              <Faisca x={700} y={1040} f={f + 7} s={0.5 + 0.2 * Math.cos(f)} />
            </>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// =====================================================================
// CENA 3 — praça: carrega o poder e se transforma
// =====================================================================
const Aura: React.FC<{ x: number; y: number; f: number; forca: number }> = ({ x, y, f, forca }) => {
  if (forca <= 0) return null;
  const pts: string[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ponta = i % 2 === 0;
    const flick = random(`au${i}-${Math.floor(f / 2)}`);
    const rx = (ponta ? 330 + flick * 60 : 270) * ESC;
    const ry = (ponta ? 720 + flick * 90 : 620) * ESC;
    // chamas mais altas pra cima
    const up = Math.sin(a) < 0 ? 1 + 0.25 * -Math.sin(a) : 1;
    pts.push(`${x + Math.cos(a) * rx} ${y - 560 * ESC + Math.sin(a) * ry * up}`);
  }
  const d = `M ${pts.join(" L ")} Z`;
  return (
    <g opacity={forca}>
      <defs>
        <filter id="auraBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <path d={d} fill="#ffcf2e" opacity={0.55} filter="url(#auraBlur)" />
      <path d={d} fill="#fff3a6" opacity={0.35} transform={`translate(${x} ${y - 560 * ESC}) scale(0.82) translate(${-x} ${-(y - 560 * ESC)})`} />
    </g>
  );
};

const Pedras: React.FC<{ x: number; f: number; forca: number }> = ({ x, f, forca }) => (
  <g>
    {new Array(12).fill(0).map((_, i) => {
      const dx = (random(`p${i}`) - 0.5) * 900;
      const delay = random(`pd${i}`) * 40;
      const sobe = Math.max(0, f - C_PODER - 20 - delay) * (2 + random(`ps${i}`) * 3) * forca;
      if (sobe <= 0) return null;
      const s = 10 + random(`pz${i}`) * 22;
      return (
        <g key={i} transform={`translate(${x + dx} ${CHAO_Y + 20 - sobe}) rotate(${f * 4 + i * 40})`}>
          <path d={`M ${-s} 0 L ${-s * 0.3} ${-s} L ${s} ${-s * 0.4} L ${s * 0.6} ${s * 0.8} Z`} fill="#8b7d70" stroke="#1d1424" strokeWidth={4} />
        </g>
      );
    })}
  </g>
);

const lucasPoder = (f: number): { pose: Pose; rosto: Rosto; poder: number } => {
  const x = 1600;
  const base: Pose = { ...L0, x };
  const carregando: Pose = {
    ...base,
    agacha: 70,
    estica: 0.96,
    inclina: 0,
    cabeca: 4,
    peE: { dx: -70, dy: 0 },
    peD: { dx: 70, dy: 0 },
    bracoE: { ombro: 32, cotovelo: -24 },
    bracoD: { ombro: 32, cotovelo: -24 },
  };
  const explosao: Pose = { ...carregando, agacha: 0, estica: 1.12, cabeca: -10, bracoE: { ombro: 60, cotovelo: -10 }, bracoD: { ombro: 60, cotovelo: -10 } };
  const poderoso: Pose = { ...base, estica: 1.03, cabeca: -3, peE: { dx: -40, dy: 0 }, peD: { dx: 40, dy: 0 }, bracoE: { ombro: 24, cotovelo: -18 }, bracoD: { ombro: 24, cotovelo: -18 } };
  const p = kPose(f, [
    [C_PODER, base],
    [C_PODER + 8, { ...base, agacha: -6, estica: 1.03 }, CURVA.sai],
    [C_PODER + 20, carregando, CURVA.antecipaExagera],
    [FLASH - 2, carregando],
    [FLASH + 2, explosao, CURVA.sai],
    [FLASH + 18, poderoso, CURVA.exagera],
  ]);
  const carga = interpolate(f, [C_PODER + 20, FLASH], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const treme = f < FLASH ? Math.sin(f * 2.7) * 4 * carga : 0;

  const neutro: Rosto = { ...ROSTO_BASE, sobrancelha: 8, sorriso: 0.2 };
  const gritando: Rosto = { ...ROSTO_BASE, olhos: 0.55, sobrancelha: 22, sobrancelhaY: -4, boca: 1, sorriso: 0 };
  const confiante: Rosto = { ...ROSTO_BASE, olhos: 0.85, sobrancelha: 16, sorriso: 0.6, canto: 0.9, olhar: [0, 0] };
  const rosto = kRosto(f, [
    [C_PODER, neutro],
    [C_PODER + 22, gritando, CURVA.exagera],
    [FLASH, gritando],
    [FLASH + 10, confiante, CURVA.exagera],
  ]);
  return {
    pose: { ...p, inclina: p.inclina + treme * 0.5, estica: p.estica + (f > FLASH ? respira(f) * 0.008 : 0) },
    rosto: f > FLASH + 10 ? { ...rosto, olhos: rosto.olhos * piscar(f, "l3") } : rosto,
    poder: f >= FLASH ? 1 : 0,
  };
};

const MundoPoder: React.FC = () => {
  const f = useCurrentFrame();
  const { pose, rosto, poder } = lucasPoder(f);
  const carga = interpolate(f, [C_PODER + 20, FLASH], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = k(f, [
    [C_PODER, 1.05],
    [FLASH - 2, 1.32, CURVA.entra],
    [FLASH + 2, 1.55, CURVA.sai],
    [FLASH + 20, 1.22, CURVA.exagera],
    [C_FOME, 1.28],
  ]);
  const sh = f < FLASH + 8 ? tremor(f, f < FLASH ? carga * 12 : (FLASH + 8 - f) * 4) : { x: 0, y: 0 };
  const c: Cam = { x: 1600 + sh.x, y: 1060 + sh.y, zoom };
  const escuro = f < FLASH ? carga * 0.55 : 0;
  const dourado = f >= FLASH ? 0.22 + Math.sin(f * 0.4) * 0.04 : 0;
  const auraForca = f >= FLASH ? 1 : carga * 0.35;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={transformCam(c)}>
          <Praca camX={c.x} />
          <rect x={0} y={-500} width={3400} height={3000} fill="#231a44" opacity={escuro} />
          <rect x={0} y={-500} width={3400} height={3000} fill="#ffb627" opacity={dourado} />
          <Aura x={pose.x} y={CHAO_Y} f={f} forca={auraForca} />
          <Pedras x={pose.x} f={f} forca={f < FLASH ? 1 : 1.4} />
          <Boneco2D id="l3" d={LUCAS} pose={pose} rosto={rosto} poder={poder} />
          {/* raios de energia subindo */}
          {f >= FLASH
            ? new Array(8).fill(0).map((_, i) => {
                const yy = CHAO_Y - (((f - FLASH) * 22 + i * 140) % 1000);
                const xx = pose.x + (random(`r${i}`) - 0.5) * 520;
                return <rect key={i} x={xx} y={yy} width={8} height={70} rx={4} fill="#fff6c2" opacity={0.85} />;
              })
            : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// =====================================================================
// CENA 4 — cai de fome; Diego chega
// =====================================================================
const lucasFome = (f: number): { pose: Pose; rosto: Rosto } => {
  const x = 1430;
  const sentado: Pose = {
    ...L0,
    x,
    agacha: 345,
    inclina: 4,
    cabeca: 12,
    peE: { dx: -215, dy: 0 },
    peD: { dx: 215, dy: 0 },
    bracoE: { ombro: 32, cotovelo: -30 },
    bracoD: { ombro: 32, cotovelo: -30 },
  };
  const caindo: Pose = { ...sentado, agacha: 120, estica: 1.04, cabeca: -6 };
  const impacto: Pose = { ...sentado, agacha: 340, estica: 0.86 };
  const pose = kPose(f, [
    [C_FOME, caindo],
    [C_FOME + 6, impacto, CURVA.entra],
    [C_FOME + 18, sentado, CURVA.exagera],
  ]);
  const ofegante = Math.sin(f * 0.5) * 0.015;
  const cansado: Rosto = { ...ROSTO_BASE, olhos: 0.45, sobrancelha: -14, sobrancelhaY: 6, sorriso: -0.7, olhar: [0, 0.6] };
  const olhaDiego: Rosto = { ...cansado, olhar: [1, -0.3], olhos: 0.75 };
  const rosto = kRosto(f, [
    [C_FOME, { ...cansado, olhos: 0.9 }],
    [C_FOME + 8, cansado],
    [412, cansado],
    [420, olhaDiego, CURVA.exagera],
  ]);
  return { pose: { ...pose, estica: pose.estica + ofegante }, rosto: { ...rosto, olhos: rosto.olhos * piscar(f, "l4") } };
};

const diegoChegando = (f: number): { pose: Pose; rosto: Rosto } => {
  const D0: Pose = { ...POSE_BASE, escala: ESC, y: CHAO_Y, cruzado: 0 };
  const andando = f < 396;
  const w = andar(f, andando ? 1 : 0);
  const x = k(f, [
    [365, 2300],
    [396, 1900, CURVA.sai],
  ]);
  const cruz = k(f, [
    [398, 0],
    [410, 1, CURVA.exagera],
  ]);
  const pose: Pose = {
    ...D0,
    x,
    y: CHAO_Y - (andando ? w.bob * 0.4 : 0),
    inclina: andando ? -5 + w.balanco : k(f, [[396, -7], [404, 3, CURVA.sai], [412, 0]]),
    cabeca: k(f, [[396, 0], [420, -9, CURVA.exagera]]),
    peE: w.peE,
    peD: w.peD,
    bracoE: w.bracoE,
    bracoD: w.bracoD,
    cruzado: cruz,
    estica: 1 + respira(f, 30) * 0.006,
  };
  const DR: Rosto = { ...ROSTO_BASE, olhos: 0.55, canto: 0.9, sorriso: 0.4, sobrancelha: 6, olhar: [-1, 0.5] };
  const rosto = kRosto(f, [
    [0, DR],
    [420, DR],
    [428, { ...DR, sobrancelhaY: 18, canto: 1 }, CURVA.exagera],
  ]);
  return { pose, rosto: { ...rosto, olhos: rosto.olhos * piscar(f, "d4") } };
};

const MundoFome: React.FC = () => {
  const f = useCurrentFrame();
  const l = lucasFome(f);
  const d = diegoChegando(f);
  const sh = f >= C_FOME + 5 && f < C_FOME + 14 ? tremor(f, 10) : { x: 0, y: 0 };
  const c: Cam = { x: k(f, [[C_FOME, 1480], [380, 1500], [400, 1650, CURVA.suave]]) + sh.x, y: 1100 + sh.y, zoom: k(f, [[C_FOME, 1.25], [380, 1.2], [400, 1.02, CURVA.suave]]) };
  const ronco = f > 350 ? (f - 350) % 26 : -1;
  // gota de suor
  const gota = ((f - C_FOME) % 40) / 40;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={transformCam(c)}>
          <Praca camX={c.x} />
          <Boneco2D id="l4" d={LUCAS} pose={l.pose} rosto={l.rosto} />
          {f > 365 ? <Boneco2D id="d4" d={DIEGO} pose={d.pose} rosto={d.rosto} /> : null}
          {/* suor */}
          <path
            d="M 0 -26 Q 16 0 0 12 Q -16 0 0 -26 Z"
            transform={`translate(${l.pose.x + 120} ${CHAO_Y - 760 + gota * 70})`}
            fill="#bfe8ff"
            stroke="#1d1424"
            strokeWidth={4}
            opacity={1 - gota}
          />
          {/* ronco da barriga */}
          {ronco >= 0 && ronco < 16
            ? [0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M ${l.pose.x + 130 + i * 24} ${CHAO_Y - 300 - i * 26} q 26 -20 0 -46`}
                  stroke="#ffffff"
                  strokeWidth={9}
                  strokeLinecap="round"
                  fill="none"
                  opacity={interpolate(ronco, [0, 3, 12, 16], [0, 1, 1, 0])}
                />
              ))
            : null}
          {ronco >= 0 && ronco < 16 ? (
            <text x={l.pose.x + 220} y={CHAO_Y - 360} fontFamily="Fredoka" fontWeight={700} fontSize={54} fill="#fff" stroke="#1d1424" strokeWidth={10} paintOrder="stroke">
              ronc...
            </text>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// =====================================================================

const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 2, at, at + 10], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return o > 0 ? <AbsoluteFill style={{ background: "#fffbe6", opacity: o }} /> : null;
};

export const Saiyajin2D: React.FC = () => {
  const f = useCurrentFrame();
  const borra = f >= FLASH - 3 && f <= FLASH + 6;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={C_MUSCULO}>
        <CenaQuarto />
      </Sequence>
      <Sequence from={C_MUSCULO} durationInFrames={C_PODER - C_MUSCULO}>
        <Cena2Musculos />
      </Sequence>
      {/* cenas 3 e 4 usam o frame global (sem Sequence) */}
      {f >= C_PODER && f < C_FOME ? (
        borra ? (
          <CameraMotionBlur samples={8} shutterAngle={240}>
            <MundoPoder />
          </CameraMotionBlur>
        ) : (
          <MundoPoder />
        )
      ) : null}
      {f >= C_FOME ? <MundoFome /> : null}
      <Flash at={FLASH} />
      <Selo texto="E SE VOCÊ VIRASSE UM SAIYAJIN?" de={0} ate={C_MUSCULO - 2} cor="#ff9b2f" />
      <Placar titulo="ENERGIA GASTA" valor="-9.000 kcal" x={540} y={330} de={346} ate={DURACAO} />
      <LegendaPalavra palavras={PALAVRAS} />
    </AbsoluteFill>
  );
};
