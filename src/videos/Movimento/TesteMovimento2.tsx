import { AbsoluteFill, Html5Audio, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Fundo, ObjetosFisica, RuaLonga } from "../../estilo2d/Acabamento";
import { Boneco2D, PERFIL_BASE, ROSTO_BASE, posPe, type Pose } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { Impacto, LinhasMovimento, Poeira } from "../../estilo2d/Efeitos2D";
import { CorteArco, Faiscas, OndaChoque, Rastro } from "../../estilo2d/EfeitosLuta";
import { Espada } from "../../estilo2d/Objetos";
import { CURVA, balancoCabelo, k, kPose, mixPose, piscar, respira, tremor, trocaRosto } from "../../estilo2d/anim";
import { contatos, poseCorrida } from "../../estilo2d/corrida";
import { RITMO_BRUTAL, RITMO_NINJA, emCadeia, entre, faseRitmo, fasePassadas, mola, pernasNoChao, seguir, xPorFase } from "../../estilo2d/movimento";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Selo } from "../../estilo2d/UI";
import { Textura } from "../../estilo2d/chibi/RuaTexturizada";
import { Palco, Som } from "../Cacadores/comum";

/**
 * Teste de movimento v2 (~22 s):
 *  A. Pulo melhorado (Lucas)         B. Corrida brutal v2 + freada (Diego)
 *  C. Corrida ninja nova (Lucas)     D. Luta com a gramática dos vídeos 5 e 6 (espada x chutes)
 */
const ESC = 0.72;
export const A0 = 0;
export const B0 = 150;
export const C0 = 300;
export const D0 = 420;
export const DURACAO = 635;

const comCabelo = (pose: (g: number) => Pose, f: number, k2 = 0.15): Pose => {
  const p = pose(f);
  return { ...p, cabelo: balancoCabelo(f, (g) => pose(g).x * k2 * (pose(g).lado ?? 1), (g) => pose(g).inclina + pose(g).agacha * 0.08 + (pose(g).gira ?? 0) * 0.05) };
};

const Passos: React.FC<{ fase: (g: number) => number; pose: (g: number) => Pose; f: number; ate?: number; som?: string; vol?: number; poeira?: number }> = ({ fase, pose, f, ate = 9999, som = "passo", vol = 0.3, poeira = 0.35 }) => (
  <>
    {contatos(fase, Math.max(1, f - 16), Math.min(f, ate)).map(({ f: g, pe }) => (
      <Poeira key={`p${g}`} x={posPe(pose(g), pe)[0]} y={CHAO_Y + 4} f={f} de={g} dur={14} largura={poeira} />
    ))}
  </>
);
const SonsPassos: React.FC<{ fase: (g: number) => number; de: number; ate: number; som?: string; vol?: number }> = ({ fase, de, ate, som = "passo", vol = 0.3 }) => (
  <>
    {contatos(fase, de, ate).map(({ f: g }) => (
      <Som key={`s${g}`} src={som} de={g} volume={vol * (0.85 + random(`vp${g}`) * 0.3)} />
    ))}
  </>
);

// ============================================================================================
// A. PULO MELHORADO
// Referência (vídeo 3, 30 fps): agacha ~6f, estica 4f, braços sobem 2–3f depois das pernas, sobe desacelerando,
// segura no ápice ~5f encolhido, desce acelerando abrindo os braços, pousa afundando ~5f, volta a correr.
// ============================================================================================
const J0 = 64;
const R_A = J0 + 42;
const faseA = (g: number) => fasePassadas(Math.min(g, J0) + Math.max(0, g - R_A), 15, "lucasA2");
const xRunA = (g: number) => xPorFase("lucasA2", faseA, g, "normal", ESC);
const VEL_A = (xRunA(J0) - xRunA(J0 - 6)) / 6;
const velPulo = (j: number) => (j < 6 ? k(j, [[0, 1], [6, 0.35]]) : j < 10 ? 1.3 : j < 34 ? 1.35 : j < 40 ? k(j, [[34, 0.3], [40, 0.12]]) : 0.12);
const extraA = (g: number) => {
  let s = 0;
  for (let j = 0; j < Math.min(Math.max(0, g - J0), R_A - J0); j++) s += velPulo(j) * VEL_A;
  return s;
};
const xA = (g: number) => -1400 + xRunA(g) + extraA(g);
/** altura do pulo: sobe desacelerando (10→19), segura no ápice (19→24), desce acelerando (24→34) */
const alturaPulo = (j: number) => (j < 10 || j >= 34 ? 0 : j < 19 ? 420 * CURVA.sai((j - 10) / 9) : j < 24 ? 420 + 14 * Math.sin(((j - 19) / 5) * Math.PI) : 420 * (1 - CURVA.entra((j - 24) / 10)));

