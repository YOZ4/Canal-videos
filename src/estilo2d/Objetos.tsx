import { CONTORNO } from "./personagens";

/** Objetos para colocar na mão dos personagens ou no cenário. Centro em (0,0). */

export const Hamburguer: React.FC<{ escala?: number }> = ({ escala = 1 }) => (
  <g transform={`scale(${escala})`}>
    <path d="M -70 -6 Q -70 -70 0 -72 Q 70 -70 70 -6 Z" fill="#e8a24a" stroke={CONTORNO} strokeWidth={6} />
    {[[-30, -46], [0, -56], [28, -44], [-10, -30], [40, -24]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={6} ry={3} fill="#fff3d1" />
    ))}
    <path d="M -76 -6 Q -60 8 -40 -4 Q -20 10 0 -4 Q 20 10 40 -4 Q 60 8 76 -6 L 76 4 L -76 4 Z" fill="#6fbf4a" stroke={CONTORNO} strokeWidth={5} />
    <rect x={-74} y={2} width={148} height={10} fill="#f4c531" stroke={CONTORNO} strokeWidth={4} />
    <rect x={-72} y={12} width={144} height={24} rx={10} fill="#7a3f22" stroke={CONTORNO} strokeWidth={6} />
    <path d="M -70 36 L 70 36 Q 70 60 0 62 Q -70 60 -70 36 Z" fill="#e8a24a" stroke={CONTORNO} strokeWidth={6} />
  </g>
);

export const Celular: React.FC<{ escala?: number; tela?: string }> = ({ escala = 1, tela = "#4aa3ff" }) => (
  <g transform={`scale(${escala})`}>
    <rect x={-46} y={-90} width={92} height={180} rx={16} fill="#22202c" stroke={CONTORNO} strokeWidth={6} />
    <rect x={-38} y={-76} width={76} height={150} rx={8} fill={tela} />
    <rect x={-14} y={-86} width={28} height={6} rx={3} fill="#4a4758" />
  </g>
);

