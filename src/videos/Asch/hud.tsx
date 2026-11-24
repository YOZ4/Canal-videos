import { Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { FONTE_HUD, FONTE_ROTULO } from "../../estilo/fontes";
import { entrada, estiloCss, compoe, saida, pulso, conta, flutua } from "../../estilo2d/coreografia";
import { FPS, LEGENDAS } from "./tempo";

/** HUD do Asch (copiado do Egito): caixa roxa translúcida, fonte Anton, número amarelo. Tudo em frames ABSOLUTOS do vídeo.
 * HUD do canal: caixa roxa translúcida, fonte Anton, número amarelo. Tudo em frames ABSOLUTOS do vídeo. */
const AMARELO = "#ffd83a";
const ESCURO = "#1f1429";

const Caixa: React.FC<{ children: React.ReactNode; y: number; estilo?: React.CSSProperties }> = ({ children, y, estilo }) => (
  <div style={{ position: "absolute", top: y, width: "100%", display: "flex", justifyContent: "center", ...estilo }}>
    <div
      style={{
        background: "rgba(59,36,84,0.78)",
        border: "5px solid rgba(255,255,255,0.18)",
        borderRadius: 26,
        padding: "14px 34px 18px",
        boxShadow: "0 10px 0 rgba(20,10,30,0.45)",
        textAlign: "center",
        fontFamily: FONTE_HUD,
        color: "#fff",
        letterSpacing: 1,
      }}
    >
      {children}
    </div>
  </div>
);

/** contador: rótulo + número que corre de `deN` até `ateN` (desacelera no fim) */
export const Contador: React.FC<{ rotulo: string; de: number; dur: number; deN: number; ateN: number; ate: number; y?: number; cor?: string; sufixo?: string; t0?: number }> = ({
  t0 = 0,
  rotulo,
  de,
  dur,
  deN,
  ateN,
  ate,
  y = 230,
  cor = AMARELO,
  sufixo = "",
}) => {
  const f = useCurrentFrame() + t0;
  if (f < de - 2 || f > ate + 12) return null;
  const e = compoe(entrada(f, de, "estoura", { fps: FPS }), flutua(f / 2, 3, 3), saida(f, ate, "encolhe", 10));
  const v = Math.round(conta(f, de + 6, dur, ateN, deN));
  const chegou = f >= de + 6 + dur;
  const s = chegou ? pulso(f, de + 6 + dur, 0.14) : 1;
  return (
    <Caixa y={y} estilo={estiloCss(e)}>
      <div style={{ fontSize: 44, opacity: 0.9 }}>{rotulo}</div>
      <div style={{ fontSize: 150, lineHeight: 1, color: cor, transform: `scale(${s})`, textShadow: `0 6px 0 ${ESCURO}` }}>
        {v}
        {sufixo}
      </div>
    </Caixa>
  );
};

/** etiqueta com pop de escala (e brilho opcional) */
export const Etiqueta: React.FC<{ texto: string; de: number; ate: number; y?: number; brilho?: boolean; tam?: number; cor?: string; t0?: number }> = ({ texto, de, ate, y = 250, brilho, tam = 64, cor = "#fff", t0 = 0 }) => {
  const f = useCurrentFrame() + t0;
  if (f < de - 2 || f > ate + 12) return null;
  const e = compoe(entrada(f, de, "estoura", { fps: FPS }), flutua(f / 2, 5, 2.5), saida(f, ate, "encolhe", 10));
  const luz = brilho ? 0.5 + 0.5 * Math.sin((f - de) * 0.12) : 0;
  return (
    <Caixa y={y} estilo={estiloCss(e)}>
      <div style={{ fontSize: tam, color: cor, textShadow: brilho ? `0 0 ${20 + luz * 30}px rgba(255,216,58,${0.5 + luz * 0.4})` : undefined }}>{texto}</div>
    </Caixa>
  );
};

/** carimbo "RITUAL?" que entra girando, bate e depois é riscado */
export const Carimbo: React.FC<{ texto: string; de: number; risca: number; x: number; y: number; t0?: number }> = ({ texto, de, risca, x, y, t0 = 0 }) => {
  const f = useCurrentFrame() + t0;
  if (f < de) return null;
  const s = spring({ frame: f - de, fps: FPS, config: { mass: 0.7, stiffness: 260, damping: 13 } });
  const esc = interpolate(s, [0, 1], [2.6, 1]);
  const rot = interpolate(s, [0, 1], [-50, -12]);
  const r = interpolate(f, [risca, risca + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${esc})`, opacity: Math.min(1, s * 2) }}>
      <div
        style={{
          fontFamily: FONTE_HUD,
          fontSize: 130,
          color: "#d8342c",
          border: "12px solid #d8342c",
          borderRadius: 18,
          padding: "0 30px",
          background: "rgba(255,240,220,0.35)",
          letterSpacing: 4,
          position: "relative",
        }}
      >
        {texto}
        <div style={{ position: "absolute", left: -20, top: "52%", height: 22, width: `${r * 110}%`, background: ESCURO, borderRadius: 11, transform: "rotate(-8deg)" }} />
      </div>
    </div>
  );
};

/** legenda palavra por palavra (destaques maiores, maiúsculas e amarelas) */
export const Legenda: React.FC<{ y?: number }> = ({ y = 1400 }) => {
  const f = useCurrentFrame();
  const p = LEGENDAS.find((w) => f >= w.de && f < w.ate);
  if (!p) return null;
  const tam = p.destaque ? 132 : 100;
  const s = spring({ frame: f - p.de, fps: FPS, config: { damping: 12, stiffness: 300 }, durationInFrames: 12 });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        width: "100%",
        textAlign: "center",
        fontFamily: FONTE_ROTULO,
        fontWeight: 700,
        fontSize: tam,
        color: p.destaque ? AMARELO : "#fff",
        textTransform: p.destaque ? "uppercase" : "none",
        WebkitTextStroke: `${Math.round(tam / 8.5)}px ${ESCURO}`,
        paintOrder: "stroke fill",
        textShadow: `0 8px 0 rgba(31,20,41,0.55)`,
        transform: `translateY(-50%) scale(${0.72 + 0.28 * s})`,
      }}
    >
      {p.texto}
    </div>
  );
};

/** rótulo + valor grande (ex.: "SOZINHO, ERRA" / "< 1%") */
export const Valor: React.FC<{ rotulo: string; valor: string; de: number; ate: number; y?: number; cor?: string; t0?: number }> = ({ rotulo, valor, de, ate, y = 230, cor = AMARELO, t0 = 0 }) => {
  const f = useCurrentFrame() + t0;
  if (f < de - 2 || f > ate + 12) return null;
  const e = compoe(entrada(f, de, "estoura", { fps: FPS }), flutua(f / 2, 3, 3), saida(f, ate, "encolhe", 10));
  const s = pulso(f, de + 10, 0.14);
  return (
    <Caixa y={y} estilo={estiloCss(e)}>
      <div style={{ fontSize: 50, opacity: 0.92 }}>{rotulo}</div>
      <div style={{ fontSize: 150, lineHeight: 1, color: cor, transform: `scale(${s})`, textShadow: `0 6px 0 ${ESCURO}` }}>{valor}</div>
    </Caixa>
  );
};
