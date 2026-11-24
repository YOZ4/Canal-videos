import { posCabeca, posMao, posPe, type Pose, type Rosto } from "./Boneco2D";
import { mixPose, trocaRosto } from "./anim";

/**
 * CAMADA DE NATURALIDADE — vale para TODA animação de personagem do canal (episódio, conversa, corrida, luta).
 *
 * Você escreve só a "intenção" de cada personagem por quadro (pose crua: keyframes, golpes, ciclos de corrida...) e
 * esta camada faz o acabamento que separa animação amadora de profissional:
 *   1. PÉS PLANTADOS: pé no chão fica preso no lugar; se o corpo se afasta demais, o pé dá um PASSO (nunca patina).
 *   2. SECUNDÁRIOS: cabelo e barra da camiseta com mola amortecida guiada pela aceleração do corpo.
 *   3. CÂMERA QUE ENQUADRA: segue o grupo com atraso de cinegrafista, abre/fecha o zoom e tem uma TRAVA que nunca
 *      deixa cabeça, mão ou pé sair do quadro.
 *   4. ROSTO ATUADO: troca de expressão com antecipação e "take" (trocaRosto) a partir de uma escolha por quadro.
 *
 *   const CENA = criarAnimacao(DUR, (f) => ({ L: poseDoLucas(f), D: poseDoDiego(f) }), { chao: CHAO_Y });
 *   <Palco cam={CENA.camera(f)} parado> ... <Boneco2D pose={CENA.pose("L", f)} rosto={...} />
 *
 * Tudo é calculado UMA vez em quadros inteiros (sequencial, como física) e depois interpolado — funciona com câmera
 * lenta (quadros fracionados). `luta.ts` usa esta mesma camada por baixo.
 */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const suave = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const R_CABECA = 135;

// ------------------------------------------------------------------ geometria

/** gira um ponto do corpo pelo `gira` da pose (posMao/posPe/posCabeca ignoram o giro) */
export const comGiro = (p: Pose, [x, y]: [number, number]): [number, number] => {
  if (!p.gira) return [x, y];
  const ox = p.x;
  const oy = p.y - (p.giraEm ?? 600) * p.escala;
  const a = (p.gira * p.lado * Math.PI) / 180;
  return [ox + (x - ox) * Math.cos(a) - (y - oy) * Math.sin(a), oy + (x - ox) * Math.sin(a) + (y - oy) * Math.cos(a)];
};

/** pontos do corpo no mundo (cabeça com folga de cabelo, mãos, pés, quadril), considerando o giro */
export const pontosCorpo = (p: Pose): [number, number][] => {
  const [cx, cy] = posCabeca(p);
  const r = R_CABECA * 1.3 * p.escala;
  const pts: [number, number][] = [[cx - r, cy - r], [cx + r, cy - r], [cx, cy + r * 0.5], posMao(p, "D"), posMao(p, "E"), posPe(p, "D"), posPe(p, "E"), [p.x, p.y + (-396 + p.agacha) * p.escala]];
  return p.gira ? pts.map((q) => comGiro(p, q)) : pts;
};

// ------------------------------------------------------------------ 1) pés plantados

export type OpcoesPes = {
  /** y do chão (mundo) */
  chao: number;
  /** distância (unidades do boneco) que o corpo pode se afastar do pé preso antes de ele dar um passo. Padrão 40 */
  limite?: number;
  /** duração do passo automático em quadros. Padrão 5 */
  passo?: number;
  /** quadros em que os pés ficam soltos de propósito (escorregar, deslizar, ser arrastado) */
  solto?: (f: number) => boolean;
  /** quadros em que o personagem está "parado" (ajeita pés fora do lugar com um passinho) */
  parado?: (f: number) => boolean;
};

/**
 * Pós-processa uma sequência de poses (quadros inteiros): pé encostado no chão fica PRESO no mundo.
 * Funciona em perfil e de frente. Devolve as poses corrigidas e os quadros dos passos automáticos (para som de passo).
 */
