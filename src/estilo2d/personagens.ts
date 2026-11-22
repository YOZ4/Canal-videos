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
  /** reflexo de luz no cabelo */
  brilhoCabelo: string;
  /** número estampado na camiseta (opcional) */
  numero?: string;
  corNumero?: string;
};

export const CONTORNO = "#1d1424";

export const LUCAS: Design = {
  nome: "Lucas",
  pele: "#f2c39d",
  peleSombra: "#dea27c",
  camisa: "#f4c531",
  camisaSombra: "#d39d1c",
  manga: "#e0ab22",
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
  brilhoCabelo: "#5a5060",
  numero: "3",
  corNumero: "#1d1424",
};

export const DIEGO: Design = {
  nome: "Diego",
  pele: "#e9ad84",
  peleSombra: "#cf8f69",
  camisa: "#2f9e57",
  camisaSombra: "#237844",
  manga: "#27884b",
  calca: "#3d5d9b",
  calcaSombra: "#33508a",
  tenis: "#f7f7fa",
  sola: "#cfcfd8",
  olhos: "#3f6a2a",
  cabelo: "topete",
  corCabelo: "#7b4a2b",
  corCabeloSombra: "#5a331c",
  sobrancelha: "#4e2c18",
  sobrancelhaGrossa: true,
  brilhoCabelo: "#b07a52",
};
