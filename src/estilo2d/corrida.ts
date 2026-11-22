import type { Braco, Gesto, Pe } from "./Boneco2D";

/**
 * Ciclo de corrida de verdade (vista de perfil), baseado nas 4 poses clássicas:
 * CONTATO → APOIO (mais baixo) → IMPULSO → VOO (os dois pés fora do chão).
 * - pernas por cinemática direta (ângulo da coxa + dobra do joelho), interpoladas com Catmull-Rom (suave)
 * - o quadril sobe/desce automaticamente para o pé de apoio tocar o chão (nunca afunda)
 * - braços opostos às pernas, cotovelo ~90°
 * - `xCorrida` integra o deslocamento para o pé de apoio ficar PLANTADO (não desliza)
 */

const QUADRIL_Y = -396;
const TORNOZELO_Y = -30;
const COXA = 182;
const CANELA = 182;
const rad = (d: number) => (d * Math.PI) / 180;

export type EstiloCorrida = "normal" | "rapida" | "ninja" | "panico";

type Chave = [number, number, number]; // fase, coxa(graus, + = pra frente), joelho(dobra)

// perna "A" num ciclo completo (a perna B é a mesma com fase + 0.5)
const PERNA: Record<EstiloCorrida, Chave[]> = {
  normal: [
    [0.0, 28, 12], // contato (calcanhar à frente)
    [0.12, 8, 42], // apoio (absorve)
    [0.26, -18, 22], // passando
    [0.4, -42, 26], // impulso (perna de trás estendida)
    [0.55, -22, 86], // calcanhar sobe atrás (sem exagero)
    [0.75, 34, 104], // joelho vem pra frente
    [0.92, 46, 70], // estende pra pousar (pé ainda no ar)
  ],
  rapida: [
    [0.0, 30, 10],
    [0.1, 10, 40],
    [0.24, -20, 18],
    [0.38, -52, 20],
    [0.55, -24, 92],
    [0.74, 46, 112],
    [0.92, 58, 70],
  ],
  ninja: [
    [0.0, 40, 22],
    [0.12, 16, 58],
    [0.26, -18, 40],
    [0.4, -50, 28],
    [0.56, -30, 78],
    [0.76, 36, 96],
    [0.92, 54, 70],
  ],
  panico: [
    [0.0, 20, 18],
    [0.14, 2, 40],
    [0.3, -24, 30],
    [0.45, -36, 60],
    [0.6, -10, 120],
    [0.8, 38, 110],
    [0.92, 40, 50],
  ],
};

const CONFIG: Record<EstiloCorrida, { inclina: number; voo: number; bracoAmp: number; bracoBase: number; cotovelo: number }> = {
  normal: { inclina: 16, voo: 40, bracoAmp: 1.0, bracoBase: 4, cotovelo: 82 },
  rapida: { inclina: 24, voo: 46, bracoAmp: 1.25, bracoBase: 6, cotovelo: 88 },
  ninja: { inclina: 34, voo: 16, bracoAmp: 0, bracoBase: -78, cotovelo: 4 },
  panico: { inclina: -4, voo: 26, bracoAmp: 0, bracoBase: 118, cotovelo: -24 },
};

/** Catmull-Rom cíclico sobre chaves (fase em [0,1)) */
const amostra = (chaves: Chave[], fase: number, idx: 1 | 2) => {
  const n = chaves.length;
  const p = ((fase % 1) + 1) % 1;
  let i = n - 1;
  for (let k = 0; k < n; k++) {
    const prox = k + 1 < n ? chaves[k + 1][0] : 1 + chaves[0][0];
    if (p >= chaves[k][0] && p < prox) {
      i = k;
      break;
    }
  }
  const get = (j: number) => chaves[((j % n) + n) % n];
  const f0 = get(i)[0];
  let f1 = get(i + 1)[0];
  if (f1 <= f0) f1 += 1;
  const t = (p - f0) / (f1 - f0);
  const p0 = get(i - 1)[idx];
  const p1 = get(i)[idx];
  const p2 = get(i + 1)[idx];
  const p3 = get(i + 2)[idx];
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};

const fkPe = (coxa: number, joelho: number): [number, number] => {
  const a = rad(coxa);
  const b = rad(coxa - joelho);
  return [COXA * Math.sin(a) + CANELA * Math.sin(b), COXA * Math.cos(a) + CANELA * Math.cos(b)];
};

/** fase em que cada perna está no chão (contato → impulso) */
const APOIO: Record<EstiloCorrida, number> = { normal: 0.36, rapida: 0.36, ninja: 0.38, panico: 0.42 };

export type PoseCorrida = {
  peE: Pe;
  peD: Pe;
  agacha: number;
  inclina: number;
  estica: number;
  cabeca: number;
  bracoE: Braco;
  bracoD: Braco;
  maoE: Gesto;
  maoD: Gesto;
  /** 0..1: quanto está no ar (para sombra/efeitos) */
  noAr: number;
  /** true no frame em que um pé toca o chão */
  contato: boolean;
};

