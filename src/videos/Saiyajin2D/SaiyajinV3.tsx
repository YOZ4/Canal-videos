import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, posCabeca, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y, Praca, Quarto } from "../../estilo2d/Cenario2D";
import { Brilhos, Gota, Impacto, LinhasFoco, Poeira, Simbolo, Veia } from "../../estilo2d/Efeitos2D";
import { CURVA, andarPerfil, balancoCabelo, giro, k, kPose, kRosto, piscar, respira, tremor } from "../../estilo2d/anim";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { LegendaPalavra, Placar, Rotulo2, Selo, frase } from "../../estilo2d/UI";
import { Hamburguer } from "../../estilo2d/Objetos";
import { Cortina, Iris, ZoomRapido } from "../../estilo2d/Transicoes";

// ---------------- roteiro (30 fps) ----------------
const C_MUSCULO = 90;
const C_PODER = 180;
const FLASH = 268;
const C_FOME = 330;
const QUEDA = 342;
export const DURACAO = 450;

const PALAVRAS = [
  ...frase("E se o Lucas acordasse com poder *Saiyajin?*", 4, 88),
  ...frase("Os *músculos* dele ficariam *10x* mais densos.", 92, 178),
  ...frase("Ele tenta liberar o *poder...*", 182, 266),
  ...frase("e *consegue!*", FLASH, 326),
  ...frase("Só que isso gasta *muita* energia...", 332, 398),
  ...frase("e ele cai de *fome.*", 400, 428),
  ...frase("E o Diego? *Nem* aí.", 430, 450),
];

const ESC = 0.72;
const L0: Pose = { ...POSE_BASE, escala: ESC, y: CHAO_Y };
type Cam = { x: number; y: number; zoom: number };
const transformCam = (c: Cam) => `translate(540 960) scale(${c.zoom}) translate(${-c.x} ${-c.y})`;
const comCabelo = (fn: (f: number) => Pose, f: number): Pose => {
  const p = fn(f);
  return { ...p, cabelo: balancoCabelo(f, (g) => fn(g).x, (g) => fn(g).inclina + fn(g).cabeca * 0.6 + fn(g).agacha * 0.05) };
};

// =====================================================================
// CENA 1 — quarto
// =====================================================================
const acordandoPose = (f: number): Pose => {
  const base: Pose = { ...L0, x: 600 };
  const espreguica: Pose = { ...base, inclina: -4, cabeca: -10, estica: 1.06, bracoE: { ombro: 160, cotovelo: 18 }, bracoD: { ombro: 160, cotovelo: 18 }, maoE: "aberta", maoD: "aberta" };
  const olhaMaos: Pose = { ...base, vira: -0.35, inclina: 2, cabeca: 9, agacha: 24, bracoE: { ombro: 40, cotovelo: -96 }, bracoD: { ombro: 40, cotovelo: -96 }, maoE: "aberta", maoD: "aberta" };
  const p = kPose(f, [
    [0, base],
    [6, { ...base, agacha: 18, estica: 0.97 }, CURVA.sai],
    [18, espreguica, CURVA.exagera],
    [40, espreguica],
    [52, { ...base, maoE: "aberta", maoD: "aberta" }, CURVA.suave],
    [62, olhaMaos, CURVA.exagera],
  ]);
  const treme = f > 66 ? Math.sin(f * 2.1) * 3 : 0;
  const balanca = f > 18 && f < 40 ? Math.sin((f - 18) * 0.3) * 4 : 0;
  return { ...p, inclina: p.inclina + balanca, bracoE: { ...p.bracoE, cotovelo: p.bracoE.cotovelo + treme }, bracoD: { ...p.bracoD, cotovelo: p.bracoD.cotovelo - treme } };
};

