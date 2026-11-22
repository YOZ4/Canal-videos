import { AbsoluteFill, Freeze, random, useCurrentFrame } from "remotion";

/**
 * Acabamento "feito à mão" (técnicas estudadas no Claude Animation Base e no Lemo-Opuscar,
 * reescritas para SVG/Remotion — nada foi instalado nem copiado):
 *
 *  - Ferve:      contorno "fervendo" — o desenho treme de leve 12x por segundo, como animação desenhada à mão.
 *                Cada elemento tem a sua `chave` (tremor próprio). Use `ancora` = posição do personagem para o
 *                tremor andar junto com ele (senão ele "atravessa" o ruído e treme a cada frame).
 *  - NoDois:     segura cada desenho por 2 frames (animação "de dois em dois", mais solta, cara de desenho).
 *  - Desencaixe: cor um pouco desencaixada do contorno, tremendo de dois em dois (desenho anos 50).
 *  - SombraCel:  sombra e brilho de borda dura gerados do formato (anime anos 80). Bom para luta/aura.
 *  - Aquarela:   bordas tremidas, manchas de pigmento e borda mais escura (lembranças, momentos calmos).
 *  - FilmeMudo:  preto e branco/sépia com cintilação, imagem balançando, riscos, poeira e borda queimada (flashback).
 *  - Luz:        brilho aditivo (soma luz em vez de misturar tinta) — lâmpada, aura, estrela.
 *
 * Granulado de filme NÃO é desenhado aqui: vai no final, no ffmpeg (scripts/finalizar.sh), que é mais rápido
 * e não deixa o arquivo pesado.
 */

export const FERVE_FPS = 12;
/** número do "desenho" atual do tremor (muda 12x por segundo) */
export const quadroFerve = (f: number, fps = 30) => Math.floor((f * FERVE_FPS) / fps);

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) % 100000;
};
const idSeguro = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_");

/** contorno fervendo. forca = deslocamento máximo em px (2–4 é o natural; 6+ fica "nervoso"). */
export const Ferve: React.FC<{
  chave: string;
  children: React.ReactNode;
  forca?: number;
  /** finura do tremor: maior = ondinhas menores */
  frequencia?: number;
  /** ponto do mundo que o ruído acompanha (ex.: [pose.x, pose.y] do personagem) */
  ancora?: [number, number];
  /** desliga sem mexer no resto da cena */
  desligado?: boolean;
}> = ({ chave, children, forca = 3, frequencia = 0.035, ancora = [0, 0], desligado }) => {
  const f = useCurrentFrame();
  if (desligado || forca <= 0) return <>{children}</>;
  const q = quadroFerve(f);
  const seed = (hash(chave) + q * 131) % 100000;
  const id = `ferve-${idSeguro(chave)}`;
  const [ax, ay] = ancora;
  return (
    <g transform={`translate(${ax} ${ay})`}>
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={frequencia} numOctaves={2} seed={seed} result="ruido" />
          <feDisplacementMap in="SourceGraphic" in2="ruido" scale={forca * 2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <g transform={`translate(${-ax} ${-ay})`}>{children}</g>
      </g>
    </g>
  );
};

/** frame "de dois em dois" (use em cálculos: const g = noDois(f)) */
export const noDois = (f: number, passo = 2) => Math.floor(f / passo) * passo;

/** congela o conteúdo em cada 2º frame (todos os useCurrentFrame() de dentro passam a andar de 2 em 2) */
export const NoDois: React.FC<{ children: React.ReactNode; passo?: number; desligado?: boolean }> = ({ children, passo = 2, desligado }) => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={noDois(f, passo)} active={!desligado}>
      {children}
    </Freeze>
  );
};

/**
 * Desencaixe (anos 50): separa o contorno escuro da cor e desloca só a cor alguns px, tremendo de 2 em 2.
 * Detecta o "contorno" pelo brilho (tudo bem escuro conta como linha — inclusive cabelo preto).
 */