const pulo = (j: number): Pose => {
  const base: Pose = { ...PERFIL_BASE, escala: ESC, x: 0, y: CHAO_Y, maoD: "punho", maoE: "punho" };
  if (j < 10) {
    const cD = k(j, [[0, 30], [6, 66, CURVA.suave], [10, -24, CURVA.entra]]);
    const jD = k(j, [[0, 30], [6, 132, CURVA.suave], [10, 10, CURVA.entra]]);
    const cE = k(j, [[0, -20], [6, -6, CURVA.suave], [10, -50, CURVA.entra]]);
    const jE = k(j, [[0, 40], [6, 124, CURVA.suave], [10, 16, CURVA.entra]]);
    return {
      ...base,
      ...pernasNoChao(cD, jD, cE, jE, k(j, [[7, 0], [10, 50, CURVA.entra]])),
      inclina: k(j, [[0, 16], [6, 34, CURVA.suave], [10, 4, CURVA.sai]]),
      estica: k(j, [[0, 1], [6, 0.9, CURVA.suave], [9, 1.16, CURVA.sai], [10, 1.12]]),
      cabeca: k(j, [[0, -8], [6, 10], [10, -16]]),
      bracoD: { ombro: k(j, [[0, 30], [6, -64, CURVA.suave], [8, -30], [10, 160, CURVA.sai]]), cotovelo: k(j, [[0, 80], [6, 30], [10, 18]]) },
      bracoE: { ombro: k(j, [[0, -30], [5, -56, CURVA.suave], [9, -30], [10, 70, CURVA.sai]]), cotovelo: k(j, [[0, 80], [5, 40], [10, 70]]) },
    };
  }
  if (j < 34) {
    const cD = k(j, [[10, -24], [16, 84, CURVA.sai], [24, 92], [30, 50, CURVA.suave], [34, 42]]);
    const jD = k(j, [[10, 10], [16, 126, CURVA.sai], [24, 132], [30, 50, CURVA.suave], [34, 24]]);
    const cE = k(j, [[10, -50], [17, 58, CURVA.sai], [24, 66], [31, 12, CURVA.suave], [34, 2]]);
    const jE = k(j, [[10, 16], [17, 132, CURVA.sai], [24, 138], [31, 66, CURVA.suave], [34, 50]]);
    return {
      ...base,
      ...pernasNoChao(cD, jD, cE, jE, 0),
      y: CHAO_Y - alturaPulo(j) * ESC - 30 * ESC,
      inclina: k(j, [[10, 4], [21, 16], [34, 2]]),
      estica: k(j, [[10, 1.12], [15, 1.02], [21, 0.96], [30, 1.05], [34, 1.02]]),
      cabeca: k(j, [[10, -16], [21, 8], [34, -6]]),
      bracoD: { ombro: k(j, [[10, 160], [17, 150], [23, 110, CURVA.suave], [29, 76, CURVA.suave], [34, 46, CURVA.entra]]), cotovelo: k(j, [[10, 18], [21, 46], [34, 8]]) },
      bracoE: { ombro: k(j, [[10, 70], [14, 120, CURVA.sai], [22, 84], [28, -44, CURVA.suave], [34, -66]]), cotovelo: k(j, [[10, 70], [15, 36], [23, 60], [34, 12]]) },
    };
  }
  // pouso: afunda em 3f, achata 2f, volta com mola pesada (passa um tiquinho do ponto)
  const afunda = j < 37 ? CURVA.sai((j - 34) / 3) : 1 - mola(j, 37, "pesado");
  return {
    ...base,
    ...pernasNoChao(entre(42, 56, afunda), entre(24, 112, afunda), entre(2, -16, afunda), entre(50, 104, afunda), 0),
    inclina: entre(2, 32, afunda),
    estica: j < 37 ? entre(1, 0.86, afunda) : entre(1, 0.9, afunda),
    cabeca: entre(-6, 12, afunda),
    // braços continuam descendo depois do pouso (inércia) e voltam soltos
    bracoD: { ombro: entre(46, 10, afunda) + 8 * (1 - mola(j, 36, "solto")), cotovelo: entre(8, 60, afunda) },
    bracoE: { ombro: entre(-66, -30, afunda), cotovelo: entre(12, 56, afunda) },
  };
};

const poseA = (g: number): Pose => {
  const corre: Pose = { ...PERFIL_BASE, ...poseCorrida(faseA(g), "normal", 1), escala: ESC, x: 0, y: CHAO_Y };
  const j = g - J0;
  const w = j < 0 ? 0 : j < 4 ? CURVA.suave(j / 4) : j < 40 ? 1 : j < 50 ? 1 - CURVA.suave((j - 40) / 10) : 0;
  const p = w <= 0 ? corre : w >= 1 ? pulo(j) : mixPose(corre, pulo(Math.min(j, 49)), w);
  return { ...p, x: xA(g) };
};
const CAIXA_X = xA(J0 + 21) + 10;

export const CenaPulo: React.FC<{ semSelo?: boolean }> = ({ semSelo }) => {
  const f = useCurrentFrame();
  const p = comCabelo((g) => emCadeia(poseA, g), f);
  const j = f - J0;
  const camX = seguir((g) => xA(g), f, 9) + 170;
  const camY = 1060 - 0.4 * seguir((g) => alturaPulo(g - J0) * ESC, f, 8);
  const treme = j >= 34 && j < 40 ? tremor(f, 7 * (1 - (j - 34) / 6)) : { x: 0, y: 0 };
  const r = trocaRosto(f, [
    [0, { ...ROSTO_BASE, sobrancelha: 10, sorriso: 0.3, olhar: [1, 0] }],
    [J0 - 2, { ...ROSTO_BASE, olhos: 0.75, sobrancelha: 20, sorriso: 0, boca: 0.2, olhar: [1, -0.4] }, 0.6],
    [J0 + 18, { ...ROSTO_BASE, olhos: 1.1, sobrancelha: -6, sorriso: 0.9, boca: 0.55, olhar: [1, 0.5] }, 0.8],
    [J0 + 44, { ...ROSTO_BASE, olhos: 0.9, sobrancelha: -2, sorriso: 0.8, boca: 0.3, olhar: [1, 0] }, 0.5],
  ]);
  return (
    <>
      <Palco cam={{ x: camX + treme.x, y: camY + treme.y, zoom: 1.0 }} parado>
        <Fundo>
          <RuaLonga camX={camX} />
        </Fundo>
        <g transform={`translate(${CAIXA_X} ${CHAO_Y})`}>
          <rect x={-130} y={-250} width={260} height={250} fill="#c98f52" stroke="#1d1424" strokeWidth={7} rx={6} />
          <path d="M -130 -250 L 130 0 M 130 -250 L -130 0" stroke="#8c5f34" strokeWidth={6} />
        </g>
        <Passos fase={faseA} pose={poseA} f={f} />
        <Poeira x={xA(J0 + 9)} y={CHAO_Y + 6} f={f} de={J0 + 9} dur={16} largura={0.7} />
        <Poeira x={xA(J0 + 34)} y={CHAO_Y + 6} f={f} de={J0 + 34} dur={24} largura={1.1} />
        {/* linhas de velocidade verticais na subida */}
        {j >= 9 && j < 17 ? (
          <g opacity={1 - (j - 9) / 8} stroke="#fff" strokeWidth={9} strokeLinecap="round">
            {[-70, -20, 40, 90].map((dx, i) => (
              <line key={i} x1={p.x + dx} y1={p.y + 40 + i * 25} x2={p.x + dx} y2={p.y + 220 + i * 25} />
            ))}
          </g>
        ) : null}
        <Boneco2D id="lA2" d={LUCAS} pose={{ ...p, estica: p.estica * r.corpo.estica }} rosto={{ ...r.rosto, olhos: r.rosto.olhos * piscar(f, "lA2") }} />
      </Palco>
      {semSelo ? null : <Selo texto="PULO (MELHORADO)" de={4} ate={B0 - 6} cor="#2f6fb0" />}
      <SonsPassos fase={faseA} de={1} ate={J0} />
      <SonsPassos fase={faseA} de={R_A + 2} ate={B0} />
      <Som src="vento" de={J0 + 8} volume={0.45} />
      <Som src="pisada" de={J0 + 34} volume={0.45} />
    </>
  );
};

