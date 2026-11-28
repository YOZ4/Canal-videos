/**
 * "E se você treinasse certo por 1 ano?" — cenas C01–C12 (roteiros/treino-1-ano-producao.md).
 * Tempos: segundos absolutos do roteiro (s); g = s*30 para os helpers de animação do canal.
 */
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, ROSTO_BASE, posCabeca, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { Brilhos, Gota, Impacto, Simbolo } from "../../estilo2d/Efeitos2D";
import { OndaChoque } from "../../estilo2d/EfeitosLuta";
import { CURVA, andarPerfil, k, respira, tremor } from "../../estilo2d/anim";
import { BIA, CONTORNO, DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Placar, Rotulo2, Selo } from "../../estilo2d/UI";
import { Palco, ROSTO_DIEGO, Som, vivo } from "../Cacadores/comum";
import { Academia, Barra2D, COR, CalendarioSemana, Coberta, FundoExplicacao, Lua, Prato, QuartoLucas, Relogio, Travesseiro } from "./cenario";
import { SupinoOrbita, pontosSupino } from "./supino3d";
import { S, T, TF } from "./tempo";

type P = { de: number };
const useT = (de: number) => {
  const f = useCurrentFrame();
  const s = (f + de) / 60;
  return { f, s, g: s * 30 };
};
/** segundos absolutos → frame local da cena (para Selo, Placar, Rotulo2, Som) */
const L = (sAbs: number, de: number) => Math.max(0, S(sAbs) - de);

const ESFORCO: Rosto = { ...ROSTO_BASE, olhos: 0.45, sobrancelha: 16, sobrancelhaY: -2, sorriso: -0.5, boca: 0.22 };
const DETERMINADO: Rosto = { ...ROSTO_BASE, sobrancelha: 14, sorriso: 0.35, canto: 0.4 };
const SURPRESO: Rosto = { ...ROSTO_BASE, olhos: 1.28, sobrancelha: -10, sobrancelhaY: 20, boca: 0.45, sorriso: 0 };
const ORGULHOSO: Rosto = { ...ROSTO_BASE, sobrancelha: 10, sorriso: 0.9, canto: 0.8, olhos: 0.85 };
const DORMINDO: Rosto = { ...ROSTO_BASE, olhos: 0, sorriso: 0.3, bochecha: 0.8 };
const DEBOCHE: Rosto = { ...ROSTO_DIEGO, olhos: 0.5, canto: 1, sorriso: 0.5, sobrancelhaY: 12 };
const RINDO: Rosto = { ...ROSTO_DIEGO, olhos: 0.2, canto: 0, sorriso: 1, boca: 0.9 };
const CANSADO: Rosto = { ...ROSTO_DIEGO, olhos: 0.45, sobrancelha: -14, sobrancelhaY: 6, sorriso: -0.4, canto: 0, olheiras: 1 };

const frente = (x: number, extra: Partial<Pose> = {}): Pose => ({ ...POSE_BASE, escala: 0.72, y: CHAO_Y, x, ...extra });

/** câmera fixa do gancho (C01 início = C12 fim = loop) */
const CAM_LOOP = (() => {
  const p = pontosSupino(18, 0.15).barra;
  return { x: p.x - 60, y: p.y + 40, zoom: 1.7 };
})();

/** pessoa deitada na cama (perfil girado -90°): âncora = pés */
const Deitado: React.FC<{ x: number; y: number; d: typeof LUCAS; musculo?: number; g: number; rosto: Rosto; id: string }> = ({ x, y, d, musculo = 0, g, rosto, id }) => (
  <g transform={`translate(${x} ${y}) rotate(-90)`}>
    <Boneco2D
      id={id}
      d={d}
      pose={{ ...PERFIL_BASE, x: 0, y: 0, escala: 0.62, musculo, cabeca: -4, estica: 1 + respira(g) * 0.015, bracoD: { ombro: 6, cotovelo: 8 }, bracoE: { ombro: 4, cotovelo: 6 }, peD: { dx: 8, dy: 0 }, peE: { dx: -4, dy: -6 } }}
      rosto={rosto}
    />
  </g>
);

const Zzz: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <>
    {[0, 1, 2].map((i) => {
      const t = ((g + i * 18) % 54) / 54;
      return (
        <text key={i} x={x + t * 110} y={y - t * 200} fontFamily="Fredoka" fontWeight={700} fontSize={56 + i * 14} fill="#ffffff" stroke={CONTORNO} strokeWidth={9} paintOrder="stroke" opacity={Math.sin(t * Math.PI)}>
          z
        </text>
      );
    })}
  </>
);

// =====================================================================
// C01 · 0.00–4.26 — gancho: barra vazia, braço tremendo (3D: meia órbita)
// =====================================================================
export const C01: React.FC<P> = ({ de }) => {
  const { s, g, f } = useT(de);
  const ligado = s >= 0.1;
  const yaw = k(s, [[0, 18], [2.2, 18], [4.1, 64, CURVA.suave]]);
  const zoom = k(s, [[0, 1.7], [2.2, 1.78], [4.1, 0.82, CURVA.suave]]);
  const sobe = k(s, [[0.1, 0.12], [4.2, 0.55, CURVA.suave]]);
  const pts = pontosSupino(yaw, sobe);
  const centroPlano = { x: pts.ancora.x - 330, y: pts.ancora.y - 160 };
  const t = k(s, [[2.2, 0], [4.1, 1, CURVA.suave]]);
  const cam = { x: CAM_LOOP.x + (centroPlano.x - CAM_LOOP.x) * t, y: CAM_LOOP.y + (centroPlano.y - CAM_LOOP.y) * t, zoom };
  const flash = interpolate(s, [0.1, 0.13, 0.4], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Palco cam={cam} parado>
        <SupinoOrbita
          f={g}
          cam={{ yaw, zoom: 1, x: 0, y: 0 }}
          sobe={sobe}
          treme={ligado ? 7 : 0}
          rosto={{ ...ESFORCO, olhos: ESFORCO.olhos * (Math.sin(g * 0.13) > 0.97 ? 0.2 : 1) }}
          noSuporte={!ligado}
          escura={ligado ? 0 : 0.6}
          extra={ligado ? <Gota x={pts.cabeca.x + 70} y={pts.cabeca.y - 90 + Math.min(60, Math.max(0, s - 3.6) * 60)} f={f} de={L(3.6, de)} escala={0.8} /> : null}
        />
      </Palco>
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
      <Som src="rangido" de={L(0.2, de)} volume={0.5} />
      <Som src="respiracao" de={L(2.6, de)} volume={0.55} />
      <Som src="plim" de={L(3.6, de)} volume={0.4} />
    </>
  );
};

