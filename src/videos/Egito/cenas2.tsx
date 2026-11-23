import { AbsoluteFill, Easing, random, spring, useCurrentFrame } from "remotion";
import { Boneco2D, type Pose } from "../../estilo2d/Boneco2D";
import { andarPerfil, tremor } from "../../estilo2d/anim";
import { compoe, entrada, estiloCss, flutua, saida } from "../../estilo2d/coreografia";
import { FONTE_HUD } from "../../estilo/fontes";
import { Balde, CeuPorDoSol, CHAO, ESC_EST, ESC_TRENO, TOPO_TRENO, ChaoPorDoSol, Estatua, FundoAzul, HORIZONTE, ip, Lama, LinhasVel, Palco, SombraChao, Templo, Treno, type Cam } from "./cenario";
import { Equipe, frente, h, m, mix, perfil, R, resp, vivo } from "./atores";
import { Deserto, DiegoFrente, JarroAgua, poseDespeja } from "./deserto";
import { DIEGO_EG, LUCAS_EG } from "./elenco";
import { Carimbo, Contador, Etiqueta } from "./hud";
import { DIEGO_X, LUCAS_X, X_D, X_L } from "./mundo";
import { rostoEm } from "./cenas1";
import { CENA, FPS, T } from "./tempo";

type P = { t0: number };
const useFa = (t0: number) => useCurrentFrame() + t0;

// ---------------------------------------------------------------------------
// C07 · 33,05–41,00 s — Diego comemora; câmera passa (sem corte) pro Lucas: "Pode rir, Topete..."
export const C07: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const tPan = CENA.C07 + 222; // 37,0 s
  const tResp = T("Pode rir");
  const aponta = m(fa, CENA.C07 + 6, "solto");
  const ri = Math.abs(Math.sin((fa - CENA.C07) * 0.38)) * ip(fa, [T("Agora"), T("Agora") + 40], [1, 0.35]);
  const diego = frente(DIEGO_X, {
    vira: 0.45,
    agacha: 10 + resp(fa) * 3 + ri * 12,
    inclina: -4 + aponta * 5,
    cabeca: ri * -5,
    bracoD: { ombro: mix(14, 98, aponta), cotovelo: -4 },
    bracoE: { ombro: 30, cotovelo: -100 },
    maoD: "aponta",
    maoE: "punho",
  }, CHAO + 60);
  const rD = vivo(rostoEm(fa, [[CENA.C07, R.rindo], [T("Agora"), R.deboche]]), fa, "d7", T("Agora"), T("Cachinho", 1) + 30);
  // Lucas: vira do jarro pra câmera com sorriso de canto
  const vira = m(fa, tPan + 20, "natural");
  const lx = LUCAS_X + X_L(fa) * 0.6;
  const lucasP: Pose =
    vira < 0.5
      ? poseDespeja(fa, lx, { largura: 1 - vira * 1.6 })
      : frente(lx, { vira: 0.5, largura: Math.min(1, (vira - 0.5) * 2.4), agacha: 8 + resp(fa) * 3, bracoD: { ombro: 40, cotovelo: -60 }, bracoE: { ombro: 14, cotovelo: -10 }, maoD: "punho", cabeca: 4 });
  const rL = vivo(rostoEm(fa, [[CENA.C07, R.calmo], [tPan + 24, R.canto]]), fa, "l7", tResp, T("janta") + 24);
  const pan = spring({ frame: fa - tPan, fps: FPS, config: { mass: 1.2, stiffness: 60, damping: 17 } });
  const vel = Math.abs(pan - spring({ frame: fa - tPan - 1, fps: FPS, config: { mass: 1.2, stiffness: 60, damping: 17 } }));
  const cam: Cam = { x: mix(DIEGO_X + 30, lx - 30, pan), y: mix(CHAO - 330, CHAO - 320, pan), zoom: mix(1.4, 1.6, pan) * (1 + ip(fa, [tResp, CENA.C08], [0, 0.05])) };
  return (
    <Deserto fa={fa} cam={cam} blurX={vel * 220} lucas="nada">
      <DiegoFrente pose={diego} rosto={rD} id="d7" />
      <SombraChao x={lx} rx={90} ry={16} />
      <Boneco2D id="l7" d={LUCAS_EG} pose={lucasP} rosto={rL} />
      {vira < 0.5 ? <JarroAgua pose={lucasP} fa={fa} /> : null}
    </Deserto>
  );
};

