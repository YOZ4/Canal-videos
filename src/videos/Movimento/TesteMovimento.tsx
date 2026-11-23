import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Fundo, RuaLonga } from "../../estilo2d/Acabamento";
import { Boneco2D, PERFIL_BASE, ROSTO_BASE, posPe, type Pose } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { Impacto, Poeira } from "../../estilo2d/Efeitos2D";
import { CURVA, balancoCabelo, k, mixPose, piscar, respira, tremor, trocaRosto } from "../../estilo2d/anim";
import { contatos, poseCorrida } from "../../estilo2d/corrida";
import { emCadeia, entre, faseBrutal, fasePassadas, mola, pernasNoChao, seguir, xPorFase } from "../../estilo2d/movimento";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Selo } from "../../estilo2d/UI";
import { Textura } from "../../estilo2d/chibi/RuaTexturizada";
import { Palco, Som } from "../Cacadores/comum";

/**
 * Teste da skill analise-movimento-remotion (15 s):
 *  A. Lucas: corrida normal (passadas variadas) → pulo sobre a caixa → pouso amortecido → volta a correr
 *  B. Diego: corrida brutal (pisa-explode-plana, chão racha) → freada com mola em cadeia
 *  C. Soco: antecipação, golpe, pausa no impacto (hit-stop) e reação em cadeia do Diego
 */
export const DURACAO = 450;
const ESC = 0.72;
const B0 = 150;
const C0 = 300;

const comCabelo = (pose: (g: number) => Pose, f: number): Pose => {
  const p = pose(f);
  return { ...p, cabelo: balancoCabelo(f, (g) => pose(g).x * 0.15, (g) => pose(g).inclina + pose(g).agacha * 0.08) };
};

// ===================== A. corrida + pulo (Lucas) =====================
export const J0 = 64; // começa a antecipação do pulo
export const R = J0 + 37; // volta a correr (fase da corrida retoma)
export const faseA = (g: number) => fasePassadas(Math.min(g, J0) + Math.max(0, g - R), 15, "lucasA");
const xRunA = (g: number) => xPorFase("lucasA", faseA, g, "normal", ESC);
const VEL_A = (xRunA(J0) - xRunA(J0 - 6)) / 6;
/** deslocamento extra durante o pulo (a corrida "pausa" e o pulo carrega o corpo) */
const velPulo = (j: number) => (j < 5 ? k(j, [[0, 1], [5, 0.45]]) : j < 9 ? 1.25 : j < 31 ? 1.3 : j < 37 ? k(j, [[31, 0.35], [37, 0.15]]) : 0.15);
const extraA = (g: number) => {
  let s = 0;
  for (let j = 0; j < Math.min(Math.max(0, g - J0), R - J0); j++) s += velPulo(j) * VEL_A;
  return s;
};
const X0A = -1400;
const xA = (g: number) => X0A + xRunA(g) + extraA(g);

const pernasAr = (j: number) => {
  // subida encolhe, desce esticando a perna da frente para pousar
  const cD = k(j, [[9, -20], [15, 70, CURVA.sai], [21, 88], [27, 52, CURVA.suave], [31, 40]]);
  const jD = k(j, [[9, 15], [15, 118, CURVA.sai], [21, 125], [27, 60, CURVA.suave], [31, 30]]);
  const cE = k(j, [[9, -42], [16, 40, CURVA.sai], [22, 66], [28, 18, CURVA.suave], [31, 6]]);
  const jE = k(j, [[9, 25], [16, 128, CURVA.sai], [22, 132], [28, 70, CURVA.suave], [31, 52]]);
  return { cD, jD, cE, jE };
};

