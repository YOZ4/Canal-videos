import { random } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, posMao, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { fala, piscar, respira } from "../../estilo2d/anim";
import { mola } from "../../estilo2d/movimento";
import type { Design } from "../../estilo2d/personagens";
import { CHAO, Corda, ESC_TRENO, ganchoTreno } from "./cenario";
import { TRABALHADORES } from "./elenco";
import { FPS } from "./tempo";

/** helpers de 60 qps: as funções do anim.ts foram afinadas para 30 qps, então recebem fa/2 */
export const h = (fa: number) => fa / 2;
export const m = (fa: number, de: number, s: "pesado" | "natural" | "solto" | "firme" = "natural") => mola(fa, de, s, FPS);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** rosto vivo: pisca (irregular) e mexe a boca entre falaDe e falaAte (frames absolutos) */
export const vivo = (r: Rosto, fa: number, semente: string, falaDe = -1, falaAte = -1): Rosto => ({
  ...r,
  olhos: r.olhos * piscar(h(fa), semente),
  boca: fa >= falaDe && fa < falaAte ? Math.max(r.boca, fala(h(fa), semente)) : r.boca,
});

export const ESC = 0.5;
export const frente = (x: number, extra: Partial<Pose> = {}, y = CHAO): Pose => ({ ...POSE_BASE, x, y, escala: ESC, ...extra });
export const perfil = (x: number, extra: Partial<Pose> = {}, y = CHAO): Pose => ({ ...PERFIL_BASE, x, y, escala: ESC, ...extra });

// ---------------- expressões do episódio ----------------
export const R = {
  calmo: { ...ROSTO_BASE, olhos: 0.8, sorriso: 0.25, sobrancelha: 2 },
  canto: { ...ROSTO_BASE, olhos: 0.75, canto: 1, sorriso: 0.45, sobrancelha: 6 },
  esforco: { ...ROSTO_BASE, olhos: 0.55, sobrancelha: 16, sorriso: -0.85, boca: 0.1 },
  vitoria: { ...ROSTO_BASE, olhos: 0.12, sorriso: 1, boca: 0.8, sobrancelhaY: 10, bochecha: 1 },
  deboche: { ...ROSTO_BASE, olhos: 0.5, canto: 1, sorriso: 0.5, sobrancelhaY: 16, sobrancelha: 4, olhar: [-0.6, 0.2] as [number, number] },
  rindo: { ...ROSTO_BASE, olhos: 0.12, sorriso: 1, boca: 0.8, sobrancelhaY: 10, bochecha: 1 },
  confiante: { ...ROSTO_BASE, olhos: 0.7, canto: 1, sorriso: 0.5, sobrancelha: 8, sobrancelhaY: 4 },
  susto: { ...ROSTO_BASE, olhos: 1.3, pupila: 0.6, sobrancelha: -10, sobrancelhaY: 20, sorriso: -0.5, boca: 0.55, suor: 0.6 },
  mudo: { ...ROSTO_BASE, olhos: 0.9, pupila: 0.5, sobrancelha: -8, sobrancelhaY: 8, sorriso: -0.2, boca: 0, palido: 0.35 },
  gritando: { ...ROSTO_BASE, olhos: 0.75, sobrancelha: 26, sorriso: -0.9, boca: 1 },
  bravo: { ...ROSTO_BASE, olhos: 0.85, sobrancelha: 22, sorriso: -0.4 },
} satisfies Record<string, Rosto>;

// ---------------- equipe puxando a corda ----------------

export type Puxada = {
  /** quanto anda (0 = parado fazendo força, 1 = caminhando puxando) */
  anda: number;
  /** força (inclinação, cara de esforço) */
  forca: number;
};