// =====================================================================
// C02 · 4.26–7.24 — "Cachinho, isso aí é cabo de vassoura?" (contra-plongée)
// =====================================================================
export const C02: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  const ri = s >= 5.6;
  const vassoura = T("vassoura");
  const virou = s * 60 >= vassoura && s * 60 < vassoura + 6;
  const entra = k(s, [[4.26, 0], [4.7, 1, CURVA.exagera]]);
  const sacode = ri ? Math.sin(g * 1.4) * 3 : 0;
  const pose = frente(540, { escala: 1.3, y: 1980 + (1 - entra) * 700, cruzado: 1, inclina: sacode, cabeca: 14 + (ri ? Math.sin(g * 1.2) * 4 : 0), estica: 1 + (ri ? Math.abs(Math.sin(g * 1.4)) * 0.02 : 0) });
  const falaDe = T("Cachinho isso") / 2;
  const falaAte = TF("cabo de vassoura") / 2;
  const rosto = ri ? RINDO : { ...DEBOCHE, olhar: [0, 1] as [number, number] };
  const drift = Math.sin(g * 0.05) * 10;
  return (
    <>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* teto da academia visto de baixo */}
          <rect width={1080} height={1920} fill="#23273a" />
          <g transform={`translate(${drift * 0.4} 0)`}>
            {[260, 820].map((x) => (
              <g key={x}>
                <circle cx={x} cy={220} r={160} fill="#ffffff" opacity={0.08} />
                <rect x={x - 130} y={200} width={260} height={36} rx={18} fill="#f4f7ff" />
              </g>
            ))}
            <rect x={-100} y={420} width={1300} height={18} fill="#2f3448" />
          </g>
          <g transform={`translate(${drift} 0)`}>
            <Boneco2D id="c02d" d={DIEGO} pose={pose} rosto={vivo(rosto, g, "c02d", falaDe, falaAte)} />
          </g>
          {/* barra (ou vassoura!) e os punhos do Lucas em primeiro plano */}
          <Barra2D x={540} y={1560} comp={1240} vassoura={virou} escala={1} />
          {[300, 780].map((x) => (
            <g key={x}>
              <circle cx={x} cy={1560} r={62} fill={CONTORNO} />
              <circle cx={x} cy={1560} r={54} fill={LUCAS.pele} />
              <path d={`M ${x - 22} 1540 L ${x - 22} 1580 M ${x} 1538 L ${x} 1582 M ${x + 22} 1540 L ${x + 22} 1580`} stroke={CONTORNO} strokeWidth={5} />
            </g>
          ))}
        </svg>
      </AbsoluteFill>
      <Som src="risada" de={L(5.6, de)} volume={0.55} />
      <Som src="boing" de={Math.max(0, vassoura - de)} volume={0.6} />
    </>
  );
};

// =====================================================================
// C03 · 7.24–14.00 — 20 kg (3D) + montagem do Diego
// =====================================================================
const Barra20kg: React.FC<{ s: number }> = ({ s }) => {
  const a = (s - 7.24) * 160; // graus
  const c = Math.cos((a * Math.PI) / 180);
  const sn = Math.sin((a * Math.PI) / 180);
  const chega = k(s, [[7.24, 0], [7.9, 1, CURVA.exagera]]);
  const comp = 900;
  return (
    <g transform={`translate(540 860) scale(${0.25 + 0.75 * chega})`}>
      <ellipse cx={0} cy={260} rx={420} ry={50} fill="#000" opacity={0.35} />
      {/* barra girando em torno do eixo vertical */}
      <path d={`M ${-comp / 2 * c} ${-comp / 2 * sn * 0.2} L ${comp / 2 * c} ${comp / 2 * sn * 0.2}`} stroke={CONTORNO} strokeWidth={34} strokeLinecap="round" />
      <path d={`M ${-comp / 2 * c} ${-comp / 2 * sn * 0.2} L ${comp / 2 * c} ${comp / 2 * sn * 0.2}`} stroke="#c2c8d4" strokeWidth={20} strokeLinecap="round" />
      {[-1, 1].map((sg) => (
        <ellipse key={sg} cx={sg * (comp / 2 - 60) * c} cy={sg * (comp / 2 - 60) * sn * 0.2} rx={Math.max(8, 40 * Math.abs(sn))} ry={40} fill="#9aa1b0" stroke={CONTORNO} strokeWidth={6} />
      ))}
    </g>
  );
};

