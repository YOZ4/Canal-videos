import { AbsoluteFill, Html5Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, posCabeca, posPe, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y, RuaNoite } from "../../estilo2d/Cenario2D";
import { Poeira } from "../../estilo2d/Efeitos2D";
import { Chamas, CorteArco, Faiscas, Fumaca, OndaChoque, Onomatopeia, Rastro } from "../../estilo2d/EfeitosLuta";
import { CURVA, andarPerfil, balancoCabelo, giro, k, kPose, kRosto, piscar, respira, tremor } from "../../estilo2d/anim";
import { Espada } from "../../estilo2d/Objetos";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { LegendaPalavra, Selo, frase } from "../../estilo2d/UI";

// ---------------- roteiro (30 fps) ----------------
const T_VS = 40;
const T_CU1 = 75;
const T_CU2 = 88;
const T_DASH = 100;
const T_CHOQUE = 118;
const T_CORTE = 142;
const T_MORTAL = 146;
const T_POUSO = 164;
const T_FOGO = 175;
const T_FOGO2 = 200;
const T_LAMINA = 225;
const T_OLHO_L = 262;
const T_OLHO_D = 270;
const T_PRETO = 278;
const T_DASH2 = 286;
const T_CHOQUE2 = 292;
const T_PASSA = 338;
const T_RONCO = 392;
const T_QUEDA = 405;
const T_GIRO_D = 414;
export const DURACAO = 450;

const ESC = 0.66;
const PALAVRAS = [...frase("Perna de *fogo...*", 180, 222), ...frase("contra a *lâmina.*", 228, 260), ...frase("Mas o Lucas perdeu... pra *fome.*", 398, 450)];

type Cam = { x: number; y: number; zoom: number; rot: number };
const camT = (c: Cam) => `translate(540 960) rotate(${c.rot}) scale(${c.zoom}) translate(${-c.x} ${-c.y})`;
const respiro = (f: number, fase = 0) => respira(f, fase) * 0.01;

// =====================================================================
// LUCAS (perfil olhando pra direita) — luta com as pernas
// =====================================================================
const LB: Pose = { ...PERFIL_BASE, escala: ESC, y: CHAO_Y };
const L_GUARDA: Pose = {
  ...LB,
  agacha: 26,
  inclina: 4,
  peE: { dx: -70, dy: 0 },
  peD: { dx: 80, dy: 0 },
  bracoE: { ombro: -18, cotovelo: 30 },
  bracoD: { ombro: -10, cotovelo: 34 },
};

