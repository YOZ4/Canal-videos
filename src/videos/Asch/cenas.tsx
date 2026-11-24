import { AbsoluteFill, interpolate, random, spring, useCurrentFrame } from "remotion";
import { Boneco2D, POSE_BASE, posCabeca, posMao, ROSTO_BASE, type Pose } from "../../estilo2d/Boneco2D";
import { CURVA, k, piscar, respira, type Curva } from "../../estilo2d/anim";
import { CONTORNO } from "../../estilo2d/personagens";
import { Palco } from "../Cacadores/comum";
import { ALIADO, ALIADO_SOBE, ANIM, C01_SOBE, CEDE, EST, EST_FINAL, Fileira, ZOM } from "./atores";
import { ATORES, ESTUDANTE, ZOMBADOR } from "./elenco";
import { Etiqueta, Valor } from "./hud";
import { CARTAO, LUGAR, Luz, LUZ, linhaCartao, mistura, Sala, type ModoLuz } from "./sala";
import { FPS, T } from "./tempo";

/**
 * Cenas C01–C11 do "Experimento de Asch" (Roteiro 1). Cada cena recebe t0 (quadro absoluto em que começa) e trabalha
 * em quadros ABSOLUTOS (f = local + t0), então tudo bate com a legenda e com a camada de naturalidade.
 */
type CamV = { x: number; y: number; zoom: number };
type CK = [number, CamV, Curva?];
const S = CURVA.suave;
/** câmera por keyframes (zoom interpolado em escala log = movimento de lente natural) */
const camK = (f: number, keys: CK[]): CamV => ({
  x: k(f, keys.map(([t, c, cv]) => [t, c.x, cv])),
  y: k(f, keys.map(([t, c, cv]) => [t, c.y, cv])),
  zoom: Math.exp(k(f, keys.map(([t, c, cv]) => [t, Math.log(c.zoom), cv]))),
});
const mixCam = (a: CamV, b: CamV, t: number): CamV => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t) });
const mola = (f: number, de: number, cfg = { mass: 1, stiffness: 90, damping: 15 }) => (f < de ? 0 : spring({ frame: f - de, fps: FPS, config: cfg }));
const ip = (f: number, a: number[], b: number[], easing?: Curva) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
const useF = (t0: number) => useCurrentFrame() + t0;

/** rosto (mundo) de quem está no lugar i */
const rostoMundo = (i: number, f: number) => {
  const [x, y] = posCabeca(ANIM.pose(`p${i}`, f));
  return { x, y };
};
/** câmera fixa do close no cartão A (1º quadro = último quadro: loop) */
const A = linhaCartao("A");
export const CAM_LOOP: CamV = { x: A.x + 30, y: (A.y0 + A.y1) / 2 + 20, zoom: 1.8 };

