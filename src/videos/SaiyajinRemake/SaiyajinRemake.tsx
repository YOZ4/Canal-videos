import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Html5Audio, interpolate, random, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Boneco2D, POSE_BASE, PERFIL_BASE, posCabeca, ROSTO_BASE, type Cel, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CURVA, kPose, piscar, respira, type Curva } from "../../estilo2d/anim";
import { AuraForte } from "../../estilo2d/Aura";
import { GradeJJK, LinhasRadiais, RiscosVelocidade, tremorJJK } from "../../estilo2d/EstiloJJK";
import { Veia } from "../../estilo2d/Efeitos2D";
import { criarAnimacao } from "../../estilo2d/naturalidade";
import { CONTORNO, DIEGO, LUCAS, type Design } from "../../estilo2d/personagens";
import type { Cam3D } from "../../estilo2d/Objeto3D";
import { COR, Frente3D, Fundo3D, H, pedrasAura, pedrasCaminho, projeta, W, type Cena3D } from "./mundo3d";

/**
 * "E se você virasse um Saiyajin?" — REMAKE (2D estilo JJK S2 + 3D estratégico). 24 qps, 13 s.
 * O original (out/lucas-saiyajin.mp4) era um boneco 3D de brinquedo girando numa base.
 *
 * Planos: P1 2D título · P2 2D close nos olhos + chão tremendo · P3 **3D** câmera orbitando (pedras sobem) ·
 * P4 **3D** explosão (onda de choque) · P5 2D reação do Diego · P6 **3D** avanço em profundidade + carimbo.
 * Regras do híbrido: personagens SEMPRE 2D (desenho de 2 em 2 = 12 poses/s); no 3D as pedras também mudam de 2 em 2,
 * só a câmera e as partículas andam a 24; o Lucas 2D é posto onde o chão 3D aparece na tela (`projeta`) e vira (3/4)
 * junto com a órbita; a mesma grade de cor (GradeJJK) e o grão (finalizar.sh) cobrem 2D e 3D.
 */
loadFont({ family: "Luckiest Guy", url: staticFile("fonts/LuckiestGuy-Regular.woff2"), format: "woff2" });

export const FPS_R = 24;
export const DUR_R = 312;
const dois = (f: number) => Math.floor(f / 2) * 2;
const ip = (f: number, a: number[], b: number[], e?: Curva) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

// planos
const P2 = 60;
const P2b = 80;
const P3 = 96;
const P4 = 180; // hit-stop 180–186, clarão 186, invertido 188–190
const EXPL = 186;
const P5 = 204;
const P6 = 264;

const LUCAS_SSJ: Design = { ...LUCAS, cabeloPoder: { cor: "#ffd93a", claro: "#fff38a", escuro: "#e8a417", brilho: "#ffe14a" } };
const AURA = { cor: COR.ouro, clara: COR.ouroClaro };

// ------------------------------------------------------------------ Lucas (pose crua, desenho de 2 em 2)
const B_L: Pose = { ...POSE_BASE, x: 400, y: 1500, escala: 0.55, vira: 0.3 };
const calmo: Pose = { ...B_L, bracoE: { ombro: 12, cotovelo: -8 }, bracoD: { ombro: 12, cotovelo: -8 } };
const fecha: Pose = { ...B_L, agacha: 18, estica: 0.99, bracoE: { ombro: 22, cotovelo: -34 }, bracoD: { ombro: 22, cotovelo: -34 }, maoE: "punho", maoD: "punho" };
const carga: Pose = { ...B_L, agacha: 70, estica: 0.97, cabeca: 6, bracoE: { ombro: 34, cotovelo: -52 }, bracoD: { ombro: 34, cotovelo: -52 }, maoE: "punho", maoD: "punho" };
const grito: Pose = { ...B_L, agacha: 56, estica: 1.02, cabeca: -6, bracoE: { ombro: 40, cotovelo: -40 }, bracoD: { ombro: 40, cotovelo: -40 }, maoE: "punho", maoD: "punho" };
const explode: Pose = { ...B_L, agacha: 24, estica: 1.07, cabeca: -8, bracoE: { ombro: 52, cotovelo: -12 }, bracoD: { ombro: 52, cotovelo: -12 }, maoE: "punho", maoD: "punho" };
const poder: Pose = { ...B_L, agacha: 40, estica: 1.0, cabeca: -2, bracoE: { ombro: 24, cotovelo: -26 }, bracoD: { ombro: 24, cotovelo: -26 }, maoE: "punho", maoD: "punho" };