export const C03: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  const parte = s < 9.7 ? 0 : s < 10.5 ? 1 : s < 12.3 ? 2 : 3;
  const whip = interpolate(s, [13.75, 14.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <AbsoluteFill style={{ transform: `translateX(${-whip * 900}px)`, filter: whip > 0.05 ? `blur(${whip * 18}px)` : undefined }}>
        {parte === 0 ? (
          <>
            <svg width={1080} height={1920}>
              <Academia escura={0.45} />
              <circle cx={540} cy={860} r={520} fill="#fff6c2" opacity={0.08} />
              <Barra20kg s={s} />
            </svg>
            {/* "20 kg" em 3D (CSS: camadas empilhadas = volume dourado) */}
            <div style={{ position: "absolute", top: 470, width: "100%", display: "flex", justifyContent: "center", perspective: 900 }}>
              <div
                style={{
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transform: `translateZ(${k(s, [[7.5, -800], [8.2, 0, CURVA.exagera]])}px) rotateY(${Math.sin((s - 7.5) * 1.4) * 28}deg) rotateX(8deg)`,
                  opacity: s > 7.5 ? 1 : 0,
                }}
              >
                {new Array(14).fill(0).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: i === 0 ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                      transform: `translateZ(${-i * 3}px)`,
                      fontFamily: "Fredoka",
                      fontWeight: 700,
                      fontSize: 230,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      color: i === 0 ? "#ffd84a" : i < 13 ? "#c9961e" : "#1d1424",
                      WebkitTextStroke: i === 0 ? "6px #1d1424" : undefined,
                    }}
                  >
                    20 kg
                  </div>
                ))}
              </div>
            </div>
            <Placar titulo="A BARRA PESA" valor={`${Math.round(k(s, [[7.6, 0], [8.6, 20, CURVA.sai]]))} kg`} x={540} y={1150} de={L(7.6, de)} />
          </>
        ) : parte === 1 ? (
          <Palco cam={{ x: 330, y: 1180, zoom: 0.92 }} parado>
            <SupinoOrbita f={g} cam={{ yaw: 62, zoom: 1, x: 0, y: 0 }} sobe={0.5 + 0.5 * Math.sin(g * 0.45)} anilhas={4} d={DIEGO} rosto={{ ...ROSTO_DIEGO, canto: 1, sobrancelha: 10, olheiras: 0.3 }} />
          </Palco>
        ) : parte === 2 ? (
          <AbsoluteFill>
            <svg width={1080} height={1920}>
              <Academia escura={0.3} />
              <rect width={1080} height={1920} fill="#14304a" opacity={0.55} />
              <CalendarioSemana x={540} y={880} marcados={[0, 1, 2, 3, 4, 5, 6].filter((i) => s > 10.5 + i * 0.2)} cor="#e8343f" texto="PEITO" escala={1.65} />
              <Boneco2D id="c03p" d={DIEGO} pose={frente(540, { y: 1900, escala: 0.62, bracoD: { ombro: 92, cotovelo: 132 }, maoD: "punho", biceps: 0.6, vira: 0.2 })} rosto={{ ...ROSTO_DIEGO, canto: 1, olheiras: 0.4 }} />
            </svg>
          </AbsoluteFill>
        ) : (
          <Palco cam={{ x: 560, y: 900, zoom: 1.4 }}>
            <Academia escura={0.25} />
            <Boneco2D id="c03b" d={DIEGO} pose={frente(470, { cabeca: -8, bracoD: { ombro: 150, cotovelo: 20 }, maoD: "aberta", estica: 1 + Math.max(0, Math.sin((s - 12.3) * 2)) * 0.03 })} rosto={vivo(s < 13.3 ? { ...CANSADO, olhos: 0, boca: 1, sorriso: 0 } : CANSADO, g, "c03b")} />
            <Relogio x={860} y={560} r={110} horas={5} />
          </Palco>
        )}
      </AbsoluteFill>
      <Selo texto="PEITO: TODO DIA" de={L(10.3, de)} ate={L(12.25, de)} cor="#e8343f" y={250} />
      <Selo texto="SONO: 5 h" de={L(12.3, de)} ate={L(13.95, de)} cor="#3d3463" y={250} />
      <Som src="clang" de={L(7.6, de)} volume={0.5} />
      <Som src="anilhas" de={L(9.7, de)} volume={0.5} />
      <Som src="bocejo" de={L(12.3, de)} volume={0.6} />
      <Som src="tique" de={L(12.4, de)} volume={0.35} />
      <Som src="whoosh" de={L(13.75, de)} volume={0.5} />
    </>
  );
};

// =====================================================================
// C04 · 14.00–18.70 — o plano: 3 treinos, comida de verdade, cama cedo
// =====================================================================
export const C04: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  const pop = (t0: number) => k(s, [[t0, 0], [t0 + 0.3, 1, CURVA.exagera]]);
  const soco = k(s, [[17.95, 0], [18.15, 1, CURVA.antecipaExagera]]);
  const pose = frente(540, {
    y: 1650,
    escala: 0.68,
    bracoE: { ombro: 20 + 22 * soco, cotovelo: -20 - 90 * soco },
    maoE: soco > 0.5 ? "aberta" : "punho",
    bracoD: { ombro: 22 + 30 * soco, cotovelo: -30 - 96 * soco },
    maoD: "punho",
    estica: 1 + respira(g) * 0.01,
  });
  const imp = s >= 18.15 && s < 18.4 ? tremor(Math.floor(g), 6) : { x: 0, y: 0 };
  return (
    <>
      <Palco cam={{ x: 540 + imp.x, y: 980 + imp.y, zoom: k(s, [[14, 1.0], [18.7, 1.08]]) }}>
        <QuartoLucas noite={0} semCalendario />
        <g transform={`translate(540 500) scale(${pop(14.9) * 0.78})`}>
          <CalendarioSemana x={0} y={0} marcados={[0, 2, 4]} />
        </g>
        <g transform={`translate(230 830) scale(${pop(16.4) * 0.9})`}>
          <Prato x={0} y={0} />
        </g>
        <g transform={`translate(860 830) scale(${pop(17.9) * 0.85})`}>
          <Travesseiro x={0} y={0} />
        </g>
        <Boneco2D id="c04" d={LUCAS} pose={pose} rosto={vivo(DETERMINADO, g, "c04")} />
        {soco > 0.9 && s < 18.5 ? <Impacto x={540 + 20} y={1650 - 560 * 0.68} f={Math.round(g)} de={Math.round(18.15 * 30)} dur={10} /> : null}
      </Palco>
      <Rotulo2 texto="3 TREINOS/SEMANA" x={540} y={330} de={L(14.9, de)} tamanho={56} />
      <Rotulo2 texto="COMIDA DE VERDADE" x={250} y={1010} de={L(16.4, de)} tamanho={44} cor="#ffffff" />
      <Rotulo2 texto="CAMA CEDO" x={850} y={1010} de={L(17.9, de)} tamanho={44} cor="#ffffff" />
      <Som src="pop" de={L(14.9, de)} volume={0.5} />
      <Som src="pop" de={L(16.4, de)} volume={0.5} />
      <Som src="pop" de={L(17.9, de)} volume={0.5} />
      <Som src="impacto" de={L(18.15, de)} volume={0.3} />
    </>
  );
};