const lucasBase = (f: number): Pose => {
  // --- entrada / encarando ---
  if (f < T_DASH) return { ...L_GUARDA, x: 700, estica: 1 + respiro(f) };
  // --- corrida até o choque ---
  if (f < T_CHOQUE - 4) {
    const w = andarPerfil(f, 1.5, 5);
    const x = k(f, [[T_DASH, 700], [T_CHOQUE - 4, 960, CURVA.entra]]);
    return { ...LB, x, y: CHAO_Y - w.bob, inclina: 16, peE: w.peE, peD: w.peD, bracoE: { ombro: -50, cotovelo: 40 }, bracoD: { ombro: 40, cotovelo: 60 } };
  }
  // --- chute alto (com hit-stop) ---
  const chute: Pose = {
    ...LB,
    x: 1000,
    inclina: -20,
    agacha: 14,
    peE: { dx: -30, dy: 0 },
    peD: { dx: 320, dy: -330 },
    bracoE: { ombro: -70, cotovelo: 20 },
    bracoD: { ombro: 50, cotovelo: 30 },
    maoD: "punho",
  };
  const encolhe: Pose = { ...chute, x: 980, inclina: -6, peD: { dx: 140, dy: -200 } };
  if (f < T_CORTE) {
    if (f < T_CHOQUE) return kPose(f, [[T_CHOQUE - 4, { ...encolhe, x: 960 }], [T_CHOQUE, chute, CURVA.sai]]);
    if (f < T_CHOQUE + 6) return chute; // hit-stop
    return kPose(f, [[T_CHOQUE + 6, chute], [T_CHOQUE + 16, { ...L_GUARDA, x: 860 }, CURVA.exagera]]);
  }
  // --- desvia do corte com um mortal pra trás ---
  if (f < T_FOGO) {
    const agachado: Pose = { ...L_GUARDA, x: 860, agacha: 120, estica: 0.9, inclina: 10 };
    if (f < T_MORTAL) return kPose(f, [[T_CORTE, { ...L_GUARDA, x: 860 }], [T_MORTAL, agachado, CURVA.entra]]);
    if (f < T_POUSO) {
      const t = (f - T_MORTAL) / (T_POUSO - T_MORTAL);
      const altura = 4 * 320 * t * (1 - t);
      return {
        ...LB,
        x: 860 - 200 * t,
        y: CHAO_Y - altura,
        gira: -360 * CURVA.suave(t),
        estica: 1.05,
        agacha: 40,
        peE: { dx: 60, dy: -170 },
        peD: { dx: 90, dy: -190 },
        bracoE: { ombro: 60, cotovelo: 60 },
        bracoD: { ombro: 70, cotovelo: 60 },
      };
    }
    const pouso: Pose = { ...L_GUARDA, x: 660, agacha: 150, estica: 0.84, inclina: 18, bracoD: { ombro: 60, cotovelo: 20 }, maoD: "aberta" };
    return kPose(f, [[T_POUSO, pouso], [T_POUSO + 11, { ...L_GUARDA, x: 660 }, CURVA.exagera]]);
  }
  // --- perna de fogo: postura com a perna da frente levantada ---
  const fogoPose: Pose = { ...L_GUARDA, x: 660, agacha: 40, inclina: -4, peD: { dx: 150, dy: -90 }, bracoE: { ombro: -30, cotovelo: 30 }, bracoD: { ombro: -20, cotovelo: 30 } };
  if (f < T_DASH2) return kPose(f, [[T_FOGO, { ...L_GUARDA, x: 660 }], [T_FOGO + 10, fogoPose, CURVA.exagera]]);
  // --- investida final (chute voador) ---
  const voadora: Pose = { ...LB, x: 1060, y: CHAO_Y - 120, gira: -12, inclina: -14, agacha: 30, peE: { dx: -60, dy: -100 }, peD: { dx: 330, dy: -250 }, bracoE: { ombro: -80, cotovelo: 20 }, bracoD: { ombro: 40, cotovelo: 30 } };
  if (f < T_CHOQUE2) return kPose(f, [[T_DASH2, { ...fogoPose, x: 660 }], [T_CHOQUE2, voadora, CURVA.entra]]);
  if (f < T_PASSA) return voadora;
  // --- depois do choque: passou do outro lado, de costas pro Diego ---
  const ajoelhado: Pose = { ...LB, x: 1460, agacha: 150, inclina: 12, peE: { dx: -170, dy: 0 }, peD: { dx: 150, dy: 0 }, bracoE: { ombro: -60, cotovelo: 10 }, bracoD: { ombro: 30, cotovelo: 20 }, cabeca: 10 };
  const deBoa: Pose = { ...L_GUARDA, x: 1460, agacha: 0, inclina: -3, cabeca: -6 };
  const sentado: Pose = { ...LB, x: 1460, agacha: 340, inclina: 14, cabeca: 16, peE: { dx: 240, dy: 0 }, peD: { dx: 290, dy: 0 }, bracoE: { ombro: 26, cotovelo: 26 }, bracoD: { ombro: 34, cotovelo: 30 } };
  const p = kPose(f, [
    [T_PASSA, ajoelhado],
    [360, ajoelhado],
    [378, deBoa, CURVA.exagera],
    [T_RONCO, deBoa],
    [T_QUEDA - 4, { ...deBoa, agacha: 40, inclina: 8 }, CURVA.suave],
    [T_QUEDA, { ...sentado, agacha: 355, estica: 0.86 }, CURVA.entra],
    [T_QUEDA + 14, sentado, CURVA.exagera],
  ]);
  const cambaleia = f > T_RONCO && f < T_QUEDA ? Math.sin(f * 0.7) * 5 : 0;
  return { ...p, inclina: p.inclina + cambaleia, estica: p.estica + respiro(f) };
};
const lucasPose = (f: number): Pose => {
  const p = lucasBase(f);
  return { ...p, cabelo: balancoCabelo(f, (g) => lucasBase(g).x, (g) => lucasBase(g).inclina + lucasBase(g).gira * 0.1) };
};