const pulo = (j: number): Pose => {
  const base = { ...PERFIL_BASE, escala: ESC, y: CHAO_Y, maoD: "punho" as const, maoE: "punho" as const };
  if (j < 9) {
    // antecipação (agacha) e decolagem (estica)
    const cD = k(j, [[0, 30], [5, 62, CURVA.suave], [9, -22, CURVA.entra]]);
    const jD = k(j, [[0, 30], [5, 128, CURVA.suave], [9, 12, CURVA.entra]]);
    const cE = k(j, [[0, -20], [5, -8, CURVA.suave], [9, -48, CURVA.entra]]);
    const jE = k(j, [[0, 40], [5, 118, CURVA.suave], [9, 18, CURVA.entra]]);
    const sobe = k(j, [[6, 0], [9, 40, CURVA.entra]]);
    const pernas = pernasNoChao(cD, jD, cE, jE, sobe);
    return {
      ...base,
      ...pernas,
      inclina: k(j, [[0, 16], [5, 30, CURVA.suave], [9, 6, CURVA.sai]]),
      estica: k(j, [[0, 1], [5, 0.93, CURVA.suave], [8, 1.13, CURVA.sai], [9, 1.1]]),
      cabeca: k(j, [[0, -8], [5, 6], [9, -14]]),
      bracoD: { ombro: k(j, [[0, 30], [5, -58, CURVA.suave], [9, 150, CURVA.sai]]), cotovelo: k(j, [[0, 80], [5, 40], [9, 20]]) },
      bracoE: { ombro: k(j, [[0, -30], [5, -66, CURVA.suave], [8, -20], [9, 60, CURVA.sai]]), cotovelo: k(j, [[0, 80], [5, 50], [9, 70]]) },
    };
  }
  if (j < 31) {
    const { cD, jD, cE, jE } = pernasAr(j);
    const pernas = pernasNoChao(cD, jD, cE, jE, 0);
    // altura: sobe desacelerando, desce acelerando (ápice em j=20)
    const h = j < 20 ? 330 * CURVA.sai((j - 9) / 11) : 330 * (1 - CURVA.entra((j - 20) / 11));
    return {
      ...base,
      ...pernas,
      y: CHAO_Y - h * ESC - 40 * ESC,
      inclina: k(j, [[9, 6], [20, 14], [31, 4]]),
      estica: k(j, [[9, 1.1], [14, 1.02], [20, 0.98], [28, 1.04], [31, 1]]),
      cabeca: k(j, [[9, -14], [20, 4], [31, -4]]),
      // braços: lá em cima → descem no ápice → abrem para equilibrar antes de pousar
      bracoD: { ombro: k(j, [[9, 150], [18, 120], [24, 84, CURVA.suave], [31, 48, CURVA.entra]]), cotovelo: k(j, [[9, 20], [20, 40], [31, 10]]) },
      bracoE: { ombro: k(j, [[9, 60], [13, 105, CURVA.sai], [21, 70], [26, -40, CURVA.suave], [31, -60]]), cotovelo: k(j, [[9, 70], [14, 40], [22, 60], [31, 15]]) },
    };
  }
  // pouso: afunda rápido (3 frames) e volta com mola pesada (passa um tiquinho do ponto)
  const afunda = j < 34 ? CURVA.sai((j - 31) / 3) : 1 - mola(j, 34, "pesado");
  const pernas = pernasNoChao(entre(40, 52, afunda), entre(30, 104, afunda), entre(6, -14, afunda), entre(52, 96, afunda), 0);
  return {
    ...base,
    ...pernas,
    inclina: entre(4, 28, afunda),
    estica: entre(1, 0.9, Math.min(1, afunda * 1.3)),
    cabeca: entre(-4, 10, afunda),
    bracoD: { ombro: entre(48, 22, afunda), cotovelo: entre(10, 60, afunda) },
    bracoE: { ombro: entre(-60, -20, afunda), cotovelo: entre(15, 50, afunda) },
  };
};

export const poseA = (g: number): Pose => {
  const corre: Pose = { ...PERFIL_BASE, ...poseCorrida(faseA(g), "normal", 1), escala: ESC, x: 0, y: CHAO_Y };
  const j = g - J0;
  // entra no pulo em 4 frames; sai do pouso para a corrida em 9 frames
  const w = j < 0 ? 0 : j < 4 ? CURVA.suave(j / 4) : j < 37 ? 1 : j < 46 ? 1 - CURVA.suave((j - 37) / 9) : 0;
  const p = w <= 0 ? corre : w >= 1 ? pulo(j) : mixPose(corre, pulo(Math.min(j, 45)), w);
  return { ...p, x: xA(g) };
};

const CAIXA_X = xA(J0 + 20) + 10;

