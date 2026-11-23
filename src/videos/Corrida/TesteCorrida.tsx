import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Cachorro, Fundo, ObjetosFisica, PoeiraFlutuante, RuaLonga } from "../../estilo2d/Acabamento";
import { Boneco2D, PERFIL_BASE, ROSTO_BASE, posCabeca, posPe, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { Gota, Poeira, Simbolo } from "../../estilo2d/Efeitos2D";
import { Rastro } from "../../estilo2d/EfeitosLuta";
import { CURVA, k, piscar, tremor } from "../../estilo2d/anim";
import { contatos, pernasFK, poseCorrida, xCorrida, type EstiloCorrida } from "../../estilo2d/corrida";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Selo } from "../../estilo2d/UI";
import { Textura } from "../../estilo2d/chibi/RuaTexturizada";
import { Palco, Som } from "../Cacadores/comum";

export const DURACAO = 450;
const ESC = 0.72;
const C_RAPIDA = 120;
const C_LENTA = 210;
const C_PULO = 270;
const C_NINJA = 360;

const ROSTO_L: Rosto = { ...ROSTO_BASE, sobrancelha: 8, sorriso: 0.3, olhar: [1, 0] };
const ROSTO_D: Rosto = { ...ROSTO_BASE, olhos: 0.6, canto: 0.8, sorriso: 0.35, sobrancelha: 6, olhar: [1, 0] };

/** corredor genérico: estilo + ciclo + início; devolve pose de mundo */
const corredor = (f: number, x0: number, estilo: EstiloCorrida, ciclo: number, intensidade = 1, velocidade = 1): Pose => {
  const g = f * velocidade;
  const c = poseCorrida(g / ciclo, estilo, intensidade);
  return { ...PERFIL_BASE, ...c, escala: ESC, x: x0 + xCorrida(g, ciclo, estilo, ESC) * intensidade, y: CHAO_Y };
};

/** poeira em cada passada */
const PoeiraPassos: React.FC<{ f: number; fase: (g: number) => number; pose: (g: number) => Pose; de?: number }> = ({ f, fase, pose, de = 0 }) => (
  <>
    {contatos(fase, Math.max(de, f - 16), f).map(({ f: g, pe }) => {
      const [px] = posPe(pose(g), pe);
      return <Poeira key={g} x={px} y={CHAO_Y + 4} f={f} de={g} dur={16} largura={0.45} />;
    })}
  </>
);

const Lixeira: React.FC<{ x: number; tombada?: number }> = ({ x, tombada = 0 }) => (
  <g transform={`translate(${x} ${CHAO_Y}) rotate(${tombada * 80} 60 0)`}>
    <path d="M -70 0 L -82 -230 L 82 -230 L 70 0 Z" fill="#5f7d6a" stroke="#1d1424" strokeWidth={7} strokeLinejoin="round" />
    <rect x={-92} y={-260} width={184} height={34} rx={10} fill="#4d6857" stroke="#1d1424" strokeWidth={7} />
    {[-40, 0, 40].map((dx) => (
      <line key={dx} x1={dx} x2={dx * 1.1} y1={-30} y2={-205} stroke="#4d6857" strokeWidth={8} />
    ))}
  </g>
);