// ============================================================================================
// B. CORRIDA BRUTAL v2 — pisa fundo, chão racha e solta pedra, plana SEGURANDO a pose, freia com mola
// ============================================================================================
const S_B = 96;
const faseB = (g: number) => faseRitmo(Math.min(g, S_B), "diegoB2", RITMO_BRUTAL, 1);
const xRunB = (g: number) => xPorFase("diegoB2", faseB, Math.min(g, S_B), "rapida", ESC);
const VEL_B = (xRunB(S_B) - xRunB(S_B - 4)) / 4;
const xB = (g: number) => -1300 + xRunB(g) + (g > S_B ? VEL_B * 12 * 0.5 * (1 - Math.pow(1 - Math.min(1, (g - S_B) / 12), 2)) : 0);
const pisadasB = contatos(faseB, 1, S_B);

const poseB = (g: number): Pose => {
  const c = poseCorrida(faseB(g), "rapida", 1);
  const ult = [...pisadasB].reverse().find((q) => q.f <= g);
  const d = ult ? g - ult.f : 99;
  const pisa = d < 5 ? k(d, [[0, 0.6], [1, 1, CURVA.sai], [2, 1], [5, 0, CURVA.suave]]) : 0;
  const explode = d >= 2 && d < 7 ? Math.sin(((d - 2) / 5) * Math.PI) : 0;
  const corre: Pose = {
    ...PERFIL_BASE,
    ...c,
    escala: ESC,
    x: 0,
    agacha: c.agacha + 130 * pisa,
    y: CHAO_Y - (d >= 4 && d < 12 ? Math.sin(((d - 4) / 8) * Math.PI) * 60 : 0),
    estica: c.estica * (1 + 0.09 * explode),
    inclina: c.inclina + 12 + 14 * pisa - 4 * explode,
    cabeca: c.cabeca + 10 * pisa,
    bracoD: { ombro: c.bracoD.ombro * 1.15, cotovelo: c.bracoD.cotovelo },
    bracoE: { ombro: c.bracoE.ombro * 1.15, cotovelo: c.bracoE.cotovelo },
  };
  if (g <= S_B) return { ...corre, x: xB(g) };
  const t = g - S_B;
  const firma = CURVA.suave(Math.min(1, t / 6));
  const pernas = pernasNoChao(entre(30, 50, firma), entre(20, 12, firma), entre(-30, -26, firma), entre(60, 74, firma), 0);
  const solta = mola(g, S_B + 16, "natural");
  const fica = pernasNoChao(12, 8, -10, 10, 0);
  const volta = mola(g, S_B + 5, "pesado");
  const cruza = mola(g, S_B + 26, "natural");
  const respiro = t > 26 ? respira(g * 1.6, 20) : 0; // respira ofegante depois da corrida
  const freio: Pose = {
    ...corre,
    ...(t < 16 ? pernas : { peD: { dx: entre(pernas.peD.dx, fica.peD.dx, solta), dy: 0 }, peE: { dx: entre(pernas.peE.dx, fica.peE.dx, solta), dy: 0 }, agacha: entre(pernas.agacha, fica.agacha, solta) }),
    inclina: (t < 5 ? entre(corre.inclina, -20, CURVA.sai(t / 5)) : entre(-20, 0, volta)) + respiro * 2,
    estica: (t < 5 ? entre(1, 0.94, t / 5) : entre(0.94, 1, volta)) + respiro * 0.012,
    cabeca: (t < 7 ? entre(corre.cabeca, 16, CURVA.sai(t / 7)) : entre(16, 0, mola(g, S_B + 7, "natural"))) + Math.sin(g * 0.07) * 1.5,
    bracoD: { ombro: entre(entre(80, 14, mola(g, S_B + 6, "solto")), 34, cruza), cotovelo: entre(entre(30, 10, mola(g, S_B + 8, "solto")), 112, cruza) },
    bracoE: { ombro: entre(entre(60, 10, mola(g, S_B + 9, "solto")), 26, mola(g, S_B + 29, "natural")), cotovelo: entre(entre(40, 14, mola(g, S_B + 11, "solto")), 120, mola(g, S_B + 29, "natural")) },
    maoD: "punho",
    maoE: "punho",
  };
  const p = t < 6 ? mixPose(corre, freio, CURVA.suave(t / 6)) : freio;
  return { ...p, x: xB(g) };
};

