import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Boneco2D, PERFIL_BASE, ROSTO_BASE, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { piscar } from "../../estilo2d/anim";
import { Diretor, type Efeito, type Plano } from "../../estilo2d/Diretor";
import { combate, contatoDe, GOLPES, type Passo } from "../../estilo2d/golpes";
import { seguir } from "../../estilo2d/movimento";
import { CameraLenta, duracaoSaida, tempoCena, type Trecho } from "../../estilo2d/tempo";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Fundo, RuaLonga } from "../../estilo2d/Acabamento";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { Poeira } from "../../estilo2d/Efeitos2D";
import { Palco } from "../Cacadores/comum";

/**
 * Prévia da biblioteca de golpes (golpes.ts) + câmera lenta verdadeira (tempo.tsx) + Diretor.
 * Toda a coreografia é dada só por listas de passos — nenhuma pose escrita à mão nesta cena.
 */
const ESC = 0.62;
const LUCAS_BASE: Pose = { ...PERFIL_BASE, x: 330, y: CHAO_Y, escala: ESC, lado: 1 };
const DIEGO_BASE: Pose = { ...PERFIL_BASE, x: 820, y: CHAO_Y, escala: ESC, lado: -1 };

// coreografia (quadros de CENA, 30 qps)
const PL: Passo[] = [
  { g: GOLPES.avanca, em: 34 },
  { g: GOLPES.jab, em: 48 },
  { g: GOLPES.esquivaBaixa, em: 75 },
  { g: GOLPES.chuteAlto, em: 98 },
  { g: GOLPES.cambalhota, em: 156, vira: true },
  { g: GOLPES.recua, em: 194 },
  { g: GOLPES.direto, em: 214 },
];
const PD: Passo[] = [
  { g: GOLPES.defesa, em: 50 },
  { g: GOLPES.direto, em: 70 },
  { g: GOLPES.levaGolpe, em: 109 },
  { g: GOLPES.avanca, em: 146 },
  { g: GOLPES.voadora, em: 160, vira: true },
  { g: GOLPES.recua, em: 196 },
  { g: GOLPES.queda, em: 222 },
];
const FIM_CENA = 330;

// câmera lenta nos 3 contatos principais (convertidos para quadros de saída)
const CONTATOS = [contatoDe(PL[3]), contatoDe(PD[4]), contatoDe(PL[6])];
const VEL = 0.18;
const ENTRA = 9;
const SEGURA = 26;
const SAI = 9;
const TRECHOS: Trecho[] = (() => {
  const t: Trecho[] = [];
  for (const c of CONTATOS) {
    // acha o quadro de saída em que a cena chega no contato (com os trechos anteriores) e começa a frear antes dele
    let f = 0;
    while (tempoCena(f, t) < c - ENTRA * (1 + VEL) * 0.5) f++;
    t.push({ em: f, vel: 1 }, { em: f + ENTRA, vel: VEL }, { em: f + ENTRA + SEGURA, vel: VEL }, { em: f + ENTRA + SEGURA + SAI, vel: 1 });
  }
  return t;
})();
export const DURACAO_DEMO = duracaoSaida(FIM_CENA, TRECHOS);
const saida = (c: number) => {
  let f = 0;
  while (tempoCena(f, TRECHOS) < c) f++;
  return f;
};
const [S1, S2, S3] = CONTATOS.map(saida);
const SJ = saida(contatoDe(PL[1]));
const SD = saida(contatoDe(PD[1]));

// ---------------- atuação (rosto por fase) ----------------
const R = {
  serio: { ...ROSTO_BASE, olhos: 0.85, sobrancelha: 14, sorriso: 0.05 },
  ataque: { ...ROSTO_BASE, olhos: 0.6, sobrancelha: 22, sorriso: -0.85, boca: 0.15 },
  grito: { ...ROSTO_BASE, olhos: 0.6, sobrancelha: 24, sorriso: -0.9, boca: 0.9 },
  surpresa: { ...ROSTO_BASE, olhos: 1.25, pupila: 0.7, sobrancelha: -8, sobrancelhaY: 14, sorriso: -0.3, boca: 0.35 },
  dor: { ...ROSTO_BASE, olhos: 0.15, sobrancelha: -16, sobrancelhaY: 6, sorriso: -0.7, boca: 0.55, suor: 0.5 },
  tonto: { ...ROSTO_BASE, espiral: 1, sorriso: -0.3, boca: 0.3 },
  confiante: { ...ROSTO_BASE, olhos: 0.75, canto: 1, sorriso: 0.5, sobrancelha: 8 },
  rindo: { ...ROSTO_BASE, olhos: 0.15, sorriso: 1, boca: 0.7, bochecha: 1 },
} satisfies Record<string, Rosto>;

const ATAQUE = new Set(["jab", "direto", "chuteAlto", "voadora"]);
const rostoDe = (f: number, passos: Passo[], semente: string, fim: Rosto): Rosto => {
  let r: Rosto = R.serio;
  for (const p of passos) {
    const u = f - p.em;
    if (u < 0) break;
    if (u < p.g.dur) {
      const n = p.g.nome;
      if (ATAQUE.has(n)) r = u >= (p.g.contato ?? 0) - 2 && u < (p.g.contato ?? 0) + 6 ? R.grito : R.ataque;
      else if (n === "levaGolpe") r = u < 14 ? R.dor : R.serio;
      else if (n === "queda") r = u < 40 ? (u < 20 ? R.dor : R.tonto) : R.serio;
      else if (n === "esquivaBaixa" || n === "esquivaTras" || n === "defesa") r = R.surpresa;
      else if (n === "cambalhota") r = R.confiante;
      break;
    }
  }
  if (f > FIM_CENA - 40) r = fim;
  return { ...r, olhos: r.olhos * piscar(f, semente) };
};

