import { random, useCurrentFrame } from "remotion";
import { CHAO_Y } from "./Cenario2D";

/**
 * Acabamento no estilo da referência (estilo B: personagens atuais, mundo "pintado"):
 *  - Fundo: dessatura e baixa o contraste do cenário + névoa (os personagens ficam mais vivos que o fundo)
 *  - RuaLonga: rua detalhada (casas, postes, fios, pássaros, placa, calçada, rachaduras, folhas) com parallax
 *  - Cachorro dormindo, PoeiraFlutuante, ObjetosFisica (objetos voando com gravidade e quique)
 */

let filtroId = 0;
export const Fundo: React.FC<{ children: React.ReactNode; saturacao?: number; nevoa?: number; cor?: string }> = ({ children, saturacao = 0.72, nevoa = 0.1, cor = "#efe4d2" }) => {
  const id = `tom${filtroId++ % 1000}`;
  return (
    <g>
      <defs>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values={String(saturacao)} />
          <feComponentTransfer>
            <feFuncR type="linear" slope={0.86} intercept={0.07} />
            <feFuncG type="linear" slope={0.86} intercept={0.07} />
            <feFuncB type="linear" slope={0.86} intercept={0.08} />
          </feComponentTransfer>
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
      <rect x={-4000} y={-3000} width={12000} height={8000} fill={cor} opacity={nevoa} />
    </g>
  );
};

const Casa: React.FC<{ x: number; w: number; h: number; cor: string; telhado: string; seed: string; chao: number; recuo: number }> = ({ x, w, h, cor, telhado, seed, chao, recuo }) => {
  const base = chao - recuo;
  const cols = Math.max(2, Math.floor(w / 110));
  return (
    <g>
      <rect x={x} y={base - h} width={w} height={h + 10} fill={cor} />
      {random(`${seed}t`) > 0.4 ? (
        <path d={`M ${x - 14} ${base - h} L ${x + w / 2} ${base - h - 70 - random(`${seed}r`) * 40} L ${x + w + 14} ${base - h} Z`} fill={telhado} />
      ) : (
        <rect x={x - 8} y={base - h - 18} width={w + 16} height={22} fill="#9c958b" />
      )}
      {new Array(cols).fill(0).map((_, c) =>
        [0, 1].map((r) =>
          base - h + 50 + r * 150 < base - 120 ? (
            <g key={`${c}${r}`}>
              <rect x={x + 30 + c * ((w - 40) / cols)} y={base - h + 50 + r * 150} width={64} height={86} fill="#8b97a3" />
              <rect x={x + 30 + c * ((w - 40) / cols)} y={base - h + 50 + r * 150} width={64} height={10} fill="#d8d0c2" />
              {random(`${seed}${c}${r}`) > 0.6 ? <rect x={x + 30 + c * ((w - 40) / cols)} y={base - h + 60 + r * 150} width={64} height={30} fill="#c98f7a" opacity={0.7} /> : null}
            </g>
          ) : null,
        ),
      )}
      {random(`${seed}p`) > 0.3 ? <rect x={x + w / 2 - 40} y={base - 190} width={80} height={180} fill="#7e7368" /> : null}
    </g>
  );
};