const Quadro: React.FC<{ cam: CamV; f: number; luz: ModoLuz; cartao?: React.ComponentProps<typeof Sala>["cartao"]; children?: React.ReactNode; so?: number[]; semPesq?: boolean; tremor?: number }> = ({ cam, f, luz, cartao, children, so, semPesq, tremor = 0 }) => {
  const tx = tremor ? (random(`tx${f}`) - 0.5) * tremor : 0;
  const ty = tremor ? (random(`ty${f}`) - 0.5) * tremor : 0;
  return (
    <AbsoluteFill>
      <Palco cam={{ ...cam, x: cam.x + tx / cam.zoom, y: cam.y + ty / cam.zoom }} parado>
        <Sala f={f} cartao={cartao} luz={luz === LUZ.quente ? 1 : 0.4} />
        <Fileira f={f} so={so} semPesq={semPesq} />
        {children}
      </Palco>
      <Luz m={luz} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ C01 · 0–288
export const C01: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const abre = mola(f, C01_SOBE, { mass: 1.1, stiffness: 70, damping: 15 });
  const fechado = { ...CAM_LOOP, zoom: 1.8 + ip(f, [0, C01_SOBE], [0, 0.06]) };
  const cam = mixCam(fechado, { x: 1050, y: 1120, zoom: 0.72 }, abre);
  return <Quadro f={f} cam={cam} luz={LUZ.quente} cartao={{ anelA: ip(f, [18, 58], [0, 1], CURVA.sai) }} so={[0, 1, 2, 3, 4, 5, 6]} semPesq />;
};

// ------------------------------------------------------------------ C02 · 288–624
export const C02: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const z = rostoMundo(ZOM, f);
  const push = T("Tá precisando");
  const cam = camK(f, [
    [288, { x: 1925, y: 1120, zoom: 1.55 }],
    [push - 6, { x: 1925, y: 1115, zoom: 1.62 }, S],
    [push + 34, { x: z.x + 40, y: z.y + 90, zoom: 1.75 }, CURVA.sai],
    [624, { x: z.x + 30, y: z.y + 90, zoom: 1.82 }, S],
  ]);
  return <Quadro f={f} cam={cam} luz={LUZ.quente} semPesq so={[5, 6, 7]} />;
};

// ------------------------------------------------------------------ C03 · 624–912
export const C03: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const cam = camK(f, [
    [624, { x: 2380, y: 860, zoom: 0.6 }],
    [912, { x: 1300, y: 900, zoom: 0.6 }, S],
  ]);
  return (
    <>
      <Quadro f={f} cam={cam} luz={LUZ.quente} />
      <Etiqueta t0={t0} texto="EUA • 1951" de={642} ate={900} y={260} tam={96} />
    </>
  );
};

// ------------------------------------------------------------------ C04 · 912–1434
export const C04: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const ref = linhaCartao("ref");
  const b = linhaCartao("B");
  const qual = T("qual tem");
  const so = T("Sozinha");
  const meio = (q: { y0: number; y1: number }) => (q.y0 + q.y1) / 2 + 30;
  const cam = camK(f, [
    [912, { x: CARTAO.x, y: CARTAO.y + 40, zoom: 1.22 }],
    [qual - 20, { x: CARTAO.x, y: CARTAO.y + 40, zoom: 1.3 }, S],
    [qual, { x: ref.x + 40, y: meio(ref), zoom: 1.75 }, CURVA.sai],
    [qual + 60, { x: b.x - 20, y: meio(b), zoom: 1.75 }, S],
    [so + 10, { x: b.x - 60, y: meio(b), zoom: 1.7 }, S],
    [so + 50, { x: CARTAO.x, y: CARTAO.y + 230, zoom: 1.1 }, S],
    [1434, { x: CARTAO.x, y: CARTAO.y + 220, zoom: 1.14 }, S],
  ]);
  return (
    <>
      <Quadro f={f} cam={cam} luz={LUZ.quente} cartao={{ regua: ip(f, [qual + 6, qual + 62], [0, 1], CURVA.suave), anelB: ip(f, [qual + 60, qual + 90], [0, 1], CURVA.sai) }} semPesq />
      <Valor t0={t0} rotulo="SOZINHO, ERRA" valor="< 1%" de={T("menos de um")} ate={1430} y={1060} />
    </>
  );
};

