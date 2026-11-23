import { AbsoluteFill, Html5Audio, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, posCabeca, posMao, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { AuraForte } from "../../estilo2d/Aura";
import { Poeira, Gota, Simbolo } from "../../estilo2d/Efeitos2D";
import { OndaChoque, Faiscas } from "../../estilo2d/EfeitosLuta";
import { CURVA, andarPerfil, balancoCabelo, fala, k, piscar, trocaRosto } from "../../estilo2d/anim";
import { poseCorrida } from "../../estilo2d/corrida";
import { entre, mola } from "../../estilo2d/movimento";
import { CelJJK, Desfoque, GradeJJK, LinhasRadiais, Particulas, Racha, RiscosVelocidade, tremorJJK, type TomGrade } from "../../estilo2d/EstiloJJK";
import { CeuExplosao, RuaAnime, type Ceu } from "../../estilo2d/CenariosBroly";
import { BonecoCima, PlanoCima, RachaCima } from "../../estilo2d/VistaCima";
import { transformCam, type Cam } from "../../estilo2d/Camera2D";
import { DIEGO, LUCAS, LUCAS_FURIA, LUCAS_PODER, type Design } from "../../estilo2d/personagens";
import { LegendaPalavra } from "../../estilo2d/UI";
import { Som } from "../Cacadores/comum";
import { DURACAO, F, FPS, LEGENDAS, falando } from "./tempo";

export { DURACAO };

/**
 * Episódio "Fúria verde" (24 qps, estilo JJK adaptado a cada ambiente, personagens de 2 em 2 quadros).
 * C1 0–362 cidade destruída à noite (gancho) · C2 362–645 cinco minutos antes (rua de dia) ·
 * C3 645–1060 transformação · C4 1060–1436 efeito colateral · C5 1436–1850 o poder sai do controle ·
 * C6 1850–fim a última provocação + perseguição.
 */
const C2 = 362;
const C3 = 645;
const C4 = 1060;
const C5 = 1436;
const C6 = 1850;
const ESC = 0.72;
const ESC_FURIA = 1.25;
const AURA = { cor: "#5cff2e", clara: "#e4ffb0" };
const dois = (f: number) => Math.floor(f / 2) * 2;
const M = (f: number, de: number, s: Parameters<typeof mola>[2]) => mola(f, de, s, FPS);

// ---------------- transformação (C3) ----------------
const T_AURA = 768; // aura aparece
const T_CABELO = 792; // cabelo vira espetado
const T_CRESCE = 800; // corpo começa a crescer
const T_RASGA = 818; // camiseta rasga (troca de desenho escondida pelo clarão)
const T_FLASH = 842; // fim da transformação (flash branco)
const poderLucas = (f: number) => (f < C3 ? 0 : f < T_CABELO ? interpolate(f, [672, T_CABELO], [0, 0.49], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : f < 812 ? 0.6 : 1);
const cresce = (f: number) => (f < T_CRESCE ? 0 : f < T_FLASH ? CURVA.antecipaExagera(Math.min(1, (f - T_CRESCE) / 36)) : 1);
/** força da aura do Lucas ao longo do episódio */
const auraLucas = (f: number) => {
  if (f < C2) return 0.85 + 0.15 * Math.sin(f * 0.2);
  if (f < T_AURA) return 0;
  if (f < C4) return k(f, [[T_AURA, 0], [T_FLASH - 4, 1, CURVA.entra], [T_FLASH + 30, 0.75]]);
  if (f < C5) return k(f, [[C4, 0.75], [1100, 0.35, CURVA.suave], [1215, 0.25], [1290, 0.55, CURVA.sai], [1336, 0.6], [1345, 1, CURVA.sai], [1430, 0.8]]);
  if (f < C6) return k(f, [[C5, 0.8], [1579, 0.9], [1612, 1], [1640, 0.7], [1705, 0.55], [1777, 0.4]]);
  return k(f, [[C6, 0.35], [2000, 0.25], [2116, 0.2], [2122, 1.3, CURVA.sai], [2160, 1]]);
};

// ---------------- posições por cena ----------------
type Cena = { ceu: Ceu; destruicao: 0 | 1 | 2; tom: TomGrade; rim: string; luz: number; brilhoVerde: number };
const cena = (f: number): Cena => {
  if (f < C2) return { ceu: "noite", destruicao: 2, tom: "noiteVerde", rim: "#9dff5a", luz: -90, brilhoVerde: 1 };
  if (f < C3) return { ceu: "dia", destruicao: 0, tom: "dia", rim: "#fff1c2", luz: -140, brilhoVerde: 0 };
  if (f < C4) {
    const v = k(f, [[680, 0], [T_FLASH, 1, CURVA.entra]]);
    return { ceu: v < 0.35 ? "dia" : "verde", destruicao: f >= T_FLASH ? 1 : 0, tom: v < 0.35 ? "dia" : "verde", rim: v < 0.35 ? "#fff1c2" : "#b6ff4a", luz: v < 0.35 ? -140 : -90, brilhoVerde: v };
  }
  if (f < C5) return { ceu: "verde", destruicao: 1, tom: "verde", rim: "#b6ff4a", luz: -90, brilhoVerde: 0.45 };
  if (f < C6) return { ceu: "verde", destruicao: 2, tom: "verde", rim: "#b6ff4a", luz: -90, brilhoVerde: f >= 1624 && f < 1700 ? 1.6 : 0.5 };
  return { ceu: "verde", destruicao: 2, tom: "verde", rim: "#b6ff4a", luz: -90, brilhoVerde: f >= 2122 ? 1.2 : 0.35 };
};

const vivo = (r: Rosto, f: number, quem: "D" | "L", semente: string): Rosto => ({
  ...r,
  olhos: r.olhos * piscar(f, semente),
  boca: falando(quem, f) ? Math.max(r.boca * 0.5, fala(f, semente)) : r.boca,
});

// ---------------- LUCAS ----------------
const lucasDesign = (f: number): Design => (f < C2 ? LUCAS_FURIA : f < C3 ? LUCAS : f < T_RASGA ? LUCAS_PODER : LUCAS_FURIA);
const RL = {
  calmo: { ...ROSTO_BASE, olhos: 0.7, sobrancelha: 14, sorriso: -0.1, olhar: [-0.3, 0.3] as [number, number] },
  convencido: { ...ROSTO_BASE, olhos: 0.75, sobrancelha: -4, sorriso: 0.7, canto: 0.4, olhar: [-0.6, 0] as [number, number] },
  serio: { ...ROSTO_BASE, olhos: 0.85, sobrancelha: 22, sorriso: -0.2, olhar: [-1, 0] as [number, number] },
  susto: { ...ROSTO_BASE, olhos: 1.2, sobrancelha: -12, sobrancelhaY: 10, boca: 0.35, sorriso: -0.6, olhar: [0, 0.4] as [number, number] },
  raiva: { ...ROSTO_BASE, olhos: 0.95, sobrancelha: 34, boca: 0.8, sorriso: -1, olhar: [0, 0] as [number, number] },
  fechado: { ...ROSTO_BASE, olhos: 0, sobrancelha: 18, sorriso: -0.3 },
  irritado: { ...ROSTO_BASE, olhos: 0.8, sobrancelha: 30, sorriso: -0.8, boca: 0.15, olhar: [-1, 0.5] as [number, number] },
  sereno: { ...ROSTO_BASE, olhos: 0, sobrancelha: 4, sorriso: 0.4 },
};
const rostoLucas = (f: number) =>
  trocaRosto(f, [
    [0, RL.irritado],
    [C2, RL.convencido, 0.3],
    [F(8) - 4, RL.convencido, 0.5],
    [C3, RL.serio, 0.6],
    [F(11) - 6, RL.susto, 1],
    [T_AURA, RL.raiva, 1.2],
    [F(14) - 4, RL.irritado, 0.6],
    [C4, RL.fechado, 0.4],
    [F(18) - 2, RL.sereno, 0.4],
    [F(20) - 4, RL.irritado, 1],
    [F(22) - 4, RL.raiva, 1.2],
    [C5 + 40, RL.susto, 0.8],
    [F(25) - 4, RL.raiva, 1],
    [1640, RL.susto, 1],
    [F(29) - 4, RL.fechado, 0.5],
    [C6, RL.serio, 0.4],
    [F(32) - 2, RL.calmo, 0.4],
    [F(34) - 2, RL.fechado, 0.4],
    [2116, { ...RL.fechado, sobrancelha: 26 }, 0.3],
    [2122, RL.raiva, 2],
  ]);

const lucasPose = (f: number): Pose => {
  // C1: gigante em fúria, de frente, punhos fechados
  if (f < C2) {
    const curva = k(f, [[168, 0], [200, 1, CURVA.sai], [300, 1], [330, 0.5, CURVA.suave]]);
    return { ...POSE_BASE, x: 620, y: CHAO_Y, escala: 1.55, largura: 1.3, biceps: 1, agacha: 50, inclina: 6 * curva, cabeca: 10 * curva, bracoE: { ombro: 36, cotovelo: -64 }, bracoD: { ombro: 36, cotovelo: -64 }, maoE: "punho", maoD: "punho", peE: { dx: -80, dy: 0 }, peD: { dx: 80, dy: 0 } };
  }
  // C2: caminhada de perfil, confiante
  if (f < C3) {
    const anda = f < 636;
    const w = andarPerfil(f, 1, 13);
    const para = k(f, [[626, 0], [640, 1, CURVA.sai]]);
    const x = 300 + Math.min(f, 636) * 2.6 - C2 * 2.6;
    return {
      ...PERFIL_BASE,
      x,
      y: CHAO_Y - (anda ? w.bob * (1 - para) : 0),
      escala: ESC,
      inclina: -3,
      cabeca: -4,
      peE: { dx: w.peE.dx * (1 - para) - 30 * para, dy: w.peE.dy * (1 - para) },
      peD: { dx: w.peD.dx * (1 - para) + 30 * para, dy: w.peD.dy * (1 - para) },
      bracoE: { ombro: w.bracoE.ombro * 0.6 * (1 - para) - 8, cotovelo: 30 },
      bracoD: { ombro: w.bracoD.ombro * 0.6 * (1 - para) - 8, cotovelo: 30 },
      maoE: "bola",
      maoD: "bola",
      vista: f < 630 ? "perfil" : "perfil",
    };
  }
  // C3+: de frente (encara o Diego) — cresce na transformação
  const g = cresce(f);
  const escala = entre(ESC, ESC_FURIA, g);
  const tremor = f >= T_AURA && f < T_FLASH ? Math.sin(f * 2.3) * 3 * auraLucas(f) : 0;
  const maos = f >= 714 && f < 760; // olha para as próprias mãos
  const base: Pose = {
    ...POSE_BASE,
    x: 360,
    y: CHAO_Y,
    escala,
    vira: 0.35,
    largura: 1 + 0.3 * g,
    biceps: g,
    agacha: 20 + 30 * g,
    inclina: tremor,
    cabeca: maos ? 18 : f >= T_AURA && f < T_FLASH ? -10 : 0,
    bracoE: maos ? { ombro: 60, cotovelo: 70 } : { ombro: 14 + 22 * g, cotovelo: -8 - 56 * g },
    bracoD: maos ? { ombro: 66, cotovelo: 64 } : { ombro: 14 + 22 * g, cotovelo: -8 - 56 * g },
    maoE: f >= T_AURA ? "punho" : maos ? "aberta" : "bola",
    maoD: f >= T_AURA ? "punho" : maos ? "aberta" : "bola",
    peE: { dx: -40 - 40 * g, dy: 0 },
    peD: { dx: 40 + 40 * g, dy: 0 },
  };
  if (f < C4) return { ...base, bracoE: f >= T_AURA && f < T_FLASH + 10 ? { ombro: 30, cotovelo: -70 } : base.bracoE, bracoD: f >= T_AURA && f < T_FLASH + 10 ? { ombro: 30, cotovelo: -70 } : base.bracoD };
  // C4: tenta respirar (ombros sobem/descem), treme de raiva no fim
  if (f < C5) {
    const resp = Math.sin(f * 0.09) * (f < 1336 ? 1 : 0.3);
    const raiva = f >= 1336 ? Math.sin(f * 2.1) * 3 : 0;
    return { ...base, x: 330, estica: 1 + resp * 0.02, inclina: raiva, bracoE: { ombro: 24 + resp * 6, cotovelo: -40 }, bracoD: { ombro: 24 + resp * 6, cotovelo: -40 } };
  }
  // C5: esfera na mão direita (sobe o braço) e lança para o céu
  if (f < C6) {
    const ergue = k(f, [[1440, 0], [1470, 1, CURVA.suave], [1600, 1], [1612, 1.6, CURVA.antecipa], [1618, 0.4, CURVA.sai], [1660, 0, CURVA.suave]]);
    const respira = f > 1705 ? Math.sin(f * 0.09) : 0;
    return {
      ...base,
      x: 330,
      estica: 1 + respira * 0.02,
      inclina: f >= 1579 && f < 1612 ? Math.sin(f * 2.1) * 3 : 0,
      bracoD: { ombro: 20 + 70 * Math.min(1, ergue) + 60 * Math.max(0, ergue - 1), cotovelo: -60 + 40 * Math.min(1, ergue) },
      maoD: ergue > 0.3 ? "aberta" : "punho",
    };
  }
  // C6: calmo; explode no fim e corre atrás do Diego
  if (f < 2160) {
    const respira = Math.sin(f * 0.08);
    const grita = f >= 2122 ? 1 : 0;
    return { ...base, x: 330, estica: 1 + respira * 0.02 + grita * 0.05, agacha: base.agacha + grita * 30, bracoE: grita ? { ombro: 40, cotovelo: -70 } : base.bracoE, bracoD: grita ? { ombro: 40, cotovelo: -70 } : base.bracoD, inclina: grita ? Math.sin(f * 2.5) * 4 : 0 };
  }
  // perseguição: corrida brutal de perfil, gigante
  const fase = (f - 2160) / 22;
  return { ...PERFIL_BASE, ...poseCorrida(fase, "rapida", 1), escala: ESC_FURIA * 1.15, largura: 1.3, biceps: 1, x: 200 + (f - 2160) * 14, y: CHAO_Y, inclina: 26, maoE: "punho", maoD: "punho" };
};

// ---------------- DIEGO ----------------
const RD = {
  tedio: { ...ROSTO_BASE, olhos: 0.45, sobrancelha: 10, sorriso: 0, canto: 0.3, olhar: [1, 0] as [number, number] },
  canto: { ...ROSTO_BASE, olhos: 0.45, canto: 1, sorriso: 0.4, sobrancelha: 16, olhar: [1, 0] as [number, number] },
  serio: { ...ROSTO_BASE, olhos: 0.55, sobrancelha: 20, sorriso: -0.1, olhar: [1, 0] as [number, number] },
  grito: { ...ROSTO_BASE, olhos: 1.3, sobrancelha: -14, sobrancelhaY: 12, boca: 1, sorriso: -0.4, olhar: [1, -0.3] as [number, number] },
  assustado: { ...ROSTO_BASE, olhos: 1.2, sobrancelha: -10, sobrancelhaY: 8, boca: 0.35, sorriso: -0.3, olhar: [1, -0.6] as [number, number] },
  cima: { ...ROSTO_BASE, olhos: 1.0, sobrancelha: -6, boca: 0.2, olhar: [0.6, -1] as [number, number] },
  panico: { ...ROSTO_BASE, olhos: 1.35, sobrancelha: -16, sobrancelhaY: 14, boca: 0.9, sorriso: -0.6, olhar: [1, 0] as [number, number] },
};
const rostoDiego = (f: number) =>
  trocaRosto(f, [
    [0, RD.serio],
    [F(3) - 3, RD.grito, 1.6],
    [F(4), RD.assustado, 0.6],
    [C2, RD.tedio, 0.3],
    [F(9) - 2, RD.canto, 0.5],
    [C3 + 20, RD.assustado, 0.8],
    [T_FLASH + 6, RD.cima, 1],
    [F(15), RD.tedio, 0.5],
    [C4, RD.serio, 0.4],
    [F(19) - 2, RD.canto, 0.6],
    [F(22), RD.assustado, 0.6],
    [F(23), RD.tedio, 0.4],
    [C5, RD.assustado, 0.8],
    [F(26), RD.grito, 1.2],
    [1612, RD.cima, 1.2],
    [1660, RD.serio, 0.6],
    [F(30), RD.canto, 0.5],
    [C6, RD.tedio, 0.4],
    [F(35) - 2, RD.canto, 0.6],
    [2124, RD.panico, 1.8],
  ]);

const diegoPose = (f: number): Pose => {
  if (f < C2) return { ...POSE_BASE, x: 250, y: CHAO_Y + 300, escala: 0.85, vira: 0.45, cabeca: f > 168 && f < 237 ? -12 : 0, bracoE: { ombro: 10, cotovelo: -6 }, bracoD: { ombro: f >= F(3) && f < F(4) ? 120 : 12, cotovelo: f >= F(3) && f < F(4) ? -30 : -6 }, maoD: f >= F(3) && f < F(4) ? "aberta" : "bola" };
  if (f < C3) {
    const w = andarPerfil(f + 6, 1, 14);
    const anda = f < 640;
    const x = 560 + Math.min(f, 640) * 2.6 - C2 * 2.6;
    return {
      ...PERFIL_BASE,
      x,
      y: CHAO_Y - (anda ? w.bob : 0),
      escala: ESC,
      inclina: 2,
      lado: f >= 630 ? -1 : 1,
      peE: anda ? w.peE : { dx: -30, dy: 0 },
      peD: anda ? w.peD : { dx: 30, dy: 0 },
      cruzado: 0,
      bracoE: { ombro: -14, cotovelo: 120 },
      bracoD: { ombro: -10, cotovelo: 124 },
    };
  }
  // C3+: Diego à direita, olhando o Lucas (perfil virado para a esquerda)
  const recua = f >= C4 + 340 ? M(f, F(23), "pesado") : 0; // passo para trás "sem perder a pose"
  const xd = f < C4 ? 760 : f < C5 ? 780 + 90 * recua : 800;
  const olhaCima = f >= T_FLASH && (f < C4 || (f >= 1612 && f < 1700));
  const p: Pose = { ...PERFIL_BASE, x: xd, y: CHAO_Y, escala: ESC, lado: -1, inclina: olhaCima ? -8 : 2, cabeca: olhaCima ? -18 : 0, cruzado: 0, bracoE: { ombro: -14, cotovelo: 120 }, bracoD: { ombro: -10, cotovelo: 124 } };
  if (f >= F(26) && f < F(27)) return { ...p, inclina: 10, bracoD: { ombro: 110, cotovelo: -20 }, maoD: "aberta" };
  if (f < 2124) return p;
  // foge correndo
  const fase = (f - 2124) / 12;
  const sai = Math.max(0, f - 2128);
  return { ...PERFIL_BASE, ...poseCorrida(fase, "rapida", 1), escala: ESC, x: xd + sai * 22, y: CHAO_Y, lado: 1, inclina: 30, maoE: "aberta", maoD: "aberta" };
};

const cabeloDe = (pose: (g: number) => Pose, f: number, k2 = 0.18) => balancoCabelo(dois(f) - 2, (g) => pose(g).x * k2 * (pose(g).lado ?? 1), (g) => pose(g).inclina + pose(g).agacha * 0.05);

// ---------------- PLANOS (cortes) ----------------
type Plano = { de: number; cam: (f: number, pl: Pose, pd: Pose) => Cam; so?: "L" | "D"; cima?: boolean; borrao?: number; fundo?: number };
const centro = (pl: Pose, pd: Pose) => (pl.x + pd.x) / 2;
const rosto = (p: Pose, dx = 0, dy = 0) => {
  const c = posCabeca(p);
  return [c[0] + dx, c[1] + dy] as const;
};
const PLANOS: Plano[] = [
  // C1 — gancho
  { de: 0, cam: (f) => ({ x: 560, y: 820, zoom: 0.42 + f * 0.0012, rot: -2 }) },
  { de: 40, cam: (f, _l, d) => ({ x: d.x + 40, y: d.y - 520, zoom: 1.3 + 0.5 * CURVA.sai(Math.min(1, (f - 40) / 5)), rot: 4 }), fundo: 3 },
  { de: 100, cam: (_f, _l, d) => ({ x: rosto(d)[0] + 60, y: rosto(d)[1] + 120, zoom: 1.9, rot: -3 }), fundo: 6 },
  { de: 168, cam: (f, l) => ({ x: l.x, y: CHAO_Y - 1180, zoom: 0.62 + (f - 168) * 0.0008, rot: -6 }) },
  { de: F(3) - 2, cam: (f, _l, d) => ({ x: rosto(d)[0] + 30, y: rosto(d)[1] + 60, zoom: 2.4 + 0.25 * CURVA.sai(Math.min(1, (f - F(3) + 2) / 4)), rot: 6 }), fundo: 8 },
  { de: F(4) - 2, cam: (_f, l, d) => ({ x: (l.x + d.x) / 2 + 40, y: CHAO_Y - 820, zoom: 0.55, rot: -4 }) },
  // C2 — cinco minutos antes (dia)
  { de: C2, cam: (f, l, d) => ({ x: centro(l, d) + 40, y: CHAO_Y - 420, zoom: 0.8, rot: 0 }) },
  { de: F(7) - 3, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 60, y: rosto(d)[1] + 260, zoom: 1.5, rot: -3 }), fundo: 3 },
  { de: F(8) - 3, cam: (_f, l) => ({ x: rosto(l)[0] + 40, y: rosto(l)[1] + 240, zoom: 1.55, rot: 3 }), fundo: 3 },
  { de: F(9) - 3, cam: (_f, l, d) => ({ x: centro(l, d), y: 0, zoom: 1.2, rot: -20 }), cima: true },
  // C3 — transformação
  { de: C3, cam: (f, l) => ({ x: rosto(l)[0] + 20, y: rosto(l)[1] + 60, zoom: 1.6 + (f - C3) * 0.02, rot: 2 }), fundo: 5 },
  { de: 672, cam: (_f, l, d) => ({ x: d.x - 120, y: CHAO_Y - 520, zoom: 1.15, rot: -4 }), fundo: 2 },
  { de: 714, cam: (_f, l) => { const m = posMao(l, "D"); return { x: m[0] - 40, y: m[1] - 40, zoom: 2.3, rot: 8 }; }, fundo: 7, so: "L" },
  { de: 738, cam: (f, l) => ({ x: rosto(l)[0] + 30, y: rosto(l)[1] + 10, zoom: 3.4 + (f - 738) * 0.01, rot: -5 }), fundo: 9, so: "L" },
  { de: 765, cam: (f, l, d) => ({ x: centro(l, d), y: CHAO_Y - 760 - cresce(f) * 160, zoom: 0.62 - cresce(f) * 0.06, rot: -3 }) },
  { de: F(13) - 3, cam: (_f, l, d) => ({ x: centro(l, d) + 60, y: CHAO_Y - 820, zoom: 0.62, rot: 5 }) },
  { de: F(14) - 3, cam: (_f, l) => ({ x: rosto(l)[0] - 20, y: rosto(l)[1] + 160, zoom: 1.35, rot: -7 }), fundo: 4, so: "L" },
  { de: F(15) - 3, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 80, y: rosto(d)[1] + 140, zoom: 1.7, rot: 6 }), fundo: 5, so: "D" },
  { de: 1012, cam: (_f, l, d) => ({ x: centro(l, d), y: 0, zoom: 1.0, rot: 24 }), cima: true },
  // C4 — efeito colateral
  { de: C4, cam: (f, l, d) => ({ x: centro(l, d) + 20, y: CHAO_Y - 760, zoom: 0.66 + (f - C4) * 0.0004, rot: -2 }) },
  { de: F(17) - 3, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 60, y: rosto(d)[1] + 200, zoom: 1.45, rot: 4 }), fundo: 4 },
  { de: F(18) - 3, cam: (_f, l) => ({ x: rosto(l)[0] + 20, y: rosto(l)[1] + 80, zoom: 1.7, rot: -3 }), fundo: 6, so: "L" },
  { de: F(19) - 3, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 30, y: rosto(d)[1] + 60, zoom: 2.4, rot: 5 }), fundo: 7, so: "D" },
  { de: F(20) - 3, cam: (_f, l) => ({ x: rosto(l)[0] + 10, y: rosto(l)[1] + 40, zoom: 2.4, rot: -5 }), fundo: 8, so: "L" },
  { de: F(21) - 3, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 60, y: rosto(d)[1] + 160, zoom: 1.6, rot: 3 }), fundo: 4 },
  { de: F(22) - 3, cam: (_f, l) => ({ x: l.x + 40, y: CHAO_Y - 1000, zoom: 0.78, rot: -8 }) },
  { de: F(23) - 3, cam: (_f, l, d) => ({ x: centro(l, d) + 60, y: CHAO_Y - 740, zoom: 0.66, rot: 2 }) },
  // C5 — o poder sai do controle
  { de: C5, cam: (f, l, d) => ({ x: centro(l, d), y: CHAO_Y - 800, zoom: 0.6 + (f - C5) * 0.0005, rot: -3 }) },
  { de: F(25) - 3, cam: (_f, l) => { const m = posMao(l, "D"); return { x: m[0] - 20, y: m[1] + 20, zoom: 1.9, rot: 7 }; }, fundo: 6 },
  { de: F(26) - 3, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 40, y: rosto(d)[1] + 120, zoom: 1.8, rot: -5 }), fundo: 6, so: "D" },
  { de: F(27) - 3, cam: (_f, l) => ({ x: l.x + 30, y: rosto(l)[1] + 420, zoom: 0.8, rot: 9 }) },
  { de: 1612, cam: (f) => ({ x: 560, y: entre(CHAO_Y - 1100, -1300, CURVA.sai(Math.min(1, (f - 1612) / 12))), zoom: 0.62, rot: -4 }) },
  { de: 1630, cam: (f) => ({ x: 560, y: 200, zoom: 0.34 + (f - 1630) * 0.0006, rot: 0 }) },
  { de: 1662, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 40, y: rosto(d)[1] + 80, zoom: 2.0, rot: 0 }), fundo: 7, so: "D" },
  { de: F(29) - 3, cam: (_f, l) => ({ x: rosto(l)[0] + 10, y: rosto(l)[1] + 220, zoom: 1.3, rot: -3 }), fundo: 4, so: "L" },
  { de: F(30) - 3, cam: (_f, l, d) => ({ x: centro(l, d) + 80, y: CHAO_Y - 760, zoom: 0.64, rot: 3 }) },
  // C6 — a última provocação
  { de: C6, cam: (f, l, d) => ({ x: centro(l, d) + 40, y: CHAO_Y - 780, zoom: 0.62 + (f - C6) * 0.0004, rot: -2 }) },
  { de: F(32) - 3, cam: (_f, l) => ({ x: rosto(l)[0] + 10, y: rosto(l)[1] + 140, zoom: 1.45, rot: 3 }), fundo: 5, so: "L" },
  { de: F(33) - 3, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 60, y: rosto(d)[1] + 150, zoom: 1.6, rot: -3 }), fundo: 4 },
  { de: F(34) - 3, cam: (_f, l, d) => ({ x: centro(l, d) + 20, y: CHAO_Y - 760, zoom: 0.66, rot: 2 }) },
  { de: F(35) - 3, cam: (_f, _l, d) => ({ x: rosto(d)[0] - 30, y: rosto(d)[1] + 50, zoom: 2.5, rot: 5 }), fundo: 8, so: "D" },
  { de: 2116, cam: (f, l) => ({ x: rosto(l)[0] + 10, y: rosto(l)[1] + 30, zoom: 2.6 + (f - 2116) * 0.02, rot: -2 }), fundo: 9, so: "L" },
  { de: 2122, cam: (_f, l) => ({ x: l.x, y: CHAO_Y - 1240, zoom: 0.58, rot: -10 }) },
  { de: 2160, cam: (f) => ({ x: 900 + (f - 2160) * 16, y: CHAO_Y - 900, zoom: 0.5, rot: 0 }) },
];
const planoAtual = (f: number) => [...PLANOS].reverse().find((p) => f >= p.de) ?? PLANOS[0];

