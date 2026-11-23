import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Boneco2D, PERFIL_BASE, ROSTO_BASE, posCabeca, type Pose } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { Poeira } from "../../estilo2d/Efeitos2D";
import { Faiscas, OndaChoque } from "../../estilo2d/EfeitosLuta";
import { ObjetosFisica } from "../../estilo2d/Acabamento";
import { Espada } from "../../estilo2d/Objetos";
import { CURVA, balancoCabelo, k, kPose, trocaRosto } from "../../estilo2d/anim";
import { entre, mola } from "../../estilo2d/movimento";
import { CIANO, CelJJK, CenarioJJK, Desfoque, EnergiaCiano, GradeJJK, LinhasRadiais, Particulas, QuadroImpacto, Racha, RiscosVelocidade, tremorJJK } from "../../estilo2d/EstiloJJK";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Som } from "../Cacadores/comum";

/**
 * Teste do estilo "JJK S2" (24 qps, personagens desenhados de 2 em 2 quadros, ~10 s).
 * Planos: 1 tensão (geral, de baixo) · 2 close nos olhos · 3 arrancada + chute · 4 impacto e recuo do Diego ·
 *         5 contra-ataque com salto e pouso pesado · 6 geral final de tensão.
 */
export const FPS_JJK = 24;
export const DURACAO = 220;
const ESC = 0.72;
const IMP = 76; // contato do chute
const PAUSA = 6; // hit-stop
/** tempo da história (congela no impacto) */
const tw = (f: number) => (f < IMP ? f : f < IMP + PAUSA ? IMP : f - PAUSA);
/** personagens a 12 desenhos por segundo */
const dois = (f: number) => Math.floor(f / 2) * 2;
const M = (f: number, de: number, s: Parameters<typeof mola>[2]) => mola(f, de, s, FPS_JJK);

const B: Pose = { ...PERFIL_BASE, escala: ESC, y: CHAO_Y };
const LG = (x: number, lado: 1 | -1 = 1): Pose => ({ ...B, x, lado, agacha: 40, inclina: 8, peE: { dx: -86, dy: 0 }, peD: { dx: 92, dy: 0 }, bracoE: { ombro: -24, cotovelo: 26 }, bracoD: { ombro: -14, cotovelo: 30 }, maoD: "punho", maoE: "punho" });
const DG = (x: number, lado: 1 | -1 = -1): Pose => ({ ...B, x, lado, agacha: 44, inclina: 8, peE: { dx: -90, dy: 0 }, peD: { dx: 80, dy: 0 }, bracoD: { ombro: 16, cotovelo: 112 }, bracoE: { ombro: 28, cotovelo: 98 }, maoD: "punho", maoE: "punho" });

// ---------------- Lucas ----------------
const lucas = (t: number): Pose => {
  const ant: Pose = { ...LG(260), agacha: 150, inclina: 34, estica: 0.9, peD: { dx: 120, dy: 0 }, peE: { dx: -150, dy: 0 }, bracoE: { ombro: -80, cotovelo: 16 }, bracoD: { ombro: -70, cotovelo: 20 } };
  const voa: Pose = { ...LG(430), y: CHAO_Y - 40, agacha: 60, inclina: 40, estica: 1.08, peD: { dx: 160, dy: -60 }, peE: { dx: -260, dy: -30 }, bracoE: { ombro: -100, cotovelo: 8 }, bracoD: { ombro: -90, cotovelo: 10 } };
  const encolhe: Pose = { ...LG(470), agacha: 30, inclina: -4, peE: { dx: -40, dy: 0 }, peD: { dx: 150, dy: -220 }, bracoE: { ombro: -70, cotovelo: 20 }, bracoD: { ombro: 50, cotovelo: 30 } };
  const chute: Pose = { ...LG(500), agacha: 18, inclina: -24, peE: { dx: -30, dy: 0 }, peD: { dx: 340, dy: -330 }, bracoE: { ombro: -78, cotovelo: 18 }, bracoD: { ombro: 58, cotovelo: 28 } };
  if (t <= IMP)
    return kPose(t, [
      [0, LG(260)],
      [56, LG(260)],
      [62, ant, CURVA.entra], // antecipação (segura)
      [64, ant],
      [68, voa, CURVA.sai], // arrancada em 2 desenhos
      [72, encolhe, CURVA.suave],
      [IMP, chute, CURVA.sai],
    ]);
  // depois do chute: perna desce com mola, tronco assenta (cada parte no seu tempo)
  const desce = M(t, IMP + 2, "natural");
  const g = LG(480);
  const p: Pose = {
    ...chute,
    x: entre(500, 480, desce),
    agacha: entre(18, g.agacha, desce),
    inclina: entre(-24, g.inclina, M(t, IMP + 1, "pesado")),
    peD: { dx: entre(340, g.peD.dx, desce), dy: entre(-330, 0, desce) },
    peE: { dx: entre(-30, g.peE.dx, desce), dy: 0 },
    bracoE: { ombro: entre(-78, g.bracoE.ombro, M(t, IMP + 3, "solto")), cotovelo: entre(18, g.bracoE.cotovelo, M(t, IMP + 4, "solto")) },
    bracoD: { ombro: entre(58, g.bracoD.ombro, M(t, IMP + 4, "solto")), cotovelo: entre(28, g.bracoD.cotovelo, M(t, IMP + 5, "solto")) },
  };
  if (t < 142) return p;
  // esquiva para trás (2 desenhos) quando o Diego desce com a espada, e volta à guarda
  const recua: Pose = { ...LG(90), agacha: 110, inclina: -10, peD: { dx: 150, dy: 0 }, peE: { dx: -170, dy: 0 }, bracoE: { ombro: 40, cotovelo: 80 }, bracoD: { ombro: 60, cotovelo: 70 } };
  return kPose(t, [
    [142, LG(480)],
    [146, recua, CURVA.sai],
    [158, recua],
    [170, LG(130), CURVA.exagera],
  ]);
};

