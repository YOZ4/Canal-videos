import { AbsoluteFill, random } from "remotion";
import { CHAO_Y } from "./Cenario2D";

/**
 * Estilo "JJK S2" (estudado nas referências enviadas — só a gramática visual, nada copiado):
 *  - CelJJK: sombra DURA (2 tons) do lado oposto à luz + LUZ DE RECORTE saturada e grossa do lado da luz, com glow,
 *    e contorno com espessura variável (engrossa as linhas escuras com um ruído fixo — não "ferve").
 *  - GradeJJK: grade de cor da cena (contraste alto, sombras azul-petróleo, vinheta forte).
 *  - Profundidade: Desfoque (fundo/primeiro plano borrados), BorraoChicote (borrão horizontal do chicote de câmera).
 *  - Efeitos: RiscosVelocidade (riscos escuros arranhados), LinhasRadiais, EnergiaCiano (rastro com glow),
 *    Particulas (pontos brilhantes flutuando), QuadroImpacto (preto + silhueta vermelha), Racha (chão rachando).
 *  - CenarioJJK: passagem subterrânea escura com uma fonte de luz ciano.
 *  - cameraJJK: tremor que decai (trauma), inclinação, empurrões rápidos — tudo a 24 qps.
 */

export const CIANO = "#5ff4ff";
export const SOMBRA_JJK = "#141c38";
const id = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_");

/** sombra dura + luz de recorte + contorno variável. luz = ângulo de onde vem a luz (graus; -160 = esquerda, um pouco de cima) */
export const CelJJK: React.FC<{
  chave: string;
  children: React.ReactNode;
  luz?: number;
  sombra?: number;
  recorte?: number;
  corRecorte?: string;
  forcaRecorte?: number;
  forcaSombra?: number;
  contorno?: number;
}> = ({ chave, children, luz = -160, sombra = 40, recorte = 12, corRecorte = CIANO, forcaRecorte = 1, forcaSombra = 0.68, contorno = 1.2 }) => {
  const r = (luz * Math.PI) / 180;
  const lx = Math.cos(r);
  const ly = Math.sin(r);
  const fid = `jjk-${id(chave)}`;
  return (
    <g>
      <defs>
        <filter id={fid} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          {/* contorno com espessura variável: pega o que é bem escuro, engrossa e entorta com ruído fixo */}
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0.07  0 0 0 0 0.06  0 0 0 0 0.12  -1.4 -2.6 -0.5 1 0" result="escuro" />
          <feComponentTransfer in="escuro" result="linha0">
            <feFuncA type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feMorphology in="linha0" operator="dilate" radius={contorno} result="linhaGrossa" />
          <feTurbulence type="fractalNoise" baseFrequency={0.012} numOctaves={2} seed={7} result="ruidoFixo" />
          <feDisplacementMap in="linhaGrossa" in2="ruidoFixo" scale={3} xChannelSelector="R" yChannelSelector="G" result="linha" />
          {/* sombra dura: forma menos a forma empurrada na direção da luz */}
          <feOffset in="SourceAlpha" dx={lx * sombra} dy={ly * sombra} result="paraLuz" />
          <feComposite in="SourceAlpha" in2="paraLuz" operator="out" result="meiaSombra" />
          <feFlood floodColor={SOMBRA_JJK} floodOpacity={forcaSombra} />
          <feComposite in2="meiaSombra" operator="in" result="sombra" />
          {/* luz de recorte: forma menos a forma empurrada para LONGE da luz (faixa fina do lado iluminado) */}
          <feOffset in="SourceAlpha" dx={-lx * recorte} dy={-ly * recorte} result="longe" />
          <feComposite in="SourceAlpha" in2="longe" operator="out" result="faixa" />
          <feFlood floodColor={corRecorte} floodOpacity={forcaRecorte} />
          <feComposite in2="faixa" operator="in" result="recorte" />
          <feGaussianBlur in="recorte" stdDeviation={9} result="brilho" />
          {/* corpo um pouco mais escuro e frio (noite), a luz de recorte fica por cima sem escurecer */}
          <feComponentTransfer in="SourceGraphic" result="base">
            <feFuncR type="linear" slope={0.78} />
            <feFuncG type="linear" slope={0.84} />
            <feFuncB type="linear" slope={0.95} intercept={0.02} />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="base" />
            <feMergeNode in="sombra" />
            <feMergeNode in="linha" />
            <feMergeNode in="brilho" />
            <feMergeNode in="brilho" />
            <feMergeNode in="recorte" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${fid})`}>{children}</g>
    </g>
  );
};

/** desfoque de profundidade (fundo ou primeiro plano) */
export const Desfoque: React.FC<{ chave: string; px: number; children: React.ReactNode }> = ({ chave, px, children }) =>
  px <= 0.2 ? (
    <>{children}</>
  ) : (
    <g>
      <defs>
        <filter id={`df-${id(chave)}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={px} />
        </filter>
      </defs>
      <g filter={`url(#df-${id(chave)})`}>{children}</g>
    </g>
  );

