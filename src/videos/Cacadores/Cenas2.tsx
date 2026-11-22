import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Boneco2D, ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { Arena, CHAO_Y, Cozinha, Praca } from "../../estilo2d/Cenario2D";
import { Brilhos, Impacto, LinhasFoco, Poeira, Simbolo } from "../../estilo2d/Efeitos2D";
import { Faiscas, OndaChoque, Onomatopeia, Rastro } from "../../estilo2d/EfeitosLuta";
import { Copo, Coracao, Espada, Pulmoes } from "../../estilo2d/Objetos";
import { Placar, Rotulo2, Selo } from "../../estilo2d/UI";
import { CURVA, k, kPose, respira, tremor } from "../../estilo2d/anim";
import { AVO, DIEGO, LUCAS } from "../../estilo2d/personagens";
import { ESC, Grade, Lembranca, Palco, ROSTO_AVO, ROSTO_DIEGO, Som, frente, perfil, vivo } from "./comum";
import { T, TF } from "./tempo";

type P = { t0: number };

// --------- aura (contorno de energia em volta do personagem) ---------
const AuraNen: React.FC<{ x: number; f: number; forca: number; caos?: number; cor?: string; escala?: number }> = ({ x, f, forca, caos = 0, cor = "#7fe0ff", escala = ESC }) => {
  if (forca <= 0.01) return null;
  const pts: string[] = [];
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = random(`an${i}-${Math.floor(f / 2)}`);
    const rx = (300 + r * (60 + caos * 260)) * escala;
    const ry = (680 + r * (80 + caos * 300)) * escala;
    pts.push(`${x + Math.cos(a) * rx} ${CHAO_Y - 600 * escala + Math.sin(a) * ry}`);
  }
  return (
    <g opacity={forca}>
      <defs>
        <filter id="nenBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <path d={`M ${pts.join(" L ")} Z`} fill={cor} opacity={0.5} filter="url(#nenBlur)" />
    </g>
  );
};

// S19 — Segunda fase: Nen (mesas com copos)
export const S19: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Palco cam={{ x: 600, y: 1000, zoom: k(f, [[0, 0.85], [70, 0.95]]) }}>
        <Cozinha />
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

// S20..S24 — o copo em close (mesmo cenário, estados diferentes)
const CopoClose: React.FC<{ f: number; domo?: number; transborda?: number; nivel?: number; maos?: number; brilho?: number; dono?: "L" | "D" }> = ({ f, domo = 0, transborda = 0, nivel = 0.92, maos = 0, brilho = 0, dono = "L" }) => {
  const pele = dono === "L" ? LUCAS.pele : DIEGO.pele;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #3a3156, #17121f)" }}>
      <svg width={1080} height={1920}>
        <rect x={0} y={1180} width={1080} height={740} fill="#a8774a" />
        <rect x={0} y={1180} width={1080} height={24} fill="#c98f5a" />
        {brilho > 0 ? (
          <circle cx={540} cy={900} r={420} fill={dono === "L" ? "#7fe0ff" : "#8dffa8"} opacity={0.18 * brilho} />
        ) : null}
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
  return <CopoClose f={f} maos={k(f, [[0, 0], [16, 1, CURVA.exagera]])} brilho={k(f, [[10, 0], [40, 0.6]])} />;
};

export const S22: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CopoClose f={f} maos={1} brilho={0.8} domo={k(f, [[4, 0], [60, 1, CURVA.suave]])} />
      <Som src="brilho" de={6} volume={0.35} />
    </>
  );
};