const lucasCru = (f0: number): Pose => {
  const f = f0 >= P4 && f0 < EXPL ? P4 : dois(f0); // hit-stop: congela a pose
  let p = kPose(f, [
    [0, calmo],
    [36, calmo],
    [40, { ...calmo, estica: 1.02, agacha: -4 }, CURVA.sai], // antecipação: respira fundo
    [50, fecha, CURVA.exagera],
    [P2, fecha],
    [P3, carga, CURVA.suave],
    [150, carga],
    [172, grito, CURVA.antecipa],
    [P4, grito],
    [EXPL + 2, explode, CURVA.sai],
    [EXPL + 14, poder, CURVA.exagera],
  ]);
  const r = respira(f / 2, 3);
  // tremor de força (cresce na carga) — de 2 em 2, como o desenho
  const forca = ip(f, [P2, P4], [0.2, 1]) * (f < P4 ? 1 : 0) + (f >= EXPL && f < EXPL + 12 ? 0.6 : 0);
  const tx = (random(`lt${f}`) - 0.5) * 8 * forca;
  p = { ...p, x: p.x + tx, estica: p.estica * (1 + r * 0.01), cabeca: p.cabeca + (random(`lc${f}`) - 0.5) * 3 * forca };
  return p;
};
const lucasRosto = (f0: number): Rosto => {
  const f = f0 >= P4 && f0 < EXPL ? P4 : dois(f0);
  const g = f / 2;
  let r: Rosto;
  if (f < 40) r = { ...ROSTO_BASE, olhos: 0.95, sorriso: 0.3 };
  else if (f < P2) r = { ...ROSTO_BASE, olhos: 0.8, sobrancelha: 14, sorriso: 0 };
  else if (f < 150) r = { ...ROSTO_BASE, olhos: ip(f, [P2, 90], [0.8, 0.45]), sobrancelha: 26, sorriso: -0.7, boca: 0.08, olhar: [0, 0.1] };
  else if (f < EXPL) r = { ...ROSTO_BASE, olhos: 0.5, sobrancelha: 30, sorriso: -0.95, boca: 0.95 };
  else if (f < EXPL + 16) r = { ...ROSTO_BASE, olhos: 0.6, sobrancelha: 28, sorriso: -0.9, boca: 0.8 };
  else r = { ...ROSTO_BASE, olhos: 0.72, sobrancelha: 18, sorriso: 0.15, canto: 0.6 };
  return { ...r, olhos: r.olhos * (f < P3 || f > EXPL + 30 ? piscar(g, "lu") : 1) };
};
const poderDe = (f: number) => (f >= EXPL ? 1 : ip(dois(f), [P3 + 10, P4 - 6], [0, 0.46]));

// ------------------------------------------------------------------ Diego
const B_D: Pose = { ...POSE_BASE, x: 760, y: 1500, escala: 0.55, vira: -0.35, cruzado: 1 };
const diegoP1 = (f0: number): Pose => {
  const f = dois(f0);
  const r = respira(f / 2, 9);
  return { ...B_D, estica: 1 + r * 0.01, cabeca: Math.sin(f * 0.05) * 2, agacha: f > 50 ? ip(f, [50, 60], [0, 8]) : 0 };
};
/** P5: Diego de perfil (olhando pra esquerda, onde está o Lucas), o vento da explosão empurra */
const B_D5: Pose = { ...PERFIL_BASE, x: 560, y: 1560, escala: 0.7, lado: -1 };
const D5 = (f0: number): Pose => {
  const f = dois(f0);
  const prot: Pose = { ...B_D5, agacha: 50, inclina: -14, cabeca: -10, bracoD: { ombro: 118, cotovelo: 108 }, bracoE: { ombro: 104, cotovelo: 118 }, maoD: "aberta", maoE: "aberta", peE: { dx: -70, dy: 0 }, peD: { dx: 70, dy: 0 } };
  return kPose(f, [
    [P5, { ...B_D5, agacha: 10, peE: { dx: -40, dy: 0 }, peD: { dx: 40, dy: 0 } }],
    [P5 + 6, prot, CURVA.sai],
    [P5 + 30, { ...prot, x: B_D5.x + 190, inclina: -18 }, CURVA.suave], // escorrega pra trás (pés arrastando)
    [P5 + 38, { ...prot, x: B_D5.x + 200, agacha: 60 }, CURVA.exagera],
    [P5 + 46, { ...B_D5, x: B_D5.x + 200, agacha: 30, inclina: -4, bracoD: { ombro: 40, cotovelo: 60 }, bracoE: { ombro: 30, cotovelo: 50 }, maoD: "aberta" }, CURVA.suave],
    [P6, { ...B_D5, x: B_D5.x + 200, agacha: 26, inclina: -2, bracoD: { ombro: 36, cotovelo: 56 }, maoD: "aberta" }],
  ]);
};

