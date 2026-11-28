import { random } from "remotion";
import { Boneco2D, PERFIL_BASE, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CONTORNO, LUCAS, type Design } from "../../estilo2d/personagens";
import { Academia, Anilha, CORES_ANILHA } from "./cenario";

/**
 * Supino em "3D falso": banco, suporte, barra e anilhas são projetados em perspectiva
 * com a câmera orbitando (yaw); o Lucas é 2D (billboard) deitado ao longo do eixo X.
 * Mundo: X ao longo do banco (cabeça em -X), Y pra baixo, Z profundidade (barra).
 */
const QUADRIL_Y = -396;
const OMBRO_Y = -360; // relativo ao quadril (perfil)
const BRACO = 170;
const ANTEBRACO = 158;
export const E = 0.72; // escala do Lucas deitado
const CENTRO_Y = 1300;
const PISO = 200; // Y do piso no mundo
const TOPO_BANCO = 70;

export type Camera3D = { yaw: number; zoom: number; x: number; y: number };

const rad = (d: number) => (d * Math.PI) / 180;

const proj = (yaw: number) => (X: number, Y: number, Z: number) => {
  const c = Math.cos(rad(yaw));
  const s = Math.sin(rad(yaw));
  const xr = X * c + Z * s;
  const depth = -X * s + Z * c;
  const p = 1900 / (1900 + depth);
  return { x: 540 + xr * p, y: CENTRO_Y + Y * p - depth * 0.2 * p, p, depth };
};

/** mão (perfil) em coordenadas locais do boneco, antes de deitar */
const maoLocal = (ombro: number, cotovelo: number): [number, number] => {
  const o: [number, number] = [8, QUADRIL_Y + OMBRO_Y];
  const a1 = rad(ombro);
  const c: [number, number] = [o[0] + Math.sin(a1) * BRACO, o[1] + Math.cos(a1) * BRACO];
  const a2 = rad(ombro + cotovelo);
  return [c[0] + Math.sin(a2) * (ANTEBRACO + 20), c[1] + Math.cos(a2) * (ANTEBRACO + 20)];
};
/** local (pré-rotação) → mundo (deitado: rotate(-90) e escala E) */
const deita = (x: number, y: number): [number, number] => [y * E, -x * E];

const Poligono: React.FC<{ pts: { x: number; y: number }[]; fill: string; stroke?: string }> = ({ pts, fill, stroke = CONTORNO }) => (
  <path d={`M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`} fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
);

