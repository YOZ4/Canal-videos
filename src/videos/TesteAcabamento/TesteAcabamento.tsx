import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Boneco2D, ROSTO_BASE, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { CHAO_Y, Praca, Quarto, RuaNoite } from "../../estilo2d/Cenario2D";
import { Simbolo } from "../../estilo2d/Efeitos2D";
import { CURVA, k, kRosto, piscar, respira, trocaRosto } from "../../estilo2d/anim";
import { AVO, DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Aquarela, Desencaixe, Ferve, FilmeMudo, Luz, NoDois, SombraCel } from "../../estilo2d/Pintura";
import { Selo } from "../../estilo2d/UI";
import { Cortina, Iris } from "../../estilo2d/Transicoes";
import { Textura } from "../../estilo2d/chibi/RuaTexturizada";
import { Palco, Som, frente } from "../Cacadores/comum";

/**
 * Teste do acabamento novo (16 s):
 *  1. ANTES x DEPOIS (em cima o jeito antigo, embaixo: contorno fervendo, sombra de cel,
 *     troca de expressão atuada e animação de dois em dois)
 *  2. Desenho anos 50 (cor desencaixada do contorno)
 *  3. Flashback em filme mudo (avô)
 *  4. Lembrança em aquarela com luz aditiva
 */
export const DURACAO = 480;
const C2 = 150;
const C3 = 255;
const C4 = 375;

const R_L: Rosto = { ...ROSTO_BASE, sorriso: 0.5, sobrancelha: 4, olhar: [0.6, 0] };
const R_L_SUSTO: Rosto = { ...ROSTO_BASE, olhos: 1.2, sorriso: -0.1, boca: 0.6, sobrancelha: -14, sobrancelhaY: 10, olhar: [0.4, -0.6] };
const R_L_RI: Rosto = { ...ROSTO_BASE, olhos: 0.85, sorriso: 1, boca: 0.5, sobrancelha: -4, olhar: [0.8, 0] };
const R_D: Rosto = { ...ROSTO_BASE, olhos: 0.5, canto: 0.6, sorriso: 0.2, sobrancelha: 14, olhar: [-0.6, 0] };
const R_D_SUSTO: Rosto = { ...ROSTO_BASE, olhos: 1.2, boca: 0.5, sorriso: -0.2, sobrancelha: -10, sobrancelhaY: 8, olhar: [-0.3, -0.6] };
const R_D_CANTO: Rosto = { ...ROSTO_BASE, olhos: 0.45, canto: 1, sorriso: 0.35, sobrancelha: 18, olhar: [-1, 0] };

// tempos da cena 1 (leituras): 0–44 os dois parados · 45 cai a bola (!) · 50/56 sustos (Lucas antes, Diego depois)
// · 95 Lucas ri · 112 Diego sorriso de canto · segura até o fim
const QUEDA = 45;