// camada de naturalidade (cabelo e barra da camiseta com mola; pés plantados — o Diego escorrega de propósito no P5)
const ANIM = criarAnimacao(
  DUR_R + 2,
  (f) => ({ L: lucasCru(f), D: diegoP1(f), D5: D5(f) }),
  { chao: 1500, pes: ["D5"], pesOp: { D5: { solto: (f) => f >= P5 + 6 && f < P5 + 38 } }, camera: false },
);

// ------------------------------------------------------------------ fundo 2D (o mesmo campo do 3D)
const Ceu: React.FC = () => <AbsoluteFill style={{ background: "linear-gradient(180deg, #3a2a5e 0%, #8a4a6a 38%, #e8805a 58%, #f6c27a 70%, #f6c27a 100%)" }} />;
const Campo2D: React.FC<{ horizonte: number; f: number; tremor?: number }> = ({ horizonte, f, tremor = 0 }) => (
  <svg width={W} height={H} style={{ position: "absolute" }}>
    {[[-80, 260, 120], [260, 340, 70], [640, 300, 100], [900, 380, 90]].map(([x, w, h], i) => (
      <rect key={i} x={x} y={horizonte - h} width={w} height={h + 4} fill="#7a4e5e" />
    ))}
    <rect x={0} y={horizonte} width={W} height={H - horizonte} fill={COR.chao} />
    {new Array(12).fill(0).map((_, i) => (
      <ellipse key={i} cx={random(`gx${i}`) * W} cy={horizonte + 40 + random(`gy${i}`) * (H - horizonte)} rx={60 + random(`gr${i}`) * 140} ry={14 + random(`gq${i}`) * 26} fill={COR.chaoEsc} opacity={0.35} />
    ))}
    {/* pedrinhas no chão (tremem na carga, de 2 em 2) */}
    {new Array(14).fill(0).map((_, i) => {
      const x = random(`px${i}`) * W;
      const y = horizonte + 80 + random(`py${i}`) * (H - horizonte - 120);
      const s = 0.6 + random(`ps${i}`) * 0.9;
      const pula = tremor * Math.abs(Math.sin(dois(f) * 0.9 + i)) * 10 * s;
      return <path key={i} d={`M ${x - 24 * s} ${y - pula} L ${x - 10 * s} ${y - 20 * s - pula} L ${x + 16 * s} ${y - 16 * s - pula} L ${x + 26 * s} ${y - pula} Z`} fill={i % 3 ? COR.pedra : COR.pedra2} stroke={CONTORNO} strokeWidth={5} strokeLinejoin="round" />;
    })}
  </svg>
);

const CEL_DIA: Cel = { luz: -160, sombra: 30, recorte: 9, corRecorte: "#ffe0a0" };
const celAura = (f: number): Cel => ({ luz: -100, sombra: 34, recorte: 10 + ip(f, [P3, P4], [0, 6]), corRecorte: COR.ouro, forcaRecorte: 1 });

const Titulo: React.FC<{ f: number }> = ({ f }) => {
  if (f > P2 + 6) return null;
  const s = spring({ frame: f - 4, fps: FPS_R, config: { mass: 0.7, stiffness: 160, damping: 11 } });
  const sai = ip(f, [P2 - 4, P2 + 2], [1, 0]);
  return (
    <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", transform: `scale(${s * (0.9 + 0.1 * sai)})`, opacity: sai, fontFamily: "Luckiest Guy", fontSize: 92, lineHeight: 1.08, color: "#fff", WebkitTextStroke: "12px #1d1424", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(29,20,36,0.5)" }}>
      E se você virasse
      <br />
      um <span style={{ color: "#ffd93a", fontSize: 120 }}>SAIYAJIN?</span>
    </div>
  );
};

