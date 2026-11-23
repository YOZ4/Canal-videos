import { AbsoluteFill, interpolate, random } from "remotion";

/**
 * Cenários e objetos do episódio Egito. Mundo: chão (pés) em y = CHAO; horizonte em y = HORIZONTE.
 * Contorno #1f1429, sombras puxadas pro roxo (#3b2454 com transparência), cores chapadas.
 */
export const CHAO = 1500;
export const HORIZONTE = 1130;
const C = "#1f1429";
const OUROE = "#d9b24a";
/** escala do trenó e da estátua ("estátua de toneladas": bem maior que um homem) */
export const ESC_TRENO = 1.3;
export const ESC_EST = 1.45;
export const TOPO_TRENO = 90 * ESC_TRENO;
const ROXO = "#3b2454";

export type Cam = { x: number; y: number; zoom: number; rot?: number };

/** palco: fundo em espaço de tela + mundo com câmera. `fundo` recebe a câmera (para parallax/céu). */
export const Palco: React.FC<{ cam: Cam; fundo?: (cam: Cam) => React.ReactNode; children: React.ReactNode; blurX?: number }> = ({ cam, fundo, children, blurX = 0 }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} style={{ filter: blurX > 0.5 ? `url(#borraX)` : undefined }}>
      <defs>
        <filter id="borraX" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blurX} 0`} />
        </filter>
      </defs>
      {fundo ? fundo(cam) : null}
      <g transform={`translate(540 960) rotate(${cam.rot ?? 0}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
    </svg>
  </AbsoluteFill>
);

/** camada com parallax (fator 1 = acompanha o mundo; 0 = parada na tela) */
export const Para: React.FC<{ cam: Cam; fator: number; children: React.ReactNode }> = ({ cam, fator, children }) => (
  <g transform={`translate(${cam.x * (1 - fator)} ${(cam.y - 1100) * (1 - fator) * 0.6})`}>{children}</g>
);

// ---------------- céu do deserto (tela) ----------------

const mistura = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
};

/** céu de fim de tarde; `sol` 0..1 = sol alto à direita → mais baixo e quente (C01 → C10) */
export const CeuDeserto: React.FC<{ sol: number; f: number }> = ({ sol, f }) => {
  const topo = mistura("#6fb4e8", "#5f8fd0", sol);
  const base = mistura("#ffe3a8", "#ffc27a", sol);
  const sx = 820 - sol * 140;
  const sy = 330 + sol * 420;
  return (
    <g>
      <defs>
        <linearGradient id="ceuEg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={topo} />
          <stop offset="0.75" stopColor={base} />
        </linearGradient>
        <radialGradient id="solEg">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="0.35" stopColor="#fff0b8" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ffd27a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ceuEg)" />
      <circle cx={sx} cy={sy} r={260} fill="url(#solEg)" opacity={0.8} />
      <circle cx={sx} cy={sy} r={70} fill="#fffaf0" />
      {/* nuvens finas andando devagar */}
      {[0, 1, 2].map((i) => {
        const x = ((i * 430 + f * (0.12 + i * 0.04)) % 1500) - 200;
        return <ellipse key={i} cx={x} cy={170 + i * 110} rx={150 + i * 30} ry={18} fill="#fff" opacity={0.35} />;
      })}
    </g>
  );
};

// ---------------- chão do deserto (mundo) ----------------

const Piramide: React.FC<{ x: number; base: number; alt: number; cor?: string }> = ({ x, base, alt, cor = "#e2b56e" }) => (
  <g>
    <path d={`M ${x - base / 2} ${HORIZONTE} L ${x} ${HORIZONTE - alt} L ${x + base / 2} ${HORIZONTE} Z`} fill={cor} />
    <path d={`M ${x} ${HORIZONTE - alt} L ${x + base / 2} ${HORIZONTE} L ${x + base * 0.12} ${HORIZONTE} Z`} fill={ROXO} opacity={0.25} />
  </g>
);

