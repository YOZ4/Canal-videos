import { Easing, interpolate, random } from "remotion";
import { CONTORNO } from "./personagens";
import { FONTE_MAO } from "../estilo/fontes";

/**
 * Desenho à mão (quadro branco): traços que se desenham sozinhos com uma caneta seguindo a ponta.
 * Use DENTRO de um <svg> (coordenadas de tela 1080×1920 ou do mundo da câmera).
 *
 *  - Traço = lista de pontos [x, y]; vira curva suave (Catmull-Rom) e ganha um tremido de mão.
 *  - <Desenho> desenha vários traços em sequência com velocidade de caneta constante (px por quadro),
 *    pausa curta entre traços e a caneta "viajando" de um para o outro — é isso que convence como desenho real.
 *  - Atalhos: seta, circulado, sublinhado, eixos, curvaGrafico. Texto escrito: <TextoMao>.
 * Não usar "contorno fervendo" (rejeitado pelo usuário): o tremido é fixo, não muda a cada quadro.
 */

export type Pt = [number, number];

export type Traco = {
  pontos: Pt[];
  cor?: string;
  largura?: number;
  /** tremido de mão em px (0 = régua) */
  tremor?: number;
  /** pausa (quadros) antes de começar este traço */
  pausa?: number;
  /** curva (true) ou reta entre os pontos (false: eixos, setas) */
  suave?: boolean;
};

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Catmull-Rom → polilinha densa */
const curvar = (p: Pt[], passos = 10): Pt[] => {
  if (p.length < 3) return p;
  const out: Pt[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    for (let s = 0; s < passos; s++) {
      const t = s / passos;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) =>
        0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
};

/** subdivide retas longas (para o tremido ter onde agir) */
const subdividir = (p: Pt[], max = 24): Pt[] => {
  const out: Pt[] = [p[0]];
  for (let i = 1; i < p.length; i++) {
    const n = Math.max(1, Math.ceil(dist(p[i - 1], p[i]) / max));
    for (let s = 1; s <= n; s++) {
      const t = s / n;
      out.push([p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t]);
    }
  }
  return out;
};

/** tremido de mão: ruído suave (baixa frequência) perpendicular, fixo por semente */
const tremer = (p: Pt[], amp: number, semente: string): Pt[] => {
  if (amp <= 0) return p;
  const ondas = [0, 1, 2].map((i) => ({
    fr: 0.004 + random(`${semente}-fr${i}`) * 0.012,
    fase: random(`${semente}-fa${i}`) * 6.28,
    a: (0.4 + random(`${semente}-a${i}`) * 0.6) / (i + 1),
  }));
  let s = 0;
  return p.map((pt, i) => {
    if (i > 0) s += dist(p[i - 1], pt);
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    const l = dist(a, b) || 1;
    const nx = -(b[1] - a[1]) / l;
    const ny = (b[0] - a[0]) / l;
    const d = ondas.reduce((acc, o) => acc + Math.sin(s * o.fr * 6.28 + o.fase) * o.a, 0) * amp;
    return [pt[0] + nx * d, pt[1] + ny * d];
  });
};

/** prepara o traço: polilinha final + comprimentos acumulados */
const preparar = (t: Traco, semente: string) => {
  const base = t.suave === false ? subdividir(t.pontos) : subdividir(curvar(t.pontos), 12);
  const pts = tremer(base, t.tremor ?? 2.2, semente);
  const acum = [0];
  for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + dist(pts[i - 1], pts[i]));
  return { pts, acum, total: acum[acum.length - 1] };
};

/** corta a polilinha no comprimento L; devolve os pontos e a ponta */
const cortar = (pts: Pt[], acum: number[], L: number): { parte: Pt[]; ponta: Pt; dir: number } => {
  if (L <= 0) return { parte: [], ponta: pts[0], dir: 0 };
  const parte: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (acum[i] <= L) {
      parte.push(pts[i]);
      continue;
    }
    const t = (L - acum[i - 1]) / (acum[i] - acum[i - 1] || 1);
    const p: Pt = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    parte.push(p);
    return { parte, ponta: p, dir: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) };
  }
  const n = pts.length;
  return { parte, ponta: pts[n - 1], dir: n > 1 ? Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]) : 0 };
};

