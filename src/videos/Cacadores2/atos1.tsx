import { AbsoluteFill, random } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, posCabeca, posMao, ROSTO_BASE, type Pose } from "../../estilo2d/Boneco2D";
import { andarPerfil, CURVA, giro, respira } from "../../estilo2d/anim";
import { CHAO_Y, Carteira, Sala, Savana } from "../../estilo2d/Cenario2D";
import { Gota, LinhasFoco, LinhasMovimento, Poeira, Simbolo } from "../../estilo2d/Efeitos2D";
import { Antilope, Garrafa } from "../../estilo2d/Objetos";
import { Fundo, RuaLonga } from "../../estilo2d/Acabamento";
import { Desenho, Papel, TextoMao, eixos } from "../../estilo2d/Desenho";
import { FilmeMudo } from "../../estilo2d/Pintura";
import { criarAnimacao, rostoAtuado } from "../../estilo2d/naturalidade";
import { poseCorrida, xCorrida, type EstiloCorrida } from "../../estilo2d/corrida";
import { AVO, CANDIDATOS, CONTORNO, DIEGO, EXAMINADOR, LUCAS, type Design } from "../../estilo2d/personagens";
import { Placar, Rotulo2, Selo } from "../../estilo2d/UI";
import { Cena, camK, falaDe, ip, mola, planos, R, ROSTO_AVO_C, S, T, useF, vivo } from "./base";

/** Atos 1–7 (0 → "Segunda fase"). Personagens passam pela camada de naturalidade (anima) e trocam de rosto atuando. */
const ESC = 0.72;
const C = CHAO_Y;
const frente = (x: number, p: Partial<Pose> = {}): Pose => ({ ...POSE_BASE, x, y: C, escala: ESC, ...p });
const perfil = (x: number, p: Partial<Pose> = {}): Pose => ({ ...PERFIL_BASE, x, y: C, escala: ESC, ...p });

/** camada de naturalidade de um trecho [t0, t1): poses cruas por quadro ABSOLUTO → pés plantados + cabelo/camiseta com mola */
const anima = (t0: number, t1: number, quadro: (f: number) => Record<string, Pose>, pes: string[] | false = false) => {
  const a = criarAnimacao(t1 - t0 + 2, (i) => quadro(t0 + i), { chao: C, pes, camera: false });
  return (id: string, f: number) => a.pose(id, Math.max(0, f - t0));
};
const atuado = (t0: number, t1: number, escolha: (f: number) => { nome: string; rosto: typeof R.normal; tam?: number }) => {
  const a = rostoAtuado(t1 - t0 + 2, (i) => escolha(t0 + i));
  return (f: number) => a.em(Math.max(0, f - t0));
};

// =================================================================== A1 · a prova (0 → "Você nasceu")
const A1_FIM = T("Você nasceu");
const NERV = T("nervoso");
const ESQ = T("esqueceu");
const IMAG = T("Agora imagina");
const ERRAR = T("errar pode");
const A1L = anima(0, A1_FIM, (f) => {
  const escreve = f < ESQ ? Math.sin(f * 0.9) * 8 : 0;
  const trava = mola(f, ESQ - 2, { mass: 0.6, stiffness: 260, damping: 12 });
  const recua = f >= IMAG ? mola(f, IMAG + 10, { mass: 1.2, stiffness: 90, damping: 14 }) : 0;
  return {
    L: frente(560, {
      agacha: 90 - recua * 20,
      inclina: 6 - trava * 4 - recua * 8,
      cabeca: 10 - trava * 6 - recua * 10,
      estica: 1 + trava * 0.04,
      bracoD: { ombro: 40 + escreve - trava * 10, cotovelo: -70 + escreve },
      bracoE: { ombro: 36, cotovelo: -60 },
      vira: recua * -0.15,
    }),
  };
});
const A1R = atuado(0, A1_FIM, (f) =>
  f < NERV ? { nome: "normal", rosto: { ...R.serio, olhar: [0, 0.8] }, tam: 0 } : f < ESQ ? { nome: "nervoso", rosto: { ...R.nervoso, olhar: [0, 0.8] }, tam: 0.6 } : f < IMAG ? { nome: "branco", rosto: R.branco, tam: 1.6 } : { nome: "medo", rosto: R.medo, tam: 1.2 },
);
const SOMBRA: Design = { ...EXAMINADOR, pele: "#150a12", peleSombra: "#150a12", camisa: "#150a12", camisaSombra: "#150a12", manga: "#150a12", calca: "#150a12", calcaSombra: "#150a12", tenis: "#150a12", sola: "#150a12", corCabelo: "#150a12", corCabeloSombra: "#150a12", sobrancelha: "#150a12", brilhoCabelo: "#150a12" };