// ---------------------------------------------------------------------------
// C08 · 41,00–45,05 s — o trenó do Lucas desliza; o do Diego… travou (hold de 12 quadros)
export const C08: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const tTrava = T("travou");
  const tVai = CENA.C08 + 144; // 43,4 s
  const xl = X_L(fa);
  const vel = xl - X_L(fa - 1);
  const desce = spring({ frame: fa - tVai, fps: FPS, config: { mass: 0.8, stiffness: 120, damping: 18 } });
  const hold = fa >= tTrava && fa < tTrava + 12;
  const tr = fa >= tTrava - 2 && fa < tTrava + 6 ? tremor(fa, 10) : { x: 0, y: 0 };
  // Lucas anda junto com o trenó (sem jarro)
  const ph = andarPerfil(h(fa), 0.8, 13);
  const lucas = perfil(LUCAS_X + xl * 0.6 + 200, { peE: ph.peE, peD: ph.peD, bracoE: ph.bracoE, bracoD: ph.bracoD, agacha: ph.bob, inclina: 6 });
  const diego = frente(X_D(fa) + 700, { vira: -0.5, agacha: 4, estica: hold ? 1.06 : 1, bracoD: { ombro: 40, cotovelo: -40 }, bracoE: { ombro: 40, cotovelo: -40 }, maoD: "aberta", maoE: "aberta" }, CHAO + 60);
  const rD = vivo(rostoEm(fa, [[CENA.C08, R.confiante], [tVai + 10, R.susto]]), fa, "d8");
  const camL: Cam = { x: xl + 420, y: CHAO - 560, zoom: 0.72 };
  const camD: Cam = { x: X_D(fa) + 520, y: CHAO - 380, zoom: 0.95 };
  const cam: Cam = { x: mix(camL.x, camD.x, desce) + tr.x, y: mix(camL.y, camD.y, desce) + tr.y, zoom: mix(camL.zoom, camD.zoom, desce) };
  const velCam = Math.abs(desce - spring({ frame: fa - tVai - 1, fps: FPS, config: { mass: 0.8, stiffness: 120, damping: 18 } }));
  const azul = ip(fa, [CENA.C09 - 14, CENA.C09], [0, 0.85]);
  return (
    <>
      <Deserto fa={fa} cam={cam} blurX={velCam * 400} lucas="nada" puxadaL={{ anda: ip(fa, [CENA.C08, CENA.C08 + 60], [0.1, 1]), forca: 0.3 }} puxadaD={{ anda: 0, forca: 1 }}>
        <SombraChao x={lucas.x} rx={90} ry={16} />
        <Boneco2D id="l8" d={LUCAS_EG} pose={lucas} rosto={vivo(R.canto, fa, "l8")} />
        <LinhasVel x={xl - 200} y={CHAO - 260} f={fa} forca={Math.min(1, vel / 5) * (1 - desce)} largura={700} />
        <DiegoFrente pose={diego} rosto={rD} id="d8" />
      </Deserto>
      <AbsoluteFill style={{ background: "#1f2f5a", opacity: azul }} />
    </>
  );
};

// ---------------------------------------------------------------------------
// C09 · 45,05–59,40 s — "Sabe por quê?" diagrama em corte (luz azul)
const SECO_FIM = (): number => T("Com a quantidade");

/** grão de areia (círculo) com contorno */
const Grao: React.FC<{ x: number; y: number; r: number; cor: string }> = ({ x, y, r, cor }) => <circle cx={x} cy={y} r={r} fill={cor} stroke="#1f1429" strokeWidth={3} />;

