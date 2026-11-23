import type { Pose } from "./Boneco2D";
import { CONTORNO, type Design } from "./personagens";

/**
 * Personagem visto DE CIMA (planos aéreos / plongée total), derivado da pose de perfil:
 * pernas e pés pelo dx dos pés, braços pelo ângulo do ombro (projeção), altura do pulo afasta a sombra e aumenta o boneco.
 * Coordenadas: (x, z) no chão visto de cima; o personagem olha para +x (lado 1) ou −x (lado −1).
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
  const e = pose.escala * (1 + altura / 1800);
  const L = pose.lado;
  const proj = (graus: number) => Math.sin((graus * Math.PI) / 180); // quanto o braço vai para a frente visto de cima
  const braco = (lat: number, b: { ombro: number; cotovelo: number }) => {
    const frente = proj(b.ombro) * 170 + proj(b.ombro - b.cotovelo) * 150;
    return { x: frente, y: lat * (150 + Math.abs(Math.cos((b.ombro * Math.PI) / 180)) * 30) };
  };
  const bD = braco(1, pose.bracoD);
  const bE = braco(-1, pose.bracoE);
  const peD = { x: pose.peD.dx * 0.9, y: 46 };
  const peE = { x: pose.peE.dx * 0.9, y: -46 };
  const cabelo = d.cabelo === "cacheado";
  const sx = sombraLuz[0] * altura;
  const sz = sombraLuz[1] * altura;
  return (
    <g>
      {/* sombra no chão (afasta quando está no ar) */}
      <ellipse cx={pose.x + sx} cy={z + sz} rx={190 * pose.escala} ry={150 * pose.escala} fill="#000" opacity={Math.max(0.15, 0.45 - altura / 2500)} />
      <g transform={`translate(${pose.x} ${z}) scale(${e * L} ${e}) rotate(${-pose.inclina * 0.15})`}>
        {/* pernas + tênis */}
        {[peE, peD].map((p, i) => (
          <g key={i}>
            <path d={`M 0 ${p.y * 0.7} L ${p.x} ${p.y}`} stroke={CONTORNO} strokeWidth={70} strokeLinecap="round" />
            <path d={`M 0 ${p.y * 0.7} L ${p.x} ${p.y}`} stroke={d.calca} strokeWidth={56} strokeLinecap="round" />
            <ellipse cx={p.x + 30} cy={p.y} rx={54} ry={30} fill={d.tenis} stroke={CONTORNO} strokeWidth={7} />
          </g>
        ))}
        {/* braços */}
        {[bE, bD].map((b, i) => (
          <g key={i}>
            <path d={`M 0 ${b.y * 0.85} Q ${b.x * 0.5} ${b.y * 1.05} ${b.x} ${b.y}`} stroke={CONTORNO} strokeWidth={60} fill="none" strokeLinecap="round" />
            <path d={`M 0 ${b.y * 0.85} Q ${b.x * 0.5} ${b.y * 1.05} ${b.x} ${b.y}`} stroke={d.pele} strokeWidth={46} fill="none" strokeLinecap="round" />
            <circle cx={b.x} cy={b.y} r={30} fill={d.pele} stroke={CONTORNO} strokeWidth={7} />
          </g>
        ))}
        {espada ? <path d={`M ${bD.x} ${bD.y} L ${bD.x + 420} ${bD.y - 40}`} stroke={corEspada} strokeWidth={16} strokeLinecap="round" /> : null}
        {/* ombros (camisa) */}
        <ellipse cx={0} cy={0} rx={78} ry={160} fill={d.camisa} stroke={CONTORNO} strokeWidth={8} />
        <ellipse cx={-22} cy={0} rx={50} ry={140} fill={d.camisaSombra} opacity={0.55} />
        {/* cabeça: cabelo visto de cima */}
        {cabelo ? (
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
  );
};

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