// ------------------------------------------------------------------ C05 · 1434–1920
export const C05: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const e = rostoMundo(EST, f);
  const r3 = T("Na terceira");
  const certa = T("Ele fala a certa") - 14;
  const sala = T("A sala inteira") - 4;
  const snap = T("vira pra ele") - 4;
  // planos: rodada 1 (médio) → rodada 3 (pan acompanhando a cascata de A) → estudante ergue o B → aberto pra onda de
  // cabeças → zoom rápido (6 quadros, com overshoot) no estudante
  let cam: CamV;
  if (f < r3) cam = camK(f, [[1434, { x: 1330, y: 1110, zoom: 0.95 }], [r3, { x: 1350, y: 1105, zoom: 1.02 }, S]]);
  else if (f < certa) cam = camK(f, [[r3, { x: 640, y: 1110, zoom: 0.98 }], [certa, { x: 1460, y: 1110, zoom: 0.98 }, S]]);
  else if (f < sala) cam = camK(f, [[certa, { x: 1925, y: 1120, zoom: 1.45 }], [sala, { x: 1950, y: 1115, zoom: 1.52 }, S]]);
  else {
    const s = f < snap ? 0 : spring({ frame: f - snap, fps: FPS, config: { mass: 0.5, stiffness: 320, damping: 16 } });
    cam = mixCam(camK(f, [[sala, { x: 1450, y: 1100, zoom: 0.78 }], [snap, { x: 1480, y: 1100, zoom: 0.8 }, S]]), { x: e.x - 40, y: e.y + 150, zoom: 1.6 }, s);
  }
  return (
    <>
      <Quadro f={f} cam={cam} luz={LUZ.quente} tremor={f >= snap && f < snap + 8 ? 10 : 0} />
      <Etiqueta t0={t0} texto="RODADA 1 / 18" de={1440} ate={r3 - 6} y={230} />
      <Etiqueta t0={t0} texto="RODADA 3 / 18" de={r3} ate={1915} y={230} />
    </>
  );
};

// ------------------------------------------------------------------ C06 · 1920–2286
const NUCA = T("Ele sente o suor");
const COCHICHO = T("O do lado cochicha");
/** gota de suor escorrendo pela nuca (deixa um rastro molhado) */
const GotaNuca: React.FC<{ x: number; y: number; f: number; de: number }> = ({ x, y, f, de }) => {
  if (f < de) return null;
  const u = f - de;
  const desce = 120 * CURVA.suave(Math.min(1, u / 70)) + Math.max(0, u - 70) * 0.25;
  const forma = 1 + Math.sin(u * 0.4) * 0.05;
  return (
    <g>
      <path d={`M ${x} ${y} L ${x + 2} ${y + desce}`} stroke="#bfe6ff" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
      <g transform={`translate(${x + 2} ${y + desce}) scale(${0.55 * forma} ${0.55 / forma})`}>
        <path d="M 0 -60 Q 34 -6 22 24 Q 0 48 -22 24 Q -34 -6 0 -60 Z" fill="#9fd8ff" stroke={CONTORNO} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -8 -10 Q -14 8 -6 18" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
};
export const C06: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const e = rostoMundo(EST, f);
  const z = rostoMundo(ZOM, f);
  const luz = mistura(LUZ.quente, LUZ.fria, ip(f, [1920, 2100], [0.4, 1]));
  // close extremo na nuca: o estudante de costas (mesmo lugar), câmera bem perto
  if (f >= NUCA - 10 && f < COCHICHO - 4) {
    const p0 = ANIM.pose(`p${EST}`, f);
    const costas: Pose = { ...p0, vista: "costas", vira: 0, bracoD: { ombro: 14, cotovelo: -20 } };
    const [hx, hy] = posCabeca(costas);
    const nucaY = hy + 70;
    const cam = camK(f, [
      [NUCA - 10, { x: hx + 10, y: nucaY + 40, zoom: 2.9 }],
      [COCHICHO - 4, { x: hx + 6, y: nucaY + 80, zoom: 3.15 }, S],
    ]);
    const batida = Math.max(0, Math.sin(((f - NUCA) / FPS) * Math.PI * 2 * 1.5)) ** 8;
    return (
      <AbsoluteFill>
        <Palco cam={{ ...cam, zoom: cam.zoom * (1 + batida * 0.008) }} parado>
          <rect x={-3000} y={-3000} width={9000} height={9000} fill="#c7b58c" />
          <rect x={-3000} y={1330} width={9000} height={3000} fill="#8a5a3c" />
          <Boneco2D id="nuca" d={ESTUDANTE} pose={costas} rosto={ROSTO_BASE} />
          <GotaNuca x={hx + 26} y={nucaY - 10} f={f} de={T("suor")} />
        </Palco>
        <Luz m={{ ...luz, vinheta: luz.vinheta + 0.25 }} />
      </AbsoluteFill>
    );
  }
  const cam =
    f < NUCA
      ? camK(f, [
          [1920, { x: e.x, y: e.y + 60, zoom: 2.0 }],
          [NUCA, { x: e.x, y: e.y + 50, zoom: 2.25 }, S],
        ])
      : camK(f, [
          [COCHICHO - 4, { x: e.x - 60, y: e.y + 70, zoom: 1.9 }],
          [COCHICHO + 30, { x: (z.x + e.x) / 2 - 20, y: z.y + 80, zoom: 1.6 }, S],
          [2286, { x: (z.x + e.x) / 2 - 30, y: z.y + 80, zoom: 1.68 }, S],
        ]);
  return (
    <>
      <Quadro f={f} cam={cam} luz={luz} semPesq so={[5, 6, 7]} />
      <Etiqueta t0={t0} texto="RODADA 5 / 18" de={1926} ate={2280} y={230} />
    </>
  );
};

