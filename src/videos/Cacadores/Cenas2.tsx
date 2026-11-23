import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { AURA_DIEGO, AURA_LUCAS, AuraForte, CorrentesAura, PunhoBrilhando } from "../../estilo2d/Aura";
import { Boneco2D, ROSTO_BASE, posCabeca } from "../../estilo2d/Boneco2D";
import { Arena, CHAO_Y, Cozinha } from "../../estilo2d/Cenario2D";
import { Brilhos, Gota, Impacto, LinhasFoco, Poeira, Simbolo, Veia } from "../../estilo2d/Efeitos2D";
import { CorteArco, Faiscas, Fumaca, OndaChoque, Onomatopeia, Rastro } from "../../estilo2d/EfeitosLuta";
import { Copo, Coracao, Espada, Pulmoes } from "../../estilo2d/Objetos";
import { Placar, Rotulo2, Selo } from "../../estilo2d/UI";
import { CURVA, k, kPose, respira, tremor } from "../../estilo2d/anim";
import { AVO, CANDIDATOS, DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Fundo, ObjetosFisica, RuaLonga } from "../../estilo2d/Acabamento";
import { ESC, Grade, Lembranca, Palco, ROSTO_AVO, ROSTO_DIEGO, Som, frente, perfil, vivo } from "./comum";
import { T, TF } from "./tempo";

type P = { t0: number };
const ALT = 1220 * ESC; // altura do personagem no mundo

// S19 — Segunda fase: Nen (mesas com copos)
export const S19: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Palco cam={{ x: 600, y: 1000, zoom: k(f, [[0, 0.85], [70, 0.95]]) }}>
        <Fundo saturacao={0.6}><Cozinha /></Fundo>
        <Boneco2D id="s19l" d={LUCAS} pose={frente(330, { vira: 0.3 })} rosto={vivo({ ...ROSTO_BASE, olhar: [0.6, 0.6] }, f, "s19l")} />
        <Boneco2D id="s19d" d={DIEGO} pose={frente(880, { vira: -0.3, cruzado: 1 })} rosto={vivo(ROSTO_DIEGO, f, "s19d")} />
        {[330, 880].map((x) => (
          <g key={x}>
            <rect x={x - 190} y={CHAO_Y - 330} width={380} height={40} rx={10} fill="#c98f5a" stroke="#1d1424" strokeWidth={7} />
            <rect x={x - 170} y={CHAO_Y - 290} width={24} height={290} fill="#8a6440" />
            <rect x={x + 146} y={CHAO_Y - 290} width={24} height={290} fill="#8a6440" />
            <g transform={`translate(${x} ${CHAO_Y - 330})`}>
              <Copo escala={0.55} f={f} />
            </g>
          </g>
        ))}
      </Palco>
      <Selo texto="FASE 2: DESCOBRIR O NEN" de={2} ate={70} cor="#7d5bd6" />
    </>
  );
};

// S20..S24 — o copo em close
const CopoClose: React.FC<{ f: number; domo?: number; transborda?: number; nivel?: number; maos?: number; aura?: number; dono?: "L" | "D" }> = ({
  f,
  domo = 0,
  transborda = 0,
  nivel = 0.92,
  maos = 0,
  aura = 0,
  dono = "L",
}) => {
  const pele = dono === "L" ? LUCAS.pele : DIEGO.pele;
  const cores = dono === "L" ? AURA_LUCAS : AURA_DIEGO;
  const sh = aura > 0.6 ? tremor(f, 4 * aura) : { x: 0, y: 0 };
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #3a3156, #17121f)" }}>
      <svg width={1080} height={1920}>
        <g transform={`translate(${sh.x} ${sh.y})`}>
          {/* aura subindo das mãos, atrás do copo */}
          <AuraForte x={540} chao={1300} altura={1050} f={f} forca={aura} caos={0.15} cor={cores.cor} clara={cores.clara} id={`copo${dono}`} />
          <rect x={0} y={1180} width={1080} height={740} fill="#a8774a" />
          <rect x={0} y={1180} width={1080} height={24} fill="#c98f5a" />
          <g transform="translate(540 1190)">
            <Copo escala={1.7} f={f} domo={domo} transborda={transborda} nivel={nivel} />
          </g>
          {maos > 0
            ? [-1, 1].map((s) => (
                <g key={s} transform={`translate(${540 + s * (560 - 300 * maos)} 840) rotate(${s * 90})`}>
                  <path d="M 0 -300 L 0 0" stroke="#1d1424" strokeWidth={110} strokeLinecap="round" />
                  <path d="M 0 -300 L 0 0" stroke={pele} strokeWidth={96} strokeLinecap="round" />
                  {[-30, -10, 10, 30].map((dx) => (
                    <path key={dx} d={`M ${dx} 20 L ${dx * 1.3} 80`} stroke="#1d1424" strokeWidth={34} strokeLinecap="round" />
                  ))}
                  {[-30, -10, 10, 30].map((dx) => (
                    <path key={`f${dx}`} d={`M ${dx} 20 L ${dx * 1.3} 80`} stroke={pele} strokeWidth={22} strokeLinecap="round" />
                  ))}
                  <circle r={60} fill={pele} stroke="#1d1424" strokeWidth={7} />
                </g>
              ))
            : null}
          {aura > 0.3 ? <Brilhos x={540} y={800} f={f} de={0} raio={380} cor={cores.clara} /> : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const S20: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CopoClose f={f} />
      <Rotulo2 texto="copo cheio" x={300} y={520} de={4} tamanho={64} cor="#fff" />
      <Rotulo2 texto="+ folha" x={780} y={620} de={T("uma folha") - T("Um copo cheio")} tamanho={64} cor="#8dffa8" />
    </>
  );
};

export const S21: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CopoClose f={f} maos={k(f, [[0, 0], [16, 1, CURVA.exagera]])} aura={k(f, [[10, 0], [45, 0.6]])} />
      <Som src="carga" de={10} volume={0.3} />
    </>
  );
};

export const S22: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CopoClose f={f} maos={1} aura={k(f, [[0, 0.6], [60, 0.85]])} domo={k(f, [[4, 0], [60, 1, CURVA.suave]])} />
      <Som src="brilho" de={6} volume={0.35} />
    </>
  );
};

