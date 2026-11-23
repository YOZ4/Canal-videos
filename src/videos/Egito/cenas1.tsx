import { Easing, spring, useCurrentFrame } from "remotion";
import { Boneco2D, type Rosto } from "../../estilo2d/Boneco2D";
import { tremor } from "../../estilo2d/anim";
import { CHAO, ip, SombraChao, type Cam } from "./cenario";
import { frente, h, m, mix, R, resp, vivo } from "./atores";
import { Deserto, DiegoFrente, poseDespeja } from "./deserto";
import { CHEFE } from "./elenco";
import { Contador, Etiqueta } from "./hud";
import { CHEFE_X, DIEGO_X, LUCAS_X, X_D, X_L } from "./mundo";
import { CENA, FPS, T } from "./tempo";

type P = { t0: number };
const useFa = (t0: number) => useCurrentFrame() + t0;

/** mistura de rostos (troca de expressão com mola) */
const rmix = (a: Rosto, b: Rosto, t: number): Rosto => {
  const out: Record<string, unknown> = { ...a };
  for (const k of Object.keys(b) as (keyof Rosto)[]) {
    const va = a[k] ?? 0;
    const vb = b[k];
    if (typeof vb === "number" && typeof va === "number") out[k] = va + (vb - va) * t;
    else if (Array.isArray(vb) && Array.isArray(va)) out[k] = [va[0] + (vb[0] - va[0]) * t, va[1] + (vb[1] - va[1]) * t];
    else out[k] = t > 0.5 ? vb : va;
  }
  return out as Rosto;
};
/** expressão por trechos: lista [frame, rosto] com troca de ~6 quadros */
const rostoEm = (fa: number, lista: [number, Rosto][]): Rosto => {
  let r = lista[0][1];
  for (let i = 1; i < lista.length; i++) {
    const [fr, ro] = lista[i];
    if (fa >= fr - 3) r = rmix(r, ro, ip(fa, [fr - 3, fr + 6], [0, 1], Easing.out(Easing.cubic)));
  }
  return r;
};

// ---------------------------------------------------------------------------
// C01 · 0,00–4,40 s — "O Lucas despejava água na areia, bem na frente de uma estátua de toneladas."
// close na água caindo (zoom 2,2) → 2,2 s abre com spring revelando a estátua (zoom 1,15)
export const C01: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const pose = poseDespeja(fa, LUCAS_X + X_L(fa) * 0.6);
  const abre = spring({ frame: fa - 132, fps: FPS, config: { mass: 1.3, stiffness: 60, damping: 16 } });
  const agua: [number, number] = [pose.x - 150, CHAO - 40];
  const cam: Cam = {
    x: mix(agua[0], 220, abre),
    y: mix(agua[1] - 60, 930, abre),
    zoom: mix(2.2, 0.86, abre) * (1 + ip(fa, [0, 132], [0, 0.04]) + ip(fa, [160, CENA.C02], [0, 0.04])),
  };
  return <Deserto fa={fa} cam={cam} />;
};

