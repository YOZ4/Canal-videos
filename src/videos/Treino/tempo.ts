import ALIN from "./alinhamento.json";
import CENAS from "./cenas.json";

/** Treino 1 ano — 60 fps. Tempos das cenas vêm do roteiro (cenas.json); palavras do alinhamento. */
export const FPS = 60;
type W = { w: string; s: number; e: number; cena: string };
const PALAVRAS = ALIN.palavras as W[];
export const DURACAO = Math.round(76.59 * FPS);

/** início/fim da cena em frames (60 fps) */
export const cena = (id: string) => {
  const c = (CENAS as { id: string; de: number; ate: number }[]).find((x) => x.id === id)!;
  return { de: Math.round(c.de * FPS), ate: Math.round(c.ate * FPS) };
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
const N = PALAVRAS.map((p) => norm(p.w));
const acha = (trecho: string, oc = 0) => {
  const alvo = trecho.split(/\s+/).map(norm).filter(Boolean);
  let n = -1;
  for (let i = 0; i <= N.length - alvo.length; i++) {
    if (alvo.every((a, j) => N[i + j] === a)) {
      n++;
      if (n === oc) return i;
    }
  }
  throw new Error(`Trecho não encontrado: "${trecho}"`);
};
/** frame (60 fps) em que o trecho começa / termina */
export const T = (trecho: string, oc = 0) => Math.round(PALAVRAS[acha(trecho, oc)].s * FPS);
export const TF = (trecho: string, oc = 0) => {
  const i = acha(trecho, oc);
  return Math.round(PALAVRAS[i + trecho.split(/\s+/).filter(Boolean).length - 1].e * FPS);
};
/** segundos do roteiro → frames */
export const S = (s: number) => Math.round(s * FPS);

const DESTAQUES = new Set(
  "vazia treme cachinho vassoura vinte quilos topete todo santo cinco tres treinos verdade cedo duas semanas peso nada mentirinha dois meses folga fraco seis apertar dobro parou cerebro fibras forca tamanho depois dobra quatro noite dezoito reforma quebra descanso maior ano oitenta capitao america mudo crescer academia".split(
    " ",
  ),
);
export type PalavraT = { texto: string; de: number; ate: number; destaque: boolean };
export const LEGENDAS: PalavraT[] = PALAVRAS.map((p, i) => {
  const prox = PALAVRAS[i + 1];
  const fim = prox && prox.s - p.e < 0.45 ? prox.s : p.e + 0.2;
  return { texto: p.w.replace(/["“”…]/g, "").replace(/[,.:;?!]+$/, (m) => (m.includes("?") ? "?" : "")), de: Math.round(p.s * FPS), ate: Math.round(fim * FPS), destaque: DESTAQUES.has(norm(p.w)) };
});
