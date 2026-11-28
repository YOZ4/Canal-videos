import { random } from "remotion";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { CONTORNO } from "../../estilo2d/personagens";

/** Cores do roteiro (seção 5) */
export const COR = {
  parede: "#2b2f3f",
  painel: "#353a4d",
  faixa: "#f2c12e",
  piso: "#1c1e28",
  espelho: "#8fb3c9",
  quarto: "#4b3f7a",
  quartoNoite: "#241d45",
  coberta: "#f2c12e",
  explicA: "#14304a",
  explicB: "#081422",
  tijoloA: "#3a2a5a",
  tijoloB: "#1a1030",
};

// ---------------- A — academia ----------------
/** academia em vista lateral; `escura` 0..1 apaga as luzes; `luzes` pisca no começo */
export const Academia: React.FC<{ escura?: number; espelho?: boolean; camX?: number }> = ({ escura = 0, espelho = true, camX = 540 }) => {
  const par = (camX - 540) * 0.35;
  return (
    <g>
      <rect x={-2000} y={-1500} width={5000} height={5000} fill={COR.parede} />
      {/* painéis */}
      <g transform={`translate(${par} 0)`}>
        {new Array(16).fill(0).map((_, i) => (
          <rect key={i} x={-1500 + i * 300} y={180} width={270} height={CHAO_Y - 560} rx={10} fill={COR.painel} />
        ))}
        {/* lâmpadas */}
        {[-600, 0, 600, 1200, 1800].map((x) => (
          <g key={x}>
            <path d={`M ${x - 60} 120 L ${x + 60} 120 L ${x + 300} ${CHAO_Y} L ${x - 300} ${CHAO_Y} Z`} fill="#ffffff" opacity={0.045 * (1 - escura)} />
            <rect x={x - 90} y={96} width={180} height={26} rx={12} fill={escura > 0.5 ? "#555a6a" : "#f4f7ff"} />
          </g>
        ))}
        {/* espelho grande */}
        {espelho ? (
          <g>
            <rect x={-120} y={330} width={1320} height={CHAO_Y - 760} rx={12} fill="#1d2230" />
            <defs>
              <linearGradient id="espelhoG" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#a9c6d8" />
                <stop offset="1" stopColor="#6f8fa6" />
              </linearGradient>
            </defs>
            <rect x={-100} y={350} width={1280} height={CHAO_Y - 800} rx={8} fill="url(#espelhoG)" opacity={0.85 - escura * 0.5} />
            {[[100, 0.35], [520, 0.22]].map(([x, o]) => (
              <path key={x} d={`M ${x} 350 l 160 0 l -300 ${CHAO_Y - 800} l -160 0 Z`} fill="#ffffff" opacity={o * (1 - escura)} />
            ))}
          </g>
        ) : null}
        {/* faixa amarela */}
        <rect x={-2000} y={CHAO_Y - 380} width={5000} height={34} fill={COR.faixa} />
        {/* suporte de anilhas */}
        <g transform={`translate(1480 ${CHAO_Y})`}>
          <rect x={-10} y={-420} width={20} height={420} fill="#4a4f60" />
          <rect x={-120} y={-20} width={240} height={20} fill="#4a4f60" />
          {[["#e8343f", 120], ["#2f6fd6", 100], ["#f2c12e", 84], ["#2e9e4f", 70]].map(([c, r], i) => (
            <g key={i} transform={`translate(${-36 + i * 22} ${-300 + i * 70})`}>
              <ellipse cx={0} cy={0} rx={18} ry={r as number} fill={c as string} stroke={CONTORNO} strokeWidth={5} />
            </g>
          ))}
        </g>
      </g>
      {/* piso */}
      <rect x={-2000} y={CHAO_Y - 30} width={5000} height={1600} fill={COR.piso} />
      <rect x={-2000} y={CHAO_Y - 34} width={5000} height={10} fill="#2a2d3b" />
      {new Array(30).fill(0).map((_, i) => (
        <rect key={i} x={-2000 + i * 180 + par * 1.5} y={CHAO_Y - 30} width={4} height={1600} fill="#252836" />
      ))}
      {escura > 0 ? <rect x={-2000} y={-1500} width={5000} height={5000} fill="#05060c" opacity={escura * 0.72} /> : null}
    </g>
  );
};

