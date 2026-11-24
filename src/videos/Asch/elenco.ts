import { DIEGO, LUCAS, type Design } from "../../estilo2d/personagens";

/**
 * Elenco do "Experimento de Asch" (EUA, 1951) — personagens da época no estilo do canal (sem Lucas e Diego).
 * Cores do Roteiro 1 (ref-01..04). O pesquisador é genérico (NÃO imita o rosto do Solomon Asch real).
 */
const base = (b: Design, p: Partial<Design>): Design => ({ ...b, numero: undefined, ...p });
const SAPATO = { tenis: "#5a3620", sola: "#2e1c12" };

export const ESTUDANTE: Design = base(LUCAS, {
  nome: "Estudante",
  pele: "#f1c9a3",
  peleSombra: "#dcab84",
  camisa: "#cfe3f5",
  camisaSombra: "#a9c3dc",
  manga: "#bcd4ea",
  gola: "#e4f0fb",
  gravata: "#1f3a6b",
  calca: "#6b6f78",
  calcaSombra: "#575a62",
  ...SAPATO,
  tenis: "#7a4a2a",
  olhos: "#4a2e1a",
  cabelo: "penteado",
  corCabelo: "#3b2618",
  corCabeloSombra: "#5a3d28",
  sobrancelha: "#3b2618",
  brilhoCabelo: "#7a5a40",
  sobrancelhaGrossa: false,
});

export const ZOMBADOR: Design = base(DIEGO, {
  nome: "Zombador",
  pele: "#f2c9a6",
  peleSombra: "#ddae88",
  camisa: "#f4f2ec",
  camisaSombra: "#d6d2c6",
  manga: "#e6e2d8",
  gola: "#ffffff",
  gravata: "#7a1f2b",
  colete: { cor: "#8e2f3a", sombra: "#6e2230" },
  calca: "#8a7253",
  calcaSombra: "#735e42",
  ...SAPATO,
  olhos: "#3f5a7a",
  cabelo: "penteado",
  corCabelo: "#b08a4a",
  corCabeloSombra: "#8e6c34",
  sobrancelha: "#8e6c34",
  brilhoCabelo: "#e0c07a",
  sobrancelhaGrossa: true,
});

/** os outros 6 atores: camisas claras, gravatas estreitas, alguns de colete, tons de pele variados */
type V = { pele: [string, string]; camisa: [string, string]; gravata: string; colete?: [string, string]; cabelo: Design["cabelo"]; cor: [string, string, string]; olhos: string };
const VAR: V[] = [
  { pele: ["#e8b48c", "#cf9670"], camisa: ["#eef0f2", "#cfd3d8"], gravata: "#2b3a55", colete: ["#4f6b4a", "#3c5338"], cabelo: "penteado", cor: ["#2a1d16", "#46342a", "#6a5446"], olhos: "#3a2414" },
  { pele: ["#c98b5e", "#a96f46"], camisa: ["#f3eadb", "#d8ccb6"], gravata: "#5a2a2a", cabelo: "cacheado", cor: ["#1c1720", "#33282f", "#4a4048"], olhos: "#2a1a10" },
  { pele: ["#f2c9a6", "#ddae88"], camisa: ["#e3ecf2", "#c3d0da"], gravata: "#3c3c46", colete: ["#3f5a7a", "#2f4560"], cabelo: "penteado", cor: ["#7a3a20", "#5e2a16", "#a85a34"], olhos: "#3f5a2a" },
  { pele: ["#8d5a3b", "#734628"], camisa: ["#efe9e0", "#d3c9ba"], gravata: "#1f3a6b", cabelo: "penteado", cor: ["#141016", "#2c2428", "#4a4048"], olhos: "#24140c" },
  { pele: ["#d9a072", "#bb8255"], camisa: ["#f1f1ec", "#d4d4ca"], gravata: "#2e4a3a", colete: ["#b8a07a", "#98825e"], cabelo: "topete", cor: ["#5a3d28", "#3b2618", "#8a6a4a"], olhos: "#3a2414" },
  { pele: ["#f0c49e", "#d8a67e"], camisa: ["#e8eef0", "#c8d2d6"], gravata: "#4a2a4a", colete: ["#7a7d82", "#5e6166"], cabelo: "penteado", cor: ["#8a8a8a", "#6a6a6a", "#b0b0b0"], olhos: "#3a3a4a" },
];
export const ATORES: Design[] = VAR.map((v, i) =>
  base(DIEGO, {
    nome: `Ator ${i + 1}`,
    pele: v.pele[0],
    peleSombra: v.pele[1],
    camisa: v.camisa[0],
    camisaSombra: v.camisa[1],
    manga: v.camisa[1],
    gola: v.camisa[0],
    gravata: v.gravata,
    colete: v.colete ? { cor: v.colete[0], sombra: v.colete[1] } : undefined,
    calca: ["#4a4a52", "#6b5a44", "#3e4450"][i % 3],
    calcaSombra: ["#3a3a42", "#584a36", "#30353f"][i % 3],
    ...SAPATO,
    olhos: v.olhos,
    cabelo: v.cabelo,
    corCabelo: v.cor[0],
    corCabeloSombra: v.cor[1],
    sobrancelha: v.cor[0],
    brilhoCabelo: v.cor[2],
    sobrancelhaGrossa: i % 2 === 0,
  }),
);

export const PESQUISADOR: Design = base(DIEGO, {
  nome: "Pesquisador",
  pele: "#eec29c",
  peleSombra: "#d6a47c",
  camisa: "#f2efe6",
  camisaSombra: "#d2cdbf",
  manga: "#e2ddd0",
  gola: "#ffffff",
  gravata: "#2b2b3a",
  colete: { cor: "#6b4a2e", sombra: "#523720" },
  calca: "#4a4a52",
  calcaSombra: "#3a3a42",
  ...SAPATO,
  olhos: "#3a2a1a",
  oculos: true,
  cabelo: "penteado",
  corCabelo: "#8c8a86",
  corCabeloSombra: "#6c6a66",
  sobrancelha: "#5c5a56",
  brilhoCabelo: "#c0beb8",
  sobrancelhaGrossa: true,
});

/** fileira na ordem da sala (da esquerda pra direita): 7 atores (o 4º = índice 3 é o aliado do C10; o 7º é o
 *  zombador) e o estudante por último ("o oitavo") */
export const FILEIRA: Design[] = [ATORES[0], ATORES[1], ATORES[2], ATORES[3], ATORES[4], ATORES[5], ZOMBADOR, ESTUDANTE];