// S23 — tensão superficial: o Lucas cutuca a película de moléculas e ela volta
export const S23: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const pelicula = T("como uma película") - t0;
  const n = 9;
  const arco = k(f, [[10, 0], [60, 1]]);
  // cutucada: desce, afunda a película, e ela empurra o dedo de volta (mola)
  const cutuca = (de: number) => {
    const t = f - de;
    if (t < 0) return 0;
    if (t < 8) return t / 8;
    return Math.max(0, Math.cos((t - 8) * 0.5) * Math.exp(-(t - 8) * 0.12));
  };
  const c = Math.max(cutuca(40), cutuca(100));
  const xDedo = 440;
  const yTopo = (i: number, x: number) => 1060 - Math.sin((i / (n - 1)) * Math.PI) * 110 * arco + c * 70 * Math.exp(-((x - xDedo) ** 2) / 22000);
  const pose = frente(170, {
    y: 1700,
    escala: 0.6,
    vira: 0.5,
    inclina: 6 * c,
    bracoD: { ombro: 118 + 10 * c, cotovelo: 22 - 8 * c },
    maoD: "aponta",
  });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade />
        <text x={540} y={380} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={76} fill="#fff">
          TENSÃO SUPERFICIAL
        </text>
        {[0, 1, 2, 3].map((linha) =>
          new Array(n).fill(0).map((_, i) => {
            const x = 230 + i * 92 + (linha % 2) * 46;
            const y = (linha === 0 ? yTopo(i, x) : 1060 + linha * 110) + Math.sin(f * 0.2 + i + linha) * 5;
            const x2 = 230 + (i + 1) * 92;
            return (
              <g key={`${linha}-${i}`}>
                {i < n - 1 ? (
                  <line x1={x} y1={y} x2={x2 + (linha % 2) * 46} y2={linha === 0 ? yTopo(i + 1, x2) : 1060 + linha * 110} stroke={linha === 0 && f > pelicula ? "#ffd23f" : "#9fd8ff"} strokeWidth={linha === 0 ? 12 : 6} />
                ) : null}
                <circle cx={x} cy={y} r={31} fill="#5aa0d8" stroke="#1d1424" strokeWidth={5} />
                <circle cx={x - 20} cy={y - 22} r={13} fill="#fff" stroke="#1d1424" strokeWidth={4} />
                <circle cx={x + 20} cy={y - 22} r={13} fill="#fff" stroke="#1d1424" strokeWidth={4} />
              </g>
            );
          }),
        )}
        <Boneco2D id="s23l" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, olhos: c > 0.3 ? 1.2 : 1, boca: c > 0.3 ? 0.4 : 0, sorriso: 0.6, olhar: [1, -0.6] }, f, "s23l")} />
        {f > pelicula ? <Brilhos x={640} y={940} f={f} de={pelicula} raio={360} /> : null}
      </svg>
      <Simbolo2 f={f} />
      <Rotulo2 texto="moléculas se agarram" x={620} y={600} de={T("as moléculas") - t0} tamanho={60} cor="#fff" />
      <Rotulo2 texto="película" x={640} y={790} de={pelicula} tamanho={90} />
    </AbsoluteFill>
  );
};

const Simbolo2: React.FC<{ f: number }> = ({ f }) =>
  f > 46 && f < 70 ? (
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Simbolo texto="!" x={330} y={930} f={f} de={46} />
    </svg>
  ) : null;

export const S24: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CopoClose f={f} maos={1} aura={k(f, [[0, 0.85], [56, 1]])} domo={1} transborda={k(f, [[30, 0], [70, 1, CURVA.suave]])} />
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <ObjetosFisica x={540} y={660} f={f} de={52} n={26} chao={1190} velocidade={30} angulo={[-160, -20]} gravidade={1.6} semente="s24" desenho={(i) => <path d="M 0 -18 Q 12 0 0 12 Q -12 0 0 -18 Z" fill={i % 2 ? "#6cc4ff" : "#9fd8ff"} />} />
        </svg>
      </AbsoluteFill>
      <Onomatopeia2 f={f} />
      <Som src="aura" de={52} volume={0.4} />
    </>
  );
};

const Onomatopeia2: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <Onomatopeia texto="SPLASH!" x={540} y={520} f={f} de={56} dur={24} cor="#9fd8ff" />
  </svg>
);

// S25 — Tipo Reforço (muque + aura forte)
export const S25: React.FC<P> = () => {
  const f = useCurrentFrame();
  const pose = frente(540, { vira: 0.25, bracoD: { ombro: 92, cotovelo: 132 }, maoD: "punho", biceps: k(f, [[0, 0], [12, 1, CURVA.exagera]]), cabeca: 8 });
  const sh = f < 14 ? tremor(f, 6) : { x: 0, y: 0 };
  return (
    <>
      <Palco cam={{ x: 600 + sh.x, y: 1000 + sh.y, zoom: 1.25 }}>
        <rect x={-500} y={-500} width={2200} height={3000} fill="#16314a" />
        <LinhasFoco f={f} cx={600} cy={800} forca={0.5} cor="#7fe0ff" raio={380} />
        <AuraForte x={540} chao={CHAO_Y} altura={ALT} f={f} forca={k(f, [[0, 0.4], [10, 1, CURVA.exagera]])} caos={0.2} id="s25" />
        <Boneco2D id="s25" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.9, canto: 0.8, sobrancelha: 12, olhar: [1, -0.4] }, f, "s25")} />
      </Palco>
      <Rotulo2 texto="REFORÇO" x={540} y={420} de={4} tamanho={150} cor="#fff" />
      <Som src="aura" de={2} volume={0.45} />
    </>
  );
};

// S26 — copo do Diego transborda também (aura verde)
export const S26: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CopoClose f={f} maos={1} aura={k(f, [[0, 0.5], [30, 1]])} domo={1} transborda={k(f, [[20, 0], [60, 1, CURVA.suave]])} dono="D" />
      <Rotulo2 texto="Diego" x={540} y={460} de={4} tamanho={90} cor="#8dffa8" />
      <Som src="aura" de={4} volume={0.35} />
    </>
  );
};