// S23 — tensão superficial (moléculas de mãos dadas)
export const S23: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const pelicula = T("como uma película") - t0;
  const n = 9;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade />
        <text x={540} y={380} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={76} fill="#fff">
          TENSÃO SUPERFICIAL
        </text>
        {/* camadas de moléculas */}
        {[0, 1, 2, 3].map((linha) =>
          new Array(n).fill(0).map((_, i) => {
            const x = 140 + i * 100 + (linha % 2) * 50;
            const arco = linha === 0 ? -Math.sin((i / (n - 1)) * Math.PI) * 120 * k(f, [[10, 0], [60, 1]]) : 0;
            const y = 900 + linha * 120 + arco + Math.sin(f * 0.2 + i + linha) * 6;
            return (
              <g key={`${linha}-${i}`}>
                {i < n - 1 ? (
                  <line x1={x} y1={y} x2={x + 100} y2={900 + linha * 120 + (linha === 0 ? -Math.sin(((i + 1) / (n - 1)) * Math.PI) * 120 * k(f, [[10, 0], [60, 1]]) : 0)} stroke={linha === 0 && f > pelicula ? "#ffd23f" : "#9fd8ff"} strokeWidth={linha === 0 ? 12 : 6} />
                ) : null}
                <circle cx={x} cy={y} r={34} fill="#5aa0d8" stroke="#1d1424" strokeWidth={5} />
                <circle cx={x - 22} cy={y - 24} r={14} fill="#fff" stroke="#1d1424" strokeWidth={4} />
                <circle cx={x + 22} cy={y - 24} r={14} fill="#fff" stroke="#1d1424" strokeWidth={4} />
              </g>
            );
          }),
        )}
        {f > pelicula ? <Brilhos x={540} y={760} f={f} de={pelicula} raio={360} /> : null}
      </svg>
      <Rotulo2 texto="moléculas se agarram" x={540} y={1500} de={T("as moléculas") - t0} tamanho={60} cor="#fff" />
      <Rotulo2 texto="película" x={540} y={620} de={pelicula} tamanho={90} />
    </AbsoluteFill>
  );
};

export const S24: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CopoClose f={f} maos={1} brilho={1} domo={1} transborda={k(f, [[30, 0], [70, 1, CURVA.suave]])} />
      <Onomatopeia texto="SPLASH!" x={540} y={560} f={f} de={56} dur={24} cor="#9fd8ff" />
    </>
  );
};

// S25 — Tipo Reforço
export const S25: React.FC<P> = () => {
  const f = useCurrentFrame();
  const pose = frente(540, { vira: 0.25, bracoD: { ombro: 92, cotovelo: 132 }, maoD: "punho", biceps: k(f, [[0, 0], [12, 1, CURVA.exagera]]), cabeca: 8 });
  return (
    <>
      <Palco cam={{ x: 600, y: 1000, zoom: 1.25 }}>
        <rect x={-500} y={-500} width={2200} height={3000} fill="#f4c531" />
        <LinhasFoco f={f} cx={600} cy={800} forca={0.6} cor="#fff3b0" raio={380} />
        <Boneco2D id="s25" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.9, canto: 0.8, sobrancelha: 12, olhar: [1, -0.4] }, f, "s25")} />
      </Palco>
      <Rotulo2 texto="REFORÇO" x={540} y={420} de={4} tamanho={150} cor="#fff" />
      <Som src="impacto" de={4} volume={0.4} />
    </>
  );
};

// S26 — copo do Diego transborda também
export const S26: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CopoClose f={f} maos={1} brilho={1} domo={1} transborda={k(f, [[20, 0], [60, 1, CURVA.suave]])} dono="D" />
      <Rotulo2 texto="Diego" x={540} y={460} de={4} tamanho={90} cor="#8dffa8" />
    </>
  );
};

// S27 — vocês se encaram (tela dividida)
export const S27: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ clipPath: "polygon(0 0, 100% 0, 100% 44%, 0 56%)" }}>
        <Palco cam={{ x: 560, y: 860, zoom: 2.4 }}>
          <rect x={-500} y={-500} width={2200} height={3000} fill="#3a6fb0" />
          <Boneco2D id="s27l" d={LUCAS} pose={frente(540, { vira: 0.6 })} rosto={vivo({ ...ROSTO_BASE, sobrancelha: 18, olhos: 0.8, olhar: [1, 0], sorriso: 0 }, f, "s27l")} />
        </Palco>
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "polygon(0 56%, 100% 44%, 100% 100%, 0 100%)" }}>
        <Palco cam={{ x: 560, y: 1390, zoom: 2.4 }}>
          <rect x={-500} y={-500} width={2200} height={3000} fill="#2f9e57" />
          <Boneco2D id="s27d" d={DIEGO} pose={frente(560, { y: CHAO_Y + 940, vira: -0.6 })} rosto={vivo({ ...ROSTO_DIEGO, sobrancelha: 18, olhos: 0.5, olhar: [-1, 0], canto: 0.2 }, f, "s27d")} />
        </Palco>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d="M 0 1075 L 1080 845" stroke="#ffd23f" strokeWidth={22} />
        <path d="M 0 1075 L 1080 845" stroke="#1d1424" strokeWidth={6} />
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
        <Arena camX={1100} />
        <Boneco2D id="s29l" d={LUCAS} pose={perfil(800, { agacha: 26, peE: { dx: -70, dy: 0 }, peD: { dx: 80, dy: 0 }, bracoE: { ombro: 40, cotovelo: 80 }, bracoD: { ombro: 50, cotovelo: 90 }, maoE: "punho", maoD: "punho" })} rosto={vivo({ ...ROSTO_BASE, sobrancelha: 12 }, f, "s29l")} />
        <Boneco2D id="s29d" d={DIEGO} pose={perfil(1400, { lado: -1, agacha: 20, peE: { dx: -70, dy: 0 }, peD: { dx: 70, dy: 0 }, bracoD: { ombro: 30, cotovelo: 20 } })} rosto={vivo(ROSTO_DIEGO, f, "s29d")} naMao={<Espada escala={0.9} />} naMaoGira />
      </Palco>
      <Selo texto="FASE FINAL: VOCÊ × DIEGO" de={2} ate={46} cor="#e8343f" />
      <Som src="whoosh" de={0} volume={0.4} />
    </>
  );
};

