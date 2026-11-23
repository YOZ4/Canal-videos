import ALIN from "./alinhamento.json";

/** Tempos do episódio Egito (60 qps). Cenas: tempos do Roteiro 1; palavras: alinhamento com o áudio real. */
export const FPS = 60;
export const DURACAO = 4533;
export const s2f = (s: number) => Math.round(s * FPS);

type W = { w: string; s: number; e: number };
const PALAVRAS = ALIN.palavras as W[];

/** início de cada cena (frames) — Roteiro 1, "Cena por cena" */
export const CENA = {
  C01: 0,
  C02: 264,
  C03: 645,
  C04: 1104,
  C05: 1344,
  C06: 1710,
  C07: 1983,
  C08: 2460,
  C09: 2703,
  C10: 3564,
  C11: 3879,
  C12: 4098,
  FIM: 4533,
} as const;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
const N = PALAVRAS.map((p) => norm(p.w));

const acha = (trecho: string, ocorrencia = 0): number => {
  const alvo = trecho.split(/\s+/).map(norm).filter(Boolean);
  let achou = -1;
  for (let i = 0; i <= N.length - alvo.length; i++) {
    if (alvo.every((a, j) => N[i + j] === a)) {
      achou++;
      if (achou === ocorrencia) return i;
    }
  }
  throw new Error(`Trecho não encontrado: "${trecho}"`);
};

/** frame (absoluto) em que o trecho começa a ser falado */
export const T = (trecho: string, ocorrencia = 0) => Math.round(PALAVRAS[acha(trecho, ocorrencia)].s * FPS);
/** frame (absoluto) em que o trecho termina */
export const TF = (trecho: string, ocorrencia = 0) => {
  const i = acha(trecho, ocorrencia);
  const n = trecho.split(/\s+/).filter(Boolean).length;
  return Math.round(PALAVRAS[i + n - 1].e * FPS);
};

/** palavras-chave (maiores, maiúsculas e amarelas) */
const DESTAQUES = new Set(
  "agua toneladas cachinho minecraft bloco cento setenta dois homens jantava gritou desperdicar seca forca metade castigo oitenta seis topete janta deslizar travou sabe amontoando praia grudam firme amsterda 2014 metade balde lama atolou templo truque tumba quatro mil ritual".split(" "),
);

export type PalavraLeg = { texto: string; de: number; ate: number; destaque: boolean };

export const LEGENDAS: PalavraLeg[] = PALAVRAS.map((p, i) => {
  const prox = PALAVRAS[i + 1];
  const fim = prox ? Math.min(prox.s, p.e + 0.35) : p.e + 0.4;
  return {
    texto: p.w.replace(/["“”:,.!?…]/g, ""),
    de: s2f(p.s),
    ate: Math.max(s2f(p.s) + 6, s2f(fim)),
    destaque: DESTAQUES.has(norm(p.w)),
  };
});