export const CenaBrutal: React.FC<{ semSelo?: boolean }> = ({ semSelo }) => {
  const f = useCurrentFrame();
  const p = comCabelo((g) => emCadeia(poseB, g, { cabeca: 3, ombroD: 2, cotoveloD: 4, ombroE: 3, cotoveloE: 6 }), f);
  const camX = seguir((g) => xB(g), f, 4) + 200;
  const ult = [...pisadasB].reverse().find((q) => q.f <= f);
  const dp = ult ? f - ult.f : 99;
  const treme = dp < 5 && f <= S_B + 2 ? tremor(f, 11 * (1 - dp / 5)) : { x: 0, y: 0 };
  // planando = trecho em que a pose fica segurada (linhas de velocidade)
  const planando = dp >= 4 && dp < 11 && f <= S_B;
  const r = trocaRosto(f, [
    [0, { ...ROSTO_BASE, olhos: 0.5, sobrancelha: 24, sorriso: -0.15, boca: 0.2, olhar: [1, 0] }],
    [S_B + 2, { ...ROSTO_BASE, olhos: 0.9, sobrancelha: 6, boca: 0.4, olhar: [1, 0.2] }, 0.5],
    [S_B + 32, { ...ROSTO_BASE, olhos: 0.45, canto: 1, sorriso: 0.35, sobrancelha: 16, olhar: [-0.4, 0] }, 0.6],
  ]);
  return (
    <>
      <Palco cam={{ x: camX + treme.x, y: 1060 + treme.y, zoom: 1.0 }} parado>
        <Fundo>
          <RuaLonga camX={camX} />
        </Fundo>
        {pisadasB.map(({ f: g, pe }) => {
          const idade = f - g;
          if (idade < 0 || idade > 44) return null;
          const [px] = posPe(poseB(g), pe);
          const s = Math.min(1, idade / 3) * (0.9 + random(`rc${g}`) * 0.3);
          return (
            <g key={g}>
              <g transform={`translate(${px} ${CHAO_Y + 6}) scale(${s})`} opacity={1 - Math.max(0, idade - 26) / 18} stroke="#1d1424" strokeWidth={7} fill="none" strokeLinecap="round">
                <ellipse cx={0} cy={0} rx={170} ry={30} />
                <path d="M -50 -4 L -120 10 L -180 0 M 40 2 L 110 18 L 190 6 M 0 8 L -14 32 M -90 8 L -78 30 M 80 10 L 96 34" />
              </g>
              <ObjetosFisica x={px} y={CHAO_Y - 10} f={f} de={g} n={7} chao={CHAO_Y + 20} velocidade={22} angulo={[-160, -20]} gravidade={1.6} semente={`pd${g}`} desenho={(i) => <path d="M -12 -8 L 10 -12 L 14 6 L -6 12 Z" fill={["#8f8a85", "#6f6a66", "#a7a19b"][i % 3]} stroke="#1d1424" strokeWidth={3} />} />
            </g>
          );
        })}
        {f >= S_B && f < S_B + 30 ? [0, 3, 6, 9, 12].map((d) => <Poeira key={`p${d}`} x={posPe(poseB(S_B + d), "D")[0]} y={CHAO_Y + 4} f={f} de={S_B + d} dur={16} largura={0.55} />) : null}
        <LinhasMovimento f={f} x={p.x} y={CHAO_Y - 200} dir={1} forca={planando ? 0.8 : 0} />
        <Boneco2D id="dB2" d={DIEGO} pose={{ ...p, estica: p.estica * r.corpo.estica }} rosto={{ ...r.rosto, olhos: r.rosto.olhos * piscar(f, "dB2") }} />
      </Palco>
      {semSelo ? null : <Selo texto="CORRIDA BRUTAL v2 + FREADA" de={4} ate={150 - 6} cor="#3d7a3a" />}
      {pisadasB.map(({ f: g }) => (
        <Sequence key={g} from={g} layout="none">
          <Som src="pisada" de={0} volume={0.6} />
          <Som src="racha" de={1} volume={0.35} />
        </Sequence>
      ))}
      <Som src="deslize" de={S_B} volume={0.6} />
    </>
  );
};

// ============================================================================================
// C. CORRIDA NINJA NOVA (referência "Naruto run"): corpo quase deitado (52°), braços esticados para trás tremulando,
// ~8 frames por passada: pisa/encolhe 1,5f → empurra 1,5f → plana esticado 4f → estende 1f. Termina derrapando.
// ============================================================================================
const S_C = 86;
const faseC = (g: number) => faseRitmo(Math.min(g, S_C), "lucasC", RITMO_NINJA, 0.6);
const xRunC = (g: number) => xPorFase("lucasC", faseC, Math.min(g, S_C), "ninja2", ESC);
const VEL_C = (xRunC(S_C) - xRunC(S_C - 4)) / 4;
const xC = (g: number) => -1500 + xRunC(g) + (g > S_C ? VEL_C * 14 * 0.5 * (1 - Math.pow(1 - Math.min(1, (g - S_C) / 14), 2)) : 0);

const poseC = (g: number): Pose => {
  const c = poseCorrida(faseC(g), "ninja2", 1);
  // braços esticados para trás tremulando como no vento (cada braço com fase própria)
  const corre: Pose = {
    ...PERFIL_BASE,
    ...c,
    escala: ESC,
    x: 0,
    y: CHAO_Y,
    bracoD: { ombro: -62 + Math.sin(g * 1.3) * 5 + Math.sin(g * 0.37) * 3, cotovelo: 4 + Math.sin(g * 1.1 + 1) * 6 },
    bracoE: { ombro: -55 + Math.sin(g * 1.2 + 2) * 5, cotovelo: 8 + Math.sin(g * 0.9 + 2.5) * 6 },
    cabeca: -30,
  };
  if (g <= S_C) return { ...corre, x: xC(g) };
  // derrapagem: endireita o corpo com mola, perna da frente firme, braços descem por último
  const t = g - S_C;
  const firma = CURVA.suave(Math.min(1, t / 5));
  const sobe = mola(g, S_C + 3, "pesado");
  const derrapa: Pose = {
    ...corre,
    ...pernasNoChao(entre(30, 54, firma), entre(60, 30, firma), entre(-40, -10, firma), entre(30, 100, firma), 0),
    inclina: entre(52, -6, sobe),
    cabeca: entre(-30, 4, mola(g, S_C + 5, "natural")),
    bracoD: { ombro: entre(-62, 20, mola(g, S_C + 7, "solto")), cotovelo: entre(4, 30, mola(g, S_C + 8, "solto")) },
    bracoE: { ombro: entre(-55, 8, mola(g, S_C + 9, "solto")), cotovelo: entre(8, 24, mola(g, S_C + 10, "solto")) },
  };
  const p = t < 5 ? mixPose(corre, derrapa, CURVA.suave(t / 5)) : derrapa;
  return { ...p, x: xC(g) };
};