// ---------------- B — quarto do Lucas ----------------
export const QuartoLucas: React.FC<{ noite?: number; camX?: number; semCalendario?: boolean }> = ({ noite = 0, camX = 540, semCalendario }) => {
  const par = (camX - 540) * 0.3;
  const parede = noite > 0.5 ? COR.quartoNoite : COR.quarto;
  return (
    <g>
      <rect x={-2000} y={-1500} width={5000} height={5000} fill={parede} />
      <g transform={`translate(${par} 0)`}>
        {/* janela */}
        <g transform="translate(640 360)">
          <rect x={-20} y={-20} width={380} height={460} rx={16} fill="#d9d2ee" />
          <rect x={0} y={0} width={340} height={420} fill={noite > 0.5 ? "#141633" : "#f7a36b"} />
          {noite > 0.5 ? (
            <>
              <circle cx={230} cy={120} r={58} fill="#f6f1d6" />
              <circle cx={252} cy={104} r={52} fill="#141633" />
              {new Array(9).fill(0).map((_, i) => (
                <circle key={i} cx={30 + random(`st${i}`) * 280} cy={30 + random(`sy${i}`) * 360} r={3} fill="#fff" opacity={0.8} />
              ))}
            </>
          ) : (
            <circle cx={170} cy={300} r={70} fill="#ffe0a3" />
          )}
          <rect x={160} y={0} width={20} height={420} fill="#d9d2ee" />
          <rect x={0} y={200} width={340} height={20} fill="#d9d2ee" />
        </g>
        {/* calendário na parede */}
        <g transform="translate(140 520)" opacity={semCalendario ? 0 : 1}>
          <rect x={0} y={0} width={300} height={260} rx={14} fill="#f3f0f8" stroke={CONTORNO} strokeWidth={6} />
          <rect x={0} y={0} width={300} height={52} rx={14} fill="#e8343f" />
        </g>
      </g>
      {/* piso */}
      <rect x={-2000} y={CHAO_Y - 20} width={5000} height={1600} fill={noite > 0.5 ? "#2e2548" : "#7a5c8f"} />
      {/* cama */}
      <g transform={`translate(${par * 1.2} 0)`}>
        <rect x={60} y={CHAO_Y - 380} width={60} height={380} rx={14} fill="#6e4b3a" stroke={CONTORNO} strokeWidth={6} />
        <rect x={60} y={CHAO_Y - 200} width={980} height={130} rx={18} fill="#8a6440" stroke={CONTORNO} strokeWidth={6} />
        <rect x={80} y={CHAO_Y - 250} width={940} height={70} rx={30} fill="#f3f0ea" />
      </g>
      {noite > 0.5 ? <rect x={-2000} y={-1500} width={5000} height={5000} fill="#0a0a25" opacity={0.25} /> : null}
    </g>
  );
};

/** coberta amarela por cima de quem está deitado na cama */
export const Coberta: React.FC<{ x: number; respira: number }> = ({ x, respira }) => (
  <path
    d={`M ${x + 380} ${CHAO_Y - 250} Q ${x + 640} ${CHAO_Y - 330 - respira * 10} ${x + 1000} ${CHAO_Y - 270} L ${x + 1020} ${CHAO_Y - 150} L ${x + 360} ${CHAO_Y - 150} Z`}
    fill={COR.coberta}
    stroke={CONTORNO}
    strokeWidth={7}
    strokeLinejoin="round"
  />
);

// ---------------- C — fundo de explicação ----------------
export const FundoExplicacao: React.FC<{ a?: string; b?: string }> = ({ a = COR.explicA, b = COR.explicB }) => (
  <g>
    <defs>
      <radialGradient id={`fx${a}`} cx="0.5" cy="0.4" r="0.8">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </radialGradient>
    </defs>
    <rect x={-2000} y={-2000} width={5000} height={6000} fill={`url(#fx${a})`} />
    {new Array(14).fill(0).map((_, i) => (
      <line key={`v${i}`} x1={i * 100 - 100} y1={-2000} x2={i * 100 - 100} y2={4000} stroke="#fff" strokeOpacity={0.045} strokeWidth={2} />
    ))}
    {new Array(40).fill(0).map((_, i) => (
      <line key={`h${i}`} x1={-2000} y1={i * 100 - 1000} x2={3000} y2={i * 100 - 1000} stroke="#fff" strokeOpacity={0.045} strokeWidth={2} />
    ))}
  </g>
);

