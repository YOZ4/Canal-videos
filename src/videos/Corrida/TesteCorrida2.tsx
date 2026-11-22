import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Fundo, ObjetosFisica, PoeiraFlutuante, RuaLonga, RuaPerspectiva, yPerspectiva } from "../../estilo2d/Acabamento";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, posPe, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { Poeira } from "../../estilo2d/Efeitos2D";
import { Rastro } from "../../estilo2d/EfeitosLuta";
import { CURVA, balancoCabelo, k, piscar } from "../../estilo2d/anim";
import { contatos, poseCorrida, poseCorridaFrente, xCorrida, type EstiloCorrida } from "../../estilo2d/corrida";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Selo } from "../../estilo2d/UI";
import { Textura } from "../../estilo2d/chibi/RuaTexturizada";
import { Palco, Som } from "../Cacadores/comum";

export const DURACAO = 450;
const ESC = 0.72;
const C_FRENTE = 105;
const C_COSTAS = 200;
const C_34 = 280;
const C_FINAL = 360;

const ROSTO_L: Rosto = { ...ROSTO_BASE, sobrancelha: 10, sorriso: 0.3, olhar: [1, 0] };
const ROSTO_D: Rosto = { ...ROSTO_BASE, olhos: 0.5, canto: 0.6, sorriso: 0.2, sobrancelha: 14, olhar: [1, 0] };

const perfilCorre = (f: number, x0: number, estilo: EstiloCorrida, ciclo: number, intensidade = 1): Pose => ({
  ...PERFIL_BASE,
  ...poseCorrida(f / ciclo, estilo, intensidade),
  escala: ESC,
  x: x0 + xCorrida(f, ciclo, estilo, ESC),
  y: CHAO_Y,
});

const comCabelo = (pose: (g: number) => Pose, f: number): Pose => {
  const p = pose(f);
  return { ...p, cabelo: balancoCabelo(f, (g) => pose(g).x * 0.15, (g) => pose(g).inclina + (pose(g).agacha ?? 0) * 0.08) };
};

const Passos: React.FC<{ f: number; fase: (g: number) => number; pose: (g: number) => Pose; largura?: number }> = ({ f, fase, pose, largura = 0.45 }) => (
  <>
    {contatos(fase, Math.max(1, f - 16), f).map(({ f: g, pe }) => {
      const p = pose(g);
      const [px, py] = posPe(p, pe);
      return <Poeira key={g} x={px} y={py + 4} f={f} de={g} dur={16} largura={largura * (p.escala / ESC)} />;
    })}
  </>
);

// ============ 1. PERFIL — corrida ninja do Diego ============
const CenaNinja: React.FC = () => {
  const f = useCurrentFrame();
  const pose = (g: number) => perfilCorre(g, 300, "ninja", 13);
  const p = comCabelo(pose, f);
  const cam = { x: p.x + 160, y: 1080, zoom: 1.08 };
  return (
    <>
      <Palco cam={cam} parado>
        <Fundo>
          <RuaLonga camX={cam.x} />
        </Fundo>
        <Passos f={f} fase={(g) => g / 13} pose={pose} largura={0.55} />
        <Rastro x={p.x - 40} y={CHAO_Y - 40} dir={1} forca={0.7} f={f} cor="#eef6ff" />
        <ObjetosFisica x={p.x - 200} y={CHAO_Y - 20} f={f % 26} de={0} n={6} chao={CHAO_Y + 30} velocidade={14} angulo={[-170, -120]} gravidade={0.5} semente={`n${Math.floor(f / 26)}`} desenho={(i) => <ellipse rx={13} ry={6} fill={["#a86a3a", "#c48a4a", "#8a5a30"][i % 3]} />} />
        <Boneco2D id="n1" d={DIEGO} pose={p} rosto={{ ...ROSTO_D, olhos: ROSTO_D.olhos * piscar(f, "n1") }} />
      </Palco>
      <Selo texto="NINJA — PERFIL" de={4} ate={C_FRENTE - 4} cor="#3d3463" />
      <Som src="whoosh" de={2} volume={0.4} />
    </>
  );
};