const Seta: React.FC<{ x: number; y: number; comp: number; esp: number; cor: string; f: number; de: number }> = ({ x, y, comp, esp, cor, f, de }) => {
  const s = m(f, de, "solto");
  const L = comp * s;
  if (L < 4) return null;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M 0 ${-esp / 2} L ${L - esp} ${-esp / 2} L ${L - esp} ${-esp} L ${L} 0 L ${L - esp} ${esp} L ${L - esp} ${esp / 2} L 0 ${esp / 2} Z`} fill={cor} stroke="#1f1429" strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

export const C09: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const f = fa - CENA.C09;
  const tMolha = SECO_FIM();
  const molhado = ip(fa, [tMolha, tMolha + 40], [0, 1], Easing.inOut(Easing.cubic));
  const tCarro = T("tipo empurrar");
  // trenó no corte: no seco treme parado e o monte cresce; no molhado desliza
  const xTreno = 250 + ip(fa, [CENA.C09 + 60, tMolha], [0, 50], Easing.out(Easing.quad)) + ip(fa, [tMolha + 30, CENA.C10], [0, 230], Easing.inOut(Easing.sin));
  const vibra = molhado < 0.5 && fa > CENA.C09 + 60 ? Math.sin(fa * 1.3) * 2 : 0;
  const monte = ip(fa, [CENA.C09 + 60, tMolha], [0, 170], Easing.out(Easing.quad)) * (1 - molhado);
  const chaoY = 1170;
  const zoom = ip(fa, [CENA.C09, CENA.C10], [1, 1.08]);
  const aparece = ip(f, [0, 16], [0, 1]);
  const titulo = compoe(entrada(fa, CENA.C09 + 4, "estoura", { fps: FPS }), flutua(h(fa), 2, 3), saida(fa, CENA.C09 + 140, "sobe", 12));
  // grãos: no seco soltos; no molhado grudados com pontes d'água
  const graos = [];
  for (let i = 0; i < 81; i++) {
    const gx = 56 + (i % 27) * 37 + (Math.floor(i / 27) % 2) * 18;
    const gy = chaoY + 30 + Math.floor(i / 27) * 34;
    graos.push({ gx, gy, r: 15 + random(`gr9${i}`) * 3 });
  }
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <FundoAzul f={fa} />
        <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`} opacity={aparece}>
          {/* chão em corte */}
          <rect x={30} y={chaoY} width={1020} height={150} rx={18} fill={molhado > 0.5 ? "#a7783f" : "#e0b86e"} stroke="#1f1429" strokeWidth={6} />
          {graos.map((g, i) => (
            <Grao key={i} x={g.gx} y={g.gy + (1 - molhado) * Math.sin(fa * 0.2 + i) * 1.5} r={g.r} cor={molhado > 0.5 ? "#c08a4a" : "#f0cf8a"} />
          ))}
          {molhado > 0
            ? graos.slice(0, 80).filter((_, i) => i % 27 !== 26).map((g, i) => <rect key={`p${i}`} x={g.gx + 10} y={g.gy - 5} width={18} height={10} rx={5} fill="#6fd0ff" opacity={molhado} />)
            : null}
          {/* trenó em corte com a estátua */}
          <g transform={`translate(${xTreno + vibra} ${chaoY})`}>
            <Treno x={0} y={0} esc={0.9} />
            <Estatua x={-40} base={-81} esc={0.66} />
          </g>
          {/* monte de areia na frente */}
          {monte > 2 ? (
            <path d={`M ${xTreno + 330} ${chaoY} Q ${xTreno + 380} ${chaoY - monte} ${xTreno + 440 + monte} ${chaoY} Z`} fill="#e8c27a" stroke="#1f1429" strokeWidth={6} />
          ) : null}
          {/* setas de força */}
          {molhado < 0.5 ? (
            <g>
              <Seta x={640} y={chaoY - 330} comp={380} esp={90} cor="#ff4f4f" f={fa} de={CENA.C09 + 90} />
              <text x={640} y={chaoY - 410} fontFamily={FONTE_HUD} fontSize={64} fill="#ff8a8a" opacity={ip(fa, [CENA.C09 + 100, CENA.C09 + 120], [0, 1])}>
                MUITA FORÇA
              </text>
            </g>
          ) : (
            <g>
              <Seta x={640} y={chaoY - 330} comp={190} esp={44} cor="#4fe08a" f={fa} de={tMolha + 30} />
              <text x={600} y={chaoY - 400} fontFamily={FONTE_HUD} fontSize={56} fill="#9ff2c0" opacity={ip(fa, [tMolha + 40, tMolha + 60], [0, 1])}>
                METADE DA FORÇA
              </text>
            </g>
          )}
          {/* inset: carrinho de praia acumulando areia */}
          {fa > tCarro - 6 && fa < tMolha ? (
            <g style={estiloCss(compoe(entrada(fa, tCarro - 6, "estoura", { fps: FPS }), saida(fa, tMolha - 12, "encolhe", 10)))}>
              <g transform="translate(620 330)">
                <rect x={0} y={0} width={400} height={280} rx={30} fill="#ffe9b8" stroke="#1f1429" strokeWidth={8} />
                <rect x={0} y={200} width={400} height={80} rx={0} fill="#f0cf8a" />
                <rect x={0} y={0} width={400} height={280} rx={30} fill="none" stroke="#1f1429" strokeWidth={8} />
                {(() => {
                  const cx = 80 + ip(fa, [tCarro, tCarro + 80], [0, 90], Easing.out(Easing.quad));
                  const pm = ip(fa, [tCarro, tCarro + 80], [10, 70]);
                  return (
                    <g>
                      <path d={`M ${cx + 120} 200 Q ${cx + 150} ${200 - pm} ${cx + 190 + pm * 0.5} 200 Z`} fill="#e0b86e" stroke="#1f1429" strokeWidth={5} />
                      <rect x={cx} y={130} width={120} height={60} rx={8} fill="#ff6a6a" stroke="#1f1429" strokeWidth={6} />
                      <circle cx={cx + 30} cy={196} r={16} fill="#3b2454" stroke="#1f1429" strokeWidth={5} />
                      <circle cx={cx + 92} cy={196} r={16} fill="#3b2454" stroke="#1f1429" strokeWidth={5} />
                      <path d={`M ${cx} 140 L ${cx - 60} 90`} stroke="#1f1429" strokeWidth={10} strokeLinecap="round" />
                    </g>
                  );
                })()}
                <text x={200} y={60} textAnchor="middle" fontFamily={FONTE_HUD} fontSize={40} fill="#1f1429">
                  CARRINHO NA PRAIA
                </text>
              </g>
            </g>
          ) : null}
        </g>
      </svg>
      {/* título */}
      {fa < CENA.C09 + 160 ? (
        <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: FONTE_HUD, fontSize: 130, color: "#ffd83a", textShadow: "0 8px 0 #0d1430", ...estiloCss(titulo) }}>SABE POR QUÊ?</div>
      ) : null}
      <Etiqueta t0={t0} texto="AREIA MOLHADA NA MEDIDA" de={tMolha + 30} ate={T("Físicos") - 4} y={300} tam={60} cor="#9ff2c0" />
      <Etiqueta t0={t0} texto="AMSTERDÃ • 2014" de={T("Amsterdã") - 4} ate={CENA.C10 - 8} y={250} tam={70} />
      <Contador t0={t0} rotulo="FORÇA PRA PUXAR" de={T("a força pra")} dur={120} deN={100} ateN={50} ate={CENA.C10 - 8} y={430} sufixo="%" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// C10 · 59,40–64,65 s — Diego joga um balde inteiro: vira lama, atola de vez