// ---------------- objetos ----------------

/** anilha vista de frente (círculo) ou de lado (rx pequeno) */
export const Anilha: React.FC<{ x: number; y: number; r: number; rx?: number; cor: string }> = ({ x, y, r, rx, cor }) => (
  <g>
    <ellipse cx={x} cy={y} rx={rx ?? r} ry={r} fill={cor} stroke={CONTORNO} strokeWidth={6} />
    <ellipse cx={x} cy={y} rx={(rx ?? r) * 0.25} ry={r * 0.25} fill="#2a2d3b" />
    <ellipse cx={x - (rx ?? r) * 0.3} cy={y - r * 0.4} rx={(rx ?? r) * 0.18} ry={r * 0.12} fill="#ffffff" opacity={0.35} />
  </g>
);

export const CORES_ANILHA = ["#e8343f", "#2f6fd6", "#f2c12e", "#2e9e4f"];

/** barra vista de lado (horizontal na tela), com anilhas opcionais e versão "vassoura" */
export const Barra2D: React.FC<{ x: number; y: number; comp?: number; anilhas?: number; vassoura?: boolean; escala?: number }> = ({ x, y, comp = 760, anilhas = 0, vassoura, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {vassoura ? (
      <>
        <rect x={-comp / 2} y={-9} width={comp} height={18} rx={9} fill="#c58b4a" stroke={CONTORNO} strokeWidth={5} />
        <path d={`M ${comp / 2} -40 L ${comp / 2 + 160} -70 L ${comp / 2 + 170} 70 L ${comp / 2} 40 Z`} fill="#e8c54a" stroke={CONTORNO} strokeWidth={6} />
        {new Array(7).fill(0).map((_, i) => (
          <line key={i} x1={comp / 2 + 20} x2={comp / 2 + 165} y1={-30 + i * 10} y2={-60 + i * 20} stroke="#b8932a" strokeWidth={4} />
        ))}
      </>
    ) : (
      <>
        <rect x={-comp / 2} y={-8} width={comp} height={16} rx={8} fill="#b9bfcc" stroke={CONTORNO} strokeWidth={5} />
        {[-1, 1].map((s) => (
          <rect key={s} x={s > 0 ? comp / 2 - 120 : -comp / 2} y={-14} width={120} height={28} rx={6} fill="#9aa1b0" stroke={CONTORNO} strokeWidth={5} />
        ))}
        {[-1, 1].map((s) =>
          new Array(anilhas).fill(0).map((_, i) => (
            <Anilha key={`${s}${i}`} x={s * (comp / 2 - 110 + i * 34)} y={0} r={110 - i * 8} rx={20} cor={CORES_ANILHA[i % 4]} />
          )),
        )}
      </>
    )}
  </g>
);

export const Relogio: React.FC<{ x: number; y: number; r?: number; horas?: number }> = ({ x, y, r = 120, horas = 5 }) => {
  const a = (horas / 12) * Math.PI * 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#fff" stroke={CONTORNO} strokeWidth={10} />
      {new Array(12).fill(0).map((_, i) => (
        <line key={i} x1={Math.sin((i / 12) * Math.PI * 2) * r * 0.8} y1={-Math.cos((i / 12) * Math.PI * 2) * r * 0.8} x2={Math.sin((i / 12) * Math.PI * 2) * r * 0.92} y2={-Math.cos((i / 12) * Math.PI * 2) * r * 0.92} stroke={CONTORNO} strokeWidth={6} />
      ))}
      <path d={`M 0 0 L ${Math.sin(a) * r * 0.55} ${-Math.cos(a) * r * 0.55}`} stroke={CONTORNO} strokeWidth={12} strokeLinecap="round" />
      <path d={`M 0 0 L 0 ${-r * 0.78}`} stroke="#e8343f" strokeWidth={8} strokeLinecap="round" />
      <circle r={12} fill={CONTORNO} />
    </g>
  );
};