export const A1: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const p = A1L("L", f);
  const rr = A1R(f);
  const pose = { ...p, agacha: p.agacha + rr.corpo.agacha, estica: p.estica * rr.corpo.estica };
  const rosto = vivo(rr.rosto, f, "a1");
  const [hx, hy] = posCabeca(pose);
  return planos(f, [
    [
      0,
      () => (
        <Cena cam={camK(f, [[0, { x: 560, y: 1020, zoom: 1.15 }], [ESQ, { x: 560, y: 1000, zoom: 1.32 }, S]])}>
          <Fundo saturacao={0.6}><Sala /></Fundo>
          <Boneco2D id="a1" d={LUCAS} pose={pose} rosto={rosto} />
          <Carteira x={560} escala={0.75} />
          <Gota x={hx + 140} y={hy - 90} f={f} de={NERV + 6} />
        </Cena>
      ),
    ],
    [
      ESQ,
      () => (
        <>
          <Cena cam={camK(f, [[ESQ, { x: hx, y: hy + 120, zoom: 2.2 }], [IMAG, { x: hx, y: hy + 110, zoom: 2.45 }, S]])}>
            <Fundo saturacao={0.6}><Sala /></Fundo>
            <Boneco2D id="a1b" d={LUCAS} pose={pose} rosto={rosto} />
            <Carteira x={560} escala={0.75} />
            <Simbolo texto="?" x={hx - 170} y={hy - 200} f={f} de={ESQ + 6} />
          </Cena>
          <div style={{ position: "absolute", left: 600, top: 1230, transform: `rotate(5deg) scale(${mola(f, ESQ + 10)})`, background: "#fff", border: "6px solid #1d1424", borderRadius: 12, padding: "16px 24px", fontFamily: "Fredoka", fontWeight: 700, fontSize: 48, color: "#1d1424" }}>
            NOME: <span style={{ color: "#e8343f" }}>______ ?</span>
          </div>
        </>
      ),
    ],
    [
      IMAG,
      () => {
        const sombra = frente(560, { escala: ESC * 1.9, y: C + 380, cruzado: 1 });
        const [sx, sy] = posCabeca(sombra);
        const sobe = ip(f, [IMAG + 6, IMAG + 40], [140, 0], CURVA.sai);
        const t = { x: (random(`a1t${f}`) - 0.5) * (f > ERRAR ? 6 : 2), y: (random(`a1u${f}`) - 0.5) * (f > ERRAR ? 6 : 2) };
        return (
          <>
            <Cena cam={camK(f, [[IMAG, { x: 560, y: 900, zoom: 1.5 }], [A1_FIM, { x: 560, y: 820, zoom: 1.9 }, S]])} tremor={t}>
              <Fundo saturacao={0.6}><Sala /></Fundo>
              <rect x={-800} y={-600} width={3000} height={3000} fill="#5a0a14" opacity={ip(f, [IMAG, IMAG + 20], [0, 0.55])} />
              <g opacity={ip(f, [IMAG + 6, IMAG + 36], [0, 0.95])} transform={`translate(0 ${sobe})`}>
                <Boneco2D id="sombra" d={SOMBRA} pose={sombra} rosto={{ ...ROSTO_BASE, olhos: 0, sorriso: 0 }} />
                {[-1, 1].map((sd) => (
                  <path key={sd} transform={`translate(${sx + sd * 50 * ESC * 1.9} ${sy - 12 * ESC * 1.9}) rotate(${sd * 14})`} d="M -34 0 Q 0 -22 34 0 Q 0 10 -34 0 Z" fill="#ff2a3a" opacity={ip(f, [ERRAR - 6, ERRAR + 4], [0, 1])} />
                ))}
              </g>
              <Boneco2D id="a1c" d={LUCAS} pose={pose} rosto={rosto} />
              <Carteira x={560} escala={0.75} />
              <LinhasFoco f={f} cx={560} cy={700} forca={ip(f, [ERRAR, ERRAR + 10], [0.2, 0.6])} cor="#ff6a6a" raio={420} />
            </Cena>
            <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 30%, rgba(30,0,0,0.85) 100%)" }} />
          </>
        );
      },
    ],
  ]);
};