// ======================= A — Lucas arranca (corrida normal) =======================
const CenaNormal: React.FC = () => {
  const f = useCurrentFrame();
  const INICIO = 16;
  const ramp = (g: number) => k(g, [[INICIO, 0], [INICIO + 18, 1, CURVA.suave]]);
  const fase = (g: number) => Math.max(0, g - INICIO) / 20;
  const pose = (g: number): Pose => {
    if (g < INICIO) {
      // antecipação: agacha e inclina antes de sair
      const a = k(g, [[0, 0], [INICIO, 1, CURVA.antecipa]]);
      return { ...PERFIL_BASE, escala: ESC, x: 500, y: CHAO_Y, agacha: 60 * a, inclina: 22 * a, cabeca: -10 * a, bracoE: { ombro: 30 * a, cotovelo: 70 * a }, bracoD: { ombro: -40 * a, cotovelo: 80 * a }, maoE: "punho", maoD: "punho", peE: { dx: -60 * a, dy: 0 }, peD: { dx: 60 * a, dy: 0 } };
    }
    return corredor(g - INICIO, 500, "normal", 20, ramp(g));
  };
  const p = pose(f);
  const cam = { x: p.x + 140, y: 1040, zoom: 1.05 };
  return (
    <>
      <Palco cam={cam} parado>
        <Fundo>
          <RuaLonga camX={cam.x} />
        </Fundo>
        <PoeiraPassos f={f} fase={fase} pose={pose} de={INICIO} />
        <Boneco2D id="na" d={LUCAS} pose={p} rosto={{ ...ROSTO_L, olhos: ROSTO_L.olhos * piscar(f, "na") }} />
      </Palco>
      <Selo texto="CORRIDA NORMAL" de={6} ate={C_RAPIDA - 4} cor="#2f6fd6" />
      <Som src="whoosh" de={INICIO} volume={0.35} />
    </>
  );
};

// ======================= B — Diego passa voando (corrida rápida) =======================
const CenaRapida: React.FC = () => {
  const f = useCurrentFrame();
  const lucas = (g: number) => corredor(g, 600, g < 40 ? "normal" : "rapida", g < 40 ? 20 : 15);
  // Lucas troca de estilo em g=40: reinicia o integrador a partir da posição atual
  const xTroca = 600 + xCorrida(40, 20, "normal", ESC);
  const lucasPose = (g: number): Pose => (g < 40 ? lucas(g) : { ...corredor(g - 40, xTroca, "rapida", 15) });
  const diegoPose = (g: number): Pose => ({ ...corredor(g, 100, "rapida", 13), y: CHAO_Y + 90, escala: ESC * 1.05 });
  const lp = lucasPose(f);
  const dp = diegoPose(f);
  const cam = { x: lp.x + 260, y: 1040, zoom: 0.95 };
  const passou = dp.x > lp.x + 100;
  const rostoL: Rosto = passou && f < 60 ? { ...ROSTO_L, olhos: 1.25, sobrancelhaY: 14, boca: 0.4, sorriso: 0 } : { ...ROSTO_L, sobrancelha: f > 40 ? 18 : 8, boca: f > 40 ? 0.2 : 0 };
  return (
    <>
      <Palco cam={cam} parado>
        <Fundo>
          <RuaLonga camX={cam.x} />
        </Fundo>
        <PoeiraPassos f={f} fase={(g) => g / 13} pose={diegoPose} />
        <PoeiraPassos f={f} fase={(g) => (g < 40 ? g / 20 : 2 + (g - 40) / 15)} pose={lucasPose} />
        <Rastro x={dp.x} y={CHAO_Y} dir={1} forca={0.9} f={f} cor="#e6fff0" />
        {f > 40 ? <Rastro x={lp.x} y={CHAO_Y} dir={1} forca={0.6} f={f} /> : null}
        <Boneco2D id="rl" d={LUCAS} pose={lp} rosto={{ ...rostoL, olhos: rostoL.olhos * piscar(f, "rl") }} />
        <Boneco2D id="rd" d={DIEGO} pose={dp} rosto={{ ...ROSTO_D, canto: 1, olhos: ROSTO_D.olhos * piscar(f, "rd") }} />
        {passou && f < 60 ? <Simbolo texto="!" x={posCabeca(lp)[0] + 60} y={posCabeca(lp)[1] - 230} f={f} de={22} /> : null}
      </Palco>
      <Selo texto="CORRIDA RÁPIDA" de={4} ate={C_LENTA - C_RAPIDA - 4} cor="#2e9b6a" />
      <Som src="whoosh" de={14} volume={0.5} />
      <Som src="whoosh" de={40} volume={0.4} />
    </>
  );
};

