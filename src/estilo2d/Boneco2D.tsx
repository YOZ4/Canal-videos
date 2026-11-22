import { CONTORNO, type Design } from "./personagens";

/**
 * Personagem 2D articulado (SVG), desenhado no estilo da folha de personagens:
 * contorno escuro, sombra suave no lado direito, olhos grandes, braços "macarrão".
 *
 * Coordenadas locais: origem no chão entre os pés, y para baixo (padrão SVG).
 * Altura total ≈ 1220 px na escala 1.
 */

export type Braco = { ombro: number; cotovelo: number };
export type Pe = { dx: number; dy: number };

export type Pose = {
  x: number;
  y: number;
  escala: number;
  /** 1 = olhando pra frente; -1 = espelhado */
  lado: 1 | -1;
  /** inclinação do tronco em graus (positivo = pra direita da tela) */
  inclina: number;
  /** 1 = normal; >1 estica (pulo); <1 achata (impacto) */
  estica: number;
  /** quanto o quadril desce (agachar). px positivos = desce */
  agacha: number;
  /** rotação da cabeça em graus */
  cabeca: number;
  /** braço do lado esquerdo e direito da TELA. ombro: 0 = pendurado, 90 = horizontal pra fora, 180 = pra cima */
  bracoE: Braco;
  bracoD: Braco;
  /** deslocamento dos pés (dy negativo = levantado) */
  peE: Pe;
  peD: Pe;
  /** braços cruzados (pose do Diego) */
  cruzado: number;
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
  inclina: 0,
  estica: 1,
  agacha: 0,
  cabeca: 0,
  bracoE: { ombro: 14, cotovelo: -8 },
  bracoD: { ombro: 14, cotovelo: -8 },
  peE: { dx: 0, dy: 0 },
  peD: { dx: 0, dy: 0 },
  cruzado: 0,
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

/** tubo com contorno (braços/pernas/mangas) */
const Tubo: React.FC<{
  pts: P[];
  largura: number;
  cor: string;
  sombra?: string;
  cap?: "round" | "butt";
}> = ({ pts, largura, cor, sombra, cap = "round" }) => {
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
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

// ---------- braço ----------

const pontosBraco = (lado: 1 | -1, b: Braco, ombroY: number, alongaAntebraco = 1): { o: P; c: P; m: P } => {
  const o: P = [OMBRO_X * lado - 8 * lado, ombroY];
  const a1 = rad(b.ombro);
  const c: P = [o[0] + Math.sin(a1) * BRACO * lado, o[1] + Math.cos(a1) * BRACO];
  const a2 = rad(b.ombro + b.cotovelo);
  const m: P = [c[0] + Math.sin(a2) * ANTEBRACO * alongaAntebraco * lado, c[1] + Math.cos(a2) * ANTEBRACO * alongaAntebraco];
  return { o, c, m };
};

const Mao: React.FC<{ p: P; d: Design }> = ({ p, d }) => (
  <g transform={`translate(${p[0]} ${p[1]})`}>
    <circle r={36} fill={d.pele} stroke={CONTORNO} strokeWidth={LINHA} />
    <path d="M -9 -8 L -9 10 M 6 -8 L 6 10" stroke={CONTORNO} strokeWidth={4} strokeLinecap="round" />
  </g>
);

const BracoDesenho: React.FC<{ lado: 1 | -1; b: Braco; d: Design; ombroY: number; soManga?: boolean; semManga?: boolean; alonga?: number }> = ({
  lado,
  b,
  d,
  ombroY,
  soManga,
  semManga,
  alonga = 1,
}) => {
  const { o, c, m } = pontosBraco(lado, b, ombroY, alonga);
  const mangaFim: P = [o[0] + (c[0] - o[0]) * 0.62, o[1] + (c[1] - o[1]) * 0.62];
  const punho: P = [o[0] + (c[0] - o[0]) * 0.5, o[1] + (c[1] - o[1]) * 0.5];
  return (
    <g>
      {!soManga ? (
        <>
          <Tubo pts={[o, c, m]} largura={62} cor={d.pele} sombra={d.peleSombra} />
          <Mao p={m} d={d} />
        </>
      ) : null}
      {!semManga ? (
        <>
          <Tubo pts={[o, mangaFim]} largura={98} cor={d.camisa} />
          <circle cx={punho[0]} cy={punho[1]} r={40} fill={d.manga} opacity={0.85} />
          <path
            d={`M ${o[0]} ${o[1]} L ${mangaFim[0]} ${mangaFim[1]}`}
            stroke={d.camisa}
            strokeWidth={70}
            strokeLinecap="round"
            transform={`translate(${-8 * lado} -6)`}
            opacity={0.9}
          />
        </>
      ) : null}
    </g>
  );
};

// ---------- perna (IK de 2 ossos: pé fica plantado) ----------

const pontosPerna = (lado: 1 | -1, quadril: P, pe: P): { q: P; j: P; t: P } => {
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
  const h = Math.sqrt(Math.max(0, COXA * COXA - (dist / 2) * (dist / 2)));
  // joelho sempre pra fora (vista de frente)
  let px = -dy / dist;
  let py = dx / dist;
  if (px * lado < 0) {
    px = -px;
    py = -py;
  }
  const j: P = [meio[0] + px * h, meio[1] + py * h];
  return { q: quadril, j, t };
};

const Tenis: React.FC<{ p: P; lado: 1 | -1; d: Design }> = ({ p, lado, d }) => (
  <g transform={`translate(${p[0]} ${p[1] + 2}) scale(${lado} 1)`}>
    <path
      d="M -58 -6 L -58 -30 L 4 -30 Q 52 -20 72 6 Q 74 26 52 28 L -54 28 Q -64 26 -62 10 Z"
      fill={d.tenis}
      stroke={CONTORNO}
      strokeWidth={LINHA}
      strokeLinejoin="round"
    />
    <path d="M -58 18 L 62 18 Q 70 22 64 27 L -54 27 Z" fill={d.sola} />
    <path d="M -58 -30 L -58 28" stroke={CONTORNO} strokeWidth={LINHA} />
  </g>
);

const PernaDesenho: React.FC<{ lado: 1 | -1; quadril: P; pe: P; d: Design }> = ({ lado, quadril, pe, d }) => {
  const { q, j, t } = pontosPerna(lado, quadril, pe);
  return (
    <g>
      <Tubo pts={[q, j, t]} largura={104} cor={d.calca} sombra={d.calcaSombra} cap="butt" />
      <Tenis p={[t[0], t[1] + 4]} lado={lado} d={d} />
    </g>
  );
};

// ---------- cabeça ----------

const Olho: React.FC<{ cx: number; abre: number; olhar: [number, number]; d: Design; id: string }> = ({
  cx,
  abre,
  olhar,
  d,
  id,
}) => {
  const rx = 40 * (abre > 1 ? 1 + (abre - 1) * 0.5 : 1);
  const ry = 46 * (abre > 1 ? 1 + (abre - 1) * 0.6 : 1);
  const cy = -10;
  if (abre < 0.08) {
    return (
      <path
        d={`M ${cx - rx} ${cy + 6} Q ${cx} ${cy + 22} ${cx + rx} ${cy + 6}`}
        stroke={CONTORNO}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  const a = Math.min(1, abre);
  const palpebraY = cy - ry + (1 - a) * ry * 1.7;
  const ix = cx + olhar[0] * 13;
  const iy = cy + 6 + olhar[1] * 10;
  const clip = `olho-${id}-${cx}`;
  return (
    <g>
      <clipPath id={clip}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffffff" />
      <g clipPath={`url(#${clip})`}>
        <circle cx={ix} cy={iy} r={24} fill={d.olhos} stroke="#2a1810" strokeWidth={3} />
        <circle cx={ix} cy={iy} r={11} fill="#140c10" />
        <circle cx={ix - 8} cy={iy - 9} r={6} fill="#ffffff" />
        {/* pálpebra */}
        <rect x={cx - rx - 4} y={cy - ry - 4} width={rx * 2 + 8} height={palpebraY - (cy - ry) + 4} fill={d.pele} />
        <path
          d={`M ${cx - rx - 4} ${palpebraY} Q ${cx} ${palpebraY - 5} ${cx + rx + 4} ${palpebraY}`}
          stroke={CONTORNO}
          strokeWidth={8}
          fill="none"
        />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={CONTORNO} strokeWidth={6} />
    </g>
  );
};

const Boca: React.FC<{ r: Rosto }> = ({ r }) => {
  const y = 78;
  const w = 34;
  const ladoE = -r.sorriso * 6 + r.canto * 6;
  const ladoD = -r.sorriso * 6 - r.canto * 10;
  if (r.boca > 0.12) {
    const abre = r.boca;
    const topo = y - 6 - abre * 4 + -r.sorriso * 4;
    const fundo = y + 10 + abre * 46;
    const lw = w * (0.8 + abre * 0.25);
    return (
      <g>
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
    <g>
      <path
        d={`M ${-w} ${y + ladoE} Q 0 ${y + r.sorriso * 24} ${w} ${y + ladoD}`}
        stroke={CONTORNO}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {r.canto > 0.3 ? (
        <path d={`M ${w - 2} ${y + ladoD - 8} L ${w + 6} ${y + ladoD + 4}`} stroke={CONTORNO} strokeWidth={5} strokeLinecap="round" />
      ) : null}
    </g>
  );
};

const CabeloCacheado: React.FC<{ d: Design; atras?: boolean }> = ({ d, atras }) => {
  const bolhas: [number, number, number][] = [
    [-150, -40, 40], [-152, -92, 46], [-126, -142, 50], [-80, -178, 52], [-25, -192, 54],
    [30, -192, 54], [85, -178, 52], [130, -142, 50], [154, -92, 46], [152, -40, 40],
    [-108, -74, 34], [-62, -84, 34], [-16, -88, 34], [30, -86, 34], [76, -82, 34], [118, -72, 34],
  ];
  if (atras) return null;
  const cachos: P[] = [
    [-110, -120], [-60, -140], [-5, -150], [55, -140], [105, -118],
    [-130, -70], [-80, -105], [-25, -112], [35, -112], [90, -100], [135, -65],
    [-50, -175], [20, -180], [75, -165],
  ];
  return (
    <g>
      {bolhas.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={r + LINHA} fill={CONTORNO} />
      ))}
      <ellipse cx={0} cy={-115} rx={150} ry={80} fill={d.corCabelo} />
      {bolhas.map(([x, y, r], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r={r} fill={d.corCabelo} />
      ))}
      {cachos.map(([x, y], i) => (
        <path key={`c${i}`} d={`M ${x - 13} ${y + 4} Q ${x} ${y - 12} ${x + 13} ${y + 4}`} stroke={d.corCabeloSombra} strokeWidth={4} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

const CabeloTopete: React.FC<{ d: Design }> = ({ d }) => (
  <g>
    <path
      d="M -140 12 Q -158 -70 -120 -140 Q -80 -200 10 -208 Q 90 -232 176 -192 Q 150 -186 138 -172 Q 168 -120 150 -40 Q 146 -6 140 14 Q 122 -50 108 -70 Q 40 -86 -70 -82 Q -112 -70 -124 -20 Z"
      fill={d.corCabelo}
      stroke={CONTORNO}
      strokeWidth={LINHA}
      strokeLinejoin="round"
    />
    {/* sombra lado direito */}
    <path d="M 108 -70 Q 140 -110 138 -172 Q 168 -120 150 -40 Q 146 -6 140 14 Q 122 -50 108 -70 Z" fill={d.corCabeloSombra} opacity={0.55} />
    {/* fios */}
    {[
      "M -110 -40 Q -110 -130 -40 -170",
      "M -60 -84 Q -40 -160 40 -190",
      "M 0 -86 Q 30 -160 100 -196",
      "M 60 -82 Q 90 -140 130 -176",
    ].map((p, i) => (
      <path key={i} d={p} stroke={d.corCabeloSombra} strokeWidth={5} fill="none" strokeLinecap="round" />
    ))}
    {/* brilho */}
    <path d="M -80 -150 Q -30 -190 40 -198" stroke="#fff6c8" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.6} />
  </g>
);

const CabeloSaiyajin: React.FC<{ id: string }> = ({ id }) => {
  const contorno =
    "M -138 14 L -186 -40 L -150 -62 L -212 -140 L -134 -132 L -176 -236 L -82 -176 L -70 -300 L -6 -196 L 46 -318 L 70 -192 L 160 -282 L 136 -150 L 220 -160 L 160 -72 L 196 -36 L 140 14 Q 122 -50 104 -70 Q 40 -92 -70 -86 Q -112 -70 -124 -20 Z";
  return (
    <g>
      <defs>
        <filter id={`brilho-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <linearGradient id={`ouro-${id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff38a" />
          <stop offset="0.55" stopColor="#ffd93a" />
          <stop offset="1" stopColor="#f0a81c" />
        </linearGradient>
      </defs>
      <path d={contorno} fill="#ffe14a" opacity={0.75} filter={`url(#brilho-${id})`} />
      <path d={contorno} fill={`url(#ouro-${id})`} stroke={CONTORNO} strokeWidth={LINHA} strokeLinejoin="round" />
      {/* mecha caindo na testa */}
      <path d="M -20 -92 L 6 -30 L 22 -90 Z" fill="#ffd93a" stroke={CONTORNO} strokeWidth={6} strokeLinejoin="round" />
      {["M -120 -60 L -150 -130", "M -50 -95 L -60 -200", "M 30 -95 L 46 -230", "M 100 -80 L 130 -170"].map((p, i) => (
        <path key={i} d={p} stroke="#e0a21c" strokeWidth={6} strokeLinecap="round" />
      ))}
    </g>
  );
};

const Cabeca: React.FC<{ d: Design; r: Rosto; id: string; poder?: number }> = ({ d, r, id, poder = 0 }) => {
  const gid = `pele-${id}`;
  const browY = -78 - r.sobrancelhaY;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={d.pele} />
          <stop offset="0.6" stopColor={d.pele} />
          <stop offset="0.9" stopColor={d.peleSombra} />
        </linearGradient>
      </defs>
      {/* orelhas */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={s * 132} cy={8} rx={28} ry={42} fill={s > 0 ? d.peleSombra : d.pele} stroke={CONTORNO} strokeWidth={LINHA} />
          <ellipse cx={s * 136} cy={10} rx={12} ry={22} fill={d.peleSombra} opacity={0.7} />
        </g>
      ))}
      <circle r={R_CABECA} fill={`url(#${gid})`} stroke={CONTORNO} strokeWidth={LINHA} />
      {/* bochechas */}
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={s * 78} cy={50} rx={30} ry={15} fill="#f2928f" opacity={0.45 * r.bochecha} />
      ))}
      {poder >= 0.5 ? <CabeloSaiyajin id={id} /> : d.cabelo === "cacheado" ? <CabeloCacheado d={d} /> : <CabeloTopete d={d} />}
      {/* sobrancelhas */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 52} ${browY}) rotate(${r.sobrancelha * s})`}>
          {d.sobrancelhaGrossa ? (
            <rect x={-38} y={-10} width={76} height={20} rx={10} fill={d.sobrancelha} />
          ) : (
            <rect x={-30} y={-5} width={60} height={10} rx={5} fill={d.sobrancelha} />
          )}
        </g>
      ))}
      <Olho cx={-50} abre={r.olhos} olhar={r.olhar} d={poder >= 0.5 ? { ...d, olhos: "#18b3a3" } : d} id={id} />
      <Olho cx={50} abre={r.olhos} olhar={r.olhar} d={poder >= 0.5 ? { ...d, olhos: "#18b3a3" } : d} id={id} />
      {/* nariz */}
      <path d="M -9 38 Q 0 48 9 38" stroke={CONTORNO} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Boca r={r} />
    </g>
  );
};

// ---------- corpo completo ----------

export const Boneco2D: React.FC<{ d: Design; pose: Pose; rosto: Rosto; id: string; poder?: number }> = ({ d, pose, rosto, id, poder = 0 }) => {
  const quadrilY = QUADRIL_Y + pose.agacha;
  const ombroY = -TRONCO + 32;
  const tid = `camisa-${id}`;

  const quadrilE: P = [-56, quadrilY];
  const quadrilD: P = [56, quadrilY];
  const peE: P = [-70 + pose.peE.dx, TORNOZELO_Y + pose.peE.dy];
  const peD: P = [70 + pose.peD.dx, TORNOZELO_Y + pose.peD.dy];

  // braços cruzados: interpola para a pose fixa do Diego
  const cruz = pose.cruzado;
  const bE: Braco = {
    ombro: pose.bracoE.ombro * (1 - cruz) + 26 * cruz,
    cotovelo: pose.bracoE.cotovelo * (1 - cruz) + -124 * cruz,
  };
  const bD: Braco = {
    ombro: pose.bracoD.ombro * (1 - cruz) + 30 * cruz,
    cotovelo: pose.bracoD.cotovelo * (1 - cruz) + -122 * cruz,
  };

  return (
    <g transform={`translate(${pose.x} ${pose.y}) scale(${(pose.escala * pose.lado) / Math.sqrt(pose.estica)} ${pose.escala * pose.estica})`}>
      <defs>
        <linearGradient id={tid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={d.camisa} />
          <stop offset="0.66" stopColor={d.camisa} />
          <stop offset="0.86" stopColor={d.camisaSombra} />
        </linearGradient>
      </defs>
      {/* sombra no chão */}
      <ellipse cx={0} cy={2} rx={190} ry={22} fill="#000" opacity={0.18 * Math.max(0.2, 1 + Math.min(peE[1], peD[1]) / 400)} />

      <PernaDesenho lado={-1} quadril={quadrilE} pe={peE} d={d} />
      <PernaDesenho lado={1} quadril={quadrilD} pe={peD} d={d} />

      {/* parte de cima gira em torno do quadril */}
      <g transform={`translate(0 ${quadrilY}) rotate(${pose.inclina})`}>
        {/* pescoço */}
        <rect x={-36} y={-TRONCO - 72} width={72} height={90} rx={10} fill={d.pele} stroke={CONTORNO} strokeWidth={LINHA} />
        <rect x={-30} y={-TRONCO - 4} width={60} height={22} fill={d.peleSombra} opacity={0.6} />
        {/* camiseta */}
        <path
          d={`M -58 ${-TRONCO} L -110 ${-TRONCO + 4} Q -156 ${-TRONCO + 12} -160 ${-TRONCO + 60} L -148 -70 Q -142 -20 -146 22 L 146 22 Q 142 -20 148 -70 L 160 ${-TRONCO + 60} Q 156 ${-TRONCO + 12} 110 ${-TRONCO + 4} L 58 ${-TRONCO} Q 0 ${-TRONCO + 46} -58 ${-TRONCO} Z`}
          fill={`url(#${tid})`}
          stroke={CONTORNO}
          strokeWidth={LINHA}
          strokeLinejoin="round"
        />
        {/* dobrinhas */}
        <path d="M -95 -250 Q -78 -205 -92 -160" stroke={d.camisaSombra} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M 108 -110 Q 82 -95 88 -60" stroke={d.camisaSombra} strokeWidth={4} fill="none" strokeLinecap="round" />

        {/* braços: quando cruzados, as mangas ficam atrás e os antebraços na frente */}
        <BracoDesenho lado={-1} b={bE} d={d} ombroY={ombroY} alonga={1 + 0.55 * cruz} />
        <BracoDesenho lado={1} b={bD} d={d} ombroY={ombroY} alonga={1 + 0.55 * cruz} />

        {/* cabeça */}
        <g transform={`translate(0 ${-TRONCO - 60}) rotate(${pose.cabeca}) translate(0 ${-R_CABECA + 18})`}>
          <Cabeca d={d} r={rosto} id={id} poder={poder} />
        </g>
      </g>
    </g>
  );
};