export const plantarPes = (poses: Pose[], op: OpcoesPes): { poses: Pose[]; passos: { f: number; x: number }[] } => {
  const LIMITE = op.limite ?? 40;
  const PASSO = op.passo ?? 5;
  type EstPe = { preso: boolean; x: number; passo?: { de: number; ini: number } };
  const est: Record<"E" | "D", EstPe> = { E: { preso: false, x: 0 }, D: { preso: false, x: 0 } };
  const passos: { f: number; x: number }[] = [];
  const saida = poses.map((p, f) => {
    const giroOk = Math.abs((((p.gira % 360) + 540) % 360) - 180) < 12;
    const fator = (p.escala * p.lado * p.largura) / Math.sqrt(p.estica);
    const base = (q: "E" | "D") => (p.vista === "perfil" ? 0 : q === "E" ? -70 : 70);
    const rawX = (q: "E" | "D") => p.x + (base(q) + (q === "E" ? p.peE.dx : p.peD.dx)) * fator;
    const ordem: ("E" | "D")[] = ["E", "D"];
    ordem.sort((q1, q2) => Math.abs(rawX(q2) - est[q2].x) - Math.abs(rawX(q1) - est[q1].x));
    const novos: Partial<Pose> = {};
    const solto = op.solto?.(f) ?? false;
    const parado = op.parado?.(f) ?? false;
    for (const q of ordem) {
      const pe = q === "E" ? p.peE : p.peD;
      const outro = est[q === "E" ? "D" : "E"];
      const alvoX = rawX(q);
      const h = (p.y - op.chao) / p.escala + pe.dy;
      const noChao = h > -4 && giroOk && p.largura > 0.9 && !solto;
      const e = est[q];
      let x = alvoX;
      let dy = pe.dy;
      if (e.passo) {
        const k = (f - e.passo.ini) / PASSO;
        if (k >= 1 || !noChao) {
          e.passo = undefined;
          e.preso = noChao;
          e.x = alvoX;
          if (noChao) passos.push({ f, x: alvoX });
        } else {
          x = e.passo.de + (alvoX - e.passo.de) * suave(k);
          dy = Math.min(dy, -Math.sin(k * Math.PI) * 30);
        }
      } else if (noChao) {
        if (!e.preso) {
          e.preso = true;
          e.x = alvoX;
        } else {
          const longe = Math.abs(alvoX - e.x) / p.escala;
          if ((longe > LIMITE && (!outro.passo || longe > LIMITE * 2.5)) || (parado && longe > 22 && !outro.passo)) {
            e.passo = { de: e.x, ini: f };
            e.preso = false;
          } else x = e.x;
        }
      } else e.preso = false;
      novos[q === "E" ? "peE" : "peD"] = { ...pe, dx: (x - p.x) / fator - base(q), dy };
    }
    return { ...p, ...novos };
  });
  return { poses: saida, passos };
};

// ------------------------------------------------------------------ 2) movimento secundário

export type OpcoesSecundario = {
  /** quadros congelados (hit-stop): a mola também para */
  congelado?: (f: number) => boolean;
  /** força do cabelo (padrão 1; 0 desliga) */
  cabelo?: number;
  /** força da barra da camiseta (padrão 1; 0 desliga = sem pano) */
  barra?: number;
};

/**
 * Cabelo e barra da camiseta com mola amortecida: a aceleração da cabeça (e o giro do corpo) balança o cabelo; a
 * velocidade e a aceleração do quadril abrem a barra de trás da camiseta (anda pra frente → o pano fica pra trás).
 */
export const secundarios = (poses: Pose[], op: OpcoesSecundario = {}): Pose[] => {
  const kc = op.cabelo ?? 1;
  const kb = op.barra ?? 1;
  let cab = 0;
  let cabV = 0;
  let bar = 0;
  let barV = 0;
  const hx: number[] = [];
  const qx: number[] = [];
  const qy: number[] = [];
  return poses.map((p, f) => {
    const [cx] = posCabeca(p);
    hx.push(cx + p.gira * 1.2);
    qx.push(p.x);
    qy.push(p.y + p.agacha * p.escala);
    const n = hx.length;
    const acel = n >= 3 ? hx[n - 1] - 2 * hx[n - 2] + hx[n - 3] : 0;
    const vel = n >= 2 ? hx[n - 1] - hx[n - 2] : 0;
    // velocidade do quadril na direção em que o personagem olha (+ = andando pra frente)
    const vq = n >= 2 ? ((qx[n - 1] - qx[n - 2]) * p.lado) / p.escala : 0;
    const aq = n >= 3 ? ((qx[n - 1] - 2 * qx[n - 2] + qx[n - 3]) * p.lado) / p.escala : 0;
    const vy = n >= 2 ? (qy[n - 1] - qy[n - 2]) / p.escala : 0; // caindo (vy > 0) → o pano sobe
    if (!op.congelado?.(f)) {
      cabV += -0.2 * cab - 0.3 * cabV - 0.32 * acel - 0.03 * vel;
      cab = clamp(cab + cabV, -20, 20);
      const alvoB = clamp(Math.abs(vq) * 1.1 + Math.max(0, vy) * 0.5, 0, 34);
      barV += 0.22 * (alvoB - bar) - 0.34 * barV + aq * 0.9;
      bar = clamp(bar + barV, -6, 40);
    }
    const out: Pose = { ...p };
    if (kc) out.cabelo = p.cabelo + cab * p.lado * kc;
    if (kb && p.vista === "perfil" && !p.gira) out.barra = (p.barra ?? 0) + bar * kb;
    else if (kb && p.vista === "perfil") out.barra = p.barra ?? 0;
    return out;
  });
};

