import { random, spring } from "remotion";
import { Boneco2D, POSE_BASE, ROSTO_BASE, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { fala, piscar, respira } from "../../estilo2d/anim";
import { criarAnimacao, rostoAtuado } from "../../estilo2d/naturalidade";
import { FILEIRA, PESQUISADOR } from "./elenco";
import { CartaoMao, Carteira, CHAO, ESC, LUGAR, PESQ_X } from "./sala";
import { DURACAO, FPS, s2f, T, TF } from "./tempo";

/**
 * Atuação de todos os personagens ao longo do vídeo (quadros ABSOLUTOS, 60 qps). Tudo passa pela camada de
 * naturalidade (cabelo com mola) e as trocas de rosto do estudante e do zombador são atuadas (rostoAtuado).
 */
const EST = 7;
const ZOM = 6;
const ALIADO = 3;

// ------------------------------------------------------------------ cartões erguidos
type Carta = { de: number; ate: number; letra: "A" | "B"; verde?: boolean };
/** cascata: atraso de 2–4 quadros por pessoa (variado) */
const cascata = (i: number, semente: string) => {
  let d = 0;
  for (let k = 0; k < i; k++) d += 2 + Math.round(random(`${semente}${k}`) * 2);
  return d;
};
const C01_SOBE = 132;
const R1 = T("todo mundo");
const R3 = T("os sete escolhem");
const EST_B = T("Ele fala a certa");
const VIRA = T("A sala inteira") + 8; // a onda de cabeças começa em "A sala inteira" (o zoom rápido vem em "vira pra ele")
const R7 = T("Na sétima");
const CEDE = T("e responde a errada");
const ALIADO_SOBE = T("Colocou na sala");
const EST_FINAL = T("E quase ninguém");

export const CARTAS: Carta[][] = FILEIRA.map((_, i) => {
  const c: Carta[] = [];
  if (i < EST) c.push({ de: C01_SOBE + cascata(i, "c1"), ate: 300, letra: "A" });
  // rodada 1: todo mundo B (o estudante também)
  c.push({ de: R1 - 10 + cascata(i, "r1"), ate: R1 + 55 + cascata(i, "r1b"), letra: "B", verde: i === EST });
  if (i < EST) c.push({ de: R3 + cascata(i, "r3"), ate: 1930, letra: "A" });
  else c.push({ de: EST_B - 6, ate: 1930, letra: "B", verde: true });
  // rodada 5 (C06) e 7 (C07): os atores com A erguido
  if (i < EST) c.push({ de: 1890 + cascata(i, "r5"), ate: i === ZOM ? T("O do lado cochicha") - 26 : 2280, letra: "A" });
  if (i < EST) c.push({ de: R7 + 10 + cascata(i, "r7"), ate: 2780, letra: "A" });
  else c.push({ de: CEDE, ate: 2780, letra: "A" });
  // C10: a fileira A, o 4º (aliado) B verde
  if (i < EST) c.push({ de: ALIADO_SOBE + cascata(i, "c10"), ate: 4690 + cascata(i, "c10b"), letra: i === ALIADO ? "B" : "A", verde: i === ALIADO });
  else c.push({ de: EST_FINAL + 6, ate: 4700, letra: "B", verde: true });
  return c;
});

const mola = (f: number, de: number, cfg = { mass: 0.8, stiffness: 140, damping: 13 }) => (f < de ? 0 : spring({ frame: f - de, fps: FPS, config: cfg }));

/** braço direito (da tela) erguendo o cartão: antecipa (abaixa), sobe com mola, balança e desce */
const bracoCarta = (f: number, c: Carta | undefined, semente: string) => {
  if (!c) return null;
  const ant = f >= c.de - 6 && f < c.de ? Math.sin(((f - c.de + 6) / 6) * Math.PI) : 0;
  const sobe = mola(f, c.de) * (1 - mola(f, c.ate, { mass: 0.7, stiffness: 160, damping: 18 }));
  const bal = Math.sin((f - c.de) * 0.09 + random(semente) * 6) * 3;
  return { ombro: 20 - ant * 10 + sobe * (138 + bal), cotovelo: -10 - sobe * 18 - ant * 20, sobe };
};
const cartaAtiva = (i: number, f: number) => CARTAS[i].find((c) => f >= c.de - 6 && f < c.ate + 20);

// ------------------------------------------------------------------ poses
const VIRA_ATE = 1935;
/** cabeças virando pro estudante em onda (2 quadros de atraso entre elas), com antecipação e assentamento */
const viraPraEle = (i: number, f: number) => {
  if (i >= EST) return 0;
  const de = VIRA + (EST - 1 - i) * 2; // o mais perto vira primeiro
  if (f < de - 3 || f > VIRA_ATE) return 0;
  const ant = f < de ? -0.08 * Math.sin(((f - de + 3) / 3) * Math.PI) : 0;
  return ant + mola(f, de, { mass: 0.6, stiffness: 170, damping: 12 }) * 0.75;
};

const sentado = (i: number, f: number): Pose => {
  const g = f / 2; // funções de 30 qps
  const r = respira(g, i * 7);
  const c = cartaAtiva(i, f);
  const bc = bracoCarta(f, c, `bal${i}`);
  const vira = viraPraEle(i, f);
  let p: Pose = {
    ...POSE_BASE,
    x: LUGAR[i],
    y: CHAO,
    escala: ESC,
    agacha: 110 + r * 2,
    estica: 1 + r * 0.008,
    inclina: Math.sin(g * 0.03 + i) * 1.2,
    cabeca: Math.sin(g * 0.021 + i * 2) * 2 + vira * 6,
    vira,
    bracoE: { ombro: 16 + r * 2, cotovelo: -24 },
    bracoD: bc ? { ombro: bc.ombro, cotovelo: bc.cotovelo } : { ombro: 16 - r * 2, cotovelo: -24 },
    maoD: bc && bc.sobe > 0.2 ? "punho" : "bola",
  };
  // ---- zombador
  if (i === ZOM) {
    const ri = T("O do lado riu");
    const inc = mola(f, ri - 4, { mass: 0.9, stiffness: 120, damping: 11 }) * (1 - mola(f, 600));
    const ri2 = f > ri && f < 624 ? Math.abs(Math.sin((f - ri) * 0.35)) * 0.03 : 0;
    // cochicho (C06): inclina pro estudante e cobre a boca com a mão do lado dele
    const co = T("O do lado cochicha");
    const coc = mola(f, co - 6, { mass: 0.9, stiffness: 130, damping: 14 }) * (1 - mola(f, 2290));
    // "agora sim" (C07): recosta satisfeito
    const ag = T("O do lado sorri");
    const sat = mola(f, ag, { mass: 1, stiffness: 110, damping: 14 }) * (1 - mola(f, 2780));
    // C11: surpreso — recua
    const sur = mola(f, EST_FINAL + 30, { mass: 0.6, stiffness: 200, damping: 10 });
    p = {
      ...p,
      inclina: p.inclina + inc * 13 + coc * 10 - sat * 4 - sur * 6,
      cabeca: p.cabeca + inc * 10 + coc * 6 - sur * 6,
      vira: Math.max(p.vira, inc * 0.45 + coc * 0.55 + sat * 0.3),
      estica: p.estica * (1 + ri2) * (1 + sur * 0.04),
      bracoD: coc > 0.05 && !c ? { ombro: 16 + coc * 34, cotovelo: -24 - coc * 120 } : p.bracoD,
      maoD: coc > 0.3 && !c ? "aberta" : p.maoD,
      bracoE: sat > 0.1 ? { ombro: 16 + sat * 10, cotovelo: -24 - sat * 60 } : p.bracoE,
    };
  }
  // ---- estudante: encolhe na tensão, olha de lado
  if (i === EST) {
    const tensa = f >= 1812 && f < 2780 ? 1 : 0;
    const encolhe = tensa * (0.6 + 0.4 * Math.sin(g * 0.08));
    const cede = f >= CEDE - 4 && f < 2780 ? mola(f, CEDE - 4, { mass: 1.2, stiffness: 90, damping: 16 }) : 0;
    const calmo = f >= EST_FINAL ? 1 : 0;
    p = {
      ...p,
      agacha: p.agacha + encolhe * 10 + cede * 12 - calmo * 4,
      inclina: p.inclina - encolhe * 2 + cede * 4,
      cabeca: p.cabeca + cede * 8 + (tensa ? Math.sin(g * 0.5) * 0.6 : 0),
      bracoE: tensa ? { ombro: 10, cotovelo: -40 } : p.bracoE,
    };
  }
  return p;
};

const pesquisador = (f: number): Pose => {
  const g = f / 2;
  const r = respira(g, 33);
  const pergunta = T("o pesquisador pergunta");
  const gesto = mola(f, pergunta - 6) * (1 - mola(f, pergunta + 70));
  return {
    ...POSE_BASE,
    x: PESQ_X,
    y: CHAO,
    escala: ESC * 1.04,
    vira: -0.55,
    estica: 1 + r * 0.01,
    cabeca: Math.sin(g * 0.02) * 2 - gesto * 4,
    inclina: -gesto * 3,
    bracoE: { ombro: 20 + gesto * 50, cotovelo: -40 - gesto * 30 },
    bracoD: { ombro: 26, cotovelo: -96 },
    maoE: gesto > 0.3 ? "aponta" : "bola",
  };
};

// ------------------------------------------------------------------ camada de naturalidade (cabelo com mola etc.)
export const ANIM = criarAnimacao(
  DURACAO + 2,
  (f) => {
    const o: Record<string, Pose> = {};
    FILEIRA.forEach((_, i) => (o[`p${i}`] = sentado(i, f)));
    o.pesq = pesquisador(f);
    return o;
  },
  { chao: CHAO, pes: ["pesq"], camera: false },
);

// ------------------------------------------------------------------ rostos
const SERIO: Rosto = { ...ROSTO_BASE, olhos: 0.85, sorriso: 0.05, sobrancelha: 8 };
const ENCARA: Rosto = { ...ROSTO_BASE, olhos: 0.7, sorriso: -0.15, sobrancelha: 20, olhar: [0.9, 0] };
const R = {
  normal: { ...ROSTO_BASE, olhos: 0.95, sorriso: 0.25 },
  confuso: { ...ROSTO_BASE, olhos: 1.05, sobrancelha: -12, sobrancelhaY: 8, sorriso: -0.1, boca: 0.12, olhar: [-0.3, 0] },
  surpreso: { ...ROSTO_BASE, olhos: 1.25, pupila: 0.7, sobrancelha: -8, sobrancelhaY: 14, sorriso: -0.3, boca: 0.4 },
  nervoso: { ...ROSTO_BASE, olhos: 1.1, pupila: 0.8, sobrancelha: -20, sobrancelhaY: 6, sorriso: -0.45, boca: 0.1, suor: 0.9 },
  cedendo: { ...ROSTO_BASE, olhos: 0.55, sobrancelha: -22, sobrancelhaY: 4, sorriso: -0.6, boca: 0.05, suor: 0.6, olhar: [0, 0.6] },
  alivio: { ...ROSTO_BASE, olhos: 0.75, sorriso: 0.55, sobrancelha: -4, bochecha: 0.9 },
  deboche: { ...ROSTO_BASE, olhos: 0.6, canto: 1, sorriso: 0.45, sobrancelha: 10, olhar: [0.8, 0] },
  rindo: { ...ROSTO_BASE, olhos: 0.15, sorriso: 1, boca: 0.75, bochecha: 1 },
  agoraSim: { ...ROSTO_BASE, olhos: 0.55, canto: 1, sorriso: 0.7, sobrancelha: 6, olhar: [0.8, 0.1] },
  bocaAberta: { ...ROSTO_BASE, olhos: 1.3, pupila: 0.6, sobrancelha: -10, sobrancelhaY: 18, sorriso: -0.5, boca: 0.95, olhar: [0.7, 0] },
} satisfies Record<string, Rosto>;

/** olhos do estudante indo e voltando no C07: linhas (cartão, pra esquerda/cima) ↔ homens (esquerda) */
const olharC07 = (f: number): [number, number] => {
  const l1 = T("olha pras linhas");
  const l2 = T("olha pros homens");
  if (f < l1) return [0, 0];
  if (f < l2) return [-0.5, -0.7];
  if (f < CEDE - 12) return [-0.95, 0.05];
  return [0, 0.5];
};

const ROSTO_EST = rostoAtuado(DURACAO + 2, (f) => {
  if (f < 300) return { nome: "normal", rosto: R.normal, tam: 0 };
  if (f < 624) return { nome: "confuso", rosto: R.confuso, tam: 0.7 };
  if (f < 1812) return f >= R3 + 30 && f < 1812 ? { nome: "confuso2", rosto: R.confuso, tam: 1 } : { nome: "normal", rosto: R.normal, tam: 0.3 };
  if (f < 1920) return { nome: "surpreso", rosto: R.surpreso, tam: 2 };
  if (f < CEDE - 2) return { nome: "nervoso", rosto: R.nervoso, tam: 1 };
  if (f < 2780) return { nome: "cedendo", rosto: R.cedendo, tam: 1.2 };
  if (f < EST_FINAL) return { nome: "normal", rosto: R.normal, tam: 0.4 };
  return { nome: "alivio", rosto: R.alivio, tam: 0.8 };
});
const ROSTO_ZOM = rostoAtuado(DURACAO + 2, (f) => {
  const ri = T("O do lado riu");
  if (f < ri - 4) return { nome: "serio", rosto: SERIO, tam: 0 };
  if (f < 624) return { nome: "rindo", rosto: R.rindo, tam: 1.2 };
  if (f < VIRA) return { nome: "serio", rosto: SERIO, tam: 0.3 };
  if (f < 1935) return { nome: "encara", rosto: ENCARA, tam: 0.6 };
  if (f < T("O do lado sorri")) return { nome: "deboche", rosto: R.deboche, tam: 0.6 };
  if (f < 2780) return { nome: "agoraSim", rosto: R.agoraSim, tam: 0.8 };
  if (f < EST_FINAL + 30) return { nome: "serio", rosto: SERIO, tam: 0.3 };
  return { nome: "boca", rosto: R.bocaAberta, tam: 2 };
});

const FALAS_ZOM: [number, number][] = [
  [T("Tá precisando"), TF("garoto")],
  [T("Esse aí"), TF("enxerga nada")],
  [T("Agora sim"), TF("Agora sim")],
];

export const rostoDe = (i: number, f: number): { rosto: Rosto; corpo: { estica: number; agacha: number } } => {
  const g = f / 2;
  let rc: { rosto: Rosto; corpo: { estica: number; agacha: number } };
  if (i === EST) rc = ROSTO_EST.em(f);
  else if (i === ZOM) rc = ROSTO_ZOM.em(f);
  else if (i === 99) rc = { rosto: { ...SERIO, olhar: [-0.5, 0] }, corpo: { estica: 1, agacha: 0 } };
  else rc = { rosto: viraPraEle(i, f) > 0.3 ? ENCARA : SERIO, corpo: { estica: 1, agacha: 0 } };
  let r = rc.rosto;
  // estudante: pisca 2x no C02 ("piscou"), olhos indo e voltando no C07
  if (i === EST) {
    const pi = T("piscou");
    const fecha = (t0: number) => (f >= t0 && f < t0 + 10 ? Math.abs(Math.cos(((f - t0) / 10) * Math.PI)) : 1);
    r = { ...r, olhos: r.olhos * fecha(pi - 4) * fecha(pi + 12) };
    if (f >= 2286 && f < 2780) r = { ...r, olhar: olharC07(f) };
    if (f >= VIRA && f < 1935) r = { ...r, olhar: [-0.9, 0] };
  }
  if (i === ZOM) for (const [a, b] of FALAS_ZOM) if (f >= a && f < b) r = { ...r, boca: Math.max(r.boca, fala(g, "zom")) };
  if (i === 99) {
    const p = T("o pesquisador pergunta");
    if (f >= p && f < p + 60) r = { ...r, boca: fala(g, "pq") };
  }
  return { rosto: { ...r, olhos: r.olhos * piscar(g, `p${i}`) }, corpo: rc.corpo };
};

// ------------------------------------------------------------------ desenho da fileira
/** fileira de 8 carteiras + pesquisador (mundo). `so` = índices a desenhar (closes); `cartoes` = mostra os cartões */
export const Fileira: React.FC<{ f: number; so?: number[]; semPesq?: boolean; corCarta?: (i: number, c: Carta) => boolean }> = ({ f, so, semPesq }) => (
  <g>
    {!semPesq ? (() => {
      const rc = rostoDe(99, f);
      return <Boneco2D id="pesq" d={PESQUISADOR} pose={ANIM.pose("pesq", f)} rosto={rc.rosto} naMao={<Prancheta />} />;
    })() : null}
    {FILEIRA.map((d, i) => {
      if (so && !so.includes(i)) return null;
      const c = cartaAtiva(i, f);
      const rc = rostoDe(i, f);
      const p0 = ANIM.pose(`p${i}`, f);
      const p = { ...p0, agacha: p0.agacha + rc.corpo.agacha * 0.6, estica: p0.estica * rc.corpo.estica };
      const vis = c && f >= c.de - 2;
      return (
        <g key={i}>
          <Boneco2D id={`as${i}`} d={d} pose={p} rosto={rc.rosto} naMao={vis ? <CartaoMao letra={c!.letra} verde={c!.verde} /> : undefined} />
          <Carteira x={LUGAR[i]} />
        </g>
      );
    })}
  </g>
);

const Prancheta: React.FC = () => (
  <g transform="translate(-20 -40) rotate(-12)">
    <rect x={-80} y={-110} width={160} height={210} rx={10} fill="#a8774a" stroke="#1d1424" strokeWidth={8} />
    <rect x={-62} y={-86} width={124} height={170} fill="#fbf7ee" />
    {[-60, -30, 0, 30].map((y) => (
      <line key={y} x1={-46} y1={y} x2={46} y2={y} stroke="#9a9488" strokeWidth={6} />
    ))}
    <rect x={-30} y={-122} width={60} height={26} rx={6} fill="#c9c2b6" stroke="#1d1424" strokeWidth={6} />
  </g>
);

export { s2f, EST, ZOM, ALIADO, R1, R3, EST_B, VIRA, CEDE, ALIADO_SOBE, EST_FINAL, C01_SOBE };