/** rua longa com parallax — use camX igual ao x da câmera */
export const RuaLonga: React.FC<{ camX?: number; placa?: string; chao?: number }> = ({ camX = 1100, placa = "RUA SEGUNDA-FEIRA", chao = CHAO_Y }) => {
  const f = useCurrentFrame();
  const tiles = [-1, 0, 1, 2, 3, 4];
  return (
    <g>
      <defs>
        <linearGradient id="ceuRua" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#b9c6d8" />
          <stop offset="1" stopColor="#ecdcc6" />
        </linearGradient>
      </defs>
      <rect x={-4000} y={-3000} width={12000} height={8000} fill="url(#ceuRua)" />
      {/* nuvens (quase paradas) */}
      <g transform={`translate(${camX * 0.85} 0)`}>
        {[[-500, 250, 1.3], [200, 160, 1], [700, 320, 0.8], [1300, 220, 1.1]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x + f * 0.3} ${y}) scale(${s})`} fill="#eeecef" opacity={0.75}>
            <ellipse cx={0} cy={0} rx={170} ry={50} />
            <circle cx={-60} cy={-30} r={62} />
            <circle cx={45} cy={-52} r={78} />
          </g>
        ))}
      </g>
      {/* casas de trás (parallax 0.5) */}
      <g transform={`translate(${camX * 0.5} 0)`} opacity={0.8}>
        {tiles.map((t) =>
          [0, 1, 2, 3].map((i) => {
            const s = `b${t}${i}`;
            return <Casa key={s} seed={s} x={t * 1500 + i * 380 - 2000} w={300 + random(s) * 60} h={380 + random(`${s}h`) * 260} cor={["#cdc5b8", "#c3c8d0", "#d4c9ba", "#bec3ca"][i]} telhado="#c79a86" chao={chao} recuo={300} />;
          }),
        )}
      </g>
      {/* casas da frente */}
      {tiles.map((t) =>
        [0, 1, 2, 3].map((i) => {
          const s = `f${t}${i}`;
          return <Casa key={s} seed={s} x={t * 1500 + i * 375 - 1600} w={350} h={430 + random(s) * 170} cor={["#b6afa4", "#a7adb6", "#bbb2a2", "#adb3ba"][i]} telhado="#b9806b" chao={chao} recuo={140} />;
        }),
      )}
      {/* postes, fios e pássaros */}
      {tiles.map((t) => {
        const px = t * 1500 - 700;
        return (
          <g key={`p${t}`}>
            <rect x={px} y={chao - 1120} width={22} height={1000} fill="#8a8683" />
            <rect x={px - 60} y={chao - 1110} width={142} height={14} fill="#8a8683" />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${px} ${chao - 1100 + i * 22} Q ${px + 750} ${chao - 1010 + i * 22} ${px + 1500} ${chao - 1100 + i * 22}`} stroke="#5d5858" strokeWidth={4} fill="none" opacity={0.7} />
            ))}
            {[0, 1, 2].map((i) => {
              const bx = px + 380 + i * 90 + random(`pa${t}${i}`) * 40;
              const by = chao - 1066 + Math.sin(((bx - px) / 1500) * Math.PI) * 60;
              const bica = Math.sin(f * 0.3 + i + t) > 0.85 ? 4 : 0;
              return (
                <g key={`pa${i}`} transform={`translate(${bx} ${by - 14 - bica})`} fill="#3b3638">
                  <ellipse cx={0} cy={0} rx={16} ry={12} />
                  <circle cx={12} cy={-8} r={7} />
                  <path d="M 18 -8 L 26 -6 L 18 -4 Z" fill="#c9962f" />
                </g>
              );
            })}
            {t === 0 ? (
              <g transform={`translate(${px + 40} ${chao - 860}) rotate(-5)`}>
                <rect x={0} y={0} width={420} height={110} rx={10} fill="#2f4f8f" />
                <rect x={8} y={8} width={404} height={94} rx={8} fill="none" stroke="#e9eef5" strokeWidth={4} />
                <text x={210} y={44} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={24} fill="#e9eef5">
                  {placa.split(" ")[0]}
                </text>
                <text x={210} y={86} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={38} fill="#e9eef5">
                  {placa.split(" ").slice(1).join(" ")}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
      {/* calçada, meio-fio, asfalto */}
      <rect x={-4000} y={chao - 150} width={12000} height={160} fill="#b8b3ab" />
      {new Array(60).fill(0).map((_, i) => (
        <rect key={i} x={-3000 + i * 200} y={chao - 150} width={4} height={160} fill="#a29c94" />
      ))}
      <rect x={-4000} y={chao} width={12000} height={24} fill="#8b8680" />
      <rect x={-4000} y={chao + 24} width={12000} height={1200} fill="#8d9098" />
      {new Array(18).fill(0).map((_, i) => {
        const x = -2500 + i * 520 + random(`ra${i}`) * 200;
        const y = chao + 80 + random(`ry${i}`) * 420;
        const w = 120 + random(`rw${i}`) * 180;
        return <path key={i} d={`M ${x} ${y} l ${w * 0.3} 10 l ${w * 0.25} -8 l ${w * 0.45} 14`} stroke="#767982" strokeWidth={5} fill="none" />;
      })}
      {new Array(6).fill(0).map((_, i) => (
        <g key={`b${i}`}>
          <ellipse cx={-2000 + i * 1300} cy={chao + 320} rx={92} ry={22} fill="#717480" />
          <ellipse cx={-2000 + i * 1300} cy={chao + 320} rx={70} ry={14} fill="#62656e" />
        </g>
      ))}
      {new Array(40).fill(0).map((_, i) => {
        const x = -2500 + random(`fo${i}`) * 7000;
        const y = chao + 40 + random(`fy${i}`) * 520;
        return <ellipse key={`fo${i}`} cx={x} cy={y} rx={11} ry={5} fill={["#a86a3a", "#c48a4a", "#8a5a30"][i % 3]} transform={`rotate(${random(`fr${i}`) * 180} ${x} ${y})`} />;
      })}
    </g>
  );
};

