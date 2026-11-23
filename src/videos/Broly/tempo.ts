import ALIN from "./alinhamento.json";
import type { Palavra } from "../../estilo2d/UI";

/** Episódio "Broly" — 24 qps. Falas na ordem do roteiro (roteiros/broly.txt), alinhadas ao áudio. */
export const FPS = 24;
type W = { w: string; s: number; e: number };
const PALAVRAS = ALIN.palavras as W[];
/** quem fala cada linha (D = Diego, L = Lucas) e quantas palavras tem */
const QUEM = "DLDLDLDLDDLLDLDLDLDLDLDDLDLDLDDLDLDL";
const NPAL = [9, 8, 8, 10, 6, 8, 8, 14, 5, 8, 4, 7, 7, 6, 14, 11, 9, 2, 4, 1, 5, 5, 4, 7, 7, 4, 7, 8, 8, 8, 6, 6, 6, 7, 5, 1];
export type Fala = { quem: "D" | "L"; de: number; ate: number; texto: string; i: number };
export const FALAS: Fala[] = (() => {
  const out: Fala[] = [];
  let k = 0;
  NPAL.forEach((n, i) => {
    const ws = PALAVRAS.slice(k, k + n);
    k += n;
    out.push({ quem: QUEM[i] as "D" | "L", de: Math.round(ws[0].s * FPS), ate: Math.round(ws[n - 1].e * FPS), texto: ws.map((w) => w.w).join(" "), i });
  });
  return out;
})();
/** início (frame) da fala n (1 = primeira) */
export const F = (n: number) => FALAS[n - 1].de;
/** fim (frame) da fala n */
export const FF = (n: number) => FALAS[n - 1].ate;
/** fala acontecendo agora para um personagem (para mexer a boca) */
export const falando = (quem: "D" | "L", f: number) => FALAS.some((x) => x.quem === quem && f >= x.de && f < x.ate);
/** duração do áudio + final (corrida, crateras, corte para preto com explosão) */
export const FIM_AUDIO = Math.round(ALIN.duracao * FPS);
export const DURACAO = FIM_AUDIO + 4 * FPS;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const DESTAQUES = new Set("cidades segundo pao estilo verde ideia raiva academia elevador calma mulher comida brilhando parar tentando climatico ferias pagar pao provoca brocolis diego".split(" "));
export const LEGENDAS: Palavra[] = PALAVRAS.map((p, i) => {
  const prox = PALAVRAS[i + 1];
  const fim = prox && prox.s - p.e < 0.5 ? prox.s : p.e + 0.25;
  return { texto: p.w.replace(/["“”]/g, ""), de: Math.round(p.s * FPS), ate: Math.round(fim * FPS), destaque: DESTAQUES.has(norm(p.w)) };
});