export const C10: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const tLev = CENA.C10 + 12; // 59,6 s
  const tJoga = T("e jogou") + 10;
  const tSplash = tJoga + 14;
  const tAfunda = T("Atolou");
  const xd = X_D(fa);
  // antecipação: agacha → sobe o balde por cima da cabeça → arremessa pra frente
  const agacha = ip(fa, [tLev, tLev + 14, tLev + 34], [0, 40, 0], Easing.inOut(Easing.cubic));
  const sobe = m(fa, tLev + 14, "natural");
  const joga = m(fa, tJoga, "solto");
  const ombro = mix(mix(20, 165, sobe), 95, joga);
  const diego = frente(xd + 800, {
    vira: -0.55,
    agacha: 8 + agacha + resp(fa) * 2,
    inclina: mix(mix(0, 6, sobe), -14, joga),
    estica: 1 + sobe * 0.03 * (1 - joga),
    bracoD: { ombro, cotovelo: mix(-20, -6, joga) },
    bracoE: { ombro, cotovelo: mix(-20, -6, joga) },
    maoD: "aberta",
    maoE: "aberta",
  }, CHAO + 70);
  const rD = vivo(rostoEm(fa, [[CENA.C10, R.confiante], [tSplash + 20, R.susto], [tAfunda, { ...R.mudo, palido: 0.7, suor: 1 }]]), fa, "d10");
  // balde: segue as mãos até jogar; depois cai vazio
  const maoY = diego.y - 470 - Math.sin((ombro * Math.PI) / 180) * 70 - (ombro > 120 ? 120 : 0) * sobe * (1 - joga);
  const baldeX = diego.x + mix(0, -170, joga) + ip(fa, [tJoga + 10, tJoga + 50], [0, -90]);
  const baldeY = mix(diego.y - 260, maoY - 40, sobe) + ip(fa, [tJoga + 10, tJoga + 50], [0, 520], Easing.in(Easing.quad)) * (joga > 0.5 ? 1 : 0);
  const baldeRot = mix(0, -150, joga);
  // água voando até o monte
  const voo = ip(fa, [tJoga + 2, tSplash], [0, 1], Easing.in(Easing.quad));
  const alvoX = xd + 600;
  const lama = ip(fa, [tSplash, tSplash + 40], [0, 70], Easing.out(Easing.cubic));
  const afunda = ip(fa, [tSplash + 20, tAfunda + 50], [0, 46], Easing.in(Easing.cubic));
  const inclina = ip(fa, [tSplash + 20, tAfunda + 50], [0, -7], Easing.in(Easing.cubic));
  const tr = fa >= tSplash && fa < tSplash + 12 ? tremor(fa, 14) : { x: 0, y: 0 };
  const cam: Cam = {
    x: xd + 560 + tr.x,
    y: CHAO - 330 + tr.y,
    zoom: ip(fa, [CENA.C10, tSplash, tSplash + 12, tAfunda, tAfunda + 40], [0.95, 0.95, 1.1, 1.1, 1.2], Easing.out(Easing.cubic)),
  };
  return (
    <Deserto
      fa={fa}
      cam={cam}
      puxadaD={{ anda: 0, forca: 1 }}
      semMonte={fa > tSplash + 10}
      trenoD={{ inclina, afunda }}
      atrasD={<Lama x={xd + 620} r={lama} f={fa} />}
    >
      <DiegoFrente pose={diego} rosto={rD} id="d10" />
      {fa < tJoga + 60 ? (
        <g transform={`translate(${baldeX} ${baldeY}) rotate(${baldeRot})`}>
          <Balde esc={0.55} cheio={joga < 0.5} />
        </g>
      ) : null}
      {voo > 0 && voo < 1 ? (
        <g>
          {new Array(8).fill(0).map((_, i) => {
            const x = mix(baldeX - 60, alvoX + (i - 4) * 14, voo);
            const y = mix(baldeY - 40, CHAO - 30, voo) - Math.sin(voo * Math.PI) * 160 + i * 6;
            return <ellipse key={i} cx={x} cy={y} rx={26 - i * 2} ry={18 - i * 1.5} fill="#8fdcff" stroke="#2f86c9" strokeWidth={4} />;
          })}
        </g>
      ) : null}
      {fa >= tSplash && fa < tSplash + 40 ? (
        <g>
          {new Array(16).fill(0).map((_, i) => {
            const t = (fa - tSplash) / 40;
            const ang = -Math.PI / 2 + (random(`sl${i}`) - 0.5) * 2.6;
            const v = 14 + random(`sv10${i}`) * 12;
            const x = alvoX + Math.cos(ang) * v * (fa - tSplash);
            const y = CHAO - 20 + Math.sin(ang) * v * (fa - tSplash) + 0.9 * (fa - tSplash) ** 2;
            return <circle key={i} cx={x} cy={y} r={(10 + random(`sr10${i}`) * 12) * (1 - t)} fill={i % 3 ? "#7a5634" : "#8fdcff"} stroke="#1f1429" strokeWidth={3} />;
          })}
        </g>
      ) : null}
    </Deserto>
  );
};