// S27 — vocês se encaram (tela dividida, cada um com sua aura)
export const S27: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ clipPath: "polygon(0 0, 100% 0, 100% 44%, 0 56%)" }}>
        <Palco cam={{ x: 560, y: 860, zoom: 2.4 }}>
          <rect x={-500} y={-500} width={2200} height={3000} fill="#163a5e" />
          <AuraForte x={540} chao={CHAO_Y} altura={ALT} f={f} forca={0.9} caos={0.1} id="s27l" particulas={false} />
          <Boneco2D id="s27l" d={LUCAS} pose={frente(540, { vira: 0.6 })} rosto={vivo({ ...ROSTO_BASE, sobrancelha: 18, olhos: 0.8, olhar: [1, 0], sorriso: 0 }, f, "s27l")} />
        </Palco>
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "polygon(0 56%, 100% 44%, 100% 100%, 0 100%)" }}>
        <Palco cam={{ x: 560, y: 1390, zoom: 2.4 }}>
          <rect x={-500} y={-500} width={2200} height={3000} fill="#15402a" />
          <AuraForte x={560} chao={CHAO_Y + 940} altura={ALT} f={f + 9} forca={0.9} caos={0.1} cor={AURA_DIEGO.cor} clara={AURA_DIEGO.clara} id="s27d" particulas={false} />
          <Boneco2D id="s27d" d={DIEGO} pose={frente(560, { y: CHAO_Y + 940, vira: -0.6 })} rosto={vivo({ ...ROSTO_DIEGO, sobrancelha: 18, olhos: 0.5, olhar: [-1, 0], canto: 0.2 }, f, "s27d")} />
        </Palco>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d="M 0 1075 L 1080 845" stroke="#ffd23f" strokeWidth={22} />
        <path d="M 0 1075 L 1080 845" stroke="#1d1424" strokeWidth={6} />
        <Faiscas x={540} y={960} f={f % 14} de={0} dur={14} cor="#ffd23f" n={10} alcance={200} />
      </svg>
      <Som src="clang" de={2} volume={0.3} />
    </>
  );
};

// S29 — Fase final: você contra o Diego
export const S29: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Palco cam={{ x: 1100, y: 1040, zoom: k(f, [[0, 0.7], [48, 0.8]]) }}>
        <Fundo saturacao={0.6}><Arena camX={1100} /></Fundo>
        <AuraForte x={1400} chao={CHAO_Y} altura={ALT} f={f} forca={0.55} caos={0.1} cor={AURA_DIEGO.cor} clara={AURA_DIEGO.clara} id="s29d" />
        <Boneco2D id="s29l" d={LUCAS} pose={perfil(800, { agacha: 26, peE: { dx: -70, dy: 0 }, peD: { dx: 80, dy: 0 }, bracoE: { ombro: 40, cotovelo: 80 }, bracoD: { ombro: 50, cotovelo: 90 }, maoE: "punho", maoD: "punho" })} rosto={vivo({ ...ROSTO_BASE, sobrancelha: 12 }, f, "s29l")} />
        <Boneco2D id="s29d" d={DIEGO} pose={perfil(1400, { lado: -1, agacha: 20, peE: { dx: -70, dy: 0 }, peD: { dx: 70, dy: 0 }, bracoD: { ombro: 30, cotovelo: 20 } })} rosto={vivo(ROSTO_DIEGO, f, "s29d")} naMao={<Espada escala={0.9} />} naMaoGira />
      </Palco>
      <Selo texto="FASE FINAL: VOCÊ × DIEGO" de={2} ate={46} cor="#e8343f" />
      <Som src="whoosh" de={0} volume={0.4} />
    </>
  );
};

// S30 — Diego ataca (sem atravessar o Lucas), você trava
export const S30: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const trava = T("você trava") - t0;
  const dx = k(f, [[0, 1420], [9, 1200, CURVA.entra]]);
  const dpose = kPose(f, [
    [0, perfil(1420, { lado: -1, agacha: 20, bracoD: { ombro: 160, cotovelo: 10 }, bracoE: { ombro: 150, cotovelo: 20 } })],
    [6, perfil(1300, { lado: -1, agacha: 40, inclina: -8, bracoD: { ombro: 170, cotovelo: 6 }, bracoE: { ombro: 160, cotovelo: 10 } }), CURVA.antecipa],
    [11, perfil(1200, { lado: -1, agacha: 90, inclina: 22, peD: { dx: 160, dy: 0 }, peE: { dx: -130, dy: 0 }, bracoD: { ombro: 50, cotovelo: -10 }, bracoE: { ombro: 40, cotovelo: 0 } }), CURVA.sai],
  ]);
  const cinza = f > trava;
  const sh = f >= 11 && f < 19 ? tremor(f, 12) : { x: 0, y: 0 };
  return (
    <AbsoluteFill style={{ filter: cinza ? "grayscale(0.85) contrast(1.15)" : undefined }}>
      <Palco cam={{ x: 960 + sh.x, y: 1000 + sh.y, zoom: 1.15 }}>
        <Fundo saturacao={0.6}><Arena camX={1000} /></Fundo>
        <AuraForte x={dx} chao={CHAO_Y} altura={ALT} f={f} forca={0.7} caos={0.3} cor={AURA_DIEGO.cor} clara={AURA_DIEGO.clara} id="s30d" particulas={false} />
        <Rastro x={dx} y={CHAO_Y} dir={-1} forca={f < 11 ? 1 : 0} f={f} cor="#d4ffe6" />
        <Boneco2D id="s30l" d={LUCAS} pose={perfil(760, { inclina: -8, cabeca: -6, bracoE: { ombro: 10, cotovelo: 10 }, bracoD: { ombro: 14, cotovelo: 10 } })} rosto={{ ...ROSTO_BASE, olhos: 1.3, sobrancelha: -14, sobrancelhaY: 16, boca: 0.3, sorriso: -0.4 }} />
        <Boneco2D id="s30d" d={DIEGO} pose={{ ...dpose, x: dx }} rosto={vivo({ ...ROSTO_DIEGO, sobrancelha: 20, boca: 0.6, olhos: 0.55 }, f, "s30d")} naMao={<Espada escala={0.9} brilho={0.6} cor={AURA_DIEGO.cor} />} naMaoGira />
        <CorteArco x={dx - 40} y={CHAO_Y - 560} r={420} de={280} ate={150} f={f} inicio={8} fim={22} dur={8} cor="#d4ffe6" />
      </Palco>
      <Simbolo texto="!" x={320} y={560} f={f} de={trava} />
      <Som src="corte" de={8} volume={0.55} />
      <Som src="coracao" de={trava} volume={0.6} />
    </AbsoluteFill>
  );
};