// S30 — Diego ataca, você trava
export const S30: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const trava = T("você trava") - t0;
  const dx = k(f, [[0, 1400], [10, 1060, CURVA.entra]]);
  const dpose = kPose(f, [
    [0, perfil(1400, { lado: -1, agacha: 20, bracoD: { ombro: 160, cotovelo: 10 }, bracoE: { ombro: 150, cotovelo: 20 } })],
    [10, perfil(dx, { lado: -1, agacha: 80, inclina: 20, peD: { dx: 150, dy: 0 }, peE: { dx: -120, dy: 0 }, bracoD: { ombro: 60, cotovelo: -10 }, bracoE: { ombro: 50, cotovelo: 0 } }), CURVA.sai],
  ]);
  const cinza = f > trava ? 1 : 0;
  return (
    <AbsoluteFill style={{ filter: cinza ? "grayscale(0.85) contrast(1.1)" : undefined }}>
      <Palco cam={{ x: 980, y: 1000, zoom: 1.1 }}>
        <Arena camX={1000} />
        <Rastro x={dx} y={CHAO_Y} dir={-1} forca={f < 12 ? 1 : 0} f={f} />
        <Boneco2D id="s30d" d={DIEGO} pose={{ ...dpose, x: dx }} rosto={vivo({ ...ROSTO_DIEGO, sobrancelha: 18, boca: 0.6 }, f, "s30d")} naMao={<Espada escala={0.9} />} naMaoGira />
        <Boneco2D id="s30l" d={LUCAS} pose={perfil(800, { inclina: -6, bracoE: { ombro: 10, cotovelo: 10 }, bracoD: { ombro: 14, cotovelo: 10 } })} rosto={{ ...ROSTO_BASE, olhos: 1.3, sobrancelha: -14, sobrancelhaY: 16, boca: 0.3, sorriso: -0.4 }} />
      </Palco>
      <Simbolo texto="!" x={360} y={540} f={f} de={trava} />
      <Som src="corte" de={6} volume={0.5} />
      <Som src="plim" de={trava} volume={0.4} />
    </AbsoluteFill>
  );
};

// S31 — coração dispara
export const S31: React.FC<P> = () => {
  const f = useCurrentFrame();
  const bate = 1 + Math.max(0, Math.sin(f * 0.9)) * 0.22;
  const bpm = Math.round(k(f, [[0, 90], [40, 190, CURVA.sai]]));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade cor="#3a1424" />
        <g transform={`translate(540 900) scale(${2.4 * bate})`}>
          <Coracao />
        </g>
        <path d={`M 0 1400 ${new Array(24).fill(0).map((_, i) => `L ${i * 50} ${1400 + ((i + Math.floor(f / 2)) % 6 === 0 ? -160 : (i + Math.floor(f / 2)) % 6 === 1 ? 90 : 0)}`).join(" ")}`} stroke="#ff6a7a" strokeWidth={10} fill="none" />
      </svg>
      <Placar titulo="BATIMENTOS" valor={`${bpm} bpm`} x={540} y={420} de={2} />
    </AbsoluteFill>
  );
};