/** fundo do deserto: pirâmides (longe), dunas (meio), areia (chão) com brilho de calor e grãos ao vento */
export const ChaoDeserto: React.FC<{ cam: Cam; f: number; sol: number; de?: number; ate?: number }> = ({ cam, f, sol, de = -6000, ate = 6000 }) => {
  const sombra = 0.18 + sol * 0.12;
  return (
    <g>
      <Para cam={cam} fator={0.15}>
        {[-3600, -2200, -900, 700, 2300, 3900].map((x, i) => (
          <Piramide key={i} x={x} base={[900, 600, 1100, 700, 1000, 600][i]} alt={[520, 330, 640, 400, 580, 340][i]} cor={mistura("#e8c07a", "#e0a868", sol)} />
        ))}
      </Para>
      <Para cam={cam} fator={0.4}>
        <path
          d={`M ${de * 1.5} ${HORIZONTE + 20} ${new Array(30)
            .fill(0)
            .map((_, i) => {
              const x = de * 1.5 + ((ate - de) * 1.5 * (i + 1)) / 30;
              return `Q ${x - 200} ${HORIZONTE - 40 - (i % 3) * 25} ${x} ${HORIZONTE + 10}`;
            })
            .join(" ")} L ${ate * 1.5} ${HORIZONTE + 300} L ${de * 1.5} ${HORIZONTE + 300} Z`}
          fill={mistura("#f2d394", "#eebd7e", sol)}
        />
      </Para>
      {/* chão */}
      <defs>
        <linearGradient id="areiaEg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0cf8a" />
          <stop offset="1" stopColor="#c99a52" />
        </linearGradient>
      </defs>
      <rect x={de} y={HORIZONTE + 10} width={ate - de} height={2200} fill="url(#areiaEg)" />
      {/* calor tremendo no horizonte */}
      <path
        d={`M ${de} ${HORIZONTE + 14} ${new Array(80)
          .fill(0)
          .map((_, i) => `L ${de + ((ate - de) * i) / 79} ${HORIZONTE + 14 + Math.sin(i * 1.3 + f * 0.08) * 4}`)
          .join(" ")}`}
        stroke="#fff6dc"
        strokeWidth={10}
        fill="none"
        opacity={0.45}
      />
      {/* marcas de vento na areia */}
      {new Array(40).fill(0).map((_, i) => {
        const x = de + random(`ma${i}`) * (ate - de);
        const y = HORIZONTE + 80 + random(`mb${i}`) * 700;
        return <path key={i} d={`M ${x} ${y} q 40 -10 80 0 q 40 10 80 0`} stroke="#b88a4a" strokeWidth={4} fill="none" opacity={0.35} />;
      })}
      {/* sombra geral roxa (fim de tarde) */}
      <rect x={de} y={HORIZONTE + 10} width={ate - de} height={2200} fill={ROXO} opacity={sombra * 0.25} />
    </g>
  );
};

/** grãos de areia voando (primeiro plano, mundo). Determinístico. */
export const GraosVento: React.FC<{ f: number; x0: number; x1: number; y0?: number; y1?: number; n?: number; forca?: number }> = ({ f, x0, x1, y0 = HORIZONTE, y1 = CHAO + 200, n = 40, forca = 1 }) => (
  <g>
    {new Array(n).fill(0).map((_, i) => {
      const vel = (2 + random(`gv${i}`) * 5) * forca;
      const x = x0 + (((random(`gx${i}`) * (x1 - x0) + f * vel) % (x1 - x0)) + (x1 - x0)) % (x1 - x0);
      const y = y0 + random(`gy${i}`) * (y1 - y0) + Math.sin(f * 0.05 + i) * 12;
      return <ellipse key={i} cx={x} cy={y} rx={5 + random(`gr${i}`) * 5} ry={2.5} fill="#fff2cf" opacity={0.6} />;
    })}
  </g>
);

// ---------------- objetos ----------------

