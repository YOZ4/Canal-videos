import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Diretor de câmera em espaço de TELA (por cima da câmera da cena): enquadramento, crash zoom, ângulo holandês,
 * câmera baixa, chicote com borrão, tremida, flash, faixas de cinema e linhas de velocidade.
 * Tudo é função do quadro (determinístico). Use em volta de uma cena pronta: <Diretor planos={...}>{cena}</Diretor>
 *
 * Regras de uso (direção):
 *  - um movimento de câmera por intenção: push = tensão, crash = impacto/surpresa, holandês = caos/velocidade,
 *    baixa = poder/peso, abrir = revelar/respirar;
 *  - crash zoom e tremida só no quadro do impacto (não antes); depois sempre assenta com mola;
 *  - chicote só na troca de plano (4–8 quadros), nunca no meio da ação.
 */

export type Curva = (t: number) => number;

/** plano: valores de câmera interpolados entre `de` e `ate` (zoom, deslocamento em px de tela, rotação em graus) */
export type Plano = {
  de: number;
  ate: number;
  zoom?: [number, number];
  x?: [number, number];
  y?: [number, number];
  rot?: [number, number];
  /** ponto de foco do zoom na tela (0..1); padrão centro */
  foco?: [number, number];
  curva?: Curva;
};

export type Efeito =
  | { tipo: "crash"; em: number; forca?: number; foco?: [number, number] }
  | { tipo: "treme"; em: number; dur?: number; forca?: number }
  | { tipo: "chicote"; em: number; dur?: number; dir?: 1 | -1 }
  | { tipo: "flash"; em: number; dur?: number; cor?: string }
  | { tipo: "inverte"; em: number; dur?: number }
  | { tipo: "faixas"; de: number; ate: number; tam?: number }
  | { tipo: "velocidade"; de: number; ate: number; dir?: 1 | -1; forca?: number };

const ip = (f: number, a: number[], b: number[], easing?: Curva) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** estado de câmera no quadro f a partir dos planos (o último plano que começou manda; fora deles = neutro) */
export const camDiretor = (f: number, planos: Plano[]) => {
  const p = [...planos].reverse().find((q) => f >= q.de);
  if (!p) return { zoom: 1, x: 0, y: 0, rot: 0, foco: [0.5, 0.5] as [number, number] };
  const c = p.curva ?? Easing.inOut(Easing.cubic);
  const v = (par?: [number, number], neutro = 0) => (par ? ip(f, [p.de, p.ate], par, c) : neutro);
  return { zoom: v(p.zoom, 1), x: v(p.x), y: v(p.y), rot: v(p.rot), foco: p.foco ?? ([0.5, 0.5] as [number, number]) };
};

/** menor zoom ≥ z em que a cena transformada cobre a tela inteira */
export const zoomQueCobre = (z: number, rot: number, x: number, y: number, ox: number, oy: number, w: number, h: number) => {
  const a = (-rot * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const cobre = (zz: number) =>
    [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h],
    ].every(([qx, qy]) => {
      const dx = qx - ox - x;
      const dy = qy - oy - y;
      const px = ox + (dx * c - dy * s) / zz;
      const py = oy + (dx * s + dy * c) / zz;
      return px >= -0.5 && px <= w + 0.5 && py >= -0.5 && py <= h + 0.5;
    });
  let zz = z;
  for (let i = 0; i < 200 && !cobre(zz); i++) zz *= 1.005;
  return zz;
};