/** os dois personagens da cena 1; `novo` liga o acabamento novo */
const Dupla: React.FC<{ novo: boolean }> = ({ novo }) => {
  const f = useCurrentFrame();
  const chaveL: [number, Rosto, number?][] = [[0, R_L], [QUEDA + 5, R_L_SUSTO, 1.6], [95, R_L_RI, 0.8]];
  const chaveD: [number, Rosto, number?][] = [[0, R_D], [QUEDA + 11, R_D_SUSTO, 1.2], [112, R_D_CANTO, 0.7]];
  // antigo: troca direta com kRosto (2 frames)
  const velho = (keys: [number, Rosto, number?][]) => kRosto(f, keys.flatMap(([t, r], i) => (i === 0 ? [[t, r]] : [[t - 2, keys[i - 1][1]], [t, r]])) as [number, Rosto][]);
  const l = novo ? trocaRosto(f, chaveL) : { rosto: velho(chaveL), corpo: { estica: 1, agacha: 0 } };
  const d = novo ? trocaRosto(f, chaveD) : { rosto: velho(chaveD), corpo: { estica: 1, agacha: 0 } };
  const pl: Pose = frente(380, { vira: 0.35, estica: (1 + respira(f) * 0.01) * l.corpo.estica, agacha: l.corpo.agacha, bracoD: f > 95 ? { ombro: 40, cotovelo: -70 } : { ombro: 14, cotovelo: -8 } });
  const pd: Pose = frente(720, { vira: -0.35, cruzado: 1, estica: (1 + respira(f, 30) * 0.01) * d.corpo.estica, agacha: d.corpo.agacha });
  const lucas = <Boneco2D id={`l${novo}`} d={LUCAS} pose={pl} rosto={{ ...l.rosto, olhos: l.rosto.olhos * piscar(f, "l1") }} />;
  const diego = <Boneco2D id={`d${novo}`} d={DIEGO} pose={pd} rosto={{ ...d.rosto, olhos: d.rosto.olhos * piscar(f, "d1") }} />;
  // bolinha que cai entre os dois (o "motivo" do susto)
  const by = k(f, [[QUEDA - 14, CHAO_Y - 900], [QUEDA, CHAO_Y - 30, CURVA.entra], [QUEDA + 8, CHAO_Y - 160, CURVA.sai], [QUEDA + 16, CHAO_Y - 30, CURVA.entra], [QUEDA + 21, CHAO_Y - 70, CURVA.sai], [QUEDA + 26, CHAO_Y - 30, CURVA.entra]]);
  const sq = f >= QUEDA && f < QUEDA + 3 ? 0.7 : 1;
  const bola = f >= QUEDA - 14 ? <ellipse cx={550} cy={by} rx={30 / sq} ry={30 * sq} fill="#e8553f" stroke="#1d1424" strokeWidth={6} /> : null;
  if (!novo) {
    return (
      <>
        {lucas}
        {diego}
        {bola}
      </>
    );
  }
  return (
    <>
      <Ferve chave="lucas" forca={2.2} ancora={[pl.x, pl.y]}>
        <SombraCel chave="lucasCel">{lucas}</SombraCel>
      </Ferve>
      <Ferve chave="diego" forca={2.2} ancora={[pd.x, pd.y]}>
        <SombraCel chave="diegoCel">{diego}</SombraCel>
      </Ferve>
      <Ferve chave="bola" ancora={[550, by]}>{bola}</Ferve>
    </>
  );
};