// ---------------------------------------------------------------------------
// C11 · 64,65–68,30 s — pôr do sol: os 86 do Lucas chegam ao templo; Lucas comemora; Diego mudo, sujo de lama
export const C11: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const f = fa - CENA.C11;
  const tVit = CENA.C11 + 9; // 64,8 s
  const chega = spring({ frame: f, fps: FPS, config: { mass: 1.6, stiffness: 50, damping: 18 } });
  const xT = mix(-1300, -420, chega);
  const anda = Math.max(0, 1 - chega) * 1.4;
  const vit = m(fa, tVit, "solto");
  const lucas = frente(200, {
    vira: -0.2,
    agacha: ip(fa, [tVit - 10, tVit], [0, 30]) * (1 - vit) + 6 + resp(fa) * 3,
    estica: 1 + vit * 0.05 * Math.max(0, Math.sin((fa - tVit) * 0.25)),
    bracoE: { ombro: mix(14, 165, vit), cotovelo: mix(-8, 18, m(fa, tVit + 3, "solto")) },
    bracoD: { ombro: mix(14, 160, m(fa, tVit + 2, "solto")), cotovelo: mix(-8, 22, m(fa, tVit + 5, "solto")) },
    maoE: "punho",
    maoD: "punho",
    cabeca: -4 * vit,
    cabelo: Math.sin(fa * 0.3) * 4 * vit,
  }, CHAO + 80);
  const diego: Pose = frente(440, { vira: 0.4, agacha: 4, bracoD: { ombro: 8, cotovelo: -4 }, bracoE: { ombro: 8, cotovelo: -4 } }, CHAO - 40);
  const cam: Cam = { x: 300, y: CHAO - 430, zoom: ip(fa, [CENA.C11, CENA.C12], [0.95, 1.1], Easing.inOut(Easing.sin)) };
  return (
    <>
      <Palco cam={cam} fundo={() => <CeuPorDoSol f={fa} />}>
        <ChaoPorDoSol />
        <Templo x={500} y={HORIZONTE + 120} esc={0.9} />
        {/* Diego ao fundo, mudo, sujo de lama */}
        <g>
          <SombraChao x={diego.x} y={diego.y} rx={70} ry={12} />
          <g transform={`translate(${diego.x} ${diego.y}) scale(0.75) translate(${-diego.x} ${-diego.y})`}>
            <Boneco2D id="d11" d={DIEGO_EG} pose={diego} rosto={vivo(R.mudo, fa, "d11")} />
            {[[-40, -120, 40], [30, -60, 30], [-20, -300, 26], [50, -200, 22], [-60, -20, 34]].map(([dx, dy, r], i) => (
              <ellipse key={i} cx={diego.x + dx} cy={diego.y + dy} rx={r} ry={r * 0.7} fill="#6b4a2a" opacity={0.9} />
            ))}
          </g>
        </g>
        {/* trenó do Lucas chegando com os 86 */}
        <g>
          <Equipe fa={fa} id="e11" xTreno={xT} n={6} x0={xT + 980} passo={190} puxada={{ anda, forca: 0.3 * anda }} semente={3} />
          <SombraChao x={xT} rx={420} />
          <Treno x={xT} esc={ESC_TRENO} />
          <Estatua x={xT - 60} base={CHAO - TOPO_TRENO} esc={ESC_EST} />
        </g>
        <SombraChao x={lucas.x} y={lucas.y} rx={110} ry={18} />
        <Boneco2D id="l11" d={LUCAS_EG} pose={lucas} rosto={vivo(fa >= tVit ? R.vitoria : R.canto, fa, "l11")} />
        {/* luz de recorte laranja */}
        <rect x={-3000} y={-500} width={6000} height={3000} fill="#ff8a4a" opacity={0.08} />
      </Palco>
      <Etiqueta t0={t0} texto="86 HOMENS • NO PRAZO" de={CENA.C11 + 81} ate={CENA.C12 + 6} y={300} brilho tam={72} />
    </>
  );
};

