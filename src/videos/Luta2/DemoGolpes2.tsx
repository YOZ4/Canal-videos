import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Boneco2D, ROSTO_BASE, type Rosto } from "../../estilo2d/Boneco2D";
import { piscar } from "../../estilo2d/anim";
import { Diretor, type Efeito, type Plano } from "../../estilo2d/Diretor";
import { CameraLenta, tempoCena, type Trecho } from "../../estilo2d/tempo";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Fundo, RuaLonga } from "../../estilo2d/Acabamento";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { Impacto, Poeira } from "../../estilo2d/Efeitos2D";
import { Faiscas, OndaChoque, Onomatopeia } from "../../estilo2d/EfeitosLuta";
import { Palco } from "../Cacadores/comum";
import { LUTA } from "./coreo";

/**
 * Demo de golpes v2 — mesma família de golpes da demo 1, agora com o sistema de coreografia (luta.ts):
 * fases, alcance automático, hit-stop, pés plantados, cabelo com mola, câmera que enquadra os dois.
 */
const EV = LUTA.eventos;
const CONTATOS = EV.filter((e) => e.tipo === "contato");
const FINAL = CONTATOS[CONTATOS.length - 1];

// ---------------- câmera lenta (quadros de SAÍDA): ápice do mortal + carga do golpe final (volta ao normal NO contato)
const montaTrechos = (): Trecho[] => {
  const t: Trecho[] = [];
  const saidaDe = (cenaF: number) => {
    let f = 0;
    while (tempoCena(f, t) < cenaF) f++;
    return f;
  };
  // mortal: desacelera na subida, fica lento no alto, volta antes do pouso
  const m0 = LUTA.quando("L", "cambalhota", 12);
  const m1 = LUTA.quando("L", "cambalhota", 24);
  const a = saidaDe(m0);
  const durLenta = Math.round((m1 - m0) / 0.35);
  t.push({ em: a - 6, vel: 1 }, { em: a, vel: 0.35 }, { em: a + durLenta, vel: 0.35 }, { em: a + durLenta + 6, vel: 1 });
  // golpe final: a carga fica lenta (tensão) e o golpe ACELERA até o contato — o impacto é seco, com hit-stop
  const c0 = LUTA.quando("L", "direto", 2, FINAL.f - 40);
  const b = saidaDe(c0);
  const lenta = Math.round((FINAL.f - 3 - c0) / 0.3);
  t.push({ em: b, vel: 1 }, { em: b + 6, vel: 0.3 }, { em: b + lenta, vel: 0.3 }, { em: b + lenta + 3, vel: 1 });
  return t;
};
const TRECHOS = montaTrechos();
const saida = (cenaF: number) => {
  let f = 0;
  while (tempoCena(f, TRECHOS) < cenaF) f += 0.25;
  return Math.round(f);
};
let _dur = 0;
while (tempoCena(_dur, TRECHOS) < LUTA.duracao) _dur++;
export const DURACAO_DEMO2 = _dur;

// ---------------- atuação: rosto pela fase do golpe
const R = {
  serio: { ...ROSTO_BASE, olhos: 0.85, sobrancelha: 14, sorriso: 0.05 },
  foco: { ...ROSTO_BASE, olhos: 0.62, sobrancelha: 22, sorriso: -0.2, olhar: [0.6, 0] },
  grito: { ...ROSTO_BASE, olhos: 0.6, sobrancelha: 26, sorriso: -0.9, boca: 0.9 },
  firme: { ...ROSTO_BASE, olhos: 0.5, sobrancelha: 24, sorriso: -0.7, boca: 0.12 },
  surpresa: { ...ROSTO_BASE, olhos: 1.25, pupila: 0.7, sobrancelha: -8, sobrancelhaY: 14, sorriso: -0.3, boca: 0.35 },
  dor: { ...ROSTO_BASE, olhos: 0.1, sobrancelha: -18, sobrancelhaY: 6, sorriso: -0.8, boca: 0.6, suor: 0.5 },
  tonto: { ...ROSTO_BASE, espiral: 1, sorriso: -0.3, boca: 0.3 },
  bravo: { ...ROSTO_BASE, olhos: 0.7, sobrancelha: 28, sorriso: -0.6, boca: 0.1 },
  confiante: { ...ROSTO_BASE, olhos: 0.75, canto: 1, sorriso: 0.5, sobrancelha: 8 },
} satisfies Record<string, Rosto>;