// ------------------------------------------------------------------ planos 2D
const P1Cena: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + f * 0.0012;
  return (
    <AbsoluteFill>
      <Ceu />
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 70%" }}>
        <Campo2D horizonte={1150} f={f} />
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <Boneco2D id="d1" d={DIEGO} pose={ANIM.pose("D", f)} rosto={{ ...ROSTO_BASE, olhos: 0.6 * piscar(f / 2, "d1"), canto: 0.9, sorriso: 0.35, sobrancelha: 6, olhar: [-0.6, 0] }} cel={CEL_DIA} />
          <Boneco2D id="l1" d={LUCAS_SSJ} pose={ANIM.pose("L", f)} rosto={lucasRosto(f)} cel={CEL_DIA} />
        </svg>
      </AbsoluteFill>
      <Titulo f={f} />
    </AbsoluteFill>
  );
};

/** P2: close nos olhos (60–80) e plano baixo do chão com pedrinhas tremendo (80–96) */
const P2Cena: React.FC<{ f: number }> = ({ f }) => {
  const p = ANIM.pose("L", f);
  const [hx, hy] = posCabeca(p);
  const t = tremorJJK(f, [[P2, 5], [70, 6], [84, 8]], 10);
  if (f < P2b) {
    const zoom = 3.3 + ip(f, [P2, P2b], [0, 0.35], CURVA.suave);
    return (
      <AbsoluteFill>
        <Ceu />
        <AbsoluteFill style={{ transform: `translate(${t.x}px, ${t.y}px)` }}>
          <svg width={W} height={H}>
            <g transform={`translate(540 900) scale(${zoom}) translate(${-hx} ${-hy + 10})`}>
              <Campo2D horizonte={1150} f={f} />
              <Boneco2D id="l2" d={LUCAS_SSJ} pose={p} rosto={lucasRosto(f)} poder={poderDe(f)} cel={CEL_DIA} />
              <Veia x={hx + 70} y={hy - 70} f={f} de={P2 + 8} escala={0.5} />
            </g>
          </svg>
        </AbsoluteFill>
        <LinhasRadiais f={f} x={540} y={900} forca={ip(f, [P2, P2b], [0.2, 0.7])} cor="#fff4d0" />
      </AbsoluteFill>
    );
  }
  // plano baixo: chão grande, pés do Lucas, pedrinhas pulando
  return (
    <AbsoluteFill>
      <Ceu />
      <AbsoluteFill style={{ transform: `translate(${t.x}px, ${t.y}px)` }}>
        <svg width={W} height={H}>
          <g transform={`translate(540 1380) scale(2.7) translate(-400 -1470)`}>
            <Campo2D horizonte={1220} f={f} tremor={1} />
            <Boneco2D id="l2b" d={LUCAS_SSJ} pose={p} rosto={lucasRosto(f)} cel={CEL_DIA} />
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** P5: reação do Diego (vento da explosão vindo da esquerda) */
const P5Cena: React.FC<{ f: number }> = ({ f }) => {
  const p0 = ANIM.pose("D5", f);
  const vento = ip(f, [P5, P5 + 4, P6 - 20, P6], [0, 1, 0.6, 0.3]);
  const g = dois(f);
  const p: Pose = { ...p0, cabelo: p0.cabelo - vento * (22 + Math.sin(g * 1.3) * 6), barra: (p0.barra ?? 0) + vento * (26 + Math.sin(g * 1.7) * 10) };
  const t = tremorJJK(f, [[P5, 18], [P5 + 12, 8]], 9);
  const escorrega = f >= P5 + 6 && f < P5 + 38;
  const rosto: Rosto =
    f < P5 + 40
      ? { ...ROSTO_BASE, olhos: 0.35, sobrancelha: -10, sorriso: -0.6, boca: 0.3, suor: 0.6 }
      : { ...ROSTO_BASE, olhos: 1.28 * piscar(g / 2, "d5"), pupila: 0.45, sobrancelha: -14, sobrancelhaY: 14, sorriso: -0.5, boca: 0.55, suor: 1, palido: 0.3 };
  return (
    <AbsoluteFill>
      <Ceu />
      <AbsoluteFill style={{ transform: `translate(${t.x}px, ${t.y}px) rotate(${t.rot}deg)` }}>
        <svg width={W} height={H}>
          <g transform="translate(540 1050) scale(1.35) translate(-700 -1150)">
            <Campo2D horizonte={1160} f={f} />
            {escorrega
              ? [0, 1, 2].map((i) => {
                  const x = p.x - 40 + i * 50 - ((f + i * 5) % 14) * 4;
                  const s = 0.5 + ((f + i * 3) % 10) / 10;
                  return <ellipse key={i} cx={x} cy={1555} rx={40 * s} ry={16 * s} fill="#e8cfa8" opacity={0.8 - s * 0.4} stroke={CONTORNO} strokeWidth={4} />;
                })
              : null}
            <Boneco2D id="d5" d={DIEGO} pose={p} rosto={rosto} cel={{ luz: 180, sombra: 34, recorte: 12, corRecorte: COR.ouro }} />
          </g>
        </svg>
      </AbsoluteFill>
      {/* poeira e luz da explosão varrendo da esquerda */}
      <RiscosVelocidade f={f} forca={vento * 0.9} angulo={-4} cor="#fff1c8" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(255,210,90,0.55), rgba(255,210,90,0) 55%)", opacity: vento * 0.8, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ planos 3D (híbrido)
const orbita = (ang: number, dist: number, altura: number, alvoY: number, fov: number): Cam3D => {
  const a = (ang * Math.PI) / 180;
  return { pos: [Math.sin(a) * dist, altura, Math.cos(a) * dist], alvo: [0, alvoY, 0], fov };
};
/** câmera de cada plano 3D (anda a 24 qps, suave) */
const cam3D = (f: number): { cam: Cam3D; ang: number } => {
  if (f < P4) {
    // órbita de -70° a +70° com aceleração e desaceleração (nada linear) + leve subida
    const u = CURVA.suave(ip(f, [P3, P4], [0, 1]));
    const ang = -70 + 140 * u;
    return { cam: orbita(ang, 5.4 - 0.5 * u, 0.45 + 0.25 * u, 1.05, 38), ang };
  }
  if (f < P5) {
    const tr = tremorJJK(f, [[EXPL, 0.12], [EXPL + 6, 0.06]], 7);
    return { cam: { pos: [0.25 + tr.x, 0.32 + tr.y, 5.6], alvo: [0, 1.05, 0], fov: 42 }, ang: 3 };
  }
  // avanço em profundidade (dolly-in rápido com ease) e depois push lento
  const u = CURVA.suave(ip(f, [P6, P6 + 26], [0, 1]));
  const z = 16 - (16 - 4.9) * u - ip(f, [P6 + 26, DUR_R], [0, 0.45]);
  return { cam: { pos: [0.7 - 0.5 * u, 1.15 - 0.2 * u, z], alvo: [0, 1.0, 0], fov: 36 }, ang: 6 - 6 * u };
};

const Plano3D: React.FC<{ f: number }> = ({ f }) => {
  const g = f >= P4 && f < EXPL ? P4 : dois(f); // desenho e pedras de 2 em 2 (hit-stop congela)
  const { cam, ang } = cam3D(f);
  const pedras = f < P6 ? pedrasAura(g, P3 + 6, EXPL) : pedrasCaminho(g);
  const c: Cena3D = {
    cam,
    pedras,
    rachas: f < P6 ? ip(g, [P3 + 20, P4, EXPL + 6], [0, 0.6, 1], CURVA.sai) : 1,
    onda: f >= EXPL && f < P5 ? ip(f, [EXPL, EXPL + 16], [0, 1], CURVA.sai) : 0,
    recorte: f < P4 ? ip(g, [P3, P4], [0.2, 0.8]) : 1,
  };
  // o Lucas 2D pisa onde a origem do chão 3D aparece na tela, no tamanho da distância
  const [sx, sy] = projeta(cam, [0, 0, 0]);
  const [, topo] = projeta(cam, [0, 1.85, 0]);
  const p0 = ANIM.pose("L", f);
  const alturaPx = sy - topo;
  const base1 = { ...p0, escala: 1, x: 0, y: 0 };
  const h1 = -(posCabeca(base1)[1] - 160);
  const esc = alturaPx / h1;
  const vira = Math.max(-1, Math.min(1, -Math.sin((ang * Math.PI) / 180) * 1.15));
  const p: Pose = { ...p0, x: sx, y: sy, escala: esc, vira };
  const pd = poderDe(f);
  const forca = f < P4 ? ip(g, [P3, P4], [0.25, 0.75]) : f < P5 ? 1.05 : 0.8;
  const flash = f >= EXPL && f < EXPL + 2;
  const inverte = f >= EXPL + 2 && f < EXPL + 4;
  const t = f >= EXPL ? tremorJJK(f, [[EXPL, 26], [EXPL + 8, 10]], 8) : tremorJJK(f, [[P3, 4], [130, 5], [160, 7]], 14);
  return (
    <AbsoluteFill style={{ filter: inverte ? "invert(1) hue-rotate(180deg)" : undefined }}>
      <Ceu />
      <AbsoluteFill style={{ transform: `translate(${t.x}px, ${t.y}px) rotate(${t.rot}deg)` }}>
        <Fundo3D c={c} />
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <AuraForte x={sx} chao={sy} altura={alturaPx * 1.12} f={f} forca={forca} caos={f >= EXPL ? 0.6 : ip(g, [P3, P4], [0, 0.4])} cor={AURA.cor} clara={AURA.clara} id="au3" />
          <Boneco2D id="l3" d={LUCAS_SSJ} pose={p} rosto={lucasRosto(f)} poder={pd} cel={celAura(f)} />
        </svg>
        <Frente3D c={c} />
      </AbsoluteFill>
      {f >= P6 ? <RiscosVelocidade f={f} forca={ip(f, [P6, P6 + 6, P6 + 22, P6 + 28], [0, 0.8, 0.8, 0])} angulo={90} cor="#fff1c8" cx={sx} cy={sy - alturaPx * 0.5} /> : null}
      {flash ? <AbsoluteFill style={{ background: "#fffbe6" }} /> : null}
      {f >= P6 + 30 ? <Carimbo f={f} de={P6 + 30} /> : null}
    </AbsoluteFill>
  );
};

const Carimbo: React.FC<{ f: number; de: number }> = ({ f, de }) => {
  const s = spring({ frame: f - de, fps: FPS_R, config: { mass: 0.6, stiffness: 260, damping: 12 } });
  return (
    <div style={{ position: "absolute", top: 140, width: "100%", textAlign: "center", transform: `scale(${2.4 - 1.4 * s}) rotate(${-8 + (1 - s) * -20}deg)`, opacity: Math.min(1, s * 2), fontFamily: "Luckiest Guy", fontSize: 150, color: "#ffd93a", WebkitTextStroke: "16px #1d1424", paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(29,20,36,0.5), 0 0 40px rgba(255,200,60,0.8)" }}>
      SAIYAJIN!
    </div>
  );
};

// ------------------------------------------------------------------ montagem
const Quadro: React.FC = () => {
  const f = useCurrentFrame();
  let cena: React.ReactNode;
  if (f < P2) cena = <P1Cena f={f} />;
  else if (f < P3) cena = <P2Cena f={f} />;
  else if (f < P5 || f >= P6) cena = <Plano3D f={f} />;
  else cena = <P5Cena f={f} />;
  return <GradeJJK tom="dia" vinheta={0.6}>{cena}</GradeJJK>;
};

const SFX: [number, string, number, number?][] = [
  [40, "whoosh", 0.25],
  [P2, "rumble", 0.5, 5],
  [P2 + 2, "coracao", 0.45, 1.5],
  [P3, "carga", 0.5, 3.5],
  [P3 + 4, "aura", 0.45, 4],
  [EXPL, "explosao", 0.75],
  [EXPL, "impacto", 0.5],
  [P5, "vento", 0.5, 2.6],
  [P5 + 6, "deslize", 0.4],
  [P6, "whoosh", 0.5],
  [P6 + 2, "aura", 0.35, 2],
  [P6 + 30, "brilho", 0.5],
  [P6 + 30, "impacto", 0.35],
];

export const SaiyajinRemake: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Quadro />
    <Html5Audio src={staticFile("musica/trilha-luta.wav")} volume={(f) => interpolate(f, [0, 10, 160, 176, EXPL, EXPL + 8, DUR_R - 10, DUR_R], [0, 0.22, 0.22, 0, 0, 0.3, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    {SFX.map(([de, src, vol, max], i) => (
      <Sequence key={i} from={de} durationInFrames={max ? Math.round(max * FPS_R) : undefined} layout="none">
        <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);


