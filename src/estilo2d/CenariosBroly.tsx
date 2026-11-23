import { random } from "remotion";
import { CHAO_Y } from "./Cenario2D";
import { Chamas } from "./EfeitosLuta";
import { CONTORNO } from "./personagens";

/**
 * Cenários do episódio "fúria verde" (referências: rua de anime ensolarada, cidade à noite tomada por luz verde).
 *  - RuaAnime: rua de bairro com lojas, padaria, postes e fios, árvores e nuvens grandes.
 *      destruicao 0 = intacta · 1 = rachada (pedras, poste torto, vidros quebrados) · 2 = destruída (carros virados,
 *      fumaça, fogo, prédios com pedaços faltando).
 *      ceu "dia" (azul com nuvens) · "verde" (céu escurecendo com brilho verde) · "noite" (noite verde, cidade destruída)
 *  - Carro (de pé ou virado), ColunaFumaca (contínua), CeuExplosao (flash/anel verde no céu).
 * Chão em CHAO_Y. camX = x da câmera (parallax das camadas do fundo).
 */

export type Ceu = "dia" | "verde" | "noite";

const LOJAS = [
  { cor: "#f3e2c4", toldo: "#e2574c", placa: "PADARIA", corPlaca: "#7a3f1d", alt: 520 },
  { cor: "#dfe9f2", toldo: "#3f8fd0", placa: "CAFÉ", corPlaca: "#21557d", alt: 470 },
  { cor: "#f5d7c8", toldo: "#3aa36b", placa: "MERCADO", corPlaca: "#1f6b43", alt: 560 },
  { cor: "#e8e0f2", toldo: "#f0a63a", placa: "LANCHES", corPlaca: "#8a4f12", alt: 500 },
  { cor: "#d9eadf", toldo: "#c94f8a", placa: "FLORES", corPlaca: "#7a2350", alt: 480 },
];

/** nuvem de anime (cúmulo): bolhas brancas com a parte de baixo azulada */
const Nuvem: React.FC<{ x: number; y: number; s: number; ceu: Ceu; semente: string }> = ({ x, y, s, ceu, semente }) => {
  const cor = ceu === "dia" ? "#ffffff" : ceu === "verde" ? "#9fb8a0" : "#1d2f2a";
  const sombra = ceu === "dia" ? "#cfe3f7" : ceu === "verde" ? "#5f7a66" : "#13201d";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {new Array(7).fill(0).map((_, i) => {
        const bx = (i - 3) * 70 + (random(`${semente}x${i}`) - 0.5) * 30;
        const by = -Math.sin((i / 6) * Math.PI) * 90 - random(`${semente}y${i}`) * 40;
        const r = 70 + random(`${semente}r${i}`) * 50;
        return <circle key={i} cx={bx} cy={by} r={r} fill={cor} />;
      })}
      <ellipse cx={0} cy={20} rx={260} ry={50} fill={sombra} />
    </g>
  );
};