/** pose de um puxador (perfil, olhando pra direita). Cada um com atraso e amplitude próprios. */
export const posePuxador = (fa: number, i: number, x: number, y: number, esc: number, p: Puxada): Pose => {
  const atraso = 6 + Math.round(random(`pa${i}`) * 6) + i * 4; // 3–6 quadros a 30 qps entre um e outro
  const amp = 0.85 + random(`pp${i}`) * 0.3;
  const g = (fa - atraso) / 2; // tempo em "quadros de 30 qps"
  const ciclo = 26 + random(`pc${i}`) * 6;
  const ph = (g / ciclo) * Math.PI * 2;
  const s = Math.sin(ph);
  const c = Math.cos(ph);
  const lev = (v: number) => Math.max(0, v);
  const passo = 70 * p.anda * amp;
  // parado fazendo força: pés firmes afastados, corpo pulsando a cada puxão
  const base = 46 * (1 - p.anda);
  return {
    ...PERFIL_BASE,
    x,
    y,
    escala: esc,
    inclina: 16 + 8 * p.forca + s * 3 * amp,
    agacha: 26 + 18 * p.forca + Math.abs(c) * 10 * p.anda + lev(s) * 8 * (1 - p.anda),
    cabeca: -6 + s * 2,
    bracoD: { ombro: 74 + s * 7 * amp, cotovelo: 16 - s * 6 },
    bracoE: { ombro: 64 + Math.sin(ph - 0.6) * 7 * amp, cotovelo: 24 },
    maoD: "punho",
    maoE: "punho",
    peE: { dx: -base - s * passo, dy: -lev(-c) * 30 * p.anda * (s < 0 ? 1 : 0.3) },
    peD: { dx: base * 0.8 + s * passo, dy: -lev(c) * 30 * p.anda * (s > 0 ? 1 : 0.3) },
    cabelo: Math.sin(ph + 1) * 3,
  };
};

/** equipe: n puxadores à direita do gancho, corda passando pelas mãos. `sai(i)` = quanto o i-ésimo já foi embora (0..1). */
export const Equipe: React.FC<{
  fa: number;
  id: string;
  xTreno: number;
  n: number;
  x0: number;
  passo: number;
  y?: number;
  esc?: number;
  puxada: Puxada;
  sai?: (i: number) => number;
  folga?: number;
  semente?: number;
}> = ({ fa, id, xTreno, n, x0, passo, y = CHAO, esc = ESC, puxada, sai, folga = 8, semente = 0 }) => {
  const hook = ganchoTreno(xTreno, y, (esc / ESC) * ESC_TRENO);
  const poses: { d: Design; pose: Pose; saiu: number; i: number }[] = [];
  for (let i = 0; i < n; i++) {
    const saiu = sai ? sai(i) : 0;
    const x = x0 + i * passo + (random(`ex${id}${i}`) - 0.5) * 24;
    let pose = posePuxador(fa, i + semente, x, y, esc, puxada);
    if (saiu > 0) {
      // solta a corda, vira e vai embora andando pra esquerda
      const t = Math.min(1, saiu * 4);
      const anda = Math.max(0, saiu - 0.15) * 900;
      const ph = (fa / 2 / 13) * Math.PI;
      pose = {
        ...pose,
        lado: t > 0.5 ? -1 : 1,
        largura: Math.abs(1 - 2 * t) * 0.6 + 0.4,
        x: x - anda,
        inclina: mix(pose.inclina, 4, t),
        agacha: mix(pose.agacha, 6 + Math.abs(Math.cos(ph)) * 10, t),
        bracoD: { ombro: mix(pose.bracoD.ombro, Math.sin(ph) * 28, t), cotovelo: 14 },
        bracoE: { ombro: mix(pose.bracoE.ombro, -Math.sin(ph) * 28, t), cotovelo: 14 },
        maoD: "bola",
        maoE: "bola",
        peE: t > 0.5 ? { dx: -Math.sin(ph) * 70, dy: -Math.max(0, -Math.cos(ph)) * 34 } : pose.peE,
        peD: t > 0.5 ? { dx: Math.sin(ph) * 70, dy: -Math.max(0, Math.cos(ph)) * 34 } : pose.peD,
      };
    }
    poses.push({ d: TRABALHADORES[(i + semente) % TRABALHADORES.length], pose, saiu, i });
  }
  const segura = poses.filter((p) => p.saiu < 0.25);
  const maos = segura.map((p) => posMao(p.pose, "D"));
  const ultimo = maos.length ? maos[maos.length - 1] : hook;
  const pontos: [number, number][] = [hook, ...maos, [ultimo[0] + passo * 0.8, ultimo[1] + 20]];
  return (
    <g>
      <Corda pontos={pontos} folga={folga} esc={esc / ESC} />
      {poses.map(({ d, pose, saiu, i }) => {
        const rosto = vivo(saiu > 0.2 ? { ...ROSTO_BASE, sorriso: -0.2, olhos: 0.8 } : { ...R.esforco, olhos: R.esforco.olhos }, fa, `${id}r${i}`);
        return (
          <g key={i} opacity={saiu > 0 ? Math.max(0, 1 - Math.max(0, saiu - 0.7) / 0.3) : 1}>
            <Boneco2D id={`${id}${i}`} d={d} pose={pose} rosto={rosto} />
          </g>
        );
      })}
    </g>
  );
};

/** respiração para usar em poses paradas (60 qps) */
export const resp = (fa: number, fase = 0) => respira(h(fa), fase);