// ---------------------------------------------------------------------------
// C12 · 68,30–75,55 s — pintura da tumba (estilo egípcio, perfil, ocre); "RITUAL?" riscado; termina no close da água (loop)
const MARROM = "#8a4a2a";

/** homem pintado (perfil chapado estilo egípcio) */
const HomemPintado: React.FC<{ x: number; y: number; esc?: number; puxa?: boolean; cor?: string }> = ({ x, y, esc = 1, puxa = true, cor = MARROM }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`} fill={cor} stroke="#3a1e10" strokeWidth={3} strokeLinejoin="round">
    <circle cx={6} cy={-170} r={18} />
    <path d="M -14 -176 Q -4 -196 18 -188 L 22 -172 L -14 -160 Z" fill="#1c1720" />
    <path d="M -16 -150 L 22 -150 L 14 -86 L -10 -86 Z" />
    <path d="M -14 -88 L 18 -88 L 26 -48 L -20 -48 Z" fill="#efe2c4" />
    <path d="M -6 -48 L -26 0 M 10 -48 L 30 0" strokeWidth={10} stroke={cor} strokeLinecap="round" />
    {puxa ? <path d="M 16 -140 L 50 -128 M 10 -132 L 48 -118" strokeWidth={9} stroke={cor} strokeLinecap="round" /> : null}
  </g>
);

export const C12: React.FC<P> = ({ t0 }) => {
  const fa = useFa(t0);
  const tDesce = CENA.C12 + 240; // 72,3 s
  const desliza = ip(fa, [CENA.C12, tDesce], [0, 1], Easing.inOut(Easing.sin));
  const desce = spring({ frame: fa - tDesce, fps: FPS, config: { mass: 1.2, stiffness: 55, damping: 18 } });
  // parede: estátua à esquerda (x≈200), homem com água na frente do trenó (x≈470), fileiras puxando à direita
  const aguaP: [number, number] = [520, 1150];
  const cam: Cam = {
    x: mix(mix(1500, 500, desliza), aguaP[0], desce),
    y: mix(960, aguaP[1] - 40, desce),
    zoom: mix(1.0, 1.6, desce),
  };
  const linhas = [880, 1180, 1480];
  return (
    <>
      <Palco cam={cam} fundo={() => <rect width={1080} height={1920} fill="#d8b98a" />}>
        {/* pedra: blocos e textura */}
        <rect x={-800} y={200} width={3600} height={1600} fill="#d8b98a" />
        {new Array(60).fill(0).map((_, i) => (
          <circle key={i} cx={-800 + random(`tp${i}`) * 3600} cy={200 + random(`tq${i}`) * 1600} r={6 + random(`tr${i}`) * 20} fill="#c4a274" opacity={0.35} />
        ))}
        {[500, 800, 1100, 1400, 1700].map((y) => (
          <path key={y} d={`M -800 ${y} L 2800 ${y}`} stroke="#b8956a" strokeWidth={4} />
        ))}
        {/* faixas de registro */}
        {[600, 1560].map((y) => (
          <rect key={y} x={-800} y={y} width={3600} height={24} fill="#2fa89a" opacity={0.7} />
        ))}
        {/* estátua no trenó (pintada) */}
        <g opacity={0.95}>
          <rect x={20} y={1170} width={520} height={30} fill="#8a5a2e" stroke="#3a1e10" strokeWidth={4} />
          <g transform="translate(240 1170) scale(0.55)">
            <Estatua x={0} base={0} esc={1} cor="#c9a26a" />
          </g>
        </g>
        {/* homem jogando água na frente do trenó */}
        <HomemPintado x={600} y={1170} esc={1.1} puxa={false} />
        <path d="M 610 1020 L 560 990 L 540 1010 Z" fill="#b8643a" stroke="#3a1e10" strokeWidth={3} />
        <path d={`M 545 1005 Q 530 1080 ${aguaP[0]} 1168`} stroke="#4fa8d8" strokeWidth={10} fill="none" strokeDasharray="18 10" strokeDashoffset={-fa * 0.6} />
        {/* fileiras de homens puxando cordas */}
        {linhas.map((y, li) => (
          <g key={li}>
            <path d={`M 540 ${y - 135} L 2700 ${y - 125}`} stroke="#c9a26a" strokeWidth={6} />
            {new Array(14).fill(0).map((_, i) => (
              <HomemPintado key={i} x={760 + i * 140 + li * 30} y={y} esc={0.95} />
            ))}
          </g>
        ))}
        {/* hieróglifos genéricos */}
        {new Array(18).fill(0).map((_, i) => (
          <g key={i} transform={`translate(${-500 + i * 180} ${330 + (i % 2) * 70})`} fill="none" stroke="#6b3a20" strokeWidth={6} strokeLinecap="round">
            {i % 3 === 0 ? <circle r={18} /> : i % 3 === 1 ? <path d="M -20 10 L 0 -20 L 20 10 Z" /> : <path d="M -20 0 Q 0 -30 20 0 Q 0 30 -20 0" />}
          </g>
        ))}
      </Palco>
      <Etiqueta t0={t0} texto="~1900 a.C." de={CENA.C12 + 90} ate={CENA.C12 + 300} y={260} tam={80} />
      <Carimbo t0={t0} texto="RITUAL?" de={CENA.C12 + 342} risca={CENA.C12 + 378} x={540} y={620} />
    </>
  );
};


