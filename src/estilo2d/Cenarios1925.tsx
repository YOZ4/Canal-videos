import { interpolate, random } from "remotion";
import { CONTORNO } from "./personagens";

/**
 * Paris, 1925 (episódio "Torre Eiffel"): salão do hotel, rua de Paris, torre (plana e 3D de verdade),
 * objetos (documento, envelope, anzol, peixe, carro, crachá) e câmera com profundidade.
 * Coordenadas de tela 1080x1920 no enquadramento "final" de cada cena; a profundidade escala as camadas.
 */

const L = CONTORNO;

// ---------------- profundidade (dolly de câmera entre camadas chapadas) ----------------
/**
 * Camada em profundidade z (maior = mais longe). A câmera anda em z: no enquadramento final (camZf) a camada fica
 * exatamente como foi desenhada; com a câmera mais perto, camadas próximas crescem mais que as distantes (parallax real).
 * foco = ponto de tela para onde a câmera aponta. Personagens continuam chapados (só escala), nunca inclinados.
 */
export const escalaZ = (z: number, camZ: number, camZf: number) => (z - camZf) / Math.max(1, z - camZ);
export const Camada3D: React.FC<{ z: number; camZ: number; camZf: number; foco: [number, number]; desloca?: [number, number]; children: React.ReactNode }> = ({ z, camZ, camZf, foco, desloca = [0, 0], children }) => {
  const s = escalaZ(z, camZ, camZf);
  return <g transform={`translate(${foco[0] + desloca[0] * s} ${foco[1] + desloca[1] * s}) scale(${s}) translate(${-foco[0]} ${-foco[1]})`}>{children}</g>;
};

// ---------------- salão do hotel ----------------
export const SalaoHotel: React.FC<{ f: number; cortina?: number; luz?: "quente" | "abajur"; id?: string; semJanela?: boolean; janelaX?: number; quadroX?: number }> = ({ f, cortina = 0, luz = "quente", id = "h", semJanela, janelaX = 20, quadroX = 740 }) => {
  const brilho = 0.85 + 0.15 * Math.sin(f * 0.05) + 0.05 * Math.sin(f * 0.37);
  const escuro = luz === "abajur";
  return (
    <g>
      <defs>
        <radialGradient id={`lustre-${id}`}>
          <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.55 * brilho} />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`piso-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3a2a4a" />
          <stop offset="1" stopColor="#2a1e36" />
        </linearGradient>
        <pattern id={`papel-${id}`} width={160} height={140} patternUnits="userSpaceOnUse" x={-40}>
          <rect width={160} height={140} fill="#7a2f3a" />
          <rect x={0} width={28} height={140} fill="#5a1f2a" opacity={0.55} />
          <rect x={80} width={28} height={140} fill="#5a1f2a" opacity={0.55} />
          <rect x={44} y={14} width={22} height={22} transform="rotate(45 55 25)" fill="#d9b24a" opacity={0.55} />
          <rect x={124} y={84} width={22} height={22} transform="rotate(45 135 95)" fill="#d9b24a" opacity={0.55} />
        </pattern>
      </defs>
      <rect x={-1400} y={-1200} width={3900} height={2240} fill={`url(#papel-${id})`} />
      {/* janela com a torre lá fora */}
      {semJanela ? null : (
        <g transform={`translate(${janelaX - 20} 0)`}>
          <rect x={20} y={520} width={250} height={480} fill="#9fd2f0" stroke="#d9b24a" strokeWidth={14} />
          <rect x={20} y={760} width={250} height={240} fill="#ffe2b0" opacity={0.6} />
          <path d="M 150 560 L 128 680 L 112 680 L 92 860 L 70 1000 L 230 1000 L 208 860 L 188 680 L 172 680 Z" fill="#8a5a3a" stroke={L} strokeWidth={4} />
          <rect x={98} y={676} width={104} height={12} fill="#9a6440" stroke={L} strokeWidth={3} />
          <rect x={84} y={852} width={132} height={14} fill="#9a6440" stroke={L} strokeWidth={3} />
          <path d="M 20 760 L 270 760 M 145 520 L 145 1000" stroke="#d9b24a" strokeWidth={8} />
          {/* cortinas (fecham de fora para dentro) */}
          {[-1, 1].map((s) => {
            const aberta = 60;
            const larg = aberta + (125 - aberta + 10) * cortina;
            const x0 = s < 0 ? 0 : 290 - larg;
            const onda = Math.sin(f * 0.06 + s) * 6 * (1 - cortina * 0.5);
            return (
              <path
                key={s}
                d={`M ${x0} 500 L ${x0 + larg} 500 Q ${x0 + larg + onda} 760 ${x0 + larg - s * 8} 1020 L ${x0} 1020 Z`}
                fill="#a33a3a"
                stroke={L}
                strokeWidth={5}
              />
            );
          })}
          <rect x={-10} y={488} width={310} height={22} rx={8} fill="#d9b24a" stroke={L} strokeWidth={4} />
        </g>
      )}
      {/* quadro */}
      <rect x={quadroX} y={680} width={210} height={160} rx={6} fill="#5a7a8c" stroke="#d9b24a" strokeWidth={12} />
      {/* rodapé dourado + lambri */}
      <rect x={-1400} y={1010} width={3900} height={22} fill="#d9b24a" />
      <rect x={-1400} y={1032} width={3900} height={76} fill="#4a2a20" />
      <rect x={-1400} y={1108} width={3900} height={1400} fill={`url(#piso-${id})`} />
      {new Array(14).fill(0).map((_, i) => (
        <path key={i} d={`M ${-500 + i * 220} 1108 L ${-620 + i * 220 - 120} 2500`} stroke="#4a3a5a" strokeWidth={3} opacity={0.7} />
      ))}
      {/* lustre */}
      <line x1={440} y1={-400} x2={440} y2={636} stroke="#d9b24a" strokeWidth={5} />
      <circle cx={440} cy={650} r={340} fill={`url(#lustre-${id})`} />
      <ellipse cx={440} cy={654} rx={86} ry={22} fill="#e6c460" stroke="#5a4a3a" strokeWidth={4} />
      {[-72, -48, -24, 0, 24, 48, 72].map((dx) => (
        <circle key={dx} cx={440 + dx} cy={680} r={9} fill="#fff1c0" opacity={0.8 + 0.2 * brilho} />
      ))}
      {escuro ? <rect x={-1400} y={-1200} width={3900} height={3800} fill="#1a0e1e" opacity={0.42} /> : null}
    </g>
  );
};