// =====================================================================
// C05 · 18.70–26.20 — escalada 1: 2 semanas; espelho; "força de mentirinha"
// =====================================================================
export const C05: React.FC<P> = ({ de }) => {
  const { s, g, f } = useT(de);
  if (s < 21.6) {
    const entra = k(s, [[19.0, 0], [19.5, 1, CURVA.sai]]);
    const sobe = s < 19.6 ? 0.95 : 0.55 + 0.45 * Math.sin((s - 19.6) * 3.2 + Math.PI / 2);
    return (
      <>
        <Palco cam={{ x: 300, y: 1150, zoom: 0.95 }} parado>
          <SupinoOrbita f={g} cam={{ yaw: 34, zoom: 1, x: 0, y: 0 }} sobe={sobe} anilhas={s >= 19.0 ? 1 : 0} anilhaEntra={entra} rosto={vivo(DETERMINADO, g, "c05a")} />
        </Palco>
        <Selo texto="2 SEMANAS" de={L(18.8, de)} ate={L(21.5, de)} cor="#2f6fd6" />
        <Rotulo2 texto="+ PESO ↑" x={760} y={560} de={L(20.0, de)} tamanho={84} cor="#5fe08a" />
        <Som src="encaixe" de={L(19.4, de)} volume={0.5} />
      </>
    );
  }
  // espelho
  const diegoEntra = k(s, [[23.5, 0], [24.0, 1, CURVA.exagera]]);
  const cam = { x: k(s, [[21.6, 540], [23.5, 540], [24.0, 640, CURVA.suave]]), y: 980, zoom: k(s, [[21.6, 1.05], [23.4, 1.15]]) };
  const falaDe = T("Força de") / 2;
  const falaAte = TF("de mentirinha") / 2;
  return (
    <>
      <Palco cam={cam}>
        <Academia />
        {/* reflexo no espelho (mesmo corpo, magrinho) */}
        <g opacity={0.82}>
          <Boneco2D id="c05r" d={LUCAS} pose={frente(700, { y: CHAO_Y - 300, escala: 0.55, bracoD: { ombro: 40, cotovelo: -40 } })} rosto={vivo(s > 22.0 ? SURPRESO : ROSTO_BASE, g, "c05r")} />
          <rect x={440} y={460} width={520} height={760} fill="#a9c6d8" opacity={0.18} />
        </g>
        {/* Lucas de costas, olhando o espelho */}
        <Boneco2D id="c05c" d={LUCAS} pose={frente(320, { vista: "costas", y: 1880, escala: 0.82, bracoE: { ombro: 40, cotovelo: -40 }, estica: 1 + respira(g) * 0.01 })} rosto={ROSTO_BASE} />
        {s > 23.5 ? <Boneco2D id="c05d" d={DIEGO} pose={frente(1080 - (1 - diegoEntra) * 500, { y: 1780, escala: 0.72, cruzado: 1, vira: -0.4, cabeca: -6 })} rosto={vivo(s > 24.6 ? RINDO : DEBOCHE, g, "c05d", falaDe, falaAte)} /> : null}
      </Palco>
      <Simbolo2 f={f} de={L(22.0, de)} />
      <Som src="grilo" de={L(22.5, de)} volume={0.5} />
      <Som src="risada" de={L(24.0, de)} volume={0.5} />
    </>
  );
};
const Simbolo2: React.FC<{ f: number; de: number }> = ({ f, de }) =>
  f >= de && f < de + 60 ? (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Simbolo texto="?" x={860} y={480} f={f} de={de} cor="#ffffff" />
      </svg>
    </AbsoluteFill>
  ) : null;

// =====================================================================
// C06 · 26.20–32.40 — 2 meses: Lucas dorme; post do Diego às 02:00
// =====================================================================
const CelularPost: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={-170} y={-320} width={340} height={640} rx={40} fill="#1a1824" stroke={CONTORNO} strokeWidth={10} />
    <clipPath id="telaPost">
      <rect x={-150} y={-290} width={300} height={580} rx={18} />
    </clipPath>
    <g clipPath="url(#telaPost)">
      <rect x={-150} y={-290} width={300} height={580} fill="#f3f0f8" />
      <rect x={-150} y={-290} width={300} height={60} fill="#ffffff" />
      <circle cx={-110} cy={-260} r={18} fill={DIEGO.camisa} />
      <text x={-82} y={-252} fontFamily="Fredoka" fontWeight={700} fontSize={22} fill="#1d1424">
        topete_fit
      </text>
      <text x={120} y={-252} textAnchor="end" fontFamily="Fredoka" fontWeight={700} fontSize={22} fill="#e8343f">
        02:00
      </text>
      <g transform="translate(-150 -230)">
        <rect width={300} height={320} fill={COR.parede} />
        <rect y={230} width={300} height={90} fill={COR.piso} />
        <rect y={200} width={300} height={12} fill={COR.faixa} />
        <Boneco2D id="c06d" d={DIEGO} pose={{ ...POSE_BASE, x: 150, y: 312, escala: 0.25, bracoD: { ombro: 150, cotovelo: 20 + Math.sin(g * 0.4) * 10 }, maoD: "punho", bracoE: { ombro: 150, cotovelo: 20 }, maoE: "punho" }} rosto={CANSADO} />
      </g>
      <text x={-135} y={140} fontFamily="Fredoka" fontWeight={700} fontSize={26} fill="#1d1424">
        Descanso é pra fraco.
      </text>
      <text x={-135} y={180} fontFamily="Fredoka" fontWeight={700} fontSize={22} fill="#8a8698">
        ♥ 3 curtidas
      </text>
    </g>
  </g>
);

export const C06: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  const push = k(s, [[28.3, 0], [29.3, 1, CURVA.suave]]);
  const cam = { x: 540 + 260 * push, y: 1040 + 140 * push, zoom: 1 + 0.9 * push };
  return (
    <>
      <Palco cam={cam}>
        <QuartoLucas noite={1} />
        <Deitado x={1000} y={CHAO_Y - 250 - 62} d={LUCAS} g={g} rosto={DORMINDO} id="c06l" />
        <Coberta x={0} respira={respira(g)} />
        <Zzz x={330} y={1080} g={g} />
        {/* criado-mudo com o celular */}
        <rect x={700} y={CHAO_Y - 300} width={330} height={300} rx={14} fill="#5c4170" stroke={CONTORNO} strokeWidth={7} />
        <g transform={`translate(860 ${CHAO_Y - 360}) scale(0.55) rotate(${-4 + push * 4})`}>
          <circle r={420} fill="#9fd0ff" opacity={0.12 + 0.1 * push} />
          <CelularPost g={g} />
        </g>
      </Palco>
      <Selo texto="2 MESES" de={L(26.3, de)} ate={L(28.2, de)} cor="#7d5bd6" />
      <Som src="ronco-leve" de={L(26.4, de)} volume={0.5} />
      <Som src="notificacao" de={L(28.3, de)} volume={0.6} />
    </>
  );
};