// ---------------- Diego ----------------
const XD0 = 920;
const diego = (t: number): Pose => {
  const defesa: Pose = { ...DG(XD0 - 60), agacha: 70, inclina: -8, bracoD: { ombro: 82, cotovelo: 86 }, bracoE: { ombro: 64, cotovelo: 82 } };
  if (t <= IMP)
    return kPose(t, [
      [0, DG(XD0)],
      [64, DG(XD0)],
      [68, { ...defesa, agacha: 60 }, CURVA.sai], // reage à arrancada (atrasado 4 frames)
      [IMP, defesa],
    ]);
  // empurrado para trás: escorrega desacelerando (freada), tronco joga para trás e assenta com mola pesada
  const xR = entre(XD0 - 60, XD0 + 260, CURVA.sai(Math.min(1, (t - IMP) / 20)));
  const tranco = 1 - M(t, IMP + 4, "pesado");
  const g = DG(XD0 + 260);
  const empurrado: Pose = {
    ...defesa,
    x: xR,
    agacha: entre(g.agacha + 40, 70, tranco),
    inclina: entre(g.inclina, -26, tranco),
    peD: { dx: entre(g.peD.dx, -40, tranco), dy: 0 },
    peE: { dx: entre(g.peE.dx, -160, tranco), dy: 0 },
    cabeca: -16 * (1 - M(t, IMP + 2, "solto")),
    bracoD: { ombro: entre(g.bracoD.ombro, 120, 1 - M(t, IMP + 5, "solto")), cotovelo: entre(g.bracoD.cotovelo, 40, 1 - M(t, IMP + 6, "solto")) },
    bracoE: { ombro: entre(g.bracoE.ombro, 96, 1 - M(t, IMP + 6, "solto")), cotovelo: entre(g.bracoE.cotovelo, 50, 1 - M(t, IMP + 7, "solto")) },
  };
  if (t < 116) return empurrado;
  // contra-ataque: antecipação segurada → salto alto → segura no ar com a espada erguida → desce cortando → pouso pesado
  const xa = XD0 + 260;
  const ant: Pose = { ...DG(xa), agacha: 170, inclina: 30, estica: 0.88, peD: { dx: 130, dy: 0 }, peE: { dx: -150, dy: 0 }, bracoD: { ombro: -40, cotovelo: 30 }, bracoE: { ombro: -30, cotovelo: 30 } };
  const ar: Pose = { ...DG(800), y: CHAO_Y - 860, agacha: 60, inclina: -8, estica: 1.05, peD: { dx: 60, dy: -150 }, peE: { dx: -40, dy: -110 }, bracoD: { ombro: 170, cotovelo: 10 }, bracoE: { ombro: 160, cotovelo: 20 } };
  const corta: Pose = { ...DG(700), y: CHAO_Y - 120, agacha: 80, inclina: 30, peD: { dx: 120, dy: -40 }, peE: { dx: -60, dy: -20 }, bracoD: { ombro: 40, cotovelo: -10 }, bracoE: { ombro: 30, cotovelo: 10 } };
  const pousa: Pose = { ...DG(700), agacha: 210, inclina: 34, estica: 0.84, peD: { dx: 170, dy: 0 }, peE: { dx: -170, dy: 0 }, bracoD: { ombro: 20, cotovelo: -10 }, bracoE: { ombro: 16, cotovelo: 10 } };
  const fica: Pose = { ...DG(780), agacha: 60, inclina: 10 };
  return kPose(t, [
    [116, { ...empurrado }],
    [124, ant, CURVA.entra],
    [130, ant],
    [134, { ...ar, y: CHAO_Y - 420, estica: 1.14 }, CURVA.sai],
    [140, ar, CURVA.sai],
    [146, { ...ar, y: CHAO_Y - 880 }], // segura no alto
    [150, corta, CURVA.entra],
    [152, pousa, CURVA.entra],
    [160, pousa],
    [176, fica, CURVA.exagera],
  ]);
};