// ============ 2. FRENTE — Lucas vem correndo na direção da câmera ============
const CenaFrente: React.FC = () => {
  const f = useCurrentFrame();
  const dur = C_COSTAS - C_FRENTE;
  const s = interpolate(f, [0, dur], [0.32, 1.0], { easing: CURVA.entra });
  const c = poseCorridaFrente(f / 17, "normal");
  const escala = ESC * s;
  const pose: Pose = { ...POSE_BASE, ...c, escala, x: 540 + Math.sin(f * 0.05) * 20 * s, y: yPerspectiva(s) - c.sobe * escala };
  const rosto: Rosto = { ...ROSTO_BASE, sobrancelha: 10, sorriso: f > dur - 30 ? 0.8 : 0.4, boca: f > dur - 30 ? 0.4 : 0, olhar: [0, 0] };
  return (
    <>
      <Palco cam={{ x: 540, y: 960, zoom: 1 }} parado>
        <Fundo>
          <RuaPerspectiva />
        </Fundo>
        <Passos f={f} fase={(g) => g / 17} pose={(g) => {
          const sg = interpolate(g, [0, dur], [0.32, 1.0], { easing: CURVA.entra });
          const cg = poseCorridaFrente(g / 17, "normal");
          const eg = ESC * sg;
          return { ...POSE_BASE, ...cg, escala: eg, x: 540, y: yPerspectiva(sg) };
        }} largura={0.5} />
        <Boneco2D id="f1" d={LUCAS} pose={pose} rosto={{ ...rosto, olhos: rosto.olhos * piscar(f, "f1") }} />
      </Palco>
      <Selo texto="DE FRENTE" de={4} ate={dur - 12} cor="#2f6fd6" />
      <Som src="whoosh" de={dur - 10} volume={0.6} />
    </>
  );
};

// ============ 3. COSTAS — Diego corre pra longe (ninja) ============
const CenaCostas: React.FC = () => {
  const f = useCurrentFrame();
  const dur = C_34 - C_COSTAS;
  const s = interpolate(f, [0, dur], [0.95, 0.3], { easing: CURVA.sai });
  const c = poseCorridaFrente(f / 13, "ninja", 1, true);
  const escala = ESC * s;
  const pose: Pose = { ...POSE_BASE, ...c, vista: "costas", escala, x: 560, y: yPerspectiva(s) - c.sobe * escala };
  return (
    <>
      <Palco cam={{ x: 540, y: 960, zoom: 1 }} parado>
        <Fundo>
          <RuaPerspectiva />
        </Fundo>
        <Passos f={f} fase={(g) => g / 13} pose={(g) => {
          const sg = interpolate(g, [0, dur], [0.95, 0.3], { easing: CURVA.sai });
          const cg = poseCorridaFrente(g / 13, "ninja", 1, true);
          return { ...POSE_BASE, ...cg, vista: "costas", escala: ESC * sg, x: 560, y: yPerspectiva(sg) };
        }} largura={0.5} />
        <Boneco2D id="c1" d={DIEGO} pose={pose} rosto={ROSTO_D} />
      </Palco>
      <Selo texto="DE COSTAS" de={4} ate={dur - 4} cor="#2e9b6a" />
    </>
  );
};

// ============ 4. 3/4 — os dois na diagonal ============
const Cena34: React.FC = () => {
  const f = useCurrentFrame();
  const dur = C_FINAL - C_34;
  const um = (atraso: number, d: typeof LUCAS, estilo: EstiloCorrida, ciclo: number, lado: number, id: string, rosto: Rosto) => {
    const t = Math.max(0, f - atraso);
    const s = interpolate(t, [0, dur], [0.3, 0.88], { easing: CURVA.entra });
    const c = poseCorridaFrente(t / ciclo, estilo);
    const escala = ESC * s;
    const x = 540 + (-430 + 900 * (s - 0.3) / 0.58) * 0.5 + lado * 330 * s;
    const pose: Pose = { ...POSE_BASE, ...c, vira: 0.55, escala, x, y: yPerspectiva(s) - c.sobe * escala, inclina: c.inclina + 4 };
    return { s, el: <Boneco2D key={id} id={id} d={d} pose={pose} rosto={{ ...rosto, olhar: [0.6, 0], olhos: rosto.olhos * piscar(f, id) }} /> };
  };
  const l = um(0, LUCAS, "rapida", 15, -1, "t1", { ...ROSTO_L, sobrancelha: 16, boca: 0.3 });
  const d = um(14, DIEGO, "rapida", 14, 1, "t2", { ...ROSTO_D, canto: 1 });
  const ordem = [l, d].sort((a, b) => a.s - b.s);
  return (
    <>
      <Palco cam={{ x: 540, y: 960, zoom: 1 }} parado>
        <Fundo>
          <RuaPerspectiva />
        </Fundo>
        {ordem.map((o) => o.el)}
      </Palco>
      <Selo texto="3/4 — CORRIDA LADO A LADO" de={4} ate={dur - 4} cor="#ff9b2f" />
      <Som src="whoosh" de={dur - 14} volume={0.5} />
    </>
  );
};