// =====================================================================
// C07 · 32.40–39.10 — 6 meses: a camiseta aperta; o Diego empacou
// =====================================================================
export const C07: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  const olham = s >= 38.4;
  const puxa = Math.max(0, Math.sin((s - 32.6) * 2.4));
  const snap = k(s, [[38.4, 1], [38.55, 1.38, CURVA.sai]]);
  const lucas = frente(380, {
    escala: 0.74,
    musculo: 0.45,
    vira: olham ? 0 : 0.35,
    bracoE: { ombro: 30 + 8 * puxa, cotovelo: -112 + 10 * puxa },
    bracoD: { ombro: 30 + 8 * puxa, cotovelo: -112 + 10 * puxa },
    maoE: "punho",
    maoD: "punho",
    estica: 1 + respira(g) * 0.01,
  });
  const diego = frente(820, { escala: 0.72, inclina: 9, cabeca: olham ? 4 : 16, vira: olham ? 0 : -0.35, bracoE: { ombro: 8, cotovelo: -4 }, bracoD: { ombro: 8, cotovelo: -4 }, estica: 0.98 + respira(g, 30) * 0.006 });
  const azul = interpolate(s, [38.8, 39.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Palco cam={{ x: 600, y: k(s, [[38.4, 1040], [38.55, 860]]), zoom: snap }}>
        <Academia />
        <Boneco2D id="c07l" d={LUCAS} pose={lucas} rosto={vivo(olham ? SURPRESO : ORGULHOSO, g, "c07l")} />
        <Boneco2D id="c07d" d={DIEGO} pose={diego} rosto={vivo(olham ? { ...SURPRESO, olheiras: 1, sobrancelhaY: 10 } : CANSADO, g, "c07d")} />
        {!olham ? <Gota x={posCabeca(diego)[0] + 120} y={posCabeca(diego)[1] - 60} f={Math.round(g)} de={Math.round(35.5 * 30)} escala={0.7} /> : null}
      </Palco>
      <AbsoluteFill style={{ background: "#081422", opacity: azul }} />
      <Selo texto="6 MESES" de={L(32.5, de)} ate={L(38.3, de)} cor="#ff9b2f" />
      <Rotulo2 texto="COMO ASSIM?" x={540} y={420} de={L(38.4, de)} tamanho={120} />
      <Som src="tecido" de={L(33.5, de)} volume={0.6} />
      <Som src="scratch" de={L(38.4, de)} volume={0.6} />
    </>
  );
};

// =====================================================================
// C08 · 39.10–48.10 — explicação 1: o cérebro aprende a ligar mais fibras
// =====================================================================
const Cerebro: React.FC<{ g: number; brilho: number }> = ({ g, brilho }) => {
  const gira = Math.cos(g * 0.03);
  return (
    <g transform={`scale(${0.85 + 0.15 * Math.abs(gira)} 1)`}>
      <circle r={300} fill="#ffd84a" opacity={0.12 * brilho} />
      <path d="M -200 20 Q -230 -120 -120 -170 Q -60 -230 20 -200 Q 120 -240 190 -150 Q 260 -80 220 20 Q 240 110 160 150 Q 90 200 0 170 Q -90 200 -160 140 Q -230 100 -200 20 Z" fill="#f2a6b8" stroke={CONTORNO} strokeWidth={10} />
      {["M -150 -60 Q -100 -110 -40 -80", "M -170 40 Q -110 0 -60 40 Q -20 80 30 40", "M 40 -150 Q 60 -80 20 -30", "M 80 -60 Q 150 -90 180 -20", "M 70 60 Q 130 30 170 90", "M -80 120 Q -40 90 0 130"].map((p, i) => (
        <path key={i} d={p} stroke="#c77a8f" strokeWidth={10} fill="none" strokeLinecap="round" />
      ))}
      <path d="M 0 -200 Q -10 0 0 170" stroke="#c77a8f" strokeWidth={8} fill="none" />
    </g>
  );
};