export const Diretor: React.FC<{ planos: Plano[]; efeitos?: Efeito[]; fundo?: string; children: React.ReactNode }> = ({ planos, efeitos = [], fundo = "#000", children }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const c = camDiretor(f, planos);
  let zoom = c.zoom;
  let x = c.x;
  let y = c.y;
  let rot = c.rot;
  let blur = 0;
  let foco = c.foco;
  let flash: { op: number; cor: string } | null = null;
  let inverte = false;
  let faixas = 0;
  const vel: { forca: number; dir: number }[] = [];
  for (const e of efeitos) {
    if (e.tipo === "crash" && f >= e.em - 1) {
      // entra seco em 2 quadros e assenta com mola (passa um pouco do ponto)
      const s = spring({ frame: f - e.em, fps, config: { mass: 0.6, stiffness: 220, damping: 12 } });
      const pico = ip(f, [e.em - 1, e.em + 1], [0, 1]);
      zoom *= 1 + (e.forca ?? 0.35) * pico * (1 - s * 0.85);
      if (e.foco && f < e.em + 40) foco = e.foco;
    }
    if (e.tipo === "treme" && f >= e.em && f < e.em + (e.dur ?? 8)) {
      const k = (e.forca ?? 18) * (1 - (f - e.em) / (e.dur ?? 8));
      x += (random(`dtx${f}`) - 0.5) * 2 * k;
      y += (random(`dty${f}`) - 0.5) * 2 * k;
      rot += (random(`dtr${f}`) - 0.5) * k * 0.08;
    }
    if (e.tipo === "chicote") {
      const d = e.dur ?? 6;
      if (f >= e.em - d && f < e.em + d) {
        const t = (f - e.em) / d; // -1..1: sai pra um lado antes do corte, entra do outro depois
        const dir = e.dir ?? -1;
        blur = Math.max(blur, (1 - Math.abs(t)) * 34);
        x += t < 0 ? dir * 380 * (1 + t) : -dir * 380 * (1 - t);
      }
    }
    if (e.tipo === "flash" && f >= e.em && f < e.em + (e.dur ?? 6)) flash = { op: ip(f, [e.em, e.em + (e.dur ?? 6)], [0.95, 0]), cor: e.cor ?? "#fff" };
    if (e.tipo === "inverte" && f >= e.em && f < e.em + (e.dur ?? 2)) inverte = true;
    if (e.tipo === "faixas" && f >= e.de - 10 && f < e.ate + 10) faixas = Math.max(faixas, ip(f, [e.de - 10, e.de, e.ate, e.ate + 10], [0, 1, 1, 0], Easing.inOut(Easing.cubic)) * (e.tam ?? 170));
    if (e.tipo === "velocidade" && f >= e.de && f < e.ate) vel.push({ forca: (e.forca ?? 1) * ip(f, [e.de, e.de + 6, e.ate - 6, e.ate], [0, 1, 1, 0]), dir: e.dir ?? 1 });
  }
  const ox = foco[0] * width;
  const oy = foco[1] * height;
  // nunca mostrar borda: aumenta o zoom até os 4 cantos da tela caírem dentro da cena (considera foco fora do
  // centro, rotação e deslocamento — a conta antiga ignorava o foco e deixava aparecer faixa preta)
  if (blur < 0.5) zoom = zoomQueCobre(zoom, rot, x, y, ox, oy, width, height);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${ox}px ${oy}px`,
          transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${zoom})`,
          background: fundo,
          filter: `${blur > 0.5 ? `blur(${blur}px)` : ""} ${inverte ? "invert(1) hue-rotate(180deg)" : ""}`.trim() || undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {vel.length ? (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {vel.map((v, j) =>
            new Array(16).fill(0).map((_, i) => {
              const yy = random(`vy${i}`) * height;
              const len = 200 + random(`vl${i}`) * 400;
              const off = ((f * (60 + random(`vv${i}`) * 50) + random(`vo${i}`) * width) % (width + len)) - len;
              const xx = v.dir > 0 ? width - off : off;
              return <rect key={`${j}-${i}`} x={xx} y={yy} width={len} height={3 + random(`vh${i}`) * 6} rx={3} fill="#fff" opacity={0.55 * v.forca} />;
            }),
          )}
        </svg>
      ) : null}
      {faixas > 0 ? (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: faixas, background: "#000" }} />
          <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: faixas, background: "#000" }} />
        </>
      ) : null}
      {flash ? <AbsoluteFill style={{ background: flash.cor, opacity: flash.op }} /> : null}
    </AbsoluteFill>
  );
};
