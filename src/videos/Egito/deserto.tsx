import { Boneco2D, posMao, type Pose, type Rosto } from "../../estilo2d/Boneco2D";
import { ChaoDeserto, CeuDeserto, CHAO, ESC_EST, ESC_TRENO, Estatua, TOPO_TRENO, FioAgua, GraosVento, Jarro, Mancha, MonteAreia, Palco, SombraChao, Treno, TrilhaMolhada, type Cam } from "./cenario";
import { Equipe, ESC, perfil, R, resp, vivo, type Puxada } from "./atores";
import { DIEGO_EG, LUCAS_EG } from "./elenco";
import { LUCAS_X, MANCHA_L, MONTE_D, N_EQUIPE, SAIU_L, SOL, X_D, X_L } from "./mundo";

/** Lucas jogando água (perfil, olhando pro trenó à esquerda). Devolve pose + onde a água cai. */
export const poseDespeja = (fa: number, x: number, extra: Partial<Pose> = {}): Pose =>
  perfil(x, {
    lado: -1,
    inclina: 8 + resp(fa) * 1.2,
    agacha: 10 + resp(fa, 2) * 3,
    cabeca: 10,
    bracoD: { ombro: 66 + Math.sin(fa * 0.05) * 3, cotovelo: -4 },
    bracoE: { ombro: 8 + resp(fa, 1) * 2, cotovelo: 22 },
    maoD: "punho",
    maoE: "bola",
    peE: { dx: -30, dy: 0 },
    peD: { dx: 34, dy: 0 },
    cabelo: Math.sin(fa * 0.04) * 3,
    ...extra,
  });

/** jarro na mão + fio d'água até o chão */
export const JarroAgua: React.FC<{ pose: Pose; fa: number; agua?: boolean; ang?: number }> = ({ pose, fa, agua = true, ang = -108 }) => {
  const [hx, hy] = posMao(pose, "D");
  const a = ang + Math.sin(fa * 0.07) * 3;
  const esc = 0.62 * (pose.escala / ESC);
  const rad = (a * Math.PI) / 180;
  const cx = hx + pose.lado * 6;
  const cy = hy + 14;
  const boca: [number, number] = [cx + Math.sin(rad) * 78 * esc, cy - Math.cos(rad) * 78 * esc];
  const chao: [number, number] = [boca[0] - 50, pose.y + 8];
  return (
    <g>
      {agua ? <FioAgua a={boca} b={chao} f={fa} largura={16 * (pose.escala / ESC)} /> : null}
      <g transform={`translate(${cx} ${cy}) rotate(${a})`}>
        <Jarro esc={esc} />
      </g>
    </g>
  );
};

/** o mundo do deserto: céu, chão, as duas equipes com estátuas, monte de areia, mancha molhada. */
export const Deserto: React.FC<{
  fa: number;
  cam: Cam;
  blurX?: number;
  /** o que aparece na frente das equipes */
  children?: React.ReactNode;
  lucas?: "despeja" | "nada";
  puxadaL?: Puxada;
  puxadaD?: Puxada;
  /** extra atrás da equipe do Diego (lama etc.) */
  atrasD?: React.ReactNode;
  trenoD?: { inclina?: number; afunda?: number };
  semMonte?: boolean;
}> = ({ fa, cam, blurX, children, lucas = "despeja", puxadaL = { anda: 0.08, forca: 0.8 }, puxadaD = { anda: 0.06, forca: 1 }, atrasD, trenoD, semMonte }) => {
  const sol = SOL(fa);
  const xl = X_L(fa);
  const xd = X_D(fa);
  const meia = 540 / cam.zoom + 400;
  const ve = (x0: number, x1: number) => x1 > cam.x - meia && x0 < cam.x + meia;
  const lucasPose = poseDespeja(fa, LUCAS_X + xl * 0.6);
  return (
    <Palco cam={cam} blurX={blurX} fundo={() => <CeuDeserto sol={sol} f={fa} />}>
      <ChaoDeserto cam={cam} f={fa} sol={sol} de={-6500} ate={7000} />
      {/* ---- equipe do Diego (areia seca) ---- */}
      {ve(xd - 500, xd + 2400) ? (
        <g>
          <Equipe fa={fa} id="bd" xTreno={xd} n={9} x0={xd + 700} passo={165} y={CHAO - 70} esc={0.42} puxada={puxadaD} semente={2} folga={6} />
          <rect x={xd - 600} y={CHAO - 620} width={2600} height={560} fill="#f6dba0" opacity={0.18} />
          <SombraChao x={xd} rx={560} />
          {atrasD}
          <Treno x={xd} esc={ESC_TRENO} inclina={trenoD?.inclina} afunda={trenoD?.afunda} />
          <g transform={`translate(${xd} ${CHAO - TOPO_TRENO + (trenoD?.afunda ?? 0)}) rotate(${trenoD?.inclina ?? 0})`}>
            <Estatua x={-60} base={0} esc={ESC_EST} />
          </g>
          {semMonte ? null : <MonteAreia x={xd + 540} h={MONTE_D(fa)} f={fa} />}
          <Equipe fa={fa} id="fd" xTreno={xd} n={9} x0={xd + 760} passo={185} puxada={puxadaD} semente={5} />
        </g>
      ) : null}
      {/* ---- equipe do Lucas (areia molhada) ---- */}
      {ve(xl - 500, xl + 3200) ? (
        <g>
          <Equipe fa={fa} id="bl" xTreno={xl} n={N_EQUIPE} x0={xl + 940} passo={165} y={CHAO - 70} esc={0.42} puxada={puxadaL} sai={(i) => SAIU_L(fa, i)} semente={1} folga={6} />
          <rect x={xl - 600} y={CHAO - 620} width={3600} height={560} fill="#f6dba0" opacity={0.18} />
          <TrilhaMolhada x0={xl - 300} x1={LUCAS_X + xl * 0.6 - 80} />
          <Mancha x={LUCAS_X + xl * 0.6 - 120} r={MANCHA_L(fa)} />
          <SombraChao x={xl} rx={560} />
          <Treno x={xl} esc={ESC_TRENO} />
          <Estatua x={xl - 60} base={CHAO - TOPO_TRENO} esc={ESC_EST} />
          <Equipe fa={fa} id="fl" xTreno={xl} n={N_EQUIPE} x0={xl + 1000} passo={185} puxada={puxadaL} sai={(i) => SAIU_L(fa, i)} semente={0} />
          {lucas === "despeja" ? (
            <g>
              <SombraChao x={lucasPose.x} rx={90} ry={16} />
              <Boneco2D id="lucasD" d={LUCAS_EG} pose={lucasPose} rosto={vivo(R.calmo as Rosto, fa, "ld")} />
              <JarroAgua pose={lucasPose} fa={fa} />
            </g>
          ) : null}
        </g>
      ) : null}
      {children}
      <GraosVento f={fa} x0={cam.x - meia} x1={cam.x + meia} n={30} />
    </Palco>
  );
};

/** Diego de frente (para closes), com sombra */
export const DiegoFrente: React.FC<{ pose: Pose; rosto: Rosto; id?: string }> = ({ pose, rosto, id = "dg" }) => (
  <g>
    <SombraChao x={pose.x} y={pose.y} rx={110} ry={18} />
    <Boneco2D id={id} d={DIEGO_EG} pose={pose} rosto={rosto} />
  </g>
);