const CenaPulo: React.FC = () => {
  const f = useCurrentFrame();
  const p = comCabelo((g) => emCadeia(poseA, g), f);
  const camX = seguir((g) => xA(g), f, 9) + 170;
  const j = f - J0;
  const r = trocaRosto(f, [
    [0, { ...ROSTO_BASE, sobrancelha: 10, sorriso: 0.3, olhar: [1, 0] }],
    [J0, { ...ROSTO_BASE, olhos: 0.8, sobrancelha: 18, sorriso: 0, boca: 0.25, olhar: [1, -0.3] }, 0.6],
    [J0 + 40, { ...ROSTO_BASE, olhos: 0.9, sobrancelha: -2, sorriso: 0.9, boca: 0.4, olhar: [1, 0] }, 0.8],
  ]);
  const pousoX = xA(J0 + 31);
  const treme = j >= 31 && j < 36 ? tremor(f, 5 * (1 - (j - 31) / 5)) : { x: 0, y: 0 };
  return (
    <>
      <Palco cam={{ x: camX + treme.x, y: 1060 + treme.y, zoom: 1.02 }} parado>
        <Fundo>
          <RuaLonga camX={camX} />
        </Fundo>
        {/* caixa para pular */}
        <g transform={`translate(${CAIXA_X} ${CHAO_Y})`}>
          <rect x={-120} y={-230} width={240} height={230} fill="#c98f52" stroke="#1d1424" strokeWidth={7} rx={6} />
          <path d="M -120 -230 L 120 0 M 120 -230 L -120 0" stroke="#8c5f34" strokeWidth={6} />
        </g>
        {contatos(faseA, Math.max(1, f - 16), f).map(({ f: g, pe }) =>
          g < J0 || g > R + 2 ? <Poeira key={g} x={posPe(poseA(g), pe)[0]} y={CHAO_Y + 4} f={f} de={g} dur={14} largura={0.35} /> : null,
        )}
        <Poeira x={pousoX} y={CHAO_Y + 6} f={f} de={J0 + 31} dur={22} largura={0.9} />
        <Boneco2D id="lA" d={LUCAS} pose={{ ...p, estica: p.estica * r.corpo.estica }} rosto={{ ...r.rosto, olhos: r.rosto.olhos * piscar(f, "lA") }} />
      </Palco>
      <Selo texto="CORRIDA + PULO" de={4} ate={B0 - 6} cor="#2f6fb0" />
      <Som src="whoosh" de={J0 + 7} volume={0.4} />
      <Som src="impacto" de={J0 + 31} volume={0.35} />
    </>
  );
};

// ===================== B. corrida brutal + freada (Diego) =====================
export const S = 92; // começa a freada
export const faseB = (g: number) => faseBrutal(Math.min(g, S), "diegoB");
const xRunB = (g: number) => xPorFase("diegoB", faseB, Math.min(g, S), "rapida", ESC);
const VEL_B = (xRunB(S) - xRunB(S - 4)) / 4;
const X0B = 200;
/** freada: escorrega desacelerando por 10 frames */
const xB = (g: number) => X0B + xRunB(g) + (g > S ? VEL_B * 10 * 0.55 * (1 - Math.pow(1 - Math.min(1, (g - S) / 10), 2)) : 0);
const pisadas = contatos(faseB, 1, S);

export const poseB = (g: number): Pose => {
  const c = poseCorrida(faseB(g), "rapida", 1);
  // pisada: afunda e achata; explosão: estica
  const ult = [...pisadas].reverse().find((p) => p.f <= g);
  const d = ult ? g - ult.f : 99;
  const pisa = d < 4 ? k(d, [[0, 0.5], [1, 1, CURVA.sai], [4, 0, CURVA.suave]]) : 0;
  const explode = d >= 2 && d < 6 ? Math.sin(((d - 2) / 4) * Math.PI) : 0;
  const corre: Pose = {
    ...PERFIL_BASE,
    ...c,
    escala: ESC,
    x: 0,
    y: CHAO_Y,
    agacha: c.agacha + 70 * pisa,
    estica: c.estica * (1 + 0.08 * explode),
    inclina: c.inclina + 8 + 6 * pisa,
    cabeca: c.cabeca + 6 * pisa,
  };
  if (g <= S) return { ...corre, x: xB(g) };
  // freada: entra em 5 frames (sem troca seca), tronco joga para trás e volta com mola pesada,
  // cabeça segue 2 frames depois, braços por inércia vão à frente e balançam; depois cruza os braços e respira
  const t = g - S;
  const firma = CURVA.suave(Math.min(1, t / 6));
  const pernas = pernasNoChao(entre(30, 46, firma), entre(20, 14, firma), entre(-30, -24, firma), entre(60, 70, firma), 0);
  const solta = mola(g, S + 14, "natural");
  const fica = pernasNoChao(12, 8, -10, 10, 0);
  const volta = mola(g, S + 4, "pesado");
  const cruza = mola(g, S + 24, "natural");
  const respiro = t > 30 ? respira(g, 20) : 0;
  const freio: Pose = {
    ...corre,
    ...(t < 14 ? pernas : { peD: { dx: entre(pernas.peD.dx, fica.peD.dx, solta), dy: 0 }, peE: { dx: entre(pernas.peE.dx, fica.peE.dx, solta), dy: 0 }, agacha: entre(pernas.agacha, fica.agacha, solta) }),
    inclina: (t < 4 ? entre(corre.inclina, -16, CURVA.sai(t / 4)) : entre(-16, 0, volta)) + respiro * 1.2,
    estica: (t < 4 ? entre(1, 0.95, t / 4) : entre(0.95, 1, volta)) + respiro * 0.01,
    cabeca: (t < 6 ? entre(corre.cabeca, 14, CURVA.sai(t / 6)) : entre(14, 0, mola(g, S + 6, "natural"))) + Math.sin(g * 0.07) * 1.5,
    bracoD: {
      ombro: entre(entre(70, 14, mola(g, S + 6, "solto")), 34, cruza) + Math.sin(g * 0.09) * 2,
      cotovelo: entre(entre(30, 10, mola(g, S + 8, "solto")), 112, cruza),
    },
    bracoE: {
      ombro: entre(entre(55, 10, mola(g, S + 8, "solto")), 26, mola(g, S + 27, "natural")) + Math.sin(g * 0.09 + 1) * 2,
      cotovelo: entre(entre(40, 14, mola(g, S + 10, "solto")), 120, mola(g, S + 27, "natural")),
    },
    maoD: "punho",
    maoE: "punho",
  };
  const p = t < 6 ? mixPose(corre, freio, CURVA.suave(t / 6)) : freio;
  return { ...p, x: xB(g) };
};