const rostoDe = (id: string, f: number, semente: string): Rosto => {
  const e = LUTA.estado(id, f);
  let r: Rosto = R.serio;
  if (e.fase === "preparo") r = R.foco;
  else if (e.fase === "acao" || e.fase === "contato") r = R.grito;
  else if (e.fase === "recupera") r = R.bravo;
  else if (e.fase === "reacao") r = e.golpe === "queda" ? (e.u < 13 ? R.dor : e.u < 50 ? R.tonto : R.dor) : e.u < 14 ? R.dor : R.bravo;
  else if (e.fase === "defesa") r = e.golpe === "defesa" ? R.firme : R.surpresa;
  else if (e.fase === "movimento") r = e.golpe === "cambalhota" ? R.confiante : R.serio;
  if (id === "L" && f > FINAL.f + 30) r = R.confiante;
  return { ...r, olhos: r.olhos * piscar(f, semente) };
};

// ---------------- cena (quadros de CENA)
const Cena: React.FC = () => {
  const f = useCurrentFrame();
  const l = LUTA.pose("L", f);
  const d = LUTA.pose("D", f);
  const cam = LUTA.camera(f);
  const atores = { L: l, D: d };
  return (
    <Palco cam={cam} parado>
      <Fundo>
        <RuaLonga camX={cam.x} />
      </Fundo>
      {EV.map((e, i) => {
        if (e.tipo === "pouso") return <Poeira key={i} x={e.x} y={CHAO_Y + 4} f={f} de={e.f} dur={e.forte ? 26 : 16} largura={e.forte ? 1.3 : 0.6} />;
        if (e.tipo === "deslize") {
          const p = atores[e.quem as "L" | "D"];
          return new Array(Math.max(1, Math.floor((e.ate - e.de) / 3))).fill(0).map((_, k) => <Poeira key={`${i}-${k}`} x={p.x} y={CHAO_Y + 4} f={f} de={e.de + k * 3} dur={14} largura={0.45} />);
        }
        return null;
      })}
      <Boneco2D id="dg2" d={DIEGO} pose={d} rosto={rostoDe("D", f, "dd")} />
      <Boneco2D id="lc2" d={LUCAS} pose={l} rosto={rostoDe("L", f, "ll")} />
      {CONTATOS.map((e, i) =>
        e.tipo !== "contato" ? null : e.resultado === "acerto" ? (
          <g key={i}>
            <OndaChoque x={e.x} y={e.y} f={f} de={e.f} dur={10 + e.forca * 3} raio={180 + 140 * e.forca} achatado={0.8} />
            <Impacto x={e.x} y={e.y} f={f} de={e.f} dur={8 + e.forca * 3} />
            {e.forca >= 1.5 ? <Faiscas x={e.x} y={e.y} f={f} de={e.f} dur={16} cor="#ffd23f" n={18} alcance={380} /> : null}
          </g>
        ) : e.resultado === "bloqueio" ? (
          <g key={i}>
            <Faiscas x={e.x} y={e.y} f={f} de={e.f} dur={10 + e.forca * 2} n={10} alcance={150 + 90 * e.forca} />
            <OndaChoque x={e.x} y={e.y} f={f} de={e.f} dur={8} raio={120 + 60 * e.forca} achatado={1.4} />
          </g>
        ) : null,
      )}
      <Onomatopeia texto="POW!" x={FINAL.x - 40} y={FINAL.y - 240} f={f} de={FINAL.f + 2} dur={26} tamanho={150} />
    </Palco>
  );
};