// ---------------------------------------------------------------------------
// C02 · 4,40–10,75 s — Diego: "Vai regar o deserto, Cachinho? Isso aqui não é Minecraft. Água não faz bloco andar."
export const C02: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const tRi = T("Cachinho");
  const tMine = T("Minecraft");
  const tAponta = T("Água não faz");
  const ri = fa >= tRi && fa < tRi + 70 ? 1 : 0;
  const riso = ri * Math.abs(Math.sin((fa - tRi) * 0.45)) * ip(fa, [tRi + 40, tRi + 70], [1, 0]);
  const nega = ip(fa, [tMine, tMine + 50], [1, 0]) * Math.sin((fa - tMine) * 0.32) * 9 * (fa >= tMine ? 1 : 0);
  const desc = m(fa, tAponta - 8, "natural");
  const aponta = m(fa, tAponta - 4, "solto");
  const pose = frente(DIEGO_X, {
    cruzado: 1 - desc,
    vira: 0.35,
    agacha: 8 + resp(fa) * 3 + riso * 14,
    estica: 1 + riso * 0.02,
    inclina: -2 + riso * -3 + aponta * 4,
    cabeca: nega + riso * -5 + aponta * 3,
    bracoD: { ombro: mix(14, 96, aponta), cotovelo: mix(-8, -4, aponta) },
    bracoE: { ombro: 14 + resp(fa, 1) * 2, cotovelo: -10 },
    maoD: aponta > 0.4 ? "aponta" : "bola",
    cabelo: Math.sin(h(fa) * 0.2) * 3 + riso * 4,
  });
  const rosto = vivo(rostoEm(fa, [[CENA.C02, R.deboche], [tRi, R.rindo], [tRi + 70, R.deboche], [tAponta, R.confiante]]), fa, "dg", T("Vai"), T("andar") + 30);
  const cam: Cam = { x: DIEGO_X + 40, y: CHAO - 340, zoom: ip(fa, [CENA.C02, CENA.C03], [1.5, 1.65], Easing.inOut(Easing.sin)) };
  return (
    <Deserto fa={fa} cam={cam}>
      <DiegoFrente pose={{ ...pose, y: CHAO + 60 }} rosto={rosto} />
    </Deserto>
  );
};

// ---------------------------------------------------------------------------
// C03 · 10,75–18,40 s — 172 homens, trenó de madeira, prazo: pôr do sol. Plano geral, pan lateral pela fila.
export const C03: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const cam: Cam = { x: ip(fa, [CENA.C03, CENA.C04], [150, 1650], Easing.inOut(Easing.sin)), y: CHAO - 520, zoom: 0.55 };
  return (
    <>
      <Deserto fa={fa} cam={cam} />
      <Contador t0={t0} rotulo="HOMENS" de={T("cento")} dur={96} deN={0} ateN={172} ate={CENA.C04 - 14} y={190} />
      <Etiqueta t0={t0} texto="PRAZO: PÔR DO SOL • SENÃO NINGUÉM JANTA" de={T("Se não")} ate={CENA.C04 - 10} y={470} tam={46} />
    </>
  );
};

// ---------------------------------------------------------------------------
// C04 · 18,40–22,40 s — chefe grita "Para de desperdiçar água!"; 21,2 s câmera desliza até o Lucas, que nem olha.
export const C04: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const tGrito = T("Para de");
  const tVai = CENA.C04 + 168; // 21,2 s
  const aponta = m(fa, tGrito - 10, "solto");
  const grito = fa >= tGrito && fa < T("O Lucas nem") ? 1 : 0;
  const chefe = frente(CHEFE_X, {
    vira: -0.45,
    inclina: mix(0, -7, aponta) + grito * Math.sin(fa * 0.9) * 1.2,
    agacha: 10 + resp(fa) * 3 - aponta * 8,
    cabeca: -6 * aponta,
    bracoE: { ombro: mix(14, 100, aponta), cotovelo: mix(-8, 4, aponta) },
    bracoD: { ombro: mix(14, 40, aponta), cotovelo: mix(-8, -70, aponta) },
    maoE: aponta > 0.4 ? "aponta" : "bola",
    maoD: "punho",
  }, CHAO + 70);
  const rosto = vivo(rostoEm(fa, [[CENA.C04, R.bravo], [tGrito, R.gritando]]), fa, "ch");
  const vai = spring({ frame: fa - tVai, fps: FPS, config: { mass: 1, stiffness: 90, damping: 18 } });
  const tr = fa >= tGrito + 20 && fa < tGrito + 26 ? tremor(fa, 14) : { x: 0, y: 0 }; // tremida de 6 quadros
  const lx = LUCAS_X + X_L(fa) * 0.6;
  const cam: Cam = {
    x: mix(CHEFE_X - 60, lx - 120, vai) + tr.x,
    y: mix(CHAO - 330, CHAO - 300, vai) + tr.y,
    zoom: mix(1.35, 1.55, vai),
  };
  const velo = Math.abs(vai - spring({ frame: fa - tVai - 1, fps: FPS, config: { mass: 1, stiffness: 90, damping: 18 } }));
  return (
    <Deserto fa={fa} cam={cam} blurX={velo * 300}>
      <SombraChao x={chefe.x} y={chefe.y} rx={110} ry={18} />
      <Boneco2D id="chefe4" d={CHEFE} pose={chefe} rosto={rosto} />
    </Deserto>
  );
};