/**
 * Pose de corrida na fase `fase` (ciclos, pode passar de 1). Perna D (da frente no desenho) = perna A.
 * intensidade 0..1 mistura com a pose parada (para acelerar/frear).
 */
export const poseCorrida = (fase: number, estilo: EstiloCorrida = "normal", intensidade = 1): PoseCorrida => {
  const ch = PERNA[estilo];
  const cfg = CONFIG[estilo];
  const k = intensidade;
  const cA = amostra(ch, fase, 1) * k;
  const jA = amostra(ch, fase, 2) * k;
  const cB = amostra(ch, fase + 0.5, 1) * k;
  const jB = amostra(ch, fase + 0.5, 2) * k;
  const [axA, ayA] = fkPe(cA, jA);
  const [axB, ayB] = fkPe(cB, jB);
  const p = ((fase % 1) + 1) % 1;
  // voo: bump suave depois do impulso de cada perna
  const apoio = APOIO[estilo];
  const bump = (q: number) => {
    const d = (((q - apoio) % 1) + 1) % 1;
    return d < 0.1 ? Math.sin((d / 0.1) * Math.PI) : 0;
  };
  const voo = Math.max(bump(p), bump(p + 0.5)) * cfg.voo * k;
  const alcance = COXA + CANELA;
  // a altura do quadril vem SÓ da perna de apoio; no voo, da mais baixa menos o salto
  const qB = (p + 0.5) % 1;
  const apoioA = p < apoio;
  const apoioB = qB < apoio;
  const ayApoio = apoioA ? ayA : apoioB ? ayB : Math.max(ayA, ayB);
  const agacha = alcance - ayApoio - voo;
  const hipY = QUADRIL_Y + agacha;
  // pé que balança nunca encosta/afunda no chão (evita escorregar)
  const pe = (hipX: number, fx: number, fy: number, emApoio: boolean, coxa: number, joelho: number): Pe => {
    const dy = hipY + fy - TORNOZELO_Y;
    // canela (graus do vertical, + pra frente) → pé: calcanhar no contato (ponta sobe), ponta no impulso
    const canela = coxa - joelho;
    let rot = Math.max(-16, Math.min(48, -canela * 0.55));
    if (emApoio && Math.abs(canela) < 25) rot *= 0.3; // apoiado: pé chato no chão
    return { dx: hipX + fx, dy: emApoio ? Math.min(dy, 0) : Math.min(dy, -26), rot };
  };
  // braços: opostos à perna do mesmo lado do desenho
  const braco = (coxaOposta: number): Braco =>
    cfg.bracoAmp > 0
      ? { ombro: Math.max(-62, Math.min(52, cfg.bracoBase + coxaOposta * 1.15 * cfg.bracoAmp * k)), cotovelo: cfg.cotovelo * k + 6 }
      : {
          ombro: cfg.bracoBase * k + (estilo === "panico" ? Math.sin(fase * Math.PI * 4 + coxaOposta * 0.05) * 28 : Math.sin(fase * Math.PI * 4 + coxaOposta * 0.03) * 4),
          cotovelo: cfg.cotovelo * k + (estilo === "ninja" ? Math.sin(fase * Math.PI * 8) * 3 : 0),
        };
  const descida = Math.max(0, agacha - 10);
  const contatoA = p < 0.03;
  const contatoB = Math.abs(p - 0.5) < 0.03;
  return {
    peD: pe(8, axA, ayA, apoioA, cA, jA),
    peE: pe(-6, axB, ayB, apoioB, cB, jB),
    agacha,
    inclina: cfg.inclina * k + Math.sin(fase * Math.PI * 4) * 1.5 * k,
    estica: 1 - descida * 0.0009 + (voo > 5 ? 0.025 : 0),
    cabeca: -cfg.inclina * 0.55 * k,
    bracoD: braco(cB),
    bracoE: braco(cA),
    maoE: estilo === "ninja" ? "aberta" : estilo === "panico" ? "aberta" : "punho",
    maoD: estilo === "ninja" ? "aberta" : estilo === "panico" ? "aberta" : "punho",
    noAr: voo / Math.max(1, cfg.voo),
    contato: contatoA || contatoB,
  };
};

/** posição x do pé de apoio (local, antes da escala) para travar o pé no chão */
const peApoioX = (fase: number, estilo: EstiloCorrida): number | null => {
  const apoio = APOIO[estilo];
  const p = ((fase % 1) + 1) % 1;
  const ch = PERNA[estilo];
  if (p < apoio) return 8 + fkPe(amostra(ch, fase, 1), amostra(ch, fase, 2))[0];
  const q = (((p + 0.5) % 1) + 1) % 1;
  if (q < apoio) return -6 + fkPe(amostra(ch, fase + 0.5, 1), amostra(ch, fase + 0.5, 2))[0];
  return null;
};

/**
 * Integra o deslocamento do corpo para o pé de apoio ficar parado no chão.
 * f: frame; ciclo: frames por ciclo; escala: escala do boneco. Retorna x em px de mundo desde fase 0.
 */