// ============ 5. PERFIL — disputa e freada ============
const CenaFinal: React.FC = () => {
  const f = useCurrentFrame();
  const FREIA = 62;
  const lucas = (g: number) => perfilCorre(Math.min(g, FREIA), 300, "rapida", 15);
  const diego = (g: number) => ({ ...perfilCorre(Math.min(g, FREIA), -380, "ninja", 13), y: CHAO_Y - 110, escala: ESC * 0.9 });
  const freada = (base: Pose, g: number, id: number): Pose => {
    if (g <= FREIA) return base;
    const t = g - FREIA;
    const v = id === 0 ? 46 : 26;
    const desl = v * (1 - Math.exp(-t / 7)) * 7;
    const a = k(t, [[0, 0], [6, 1, CURVA.sai], [22, 1], [30, 0.2, CURVA.exagera]]);
    return {
      ...base,
      x: base.x + desl,
      inclina: base.inclina * (1 - a) - 16 * a,
      agacha: 60 * a,
      peD: { dx: 190 * a, dy: 0, rot: -20 * a },
      peE: { dx: -40 * a, dy: 0, rot: 0 },
      bracoD: { ombro: 60 * a, cotovelo: 20 },
      bracoE: { ombro: -40 * a, cotovelo: 30 },
      estica: 1 - 0.06 * a,
    };
  };
  const lp = freada(comCabelo(lucas, f), f, 0);
  const dp = freada(comCabelo(diego, f), f, 1);
  const cam = { x: Math.max(lp.x, dp.x) - 40, y: 1060, zoom: 0.92 };
  return (
    <>
      <Palco cam={cam} parado>
        <Fundo>
          <RuaLonga camX={cam.x} />
        </Fundo>
        <Passos f={Math.min(f, FREIA)} fase={(g) => g / 15} pose={lucas} />
        <Passos f={Math.min(f, FREIA)} fase={(g) => g / 13} pose={diego} />
        {f < FREIA ? <Rastro x={dp.x} y={CHAO_Y} dir={1} forca={0.8} f={f} /> : null}
        {f > FREIA ? (
          <>
            <Poeira x={lp.x + 100} y={CHAO_Y} f={f} de={FREIA + 2} dur={24} largura={1.3} />
            <Poeira x={dp.x + 100} y={CHAO_Y - 110} f={f} de={FREIA} dur={24} largura={1.3} />
          </>
        ) : null}
        <Boneco2D id="e2" d={DIEGO} pose={dp} rosto={{ ...ROSTO_D, canto: f > FREIA + 20 ? 1 : 0.6, olhos: ROSTO_D.olhos * piscar(f, "e2") }} />
        <Boneco2D id="e1" d={LUCAS} pose={lp} rosto={{ ...ROSTO_L, sobrancelha: 16, boca: f > FREIA + 20 ? 0.5 : 0.2, olhos: (f > FREIA + 20 ? 0.6 : 1) * piscar(f, "e1") }} />
      </Palco>
      <Selo texto={f < FREIA ? "PERFIL — DISPUTA" : "FREADA"} de={4} ate={DURACAO - C_FINAL} cor="#e8343f" />
      <Som src="whoosh" de={FREIA} volume={0.5} />
      <Som src="corte" de={FREIA} volume={0.4} />
    </>
  );
};

export const TesteCorrida2: React.FC = () => {
  const cenas: [React.FC, number, number][] = [
    [CenaNinja, 0, C_FRENTE],
    [CenaFrente, C_FRENTE, C_COSTAS],
    [CenaCostas, C_COSTAS, C_34],
    [Cena34, C_34, C_FINAL],
    [CenaFinal, C_FINAL, DURACAO],
  ];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cenas.map(([C, de, ate], i) => (
        <Sequence key={i} from={de} durationInFrames={ate - de}>
          <C />
        </Sequence>
      ))}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1080} height={1920}>
          <PoeiraFlutuante />
          <Textura />
        </svg>
      </AbsoluteFill>
      <Html5Audio src={staticFile("musica/trilha-luta.wav")} volume={(fr) => interpolate(fr, [0, 10, DURACAO - 15, DURACAO], [0, 0.25, 0.25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