const lucasRosto = (f: number): Rosto => {
  const serio: Rosto = { ...ROSTO_BASE, sobrancelha: 10, sorriso: 0.15, olhos: 0.9 };
  const confiante: Rosto = { ...serio, canto: 1, sorriso: 0.5, olhos: 0.8 };
  const grito: Rosto = { ...serio, olhos: 0.7, sobrancelha: 22, boca: 0.9, sorriso: 0 };
  const susto: Rosto = { ...serio, olhos: 1.25, sobrancelha: -10, sobrancelhaY: 14, boca: 0.4 };
  const fome: Rosto = { ...ROSTO_BASE, olhos: 0.45, sobrancelha: -16, sobrancelhaY: 8, sorriso: -0.7 };
  const r = kRosto(f, [
    [0, serio],
    [T_CU2, serio],
    [T_CU2 + 5, confiante, CURVA.exagera],
    [T_DASH, confiante],
    [T_DASH + 4, grito],
    [T_CHOQUE + 16, grito],
    [T_CORTE, serio],
    [T_CORTE + 3, susto, CURVA.exagera],
    [T_POUSO + 6, susto],
    [T_POUSO + 14, confiante],
    [T_FOGO + 8, { ...confiante, sobrancelha: 16 }],
    [T_DASH2 - 1, { ...confiante, sobrancelha: 18, canto: 0.4, sorriso: 0.2 }],
    [T_DASH2 + 2, grito],
    [T_PASSA, confiante],
    [T_RONCO, confiante],
    [T_RONCO + 5, susto, CURVA.exagera],
    [T_QUEDA, susto],
    [T_QUEDA + 6, fome],
  ]);
  return { ...r, olhos: r.olhos * piscar(f, "luta-l") };
};

// =====================================================================
// DIEGO (perfil olhando pra esquerda) — luta com espada
// =====================================================================
const DB: Pose = { ...PERFIL_BASE, escala: ESC, y: CHAO_Y, lado: -1 };
const D_GUARDA: Pose = {
  ...DB,
  agacha: 20,
  inclina: 3,
  peE: { dx: -70, dy: 0 },
  peD: { dx: 70, dy: 0 },
  bracoE: { ombro: -10, cotovelo: 20 },
  bracoD: { ombro: 30, cotovelo: 20 },
};

const diegoBase = (f: number): Pose => {
  if (f < T_DASH) return { ...D_GUARDA, x: 1500, estica: 1 + respiro(f, 20) };
  if (f < T_CHOQUE - 2) {
    const w = andarPerfil(f, 1.4, 5);
    const x = k(f, [[T_DASH, 1500], [T_CHOQUE - 2, 1240, CURVA.entra]]);
    return { ...DB, x, y: CHAO_Y - w.bob, inclina: 14, peE: w.peE, peD: w.peD, bracoE: { ombro: -40, cotovelo: 30 }, bracoD: { ombro: -30, cotovelo: 40 } };
  }
  const defesa: Pose = { ...D_GUARDA, x: 1220, agacha: 50, inclina: -6, bracoD: { ombro: 78, cotovelo: 86 }, bracoE: { ombro: 60, cotovelo: 80 } };
  if (f < T_CORTE - 6) {
    if (f < T_CHOQUE + 6) return kPose(f, [[T_CHOQUE - 2, { ...defesa, x: 1240 }], [T_CHOQUE, defesa, CURVA.sai]]);
    return kPose(f, [[T_CHOQUE + 6, defesa], [T_CHOQUE + 16, { ...D_GUARDA, x: 1330 }, CURVA.exagera]]);
  }
  // --- corte descendo ---
  const ergue: Pose = { ...D_GUARDA, x: 1330, agacha: 40, inclina: -10, bracoD: { ombro: 165, cotovelo: 10 }, bracoE: { ombro: 150, cotovelo: 20 } };
  const desce: Pose = { ...D_GUARDA, x: 1060, agacha: 80, inclina: 22, peD: { dx: 150, dy: 0 }, peE: { dx: -120, dy: 0 }, bracoD: { ombro: 40, cotovelo: -10 }, bracoE: { ombro: 30, cotovelo: 10 } };
  if (f < T_FOGO) {
    return kPose(f, [
      [T_CORTE - 6, { ...D_GUARDA, x: 1330 }],
      [T_CORTE, ergue, CURVA.antecipa],
      [T_CORTE + 5, desce, CURVA.sai],
      [T_CORTE + 14, desce],
      [T_CORTE + 26, { ...D_GUARDA, x: 1100 }, CURVA.suave],
    ]);
  }
  // --- lâmina energizada: postura com as duas mãos ---
  const postura: Pose = { ...D_GUARDA, x: 1100, agacha: 60, inclina: 6, bracoD: { ombro: 64, cotovelo: 64 }, bracoE: { ombro: 58, cotovelo: 70 } };
  if (f < T_DASH2) return kPose(f, [[T_LAMINA - 6, { ...D_GUARDA, x: 1100 }], [T_LAMINA + 6, postura, CURVA.exagera]]);
  // --- investida final ---
  const golpe: Pose = { ...D_GUARDA, x: 1150, agacha: 90, inclina: 24, peD: { dx: 170, dy: 0 }, peE: { dx: -150, dy: 0 }, bracoD: { ombro: 96, cotovelo: 0 }, bracoE: { ombro: 90, cotovelo: 6 } };
  if (f < T_CHOQUE2) return kPose(f, [[T_DASH2, postura], [T_CHOQUE2, golpe, CURVA.entra]]);
  if (f < T_PASSA) return golpe;
  // --- passou do outro lado ---
  const finalizado: Pose = { ...D_GUARDA, x: 740, agacha: 110, inclina: 18, peD: { dx: 170, dy: 0 }, peE: { dx: -170, dy: 0 }, bracoD: { ombro: 120, cotovelo: -20 }, bracoE: { ombro: 20, cotovelo: 20 } };
  const relaxa: Pose = { ...D_GUARDA, x: 740, agacha: 0, inclina: -2, bracoD: { ombro: 10, cotovelo: 10 }, bracoE: { ombro: -6, cotovelo: 10 } };
  return kPose(f, [
    [T_PASSA, finalizado],
    [362, finalizado],
    [382, relaxa, CURVA.exagera],
  ]);
};

