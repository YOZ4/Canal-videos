/**
 * Visual dos personagens principais (baseado na folha de personagens do canal).
 * Para criar um personagem novo, copie um destes e troque cores/cabelo.
 */

export type TipoCabelo = "cacheado" | "topete" | "penteado" | "careca" | "curto";

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
  /** paletó: lapela (cor mais escura do paletó), camisa branca em V, botões; lenço = lenço branco no bolso */
  terno?: { lapela: string; lenco?: boolean };
  /** bigode fino (enrolado) ou grosso; cor própria (padrão = cor do cabelo) */
  bigodeTipo?: "fino" | "grosso";
  corBigode?: string;
  /** chapéu (fica parado na cabeça, não balança com o cabelo) */
  chapeu?: { tipo: "fedora" | "coco" | "boina"; cor: string; faixa?: string };
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

// ---------------- Paris, 1925 (episódio "Torre Eiffel") ----------------
/** homem de terno dos anos 20: paletó (camisa = cor do paletó), camisa branca, gravata, sapato escuro */
export const homem1925 = (o: {
  nome: string;
  pele: string;
  peleSombra: string;
  paleto: string;
  paletoSombra: string;
  lapela: string;
  calca: string;
  gravata: string;
  cabelo: Design["cabelo"];
  corCabelo: string;
  corCabeloSombra?: string;
  bigodeTipo?: "fino" | "grosso";
  corBigode?: string;
  chapeu?: Design["chapeu"];
  lenco?: boolean;
  olhos?: string;
}): Design => ({
  nome: o.nome,
  pele: o.pele,
  peleSombra: o.peleSombra,
  camisa: o.paleto,
  camisaSombra: o.paletoSombra,
  manga: o.paletoSombra,
  calca: o.calca,
  calcaSombra: o.calca,
  tenis: "#2a2024",
  sola: "#1a1418",
  olhos: o.olhos ?? "#3a2416",
  cabelo: o.cabelo,
  corCabelo: o.corCabelo,
  corCabeloSombra: o.corCabeloSombra ?? o.corCabelo,
  sobrancelha: o.cabelo === "careca" ? o.corCabelo : o.corCabelo,
  sobrancelhaGrossa: true,
  brilhoCabelo: "#c8c0d0",
  bigode: !!o.bigodeTipo,
  bigodeTipo: o.bigodeTipo,
  corBigode: o.corBigode,
  gravata: o.gravata,
  terno: { lapela: o.lapela, lenco: o.lenco },
  chapeu: o.chapeu,
});

export const LUSTIG = homem1925({
  nome: "Lustig",
  pele: "#f2c8a4",
  peleSombra: "#dba886",
  paleto: "#5a5f6b",
  paletoSombra: "#474b56",
  lapela: "#454953",
  calca: "#4a4f5a",
  gravata: "#7a1f2b",
  cabelo: "penteado",
  corCabelo: "#1d1820",
  corCabeloSombra: "#2e2832",
  bigodeTipo: "fino",
  corBigode: "#1d1820",
  lenco: true,
});
export const LUSTIG_RUA: Design = { ...LUSTIG, chapeu: { tipo: "fedora", cor: "#3a3d44", faixa: "#1f1a20" } };

export const POISSON = homem1925({
  nome: "Poisson",
  pele: "#f2c8a4",
  peleSombra: "#dba886",
  paleto: "#7a5a3a",
  paletoSombra: "#64482e",
  lapela: "#5e452b",
  calca: "#6a5040",
  gravata: "#3f6b4a",
  cabelo: "careca",
  corCabelo: "#6b4a2a",
  bigodeTipo: "grosso",
  corBigode: "#5e3e22",
});
export const POISSON_RUA: Design = { ...POISSON, chapeu: { tipo: "coco", cor: "#2a2622", faixa: "#151214" } };
/** Poisson com vergonha (rosto vermelho) */
export const POISSON_VERMELHO: Design = { ...POISSON_RUA, pele: "#f0a088", peleSombra: "#d8826c" };

const COM_BASE = [
  { pele: "#e0a878", peleSombra: "#c48a5e", cabelo: "curto" as const, corCabelo: "#3a2618", bigodeTipo: "grosso" as const, gravata: "#7a3a1a" },
  { pele: "#f4cfb0", peleSombra: "#dcb090", cabelo: "curto" as const, corCabelo: "#a07a48", gravata: "#2a3e78", chapeu: { tipo: "boina" as const, cor: "#5a5e48", faixa: "#3e4232" } },
  { pele: "#c98a5c", peleSombra: "#a96e44", cabelo: "penteado" as const, corCabelo: "#1d1820", bigodeTipo: "fino" as const, gravata: "#a8841c" },
  { pele: "#eab48e", peleSombra: "#cc9470", cabelo: "curto" as const, corCabelo: "#9a9a9e", bigodeTipo: "grosso" as const, corBigode: "#a8a8ac", gravata: "#5e2a7a", chapeu: { tipo: "coco" as const, cor: "#1e1a1c", faixa: "#0e0b0d" } },
  { pele: "#f2c8a4", peleSombra: "#dba886", cabelo: "curto" as const, corCabelo: "#6a4426", gravata: "#1d1d22" },
];
const TERNOS_1 = [
  ["#3e4a5e", "#323c4e", "#2f3848", "#3a4352"],
  ["#66694e", "#54573f", "#4e513a", "#5a5446"],
  ["#4a3a52", "#3c2f44", "#382b40", "#3a3a44"],
  ["#5a4632", "#4a3a28", "#443424", "#4a4a52"],
  ["#3e5a48", "#324a3a", "#2e4436", "#5a5046"],
];
const TERNOS_2 = [
  ["#2e3e66", "#253356", "#222f50", "#3a4458"],
  ["#7a6a3c", "#655730", "#5e512c", "#5a5446"],
  ["#2f4a36", "#263d2c", "#233828", "#3a3a44"],
  ["#5e3a3e", "#4e3034", "#482c30", "#4a4a52"],
  ["#4a4e60", "#3d4150", "#383c4a", "#5a5046"],
];
const comerciantes = (ternos: string[][], g: number) =>
  COM_BASE.map((c, i) =>
    homem1925({
      ...c,
      nome: `Comerciante ${g}.${i + 1}`,
      paleto: ternos[i][0],
      paletoSombra: ternos[i][1],
      lapela: ternos[i][2],
      calca: ternos[i][3],
      // grupo 2: outra pessoa (troca bigode)
      bigodeTipo: g === 2 ? (c.bigodeTipo === "grosso" ? "fino" : c.bigodeTipo ? undefined : "fino") : c.bigodeTipo,
    }),
  );
export const COMERCIANTES_1 = comerciantes(TERNOS_1, 1);
export const COMERCIANTES_2 = comerciantes(TERNOS_2, 2);