// =================================================================== A2 · mundo Hunter (→ "Seu avô")
const A2_0 = T("Você nasceu");
const A2_FIM = T("Seu avô sempre");
const PARA = T("e hoje é");
const PROVA = T("Prova Hunter");
const PASSO = 13;
const A2L = anima(
  A2_0,
  A2_FIM,
  (f) => {
    const u = f - A2_0;
    const andando = f < PARA;
    // caminhada de perfil com velocidade = passada (pés plantados pela camada de naturalidade)
    const tempoAndar = Math.min(u, PARA - A2_0);
    const x = 300 + tempoAndar * ((170 * ESC) / PASSO) * 0.92;
    const a = andarPerfil(u, andando ? 1 : Math.max(0, 1 - (f - PARA) / 8), PASSO);
    const g = giro(f, PARA + 4, 8);
    const base = g.trocou ? frente(x, { vira: 0.25 }) : perfil(x);
    return {
      L: {
        ...base,
        largura: g.largura,
        agacha: andando ? a.bob : mola(f, PARA, { mass: 1, stiffness: 140, damping: 12 }) * -2,
        inclina: andando ? a.inclina : 0,
        peE: g.trocou ? { dx: -30, dy: 0 } : a.peE,
        peD: g.trocou ? { dx: 30, dy: 0 } : a.peD,
        bracoE: g.trocou ? { ombro: 14, cotovelo: -16 } : a.bracoE,
        bracoD: g.trocou ? { ombro: 14, cotovelo: -16 } : a.bracoD,
        maoE: "punho",
        maoD: "punho",
        cabeca: g.trocou ? -4 : 0,
      },
    };
  },
  ["L"],
);
export const A2: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const p = A2L("L", f);
  const [hx] = posCabeca(p);
  const cam = camK(f, [
    [A2_0, { x: 700, y: 1060, zoom: 0.8 }],
    [PARA, { x: hx + 120, y: 1060, zoom: 0.85 }, S],
    [PROVA - 4, { x: 1100, y: 980, zoom: 0.8 }, S],
    [A2_FIM, { x: 1100, y: 760, zoom: 0.66 }, S],
  ]);
  const rosto = vivo(f < PARA ? { ...R.normal, sobrancelha: 8, sorriso: 0.3 } : R.determinado, f, "a2");
  return (
    <>
      <Cena cam={cam}>
        <Fundo><RuaLonga camX={cam.x} /></Fundo>
        <g transform={`translate(1100 ${C})`}>
          <rect x={-520} y={-1150} width={110} height={1150} fill="#6d6377" stroke={CONTORNO} strokeWidth={8} />
          <rect x={410} y={-1150} width={110} height={1150} fill="#6d6377" stroke={CONTORNO} strokeWidth={8} />
          <rect x={-580} y={-1240} width={1160} height={130} rx={14} fill="#3d3463" stroke={CONTORNO} strokeWidth={8} />
          <text x={0} y={-1150} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={84} fill="#ffd23f" stroke={CONTORNO} strokeWidth={10} paintOrder="stroke" transform={`scale(${1 + 0.08 * Math.max(0, 1 - Math.abs(f - PROVA - 6) / 10)})`}>
            PROVA HUNTER
          </text>
        </g>
        {CANDIDATOS.map((d, i) => {
          const r = respira(f, i * 5);
          return <Boneco2D key={i} id={`a2c${i}`} d={d} pose={frente(820 + i * 230, { escala: ESC * 0.82, y: C - 40, vira: i % 2 ? -0.3 : 0.3, estica: 1 + r * 0.01, cabeca: Math.sin(f * 0.04 + i) * 3 })} rosto={vivo(ROSTO_BASE, f, `a2c${i}`)} />;
        })}
        <Boneco2D id="a2" d={LUCAS} pose={p} rosto={rosto} />
      </Cena>
      <Selo texto="MUNDO HUNTER × HUNTER" de={T("mundo de Hunter") - t0 + t0} ate={PARA + 20} cor="#3d3463" />
    </>
  );
};

// =================================================================== A3 · o avô (FilmeMudo) (→ "Na fila")
const A3_0 = T("Seu avô sempre");
const A3_FIM = T("Na fila");
const QUEM = T("Quem respira");
const A3A = anima(A3_0, A3_FIM, (f) => {
  // respiração lenta e profunda (inspira 40 q, solta 40 q) + gesto: mão no peito → aponta
  const ciclo = Math.sin(((f - A3_0) / 80) * Math.PI * 2);
  const gesto = mola(f, QUEM - 4, { mass: 1, stiffness: 120, damping: 13 });
  const aponta = mola(f, T("não perde") - 6, { mass: 0.8, stiffness: 150, damping: 12 });
  return {
    V: frente(560, {
      vira: -0.2,
      estica: 1 + ciclo * 0.02,
      cabeca: -ciclo * 3,
      bracoE: { ombro: 20 + gesto * 30, cotovelo: -20 - gesto * 110 },
      bracoD: { ombro: 16 + aponta * 100, cotovelo: -12 - aponta * 30 },
      maoE: "aberta",
      maoD: aponta > 0.4 ? "aponta" : "bola",
    }),
  };
});
export const A3: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const fala = falaDe("Quem respira com calma não perde a luta");
  const r = f < QUEM ? { ...ROSTO_AVO_C, olhos: 0.1 } : ROSTO_AVO_C;
  return (
    <>
      <FilmeMudo>
        <Cena cam={camK(f, [[A3_0, { x: 560, y: 880, zoom: 1.35 }], [A3_FIM, { x: 560, y: 840, zoom: 1.6 }, S]])}>
          <Fundo><RuaLonga camX={600} /></Fundo>
          <Boneco2D id="avo" d={AVO} pose={A3A("V", f)} rosto={vivo(r, f, "avo", [fala])} />
        </Cena>
      </FilmeMudo>
      <Rotulo2 texto="vovô" x={300} y={480} de={A3_0 + 6} tamanho={70} cor="#fff6dc" />
    </>
  );
};