const CenaBrutal: React.FC = () => {
  const f = useCurrentFrame();
  const p = comCabelo((g) => emCadeia(poseB, g, { cabeca: 3, ombroD: 2, cotoveloD: 4, ombroE: 3, cotoveloE: 6 }), f);
  const camX = seguir((g) => xB(g), f, 7) + 150;
  const ult = [...pisadas].reverse().find((q) => q.f <= f);
  const dp = ult ? f - ult.f : 99;
  const treme = dp < 4 && f <= S + 2 ? tremor(f, 7 * (1 - dp / 4)) : { x: 0, y: 0 };
  const r = trocaRosto(f, [
    [0, { ...ROSTO_BASE, olhos: 0.55, sobrancelha: 22, sorriso: -0.1, boca: 0.15, olhar: [1, 0] }],
    [S + 2, { ...ROSTO_BASE, olhos: 0.9, sobrancelha: 6, boca: 0.35, olhar: [1, 0.2] }, 0.5],
    [S + 30, { ...ROSTO_BASE, olhos: 0.45, canto: 1, sorriso: 0.35, sobrancelha: 16, olhar: [-0.4, 0] }, 0.6],
  ]);
  return (
    <>
      <Palco cam={{ x: camX + treme.x, y: 1060 + treme.y, zoom: 1.02 }} parado>
        <Fundo>
          <RuaLonga camX={camX} />
        </Fundo>
        {pisadas.map(({ f: g, pe }) => {
          const idade = f - g;
          if (idade < 0 || idade > 40) return null;
          const [px] = posPe(poseB(g), pe);
          const s = Math.min(1, idade / 3);
          return (
            <g key={g} transform={`translate(${px} ${CHAO_Y + 6}) scale(${s})`} opacity={1 - Math.max(0, idade - 22) / 18} stroke="#1d1424" strokeWidth={6} fill="none" strokeLinecap="round">
              <ellipse cx={0} cy={0} rx={120} ry={22} />
              <path d="M -40 -4 L -90 8 L -130 2 M 30 2 L 80 14 L 140 6 M 0 6 L -10 24 M -70 6 L -60 22" />
            </g>
          );
        })}
        {f >= S && f < S + 30 ? [0, 3, 6, 9].map((d) => <Poeira key={`p${d}`} x={posPe(poseB(S + d), "D")[0]} y={CHAO_Y + 4} f={f} de={S + d} dur={16} largura={0.5} />) : null}
        <Boneco2D id="dB" d={DIEGO} pose={{ ...p, estica: p.estica * r.corpo.estica }} rosto={{ ...r.rosto, olhos: r.rosto.olhos * piscar(f, "dB") }} />
      </Palco>
      <Selo texto="CORRIDA BRUTAL + FREADA" de={4} ate={150 - 6} cor="#3d7a3a" />
      {pisadas.map(({ f: g }) => (g <= S ? <Som key={g} src="impacto" de={g} volume={0.16} /> : null))}
      <Som src="whoosh" de={S} volume={0.35} />
    </>
  );
};