/** ícone de calendário com dias marcados */
export const CalendarioSemana: React.FC<{ x: number; y: number; marcados: number[]; cor?: string; texto?: string; brilho?: number[]; corBrilho?: string; f?: number; escala?: number }> = ({
  x,
  y,
  marcados,
  cor = COR.faixa,
  texto,
  brilho = [],
  corBrilho = "#5fc8ff",
  f = 0,
  escala = 1,
}) => {
  const dias = ["S", "T", "Q", "Q", "S", "S", "D"];
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <rect x={-260} y={-150} width={520} height={300} rx={22} fill="#f3f0f8" stroke={CONTORNO} strokeWidth={8} />
      <rect x={-260} y={-150} width={520} height={70} rx={22} fill="#e8343f" stroke={CONTORNO} strokeWidth={8} />
      {[-180, 180].map((cx) => (
        <rect key={cx} x={cx - 10} y={-176} width={20} height={56} rx={10} fill="#6a6f80" />
      ))}
      {dias.map((d, i) => {
        const cx = -210 + i * 70;
        const on = marcados.includes(i);
        const br = brilho.includes(i);
        const pulso = br ? 0.6 + 0.4 * Math.sin(f * 0.2 + i) : 0;
        return (
          <g key={i}>
            {br ? <circle cx={cx} cy={30} r={44 + 8 * pulso} fill={corBrilho} opacity={0.35 + 0.25 * pulso} /> : null}
            <rect x={cx - 28} y={2} width={56} height={56} rx={10} fill={br ? corBrilho : on ? cor : "#ffffff"} stroke={CONTORNO} strokeWidth={5} />
            <text x={cx} y={-30} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={30} fill={CONTORNO}>
              {d}
            </text>
            {texto && on ? (
              <text x={cx} y={98} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={17} fill="#e8343f">
                {texto}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

export const Prato: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <ellipse cx={0} cy={20} rx={170} ry={60} fill="#f3f0ea" stroke={CONTORNO} strokeWidth={8} />
    <ellipse cx={0} cy={14} rx={120} ry={38} fill="#e6e1d6" />
    <ellipse cx={-50} cy={0} rx={50} ry={26} fill="#f6f2e4" stroke={CONTORNO} strokeWidth={5} />
    <path d="M 0 -6 q 30 -40 70 -10 q -20 30 -70 10 Z" fill="#c9693a" stroke={CONTORNO} strokeWidth={5} />
    {[[-80, 30], [40, 34], [80, 18]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={16} fill="#4fae52" stroke={CONTORNO} strokeWidth={4} />
    ))}
  </g>
);

export const Travesseiro: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <path d="M -170 -60 Q 0 -100 170 -60 Q 200 0 170 60 Q 0 100 -170 60 Q -200 0 -170 -60 Z" fill="#ffffff" stroke={CONTORNO} strokeWidth={8} />
    <path d="M -110 -20 Q 0 -40 110 -20" stroke="#d6d2e8" strokeWidth={8} fill="none" strokeLinecap="round" />
    <text x={150} y={-70} fontFamily="Fredoka" fontWeight={700} fontSize={56} fill="#9fb6ff">
      z
    </text>
  </g>
);

export const Lua: React.FC<{ x: number; y: number; r?: number; riscada?: number }> = ({ x, y, r = 90, riscada = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#f6f1d6" stroke={CONTORNO} strokeWidth={7} />
    <circle cx={r * 0.38} cy={-r * 0.2} r={r * 0.85} fill={COR.explicA} />
    {riscada > 0 ? <line x1={-r * 1.1} y1={r * 1.1} x2={-r * 1.1 + 2.2 * r * 1.1 * riscada} y2={r * 1.1 - 2.2 * r * 1.1 * riscada} stroke="#e8343f" strokeWidth={22} strokeLinecap="round" /> : null}
  </g>
);