// =================================================================== A4 · a fila e o Diego (→ "Primeira fase")
const A4_0 = T("Na fila");
const A4_FIM = T("Primeira fase");
const BRACOS = T("Braços cruzados");
const CHORAR = T("Tenta não chorar");
const PERDER = T("Tenta não se perder");
const A4P = anima(A4_0, A4_FIM, (f) => {
  const g = f;
  const cochila = Math.max(0, Math.sin(g * 0.06)) ** 3; // cabeça cai e volta (cochilando em pé)
  const acorda = mola(f, CHORAR - 8, { mass: 0.8, stiffness: 160, damping: 12 });
  const fala = mola(f, PERDER - 4, { mass: 0.8, stiffness: 170, damping: 11 });
  return {
    D: frente(760, { cruzado: 1, vira: -0.3 * acorda, cabeca: (1 - acorda) * cochila * 14 - acorda * 2, inclina: (1 - acorda) * cochila * 2, estica: 1 + respira(g, 3) * 0.01 }),
    L: frente(380, {
      vira: 0.35,
      torce: 0,
      estica: 1 + respira(g, 8) * 0.01,
      inclina: fala * 5,
      bracoD: { ombro: 14 + fala * 90, cotovelo: -10 - fala * 20 },
      maoD: fala > 0.4 ? "aponta" : "bola",
      bracoE: { ombro: 12, cotovelo: -14 },
    }),
  };
});
const A4RD = atuado(A4_0, A4_FIM, (f) => (f < CHORAR - 6 ? { nome: "dorme", rosto: R.dormindo, tam: 0 } : f < PERDER + 10 ? { nome: "deboche", rosto: { ...R.debochado, olhar: [-0.7, 0] }, tam: 1 } : { nome: "irritado", rosto: { ...R.meioFechado, sobrancelha: 18, sorriso: -0.1, olhar: [-0.7, 0] }, tam: 0.8 }));
const A4RL = atuado(A4_0, A4_FIM, (f) => (f < CHORAR + 6 ? { nome: "olha", rosto: { ...R.normal, olhar: [0.7, 0] }, tam: 0 } : f < PERDER - 2 ? { nome: "bravo", rosto: { ...R.serio, sobrancelha: 22, olhar: [0.7, 0] }, tam: 1 } : { nome: "canto", rosto: { ...R.sorrisoCanto, olhar: [0.7, 0] }, tam: 0.6 }));
export const A4: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const d = A4P("D", f);
  const l = A4P("L", f);
  const rd = A4RD(f);
  const rl = A4RL(f);
  const dPose = { ...d, agacha: d.agacha + rd.corpo.agacha, estica: d.estica * rd.corpo.estica };
  const lPose = { ...l, agacha: l.agacha + rl.corpo.agacha, estica: l.estica * rl.corpo.estica };
  const rostoD = vivo({ ...rd.rosto, dormindo: f < CHORAR - 6 ? 0.4 + 0.4 * Math.max(0, Math.sin(f * 0.08)) : 0 }, f, "a4d", [falaDe("Tenta não chorar Cachinho")]);
  const rostoL = vivo(rl.rosto, f, "a4l", [falaDe("Tenta não se perder Topete")]);
  const [dx, dy] = posCabeca(dPose);
  const [lx, ly] = posCabeca(lPose);
  return planos(f, [
    [
      A4_0,
      () => (
        <Cena cam={camK(f, [[A4_0, { x: 1700, y: 1000, zoom: 0.7 }], [BRACOS, { x: 760, y: 980, zoom: 0.95 }, S]])}>
          <Fundo><RuaLonga camX={1000} /></Fundo>
          {CANDIDATOS.map((cd, i) => (
            <Boneco2D key={i} id={`a4c${i}`} d={cd} pose={frente(1150 + i * 240, { escala: ESC * 0.9, vira: -0.2, estica: 1 + respira(f, i * 4) * 0.01, cabeca: Math.sin(f * 0.05 + i) * 3 })} rosto={vivo(ROSTO_BASE, f, `a4c${i}`)} />
          ))}
          <Boneco2D id="a4d" d={DIEGO} pose={dPose} rosto={rostoD} />
        </Cena>
      ),
    ],
    [
      BRACOS,
      () => (
        <>
          <Cena cam={camK(f, [[BRACOS, { x: dx, y: dy + 220, zoom: 1.7 }], [CHORAR, { x: dx, y: dy + 180, zoom: 1.95 }, S]])}>
            <Fundo><RuaLonga camX={900} /></Fundo>
            <Boneco2D id="a4d2" d={DIEGO} pose={dPose} rosto={rostoD} />
          </Cena>
          {f < CHORAR - 6 ? <div style={{ position: "absolute", left: 640, top: 520 - ((f * 1.2) % 60), fontFamily: "Fredoka", fontWeight: 700, fontSize: 70 + ((f * 1.2) % 60) * 0.4, color: "#fff", WebkitTextStroke: "8px #1d1424", paintOrder: "stroke fill", opacity: 1 - ((f * 1.2) % 60) / 70 }}>z</div> : null}
        </>
      ),
    ],
    [
      CHORAR,
      () => (
        <Cena cam={camK(f, [[CHORAR, { x: (dx + lx) / 2, y: (dy + ly) / 2 + 200, zoom: 1.2 }], [A4_FIM, { x: (dx + lx) / 2, y: (dy + ly) / 2 + 190, zoom: 1.3 }, S]])}>
          <Fundo><RuaLonga camX={900} /></Fundo>
          <Boneco2D id="a4l" d={LUCAS} pose={lPose} rosto={rostoL} />
          <Boneco2D id="a4d3" d={DIEGO} pose={dPose} rosto={rostoD} />
          {f >= PERDER + 6 ? <path d={`M ${lx + 70} ${ly - 10} L ${(lx + dx) / 2 - 20} ${ly + 10} L ${(lx + dx) / 2 + 10} ${ly - 20} L ${dx - 70} ${dy}`} stroke="#ffe14a" strokeWidth={10} fill="none" strokeLinejoin="round" opacity={0.6 + 0.4 * Math.sin(f * 1.3)} /> : null}
        </Cena>
      ),
    ],
  ]);
};