// ---------------------------------------------------------------------------
// C05 · 22,40–28,50 s — equipe do Diego na areia seca; monte cresce; "Força resolve" (braço flexionado)
export const C05: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const tFlex = T("Força resolve") - 6;
  const flex = m(fa, tFlex, "solto");
  const ri = fa >= T("O Diego riu") ? 1 : 0;
  const pose = frente(DIEGO_X, {
    vira: 0.3,
    cruzado: 1 - m(fa, tFlex - 10, "natural"),
    agacha: 10 + resp(fa) * 3 + ri * Math.abs(Math.sin(fa * 0.3)) * 8 * ip(fa, [tFlex + 60, tFlex + 120], [1, 0.3]),
    inclina: flex * -3,
    bracoD: { ombro: mix(14, 96, flex), cotovelo: mix(-8, -128, flex) },
    bracoE: { ombro: mix(14, 20, flex), cotovelo: -12 },
    maoD: "punho",
    biceps: flex,
  }, CHAO + 70);
  const rosto = vivo(rostoEm(fa, [[CENA.C05, R.confiante], [T("O Diego riu"), R.rindo], [tFlex + 10, R.confiante]]), fa, "dg5", T("Força"), T("resolve") + 30);
  const push = spring({ frame: fa - (tFlex - 20), fps: FPS, config: { mass: 1.1, stiffness: 70, damping: 16 } });
  const cam: Cam = { x: mix(X_D(fa) + 700, pose.x, push), y: mix(CHAO - 470, CHAO - 330, push), zoom: mix(0.7, 1.1, push) };
  return (
    <Deserto fa={fa} cam={cam}>
      <DiegoFrente pose={pose} rosto={rosto} id="dg5" />
      {/* brilho do músculo */}
      {flex > 0.9 && fa < tFlex + 60 ? (
        <g transform={`translate(${pose.x + 120} ${pose.y - 380})`} opacity={ip(fa, [tFlex + 20, tFlex + 60], [1, 0])}>
          <path d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill="#fff6c8" stroke="#1f1429" strokeWidth={5} transform={`scale(${0.8 + 0.3 * Math.sin(fa * 0.4)})`} />
        </g>
      ) : null}
    </Deserto>
  );
};

// ---------------------------------------------------------------------------
// C06 · 28,50–33,05 s — chefe tira metade dos homens do Lucas; sobraram 86
export const C06: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const aponta = m(fa, T("tirou") - 6, "solto");
  const chefe = frente(CHEFE_X - 150, {
    vira: 0.4,
    bracoD: { ombro: mix(14, 120, aponta), cotovelo: mix(-8, 0, aponta) },
    maoD: aponta > 0.4 ? "aponta" : "bola",
    bracoE: { ombro: 20, cotovelo: -90 },
    maoE: "punho",
    agacha: 10 + resp(fa) * 3,
    inclina: aponta * 4,
  }, CHAO + 70);
  const cam: Cam = { x: ip(fa, [CENA.C06, CENA.C07], [1350, 1250], Easing.inOut(Easing.sin)), y: CHAO - 400, zoom: 0.78 };
  return (
    <>
      <Deserto fa={fa} cam={cam} lucas="despeja">
        <SombraChao x={chefe.x} y={chefe.y} rx={110} ry={18} />
        <Boneco2D id="chefe6" d={CHEFE} pose={chefe} rosto={vivo(R.bravo, fa, "c6")} />
      </Deserto>
      <Contador t0={t0} rotulo="HOMENS" de={T("Sobraram") - 30} dur={60} deN={172} ateN={86} ate={CENA.C07 - 10} y={190} cor="#ff6a6a" />
    </>
  );
};

export { rostoEm };