// ------------------------------------------------------------------ 3) câmera que enquadra

export type Cam = { x: number; y: number; zoom: number };
export type OpcoesCamera = {
  /** margem lateral (px de tela) que a câmera tenta deixar */
  margem?: number;
  zoomMin?: number;
  zoomMax?: number;
  /** altura de tela (px) onde fica o centro do grupo. Padrão 880 */
  centroY?: number;
  /** rigidez da mola (0.15 lenta … 0.35 rápida). Padrão 0.26 */
  rigidez?: number;
  /** quadros que o "cinegrafista" antecipa. Padrão 5 */
  antecipa?: number;
  /** y do chão: sempre aparece um pouco de chão */
  chao?: number;
  /** largura/altura da tela */
  w?: number;
  h?: number;
};

/** câmera (para o Palco: {x, y, zoom}) que enquadra todos os personagens em cada quadro, sem nunca cortar ninguém */
export const enquadrar = (grupos: Pose[][], op: OpcoesCamera = {}): Cam[] => {
  const W = op.w ?? 1080;
  const H = op.h ?? 1920;
  const N = Math.max(...grupos.map((g) => g.length));
  const margem = op.margem ?? 150;
  const zMin = op.zoomMin ?? 0.72;
  const zMax = op.zoomMax ?? 1.22;
  const centroY = op.centroY ?? 880;
  const alvos = new Array(N).fill(0).map((_, f) => {
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const g of grupos)
      for (const [x, y] of pontosCorpo(g[Math.min(f, g.length - 1)])) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    // folga: tênis, mãos e cabelo passam um pouco dos pontos de articulação
    x0 -= 55;
    x1 += 55;
    y0 -= 70;
    y1 = Math.max(y1 + 30, (op.chao ?? y1) + 30);
    const z = clamp(Math.min((W - 2 * margem) / (x1 - x0), (H * 0.6) / (y1 - y0)), zMin, zMax);
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z, x0, x1, y0, y1 };
  });
  const cam: Cam[] = [];
  const c = { x: alvos[0].x, y: alvos[0].y, z: alvos[0].z };
  const v = { x: 0, y: 0, z: 0 };
  const w = op.rigidez ?? 0.26;
  const ant = op.antecipa ?? 5;
  for (let f = 0; f < N; f++) {
    const a = alvos[Math.min(N - 1, f + ant)];
    for (const k of ["x", "y", "z"] as const) {
      v[k] += w * w * (a[k] - c[k]) - 2 * w * v[k];
      c[k] += v[k];
    }
    // TRAVA: ninguém sai do quadro (agora e nos próximos 2 quadros) — se a mola atrasar, a câmera abre/anda na hora
    const caixa = [0, 1, 2].map((d) => alvos[Math.min(N - 1, f + d)]);
    const x0 = Math.min(...caixa.map((q) => q.x0));
    const x1 = Math.max(...caixa.map((q) => q.x1));
    const y0 = Math.min(...caixa.map((q) => q.y0));
    const y1 = Math.max(...caixa.map((q) => q.y1));
    const zLim = Math.min((W - 120) / (x1 - x0), (H - 290) / (y1 - y0));
    if (c.z > zLim) {
      c.z = zLim;
      v.z = Math.min(0, v.z);
    }
    const z = c.z;
    c.x = clamp(c.x, x1 - (W / 2 - 60) / z, x0 + (W / 2 - 60) / z);
    const off = (H / 2 - centroY) / z;
    c.y = clamp(c.y + off, y1 - (H / 2 - 120) / z, y0 + (H / 2 - 170) / z) - off;
    cam.push({ x: c.x, y: c.y + off, zoom: z });
  }
  return cam;
};

