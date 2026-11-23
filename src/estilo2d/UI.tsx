import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTE_ROTULO } from "../estilo/fontes";

export const LARANJA = "#ff9b2f";
export const AMARELO = "#ffd23f";
const ESCURO = "#1d1424";

// ---------- legenda palavra por palavra ----------

export type Palavra = { texto: string; de: number; ate: number; destaque?: boolean };

/** distribui as palavras de uma frase entre `de` e `ate` (peso pelo tamanho). *palavra* = destaque */
export const frase = (texto: string, de: number, ate: number): Palavra[] => {
  const ws = texto.split(" ").filter(Boolean);
  const pesos = ws.map((w) => 2 + w.replace(/\*/g, "").length);
  const total = pesos.reduce((a, b) => a + b, 0);
  let t = de;
  return ws.map((w, i) => {
    const dur = ((ate - de) * pesos[i]) / total;
    const p: Palavra = {
      texto: w.replace(/\*/g, ""),
      de: Math.round(t),
      ate: Math.round(t + dur),
      destaque: w.includes("*"),
    };
    t += dur;
    return p;
  });
};

export const LegendaPalavra: React.FC<{ palavras: Palavra[]; y?: number; tamanho?: number }> = ({ palavras, y = 1620, tamanho = 104 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = palavras.find((w) => f >= w.de && f < w.ate);
  if (!p) return null;
  const s = spring({ frame: f - p.de, fps, config: { damping: 12, stiffness: 320 }, durationInFrames: 7 });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        width: "100%",
        textAlign: "center",
        fontFamily: FONTE_ROTULO,
        fontWeight: 700,
        fontSize: tamanho,
        color: p.destaque ? LARANJA : "#ffffff",
        WebkitTextStroke: `${Math.round(tamanho / 8.5)}px ${ESCURO}`,
        paintOrder: "stroke fill",
        textShadow: "0 8px 0 rgba(29,20,36,0.55)",
        transform: `translateY(-50%) scale(${0.7 + 0.3 * s})`,
      }}
    >
      {p.texto}
    </div>
  );
};

// ---------- selo no topo ("capítulo") ----------

export const Selo: React.FC<{ texto: string; de: number; ate?: number; cor?: string; y?: number }> = ({
  texto,
  de,
  ate = 99999,
  cor = "#2e9b6a",
  y = 190,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < de || f >= ate + 8) return null;
  const entra = spring({ frame: f - de, fps, config: { damping: 11 } });
  const sai = interpolate(f, [ate, ate + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = entra * sai;
  return (
    <div style={{ position: "absolute", top: y, width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONTE_ROTULO,
          fontWeight: 700,
          fontSize: 46,
          color: "#fff",
          background: cor,
          padding: "12px 34px",
          borderRadius: 16,
          border: `5px solid ${ESCURO}`,
          boxShadow: `0 7px 0 ${ESCURO}`,
          transform: `scale(${s}) rotate(${(1 - entra) * -6}deg)`,
          letterSpacing: 1,
        }}
      >
        {texto}
      </div>
    </div>
  );
};

// ---------- etiqueta com nome (aponta pro personagem) ----------

export const Etiqueta: React.FC<{ texto: string; x: number; y: number; de: number; ate?: number; cor?: string }> = ({
  texto,
  x,
  y,
  de,
  ate = 99999,
  cor = "#2f6fd6",
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < de || f >= ate + 6) return null;
  const s = spring({ frame: f - de, fps, config: { damping: 9, stiffness: 180 } });
  const sai = interpolate(f, [ate, ate + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flutua = Math.sin(f * 0.15) * 6;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + flutua,
        transform: `translate(-50%, -100%) scale(${s * sai})`,
        transformOrigin: "50% 100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONTE_ROTULO,
          fontWeight: 700,
          fontSize: 50,
          color: "#fff",
          background: cor,
          padding: "6px 26px",
          borderRadius: 14,
          border: `5px solid ${ESCURO}`,
        }}
      >
        {texto}
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "16px solid transparent",
          borderRight: "16px solid transparent",
          borderTop: `20px solid ${ESCURO}`,
          marginTop: -2,
        }}
      />
    </div>
  );
};

// ---------- placar / contador ----------

