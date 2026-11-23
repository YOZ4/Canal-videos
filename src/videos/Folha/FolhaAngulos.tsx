import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Boneco2D, PERFIL_BASE, ROSTO_BASE, type Pose } from "../../estilo2d/Boneco2D";
import { CHAO_Y } from "../../estilo2d/Cenario2D";
import { CenarioJJK, GradeJJK } from "../../estilo2d/EstiloJJK";
import { Camada, PrimeiroPlano, camAlta, camBaixa, camDetalhe, transformCam } from "../../estilo2d/Camera2D";
import { BonecoCima, PlanoCima, RachaCima, RastroCima } from "../../estilo2d/VistaCima";
import { poseCorrida } from "../../estilo2d/corrida";
import { DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Espada } from "../../estilo2d/Objetos";

/** Folha de referência dos ângulos que funcionam com bonecos 2D (um exemplo por frame: 0..6). Não é vídeo. */
const ESC = 0.72;
const CEL = { luz: -160, sombra: 34, forca: 0.6, recorte: 10 };
const L: Pose = { ...PERFIL_BASE, escala: ESC, x: 420, y: CHAO_Y, agacha: 40, inclina: 8, peE: { dx: -86, dy: 0 }, peD: { dx: 92, dy: 0 }, bracoE: { ombro: -24, cotovelo: 26 }, bracoD: { ombro: 40, cotovelo: 90 }, maoD: "punho", maoE: "punho" };
const D: Pose = { ...PERFIL_BASE, escala: ESC, x: 820, y: CHAO_Y, lado: -1, agacha: 44, inclina: 8, peE: { dx: -90, dy: 0 }, peD: { dx: 80, dy: 0 }, bracoD: { ombro: 16, cotovelo: 112 }, bracoE: { ombro: 28, cotovelo: 98 }, maoD: "punho", maoE: "punho" };
const ALT = 1220 * ESC;
export const FolhaAngulos: React.FC = () => {
  const f = useCurrentFrame();
  const mundo = (cam: ReturnType<typeof camBaixa>, extra?: React.ReactNode) => (
    <svg width={1080} height={1920}>
      <g transform={transformCam(cam)}>
        <CenarioJJK camX={cam.x} />
        {extra}
        <Boneco2D id="d" d={DIEGO} pose={D} rosto={{ ...ROSTO_BASE, olhos: 0.45, canto: 0.8, sobrancelha: 18 }} cel={CEL} naMao={<Espada brilho={0.6} />} naMaoGira />
        <Boneco2D id="l" d={LUCAS} pose={L} rosto={{ ...ROSTO_BASE, sobrancelha: 20 }} cel={CEL} />
      </g>
    </svg>
  );
  let cena: React.ReactNode;
  if (f === 0) cena = mundo(camBaixa(560, ALT));
  else if (f === 1) cena = mundo(camAlta(620, ALT));
  else if (f === 2) cena = mundo(camDetalhe("maoD", L, { zoom: 3.2, rot: 10, desloca: [-120, 60] }));
  else if (f === 3) cena = mundo(camDetalhe("olhos", D, { zoom: 3.4, rot: -6 }));
  else if (f === 4) {
    const cam = camBaixa(700, ALT, { ocupa: 0.7, chaoTela: 0.85, rot: -4 });
    cena = (
      <>
        {mundo(cam, <Camada camX={cam.x} fator={0.5}><rect x={200} y={CHAO_Y - 900} width={160} height={900} fill="#0a141c" opacity={0.8} /></Camada>)}
        <PrimeiroPlano camX={cam.x} f={f} tipo="pilar" id="a" />
        <PrimeiroPlano camX={cam.x} f={f} tipo="pedras" id="b" />
      </>
    );
  } else if (f === 5) {
    const ninja: Pose = { ...PERFIL_BASE, ...poseCorrida(0.4, "ninja2", 1), escala: ESC, x: 500, y: 0, bracoD: { ombro: -62, cotovelo: 4 }, bracoE: { ombro: -55, cotovelo: 8 } };
    cena = (
      <PlanoCima x={560} zoom={1.1} rot={28}>
        <RastroCima x={500} z={0} dir={1} forca={0.8} f={f} />
        <BonecoCima d={LUCAS} pose={ninja} z={0} />
        <BonecoCima d={DIEGO} pose={{ ...D, x: 900, y: 0 }} z={60} espada />
      </PlanoCima>
    );
  } else {
    cena = (
      <PlanoCima x={600} zoom={1.1} rot={-20}>
        <RachaCima x={760} z={40} f={10} de={0} tamanho={1.5} />
        <BonecoCima d={LUCAS} pose={{ ...L, x: 520, y: 0, gira: -150, agacha: 40 }} z={-20} altura={500} />
        <BonecoCima d={DIEGO} pose={{ ...D, x: 780, y: 0, agacha: 200, inclina: 34 }} z={40} espada />
      </PlanoCima>
    );
  }
  return (
    <AbsoluteFill>
      <GradeJJK>{cena}</GradeJJK>
    </AbsoluteFill>
  );
};