const cache = new Map<string, number[]>();
const velCache = new Map<string, number>();
export const xCorrida = (f: number, ciclo: number, estilo: EstiloCorrida, escala: number): number => {
  const chave = `${ciclo}-${estilo}-${escala}`;
  let arr = cache.get(chave);
  if (!arr) {
    arr = [0];
    cache.set(chave, arr);
  }
  const alvo = Math.max(0, Math.ceil(f));
  const passo = 1 / 4; // sub-frames para precisão
  while (arr.length <= alvo) {
    const fr = arr.length - 1;
    let x = arr[fr];
    let ultimo = velCache.get(chave) ?? 0;
    for (let s = 0; s < 4; s++) {
      const a = (fr + s * passo) / ciclo;
      const b = (fr + (s + 1) * passo) / ciclo;
      const xa = peApoioX(a, estilo);
      const xb = peApoioX(b, estilo);
      let d: number;
      if (xa !== null && xb !== null && Math.abs(xb - xa) < 200) d = -(xb - xa) * escala;
      else d = ultimo;
      ultimo = d;
      x += d;
    }
    velCache.set(chave, ultimo);
    arr.push(x);
  }
  const i = Math.floor(f);
  const t = f - i;
  return arr[i] + (arr[Math.min(arr.length - 1, i + 1)] - arr[i]) * t;
};

/** pernas a partir de ângulos (coxa/joelho em graus) — para poses especiais (pulo, pouso) */
export const pernasFK = (coxaD: number, joelhoD: number, coxaE: number, joelhoE: number, agacha: number): { peD: Pe; peE: Pe } => {
  const hipY = QUADRIL_Y + agacha;
  const [dx, dy] = fkPe(coxaD, joelhoD);
  const [ex, ey] = fkPe(coxaE, joelhoE);
  return { peD: { dx: 8 + dx, dy: hipY + dy - TORNOZELO_Y }, peE: { dx: -6 + ex, dy: hipY + ey - TORNOZELO_Y } };
};

/** lista de frames (inteiros) em que um pé tocou o chão, entre de e ate. fase(f) = ciclos decorridos */
export const contatos = (fase: (g: number) => number, de: number, ate: number): { f: number; pe: "D" | "E" }[] => {
  const out: { f: number; pe: "D" | "E" }[] = [];
  for (let g = Math.max(1, de); g <= ate; g++) {
    const a = Math.floor(fase(g - 1) * 2);
    const b = Math.floor(fase(g) * 2);
    if (b > a) out.push({ f: g, pe: b % 2 === 0 ? "D" : "E" });
  }
  return out;
};

/**
 * Corrida vista de FRENTE ou de COSTAS (use com vista "frente"/"costas" e joelhoFrente: 1).
 * O joelho vem na direção da câmera (perna "encurta"), braços balançam (mão sobe até o peito).
 */
export const poseCorridaFrente = (fase: number, estilo: EstiloCorrida = "normal", intensidade = 1, costas = false) => {
  const k = intensidade;
  const s = Math.sin(fase * Math.PI * 2);
  const ninja = estilo === "ninja";
  const panico = estilo === "panico";
  const lift = (ninja ? 170 : estilo === "rapida" ? 250 : 215) * k;
  const levE = Math.max(0, s);
  const levD = Math.max(0, -s);
  const apoio = 1 - Math.abs(s); // 1 = os dois pés passando (contato)
  const curva = (v: number) => v * (0.55 + 0.45 * v);
  // frente: braço que vai pra frente traz a mão até o peito
  // costas: braço que vai pra TRÁS mostra o cotovelo subindo pra fora (o da frente some atrás do corpo)
  const braco = (vaiFrente: number, vaiTras: number) =>
    ninja
      ? { ombro: 34 + vaiFrente * 4, cotovelo: 6 }
      : panico
        ? { ombro: 150 + Math.sin(fase * Math.PI * 4) * 25, cotovelo: -20 }
        : costas
          ? { ombro: 10 + 9 * vaiTras * k, cotovelo: 48 * vaiTras * k }
          : { ombro: 12 + 14 * vaiFrente * k, cotovelo: -(40 + 85 * vaiFrente) * k };
  return {
    peE: { dx: 26 * levE, dy: -lift * curva(levE) },
    peD: { dx: -26 * levD, dy: -lift * curva(levD) },
    agacha: (16 + 40 * apoio + (ninja ? 60 : 0)) * k,
    inclina: 4 * s * k,
    cabeca: -2.5 * s * k,
    estica: 1 - 0.04 * apoio * k + (ninja ? -0.05 : 0),
    // braço oposto à perna que sobe
    bracoD: braco(levE, levD),
    bracoE: braco(levD, levE),
    maoE: (ninja || panico ? "aberta" : "punho") as Gesto,
    maoD: (ninja || panico ? "aberta" : "punho") as Gesto,
    joelhoFrente: 1,
    /** salto vertical (px de mundo, antes da escala) para somar ao y */
    sobe: 30 * (1 - apoio) * k,
  };
};