/** cachorro dormindo (respira; orelha mexe de vez em quando) */
export const Cachorro: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => {
  const f = useCurrentFrame();
  const r = 1 + Math.sin(f * 0.12) * 0.03;
  const orelha = Math.sin(f * 0.05) > 0.96 ? -12 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <ellipse cx={0} cy={6} rx={150} ry={20} fill="#1d1424" opacity={0.15} />
      <ellipse cx={0} cy={-38} rx={120} ry={46 * r} fill="#c98a52" />
      <ellipse cx={-30} cy={-46} rx={50} ry={28 * r} fill="#e2b07c" opacity={0.6} />
      <path d="M -120 -40 Q -170 -30 -165 0" stroke="#c98a52" strokeWidth={20} fill="none" strokeLinecap="round" />
      <g transform="translate(105 -35)">
        <ellipse cx={0} cy={0} rx={52} ry={40} fill="#d39a62" />
        <ellipse cx={46} cy={10} rx={26} ry={18} fill="#e2b07c" />
        <ellipse cx={66} cy={6} rx={9} ry={7} fill="#2a1d22" />
        <path d="M 4 -4 Q 16 2 26 -4" stroke="#2a1d22" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M -30 -26 Q -50 ${-10 + orelha} -28 ${18 + orelha}`} fill="#a86a3a" stroke="#a86a3a" strokeWidth={18} strokeLinecap="round" />
      </g>
      <text x={150} y={-110 - ((f * 0.6) % 40)} fontFamily="Fredoka" fontWeight={700} fontSize={36} fill="#ffffff" opacity={0.7}>
        z
      </text>
    </g>
  );
};

/** poeira/partículas flutuando na tela inteira (coordenadas de tela) */
export const PoeiraFlutuante: React.FC<{ quantidade?: number; cor?: string }> = ({ quantidade = 26, cor = "#fff7e8" }) => {
  const f = useCurrentFrame();
  return (
    <g pointerEvents="none">
      {new Array(quantidade).fill(0).map((_, i) => {
        const vx = (random(`px${i}`) - 0.3) * 0.8;
        const vy = -0.2 - random(`py${i}`) * 0.5;
        const x = (random(`x${i}`) * 1080 + f * vx * 3 + 1080 * 4) % 1080;
        const y = (random(`y${i}`) * 1920 + f * vy * 3 + 1920 * 4) % 1920;
        const s = 2 + random(`s${i}`) * 4;
        return <circle key={i} cx={x + Math.sin(f * 0.03 + i) * 10} cy={y} r={s} fill={cor} opacity={0.25 + random(`o${i}`) * 0.35} />;
      })}
    </g>
  );
};

/**
 * Objetos voando com física simples (gravidade, rotação, quique no chão).
 * desenho(i) devolve o SVG de cada objeto centrado em (0,0).
 */
export const ObjetosFisica: React.FC<{
  x: number;
  y: number;
  f: number;
  de: number;
  n: number;
  chao: number;
  velocidade?: number;
  angulo?: [number, number];
  gravidade?: number;
  semente: string;
  desenho: (i: number) => React.ReactNode;
}> = ({ x, y, f, de, n, chao, velocidade = 26, angulo = [-150, -30], gravidade = 1.4, semente, desenho }) => {
  const t = f - de;
  if (t < 0) return null;
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const a = ((angulo[0] + (angulo[1] - angulo[0]) * random(`${semente}a${i}`)) * Math.PI) / 180;
        const v = velocidade * (0.5 + random(`${semente}v${i}`) * 0.7);
        const atraso = random(`${semente}d${i}`) * 4;
        const tt = Math.max(0, t - atraso);
        let px = x + Math.cos(a) * v * tt;
        let py = y + Math.sin(a) * v * tt + 0.5 * gravidade * tt * tt;
        let rot = tt * (random(`${semente}r${i}`) - 0.5) * 40;
        if (py > chao) {
          // quique amortecido: fica no chão
          py = chao - Math.abs(Math.sin(tt * 0.5)) * 30 * Math.exp(-tt * 0.1);
          px = x + Math.cos(a) * v * Math.min(tt, 30);
          rot = rot * 0.3;
        }
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${rot})`}>
            {desenho(i)}
          </g>
        );
      })}
    </g>
  );
};