// ------------------------------------------------------------------ C07 · 2286–2766
export const C07: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const e = rostoMundo(EST, f);
  const z = rostoMundo(ZOM, f);
  const push = T("Ele olha pras linhas");
  const sorri = T("O do lado sorri");
  const luz = mistura(LUZ.fria, LUZ.gelada, ip(f, [2286, CEDE], [0, 1]));
  // azul nos últimos 15 quadros (transição pra explicação)
  const azul = ip(f, [2751, 2766], [0, 1]);
  let cam: CamV;
  if (f < push) cam = camK(f, [[2286, { x: 2150, y: 1010, zoom: 1.0 }], [push, { x: 2120, y: 1005, zoom: 1.08 }, S]]);
  else if (f < CEDE) cam = camK(f, [[push, { x: e.x, y: e.y + 70, zoom: 1.7 }], [CEDE - 12, { x: e.x, y: e.y + 40, zoom: 2.6 }, S], [CEDE, { x: e.x, y: e.y + 40, zoom: 2.62 }]]);
  else if (f < sorri - 4) {
    // corte pro cartão A subindo (na mão dele)
    const [mx, my] = posMao(ANIM.pose(`p${EST}`, f), "D");
    cam = { x: (mx + e.x) / 2, y: (my - 60 + e.y) / 2 + 40, zoom: 1.85 + ip(f, [CEDE, sorri], [0, 0.12]) };
  } else cam = camK(f, [[sorri - 4, { x: z.x + 30, y: z.y + 70, zoom: 1.9 }], [2766, { x: z.x + 30, y: z.y + 60, zoom: 2.05 }, S]]);
  const impacto = f >= CEDE && f < CEDE + 10 ? 16 * (1 - (f - CEDE) / 10) : 0;
  return (
    <>
      <Quadro f={f} cam={cam} luz={luz} tremor={impacto} />
      {f >= CEDE && f < CEDE + 2 ? <AbsoluteFill style={{ background: "#fff", opacity: 0.6 }} /> : null}
      <Etiqueta t0={t0} texto="RODADA 7 / 18" de={2292} ate={push - 4} y={230} />
      <AbsoluteFill style={{ background: "#14265e", opacity: azul * 0.85 }} />
    </>
  );
};

