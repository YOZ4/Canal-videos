import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Boneco2D, POSE_BASE, ROSTO_BASE, posMao, type Pose } from "../../estilo2d/Boneco2D";
import { LUCAS } from "../../estilo2d/personagens";
import { AURA_LUCAS } from "../../estilo2d/Aura";
import { LARANJA } from "../../estilo2d/UI";
import { CURVA, k, piscar, respira } from "../../estilo2d/anim";
import { mola, entre } from "../../estilo2d/movimento";
import { TEMPO, conta, escalonado, estiloCss, pulso, saida, transformSvg, vida, compoe, entrada } from "../../estilo2d/coreografia";
import { Desenho, Papel, TextoMao, circulado, curvaGrafico, duracaoDesenho, eixos, seta, sublinhado, type Traco } from "../../estilo2d/Desenho";
import { Camada3D, EsferaEnergia3D, Planeta3D, Solido3D } from "../../estilo2d/Objeto3D";
import { FONTE_LEGENDA, FONTE_ROTULO } from "../../estilo/fontes";

/**
 * Teste das 3 ferramentas novas (skills motion-design, desenho-a-mao, cena-3d):
 *  A) infográfico com coreografia (cascata, pulso, contador, saída)
 *  B) quadro branco: Lucas explica juros compostos, gráfico desenhado à mão
 *  C) cena 2D com esfera de energia e planeta 3D toon
 */

const A = 150;
const B = 210;
const C = 150;
export const DURACAO = A + B + C;

const W = 1080;
const H = 1920;

// ---------- A) motion design ----------
const ITENS = [
  { icone: "1", texto: "Cascata: um item por vez" },
  { icone: "2", texto: "Mola: passa e assenta" },
  { icone: "3", texto: "Pausa antes do importante" },
];