/**
 * Rua em PERSPECTIVA (vista de dentro da rua, olhando pro fundo).
 * Convenção: um objeto na "profundidade" com escala s tem os pés em y = HORIZONTE + K_PERSP * s
 * e o x de tela = 540 + X * s (X = posição lateral em px de mundo).
 */
export const HORIZONTE = 760;
export const K_PERSP = 1190;
export const yPerspectiva = (s: number) => HORIZONTE + K_PERSP * s;

export const RuaPerspectiva: React.FC<{ placa?: string }> = ({ placa = "RUA SEGUNDA-FEIRA" }) => {
  const f = useCurrentFrame();
  const casas: { lado: number; s: number; cor: string; h: number; seed: string }[] = [];
  const cores = ["#b9b2a7", "#a8adb6", "#bcb3a3", "#aeb4bb", "#c6bfb2", "#9fa6ae"];
  for (let i = 0; i < 12; i++) {
    const s = 0.05 * Math.pow(1.36, i);
    for (const lado of [-1, 1]) casas.push({ lado, s, cor: cores[(i * 2 + (lado > 0 ? 1 : 0)) % cores.length], h: 1300 + random(`ph${i}${lado}`) * 700, seed: `pp${i}${lado}` });
  }
  casas.sort((a, b) => a.s - b.s);
  const yy = yPerspectiva;
  const larguraRua = 700; // metade (px de mundo)
  return (
    <g>
      <defs>
        <linearGradient id="ceuPersp" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#b9c6d8" />
          <stop offset="1" stopColor="#ecdcc6" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-400} width={1900} height={2800} fill="url(#ceuPersp)" />
      {[[200, 260, 1.1], [760, 180, 0.9]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x + f * 0.25} ${y}) scale(${s})`} fill="#eeecef" opacity={0.75}>
          <ellipse cx={0} cy={0} rx={170} ry={50} />
          <circle cx={-60} cy={-30} r={62} />
          <circle cx={45} cy={-52} r={78} />
        </g>
      ))}
      {/* chão: calçadas e asfalto em trapézio */}
      <path d={`M 540 ${HORIZONTE} L ${540 - 3000} ${yy(2.2)} L ${540 + 3000} ${yy(2.2)} Z`} fill="#b8b3ab" />
      {new Array(14).fill(0).map((_, i) => {
        const sj = 0.05 * Math.pow(1.3, i);
        return <path key={`cj${i}`} d={`M ${540 - 3000 * sj / 2.2} ${yy(sj)} L ${540 + 3000 * sj / 2.2} ${yy(sj)}`} stroke="#a39d95" strokeWidth={Math.max(1, 4 * sj)} />;
      })}
      <path d={`M 540 ${HORIZONTE} L ${540 - larguraRua * 2.2} ${yy(2.2)} L ${540 + larguraRua * 2.2} ${yy(2.2)} Z`} fill="#8d9098" />
      {[-1, 1].map((l) => (
        <path key={l} d={`M 540 ${HORIZONTE} L ${540 + l * larguraRua * 2.2} ${yy(2.2)}`} stroke="#77737a" strokeWidth={10} />
      ))}
      {/* faixas no meio */}
      {new Array(10).fill(0).map((_, i) => {
        const s0 = 0.05 * Math.pow(1.45, i);
        const s1 = s0 * 1.18;
        return <path key={i} d={`M ${540 - 10 * s0} ${yy(s0)} L ${540 + 10 * s0} ${yy(s0)} L ${540 + 14 * s1} ${yy(s1)} L ${540 - 14 * s1} ${yy(s1)} Z`} fill="#e3d6a0" opacity={0.9} />;
      })}
      {/* casas dos dois lados */}
      {casas.map((c) => {
        const xFace = 540 + c.lado * (larguraRua + 120) * c.s;
        const w = 1400 * c.s;
        const h = c.h * c.s;
        const base = yy(c.s);
        const x = c.lado < 0 ? xFace - w : xFace;
        return (
          <g key={c.seed}>
            <rect x={x} y={base - h} width={w} height={h} fill={c.cor} />
            <rect x={x} y={base - h} width={w} height={Math.max(2, 26 * c.s)} fill="#9c958b" />
            {[0, 1, 2].map((r) =>
              [0, 1].map((q) => (
                <rect key={`${r}${q}`} x={x + w * (0.15 + q * 0.45)} y={base - h + h * (0.15 + r * 0.26)} width={w * 0.25} height={h * 0.14} fill="#8b97a3" />
              )),
            )}
          </g>
        );
      })}
      {/* postes */}
      {[0.22, 0.45, 0.9].map((s, i) => (
        <g key={i}>
          <rect x={540 + (larguraRua + 120) * s - 10 * s} y={yy(s) - 1100 * s} width={22 * s} height={1100 * s} fill="#8a8683" />
          {i === 1 ? (
            <g transform={`translate(${540 + (larguraRua + 120) * s} ${yy(s) - 880 * s}) scale(${s}) rotate(-4)`}>
              <rect x={-200} y={0} width={420} height={110} rx={10} fill="#2f4f8f" />
              <text x={10} y={46} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={26} fill="#e9eef5">
                {placa.split(" ")[0]}
              </text>
              <text x={10} y={88} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={40} fill="#e9eef5">
                {placa.split(" ").slice(1).join(" ")}
              </text>
            </g>
          ) : null}
        </g>
      ))}
      {[0.2, 0.45, 0.9].map((s, i) => (
        <path key={`fio${i}`} d={`M ${540 + (larguraRua + 120) * s} ${yy(s) - 1090 * s} Q 540 ${HORIZONTE - 300} ${540 - (larguraRua + 120) * s} ${yy(s) - 1090 * s}`} stroke="#5d5858" strokeWidth={3} fill="none" opacity={0.6} />
      ))}
      {/* folhas no chão */}
      {new Array(24).fill(0).map((_, i) => {
        const s = 0.15 + random(`pf${i}`) * 1.3;
        const x = 540 + (random(`px${i}`) - 0.5) * 1300 * s;
        return <ellipse key={i} cx={x} cy={yy(s)} rx={12 * s} ry={5 * s} fill={["#a86a3a", "#c48a4a", "#8a5a30"][i % 3]} />;
      })}
    </g>
  );
};