// ======================= C — câmera lenta nas pernas =======================
const CenaLenta: React.FC = () => {
  const f = useCurrentFrame();
  const VEL = 0.28;
  const pose = (g: number) => corredor(g, 600, "rapida", 15, 1, VEL);
  const p = pose(f);
  const cam = { x: p.x + 60, y: CHAO_Y - 380, zoom: 1.55 };
  return (
    <>
      <Palco cam={cam} parado>
        <Fundo>
          <RuaLonga camX={cam.x} />
        </Fundo>
        <PoeiraPassos f={f} fase={(g) => (g * VEL) / 15} pose={pose} />
        <Boneco2D id="sl" d={LUCAS} pose={p} rosto={ROSTO_L} />
      </Palco>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,16,30,0.35), transparent 18%, transparent 82%, rgba(20,16,30,0.35))" }} />
      <Selo texto="CÂMERA LENTA: O CICLO" de={2} ate={C_PULO - C_LENTA - 4} cor="#7d5bd6" />
    </>
  );
};

// ======================= D — pulo sobre a lixeira =======================
const SALTO = 34; // frame local do impulso
const VOO = 22; // duração no ar
const ALT = 300;
const CenaPulo: React.FC = () => {
  const f = useCurrentFrame();
  const ciclo = 15;
  const corrida = (g: number) => corredor(g, 200, "rapida", ciclo);
  // velocidade média para o voo
  const v = (xCorrida(SALTO, ciclo, "rapida", ESC) - xCorrida(SALTO - ciclo, ciclo, "rapida", ESC)) / ciclo;
  const xSalto = corrida(SALTO).x;
  const xPouso = xSalto + v * VOO;
  const lixeiraX = xSalto + (v * VOO) / 2;
  const pose = (g: number): Pose => {
    if (g < SALTO - 4) return corrida(g);
    if (g < SALTO) {
      // antecipação: agacha no último passo
      const a = (g - (SALTO - 4)) / 4;
      const base = corrida(SALTO - 4);
      return { ...base, x: base.x + v * (g - (SALTO - 4)), agacha: base.agacha + 70 * a, inclina: base.inclina + 6 * a, estica: 1 - 0.08 * a, bracoD: { ombro: -50, cotovelo: 60 }, bracoE: { ombro: -40, cotovelo: 60 } };
    }
    if (g < SALTO + VOO) {
      const t = (g - SALTO) / VOO;
      const y = 4 * ALT * t * (1 - t);
      const encolhe = Math.sin(t * Math.PI);
      const pernas = pernasFK(70 + 25 * encolhe, 90 + 30 * encolhe, -40 + 40 * encolhe, 30 + 70 * encolhe, 0);
      return {
        ...PERFIL_BASE,
        ...pernas,
        escala: ESC,
        x: xSalto + v * (g - SALTO),
        y: CHAO_Y - y,
        inclina: 14 - 10 * t,
        estica: t < 0.2 ? 1.1 : 1,
        cabeca: -8,
        bracoD: { ombro: 120 - 40 * t, cotovelo: 20 },
        bracoE: { ombro: 90 + 20 * encolhe, cotovelo: 30 },
        maoD: "aberta",
        maoE: "aberta",
      };
    }
    const h = g - (SALTO + VOO);
    if (h < 10) {
      // pouso: amortece (squash) e volta
      const sq = k(h, [[0, 1], [3, 1, CURVA.sai], [10, 0, CURVA.exagera]]);
      const pernas = pernasFK(30 - 10 * sq, 20 + 60 * sq, -20, 40 + 40 * sq, 0);
      return { ...PERFIL_BASE, ...pernas, escala: ESC, x: xPouso + v * h * 0.6, y: CHAO_Y, agacha: 40 + 110 * sq, estica: 1 - 0.14 * sq, inclina: 18 + 10 * sq, bracoD: { ombro: 40, cotovelo: 40 }, bracoE: { ombro: -30, cotovelo: 50 } };
    }
    const r = corredor(h - 10, 0, "rapida", ciclo, Math.min(1, (h - 10) / 8 + 0.4));
    return { ...r, x: xPouso + v * 6 + r.x };
  };
  const p = pose(f);
  const cam = { x: p.x + 120, y: 1000 - (CHAO_Y - p.y) * 0.75, zoom: 1.0 };
  const pouso = SALTO + VOO;
  const sh = f >= pouso && f < pouso + 8 ? tremor(f, 8) : { x: 0, y: 0 };
  const faseCorr = (g: number) => (g < SALTO - 4 ? g / ciclo : g < pouso + 10 ? (SALTO - 4) / ciclo : 10 + (g - pouso - 10) / ciclo);
  return (
    <>
      <Palco cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} parado>
        <Fundo>
          <RuaLonga camX={cam.x} />
        </Fundo>
        <Lixeira x={lixeiraX} />
        <PoeiraPassos f={f} fase={faseCorr} pose={pose} />
        <Poeira x={xSalto} y={CHAO_Y} f={f} de={SALTO} dur={18} largura={0.7} />
        <Poeira x={xPouso} y={CHAO_Y} f={f} de={pouso} dur={20} largura={1} />
        {f > SALTO && f < pouso ? <Rastro x={p.x} y={p.y} dir={1} forca={0.7} f={f} /> : null}
        <Boneco2D id="pl" d={LUCAS} pose={p} rosto={{ ...ROSTO_L, olhos: f > SALTO - 4 && f < pouso ? 0.75 : 1, sobrancelha: 16, boca: f > SALTO && f < pouso ? 0.5 : 0, sorriso: f > pouso + 6 ? 0.9 : 0.3 }} />
      </Palco>
      <Selo texto="PULO: ANTECIPA → VOA → AMORTECE" de={2} ate={C_NINJA - C_PULO - 4} cor="#ff9b2f" />
      <Som src="whoosh" de={SALTO} volume={0.5} />
      <Som src="impacto" de={pouso} volume={0.35} />
    </>
  );
};