const Cena: React.FC = () => {
  const f = useCurrentFrame(); // quadro de CENA (já remapeado pela câmera lenta)
  const l = combate(f, LUCAS_BASE, PL, 0);
  const d = combate(f, DIEGO_BASE, PD, 3);
  const camX = seguir((g) => (combate(g, LUCAS_BASE, PL).x + combate(g, DIEGO_BASE, PD).x) / 2, f, 8);
  const quedaChao = contatoDe(PD[6]);
  return (
    <Palco cam={{ x: camX, y: 1080, zoom: 1.0 }} parado>
      <Fundo>
        <RuaLonga camX={camX} />
      </Fundo>
      <Poeira x={d.x} y={CHAO_Y + 4} f={f} de={quedaChao} dur={22} />
      <Poeira x={l.x} y={CHAO_Y + 4} f={f} de={contatoDe(PL[4])} dur={16} largura={0.6} />
      <Poeira x={d.x} y={CHAO_Y + 4} f={f} de={contatoDe(PD[4])} dur={16} largura={0.6} />
      <Boneco2D id="dgD" d={DIEGO} pose={d} rosto={rostoDe(f, PD, "dd", R.rindo)} />
      <Boneco2D id="lcD" d={LUCAS} pose={l} rosto={rostoDe(f, PL, "ll", R.confiante)} />
    </Palco>
  );
};

// ---------------- câmera (quadros de SAÍDA) ----------------
const PLANOS: Plano[] = [
  { de: 0, ate: 40, zoom: [1.35, 1.08], foco: [0.5, 0.55] },
  { de: 40, ate: SJ, zoom: [1.08, 1.2], foco: [0.5, 0.55], rot: [0, 2] },
  { de: SJ, ate: SD + 10, zoom: [1.2, 1.12], rot: [2, -3], foco: [0.5, 0.55] },
  { de: S1 - 12, ate: S1 + 30, zoom: [1.15, 1.55], rot: [-3, 3], foco: [0.55, 0.5] },
  { de: S1 + 30, ate: S2 - 14, zoom: [1.3, 1.05], rot: [3, 0], foco: [0.5, 0.55] },
  { de: S2 - 14, ate: S2 + 34, zoom: [1.05, 1.0], rot: [0, -5], foco: [0.5, 0.5] },
  { de: S2 + 34, ate: S3 - 6, zoom: [1.08, 1.25], rot: [-5, 0], foco: [0.5, 0.55] },
  { de: S3 + 30, ate: DURACAO_DEMO, zoom: [1.3, 1.0], foco: [0.5, 0.6] },
];
const EFEITOS: Efeito[] = [
  { tipo: "faixas", de: 0, ate: 36 },
  { tipo: "crash", em: SJ, forca: 0.12 },
  { tipo: "treme", em: SJ, dur: 5, forca: 6 },
  { tipo: "treme", em: SD, dur: 4, forca: 5 },
  { tipo: "crash", em: S1, forca: 0.3, foco: [0.6, 0.5] },
  { tipo: "treme", em: S1, dur: 8, forca: 12 },
  { tipo: "faixas", de: S1 - 8, ate: S1 + 30 },
  { tipo: "velocidade", de: S2 - 16, ate: S2 + 30, dir: -1, forca: 0.6 },
  { tipo: "faixas", de: S2 - 8, ate: S2 + 30 },
  { tipo: "crash", em: S3, forca: 0.45 },
  { tipo: "treme", em: S3, dur: 12, forca: 22 },
  { tipo: "flash", em: S3, dur: 4 },
  { tipo: "inverte", em: S3 + 1, dur: 2 },
  { tipo: "faixas", de: S3 - 8, ate: S3 + 34 },
];

const som = (de: number, src: string, volume: number) => (
  <Sequence from={de} layout="none" key={`${src}${de}`}>
    <Html5Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

export const DemoGolpes: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Diretor planos={PLANOS} efeitos={EFEITOS} fundo="#efe4d2">
      <CameraLenta trechos={TRECHOS}>
        <Cena />
      </CameraLenta>
    </Diretor>
    <Html5Audio
      src={staticFile("musica/trilha-luta.wav")}
      volume={(g) => interpolate(g, [0, S1 - 10, S1, S1 + 30, S3 - 20, S3, S3 + 40, DURACAO_DEMO], [0.1, 0.12, 0.03, 0.1, 0.1, 0.0, 0.0, 0.1], { extrapolateRight: "clamp" })}
    />
    {[SJ - 3, SD - 3, S1 - 10, S2 - 14, S3 - 8].map((t) => som(t, "whoosh", 0.35))}
    {som(SJ, "impacto", 0.3)}
    {som(SD, "pop", 0.3)}
    {som(S1, "impacto", 0.55)}
    {som(S2, "vento", 0.4)}
    {som(S3, "impacto", 0.7)}
    {som(S3 + 20, "pisada", 0.5)}
  </AbsoluteFill>
);