/** grade de cor da cena inteira (HTML): contraste alto, sombras azul-petróleo, vinheta forte. borrao = borrão horizontal (chicote) */
export const GradeJJK: React.FC<{ children: React.ReactNode; borrao?: number; vinheta?: number }> = ({ children, borrao = 0, vinheta = 0.75 }) => (
  <AbsoluteFill style={{ background: "#05080d", overflow: "hidden" }}>
    <AbsoluteFill style={{ filter: `contrast(1.15) saturate(0.88) brightness(1.04)${borrao > 0 ? " url(#borraoX)" : ""}` }}>{children}</AbsoluteFill>
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id="borraoX">
        <feGaussianBlur stdDeviation={`${borrao} 0`} />
      </filter>
    </svg>
    {/* sombras puxadas para azul-petróleo */}
    <AbsoluteFill style={{ background: "#0b1f2e", mixBlendMode: "lighten", opacity: 0.55 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,60,80,0.18), rgba(5,10,20,0.25))", mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 42%, rgba(2,6,12,${vinheta}) 100%)` }} />
  </AbsoluteFill>
);

/** tremor "trauma": soma de impactos que decaem; cada um [frame, força px]. Varia a cada frame (24 qps). */
export const tremorJJK = (f: number, impactos: [number, number][], decai = 9) => {
  let x = 0;
  let y = 0;
  let rot = 0;
  for (const [de, forca] of impactos) {
    const t = f - de;
    if (t < 0 || t > decai * 3) continue;
    const a = forca * Math.exp(-t / decai);
    x += (random(`jx${f}-${de}`) - 0.5) * 2 * a;
    y += (random(`jy${f}-${de}`) - 0.5) * 2 * a;
    rot += (random(`jr${f}-${de}`) - 0.5) * a * 0.08;
  }
  return { x, y, rot };
};

/** riscos escuros arranhados na diagonal (fundo de arrancada) */
export const RiscosVelocidade: React.FC<{ f: number; forca: number; angulo?: number; cor?: string; cx?: number; cy?: number }> = ({ f, forca, angulo = -25, cor = "#141018", cx = 540, cy = 960 }) => {
  if (forca <= 0.01) return null;
  const q = Math.floor(f / 2);
  return (
    <g transform={`rotate(${angulo} ${cx} ${cy})`} opacity={forca}>
      {new Array(34).fill(0).map((_, i) => {
        const x = cx - 900 + random(`rvx${i}-${q}`) * 1800;
        const y = cy - 1100 + random(`rvy${i}-${q}`) * 2200;
        const len = 120 + random(`rvl${i}-${q}`) * 380;
        const w = 2 + random(`rvw${i}-${q}`) * 6;
        return <path key={i} d={`M ${x} ${y} l ${len} ${len * 0.02} l ${-len * 0.98} ${w}`} fill={cor} />;
      })}
    </g>
  );
};

