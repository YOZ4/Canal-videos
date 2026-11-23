import { DIEGO, LUCAS, type Design } from "../../estilo2d/personagens";

/** Elenco do episódio "Egito: a areia molhada" — figurino do Egito antigo (rosto/cabelo oficiais mantidos) */

const semRoupa = (d: Design, sola = "#8a5a2e"): Design => ({
  ...d,
  camisa: d.pele,
  camisaSombra: d.peleSombra,
  manga: d.pele,
  calca: d.pele,
  calcaSombra: d.peleSombra,
  tenis: d.pele,
  sola,
  numero: undefined,
});

export const LUCAS_EG: Design = {
  ...semRoupa(LUCAS),
  nome: "Lucas",
  egito: { cinto: "#f2c12e", cintoSombra: "#c99a14", colar: "#f2c12e" },
};

export const DIEGO_EG: Design = {
  ...semRoupa(DIEGO),
  nome: "Diego",
  egito: { cinto: "#2e9e4f", cintoSombra: "#1f7438", colar: "#2e9e4f" },
};

export const CHEFE: Design = {
  ...semRoupa({ ...DIEGO, pele: "#c98b5e", peleSombra: "#a96f46", olhos: "#3a2414", corCabelo: "#1c1720", corCabeloSombra: "#3a3238", sobrancelha: "#1c1720", brilhoCabelo: "#4a4048" }),
  nome: "Chefe",
  sobrancelhaGrossa: true,
  egito: { cinto: "#c9a227", cintoSombra: "#9a7a18", colar: "#c9a227", khat: true },
};

const TONS: [string, string][] = [
  ["#c98b5e", "#a96f46"],
  ["#b5774b", "#955c35"],
  ["#d9a072", "#bb8255"],
  ["#a8693f", "#87512d"],
];

/** trabalhadores: 4 tons de pele, cabelo preto curto, cinto bege/marrom */
export const TRABALHADORES: Design[] = TONS.map(([pele, sombra], i) => ({
  ...semRoupa({ ...DIEGO, pele, peleSombra: sombra, olhos: "#2a1a10", corCabelo: "#1c1720", corCabeloSombra: "#33282f", sobrancelha: "#1c1720", brilhoCabelo: "#4a4048" }),
  nome: `Trabalhador ${i + 1}`,
  sobrancelhaGrossa: i % 2 === 0,
  egito: { cinto: i % 2 ? "#8a5a2e" : "#c8a878", cintoSombra: i % 2 ? "#6a4220" : "#a8885a", colar: i % 2 ? "#c8a878" : "#8a5a2e" },
}));