// S32 — aura explode pra todo lado e some
export const S32: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const some = T("e some") - t0;
  const forca = f < some ? k(f, [[0, 0], [6, 1, CURVA.exagera]]) : k(f, [[some, 1], [some + 14, 0]]);
  const sh = f < some ? tremor(f, 10) : { x: 0, y: 0 };
  const pose = frente(1000, { agacha: 30, bracoE: { ombro: 40, cotovelo: -10 }, bracoD: { ombro: 40, cotovelo: -10 }, maoE: "aberta", maoD: "aberta", estica: 1 + Math.sin(f * 1.3) * 0.01 });
  return (
    <>
      <Palco cam={{ x: 1000 + sh.x, y: 980 + sh.y, zoom: 1.15 }}>
        <Arena camX={1000} tensao={1} />
        <AuraNen x={1000} f={f} forca={forca} caos={1} />
        {f < some ? <Faiscas x={1000} y={CHAO_Y - 500} f={f % 12} de={0} dur={12} cor="#7fe0ff" /> : null}
        <Boneco2D id="s32" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, olhos: 1.25, sobrancelha: -16, sobrancelhaY: 14, boca: 0.7, sorriso: -0.3 }, f, "s32")} />
      </Palco>
      <Som src="rumble" de={0} volume={0.5} />
      <Som src="whoosh" de={some} volume={0.4} />
    </>
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
        <Arena camX={1100} />
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
      <Arena camX={1300} />
      <Boneco2D id="s34d" d={DIEGO} pose={frente(1350, { vira: -0.5, bracoD: { ombro: 10, cotovelo: 10 } })} rosto={vivo({ ...ROSTO_DIEGO, olhos: 0.7, canto: 0, sorriso: -0.1, sobrancelha: 14, olhar: [-1, 0.7] }, f, "s34d", falaDe, falaAte)} naMao={<Espada escala={0.9} />} naMaoGira />
    </Palco>
  );
};

// S35 — lembra do avô
export const S35: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <Lembranca>
      <Palco cam={{ x: 560, y: 820, zoom: 1.7 }}>
        <Praca camX={600} />
        <Boneco2D id="s35" d={AVO} pose={frente(560, { vira: -0.2, bracoD: { ombro: 120, cotovelo: -40 }, maoD: "aponta", estica: 1 + respira(f) * 0.008 })} rosto={vivo({ ...ROSTO_AVO, sorriso: 0.7 }, f, "s35")} />
      </Palco>
    </Lembranca>
  );
};

// S36 — respiração lenta: 6 vs 12-20 por minuto
export const S36: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const lento = (Math.sin((f / 300) * Math.PI * 2 * 1.5) + 1) / 2;
  const rapido = (Math.sin((f / 30) * Math.PI * 2 * 0.8) + 1) / 2;
  const mostraRapido = f > T("em vez das") - t0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade />
        <g transform={`translate(${mostraRapido ? 300 : 540} 980)`}>
          <Pulmoes escala={mostraRapido ? 1.4 : 2} ar={lento} />
        </g>
        {mostraRapido ? (
          <g transform="translate(800 980)">
            <Pulmoes escala={1.4} ar={rapido} />
          </g>
        ) : null}
      </svg>
      <Rotulo2 texto="6 por minuto" x={mostraRapido ? 300 : 540} y={1420} de={T("umas seis") - t0} tamanho={66} />
      {mostraRapido ? <Rotulo2 texto="12 a 20" x={800} y={1420} de={T("em vez das") - t0} tamanho={66} cor="#ff8a8a" /> : null}
      <Rotulo2 texto="respira devagar" x={540} y={460} de={4} tamanho={80} cor="#fff" />
    </AbsoluteFill>
  );
};

// S37 — acalma o corpo, diminui o estresse
export const S37: React.FC<P> = () => {
  const f = useCurrentFrame();
  const nivel = k(f, [[10, 0.92], [90, 0.22, CURVA.suave]]);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade />
        <text x={540} y={560} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={70} fill="#fff">
          ESTRESSE
        </text>
        <rect x={190} y={640} width={700} height={110} rx={50} fill="#1d1424" />
        <rect x={205} y={655} width={670 * nivel} height={80} rx={40} fill={nivel > 0.6 ? "#e8343f" : nivel > 0.35 ? "#ff9b2f" : "#2e9b6a"} />
        <g transform="translate(540 1200)">
          <Coracao escala={1.6 * (1 + Math.max(0, Math.sin(f * (0.9 - 0.6 * (1 - nivel)))) * 0.12 * nivel)} cor="#ff6a7a" />
        </g>
      </svg>
      <Rotulo2 texto="vida real" x={540} y={400} de={2} tamanho={60} cor="#ffd23f" />
    </AbsoluteFill>
  );
};