/** linhas brancas saindo do centro (foco de impacto) */
export const LinhasRadiais: React.FC<{ f: number; x: number; y: number; forca: number; cor?: string }> = ({ f, x, y, forca, cor = "#ffffff" }) => {
  if (forca <= 0.01) return null;
  const q = Math.floor(f / 2);
  return (
    <g opacity={forca}>
      {new Array(44).fill(0).map((_, i) => {
        const a = (i / 44) * Math.PI * 2 + random(`lra${i}-${q}`) * 0.1;
        const r0 = 420 + random(`lr0${i}-${q}`) * 260;
        const r1 = 1600;
        const w = 6 + random(`lrw${i}-${q}`) * 18;
        const p = (rr: number, da: number) => `${x + Math.cos(a + da) * rr} ${y + Math.sin(a + da) * rr}`;
        return <path key={i} d={`M ${p(r0, 0)} L ${p(r1, w / 1600)} L ${p(r1, -w / 1600)} Z`} fill={cor} />;
      })}
    </g>
  );
};

/** rastro de energia ciano com glow (pontos = caminho do golpe) */
export const EnergiaCiano: React.FC<{ pontos: [number, number][]; largura: number; forca: number; cor?: string; chave: string }> = ({ pontos, largura, forca, cor = CIANO, chave }) => {
  if (forca <= 0.01 || pontos.length < 2) return null;
  const d = pontos.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <g opacity={forca} style={{ mixBlendMode: "screen" }}>
      <defs>
        <filter id={`en-${id(chave)}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={largura * 0.5} />
        </filter>
      </defs>
      <path d={d} stroke={cor} strokeWidth={largura * 2.2} fill="none" strokeLinecap="round" filter={`url(#en-${id(chave)})`} />
      <path d={d} stroke={cor} strokeWidth={largura} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#eaffff" strokeWidth={largura * 0.35} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** partículas brilhantes flutuando (sobem devagar, piscam) */
export const Particulas: React.FC<{ f: number; n?: number; area: [number, number, number, number]; cor?: string; forca?: number; semente?: string }> = ({ f, n = 26, area, cor = CIANO, forca = 1, semente = "pt" }) => (
  <g style={{ mixBlendMode: "screen" }} opacity={forca}>
    {new Array(n).fill(0).map((_, i) => {
      const [x0, y0, w, h] = area;
      const vel = 0.6 + random(`${semente}v${i}`) * 1.8;
      const y = y0 + h - ((random(`${semente}y${i}`) * h + f * vel * 3) % h);
      const x = x0 + random(`${semente}x${i}`) * w + Math.sin(f * 0.05 + i) * 14;
      const r = 3 + random(`${semente}r${i}`) * 7;
      const pisca = 0.5 + 0.5 * Math.sin(f * 0.3 + i * 1.7);
      return (
        <g key={i} opacity={0.35 + 0.65 * pisca}>
          <circle cx={x} cy={y} r={r * 3} fill={cor} opacity={0.18} />
          <circle cx={x} cy={y} r={r} fill="#eaffff" />
        </g>
      );
    })}
  </g>
);

/** quadro de impacto: vermelho = fundo preto e o que é claro vira vermelho; branco = negativo (fundo branco, silhuetas pretas) */
export const QuadroImpacto: React.FC<{ ativo: boolean; children: React.ReactNode; cor?: "vermelho" | "branco" }> = ({ ativo, children, cor = "vermelho" }) =>
  ativo ? (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: cor === "vermelho" ? "grayscale(1) contrast(7) brightness(1.3)" : "grayscale(1) invert(1) contrast(7) brightness(1.2)" }}>{children}</AbsoluteFill>
      {cor === "vermelho" ? <AbsoluteFill style={{ background: "#ff1430", mixBlendMode: "multiply" }} /> : null}
    </AbsoluteFill>
  ) : (
    <>{children}</>
  );

/** rachadura no chão (cresce em 3 frames) + pedrinhas */
export const Racha: React.FC<{ x: number; f: number; de: number; tamanho?: number }> = ({ x, f, de, tamanho = 1 }) => {
  const t = f - de;
  if (t < 0 || t > 60) return null;
  const s = Math.min(1, t / 3) * tamanho;
  return (
    <g transform={`translate(${x} ${CHAO_Y + 8}) scale(${s} ${s * 0.45})`} opacity={1 - Math.max(0, t - 40) / 20} stroke="#06080c" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {new Array(9).fill(0).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + random(`rc${de}${i}`) * 0.4;
        const r1 = 90 + random(`rca${de}${i}`) * 60;
        const r2 = 200 + random(`rcb${de}${i}`) * 120;
        const m = 0.25 + random(`rcm${de}${i}`) * 0.3;
        return <path key={i} d={`M 0 0 L ${Math.cos(a) * r1} ${Math.sin(a) * r1} L ${Math.cos(a + m) * r2} ${Math.sin(a + m) * r2}`} />;
      })}
      <circle cx={0} cy={0} r={70} stroke="#06080c" strokeWidth={7} />
    </g>
  );
};