/** mesa comprida com toalha branca (frente). x0/x1 = pontas, y = altura do tampo */
export const MesaToalha: React.FC<{ x0: number; x1: number; y: number; altura?: number }> = ({ x0, x1, y, altura = 120 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={26} fill="#fbf9f3" stroke={L} strokeWidth={5} />
    <rect x={x0} y={y + 26} width={x1 - x0} height={altura} fill="#f4f1ea" stroke={L} strokeWidth={5} />
    {new Array(Math.floor((x1 - x0) / 80)).fill(0).map((_, i) => (
      <path key={i} d={`M ${x0 + 30 + i * 80} ${y + 34} L ${x0 + 24 + i * 80} ${y + altura + 18}`} stroke="#d8d4cc" strokeWidth={3} />
    ))}
  </g>
);

// ---------------- rua de Paris ----------------
export type TomParis = "dia" | "sepia" | "nublado" | "fim";
const CEU: Record<TomParis, [string, string]> = {
  dia: ["#8fc8f0", "#ffe2b0"],
  sepia: ["#c9a77a", "#f0d9a8"],
  nublado: ["#5a6a8a", "#a0a8b8"],
  fim: ["#8a7ab0", "#ffc890"],
};
export const CeuParis: React.FC<{ tom: TomParis; id?: string }> = ({ tom, id = "p" }) => (
  <g>
    <defs>
      <linearGradient id={`ceu-${id}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={CEU[tom][0]} />
        <stop offset="1" stopColor={CEU[tom][1]} />
      </linearGradient>
    </defs>
    <rect x={-3000} y={-4000} width={7000} height={5200} fill={`url(#ceu-${id})`} />
    <rect x={-3000} y={1199} width={7000} height={2500} fill={CEU[tom][1]} />
  </g>
);

/** fileira de prédios parisienses (creme, telhado azul-acinzentado). base = y da calçada */
export const PredisParis: React.FC<{ base: number; x0?: number; n?: number; tom?: TomParis; semente?: string }> = ({ base, x0 = -400, n = 14, tom = "dia", semente = "pr" }) => {
  const sepia = tom === "sepia";
  const nub = tom === "nublado";
  let x = x0;
  const cores = sepia ? ["#ead2a4", "#e2c696", "#f0dcb0"] : nub ? ["#c8c2b4", "#bdb6a6", "#d0cabe"] : ["#efe0c4", "#e8d0ac", "#f4e6cc"];
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const w = 140 + Math.floor(random(`${semente}w${i}`) * 60);
        const h = 230 + Math.floor(random(`${semente}h${i}`) * 110);
        const xi = x;
        x += w + 4;
        const cols = Math.max(2, Math.floor((w - 20) / 46));
        const rows = Math.floor((h - 30) / 62);
        return (
          <g key={i}>
            <rect x={xi} y={base - h} width={w} height={h} fill={cores[i % 3]} stroke={L} strokeWidth={4} />
            <path d={`M ${xi - 8} ${base - h} L ${xi + 14} ${base - h - 44} L ${xi + w - 14} ${base - h - 44} L ${xi + w + 8} ${base - h} Z`} fill={sepia ? "#8a7a62" : "#6a7a8f"} stroke={L} strokeWidth={4} />
            {new Array(rows * cols).fill(0).map((_, k) => {
              const cx = xi + 14 + (k % cols) * ((w - 28) / cols);
              const cy = base - h + 24 + Math.floor(k / cols) * 62;
              return (
                <g key={k}>
                  <rect x={cx + 4} y={cy} width={26} height={38} fill={sepia ? "#7a6a52" : nub ? "#4a5a72" : "#6a7a92"} />
                  <rect x={cx} y={cy + 40} width={34} height={4} fill={L} opacity={0.5} />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

/** calçamento de pedras (de y para baixo) */
export const Calcamento: React.FC<{ y: number; tom?: TomParis; id?: string }> = ({ y, tom = "dia", id = "c" }) => {
  const cor = tom === "sepia" ? "#a89474" : tom === "nublado" ? "#6e6a62" : "#8a8478";
  const junta = tom === "sepia" ? "#968262" : tom === "nublado" ? "#625e56" : "#7a7468";
  return (
    <g>
      <defs>
        <pattern id={`pedra-${id}`} width={90} height={56} patternUnits="userSpaceOnUse" y={y}>
          <rect width={90} height={56} fill={cor} />
          <rect x={2} y={2} width={40} height={24} rx={4} fill={junta} opacity={0.6} />
          <rect x={46} y={2} width={42} height={24} rx={4} fill={junta} opacity={0.45} />
          <rect x={-20} y={30} width={40} height={24} rx={4} fill={junta} opacity={0.5} />
          <rect x={24} y={30} width={42} height={24} rx={4} fill={junta} opacity={0.6} />
          <rect x={68} y={30} width={40} height={24} rx={4} fill={junta} opacity={0.5} />
        </pattern>
      </defs>
      <rect x={-3000} y={y} width={7000} height={3000} fill={`url(#pedra-${id})`} />
      <rect x={-3000} y={y} width={7000} height={10} fill={L} opacity={0.35} />
    </g>
  );
};

/** Torre Eiffel chapada (fundo). base = y do pé, x = centro, h = altura total. ferrugem 0..1, bandeiras 0..1 */
export const TorrePlana: React.FC<{ x: number; base: number; h: number; ferrugem?: number; bandeiras?: number; f?: number }> = ({ x, base, h, ferrugem = 0, bandeiras = 0, f = 0 }) => {
  const w = h * 0.46;
  const pt = (t: number) => w * 0.5 * Math.pow(1 - t, 1.9) + 6;
  const y = (t: number) => base - t * h;
  const lado = (s: number) => [0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 0.96].map((t) => `${x + s * pt(t)} ${y(t)}`).join(" L ");
  const cor = ferrugem > 0.5 ? "#8a4a2a" : "#8a5a3a";
  return (
    <g>
      <path d={`M ${lado(-1)} L ${x + pt(0.96)} ${y(0.96)} L ${lado(1).split(" L ").reverse().join(" L ")} Z`} fill={cor} stroke={L} strokeWidth={5} strokeLinejoin="round" />
      {/* arco da base */}
      <path d={`M ${x - pt(0.02) * 0.62} ${base} Q ${x} ${y(0.2)} ${x + pt(0.02) * 0.62} ${base} Z`} fill="#000" opacity={0.0} />
      <path d={`M ${x - pt(0.03) * 0.66} ${base + 2} Q ${x} ${y(0.19)} ${x + pt(0.03) * 0.66} ${base + 2}`} fill={CEU.dia[1]} opacity={0.0} />
      {[0.06, 0.16, 0.34, 0.46, 0.62, 0.76, 0.88].map((t) => (
        <path key={t} d={`M ${x - pt(t)} ${y(t)} L ${x + pt(t + 0.05)} ${y(t + 0.05)} M ${x + pt(t)} ${y(t)} L ${x - pt(t + 0.05)} ${y(t + 0.05)}`} stroke="#4a2e24" strokeWidth={5} opacity={0.8} />
      ))}
      <line x1={x} y1={y(0.97)} x2={x} y2={y(0.3)} stroke="#4a2e24" strokeWidth={3} opacity={0.6} />
      {[0.27, 0.52].map((t) => (
        <rect key={t} x={x - pt(t) - 14} y={y(t) - 14} width={(pt(t) + 14) * 2} height={30} rx={5} fill="#9a6440" stroke={L} strokeWidth={4} />
      ))}
      <line x1={x} y1={y(0.96)} x2={x} y2={y(1.08)} stroke={L} strokeWidth={4} />
      {ferrugem > 0
        ? new Array(18).fill(0).map((_, i) => {
            const t = 0.05 + random(`fe${i}`) * 0.8;
            const dx = (random(`fx${i}`) - 0.5) * 1.6 * pt(t);
            return <ellipse key={i} cx={x + dx} cy={y(t)} rx={14 + random(`fr${i}`) * 16} ry={8 + random(`fr${i}`) * 6} fill="#c8642a" opacity={0.75 * Math.min(1, ferrugem * 1.5 - (i % 3) * 0.15)} />;
          })
        : null}
      {bandeiras > 0
        ? [0.27, 0.52].map((t) => (
            <g key={t} opacity={bandeiras}>
              {new Array(9).fill(0).map((_, i) => {
                const bx = x - pt(t) - 10 + (i * (pt(t) * 2 + 20)) / 8;
                const by = y(t) + 18 + Math.sin(i * 1.3) * 3;
                return <path key={i} d={`M ${bx - 9} ${by} L ${bx + 9} ${by} L ${bx} ${by + 22 + Math.sin(f * 0.2 + i) * 3} Z`} fill={["#d64545", "#ffffff", "#3a5ad6"][i % 3]} stroke={L} strokeWidth={2} />;
              })}
            </g>
          ))
        : null}
    </g>
  );
};

/**
 * Torre Eiffel em 3D DE VERDADE (projeção): treliça com 4 faces sorteadas por profundidade e luz por face.
 * ang = giro em graus (em torno do eixo vertical); olhaCima 0..1 = câmera de baixo (contra-plongée: topo encolhe).
 */
export const Torre3D: React.FC<{ x: number; base: number; h: number; ang: number; olhaCima?: number; ferrugem?: number; inclina?: number; id?: string }> = ({ x, base, h, ang, olhaCima = 0, ferrugem = 0, inclina = 0.18 }) => {
  const W = h * 0.23;
  const meia = (t: number) => W * Math.pow(1 - t, 1.85) + h * 0.008;
  const a = (ang * Math.PI) / 180;
  const NIV = [0, 0.07, 0.15, 0.24, 0.3, 0.4, 0.5, 0.56, 0.66, 0.76, 0.86, 0.95];
  // vértice 3D -> tela
  const proj = (px: number, t: number, pz: number): [number, number, number] => {
    const rx = px * Math.cos(a) - pz * Math.sin(a);
    const rz = px * Math.sin(a) + pz * Math.cos(a);
    const pers = 1 / (1 + olhaCima * 1.6 * t); // de baixo: o alto fica mais longe
    const persZ = 1 / (1 + rz / (h * 2.2));
    return [x + rx * pers * persZ, base - t * h * (1 - olhaCima * 0.35 * t) + rz * inclina * (1 - olhaCima), rz];
  };
  const cantos: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  type Face = { pts: [number, number][][]; z: number; luz: number; pernas: [number, number][][] };
  const faces: Face[] = [];
  for (let k = 0; k < 4; k++) {
    const [ax, az] = cantos[k];
    const [bx, bz] = cantos[(k + 1) % 4];
    const nx = (ax + bx) / 2;
    const nz = (az + bz) / 2;
    const rz = nx * Math.sin(a) + nz * Math.cos(a);
    const rx = nx * Math.cos(a) - nz * Math.sin(a);
    const luz = 0.55 + 0.45 * Math.max(0, -rx * 0.7 - rz * 0.4);
    const quads: [number, number][][] = [];
    const pernas: [number, number][][] = [];
    for (let i = 0; i < NIV.length - 1; i++) {
      const t0 = NIV[i];
      const t1 = NIV[i + 1];
      const p = (cx: number, cz: number, t: number) => proj(cx * meia(t), t, cz * meia(t));
      const q = [p(ax, az, t0), p(bx, bz, t0), p(bx, bz, t1), p(ax, az, t1)].map((v) => [v[0], v[1]] as [number, number]);
      quads.push(q);
    }
    for (let i = 0; i < NIV.length - 1; i++) {
      const t0 = NIV[i];
      const t1 = NIV[i + 1];
      const p = (cx: number, cz: number, t: number) => proj(cx * meia(t), t, cz * meia(t));
      pernas.push([p(ax, az, t0), p(ax, az, t1)].map((v) => [v[0], v[1]] as [number, number]));
    }
    faces.push({ pts: quads, z: rz, luz, pernas });
  }
  faces.sort((p, q) => p.z - q.z); // longe primeiro (z positivo = longe)
  faces.reverse();
  const corBase = ferrugem > 0.5 ? [150, 80, 46] : [138, 90, 58];
  const cor = (l: number) => `rgb(${corBase.map((c) => Math.round(c * l)).join(",")})`;
  const plataforma = (t: number, alto: number) => {
    const m = meia(t) * 1.04;
    const pts = cantos.map(([cx, cz]) => proj(cx * m, t, cz * m));
    const pts2 = cantos.map(([cx, cz]) => proj(cx * m, t - alto, cz * m));
    return (
      <g key={t}>
        <path d={`M ${pts2.map((v) => `${v[0]} ${v[1]}`).join(" L ")} Z`} fill="#6a4028" stroke={L} strokeWidth={3} />
        <path d={`M ${pts.map((v) => `${v[0]} ${v[1]}`).join(" L ")} Z`} fill="#a06a44" stroke={L} strokeWidth={4} />
      </g>
    );
  };
  const topo = proj(0, 0.96, 0);
  const ponta = proj(0, 1.06, 0);
  return (
    <g strokeLinejoin="round">
      {faces.map((fc, i) => {
        const frente = i >= 2;
        return (
          <g key={i} opacity={frente ? 1 : 0.95}>
            {fc.pts.map((q, j) => {
              // arco na base (só o primeiro trecho)
              const d = `M ${q.map((v) => `${v[0]} ${v[1]}`).join(" L ")} Z`;
              return (
                <g key={j}>
                  <path d={d} fill={cor(fc.luz * (frente ? 1 : 0.7))} fillOpacity={j === 0 ? 0.25 : frente ? 0.42 : 0.3} stroke="none" />
                  <path d={`M ${q[0][0]} ${q[0][1]} L ${q[2][0]} ${q[2][1]} M ${q[1][0]} ${q[1][1]} L ${q[3][0]} ${q[3][1]}`} stroke={cor(fc.luz * 0.62)} strokeWidth={frente ? 3.5 : 2.5} />
                  <path d={`M ${q[3][0]} ${q[3][1]} L ${q[2][0]} ${q[2][1]}`} stroke={cor(fc.luz * 0.7)} strokeWidth={3} />
                </g>
              );
            })}
            {/* arco da base da face */}
            {(() => {
              const q = fc.pts[0];
              const q2 = fc.pts[1];
              const mx = (q[0][0] + q[1][0]) / 2;
              const topoArco = [(q2[2][0] + q2[3][0]) / 2, (q2[2][1] + q2[3][1]) / 2];
              return <path d={`M ${q[0][0]} ${q[0][1]} Q ${mx + (topoArco[0] - mx) * 0.9} ${topoArco[1]} ${q[1][0]} ${q[1][1]}`} fill="none" stroke={cor(fc.luz * 0.8)} strokeWidth={frente ? 7 : 5} />;
            })()}
            {fc.pernas.map((s, j) => (
              <path key={`p${j}`} d={`M ${s[0][0]} ${s[0][1]} L ${s[1][0]} ${s[1][1]}`} stroke={L} strokeWidth={frente ? 9 : 6} strokeLinecap="round" />
            ))}
            {fc.pernas.map((s, j) => (
              <path key={`q${j}`} d={`M ${s[0][0]} ${s[0][1]} L ${s[1][0]} ${s[1][1]}`} stroke={cor(fc.luz)} strokeWidth={frente ? 5 : 3} strokeLinecap="round" />
            ))}
          </g>
        );
      })}
      {plataforma(0.3, 0.008)}
      {plataforma(0.56, 0.006)}
      <line x1={topo[0]} y1={topo[1]} x2={ponta[0]} y2={ponta[1]} stroke={L} strokeWidth={4} />
      {ferrugem > 0
        ? new Array(16).fill(0).map((_, i) => {
            const t = 0.04 + random(`f3${i}`) * 0.8;
            const s = random(`f3s${i}`) > 0.5 ? 1 : -1;
            const p = proj(s * meia(t) * (0.4 + random(`f3x${i}`) * 0.6), t, -meia(t));
            return <ellipse key={i} cx={p[0]} cy={p[1]} rx={h * 0.018} ry={h * 0.01} fill="#d0682a" opacity={Math.min(1, ferrugem * 1.4) * 0.8} />;
          })
        : null}
    </g>
  );
};

// ---------------- objetos ----------------
/** documento "oficial" com a torre e carimbo vermelho. carimbo 0..1 (aparece batendo) */
export const Documento: React.FC<{ x: number; y: number; esc?: number; rot?: number; inclina?: number; carimbo?: number; sombra?: boolean }> = ({ x, y, esc = 1, rot = 0, inclina = 0, carimbo = 1, sombra = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) skewX(${inclina * 0.4}) scale(${esc} ${esc * (1 - Math.abs(inclina) * 0.004)})`}>
    {sombra ? <rect x={-210} y={-280} width={440} height={600} rx={10} fill="#000" opacity={0.25} transform="translate(18 22)" /> : null}
    <rect x={-220} y={-300} width={440} height={600} rx={10} fill="#f3ead6" stroke={L} strokeWidth={8} />
    <path d="M 0 -270 L -22 -160 L -36 -160 L -62 -40 L -82 60 L -40 60 Q 0 -10 40 60 L 82 60 L 62 -40 L 36 -160 L 22 -160 Z" fill="#8a5a3a" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -40 -160 L 40 -160 M -66 -40 L 66 -40" stroke={L} strokeWidth={8} />
    {[-30, -110, -70].map((yy) => (
      <path key={yy} d={`M -50 ${yy} L 40 ${yy + 30} M 50 ${yy} L -40 ${yy + 30}`} stroke="#4a2e24" strokeWidth={3} opacity={0.6} />
    ))}
    {new Array(8).fill(0).map((_, i) => (
      <rect key={i} x={-170} y={-120 + i * 46} width={i % 3 === 2 ? 220 : 340} height={9} rx={4} fill="#a89a84" opacity={i < 3 ? 0 : 1} />
    ))}
    {carimbo > 0 ? (
      <g transform={`translate(110 210) scale(${1 + (1 - carimbo) * 1.5}) rotate(-12)`} opacity={Math.min(1, carimbo * 2)}>
        <circle r={74} fill="none" stroke="#d63b3b" strokeWidth={12} />
        <circle r={50} fill="none" stroke="#d63b3b" strokeWidth={6} />
        <text y={10} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={28} fill="#d63b3b">OFICIAL</text>
      </g>
    ) : null}
  </g>
);

/** envelope gordo com notas */
export const Envelope: React.FC<{ x: number; y: number; esc?: number; rot?: number }> = ({ x, y, esc = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${esc})`} stroke={L} strokeLinejoin="round">
    {[-24, -12, 0].map((dx, i) => (
      <rect key={i} x={-110 + dx * 0.4 + 30} y={-96 - i * 4} width={200} height={100} rx={8} fill={i === 2 ? "#a8cc8a" : "#94bb78"} strokeWidth={5} />
    ))}
    <circle cx={40} cy={-60} r={22} fill="none" stroke="#6a9a5a" strokeWidth={4} />
    <rect x={-140} y={-40} width={280} height={170} rx={8} fill="#d9b98a" strokeWidth={7} />
    <path d="M -140 -36 L 0 50 L 140 -36" fill="none" strokeWidth={6} />
  </g>
);

/** nota de dinheiro voando */
export const Nota: React.FC<{ x: number; y: number; rot: number; esc?: number }> = ({ x, y, rot, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${esc})`}>
    <rect x={-60} y={-30} width={120} height={60} rx={6} fill="#a8cc8a" stroke={L} strokeWidth={4} />
    <circle r={16} fill="none" stroke="#6a9a5a" strokeWidth={4} />
  </g>
);

/** carro preto de 1925 (lado). rodas giram com `roda` (graus) */
export const Carro1925: React.FC<{ x: number; y: number; esc?: number; roda?: number; balanco?: number; lado?: 1 | -1 }> = ({ x, y, esc = 1, roda = 0, balanco = 0, lado = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc * lado} ${esc})`} stroke={L} strokeLinejoin="round">
    <g transform={`translate(0 ${balanco}) rotate(${balanco * 0.4})`}>
      <path d="M -220 -60 L -220 -150 L 60 -150 Q 90 -150 100 -120 L 110 -60 L 210 -60 Q 236 -56 236 -20 L 236 10 L -236 10 L -236 -40 Q -236 -60 -220 -60 Z" fill="#1f2a3c" strokeWidth={7} />
      <rect x={-196} y={-138} width={110} height={70} rx={6} fill="#bfe0f4" strokeWidth={5} />
      <rect x={-72} y={-138} width={120} height={70} rx={6} fill="#bfe0f4" strokeWidth={5} />
      <rect x={200} y={-46} width={50} height={22} rx={6} fill="#c9a030" strokeWidth={4} />
      <circle cx={250} cy={-36} r={16} fill="#fff6cc" strokeWidth={4} />
      <path d="M -236 -10 L 236 -10" stroke="#121a28" strokeWidth={5} />
    </g>
    {[-140, 150].map((rx) => (
      <g key={rx} transform={`translate(${rx} 16) rotate(${roda})`}>
        <circle r={58} fill="#1d1424" strokeWidth={5} />
        <circle r={26} fill="#c8c8d2" strokeWidth={4} />
        <path d="M -44 0 L 44 0 M 0 -44 L 0 44" stroke="#3a3440" strokeWidth={5} />
      </g>
    ))}
  </g>
);

/** anzol + linha (cena 9). y = ponta de baixo do anzol */
export const Anzol: React.FC<{ x: number; y: number; esc?: number }> = ({ x, y, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>
    <line x1={0} y1={-3000} x2={0} y2={-200} stroke="#c8ccd8" strokeWidth={6} />
    <path d="M 0 -200 L 0 -20 Q 0 60 -70 60 Q -130 56 -136 -10 L -150 -40 L -112 -12" fill="none" stroke={L} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 -200 L 0 -20 Q 0 60 -70 60 Q -130 56 -136 -10 L -150 -40 L -112 -12" fill="none" stroke="#c4c8d4" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** peixe laranja. boca 0..1 (abre para morder) */
export const Peixe: React.FC<{ x: number; y: number; esc?: number; lado?: 1 | -1; boca?: number; f: number; bigode?: boolean }> = ({ x, y, esc = 1, lado = 1, boca = 0, f, bigode }) => {
  const cauda = Math.sin(f * 0.35) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${esc * lado} ${esc})`} stroke={L} strokeLinejoin="round">
      <path d={`M 170 0 L 280 ${-90 + cauda} L 280 ${90 + cauda} Z`} fill="#e9a04a" strokeWidth={7} />
      <ellipse cx={0} cy={0} rx={200} ry={108} fill="#e9a04a" strokeWidth={7} />
      <path d="M -60 -100 Q 0 -160 60 -100" fill="#d88a3a" strokeWidth={6} />
      <path d="M 40 -30 Q 70 0 40 30" fill="none" stroke="#c8782e" strokeWidth={6} />
      <circle cx={-110} cy={-24} r={24} fill="#ffffff" strokeWidth={5} />
      <circle cx={-116} cy={-24} r={11} fill={L} stroke="none" />
      <path d={`M -200 ${-6 - boca * 30} L -150 0 L -200 ${6 + boca * 30}`} fill={boca > 0.1 ? "#7a2a2a" : "none"} strokeWidth={6} />
      {bigode ? <path d="M -200 -20 Q -170 -50 -130 -30 Q -110 -40 -90 -26 Q -120 -6 -150 -14 Q -180 -4 -200 -20 Z" fill="#5e3e22" strokeWidth={4} /> : null}
    </g>
  );
};

/** etiqueta presa ao peito que vira (0 = frente "DIRETOR", 1 = verso "GOLPISTA") */
export const Cracha: React.FC<{ x: number; y: number; vira: number; esc?: number }> = ({ x, y, vira, esc = 1 }) => {
  const sx = Math.cos(vira * Math.PI);
  const verso = vira > 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${esc * Math.max(0.04, Math.abs(sx))} ${esc})`}>
      <rect x={-150} y={-50} width={300} height={100} rx={12} fill={verso ? "#d63b3b" : "#f3ead6"} stroke={L} strokeWidth={7} />
      <text y={20} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={58} fill={verso ? "#ffffff" : "#1d1424"}>
        {verso ? "GOLPISTA" : "DIRETOR"}
      </text>
    </g>
  );
};

/** porta da delegacia ("POLICE") */
export const PortaPolicia: React.FC<{ x: number; base: number }> = ({ x, base }) => (
  <g stroke={L} strokeLinejoin="round">
    <rect x={x - 220} y={base - 700} width={440} height={700} fill="#d6cfc0" strokeWidth={6} />
    <rect x={x - 130} y={base - 470} width={260} height={470} fill="#3a4a6a" strokeWidth={6} />
    <rect x={x - 110} y={base - 450} width={100} height={200} fill="#4a5a7a" strokeWidth={4} />
    <rect x={x + 10} y={base - 450} width={100} height={200} fill="#4a5a7a" strokeWidth={4} />
    <circle cx={x + 90} cy={base - 230} r={12} fill="#d9b24a" strokeWidth={3} />
    <rect x={x - 150} y={base - 600} width={300} height={90} rx={10} fill="#1d1424" strokeWidth={4} />
    <text x={x} y={base - 538} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={62} fill="#ffffff" stroke="none">
      POLICE
    </text>
    <circle cx={x - 180} cy={base - 520} r={26} fill="#3a6ad6" strokeWidth={4} />
  </g>
);

/** caderninho com rabiscos que crescem (escreve 0..1) */
export const Caderno: React.FC<{ x: number; y: number; esc?: number; escreve: number; rot?: number }> = ({ x, y, esc = 1, escreve, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${esc})`}>
    <rect x={-120} y={-160} width={240} height={320} rx={10} fill="#f6f1e2" stroke={L} strokeWidth={7} />
    {new Array(7).fill(0).map((_, i) => {
      const t = Math.max(0, Math.min(1, escreve * 7 - i));
      return t > 0 ? <path key={i} d={`M -90 ${-110 + i * 40} q 10 -14 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0`} stroke="#3a3a6a" strokeWidth={5} fill="none" strokeDasharray={200} strokeDashoffset={200 * (1 - t)} /> : null;
    })}
    {[-130, -60, 10, 80].map((yy) => (
      <circle key={yy} cx={-120} cy={yy} r={10} fill="#bfb8a6" stroke={L} strokeWidth={3} />
    ))}
  </g>
);

// ---------------- HUD ----------------
/** etiqueta escura arredondada com texto condensado (entra com mola: `s` 0..1+) */
export const EtiquetaHUD: React.FC<{ texto: string; x: number; y: number; s: number; cor?: string; tamanho?: number; rot?: number }> = ({ texto, x, y, s, cor = "#ffd23f", tamanho = 64, rot = 0 }) => {
  if (s <= 0.01) return null;
  const w = texto.length * tamanho * 0.5 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={Math.min(1, s * 1.5)}>
      <rect x={-w / 2} y={-tamanho * 0.85} width={w} height={tamanho * 1.5} rx={tamanho * 0.32} fill="#1d1424" opacity={0.88} />
      <text y={tamanho * 0.32} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={tamanho} fill={cor} letterSpacing={1}>
        {texto}
      </text>
    </g>
  );
};

/** carimbo grande (PROVISÓRIA / URGENTE): vem de perto da câmera (z) e bate. t = quadros desde o início */
export const Carimbo: React.FC<{ texto: string; x: number; y: number; t: number; rot?: number; tamanho?: number }> = ({ texto, x, y, t, rot = -10, tamanho = 120 }) => {
  if (t < 0) return null;
  const chega = 7;
  const s = t < chega ? interpolate(t, [0, chega], [3.2, 1], { easing: (v) => v * v }) : 1 + Math.max(0, 0.08 - (t - chega) * 0.02);
  const w = texto.length * tamanho * 0.52 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={Math.min(1, t / 3)}>
      <rect x={-w / 2} y={-tamanho * 0.78} width={w} height={tamanho * 1.36} rx={14} fill="none" stroke="#e04848" strokeWidth={14} />
      <text y={tamanho * 0.36} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={tamanho} fill="#e04848" letterSpacing={3}>
        {texto}
      </text>
    </g>
  );
};

/** número com volume (extrudado dourado), entra do fundo: prog 0..1 */
export const Numero3D: React.FC<{ texto: string; sub?: string; x: number; y: number; prog: number; tamanho?: number }> = ({ texto, sub, x, y, prog, tamanho = 170 }) => {
  if (prog <= 0) return null;
  const s = 0.15 + 0.85 * prog;
  const camadas = 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, prog * 2)}>
      <rect x={-380} y={-tamanho * 0.9} width={760} height={tamanho * 1.35 + (sub ? 70 : 0)} rx={34} fill="#1d1424" opacity={0.85} />
      {new Array(camadas).fill(0).map((_, i) => (
        <text key={i} x={camadas - i} y={tamanho * 0.32 + (camadas - i) * 1.4} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={tamanho} fill={i === camadas - 1 ? "#ffd23f" : `rgb(${120 + i * 8},${80 + i * 6},20)`}>
          {texto}
        </text>
      ))}
      <text y={tamanho * 0.32} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={tamanho} fill="none" stroke="#fff6c8" strokeWidth={2} opacity={0.6}>
        {texto}
      </text>
      {sub ? (
        <text y={tamanho * 0.32 + 76} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={52} fill="#f4f1ea" letterSpacing={4}>
          {sub}
        </text>
      ) : null}
    </g>
  );
};