const acordandoRosto = (f: number): Rosto => {
  const bocejo: Rosto = { ...ROSTO_BASE, olhos: 0, boca: 1, sobrancelha: -8, sobrancelhaY: 8, sorriso: 0 };
  const choque: Rosto = { ...ROSTO_BASE, olhos: 1.28, olhar: [0, 1], boca: 0.55, sorriso: 0, sobrancelha: -10, sobrancelhaY: 22 };
  const r = kRosto(f, [
    [0, { ...ROSTO_BASE, olhos: 0.4 }],
    [14, bocejo, CURVA.sai],
    [40, bocejo],
    [50, { ...ROSTO_BASE, olhos: 0.7 }],
    [64, choque, CURVA.exagera],
  ]);
  return f < 14 || f > 50 ? { ...r, olhos: r.olhos * piscar(f, "l1") } : r;
};

const CenaQuarto: React.FC = () => {
  const f = useCurrentFrame();
  const pose = comCabelo(acordandoPose, f);
  const c: Cam = { x: 580, y: 1020, zoom: k(f, [[0, 1.0], [58, 1.05], [66, 1.34, CURVA.exagera], [90, 1.38]]) };
  const sh = f >= 62 && f < 74 ? tremor(f, 8) : { x: 0, y: 0 };
  const [hx, hy] = posCabeca(pose);
  const foco = interpolate(f, [62, 66, 80, 90], [0, 0.7, 0.35, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={transformCam({ ...c, x: c.x + sh.x, y: c.y + sh.y })}>
          <Quarto />
          <LinhasFoco f={f} cx={hx} cy={hy + 200} forca={foco} cor="#fff6dc" raio={420} />
          <Boneco2D id="l1" d={LUCAS} pose={pose} rosto={acordandoRosto(f)} />
          <Brilhos x={600} y={1060} f={f} de={64} raio={170} />
          <Simbolo texto="!" x={hx + 150} y={hy - 170} f={f} de={62} />
          {/* "zzz" do bocejo */}
          {f > 12 && f < 44 ? (
            <text x={hx + 120} y={hy - 120 - (f - 12) * 2} fontFamily="Fredoka" fontWeight={700} fontSize={64} fill="#fff" stroke="#1d1424" strokeWidth={10} paintOrder="stroke" opacity={interpolate(f, [12, 18, 38, 44], [0, 1, 1, 0])}>
              Z z
            </text>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// =====================================================================
// CENA 2 — "lupa" no bíceps do Lucas
// =====================================================================
const CenaMusculo: React.FC = () => {
  const f = useCurrentFrame(); // local (0..90)
  const flex = k(f, [[0, 0], [10, 1, CURVA.exagera]]);
  const grow = k(f, [[28, 0], [62, 1, CURVA.exagera]]);
  const pose: Pose = {
    ...L0,
    x: 300,
    y: 1560,
    escala: 0.66,
    inclina: -4 * flex,
    cabeca: 6 * flex,
    bracoD: { ombro: 14 + 76 * flex, cotovelo: -8 + 128 * flex },
    maoD: flex > 0.3 ? "punho" : "bola",
    biceps: grow,
    vira: 0.3 * flex,
    bracoE: { ombro: 20, cotovelo: -10 },
    estica: 1 + Math.sin(f * 0.5) * 0.008 * grow,
  };
  const rosto: Rosto = { ...ROSTO_BASE, sorriso: 0.8, canto: 0.6 * flex, sobrancelha: 10 * flex, olhar: [1, -0.4], olhos: piscar(f, "l2") };
  const cx = 720;
  const cy = 700;
  const R = 300;
  const fibraH = 34 + 34 * grow;
  const gap = 66 + 14 * grow;
  // ponto do bíceps (aprox.) para as linhas da lupa
  const bx = 300 + 150 * 0.66;
  const by = 1560 - 560 * 0.66;
  return (
    <AbsoluteFill style={{ background: "#26476b" }}>
      <svg width={1080} height={1920}>
        {new Array(12).fill(0).map((_, i) => (
          <line key={`v${i}`} x1={i * 100 + 40} y1={0} x2={i * 100 + 40} y2={1920} stroke="#fff" strokeOpacity={0.07} strokeWidth={2} />
        ))}
        {new Array(20).fill(0).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 100 + 20} x2={1080} y2={i * 100 + 20} stroke="#fff" strokeOpacity={0.07} strokeWidth={2} />
        ))}
        <path d={`M ${bx} ${by - 40} L ${cx - R * 0.7} ${cy + R * 0.72} M ${bx + 40} ${by} L ${cx + R * 0.2} ${cy + R * 0.98}`} stroke="#fff" strokeWidth={5} strokeDasharray="14 12" opacity={0.7} />
        <Boneco2D id="l2" d={LUCAS} pose={pose} rosto={rosto} />
        <circle cx={bx} cy={by} r={62} fill="none" stroke="#ffd23f" strokeWidth={7} />
        <defs>
          <clipPath id="lupa">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
        </defs>
        <g transform={`translate(${cx} ${cy}) scale(${k(f, [[2, 0], [14, 1, CURVA.exagera]])}) translate(${-cx} ${-cy})`}>
          <circle cx={cx} cy={cy} r={R + 26} fill="#e9eef0" stroke="#1d1424" strokeWidth={8} />
          <circle cx={cx} cy={cy} r={R} fill="#f2c2b0" />
          <g clipPath="url(#lupa)">
            {new Array(9).fill(0).map((_, i) => {
              const y = cy - gap * 4 + i * gap - fibraH / 2 + Math.sin(f * 0.25 + i) * 2 * grow;
              return (
                <g key={i}>
                  <rect x={cx - R - 20} y={y} width={2 * R + 40} height={fibraH} rx={fibraH / 2} fill="#d9535f" stroke="#a93844" strokeWidth={4} />
                  <rect x={cx - R} y={y + fibraH * 0.16} width={2 * R} height={fibraH * 0.22} rx={fibraH * 0.11} fill="#ef8a8f" />
                  {grow > 0.3
                    ? new Array(3).fill(0).map((__, q) => {
                        const px = cx - R + ((f * (7 + q) + random(`fx${i}${q}`) * 600) % (2 * R));
                        return <circle key={q} cx={px} cy={y + fibraH / 2} r={5 + 5 * grow} fill="#ffe27a" />;
                      })
                    : null}
                </g>
              );
            })}
          </g>
          <path d={`M ${cx + R * 0.72} ${cy + R * 0.72} L ${cx + R * 1.05} ${cy + R * 1.05}`} stroke="#7c5236" strokeWidth={46} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1d1424" strokeWidth={8} />
          <path d={`M ${cx - R * 0.6} ${cy - R * 0.55} Q ${cx - R * 0.3} ${cy - R * 0.85} ${cx + R * 0.05} ${cy - R * 0.85}`} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
        <Brilhos x={bx} y={by} f={f} de={60} raio={90} />
      </svg>
      <Rotulo2 texto="10x" x={cx + 230} y={cy - 300} de={58} tamanho={120} />
      <Rotulo2 texto="bíceps" x={bx + 10} y={by - 110} de={8} tamanho={54} cor="#ffffff" />
    </AbsoluteFill>
  );
};

// =====================================================================
// CENA 3 — transformação
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

const carga = (f: number) => interpolate(f, [C_PODER + 20, FLASH], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const poderPose = (f: number): Pose => {
  const base: Pose = { ...L0, x: 1600 };
  const carregando: Pose = {
    ...base,
    agacha: 70,
    estica: 0.96,
    cabeca: 4,
    peE: { dx: -70, dy: 0 },
    peD: { dx: 70, dy: 0 },
    bracoE: { ombro: 32, cotovelo: -24 },
    bracoD: { ombro: 32, cotovelo: -24 },
    maoE: "punho",
    maoD: "punho",
  };
  const explosao: Pose = { ...carregando, agacha: 0, estica: 1.14, cabeca: -12, bracoE: { ombro: 64, cotovelo: -6 }, bracoD: { ombro: 64, cotovelo: -6 }, maoE: "aberta", maoD: "aberta" };
  const poderoso: Pose = { ...base, vira: 0.3, estica: 1.03, cabeca: -3, peE: { dx: -40, dy: 0 }, peD: { dx: 40, dy: 0 }, bracoE: { ombro: 24, cotovelo: -18 }, bracoD: { ombro: 24, cotovelo: -18 }, maoE: "punho", maoD: "punho" };
  const p = kPose(f, [
    [C_PODER, base],
    [C_PODER + 8, { ...base, agacha: -6, estica: 1.03 }, CURVA.sai],
    [C_PODER + 20, carregando, CURVA.antecipaExagera],
    [FLASH - 2, carregando],
    [FLASH + 2, explosao, CURVA.sai],
    [FLASH + 18, poderoso, CURVA.exagera],
  ]);
  const treme = f < FLASH ? Math.sin(f * 2.7) * 4 * carga(f) : 0;
  return { ...p, inclina: p.inclina + treme * 0.5, estica: p.estica + (f > FLASH ? respira(f) * 0.008 : 0) };
};

const poderRosto = (f: number): Rosto => {
  const neutro: Rosto = { ...ROSTO_BASE, sobrancelha: 8, sorriso: 0.2 };
  const gritando: Rosto = { ...ROSTO_BASE, olhos: 0.55, sobrancelha: 22, sobrancelhaY: -4, boca: 1, sorriso: 0 };
  const confiante: Rosto = { ...ROSTO_BASE, olhos: 0.85, sobrancelha: 16, sorriso: 0.6, canto: 0.9 };
  const r = kRosto(f, [
    [C_PODER, neutro],
    [C_PODER + 22, gritando, CURVA.exagera],
    [FLASH, gritando],
    [FLASH + 10, confiante, CURVA.exagera],
  ]);
  return f > FLASH + 10 ? { ...r, olhos: r.olhos * piscar(f, "l3") } : r;
};

const MundoPoder: React.FC = () => {
  const f = useCurrentFrame();
  const pose = comCabelo(poderPose, f);
  const ca = carga(f);
  const zoom = k(f, [
    [C_PODER, 1.05],
    [FLASH - 2, 1.32, CURVA.entra],
    [FLASH + 2, 1.55, CURVA.sai],
    [FLASH + 20, 1.22, CURVA.exagera],
    [C_FOME, 1.28],
  ]);
  const sh = f < FLASH + 8 ? tremor(f, f < FLASH ? ca * 12 : (FLASH + 8 - f) * 4) : { x: 0, y: 0 };
  const c: Cam = { x: 1600 + sh.x, y: 1060 + sh.y, zoom };
  const escuro = f < FLASH ? ca * 0.55 : 0;
  const dourado = f >= FLASH ? 0.22 + Math.sin(f * 0.4) * 0.04 : 0;
  const [hx, hy] = posCabeca(pose);
  const poder = f >= FLASH ? 1 : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={transformCam(c)}>
          <Praca camX={c.x} />
          <rect x={0} y={-500} width={3400} height={3000} fill="#231a44" opacity={escuro} />
          <rect x={0} y={-500} width={3400} height={3000} fill="#ffb627" opacity={dourado} />
          <LinhasFoco f={f} cx={hx} cy={hy + 180} forca={f < FLASH ? ca * 0.55 : interpolate(f, [FLASH, FLASH + 20], [0.9, 0], { extrapolateRight: "clamp" })} cor={f < FLASH ? "#cfc6ff" : "#fff6c2"} raio={460} />
          <Aura x={pose.x} y={CHAO_Y} f={f} forca={f >= FLASH ? 1 : ca * 0.35} />
          <Pedras x={pose.x} f={f} forca={f < FLASH ? 1 : 1.4} />
          {/* rastro (smear) na explosão */}
          {f >= FLASH && f < FLASH + 5
            ? [3, 2].map((d) => <Boneco2D key={d} id={`r${d}`} d={LUCAS} pose={poderPose(f - d)} rosto={poderRosto(f - d)} poder={poder} opacidade={0.25} />)
            : null}
          <Boneco2D id="l3" d={LUCAS} pose={pose} rosto={poderRosto(f)} poder={poder} />
          <Veia x={hx + 70} y={hy - 70} f={f} de={C_PODER + 30} escala={f < FLASH ? 0.9 : 0} />
          <Impacto x={hx} y={hy + 200} f={f} de={FLASH} dur={12} cor="#fff6c2" />
          <Brilhos x={hx} y={hy - 60} f={f} de={FLASH + 6} raio={240} />
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
// CENA 4 — cai de fome (perfil) e o Diego chega andando de lado
// =====================================================================
const LX = 1330;
const fomePose = (f: number): Pose => {
  const P0: Pose = { ...PERFIL_BASE, escala: ESC, y: CHAO_Y, x: LX };
  const tonto: Pose = { ...P0, inclina: -6, cabeca: -8, bracoE: { ombro: -10, cotovelo: 20 }, bracoD: { ombro: 10, cotovelo: 20 } };
  const sentado: Pose = {
    ...P0,
    agacha: 340,
    inclina: 14,
    cabeca: 14,
    peE: { dx: 240, dy: 0 },
    peD: { dx: 290, dy: 0 },
    bracoE: { ombro: 26, cotovelo: 26 },
    bracoD: { ombro: 34, cotovelo: 30 },
  };
  const impacto: Pose = { ...sentado, agacha: 355, estica: 0.86, inclina: 22 };
  const p = kPose(f, [
    [C_FOME, tonto],
    [QUEDA - 4, { ...tonto, agacha: 40, inclina: 4 }, CURVA.suave],
    [QUEDA, impacto, CURVA.entra],
    [QUEDA + 14, sentado, CURVA.exagera],
  ]);
  const cambaleia = f < QUEDA ? Math.sin((f - C_FOME) * 0.6) * 5 : 0;
  // olha pro Diego quando ele chega
  const olha = k(f, [[396, 0], [404, 1, CURVA.exagera]]);
  return { ...p, inclina: p.inclina + cambaleia - olha * 8, cabeca: p.cabeca - olha * 16, estica: p.estica + Math.sin(f * 0.5) * 0.012 };
};

const fomeRosto = (f: number): Rosto => {
  const tonto: Rosto = { ...ROSTO_BASE, olhos: 0.6, sobrancelha: -10, sorriso: -0.2, boca: 0.2 };
  const cansado: Rosto = { ...ROSTO_BASE, olhos: 0.45, sobrancelha: -14, sobrancelhaY: 6, sorriso: -0.7 };
  const pedindo: Rosto = { ...cansado, olhos: 1.3, sobrancelhaY: 18, sobrancelha: -18, boca: 0.55, sorriso: 0.1 };
  const r = kRosto(f, [
    [C_FOME, tonto],
    [QUEDA, tonto],
    [QUEDA + 6, cansado],
    [398, cansado],
    [406, pedindo, CURVA.exagera],
  ]);
  return { ...r, olhos: r.olhos * piscar(f, "l4") };
};

const DIEGO_PARA = 392;
const GIRO = 404;
const diegoPose = (f: number): Pose => {
  const x = k(f, [
    [360, 2320],
    [DIEGO_PARA, 1840, CURVA.sai],
  ]);
  const andando = f < DIEGO_PARA;
  const w = andarPerfil(f, andando ? 1 : 0);
  const g = giro(f, GIRO, 8);
  const freio = k(f, [[DIEGO_PARA, 0], [DIEGO_PARA + 5, -10, CURVA.sai], [DIEGO_PARA + 12, 3, CURVA.suave], [DIEGO_PARA + 16, 0]]);
  if (!g.trocou) {
    return {
      ...PERFIL_BASE,
      escala: ESC,
      lado: -1,
      x,
      y: CHAO_Y - (andando ? w.bob * 0.5 : 0),
      inclina: andando ? w.inclina : freio,
      largura: g.largura,
      peE: andando ? w.peE : PERFIL_BASE.peE,
      peD: andando ? w.peD : PERFIL_BASE.peD,
      bracoE: andando ? w.bracoE : PERFIL_BASE.bracoE,
      bracoD: { ombro: 36, cotovelo: 64 },
    };
  }
  const ergue = k(f, [[GIRO + 4, 0], [GIRO + 14, 1, CURVA.exagera]]);
  const balanca = f > GIRO + 14 ? Math.sin((f - GIRO - 14) * 0.35) * 10 : 0;
  return {
    ...POSE_BASE,
    escala: ESC,
    x,
    y: CHAO_Y,
    vira: -0.5,
    largura: g.largura,
    cabeca: k(f, [[GIRO + 8, 0], [GIRO + 22, -9, CURVA.exagera]]),
    bracoE: { ombro: 22 * ergue + 14 * (1 - ergue), cotovelo: -60 * ergue - 8 * (1 - ergue) },
    bracoD: { ombro: 14 + 70 * ergue + balanca, cotovelo: -8 - 70 * ergue },
    maoE: "bola",
    estica: 1 + respira(f, 30) * 0.006,
  };
};

const diegoRosto = (f: number): Rosto => {
  const DR: Rosto = { ...ROSTO_BASE, olhos: 0.6, canto: 0.8, sorriso: 0.4, sobrancelha: 6, olhar: [-1, 0.6] };
  const r = kRosto(f, [
    [0, DR],
    [GIRO + 16, DR],
    [GIRO + 24, { ...DR, sobrancelhaY: 18, canto: 1 }, CURVA.exagera],
  ]);
  return { ...r, olhos: r.olhos * piscar(f, "d4") };
};

const MundoFome: React.FC = () => {
  const f = useCurrentFrame();
  const lp = comCabelo(fomePose, f);
  const dp = comCabelo(diegoPose, f);
  const sh = f >= QUEDA && f < QUEDA + 9 ? tremor(f, 12) : { x: 0, y: 0 };
  const c: Cam = {
    x: k(f, [[C_FOME, 1400], [372, 1430], [396, 1590, CURVA.suave]]) + sh.x,
    y: k(f, [[C_FOME, 1060], [372, 1080], [396, 1110, CURVA.suave]]) + sh.y,
    zoom: k(f, [[C_FOME, 1.25], [372, 1.2], [396, 1.0, CURVA.suave]]),
  };
  const [hx, hy] = posCabeca(lp);
  const ronco = (inicio: number) => f >= inicio && f < inicio + 18;
  const roncando = ronco(356) || ronco(384);
  const r0 = ronco(356) ? 356 : 384;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={transformCam(c)}>
          <Praca camX={c.x} />
          <Poeira x={LX + 60} y={CHAO_Y} f={f} de={QUEDA} />
          <Boneco2D id="l4" d={LUCAS} pose={lp} rosto={fomeRosto(f)} />
          {f > 360 ? <Boneco2D id="d4" d={DIEGO} pose={dp} rosto={diegoRosto(f)} naMao={<Hamburguer escala={0.85} />} /> : null}
          {/* babando */}
          {f > 410 ? <Gota x={hx + 120} y={hy + 120} f={f} de={412} escala={0.45} /> : null}
          <Simbolo texto="!" x={hx + 40} y={hy - 230} f={f} de={406} ate={428} escala={0.9} />
          <Brilhos x={hx + 90} y={hy} f={f} de={408} raio={70} cor="#ffffff" />
          <Gota x={hx - 60} y={hy - 150} f={f} de={QUEDA + 8} />
          
          {roncando
            ? [0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M ${LX + 120 + i * 24} ${CHAO_Y - 260 - i * 26} q 26 -20 0 -46`}
                  stroke="#ffffff"
                  strokeWidth={9}
                  strokeLinecap="round"
                  fill="none"
                  opacity={interpolate(f - r0, [0, 3, 14, 18], [0, 1, 1, 0])}
                />
              ))
            : null}
          {roncando ? (
            <text x={LX + 200} y={CHAO_Y - 330} fontFamily="Fredoka" fontWeight={700} fontSize={56} fill="#fff" stroke="#1d1424" strokeWidth={10} paintOrder="stroke" opacity={interpolate(f - r0, [0, 3, 14, 18], [0, 1, 1, 0])}>
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

const Som: React.FC<{ src: string; de: number; volume?: number }> = ({ src, de, volume = 0.6 }) => (
  <Sequence from={de} layout="none">
    <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

export const SaiyajinV3: React.FC = () => {
  const f = useCurrentFrame();
  const borra = f >= FLASH - 3 && f <= FLASH + 6;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={C_MUSCULO}>
        <CenaQuarto />
      </Sequence>
      <Sequence from={C_MUSCULO} durationInFrames={C_PODER - C_MUSCULO}>
        <CenaMusculo />
      </Sequence>
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
      <Iris de={C_MUSCULO - 8} dur={16} x={540} y={1000} x2={500} y2={900} />
      <Cortina de={C_PODER - 7} dur={14} />
      <ZoomRapido de={C_FOME - 5} dur={10} />
      <Selo texto="E SE VOCÊ VIRASSE UM SAIYAJIN?" de={0} ate={C_MUSCULO - 2} cor="#ff9b2f" />
      <Placar titulo="ENERGIA GASTA" valor="-9.000 kcal" x={540} y={330} de={346} ate={DURACAO} />
      <LegendaPalavra palavras={PALAVRAS} />

      {/* trilha: abaixa na carga do poder e volta forte depois */}
      <Html5Audio
        src={staticFile("musica/trilha-leve.wav")}
        volume={(fr) =>
          interpolate(fr, [0, 10, C_PODER + 10, C_PODER + 30, FLASH - 1, FLASH + 2, DURACAO - 20, DURACAO], [0, 0.22, 0.22, 0.05, 0.05, 0.3, 0.26, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      {/* efeitos sonoros */}
      <Som src="pop" de={2} volume={0.5} />
      <Som src="plim" de={62} volume={0.6} />
      <Som src="brilho" de={64} volume={0.45} />
      <Som src="whoosh" de={C_MUSCULO - 6} volume={0.5} />
      <Som src="pop" de={C_MUSCULO + 4} volume={0.5} />
      <Som src="brilho" de={C_MUSCULO + 56} volume={0.4} />
      <Som src="whoosh" de={C_PODER - 6} volume={0.5} />
      <Som src="rumble" de={C_PODER + 10} volume={0.75} />
      <Som src="carga" de={C_PODER + 20} volume={0.5} />
      <Som src="impacto" de={FLASH - 1} volume={0.7} />
      <Som src="brilho" de={FLASH + 4} volume={0.55} />
      <Som src="whoosh" de={C_FOME - 6} volume={0.45} />
      <Som src="impacto" de={QUEDA} volume={0.35} />
      <Som src="pop" de={346} volume={0.5} />
      <Som src="ronco" de={356} volume={0.8} />
      <Som src="ronco" de={384} volume={0.8} />
      <Som src="whoosh" de={GIRO} volume={0.35} />
      <Som src="plim" de={406} volume={0.5} />
      <Som src="brilho" de={408} volume={0.35} />
    </AbsoluteFill>
  );
};