/** cabelo com 2–4 frames de atraso, também de 2 em 2 */
const cabelo = (pose: (t: number) => Pose, f: number) => balancoCabelo(dois(f) - 2, (g) => pose(tw(g)).x * 0.18 * (pose(tw(g)).lado ?? 1), (g) => pose(tw(g)).inclina + pose(tw(g)).agacha * 0.06);

// ---------------- câmera por plano (cortes secos) ----------------
const PLANOS = [0, 40, 58, 86, 126, 172, 196];
const camera = (f: number, pl: Pose, pd: Pose) => {
  const t = tw(f);
  const impactos: [number, number][] = [
    [IMP, 22],
    [IMP + PAUSA + 2, 8],
    [158, 18],
  ];
  const tr = tremorJJK(f, impactos);
  let c: { x: number; y: number; zoom: number; rot: number };
  if (f < 40) c = { x: 540 + f * 0.8, y: 1180 - f * 0.4, zoom: 0.7, rot: -4 - f * 0.03 };
  else if (f < 58) {
    const cab = posCabeca(pl);
    const z = 2.4 + 0.7 * CURVA.sai(Math.min(1, (f - 40) / 4));
    c = { x: cab[0] + 40, y: cab[1] + 20, zoom: z, rot: 4 };
  } else if (f < 86) c = { x: entre(380, 640, CURVA.suave(Math.min(1, (t - 58) / 16))), y: 1140, zoom: 1.0 + 0.22 * k(f, [[IMP - 1, 0], [IMP, 1, CURVA.sai], [IMP + PAUSA + 6, 0.3, CURVA.suave]]), rot: -6 };
  else if (f < 126) c = { x: entre(760, pd.x - 60, 0.85), y: 1120, zoom: 0.9, rot: 5 };
  else if (f < 172) c = { x: (pl.x + pd.x) / 2, y: 1150 - Math.max(0, CHAO_Y - pd.y) * 0.45, zoom: 0.82, rot: -3 };
  else if (f < 196) c = { x: (pl.x + pd.x) / 2 + 20, y: 1200, zoom: 0.74 + 0.1 * CURVA.suave(Math.min(1, (f - 172) / 24)), rot: -5 - (f - 172) * 0.05 };
  else {
    // close final no Diego (espelha o close do Lucas)
    const cab = posCabeca(pd);
    c = { x: cab[0] - 40, y: cab[1] + 20, zoom: 2.4 + 0.6 * CURVA.sai(Math.min(1, (f - 196) / 4)), rot: -4 };
  }
  return { ...c, x: c.x + tr.x, y: c.y + tr.y, rot: c.rot + tr.rot };
};

