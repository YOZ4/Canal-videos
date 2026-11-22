/**
 * Visual dos personagens principais (baseado na folha de personagens do canal).
 * Para criar um personagem novo, copie um destes e troque cores/cabelo.
 */

export type TipoCabelo = "cacheado" | "topete";

export type Design = {
  nome: string;
  pele: string;
  peleSombra: string;
  camisa: string;
  camisaSombra: string;
  manga: string; // tom do punho da manga
  calca: string;
  calcaSombra: string;
  tenis: string;
  sola: string;
  olhos: string;
  cabelo: TipoCabelo;
  corCabelo: string;
  corCabeloSombra: string;
  sobrancelha: string;
  /** sobrancelhas grossas aparecem (Diego); no Lucas ficam finas */
  sobrancelhaGrossa: boolean;
};

export const CONTORNO = "#1d1424";

export const LUCAS: Design = {
  nome: "Lucas",
  pele: "#f2c39d",
  peleSombra: "#dea27c",
  camisa: "#3474dc",
  camisaSombra: "#2f58b4",
  manga: "#2a62c6",
  calca: "#3d5d9b",
  calcaSombra: "#33508a",
  tenis: "#f7f7fa",
  sola: "#cfcfd8",
  olhos: "#6b3a1c",
  cabelo: "cacheado",
  corCabelo: "#1f171d",
  corCabeloSombra: "#3d3540",
  sobrancelha: "#1f171d",
  sobrancelhaGrossa: false,
};

export const DIEGO: Design = {
  nome: "Diego",
  pele: "#e9ad84",
  peleSombra: "#cf8f69",
  camisa: "#d8363c",
  camisaSombra: "#b22c40",
  manga: "#b8262f",
  calca: "#3d5d9b",
  calcaSombra: "#33508a",
  tenis: "#f7f7fa",
  sola: "#cfcfd8",
  olhos: "#3f6a2a",
  cabelo: "topete",
  corCabelo: "#f2cb48",
  corCabeloSombra: "#c99a2c",
  sobrancelha: "#c48d2a",
  sobrancelhaGrossa: true,
};
