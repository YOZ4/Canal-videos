import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, posCabeca, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { DIEGO, LUCAS, type Design } from "../../estilo2d/personagens";

/** Ficha completa de um personagem: todas as vistas + todas as expressões (composições FichaLucas / FichaDiego) */

export const FICHA_W = 2400;
export const FICHA_H = 2870;

type Expr = [string, Partial<Rosto>];

const BASE_LUCAS: Rosto = ROSTO_BASE;
const BASE_DIEGO: Rosto = { ...ROSTO_BASE, olhos: 0.6, canto: 0.8, sorriso: 0.35, sobrancelha: 6 };

const EXPR: Expr[] = [
  ["NORMAL", {}],
  ["FELIZ", { olhos: 1, sorriso: 1, canto: 0, sobrancelha: -4, sobrancelhaY: 6, bochecha: 1 }],
  ["RINDO", { olhos: 0.12, sorriso: 1, boca: 0.8, canto: 0, sobrancelhaY: 10, bochecha: 1 }],
  ["FALANDO", { boca: 0.55, sorriso: 0.3, canto: 0 }],
  ["CONFIANTE", { olhos: 0.75, canto: 1, sorriso: 0.5, sobrancelha: 8, sobrancelhaY: 4 }],
  ["DEBOCHADO", { olhos: 0.5, canto: 1, sorriso: 0.5, sobrancelhaY: 16, olhar: [0.6, 0.4] }],
  ["PENSATIVO", { olhar: [0.8, -0.8], sorriso: 0, canto: 0.4, sobrancelha: -6, sobrancelhaY: 8 }],
  ["SÉRIO", { olhos: 0.9, sobrancelha: 10, sorriso: 0.1, canto: 0 }],
  ["BRAVO", { olhos: 0.85, sobrancelha: 22, sorriso: -0.4, canto: 0 }],
  ["FÚRIA", { olhos: 0.75, sobrancelha: 26, sorriso: -0.9, boca: 0.6, canto: 0 }],
  ["TRISTE", { olhos: 0.8, sobrancelha: -16, sobrancelhaY: 8, sorriso: -0.6, canto: 0, olhar: [0, 0.6] }],
  ["MEDO", { olhos: 1.25, sobrancelha: -18, sobrancelhaY: 16, sorriso: -1, boca: 0.25, canto: 0, olhar: [-0.4, 0] }],
  ["SURPRESO", { olhos: 1.3, sobrancelha: -6, sobrancelhaY: 18, sorriso: 0, boca: 0.75, canto: 0 }],
  ["CANSADO", { olhos: 0.35, sobrancelha: -8, sorriso: -0.2, canto: 0, olhar: [0, 0.5] }],
  ["ENVERGONHADO", { vergonha: 1, olhar: [-0.8, 0.5], sobrancelha: -10, sobrancelhaY: 8, sorriso: 0.25, canto: 0.3, olhos: 0.9, bochecha: 0 }],
  ["CHORANDO", { lagrimas: 1, olhos: 0.85, olhar: [0, 0.7], sobrancelha: -22, sobrancelhaY: 14, sorriso: -0.6, boca: 0.7, canto: 0, bochecha: 1 }],
  ["APAIXONADO", { coracao: 1, sorriso: 0.9, canto: 0, sobrancelhaY: 10, bochecha: 1, boca: 0 }],
  ["COM NOJO", { nojo: 1, olhos: 0.55, sobrancelha: 14, sobrancelhaY: 4, olhar: [0.6, 0], canto: 0 }],
  ["PÂNICO", { espiral: 1, suor: 1, sobrancelha: -20, sobrancelhaY: 16, sorriso: -0.6, boca: 0.7, canto: 0 }],
  ["FOME", { baba: 1, olhos: 1.25, pupila: 1.25, olhar: [0.5, 0.7], sobrancelha: -6, sobrancelhaY: 10, sorriso: 0.4, boca: 0.3, canto: 0 }],
  ["DORMINDO", { dormindo: 1, sobrancelha: -4, sorriso: 0.15, canto: 0, boca: 0 }],
  ["CHOCADO", { palido: 1, pupila: 0.4, olhos: 1.2, sobrancelha: -8, sobrancelhaY: 14, sorriso: -0.5, boca: 0.45, canto: 0, bochecha: 0 }],
  ["LEVE: CORADO", { vergonha: 0.5, sorriso: 0.5, canto: 0, olhar: [-0.4, 0.3], bochecha: 0 }],
  ["LEVE: MAREJADO", { lagrimas: 0.3, sobrancelha: -14, sobrancelhaY: 8, sorriso: -0.4, canto: 0 }],
  ["LEVE: SUANDO", { suor: 0.35, sobrancelha: -8, sobrancelhaY: 6, sorriso: 0.1, canto: 0.6 }],
];