const caminho = (p: Pt[]) => (p.length ? `M${p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L")}` : "");

export type Plano = { inicio: number; fim: number; total: number }[];

/** quando cada traço começa/termina (quadros relativos ao `de`) — use para sincronizar com a narração */
export const planoDesenho = (tracos: Traco[], velocidade = 55, semente = "d"): Plano => {
  let t = 0;
  return tracos.map((tr, i) => {
    const { total } = preparar(tr, `${semente}-${i}`);
    t += tr.pausa ?? (i === 0 ? 0 : 5);
    // traço curto ainda leva no mínimo 5 quadros; longo nunca passa de 40
    const dur = Math.min(40, Math.max(5, Math.round(total / velocidade)));
    const r = { inicio: t, fim: t + dur, total };
    t += dur;
    return r;
  });
};

/** duração total (quadros) de um desenho */
export const duracaoDesenho = (tracos: Traco[], velocidade = 55, semente = "d") => {
  const p = planoDesenho(tracos, velocidade, semente);
  return p.length ? p[p.length - 1].fim : 0;
};

/** caneta (marcador) com a ponta em (x, y) */
export const Caneta: React.FC<{ x: number; y: number; ang?: number; cor?: string; escala?: number; opacidade?: number }> = ({
  x,
  y,
  ang = -35,
  cor = "#2b6cff",
  escala = 1,
  opacidade = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${escala})`} opacity={opacidade}>
    {/* sombra no papel */}
    <rect x={14} y={6} width={170} height={30} rx={14} fill="#000" opacity={0.12} transform="rotate(8)" />
    <path d="M0 0 L22 -10 L22 10 Z" fill={CONTORNO} />
    <rect x={20} y={-14} width={30} height={28} rx={4} fill="#e9e4da" stroke={CONTORNO} strokeWidth={4} />
    <rect x={48} y={-17} width={130} height={34} rx={10} fill={cor} stroke={CONTORNO} strokeWidth={5} />
    <rect x={60} y={-12} width={100} height={7} rx={3} fill="#fff" opacity={0.35} />
  </g>
);

/**
 * Desenha os traços em sequência a partir do quadro `de`.
 * `velocidade` = px por quadro da caneta (40 calmo · 55 normal · 80 apressado).
 */
export const Desenho: React.FC<{
  f: number;
  de: number;
  tracos: Traco[];
  velocidade?: number;
  semente?: string;
  caneta?: boolean;
  corCaneta?: string;
  /** quadros depois do fim em que a caneta sai de cena */
  sumirCaneta?: number;
}> = ({ f, de, tracos, velocidade = 55, semente = "d", caneta = true, corCaneta, sumirCaneta = 8 }) => {
  const plano = planoDesenho(tracos, velocidade, semente);
  const g = f - de;
  let ponta: Pt | null = null;
  const fim = plano.length ? plano[plano.length - 1].fim : 0;
  const els = tracos.map((tr, i) => {
    const { pts, acum, total } = preparar(tr, `${semente}-${i}`);
    const { inicio, fim: fimT } = plano[i];
    // velocidade da caneta: arranca, corre e freia em cada traço
    const prog = interpolate(g, [inicio, fimT], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    });
    const { parte, ponta: p } = cortar(pts, acum, prog * total);
    if (g >= inicio && g <= fimT) ponta = p;
    // entre traços: caneta viaja do fim deste até o começo do próximo
    if (i < tracos.length - 1 && g > fimT && g < plano[i + 1].inicio) {
      const prox = preparar(tracos[i + 1], `${semente}-${i + 1}`).pts[0];
      const t = Easing.inOut(Easing.quad)((g - fimT) / Math.max(1, plano[i + 1].inicio - fimT));
      const fimP = pts[pts.length - 1];
      ponta = [fimP[0] + (prox[0] - fimP[0]) * t, fimP[1] + (prox[1] - fimP[1]) * t - Math.sin(t * Math.PI) * 30];
    }
    if (!parte.length) return null;
    const cor = tr.cor ?? CONTORNO;
    const larg = tr.largura ?? 9;
    return (
      <g key={i}>
        <path d={caminho(parte)} fill="none" stroke={cor} strokeWidth={larg} strokeLinecap="round" strokeLinejoin="round" />
        {/* segunda passada fina e deslocada: textura de marcador */}
        <path
          d={caminho(parte)}
          fill="none"
          stroke={cor}
          strokeWidth={larg * 0.35}
          strokeLinecap="round"
          opacity={0.35}
          transform={`translate(${larg * 0.25} ${-larg * 0.2})`}
        />
      </g>
    );
  });
  // caneta: entra um pouco antes, sai depois do fim
  let canetaEl = null;
  if (caneta && plano.length) {
    const primeira = preparar(tracos[0], `${semente}-0`).pts[0];
    if (g < 0) ponta = null;
    if (g >= -6 && g < 0) ponta = primeira;
    const ultima = preparar(tracos[tracos.length - 1], `${semente}-${tracos.length - 1}`).pts;
    if (g > fim) ponta = ultima[ultima.length - 1];
    if (ponta) {
      const entra = interpolate(g, [-6, 0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const sai = interpolate(g, [fim, fim + sumirCaneta], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
      const [px, py] = ponta as Pt;
      // mão levanta a caneta ao entrar/sair e balança de leve enquanto desenha
      const levanta = (1 - entra) * 60 + sai * 140;
      const ang = -35 + Math.sin(g * 0.35) * 3 - sai * 10;
      canetaEl = <Caneta x={px + levanta * 0.6} y={py - levanta} ang={ang} cor={corCaneta} opacidade={entra * (1 - sai)} />;
    }
  }
  return (
    <g>
      {els}
      {canetaEl}
    </g>
  );
};

// ---------- atalhos de traços ----------

/** seta de a até b com curva (bojo em px, sinal muda o lado) e cabeça em dois traços */
export const seta = (a: Pt, b: Pt, opts: { bojo?: number; cor?: string; largura?: number; cabeca?: number } = {}): Traco[] => {
  const { bojo = 60, cor = "#e0603a", largura = 8, cabeca = 34 } = opts;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const l = dist(a, b) || 1;
  const nx = -(b[1] - a[1]) / l;
  const ny = (b[0] - a[0]) / l;
  const meio: Pt = [mx + nx * bojo, my + ny * bojo];
  // direção de chegada (do meio pra ponta)
  const ang = Math.atan2(b[1] - meio[1], b[0] - meio[0]);
  const asa = (s: number): Pt => [b[0] - Math.cos(ang + s * 0.5) * cabeca, b[1] - Math.sin(ang + s * 0.5) * cabeca];
  return [
    { pontos: [a, meio, b], cor, largura },
    { pontos: [asa(1), b], cor, largura, suave: false, pausa: 2 },
    { pontos: [b, asa(-1)], cor, largura, suave: false, pausa: 1 },
  ];
};

/** circula algo (elipse que dá ~1,15 volta, como alguém circulando à mão) */
export const circulado = (cx: number, cy: number, rx: number, ry: number, opts: { cor?: string; largura?: number; voltas?: number } = {}): Traco => {
  const { cor = "#e0603a", largura = 8, voltas = 1.15 } = opts;
  const n = 28;
  const pontos: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = -2.4 + (i / n) * voltas * Math.PI * 2;
    const enc = 1 - (i / n) * 0.08; // a volta final fecha um pouco por dentro
    pontos.push([cx + Math.cos(a) * rx * enc, cy + Math.sin(a) * ry * enc]);
  }
  return { pontos, cor, largura, tremor: 3 };
};

/** sublinhado meio torto */
export const sublinhado = (x0: number, x1: number, y: number, opts: { cor?: string; largura?: number } = {}): Traco => ({
  pontos: [
    [x0, y + 4],
    [(x0 + x1) / 2, y - 3],
    [x1, y + 2],
  ],
  cor: opts.cor ?? "#e0603a",
  largura: opts.largura ?? 9,
  tremor: 1.5,
});

/** eixos de gráfico (vertical de cima pra baixo, depois horizontal) com setinhas */
export const eixos = (x: number, y: number, larg: number, alt: number, cor = CONTORNO): Traco[] => [
  { pontos: [[x, y - alt], [x, y]], cor, largura: 7, suave: false, tremor: 1.5 },
  { pontos: [[x, y], [x + larg, y]], cor, largura: 7, suave: false, tremor: 1.5 },
  { pontos: [[x - 16, y - alt + 22], [x, y - alt], [x + 16, y - alt + 22]], cor, largura: 6, suave: false, tremor: 0.5, pausa: 2 },
  { pontos: [[x + larg - 22, y - 16], [x + larg, y], [x + larg - 22, y + 16]], cor, largura: 6, suave: false, tremor: 0.5, pausa: 2 },
];

/** pontos de uma curva de gráfico a partir de valores (0..max) dentro da área dos eixos */
export const curvaGrafico = (x: number, y: number, larg: number, alt: number, valores: number[], max?: number): Pt[] => {
  const m = max ?? Math.max(...valores);
  return valores.map((v, i) => [x + 14 + (i / (valores.length - 1)) * (larg - 50), y - 10 - (v / m) * (alt - 60)]);
};

/**
 * Texto "escrito à mão": revela da esquerda pra direita na velocidade da caneta (px por quadro),
 * com a caneta na ponta. Fonte de mão (Patrick Hand) por padrão.
 */
export const TextoMao: React.FC<{
  f: number;
  de: number;
  texto: string;
  x: number;
  y: number;
  tamanho?: number;
  cor?: string;
  /** px por quadro */
  velocidade?: number;
  caneta?: boolean;
  ancora?: "start" | "middle" | "end";
  id: string;
  fonte?: string;
}> = ({ f, de, texto, x, y, tamanho = 72, cor = CONTORNO, velocidade = 38, caneta = true, ancora = "start", id, fonte = FONTE_MAO }) => {
  // largura estimada (Patrick Hand ~0,48 do tamanho por letra)
  const larg = texto.length * tamanho * 0.48;
  const x0 = ancora === "start" ? x : ancora === "middle" ? x - larg / 2 : x - larg;
  const dur = Math.max(6, Math.round(larg / velocidade));
  const prog = interpolate(f - de, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  if (f < de - 6) return null;
  const borda = x0 + prog * (larg + 20);
  // a caneta sobe e desce como se fizesse as letras
  const pyCaneta = y - tamanho * 0.3 + Math.sin((f - de) * 1.3) * tamanho * 0.18;
  const sai = interpolate(f - de, [dur, dur + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const entra = interpolate(f - de, [-6, 0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <g>
      <defs>
        <clipPath id={`txm-${id}`}>
          <rect x={x0 - 30} y={y - tamanho * 1.3} width={Math.max(0, borda - x0 + 30)} height={tamanho * 1.8} />
        </clipPath>
      </defs>
      <text
        x={x0}
        y={y}
        fontFamily={fonte}
        fontSize={tamanho}
        fill={cor}
        clipPath={`url(#txm-${id})`}
      >
        {texto}
      </text>
      {caneta && sai < 1 ? (
        <Caneta x={borda + sai * 80} y={pyCaneta - sai * 140 - (1 - entra) * 60} ang={-35 - sai * 10} opacidade={entra * (1 - sai)} />
      ) : null}
    </g>
  );
};