export const SupinoOrbita: React.FC<{
  f: number; // frame em unidades de 30 fps (pode ser fracionário)
  cam: Camera3D;
  /** 0 = barra no peito, 1 = braços esticados */
  sobe: number;
  treme?: number;
  anilhas?: number;
  musculo?: number;
  rosto: Rosto;
  lucas?: boolean;
  escura?: number;
  /** barra apoiada no suporte (sem ninguém) */
  noSuporte?: boolean;
  extra?: React.ReactNode;
  d?: Design;
  /** 0..1: a última anilha (lado da frente) desliza pra dentro da barra */
  anilhaEntra?: number;
}> = ({ f, cam, sobe, treme = 0, anilhas = 0, musculo = 0, rosto, lucas = true, escura = 0, noSuporte, extra, d = LUCAS, anilhaEntra = 1 }) => {
  const P = proj(cam.yaw);
  const c = Math.cos(rad(cam.yaw));
  const t2 = Math.floor(f); // 2 frames de 60 fps = 1 unidade
  const tx = (random(`tr${t2}`) - 0.5) * treme;
  const ty = (random(`ty${t2}`) - 0.5) * treme;
  // braços: do peito (sobe 0) à extensão (sobe 1)
  const ombro = 22 + 68 * sobe + tx * 0.8;
  const cotovelo = 70 * (1 - sobe) + ty * 0.8;
  const [hx, hy] = maoLocal(ombro, cotovelo);
  const [lockX, lockY] = deita(...maoLocal(90, 0));
  let [gx, gy] = deita(hx, hy);
  if (noSuporte) [gx, gy] = [lockX, lockY - 40];
  const L = 430;
  // --- pose do Lucas deitado ---
  const pose: Pose = {
    ...PERFIL_BASE,
    x: 0,
    y: 0,
    escala: E,
    musculo,
    cabeca: -6,
    bracoD: { ombro, cotovelo },
    bracoE: { ombro: ombro - 4, cotovelo: cotovelo + 4 },
    maoD: "punho",
    maoE: "punho",
    peD: { dx: -260, dy: -200, rot: 0 },
    peE: { dx: -200, dy: -230, rot: 0 },
    estica: 1 + Math.sin(f * 0.2) * 0.008,
  };
  const anc = P(0, 0, 0);
  // --- banco (caixa) ---
  const bx0 = -1160 * E;
  const bx1 = -170 * E;
  const bz = 150;
  const topo = TOPO_BANCO;
  const base = topo + 62;
  const caixa = (y0: number, y1: number) => ({
    topo: [P(bx0, y0, -bz), P(bx1, y0, -bz), P(bx1, y0, bz), P(bx0, y0, bz)],
    frente: [P(bx0, y0, -bz), P(bx1, y0, -bz), P(bx1, y1, -bz), P(bx0, y1, -bz)],
    ponta: [P(bx1, y0, -bz), P(bx1, y0, bz), P(bx1, y1, bz), P(bx1, y1, -bz)],
  });
  const almofada = caixa(topo, base);
  const perna = (X: number, Z: number) => {
    const a = P(X, base, Z);
    const b = P(X, PISO, Z);
    return <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#3a3f50" strokeWidth={22 * a.p} strokeLinecap="round" />;
  };
  // --- suporte da barra (2 colunas no lado da cabeça) ---
  const colX = lockX - 30;
  const coluna = (Z: number) => {
    const a = P(colX, PISO, Z);
    const b = P(colX, lockY - 60, Z);
    const g = P(colX + 40, lockY - 40, Z);
    return (
      <g>
        <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#4a4f60" strokeWidth={30 * a.p} strokeLinecap="round" />
        <path d={`M ${b.x} ${b.y + 40 * b.p} L ${g.x} ${g.y}`} stroke="#5a6070" strokeWidth={16 * a.p} strokeLinecap="round" />
      </g>
    );
  };
  // --- barra + anilhas ---
  const pontoBarra = (Z: number) => P(gx, gy, Z);
  const segBarra = (z0: number, z1: number) => {
    const a = pontoBarra(z0);
    const b = pontoBarra(z1);
    return (
      <>
        <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={CONTORNO} strokeWidth={24 * a.p} strokeLinecap="round" />
        <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#c2c8d4" strokeWidth={14 * a.p} strokeLinecap="round" />
      </>
    );
  };
  const anilhasLado = (sinal: number) =>
    new Array(anilhas).fill(0).map((_, i) => {
      const ultima = sinal < 0 && i === anilhas - 1;
      const Z = sinal * (L - 70 - i * 30) + (ultima ? -(1 - anilhaEntra) * 380 : 0);
      const q = pontoBarra(Z);
      const r = (125 - i * 10) * q.p;
      return <Anilha key={`${sinal}${i}`} x={q.x} y={q.y} r={r} rx={Math.max(10 * q.p, r * Math.abs(c))} cor={CORES_ANILHA[i % 4]} />;
    });
  // ordem de profundidade: Z>0 fica atrás (mais longe)
  const sombra = P(-600 * E, PISO, 0);
  return (
    <g>
      <g transform={`translate(${-Math.sin(rad(cam.yaw)) * 420} 0)`}>
        <Academia escura={escura} camX={540} />
      </g>
      <ellipse cx={sombra.x} cy={sombra.y + 10} rx={520 * c + 120} ry={70} fill="#000" opacity={0.3} />
      {/* atrás */}
      {coluna(360)}
      {perna(bx0 + 40, bz - 20)}
      {perna(bx1 - 40, bz - 20)}
      {segBarra(0, L)}
      {anilhasLado(1)}
      {/* banco */}
      {perna(bx0 + 40, -bz + 20)}
      {perna(bx1 - 40, -bz + 20)}
      <Poligono pts={almofada.frente} fill="#1f2230" />
      <Poligono pts={almofada.ponta} fill="#262a3a" />
      <Poligono pts={almofada.topo} fill="#30354a" />
      {/* Lucas (2D, deitado) */}
      {lucas && !noSuporte ? (
        <g transform={`translate(${anc.x} ${anc.y}) scale(${c * anc.p} ${anc.p}) rotate(-90)`}>
          <Boneco2D id={`sup${d.nome}`} d={d} pose={pose} rosto={rosto} />
        </g>
      ) : null}
      {/* frente */}
      {segBarra(-L, 0)}
      {anilhasLado(-1)}
      {coluna(-360)}
      {extra}
    </g>
  );
};

/** posição de tela (antes da câmera) da cabeça e da barra — para efeitos */
export const pontosSupino = (yaw: number, sobe: number) => {
  const P = proj(yaw);
  const [hx, hy] = maoLocal(22 + 68 * sobe, 70 * (1 - sobe));
  const [gx, gy] = deita(hx, hy);
  const cabeca = P(...deita(4, QUADRIL_Y - 400 - 120), 0);
  return { barra: P(gx, gy, 0), barraFrente: P(gx, gy, -430), cabeca, ancora: P(0, 0, 0) };
};