export const TesteJJK: React.FC = () => {
  const f = useCurrentFrame();
  const t = tw(f);
  const gt = tw(dois(f)); // tempo dos desenhos (12 por segundo)
  const pausa = f >= IMP && f < IMP + PAUSA;
  const pl0 = lucas(gt);
  const pd0 = diego(gt);
  const respL = Math.sin(dois(f) * 0.16) * (gt < 56 || gt > 172 ? 1 : 0.4);
  const respD = Math.sin(dois(f) * 0.13 + 1.3) * (gt < 64 || gt > 176 ? 1 : 0.4);
  const vento = (q: number) => Math.sin(dois(f) * 0.21 + q) * 4 + Math.sin(dois(f) * 0.07 + q) * 3;
  const pl: Pose = { ...pl0, estica: pl0.estica + respL * 0.012, inclina: pl0.inclina + respL * 1.2, cabelo: cabelo(lucas, f) + vento(0) };
  const pd: Pose = { ...pd0, estica: pd0.estica + respD * 0.012, inclina: pd0.inclina + respD * 1.2, cabelo: cabelo(diego, f) + vento(2) };
  const cam = camera(f, pl, pd);
  const close = (f >= 40 && f < 58) || f >= 196;
  const closeDiego = f >= 196;
  const borraoChicote = f >= 64 && f < 68 ? 26 : f >= 126 && f < 128 ? 18 : 0;
  const rl = trocaRosto(gt, [
    [0, { ...ROSTO_BASE, olhos: 0.8, sobrancelha: 20, sorriso: 0, olhar: [1, 0] }],
    [48, { ...ROSTO_BASE, olhos: 0.5, sobrancelha: 30, boca: 0.1, sorriso: -0.1, olhar: [1, 0] }, 0.5],
    [64, { ...ROSTO_BASE, olhos: 0.7, sobrancelha: 30, boca: 0.6, sorriso: -0.3, olhar: [1, 0] }, 0.7],
    [146, { ...ROSTO_BASE, olhos: 1.15, sobrancelha: -6, sobrancelhaY: 8, boca: 0.4, olhar: [1, -0.4] }, 1],
    [176, { ...ROSTO_BASE, olhos: 0.6, sobrancelha: 26, sorriso: 0.3, canto: 0.6, olhar: [1, 0] }, 0.5],
  ]);
  const rd = trocaRosto(gt, [
    [0, { ...ROSTO_BASE, olhos: 0.4, canto: 0.8, sorriso: 0.2, sobrancelha: 18, olhar: [1, 0] }],
    [66, { ...ROSTO_BASE, olhos: 1.1, sobrancelha: -4, boca: 0.4, olhar: [1, 0] }, 1],
    [IMP, { ...ROSTO_BASE, olhos: 0.15, sobrancelha: 22, boca: 0.7, sorriso: -0.5, olhar: [1, 0] }, 1.2],
    [110, { ...ROSTO_BASE, olhos: 0.45, sobrancelha: 26, canto: 0.9, sorriso: 0.3, olhar: [1, 0] }, 0.6],
    [124, { ...ROSTO_BASE, olhos: 0.55, sobrancelha: 30, boca: 0.8, olhar: [1, -0.3] }, 0.8],
    [176, { ...ROSTO_BASE, olhos: 0.4, canto: 0.7, sorriso: 0.2, sobrancelha: 22, olhar: [1, 0] }, 0.4],
    [202, { ...ROSTO_BASE, olhos: 0.35, canto: 1, sorriso: 0.5, sobrancelha: 24, olhar: [1, 0] }, 0.6],
  ]);
  // energia ciano na espada do Diego no contra-ataque / brilho geral no final
  const luzCena = 1.3 + 0.5 * k(f, [[172, 0], [210, 1, CURVA.suave]]);
  const contato = { x: pl0.x + 250, y: CHAO_Y - 300 };
  const impactoBranco = f === IMP + 2;
  const cena = (
    <svg width={1080} height={1920}>
      <g transform={`translate(540 960) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`}>
        <Desfoque chave="fundo" px={close ? 9 : f >= 172 ? 1.5 : 0}>
          <CenarioJJK camX={cam.x} luz={luzCena} />
        </Desfoque>
        {/* arrancada: riscos escuros + rastro de energia */}
        <RiscosVelocidade f={f} forca={f >= 62 && f < 74 ? 0.75 : 0} angulo={-8} cx={cam.x} cy={cam.y} />
        <EnergiaCiano chave="dash" pontos={[[250, CHAO_Y - 300], [350, CHAO_Y - 330], [450, CHAO_Y - 360]]} largura={34} forca={k(f, [[64, 0], [66, 1], [74, 0]])} />
        <Racha x={pd.x - 40} f={t} de={IMP + 1} tamanho={0.9} />
        <Racha x={700} f={t} de={152} tamanho={1.5} />
        <Poeira x={pd.x - 60} y={CHAO_Y + 6} f={t} de={IMP + 2} dur={22} largura={0.8} />
        {[0, 4, 8, 12].map((d) => (
          <Poeira key={d} x={diego(IMP + 2 + d).x - 80} y={CHAO_Y + 6} f={t} de={IMP + 2 + d} dur={18} largura={0.55} />
        ))}
        <Poeira x={700} y={CHAO_Y + 6} f={t} de={152} dur={26} largura={1.3} />
        <ObjetosFisica x={700} y={CHAO_Y - 10} f={t} de={152} n={9} chao={CHAO_Y + 30} velocidade={26} angulo={[-160, -20]} gravidade={1.6} semente="pjjk" desenho={(i) => <path d="M -12 -8 L 10 -12 L 14 6 L -6 12 Z" fill={["#3a4a52", "#26323a", "#4d5f68"][i % 3]} stroke="#05080c" strokeWidth={3} />} />
        <Particulas f={f} area={[cam.x - 700, CHAO_Y - 1300, 1400, 1400]} forca={0.55 + 0.45 * (luzCena - 1) / 0.6} />
        {close && !closeDiego ? null : (<CelJJK chave="diego" luz={-160}>
          <Boneco2D id="dJ" d={DIEGO} pose={{ ...pd, estica: pd.estica * rd.corpo.estica }} rosto={rd.rosto} naMao={<Espada brilho={0.4 + 0.6 * k(t, [[116, 0], [134, 1], [170, 0.3]])} cor={CIANO} />} naMaoGira />
        </CelJJK>)}
        {closeDiego ? null : (
          <CelJJK chave="lucas" luz={-160}>
            <Boneco2D id="lJ" d={LUCAS} pose={{ ...pl, estica: pl.estica * rl.corpo.estica }} rosto={rl.rosto} />
          </CelJJK>
        )}
        {/* contra-ataque: corte de energia na descida */}
        <EnergiaCiano chave="corte" pontos={[[860, CHAO_Y - 1050], [780, CHAO_Y - 620], [700, CHAO_Y - 160]]} largura={28} forca={k(t, [[148, 0], [150, 1], [160, 0]])} />
        <OndaChoque x={contato.x} y={contato.y} f={f} de={IMP + 1} dur={14} raio={700} achatado={0.5} cor={CIANO} />
        <Faiscas x={contato.x} y={contato.y} f={f} de={IMP + 1} dur={12} n={20} alcance={420} cor="#dffcff" />
        <OndaChoque x={700} y={CHAO_Y} f={t} de={152} dur={16} raio={900} achatado={0.22} cor={CIANO} />
        <LinhasRadiais f={f} x={contato.x} y={contato.y} forca={f >= IMP + PAUSA && f < IMP + PAUSA + 6 ? 0.9 : 0} />
      </g>
    </svg>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <QuadroImpacto ativo={pausa && f < IMP + 2} cor={f === IMP ? "vermelho" : "branco"}>
        <GradeJJK borrao={borraoChicote}>{cena}</GradeJJK>
      </QuadroImpacto>
      {impactoBranco ? <AbsoluteFill style={{ background: "#f4ffff", opacity: 0.85 }} /> : null}
      {f >= DURACAO - 4 ? <AbsoluteFill style={{ background: "#000" }} /> : null}
      {/* sons (frames reais) */}
      <Som src="vento" de={63} volume={0.5} />
      <Som src="impacto" de={IMP} volume={0.9} />
      <Som src="clang" de={IMP} volume={0.6} />
      <Som src="deslize" de={IMP + PAUSA + 1} volume={0.6} />
      <Som src="rumble" de={IMP + PAUSA} volume={0.4} />
      <Som src="vento" de={130 + PAUSA} volume={0.45} />
      <Som src="lamina" de={148 + PAUSA} volume={0.6} />
      <Som src="pisada" de={152 + PAUSA} volume={0.8} />
      <Som src="racha" de={153 + PAUSA} volume={0.5} />
      <Sequence from={0}>
        <Html5Audio
          src={staticFile("musica/trilha-luta.wav")}
          volume={(g) => interpolate(g, [0, 50, 60, 76, 90, 170, 190, 214], [0.0, 0.02, 0.1, 0.12, 0.12, 0.12, 0.05, 0.0], { extrapolateRight: "clamp" })}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const PLANOS_JJK = PLANOS;