export const Desencaixe: React.FC<{ chave: string; children: React.ReactNode; px?: number; desligado?: boolean }> = ({ chave, children, px = 5, desligado }) => {
  const f = useCurrentFrame();
  if (desligado) return <>{children}</>;
  const g = noDois(f);
  const dx = px + (random(`${chave}dx${g}`) - 0.5) * 3;
  const dy = px * 0.7 + (random(`${chave}dy${g}`) - 0.5) * 3;
  const id = `desenc-${idSeguro(chave)}`;
  return (
    <g>
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          {/* alfa alto onde é escuro (linha) */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values={"0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.2 -2.36 -0.44 1 0"}
            result="escuro"
          />
          <feComponentTransfer in="escuro" result="mascara">
            <feFuncA type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="mascara" operator="in" result="linha" />
          <feComposite in="SourceGraphic" in2="mascara" operator="out" result="cor" />
          <feOffset in="cor" dx={dx} dy={dy} result="corDesloc" />
          <feMerge>
            <feMergeNode in="corDesloc" />
            <feMergeNode in="linha" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </g>
  );
};

/**
 * Sombra de cel (anime anos 80): meia-lua de sombra dura do lado oposto à luz + meia-lua de brilho do lado da luz,
 * calculadas a partir da silhueta inteira. luz = direção de onde vem a luz (graus, 0 = direita, -90 = de cima).
 */
export const SombraCel: React.FC<{
  chave: string;
  children: React.ReactNode;
  luz?: number;
  largura?: number;
  sombra?: string;
  forcaSombra?: number;
  brilho?: string;
  forcaBrilho?: number;
  desligado?: boolean;
}> = ({ chave, children, luz = -135, largura = 14, sombra = "#2a1840", forcaSombra = 0.32, brilho = "#fff4d6", forcaBrilho = 0.28, desligado }) => {
  if (desligado) return <>{children}</>;
  const rad = (luz * Math.PI) / 180;
  const lx = Math.cos(rad) * largura;
  const ly = Math.sin(rad) * largura;
  const id = `cel-${idSeguro(chave)}`;
  return (
    <g>
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          {/* sombra: forma menos a forma empurrada na direção da luz */}
          <feOffset in="SourceAlpha" dx={lx} dy={ly} result="paraLuz" />
          <feComposite in="SourceAlpha" in2="paraLuz" operator="out" result="meiaLuaSombra" />
          <feFlood floodColor={sombra} floodOpacity={forcaSombra} />
          <feComposite in2="meiaLuaSombra" operator="in" result="sombraCor" />
          {/* brilho: forma menos a forma empurrada para longe da luz (mais fino) */}
          <feOffset in="SourceAlpha" dx={-lx * 0.45} dy={-ly * 0.45} result="longeLuz" />
          <feComposite in="SourceAlpha" in2="longeLuz" operator="out" result="meiaLuaBrilho" />
          <feFlood floodColor={brilho} floodOpacity={forcaBrilho} />
          <feComposite in2="meiaLuaBrilho" operator="in" result="brilhoCor" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="sombraCor" />
            <feMergeNode in="brilhoCor" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </g>
  );
};

/**
 * Aquarela: bordas tremidas (fervendo junto), manchas de pigmento e borda mais escura onde as cores se encontram.
 * Ideal num grupo de cenário ou na cena toda de uma lembrança.
 */
export const Aquarela: React.FC<{ chave: string; children: React.ReactNode; forca?: number; desligado?: boolean }> = ({ chave, children, forca = 1, desligado }) => {
  const f = useCurrentFrame();
  if (desligado) return <>{children}</>;
  const q = quadroFerve(f);
  const id = `aquarela-${idSeguro(chave)}`;
  const s = hash(chave);
  return (
    <g>
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={0.022} numOctaves={3} seed={(s + q * 7) % 100000} result="ruidoBorda" />
          <feDisplacementMap in="SourceGraphic" in2="ruidoBorda" scale={9 * forca} xChannelSelector="R" yChannelSelector="G" result="tremido" />
          {/* borda escura (tinta acumulada): realça a diferença entre a imagem e ela borrada */}
          <feGaussianBlur in="tremido" stdDeviation={4} result="borrado" />
          <feComposite in="tremido" in2="borrado" operator="arithmetic" k1={0} k2={1 + 0.35 * forca} k3={-0.35 * forca} k4={0} result="borda" />
          {/* manchas de pigmento (fixas no papel, não fervem) */}
          <feTurbulence type="fractalNoise" baseFrequency={0.008} numOctaves={4} seed={s % 1000} result="manchas" />
          <feColorMatrix in="manchas" type="matrix" values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${-0.55 * forca} 0 0 0 ${0.3 * forca}`} result="manchasA" />
          <feComposite in="manchasA" in2="borda" operator="in" result="manchasDentro" />
          <feBlend in="manchasDentro" in2="borda" mode="multiply" result="pintado" />
          <feColorMatrix in="pintado" type="saturate" values={String(1 - 0.12 * forca)} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </g>
  );
};

/**
 * Filme mudo: envolve a cena (HTML). Preto e branco com um pouco de sépia, cintilação, balanço da imagem,
 * riscos verticais, poeira, borda queimada e vinheta. 16 fps "de projetor" por padrão.
 */
export const FilmeMudo: React.FC<{ children: React.ReactNode; sepia?: number; estrago?: number; fps?: number; desligado?: boolean }> = ({
  children,
  sepia = 0.3,
  estrago = 1,
  fps = 16,
  desligado,
}) => {
  const f = useCurrentFrame();
  if (desligado) return <>{children}</>;
  const q = Math.floor((f * fps) / 30); // quadro do "projetor"
  const passo = 30 / fps;
  const cintila = 1 + (random(`cint${q}`) - 0.5) * 0.12 * estrago;
  const balX = (random(`bx${q}`) - 0.5) * 4 * estrago;
  const pulo = random(`pulo${q}`) > 0.97 ? 14 * estrago : 0; // salto de perfuração de vez em quando
  const balY = (random(`by${q}`) - 0.5) * 3 * estrago + pulo;
  const riscos = new Array(3).fill(0).map((_, i) => ({ vis: random(`rv${i}${Math.floor(q / 3)}`) < 0.55 * estrago, x: random(`rx${i}${Math.floor(q / 4)}`) * 1080, claro: random(`rc${i}`) > 0.5, larg: 1.5 + random(`rl${i}${q}`) * 2.5 }));
  const poeira = new Array(Math.round(10 * estrago)).fill(0).map((_, i) => ({ x: random(`px${i}${q}`) * 1080, y: random(`py${i}${q}`) * 1920, r: 1 + random(`pr${i}${q}`) * 5, vis: random(`pv${i}${q}`) < 0.35 }));
  return (
    <AbsoluteFill style={{ background: "#0e0b08", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${balX}px, ${balY}px)`,
          filter: `grayscale(1) sepia(${sepia}) contrast(1.22) brightness(${cintila})`,
        }}
      >
        <Freeze frame={Math.floor(q * passo)}>{children}</Freeze>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="mudoVinheta" cx="0.5" cy="0.5" r="0.72">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="0.9" stopColor="#1a0f05" stopOpacity={0.55} />
            <stop offset="1" stopColor="#000" stopOpacity={0.9} />
          </radialGradient>
          <filter id="mudoQueima" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={0.006} numOctaves={3} seed={Math.floor(q / 8) % 1000} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.18  0 0 0 0 0.05  2.4 0 0 0 -1.25" />
          </filter>
          <mask id="mudoBorda">
            <rect width={1080} height={1920} fill="url(#mudoBordaGrad)" />
          </mask>
          <radialGradient id="mudoBordaGrad" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.7" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
        </defs>
        {riscos.map((r, i) =>
          r.vis ? <line key={i} x1={r.x} y1={0} x2={r.x + (random(`rd${i}${q}`) - 0.5) * 20} y2={1920} stroke={r.claro ? "#f4ead8" : "#140c05"} strokeOpacity={0.45} strokeWidth={r.larg} strokeDasharray={`${300 + random(`rdash${i}${q}`) * 900} ${60 + random(`rgap${i}${q}`) * 300}`} /> : null,
        )}
        {poeira.map((p, i) => (p.vis ? <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={i % 3 === 0 ? "#f4ead8" : "#140c05"} opacity={0.6} /> : null))}
        <rect width={1080} height={1920} filter="url(#mudoQueima)" mask="url(#mudoBorda)" opacity={0.85 * estrago} />
        <rect width={1080} height={1920} fill="url(#mudoVinheta)" />
      </svg>
    </AbsoluteFill>
  );
};

/** luz aditiva (soma luz como luz de verdade: fica quente no escuro e quase some no claro) */
export const Luz: React.FC<{ x: number; y: number; r: number; cor?: string; forca?: number; chave?: string }> = ({ x, y, r, cor = "#ffc766", forca = 1, chave = "luz" }) => {
  const id = `luz-${idSeguro(chave)}`;
  return (
    <g style={{ mixBlendMode: "screen" }} pointerEvents="none">
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={cor} stopOpacity={0.9 * forca} />
          <stop offset="0.35" stopColor={cor} stopOpacity={0.45 * forca} />
          <stop offset="1" stopColor={cor} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </g>
  );
};
