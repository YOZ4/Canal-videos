import { Easing } from "remotion";
import { ip } from "./cenario";
import { CENA } from "./tempo";

/**
 * Estado do "mundo" do deserto em função do quadro ABSOLUTO (continuidade entre cenas).
 * Equipe do Lucas: trenó em X_L (perto de x = 0), corda e puxadores à direita, Lucas na frente do trenó jogando água.
 * Equipe do Diego: trenó em X_D (x ≈ -3400), "do outro lado", na areia seca.
 */
export const LUCAS_X = 760;
export const DIEGO_X = -4020;
export const CHEFE_X = 1300;
export const N_EQUIPE = 12;

/** sol: 0 no começo → 1 no fim do C10 (fim de tarde; o pôr do sol de verdade é só no C11) */
export const SOL = (fa: number) => ip(fa, [0, CENA.C11], [0, 1]);

/** trenó do Lucas: quase parado até o C08, depois desliza */
export const X_L = (fa: number) =>
  ip(fa, [0, CENA.C08], [0, 60]) + ip(fa, [CENA.C08 + 10, CENA.C08 + 230], [0, 820], Easing.inOut(Easing.cubic)) + Math.max(0, fa - (CENA.C08 + 230)) * 3.6;

/** trenó do Diego: anda um pouco e trava no monte de areia */
export const X_D = (fa: number) => -3400 + ip(fa, [CENA.C05, CENA.C08 + 140], [0, 110], Easing.out(Easing.cubic));

/** altura do monte de areia seca na frente do trenó do Diego */
export const MONTE_D = (fa: number) => ip(fa, [CENA.C05, CENA.C08 + 150], [4, 150], Easing.out(Easing.quad));

/** mancha molhada na frente do trenó do Lucas */
export const MANCHA_L = (fa: number) => ip(fa, [20, CENA.C02], [8, 64], Easing.out(Easing.cubic)) + ip(fa, [CENA.C04 + 150, CENA.C05], [0, 18]);

/** quanto o i-ésimo puxador do Lucas já foi embora (metade sai no C06: índices ímpares) */
export const SAIU_L = (fa: number, i: number) => (i % 2 === 1 ? ip(fa, [CENA.C06 + 70 + i * 9, CENA.C06 + 70 + i * 9 + 300], [0, 1]) : 0);