const ParteA: React.FC = () => {
  const f = useCurrentFrame();
  const sai = A - 10;
  const titulo = vida(f, 4, sai, "sobe");
  const valor = Math.round(conta(f, 70, 40, 96));
  return (
    <AbsoluteFill style={{ background: "#1b1530" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {/* fundo: círculos entrando em cascata, mais lentos que o primeiro plano (profundidade) */}
        {[0, 1, 2, 3].map((i) => {
          const e = compoe(entrada(f, escalonado(0, i, 3), "estoura", { sensacao: "natural" }), saida(f, sai + i, "encolhe"));
          const cx = [180, 900, 820, 140][i];
          const cy = [300, 520, 1560, 1700][i];
          return (
            <circle key={i} cx={cx} cy={cy + Math.sin((f + i * 20) * 0.04) * 14} r={[160, 110, 190, 120][i]} fill={["#2a2050", "#3a2a5e", "#2a2050", "#33265a"][i]} transform={transformSvg(e, cx, cy)} />
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: FONTE_ROTULO, fontSize: 92, color: "#fff", ...estiloCss(titulo) }}>
        MOTION <span style={{ color: LARANJA }}>DESIGN</span>
      </div>
      {ITENS.map((it, i) => {
        const de = escalonado(22, i, 7);
        const e = compoe(vida(f, de, sai - (ITENS.length - i) * 2, "esquerda", { semente: i }));
        const p = pulso(f, 100 + i * 10, 0.12);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90,
              top: 520 + i * 190,
              width: 900,
              height: 150,
              borderRadius: 28,
              background: "#fff",
              border: "7px solid #1d1424",
              boxShadow: "10px 12px 0 #0d0a18",
              display: "flex",
              alignItems: "center",
              gap: 30,
              paddingLeft: 36,
              boxSizing: "border-box",
              ...estiloCss({ ...e, escala: e.escala * p }),
            }}
          >
            <div style={{ width: 92, height: 92, borderRadius: 46, background: LARANJA, border: "6px solid #1d1424", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTE_ROTULO, fontSize: 56, color: "#fff", flexShrink: 0, transform: `scale(${mola(f, de + 4, "solto")})` }}>{it.icone}</div>
            <div style={{ fontFamily: FONTE_LEGENDA, fontWeight: 800, fontSize: 52, color: "#1d1424" }}>{it.texto}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 1180, width: "100%", textAlign: "center", ...estiloCss(vida(f, 66, sai, "estoura")) }}>
        <div style={{ fontFamily: FONTE_ROTULO, fontSize: 210, color: LARANJA, transform: `scale(${pulso(f, 110, 0.15)})` }}>{valor}%</div>
        <div style={{ fontFamily: FONTE_LEGENDA, fontWeight: 800, fontSize: 48, color: "#d9d2f0" }}>menos cara de robô</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- B) quadro branco ----------
const GX = 150;
const GY = 1080;
const GW = 800;
const GH = 560;
const VALORES = [1, 1.1, 1.25, 1.45, 1.75, 2.2, 2.9, 3.9, 5.3, 7.5];
const CURVA_PTS = curvaGrafico(GX, GY, GW, GH, VALORES, 8);
const FIM_CURVA = CURVA_PTS[CURVA_PTS.length - 1];

const EIXOS: Traco[] = eixos(GX, GY, GW, GH);
const LINHA: Traco[] = [{ pontos: CURVA_PTS, cor: "#2b6cff", largura: 11 }];
const DESTAQUE: Traco[] = [circulado(FIM_CURVA[0], FIM_CURVA[1], 70, 55), ...seta([600, 380], [FIM_CURVA[0] - 60, FIM_CURVA[1] - 60], { bojo: -70 })];

const ParteB: React.FC = () => {
  const f = useCurrentFrame();
  const tEixos = 30;
  const tLinha = tEixos + duracaoDesenho(EIXOS) + 6;
  const tDest = tLinha + duracaoDesenho(LINHA, 45) + TEMPO.pausa;
  // Lucas apontando para o gráfico (entra com antecipação)
  const aponta = mola(f, tDest - 6, "natural");
  const pose: Pose = {
    ...POSE_BASE,
    x: 250,
    y: 1830,
    escala: 0.5,
    inclina: entre(0, -5, aponta) + respira(f) * 0.6,
    cabeca: entre(0, -8, mola(f, tDest - 4, "solto")),
    bracoD: { ombro: entre(14, 130, aponta), cotovelo: entre(-8, -10, mola(f, tDest - 3, "solto")) },
    maoD: aponta > 0.5 ? "aponta" : "bola",
    bracoE: { ombro: 14 + respira(f, 10) * 2, cotovelo: -10 },
  };
  const rosto = { ...ROSTO_BASE, olhos: piscar(f, "qb"), olhar: [0.6, -0.6] as [number, number], sorriso: 0.6, boca: f > 6 && f < 26 ? Math.abs(Math.sin(f * 0.7)) * 0.6 : 0 };
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Papel grade />
        <TextoMao f={f} de={6} id="tit" texto="Juros compostos" x={540} y={300} tamanho={110} ancora="middle" />
        <Desenho f={f} de={6 + 22} tracos={[sublinhado(220, 860, 330)]} caneta={false} />
        <Desenho f={f} de={tEixos} tracos={EIXOS} semente="eixo" />
        <Desenho f={f} de={tLinha} tracos={LINHA} velocidade={45} semente="linha" />
        <Desenho f={f} de={tDest} tracos={DESTAQUE} velocidade={70} semente="dest" corCaneta="#e0603a" />
        <TextoMao f={f} de={tDest + 26} id="val" texto="R$ 7.500!" x={FIM_CURVA[0] - 95} y={FIM_CURVA[1] + 40} tamanho={78} cor="#e0603a" ancora="end" caneta={false} />
        <TextoMao f={f} de={tLinha + 6} id="anos" texto="anos" x={GX + GW - 20} y={GY + 70} tamanho={54} ancora="end" caneta={false} />
        <Boneco2D id="qb" d={LUCAS} pose={pose} rosto={rosto} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- C) 3D por cima do 2D ----------
// câmera fixa em z=10, fov 35 → ~305 px por unidade no plano z=0 (centro da tela = 0,0)
const PX = (H / 2) / (Math.tan((17.5 * Math.PI) / 180) * 10);
const telaPara3D = (x: number, y: number): [number, number, number] => [(x - W / 2) / PX, (H / 2 - y) / PX, 0];

const ParteC: React.FC = () => {
  const f = useCurrentFrame();
  const sobe = k(f, [[0, 0], [12, -0.25, CURVA.entra], [30, 1, CURVA.exagera]]); // antecipação: abaixa e sobe
  const pose: Pose = {
    ...POSE_BASE,
    x: 540,
    y: 1820,
    escala: 0.62,
    agacha: 30 - sobe * 20 + respira(f) * 3,
    estica: 1 + Math.max(0, sobe - 1) * 0.1,
    cabeca: Math.sin(f * 0.05) * 2,
    bracoE: { ombro: entre(20, 150, sobe), cotovelo: entre(-10, 25, mola(f, 14, "solto")) },
    bracoD: { ombro: entre(20, 150, mola(f, 2, "natural")), cotovelo: entre(-10, 25, mola(f, 16, "solto")) },
    maoE: "aberta",
    maoD: "aberta",
    cabelo: Math.sin(f * 0.6) * 4 * Math.min(1, f / 40),
  };
  const rosto = { ...ROSTO_BASE, olhos: 1.15 * piscar(f, "c"), olhar: [0, -1] as [number, number], sobrancelha: 14, sorriso: 0.2, boca: 0.35 };
  const [mx, my] = posMao(pose, "D");
  const [ex] = posMao(pose, "E");
  const carga = k(f, [[18, 0], [80, 1, CURVA.sai]]) * (1 + Math.max(0, Math.sin(f * 0.9)) * 0.03);
  const raio = 0.62;
  const centro = telaPara3D((mx + ex) / 2, my - raio * PX * 1.7 - 20);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="ceu3d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d0b26" />
            <stop offset="0.7" stopColor="#2a1f5a" />
            <stop offset="1" stopColor="#4b2e6e" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#ceu3d)" />
        {new Array(40).fill(0).map((_, i) => (
          <circle key={i} cx={(i * 263) % W} cy={(i * 431) % 1300} r={2 + (i % 3)} fill="#fff" opacity={0.3 + 0.4 * Math.abs(Math.sin(f * 0.1 + i))} />
        ))}
        <path d="M0 1780 Q 300 1740 540 1770 T 1080 1760 L1080 1920 L0 1920 Z" fill="#1d1424" />
        {/* brilho da esfera no chão e no Lucas (2D, acompanha a carga) */}
        <ellipse cx={540} cy={1790} rx={360 * carga} ry={50 * carga} fill={AURA_LUCAS.cor} opacity={0.25 * carga} />
        <Boneco2D id="c3d" d={LUCAS} pose={pose} rosto={rosto} />
      </svg>
      <Camada3D cam={{ pos: [0, 0, 10], alvo: [0, 0, 0], fov: 35 }}>
        <Planeta3D f={f} pos={[-0.9, 3.5, -6]} raio={0.7} cor="#e0603a" />
        <Solido3D forma="icosaedro" cor="#ffd23f" pos={[2.1, 2.9, -3]} rot={[f * 0.03, f * 0.05, 0]} escala={0.35} />
        <Solido3D forma="octaedro" cor="#35e08a" pos={[2.4, 0.9, -2]} rot={[f * 0.04, -f * 0.03, 0.3]} escala={0.25} />
        <EsferaEnergia3D f={f} pos={centro} raio={raio} carga={carga} cor={AURA_LUCAS.cor} clara={AURA_LUCAS.clara} />
      </Camada3D>
    </AbsoluteFill>
  );
};

export const TesteFerramentas: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence durationInFrames={A}>
      <ParteA />
    </Sequence>
    <Sequence from={A} durationInFrames={B}>
      <ParteB />
    </Sequence>
    <Sequence from={A + B} durationInFrames={C}>
      <ParteC />
    </Sequence>
  </AbsoluteFill>
);

