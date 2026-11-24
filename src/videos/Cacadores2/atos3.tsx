import { AbsoluteFill, random } from "remotion";
import { Boneco2D, PERFIL_BASE, POSE_BASE, posCabeca, posMao, type Pose } from "../../estilo2d/Boneco2D";
import { CURVA, kPose, respira } from "../../estilo2d/anim";
import { AURA_DIEGO, AURA_LUCAS, AuraForte, CorrentesAura, PunhoBrilhando } from "../../estilo2d/Aura";
import { Arena, CHAO_Y } from "../../estilo2d/Cenario2D";
import { Impacto, Poeira } from "../../estilo2d/Efeitos2D";
import { Faiscas, OndaChoque } from "../../estilo2d/EfeitosLuta";
import { Fundo, RuaLonga } from "../../estilo2d/Acabamento";
import { Coracao } from "../../estilo2d/Objetos";
import { FilmeMudo } from "../../estilo2d/Pintura";
import { GOLPES as G } from "../../estilo2d/golpes";
import { criarLuta } from "../../estilo2d/luta";
import { criarAnimacao } from "../../estilo2d/naturalidade";
import { AVO, DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Placar, Rotulo2, Selo } from "../../estilo2d/UI";
import { Cena, camK, falaDe, ip, mola, planos, R, ROSTO_AVO_C, S, T, useF, vivo } from "./base";

/** Atos 9–12: luta (luta.ts), respiração do avô, round 2 e final. */
const ESCL = 0.62;
const C = CHAO_Y;

// =================================================================== A9 · round 1 (luta.ts) (→ "Aí você lembra")
const A9_0 = T("Fase final");
const ATACA = T("Ele ataca");
const TRAVA = T("você trava");
const CORACAO = T("Seu coração dispara");
const AURA = T("sua aura explode");
const SOME = T("e some");
const ROUND1 = T("Primeiro round");
const LEVANTA = T("Ele só fala");
export const A9_FIM = T("Aí você lembra");
const BASE_L = { ...PERFIL_BASE, x: 340, y: C, escala: ESCL, lado: 1 as const };
const BASE_D = { ...PERFIL_BASE, x: 790, y: C, escala: ESCL, lado: -1 as const };
/** round 1: tempo de luta começa em "Fase final". Contatos alinhados com "você trava" e "Primeiro round". */
const LUTA1 = criarLuta({ L: { base: BASE_L, semente: 0 }, D: { base: BASE_D, semente: 3 } }, [
  { quem: "D", golpe: G.avanca, em: ATACA - A9_0 - 4 },
  { quem: "D", golpe: G.direto, alvo: "L", resposta: G.levaGolpe, forca: 1, depois: 0, ritmo: { preparo: 1.2 } },
  { quem: "D", golpe: G.chuteAlto, alvo: "L", resposta: G.queda, forca: 1.4, em: ROUND1 - A9_0 - 6 - 22, ritmo: { preparo: 1.3 } },
], { fim: A9_FIM - A9_0 + 10 });
const L1 = (id: string, f: number) => LUTA1.pose(id, Math.max(0, f - A9_0));
const QUEDA1 = A9_0 + (LUTA1.eventos.find((e) => e.tipo === "contato" && e.quem === "D" && e.alvo === "L" && e.forca > 1.2) as { f: number } | undefined)!.f;
const CONTATO1 = A9_0 + (LUTA1.eventos.find((e) => e.tipo === "contato") as { f: number }).f;

const estadoRosto = (id: "L" | "D", f: number) => {
  const e = LUTA1.estado(id, Math.max(0, f - A9_0));
  if (e.fase === "reacao") return e.golpe === "queda" ? (e.u < 14 ? R.dor : R.tonto) : R.dor;
  if (e.fase === "preparo") return R.foco;
  if (e.fase === "acao" || e.fase === "contato") return R.grito;
  return id === "L" ? R.nervoso : R.serio;
};