const diegoPose = (f: number): Pose => {
  const b = diegoBase(f);
  // depois do tombo do Lucas, o Diego vira (perfil -> 3/4) com sorrisinho
  const g = giro(f, T_GIRO_D, 8);
  const final = g.trocou ? { ...POSE_BASE, escala: ESC, x: 740, y: CHAO_Y, vira: 0.5, cruzado: 0, bracoD: { ombro: 150, cotovelo: 150 }, bracoE: { ombro: 16, cotovelo: -10 }, cabeca: 6 } : b;
  const p = { ...final, largura: g.largura };
  return { ...p, cabelo: balancoCabelo(f, (q) => diegoBase(q).x * diegoBase(q).lado, (q) => diegoBase(q).inclina) };
};

const diegoRosto = (f: number): Rosto => {
  const DR: Rosto = { ...ROSTO_BASE, olhos: 0.6, canto: 0.6, sorriso: 0.2, sobrancelha: 10 };
  const fino: Rosto = { ...DR, olhos: 0.38, sobrancelha: 18, canto: 0.2 };
  const grito: Rosto = { ...DR, olhos: 0.6, sobrancelha: 22, boca: 0.8, canto: 0 };
  const debochado: Rosto = { ...DR, olhos: 0.55, canto: 1, sorriso: 0.5, sobrancelhaY: 16, olhar: [0.6, 0.4] };
  const r = kRosto(f, [
    [0, DR],
    [T_CU1 + 2, DR],
    [T_CU1 + 7, fino, CURVA.exagera],
    [T_DASH, fino],
    [T_DASH + 4, grito],
    [T_CHOQUE + 16, { ...DR, sobrancelha: 18 }],
    [T_CORTE, grito],
    [T_CORTE + 20, fino],
    [T_DASH2, grito],
    [T_PASSA, fino],
    [T_GIRO_D + 6, fino],
    [T_GIRO_D + 14, debochado, CURVA.exagera],
  ]);
  return { ...r, olhos: r.olhos * piscar(f, "luta-d") };
};

const brilhoEspada = (f: number) =>
  f < T_LAMINA ? 0 : f < T_CHOQUE2 + 8 ? interpolate(f, [T_LAMINA, T_LAMINA + 14], [0, 1], { extrapolateRight: "clamp" }) : interpolate(f, [T_CHOQUE2 + 8, T_PASSA + 20], [1, 0], { extrapolateRight: "clamp" });