export const Coxinha: React.FC<{ escala?: number }> = ({ escala = 1 }) => (
  <g transform={`scale(${escala})`}>
    <path d="M 0 -70 Q 20 -40 52 10 Q 64 50 0 54 Q -64 50 -52 10 Q -20 -40 0 -70 Z" fill="#e39a3f" stroke={CONTORNO} strokeWidth={6} />
    <path d="M -30 0 Q -20 -20 -8 -36" stroke="#f6c27a" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

/** Espada (katana genérica). Cabo na mão (0,0); lâmina aponta pra +y. `brilho` 0..1 = lâmina energizada. */
export const Espada: React.FC<{ escala?: number; brilho?: number; cor?: string }> = ({ escala = 1, brilho = 0, cor = "#7fd3ff" }) => (
  <g transform={`scale(${escala})`}>
    {brilho > 0 ? (
      <>
        <defs>
          <filter id="espadaBrilho" x="-200%" y="-50%" width="500%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <path d="M -12 40 L 12 40 L 8 380 L 0 410 L -8 380 Z" fill={cor} opacity={0.9 * brilho} filter="url(#espadaBrilho)" transform="scale(1.6 1.02)" />
      </>
    ) : null}
    {/* cabo */}
    <rect x={-11} y={-60} width={22} height={86} rx={6} fill="#1f3b2c" stroke={CONTORNO} strokeWidth={5} />
    {[-40, -20, 0].map((y) => (
      <path key={y} d={`M -11 ${y} L 11 ${y + 12}`} stroke="#3d6e52" strokeWidth={4} />
    ))}
    {/* guarda */}
    <ellipse cx={0} cy={32} rx={28} ry={10} fill="#c9a44a" stroke={CONTORNO} strokeWidth={5} />
    {/* lâmina */}
    <path d="M -10 40 L 10 40 L 8 380 L 0 410 L -8 380 Z" fill="#e8eef3" stroke={CONTORNO} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 3 50 L 3 380" stroke={brilho > 0 ? "#ffffff" : "#b6c3cc"} strokeWidth={4} />
  </g>
);

/**
 * Copo d'água (vista lateral). Base em (0,0), altura ~300.
 * nivel: 0..1 dentro do copo; domo: 0..1 água acima da borda; transborda: 0..1 escorrendo.
 */
export const Copo: React.FC<{ escala?: number; nivel?: number; domo?: number; transborda?: number; folha?: boolean; folhaY?: number; f?: number }> = ({
  escala = 1,
  nivel = 0.92,
  domo = 0,
  transborda = 0,
  folha = true,
  folhaY = 0,
  f = 0,
}) => {
  const topo = -300;
  const aguaY = topo + (1 - nivel) * 280;
  const domoH = 46 * domo;
  return (
    <g transform={`scale(${escala})`}>
      <defs>
        <clipPath id="copoDentro">
          <path d="M -108 -296 L 108 -296 L 92 -6 L -92 -6 Z" />
        </clipPath>
      </defs>
      {/* água escorrendo pelos lados */}
      {transborda > 0 ? (
        <g fill="#6cc4ff" stroke={CONTORNO} strokeWidth={5}>
          {[-1, 1].map((s) => (
            <path key={s} d={`M ${s * 106} -300 Q ${s * 124} ${-300 + 150 * transborda} ${s * 112} ${-300 + 290 * transborda} L ${s * 96} ${-300 + 290 * transborda} Q ${s * 104} ${-300 + 140 * transborda} ${s * 96} -300 Z`} />
          ))}
          <ellipse cx={0} cy={4} rx={150 + 120 * transborda} ry={14 + 8 * transborda} opacity={transborda} />
        </g>
      ) : null}
      <g clipPath="url(#copoDentro)">
        <rect x={-120} y={aguaY} width={240} height={320} fill="#6cc4ff" />
        <path d={`M -120 ${aguaY} Q 0 ${aguaY + 8 + Math.sin(f * 0.3) * 3} 120 ${aguaY}`} fill="#9ad8ff" />
      </g>
      {/* domo acima da borda (tensão superficial) */}
      {domo > 0 ? <path d={`M -106 ${topo} Q 0 ${topo - domoH * 2} 106 ${topo} Z`} fill="#6cc4ff" stroke="#3a9ad8" strokeWidth={4} /> : null}
      {/* vidro */}
      <path d="M -112 -300 L 112 -300 L 94 0 L -94 0 Z" fill="#ffffff" fillOpacity={0.18} stroke={CONTORNO} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -80 -270 L -68 -40" stroke="#ffffff" strokeWidth={10} opacity={0.6} strokeLinecap="round" />
      {folha ? (
        <g transform={`translate(10 ${topo - 6 - domoH * 1.6 + folhaY}) rotate(${-8 + Math.sin(f * 0.15) * 3})`}>
          <path d="M -70 0 Q 0 -40 70 0 Q 0 30 -70 0 Z" fill="#5fb84a" stroke={CONTORNO} strokeWidth={5} />
          <path d="M -60 0 L 66 0" stroke="#3d8a2e" strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

export const Garrafa: React.FC<{ escala?: number }> = ({ escala = 1 }) => (
  <g transform={`scale(${escala})`}>
    <rect x={-34} y={-10} width={68} height={170} rx={20} fill="#9fdcff" fillOpacity={0.85} stroke={CONTORNO} strokeWidth={6} />
    <rect x={-18} y={-44} width={36} height={40} rx={8} fill="#2f6fd6" stroke={CONTORNO} strokeWidth={6} />
    <rect x={-34} y={50} width={68} height={50} fill="#ffffff" opacity={0.8} />
  </g>
);

export const Coracao: React.FC<{ escala?: number; cor?: string }> = ({ escala = 1, cor = "#e8343f" }) => (
  <g transform={`scale(${escala})`}>
    <path d="M 0 60 C -120 -10 -90 -110 -10 -70 Q 0 -64 0 -50 Q 0 -64 10 -70 C 90 -110 120 -10 0 60 Z" fill={cor} stroke={CONTORNO} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -60 -50 Q -70 -20 -50 0" stroke="#ffffff" strokeWidth={10} opacity={0.5} fill="none" strokeLinecap="round" />
  </g>
);

export const Pulmoes: React.FC<{ escala?: number; ar?: number }> = ({ escala = 1, ar = 0.5 }) => {
  const s = 0.85 + ar * 0.3;
  return (
    <g transform={`scale(${escala})`}>
      <path d="M 0 -150 L 0 -40 M 0 -40 L -40 0 M 0 -40 L 40 0" stroke="#d07a8a" strokeWidth={22} strokeLinecap="round" fill="none" />
      {[-1, 1].map((l) => (
        <path
          key={l}
          transform={`translate(${l * 70} 40) scale(${l * s} ${s})`}
          d="M -20 -110 Q 70 -140 90 -10 Q 100 120 20 130 Q -30 130 -30 60 Z"
          fill="#f08aa0"
          stroke={CONTORNO}
          strokeWidth={8}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
};

/** antílope em silhueta (correndo de perfil, olhando pra direita). fase em frames */
export const Antilope: React.FC<{ fase: number; cansado?: number; cor?: string }> = ({ fase, cansado = 0, cor = "#3a1f2a" }) => {
  const s = Math.sin(fase * (0.5 - cansado * 0.3));
  return (
    <g fill={cor}>
      <ellipse cx={0} cy={-210} rx={150} ry={62} />
      <path d={`M 110 -240 L 190 ${-360 + cansado * 60} L 240 ${-350 + cansado * 70} L 210 ${-310 + cansado * 70} L 150 -200 Z`} />
      <path d={`M 200 ${-350 + cansado * 60} L 180 ${-440 + cansado * 50} M 215 ${-352 + cansado * 60} L 230 ${-440 + cansado * 50}`} stroke={cor} strokeWidth={10} strokeLinecap="round" />
      {[-1, 1].map((l) => (
        <g key={l}>
          <path d={`M ${90 * l} -170 L ${90 * l + s * 50 * (1 - cansado)} -60 L ${90 * l + s * 40 * (1 - cansado)} 0`} stroke={cor} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d={`M ${80 * l + 10} -170 L ${80 * l + 10 - s * 50 * (1 - cansado)} -60 L ${80 * l + 10 - s * 40 * (1 - cansado)} 0`} stroke={cor} strokeWidth={18} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <path d="M -150 -230 Q -190 -250 -180 -200" stroke={cor} strokeWidth={14} fill="none" strokeLinecap="round" />
    </g>
  );
};