export const C08: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  const camY = k(s, [[39.1, 700], [42.9, 700], [44.0, 1250, CURVA.suave]]);
  const tLiga = T("ligar mais fibras") / 60;
  const acesas = Math.min(6, 2 + Math.floor(Math.max(0, s - tLiga) / 0.45));
  const balanca = s >= 45.9;
  const incl = balanca ? k(s, [[45.9, 0], [46.6, 14, CURVA.exagera]]) : 0;
  return (
    <>
      <Palco cam={{ x: 540, y: camY, zoom: 1 }} parado>
        <FundoExplicacao />
        <g transform="translate(540 600)">
          <Cerebro g={g} brilho={0.6 + 0.4 * Math.sin(g * 0.2)} />
        </g>
        {/* fio até as fibras */}
        <path d="M 540 780 Q 560 1000 540 1180" stroke="#5fc8ff" strokeWidth={10} fill="none" opacity={0.6} />
        {s > 42.9
          ? [0, 1, 2].map((i) => {
              const t = ((g * 0.06 + i / 3) % 1);
              return <circle key={i} cx={540 + Math.sin(t * Math.PI) * 18} cy={780 + t * 400} r={18} fill="#ffe680" />;
            })
          : null}
        {!balanca ? (
          <g transform="translate(540 1400)">
            {new Array(6).fill(0).map((_, i) => {
              const on = i < acesas;
              const y = -150 + i * 60;
              return (
                <g key={i}>
                  {on ? <rect x={-330} y={y - 34} width={660} height={68} rx={34} fill="#ffd84a" opacity={0.35} /> : null}
                  <rect x={-300} y={y - 22} width={600} height={44} rx={22} fill={on ? "#ffd84a" : "#d9535f"} stroke={CONTORNO} strokeWidth={6} />
                  <ellipse cx={300} cy={y} rx={10} ry={22} fill={on ? "#fff3b0" : "#a93844"} stroke={CONTORNO} strokeWidth={5} />
                </g>
              );
            })}
          </g>
        ) : (
          <g transform="translate(540 1380)">
            <rect x={-12} y={-40} width={24} height={300} fill="#c2c8d4" stroke={CONTORNO} strokeWidth={6} />
            <path d="M -110 260 L 110 260 L 60 210 L -60 210 Z" fill="#9aa1b0" stroke={CONTORNO} strokeWidth={6} />
            <g transform={`rotate(${-incl})`}>
              <rect x={-360} y={-52} width={720} height={22} rx={11} fill="#c2c8d4" stroke={CONTORNO} strokeWidth={6} />
              {[-1, 1].map((sd) => (
                <g key={sd} transform={`translate(${sd * 320} -40) rotate(${incl})`}>
                  <line x1={0} y1={0} x2={0} y2={120} stroke="#c2c8d4" strokeWidth={6} />
                  <path d="M -110 120 L 110 120 Q 90 170 0 170 Q -90 170 -110 120 Z" fill={sd < 0 ? "#ffd84a" : "#7d8aa0"} stroke={CONTORNO} strokeWidth={6} />
                  <text x={0} y={240} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={50} fill="#fff" stroke={CONTORNO} strokeWidth={9} paintOrder="stroke">
                    {sd < 0 ? "FORÇA" : "TAMANHO"}
                  </text>
                </g>
              ))}
            </g>
          </g>
        )}
      </Palco>
      {s < 42.8 ? <Rotulo2 texto="O CÉREBRO APRENDE" x={540} y={260} de={L(40.3, de)} tamanho={72} /> : null}
      {s > 43.0 && !balanca ? <Placar titulo="FIBRAS LIGADAS" valor={`${acesas}`} x={540} y={330} de={L(43.0, de)} /> : null}
      {balanca ? <Rotulo2 texto="FORÇA ANTES DO TAMANHO" x={540} y={330} de={L(45.9, de)} tamanho={66} /> : null}
      {new Array(4).fill(0).map((_, i) => (
        <Som key={i} src="zap" de={Math.max(0, S(tLiga + i * 0.45) - de)} volume={0.45} />
      ))}
    </>
  );
};

// =====================================================================
// C09 · 48.10–58.88 — explicação 2: o músculo cresce depois (gráfico 3D)
// =====================================================================
export const C09: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  const desenha = k(s, [[T("ele cresce depois") / 60, 0], [51.6, 1, CURVA.suave]]);
  const corta = k(s, [[56.6, 0], [57.1, 1, CURVA.exagera]]);
  const lua = k(s, [[T("uma única noite") / 60, 0], [T("uma única noite") / 60 + 0.3, 1, CURVA.exagera]]);
  const zoom = k(s, [[55.0, 1], [55.8, 1.25, CURVA.suave]]);
  // curva: 0 h → pico em 24 h → cai até 36 h
  const W = 760;
  const H = 520;
  const pt = (h: number, mult = 1) => {
    const base = 0.25;
    const v = h <= 24 ? base + (1 - base) * Math.sin((h / 24) * (Math.PI / 2)) ** 1.6 : 1 - ((h - 24) / 12) * 0.45;
    const val = h <= 2 ? base : base + (v - base) * mult;
    return [(-W / 2) + (h / 36) * W, H / 2 - val * H] as [number, number];
  };
  const caminho = (mult: number, ate: number) => {
    const n = 60;
    const pts = [];
    for (let i = 0; i <= n * ate; i++) pts.push(pt((i / n) * 36, mult));
    return pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  };
  const mult = 1 - 0.18 * corta;
  return (
    <>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <FundoExplicacao />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ perspective: 1200, transform: `scale(${zoom})`, transformOrigin: "62% 42%" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "rotateX(16deg) rotateY(-14deg)", transformStyle: "preserve-3d" }}>
          <svg width={1080} height={1920}>
            <g transform="translate(560 900)">
              <rect x={-W / 2 - 40} y={-H / 2 - 40} width={W + 80} height={H + 80} rx={24} fill="#0d2238" stroke="#2c5a82" strokeWidth={6} />
              {[0, 12, 24, 36].map((h) => (
                <g key={h}>
                  <line x1={-W / 2 + (h / 36) * W} y1={-H / 2} x2={-W / 2 + (h / 36) * W} y2={H / 2} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={3} />
                  <text x={-W / 2 + (h / 36) * W} y={H / 2 + 60} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={40} fill="#cfe3f5">
                    {h} h
                  </text>
                </g>
              ))}
              <line x1={-W / 2} y1={H / 2} x2={W / 2} y2={H / 2} stroke="#cfe3f5" strokeWidth={6} />
              {/* linha com volume: cópias deslocadas = espessura 3D */}
              {[10, 8, 6, 4, 2].map((o) => (
                <path key={o} d={caminho(mult, desenha)} transform={`translate(${o} ${o})`} stroke={corta > 0.1 ? "#7a1e28" : "#8a6a12"} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              <path d={caminho(mult, desenha)} stroke={corta > 0.1 ? "#ff5a64" : "#ffd84a"} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {corta > 0 ? <path d={caminho(1, 1)} stroke="#ffd84a" strokeWidth={6} strokeDasharray="14 14" fill="none" opacity={0.6} /> : null}
              {desenha > 0.66 ? <circle cx={pt(24, mult)[0]} cy={pt(24, mult)[1]} r={18 + 4 * Math.sin(g * 0.3)} fill="#fff" /> : null}
            </g>
          </svg>
        </div>
      </AbsoluteFill>
      {lua > 0 ? (
        <AbsoluteFill>
          <svg width={1080} height={1920}>
            <g transform={`translate(820 520) scale(${lua})`}>
              <Lua x={0} y={0} r={90} riscada={k(s, [[T("sem dormir") / 60, 0], [T("sem dormir") / 60 + 0.3, 1]])} />
            </g>
          </svg>
        </AbsoluteFill>
      ) : null}
      <Rotulo2 texto="CONSTRUÇÃO DE MÚSCULO" x={540} y={330} de={L(48.3, de)} tamanho={58} cor="#ffffff" />
      <Rotulo2 texto="+109% EM 24 h" x={560} y={1440} de={L(51.6, de)} tamanho={92} />
      <Rotulo2 texto="SEM DORMIR: −18%" x={560} y={1560} de={L(56.6, de)} tamanho={80} cor="#ff6a74" />
      <Som src="whoosh" de={L(51.6, de)} volume={0.5} />
      <Som src="buzina" de={L(56.6, de)} volume={0.5} />
    </>
  );
};

// =====================================================================
// C10 · 58.88–64.40 — analogia: o treino quebra, o descanso reconstrói maior
// =====================================================================
const Tijolo: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; esc?: number }> = ({ x, y, w, h, rot = 0, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${esc})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#c8643f" stroke={CONTORNO} strokeWidth={5} />
    <rect x={-w / 2 + 8} y={-h / 2 + 6} width={w - 16} height={8} rx={4} fill="#e08a63" />
  </g>
);