// S38 — a aura se concentra no punho
export const S38: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const punho = T("no punho") - t0;
  const conc = k(f, [[20, 0], [punho, 1, CURVA.suave]]);
  const pose = frente(1000, { vira: 0.3, bracoD: { ombro: 40, cotovelo: -100 }, maoD: "punho", bracoE: { ombro: 16, cotovelo: -10 }, estica: 1 + respira(f) * 0.01 });
  const mx = 1000 + 150 * ESC + 40;
  const my = CHAO_Y - 560 * ESC;
  return (
    <>
      <Palco cam={{ x: 1000, y: k(f, [[0, 1000], [punho, 860]]), zoom: k(f, [[0, 1.05], [punho + 10, 1.6, CURVA.suave]]) }}>
        <Arena camX={1000} tensao={0} />
        <AuraNen x={1000} f={f} forca={(1 - conc) * 0.8} caos={0.1} />
        <Boneco2D id="s38" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, olhos: f < punho ? 0 : 0.85, sorriso: 0.2, sobrancelha: 10 }, f, "s38")} />
        <circle cx={mx} cy={my} r={60 + 120 * conc} fill="#7fe0ff" opacity={0.5 * conc} />
        <circle cx={mx} cy={my} r={40 + 50 * conc} fill="#e9fbff" opacity={0.8 * conc} />
        {conc > 0.1 ? <Brilhos x={mx} y={my} f={f} de={20} raio={160} cor="#bff2ff" /> : null}
      </Palco>
      <Som src="carga" de={20} volume={0.35} />
      <Som src="brilho" de={punho} volume={0.45} />
    </>
  );
};

// S39/S40 — Segundo round + contagem
export const S39: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Palco cam={{ x: 1100, y: 1040, zoom: 0.85 }}>
        <Arena camX={1100} />
        <Boneco2D id="s39l" d={LUCAS} pose={perfil(800, { agacha: 30, peE: { dx: -70, dy: 0 }, peD: { dx: 80, dy: 0 }, bracoD: { ombro: 40, cotovelo: 90 }, maoD: "punho", bracoE: { ombro: -20, cotovelo: 30 } })} rosto={vivo({ ...ROSTO_BASE, sobrancelha: 14, olhos: 0.8 }, f, "s39l")} />
        <circle cx={800 + 120} cy={CHAO_Y - 520} r={60} fill="#7fe0ff" opacity={0.45} />
        <Boneco2D id="s39d" d={DIEGO} pose={perfil(1400, { lado: -1, agacha: 30, bracoD: { ombro: 64, cotovelo: 64 }, bracoE: { ombro: 58, cotovelo: 70 } })} rosto={vivo({ ...ROSTO_DIEGO, sobrancelha: 16 }, f, "s39d")} naMao={<Espada escala={0.9} />} naMaoGira />
      </Palco>
    </>
  );
};