const IMPACTOS: [number, number][] = [
  [175, 8],
  [T_AURA, 6],
  [T_CABELO, 10],
  [T_RASGA, 14],
  [T_FLASH, 22],
  [1345, 12],
  [1612, 16],
  [1630, 24],
  [2122, 28],
  [2166, 10],
  [2188, 10],
  [2210, 12],
];

export const Broly: React.FC = () => {
  const f = useCurrentFrame();
  const g = dois(f); // desenhos a 12 por segundo
  const c = cena(f);
  const pl0 = lucasPose(g);
  const pd0 = diegoPose(g);
  const pl: Pose = { ...pl0, cabelo: cabeloDe(lucasPose, f) + (auraLucas(f) > 0.2 ? Math.sin(f * 0.6) * 5 * auraLucas(f) : 0) };
  const pd: Pose = { ...pd0, cabelo: cabeloDe(diegoPose, f) + (auraLucas(f) > 0.4 ? Math.sin(f * 0.5 + 1) * 4 : 0) };
  const plano = planoAtual(f);
  const tr = tremorJJK(f, IMPACTOS);
  // tremor contínuo enquanto a aura está forte (cresce com a força)
  const aura = auraLucas(f);
  const vib = aura > 0.6 && f >= C3 ? tremorJJK(f, [[f - 1, (aura - 0.6) * 10]]) : { x: 0, y: 0, rot: 0 };
  const cam0 = plano.cam(f, pl, pd);
  const cam: Cam = { x: cam0.x + tr.x + vib.x, y: cam0.y + tr.y + vib.y, zoom: cam0.zoom, rot: cam0.rot + tr.rot };
  const rl = rostoLucas(g);
  const rd = rostoDiego(g);
  const dL = lucasDesign(f);
  const poder = f < C2 ? 1 : f < C3 ? 0 : poderLucas(f);
  const alturaL = 1220 * pl.escala;
  const cel = { luz: c.luz, sombra: 34, forca: 0.6, recorte: 10, corRecorte: c.rim };
  const lucasEl = (
    <CelJJK chave="lucas" luz={c.luz} sombra={0} recorte={0}>
      <Boneco2D id="lB" d={dL} pose={{ ...pl, estica: pl.estica * rl.corpo.estica }} rosto={vivo(rl.rosto, f, "L", "lB")} poder={poder} cel={cel} />
    </CelJJK>
  );
  const diegoEl = (
    <CelJJK chave="diego" luz={c.luz} sombra={0} recorte={0}>
      <Boneco2D id="dB" d={DIEGO} pose={{ ...pd, estica: pd.estica * rd.corpo.estica }} rosto={vivo(rd.rosto, f, "D", "dB")} cel={{ ...cel, corRecorte: f < C2 || f >= T_AURA ? c.rim : "#fff1c2" }} />
    </CelJJK>
  );
  // esfera de energia (C5)
  const esferaR = k(f, [[1440, 0], [1470, 16], [1540, 40], [1600, 90, CURVA.entra], [1612, 130]]);
  const mao = posMao(pl, "D");
  const esferaY = f < 1612 ? mao[1] - esferaR * 0.6 : mao[1] - (f - 1612) * 220;
  const mostraEsfera = f >= 1440 && f < 1630;
  const chaoCrateras = [2166, 2188, 2210, 2232];
  const mundo = (
    <svg width={1080} height={1920}>
      <g transform={transformCam(cam)}>
        <Desfoque chave="fundo" px={plano.fundo ?? 0}>
          <RuaAnime camX={cam.x} f={f} destruicao={c.destruicao} ceu={c.ceu} brilhoVerde={c.brilhoVerde} />
        </Desfoque>
        {/* cidade inteira iluminada pela explosão */}
        <CeuExplosao x={560} y={-1500} f={f} de={1628} />
        {/* rachaduras e crateras */}
        <Racha x={pl.x} f={f} de={T_CABELO} tamanho={1.2} />
        <Racha x={pl.x + 60} f={f} de={T_FLASH} tamanho={2.2} />
        <Racha x={pl.x + 120} f={f} de={1345} tamanho={1.1} />
        {chaoCrateras.map((d) => (
          <Racha key={d} x={200 + (d - 2160) * 14} f={f} de={d} tamanho={2} />
        ))}
        {/* pedras flutuando (transformação e fúria) */}
        {aura > 0.3 && f >= C3
          ? new Array(10).fill(0).map((_, i) => {
              const x0 = pl.x - 600 + random(`pf${i}`) * 1200;
              const sobe = ((f * (1.5 + random(`pv${i}`) * 2) + random(`py${i}`) * 400) % 500) * aura;
              return <path key={i} d={`M ${x0 - 14} ${CHAO_Y + 40 - sobe} l 22 -10 l 10 18 l -20 12 Z`} fill="#6a6870" stroke="#1d1424" strokeWidth={4} opacity={0.9} />;
            })
          : null}
        <OndaChoque x={pl.x} y={CHAO_Y} f={f} de={T_FLASH} dur={20} raio={1800} achatado={0.2} cor="#b6ff4a" />
        <OndaChoque x={pl.x} y={CHAO_Y} f={f} de={2122} dur={20} raio={2000} achatado={0.2} cor="#b6ff4a" />
        {plano.so !== "D" ? <AuraForte x={pl.x} chao={pl.y} altura={alturaL} f={f} forca={Math.min(1, aura) * (f >= T_AURA && f < T_FLASH + 12 ? 1 : f >= 2122 && f < 2170 ? 1 : 0.62)} caos={Math.max(0, aura - 0.6)} cor={AURA.cor} clara={AURA.clara} id="auL" /> : null}
        {plano.so !== "D" ? lucasEl : null}
        {plano.so !== "L" ? diegoEl : null}
        {/* esfera de energia */}
        {mostraEsfera ? (
          <g style={{ mixBlendMode: "screen" }}>
            <circle cx={mao[0]} cy={esferaY} r={esferaR * 2.4} fill={AURA.cor} opacity={0.25} />
            <circle cx={mao[0]} cy={esferaY} r={esferaR * 1.4} fill={AURA.cor} opacity={0.6} />
            <circle cx={mao[0]} cy={esferaY} r={esferaR} fill="#f2ffe0" />
            {f >= 1612 ? <rect x={mao[0] - esferaR * 0.6} y={esferaY} width={esferaR * 1.2} height={(f - 1612) * 220} fill={AURA.cor} opacity={0.45} /> : null}
          </g>
        ) : null}
        <Faiscas x={mao[0]} y={mao[1]} f={f} de={1600} dur={14} n={16} alcance={360} cor="#e4ffb0" />
        {f >= C2 && f < C3 ? null : <Particulas f={f} area={[cam.x - 900, cam.y - 1300, 1800, 2400]} cor="#b6ff4a" forca={Math.min(1, 0.3 + aura * 0.6)} semente="pb" />}
        {/* reações cômicas */}
        {f < C2 ? <Gota x={rosto(pd)[0] - 90} y={rosto(pd)[1] - 60} f={f} de={F(4) + 20} escala={0.8} /> : null}
        <Simbolo texto="!" x={rosto(pd)[0]} y={rosto(pd)[1] - 220} f={f} de={672} ate={700} />
        <Simbolo texto="!!" x={rosto(pd)[0]} y={rosto(pd)[1] - 220} f={f} de={2122} ate={2150} />
        <Poeira x={pd.x} y={CHAO_Y + 6} f={f} de={2128} dur={18} largura={0.7} />
        <LinhasRadiais f={f} x={pl.x} y={CHAO_Y - alturaL * 0.6} forca={f >= 2122 && f < 2134 ? 0.8 : f >= T_FLASH && f < T_FLASH + 8 ? 0.7 : 0} />
        <RiscosVelocidade f={f} forca={f >= 2160 ? 0.5 : 0} angulo={-4} cx={cam.x} cy={cam.y} />
      </g>
    </svg>
  );
  const cimaEl = (
    <PlanoCima x={cam.x} zoom={cam.zoom} rot={cam.rot}>
      <RachaCima x={pl.x} z={0} f={f} de={T_FLASH} tamanho={1.6} />
      <BonecoCima d={dL} pose={{ ...pl, y: 0 }} z={-60} />
      <BonecoCima d={DIEGO} pose={{ ...pd, y: 0 }} z={60} />
    </PlanoCima>
  );
  const borrao = f >= 2122 && f < 2126 ? 22 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <GradeJJK tom={c.tom} borrao={borrao}>{plano.cima ? cimaEl : mundo}</GradeJJK>
      {/* clarões */}
      {f >= T_RASGA && f < T_RASGA + 2 ? <AbsoluteFill style={{ background: "#eaffd6", opacity: 0.85 }} /> : null}
      {f >= T_FLASH && f < T_FLASH + 3 ? <AbsoluteFill style={{ background: "#ffffff", opacity: 1 - (f - T_FLASH) / 3 }} /> : null}
      {f >= 1628 && f < 1640 ? <AbsoluteFill style={{ background: "#9dff5a", opacity: 0.8 * (1 - (f - 1628) / 12), mixBlendMode: "screen" }} /> : null}
      {f >= 2122 && f < 2125 ? <AbsoluteFill style={{ background: "#eaffd6", opacity: 0.8 }} /> : null}
      {/* cartão "cinco minutos antes" */}
      {f >= C2 && f < C2 + 34 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: `rgba(10,14,24,${f < C2 + 4 ? 1 : 0.55 * (1 - (f - C2 - 4) / 30)})` }}>
          <div style={{ fontFamily: "Luckiest Guy", fontSize: 96, color: "#fff7e0", WebkitTextStroke: "10px #1d1424", paintOrder: "stroke fill", transform: `rotate(-4deg) scale(${0.9 + 0.1 * Math.min(1, (f - C2) / 4)})`, opacity: f < C2 + 26 ? 1 : 1 - (f - C2 - 26) / 8 }}>
            CINCO MINUTOS ANTES
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= DURACAO - 14 ? <AbsoluteFill style={{ background: "#000" }} /> : null}
      <LegendaPalavra palavras={LEGENDAS} y={1560} tamanho={86} />
      {/* áudio */}
      <Html5Audio src={staticFile("narracao/broly.mp3")} volume={1} />
      <Sequence from={C2} durationInFrames={C3 - C2}>
        <Html5Audio src={staticFile("musica/trilha-leve.wav")} volume={0.08} />
      </Sequence>
      <Sequence durationInFrames={C2}>
        <Html5Audio src={staticFile("musica/trilha-luta.wav")} volume={0.05} />
      </Sequence>
      <Sequence from={C3} durationInFrames={DURACAO - C3}>
        <Html5Audio src={staticFile("musica/trilha-luta.wav")} volume={(q) => interpolate(q, [0, 100, 200, 1400, 1460, 1500], [0.02, 0.04, 0.06, 0.06, 0.09, 0.08], { extrapolateRight: "clamp" })} />
      </Sequence>
      <Som src="explosao" de={2} volume={0.35} />
      <Som src="aura" de={20} volume={0.25} />
      <Som src="impacto" de={F(4) + 18} volume={0.35} />
      <Som src="rumble" de={C3 + 30} volume={0.4} />
      <Som src="aura" de={T_AURA} volume={0.55} />
      <Som src="carga" de={T_CRESCE} volume={0.5} />
      <Som src="explosao" de={T_FLASH} volume={0.6} />
      <Som src="aura" de={1345} volume={0.45} />
      <Som src="racha" de={1346} volume={0.4} />
      <Som src="carga" de={1500} volume={0.4} />
      <Som src="vento" de={1612} volume={0.6} />
      <Som src="explosao" de={1628} volume={0.75} />
      <Som src="aura" de={2122} volume={0.6} />
      <Som src="vento" de={2126} volume={0.4} />
      {chaoCrateras.map((d) => (
        <Sequence key={d} from={d} layout="none">
          <Som src="pisada" de={0} volume={0.7} />
        </Sequence>
      ))}
      <Som src="explosao" de={DURACAO - 14} volume={0.9} />
    </AbsoluteFill>
  );
};