export const C10: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  const HIT = 60.4;
  const REC = 62.0;
  const marreta = k(s, [[59.6, 0], [60.15, -0.35, CURVA.sai], [HIT, 1, CURVA.entra], [60.9, 0.9]]);
  const zoom = k(s, [[62.5, 1], [64.2, 0.84, CURVA.suave]]);
  // parede antes: 5 colunas x 6 linhas; depois: 6 x 8 (maior)
  const antes = { cols: 5, rows: 6, w: 120, h: 56 };
  const depois = { cols: 6, rows: 8, w: 128, h: 60 };
  const base = 1450;
  const tijolos: React.ReactNode[] = [];
  const n = depois.cols * depois.rows;
  for (let i = 0; i < n; i++) {
    const r0 = Math.floor(i / antes.cols);
    const c0 = i % antes.cols;
    const existeAntes = r0 < antes.rows;
    const x0 = 540 + (c0 - (antes.cols - 1) / 2) * antes.w + (r0 % 2 ? antes.w / 2 : 0) - antes.w / 4;
    const y0 = base - r0 * antes.h;
    const r1 = Math.floor(i / depois.cols);
    const c1 = i % depois.cols;
    const x1 = 540 + (c1 - (depois.cols - 1) / 2) * depois.w + (r1 % 2 ? depois.w / 2 : 0) - depois.w / 4;
    const y1 = base - r1 * depois.h;
    // voo após o golpe
    const tv = Math.max(0, s - HIT);
    const ang = (random(`ta${i}`) - 0.5) * Math.PI * 0.9 - Math.PI / 2;
    const v = 600 + random(`tv${i}`) * 700;
    const xv = x0 + Math.cos(ang) * v * tv - 300 * tv;
    const yv = Math.min(1700, y0 + Math.sin(ang) * v * tv + 1400 * tv * tv);
    const zEsc = 1 + (random(`tz${i}`) - 0.3) * 0.6 * Math.min(1, tv * 2);
    const volta = k(s, [[REC + random(`tr${i}`) * 0.5, 0], [REC + 0.35 + random(`tr${i}`) * 0.5, 1, CURVA.exagera]]);
    let x: number, y: number, rot: number, esc: number, w: number, h: number;
    if (s < HIT) {
      if (!existeAntes) continue;
      [x, y, rot, esc, w, h] = [x0, y0, 0, 1, antes.w - 6, antes.h - 6];
    } else if (s < REC || volta === 0) {
      if (!existeAntes) continue;
      [x, y, rot, esc, w, h] = [xv, yv, tv * 360 * (random(`tg${i}`) - 0.5), zEsc, antes.w - 6, antes.h - 6];
    } else {
      const sx = existeAntes ? xv : 540 + (random(`nx${i}`) - 0.5) * 1400;
      const sy = existeAntes ? yv : -200;
      [x, y, rot, esc, w, h] = [sx + (x1 - sx) * volta, sy + (y1 - sy) * volta, (1 - volta) * 200, 1, depois.w - 6, depois.h - 6];
    }
    tijolos.push(<Tijolo key={i} x={x} y={y} w={w} h={h} rot={rot} esc={esc} />);
  }
  return (
    <>
      <Palco cam={{ x: 540, y: 1150, zoom }} parado>
        <defs>
          <linearGradient id="roxoC10" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={COR.tijoloA} />
            <stop offset="1" stopColor={COR.tijoloB} />
          </linearGradient>
        </defs>
        <rect x={-1000} y={-1000} width={3000} height={4000} fill="url(#roxoC10)" />
        <rect x={-1000} y={base + 30} width={3000} height={1000} fill="#140b26" />
        {tijolos}
        {/* marreta TREINO */}
        {s < 61.4 ? (
          <g transform={`translate(860 ${base - 120}) rotate(${-80 + marreta * 80})`}>
            <rect x={-14} y={-420} width={28} height={420} rx={10} fill="#8a5a30" stroke={CONTORNO} strokeWidth={6} />
            <rect x={-90} y={-500} width={180} height={110} rx={14} fill="#6a6f80" stroke={CONTORNO} strokeWidth={8} />
            <text x={0} y={-430} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={38} fill="#fff">
              TREINO
            </text>
          </g>
        ) : null}
        {s >= HIT && s < HIT + 0.4 ? <OndaChoque x={700} y={base - 120} f={Math.round(g)} de={Math.round(HIT * 30)} dur={12} raio={500} /> : null}
        {/* capacete DESCANSO */}
        {s >= REC - 0.2 ? (
          <g transform={`translate(540 ${base - depois.rows * depois.h - 140}) scale(${k(s, [[REC - 0.2, 0], [REC + 0.1, 1, CURVA.exagera]])})`}>
            <path d="M -120 40 Q -120 -90 0 -100 Q 120 -90 120 40 Z" fill="#ffd84a" stroke={CONTORNO} strokeWidth={8} />
            <rect x={-150} y={30} width={300} height={30} rx={14} fill="#f2c12e" stroke={CONTORNO} strokeWidth={8} />
            <text x={0} y={-10} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={34} fill={CONTORNO}>
              DESCANSO
            </text>
          </g>
        ) : null}
        {s > REC + 0.8 ? <Brilhos x={540} y={base - 260} f={Math.round(g)} de={Math.round((REC + 0.8) * 30)} raio={420} /> : null}
      </Palco>
      <Rotulo2 texto="TREINO QUEBRA" x={540} y={420} de={L(HIT, de)} tamanho={80} cor="#ff6a74" />
      <Rotulo2 texto="DESCANSO RECONSTRÓI… MAIOR" x={540} y={540} de={L(REC, de)} tamanho={58} />
      <Som src="marreta" de={L(HIT, de)} volume={0.6} />
      <Som src="encaixe" de={L(REC + 0.1, de)} volume={0.5} />
      <Som src="encaixe" de={L(REC + 0.5, de)} volume={0.5} />
      <Som src="ding" de={L(REC + 0.9, de)} volume={0.4} />
    </>
  );
};

