import { random } from "remotion";

/**
 * Cenário 2D "praça ao pôr do sol", em camadas com parallax.
 * Mundo: 3200 x 1920 px. A câmera (Camera2D) informa camX para o parallax.
 */

export const MUNDO_W = 3200;
export const CHAO_Y = 1500;

const Nuvem: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff4ea" opacity={0.9}>
    <ellipse cx={0} cy={0} rx={90} ry={34} />
    <circle cx={-40} cy={-20} r={38} />
    <circle cx={15} cy={-36} r={48} />
    <circle cx={60} cy={-14} r={34} />
  </g>
);

const Predio: React.FC<{ x: number; w: number; h: number; cor: string; janela: string; seed: number }> = ({
  x,
  w,
  h,
  cor,
  janela,
  seed,
}) => {
  const cols = Math.max(2, Math.floor(w / 70));
  const rows = Math.max(2, Math.floor(h / 90));
  return (
    <g>
      <rect x={x} y={CHAO_Y - 160 - h} width={w} height={h + 160} fill={cor} />
      <rect x={x - 6} y={CHAO_Y - 160 - h - 14} width={w + 12} height={18} fill={cor} style={{ filter: "brightness(0.92)" }} />
      {new Array(rows).fill(0).map((_, r) =>
        new Array(cols).fill(0).map((__, c) =>
          random(`j${seed}-${r}-${c}`) > 0.35 ? (
            <rect
              key={`${r}-${c}`}
              x={x + 22 + c * ((w - 44) / cols)}
              y={CHAO_Y - 130 - h + r * 90}
              width={(w - 44) / cols - 22}
              height={46}
              rx={4}
              fill={janela}
              opacity={0.8}
            />
          ) : null,
        ),
      )}
    </g>
  );
};

const Arvore: React.FC<{ x: number; s: number; cor?: string }> = ({ x, s, cor = "#57b97a" }) => (
  <g transform={`translate(${x} ${CHAO_Y - 150}) scale(${s})`}>
    <rect x={-14} y={-160} width={28} height={170} fill="#6e4b3a" />
    <circle cx={0} cy={-250} r={120} fill={cor} />
    <circle cx={-80} cy={-190} r={80} fill={cor} />
    <circle cx={85} cy={-195} r={85} fill={cor} />
    <circle cx={-30} cy={-300} r={70} fill="#6fcd8f" opacity={0.6} />
  </g>
);

/** camadas: fator 0 = fixo no céu, 1 = anda junto com o chão */
const Camada: React.FC<{ camX: number; fator: number; children: React.ReactNode }> = ({ camX, fator, children }) => (
  <g transform={`translate(${camX * (1 - fator)} 0)`}>{children}</g>
);

export const Praca: React.FC<{ camX: number }> = ({ camX }) => {
  return (
    <g>
      <defs>
        <linearGradient id="ceu" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f39a63" />
          <stop offset="0.55" stopColor="#f7c08a" />
          <stop offset="0.8" stopColor="#fbe0b5" />
        </linearGradient>
      </defs>
      <rect x={-2000} y={-1000} width={MUNDO_W + 4000} height={4000} fill="url(#ceu)" />

      <Camada camX={camX} fator={0.08}>
        <circle cx={1500} cy={1080} r={150} fill="#ffe7a8" opacity={0.9} />
        {[[200, 520, 1.1], [900, 380, 0.8], [1500, 600, 1.3], [2300, 450, 1], [2900, 560, 0.9]].map(([x, y, s], i) => (
          <Nuvem key={i} x={x} y={y} s={s} />
        ))}
      </Camada>

      <Camada camX={camX} fator={0.25}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <Predio key={i} x={-300 + i * 300 + random(`px${i}`) * 60} w={200 + random(`pw${i}`) * 80} h={200 + random(`ph${i}`) * 260} cor="#b7a2d8" janela="#d8c8ee" seed={i} />
        ))}
      </Camada>

      <Camada camX={camX} fator={0.5}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Predio key={i} x={-200 + i * 420 + random(`qx${i}`) * 80} w={220 + random(`qw${i}`) * 90} h={300 + random(`qh${i}`) * 300} cor="#f1d4bd" janela="#f8e7d6" seed={100 + i} />
        ))}
        {[150, 820, 1450, 2100, 2750, 3300].map((x, i) => (
          <Arvore key={i} x={x} s={0.9 + random(`ar${i}`) * 0.3} cor="#4fae72" />
        ))}
      </Camada>

      {/* grade verde + grama + calçada (anda junto com os personagens) */}
      <g>
        <rect x={-2000} y={CHAO_Y - 150} width={MUNDO_W + 4000} height={150} fill="#4ea36a" />
        {new Array(80).fill(0).map((_, i) => (
          <rect key={i} x={-2000 + i * 120} y={CHAO_Y - 260} width={12} height={120} fill="#2f7d55" />
        ))}
        <rect x={-2000} y={CHAO_Y - 268} width={MUNDO_W + 4000} height={16} fill="#2f7d55" />
        <rect x={-2000} y={CHAO_Y - 200} width={MUNDO_W + 4000} height={10} fill="#2f7d55" />
        <rect x={-2000} y={CHAO_Y - 20} width={MUNDO_W + 4000} height={1200} fill="#34323f" />
        <rect x={-2000} y={CHAO_Y - 26} width={MUNDO_W + 4000} height={14} fill="#55515f" />
      </g>
    </g>
  );
};

