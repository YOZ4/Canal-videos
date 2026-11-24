import { AbsoluteFill, interpolate, random } from "remotion";
import { CONTORNO } from "../../estilo2d/personagens";

/**
 * Sala de aula 1951 (mundo contínuo, coordenadas de mundo): parede bege, quadro-negro com "TESTE DE VISÃO" e o cartão
 * do teste, relógio de parede, janela com feixes de luz e poeira, piso de madeira. Carteiras ficam na frente da fileira.
 */
export const CHAO = 1500;
export const RODAPE = 1330;
export const ESC = 0.55;
/** x de cada lugar da fileira (0..6 atores, 7 = estudante) */
export const LUGAR = [300, 550, 800, 1050, 1300, 1550, 1800, 2050];
export const PESQ_X = 2420;
/** cartão grande no quadro-negro */
export const CARTAO = { x: 1175, y: 640, w: 780, h: 390 };
/** linhas do cartão (comprimentos): referência, A (curta), B (igual — a certa), C (média) */
export const LINHAS = { ref: 250, A: 130, B: 250, C: 190 };

const PAREDE = "#d9c9a3";
const PAREDE_ESC = "#c7b58c";
const MADEIRA = "#8a5a3c";
const MADEIRA_ESC = "#6e4630";
const QUADRO = "#2f5a45";
const GIZ = "#f2efe2";

/** posição (mundo) do pé de cada linha do cartão: x do centro e y da base */
export const linhaCartao = (q: "ref" | "A" | "B" | "C"): { x: number; y0: number; y1: number } => {
  const xs = { ref: CARTAO.x - 260, A: CARTAO.x + 30, B: CARTAO.x + 160, C: CARTAO.x + 290 };
  const base = CARTAO.y + 120;
  return { x: xs[q], y0: base, y1: base - LINHAS[q] };
};

/** o cartão do teste: referência à esquerda, opções A/B/C à direita; anéis e régua pontilhada opcionais */
export const CartaoTeste: React.FC<{ anelA?: number; anelB?: number; regua?: number; anelBCor?: string }> = ({ anelA = 0, anelB = 0, regua = 0, anelBCor = "#3fbf5a" }) => {
  const { x, y, w, h } = CARTAO;
  const L = (q: "ref" | "A" | "B" | "C") => linhaCartao(q);
  const anel = (q: "A" | "B", t: number, cor: string) => {
    if (t <= 0) return null;
    const l = L(q);
    const cy = (l.y0 + l.y1) / 2;
    const ry = (l.y0 - l.y1) / 2 + 40;
    const comp = 2 * Math.PI * Math.sqrt((60 * 60 + ry * ry) / 2);
    return <ellipse cx={l.x} cy={cy} rx={60} ry={ry} fill="none" stroke={cor} strokeWidth={14} strokeLinecap="round" strokeDasharray={comp} strokeDashoffset={comp * (1 - Math.min(1, t))} transform={`rotate(-8 ${l.x} ${cy})`} />;
  };
  const ref = L("ref");
  const b = L("B");
  return (
    <g>
      <rect x={x - w / 2 + 10} y={y - h / 2 + 12} width={w} height={h} rx={14} fill="#1a3326" opacity={0.45} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill="#fbf7ee" stroke={CONTORNO} strokeWidth={8} />
      <line x1={x - 140} y1={y - h / 2 + 30} x2={x - 140} y2={y + h / 2 - 30} stroke="#d8cfbd" strokeWidth={5} strokeDasharray="14 12" />
      {(["ref", "A", "B", "C"] as const).map((q) => {
        const l = L(q);
        return (
          <g key={q}>
            <line x1={l.x} y1={l.y0} x2={l.x} y2={l.y1} stroke={CONTORNO} strokeWidth={16} strokeLinecap="round" />
            {q !== "ref" ? (
              <text x={l.x} y={l.y0 + 66} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={54} fill={CONTORNO}>
                {q}
              </text>
            ) : null}
          </g>
        );
      })}
      {regua > 0 ? (
        <g opacity={Math.min(1, regua * 3)}>
          {[ref.y1, ref.y0].map((yy, i) => (
            <line key={i} x1={ref.x + 24} y1={yy} x2={ref.x + 24 + (b.x - ref.x - 48) * Math.min(1, regua)} y2={yy} stroke="#e8463c" strokeWidth={7} strokeDasharray="16 12" strokeLinecap="round" />
          ))}
        </g>
      ) : null}
      {anel("A", anelA, "#e2322b")}
      {anel("B", anelB, anelBCor)}
    </g>
  );
};