export const A9: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const lf = Math.max(0, f - A9_0);
  const l = L1("L", f);
  const d = L1("D", f);
  const congelado = LUTA1.congelado(lf);
  const eventosContato = LUTA1.eventos.filter((e) => e.tipo === "contato") as { f: number; x: number; y: number; forca: number }[];
  const efeitos = (
    <>
      {eventosContato.map((e, i) => (
        <g key={i}>
          <Impacto x={e.x} y={e.y} f={lf} de={e.f} dur={10} />
          <OndaChoque x={e.x} y={e.y} f={lf} de={e.f} dur={12} raio={200 + 120 * e.forca} achatado={0.8} />
        </g>
      ))}
      {LUTA1.eventos.filter((e) => e.tipo === "pouso").map((e, i) => (e.tipo === "pouso" ? <Poeira key={i} x={e.x} y={C + 4} f={lf} de={e.f} dur={22} largura={1.2} /> : null))}
    </>
  );
  const tremor = congelado ? { x: (random(`a9${f}`) - 0.5) * 14, y: (random(`a9y${f}`) - 0.5) * 14 } : undefined;
  return planos(f, [
    [
      A9_0,
      () => (
        <>
          <Cena cam={camK(f, [[A9_0, { x: 560, y: 1080, zoom: 0.9 }], [ATACA, { x: 560, y: 1060, zoom: 1.05 }, S]])}>
            <Fundo><Arena camX={560} tensao={0.6} /></Fundo>
            <Boneco2D id="a9d" d={DIEGO} pose={d} rosto={vivo(R.serio, f, "a9d")} cel={{ luz: -160, sombra: 28, recorte: 8, corRecorte: "#ffd0a0" }} />
            <Boneco2D id="a9l" d={LUCAS} pose={l} rosto={vivo(R.nervoso, f, "a9l")} cel={{ luz: -160, sombra: 28, recorte: 8, corRecorte: "#ffd0a0" }} />
          </Cena>
          <Selo texto="FASE FINAL · VOCÊ × DIEGO" de={A9_0 + 2} ate={ATACA - 2} cor="#e8343f" />
        </>
      ),
    ],
    [
      ATACA,
      () => {
        const cam = LUTA1.camera(lf);
        return (
          <Cena cam={{ ...cam, zoom: cam.zoom * (f >= CONTATO1 && f < CONTATO1 + 8 ? 1.12 : 1) }} tremor={tremor}>
            <Fundo><Arena camX={cam.x} tensao={0.6} /></Fundo>
            <Boneco2D id="a9d2" d={DIEGO} pose={d} rosto={vivo(estadoRosto("D", f), f, "a9d")} />
            <Boneco2D id="a9l2" d={LUCAS} pose={l} rosto={vivo(f < TRAVA ? R.nervoso : estadoRosto("L", f), f, "a9l")} />
            {efeitos}
          </Cena>
        );
      },
    ],
    [
      CORACAO,
      () => {
        const bate = Math.max(0, Math.sin(((f - CORACAO) / 30) * Math.PI * 2 * 3.2)) ** 6;
        const bpm = Math.round(ip(f, [CORACAO, AURA], [90, 190], CURVA.sai));
        const [hx, hy] = posCabeca(l);
        return (
          <>
            <Cena cam={{ x: hx, y: hy + 200, zoom: 1.9 + bate * 0.03 }} fundo="#2a0a14">
              <rect x={-3000} y={-3000} width={9000} height={9000} fill="#3a0a1a" />
              <Boneco2D id="a9c" d={LUCAS} pose={{ ...l, estica: l.estica * (1 + bate * 0.02) }} rosto={vivo({ ...R.medo, suor: 1 }, f, "a9c")} />
              <g transform={`translate(${hx + 40} ${hy + 250}) scale(${0.55 + bate * 0.1})`}>
                <Coracao />
              </g>
            </Cena>
            <Placar titulo="BATIMENTO" valor={`${bpm} bpm`} x={540} y={300} de={CORACAO} ate={AURA} />
          </>
        );
      },
    ],
    [
      AURA,
      () => {
        const explode = ip(f, [AURA, AURA + 14], [0, 1.4], CURVA.sai) * (1 - ip(f, [SOME, SOME + 14], [0, 1], CURVA.entra));
        const pisca = f > SOME - 6 && f < SOME + 14 ? (Math.floor(f / 2) % 2 ? 0.3 : 1) : 1;
        return (
          <Cena cam={{ x: l.x + 60, y: 1080, zoom: 1.2 }} tremor={{ x: (random(`au${f}`) - 0.5) * 12 * explode, y: (random(`av${f}`) - 0.5) * 12 * explode }}>
            <Fundo><Arena camX={l.x} tensao={0.8} /></Fundo>
            <g opacity={pisca}>
              <AuraForte x={l.x} chao={C} altura={900} f={f} forca={explode} caos={1} cor={AURA_LUCAS.cor} clara={AURA_LUCAS.clara} id="a9a" />
            </g>
            <Boneco2D id="a9l3" d={LUCAS} pose={{ ...l, agacha: l.agacha + 30, bracoE: { ombro: 60, cotovelo: 30 }, bracoD: { ombro: 70, cotovelo: 20 }, maoD: "aberta", maoE: "aberta" }} rosto={vivo(f < SOME ? R.grito : R.cansado, f, "a9l3")} />
          </Cena>
        );
      },
    ],
    [
      ROUND1 - 26,
      () => {
        const cam = LUTA1.camera(lf);
        return (
          <>
            <Cena cam={cam} tremor={tremor}>
              <Fundo><Arena camX={cam.x} tensao={0.6} /></Fundo>
              <Boneco2D id="a9d4" d={DIEGO} pose={d} rosto={vivo(estadoRosto("D", f), f, "a9d")} />
              <Boneco2D id="a9l4" d={LUCAS} pose={l} rosto={vivo(estadoRosto("L", f), f, "a9l")} />
              {efeitos}
            </Cena>
            <Selo texto="ROUND 1 · DIEGO" de={ROUND1} ate={LEVANTA - 2} cor="#2f9e57" />
          </>
        );
      },
    ],
    [
      LEVANTA,
      () => {
        // o Lucas continua no chão; o Diego fala de cima, sério, e vira o rosto
        const lChao = L1("L", Math.min(f, QUEDA1 + 30));
        const vira = mola(f, T("Não quero") - 4);
        const dPose: Pose = { ...POSE_BASE, x: lChao.x + 380, y: C, escala: ESCL, cruzado: 1, vira: -0.5 + vira * 0.3, cabeca: 8, estica: 1 + respira(f, 3) * 0.01 };
        const [hx, hy] = posCabeca(dPose);
        return (
          <Cena cam={camK(f, [[LEVANTA, { x: lChao.x + 60, y: hy + 330, zoom: 1.0 }], [A9_FIM, { x: lChao.x + 100, y: hy + 300, zoom: 1.08 }, S]])}>
            <Fundo><Arena camX={lChao.x} tensao={0.6} /></Fundo>
            <Boneco2D id="a9l5" d={LUCAS} pose={lChao} rosto={vivo(R.dor, f, "a9l5")} />
            <Boneco2D id="a9d5" d={DIEGO} pose={dPose} rosto={vivo({ ...R.serio, sobrancelha: 18, olhar: [-0.6, 0.5 - vira * 0.4] }, f, "a9d5", [falaDe("Levanta Não quero ganhar assim")])} />
            {hx ? null : null}
          </Cena>
        );
      },
    ],
  ]);
};