// S41 — um soco só
export const S41: React.FC<P> = () => {
  const f = useCurrentFrame();
  const x = k(f, [[0, 820], [5, 1180, CURVA.entra]]);
  const soco = perfil(x, { agacha: 60, inclina: 18, peE: { dx: -170, dy: 0 }, peD: { dx: 150, dy: 0 }, bracoD: { ombro: 92, cotovelo: 0 }, maoD: "punho", bracoE: { ombro: -50, cotovelo: 40 } });
  const inv = f === 5 || f === 7;
  return (
    <AbsoluteFill style={{ filter: inv ? "invert(1) contrast(1.4)" : undefined }}>
      <Palco cam={{ x: 1250, y: 960, zoom: k(f, [[0, 1.2], [5, 1.5, CURVA.sai]]) }}>
        <Arena camX={1250} />
        <Rastro x={x} y={CHAO_Y} dir={1} forca={f < 6 ? 1 : 0} f={f} cor="#bff2ff" />
        <Boneco2D id="s41d" d={DIEGO} pose={perfil(1420, { lado: -1, agacha: 30, inclina: f > 5 ? -20 : 0, bracoD: { ombro: 64, cotovelo: 64 } })} rosto={{ ...ROSTO_DIEGO, olhos: f > 5 ? 1.3 : 0.6, boca: f > 5 ? 0.8 : 0 }} naMao={<Espada escala={0.9} />} naMaoGira />
        <Boneco2D id="s41l" d={LUCAS} pose={soco} rosto={{ ...ROSTO_BASE, sobrancelha: 22, boca: 0.9, olhos: 0.7 }} />
        <Faiscas x={1330} y={CHAO_Y - 520} f={f} de={5} cor="#bff2ff" n={22} alcance={500} />
        <OndaChoque x={1330} y={CHAO_Y - 520} f={f} de={5} raio={700} />
        <Impacto x={1330} y={CHAO_Y - 520} f={f} de={5} dur={12} />
        <Onomatopeia texto="POW!" x={1300} y={CHAO_Y - 900} f={f} de={5} dur={24} tamanho={190} />
      </Palco>
      <Som src="whoosh" de={0} volume={0.5} />
      <Som src="explosao" de={5} volume={0.6} />
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
        <Arena camX={1800} />
        <Boneco2D id="s42d" d={DIEGO} pose={perfil(aterrissou ? 2600 : x, { lado: -1, y: aterrissou ? CHAO_Y : y, gira: aterrissou ? 0 : -f * 18, agacha: aterrissou ? 340 : 40, peE: aterrissou ? { dx: 240, dy: 0 } : { dx: -60, dy: -120 }, peD: aterrissou ? { dx: 290, dy: 0 } : { dx: 60, dy: -140 }, bracoE: { ombro: 120, cotovelo: 30 }, bracoD: { ombro: 140, cotovelo: 20 } })} rosto={{ ...ROSTO_DIEGO, olhos: 1.2, boca: 0.6, sobrancelhaY: 16 }} />
        <Poeira x={2600} y={CHAO_Y} f={f} de={40} largura={1.4} />
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
  const dsentado = perfil(1500, { lado: -1, agacha: 340, inclina: 6, peE: { dx: 240, dy: 0 }, peD: { dx: 290, dy: 0 }, bracoD: { ombro: 30 + 70 * Math.min(1, (f - aceita + 10) / 10), cotovelo: 0 }, bracoE: { ombro: 26, cotovelo: 26 } });
  const dpe = perfil(1340, { lado: -1, bracoD: { ombro: 80, cotovelo: 0 } });
  return (
    <Palco cam={{ x: 1250, y: 1000, zoom: 1.1 }}>
      <Arena camX={1800} />
      <Boneco2D id="s44l" d={LUCAS} pose={perfil(1020, { inclina: 12 * (1 - levanta), bracoD: { ombro: k(f, [[0, 10], [12, 80, CURVA.exagera]]), cotovelo: 0 }, maoD: "aberta" })} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.7 }, f, "s44l")} />
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
        <Arena camX={1800} />
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
      <Arena camX={1400} />
      <Boneco2D id="s46l" d={LUCAS} pose={frente(1020, { vira: 0.5, cabeca: -4 })} rosto={vivo({ ...ROSTO_BASE, olhos: 0.45, canto: 1, sorriso: 0.4, olhar: [1, 0] }, f, "s46l", falaDe, falaAte)} />
    </Palco>
  );
};

// S47 — moral: força sem controle é só barulho
export const S47: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const avo = T("Quem respira com calma", 1) - t0;
  return (
    <>
      <Palco cam={{ x: 1100, y: 1000, zoom: k(f, [[0, 0.75], [140, 0.85]]) }}>
        <Arena camX={1100} />
        <rect x={-2000} y={-1000} width={6000} height={4000} fill="#ff9b2f" opacity={0.25} />
        <Boneco2D id="s47l" d={LUCAS} pose={frente(900, { vira: 0.3, bracoD: { ombro: 40, cotovelo: -20 } })} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.7 }, f, "s47l")} />
        <Boneco2D id="s47d" d={DIEGO} pose={frente(1300, { vira: -0.3, cruzado: 1 })} rosto={vivo({ ...ROSTO_DIEGO, canto: 0.6 }, f, "s47d")} />
      </Palco>
      {f > avo ? (
        <AbsoluteFill style={{ opacity: interpolate(f, [avo, avo + 10], [0, 1], { extrapolateRight: "clamp" }) }}>
          <Lembranca>
            <Palco cam={{ x: 560, y: 820, zoom: 1.6 }}>
              <Praca camX={600} />
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
        <Boneco2D id="s48l" d={LUCAS} pose={frente(850, { vira: 0.3, bracoD: { ombro: 92, cotovelo: -30 }, maoD: "aponta" })} rosto={vivo({ ...ROSTO_BASE, sorriso: 1, boca: 0.4 }, f, "s48l")} />
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