// S31 — coração dispara (Lucas travado, mão no peito)
export const S31: React.FC<P> = () => {
  const f = useCurrentFrame();
  const bate = 1 + Math.max(0, Math.sin(f * 0.9)) * 0.22;
  const bpm = Math.round(k(f, [[0, 90], [40, 190, CURVA.sai]]));
  const pose = frente(540, { y: 1720, escala: 0.62, cabeca: Math.sin(f * 1.7) * 2, bracoD: { ombro: 36, cotovelo: -120 }, maoD: "aberta", bracoE: { ombro: 12, cotovelo: -6 }, estica: 1 + Math.max(0, Math.sin(f * 0.9)) * 0.012 });
  const [hx, hy] = posCabeca(pose);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade cor="#3a1424" />
        <path d={`M 0 640 ${new Array(24).fill(0).map((_, i) => `L ${i * 50} ${640 + ((i + Math.floor(f / 2)) % 6 === 0 ? -140 : (i + Math.floor(f / 2)) % 6 === 1 ? 80 : 0)}`).join(" ")}`} stroke="#ff6a7a" strokeWidth={10} fill="none" />
        <Boneco2D id="s31l" d={LUCAS} pose={pose} rosto={{ ...ROSTO_BASE, olhos: 1.3, sobrancelha: -16, sobrancelhaY: 16, sorriso: -0.6, olhar: [0, 0.5] }} />
        {/* coração aparecendo no peito, batendo */}
        <g transform={`translate(560 ${1720 - 600 * 0.62}) scale(${0.75 * bate})`} opacity={0.95}>
          <Coracao />
        </g>
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 7) % 20) / 20;
          return <circle key={i} cx={560} cy={1720 - 600 * 0.62} r={60 + t * 220} fill="none" stroke="#ff6a7a" strokeWidth={8 * (1 - t)} opacity={1 - t} />;
        })}
        <Gota x={hx + 120} y={hy - 80} f={f} de={4} escala={0.8} />
      </svg>
      <Placar titulo="BATIMENTOS" valor={`${bpm} bpm`} x={540} y={420} de={2} />
      <Som src="coracao" de={0} volume={0.6} />
      <Som src="coracao" de={14} volume={0.65} />
      <Som src="coracao" de={24} volume={0.7} />
      <Som src="coracao" de={32} volume={0.75} />
      <Som src="coracao" de={39} volume={0.8} />
    </AbsoluteFill>
  );
};

// S32 — aura EXPLODE pra todo lado e some
export const S32: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const some = T("e some") - t0;
  const forca = f < some ? k(f, [[0, 0.3], [5, 1.3, CURVA.exagera]]) : k(f, [[some, 1.3], [some + 16, 0, CURVA.entra]]);
  const sh = f < some ? tremor(f, 16) : { x: 0, y: 0 };
  const pose = frente(1000, { agacha: 30, inclina: Math.sin(f * 1.1) * 3, bracoE: { ombro: 40, cotovelo: -10 }, bracoD: { ombro: 40, cotovelo: -10 }, maoE: "aberta", maoD: "aberta", estica: 1 + Math.sin(f * 1.3) * 0.015 });
  const pisca = f < some && f % 6 < 2;
  return (
    <AbsoluteFill style={{ filter: pisca ? "brightness(1.35) saturate(1.3)" : undefined }}>
      <Palco cam={{ x: 1000 + sh.x, y: 980 + sh.y, zoom: k(f, [[0, 1.0], [some, 1.2], [some + 20, 1.05]]) }}>
        <Fundo saturacao={0.6}><Arena camX={1000} tensao={1} /></Fundo>
        <rect x={-2000} y={-1000} width={6000} height={4000} fill="#2fc6ff" opacity={f < some ? 0.12 : 0} />
        <AuraForte x={1000} chao={CHAO_Y} altura={ALT} f={f} forca={forca} caos={f < some ? 1 : 0.4} id="s32" />
        {f < some
          ? [0, 1, 2].map((i) => <Faiscas key={i} x={1000 + (random(`fx${i}`) - 0.5) * 400} y={CHAO_Y - 500 - i * 120} f={(f + i * 5) % 12} de={0} dur={12} cor="#c9f4ff" n={10} alcance={500} />)
          : null}
        {f < some ? <OndaChoque x={1000} y={CHAO_Y} f={f % 10} de={0} dur={10} raio={700} achatado={0.2} cor="#c9f4ff" /> : null}
        <ObjetosFisica x={1000} y={CHAO_Y - 20} f={f} de={2} n={18} chao={CHAO_Y + 40} velocidade={30} angulo={[-170, -10]} gravidade={1.2} semente="s32" desenho={(i) => <path d={`M -${10 + (i % 3) * 6} 0 L -4 -${12 + (i % 4) * 4} L ${12 + (i % 2) * 6} -4 L 6 ${10 + (i % 3) * 3} Z`} fill={i % 2 ? "#8b8177" : "#a39889"} />} />
        <Fumaca x={1000} y={CHAO_Y} f={f} de={some} dur={36} tamanho={0.8} cor="#c9e9f5" />
        <Boneco2D id="s32" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, olhos: 1.25, sobrancelha: -16, sobrancelhaY: 14, boca: 0.7, sorriso: -0.3 }, f, "s32")} />
      </Palco>
      <Som src="aura" de={0} volume={0.6} />
      <Som src="rumble" de={0} volume={0.6} />
      <Som src="whoosh" de={some} volume={0.45} />
    </AbsoluteFill>
  );
};

// S33 — primeiro round dele
export const S33: React.FC<P> = () => {
  const f = useCurrentFrame();
  const sentado = perfil(900, { agacha: 340, inclina: 10, cabeca: 12, peE: { dx: 240, dy: 0 }, peD: { dx: 290, dy: 0 }, bracoE: { ombro: 26, cotovelo: 26 }, bracoD: { ombro: 34, cotovelo: 30 } });
  const pose = kPose(f, [[0, perfil(900, { agacha: 60 })], [6, { ...sentado, estica: 0.86 }, CURVA.entra], [18, sentado, CURVA.exagera]]);
  return (
    <>
      <Palco cam={{ x: 1100, y: 1060, zoom: 0.95 }}>
        <Fundo saturacao={0.6}><Arena camX={1100} /></Fundo>
        <Poeira x={1000} y={CHAO_Y} f={f} de={6} />
        <Boneco2D id="s33l" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, olhos: 0.6, sobrancelha: -14, sorriso: -0.6 }, f, "s33l")} />
        <Boneco2D id="s33d" d={DIEGO} pose={perfil(1450, { lado: -1, bracoD: { ombro: 10, cotovelo: 10 } })} rosto={vivo({ ...ROSTO_DIEGO, olhar: [1, 0.5] }, f, "s33d")} naMao={<Espada escala={0.9} />} naMaoGira />
      </Palco>
      <Placar titulo="ROUND 1" valor="DIEGO" x={540} y={420} de={4} />
      <Som src="impacto" de={6} volume={0.4} />
    </>
  );
};