// ===================== C. soco com reação em cadeia =====================
const IMP = 41; // contato do soco
const PAUSA = 5; // hit-stop
/** tempo com a pausa do impacto (os dois congelam) */
const tw = (g: number) => (g < IMP ? g : g < IMP + PAUSA ? IMP : g - PAUSA);

const guardaL = (g: number): Pose => ({
  ...PERFIL_BASE,
  escala: ESC,
  x: 300,
  y: CHAO_Y,
  ...pernasNoChao(22, 34, -20, 30, 0),
  inclina: 6 + Math.sin(g * 0.09) * 1.5,
  estica: 1 + respira(g) * 0.01,
  bracoD: { ombro: 40 + Math.sin(g * 0.09 + 1) * 3, cotovelo: 110 },
  bracoE: { ombro: 30 + Math.sin(g * 0.09 + 1.6) * 3, cotovelo: 100 },
  maoD: "punho",
  maoE: "punho",
});

const poseLucasC = (g: number): Pose => {
  const t = tw(g);
  const b = guardaL(t);
  // antecipação 30–38, soco 38–41, follow-through e volta com mola
  const ant = k(t, [[30, 0], [38, 1, CURVA.suave]]);
  const vai = k(t, [[38, 0], [41, 1, CURVA.sai]]);
  const volta = mola(t, IMP + 3, "natural");
  const soco = vai * (1 - volta);
  const passo = vai * (1 - mola(t, IMP + 6, "pesado") * 0.6);
  return {
    ...b,
    x: b.x + 150 * passo - 14 * ant * (1 - vai),
    ...pernasNoChao(22 + 22 * passo, 34 - 20 * passo, -20 - 14 * passo, 30, 0),
    inclina: b.inclina - 10 * ant * (1 - vai) + 9 * soco,
    cabeca: 6 * ant * (1 - vai) - 6 * soco,
    bracoD: { ombro: entre(entre(b.bracoD.ombro, 24, ant), 94, soco), cotovelo: entre(entre(b.bracoD.cotovelo, 130, ant), -4, soco) },
    bracoE: { ombro: b.bracoE.ombro - 30 * soco, cotovelo: b.bracoE.cotovelo + 10 * soco },
  };
};

const guardaD = (g: number): Pose => ({
  ...PERFIL_BASE,
  lado: -1,
  escala: ESC,
  x: 820,
  y: CHAO_Y,
  ...pernasNoChao(18, 26, -24, 34, 0),
  inclina: 3 + Math.sin(g * 0.075 + 2) * 2,
  estica: 1 + respira(g, 40) * 0.01,
  cabeca: Math.sin(g * 0.075 + 2.4) * 3,
  bracoD: { ombro: 26 + Math.sin(g * 0.075 + 3) * 4, cotovelo: 92 },
  bracoE: { ombro: 18 + Math.sin(g * 0.075 + 3.5) * 4, cotovelo: 84 },
  maoD: "punho",
  maoE: "punho",
});

const poseDiegoC = (g: number): Pose => {
  const t = tw(g);
  const b = guardaD(t);
  if (t < IMP) return b;
  // reação em cadeia: cabeça (+1) → tronco (+3) → braços (+5); cada um volta com sua mola
  const cab = (t >= IMP + 1 ? 1 : 0) * (1 - mola(t, IMP + 4, "solto"));
  const tro = k(t, [[IMP + 1, 0], [IMP + 4, 1, CURVA.sai]]) * (1 - mola(t, IMP + 8, "pesado"));
  const bra = k(t, [[IMP + 3, 0], [IMP + 6, 1, CURVA.sai]]) * (1 - mola(t, IMP + 9, "solto"));
  const empurra = CURVA.sai(Math.min(1, Math.max(0, (t - IMP - 1) / 9)));
  return {
    ...b,
    x: b.x + 60 * empurra,
    ...pernasNoChao(18 - 10 * tro, 26 + 30 * tro, -24 - 6 * tro, 34 + 20 * tro, 0),
    cabeca: b.cabeca - 34 * cab,
    inclina: b.inclina - 24 * tro,
    bracoD: { ombro: b.bracoD.ombro - 30 * bra, cotovelo: b.bracoD.cotovelo - 50 * bra },
    bracoE: { ombro: b.bracoE.ombro + 35 * bra, cotovelo: b.bracoE.cotovelo - 40 * bra },
  };
};

