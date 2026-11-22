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