// =================================================================== A5 · primeira fase: corrida (→ "Mas o seu corpo")
const A5_0 = T("Primeira fase");
const A5_FIM = T("Mas o seu corpo");
const LARGA = T("correr atrás");
const NINGUEM = T("Ninguém sabe");
const DISPARA = T("O Diego dispara");
const corre = (f: number, de: number, estilo: EstiloCorrida, ciclo: number, x0: number, sem: number): Pose => {
  const u = Math.max(0, f - de);
  const acel = Math.min(1, u / 14);
  const fase = u / ciclo + sem * 0.13;
  const pc = poseCorrida(fase, estilo, acel);
  const x = x0 + xCorrida(u, ciclo, estilo, ESC) * acel;
  return { ...perfil(x), peE: pc.peE, peD: pc.peD, agacha: pc.agacha, inclina: pc.inclina, estica: pc.estica, cabeca: pc.cabeca, bracoE: pc.bracoE, bracoD: pc.bracoD, maoE: pc.maoE, maoD: pc.maoD };
};
const A5P = anima(
  A5_0,
  A5_FIM,
  (f) => {
    const o: Record<string, Pose> = {
      L: corre(f, LARGA + 6, "normal", 16, 300, 0),
      D: f < DISPARA ? corre(f, LARGA + 2, "normal", 16, 180, 2) : corre(f, DISPARA, "ninja2", 12, 180 + xCorrida(DISPARA - LARGA - 2, 16, "normal", ESC), 0),
      X: corre(f, LARGA - 10, "normal", 15, 700, 4),
    };
    CANDIDATOS.forEach((_, i) => (o[`c${i}`] = corre(f, LARGA + 4 + i * 3, "normal", 15 + (i % 3), 80 - i * 170, i)));
    return o;
  },
  ["L", "D", "X"],
);
export const A5: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const l = A5P("L", f);
  const d = A5P("D", f);
  const camX = f < DISPARA ? l.x + 120 : Math.max(l.x + 120, (l.x + d.x) / 2 + 60);
  const rostoL = vivo(f < DISPARA + 8 ? R.determinado : R.surpreso, f, "a5l");
  const rostoD = vivo(f < DISPARA ? R.serio : { ...R.meioFechado, sobrancelha: 16, sorriso: 0.1 }, f, "a5d");
  return (
    <>
      <Cena cam={{ x: camX, y: 1080, zoom: f < NINGUEM ? 0.78 : 0.9 }}>
        <Fundo><RuaLonga camX={camX} /></Fundo>
        {CANDIDATOS.map((cd, i) => (
          <Boneco2D key={i} id={`a5c${i}`} d={cd} pose={{ ...A5P(`c${i}`, f), escala: ESC * 0.85, y: C - 30 }} rosto={vivo(R.cansado, f, `a5c${i}`)} />
        ))}
        <Boneco2D id="a5x" d={EXAMINADOR} pose={A5P("X", f)} rosto={vivo(R.serio, f, "a5x")} />
        <Boneco2D id="a5d" d={DIEGO} pose={d} rosto={rostoD} />
        <Boneco2D id="a5l" d={LUCAS} pose={l} rosto={rostoL} />
        {f >= DISPARA ? <LinhasMovimento f={f} x={d.x - 140} y={C - 380} dir={-1} forca={ip(f, [DISPARA, DISPARA + 10], [0, 1])} /> : null}
        <Poeira x={d.x - 60} y={C + 4} f={f} de={DISPARA} dur={18} largura={0.8} />
      </Cena>
      <Selo texto="FASE 1 · CORRIDA" de={A5_0 + 4} ate={NINGUEM} cor="#ff9b2f" />
      {f >= NINGUEM && f < DISPARA ? <Placar titulo="TEMPO" valor="??:??" x={540} y={300} de={NINGUEM} ate={DISPARA} /> : null}
    </>
  );
};