export const CenaNinja: React.FC<{ semSelo?: boolean }> = ({ semSelo }) => {
  const f = useCurrentFrame();
  const p = comCabelo((g) => emCadeia(poseC, g, { cabeca: 2, ombroD: 2, cotoveloD: 3, ombroE: 3, cotoveloE: 5 }), f, 0.22);
  const camX = seguir((g) => xC(g), f, 6) + 190;
  const r = trocaRosto(f, [
    [0, { ...ROSTO_BASE, olhos: 0.7, sobrancelha: 22, sorriso: 0.2, boca: 0, olhar: [1, 0] }],
    [S_C + 10, { ...ROSTO_BASE, olhos: 1, sobrancelha: 0, sorriso: 0.8, boca: 0.3, olhar: [1, 0] }, 0.6],
  ]);
  const vel = f <= S_C ? 1 : Math.max(0, 1 - (f - S_C) / 10);
  return (
    <>
      <Palco cam={{ x: camX, y: 1080, zoom: 1.0 }} parado>
        <Fundo>
          <RuaLonga camX={camX} />
        </Fundo>
        <Passos fase={faseC} pose={poseC} f={f} ate={S_C} poeira={0.3} />
        {f >= S_C && f < S_C + 24 ? [0, 3, 6, 9].map((d) => <Poeira key={`d${d}`} x={posPe(poseC(S_C + d), "D")[0]} y={CHAO_Y + 4} f={f} de={S_C + d} dur={16} largura={0.5} />) : null}
        <Rastro x={p.x - 20} y={CHAO_Y - 30} dir={1} forca={0.75 * vel} f={f} cor="#eef6ff" />
        <LinhasMovimento f={f} x={p.x + 60} y={CHAO_Y - 300} dir={1} forca={0.5 * vel} />
        <Boneco2D id="lC2" d={LUCAS} pose={{ ...p, estica: p.estica * r.corpo.estica }} rosto={{ ...r.rosto, olhos: r.rosto.olhos * piscar(f, "lC2") }} />
      </Palco>
      {semSelo ? null : <Selo texto="CORRIDA NINJA (NOVA)" de={4} ate={120 - 6} cor="#3d3463" />}
      <SonsPassos fase={faseC} de={1} ate={S_C} vol={0.22} />
      <Som src="vento" de={2} volume={0.5} />
      <Som src="deslize" de={S_C} volume={0.55} />
    </>
  );
};

// ============================================================================================
// D. LUTA (gramática dos vídeos 5 e 6): poses seguradas + golpes de 2–3 frames, rastro e arco do corte,
// mortal por cima do oponente segurando de cabeça para baixo no ápice, quadro de impacto invertido,
// pausa no impacto, onda de choque, câmera que aproxima e treme, cruzamento final com traço branco.
// ============================================================================================
const CHOQUE = 65;
const PAUSA = 6;
const tw = (g: number) => (g < CHOQUE ? g : g < CHOQUE + PAUSA ? CHOQUE : g - PAUSA);
const LB: Pose = { ...PERFIL_BASE, escala: ESC, y: CHAO_Y };
const LG = (x: number, lado: 1 | -1): Pose => ({ ...LB, x, lado, agacha: 30, inclina: 5, peE: { dx: -72, dy: 0 }, peD: { dx: 82, dy: 0 }, bracoE: { ombro: -22, cotovelo: 26 }, bracoD: { ombro: -12, cotovelo: 30 } });
const DG = (x: number, lado: 1 | -1): Pose => ({ ...LB, x, lado, agacha: 34, inclina: 6, peE: { dx: -78, dy: 0 }, peD: { dx: 74, dy: 0 }, bracoD: { ombro: 16, cotovelo: 112 }, bracoE: { ombro: 28, cotovelo: 98 } });

const alturaMortal = (u: number) => (u < 30 || u >= 52 ? 0 : u < 38 ? 1000 * CURVA.sai((u - 30) / 8) : u < 44 ? 1000 + 16 * Math.sin(((u - 38) / 6) * Math.PI) : 1000 * (1 - CURVA.entra((u - 44) / 8)));
/** mortal do Lucas por cima do Diego (30→52): sobe rápido, segura de cabeça para baixo, desce rápido; vira de lado no ápice */
const mortal = (t: number): Pose => {
  const u = t;
  const x = k(u, [[30, 200], [41, 580, CURVA.sai], [52, 960, CURVA.entra]]);
  const h = alturaMortal(u);
  const giraVis = u < 38 ? -190 * CURVA.sai((u - 30) / 8) : u < 44 ? -190 - 10 * ((u - 38) / 6) : -200 - 160 * CURVA.suave((u - 44) / 8);
  const virou = u >= 41;
  return {
    ...LB,
    x,
    y: CHAO_Y - h * ESC,
    lado: virou ? -1 : 1,
    gira: virou ? -giraVis : giraVis,
    agacha: 40,
    estica: 1.04,
    peE: { dx: 60, dy: -170 },
    peD: { dx: 96, dy: -196 },
    bracoE: { ombro: 64, cotovelo: 64 },
    bracoD: { ombro: 80, cotovelo: 50 },
    inclina: 0,
  };
};