/** sombra roxa no chão */
export const SombraChao: React.FC<{ x: number; y?: number; rx: number; ry?: number; op?: number }> = ({ x, y = CHAO, rx, ry = 26, op = 0.35 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={ROXO} opacity={op} />
);

/** estátua sentada genérica (não é de faraó real): base no chão em (x, base), altura ~ 900 * esc */
export const Estatua: React.FC<{ x: number; base: number; esc?: number; cor?: string }> = ({ x, base, esc = 1, cor = "#dcc79c" }) => {
  const sh = "#b49c6e";
  return (
    <g transform={`translate(${x} ${base}) scale(${esc})`} stroke={C} strokeWidth={7} strokeLinejoin="round">
      {/* trono */}
      <path d="M -230 0 L -230 -380 L 150 -380 L 150 0 Z" fill={cor} />
      <path d="M 70 -380 L 150 -380 L 150 0 L 70 0 Z" fill={sh} />
      <path d="M -230 -380 L -230 -520 L -150 -520 L -150 -380 Z" fill={sh} />
      {/* pernas e pés */}
      <path d="M -60 -380 L 210 -380 L 210 -320 L 30 -320 L 30 -20 L 230 -20 L 230 0 L -60 0 Z" fill={cor} />
      <path d="M 30 -320 L 90 -320 L 90 -20 L 30 -20 Z" fill={sh} strokeWidth={0} />
      {/* tronco */}
      <path d="M -150 -380 L -150 -700 Q -60 -730 40 -700 L 60 -380 Z" fill={cor} />
      <path d="M 0 -705 Q 30 -700 40 -700 L 60 -380 L 0 -380 Z" fill={sh} strokeWidth={0} />
      {/* braço apoiado no joelho */}
      <path d="M -10 -660 Q 40 -560 30 -450 L 200 -420 L 210 -370 L -20 -380 Q -60 -520 -60 -640 Z" fill={cor} />
      {/* cabeça de perfil (olhando pra frente do trenó) com pano listrado genérico caindo no ombro */}
      <path d="M -170 -660 Q -190 -880 -50 -905 Q 40 -910 60 -850 L 20 -840 L 0 -690 Z" fill={sh} />
      {[-150, -120, -90, -60].map((xx) => (
        <path key={xx} d={`M ${xx} ${-880 + (xx + 150) * 0.1} Q ${xx - 10} -760 ${xx - 4} -670`} strokeWidth={5} fill="none" />
      ))}
      <path d="M -10 -850 Q 50 -860 64 -812 L 84 -786 L 66 -774 Q 70 -744 50 -726 Q 24 -706 -6 -712 Z" fill={cor} />
      <path d="M -30 -866 Q 20 -884 66 -850" stroke={OUROE} strokeWidth={14} fill="none" />
      <path d="M 32 -810 Q 46 -818 58 -808 Q 46 -800 32 -810 Z" fill={C} strokeWidth={3} />
      <path d="M 26 -826 Q 44 -834 62 -824" strokeWidth={5} fill="none" />
      <path d="M 44 -746 Q 54 -744 60 -750" strokeWidth={5} fill="none" />
      {/* rachaduras e sombra roxa do lado direito */}
      <path d="M -200 -200 l 30 40 l -10 50" strokeWidth={4} fill="none" />
      <path d="M -230 0 L -230 -40 L 230 -40 L 230 0 Z" fill={ROXO} opacity={0.2} strokeWidth={0} />
    </g>
  );
};

/** trenó de madeira: centro em x, chão em y; comprimento ~760*esc. Gancho da corda em (x + 400*esc, y - 50*esc) */
export const Treno: React.FC<{ x: number; y?: number; esc?: number; inclina?: number; afunda?: number }> = ({ x, y = CHAO, esc = 1, inclina = 0, afunda = 0 }) => (
  <g transform={`translate(${x} ${y + afunda}) rotate(${inclina}) scale(${esc})`} stroke={C} strokeWidth={7} strokeLinejoin="round">
    {/* esquis com a ponta curvada pra frente */}
    <path d="M -380 -10 L 300 -10 Q 400 -14 410 -90 L 380 -96 Q 368 -46 300 -42 L -380 -42 Z" fill="#7a4c24" />
    {/* plataforma de toras */}
    <rect x={-360} y={-90} width={660} height={50} rx={8} fill="#8a5a2e" />
    {[-300, -180, -60, 60, 180].map((xx) => (
      <path key={xx} d={`M ${xx} -90 L ${xx} -40`} strokeWidth={5} />
    ))}
    <circle cx={400} cy={-56} r={14} fill="#5a3a1c" />
  </g>
);

/** gancho da corda no trenó (mundo) */
export const ganchoTreno = (x: number, y = CHAO, esc = 1): [number, number] => [x + 400 * esc, y - 56 * esc];

/** corda passando por pontos (mãos); `folga` faz barriga entre os pontos */
export const Corda: React.FC<{ pontos: [number, number][]; folga?: number; esc?: number }> = ({ pontos, folga = 10, esc = 1 }) => {
  if (pontos.length < 2) return null;
  let d = `M ${pontos[0][0]} ${pontos[0][1]}`;
  for (let i = 1; i < pontos.length; i++) {
    const [ax, ay] = pontos[i - 1];
    const [bx, by] = pontos[i];
    d += ` Q ${(ax + bx) / 2} ${(ay + by) / 2 + folga} ${bx} ${by}`;
  }
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={C} strokeWidth={22 * esc} />
      <path d={d} stroke="#d9b97a" strokeWidth={12 * esc} />
      <path d={d} stroke="#b8975a" strokeWidth={3 * esc} strokeDasharray={`${10 * esc} ${14 * esc}`} />
    </g>
  );
};

