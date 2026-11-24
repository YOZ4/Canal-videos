import LEG from "./legenda.json";

/** Tempos do "Experimento de Asch" (60 qps). Cenas: Roteiro 1 (cenas.json); palavras: legenda.json (tempos reais). */
export const FPS = 60;
export const DURACAO = 4788;
export const s2f = (s: number) => Math.round(s * FPS);

/** início de cada cena (quadros absolutos) */
export const CENA = {
  C01: 0,
  C02: 288,
  C03: 624,
  C04: 912,
  C05: 1434,
  C06: 1920,
  C07: 2286,
  C08: 2766,
  C09: 3756,
  C10: 4068,
  C11: 4452,
  FIM: 4788,
} as const;

type W = { text: string; startMs: number; endMs: number; destaque: boolean };
const PALAVRAS = LEG as W[];
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
const N = PALAVRAS.map((p) => norm(p.text));

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

/** quadro (absoluto) em que o trecho começa a ser falado */
export const T = (trecho: string, ocorrencia = 0) => Math.round((PALAVRAS[acha(trecho, ocorrencia)].startMs / 1000) * FPS);
/** quadro (absoluto) em que o trecho termina */
export const TF = (trecho: string, ocorrencia = 0) => {
  const i = acha(trecho, ocorrencia);
  const n = trecho.split(/\s+/).filter(Boolean).length;
  return Math.round((PALAVRAS[i + n - 1].endMs / 1000) * FPS);
};

export type PalavraLeg = { texto: string; de: number; ate: number; destaque: boolean };
export const LEGENDAS: PalavraLeg[] = PALAVRAS.map((p, i) => {
  const prox = PALAVRAS[i + 1];
  const fim = prox ? Math.min(prox.startMs, p.endMs + 350) : p.endMs + 400;
  const de = s2f(p.startMs / 1000);
  return { texto: p.text.trim().replace(/["“”:,.!?…]/g, ""), de, ate: Math.max(de + 6, s2f(fim / 1000)), destaque: p.destaque };
});