const lucasD = (g: number): Pose => {
  const t = tw(g);
  const respiro = respira(g * 1.4, 0) * 0.012;
  if (t < 30) {
    const agacha: Pose = { ...LG(200, 1), agacha: 140, estica: 0.88, inclina: 16, bracoE: { ombro: -60, cotovelo: 20 }, bracoD: { ombro: -48, cotovelo: 28 } };
    return kPose(t, [[0, { ...LG(200, 1), estica: 1 + respiro }], [26, { ...LG(200, 1), estica: 1 + respiro }], [30, agacha, CURVA.entra]]);
  }
  if (t < 52) return mortal(t);
  const pouso: Pose = { ...LG(960, -1), agacha: 160, estica: 0.84, inclina: 20, bracoD: { ombro: 60, cotovelo: 20 }, maoD: "aberta" };
  const encolhe: Pose = { ...LG(950, -1), agacha: 20, inclina: -6, peE: { dx: -30, dy: 0 }, peD: { dx: 150, dy: -210 }, bracoE: { ombro: -70, cotovelo: 20 }, bracoD: { ombro: 50, cotovelo: 30 } };
  const chute: Pose = { ...LG(930, -1), agacha: 14, inclina: -22, peE: { dx: -30, dy: 0 }, peD: { dx: 330, dy: -320 }, bracoE: { ombro: -74, cotovelo: 20 }, bracoD: { ombro: 56, cotovelo: 30 } };
  if (t <= CHOQUE) return kPose(t, [[52, pouso], [58, { ...LG(960, -1) }, CURVA.exagera], [61, encolhe, CURVA.suave], [CHOQUE, chute, CURVA.sai]]);
  // recuo depois do choque: escorrega para trás, perna desce com mola, tronco assenta
  if (t < 116) {
    const recua = CURVA.sai(Math.min(1, (t - CHOQUE) / 10));
    const desce = mola(t, CHOQUE + 2, "natural");
    const g2 = LG(1040, -1);
    return {
      ...chute,
      x: entre(930, 1040, recua),
      agacha: entre(14, g2.agacha, desce),
      inclina: entre(-22, g2.inclina, mola(t, CHOQUE + 1, "pesado")) + respira(g * 1.8) * 2,
      peD: { dx: entre(330, g2.peD.dx, desce), dy: entre(-320, 0, desce) },
      peE: { dx: entre(-30, g2.peE.dx, desce), dy: 0 },
      bracoE: { ombro: entre(-74, g2.bracoE.ombro, mola(t, CHOQUE + 3, "solto")), cotovelo: entre(20, g2.bracoE.cotovelo, mola(t, CHOQUE + 4, "solto")) },
      bracoD: { ombro: entre(56, g2.bracoD.ombro, mola(t, CHOQUE + 4, "solto")), cotovelo: entre(30, g2.bracoD.cotovelo, mola(t, CHOQUE + 5, "solto")) },
      estica: 1 + respira(g * 1.8) * 0.015,
    };
  }
  // investida final (cruza com o Diego) e fica agachado de costas
  const ant: Pose = { ...LG(1030, -1), agacha: 120, inclina: 26, peD: { dx: 130, dy: 0 }, peE: { dx: -130, dy: 0 }, bracoE: { ombro: -70, cotovelo: 20 }, bracoD: { ombro: -60, cotovelo: 24 } };
  const voa: Pose = { ...LG(640, -1), y: CHAO_Y - 70, agacha: 30, inclina: 30, gira: -10, peE: { dx: -200, dy: -40 }, peD: { dx: 300, dy: -150 }, bracoE: { ombro: -90, cotovelo: 10 }, bracoD: { ombro: -80, cotovelo: 14 } };
  const ajoelha: Pose = { ...LG(300, -1), agacha: 160, inclina: 14, peE: { dx: -180, dy: 0 }, peD: { dx: 160, dy: 0 }, bracoE: { ombro: -60, cotovelo: 10 }, bracoD: { ombro: 30, cotovelo: 20 }, cabeca: 10 };
  const levanta: Pose = { ...LG(300, -1), agacha: 10, inclina: -3, cabeca: -6, bracoE: { ombro: -14, cotovelo: 10 }, bracoD: { ombro: -6, cotovelo: 10 } };
  return kPose(t, [
    [116, LG(1040, -1)],
    [121, ant, CURVA.antecipa],
    [124, voa, CURVA.sai],
    [128, { ...ajoelha, x: 330 }, CURVA.linear],
    [131, ajoelha, CURVA.sai],
    [176, ajoelha],
    [192, levanta, CURVA.exagera],
  ]);
};

const diegoD = (g: number): Pose => {
  const t = tw(g);
  const ergue: Pose = { ...DG(880, -1), agacha: 70, inclina: -12, bracoD: { ombro: 165, cotovelo: 10 }, bracoE: { ombro: 150, cotovelo: 20 } };
  const desce: Pose = { ...DG(520, -1), agacha: 92, inclina: 26, peD: { dx: 170, dy: 0 }, peE: { dx: -140, dy: 0 }, bracoD: { ombro: 38, cotovelo: -10 }, bracoE: { ombro: 28, cotovelo: 10 } };
  const defesa: Pose = { ...DG(520, 1), agacha: 54, inclina: -6, bracoD: { ombro: 80, cotovelo: 88 }, bracoE: { ombro: 62, cotovelo: 82 } };
  if (t <= CHOQUE)
    return kPose(t, [
      [0, { ...DG(880, -1), estica: 1 + respira(g * 1.2, 30) * 0.012 }],
      [22, DG(880, -1)],
      [27, ergue, CURVA.antecipa],
      [31, desce, CURVA.sai],
      [40, desce],
      [50, DG(520, -1), CURVA.suave],
      [54, DG(520, -1)],
      [56, { ...DG(520, -1), largura: 0.7 }, CURVA.entra],
      [57, { ...DG(520, 1), largura: 0.75 }],
      [61, defesa, CURVA.exagera],
      [CHOQUE, { ...defesa, agacha: 64 }],
    ]);
  if (t < 116) {
    const recua = CURVA.sai(Math.min(1, (t - CHOQUE) / 10));
    const g2 = DG(330, 1);
    const tranco = 1 - mola(t, CHOQUE + 3, "pesado");
    return {
      ...defesa,
      x: entre(520, 330, recua),
      agacha: entre(64, g2.agacha, mola(t, CHOQUE + 2, "natural")),
      inclina: entre(g2.inclina, -22, tranco) + respira(g * 1.6, 12) * 2,
      cabeca: -14 * (1 - mola(t, CHOQUE + 1, "solto")),
      bracoD: { ombro: entre(g2.bracoD.ombro, 130, 1 - mola(t, CHOQUE + 4, "solto")), cotovelo: entre(g2.bracoD.cotovelo, 30, 1 - mola(t, CHOQUE + 5, "solto")) },
      bracoE: { ombro: entre(g2.bracoE.ombro, 100, 1 - mola(t, CHOQUE + 5, "solto")), cotovelo: entre(g2.bracoE.cotovelo, 40, 1 - mola(t, CHOQUE + 6, "solto")) },
      estica: 1 + respira(g * 1.6, 12) * 0.015,
    };
  }
  const ant: Pose = { ...DG(330, 1), agacha: 100, inclina: 16, bracoD: { ombro: -46, cotovelo: 30 }, bracoE: { ombro: -36, cotovelo: 30 } };
  const golpe: Pose = { ...DG(760, 1), agacha: 96, inclina: 26, peD: { dx: 180, dy: 0 }, peE: { dx: -160, dy: 0 }, bracoD: { ombro: 98, cotovelo: 0 }, bracoE: { ombro: 90, cotovelo: 6 } };
  const fim: Pose = { ...DG(1040, 1), agacha: 112, inclina: 18, peD: { dx: 180, dy: 0 }, peE: { dx: -180, dy: 0 }, bracoD: { ombro: 124, cotovelo: -20 }, bracoE: { ombro: 20, cotovelo: 20 } };
  const joelho: Pose = { ...DG(1040, 1), agacha: 210, inclina: 22, peD: { dx: 150, dy: 0 }, peE: { dx: -170, dy: 0 }, bracoD: { ombro: 18, cotovelo: 10 }, bracoE: { ombro: 40, cotovelo: 60 }, cabeca: 14 };
  const sorri: Pose = { ...DG(1040, 1), agacha: 30, inclina: 0, bracoD: { ombro: 12, cotovelo: 10 }, bracoE: { ombro: 4, cotovelo: 20 }, cabeca: -4 };
  return kPose(t, [
    [116, DG(330, 1)],
    [119, ant, CURVA.antecipa],
    [123, golpe, CURVA.sai],
    [127, { ...fim, x: 1010 }, CURVA.linear],
    [130, fim, CURVA.sai],
    [158, fim],
    [163, { ...fim, agacha: 90, estica: 1.04 }, CURVA.suave],
    [168, joelho, CURVA.entra],
    [174, joelho],
    [200, sorri, CURVA.exagera],
  ]);
};