// S34 — "Levanta. Não quero ganhar assim."
export const S34: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const falaDe = T("Levanta") - t0;
  const falaAte = TF("ganhar assim") - t0;
  return (
    <Palco cam={{ x: 1300, y: 760, zoom: 1.7 }}>
      <Fundo saturacao={0.6}><Arena camX={1300} /></Fundo>
      <Boneco2D id="s34d" d={DIEGO} pose={frente(1350, { vira: -0.5, bracoD: { ombro: 10, cotovelo: 10 } })} rosto={vivo({ ...ROSTO_DIEGO, olhos: 0.7, canto: 0, sorriso: -0.1, sobrancelha: 14, olhar: [-1, 0.7] }, f, "s34d", falaDe, falaAte)} naMao={<Espada escala={0.9} />} naMaoGira />
    </Palco>
  );
};

// S35 — lembra do avô
export const S35: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <Lembranca>
      <Palco cam={{ x: 560, y: 820, zoom: k(f, [[0, 1.6], [44, 1.75]]) }}>
        <Fundo><RuaLonga camX={600} /></Fundo>
        <Boneco2D id="s35" d={AVO} pose={frente(560, { vira: -0.2, bracoD: { ombro: 120, cotovelo: -40 }, maoD: "aponta", estica: 1 + respira(f) * 0.008 })} rosto={vivo({ ...ROSTO_AVO, sorriso: 0.7 }, f, "s35")} />
      </Palco>
    </Lembranca>
  );
};

// S36 — respiração lenta: pulmões em "raio-X" no peito do Lucas vs. um candidato ofegante
export const S36: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const lento = (Math.sin((f / 300) * Math.PI * 2 * 1.5) + 1) / 2;
  const rapido = (Math.sin((f / 30) * Math.PI * 2 * 0.8) + 1) / 2;
  const mostraRapido = f > T("em vez das") - t0;
  const lx = k(f, [[T("em vez das") - t0, 540], [T("em vez das") - t0 + 12, 300, CURVA.suave]]);
  const esc = mostraRapido ? 0.55 : 0.7;
  const lpose = frente(lx, { y: 1640, escala: esc, estica: 1 + lento * 0.03, cabeca: -3 + lento * 3, bracoE: { ombro: 16 + lento * 6, cotovelo: -8 }, bracoD: { ombro: 16 + lento * 6, cotovelo: -8 } });
  const cpose = frente(800, { y: 1640, escala: 0.55, estica: 1 + rapido * 0.04, inclina: 6, bracoE: { ombro: 20, cotovelo: -40 }, bracoD: { ombro: 20, cotovelo: -40 } });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade />
        <Boneco2D id="s36l" d={LUCAS} pose={lpose} rosto={{ ...ROSTO_BASE, olhos: 0, sorriso: 0.4 }} />
        <g transform={`translate(${lx} ${1640 - 610 * esc}) scale(${esc * 0.95})`} opacity={0.85}>
          <Pulmoes escala={1} ar={lento} />
        </g>
        {mostraRapido ? (
          <>
            <Boneco2D id="s36c" d={CANDIDATOS[2]} pose={cpose} rosto={vivo({ ...ROSTO_BASE, olhos: 0.9, boca: 0.5 + rapido * 0.3, sorriso: -0.3, sobrancelha: -10 }, f, "s36c")} />
            <g transform={`translate(800 ${1640 - 610 * 0.55}) scale(${0.55 * 0.95})`} opacity={0.85}>
              <Pulmoes escala={1} ar={rapido} />
            </g>
          </>
        ) : null}
      </svg>
      <Rotulo2 texto="6 por minuto" x={mostraRapido ? 300 : 540} y={mostraRapido ? 760 : 560} de={T("umas seis") - t0} tamanho={66} />
      {mostraRapido ? <Rotulo2 texto="12 a 20" x={800} y={760} de={T("em vez das") - t0} tamanho={66} cor="#ff8a8a" /> : null}
      <Rotulo2 texto="respira devagar" x={540} y={400} de={4} tamanho={80} cor="#fff" />
    </AbsoluteFill>
  );
};

// S37 — acalma o corpo, diminui o estresse (medidor em cima da cabeça do Lucas)
export const S37: React.FC<P> = () => {
  const f = useCurrentFrame();
  const nivel = k(f, [[10, 0.92], [90, 0.22, CURVA.suave]]);
  const calmo = 1 - (nivel - 0.22) / 0.7;
  const pose = frente(540, { y: 1700, escala: 0.75, estica: 1 + respira(f) * 0.012, cabeca: -2, bracoE: { ombro: 16, cotovelo: -8 }, bracoD: { ombro: 16, cotovelo: -8 } });
  const [hx, hy] = posCabeca(pose);
  const rosto = { ...ROSTO_BASE, olhos: 1.1 - calmo * 0.5, sobrancelha: -14 + calmo * 14, sobrancelhaY: 12 - calmo * 12, sorriso: -0.6 + calmo * 1.2, olhar: [0, -0.6] as [number, number] };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade />
        <text x={540} y={560} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={70} fill="#fff">
          ESTRESSE
        </text>
        <rect x={190} y={620} width={700} height={110} rx={50} fill="#1d1424" />
        <rect x={205} y={635} width={670 * nivel} height={80} rx={40} fill={nivel > 0.6 ? "#e8343f" : nivel > 0.35 ? "#ff9b2f" : "#2e9b6a"} />
        <Boneco2D id="s37l" d={LUCAS} pose={pose} rosto={vivo(rosto, f, "s37l")} />
        {nivel > 0.6 ? <Veia x={hx + 90} y={hy - 100} f={f} de={0} escala={0.9} /> : null}
        {nivel > 0.6 ? <Gota x={hx - 130} y={hy - 60} f={f} de={0} escala={0.8} /> : null}
        {nivel < 0.35 ? <Brilhos x={hx} y={hy} f={f} de={70} raio={220} cor="#bfffd9" /> : null}
      </svg>
      <Rotulo2 texto="vida real" x={540} y={400} de={2} tamanho={60} cor="#ffd23f" />
    </AbsoluteFill>
  );
};