/** passagem subterrânea escura, luz ciano vinda da esquerda. Chão em CHAO_Y. camX = parallax */
export const CenarioJJK: React.FC<{ camX?: number; luz?: number }> = ({ camX = 540, luz = 1 }) => (
  <g>
    <defs>
      <linearGradient id="jjkParede" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#0d1a24" />
        <stop offset="1" stopColor="#1d3442" />
      </linearGradient>
      <linearGradient id="jjkChao" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#1c2d36" />
        <stop offset="1" stopColor="#0a1218" />
      </linearGradient>
      <radialGradient id="jjkLuz" gradientUnits="userSpaceOnUse" cx={camX - 750} cy={CHAO_Y - 520} r={1500}>
        <stop offset="0" stopColor={CIANO} stopOpacity={0.55 * luz} />
        <stop offset="0.5" stopColor="#1fa7c4" stopOpacity={0.18 * luz} />
        <stop offset="1" stopColor="#000" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-3000} y={-2000} width={8000} height={2000 + CHAO_Y} fill="url(#jjkParede)" />
    {/* pilares e painéis com parallax */}
    <g transform={`translate(${(camX - 540) * 0.35} 0)`}>
      {new Array(12).fill(0).map((_, i) => {
        const x = -1600 + i * 420;
        return (
          <g key={i}>
            <rect x={x} y={-200} width={120} height={CHAO_Y + 200} fill="#0a141c" />
            <rect x={x + 120} y={-200} width={18} height={CHAO_Y + 200} fill="#2a4a58" opacity={0.6} />
            <rect x={x + 170} y={CHAO_Y - 760} width={200} height={300} fill="#132632" stroke="#24404e" strokeWidth={6} />
            <rect x={x + 190} y={CHAO_Y - 740} width={160} height={30} fill="#3b6a78" opacity={0.5} />
          </g>
        );
      })}
      {/* lâmpadas no teto */}
      {new Array(12).fill(0).map((_, i) => (
        <rect key={`l${i}`} x={-1500 + i * 420} y={180} width={220} height={22} rx={11} fill="#cfefff" opacity={0.7} />
      ))}
    </g>
    <rect x={-3000} y={CHAO_Y - 18} width={8000} height={2000} fill="url(#jjkChao)" />
    {/* rejunte do chão (perspectiva leve) */}
    <g stroke="#2b4652" strokeWidth={4} opacity={0.6}>
      {new Array(30).fill(0).map((_, i) => {
        const x = -1800 + i * 200 - ((camX - 540) * 0.0);
        return <line key={i} x1={x} y1={CHAO_Y} x2={540 + (x - 540) * 2.2} y2={CHAO_Y + 900} />;
      })}
      {[60, 180, 360, 620].map((dy, i) => (
        <line key={`h${i}`} x1={-3000} y1={CHAO_Y + dy} x2={5000} y2={CHAO_Y + dy} />
      ))}
    </g>
    {/* reflexo molhado da luz no chão */}
    <ellipse cx={camX - 300} cy={CHAO_Y + 120} rx={700} ry={60} fill={CIANO} opacity={0.08 * luz} />
    <rect x={-3000} y={-2000} width={8000} height={5000} fill="url(#jjkLuz)" style={{ mixBlendMode: "screen" }} />
  </g>
);