const VISTAS: [string, Partial<Pose>][] = [
  ["FRENTE", { ...POSE_BASE }],
  ["3/4 ESQUERDA", { ...POSE_BASE, vira: -1 }],
  ["3/4 DIREITA", { ...POSE_BASE, vira: 1 }],
  ["LADO DIREITO", { ...PERFIL_BASE }],
  ["LADO ESQUERDO", { ...PERFIL_BASE, lado: -1 }],
  ["COSTAS", { ...POSE_BASE, vista: "costas" }],
];

const Rotulo: React.FC<{ x: number; y: number; t: string; tam?: number }> = ({ x, y, t, tam = 40 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={tam} fill="#fff" stroke="#1d1424" strokeWidth={tam * 0.16} paintOrder="stroke">
    {t}
  </text>
);

const Ficha: React.FC<{ d: Design; base: Rosto; cor: string; fundo: string; extra?: Partial<Pose> }> = ({ d, base, cor, fundo, extra = {} }) => {
  const colW = FICHA_W / VISTAS.length;
  const chao = 1000;
  // expressões: 7 por linha, cabeça recortada
  const porLinha = 7;
  const cw = 320;
  const ch = 390;
  const gx = (FICHA_W - porLinha * cw - (porLinha - 1) * 14) / 2;
  return (
    <AbsoluteFill style={{ background: fundo }}>
      <svg width={FICHA_W} height={FICHA_H} viewBox={`0 0 ${FICHA_W} ${FICHA_H}`}>
        <text x={70} y={120} fontFamily="Fredoka" fontWeight={700} fontSize={110} fill={cor} stroke="#1d1424" strokeWidth={16} paintOrder="stroke">
          {d.nome.toUpperCase()}
        </text>
        <text x={70 + d.nome.length * 66 + 40} y={112} fontFamily="Fredoka" fontWeight={700} fontSize={50} fill="#fff" opacity={0.85}>
          vistas e expressões
        </text>
        {/* vistas */}
        <rect x={30} y={170} width={FICHA_W - 60} height={chao - 100} rx={36} fill="#fff" opacity={0.08} />
        {VISTAS.map(([nome, p], i) => {
          const x = colW * i + colW / 2;
          const pose: Pose = { ...POSE_BASE, ...p, ...(p.vista === "frente" ? extra : {}), x, y: chao - 80, escala: 0.6 } as Pose;
          return (
            <g key={nome}>
              <ellipse cx={x} cy={chao - 76} rx={120} ry={18} fill="#000" opacity={0.18} />
              <Boneco2D id={`v${d.nome}${i}`} d={d} pose={pose} rosto={base} />
              <Rotulo x={x} y={chao + 0} t={nome} tam={42} />
            </g>
          );
        })}
        {/* expressões */}
        {EXPR.map(([nome, r], i) => {
          const col = i % porLinha;
          const lin = Math.floor(i / porLinha);
          const x = gx + col * (cw + 14);
          const y = 1080 + lin * (ch + 50);
          const pose: Pose = { ...POSE_BASE, x: 0, y: 0, escala: 1 };
          const [hx, hy] = posCabeca(pose);
          const rosto: Rosto = { ...base, ...r };
          return (
            <g key={nome}>
              <rect x={x} y={y} width={cw} height={ch} rx={28} fill="#fff" opacity={0.92} stroke="#1d1424" strokeWidth={6} />
              <svg x={x + 6} y={y + 6} width={cw - 12} height={ch - 12} viewBox={`${hx - 185} ${hy - 225} 370 460`}>
                <Boneco2D id={`e${d.nome}${i}`} d={d} pose={pose} rosto={rosto} />
              </svg>
              <Rotulo x={x + cw / 2} y={y + ch + 42} t={nome} tam={38} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const FichaLucas: React.FC = () => <Ficha d={LUCAS} base={BASE_LUCAS} cor="#ffd23f" fundo="linear-gradient(180deg,#8b82c4,#4c3f7c)" />;
export const FichaDiego: React.FC = () => <Ficha d={DIEGO} base={BASE_DIEGO} cor="#4fd884" fundo="linear-gradient(180deg,#6fa58a,#2f4f45)" extra={{ cruzado: 1 }} />;