const fogoLucas = (f: number) =>
  f < T_FOGO + 3 ? 0 : f < T_PASSA ? interpolate(f, [T_FOGO + 3, T_FOGO + 22], [0, 1], { extrapolateRight: "clamp" }) : interpolate(f, [T_PASSA, 370], [0.8, 0], { extrapolateRight: "clamp" });

// =====================================================================
// CÂMERA
// =====================================================================
const camera = (f: number): Cam => {
  const l = lucasBase(f);
  const d = diegoBase(f);
  const sh = (de: number, dur: number, forca: number) => (f >= de && f < de + dur ? tremor(f, forca * (1 - (f - de) / dur)) : { x: 0, y: 0 });
  let c: Cam;
  if (f < T_CU1) c = { x: 1100, y: 1060, zoom: k(f, [[0, 0.76], [T_CU1, 0.84]]), rot: 0 };
  else if (f < T_CU2) {
    const [hx, hy] = posCabeca(d);
    c = { x: hx - 20, y: hy - 10, zoom: k(f, [[T_CU1, 3.0], [T_CU2, 3.3]]), rot: 0 };
  } else if (f < T_DASH) {
    const [hx, hy] = posCabeca(l);
    c = { x: hx + 30, y: hy - 10, zoom: k(f, [[T_CU2, 3.0], [T_DASH, 3.3]]), rot: 0 };
  } else if (f < T_CHOQUE) c = { x: 1100, y: 1080, zoom: k(f, [[T_DASH, 0.95], [T_CHOQUE, 1.08, CURVA.entra]]), rot: -3 };
  else if (f < T_CORTE - 6) c = { x: 1110, y: 1020, zoom: k(f, [[T_CHOQUE, 1.45], [T_CHOQUE + 8, 1.2, CURVA.sai]]), rot: 4 };
  else if (f < T_FOGO) c = { x: 1000, y: 1020, zoom: 1.0, rot: k(f, [[T_CORTE, 0], [T_CORTE + 4, -4]]) };
  else if (f < T_FOGO2) {
    const [px, py] = posPe(l, "D");
    c = { x: px - 40, y: py - 80, zoom: k(f, [[T_FOGO, 2.2], [T_FOGO2, 2.6]]), rot: -6 };
  } else if (f < T_LAMINA) c = { x: l.x + 90, y: 1060, zoom: k(f, [[T_FOGO2, 1.3], [T_LAMINA, 1.45]]), rot: 0 };
  else if (f < T_OLHO_L) c = { x: d.x - 120, y: 1040, zoom: k(f, [[T_LAMINA, 1.3], [T_OLHO_L, 1.55]]), rot: 3 };
  else if (f < T_OLHO_D) {
    const [hx, hy] = posCabeca(l);
    c = { x: hx + 55, y: hy - 8, zoom: 5.2, rot: 0 };
  } else if (f < T_PRETO) {
    const [hx, hy] = posCabeca(d);
    c = { x: hx - 55, y: hy - 8, zoom: 5.2, rot: 0 };
  } else if (f < T_CHOQUE2 + 8) c = { x: 1100, y: 1040, zoom: k(f, [[T_DASH2, 0.9], [T_CHOQUE2, 1.3, CURVA.entra]]), rot: 7 };
  else if (f < T_PASSA) c = { x: 1100, y: 1040, zoom: k(f, [[T_CHOQUE2 + 8, 1.3], [T_PASSA, 0.8, CURVA.sai]]), rot: k(f, [[T_CHOQUE2 + 8, 7], [T_PASSA, 0]]) };
  else if (f < T_RONCO) c = { x: 1100, y: 1060, zoom: 0.9, rot: 0 };
  else c = { x: k(f, [[T_RONCO, 1100], [T_RONCO + 14, 1250, CURVA.suave]]), y: 1080, zoom: k(f, [[T_RONCO, 0.8], [T_RONCO + 14, 0.95, CURVA.suave]]), rot: 0 };
  const s1 = sh(T_CHOQUE, 12, 22);
  const s2 = sh(T_POUSO, 8, 10);
  const s3 = sh(T_CHOQUE2, 26, 34);
  const s4 = sh(T_QUEDA, 8, 10);
  return { ...c, x: c.x + s1.x + s2.x + s3.x + s4.x, y: c.y + s1.y + s2.y + s3.y + s4.y };
};