// S38 — a aura para de vazar e se concentra no punho
export const S38: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const punho = T("no punho") - t0;
  const conc = k(f, [[30, 0], [punho, 1, CURVA.suave]]);
  const pose = frente(1000, { vira: 0.3, bracoD: { ombro: 40, cotovelo: -100 }, maoD: "punho", bracoE: { ombro: 16, cotovelo: -10 }, estica: 1 + respira(f) * 0.01 });
  // posição aproximada do punho (frente, braço direito da tela)
  const mx = 1000 + 108 * ESC * 0.88 + 90;
  const my = CHAO_Y - 600 * ESC;
  return (
    <>
      <Palco cam={{ x: k(f, [[0, 1000], [punho, 1040]]), y: k(f, [[0, 1000], [punho, 880]]), zoom: k(f, [[0, 1.05], [punho + 10, 1.55, CURVA.suave]]) }}>
        <Fundo saturacao={0.6}><Arena camX={1000} tensao={0} /></Fundo>
        {/* primeiro a aura vaza, instável; depois fica calma e vai pro punho */}
        <AuraForte x={1000} chao={CHAO_Y} altura={ALT} f={f} forca={k(f, [[0, 1], [30, 0.9], [punho, 0.15]])} caos={k(f, [[0, 0.7], [30, 0.1]])} id="s38" />
        <CorrentesAura x={1000} chao={CHAO_Y} altura={ALT} alvoX={mx} alvoY={my} f={f} prog={k(f, [[30, 0], [50, 1], [punho + 10, 1], [punho + 20, 0]])} id="s38c" />
        <Boneco2D id="s38" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, olhos: f < punho ? 0 : 0.85, sorriso: 0.2, sobrancelha: 10 }, f, "s38")} />
        <PunhoBrilhando x={mx} y={my} f={f} forca={conc} id="s38p" />
      </Palco>
      <Rotulo2 texto="AURA NO PUNHO" x={540} y={420} de={punho} tamanho={84} cor="#c9f4ff" />
      <Som src="carga" de={30} volume={0.35} />
      <Som src="brilho" de={punho} volume={0.5} />
    </>
  );
};

// S39 — Segundo round (um de frente pro outro, punho aceso)
export const S39: React.FC<P> = () => {
  const f = useCurrentFrame();
  const punhoX = 800 + 160;
  return (
    <Palco cam={{ x: 1100, y: 1040, zoom: 0.85 }}>
      <Fundo saturacao={0.6}><Arena camX={1100} /></Fundo>
      <AuraForte x={1400} chao={CHAO_Y} altura={ALT} f={f} forca={0.6} caos={0.15} cor={AURA_DIEGO.cor} clara={AURA_DIEGO.clara} id="s39d" particulas={false} />
      <Boneco2D id="s39l" d={LUCAS} pose={perfil(800, { agacha: 30, peE: { dx: -70, dy: 0 }, peD: { dx: 80, dy: 0 }, bracoD: { ombro: 40, cotovelo: 90 }, maoD: "punho", bracoE: { ombro: -20, cotovelo: 30 } })} rosto={vivo({ ...ROSTO_BASE, sobrancelha: 14, olhos: 0.8 }, f, "s39l")} />
      <PunhoBrilhando x={punhoX} y={CHAO_Y - 600 * ESC} f={f} forca={0.7} id="s39p" />
      <Boneco2D id="s39d" d={DIEGO} pose={perfil(1400, { lado: -1, agacha: 30, bracoD: { ombro: 64, cotovelo: 64 }, bracoE: { ombro: 58, cotovelo: 70 } })} rosto={vivo({ ...ROSTO_DIEGO, sobrancelha: 16 }, f, "s39d")} naMao={<Espada escala={0.9} brilho={0.5} cor={AURA_DIEGO.cor} />} naMaoGira />
    </Palco>
  );
};

// S40 — contagem 3, 2, 1 com closes (olho do Lucas, olho do Diego, punho)
export const S40: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const n2 = T("dois um") - t0;
  const n1 = T("um um soco") - t0;
  if (f < n2) {
    const pose = perfil(800, { agacha: 30 });
    const [hx, hy] = posCabeca(pose);
    return (
      <Palco cam={{ x: hx + 60, y: hy - 6, zoom: k(f, [[0, 4.6], [n2, 5.0]]) }}>
        <Fundo saturacao={0.6}><Arena camX={1100} /></Fundo>
        <AuraForte x={800} chao={CHAO_Y} altura={ALT} f={f} forca={0.5} caos={0} id="s40l" particulas={false} />
        <Boneco2D id="s40l" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, sobrancelha: 18, olhos: 0.75 }, f, "s40l")} />
      </Palco>
    );
  }
  if (f < n1) {
    const pose = perfil(1400, { lado: -1, agacha: 30 });
    const [hx, hy] = posCabeca(pose);
    return (
      <Palco cam={{ x: hx - 60, y: hy - 6, zoom: k(f, [[n2, 4.6], [n1, 5.0]]) }}>
        <Fundo saturacao={0.6}><Arena camX={1100} /></Fundo>
        <AuraForte x={1400} chao={CHAO_Y} altura={ALT} f={f} forca={0.5} caos={0} cor={AURA_DIEGO.cor} clara={AURA_DIEGO.clara} id="s40d" particulas={false} />
        <Boneco2D id="s40d" d={DIEGO} pose={pose} rosto={vivo({ ...ROSTO_DIEGO, sobrancelha: 20, olhos: 0.45, canto: 0 }, f, "s40d")} />
      </Palco>
    );
  }
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #123047, #05080d)" }}>
      <svg width={1080} height={1920}>
        <PunhoBrilhando x={540} y={960} f={f} forca={k(f, [[n1, 1.2], [n1 + 20, 2]])} id="s40p" />
      </svg>
    </AbsoluteFill>
  );
};

// S41 — um soco só (com contato e hit-stop)
export const S41: React.FC<P> = () => {
  const f = useCurrentFrame();
  const HIT = 5;
  const x = k(f, [[0, 820], [HIT, 1130, CURVA.entra]]);
  const soco = perfil(x, { agacha: 60, inclina: 18, peE: { dx: -170, dy: 0 }, peD: { dx: 150, dy: 0 }, bracoD: { ombro: 92, cotovelo: 0 }, maoD: "punho", bracoE: { ombro: -50, cotovelo: 40 } });
  const contatoX = 1130 + 330 * ESC * 0.95;
  const contatoY = CHAO_Y - 580 * ESC;
  const inv = f === HIT || f === HIT + 2;
  const sh = f >= HIT && f < HIT + 12 ? tremor(f, 26 * (1 - (f - HIT) / 12)) : { x: 0, y: 0 };
  return (
    <AbsoluteFill style={{ filter: inv ? "invert(1) contrast(1.4)" : undefined }}>
      <Palco cam={{ x: 1250 + sh.x, y: 960 + sh.y, zoom: k(f, [[0, 1.2], [HIT, 1.55, CURVA.sai], [HIT + 14, 1.35]]) }}>
        <Fundo saturacao={0.6}><Arena camX={1250} /></Fundo>
        <AuraForte x={x} chao={CHAO_Y} altura={ALT} f={f} forca={f < HIT + 6 ? 0.9 : 0.4} caos={0.3} id="s41l" particulas={false} />
        <Rastro x={x} y={CHAO_Y} dir={1} forca={f < HIT + 1 ? 1 : 0} f={f} cor="#c9f4ff" />
        <Boneco2D id="s41d" d={DIEGO} pose={perfil(1480, { lado: -1, agacha: 30, inclina: f > HIT ? -24 : 0, bracoD: { ombro: f > HIT ? 130 : 24, cotovelo: f > HIT ? -20 : 30 }, bracoE: { ombro: f > HIT ? 110 : 10, cotovelo: 10 } })} rosto={{ ...ROSTO_DIEGO, olhos: f > HIT ? 1.3 : 0.6, boca: f > HIT ? 0.8 : 0 }} naMao={<Espada escala={0.9} />} naMaoGira />
        <Boneco2D id="s41l" d={LUCAS} pose={soco} rosto={{ ...ROSTO_BASE, sobrancelha: 22, boca: 0.9, olhos: 0.7 }} />
        <PunhoBrilhando x={contatoX} y={contatoY} f={f} forca={f < HIT + 8 ? 1 : 0.4} id="s41p" />
        <Faiscas x={contatoX} y={contatoY} f={f} de={HIT} cor="#c9f4ff" n={26} alcance={600} />
        <OndaChoque x={contatoX} y={contatoY} f={f} de={HIT} raio={900} cor="#c9f4ff" />
        <Impacto x={contatoX} y={contatoY} f={f} de={HIT} dur={12} />
        <Onomatopeia texto="POW!" x={1300} y={CHAO_Y - 900} f={f} de={HIT} dur={24} tamanho={190} />
      </Palco>
      <Som src="whoosh" de={0} volume={0.5} />
      <Som src="explosao" de={HIT} volume={0.65} />
      <Som src="impacto" de={HIT} volume={0.5} />
    </AbsoluteFill>
  );
};

