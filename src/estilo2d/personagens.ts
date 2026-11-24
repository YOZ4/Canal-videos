/**
 * Visual dos personagens principais (baseado na folha de personagens do canal).
 * Para criar um personagem novo, copie um destes e troque cores/cabelo.
 */

export type TipoCabelo = "cacheado" | "topete" | "penteado";

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
  bigode?: boolean;
  oculos?: boolean;
  gravata?: string;
  /** transformação (poder >= 0.5): cabelo espetado com estas cores; antes disso o cabelo normal vai mudando de cor */
  cabeloPoder?: { cor: string; claro: string; escuro: string; brilho: string };
  /** olhos brancos brilhantes sem pupila quando poder >= 0.75 */
  olhosVazios?: boolean;
  /** peito/abdômen definidos desenhados no tronco (sem camisa) */
  musculos?: boolean;
  /** faixa amarrada na cintura (ex.: camiseta rasgada) */
  faixa?: { cor: string; sombra: string };
  /** colete (de tricô) por cima da camisa — gola em V mostra a camisa e a gravata */
  colete?: { cor: string; sombra: string };
  /** gola da camisa social (cor da gola) */
  gola?: string;
  /** figurino do Egito antigo: peito nu, saiote de linho, cinto na cor do personagem, colar largo, braceletes, sandálias */
  egito?: { cinto: string; cintoSombra: string; colar: string; khat?: boolean };
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

/** Lucas transformado (fúria verde): sem camisa, musculoso, camiseta amarela rasgada amarrada na cintura */
export const LUCAS_FURIA: Design = {
  ...LUCAS,
  nome: "Lucas (fúria)",
  pele: "#e8b48c",
  peleSombra: "#c98a62",
  camisa: "#e8b48c",
  camisaSombra: "#c98a62",
  manga: "#e8b48c",
  numero: undefined,
  cabeloPoder: { cor: "#7df23a", claro: "#d8ff8a", escuro: "#2f9e1a", brilho: "#b6ff4a" },
  olhosVazios: true,
  musculos: true,
  faixa: { cor: "#f4c531", sombra: "#c99212" },
};

/** Lucas no começo da transformação: roupa normal, cabelo pode ficar verde e espetado (poder) */
export const LUCAS_PODER: Design = { ...LUCAS, cabeloPoder: LUCAS_FURIA.cabeloPoder, olhosVazios: true };

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

export const AVO: Design = {
  ...LUCAS,
  nome: "Avô",
  pele: "#e9b48f",
  peleSombra: "#cf946f",
  camisa: "#8a5a3c",
  camisaSombra: "#6e452c",
  manga: "#7a4f34",
  calca: "#7d7466",
  calcaSombra: "#686052",
  corCabelo: "#ecebe6",
  corCabeloSombra: "#b9b6ad",
  sobrancelha: "#d8d6cf",
  brilhoCabelo: "#ffffff",
  numero: undefined,
  bigode: true,
  oculos: true,
};

export const EXAMINADOR: Design = {
  ...DIEGO,
  nome: "Examinador",
  pele: "#d9a27c",
  peleSombra: "#bd8562",
  camisa: "#3d3463",
  camisaSombra: "#2c2549",
  manga: "#352d57",
  calca: "#2c2549",
  calcaSombra: "#221c3a",
  tenis: "#2a2430",
  sola: "#151218",
  corCabelo: "#2a2226",
  corCabeloSombra: "#120e10",
  sobrancelha: "#1a1416",
  brilhoCabelo: "#5a4e55",
  olhos: "#3a2a20",
  bigode: true,
  gravata: "#c94b3b",
};

/** candidatos genéricos (figurantes) */
export const CANDIDATOS: Design[] = [
  { ...DIEGO, nome: "c1", camisa: "#d8363c", camisaSombra: "#b22c40", manga: "#b8262f", corCabelo: "#1f171d", corCabeloSombra: "#3d3540", sobrancelha: "#1f171d", brilhoCabelo: "#5a5060", pele: "#c98b62", peleSombra: "#ad7150", olhos: "#3a2a20" },
  { ...LUCAS, nome: "c2", numero: undefined, camisa: "#7d5bd6", camisaSombra: "#5f42b0", manga: "#6a4cc2", corCabelo: "#8a4b26", corCabeloSombra: "#5e3118", pele: "#f0c2a0", olhos: "#2f5d8a" },
  { ...DIEGO, nome: "c3", camisa: "#ef7d2b", camisaSombra: "#c9621a", manga: "#d96d22", corCabelo: "#e8c24a", corCabeloSombra: "#c49a2a", sobrancelha: "#b8892a", brilhoCabelo: "#fff2b0", pele: "#f2c6a6", olhos: "#3a6ea8" },
  { ...LUCAS, nome: "c4", numero: undefined, camisa: "#3a8fd6", camisaSombra: "#2a6cb0", manga: "#3080c4", corCabelo: "#2a1a12", pele: "#8d5a3b", peleSombra: "#734528", olhos: "#2a1a12" },
  { ...DIEGO, nome: "c5", camisa: "#e2e2e8", camisaSombra: "#bcbcc6", manga: "#cfcfd8", corCabelo: "#c03a3a", corCabeloSombra: "#8e2626", sobrancelha: "#8e2626", brilhoCabelo: "#ff9a9a", pele: "#f4cdb0", olhos: "#2a6a3a" },
];