// ======================= E — Diego corrida ninja → pânico com o cachorro =======================
const CenaNinja: React.FC = () => {
  const f = useCurrentFrame();
  const ACORDA = 30;
  const PANICO = 38;
  const ninja = (g: number) => corredor(g, 300, "ninja", 13);
  const xTroca = ninja(PANICO).x;
  const diego = (g: number): Pose => (g < PANICO ? ninja(g) : { ...corredor(g - PANICO, xTroca, "panico", 9) });
  const dp = diego(f);
  // o cachorro dorme exatamente onde o Diego passa ~6 frames antes de acordar
  const cX0 = ninja(ACORDA - 6).x + 60;
  const perseg = k(f, [[PANICO, 0], [PANICO + 12, 1, CURVA.suave]]);
  const cachorroX = f < PANICO ? cX0 : cX0 + (dp.x - 560 - cX0) * perseg + (1 - perseg) * (f - PANICO) * 30;
  const camAlvo = f < ACORDA - 6 ? dp.x + 120 : (dp.x + cachorroX) / 2 + 60;
  const cam = { x: camAlvo, y: 1060, zoom: 0.8 };
  const corre = f > PANICO;
  const rosto: Rosto = f < ACORDA ? { ...ROSTO_D, canto: 1, olhos: 0.5 } : { ...ROSTO_D, olhos: 1.3, canto: 0, sobrancelha: -16, sobrancelhaY: 18, boca: 0.9, sorriso: -0.2, olhar: [-1, 0] };
  const pataFase = f * 0.6;
  return (
    <>
      <Palco cam={cam} parado>
        <Fundo>
          <RuaLonga camX={cam.x} />
        </Fundo>
        <PoeiraPassos f={f} fase={(g) => (g < PANICO ? g / 13 : 4 + (g - PANICO) / 9)} pose={diego} />
        {/* cachorro: dorme, acorda com o Diego passando, persegue */}
        {f < ACORDA ? (
          <Cachorro x={cX0} y={CHAO_Y + 30} escala={0.9} />
        ) : (
          <g transform={`translate(${cachorroX} ${CHAO_Y + 30 - Math.abs(Math.sin(pataFase)) * 30}) scale(0.9)`}>
            <ellipse cx={0} cy={-38} rx={120} ry={44} fill="#c98a52" />
            <path d={`M -120 -50 Q -170 ${-80 + Math.sin(f) * 20} -160 -110`} stroke="#c98a52" strokeWidth={20} fill="none" strokeLinecap="round" />
            {[-70, -30, 40, 80].map((lx, i) => (
              <path key={i} d={`M ${lx} -10 L ${lx + Math.sin(pataFase + i * 1.6) * 34} 30`} stroke="#b07440" strokeWidth={22} strokeLinecap="round" />
            ))}
            <g transform="translate(110 -60)">
              <ellipse cx={0} cy={0} rx={56} ry={44} fill="#d39a62" />
              <ellipse cx={50} cy={12} rx={28} ry={20} fill="#e2b07c" />
              <ellipse cx={72} cy={6} rx={10} ry={8} fill="#2a1d22" />
              <path d="M 40 26 L 70 30 L 44 36 Z" fill="#ffffff" />
              <circle cx={14} cy={-10} r={9} fill="#2a1d22" />
              <path d="M -30 -30 L -46 -70 L -10 -40 Z" fill="#a86a3a" />
            </g>
            {f < PANICO + 30 ? (
              <text x={170} y={-170} fontFamily="Fredoka" fontWeight={700} fontSize={70} fill="#fff" stroke="#1d1424" strokeWidth={10} paintOrder="stroke">
                AU AU!
              </text>
            ) : null}
          </g>
        )}
        {corre ? <Rastro x={dp.x} y={CHAO_Y} dir={1} forca={0.8} f={f} /> : null}
        <Boneco2D id="nd" d={DIEGO} pose={dp} rosto={{ ...rosto, olhos: rosto.olhos * piscar(f, "nd") }} />
        {f >= ACORDA && f < PANICO + 10 ? <Simbolo texto="!" x={posCabeca(dp)[0] + 40} y={posCabeca(dp)[1] - 220} f={f} de={ACORDA + 2} /> : null}
        {corre ? <Gota x={posCabeca(dp)[0] - 120} y={posCabeca(dp)[1] - 60} f={f} de={PANICO + 4} escala={0.8} /> : null}
        <ObjetosFisica x={cX0} y={CHAO_Y - 20} f={f} de={ACORDA} n={10} chao={CHAO_Y + 30} velocidade={18} angulo={[-160, -100]} gravidade={0.7} semente="fol" desenho={(i) => <ellipse rx={13} ry={6} fill={["#a86a3a", "#c48a4a", "#8a5a30"][i % 3]} />} />
      </Palco>
      <Selo texto={f < PANICO ? "CORRIDA NINJA" : "CORRIDA EM PÂNICO"} de={2} ate={DURACAO - C_NINJA} cor={f < PANICO ? "#3d3463" : "#e8343f"} />
      <Som src="pop" de={ACORDA} volume={0.4} />
      <Som src="whoosh" de={PANICO} volume={0.5} />
    </>
  );
};