// S42 — Diego voa pra fora da arena
export const S42: React.FC<P> = () => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / 40);
  const x = 1300 + t * 1300;
  const y = CHAO_Y - 4 * 520 * t * (1 - t);
  const aterrissou = f > 40;
  return (
    <>
      <Palco cam={{ x: k(f, [[0, 1500], [40, 2300, CURVA.suave]]), y: 1000, zoom: 0.8 }}>
        <Fundo saturacao={0.6}><Arena camX={1800} /></Fundo>
        <Rastro x={x} y={y} dir={1} forca={aterrissou ? 0 : 0.8} f={f} />
        <Boneco2D id="s42d" d={DIEGO} pose={perfil(aterrissou ? 2600 : x, { lado: -1, y: aterrissou ? CHAO_Y : y, gira: aterrissou ? 0 : -f * 18, agacha: aterrissou ? 340 : 40, peE: aterrissou ? { dx: 240, dy: 0 } : { dx: -60, dy: -120 }, peD: aterrissou ? { dx: 290, dy: 0 } : { dx: 60, dy: -140 }, bracoE: { ombro: 120, cotovelo: 30 }, bracoD: { ombro: 140, cotovelo: 20 } })} rosto={{ ...ROSTO_DIEGO, olhos: 1.2, boca: 0.6, sobrancelhaY: 16 }} />
        <Poeira x={2600} y={CHAO_Y} f={f} de={40} largura={1.4} />
        <ObjetosFisica x={2600} y={CHAO_Y - 30} f={f} de={40} n={16} chao={CHAO_Y + 40} velocidade={24} angulo={[-165, -15]} gravidade={1.3} semente="s42" desenho={(i) => <path d={`M -${10 + (i % 3) * 6} 0 L -4 -${12 + (i % 4) * 4} L ${12 + (i % 2) * 6} -4 L 6 ${10 + (i % 3) * 3} Z`} fill={i % 2 ? "#8b8177" : "#a39889"} />} />
        {aterrissou ? <Simbolo texto="!" x={2600} y={CHAO_Y - 600} f={f} de={44} cor="#ffffff" /> : null}
      </Palco>
      {aterrissou ? <Rotulo2 texto="FORA!" x={540} y={460} de={42} tamanho={150} /> : null}
      <Som src="whoosh" de={0} volume={0.4} />
      <Som src="impacto" de={40} volume={0.5} />
    </>
  );
};

// S43 — Licença Hunter desbloqueada
export const S43: React.FC<P> = () => {
  const f = useCurrentFrame();
  const gira = k(f, [[0, 180], [16, 0, CURVA.exagera]]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #4a3d7a, #15111f)" }}>
      <svg width={1080} height={1920}>
        <LinhasFoco f={f} cx={540} cy={900} forca={0.5} cor="#ffd23f" raio={480} />
        <g transform={`translate(540 900) scale(${Math.cos((gira * Math.PI) / 180)} 1)`}>
          <rect x={-380} y={-240} width={760} height={480} rx={36} fill="#f4c531" stroke="#1d1424" strokeWidth={12} />
          <rect x={-340} y={-200} width={240} height={300} rx={20} fill="#3474dc" stroke="#1d1424" strokeWidth={8} />
          <g transform="translate(-220 120) scale(0.32)">
            <Boneco2D id="lic" d={LUCAS} pose={{ ...frente(0, { escala: 1, y: 0 }) }} rosto={{ ...ROSTO_BASE, sorriso: 0.8 }} />
          </g>
          <text x={-60} y={-110} fontFamily="Fredoka" fontWeight={700} fontSize={64} fill="#1d1424">
            LICENÇA
          </text>
          <text x={-60} y={-30} fontFamily="Fredoka" fontWeight={700} fontSize={64} fill="#1d1424">
            HUNTER
          </text>
          <path d="M -60 40 L 320 40 M -60 100 L 260 100 M -60 160 L 200 160" stroke="#1d1424" strokeWidth={14} strokeLinecap="round" opacity={0.35} />
        </g>
        <Brilhos x={540} y={900} f={f} de={14} raio={460} />
      </svg>
      <Som src="brilho" de={10} volume={0.5} />
    </AbsoluteFill>
  );
};