// =====================================================================
// C11 · 64.40–71.95 — 1 ano depois: 80 kg; a Bia; o Diego mudo
// =====================================================================
export const C11: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  if (s < 70.7) {
    const yaw = k(s, [[64.4, 18], [66.6, 64, CURVA.suave]]);
    const zoom = k(s, [[64.4, 1.7], [66.6, 0.82, CURVA.suave]]);
    const sobe = 0.55 + 0.45 * Math.sin((s - 64.4) * 2.2 + Math.PI / 2);
    const pts = pontosSupino(yaw, sobe);
    const t = k(s, [[64.4, 0], [66.6, 1, CURVA.suave]]);
    const plano = { x: pts.ancora.x - 330 + 120 * k(s, [[67.4, 0], [68.2, 1, CURVA.suave]]), y: pts.ancora.y - 160 };
    const cam = { x: CAM_LOOP.x + (plano.x - CAM_LOOP.x) * t, y: CAM_LOOP.y + (plano.y - CAM_LOOP.y) * t, zoom };
    // Bia: entra andando de perfil (da direita), para e vira 3/4
    const BX0 = 1300;
    const BX1 = 790;
    const anda = s >= 67.4 && s < 68.3;
    const bx = k(s, [[67.4, BX0], [68.3, BX1, CURVA.sai]]);
    const w = andarPerfil(g, anda ? 1 : 0);
    const falaDe = T("Esse aí") / 2;
    const falaAte = TF("Capitão América") / 2;
    const bia: Pose =
      s < 68.3
        ? { ...PERFIL_BASE, lado: -1, escala: 0.64, x: bx, y: 1500 - (anda ? w.bob * 0.4 : 0), peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: w.bracoD }
        : { ...POSE_BASE, escala: 0.64, x: BX1, y: 1500, vira: -0.5, bracoD: { ombro: 40, cotovelo: -120 }, maoD: "aberta", cabeca: -4 };
    return (
      <>
        <Palco cam={cam} parado>
          <SupinoOrbita
            f={g}
            cam={{ yaw, zoom: 1, x: 0, y: 0 }}
            sobe={sobe}
            anilhas={4}
            musculo={1}
            rosto={vivo(ORGULHOSO, g, "c11l")}
            extra={s >= 67.4 ? <Boneco2D id="c11b" d={BIA} pose={bia} rosto={vivo({ ...ROSTO_BASE, olhos: 1.18, sorriso: 0.7, sobrancelhaY: 12, olhar: [-1, 0.3] }, g, "c11b", falaDe, falaAte)} /> : null}
          />
        </Palco>
        <Selo texto="1 ANO DEPOIS" de={L(64.5, de)} ate={L(67.3, de)} cor="#ff9b2f" />
        <Placar titulo="NA BARRA" valor={`${Math.round(k(s, [[65.8, 20], [66.8, 80, CURVA.sai]]))} kg`} x={540} y={360} de={L(65.8, de)} ate={L(67.3, de)} />
        <Som src="anilhas" de={L(65.8, de)} volume={0.55} />
        <Som src="clang" de={L(66.0, de)} volume={0.45} />
        <Som src="uau" de={L(69.1, de)} volume={0.35} />
      </>
    );
  }
  // Diego mudo
  return (
    <>
      <Palco cam={{ x: 540, y: 760, zoom: 1.75 }}>
        <Academia />
        <Boneco2D id="c11d" d={DIEGO} pose={frente(540, { cabeca: 3, bracoE: { ombro: 8, cotovelo: -4 }, bracoD: { ombro: 8, cotovelo: -4 } })} rosto={vivo({ ...ROSTO_DIEGO, olhos: 1.2, boca: 0.85, sorriso: 0, canto: 0, sobrancelhaY: 18, olheiras: 0.8 }, g, "c11d")} />
      </Palco>
      <Som src="grilo" de={L(70.7, de)} volume={0.5} />
    </>
  );
};

// =====================================================================
// C12 · 71.95–76.59 — revelação: o dia de folga; loop na barra vazia
// =====================================================================
export const C12: React.FC<P> = ({ de }) => {
  const { s, g } = useT(de);
  if (s >= 75.8) {
    // mesmo enquadramento do primeiro quadro do C01 (loop)
    return (
      <>
        <Palco cam={CAM_LOOP} parado>
          <SupinoOrbita f={g} cam={{ yaw: 18, zoom: 1, x: 0, y: 0 }} sobe={0.15} rosto={ROSTO_BASE} noSuporte escura={0.6} />
        </Palco>
        <Som src="rangido" de={L(75.8, de)} volume={0.5} />
      </>
    );
  }
  const push = k(s, [[73.5, 0], [74.4, 1, CURVA.suave]]);
  const cam = { x: 540 - 250 * push, y: 1040 - 390 * push, zoom: 1 + 0.75 * push };
  return (
    <>
      <Palco cam={cam}>
        <QuartoLucas noite={1} />
        <g transform="translate(290 650) scale(0.58)">
          <CalendarioSemana x={0} y={0} marcados={[0, 2, 4]} brilho={s >= 73.5 ? [1, 3, 5, 6] : []} f={g} />
        </g>
        <Deitado x={1000} y={CHAO_Y - 250 - 62} d={LUCAS} musculo={1} g={g} rosto={DORMINDO} id="c12l" />
        <Coberta x={0} respira={respira(g)} />
        {push < 0.3 ? <Zzz x={330} y={1080} g={g} /> : null}
      </Palco>
      <Rotulo2 texto="O SEGREDO: O DIA DE FOLGA" x={540} y={1180} de={L(73.5, de)} tamanho={64} />
      <Som src="ronco-leve" de={L(72.1, de)} volume={0.45} />
      <Som src="ding" de={L(73.5, de)} volume={0.5} />
    </>
  );
};