export const TesteCorrida: React.FC = () => {
  const f = useCurrentFrame();
  const borra = (f >= C_RAPIDA + 10 && f < C_RAPIDA + 20) || (f >= C_PULO + SALTO && f < C_PULO + SALTO + VOO);
  const cenas: [React.FC, number, number][] = [
    [CenaNormal, 0, C_RAPIDA],
    [CenaRapida, C_RAPIDA, C_LENTA],
    [CenaLenta, C_LENTA, C_PULO],
    [CenaPulo, C_PULO, C_NINJA],
    [CenaNinja, C_NINJA, DURACAO],
  ];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cenas.map(([C, de, ate], i) => (
        <Sequence key={i} from={de} durationInFrames={ate - de}>
          {borra && f >= de && f < ate ? (
            <CameraMotionBlur samples={6} shutterAngle={180}>
              <C />
            </CameraMotionBlur>
          ) : (
            <C />
          )}
        </Sequence>
      ))}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1080} height={1920}>
          <PoeiraFlutuante />
          <Textura />
        </svg>
      </AbsoluteFill>
      <Html5Audio
        src={staticFile("musica/trilha-leve.wav")}
        volume={(fr) => interpolate(fr, [0, 10, DURACAO - 15, DURACAO], [0, 0.3, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};