/** jarro de barro (origem = centro do corpo; boca em (0,-78)). Gire em volta da mão. */
export const Jarro: React.FC<{ esc?: number }> = ({ esc = 1 }) => (
  <g transform={`scale(${esc})`} stroke={C} strokeWidth={7} strokeLinejoin="round">
    <path d="M -26 -78 L 26 -78 L 22 -52 Q 64 -36 62 8 Q 58 56 0 60 Q -58 56 -62 8 Q -64 -36 -22 -52 Z" fill="#b8643a" />
    <path d="M 30 -40 Q 62 -20 56 20 Q 50 50 10 58 Q 44 30 30 -40 Z" fill="#8f4a28" strokeWidth={0} />
    <path d="M -40 -10 Q -30 -30 -12 -36" stroke="#e08a5c" strokeWidth={8} fill="none" />
    <path d="M -54 4 Q 0 18 54 4" stroke="#7a3a1e" strokeWidth={6} fill="none" />
    <ellipse cx={0} cy={-78} rx={28} ry={8} fill="#5a2a14" />
  </g>
);

/** balde de madeira (origem = centro; boca em (0,-60)) */
export const Balde: React.FC<{ esc?: number; cheio?: boolean }> = ({ esc = 1, cheio = true }) => (
  <g transform={`scale(${esc})`} stroke={C} strokeWidth={7} strokeLinejoin="round">
    <path d="M -64 -60 L 64 -60 L 52 60 L -52 60 Z" fill="#9a6a3a" />
    {[-30, 0, 30].map((x) => (
      <path key={x} d={`M ${x} -58 L ${x * 0.85} 58`} strokeWidth={4} fill="none" />
    ))}
    <path d="M -62 -30 L 62 -30 M -56 30 L 56 30" stroke="#5a5560" strokeWidth={10} />
    <ellipse cx={0} cy={-60} rx={64} ry={14} fill={cheio ? "#7fd0f0" : "#5a3a1c"} />
    <path d="M -64 -60 Q 0 -150 64 -60" fill="none" strokeWidth={6} />
  </g>
);