const InverteImpacto: React.FC<{ ativo: boolean; children: React.ReactNode }> = ({ ativo, children }) => (
  <AbsoluteFill style={ativo ? { filter: "invert(1) grayscale(1) contrast(3)" } : undefined}>{children}</AbsoluteFill>
);

export const CenaLuta: React.FC<{ semSelo?: boolean }> = ({ semSelo }) => {
  const f = useCurrentFrame();
  const t = tw(f);
  const pausa = f >= CHOQUE && f < CHOQUE + PAUSA;
  const pl = comCabelo((g) => emCadeia(lucasD, g, { cabeca: 2, ombroD: 2, cotoveloD: 3, ombroE: 3, cotoveloE: 4 }), f, 0.2);
  const pd = comCabelo((g) => emCadeia(diegoD, g, { cabeca: 2, ombroD: 1, cotoveloD: 2, ombroE: 2, cotoveloE: 3 }), f, 0.2);
  // câmera: centro entre os dois com atraso; aproxima no choque e na tensão; treme no impacto
  const centro = seguir((g) => (lucasD(g).x + diegoD(g).x) / 2, f, 7);
  const zoom =
    0.8 -
    0.12 * k(t, [[28, 0], [36, 1, CURVA.sai], [48, 1], [54, 0, CURVA.suave]]) +
    0.18 * k(f, [[CHOQUE - 2, 0], [CHOQUE, 1, CURVA.sai], [CHOQUE + PAUSA + 16, 0, CURVA.suave]]) +
    0.1 * k(t, [[80, 0], [116, 1, CURVA.suave], [121, 0, CURVA.sai]]);
  const camY = 1040 - 0.45 * seguir((g) => alturaMortal(tw(g)) * ESC, f, 6);
  const treme =
    f >= CHOQUE && f < CHOQUE + PAUSA + 10 ? tremor(f, 14 * (1 - (f - CHOQUE) / (PAUSA + 10))) : t >= 126 && t < 136 ? tremor(f, 8 * (1 - (t - 126) / 10)) : { x: 0, y: 0 };
  const invertido = f === CHOQUE || f === CHOQUE + 1 || t === 126;
  const contato = { x: 690, y: CHAO_Y - 430 };
  const rl = trocaRosto(t, [
    [0, { ...ROSTO_BASE, olhos: 0.8, sobrancelha: 18, sorriso: 0.1, olhar: [1, 0] }],
    [26, { ...ROSTO_BASE, olhos: 1.1, sobrancelha: -8, sobrancelhaY: 6, boca: 0.4, olhar: [1, -0.5] }, 1],
    [56, { ...ROSTO_BASE, olhos: 0.7, sobrancelha: 26, boca: 0.5, sorriso: -0.2, olhar: [1, 0] }, 0.7],
    [86, { ...ROSTO_BASE, olhos: 0.75, sobrancelha: 20, sorriso: 0.1, olhar: [1, 0] }, 0.4],
    [120, { ...ROSTO_BASE, olhos: 0.6, sobrancelha: 28, boca: 0.6, sorriso: -0.3, olhar: [1, 0] }, 0.8],
    [182, { ...ROSTO_BASE, olhos: 0.9, sobrancelha: 0, sorriso: 0.8, boca: 0.2, olhar: [-1, 0] }, 0.6],
  ]);
  const rd = trocaRosto(t, [
    [0, { ...ROSTO_BASE, olhos: 0.45, canto: 0.7, sorriso: 0.2, sobrancelha: 16, olhar: [1, 0] }],
    [24, { ...ROSTO_BASE, olhos: 0.6, sobrancelha: 24, boca: 0.7, olhar: [1, 0] }, 0.8],
    [45, { ...ROSTO_BASE, olhos: 1.15, sobrancelha: -6, sobrancelhaY: 8, boca: 0.3, olhar: [1, -0.4] }, 1.2],
    [CHOQUE, { ...ROSTO_BASE, olhos: 0.2, sobrancelha: 20, boca: 0.6, sorriso: -0.4, olhar: [1, 0] }, 1.2],
    [86, { ...ROSTO_BASE, olhos: 0.45, canto: 0.6, sorriso: 0.1, sobrancelha: 18, olhar: [1, 0] }, 0.4],
    [118, { ...ROSTO_BASE, olhos: 0.55, sobrancelha: 26, boca: 0.7, olhar: [1, 0] }, 0.8],
    [164, { ...ROSTO_BASE, olhos: 0.1, sobrancelha: 10, boca: 0.4, sorriso: -0.5, olhar: [1, 0] }, 1],
    [194, { ...ROSTO_BASE, olhos: 0.45, canto: 1, sorriso: 0.45, sobrancelha: 16, olhar: [-1, 0] }, 0.6],
  ]);
  const brilho = interpolate(t, [110, 121, 140, 160], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <InverteImpacto ativo={invertido}>
        <Palco cam={{ x: centro + treme.x, y: camY + treme.y, zoom }} parado>
          <Fundo nevoa={0.16}>
            <RuaLonga camX={centro} />
          </Fundo>
          {/* investida do Diego: rastro + arco do corte (passa por baixo do Lucas) */}
          <Rastro x={pd.x} y={CHAO_Y - 40} dir={-1} forca={k(t, [[27, 0], [29, 1], [34, 0]])} f={f} />
          <CorteArco x={560} y={CHAO_Y - 380} r={300} de={-70} ate={-215} f={t} inicio={29} fim={40} dur={8} />
          <Poeira x={200} y={CHAO_Y + 6} f={t} de={30} dur={16} largura={0.8} />
          <Poeira x={960} y={CHAO_Y + 6} f={t} de={52} dur={20} largura={0.9} />
          {/* choque */}
          <OndaChoque x={contato.x} y={contato.y} f={t} de={CHOQUE} dur={16} raio={620} achatado={0.55} />
          <Faiscas x={contato.x} y={contato.y} f={t} de={CHOQUE} dur={14} n={18} alcance={360} />
          <Impacto x={contato.x} y={contato.y} f={t} de={CHOQUE} dur={12} />
          <Poeira x={470} y={CHAO_Y + 6} f={t} de={CHOQUE + 1} dur={20} largura={0.7} />
          <Poeira x={920} y={CHAO_Y + 6} f={t} de={CHOQUE + 1} dur={20} largura={0.7} />
          {/* cruzamento final */}
          <Rastro x={pd.x} y={CHAO_Y - 40} dir={1} forca={k(t, [[122, 0], [124, 1], [131, 0]])} f={f} cor="#e9fff0" />
          <Rastro x={pl.x} y={CHAO_Y - 40} dir={-1} forca={k(t, [[123, 0], [125, 1], [131, 0]])} f={f} cor="#fff6d8" />
          {t >= 125 && t < 131 ? <rect x={-2000} y={CHAO_Y - 470} width={6000} height={18 * (1 - (t - 125) / 6)} fill="#fff" /> : null}
          <Faiscas x={pd.x + 120} y={CHAO_Y - 380} f={t} de={164} dur={12} n={8} alcance={160} />
          <Boneco2D id="dD" d={DIEGO} pose={{ ...pd, estica: pd.estica * rd.corpo.estica }} rosto={{ ...rd.rosto, olhos: rd.rosto.olhos * (pausa ? 1 : piscar(t, "dD")) }} naMao={<Espada brilho={brilho} />} naMaoGira />
          <Boneco2D id="lD" d={LUCAS} pose={{ ...pl, estica: pl.estica * rl.corpo.estica }} rosto={{ ...rl.rosto, olhos: rl.rosto.olhos * (pausa ? 1 : piscar(t, "lD")) }} />
        </Palco>
      </InverteImpacto>
      {f === CHOQUE + 2 || t === 127 ? <AbsoluteFill style={{ background: "#fff", opacity: 0.6 }} /> : null}
      {semSelo ? null : <Selo texto="LUTA (VÍDEOS 5 E 6)" de={4} ate={DURACAO - D0 - 6} cor="#b0402f" />}
      <Som src="lamina" de={28} volume={0.6} />
      <Som src="vento" de={29} volume={0.5} />
      <Som src="pisada" de={52} volume={0.35} />
      <Som src="clang" de={CHOQUE} volume={0.7} />
      <Som src="impacto" de={CHOQUE} volume={0.8} />
      <Som src="deslize" de={CHOQUE + PAUSA + 1} volume={0.5} />
      <Som src="vento" de={121 + PAUSA} volume={0.6} />
      <Som src="corte" de={125 + PAUSA} volume={0.7} />
      <Som src="clang" de={164 + PAUSA} volume={0.3} />
      <Som src="pisada" de={168 + PAUSA} volume={0.3} />
    </>
  );
};