/** cartão de mão (A branco, B verde-claro) — coordenadas do braço (unidades do boneco), centro acima da mão */
export const CartaoMao: React.FC<{ letra: "A" | "B"; verde?: boolean }> = ({ letra, verde }) => (
  <g transform="translate(0 -130)">
    <rect x={-92} y={-74} width={184} height={148} rx={12} fill={verde ? "#cfeec9" : "#fbf7ee"} stroke={CONTORNO} strokeWidth={9} />
    <text x={0} y={36} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={108} fill={verde ? "#1f7a35" : CONTORNO}>
      {letra}
    </text>
  </g>
);

/** relógio de parede (ponteiro dos segundos anda: tique-taque) */
const Relogio: React.FC<{ f: number }> = ({ f }) => {
  const seg = Math.floor(f / 60);
  const tic = Math.min(1, (f % 60) / 5);
  const a = (seg + tic) * 6;
  return (
    <g transform="translate(2160 330)">
      <circle r={96} fill="#f6f0e0" stroke={CONTORNO} strokeWidth={10} />
      {new Array(12).fill(0).map((_, i) => (
        <line key={i} x1={0} y1={-78} x2={0} y2={-64} stroke={CONTORNO} strokeWidth={6} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-46} stroke={CONTORNO} strokeWidth={9} strokeLinecap="round" transform="rotate(300)" />
      <line x1={0} y1={0} x2={0} y2={-66} stroke={CONTORNO} strokeWidth={6} strokeLinecap="round" transform="rotate(62)" />
      <line x1={0} y1={10} x2={0} y2={-72} stroke="#c0392b" strokeWidth={4} strokeLinecap="round" transform={`rotate(${a})`} />
      <circle r={8} fill={CONTORNO} />
    </g>
  );
};

/** fundo da sala (parede, quadro com cartão, relógio, janela, piso). `luz` 0..1 = feixes da janela */
export const Sala: React.FC<{ f: number; cartao?: React.ComponentProps<typeof CartaoTeste>; luz?: number }> = ({ f, cartao = {}, luz = 1 }) => (
  <g>
    <rect x={-3000} y={-3000} width={9000} height={3000 + RODAPE} fill={PAREDE} />
    {/* faixa de lambri */}
    <rect x={-3000} y={1060} width={9000} height={RODAPE - 1060} fill={PAREDE_ESC} />
    <rect x={-3000} y={1050} width={9000} height={14} fill={MADEIRA} />
    <rect x={-3000} y={RODAPE - 30} width={9000} height={30} fill={MADEIRA_ESC} />
    {/* piso */}
    <rect x={-3000} y={RODAPE} width={9000} height={3000} fill={MADEIRA} />
    {new Array(28).fill(0).map((_, i) => (
      <line key={i} x1={-3000} y1={RODAPE + 40 + i * i * 6} x2={6000} y2={RODAPE + 40 + i * i * 6} stroke={MADEIRA_ESC} strokeWidth={4} opacity={0.6} />
    ))}
    {/* quadro-negro */}
    <rect x={430} y={250} width={1490} height={720} rx={10} fill="#5a3a26" stroke={CONTORNO} strokeWidth={10} />
    <rect x={460} y={278} width={1430} height={664} fill={QUADRO} />
    {[[600, 900], [1500, 820], [1700, 400]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={140} ry={30} fill="#fff" opacity={0.05} />
    ))}
    <text x={1175} y={380} textAnchor="middle" fontFamily="Patrick Hand" fontSize={92} fill={GIZ} opacity={0.92} letterSpacing={6}>
      TESTE DE VISÃO
    </text>
    <rect x={500} y={942} width={1350} height={22} fill="#7a5236" stroke={CONTORNO} strokeWidth={6} />
    <CartaoTeste {...cartao} />
    <Relogio f={f} />
    {/* janela */}
    <g>
      <rect x={2300} y={230} width={460} height={620} fill="#f2e7c8" stroke={CONTORNO} strokeWidth={12} />
      <rect x={2318} y={248} width={424} height={584} fill="#bfe0ef" />
      <path d="M 2318 640 Q 2420 600 2520 650 Q 2620 610 2742 640 L 2742 832 L 2318 832 Z" fill="#9cc98a" />
      <line x1={2530} y1={240} x2={2530} y2={840} stroke="#f2e7c8" strokeWidth={14} />
      <line x1={2310} y1={540} x2={2750} y2={540} stroke="#f2e7c8" strokeWidth={14} />
    </g>
    {/* feixes de luz da janela (caem pra esquerda) + poeira */}
    <g opacity={0.22 * luz}>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${2330 + i * 150} 260 L ${2480 + i * 150} 260 L ${1700 + i * 260} ${RODAPE + 300} L ${1440 + i * 260} ${RODAPE + 300} Z`} fill="#fff3c8" />
      ))}
    </g>
    {new Array(26).fill(0).map((_, i) => {
      const x0 = 1600 + random(`px${i}`) * 1000;
      const y0 = 300 + random(`py${i}`) * 1200;
      const x = x0 + Math.sin(f * 0.01 + i) * 30;
      const y = y0 + ((f * (0.2 + random(`pv${i}`) * 0.3)) % 200) - 100;
      return <circle key={i} cx={x} cy={y} r={2 + random(`pr${i}`) * 3} fill="#fff8dc" opacity={0.5 * luz} />;
    })}
  </g>
);

/** carteira (na frente do personagem): tampo + painel que esconde as pernas */
export const Carteira: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 138} y={1232} width={276} height={30} rx={6} fill="#a06a42" stroke={CONTORNO} strokeWidth={7} />
    <rect x={x - 124} y={1258} width={248} height={200} fill="#8a5a3c" stroke={CONTORNO} strokeWidth={7} />
    <rect x={x - 106} y={1278} width={212} height={150} rx={6} fill="#7a4e32" opacity={0.8} />
    <rect x={x - 118} y={1456} width={18} height={60} fill="#5a3a26" stroke={CONTORNO} strokeWidth={5} />
    <rect x={x + 100} y={1456} width={18} height={60} fill="#5a3a26" stroke={CONTORNO} strokeWidth={5} />
  </g>
);

/** luz da cena (overlay de tela): quente → fria → azul, com vinheta */
export type ModoLuz = { cor: string; forca: number; vinheta: number };
export const LUZ = {
  quente: { cor: "#ffb45a", forca: 0.1, vinheta: 0.25 },
  fria: { cor: "#6a8fc0", forca: 0.16, vinheta: 0.45 },
  gelada: { cor: "#3f63a8", forca: 0.28, vinheta: 0.7 },
} satisfies Record<string, ModoLuz>;
export const mistura = (a: ModoLuz, b: ModoLuz, t: number): ModoLuz => {
  const ca = a.cor.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const cb = b.cor.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  return { cor: `#${c}`, forca: a.forca + (b.forca - a.forca) * t, vinheta: a.vinheta + (b.vinheta - a.vinheta) * t };
};
export const Luz: React.FC<{ m: ModoLuz }> = ({ m }) => (
  <>
    <AbsoluteFill style={{ background: m.cor, opacity: m.forca, mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(15,10,30,${m.vinheta}) 100%)` }} />
  </>
);

export const ip = (f: number, a: number[], b: number[]) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