/** duração (quadros) que <TextoMao> leva para escrever o texto */
export const duracaoTexto = (texto: string, tamanho = 72, velocidade = 38) =>
  Math.max(6, Math.round((texto.length * tamanho * 0.48) / velocidade));

/** folha de papel/quadro branco de fundo (com leve textura e grade opcional) */
export const Papel: React.FC<{ x?: number; y?: number; w?: number; h?: number; grade?: boolean; cor?: string }> = ({
  x = 0,
  y = 0,
  w = 1080,
  h = 1920,
  grade = false,
  cor = "#fbf7ef",
}) => (
  <g>
    <defs>
      <pattern id="papel-grade" width={60} height={60} patternUnits="userSpaceOnUse">
        <path d="M60 0 L0 0 0 60" fill="none" stroke="#c9bfae" strokeWidth={1.5} opacity={0.5} />
      </pattern>
      <radialGradient id="papel-vinheta" cx="50%" cy="45%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#5a4630" stopOpacity={0.16} />
      </radialGradient>
    </defs>
    <rect x={x} y={y} width={w} height={h} fill={cor} />
    {grade ? <rect x={x} y={y} width={w} height={h} fill="url(#papel-grade)" /> : null}
    <rect x={x} y={y} width={w} height={h} fill="url(#papel-vinheta)" />
  </g>
);
