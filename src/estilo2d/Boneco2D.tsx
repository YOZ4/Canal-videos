import { createContext, useContext } from "react";
import { CONTORNO, type Design } from "./personagens";

/** sombra por partes (cel-shading): cada parte (perna, braço/tronco, cabeça) recebe o próprio filtro */
type CelIds = { perna?: string; corpo?: string; cabeca?: string };
const CelCtx = createContext<CelIds>({});
const Parte: React.FC<{ k: keyof CelIds; children: React.ReactNode }> = ({ k, children }) => {
  const ids = useContext(CelCtx);
  return ids[k] ? <g filter={`url(#${ids[k]})`}>{children}</g> : <>{children}</>;
};
export type Cel = {
  /** de onde vem a luz, em graus no MUNDO (0 = direita, -90 = de cima, -160 = esquerda e um pouco de cima) */
  luz: number;
  /** largura da sombra dura (px de mundo) */
  sombra?: number;
  cor?: string;
  forca?: number;
  /** largura da luz de recorte (px de mundo); 0 = sem */
  recorte?: number;
  corRecorte?: string;
  forcaRecorte?: number;
};

/**
 * Personagem 2D articulado (SVG), desenhado no estilo da folha de personagens:
 * contorno escuro, sombra suave no lado direito, olhos grandes, braços "macarrão" curvos.
 *
 * Duas vistas: "frente" e "perfil" (perfil olha para a direita; use lado = -1 para a esquerda).
 * Coordenadas locais: origem no chão entre os pés, y para baixo (padrão SVG).
 * Altura total ≈ 1220 px na escala 1.
 */

export type Braco = { ombro: number; cotovelo: number };
/** rot: inclinação do pé em graus (perfil: + = calcanhar sobe / ponta desce; - = ponta sobe). Na frente: ignora */
export type Pe = { dx: number; dy: number; rot?: number };
export type Gesto = "bola" | "aberta" | "punho" | "aponta" | "joia";
export type Vista = "frente" | "perfil" | "costas";

export type Pose = {
  x: number;
  y: number;
  escala: number;
  /** 1 = normal; -1 = espelhado (no perfil: olhando pra esquerda) */
  lado: 1 | -1;
  vista: Vista;
  /** multiplicador horizontal (usado no giro entre vistas) */
  largura: number;
  /** inclinação do tronco em graus (positivo = pra direita da tela) */
  inclina: number;
  /** 1 = normal; >1 estica (pulo); <1 achata (impacto) */
  estica: number;
  /** quanto o quadril desce (agachar). px positivos = desce */
  agacha: number;
  /** rotação da cabeça em graus */
  cabeca: number;
  /**
   * Frente: braço do lado esquerdo/direito da TELA. ombro: 0 = pendurado, 90 = horizontal pra fora, 180 = pra cima.
   * Perfil: bracoE = braço de trás, bracoD = braço da frente. ombro: 0 = pendurado, 90 = pra frente, -40 = pra trás.
   */
  bracoE: Braco;
  bracoD: Braco;
  maoE: Gesto;
  maoD: Gesto;
  /** deslocamento dos pés (dy negativo = levantado). No perfil: peE = pé de trás, peD = da frente */
  peE: Pe;
  peD: Pe;
  /** braços cruzados (pose do Diego) — só vista de frente */
  cruzado: number;
  /** balanço do cabelo em graus (movimento secundário) */
  cabelo: number;
  /** vista 3/4 (só na vista de frente): -1 = virado pra esquerda, 0 = frente, 1 = direita */
  vira: number;
  /** "muque": 0..1 incha o bíceps do braço direito da tela (frente) */
  biceps: number;
  /** giro do corpo inteiro em graus, em torno do centro do corpo (mortal, queda) */
  gira: number;
  /** vista de frente/costas: 0 = joelho dobra pro lado; 1 = joelho vem na direção da câmera (corrida de frente) */
  joelhoFrente?: number;
};

export type Rosto = {
  /** 0 fechado / 1 normal / 1.25 arregalado */
  olhos: number;
  olhar: [number, number];
  /** graus; positivo = bravo (ponta interna desce) / negativo = preocupado */
  sobrancelha: number;
  /** quanto as sobrancelhas sobem (px) */
  sobrancelhaY: number;
  /** -1 triste / 0 reto / 1 sorriso */
  sorriso: number;
  /** 0 fechada / 1 bem aberta */
  boca: number;
  /** sorriso de canto: -1..1 */
  canto: number;
  bochecha: number;
};

export const POSE_BASE: Pose = {
  x: 540,
  y: 1500,
  escala: 0.7,
  lado: 1,
  vista: "frente",
  largura: 1,
  inclina: 0,
  estica: 1,
  agacha: 0,
  cabeca: 0,
  bracoE: { ombro: 14, cotovelo: -8 },
  bracoD: { ombro: 14, cotovelo: -8 },
  maoE: "bola",
  maoD: "bola",
  peE: { dx: 0, dy: 0 },
  peD: { dx: 0, dy: 0 },
  cruzado: 0,
  cabelo: 0,
  vira: 0,
  biceps: 0,
  gira: 0,
};

/** pose base de perfil (em pé, olhando pra direita) */
export const PERFIL_BASE: Pose = {
  ...POSE_BASE,
  vista: "perfil",
  bracoE: { ombro: -6, cotovelo: 10 },
  bracoD: { ombro: 6, cotovelo: 14 },
  peE: { dx: -18, dy: 0 },
  peD: { dx: 18, dy: 0 },
};

export const ROSTO_BASE: Rosto = {
  olhos: 1,
  olhar: [0, 0],
  sobrancelha: 0,
  sobrancelhaY: 0,
  sorriso: 0.45,
  boca: 0,
  canto: 0,
  bochecha: 0.5,
};

// ---------- medidas ----------
const COXA = 182;
const CANELA = 182;
const TORNOZELO_Y = -30;
const QUADRIL_Y = TORNOZELO_Y - COXA - CANELA - 2;
const TRONCO = 400;
const OMBRO_X = 150;
const BRACO = 170;
const ANTEBRACO = 158;
const R_CABECA = 135;
const LINHA = 7;

const rad = (d: number) => (d * Math.PI) / 180;
type P = [number, number];

/** posição aproximada (mundo) do centro da cabeça — para balões, símbolos etc. */
export const posCabeca = (p: Pose): P => {
  const quadril = QUADRIL_Y + p.agacha;
  const alt = TRONCO + 60 + R_CABECA - 18;
  const a = rad(p.inclina);
  const lx = Math.sin(a) * alt;
  const ly = quadril - Math.cos(a) * alt;
  return [p.x + lx * p.escala * p.lado * p.largura, p.y + ly * p.escala * p.estica];
};

/** posição (mundo) da mão. Perfil: "D" = mão da frente. Ignora `gira` e o braço cruzado. Útil para close de detalhe. */
export const posMao = (p: Pose, qual: "E" | "D"): P => {
  const perfil = p.vista === "perfil";
  const ombroY = perfil ? -TRONCO + 40 : -TRONCO + 32;
  const o: P = perfil ? [qual === "E" ? -6 : 8, ombroY] : [qual === "E" ? -OMBRO_X + 8 : OMBRO_X - 8, ombroY];
  const sentido = perfil ? 1 : qual === "E" ? -1 : 1;
  const { m } = pontosBraco(o, sentido, qual === "E" ? p.bracoE : p.bracoD);
  const a = rad(p.inclina);
  const rx = m[0] * Math.cos(a) - m[1] * Math.sin(a);
  const ry = m[0] * Math.sin(a) + m[1] * Math.cos(a) + QUADRIL_Y + p.agacha;
  return [p.x + (rx * p.escala * p.lado * p.largura) / Math.sqrt(p.estica), p.y + ry * p.escala * p.estica];
};