/** carro simples (lado), virado = de rodas para cima */
export const Carro: React.FC<{ x: number; y?: number; cor: string; virado?: boolean; escala?: number; rot?: number }> = ({ x, y = CHAO_Y, cor, virado, escala = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${escala}) ${virado ? "translate(0 -150) scale(1 -1)" : ""}`}>
    <path d="M -230 -40 L -220 -110 L -120 -120 L -60 -190 L 90 -190 L 150 -120 L 230 -105 L 240 -40 Z" fill={cor} stroke={CONTORNO} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -40 -176 L 80 -176 L 128 -122 L -100 -122 Z" fill="#a9d6ec" stroke={CONTORNO} strokeWidth={6} />
    <line x1={20} y1={-176} x2={20} y2={-122} stroke={CONTORNO} strokeWidth={6} />
    {[-140, 150].map((rx) => (
      <g key={rx}>
        <circle cx={rx} cy={-30} r={46} fill="#26222b" stroke={CONTORNO} strokeWidth={6} />
        <circle cx={rx} cy={-30} r={18} fill="#9a98a3" />
      </g>
    ))}
  </g>
);

/** coluna de fumaça contínua (bolhas subindo em loop) */
export const ColunaFumaca: React.FC<{ x: number; y: number; f: number; tamanho?: number; cor?: string; semente?: string }> = ({ x, y, f, tamanho = 1, cor = "#3a3a40", semente = "cf" }) => (
  <g opacity={0.85}>
    {new Array(9).fill(0).map((_, i) => {
      const ciclo = 120;
      const t = (((f + i * (ciclo / 9)) % ciclo) + ciclo) % ciclo / ciclo;
      const yy = y - t * 900 * tamanho;
      const xx = x + Math.sin(t * 3 + i) * 50 * tamanho + t * 160 * tamanho;
      const r = (60 + t * 160) * tamanho * (0.8 + random(`${semente}${i}`) * 0.4);
      return <circle key={i} cx={xx} cy={yy} r={r} fill={cor} opacity={(1 - t) * 0.75} />;
    })}
  </g>
);

/** loja de rua; quebrada = pedaço do topo faltando e vidros escuros */
const Loja: React.FC<{ x: number; i: number; quebrada: number; ceu: Ceu }> = ({ x, i, quebrada, ceu }) => {
  const l = LOJAS[i % LOJAS.length];
  const w = 420;
  const h = l.alt;
  const topo = CHAO_Y - 20 - h;
  const escuro = ceu === "noite" ? 0.55 : ceu === "verde" ? 0.3 : 0;
  const recorte = quebrada > 0 ? `M ${x} ${topo + 60} L ${x + 120} ${topo + 20} L ${x + 180} ${topo + 110} L ${x + 260} ${topo + 40} L ${x + 330} ${topo + 130} L ${x + w} ${topo + 70}` : `M ${x} ${topo} L ${x + w} ${topo}`;
  return (
    <g>
      <path d={`${recorte} L ${x + w} ${CHAO_Y - 20} L ${x} ${CHAO_Y - 20} Z`} fill={l.cor} stroke={CONTORNO} strokeWidth={7} strokeLinejoin="round" />
      {/* janelas do andar de cima */}
      {[0, 1, 2].map((c) => (
        <rect key={c} x={x + 40 + c * 125} y={topo + 150} width={90} height={110} fill={quebrada > 0 && (c + i) % 2 === 0 ? "#1b1d24" : ceu === "dia" ? "#9fd4f0" : ceu === "verde" ? "#5d8f70" : "#7dff6a"} stroke={CONTORNO} strokeWidth={5} opacity={ceu === "noite" && !(quebrada > 0 && (c + i) % 2 === 0) ? 0.8 : 1} />
      ))}
      {/* toldo listrado + placa */}
      <path d={`M ${x + 10} ${CHAO_Y - 270} L ${x + w - 10} ${CHAO_Y - 270} L ${x + w + 20} ${CHAO_Y - 200} L ${x - 20} ${CHAO_Y - 200} Z`} fill={l.toldo} stroke={CONTORNO} strokeWidth={6} transform={quebrada > 1 ? `rotate(${i % 2 ? 8 : -6} ${x + w / 2} ${CHAO_Y - 235})` : undefined} />
      {[0, 1, 2, 3, 4].map((k) => (
        <path key={k} d={`M ${x + 20 + k * 84} ${CHAO_Y - 270} L ${x + 4 + k * 84} ${CHAO_Y - 200} L ${x + 46 + k * 84} ${CHAO_Y - 200} L ${x + 56 + k * 84} ${CHAO_Y - 270} Z`} fill="#ffffff" opacity={0.45} transform={quebrada > 1 ? `rotate(${i % 2 ? 8 : -6} ${x + w / 2} ${CHAO_Y - 235})` : undefined} />
      ))}
      <rect x={x + 70} y={CHAO_Y - 360} width={280} height={70} rx={12} fill={l.corPlaca} stroke={CONTORNO} strokeWidth={6} transform={quebrada > 0 ? `rotate(${i % 2 ? 7 : -9} ${x + 70} ${CHAO_Y - 325})` : undefined} />
      <text x={x + 210} y={CHAO_Y - 312} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={44} fill="#fff7e0" transform={quebrada > 0 ? `rotate(${i % 2 ? 7 : -9} ${x + 70} ${CHAO_Y - 325})` : undefined}>
        {l.placa}
      </text>
      {/* vitrine e porta */}
      <rect x={x + 30} y={CHAO_Y - 190} width={220} height={150} fill={quebrada > 0 ? "#1b1d24" : ceu === "dia" ? "#bfe6f7" : "#3f6250"} stroke={CONTORNO} strokeWidth={5} />
      <rect x={x + 290} y={CHAO_Y - 200} width={100} height={180} fill="#6b4a33" stroke={CONTORNO} strokeWidth={5} />
      {escuro > 0 ? <path d={`${recorte} L ${x + w} ${CHAO_Y - 20} L ${x} ${CHAO_Y - 20} Z`} fill="#071510" opacity={escuro} /> : null}
    </g>
  );
};

export const RuaAnime: React.FC<{ camX: number; f: number; destruicao?: 0 | 1 | 2; ceu?: Ceu; brilhoVerde?: number }> = ({ camX, f, destruicao = 0, ceu = "dia", brilhoVerde = 0 }) => {
  const ceuCor =
    ceu === "dia" ? ["#4aa6f2", "#bfe4ff"] : ceu === "verde" ? ["#1d3b33", "#6f9a6a"] : ["#06110f", "#123326"];
  const tiles = [-2, -1, 0, 1, 2, 3, 4];
  return (
    <g>
      <defs>
        <linearGradient id={`ceuRA-${ceu}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={ceuCor[0]} />
          <stop offset="1" stopColor={ceuCor[1]} />
        </linearGradient>
        <radialGradient id="brilhoVerdeRA" gradientUnits="userSpaceOnUse" cx={camX} cy={CHAO_Y - 500} r={1600}>
          <stop offset="0" stopColor="#7dff4a" stopOpacity={0.55 * brilhoVerde} />
          <stop offset="0.6" stopColor="#2fd05a" stopOpacity={0.18 * brilhoVerde} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={camX - 4000} y={-3000} width={8000} height={3000 + CHAO_Y} fill={`url(#ceuRA-${ceu})`} />
      {/* nuvens (quase paradas) */}
      <g transform={`translate(${camX * 0.9} 0)`}>
        {[-900, -100, 700, 1500].map((x, i) => (
          <Nuvem key={i} x={x - 540 + ((f * 0.4) % 4000)} y={260 + (i % 2) * 220} s={1.1 + (i % 3) * 0.3} ceu={ceu} semente={`nv${i}`} />
        ))}
      </g>
      {/* skyline ao fundo (noite: janelas verdes) */}
      <g transform={`translate(${camX * 0.7} 0)`}>
        {new Array(16).fill(0).map((_, i) => {
          const x = -2200 + i * 280;
          const h = 420 + random(`sk${i}`) * 520;
          const corte = destruicao === 2 && i % 3 === 0;
          return (
            <g key={i}>
              <path
                d={corte ? `M ${x} ${CHAO_Y - 400 - h + 120} L ${x + 90} ${CHAO_Y - 400 - h + 40} L ${x + 150} ${CHAO_Y - 400 - h + 160} L ${x + 240} ${CHAO_Y - 400 - h + 80} L ${x + 240} ${CHAO_Y} L ${x} ${CHAO_Y} Z` : `M ${x} ${CHAO_Y - 400 - h} L ${x + 240} ${CHAO_Y - 400 - h} L ${x + 240} ${CHAO_Y} L ${x} ${CHAO_Y} Z`}
                fill={ceu === "dia" ? "#9ec3df" : ceu === "verde" ? "#2b4a40" : "#0b1a16"}
                opacity={ceu === "dia" ? 0.7 : 1}
              />
              {ceu !== "dia"
                ? new Array(6).fill(0).map((_, k) =>
                    random(`skj${i}${k}`) > 0.45 ? <rect key={k} x={x + 30 + (k % 3) * 70} y={CHAO_Y - 400 - h + 60 + Math.floor(k / 3) * 90} width={34} height={44} fill={ceu === "noite" ? "#6dff5a" : "#a9d98a"} opacity={0.55} /> : null,
                  )
                : null}
            </g>
          );
        })}
      </g>
      {/* postes e fios (parallax 0.85) */}
      <g transform={`translate(${camX * 0.15} 0)`}>
        {tiles.map((t) => {
          const px = t * 1400 - 300;
          const torto = destruicao >= 1 && t % 2 === 0 ? (destruicao === 2 ? 16 : 8) : 0;
          return (
            <g key={`p${t}`} transform={`rotate(${torto} ${px} ${CHAO_Y - 40})`}>
              <rect x={px - 14} y={CHAO_Y - 1200} width={28} height={1170} fill="#5d5a5e" stroke={CONTORNO} strokeWidth={5} />
              <rect x={px - 90} y={CHAO_Y - 1170} width={180} height={18} fill="#5d5a5e" stroke={CONTORNO} strokeWidth={4} />
              {[0, 1, 2].map((k) => (
                <path key={k} d={`M ${px} ${CHAO_Y - 1150 + k * 26} Q ${px + 700} ${CHAO_Y - 1040 + k * 26} ${px + 1400} ${CHAO_Y - 1150 + k * 26}`} stroke="#2b2830" strokeWidth={4} fill="none" opacity={0.75} />
              ))}
            </g>
          );
        })}
      </g>
      {/* árvores e lojas (plano dos personagens) */}
      {tiles.map((t) => (
        <g key={`l${t}`}>
          {[0, 1, 2].map((k) => {
            const x = t * 1400 + k * 470 - 700;
            return <Loja key={k} x={x} i={((t + 10) * 3 + k) % LOJAS.length} quebrada={destruicao} ceu={ceu} />;
          })}
          <g transform={`translate(${t * 1400 + 700} 0)`}>
            <rect x={-18} y={CHAO_Y - 430} width={36} height={420} fill="#6b4a33" stroke={CONTORNO} strokeWidth={5} />
            {[[-90, -480, 110], [60, -520, 120], [-10, -600, 120], [90, -430, 90], [-110, -400, 90]].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={CHAO_Y + y} r={r} fill={ceu === "dia" ? (i % 2 ? "#4fae4a" : "#67c45a") : ceu === "verde" ? "#2f6b3a" : "#123a1c"} stroke={CONTORNO} strokeWidth={5} />
            ))}
          </g>
        </g>
      ))}
      {/* calçada e rua */}
      <rect x={camX - 4000} y={CHAO_Y - 24} width={8000} height={70} fill={ceu === "dia" ? "#d9d1c6" : "#4a524c"} stroke={CONTORNO} strokeWidth={5} />
      <rect x={camX - 4000} y={CHAO_Y + 46} width={8000} height={1400} fill={ceu === "dia" ? "#8d8b92" : ceu === "verde" ? "#3b4440" : "#1a2420"} />
      {new Array(40).fill(0).map((_, i) => (
        <rect key={i} x={Math.floor((camX - 4000) / 300) * 300 + i * 300} y={CHAO_Y + 300} width={160} height={18} rx={9} fill="#f2d24a" opacity={ceu === "dia" ? 0.9 : 0.5} />
      ))}
      {/* destruição: entulho, carros virados, fumaça e fogo */}
      {destruicao >= 1
        ? tiles.map((t) => (
            <g key={`d${t}`}>
              {new Array(destruicao === 2 ? 9 : 5).fill(0).map((_, i) => {
                const x = t * 1400 + random(`ent${t}${i}`) * 1400 - 700;
                const r = 16 + random(`entr${t}${i}`) * 36;
                return <path key={i} d={`M ${x - r} ${CHAO_Y + 70} L ${x - r * 0.3} ${CHAO_Y + 70 - r} L ${x + r} ${CHAO_Y + 64 - r * 0.4} L ${x + r * 0.8} ${CHAO_Y + 72} Z`} fill={["#8a8a90", "#6a6870", "#a39f9a"][i % 3]} stroke={CONTORNO} strokeWidth={4} />;
              })}
              <path d={`M ${t * 1400 - 300} ${CHAO_Y + 160} l 120 -20 l 70 40 l 140 -30 l 60 50`} stroke={CONTORNO} strokeWidth={8} fill="none" strokeLinecap="round" />
            </g>
          ))
        : null}
      {destruicao === 2
        ? tiles.map((t) => (
            <g key={`c${t}`}>
              <ColunaFumaca x={t * 1400 - 200} y={CHAO_Y - 200} f={f} tamanho={1.3} cor={ceu === "noite" ? "#1a2a22" : "#3c3a40"} semente={`fz${t}`} />
              <Carro x={t * 1400 + 250} y={CHAO_Y + 140} cor={["#d94a3a", "#3a7ad9", "#e0e0e6"][(t + 9) % 3]} virado={t % 2 === 0} rot={t % 2 === 0 ? 6 : -8} escala={0.9} />
              <Chamas x={t * 1400 - 40} y={CHAO_Y + 60} f={f + t * 7} intensidade={0.7} tamanho={0.8} />
            </g>
          ))
        : null}
      {brilhoVerde > 0 ? <rect x={camX - 4000} y={-3000} width={8000} height={6000} fill="url(#brilhoVerdeRA)" style={{ mixBlendMode: "screen" }} /> : null}
    </g>
  );
};

/** explosão de energia no céu: núcleo, anel achatado e raios */
export const CeuExplosao: React.FC<{ x: number; y: number; f: number; de: number; cor?: string }> = ({ x, y, f, de, cor = "#7dff4a" }) => {
  const t = f - de;
  if (t < 0 || t > 90) return null;
  const cresce = 1 - Math.pow(1 - Math.min(1, t / 14), 3);
  const some = t > 40 ? 1 - (t - 40) / 50 : 1;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={some}>
      <circle cx={x} cy={y} r={900 * cresce} fill={cor} opacity={0.25} />
      <circle cx={x} cy={y} r={480 * cresce} fill={cor} opacity={0.6} />
      <circle cx={x} cy={y} r={240 * cresce} fill="#f4ffe8" />
      <ellipse cx={x} cy={y} rx={1400 * cresce} ry={160 * cresce} fill="none" stroke="#e4ffd0" strokeWidth={26 * (1 - Math.min(1, t / 60))} />
      {new Array(10).fill(0).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * 1300 * cresce} y2={y + Math.sin(a) * 1300 * cresce} stroke="#f4ffe8" strokeWidth={10} opacity={0.6} />;
      })}
    </g>
  );
};