// =================================================================== A10 · respiração do avô (→ "Segundo round")
const A10_0 = T("Aí você lembra");
const RESPIRA = T("Você respira devagar");
const VIDA = T("Na vida real");
const HUNTER = T("No mundo Hunter faz");
export const A10_FIM = T("Segundo round");
const A10P = criarAnimacao(A10_FIM - A10_0 + 2, (i) => {
  const f = A10_0 + i;
  // respiração lenta (6/min ~ 300 q por ciclo; aqui acelerado pra caber: ~90 q) e o levantar no "mundo Hunter"
  const ciclo = Math.sin(((f - RESPIRA) / 90) * Math.PI * 2);
  const levanta = mola(f, HUNTER - 10, { mass: 1.3, stiffness: 70, damping: 16 });
  const sentado: Pose = { ...POSE_BASE, x: 540, y: C, escala: 0.72, agacha: 230, bracoE: { ombro: 26, cotovelo: -60 }, bracoD: { ombro: 26, cotovelo: -60 }, peE: { dx: -90, dy: 0 }, peD: { dx: 90, dy: 0 } };
  const de_pe: Pose = { ...POSE_BASE, x: 540, y: C, escala: 0.72, agacha: 40, bracoE: { ombro: 18, cotovelo: -30 }, bracoD: { ombro: 30, cotovelo: -60 }, maoD: "punho", maoE: "punho" };
  const p = kPose(levanta, [
    [0, sentado],
    [1, de_pe],
  ]);
  return { L: { ...p, estica: p.estica * (1 + ciclo * 0.025), cabeca: -ciclo * 3 } };
}, { chao: C, camera: false, pes: false });
export const A10: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const l = A10P.pose("L", f - A10_0);
  const rostoL = vivo(f < VIDA ? R.calmo : f < HUNTER ? { ...R.calmo, sorriso: 0.4 } : R.determinado, f, "a10");
  return planos(f, [
    [
      A10_0,
      () => (
        <>
          <FilmeMudo>
            <Cena cam={{ x: 560, y: 860, zoom: 1.5 }}>
              <Fundo><RuaLonga camX={600} /></Fundo>
              <Boneco2D id="avo2" d={AVO} pose={{ ...POSE_BASE, x: 560, y: C, escala: 0.72, vira: -0.2, estica: 1 + Math.sin(f * 0.07) * 0.02, bracoE: { ombro: 40, cotovelo: -120 }, maoE: "aberta" }} rosto={vivo({ ...ROSTO_AVO_C, olhos: 0.1 }, f, "avo2")} />
            </Cena>
          </FilmeMudo>
          <Rotulo2 texto="vovô" x={300} y={480} de={A10_0 + 6} tamanho={70} cor="#fff6dc" />
        </>
      ),
    ],
    [
      RESPIRA,
      () => {
        const u = f - RESPIRA;
        const onda = (y: number, per: number, cor: string, w: number, rot: string) => {
          const pts = new Array(60).fill(0).map((_, i) => {
            const x = 90 + i * 15;
            const fase = (i * 15) / per - u / per * 60;
            return `${i ? "L" : "M"} ${x} ${y + Math.sin(fase * Math.PI * 2) * 60}`;
          });
          const largura = ip(u, [0, 30], [0, 900]);
          return (
            <g>
              <clipPath id={`cl${rot}`}>
                <rect x={80} y={y - 100} width={largura} height={200} />
              </clipPath>
              <path d={pts.join(" ")} stroke={cor} strokeWidth={w} fill="none" strokeLinecap="round" clipPath={`url(#cl${rot})`} />
              <text x={540} y={y - 90} textAnchor="middle" fontFamily="Patrick Hand" fontSize={54} fill="#fff">
                {rot}
              </text>
            </g>
          );
        };
        return (
          <AbsoluteFill style={{ background: "#16243a" }}>
            <svg width={1080} height={1920}>
              {onda(520, 120, "#e8463c", 12, "de sempre: 12 a 20 por minuto")}
              {f >= T("seis vezes") ? onda(880, 330, "#5fd0ff", 14, "você agora: 6 por minuto") : null}
              <g transform="translate(0 260)">
                <Boneco2D id="a10r" d={LUCAS} pose={{ ...l, y: 1600, escala: 0.62 }} rosto={rostoL} />
              </g>
            </svg>
          </AbsoluteFill>
        );
      },
    ],
    [
      VIDA,
      () => {
        const estresse = ip(f, [T("diminui"), T("estresse") + 20], [0.92, 0.18], CURVA.suave);
        const cor = estresse > 0.5 ? "#e8463c" : "#3fbf5a";
        return (
          <>
            <Cena cam={{ x: 540, y: 1150, zoom: 1.25 }} fundo="#16243a">
              <rect x={-2000} y={-2000} width={6000} height={6000} fill="#1c2c44" />
              <Boneco2D id="a10v" d={LUCAS} pose={l} rosto={rostoL} />
            </Cena>
            <div style={{ position: "absolute", top: 260, left: 140, width: 800, textAlign: "center", fontFamily: "Fredoka", fontWeight: 700, color: "#fff", fontSize: 56 }}>
              VIDA REAL · ESTRESSE
              <div style={{ marginTop: 20, height: 70, border: "8px solid #1d1424", borderRadius: 40, background: "#fff", overflow: "hidden" }}>
                <div style={{ width: `${estresse * 100}%`, height: "100%", background: cor }} />
              </div>
            </div>
          </>
        );
      },
    ],
    [
      HUNTER,
      () => {
        const conc = ip(f, [T("para de vazar"), T("no punho") + 10], [0, 1], CURVA.suave);
        const [mx, my] = posMao(l, "D");
        return (
          <>
            <Cena cam={camK(f, [[HUNTER, { x: 540, y: 1100, zoom: 1.0 }], [A10_FIM, { x: 560, y: 1150, zoom: 1.2 }, S]])} fundo="#141024">
              <Fundo><Arena camX={540} tensao={0.8} /></Fundo>
              <AuraForte x={540} chao={C} altura={860} f={f} forca={0.9 * (1 - conc)} caos={0.6 * (1 - conc)} cor={AURA_LUCAS.cor} clara={AURA_LUCAS.clara} id="a10a" />
              <CorrentesAura x={540} chao={C} altura={860} alvoX={mx} alvoY={my} f={f} prog={conc} cor={AURA_LUCAS.cor} clara={AURA_LUCAS.clara} id="a10c" />
              <Boneco2D id="a10h" d={LUCAS} pose={l} rosto={rostoL} />
              <PunhoBrilhando x={mx} y={my} f={f} forca={conc} id="a10p" />
            </Cena>
            {conc > 0.6 ? <Rotulo2 texto="AURA NO PUNHO" x={540} y={340} de={T("no punho")} tamanho={84} cor="#7fe0ff" /> : null}
          </>
        );
      },
    ],
  ]);
};