/** Quarto (cena interna). Coordenadas de tela 1080x1920; chão em CHAO_Y. */
export const Quarto: React.FC<{ manha?: number }> = ({ manha = 1 }) => (
  <g>
    <rect x={-600} y={-600} width={2400} height={3200} fill="#8fb7c9" />
    {/* faixa de parede inferior */}
    <rect x={-600} y={CHAO_Y - 420} width={2400} height={420} fill="#7aa3b8" />
    <rect x={-600} y={CHAO_Y - 432} width={2400} height={16} fill="#e9eef0" />
    {/* janela */}
    <g transform="translate(700 380)">
      <rect x={-20} y={-20} width={340} height={440} rx={14} fill="#e9eef0" />
      <rect x={0} y={0} width={300} height={400} fill={manha > 0.5 ? "#ffd59a" : "#2c2f5e"} />
      <circle cx={210} cy={300} r={70} fill="#fff1c1" opacity={manha} />
      <rect x={140} y={0} width={20} height={400} fill="#e9eef0" />
      <rect x={0} y={190} width={300} height={20} fill="#e9eef0" />
      {/* cortina */}
      <path d="M -40 -30 Q 30 200 -10 450 L -70 450 L -70 -30 Z" fill="#e5735f" />
      <path d="M 340 -30 Q 270 200 310 450 L 370 450 L 370 -30 Z" fill="#e5735f" />
    </g>
    {/* luz da janela no chão */}
    <path d={`M 690 820 L 1010 820 L 1200 ${CHAO_Y + 300} L 500 ${CHAO_Y + 300} Z`} fill="#fff3d6" opacity={0.12 * manha} />
    {/* pôster */}
    <g transform="translate(150 520) rotate(-4)">
      <rect x={0} y={0} width={210} height={290} rx={8} fill="#f2c94c" stroke="#1d1424" strokeWidth={6} />
      <circle cx={105} cy={120} r={60} fill="#e5735f" />
      <path d="M 70 200 L 140 200" stroke="#1d1424" strokeWidth={10} strokeLinecap="round" />
      <path d="M 55 235 L 155 235" stroke="#1d1424" strokeWidth={10} strokeLinecap="round" />
    </g>
    {/* cama */}
    <g transform={`translate(-60 ${CHAO_Y - 60})`}>
      <rect x={-200} y={-320} width={40} height={340} rx={12} fill="#7c5236" />
      <rect x={-200} y={-150} width={520} height={130} rx={20} fill="#9a6a45" />
      <rect x={-180} y={-210} width={500} height={90} rx={30} fill="#f3f0ea" />
      <rect x={-170} y={-245} width={150} height={60} rx={26} fill="#ffffff" stroke="#d9d5cc" strokeWidth={4} />
      <path d="M -30 -220 Q 150 -260 320 -200 L 320 -120 L -30 -120 Z" fill="#5a8fd8" />
    </g>
    {/* piso */}
    <rect x={-600} y={CHAO_Y - 20} width={2400} height={1200} fill="#c98f5a" />
    {new Array(10).fill(0).map((_, i) => (
      <rect key={i} x={-600} y={CHAO_Y + 40 + i * 70} width={2400} height={5} fill="#b07a48" />
    ))}
    {/* tapete */}
    <ellipse cx={540} cy={CHAO_Y + 40} rx={340} ry={70} fill="#e5735f" opacity={0.9} />
  </g>
);