// =====================================================================
// MUNDO
// =====================================================================
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const c = camera(f);
  const lp = lucasPose(f);
  const dp = diegoPose(f);
  const [lpx, lpy] = posPe(lp, "D");
  const meio = (lp.x + dp.x) / 2;
  const fogo = fogoLucas(f);
  const brilho = brilhoEspada(f);
  const correndo1 = f >= T_DASH && f < T_CHOQUE ? 1 : 0;
  const correndo2 = f >= T_DASH2 && f < T_CHOQUE2 ? 1 : 0;
  return (
    <svg width={1080} height={1920}>
      <g transform={camT(c)}>
        <RuaNoite camX={c.x - 1100} />
        {/* brilhos de energia no ambiente */}
        {fogo > 0 ? <rect x={-2000} y={-1000} width={6000} height={4000} fill="#ff7a1a" opacity={0.08 * fogo} /> : null}
        {brilho > 0 ? <rect x={-2000} y={-1000} width={6000} height={4000} fill="#5fc8ff" opacity={0.06 * brilho} /> : null}
        <Rastro x={lp.x} y={CHAO_Y} dir={1} forca={Math.max(correndo1, correndo2)} f={f} />
        <Rastro x={dp.x} y={CHAO_Y} dir={-1} forca={Math.max(correndo1, correndo2)} f={f} cor="#cfefff" />
        <Boneco2D id="dg" d={DIEGO} pose={dp} rosto={diegoRosto(f)} naMao={<Espada brilho={brilho} />} naMaoGira />
        <Boneco2D id="lc" d={LUCAS} pose={lp} rosto={lucasRosto(f)} />
        <Chamas x={lpx} y={lpy - 20} f={f} intensidade={fogo} tamanho={1.1} />
        {/* choque 1 */}
        <Faiscas x={lpx + 10} y={lpy} f={f} de={T_CHOQUE} dur={14} />
        <OndaChoque x={lpx} y={lpy} f={f} de={T_CHOQUE} dur={12} raio={420} />
        <Onomatopeia texto="CLANG!" x={lpx} y={lpy - 260} f={f} de={T_CHOQUE} dur={22} />
        {/* corte e mortal */}
        <CorteArco x={dp.x - 60} y={CHAO_Y - 560} r={430} de={280} ate={150} f={f} inicio={T_CORTE} fim={T_CORTE + 14} dur={8} />
        <Onomatopeia texto="VUSH!" x={760} y={700} f={f} de={T_MORTAL} dur={18} cor="#ffffff" giro={8} tamanho={120} />
        <Poeira x={660} y={CHAO_Y} f={f} de={T_POUSO} />
        {/* choque final */}
        <Faiscas x={meio} y={CHAO_Y - 400} f={f} de={T_CHOQUE2} dur={20} n={26} alcance={700} cor="#9fe2ff" />
        <Faiscas x={meio} y={CHAO_Y - 380} f={f} de={T_CHOQUE2 + 1} dur={20} n={20} alcance={600} cor="#ffb347" />
        <OndaChoque x={meio} y={CHAO_Y - 380} f={f} de={T_CHOQUE2} dur={18} raio={1300} />
        <OndaChoque x={meio} y={CHAO_Y} f={f} de={T_CHOQUE2 + 2} dur={20} raio={1400} achatado={0.18} cor="#ffd9a8" />
        <Fumaca x={meio} y={CHAO_Y} f={f} de={T_CHOQUE2 + 4} dur={T_PASSA + 24 - T_CHOQUE2} tamanho={1.6} />
        <Onomatopeia texto="BUUUM!" x={meio} y={CHAO_Y - 900} f={f} de={T_CHOQUE2 + 2} dur={34} tamanho={220} />
        {/* final cômico */}
        <Poeira x={1600} y={CHAO_Y} f={f} de={T_QUEDA} />
        {f >= T_RONCO && f < T_QUEDA + 30 ? (
          <Onomatopeia texto="ronc..." x={lp.x + 260} y={CHAO_Y - 560} f={f} de={T_RONCO} dur={40} cor="#ffffff" tamanho={90} giro={-4} />
        ) : null}
      </g>
    </svg>
  );
};