// S44 — você estende a mão; ele aceita
export const S44: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const aceita = T("Ele aceita") - t0;
  const levanta = k(f, [[aceita, 0], [aceita + 18, 1, CURVA.exagera]]);
  const dsentado = perfil(1500, { lado: -1, agacha: 340, inclina: 6, peE: { dx: 240, dy: 0 }, peD: { dx: 290, dy: 0 }, bracoD: { ombro: 30 + 70 * Math.min(1, Math.max(0, (f - aceita + 10) / 10)), cotovelo: 0 }, bracoE: { ombro: 26, cotovelo: 26 } });
  const dpe = perfil(1340, { lado: -1, bracoD: { ombro: 80, cotovelo: 0 } });
  return (
    <Palco cam={{ x: 1250, y: 1000, zoom: 1.1 }}>
      <Fundo saturacao={0.6}><Arena camX={1800} /></Fundo>
      <Boneco2D id="s44l" d={LUCAS} pose={perfil(1020, { inclina: 12 * (1 - levanta), bracoD: { ombro: k(f, [[0, 10], [12, 42, CURVA.exagera]]) + 38 * levanta, cotovelo: 0 }, maoD: "aberta" })} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.7 }, f, "s44l")} />
      <Boneco2D id="s44d" d={DIEGO} pose={levanta > 0 ? kPose(f, [[aceita, dsentado], [aceita + 18, dpe, CURVA.exagera]]) : dsentado} rosto={vivo({ ...ROSTO_DIEGO, olhos: 0.55, canto: 0, sorriso: 0, olhar: [0, 0.4] }, f, "s44d")} />
    </Palco>
  );
};

// S45 — "Eu deixei você ganhar." (dois segundos depois)
export const S45: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const falaDe = T("Eu deixei") - t0;
  const falaAte = TF("você ganhar") - t0;
  return (
    <>
      <Palco cam={{ x: 1340, y: 760, zoom: 1.75 }}>
        <Fundo saturacao={0.6}><Arena camX={1800} /></Fundo>
        <Boneco2D id="s45d" d={DIEGO} pose={frente(1340, { vira: -0.4, cruzado: k(f, [[falaDe - 6, 0], [falaDe + 4, 1, CURVA.exagera]]), cabeca: 8 })} rosto={vivo({ ...ROSTO_DIEGO, olhos: 0.5, olhar: [1, -0.4], canto: 0.6, sobrancelhaY: 4 }, f, "s45d", falaDe, falaAte)} />
      </Palco>
      <Selo texto="2 SEGUNDOS DEPOIS..." de={0} ate={falaDe - 2} cor="#4a4458" />
    </>
  );
};

// S46 — "Claro, Topete."
export const S46: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const falaDe = T("Claro Topete") - t0;
  const falaAte = TF("Claro Topete") - t0;
  return (
    <Palco cam={{ x: 1020, y: 760, zoom: 1.75 }}>
      <Fundo saturacao={0.6}><Arena camX={1400} /></Fundo>
      <Boneco2D id="s46l" d={LUCAS} pose={frente(1020, { vira: 0.5, cabeca: -4 })} rosto={vivo({ ...ROSTO_BASE, olhos: 0.45, canto: 1, sorriso: 0.4, olhar: [1, 0] }, f, "s46l", falaDe, falaAte)} />
    </Palco>
  );
};

// S47 — moral (Lucas com aura calma e concentrada, depois o avô)
export const S47: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const avo = T("Quem respira com calma", 1) - t0;
  return (
    <>
      <Palco cam={{ x: 1100, y: 1000, zoom: k(f, [[0, 0.75], [140, 0.85]]) }}>
        <Fundo saturacao={0.6}><Arena camX={1100} /></Fundo>
        <rect x={-2000} y={-1000} width={6000} height={4000} fill="#ff9b2f" opacity={0.25} />
        <AuraForte x={900} chao={CHAO_Y} altura={ALT} f={f} forca={0.45} caos={0} id="s47l" />
        <Boneco2D id="s47l" d={LUCAS} pose={frente(880, { vira: 0.3, bracoD: { ombro: 16, cotovelo: -8 } })} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.7 }, f, "s47l")} />
        <Boneco2D id="s47d" d={DIEGO} pose={frente(1300, { vira: -0.3, cruzado: 1 })} rosto={vivo({ ...ROSTO_DIEGO, canto: 0.6 }, f, "s47d")} />
      </Palco>
      {f > avo ? (
        <AbsoluteFill style={{ opacity: interpolate(f, [avo, avo + 10], [0, 1], { extrapolateRight: "clamp" }) }}>
          <Lembranca>
            <Palco cam={{ x: 560, y: 820, zoom: 1.6 }}>
              <Fundo><RuaLonga camX={600} /></Fundo>
              <Boneco2D id="s47a" d={AVO} pose={frente(560, { vira: -0.2, bracoD: { ombro: 120, cotovelo: -40 }, maoD: "joia" })} rosto={vivo({ ...ROSTO_AVO, sorriso: 0.9 }, f, "s47a")} />
            </Palco>
          </Lembranca>
        </AbsoluteFill>
      ) : null}
    </>
  );
};

// S48 — chamada final (comenta + parte 2)
export const S48: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Palco cam={{ x: 1100, y: 1050, zoom: 0.95 }}>
        <rect x={-2000} y={-1000} width={6000} height={4000} fill="#3d3463" />
        <LinhasFoco f={f} cx={1100} cy={700} forca={0.35} cor="#7d5bd6" raio={500} />
        <AuraForte x={800} chao={CHAO_Y} altura={ALT} f={f} forca={0.5} caos={0.05} id="s48l" particulas={false} />
        <AuraForte x={1380} chao={CHAO_Y} altura={ALT} f={f + 5} forca={0.5} caos={0.05} cor={AURA_DIEGO.cor} clara={AURA_DIEGO.clara} id="s48d" particulas={false} />
        <Boneco2D id="s48l" d={LUCAS} pose={frente(800, { vira: 0.3, bracoE: { ombro: 100, cotovelo: 0 }, maoE: "aponta" })} rosto={vivo({ ...ROSTO_BASE, sorriso: 1, boca: 0.4 }, f, "s48l")} />
        <Boneco2D id="s48d" d={DIEGO} pose={frente(1380, { vira: -0.3, bracoD: { ombro: 60, cotovelo: -110 }, maoD: "joia" })} rosto={vivo({ ...ROSTO_DIEGO, canto: 1 }, f, "s48d")} />
      </Palco>
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div style={{ marginTop: 260, display: "flex", flexDirection: "column", gap: 30, alignItems: "center", transform: `scale(${interpolate(f, [0, 8], [0.6, 1], { extrapolateRight: "clamp" })})` }}>
          <div style={{ background: "#fff", border: "7px solid #1d1424", borderRadius: 30, padding: "20px 40px", fontFamily: "Fredoka", fontWeight: 700, fontSize: 56, color: "#1d1424" }}>Qual seria o seu Nen?</div>
          <div style={{ background: "#e8343f", border: "7px solid #1d1424", borderRadius: 30, padding: "20px 50px", fontFamily: "Fredoka", fontWeight: 700, fontSize: 60, color: "#fff", transform: `scale(${1 + Math.max(0, Math.sin(f * 0.25)) * 0.06})` }}>SEGUE → PARTE 2</div>
        </div>
      </AbsoluteFill>
    </>
  );
};