export const Placar: React.FC<{ titulo: string; valor: string; x: number; y: number; de: number; ate?: number }> = ({
  titulo,
  valor,
  x,
  y,
  de,
  ate = 99999,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < de || f >= ate + 6) return null;
  const s = spring({ frame: f - de, fps, config: { damping: 12 } });
  const sai = interpolate(f, [ate, ate + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s * sai})`,
        background: "#262233",
        border: `5px solid ${ESCURO}`,
        borderRadius: 18,
        padding: "10px 28px 6px",
        textAlign: "center",
        boxShadow: `0 7px 0 ${ESCURO}`,
      }}
    >
      <div style={{ fontFamily: FONTE_ROTULO, fontWeight: 700, fontSize: 28, color: "#a9a3bf", letterSpacing: 2 }}>{titulo}</div>
      <div style={{ fontFamily: FONTE_ROTULO, fontWeight: 700, fontSize: 84, color: AMARELO, lineHeight: 1.05 }}>{valor}</div>
    </div>
  );
};

// ---------- rótulo solto (texto com contorno que "pula" na tela) ----------
export const Rotulo2: React.FC<{ texto: string; x: number; y: number; de: number; tamanho?: number; cor?: string }> = ({
  texto,
  x,
  y,
  de,
  tamanho = 72,
  cor = AMARELO,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < de) return null;
  const s = spring({ frame: f - de, fps, config: { damping: 9, stiffness: 220 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s}) rotate(${Math.sin((f - de) * 0.2) * 3}deg)`,
        fontFamily: FONTE_ROTULO,
        fontWeight: 700,
        fontSize: tamanho,
        color: cor,
        WebkitTextStroke: `${Math.round(tamanho / 9)}px ${ESCURO}`,
        paintOrder: "stroke fill",
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

// ---------- conquista desbloqueada (estilo jogo) ----------
export const Conquista: React.FC<{ texto: string; de: number; ate: number; icone?: string; cor?: string }> = ({ texto, de, ate, icone = "★", cor = "#2e9b6a" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < de || f > ate + 10) return null;
  const entra = spring({ frame: f - de, fps, config: { damping: 12, stiffness: 160 } });
  const sai = interpolate(f, [ate, ate + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brilho = interpolate((f - de) % 30, [0, 15, 30], [0.6, 1, 0.6]);
  return (
    <div style={{ position: "absolute", top: 300 - sai * 500, width: "100%", display: "flex", justifyContent: "center", transform: `scale(${entra})` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          background: "#1f1a2e",
          border: `7px solid ${AMARELO}`,
          borderRadius: 26,
          padding: "22px 40px",
          boxShadow: `0 0 ${40 * brilho}px ${AMARELO}, 0 10px 0 ${ESCURO}`,
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 999,
            background: cor,
            border: `6px solid ${ESCURO}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 70,
            color: "#fff",
            fontFamily: FONTE_ROTULO,
            fontWeight: 700,
          }}
        >
          {icone}
        </div>
        <div>
          <div style={{ fontFamily: FONTE_ROTULO, fontWeight: 700, fontSize: 34, color: AMARELO, letterSpacing: 3 }}>DESBLOQUEADO!</div>
          <div style={{ fontFamily: FONTE_ROTULO, fontWeight: 700, fontSize: 64, color: "#fff", lineHeight: 1.05 }}>{texto}</div>
        </div>
      </div>
    </div>
  );
};

// ---------- contagem regressiva gigante ----------
export const Contagem: React.FC<{ numeros: { n: string; de: number }[]; ate: number }> = ({ numeros, ate }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const atual = [...numeros].reverse().find((x) => f >= x.de);
  if (!atual || f > ate) return null;
  const s = spring({ frame: f - atual.de, fps, config: { damping: 8, stiffness: 240 } });
  return (
    <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", fontFamily: FONTE_ROTULO, fontWeight: 700, fontSize: 420, color: "#fff", WebkitTextStroke: `28px ${ESCURO}`, paintOrder: "stroke fill", transform: `scale(${0.4 + s * 0.6}) rotate(${(1 - s) * -20}deg)` }}>
      {atual.n}
    </div>
  );
};

// ---------- balão de fala ----------
export const Balao: React.FC<{ texto: string; x: number; y: number; de: number; ate: number; ponta?: "esq" | "dir" }> = ({ texto, x, y, de, ate, ponta = "esq" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < de || f > ate) return null;
  const s = spring({ frame: f - de, fps, config: { damping: 11, stiffness: 220 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -100%) scale(${s})`, transformOrigin: ponta === "esq" ? "20% 100%" : "80% 100%" }}>
      <div style={{ background: "#fff", border: `6px solid ${ESCURO}`, borderRadius: 40, padding: "18px 34px", fontFamily: FONTE_ROTULO, fontWeight: 700, fontSize: 52, color: ESCURO, maxWidth: 760, textAlign: "center", lineHeight: 1.1 }}>
        {texto}
      </div>
      <div style={{ position: "absolute", bottom: -30, [ponta === "esq" ? "left" : "right"]: 70, width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: `36px solid ${ESCURO}` }} />
    </div>
  );
};