// =================================================================== A11 · round 2 (→ "Você estende")
const A11_0 = T("Segundo round");
const TRES = T("Três");
const DOIS = T("dois um");
const UM = T("um um soco");
const SOCO = T("um soco só");
const VOA = T("O Diego voa");
const LICENCA = T("Licença Hunter desbloqueada");
export const A11_FIM = T("Você estende");
const B2L = { ...PERFIL_BASE, x: 360, y: C, escala: ESCL, lado: 1 as const };
const B2D = { ...PERFIL_BASE, x: 800, y: C, escala: ESCL, lado: -1 as const };
/** round 2: o soco só — carga longa (respirou), contato em "só", Diego voa (queda com força 2,6) */
const LUTA2 = criarLuta({ L: { base: B2L, semente: 1 }, D: { base: B2D, semente: 4 } }, [
  { quem: "L", golpe: G.direto, alvo: "D", resposta: G.queda, forca: 2.6, hitstop: 8, em: T("só", 2) - A11_0 - 2 - 7 * 2.4 - 3, ritmo: { preparo: 2.4, recupera: 1.4 } },
], { fim: A11_FIM - A11_0 + 10 });
const CONTATO2 = A11_0 + (LUTA2.eventos.find((e) => e.tipo === "contato") as { f: number }).f;
export const A11: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const lf = Math.max(0, f - A11_0);
  const l = LUTA2.pose("L", lf);
  const d = LUTA2.pose("D", lf);
  const [mx, my] = posMao(l, "E");
  const close = (pose: Pose, d0: typeof LUCAS, id: string, rosto: typeof R.foco, extra?: React.ReactNode) => {
    const [hx, hy] = posCabeca(pose);
    return (
      <Cena cam={{ x: hx, y: hy + 40, zoom: 3.3 + (f % 1000) * 0.002 }} fundo="#141024">
        <Fundo><Arena camX={hx} tensao={0.9} /></Fundo>
        <Boneco2D id={id} d={d0} pose={pose} rosto={vivo(rosto, f, id)} />
        {extra}
      </Cena>
    );
  };
  const eventos = LUTA2.eventos;
  const contato = eventos.find((e) => e.tipo === "contato") as { f: number; x: number; y: number } | undefined;
  return planos(f, [
    [
      A11_0,
      () => (
        <Cena cam={{ x: 580, y: 1080, zoom: 1.0 + (f - A11_0) * 0.002 }}>
          <Fundo><Arena camX={580} tensao={0.9} /></Fundo>
          <Boneco2D id="a11d" d={DIEGO} pose={d} rosto={vivo(R.foco, f, "a11d")} />
          <Boneco2D id="a11l" d={LUCAS} pose={l} rosto={vivo(R.calmo, f, "a11l")} />
          <PunhoBrilhando x={mx} y={my} f={f} forca={0.7} id="a11p" />
        </Cena>
      ),
    ],
    [TRES, () => close(l, LUCAS, "c3", R.calmo)],
    [DOIS, () => close(d, DIEGO, "c2", { ...R.foco, olhar: [-0.2, 0] })],
    [UM, () => {
      const [px, py] = posMao(l, "E");
      return (
        <Cena cam={{ x: px, y: py, zoom: 2.6 }} fundo="#141024">
          <Fundo><Arena camX={px} tensao={0.9} /></Fundo>
          <Boneco2D id="c1" d={LUCAS} pose={l} rosto={vivo(R.determinado, f, "c1")} />
          <PunhoBrilhando x={px} y={py} f={f} forca={1.1} id="c1p" />
        </Cena>
      );
    }],
    [
      SOCO,
      () => {
        const cam = LUTA2.camera(lf);
        const cong = LUTA2.congelado(lf);
        const inv = f >= CONTATO2 + 1 && f < CONTATO2 + 3;
        const t = cong ? { x: (random(`s2${f}`) - 0.5) * 24, y: (random(`s2y${f}`) - 0.5) * 24 } : undefined;
        return (
          <AbsoluteFill style={{ filter: inv ? "invert(1) hue-rotate(180deg)" : undefined }}>
            <Cena cam={{ ...cam, zoom: cam.zoom * (f >= CONTATO2 && f < CONTATO2 + 10 ? 1.18 : 1) }} tremor={t}>
              <Fundo><Arena camX={cam.x} tensao={0.9} /></Fundo>
              <Boneco2D id="a11d2" d={DIEGO} pose={d} rosto={vivo(f < CONTATO2 ? R.surpreso : f < VOA + 10 ? R.dor : R.tonto, f, "a11d2")} />
              <Boneco2D id="a11l2" d={LUCAS} pose={l} rosto={vivo(f < CONTATO2 - 4 ? R.determinado : R.grito, f, "a11l2")} />
              {f < CONTATO2 + 2 ? <PunhoBrilhando x={mx} y={my} f={f} forca={1.2} id="a11p2" /> : null}
              {contato ? (
                <>
                  <OndaChoque x={contato.x} y={contato.y} f={lf} de={contato.f} dur={16} raio={600} achatado={0.8} cor="#bfefff" />
                  <Faiscas x={contato.x} y={contato.y} f={lf} de={contato.f} dur={18} cor="#7fe0ff" n={22} alcance={460} />
                  <Impacto x={contato.x} y={contato.y} f={lf} de={contato.f} dur={14} />
                </>
              ) : null}
              {eventos.filter((e) => e.tipo === "pouso").map((e, i) => (e.tipo === "pouso" ? <Poeira key={i} x={e.x} y={C + 4} f={lf} de={e.f} dur={26} largura={1.5} /> : null))}
              {/* corda / limite da arena (ele cai pra fora) */}
              <rect x={-140} y={C - 10} width={30} height={60} fill="#5a4a3a" />
            </Cena>
            {f >= CONTATO2 && f < CONTATO2 + 2 ? <AbsoluteFill style={{ background: "#fff" }} /> : null}
          </AbsoluteFill>
        );
      },
    ],
    [
      LICENCA,
      () => (
        <Cena cam={{ x: l.x + 80, y: 1080, zoom: 1.2 }}>
          <Fundo><Arena camX={l.x} tensao={0.3} /></Fundo>
          <AuraForte x={l.x} chao={C} altura={760} f={f} forca={0.45} caos={0.05} cor={AURA_LUCAS.cor} clara={AURA_LUCAS.clara} id="a11f" />
          <Boneco2D id="a11l3" d={LUCAS} pose={{ ...POSE_BASE, x: l.x, y: C, escala: 0.72, vira: 0.2, agacha: 10, bracoD: { ombro: 150, cotovelo: -20 }, maoD: "punho", estica: 1 + mola(f, LICENCA) * 0.02 }} rosto={vivo(R.feliz, f, "a11l3")} />
        </Cena>
      ),
    ],
  ]);
};

