import ALIN from "./alinhamento.json";
import type { Palavra } from "../../estilo2d/UI";

export const FPS = 30;
type W = { w: string; s: number; e: number };
const PALAVRAS = ALIN.palavras as W[];
export const DURACAO = Math.ceil(ALIN.duracao * FPS) + 20;

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
  throw new Error(`Trecho não encontrado no roteiro: "${trecho}"`);
};

/** frame em que o trecho começa a ser falado */
export const T = (trecho: string, ocorrencia = 0) => Math.round(PALAVRAS[acha(trecho, ocorrencia)].s * FPS);
/** frame em que o trecho termina */
export const TF = (trecho: string, ocorrencia = 0) => {
  const i = acha(trecho, ocorrencia);
  const n = trecho.split(/\s+/).filter(Boolean).length;
  return Math.round(PALAVRAS[i + n - 1].e * FPS);
};

const DESTAQUES = new Set(
  "nome vida hunter calma luta diego cachinho topete examinador ninguem dispara real corredores milhoes suor resfriam ancestrais cansar quarenta agua errada atalho desbloqueado nen folha borda superficial pelicula transbordar reforco encaram final trava explode some levanta avo devagar seis estresse punho soco arena licenca mudo ganhar barulho comenta".split(
    " ",
  ),
);

/** legendas palavra por palavra a partir do alinhamento */
export const LEGENDAS: Palavra[] = PALAVRAS.map((p, i) => {
  const prox = PALAVRAS[i + 1];
  const fim = prox && prox.s - p.e < 0.5 ? prox.s : p.e + 0.25;
  return {
    texto: p.w.replace(/["“”]/g, ""),
    de: Math.round(p.s * FPS),
    ate: Math.round(fim * FPS),
    destaque: DESTAQUES.has(norm(p.w)),
  };
});