// =================================================================== A6 · infográficos (→ "Quarenta")
const A6_0 = T("Mas o seu corpo");
const A6_FIM = T("Quarenta quilômetros");
const GLAND = T("Você tem entre");
const ANCEST = T("Seus ancestrais");
const A6P = anima(A6_0, A6_FIM, (f) => {
  const u = f - A6_0;
  const pc = poseCorrida(u / 16, "normal", 1);
  return { L: { ...perfil(540), peE: pc.peE, peD: pc.peD, agacha: pc.agacha, inclina: pc.inclina, estica: pc.estica, cabeca: pc.cabeca, bracoE: pc.bracoE, bracoD: pc.bracoD, maoE: pc.maoE, maoD: pc.maoD } };
});
const BARRAS: [string, number, string][] = [
  ["humano", 0.95, "#ff9b2f"],
  ["cavalo", 0.7, "#9a8a7a"],
  ["lobo", 0.62, "#8a8aa0"],
  ["antílope", 0.35, "#b89a6a"],
  ["guepardo", 0.15, "#d8b04a"],
];
export const A6: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const l = A6P("L", f);
  return planos(f, [
    [
      A6_0,
      () => {
        const de = T("um dos melhores");
        return (
          <AbsoluteFill style={{ background: "#f6efe0" }}>
            <svg width={1080} height={1920}>
              <Papel x={60} y={230} w={960} h={900} grade />
              <TextoMao id="tit6" f={f} de={A6_0 + 6} x={540} y={330} texto="RESISTÊNCIA EM CORRIDA LONGA" tamanho={54} ancora="middle" />
              <Desenho f={f} de={A6_0 + 20} semente="eixo" tracos={eixos(180, 1040, 760, 640)} velocidade={70} />
              {BARRAS.map(([nome, v, cor], i) => {
                const y = 480 + i * 115;
                const larg = 620 * v * ip(f, [de + i * 6, de + i * 6 + 24], [0, 1], CURVA.sai);
                return (
                  <g key={nome}>
                    <rect x={200} y={y} width={larg} height={70} rx={12} fill={cor} stroke={CONTORNO} strokeWidth={6} />
                    <text x={190} y={y + 48} textAnchor="end" fontFamily="Patrick Hand" fontSize={40} fill={CONTORNO}>
                      {nome}
                    </text>
                  </g>
                );
              })}
              {f > T("planeta") ? <Desenho f={f} de={T("planeta")} semente="circ" tracos={[{ pontos: [[160, 450], [880, 440], [900, 560], [170, 570], [160, 450]], cor: "#e8343f", largura: 10, tremor: 4 }]} velocidade={90} /> : null}
              <g transform={`translate(0 ${-200})`}>
                <Boneco2D id="a6l" d={LUCAS} pose={{ ...l, y: 1880, escala: 0.5 }} rosto={vivo(R.determinado, f, "a6")} />
              </g>
            </svg>
          </AbsoluteFill>
        );
      },
    ],
    [
      GLAND,
      () => {
        const n = Math.round(ip(f, [T("dois e quatro"), T("milhões") + 10], [0, 4], CURVA.sai) * 10) / 10;
        const [hx, hy] = posCabeca(l);
        return (
          <>
            <Cena cam={camK(f, [[GLAND, { x: 600, y: 1100, zoom: 1.2 }], [ANCEST, { x: 620, y: 1060, zoom: 1.4 }, S]])}>
              <Fundo><RuaLonga camX={600 + (f - GLAND) * 9} /></Fundo>
              <Boneco2D id="a6b" d={LUCAS} pose={l} rosto={vivo({ ...R.determinado, suor: 0.8 }, f, "a6b")} />
              {[0, 1, 2].map((i) => (
                <Gota key={i} x={hx - 60 + i * 60} y={hy - 40 + i * 30} f={(f - GLAND + i * 13) % 40} de={0} escala={0.5} />
              ))}
              {/* vapor resfriando */}
              {new Array(6).fill(0).map((_, i) => {
                const u = ((f + i * 9) % 54) / 54;
                return <circle key={i} cx={hx - 120 + i * 40 - u * 60} cy={hy + 120 - u * 260} r={20 + u * 30} fill="#ffffff" opacity={0.5 * (1 - u)} />;
              })}
            </Cena>
            {/* lupa na pele: poros */}
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <g transform={`translate(780 1180) scale(${mola(f, T("glândulas") - 6)})`}>
                <circle r={190} fill="#f2c39d" stroke={CONTORNO} strokeWidth={10} />
                {new Array(9).fill(0).map((_, i) => {
                  const x = -110 + (i % 3) * 110;
                  const y = -110 + Math.floor(i / 3) * 110;
                  const gota = ((f + i * 7) % 30) / 30;
                  return (
                    <g key={i}>
                      <ellipse cx={x} cy={y} rx={14} ry={9} fill="#b47a5a" />
                      <circle cx={x} cy={y - gota * 26} r={9 * (1 - gota * 0.4)} fill="#9fd8ff" stroke={CONTORNO} strokeWidth={3} opacity={1 - gota} />
                    </g>
                  );
                })}
                <rect x={150} y={130} width={40} height={140} rx={16} fill="#6b4a36" stroke={CONTORNO} strokeWidth={8} transform="rotate(-40 150 130)" />
              </g>
            </svg>
            <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", fontFamily: "Fredoka", fontWeight: 700, color: "#fff", WebkitTextStroke: "10px #1d1424", paintOrder: "stroke fill" }}>
              <div style={{ fontSize: 120, color: "#ffd23f" }}>{n >= 2 ? `2 a ${Math.max(2, n).toFixed(0)}` : n.toFixed(0)} MILHÕES</div>
              <div style={{ fontSize: 60 }}>de glândulas de suor</div>
            </div>
          </>
        );
      },
    ],
    [
      ANCEST,
      () => {
        const u = f - ANCEST;
        const cansa = ip(f, [ANCEST, A6_FIM], [0, 1]);
        const h = corre(f, ANCEST - 30, "normal", 16, 500, 1);
        const camX = h.x + 380;
        return (
          <AbsoluteFill style={{ filter: "sepia(0.45) saturate(1.2)" }}>
            <Cena cam={{ x: camX, y: 1100, zoom: 0.85 }}>
              <Savana camX={camX} />
              <g transform={`translate(${h.x + 760 - cansa * 280} ${C - 10})`}>
                <Antilope fase={u * 0.6} cansado={cansa} />
              </g>
              <Boneco2D id="anc" d={SOMBRA} pose={{ ...h, escala: ESC * 0.9 }} rosto={{ ...ROSTO_BASE, olhos: 0 }} cel={{ luz: 0, sombra: 0, recorte: 14, corRecorte: "#ffb060", forcaRecorte: 1 }} />
            </Cena>
            <Rotulo2 texto="caça por persistência" x={540} y={330} de={ANCEST + 6} tamanho={70} cor="#fff6dc" />
          </AbsoluteFill>
        );
      },
    ],
  ]);
};