const CenaSoco: React.FC = () => {
  const f = useCurrentFrame();
  const t = tw(f);
  const pl = emCadeia(poseLucasC, f, { cabeca: 2, ombroD: 0, cotoveloD: 1, ombroE: 3, cotoveloE: 4 });
  const pd = emCadeia(poseDiegoC, f, { cabeca: 0, ombroD: 1, cotoveloD: 3, ombroE: 2, cotoveloE: 4 });
  const pausa = f >= IMP && f < IMP + PAUSA;
  const zoom = 1.05 + 0.12 * k(f, [[IMP - 2, 0], [IMP, 1, CURVA.sai], [IMP + PAUSA + 14, 0, CURVA.suave]]);
  const treme = f >= IMP && f < IMP + PAUSA + 6 ? tremor(f, 9 * (1 - (f - IMP) / (PAUSA + 6))) : { x: 0, y: 0 };
  const rl = trocaRosto(t, [
    [0, { ...ROSTO_BASE, sobrancelha: 16, sorriso: 0.1, olhar: [1, 0] }],
    [32, { ...ROSTO_BASE, olhos: 0.75, sobrancelha: 26, boca: 0.45, sorriso: -0.2, olhar: [1, 0] }, 0.5],
    [IMP + 18, { ...ROSTO_BASE, olhos: 1, sobrancelha: 4, sorriso: 0.6, boca: 0.2, olhar: [1, 0] }, 0.6],
    [IMP + 46, { ...ROSTO_BASE, olhos: 1.15, sobrancelha: -12, sobrancelhaY: 8, sorriso: -0.1, boca: 0.4, olhar: [1, 0] }, 1.2],
  ]);
  const rd = trocaRosto(t, [
    [0, { ...ROSTO_BASE, olhos: 0.5, canto: 0.6, sorriso: 0.2, sobrancelha: 14, olhar: [1, 0] }],
    [IMP, { ...ROSTO_BASE, olhos: 0.15, sobrancelha: -10, boca: 0.6, sorriso: -0.5, olhar: [1, 0] }, 1.4],
    [IMP + 22, { ...ROSTO_BASE, olhos: 0.6, sobrancelha: 10, sorriso: 0, boca: 0.1, olhar: [1, 0] }, 0.6],
    [IMP + 40, { ...ROSTO_BASE, olhos: 0.45, canto: 1, sorriso: 0.4, sobrancelha: 18, olhar: [1, 0] }, 0.7],
  ]);
  return (
    <>
      <Palco cam={{ x: 590 + treme.x, y: 1080 + treme.y, zoom }} parado>
        <Fundo>
          <RuaLonga camX={570} />
        </Fundo>
        <Poeira x={pd.x - 60} y={CHAO_Y + 4} f={t} de={IMP + 2} dur={18} largura={0.6} />
        <Boneco2D id="dC" d={DIEGO} pose={comCabelo(() => pd, f)} rosto={{ ...rd.rosto, olhos: rd.rosto.olhos * (pausa ? 1 : piscar(t, "dC")) }} />
        <Boneco2D id="lC" d={LUCAS} pose={{ ...pl, estica: pl.estica * rl.corpo.estica }} rosto={{ ...rl.rosto, olhos: rl.rosto.olhos * (pausa ? 1 : piscar(t, "lC")) }} />
        <Impacto x={(pl.x + pd.x) / 2 + 30} y={CHAO_Y - 560} f={f} de={IMP} dur={12} />
      </Palco>
      {f >= IMP && f < IMP + 2 ? <AbsoluteFill style={{ background: "#fff", opacity: 0.55 }} /> : null}
      <Selo texto="SOCO EM CADEIA" de={4} ate={150 - 6} cor="#b0402f" />
      <Som src="whoosh" de={36} volume={0.4} />
      <Som src="impacto" de={IMP} volume={0.7} />
    </>
  );
};

export const TesteMovimento: React.FC = () => (
  <AbsoluteFill style={{ background: "#efe4d2" }}>
    <Sequence durationInFrames={B0}>
      <CenaPulo />
    </Sequence>
    <Sequence from={B0} durationInFrames={C0 - B0}>
      <CenaBrutal />
    </Sequence>
    <Sequence from={C0} durationInFrames={DURACAO - C0}>
      <CenaSoco />
    </Sequence>
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <Textura />
      </svg>
    </AbsoluteFill>
    <Html5Audio src={staticFile("musica/trilha-leve.wav")} volume={0.1} />
  </AbsoluteFill>
);
