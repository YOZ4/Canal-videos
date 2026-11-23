import { Easing, interpolate } from "remotion";
import { mola, SENSACAO } from "./movimento";

/**
 * Motion design (gráficos, textos, infográficos, objetos de cena — não os bonecos; para bonecos veja
 * a skill analise-movimento-remotion). Tudo é função do quadro: nada de estado.
 *
 *  - TEMPO: durações padrão (em quadros a 30 qps; use `qd()` para 24 qps)
 *  - escalonado: entrada em cascata (stagger) de uma lista
 *  - entrada / saida / vida: escala, posição e opacidade prontas, com mola
 *  - estiloCss / transformSvg: aplica o resultado em <div> ou <g>
 */

/** durações em quadros a 30 qps */
export const TEMPO = {
  /** pisca/pop de um ícone */
  instante: 4,
  /** saída, troca de número, sublinhado */
  rapido: 6,
  /** entrada padrão de um elemento */
  medio: 10,
  /** entrada de título, câmera assentando */
  lento: 16,
  /** respiro: ninguém se mexe antes de algo importante */
  pausa: 12,
  /** intervalo entre itens de uma lista */
  cascata: 4,
} as const;

/** converte quadros pensados a 30 qps para o fps do vídeo (ex.: 24 no estilo JJK) */
export const qd = (n: number, fps = 30) => Math.max(1, Math.round((n * fps) / 30));

/** quadro em que o item i de uma lista entra (cascata); `acelera` < 1 encurta o intervalo a cada item */
export const escalonado = (de: number, i: number, intervalo: number = TEMPO.cascata, acelera = 1) => {
  if (acelera === 1) return de + i * intervalo;
  let t = de;
  for (let j = 0; j < i; j++) t += intervalo * Math.pow(acelera, j);
  return Math.round(t);
};

export type Estado = { x: number; y: number; escala: number; rot: number; opacidade: number };
export const PARADO: Estado = { x: 0, y: 0, escala: 1, rot: 0, opacidade: 1 };

export type TipoEntrada =
  | "estoura" // cresce do zero passando do ponto (ícones, selos, números)
  | "sobe" // vem de baixo assentando (textos, cartões)
  | "desce" // cai de cima e quica de leve (placas, objetos pesados)
  | "esquerda" // desliza da esquerda (barras, listas)
  | "direita"
  | "gira" // estoura girando (medalhas, conquistas)
  | "aparece"; // só opacidade (fundos, sombras)

type Sensacao = keyof typeof SENSACAO;

/**
 * Estado de entrada de um elemento que começa a entrar no quadro `de`.
 * Distância em px; a mola passa do ponto conforme a sensação (solto > natural > firme).
 */
export const entrada = (
  f: number,
  de: number,
  tipo: TipoEntrada = "sobe",
  opts: { sensacao?: Sensacao; dist?: number; fps?: number } = {},
): Estado => {
  const { sensacao = tipo === "estoura" || tipo === "gira" ? "solto" : "natural", dist = 90, fps = 30 } = opts;
  if (f < de) return { ...PARADO, escala: tipo === "estoura" || tipo === "gira" ? 0 : 1, opacidade: 0 };
  const m = mola(f, de, sensacao, fps);
  // opacidade chega antes do movimento (o olho vê o elemento já chegando)
  const op = interpolate(f - de, [0, qd(5, fps)], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const resto = 1 - m;
  switch (tipo) {
    case "estoura":
      return { ...PARADO, escala: m, opacidade: op };
    case "gira":
      return { ...PARADO, escala: m, rot: resto * -120, opacidade: op };
    case "sobe":
      return { ...PARADO, y: resto * dist, escala: 0.94 + 0.06 * m, opacidade: op };
    case "desce":
      return { ...PARADO, y: -resto * dist * 1.6, opacidade: op };
    case "esquerda":
      return { ...PARADO, x: -resto * dist * 2, opacidade: op };
    case "direita":
      return { ...PARADO, x: resto * dist * 2, opacidade: op };
    case "aparece":
      return { ...PARADO, opacidade: op };
  }
};

/** saída rápida (sempre mais curta que a entrada) — acelera para fora, sem mola */
export const saida = (
  f: number,
  de: number,
  tipo: "encolhe" | "sobe" | "desce" | "some" = "encolhe",
  dur: number = TEMPO.rapido,
): Estado => {
  if (f < de) return PARADO;
  const t = interpolate(f, [de, de + dur], [0, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  switch (tipo) {
    case "encolhe":
      return { ...PARADO, escala: 1 - t, opacidade: 1 - t * t };
    case "sobe":
      return { ...PARADO, y: -t * 120, opacidade: 1 - t };
    case "desce":
      return { ...PARADO, y: t * 160, opacidade: 1 - t };
    case "some":
      return { ...PARADO, opacidade: 1 - t };
  }
};

/** junta dois estados (entrada × saída × qualquer extra) */
export const compoe = (...es: Estado[]): Estado =>
  es.reduce((a, b) => ({
    x: a.x + b.x,
    y: a.y + b.y,
    escala: a.escala * b.escala,
    rot: a.rot + b.rot,
    opacidade: a.opacidade * b.opacidade,
  }), PARADO);

/** "vida" enquanto o elemento está parado: flutua de leve para não ficar morto (amp em px) */
export const flutua = (f: number, semente = 0, amp = 4): Estado => ({
  ...PARADO,
  y: Math.sin((f + semente * 17) * 0.07) * amp,
  rot: Math.sin((f + semente * 11) * 0.05) * amp * 0.15,
});

/** ciclo completo: entra em `de`, fica vivo, sai em `ate` */
export const vida = (
  f: number,
  de: number,
  ate: number | undefined,
  tipo: TipoEntrada = "sobe",
  opts: { semente?: number; tipoSaida?: "encolhe" | "sobe" | "desce" | "some"; flutuar?: number; fps?: number } = {},
): Estado =>
  compoe(
    entrada(f, de, tipo, { fps: opts.fps }),
    flutua(f, opts.semente ?? 0, opts.flutuar ?? 3),
    ate === undefined ? PARADO : saida(f, ate, opts.tipoSaida ?? "encolhe"),
  );

/** pulso de destaque (quando a narração fala daquele item): cresce e volta com mola */
export const pulso = (f: number, de: number, forca = 0.18): number => {
  if (f < de) return 1;
  const m = mola(f, de, "solto");
  const ida = interpolate(f - de, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  return 1 + forca * ida * (1 - m) * 2.2;
};

/** contador que desacelera ao chegar no número final (placar, dinheiro, porcentagem) */
export const conta = (f: number, de: number, dur: number, ate: number, desdeValor = 0) =>
  interpolate(f, [de, de + dur], [desdeValor, ate], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

export const estiloCss = (e: Estado): React.CSSProperties => ({
  transform: `translate(${e.x}px, ${e.y}px) rotate(${e.rot}deg) scale(${e.escala})`,
  opacity: e.opacidade,
});

/** transform de SVG girando/escalando em torno de (cx, cy) */
export const transformSvg = (e: Estado, cx: number, cy: number) =>
  `translate(${cx + e.x} ${cy + e.y}) rotate(${e.rot}) scale(${e.escala}) translate(${-cx} ${-cy})`;