// =================================================================== A12 · aperto de mão, piada e moral (→ fim)
const A12_0 = T("Você estende");
const ACEITA = T("Ele aceita");
const DEPOIS = T("Dois segundos depois");
const CLARO = T("Claro Topete");
const FORCA = T("Força sem controle");
const QUEM2 = T("Quem respira", 1);
const COMENTA = T("Comenta qual");
const A12P = criarAnimacao(COMENTA - A12_0 + 2, (i) => {
  const f = A12_0 + i;
  const estende = mola(f, A12_0 + 6, { mass: 1, stiffness: 110, damping: 14 });
  const puxa = mola(f, ACEITA + 8, { mass: 1.2, stiffness: 90, damping: 14 });
  const L: Pose = { ...PERFIL_BASE, x: 420, y: C, escala: 0.72, inclina: estende * 10 - puxa * 8, agacha: estende * 30, torce: -puxa * 0.3, bracoD: { ombro: 20 + estende * 60, cotovelo: 20 - estende * 10 }, maoD: "aberta" };
  const D: Pose = puxa < 0.05
    ? { ...PERFIL_BASE, x: 690, y: C, escala: 0.72, lado: -1, agacha: 230, inclina: -10, peE: { dx: -40, dy: 0 }, peD: { dx: 160, dy: -10 }, bracoD: { ombro: estende * 70, cotovelo: 30 }, bracoE: { ombro: -30, cotovelo: 20 } }
    : kPose(puxa, [
        [0, { ...PERFIL_BASE, x: 690, y: C, escala: 0.72, lado: -1, agacha: 230, inclina: -10, peE: { dx: -40, dy: 0 }, peD: { dx: 160, dy: -10 }, bracoD: { ombro: 70, cotovelo: 30 }, bracoE: { ombro: -30, cotovelo: 20 } }],
        [1, { ...PERFIL_BASE, x: 660, y: C, escala: 0.72, lado: -1, agacha: 20, inclina: 6, bracoD: { ombro: 66, cotovelo: 16 }, maoD: "aberta" }],
      ]);
  return { L, D };
}, { chao: C, camera: false, pes: ["L", "D"] });
export const A12: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const i = f - A12_0;
  return planos(f, [
    [
      A12_0,
      () => (
        <Cena cam={camK(f, [[A12_0, { x: 560, y: 1100, zoom: 1.15 }], [DEPOIS, { x: 560, y: 1080, zoom: 1.3 }, S]])}>
          <Fundo><Arena camX={560} tensao={0.2} /></Fundo>
          <Boneco2D id="a12d" d={DIEGO} pose={A12P.pose("D", i)} rosto={vivo({ ...R.meioFechado, sorriso: 0, olhar: [0.3, 0.4] }, f, "a12d")} />
          <Boneco2D id="a12l" d={LUCAS} pose={A12P.pose("L", i)} rosto={vivo(R.feliz, f, "a12l")} />
        </Cena>
      ),
    ],
    [
      DEPOIS,
      () => {
        const vira = mola(f, T("Eu deixei") - 6);
        return (
          <>
            <Cena cam={camK(f, [[DEPOIS, { x: 640, y: 1040, zoom: 1.6 }], [CLARO, { x: 640, y: 1030, zoom: 1.75 }, S]])}>
              <Fundo><Arena camX={600} tensao={0.2} /></Fundo>
              <Boneco2D id="a12d2" d={DIEGO} pose={{ ...POSE_BASE, x: 680, y: C, escala: 0.72, cruzado: 1, vira: 0.5 * vira, cabeca: -4 }} rosto={vivo({ ...R.envergonhado, olhar: [0.8, -0.2] }, f, "a12d2", [falaDe("Eu deixei você ganhar")])} />
            </Cena>
            <Rotulo2 texto="2 segundos depois..." x={540} y={330} de={DEPOIS + 2} tamanho={60} cor="#fff" />
          </>
        );
      },
    ],
    [
      CLARO,
      () => (
        <Cena cam={{ x: 470, y: 1030, zoom: 1.7 }}>
          <Fundo><Arena camX={500} tensao={0.2} /></Fundo>
          <Boneco2D id="a12l2" d={LUCAS} pose={{ ...POSE_BASE, x: 440, y: C, escala: 0.72, vira: 0.4, bracoE: { ombro: 12, cotovelo: -14 } }} rosto={vivo({ ...R.debochado, olhar: [0.7, 0] }, f, "a12l2", [falaDe("Claro Topete")])} />
        </Cena>
      ),
    ],
    [
      FORCA,
      () => (
        <Cena cam={{ x: 540, y: 1080, zoom: 1.0 }} fundo="#141024">
          <rect x={-3000} y={-3000} width={9000} height={9000} fill="#141024" />
          {/* força sem controle (aura caótica, barulho) × calma (aura no punho) */}
          <AuraForte x={300} chao={C} altura={760} f={f} forca={0.9} caos={1} cor="#e8463c" clara="#ffb0a8" id="mf1" />
          <Boneco2D id="mf1l" d={LUCAS} pose={{ ...POSE_BASE, x: 300, y: C, escala: 0.6, agacha: 30, bracoE: { ombro: 70, cotovelo: 20 }, bracoD: { ombro: 70, cotovelo: 20 }, maoE: "aberta", maoD: "aberta", estica: 1 + Math.sin(f * 0.8) * 0.02 }} rosto={vivo(R.grito, f, "mf1")} />
          <Boneco2D id="mf2l" d={LUCAS} pose={{ ...POSE_BASE, x: 780, y: C, escala: 0.6, agacha: 20, bracoD: { ombro: 26, cotovelo: -60 }, maoD: "punho" }} rosto={vivo(R.calmo, f, "mf2")} />
          <PunhoBrilhando x={posMao({ ...POSE_BASE, x: 780, y: C, escala: 0.6, agacha: 20, bracoD: { ombro: 26, cotovelo: -60 } }, "D")[0]} y={posMao({ ...POSE_BASE, x: 780, y: C, escala: 0.6, agacha: 20, bracoD: { ombro: 26, cotovelo: -60 } }, "D")[1]} f={f} forca={0.9} id="mf2p" />
          <text x={300} y={760} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={60} fill="#ffb0a8">barulho</text>
          <text x={780} y={760} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={60} fill="#7fe0ff">controle</text>
        </Cena>
      ),
    ],
    [
      QUEM2,
      () => (
        <FilmeMudo>
          <Cena cam={{ x: 560, y: 880, zoom: 1.4 }}>
            <Fundo><RuaLonga camX={600} /></Fundo>
            <Boneco2D id="avo3" d={AVO} pose={{ ...POSE_BASE, x: 560, y: C, escala: 0.72, vira: -0.2, estica: 1 + Math.sin(f * 0.07) * 0.02, bracoE: { ombro: 40, cotovelo: -120 }, maoE: "aberta" }} rosto={vivo(ROSTO_AVO_C, f, "avo3", [falaDe("Quem respira com calma não perde a luta")])} />
          </Cena>
        </FilmeMudo>
      ),
    ],
    [
      COMENTA,
      () => (
        <>
          <Cena cam={{ x: 560, y: 1150, zoom: 1.05 }} fundo="#141024">
            <rect x={-3000} y={-3000} width={9000} height={9000} fill="#1a1430" />
            <AuraForte x={360} chao={C} altura={760} f={f} forca={0.6} caos={0.1} cor={AURA_LUCAS.cor} clara={AURA_LUCAS.clara} id="ctaL" />
            <AuraForte x={760} chao={C} altura={760} f={f} forca={0.6} caos={0.1} cor={AURA_DIEGO.cor} clara={AURA_DIEGO.clara} id="ctaD" />
            <Boneco2D id="ctal" d={LUCAS} pose={{ ...POSE_BASE, x: 360, y: C, escala: 0.66, vira: 0.3, bracoD: { ombro: 100, cotovelo: -10 }, maoD: "aponta" }} rosto={vivo(R.feliz, f, "ctal")} />
            <Boneco2D id="ctad" d={DIEGO} pose={{ ...POSE_BASE, x: 760, y: C, escala: 0.66, vira: -0.3, cruzado: 1 }} rosto={vivo(R.sorrisoCanto, f, "ctad")} />
          </Cena>
          <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: "Fredoka", fontWeight: 700, transform: `scale(${mola(f, COMENTA + 2)})` }}>
            <div style={{ display: "inline-block", background: "#fff", border: "8px solid #1d1424", borderRadius: 30, padding: "16px 36px", fontSize: 64, color: "#1d1424" }}>Qual seria o seu Nen?</div>
            <div style={{ marginTop: 26 }}>
              <span style={{ display: "inline-block", background: "#e8343f", border: "8px solid #1d1424", borderRadius: 30, padding: "12px 30px", fontSize: 56, color: "#fff", transform: `scale(${mola(f, T("segue") - 2)})` }}>SEGUE → PARTE 2</span>
            </div>
          </div>
        </>
      ),
    ],
  ]);
};

export { CONTATO2, QUEDA1 };