export const TesteMovimento2: React.FC = () => (
  <AbsoluteFill style={{ background: "#efe4d2" }}>
    <Sequence from={A0} durationInFrames={B0 - A0}>
      <CenaPulo />
    </Sequence>
    <Sequence from={B0} durationInFrames={C0 - B0}>
      <CenaBrutal />
    </Sequence>
    <Sequence from={C0} durationInFrames={D0 - C0}>
      <CenaNinja />
    </Sequence>
    <Sequence from={D0} durationInFrames={DURACAO - D0}>
      <CenaLuta />
    </Sequence>
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <Textura />
      </svg>
    </AbsoluteFill>
    <Sequence durationInFrames={D0}>
      <Html5Audio src={staticFile("musica/trilha-leve.wav")} volume={0.09} />
    </Sequence>
    <Sequence from={D0} durationInFrames={DURACAO - D0}>
      {/* trilha de luta: some na tensão (silêncio antes do golpe final) e volta no fim */}
      <Html5Audio
        src={staticFile("musica/trilha-luta.wav")}
        volume={(g) => interpolate(g, [0, 60, 90, 100, 128, 140, 190, 210], [0.1, 0.13, 0.13, 0.025, 0.02, 0.0, 0.0, 0.1], { extrapolateRight: "clamp" })}
      />
    </Sequence>
  </AbsoluteFill>
);