// =====================================================================
// CARTÃO "VS"
// =====================================================================
const CartaoVS: React.FC = () => {
  const f = useCurrentFrame(); // local
  const { fps } = useVideoConfig();
  const entra = spring({ frame: f, fps, config: { damping: 14, stiffness: 180 } });
  const sai = interpolate(f, [28, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vs = spring({ frame: f - 6, fps, config: { damping: 8, stiffness: 220 } });
  const treme = f > 6 && f < 14 ? tremor(f, 10) : { x: 0, y: 0 };
  const lucas: Pose = { ...POSE_BASE, x: 330, y: 1150, escala: 0.95, vira: 0.45, bracoE: { ombro: 20, cotovelo: -20 }, bracoD: { ombro: 40, cotovelo: -110 }, maoD: "joia" };
  const diego: Pose = { ...POSE_BASE, x: 760, y: 2070, escala: 0.95, vira: -0.45, bracoD: { ombro: 150, cotovelo: 150 }, bracoE: { ombro: 16, cotovelo: -20 } };
  return (
    <AbsoluteFill style={{ transform: `translate(${treme.x}px, ${treme.y}px)` }}>
      <svg width={1080} height={1920}>
        <g transform={`translate(${(-1 + entra) * 1100 - sai * 1100} 0)`}>
          <path d="M 0 0 L 1080 0 L 1080 760 L 0 1060 Z" fill="#f4c531" stroke="#1d1424" strokeWidth={14} />
          {new Array(10).fill(0).map((_, i) => (
            <path key={i} d={`M ${-100 + i * 140} 0 L ${-300 + i * 140} 1100`} stroke="#ffe27a" strokeWidth={30} opacity={0.5} />
          ))}
          <clipPath id="vsTopo">
            <path d="M 0 0 L 1080 0 L 1080 760 L 0 1060 Z" />
          </clipPath>
          <g clipPath="url(#vsTopo)">
            <Boneco2D id="vsl" d={LUCAS} pose={lucas} rosto={{ ...ROSTO_BASE, canto: 1, sorriso: 0.6, sobrancelha: 12, olhos: 0.85 }} />
          </g>
          <text x={1020} y={260} textAnchor="end" fontFamily="Fredoka" fontWeight={700} fontSize={150} fill="#ffffff" stroke="#1d1424" strokeWidth={18} paintOrder="stroke">
            LUCAS
          </text>
          <text x={1020} y={350} textAnchor="end" fontFamily="Fredoka" fontWeight={700} fontSize={54} fill="#1d1424">
            O CHUTADOR
          </text>
        </g>
        <g transform={`translate(${(1 - entra) * 1100 + sai * 1100} 0)`}>
          <path d="M 0 1060 L 1080 760 L 1080 1920 L 0 1920 Z" fill="#2f9e57" stroke="#1d1424" strokeWidth={14} />
          {new Array(10).fill(0).map((_, i) => (
            <path key={i} d={`M ${-100 + i * 140} 760 L ${-300 + i * 140} 1920`} stroke="#5fc27f" strokeWidth={30} opacity={0.5} />
          ))}
          <clipPath id="vsBase">
            <path d="M 0 1060 L 1080 760 L 1080 1920 L 0 1920 Z" />
          </clipPath>
          <g clipPath="url(#vsBase)">
            <Boneco2D id="vsd" d={DIEGO} pose={diego} rosto={{ ...ROSTO_BASE, olhos: 0.5, canto: 0.9, sorriso: 0.4, sobrancelha: 14 }} naMao={<Espada />} naMaoGira />
          </g>
          <text x={60} y={1640} fontFamily="Fredoka" fontWeight={700} fontSize={150} fill="#ffffff" stroke="#1d1424" strokeWidth={18} paintOrder="stroke">
            DIEGO
          </text>
          <text x={60} y={1730} fontFamily="Fredoka" fontWeight={700} fontSize={54} fill="#1d1424">
            O ESPADACHIM
          </text>
        </g>
        <g transform={`translate(540 910) scale(${vs * (1 - sai)}) rotate(-8)`}>
          <circle r={150} fill="#e8343f" stroke="#1d1424" strokeWidth={14} />
          <text textAnchor="middle" dominantBaseline="central" fontFamily="Fredoka" fontWeight={700} fontSize={170} fill="#ffffff" stroke="#1d1424" strokeWidth={14} paintOrder="stroke">
            VS
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// =====================================================================

const Som: React.FC<{ src: string; de: number; volume?: number }> = ({ src, de, volume = 0.6 }) => (
  <Sequence from={de} layout="none">
    <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

const BrilhoOlho: React.FC<{ cor: string }> = ({ cor }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 55% 50%, ${cor} 0%, transparent 45%)`, mixBlendMode: "screen", opacity: 0.55 }} />
);

export const LutaTeste: React.FC = () => {
  const f = useCurrentFrame();
  // quadros de impacto: cores invertidas por 1-2 frames
  const inverte = f === T_CHOQUE || f === T_CHOQUE2 + 1 || f === T_CHOQUE2 + 3;
  const flash = interpolate(f, [T_CHOQUE2 - 1, T_CHOQUE2, T_CHOQUE2 + 2], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const preto = f >= T_PRETO && f < T_DASH2;
  return (
    <AbsoluteFill style={{ background: "#141018" }}>
      <AbsoluteFill style={{ filter: inverte ? "invert(1) contrast(1.4)" : undefined }}>
        {f < T_VS || f >= T_CU1 - 1 ? <Mundo /> : null}
        {f >= T_OLHO_L && f < T_OLHO_D ? <BrilhoOlho cor="#ff8a1a" /> : null}
        {f >= T_OLHO_D && f < T_PRETO ? <BrilhoOlho cor="#5fc8ff" /> : null}
      </AbsoluteFill>
      <Sequence from={T_VS} durationInFrames={T_CU1 - T_VS}>
        <CartaoVS />
      </Sequence>
      {preto ? <AbsoluteFill style={{ background: "#000" }} /> : null}
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
      <Selo texto="LUCAS × DIEGO" de={4} ate={T_VS - 2} cor="#e8343f" />
      <Selo texto="VENCEDOR: A FOME" de={T_QUEDA + 16} cor="#ff9b2f" y={260} />
      <LegendaPalavra palavras={PALAVRAS} />

      {/* trilha: luta -> silêncio -> pancada -> silêncio -> música leve (piada) */}
      <Html5Audio
        src={staticFile("musica/trilha-luta.wav")}
        volume={(fr) =>
          interpolate(fr, [0, 10, T_VS, T_PRETO - 2, T_PRETO, T_CHOQUE2, T_CHOQUE2 + 1, T_PASSA - 10, T_PASSA], [0, 0.15, 0.3, 0.3, 0, 0, 0.32, 0.25, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <Sequence from={T_QUEDA + 4} layout="none">
        <Html5Audio src={staticFile("musica/trilha-leve.wav")} volume={(fr) => interpolate(fr, [0, 8, DURACAO - T_QUEDA - 14, DURACAO - T_QUEDA - 4], [0, 0.25, 0.25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>

      <Som src="rumble" de={0} volume={0.4} />
      <Som src="whoosh" de={T_VS} volume={0.5} />
      <Som src="impacto" de={T_VS + 6} volume={0.5} />
      <Som src="corte" de={T_CU1 + 4} volume={0.35} />
      <Som src="plim" de={T_CU2 + 4} volume={0.3} />
      <Som src="whoosh" de={T_DASH} volume={0.55} />
      <Som src="clang" de={T_CHOQUE} volume={0.6} />
      <Som src="impacto" de={T_CHOQUE} volume={0.5} />
      <Som src="corte" de={T_CORTE} volume={0.6} />
      <Som src="whoosh" de={T_MORTAL} volume={0.45} />
      <Som src="impacto" de={T_POUSO} volume={0.25} />
      <Som src="fogo" de={T_FOGO + 3} volume={0.6} />
      <Som src="fogo" de={T_FOGO2} volume={0.45} />
      <Som src="carga" de={T_LAMINA} volume={0.35} />
      <Som src="brilho" de={T_LAMINA + 8} volume={0.4} />
      <Som src="corte" de={T_OLHO_L} volume={0.35} />
      <Som src="corte" de={T_OLHO_D} volume={0.35} />
      <Som src="whoosh" de={T_DASH2} volume={0.6} />
      <Som src="explosao" de={T_CHOQUE2} volume={0.75} />
      <Som src="clang" de={T_CHOQUE2} volume={0.55} />
      <Som src="ronco" de={T_RONCO} volume={0.85} />
      <Som src="impacto" de={T_QUEDA} volume={0.4} />
      <Som src="whoosh" de={T_GIRO_D} volume={0.3} />
      <Som src="pop" de={T_QUEDA + 16} volume={0.5} />
    </AbsoluteFill>
  );
};