/** fio de água caindo de a até b (arco de gravidade), com textura andando e respingos em b */
export const FioAgua: React.FC<{ a: [number, number]; b: [number, number]; f: number; largura?: number; respingo?: number }> = ({ a, b, f, largura = 18, respingo = 1 }) => {
  const mx = a[0] + (b[0] - a[0]) * 0.25;
  const my = a[1] + (b[1] - a[1]) * 0.1;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="#2f86c9" strokeWidth={largura + 8} opacity={0.5} />
      <path d={d} stroke="#8fdcff" strokeWidth={largura} />
      <path d={d} stroke="#ffffff" strokeWidth={largura * 0.28} strokeDasharray="22 30" strokeDashoffset={-f * 9} opacity={0.9} />
      {new Array(9).fill(0).map((_, i) => {
        const vida = (f * 1.0 + i * 7) % 26;
        const ang = -Math.PI / 2 + (random(`sp${i}`) - 0.5) * 2.4;
        const v = 6 + random(`sv${i}`) * 5;
        const x = b[0] + Math.cos(ang) * v * vida;
        const y = b[1] + Math.sin(ang) * v * vida + 0.35 * vida * vida;
        return vida < 24 ? <circle key={i} cx={x} cy={y} r={(5 + random(`sr${i}`) * 5) * (1 - vida / 26) * respingo} fill="#bfeaff" stroke="#2f86c9" strokeWidth={2} /> : null;
      })}
      <ellipse cx={b[0]} cy={b[1] + 4} rx={largura * 2.2} ry={8} fill="#bfeaff" opacity={0.7} />
    </g>
  );
};

/** mancha de areia molhada que cresce (raio em px) */
export const Mancha: React.FC<{ x: number; y?: number; r: number; rx?: number }> = ({ x, y = CHAO + 10, r, rx }) => (
  <g>
    <ellipse cx={x} cy={y} rx={rx ?? r * 2.4} ry={r * 0.5} fill="#a7783f" opacity={0.9} />
    <ellipse cx={x - r * 0.4} cy={y - r * 0.12} rx={(rx ?? r * 2.4) * 0.5} ry={r * 0.16} fill="#c59a5e" opacity={0.6} />
  </g>
);

/** faixa de areia molhada (trilha) entre x0 e x1 */
export const TrilhaMolhada: React.FC<{ x0: number; x1: number; y?: number; alt?: number }> = ({ x0, x1, y = CHAO - 10, alt = 46 }) =>
  x1 > x0 ? (
    <g>
      <rect x={x0} y={y - alt / 2} width={x1 - x0} height={alt} rx={alt / 2} fill="#a7783f" opacity={0.85} />
      <rect x={x0 + 20} y={y - alt / 2 + 6} width={Math.max(0, x1 - x0 - 40)} height={8} rx={4} fill="#c9a06a" opacity={0.7} />
    </g>
  ) : null;

/** monte de areia seca acumulando na frente do esqui (h = altura em px) */
export const MonteAreia: React.FC<{ x: number; y?: number; h: number; f: number }> = ({ x, y = CHAO - 6, h, f }) =>
  h > 2 ? (
    <g stroke={C} strokeWidth={6} strokeLinejoin="round">
      <path d={`M ${x - h * 0.4} ${y} Q ${x + h * 0.2} ${y - h * 1.1} ${x + h * 1.6} ${y} Z`} fill="#d8ad66" />
      <path d={`M ${x + h * 0.4} ${y - h * 0.5} Q ${x + h * 0.9} ${y - h * 0.3} ${x + h * 1.6} ${y} L ${x + h * 0.6} ${y} Z`} fill="#c99a52" strokeWidth={0} />
      {new Array(6).fill(0).map((_, i) => {
        const vida = (f * 0.7 + i * 9) % 30;
        return <circle key={i} cx={x + h * 0.5 + vida * (1.5 + i * 0.4)} cy={y - h * 0.8 + vida * vida * 0.06} r={3} fill="#e8c48a" strokeWidth={0} opacity={1 - vida / 30} />;
      })}
    </g>
  ) : null;

/** poça de lama com bolhas */
export const Lama: React.FC<{ x: number; y?: number; r: number; f: number }> = ({ x, y = CHAO + 6, r, f }) =>
  r > 1 ? (
    <g>
      <ellipse cx={x} cy={y} rx={r * 2.6} ry={r * 0.55} fill="#6b4a2a" stroke={C} strokeWidth={6} />
      <ellipse cx={x - r * 0.6} cy={y - r * 0.15} rx={r * 1.2} ry={r * 0.14} fill="#8a6440" opacity={0.7} />
      {[0, 1, 2].map((i) => {
        const vida = (f * 0.5 + i * 13) % 40;
        return <circle key={i} cx={x - r + i * r} cy={y - 4} r={(vida / 40) * 14} fill="none" stroke="#8a6440" strokeWidth={4} opacity={1 - vida / 40} />;
      })}
    </g>
  ) : null;