// =================================================================== A7 · 40 km, a água e o atalho (→ "Segunda fase")
const A7_0 = T("Quarenta quilômetros");
const A7_FIM = T("Segunda fase");
const DIVIDE = T("você divide");
const ENCONTRA = T("E encontra o Diego");
const ATALHO = T("Eu tava pegando");
const FOLEGO = T("Fôlego desbloqueado");
const A7P = anima(
  A7_0,
  A7_FIM,
  (f) => {
    const chega = corre(f, A7_0 - 40, "normal", 16, -400, 0);
    const parado = f >= DIVIDE - 20;
    const xStop = corre(DIVIDE - 20, A7_0 - 40, "normal", 16, -400, 0).x;
    const ajoelha = mola(f, DIVIDE - 8, { mass: 1, stiffness: 120, damping: 14 });
    const da = mola(f, DIVIDE + 14, { mass: 0.9, stiffness: 140, damping: 12 });
    const L: Pose = parado
      ? { ...perfil(xStop), agacha: ajoelha * 170, inclina: ajoelha * 14, peE: { dx: -70, dy: 0 }, peD: { dx: 90, dy: 0 }, bracoD: { ombro: 20 + da * 60, cotovelo: 20 + da * 10 }, bracoE: { ombro: 10, cotovelo: 30 }, cabeca: 6 }
      : chega;
    const bebe = mola(f, DIVIDE + 34);
    return {
      L,
      K: { ...perfil(xStop + 330, { lado: -1 }), agacha: 220, inclina: -8 + bebe * 4, peE: { dx: -40, dy: 0 }, peD: { dx: 160, dy: -10 }, bracoD: { ombro: 40 + bebe * 80, cotovelo: 90 }, bracoE: { ombro: -30, cotovelo: 20 }, cabeca: -bebe * 18 },
      D: corre(f, ENCONTRA - 10, "normal", 15, 1400, 3),
    };
  },
  ["L"],
);
export const A7: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const l = A7P("L", f);
  const kk = A7P("K", f);
  // Diego vem correndo na direção ERRADA (contra), para, e explica
  const d0 = A7P("D", f);
  const dStop = f >= ATALHO - 6;
  const xd = ip(f, [ENCONTRA - 10, ATALHO - 6], [2200, 1300], CURVA.suave);
  const d: Pose = dStop ? { ...frente(xd, { vira: -0.4 }), agacha: 20, inclina: -3, bracoE: { ombro: 20, cotovelo: -120 }, bracoD: { ombro: 14, cotovelo: -10 }, maoE: "aberta" } : { ...d0, x: xd, lado: -1 };
  const [kx, ky] = posMao(l, "D");
  return planos(f, [
    [
      A7_0,
      () => (
        <>
          <Cena cam={camK(f, [[A7_0, { x: l.x + 100, y: 1080, zoom: 0.95 }], [DIVIDE, { x: l.x + 160, y: 1100, zoom: 1.15 }, S], [ENCONTRA, { x: l.x + 170, y: 1100, zoom: 1.2 }, S]])}>
            <Fundo><RuaLonga camX={l.x} /></Fundo>
            <Boneco2D id="a7k" d={CANDIDATOS[2]} pose={kk} rosto={vivo(f < DIVIDE + 30 ? R.cansado : R.feliz, f, "a7k")} />
            <Boneco2D id="a7l" d={LUCAS} pose={l} rosto={vivo(f < DIVIDE ? R.cansado : R.feliz, f, "a7l")} naMao={f > DIVIDE + 10 ? <Garrafa escala={0.9} /> : undefined} />
            {f > DIVIDE + 10 ? <Simbolo texto="!" x={kx + 260} y={ky - 220} f={f} de={DIVIDE + 34} /> : null}
          </Cena>
          <Placar titulo="DISTÂNCIA" valor={`${Math.round(ip(f, [A7_0, A7_0 + 30], [37, 40]))} km`} x={540} y={300} de={A7_0} ate={DIVIDE} />
        </>
      ),
    ],
    [
      ENCONTRA,
      () => (
        <>
          <Cena cam={camK(f, [[ENCONTRA, { x: 1100, y: 1060, zoom: 0.95 }], [A7_FIM, { x: 1180, y: 1040, zoom: 1.15 }, S]])}>
            <Fundo><RuaLonga camX={1100} placa="CHEGADA →" /></Fundo>
            <Boneco2D id="a7l2" d={LUCAS} pose={frente(780, { vira: 0.5, cabeca: 4, estica: 1 + Math.sin(f * 0.25) * 0.02 * (f > FOLEGO ? 1 : 0) })} rosto={vivo(f < ATALHO ? R.surpreso : { ...R.debochado, olhar: [0.8, 0] }, f, "a7l2")} />
            <Boneco2D id="a7d" d={DIEGO} pose={d} rosto={vivo(dStop ? { ...R.envergonhado, suor: 0.8 } : R.determinado, f, "a7d", [falaDe("Eu tava pegando um atalho")])} />
          </Cena>
        </>
      ),
    ],
  ]);
};

export { A1_FIM, A7_FIM };