// ------------------------------------------------------------------ C08 · 2766–3756 (explicação: fundo azul)
const FundoAzul: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1f3f86 0%, #12245a 55%, #0a1438 100%)" }}>
    {new Array(30).fill(0).map((_, i) => {
      const x = random(`az${i}`) * 1080;
      const y = (random(`ay${i}`) * 1920 - f * (0.15 + random(`av${i}`) * 0.3)) % 1920;
      return <div key={i} style={{ position: "absolute", left: x, top: (y + 1920) % 1920, width: 6, height: 6, borderRadius: 3, background: "#9cc4ff", opacity: 0.25 }} />;
    })}
  </AbsoluteFill>
);
const ATOR_X = (i: number) => 112 + i * 143;
const ETIQ = T("eram atores");
const DIFERENTE = T("Ser o único");
const PIADA = T("É tipo quando");
const PILULA = T("Ou escolher");
const Pilula: React.FC<{ f: number; de: number }> = ({ f, de }) => {
  if (f < de) return null;
  const s = spring({ frame: f - de, fps: FPS, config: { mass: 0.8, stiffness: 120, damping: 12 } });
  const rot = (f - de) * 1.6 - 30;
  const y = 560 + Math.sin((f - de) * 0.05) * 18;
  return (
    <g transform={`translate(540 ${y}) scale(${s}) rotate(${rot})`}>
      <ellipse rx={190} ry={190} fill="#4a8cff" opacity={0.18} />
      <rect x={-130} y={-52} width={260} height={104} rx={52} fill="#3566d8" stroke={CONTORNO} strokeWidth={9} />
      <path d="M 0 -52 L 0 52" stroke={CONTORNO} strokeWidth={6} />
      <rect x={0} y={-52} width={130} height={104} rx={52} fill="#5d8cf0" stroke={CONTORNO} strokeWidth={9} />
      <path d="M -96 -26 Q -60 -40 -20 -36" stroke="#a9c8ff" strokeWidth={12} strokeLinecap="round" fill="none" />
    </g>
  );
};
const RosaRindo: React.FC<{ f: number; de: number; ate: number }> = ({ f, de, ate }) => {
  if (f < de - 2 || f > ate + 14) return null;
  const s = spring({ frame: f - de, fps: FPS, config: { mass: 0.7, stiffness: 160, damping: 13 } }) * (1 - (f > ate ? Math.min(1, (f - ate) / 12) : 0));
  const g = f / 2;
  const grupo = [ATORES[0], ATORES[3], ATORES[4]];
  return (
    <g transform={`translate(540 520) scale(${s}) translate(-540 -520)`}>
      <rect x={110} y={250} width={860} height={540} rx={34} fill="#f3ead6" stroke={CONTORNO} strokeWidth={10} />
      <rect x={110} y={600} width={860} height={190} fill="#d9c9a3" />
      {grupo.map((d, i) => {
        const pula = Math.abs(Math.sin(g * 0.35 + i)) * 10;
        const p: Pose = { ...POSE_BASE, x: 240 + i * 180, y: 770 - pula, escala: 0.27, estica: 1 + pula * 0.003, inclina: Math.sin(g * 0.2 + i) * 6, bracoE: { ombro: 40, cotovelo: -60 }, bracoD: { ombro: 30, cotovelo: -90 } };
        return <Boneco2D key={i} id={`ri${i}`} d={d} pose={p} rosto={{ ...ROSTO_BASE, olhos: 0.12, sorriso: 1, boca: 0.6 + Math.sin(g * 0.7 + i) * 0.2, bochecha: 1 }} />;
      })}
      <Boneco2D
        id="riE"
        d={ESTUDANTE}
        pose={{ ...POSE_BASE, x: 830, y: 770, escala: 0.27, vira: -0.4, inclina: -3, bracoD: { ombro: 30, cotovelo: -100 } }}
        rosto={{ ...ROSTO_BASE, olhos: 0.9 * piscar(g, "riE"), sorriso: 0.55, boca: 0.15, sobrancelha: -18, sobrancelhaY: 8, suor: 0.8, olhar: [-0.7, 0] }}
      />
    </g>
  );
};
export const C08: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const g = f / 2;
  const push = 1 + ip(f, [2766, 3756], [0, 0.07]);
  const destaca = f >= DIFERENTE ? ip(f, [DIFERENTE, DIFERENTE + 30], [0, 1], S) : 0;
  const apaga = f >= PIADA ? 1 - ip(f, [PILULA + 200, PILULA + 260], [0, 1]) : 0;
  const atoresOp = 1 - destaca * 0.5;
  return (
    <AbsoluteFill>
      <FundoAzul f={f} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <svg width={1080} height={1920}>
          {[...ATORES, ZOMBADOR].map((d, i) => {
              const r = respira(g, i * 5);
              const p: Pose = { ...POSE_BASE, x: ATOR_X(i), y: 1120, escala: 0.33, estica: 1 + r * 0.01, cabeca: Math.sin(g * 0.03 + i) * 2 };
              const tag = ETIQ + i * 7;
              const ts = f < tag ? 0 : spring({ frame: f - tag, fps: FPS, config: { mass: 0.6, stiffness: 300, damping: 14 } });
              const [hx, hy] = posCabeca(p);
              return (
                <g key={i} opacity={atoresOp * (1 - apaga * 0.4)}>
                  <Boneco2D id={`az${i}`} d={d} pose={p} rosto={{ ...ROSTO_BASE, olhos: 0.85 * piscar(g, `az${i}`), sorriso: 0.05, sobrancelha: 8 }} />
                  {f >= tag - 1 ? (
                    <g transform={`translate(${hx} ${hy - 120 - (1 - ts) * 400}) rotate(${(1 - ts) * -25 - 6}) scale(${1.05 + 0.25 * ts})`}>
                      <rect x={-60} y={-26} width={120} height={52} rx={8} fill="#ffd83a" stroke={CONTORNO} strokeWidth={6} />
                      <text x={0} y={16} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={CONTORNO}>
                        ATOR
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}
          {/* o estudante, na frente, com anel de luz */}
          {(() => {
            const anel = ip(f, [T("O único sendo"), T("O único sendo") + 30], [0, 1], CURVA.sai);
            const pul = 1 + Math.sin(g * 0.2) * 0.04;
            const r = respira(g, 9);
            const surp = f >= T("O único sendo") && f < DIFERENTE + 60;
            const p: Pose = { ...POSE_BASE, x: 540, y: 1560, escala: 0.44, estica: 1 + r * 0.01, cabeca: Math.sin(g * 0.025) * 2, vira: f >= PIADA ? -0.2 : 0 };
            return (
              <g opacity={1 - apaga * 0.3}>
                <ellipse cx={540} cy={1570} rx={250 * anel * pul} ry={60 * anel * pul} fill="none" stroke="#ffe680" strokeWidth={12} opacity={0.9 * anel} />
                <ellipse cx={540} cy={1570} rx={250 * anel} ry={60 * anel} fill="#ffe680" opacity={0.18 * anel + destaca * 0.12} />
                <path d={`M 380 1570 L 470 0 L 610 0 L 700 1570 Z`} fill="#fff6c0" opacity={0.08 * anel + destaca * 0.1} />
                <Boneco2D
                  id="azE"
                  d={ESTUDANTE}
                  pose={p}
                  rosto={surp ? { ...ROSTO_BASE, olhos: 1.25 * piscar(g, "azE"), pupila: 0.7, sobrancelha: -8, sobrancelhaY: 14, sorriso: -0.2, boca: 0.35 } : { ...ROSTO_BASE, olhos: 0.95 * piscar(g, "azE"), sorriso: 0.1, sobrancelha: -8, olhar: f >= PILULA ? [0, -0.7] : [0, 0] }}
                />
              </g>
            );
          })()}
          <RosaRindo f={f} de={PIADA} ate={PILULA - 6} />
          <Pilula f={f} de={PILULA + 10} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(5,8,25,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ C09 · 3756–4068
export const C09: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const vermelho = T("Três de cada");
  const branco = T("seguiram o grupo") + 10;
  const push = 1 + ip(f, [3756, 4068], [0, 0.05]);
  return (
    <AbsoluteFill>
      <FundoAzul f={f} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <svg width={1080} height={1920}>
          {[0, 1, 2, 3].map((i) => {
            const de = 3770 + i * 8;
            const e = spring({ frame: f - de, fps: FPS, config: { mass: 0.7, stiffness: 180, damping: 12 } });
            const vira = i < 3 ? vermelho + i * 14 : branco;
            const t = f >= vira ? 1 : 0;
            const pop = f >= vira ? 1 + 0.18 * Math.exp(-(f - vira) / 6) * Math.cos((f - vira) * 0.6) : 1;
            const cor = t ? (i < 3 ? "#e2453a" : "#ffffff") : "#7f95c4";
            const x = 540 + (i - 1.5) * 220;
            const y = 1040 + Math.sin((f + i * 20) * 0.04) * 6;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${e * pop})`}>
                <circle cx={0} cy={-150} r={56} fill={cor} stroke={CONTORNO} strokeWidth={9} />
                <path d="M -78 120 L -78 -20 Q -78 -70 -30 -70 L 30 -70 Q 78 -70 78 -20 L 78 120 Z" fill={cor} stroke={CONTORNO} strokeWidth={9} strokeLinejoin="round" />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      <Valor t0={t0} rotulo="CEDERAM 1 VEZ OU MAIS" valor="3 DE 4" de={T("cada quatro")} ate={4062} y={300} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(5,8,25,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ C10 · 4068–4452
export const C10: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const al = rostoMundo(ALIADO, f);
  const zoom = mola(f, ALIADO_SOBE + 24, { mass: 1, stiffness: 80, damping: 15 });
  const cam = mixCam(camK(f, [[4068, { x: 1175, y: 1100, zoom: 0.7 }], [ALIADO_SOBE, { x: 1150, y: 1100, zoom: 0.76 }, S]]), { x: al.x, y: al.y + 160, zoom: 1.35 }, zoom);
  const luz = mistura(LUZ.fria, LUZ.quente, ip(f, [4068, 4110], [0.5, 1]));
  const anel = ip(f, [ALIADO_SOBE + 16, ALIADO_SOBE + 46], [0, 1], CURVA.sai);
  const [mx, my] = posMao(ANIM.pose(`p${ALIADO}`, f), "D");
  return (
    <>
      <Quadro f={f} cam={cam} luz={luz}>
        {anel > 0 ? <ellipse cx={mx + 6} cy={my - 72} rx={120 * anel} ry={100 * anel} fill="none" stroke="#3fbf5a" strokeWidth={12} opacity={0.95} /> : null}
      </Quadro>
      <AbsoluteFill style={{ background: "#fff", opacity: ip(f, [4068, 4078], [0.6, 0]) }} />
      <Etiqueta t0={t0} texto="UM ÚNICO ATOR DIZ A VERDADE" de={ALIADO_SOBE} ate={4446} y={230} tam={60} />
    </>
  );
};

// ------------------------------------------------------------------ C11 · 4452–4788 (termina igual ao 1º quadro: loop)
export const C11: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const e = rostoMundo(EST, f);
  const desce = T("pra linha curta") - 50;
  const medio = { x: (LUGAR[ZOM] + LUGAR[EST]) / 2, y: e.y + 120, zoom: 1.25 };
  const cam = camK(f, [
    [4452, medio],
    [desce, { ...medio, zoom: 1.3 }, S],
    [4760, CAM_LOOP, CURVA.suave],
    [4788, CAM_LOOP],
  ]);
  const anelB = ip(f, [desce + 10, desce + 40], [0, 1], CURVA.sai) * (1 - ip(f, [4740, 4775], [0, 1]));
  return <Quadro f={f} cam={cam} luz={LUZ.quente} cartao={{ anelB }} semPesq />;
};

export { EST_FINAL };