/** posição (mundo) do pé. Perfil: "D" = pé da frente. Ignora `gira`. */
export const posPe = (p: Pose, qual: "E" | "D"): P => {
  const quadrilY = QUADRIL_Y + p.agacha;
  const perfil = p.vista === "perfil";
  const base = qual === "E" ? p.peE : p.peD;
  const q: P = perfil ? [qual === "E" ? -6 : 8, quadrilY] : [qual === "E" ? -56 : 56, quadrilY];
  const alvo: P = perfil ? [base.dx, TORNOZELO_Y + base.dy] : [(qual === "E" ? -70 : 70) + base.dx, TORNOZELO_Y + base.dy];
  const dx = alvo[0] - q[0];
  const dy = alvo[1] - q[1];
  const dist = Math.hypot(dx, dy);
  const max = COXA + CANELA - 0.5;
  const t: P = dist > max ? [q[0] + (dx / dist) * max, q[1] + (dy / dist) * max] : alvo;
  return [p.x + t[0] * p.escala * p.lado * p.largura / Math.sqrt(p.estica), p.y + t[1] * p.escala * p.estica];
};

// ---------- tubo com contorno ----------

const caminho = (pts: P[], curvo: boolean): string => {
  if (curvo && pts.length === 3) {
    // curva quadrática que passa pelo cotovelo
    const [o, c, m] = pts;
    const ctrl: P = [2 * c[0] - (o[0] + m[0]) / 2, 2 * c[1] - (o[1] + m[1]) / 2];
    return `M ${o[0]} ${o[1]} Q ${ctrl[0]} ${ctrl[1]} ${m[0]} ${m[1]}`;
  }
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
};

const Tubo: React.FC<{
  pts: P[];
  largura: number;
  cor: string;
  sombra?: string;
  cap?: "round" | "butt";
  curvo?: boolean;
}> = ({ pts, largura, cor, sombra, cap = "round", curvo }) => {
  const d = caminho(pts, !!curvo);
  return (
    <>
      <path d={d} stroke={CONTORNO} strokeWidth={largura + LINHA * 2} fill="none" strokeLinecap={cap} strokeLinejoin="round" />
      <path d={d} stroke={sombra ?? cor} strokeWidth={largura} fill="none" strokeLinecap={cap} strokeLinejoin="round" />
      {sombra ? (
        <path
          d={d}
          transform={`translate(${-largura * 0.14} 0)`}
          stroke={cor}
          strokeWidth={largura * 0.62}
          fill="none"
          strokeLinecap={cap}
          strokeLinejoin="round"
        />
      ) : null}
    </>
  );
};

// ---------- mãos ----------

