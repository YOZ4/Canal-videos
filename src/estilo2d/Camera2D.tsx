import { random } from "remotion";
import { posCabeca, posMao, posPe, type Pose } from "./Boneco2D";
import { CHAO_Y } from "./Cenario2D";

/**
 * Ângulos dramáticos que FUNCIONAM com bonecos 2D (sem deformar o desenho).
 * Decisão do usuário: NÃO usar câmera em perspectiva (rotateX/perspective) nos personagens — o boneco plano fica
 * "esticado como pôster". Em vez disso:
 *  - camBaixa: contra-plongée "de enquadramento" — chão bem embaixo da tela, personagem enorme quase saindo pelo topo.
 *  - camAlta: o oposto — chão no alto da tela, personagem pequeno embaixo, muito chão à vista (sensação de olhar de cima).
 *  - camDetalhe: close extremo de olho / mão / pé / ponto qualquer, com inclinação (dutch).
 *  - Camada: parallax por profundidade (fundo < 1, chão = 1, primeiro plano > 1).
 *  - PrimeiroPlano: elementos desfocados passando PERTO da câmera (pilar, pedrinhas, poeira) — profundidade sem 3D.
 * Câmera = { x, y, zoom, rot } no mesmo formato do Palco/transform: translate(540 960) rotate(rot) scale(zoom) translate(-x -y).
 */

export type Cam = { x: number; y: number; zoom: number; rot: number };
const W = 1080;
const H = 1920;

/**
 * Câmera baixa (sem perspectiva): o chão fica em `chaoTela` (fração da altura da tela, 0.9 = bem embaixo) e o personagem
 * ocupa `ocupa` da altura da tela. alturaMundo = altura do personagem em px de mundo (≈ 1220 × escala).
 */
export const camBaixa = (x: number, alturaMundo: number, opts: { chaoTela?: number; ocupa?: number; rot?: number; chao?: number } = {}): Cam => {
  const { chaoTela = 0.92, ocupa = 0.95, rot = -7, chao = CHAO_Y } = opts;
  const zoom = (ocupa * H) / alturaMundo;
  const y = chao - (chaoTela * H - H / 2) / zoom;
  return { x, y, zoom, rot };
};

/** câmera alta (sem perspectiva): chão começa em `chaoTela` (0.35 = no alto) e o personagem fica pequeno */
export const camAlta = (x: number, alturaMundo: number, opts: { chaoTela?: number; ocupa?: number; rot?: number; chao?: number } = {}): Cam => {
  const { chaoTela = 0.62, ocupa = 0.3, rot = 5, chao = CHAO_Y } = opts;
  const zoom = (ocupa * H) / alturaMundo;
  const y = chao - (chaoTela * H - H / 2) / zoom;
  return { x, y, zoom, rot };
};

export type Detalhe = "olhos" | "maoD" | "maoE" | "peD" | "peE";
/** close extremo num detalhe do personagem (ou num ponto [x,y]). desloca = enquadra fora do centro (regra dos terços) */
export const camDetalhe = (alvo: Detalhe | [number, number], pose: Pose | null, opts: { zoom?: number; rot?: number; desloca?: [number, number] } = {}): Cam => {
  const { zoom = 3, rot = 6, desloca = [0, 0] } = opts;
  let p: [number, number];
  if (Array.isArray(alvo)) p = alvo;
  else if (!pose) p = [W / 2, H / 2];
  else if (alvo === "olhos") {
    const c = posCabeca(pose);
    p = [c[0] + 40 * pose.lado * pose.escala, c[1] + 10 * pose.escala];
  } else if (alvo === "maoD" || alvo === "maoE") p = posMao(pose, alvo === "maoD" ? "D" : "E");
  else p = posPe(pose, alvo === "peD" ? "D" : "E");
  return { x: p[0] - desloca[0] / zoom, y: p[1] - desloca[1] / zoom, zoom, rot };
};

/** transform do mundo para uma câmera */
export const transformCam = (c: Cam) => `translate(${W / 2} ${H / 2}) rotate(${c.rot}) scale(${c.zoom}) translate(${-c.x} ${-c.y})`;

/**
 * Camada com profundidade: fator 1 = plano dos personagens; < 1 = mais longe (anda menos); > 1 = mais perto (anda mais).
 * ref = posição da câmera em que a camada fica "no lugar" (normalmente o x inicial da câmera).
 */
export const Camada: React.FC<{ camX: number; fator: number; ref?: number; children: React.ReactNode }> = ({ camX, fator, ref = 540, children }) => (
  <g transform={`translate(${(camX - ref) * (1 - fator)} 0)`}>{children}</g>
);

/**
 * Primeiro plano desfocado, desenhado em coordenadas de TELA (por cima de tudo, fora do transform da câmera).
 * tipo: "pilar" (faixa escura que cruza a tela), "pedras" (pedrinhas grandes borradas), "poeira" (partículas grandes).
 * camX faz o elemento correr mais rápido que o fundo (fator > 1 = perto da câmera).
 */
export const PrimeiroPlano: React.FC<{ camX: number; f: number; tipo: "pilar" | "pedras" | "poeira"; fator?: number; desfoque?: number; cor?: string; lado?: 1 | -1; id?: string }> = ({
  camX,
  f,
  tipo,
  fator = 2.2,
  desfoque = 14,
  cor = "#05090d",
  lado = 1,
  id = "pp",
}) => {
  const fid = `pp-${id}`;
  const desloc = -camX * fator;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={desfoque} />
        </filter>
      </defs>
      <g filter={`url(#${fid})`}>
        {tipo === "pilar" ? (
          // pilar perto da câmera: repete a cada 2400 px para sempre haver um passando
          <g transform={`translate(${(((desloc % 2400) + 2400) % 2400) - 600} 0)`}>
            <rect x={lado > 0 ? 0 : 1200} y={-100} width={260} height={H + 200} fill={cor} />
            <rect x={lado > 0 ? 250 : 1190} y={-100} width={20} height={H + 200} fill="#2b5866" opacity={0.6} />
          </g>
        ) : tipo === "pedras" ? (
          <g>
            {new Array(7).fill(0).map((_, i) => {
              const x = ((((random(`ppx${id}${i}`) * 2400 + desloc) % 2400) + 2400) % 2400) - 600;
              const y = H - 120 - random(`ppy${id}${i}`) * 260;
              const r = 40 + random(`ppr${id}${i}`) * 70;
              return <ellipse key={i} cx={x} cy={y} rx={r * 1.3} ry={r} fill={cor} />;
            })}
          </g>
        ) : (
          <g>
            {new Array(9).fill(0).map((_, i) => {
              const x = ((((random(`pdx${id}${i}`) * 2400 + desloc + f * 3) % 2400) + 2400) % 2400) - 600;
              const y = ((random(`pdy${id}${i}`) * H - f * (1 + random(`pdv${id}${i}`) * 2)) % H + H) % H;
              const r = 18 + random(`pdr${id}${i}`) * 40;
              return <circle key={i} cx={x} cy={y} r={r} fill="#cfefff" opacity={0.25} />;
            })}
          </g>
        )}
      </g>
    </svg>
  );
};