/** Cozinha (cena interna). Chão em CHAO_Y; ocupa x -600..1700. */
export const Cozinha: React.FC = () => (
  <g>
    <rect x={-600} y={-600} width={2400} height={3200} fill="#f3e3c3" />
    {/* azulejos */}
    {new Array(14).fill(0).map((_, i) =>
      new Array(6).fill(0).map((__, j) => (
        <rect key={`${i}-${j}`} x={-560 + i * 170} y={780 + j * 100} width={160} height={90} rx={6} fill="#e9d3a9" />
      )),
    )}
    {/* armários de cima */}
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${-200 + i * 300} 260)`}>
        <rect width={280} height={360} rx={14} fill="#5aa6a0" stroke="#1d1424" strokeWidth={6} />
        <circle cx={i % 2 ? 40 : 240} cy={300} r={12} fill="#f1e0b0" stroke="#1d1424" strokeWidth={4} />
      </g>
    ))}
    {/* geladeira */}
    <g transform="translate(1180 520)">
      <rect width={360} height={CHAO_Y - 520} rx={26} fill="#e9eef0" stroke="#1d1424" strokeWidth={7} />
      <line x1={0} x2={360} y1={330} y2={330} stroke="#1d1424" strokeWidth={6} />
      <rect x={300} y={120} width={18} height={150} rx={9} fill="#9aa4ad" />
      <rect x={300} y={400} width={18} height={200} rx={9} fill="#9aa4ad" />
      <rect x={60} y={60} width={90} height={110} fill="#f4c531" stroke="#1d1424" strokeWidth={4} transform="rotate(-6 100 110)" />
    </g>
    {/* bancada */}
    <rect x={-600} y={CHAO_Y - 420} width={1760} height={420} fill="#5aa6a0" stroke="#1d1424" strokeWidth={6} />
    <rect x={-620} y={CHAO_Y - 450} width={1800} height={40} rx={10} fill="#e7e2d6" stroke="#1d1424" strokeWidth={6} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-560 + i * 340} y={CHAO_Y - 380} width={300} height={340} rx={10} fill="none" stroke="#1d1424" strokeWidth={5} opacity={0.5} />
    ))}
    {/* piso */}
    <rect x={-600} y={CHAO_Y - 20} width={2400} height={1200} fill="#d9c7a7" />
    {new Array(16).fill(0).map((_, i) => (
      <rect key={i} x={-600 + i * 150} y={CHAO_Y - 20} width={6} height={1200} fill="#c7b38f" />
    ))}
  </g>
);

/** Rua à noite (externa). Chão em CHAO_Y; ocupa x -600..2600. */
export const RuaNoite: React.FC<{ camX?: number }> = ({ camX = 0 }) => (
  <g>
    <defs>
      <linearGradient id="ceuNoite" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#141633" />
        <stop offset="1" stopColor="#3a2e63" />
      </linearGradient>
    </defs>
    <rect x={-2000} y={-1000} width={6000} height={4000} fill="url(#ceuNoite)" />
    <g transform={`translate(${camX * 0.9} 0)`}>
      <circle cx={900} cy={420} r={90} fill="#f6f1d6" />
      {new Array(40).fill(0).map((_, i) => (
        <circle key={i} cx={-600 + random(`e${i}`) * 3200} cy={100 + random(`ey${i}`) * 700} r={2 + random(`er${i}`) * 3} fill="#fff" opacity={0.8} />
      ))}
    </g>
    <g transform={`translate(${camX * 0.4} 0)`}>
      {new Array(12).fill(0).map((_, i) => (
        <Predio key={i} x={-600 + i * 300} w={240} h={260 + random(`rn${i}`) * 380} cor="#272449" janela="#ffd36b" seed={300 + i} />
      ))}
    </g>
    {/* postes */}
    {[-200, 700, 1600, 2500].map((x, i) => (
      <g key={i}>
        <path d={`M ${x - 260} ${CHAO_Y} L ${x + 260} ${CHAO_Y} L ${x + 70} ${CHAO_Y - 720} L ${x - 70} ${CHAO_Y - 720} Z`} fill="#ffe9a8" opacity={0.12} />
        <rect x={x - 10} y={CHAO_Y - 760} width={20} height={760} fill="#1d1d2c" />
        <rect x={x - 50} y={CHAO_Y - 780} width={100} height={30} rx={10} fill="#1d1d2c" />
        <ellipse cx={x} cy={CHAO_Y - 745} rx={40} ry={12} fill="#ffe9a8" />
      </g>
    ))}
    <rect x={-2000} y={CHAO_Y - 20} width={6000} height={1200} fill="#26243a" />
    <rect x={-2000} y={CHAO_Y - 26} width={6000} height={14} fill="#3b3856" />
    {new Array(30).fill(0).map((_, i) => (
      <rect key={i} x={-2000 + i * 220} y={CHAO_Y + 210} width={120} height={14} rx={7} fill="#e8d36b" opacity={0.8} />
    ))}
  </g>
);