const Metade: React.FC<{ novo: boolean }> = ({ novo }) => {
  const f = useCurrentFrame();
  const conteudo = (
    <Palco cam={{ x: 550, y: 1020, zoom: 0.86 }}>
      {novo ? (
        <Ferve chave="praca" forca={2}>
          <Praca camX={0} />
        </Ferve>
      ) : (
        <Praca camX={0} />
      )}
      <Dupla novo={novo} />
      <Simbolo texto="!" x={215} y={CHAO_Y - 820} f={f} de={QUEDA + 5} ate={QUEDA + 40} />
      <Simbolo texto="!" x={890} y={CHAO_Y - 820} f={f} de={QUEDA + 11} ate={QUEDA + 40} />
    </Palco>
  );
  return (
    <AbsoluteFill style={{ top: novo ? 960 : 0, height: 960, overflow: "hidden" }}>
      <AbsoluteFill style={{ top: -480, height: 1920 }}>{novo ? <NoDois>{conteudo}</NoDois> : conteudo}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const CenaAntesDepois: React.FC = () => (
  <>
    <Metade novo={false} />
    <Metade novo />
    <AbsoluteFill style={{ top: 955, height: 10, background: "#1d1424" }} />
    <Selo texto="ANTES" de={0} ate={C2} cor="#6b6470" y={14} />
    <Selo texto="DEPOIS" de={0} ate={C2} cor="#ff9b2f" y={974} />
    <Som src="pop" de={QUEDA} volume={0.6} />
    <Som src="whoosh" de={QUEDA + 5} volume={0.25} />
  </>
);

// ============ 2. anos 50 ============
const CenaAnos50: React.FC = () => {
  const f = useCurrentFrame();
  const aceno = f > 20 ? Math.sin((f - 20) * 0.5) * 22 : 0;
  const sobe = k(f, [[10, 0], [22, 1, CURVA.exagera]]);
  const pl = frente(540, { vira: 0.15, estica: 1 + respira(f) * 0.012, bracoD: { ombro: 14 + 136 * sobe, cotovelo: -8 - 40 * sobe + aceno }, maoD: sobe > 0.5 ? "aberta" : "bola", cabeca: 4 * sobe });
  return (
    <NoDois>
      <Palco cam={{ x: 540, y: 1120, zoom: 1.25 }}>
        <Desencaixe chave="fundo50">
          <Praca camX={0} />
        </Desencaixe>
        <Ferve chave="lucas50" ancora={[pl.x, pl.y]}>
          <Desencaixe chave="lucas50d" px={4}>
            <Boneco2D id="l50" d={LUCAS} pose={pl} rosto={{ ...R_L_RI, olhar: [0, 0], olhos: R_L_RI.olhos * piscar(f, "l50") }} />
          </Desencaixe>
        </Ferve>
      </Palco>
    </NoDois>
  );
};

// ============ 3. flashback filme mudo ============
const CenaMudo: React.FC = () => {
  const f = useCurrentFrame();
  const aponta = k(f, [[18, 0], [34, 1, CURVA.antecipaExagera]]);
  const pa = frente(560, { vira: -0.2, estica: 1 + respira(f) * 0.008, bracoD: { ombro: 14 + 106 * aponta, cotovelo: -8 - 32 * aponta }, maoD: aponta > 0.5 ? "aponta" : "bola" });
  const ra: Rosto = { ...ROSTO_BASE, olhos: 0.8 * piscar(f, "avo"), sorriso: 0.7, sobrancelha: -6, olhar: [0.4, -0.3] };
  return (
    <FilmeMudo estrago={1.2}>
      <Palco cam={{ x: 560, y: 1150, zoom: 1.15 }}>
        <Quarto />
        <Ferve chave="avo" ancora={[pa.x, pa.y]}>
          <Boneco2D id="avo" d={AVO} pose={pa} rosto={ra} />
        </Ferve>
      </Palco>
    </FilmeMudo>
  );
};

// ============ 4. aquarela + luz ============
const CenaAquarela: React.FC = () => {
  const f = useCurrentFrame();
  const acende = interpolate(f, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.sai });
  const pulso = 1 + Math.sin(f * 0.25) * 0.08;
  const pl = frente(470, { vira: 0.4, cabeca: -8, estica: 1 + respira(f) * 0.01 });
  const rl: Rosto = { ...ROSTO_BASE, olhos: (0.9 + acende * 0.25) * piscar(f, "laq"), sorriso: 0.2 + acende * 0.6, boca: acende * 0.25, olhar: [0.7, -1] };
  return (
    <Palco cam={{ x: 600, y: 1060, zoom: 1.3 }}>
      <Aquarela chave="noite">
        <RuaNoite camX={0} />
        <Boneco2D id="laq" d={LUCAS} pose={pl} rosto={rl} />
      </Aquarela>
      <Luz x={800} y={620} r={360 * pulso} cor="#ffc766" forca={acende} chave="estrela" />
      <Luz x={800} y={620} r={70} cor="#fff3c4" forca={acende} chave="nucleo" />
      <Luz x={470} y={1000} r={420} cor="#ff9b5a" forca={acende * 0.4} chave="rosto" />
    </Palco>
  );
};

export const TesteAcabamento: React.FC = () => (
  <AbsoluteFill style={{ background: "#f3ebdc" }}>
    <Sequence durationInFrames={C2}>
      <CenaAntesDepois />
    </Sequence>
    <Sequence from={C2} durationInFrames={C3 - C2}>
      <CenaAnos50 />
      <Selo texto="DESENHO ANOS 50" de={4} ate={C3 - C2 - 4} cor="#c0503a" />
    </Sequence>
    <Sequence from={C3} durationInFrames={C4 - C3}>
      <CenaMudo />
      <Selo texto="FLASHBACK: FILME MUDO" de={6} ate={C4 - C3 - 6} cor="#5a4632" />
    </Sequence>
    <Sequence from={C4} durationInFrames={DURACAO - C4}>
      <CenaAquarela />
      <Selo texto="LEMBRANÇA EM AQUARELA" de={6} ate={DURACAO - C4 - 6} cor="#3d6b8f" />
      <Som src="brilho" de={20} volume={0.5} />
    </Sequence>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Textura />
    </svg>
    <Cortina de={C2 - 7} dur={14} />
    <Iris de={C3 - 8} dur={16} x={540} y={760} />
    <Iris de={C4 - 8} dur={16} x={540} y={900} />
    <Sequence from={C2 - 7}><Html5Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} /></Sequence>
    <Html5Audio src={staticFile("musica/trilha-leve.wav")} volume={0.12} />
  </AbsoluteFill>
);