/** linhas de velocidade horizontais (mundo) */
export const LinhasVel: React.FC<{ x: number; y: number; f: number; forca: number; largura?: number }> = ({ x, y, f, forca, largura = 500 }) =>
  forca > 0.02 ? (
    <g stroke="#fff" strokeLinecap="round" opacity={forca}>
      {new Array(7).fill(0).map((_, i) => {
        const off = (f * 22 + i * 97) % 400;
        return <path key={i} d={`M ${x - off} ${y - 300 + i * 70} l ${-largura * (0.4 + random(`lv${i}`) * 0.6)} 0`} strokeWidth={6 + (i % 3) * 3} />;
      })}
    </g>
  ) : null;

// ---------------- pôr do sol + templo ----------------

export const CeuPorDoSol: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="ceuPds" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5a3e9e" />
        <stop offset="0.45" stopColor="#c8609a" />
        <stop offset="0.72" stopColor="#ff8a4a" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#ceuPds)" />
    <circle cx={700} cy={1010 + f * 0.05} r={150} fill="#ffcf6a" opacity={0.9} />
    <circle cx={700} cy={1010 + f * 0.05} r={260} fill="#ffb05a" opacity={0.25} />
    {[0, 1].map((i) => (
      <ellipse key={i} cx={((i * 600 + f * 0.3) % 1400) - 150} cy={300 + i * 160} rx={220} ry={20} fill="#ffb6c8" opacity={0.35} />
    ))}
  </g>
);

/** templo com pilones e colunas (silhueta quente) */
export const Templo: React.FC<{ x: number; y?: number; esc?: number }> = ({ x, y = HORIZONTE + 60, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`} stroke={C} strokeWidth={8} strokeLinejoin="round">
    <path d="M -620 0 L -560 -520 L -160 -520 L -120 0 Z" fill="#c98a5a" />
    <path d="M 120 0 L 160 -520 L 560 -520 L 620 0 Z" fill="#c98a5a" />
    <path d="M -140 0 L -140 -380 L 140 -380 L 140 0 Z" fill="#a8693f" />
    <path d="M -90 0 L -90 -280 Q 0 -330 90 -280 L 90 0 Z" fill="#3b2454" />
    <path d="M -600 -470 L -150 -470 M 150 -470 L 600 -470" stroke="#e8b47a" strokeWidth={14} />
    {[-460, -320, 320, 460].map((xx) => (
      <path key={xx} d={`M ${xx} -420 L ${xx} -80`} stroke="#8a5530" strokeWidth={10} />
    ))}
    {/* luz de recorte laranja na borda */}
    <path d="M 560 -520 L 620 0" stroke="#ffb06a" strokeWidth={10} />
  </g>
);

/** chão de pôr do sol */
export const ChaoPorDoSol: React.FC<{ de?: number; ate?: number }> = ({ de = -4000, ate = 4000 }) => (
  <g>
    <defs>
      <linearGradient id="areiaPds" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e0905a" />
        <stop offset="1" stopColor="#8a4a5a" />
      </linearGradient>
    </defs>
    <rect x={de} y={HORIZONTE + 10} width={ate - de} height={2200} fill="url(#areiaPds)" />
  </g>
);

// ---------------- fundo azul da explicação ----------------

export const FundoAzul: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="azulEg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1f2f5a" />
        <stop offset="1" stopColor="#0d1430" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#azulEg)" />
    {new Array(11).fill(0).map((_, i) => (
      <line key={i} x1={i * 108} y1={0} x2={i * 108} y2={1920} stroke="#6f8fd0" strokeOpacity={0.08} strokeWidth={2} />
    ))}
    {new Array(18).fill(0).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 108 + ((f * 0.2) % 108)} x2={1080} y2={i * 108 + ((f * 0.2) % 108)} stroke="#6f8fd0" strokeOpacity={0.06} strokeWidth={2} />
    ))}
  </g>
);

/** interpolação presa (atalho) */
export const ip = (f: number, a: number[], b: number[], easing?: (t: number) => number) =>
  interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