// ------------------------------------------------------------------ 4) rosto atuado

/**
 * Transforma uma escolha de rosto por quadro (ex.: pela fase do golpe, pela fala) em trocas ATUADAS (trocaRosto):
 * antecipação (aperta os olhos), troca escondida e "take" com mola. `escolha(f)` devolve o nome do rosto, o rosto e o
 * tamanho da reação (0 suave, 1 normal, 2 susto/dor). Calcule uma vez (quadros inteiros) e use `.em(f)`.
 */
export const rostoAtuado = (n: number, escolha: (f: number) => { nome: string; rosto: Rosto; tam?: number }) => {
  const keys: [number, Rosto, number?][] = [];
  let atual = "";
  for (let f = 0; f < n; f++) {
    const e = escolha(f);
    if (e.nome !== atual) {
      atual = e.nome;
      keys.push([f, e.rosto, keys.length ? (e.tam ?? 1) : 0]);
    }
  }
  if (!keys.length) keys.push([0, escolha(0).rosto, 0]);
  return {
    /** rosto + ajuste de corpo (some `corpo.agacha` e multiplique `corpo.estica` na pose) */
    em: (f: number) => trocaRosto(f, keys),
  };
};

// ------------------------------------------------------------------ tudo junto

export type OpcoesAnimacao = {
  /** y do chão (para os pés e a câmera) */
  chao: number;
  /** ids com pés plantados (padrão: todos) */
  pes?: string[] | false;
  pesOp?: Partial<Record<string, Omit<OpcoesPes, "chao">>>;
  secundario?: OpcoesSecundario | false;
  camera?: OpcoesCamera | false;
};

/**
 * Atalho para qualquer cena: dá a pose crua de cada personagem por quadro e recebe poses com pés plantados,
 * cabelo/camiseta com mola e uma câmera que enquadra todo mundo.
 */
export const criarAnimacao = (n: number, quadro: (f: number) => Record<string, Pose>, op: OpcoesAnimacao) => {
  let cache: Record<string, Pose[]> | null = null;
  let cams: Cam[] = [];
  let passos: Record<string, { f: number; x: number }[]> = {};
  const calcular = () => {
    if (cache) return;
    const cru: Record<string, Pose[]> = {};
    for (let f = 0; f < n; f++) {
      const q = quadro(f);
      for (const [id, p] of Object.entries(q)) (cru[id] ??= []).push(p);
    }
    cache = {};
    for (const [id, arr] of Object.entries(cru)) {
      let ps = arr;
      if (op.pes !== false && (!op.pes || op.pes.includes(id))) {
        const r = plantarPes(ps, { chao: op.chao, ...(op.pesOp?.[id] ?? {}) });
        ps = r.poses;
        passos[id] = r.passos;
      }
      if (op.secundario !== false) ps = secundarios(ps, op.secundario || {});
      cache[id] = ps;
    }
    cams = op.camera === false ? [] : enquadrar(Object.values(cache), { chao: op.chao, ...(op.camera || {}) });
  };
  const interpPose = (arr: Pose[], f: number) => {
    const i = clamp(Math.floor(f), 0, arr.length - 1);
    const j = Math.min(arr.length - 1, i + 1);
    const k = clamp(f - i, 0, 1);
    return k < 1e-3 ? arr[i] : mixPose(arr[i], arr[j], k);
  };
  return {
    pose: (id: string, f: number): Pose => {
      calcular();
      return interpPose(cache![id], f);
    },
    camera: (f: number): Cam => {
      calcular();
      const i = clamp(Math.floor(f), 0, cams.length - 1);
      const j = Math.min(cams.length - 1, i + 1);
      const k = clamp(f - i, 0, 1);
      const a = cams[i];
      const b = cams[j];
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, zoom: a.zoom + (b.zoom - a.zoom) * k };
    },
    passos: (id: string) => {
      calcular();
      return passos[id] ?? [];
    },
  };
};
