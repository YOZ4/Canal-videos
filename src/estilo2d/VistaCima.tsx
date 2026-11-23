import type { Pose } from "./Boneco2D";
import { CONTORNO, type Design } from "./personagens";

/**
 * Personagem visto DE CIMA (planos aéreos / plongée total), derivado da pose de perfil:
 * pernas e pés pelo dx dos pés, braços pelo ângulo do ombro (projeção), altura do pulo afasta a sombra e aumenta o boneco.
 * Coordenadas: (x, z) no chão visto de cima; o personagem olha para +x (lado 1) ou −x (lado −1).
 * Anima a partir da MESMA pose de perfil: pernas/pés (dx, pé levantado cresce), braços (ombro), tronco inclinado
 * (cabeça vai à frente dos pés — corrida ninja/arrancada leem bem), mortal (gira encurta o corpo), cabelo (balanço).
 */
export const BonecoCima: React.FC<{ d: Design; pose: Pose; z?: number; altura?: number; espada?: boolean; corEspada?: string; sombraLuz?: [number, number] }> = ({
  d,
  pose,
  z = 0,
  altura = 0,
  espada,
  corEspada = "#bff6ff",
  sombraLuz = [0.35, 0.2],
}) => {
  const e = pose.escala * (1 + altura / 1800) * Math.sqrt(pose.estica);
  const L = pose.lado;
  const rad = (g: number) => (g * Math.PI) / 180;
  // inclinação do tronco: visto de cima, a cabeça e os ombros vão PARA A FRENTE dos pés
  const frenteTronco = Math.sin(rad(pose.inclina)) * 260;
  const frenteCabeca = Math.sin(rad(pose.inclina + pose.cabeca * 0.5)) * 330;
  // mortal (gira) visto de cima: o corpo "encurta" na direção do giro e a cabeça passa para o outro lado
  const giro = Math.cos(rad(pose.gira));
  const proj = (g: number) => Math.sin(rad(g));
  const braco = (lat: number, b: { ombro: number; cotovelo: number }) => {
    const frente = proj(b.ombro) * 170 + proj(b.ombro - b.cotovelo) * 150;
    return { x: frenteTronco + frente, y: lat * (150 + Math.abs(Math.cos(rad(b.ombro))) * 30) };
  };
  const bD = braco(1, pose.bracoD);
  const bE = braco(-1, pose.bracoE);
  // pé levantado fica mais perto da câmera (maior)
  const pe = (p: { dx: number; dy: number }, lat: number) => ({ x: p.dx * 0.9, y: lat * 46, perto: 1 + Math.max(0, -p.dy) / 500 });
  const peD = pe(pose.peD, 1);
  const peE = pe(pose.peE, -1);
  const cacheado = d.cabelo === "cacheado";
  const sx = sombraLuz[0] * altura;
  const sz = sombraLuz[1] * altura;
  return (
    <g>
      {/* sombra no chão (afasta e clareia quando está no ar) */}
      <ellipse cx={pose.x + sx} cy={z + sz} rx={190 * pose.escala} ry={150 * pose.escala} fill="#000" opacity={Math.max(0.15, 0.45 - altura / 2500)} />
      <g transform={`translate(${pose.x} ${z}) scale(${e * L * (0.35 + 0.65 * Math.abs(giro))} ${e})`}>
        {/* pernas + tênis */}
        {[peE, peD].map((p, i) => (
          <g key={i}>
            <path d={`M ${frenteTronco * 0.3} ${p.y * 0.7} L ${p.x} ${p.y}`} stroke={CONTORNO} strokeWidth={70} strokeLinecap="round" />
            <path d={`M ${frenteTronco * 0.3} ${p.y * 0.7} L ${p.x} ${p.y}`} stroke={d.calca} strokeWidth={56} strokeLinecap="round" />
            <ellipse cx={p.x + 30} cy={p.y} rx={54 * p.perto} ry={30 * p.perto} fill={d.tenis} stroke={CONTORNO} strokeWidth={7} />
          </g>
        ))}
        {/* braços */}
        {[bE, bD].map((b, i) => (
          <g key={i}>
            <path d={`M ${frenteTronco} ${b.y * 0.85} Q ${(frenteTronco + b.x) * 0.5} ${b.y * 1.05} ${b.x} ${b.y}`} stroke={CONTORNO} strokeWidth={60} fill="none" strokeLinecap="round" />
            <path d={`M ${frenteTronco} ${b.y * 0.85} Q ${(frenteTronco + b.x) * 0.5} ${b.y * 1.05} ${b.x} ${b.y}`} stroke={d.pele} strokeWidth={46} fill="none" strokeLinecap="round" />
            <circle cx={b.x} cy={b.y} r={30} fill={d.pele} stroke={CONTORNO} strokeWidth={7} />
          </g>
        ))}
        {espada ? <path d={`M ${bD.x} ${bD.y} L ${bD.x + 420 * Math.cos(rad(pose.bracoD.ombro - 90))} ${bD.y - 40}`} stroke={corEspada} strokeWidth={16} strokeLinecap="round" /> : null}
        {/* ombros (camisa) */}
        <ellipse cx={frenteTronco} cy={0} rx={78} ry={160} fill={d.camisa} stroke={CONTORNO} strokeWidth={8} />
        <ellipse cx={frenteTronco - 22} cy={0} rx={50} ry={140} fill={d.camisaSombra} opacity={0.55} />
        {/* cabeça: cabelo visto de cima (balança com pose.cabelo) */}
        <g transform={`translate(${frenteCabeca * (giro >= 0 ? 1 : -1)} 0) rotate(${pose.cabelo * 1.5})`}>
          {cacheado ? (
            <g>
              {new Array(11).fill(0).map((_, i) => {
                const a = (i / 11) * Math.PI * 2;
                return <circle key={i} cx={Math.cos(a) * 70} cy={Math.sin(a) * 70} r={44} fill="#17121a" stroke={CONTORNO} strokeWidth={6} />;
              })}
              <circle cx={0} cy={0} r={84} fill="#17121a" />
              <circle cx={-18} cy={-20} r={30} fill="#2c2433" />
            </g>
          ) : (
            <g>
              <circle cx={0} cy={0} r={96} fill={d.pele} stroke={CONTORNO} strokeWidth={8} />
              <path d="M -96 0 Q -80 -96 20 -92 Q 150 -70 160 0 Q 150 70 20 92 Q -80 96 -96 0 Z" fill="#8a5a33" stroke={CONTORNO} strokeWidth={8} />
              <path d="M 10 -60 Q 90 -40 150 0 Q 90 40 10 60" fill="none" stroke="#5e3b20" strokeWidth={7} />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

/** rastro de velocidade visto de cima (riscos atrás do personagem, no sentido do movimento) */
export const RastroCima: React.FC<{ x: number; z: number; dir: 1 | -1; forca: number; f: number; cor?: string }> = ({ x, z, dir, forca, f, cor = "#dff7ff" }) => {
  if (forca <= 0.01) return null;
  const q = Math.floor(f / 2);
  return (
    <g opacity={forca} stroke={cor} strokeLinecap="round">
      {new Array(9).fill(0).map((_, i) => {
        const lat = -170 + i * 42 + (((i * 37 + q * 13) % 20) - 10);
        const ini = x - dir * (120 + ((i * 53 + q * 29) % 90));
        const len = 260 + ((i * 71 + q * 41) % 360);
        return <line key={i} x1={ini} y1={z + lat} x2={ini - dir * len} y2={z + lat} strokeWidth={6 + (i % 3) * 4} />;
      })}
    </g>
  );
};

/**
 * Plano aéreo pronto: chão de cima + câmera (x, z, zoom, rot). Gire devagar o `rot` num plano de abertura,
 * ou acompanhe uma arrancada com `x`. Os filhos são desenhados em coordenadas (x, z) do chão.
 */
export const PlanoCima: React.FC<{ x: number; z?: number; zoom: number; rot: number; children: React.ReactNode }> = ({ x, z = 0, zoom, rot, children }) => (
  <svg width={1080} height={1920}>
    <g transform={`translate(540 960) rotate(${rot}) scale(${zoom}) translate(${-x} ${-z})`}>
      <ChaoCima cx={x} cz={z} />
      {children}
    </g>
  </svg>
);

/** chão visto de cima (lajotas) */
export const ChaoCima: React.FC<{ cx: number; cz: number }> = ({ cx, cz }) => (
  <g>
    <rect x={cx - 3000} y={cz - 3000} width={6000} height={6000} fill="#14232c" />
    <g stroke="#24404c" strokeWidth={6}>
      {new Array(40).fill(0).map((_, i) => {
        const p = Math.floor((cx - 3000) / 240) * 240 + i * 240;
        return <line key={`v${i}`} x1={p} y1={cz - 3000} x2={p} y2={cz + 3000} />;
      })}
      {new Array(40).fill(0).map((_, i) => {
        const p = Math.floor((cz - 3000) / 240) * 240 + i * 240;
        return <line key={`h${i}`} x1={cx - 3000} y1={p} x2={cx + 3000} y2={p} />;
      })}
    </g>
  </g>
);

/** rachadura vista de cima (radial, cresce em 3 frames) */
export const RachaCima: React.FC<{ x: number; z: number; f: number; de: number; tamanho?: number }> = ({ x, z, f, de, tamanho = 1 }) => {
  const t = f - de;
  if (t < 0) return null;
  const s = Math.min(1, t / 3) * tamanho;
  return (
    <g transform={`translate(${x} ${z}) scale(${s})`} stroke="#05070a" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + ((i * 37) % 7) * 0.05;
        const r1 = 120 + ((i * 53) % 60);
        const r2 = 260 + ((i * 71) % 140);
        return <path key={i} d={`M ${Math.cos(a) * 60} ${Math.sin(a) * 60} L ${Math.cos(a) * r1} ${Math.sin(a) * r1} L ${Math.cos(a + 0.25) * r2} ${Math.sin(a + 0.25) * r2}`} />;
      })}
      <circle r={80} />
    </g>
  );
};