/** dir = direção do antebraço (vetor unitário, do cotovelo para a mão) */
const Mao: React.FC<{ p: P; dir: P; gesto: Gesto; d: Design; espelho: number; cor?: string }> = ({
  p,
  dir,
  gesto,
  d,
  espelho,
  cor,
}) => {
  const pele = cor ?? d.pele;
  const ang = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI - 90; // 0 = mão apontando pra baixo
  // dedos em coordenadas locais (mão "pra baixo": +y)
  type Dedo = { de: P; ate: P; w: number };
  let dedos: Dedo[] = [];
  let palma = 36;
  let detalhe: React.ReactNode = null;
  if (gesto === "aberta") {
    palma = 34;
    dedos = [-30, -10, 10, 30].map((a, i) => {
      const r = rad(a);
      const len = i === 1 || i === 2 ? 62 : 54;
      return { de: [0, 10] as P, ate: [Math.sin(r) * len, 10 + Math.cos(r) * len] as P, w: 20 };
    });
    dedos.push({ de: [0, 0], ate: [44 * espelho, -6], w: 22 }); // polegar
  } else if (gesto === "aponta") {
    palma = 34;
    dedos = [{ de: [0, 8], ate: [0, 74], w: 21 }];
    detalhe = <path d={`M ${-10 * espelho} -8 Q ${-22 * espelho} 8 ${-10 * espelho} 22`} stroke={CONTORNO} strokeWidth={4} fill="none" strokeLinecap="round" />;
  } else if (gesto === "punho") {
    palma = 38;
    detalhe = (
      <>
        <path d="M -16 14 L -16 28 M 0 16 L 0 30 M 16 14 L 16 28" stroke={CONTORNO} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${-24 * espelho} -6 Q ${-4 * espelho} 2 ${14 * espelho} -4`} stroke={CONTORNO} strokeWidth={4} fill="none" strokeLinecap="round" />
      </>
    );
  } else if (gesto === "joia") {
    palma = 36;
    detalhe = <path d="M -14 12 L -14 26 M 4 14 L 4 28" stroke={CONTORNO} strokeWidth={4} strokeLinecap="round" />;
  }
  // polegar da "joia" sempre pra cima no mundo
  const polegarJoia = gesto === "joia";
  return (
    <g transform={`translate(${p[0]} ${p[1]})`}>
      {polegarJoia ? (
        <>
          <path d="M 0 -10 L 0 -66" stroke={CONTORNO} strokeWidth={24 + LINHA * 2} strokeLinecap="round" />
        </>
      ) : null}
      <g transform={`rotate(${ang})`}>
        {dedos.map((f, i) => (
          <path key={`o${i}`} d={`M ${f.de[0]} ${f.de[1]} L ${f.ate[0]} ${f.ate[1]}`} stroke={CONTORNO} strokeWidth={f.w + LINHA * 2} strokeLinecap="round" />
        ))}
        <circle r={palma + LINHA} fill={CONTORNO} />
        {dedos.map((f, i) => (
          <path key={`f${i}`} d={`M ${f.de[0]} ${f.de[1]} L ${f.ate[0]} ${f.ate[1]}`} stroke={pele} strokeWidth={f.w} strokeLinecap="round" />
        ))}
        <circle r={palma} fill={pele} />
        {gesto === "bola" ? <path d="M -9 -8 L -9 10 M 6 -8 L 6 10" stroke={CONTORNO} strokeWidth={4} strokeLinecap="round" /> : null}
        {detalhe}
      </g>
      {polegarJoia ? <path d="M 0 -10 L 0 -66" stroke={pele} strokeWidth={24} strokeLinecap="round" /> : null}
    </g>
  );
};

// ---------- braço ----------

const pontosBraco = (o: P, sentido: number, b: Braco, alongaAntebraco = 1): { c: P; m: P; dir: P } => {
  const a1 = rad(b.ombro);
  const c: P = [o[0] + Math.sin(a1) * BRACO * sentido, o[1] + Math.cos(a1) * BRACO];
  const a2 = rad(b.ombro + b.cotovelo);
  const dir: P = [Math.sin(a2) * sentido, Math.cos(a2)];
  const m: P = [c[0] + dir[0] * ANTEBRACO * alongaAntebraco, c[1] + dir[1] * ANTEBRACO * alongaAntebraco];
  return { c, m, dir };
};

const BracoDesenho: React.FC<{
  o: P;
  sentido: number;
  b: Braco;
  gesto: Gesto;
  d: Design;
  alonga?: number;
  atras?: boolean;
  biceps?: number;
  objeto?: React.ReactNode;
  objetoGira?: boolean;
}> = ({ o, sentido, b, gesto, d, alonga = 1, atras, biceps = 0, objeto, objetoGira }) => {
  const { c, m, dir } = pontosBraco(o, sentido, b, alonga);
  // músculo: incha pro lado em que o antebraço dobra
  const meio: P = [o[0] + (c[0] - o[0]) * 0.66, o[1] + (c[1] - o[1]) * 0.66];
  const ux = (c[0] - o[0]) / BRACO;
  const uy = (c[1] - o[1]) / BRACO;
  const lado = (ux * dir[1] - uy * dir[0]) > 0 ? 1 : -1;
  const bulge: P = [meio[0] - uy * 36 * lado * biceps, meio[1] + ux * 36 * lado * biceps];
  const rb = 30 + 30 * biceps;
  const pele = atras ? d.peleSombra : d.pele;
  const camisa = atras ? d.camisaSombra : d.camisa;
  const fm = 0.62 - 0.26 * biceps;
  const mangaFim: P = [o[0] + (c[0] - o[0]) * fm, o[1] + (c[1] - o[1]) * fm];
  const punho: P = [o[0] + (c[0] - o[0]) * (fm - 0.12), o[1] + (c[1] - o[1]) * (fm - 0.12)];
  return (
    <g>
      {biceps > 0.02 ? <circle cx={bulge[0]} cy={bulge[1]} r={rb + LINHA} fill={CONTORNO} /> : null}
      <Tubo pts={[o, c, m]} largura={62} cor={pele} sombra={atras ? undefined : d.peleSombra} curvo />
      {biceps > 0.02 ? (
        <>
          <circle cx={bulge[0]} cy={bulge[1]} r={rb} fill={pele} />
          <path d={`M ${bulge[0] - rb * 0.4} ${bulge[1] - rb * 0.3} Q ${bulge[0]} ${bulge[1] - rb * 0.75} ${bulge[0] + rb * 0.4} ${bulge[1] - rb * 0.3}`} stroke="#ffffff" strokeWidth={6} opacity={0.5} fill="none" strokeLinecap="round" />
        </>
      ) : null}
      {objeto ? (
        objetoGira ? (
          <g transform={`translate(${m[0]} ${m[1]}) rotate(${(Math.atan2(dir[1], dir[0]) * 180) / Math.PI - 90})`}>{objeto}</g>
        ) : (
          <g transform={`translate(${m[0] + dir[0] * 30} ${m[1] + dir[1] * 30})`}>{objeto}</g>
        )
      ) : null}
      <Mao p={m} dir={dir} gesto={gesto} d={d} espelho={sentido} cor={pele} />
      <Tubo pts={[o, mangaFim]} largura={98} cor={camisa} />
      <circle cx={punho[0]} cy={punho[1]} r={40} fill={atras ? d.camisaSombra : d.manga} opacity={0.85} />
      <path
        d={`M ${o[0]} ${o[1]} L ${mangaFim[0]} ${mangaFim[1]}`}
        stroke={camisa}
        strokeWidth={70}
        strokeLinecap="round"
        transform={`translate(${-8 * sentido} -6)`}
        opacity={0.9}
      />
    </g>
  );
};

// ---------- perna (IK de 2 ossos: pé fica plantado) ----------

/** joelhoX: direção preferida do joelho (frente: pra fora; perfil: pra frente = +1) */
const pontosPerna = (joelhoX: number, quadril: P, pe: P, frontal = 0): { q: P; j: P; t: P } => {
  const dx = pe[0] - quadril[0];
  const dy = pe[1] - quadril[1];
  let dist = Math.hypot(dx, dy);
  const max = COXA + CANELA - 0.5;
  let t = pe;
  if (dist > max) {
    t = [quadril[0] + (dx / dist) * max, quadril[1] + (dy / dist) * max];
    dist = max;
  }
  const meio: P = [(quadril[0] + t[0]) / 2, (quadril[1] + t[1]) / 2];
  const h = Math.sqrt(Math.max(0, COXA * COXA - (dist / 2) * (dist / 2))) * (1 - 0.88 * frontal);
  let px = -dy / dist;
  let py = dx / dist;
  if (px * joelhoX < 0) {
    px = -px;
    py = -py;
  }
  return { q: quadril, j: [meio[0] + px * h, meio[1] + py * h], t };
};

const Tenis: React.FC<{ p: P; lado: number; d: Design; perfil?: boolean; rot?: number; perto?: number }> = ({ p, lado, d, perfil, rot = 0, perto = 0 }) => (
  <g transform={`translate(${p[0]} ${p[1] + 2}) rotate(${perfil ? rot : 0}) translate(${perfil ? 22 : 0} 0) scale(${lado * (1 + perto * 0.22)} ${1 + perto * 0.5})`}>
    <path
      d="M -58 -6 L -58 -30 L 4 -30 Q 52 -20 72 6 Q 74 26 52 28 L -54 28 Q -64 26 -62 10 Z"
      fill={d.tenis}
      stroke={CONTORNO}
      strokeWidth={LINHA}
      strokeLinejoin="round"
    />
    <path d="M -58 18 L 62 18 Q 70 22 64 27 L -54 27 Z" fill={d.sola} />
    {perfil ? <path d="M -10 -28 L 20 -8 M 2 -30 L 30 -12" stroke="#c9c9d3" strokeWidth={5} strokeLinecap="round" /> : <path d="M -58 -30 L -58 28" stroke={CONTORNO} strokeWidth={LINHA} />}
  </g>
);

const PernaDesenho: React.FC<{ joelhoX: number; quadril: P; pe: P; d: Design; ladoTenis: number; perfil?: boolean; atras?: boolean; rot?: number; frontal?: number }> = ({
  joelhoX,
  quadril,
  pe,
  d,
  ladoTenis,
  perfil,
  atras,
  rot = 0,
  frontal = 0,
}) => {
  const { q, j, t } = pontosPerna(joelhoX, quadril, pe, frontal);
  // de frente, pé levantado = mais perto da câmera (aparece um pouco maior)
  const perto = !perfil && frontal > 0 ? Math.max(0, Math.min(1, (TORNOZELO_Y - pe[1]) / 200)) * frontal : 0;
  return (
    <g>
      <Tubo pts={[q, j, t]} largura={104} cor={atras ? d.calcaSombra : d.calca} sombra={atras ? undefined : d.calcaSombra} cap="butt" />
      <Tenis p={[t[0], t[1] + 4]} lado={ladoTenis} d={atras ? { ...d, tenis: "#dcdce4" } : d} perfil={perfil} rot={rot} perto={perto} />
    </g>
  );
};

// ---------- olhos e boca ----------

const Olho: React.FC<{ cx: number; abre: number; olhar: [number, number]; cor: string; pele: string; id: string; rx0?: number; vazio?: boolean; brilho?: string }> = ({
  cx,
  abre,
  olhar,
  cor,
  pele,
  id,
  rx0 = 40,
  vazio,
  brilho = "#b6ff4a",
}) => {
  const rx = rx0 * (abre > 1 ? 1 + (abre - 1) * 0.5 : 1);
  const ry = 46 * (abre > 1 ? 1 + (abre - 1) * 0.6 : 1);
  const cy = -10;
  if (abre < 0.08) {
    return (
      <path d={`M ${cx - rx} ${cy + 6} Q ${cx} ${cy + 22} ${cx + rx} ${cy + 6}`} stroke={CONTORNO} strokeWidth={7} fill="none" strokeLinecap="round" />
    );
  }
  if (vazio) {
    // olho branco brilhando, sem pupila, com a pálpebra de cima pesada (cara de fúria)
    const a2 = Math.min(1, abre);
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={rx * 1.3} ry={ry * 0.9 * a2} fill={brilho} opacity={0.45} />
        <ellipse cx={cx} cy={cy + 4} rx={rx} ry={ry * 0.62 * a2} fill="#f6fff0" stroke={CONTORNO} strokeWidth={6} />
        <path d={`M ${cx - rx - 6} ${cy - ry * 0.4} L ${cx + rx + 6} ${cy - ry * 0.75}`} stroke={CONTORNO} strokeWidth={10} strokeLinecap="round" />
      </g>
    );
  }
  const a = Math.min(1, abre);
  const palpebraY = cy - ry + (1 - a) * ry * 1.7;
  const ix = cx + olhar[0] * 13 * (rx0 / 40);
  const iy = cy + 6 + olhar[1] * 10;
  const clip = `olho-${id}-${Math.round(cx)}`;
  return (
    <g>
      <clipPath id={clip}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffffff" />
      <g clipPath={`url(#${clip})`}>
        <circle cx={ix} cy={iy} r={24} fill={cor} stroke="#2a1810" strokeWidth={3} />
        <circle cx={ix} cy={iy} r={11} fill="#140c10" />
        <circle cx={ix - 8} cy={iy - 9} r={6} fill="#ffffff" />
        <rect x={cx - rx - 4} y={cy - ry - 4} width={rx * 2 + 8} height={palpebraY - (cy - ry) + 4} fill={pele} />
        <path d={`M ${cx - rx - 4} ${palpebraY} Q ${cx} ${palpebraY - 5} ${cx + rx + 4} ${palpebraY}`} stroke={CONTORNO} strokeWidth={8} fill="none" />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={CONTORNO} strokeWidth={6} />
    </g>
  );
};

const Boca: React.FC<{ r: Rosto; x?: number; escalaX?: number }> = ({ r, x = 0, escalaX = 1 }) => {
  const y = 78;
  const w = 34;
  const ladoE = -r.sorriso * 6 + r.canto * 6;
  const ladoD = -r.sorriso * 6 - r.canto * 10;
  // fúria (sorriso muito negativo): grito largo com as duas fileiras de dentes, ou dentes cerrados de boca fechada
  if (r.sorriso <= -0.7) {
    const abre = Math.max(0.12, r.boca);
    const lw = w * (1.15 + abre * 0.35);
    const topo = y - 4 - abre * 10;
    const fundo = y + 6 + abre * 54;
    const dente = Math.min(16, 6 + abre * 12);
    return (
      <g transform={`translate(${x} 0) scale(${escalaX} 1)`}>
        <path d={`M ${-lw} ${topo + 8} L ${lw} ${topo + 8} L ${lw * 0.8} ${fundo} L ${-lw * 0.8} ${fundo} Z`} fill="#3d0f18" stroke={CONTORNO} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${-lw + 4} ${topo + 10} L ${lw - 4} ${topo + 10} L ${lw - 6} ${topo + 10 + dente} L ${-lw + 6} ${topo + 10 + dente} Z`} fill="#fbfbf2" />
        <path d={`M ${-lw * 0.8 + 4} ${fundo - 2} L ${lw * 0.8 - 4} ${fundo - 2} L ${lw * 0.8 - 6} ${fundo - 2 - dente} L ${-lw * 0.8 + 6} ${fundo - 2 - dente} Z`} fill="#fbfbf2" />
        {[-0.5, 0, 0.5].map((q) => (
          <path key={q} d={`M ${q * lw} ${topo + 10} L ${q * lw} ${topo + 10 + dente} M ${q * lw * 0.8} ${fundo - 2} L ${q * lw * 0.8} ${fundo - 2 - dente}`} stroke="#9a8f86" strokeWidth={3} />
        ))}
      </g>
    );
  }
  if (r.boca > 0.12) {
    const abre = r.boca;
    const topo = y - 6 - abre * 4 + -r.sorriso * 4;
    const fundo = y + 10 + abre * 46;
    const lw = w * (0.8 + abre * 0.25);
    return (
      <g transform={`translate(${x} 0) scale(${escalaX} 1)`}>
        <path
          d={`M ${-lw} ${topo + ladoE} Q 0 ${topo + r.sorriso * 10} ${lw} ${topo + ladoD} Q ${lw * 0.6} ${fundo} 0 ${fundo} Q ${-lw * 0.6} ${fundo} ${-lw} ${topo + ladoE} Z`}
          fill="#5b1d2b"
          stroke={CONTORNO}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {abre > 0.35 ? (
          <path d={`M ${-lw * 0.7} ${topo + 4} Q 0 ${topo + 14} ${lw * 0.7} ${topo + 4} L ${lw * 0.6} ${topo + 1} Q 0 ${topo + 4} ${-lw * 0.6} ${topo + 1} Z`} fill="#ffffff" />
        ) : null}
        <ellipse cx={0} cy={fundo - 10 - abre * 4} rx={lw * 0.45} ry={8 + abre * 6} fill="#e0697a" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} 0) scale(${escalaX} 1)`}>
      <path d={`M ${-w} ${y + ladoE} Q 0 ${y + r.sorriso * 24} ${w} ${y + ladoD}`} stroke={CONTORNO} strokeWidth={6} fill="none" strokeLinecap="round" />
      {r.canto > 0.3 ? <path d={`M ${w - 2} ${y + ladoD - 8} L ${w + 6} ${y + ladoD + 4}`} stroke={CONTORNO} strokeWidth={5} strokeLinecap="round" /> : null}
    </g>
  );
};

// ---------- cabelos ----------

const BOLHAS: [number, number, number][] = [
  [-150, -40, 40], [-152, -92, 46], [-126, -142, 50], [-80, -178, 52], [-25, -192, 54],
  [30, -192, 54], [85, -178, 52], [130, -142, 50], [154, -92, 46], [152, -40, 40],
  [-108, -74, 34], [-62, -84, 34], [-16, -88, 34], [30, -86, 34], [76, -82, 34], [118, -72, 34],
];
const CACHOS: P[] = [
  [-110, -120], [-60, -140], [-5, -150], [55, -140], [105, -118],
  [-130, -70], [-80, -105], [-25, -112], [35, -112], [90, -100], [135, -65],
  [-50, -175], [20, -180], [75, -165],
];
// perfil: nuvem deslocada pra trás, sem cobrir o rosto
const BOLHAS_PERFIL: [number, number, number][] = [
  [-170, -20, 44], [-176, -76, 48], [-150, -132, 52], [-100, -176, 54], [-40, -196, 54],
  [20, -194, 52], [76, -172, 48], [112, -132, 40], [-150, 26, 36],
  [64, -100, 32], [20, -92, 32], [-30, -86, 32],
];

const CabeloCacheado: React.FC<{ d: Design; perfil?: boolean }> = ({ d, perfil }) => {
  const bolhas = perfil ? BOLHAS_PERFIL : BOLHAS;
  return (
    <g>
      {bolhas.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={r + LINHA} fill={CONTORNO} />
      ))}
      <ellipse cx={perfil ? -40 : 0} cy={-115} rx={perfil ? 140 : 150} ry={80} fill={d.corCabelo} />
      {bolhas.map(([x, y, r], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r={r} fill={d.corCabelo} />
      ))}
      {CACHOS.map(([x, y], i) => (
        <path
          key={`c${i}`}
          d={`M ${x - 13 + (perfil ? -40 : 0)} ${y + 4} Q ${x + (perfil ? -40 : 0)} ${y - 12} ${x + 13 + (perfil ? -40 : 0)} ${y + 4}`}
          stroke={d.corCabeloSombra}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

const CabeloTopete: React.FC<{ d: Design; perfil?: boolean }> = ({ d, perfil }) =>
  perfil ? (
    <g>
      <path
        d="M -150 30 Q -170 -60 -130 -140 Q -80 -200 10 -205 Q 110 -228 200 -196 Q 172 -186 158 -168 Q 150 -120 120 -96 Q 60 -88 10 -86 Q -30 -60 -60 -20 Q -90 20 -110 40 Z"
        fill={d.corCabelo}
        stroke={CONTORNO}
        strokeWidth={LINHA}
        strokeLinejoin="round"
      />
      {["M -120 0 Q -120 -120 -40 -170", "M -60 -40 Q -40 -150 60 -190", "M 10 -90 Q 60 -160 140 -198"].map((p, i) => (
        <path key={i} d={p} stroke={d.corCabeloSombra} strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
      <path d="M -80 -150 Q -30 -190 40 -196" stroke={d.brilhoCabelo} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.6} />
    </g>
  ) : (
    <g>
      <path
        d="M -140 12 Q -158 -70 -120 -140 Q -80 -200 10 -208 Q 90 -232 176 -192 Q 150 -186 138 -172 Q 168 -120 150 -40 Q 146 -6 140 14 Q 122 -50 108 -70 Q 40 -86 -70 -82 Q -112 -70 -124 -20 Z"
        fill={d.corCabelo}
        stroke={CONTORNO}
        strokeWidth={LINHA}
        strokeLinejoin="round"
      />
      <path d="M 108 -70 Q 140 -110 138 -172 Q 168 -120 150 -40 Q 146 -6 140 14 Q 122 -50 108 -70 Z" fill={d.corCabeloSombra} opacity={0.55} />
      {["M -110 -40 Q -110 -130 -40 -170", "M -60 -84 Q -40 -160 40 -190", "M 0 -86 Q 30 -160 100 -196", "M 60 -82 Q 90 -140 130 -176"].map((p, i) => (
        <path key={i} d={p} stroke={d.corCabeloSombra} strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
      <path d="M -80 -150 Q -30 -190 40 -198" stroke={d.brilhoCabelo} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.6} />
    </g>
  );

type CoresPoder = { cor: string; claro: string; escuro: string; brilho: string };
const OURO: CoresPoder = { cor: "#ffd93a", claro: "#fff38a", escuro: "#f0a81c", brilho: "#ffe14a" };
const CabeloSaiyajin: React.FC<{ id: string; perfil?: boolean; c?: CoresPoder }> = ({ id, perfil, c = OURO }) => {
  const contorno = perfil
    ? "M -150 30 L -200 -20 L -170 -50 L -240 -110 L -160 -120 L -210 -210 L -110 -170 L -90 -290 L -20 -190 L 40 -300 L 70 -180 L 170 -240 L 140 -140 L 230 -130 L 120 -90 Q 60 -88 10 -86 Q -30 -60 -60 -20 Q -90 20 -110 40 Z"
    : "M -138 14 L -186 -40 L -150 -62 L -212 -140 L -134 -132 L -176 -236 L -82 -176 L -70 -300 L -6 -196 L 46 -318 L 70 -192 L 160 -282 L 136 -150 L 220 -160 L 160 -72 L 196 -36 L 140 14 Q 122 -50 104 -70 Q 40 -92 -70 -86 Q -112 -70 -124 -20 Z";
  return (
    <g>
      <defs>
        <filter id={`brilho-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <linearGradient id={`ouro-${id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={c.claro} />
          <stop offset="0.55" stopColor={c.cor} />
          <stop offset="1" stopColor={c.escuro} />
        </linearGradient>
      </defs>
      <path d={contorno} fill={c.brilho} opacity={0.75} filter={`url(#brilho-${id})`} />
      <path d={contorno} fill={`url(#ouro-${id})`} stroke={CONTORNO} strokeWidth={LINHA} strokeLinejoin="round" />
      {!perfil ? <path d="M -20 -92 L 6 -30 L 22 -90 Z" fill={c.cor} stroke={CONTORNO} strokeWidth={6} strokeLinejoin="round" /> : null}
      {["M -120 -60 L -150 -130", "M -50 -95 L -60 -200", "M 30 -95 L 46 -230", "M 100 -80 L 130 -170"].map((p, i) => (
        <path key={i} d={p} stroke={c.escuro} strokeWidth={6} strokeLinecap="round" />
      ))}
    </g>
  );
};

const misturaCor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
};
const Cabelo: React.FC<{ d: Design; poder: number; id: string; perfil?: boolean; balanco: number }> = ({ d, poder, id, perfil, balanco }) => {
  // antes de virar espetado, o cabelo normal vai mudando de cor (e "levantando" um pouco)
  const t = d.cabeloPoder && poder < 0.5 ? Math.max(0, poder * 2) : 0;
  const dd: Design = t > 0 && d.cabeloPoder ? { ...d, corCabelo: misturaCor(d.corCabelo, d.cabeloPoder.escuro, t), corCabeloSombra: misturaCor(d.corCabeloSombra, d.cabeloPoder.cor, t) } : d;
  return (
    <g transform={`translate(0 -60) rotate(${balanco}) skewX(${balanco * 0.6}) scale(1 ${1 + t * 0.12}) translate(0 60)`}>
      {poder >= 0.5 ? (
        <CabeloSaiyajin id={id} perfil={perfil} c={d.cabeloPoder} />
      ) : dd.cabelo === "cacheado" ? (
        <CabeloCacheado d={dd} perfil={perfil} />
      ) : (
        <CabeloTopete d={dd} perfil={perfil} />
      )}
    </g>
  );
};

// ---------- cabeça ----------

const Cabeca: React.FC<{ d: Design; r: Rosto; id: string; poder: number; balanco: number; vira?: number }> = ({ d, r, id, poder, balanco, vira = 0 }) => {
  const gid = `pele-${id}`;
  const browY = -78 - r.sobrancelhaY;
  const corOlho = d.cabeloPoder && poder >= 0.3 ? d.cabeloPoder.escuro : poder >= 0.5 ? "#18b3a3" : d.olhos;
  const vazio = !!d.olhosVazios && poder >= 0.75;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={d.pele} />
          <stop offset="0.6" stopColor={d.pele} />
          <stop offset="0.9" stopColor={d.peleSombra} />
        </linearGradient>
      </defs>
      {[-1, 1].map((s) =>
        // a orelha do lado pra onde ele vira some atrás da cabeça
        s * vira > 0.45 ? null : (
          <g key={s} transform={`translate(${-vira * 34 * (s * vira < 0 ? 1.2 : 1)} 0)`}>
            <ellipse cx={s * 132} cy={8} rx={28} ry={42} fill={s > 0 ? d.peleSombra : d.pele} stroke={CONTORNO} strokeWidth={LINHA} />
            <ellipse cx={s * 136} cy={10} rx={12} ry={22} fill={d.peleSombra} opacity={0.7} />
          </g>
        ),
      )}
      <circle r={R_CABECA} fill={`url(#${gid})`} stroke={CONTORNO} strokeWidth={LINHA} />
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={s * 78 + vira * 40} cy={50} rx={30 * (1 - s * vira * 0.3)} ry={15} fill="#f2928f" opacity={0.45 * r.bochecha} />
      ))}
      <g transform={`translate(${-vira * 22} 0)`}>
        <Cabelo d={d} poder={poder} id={id} balanco={balanco} />
      </g>
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 52 * (1 - s * vira * 0.25) + vira * 42} ${browY}) rotate(${r.sobrancelha * s}) scale(${1 - s * vira * 0.25} 1)`}>
          {d.sobrancelhaGrossa ? <rect x={-38} y={-10} width={76} height={20} rx={10} fill={d.sobrancelha} /> : <rect x={-30} y={-5} width={60} height={10} rx={5} fill={d.sobrancelha} />}
        </g>
      ))}
      <Olho cx={-50 * (1 + vira * 0.25) + vira * 42} abre={r.olhos} olhar={[r.olhar[0] + vira * 0.5, r.olhar[1]]} cor={corOlho} pele={d.pele} id={id} rx0={40 * (1 + vira * 0.22)} vazio={vazio} brilho={d.cabeloPoder?.brilho} />
      <Olho cx={50 * (1 - vira * 0.25) + vira * 42} abre={r.olhos} olhar={[r.olhar[0] + vira * 0.5, r.olhar[1]]} cor={corOlho} pele={d.pele} id={`${id}b`} rx0={40 * (1 - vira * 0.22)} vazio={vazio} brilho={d.cabeloPoder?.brilho} />
      <path d={`M ${-9 + vira * 70} 38 Q ${vira * 70} 48 ${9 + vira * 70} 38`} stroke={CONTORNO} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Boca r={r} x={vira * 55} escalaX={1 - Math.abs(vira) * 0.2} />
      {d.bigode ? (
        <path
          transform={`translate(${vira * 60} 58)`}
          d="M -70 6 Q -50 -22 -10 -10 Q 0 -14 10 -10 Q 50 -22 70 6 Q 40 0 10 6 Q 0 12 -10 6 Q -40 0 -70 6 Z"
          fill={d.corCabelo}
          stroke={CONTORNO}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      ) : null}
      {d.oculos ? (
        <g transform={`translate(${vira * 42} 0)`} fill="none" stroke={CONTORNO} strokeWidth={7}>
          <circle cx={-52} cy={-10} r={50} fill="#ffffff" fillOpacity={0.12} />
          <circle cx={52} cy={-10} r={50} fill="#ffffff" fillOpacity={0.12} />
          <path d="M -4 -14 Q 0 -22 4 -14" />
        </g>
      ) : null}
    </g>
  );
};

const CabecaPerfil: React.FC<{ d: Design; r: Rosto; id: string; poder: number; balanco: number }> = ({ d, r, id, poder, balanco }) => {
  const gid = `pelep-${id}`;
  const browY = -78 - r.sobrancelhaY;
  const corOlho = d.cabeloPoder && poder >= 0.3 ? d.cabeloPoder.escuro : poder >= 0.5 ? "#18b3a3" : d.olhos;
  const vazio = !!d.olhosVazios && poder >= 0.75;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={d.peleSombra} />
          <stop offset="0.3" stopColor={d.pele} />
          <stop offset="1" stopColor={d.pele} />
        </linearGradient>
      </defs>
      {/* nariz (atrás do contorno da cabeça para fundir) */}
      <circle cx={R_CABECA - 2} cy={34} r={22} fill={d.pele} stroke={CONTORNO} strokeWidth={LINHA} />
      <circle r={R_CABECA} fill={`url(#${gid})`} stroke={CONTORNO} strokeWidth={LINHA} />
      <circle cx={R_CABECA - 6} cy={34} r={19} fill={d.pele} />
      {/* orelha */}
      <path d="M -24 -26 Q -64 -30 -62 6 Q -60 40 -24 36" fill={d.pele} stroke={CONTORNO} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -32 -12 Q -50 -10 -48 6 Q -46 20 -34 20" stroke={d.peleSombra} strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={70} cy={50} rx={26} ry={14} fill="#f2928f" opacity={0.45 * r.bochecha} />
      <Cabelo d={d} poder={poder} id={id} perfil balanco={balanco} />
      <g transform={`translate(82 ${browY}) rotate(${-r.sobrancelha * 0.8})`}>
        {d.sobrancelhaGrossa ? <rect x={-30} y={-10} width={62} height={20} rx={10} fill={d.sobrancelha} /> : <rect x={-24} y={-5} width={50} height={10} rx={5} fill={d.sobrancelha} />}
      </g>
      <Olho cx={84} abre={r.olhos} olhar={[0.9 + r.olhar[0] * 0.1, r.olhar[1]]} cor={corOlho} pele={d.pele} id={`${id}p`} rx0={30} vazio={vazio} brilho={d.cabeloPoder?.brilho} />
      <Boca r={r} x={98} escalaX={0.6} />
      {d.bigode ? <path d="M 84 54 Q 110 38 140 52 Q 128 66 96 64 Z" fill={d.corCabelo} stroke={CONTORNO} strokeWidth={5} strokeLinejoin="round" /> : null}
      {d.oculos ? (
        <g fill="none" stroke={CONTORNO} strokeWidth={7}>
          <circle cx={88} cy={-10} r={42} fill="#ffffff" fillOpacity={0.12} />
          <path d="M 46 -14 L -10 -6" />
        </g>
      ) : null}
    </g>
  );
};

const CabecaCostas: React.FC<{ d: Design; id: string; poder: number; balanco: number }> = ({ d, id, poder, balanco }) => {
  const gid = `pelec-${id}`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={d.peleSombra} />
          <stop offset="0.35" stopColor={d.pele} />
          <stop offset="1" stopColor={d.pele} />
        </linearGradient>
      </defs>
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={s * 132} cy={8} rx={28} ry={42} fill={d.pele} stroke={CONTORNO} strokeWidth={LINHA} />
      ))}
      <circle r={R_CABECA} fill={`url(#${gid})`} stroke={CONTORNO} strokeWidth={LINHA} />
      <g transform={`translate(0 -60) rotate(${balanco}) translate(0 60)`}>
        {poder >= 0.5 ? (
          <CabeloSaiyajin id={`${id}c`} />
        ) : d.cabelo === "cacheado" ? (
          <g>
            {[
              [-150, -40, 42], [-152, -92, 46], [-126, -142, 50], [-80, -178, 52], [-25, -192, 54], [30, -192, 54], [85, -178, 52],
              [130, -142, 50], [154, -92, 46], [152, -40, 42], [-140, 10, 40], [140, 10, 40], [-110, 52, 40], [110, 52, 40],
              [-55, 76, 40], [0, 84, 40], [55, 76, 40],
            ].map(([x, y, r], i) => (
              <circle key={`o${i}`} cx={x} cy={y} r={r + LINHA} fill={CONTORNO} />
            ))}
            <ellipse cx={0} cy={-40} rx={160} ry={140} fill={d.corCabelo} />
            {[
              [-150, -40, 42], [-152, -92, 46], [-126, -142, 50], [-80, -178, 52], [-25, -192, 54], [30, -192, 54], [85, -178, 52],
              [130, -142, 50], [154, -92, 46], [152, -40, 42], [-140, 10, 40], [140, 10, 40], [-110, 52, 40], [110, 52, 40],
              [-55, 76, 40], [0, 84, 40], [55, 76, 40],
            ].map(([x, y, r], i) => (
              <circle key={`f${i}`} cx={x} cy={y} r={r} fill={d.corCabelo} />
            ))}
            {CACHOS.concat([[-90, -20], [-30, -10], [30, -20], [90, -10], [-60, 40], [0, 50], [60, 40]] as P[]).map(([x, y], i) => (
              <path key={`c${i}`} d={`M ${x - 13} ${y + 4} Q ${x} ${y - 12} ${x + 13} ${y + 4}`} stroke={d.corCabeloSombra} strokeWidth={4} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ) : (
          <g>
            <path
              d="M -146 20 Q -168 -80 -120 -150 Q -70 -212 20 -210 Q 110 -232 190 -196 Q 168 -182 156 -168 Q 176 -100 150 10 Q 120 70 60 86 Q 0 96 -60 86 Q -120 70 -146 20 Z"
              fill={d.corCabelo}
              stroke={CONTORNO}
              strokeWidth={LINHA}
              strokeLinejoin="round"
            />
            {["M -100 -130 Q -120 -20 -80 60", "M -40 -170 Q -60 -40 -20 80", "M 30 -180 Q 20 -40 40 80", "M 100 -150 Q 110 -40 90 60"].map((p, i) => (
              <path key={i} d={p} stroke={d.corCabeloSombra} strokeWidth={5} fill="none" strokeLinecap="round" />
            ))}
            <path d="M -60 -170 Q 0 -200 70 -190" stroke={d.brilhoCabelo} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.6} />
          </g>
        )}
      </g>
    </g>
  );
};

// ---------- corpo: vista de frente ----------

const Frente: React.FC<{ d: Design; pose: Pose; rosto: Rosto; id: string; poder: number; objeto?: React.ReactNode; objetoGira?: boolean; costas?: boolean }> = ({ d, pose, rosto, id, poder, objeto, objetoGira, costas }) => {
  const quadrilY = QUADRIL_Y + pose.agacha;
  const ombroY = -TRONCO + 32;
  const tid = `camisa-${id}`;
  const peE: P = [-70 + pose.peE.dx, TORNOZELO_Y + pose.peE.dy];
  const peD: P = [70 + pose.peD.dx, TORNOZELO_Y + pose.peD.dy];
  const cruz = pose.cruzado;
  const bE: Braco = { ombro: pose.bracoE.ombro * (1 - cruz) + 26 * cruz, cotovelo: pose.bracoE.cotovelo * (1 - cruz) + -124 * cruz };
  const bD: Braco = { ombro: pose.bracoD.ombro * (1 - cruz) + 30 * cruz, cotovelo: pose.bracoD.cotovelo * (1 - cruz) + -122 * cruz };
  const alonga = 1 + 0.55 * cruz;
  return (
    <g>
      <defs>
        <linearGradient id={tid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={d.camisa} />
          <stop offset="0.66" stopColor={d.camisa} />
          <stop offset="0.86" stopColor={d.camisaSombra} />
        </linearGradient>
      </defs>
      <Parte k="perna"><PernaDesenho joelhoX={-1} quadril={[-56, quadrilY]} pe={peE} d={d} ladoTenis={-1} frontal={pose.joelhoFrente ?? 0} /></Parte>
      <Parte k="perna"><PernaDesenho joelhoX={1} quadril={[56, quadrilY]} pe={peD} d={d} ladoTenis={1} frontal={pose.joelhoFrente ?? 0} /></Parte>
      <g transform={`translate(0 ${quadrilY}) rotate(${pose.inclina})`}>
        <Parte k="corpo"><g transform={`scale(${1 - Math.abs(pose.vira) * 0.12} 1)`}>
        <rect x={-36} y={-TRONCO - 72} width={72} height={90} rx={10} fill={d.pele} stroke={CONTORNO} strokeWidth={LINHA} />
        <rect x={-30} y={-TRONCO - 4} width={60} height={22} fill={d.peleSombra} opacity={0.6} />
        <path
          d={`M -58 ${-TRONCO} L -110 ${-TRONCO + 4} Q -156 ${-TRONCO + 12} -160 ${-TRONCO + 60} L -148 -70 Q -142 -20 -146 22 L 146 22 Q 142 -20 148 -70 L 160 ${-TRONCO + 60} Q 156 ${-TRONCO + 12} 110 ${-TRONCO + 4} L 58 ${-TRONCO} Q 0 ${-TRONCO + (costas ? 14 : 46)} -58 ${-TRONCO} Z`}
          fill={`url(#${tid})`}
          stroke={CONTORNO}
          strokeWidth={LINHA}
          strokeLinejoin="round"
        />
        <path d="M -95 -250 Q -78 -205 -92 -160" stroke={d.camisaSombra} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M 108 -110 Q 82 -95 88 -60" stroke={d.camisaSombra} strokeWidth={4} fill="none" strokeLinecap="round" />
        {d.musculos ? (
          <g stroke={CONTORNO} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.75}>
            <path d="M -120 -300 Q -60 -250 -6 -280 M 6 -280 Q 60 -250 120 -300" />
            <path d={`M 0 ${-TRONCO + 40} L 0 -40`} strokeWidth={5} />
            {[-215, -165, -115].map((y) => (
              <path key={y} d={`M -52 ${y} Q -26 ${y + 10} -6 ${y} M 6 ${y} Q 26 ${y + 10} 52 ${y}`} strokeWidth={5} />
            ))}
            <path d="M -140 -250 Q -120 -180 -128 -110 M 140 -250 Q 120 -180 128 -110" strokeWidth={5} />
          </g>
        ) : null}
        {d.faixa ? (
          <g stroke={CONTORNO} strokeWidth={LINHA} strokeLinejoin="round">
            <path d="M -150 -30 Q 0 -6 150 -30 L 154 26 Q 0 46 -154 26 Z" fill={d.faixa.cor} />
            <path d="M -20 0 Q -60 60 -96 150 L -40 140 Q -20 80 6 20 Z" fill={d.faixa.sombra} />
            <path d="M 10 0 Q 60 70 70 160 L 120 130 Q 90 60 30 6 Z" fill={d.faixa.cor} />
            <ellipse cx={0} cy={8} rx={36} ry={30} fill={d.faixa.sombra} />
            <path d="M -140 0 L -110 -10 M 100 -14 L 130 -4" stroke={d.faixa.sombra} strokeWidth={6} fill="none" />
          </g>
        ) : null}
        {d.gravata && !costas ? (
          <path d={`M ${pose.vira * 40} ${-TRONCO + 16} l -20 26 l 14 170 l 6 18 l 6 -18 l 14 -170 Z`} fill={d.gravata} stroke={CONTORNO} strokeWidth={5} strokeLinejoin="round" />
        ) : null}
        {d.numero ? (
          <text
            x={pose.vira * 50}
            y={costas ? -110 : -150}
            textAnchor="middle"
            fontFamily="Fredoka"
            fontWeight={700}
            fontSize={costas ? 240 : 170}
            fill={d.corNumero ?? CONTORNO}
            transform={`skewX(${-pose.vira * 8})`}
            opacity={0.92}
          >
            {d.numero}
          </text>
        ) : null}
        </g></Parte>
        <Parte k="corpo"><BracoDesenho o={[-OMBRO_X + 8, ombroY]} sentido={-1} b={bE} gesto={cruz > 0.5 ? "bola" : pose.maoE} d={d} alonga={alonga} /></Parte>
        <Parte k="corpo"><BracoDesenho o={[OMBRO_X - 8, ombroY]} sentido={1} b={bD} gesto={cruz > 0.5 ? "bola" : pose.maoD} d={d} alonga={alonga} biceps={pose.biceps} objeto={objeto} objetoGira={objetoGira} /></Parte>
        <g transform={`translate(0 ${-TRONCO - 60}) rotate(${pose.cabeca}) translate(0 ${-R_CABECA + 18})`}>
          <Parte k="cabeca">
          {costas ? (
            <CabecaCostas d={d} id={id} poder={poder} balanco={pose.cabelo} />
          ) : (
            <Cabeca d={d} r={rosto} id={id} poder={poder} balanco={pose.cabelo} vira={pose.vira} />
          )}
          </Parte>
        </g>
      </g>
    </g>
  );
};

// ---------- corpo: vista de perfil (olhando pra +x) ----------

const Perfil: React.FC<{ d: Design; pose: Pose; rosto: Rosto; id: string; poder: number; objeto?: React.ReactNode; objetoGira?: boolean }> = ({ d, pose, rosto, id, poder, objeto, objetoGira }) => {
  const quadrilY = QUADRIL_Y + pose.agacha;
  const ombroY = -TRONCO + 40;
  const tid = `camisap-${id}`;
  const peTras: P = [pose.peE.dx, TORNOZELO_Y + pose.peE.dy];
  const peFrente: P = [pose.peD.dx, TORNOZELO_Y + pose.peD.dy];
  return (
    <g>
      <defs>
        <linearGradient id={tid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={d.camisaSombra} />
          <stop offset="0.3" stopColor={d.camisa} />
          <stop offset="1" stopColor={d.camisa} />
        </linearGradient>
      </defs>
      {/* perna e braço de trás */}
      <Parte k="perna"><PernaDesenho joelhoX={1} quadril={[-6, quadrilY]} pe={peTras} d={d} ladoTenis={1} perfil atras rot={pose.peE.rot ?? 0} /></Parte>
      <g transform={`translate(0 ${quadrilY}) rotate(${pose.inclina})`}>
        <Parte k="corpo"><BracoDesenho o={[-6, ombroY]} sentido={1} b={pose.bracoE} gesto={pose.maoE} d={d} atras /></Parte>
      </g>
      <Parte k="perna"><PernaDesenho joelhoX={1} quadril={[8, quadrilY]} pe={peFrente} d={d} ladoTenis={1} perfil rot={pose.peD.rot ?? 0} /></Parte>
      <g transform={`translate(0 ${quadrilY}) rotate(${pose.inclina})`}>
        <Parte k="corpo"><rect x={-30} y={-TRONCO - 72} width={64} height={90} rx={10} fill={d.pele} stroke={CONTORNO} strokeWidth={LINHA} />
        <path
          d={`M -50 ${-TRONCO + 2} Q -92 ${-TRONCO + 14} -94 ${-TRONCO + 70} L -86 -60 Q -84 -10 -88 22 L 98 22 Q 94 -20 98 -80 Q 114 -250 94 ${-TRONCO + 50} Q 82 ${-TRONCO + 4} 40 ${-TRONCO} Q 0 ${-TRONCO + 30} -50 ${-TRONCO + 2} Z`}
          fill={`url(#${tid})`}
          stroke={CONTORNO}
          strokeWidth={LINHA}
          strokeLinejoin="round"
        />
        <path d="M 60 -250 Q 40 -200 56 -150" stroke={d.camisaSombra} strokeWidth={4} fill="none" strokeLinecap="round" />
        {d.musculos ? (
          <g stroke={CONTORNO} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.75}>
            <path d="M 104 -300 Q 70 -250 20 -262" />
            {[-210, -160, -110].map((y) => (
              <path key={y} d={`M 96 ${y} Q 80 ${y + 8} 60 ${y + 2}`} strokeWidth={5} />
            ))}
            <path d="M -60 -280 Q -40 -200 -60 -120" strokeWidth={5} />
          </g>
        ) : null}
        {d.faixa ? (
          <g stroke={CONTORNO} strokeWidth={LINHA} strokeLinejoin="round">
            <path d="M -96 -30 Q 0 -10 104 -34 L 106 26 Q 0 44 -96 28 Z" fill={d.faixa.cor} />
            <path d="M 70 -6 Q 120 60 130 150 L 76 140 Q 70 80 40 20 Z" fill={d.faixa.sombra} />
            <ellipse cx={74} cy={4} rx={30} ry={28} fill={d.faixa.sombra} />
          </g>
        ) : null}</Parte>
        <g transform={`translate(4 ${-TRONCO - 60}) rotate(${pose.cabeca}) translate(0 ${-R_CABECA + 18})`}>
          <Parte k="cabeca"><CabecaPerfil d={d} r={rosto} id={id} poder={poder} balanco={pose.cabelo} /></Parte>
        </g>
        <Parte k="corpo"><BracoDesenho o={[8, ombroY]} sentido={1} b={pose.bracoD} gesto={pose.maoD} d={d} objeto={objeto} objetoGira={objetoGira} /></Parte>
      </g>
    </g>
  );
};

// ---------- componente principal ----------

export const Boneco2D: React.FC<{
  d: Design;
  pose: Pose;
  rosto: Rosto;
  id: string;
  poder?: number;
  opacidade?: number;
  /** objeto segurado (frente: mão direita da tela; perfil: mão da frente) */
  naMao?: React.ReactNode;
  /** objeto acompanha a direção do antebraço (espadas) */
  naMaoGira?: boolean;
  /** sombra dura + luz de recorte em CADA parte do corpo (estilo anime) */
  cel?: Cel;
}> = ({
  d,
  pose,
  rosto,
  id,
  poder = 0,
  opacidade = 1,
  naMao,
  naMaoGira,
  cel,
}) => {
  const peMin = Math.min(pose.peE.dy, pose.peD.dy);
  // direção da luz em cada espaço local (desfaz giro, espelho do lado, inclinação e cabeça)
  const filtros: { k: keyof CelIds; rot: number }[] = [
    { k: "perna", rot: 0 },
    { k: "corpo", rot: pose.inclina },
    { k: "cabeca", rot: pose.inclina + pose.cabeca },
  ];
  const ids: CelIds = cel ? { perna: `celp-${id}`, corpo: `celc-${id}`, cabeca: `celh-${id}` } : {};
  const dirLocal = (rotLocal: number): P => {
    const a = rad(cel ? cel.luz : 0) - rad(pose.gira * pose.lado);
    let x = Math.cos(a);
    const y = Math.sin(a);
    x *= pose.lado;
    const b = -rad(rotLocal);
    return [x * Math.cos(b) - y * Math.sin(b), x * Math.sin(b) + y * Math.cos(b)];
  };
  return (
    <g
      opacity={opacidade}
      transform={`translate(${pose.x} ${pose.y}) rotate(${pose.gira * pose.lado} 0 ${-600 * pose.escala}) scale(${(pose.escala * pose.lado * pose.largura) / Math.sqrt(pose.estica)} ${pose.escala * pose.estica})`}
    >
      <defs>
        <filter id={`sombra-${id}`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation={16} />
        </filter>
      </defs>
      {cel ? (
        <defs>
          {filtros.map(({ k, rot }) => {
            const [lx, ly] = dirLocal(rot);
            const sh = (cel.sombra ?? 30) / pose.escala;
            const rc = (cel.recorte ?? 9) / pose.escala;
            return (
              <filter key={k} id={ids[k]} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
                <feOffset in="SourceAlpha" dx={lx * sh} dy={ly * sh} result="paraLuz" />
                <feComposite in="SourceAlpha" in2="paraLuz" operator="out" result="meia" />
                <feFlood floodColor={cel.cor ?? "#141c38"} floodOpacity={cel.forca ?? 0.55} />
                <feComposite in2="meia" operator="in" result="sombra" />
                <feOffset in="SourceAlpha" dx={-lx * rc} dy={-ly * rc} result="longe" />
                <feComposite in="SourceAlpha" in2="longe" operator="out" result="faixa" />
                <feFlood floodColor={cel.corRecorte ?? "#5ff4ff"} floodOpacity={rc > 0 ? cel.forcaRecorte ?? 1 : 0} />
                <feComposite in2="faixa" operator="in" result="recorte" />
                <feGaussianBlur in="recorte" stdDeviation={6 / pose.escala} result="brilho" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="sombra" />
                  <feMergeNode in="brilho" />
                  <feMergeNode in="recorte" />
                </feMerge>
              </filter>
            );
          })}
        </defs>
      ) : null}
      <ellipse cx={0} cy={4} rx={pose.vista === "perfil" ? 170 : 210} ry={30} fill="#1d1424" opacity={0.26 * Math.max(0.2, 1 + peMin / 400)} filter={`url(#sombra-${id})`} />
      <CelCtx.Provider value={ids}>
        {pose.vista === "perfil" ? (
          <Perfil d={d} pose={pose} rosto={rosto} id={id} poder={poder} objeto={naMao} objetoGira={naMaoGira} />
        ) : (
          <Frente d={d} pose={pose} rosto={rosto} id={id} poder={poder} objeto={naMao} objetoGira={naMaoGira} costas={pose.vista === "costas"} />
        )}
      </CelCtx.Provider>
    </g>
  );
};