// ---------------- direção (quadros de SAÍDA): sem faixas de cinema; crash zoom mira o ponto do golpe
const naTela = (e: { f: number; x: number; y: number }): [number, number] => {
  const c = LUTA.camera(e.f);
  return [Math.min(0.8, Math.max(0.2, (540 + (e.x - c.x) * c.zoom) / 1080)), Math.min(0.75, Math.max(0.25, (960 + (e.y - c.y) * c.zoom) / 1920))];
};
const SF = saida(FINAL.f);
const PLANOS: Plano[] = [
  { de: 0, ate: 36, zoom: [1.12, 1.0] },
  { de: SF - 70, ate: SF, zoom: [1.0, 1.1], rot: [0, -3] },
  { de: SF, ate: SF + 60, zoom: [1.1, 1.0], rot: [-3, 0] },
];
const EFEITOS: Efeito[] = [];
for (const e of CONTATOS) {
  if (e.tipo !== "contato" || e.resultado === "esquiva") continue;
  const s = saida(e.f);
  const forte = e.resultado === "acerto";
  EFEITOS.push({ tipo: "crash", em: s, forca: forte ? 0.12 + 0.08 * e.forca : 0.06 + 0.03 * e.forca, foco: naTela(e) });
  EFEITOS.push({ tipo: "treme", em: s, dur: forte ? 6 + 3 * e.forca : 5, forca: forte ? 8 + 7 * e.forca : 6 + 3 * e.forca });
}
EFEITOS.push({ tipo: "flash", em: SF, dur: 3 }, { tipo: "inverte", em: SF + 1, dur: 2 });
const voa = EV.find((e) => e.tipo === "whoosh" && e.quem === "D" && e.forca > 1.4);
if (voa && voa.tipo === "whoosh") EFEITOS.push({ tipo: "velocidade", de: saida(voa.f), ate: saida(voa.f) + 14, dir: 1, forca: 0.5 });
const quedaChao = EV.find((e) => e.tipo === "pouso" && e.forte);
if (quedaChao && quedaChao.tipo === "pouso") EFEITOS.push({ tipo: "treme", em: saida(quedaChao.f), dur: 8, forca: 10 });

// ---------------- som (quadros de SAÍDA)
const som = (de: number, src: string, volume: number, k: string) => (
  <Sequence from={Math.max(0, de)} layout="none" key={k}>
    <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);
const SONS = EV.flatMap((e, i) => {
  if (e.tipo === "whoosh") return [som(saida(e.f) - 1, "whoosh", Math.min(0.5, 0.22 + 0.12 * e.forca), `w${i}`)];
  if (e.tipo === "contato" && e.resultado === "acerto") return [som(saida(e.f), "impacto", Math.min(0.8, 0.32 * e.forca), `c${i}`), ...(e.forca >= 1.5 ? [som(saida(e.f), "rumble", 0.35, `r${i}`)] : [])];
  if (e.tipo === "contato" && e.resultado === "bloqueio") return [som(saida(e.f), "pop", 0.35, `b${i}`), som(saida(e.f), "impacto", 0.12 + 0.1 * e.forca, `bi${i}`)];
  if (e.tipo === "pouso") return [som(saida(e.f), e.forte ? "impacto" : "pisada", e.forte ? 0.45 : 0.35, `p${i}`)];
  if (e.tipo === "deslize") return [som(saida(e.de), "deslize", 0.35, `d${i}`)];
  if (e.tipo === "passo") return [som(saida(e.f), "passo", 0.12, `s${i}`)];
  return [];
});

export const DemoGolpes2: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Diretor planos={PLANOS} efeitos={EFEITOS} fundo="#efe4d2">
      <CameraLenta trechos={TRECHOS}>
        <Cena />
      </CameraLenta>
    </Diretor>
    <Html5Audio
      src={staticFile("musica/trilha-luta.wav")}
      volume={(g) => interpolate(g, [0, SF - 50, SF - 30, SF + 40, SF + 70, DURACAO_DEMO2], [0.1, 0.1, 0.0, 0.0, 0.1, 0.08], { extrapolateRight: "clamp" })}
    />
    {SONS}
  </AbsoluteFill>
);
