import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Boneco2D, ROSTO_BASE, posCabeca } from "../../estilo2d/Boneco2D";
import { CHAO_Y, Carteira, Sala, Savana } from "../../estilo2d/Cenario2D";
import { Brilhos, Gota, LinhasFoco, Poeira, Simbolo, Veia } from "../../estilo2d/Efeitos2D";
import { Faiscas, Rastro } from "../../estilo2d/EfeitosLuta";
import { Antilope, Garrafa } from "../../estilo2d/Objetos";
import { Placar, Rotulo2, Selo } from "../../estilo2d/UI";
import { CURVA, andarPerfil, giro, k, respira, tremor } from "../../estilo2d/anim";
import { AVO, CANDIDATOS, DIEGO, EXAMINADOR, LUCAS } from "../../estilo2d/personagens";
import { Cachorro, Fundo, ObjetosFisica, RuaLonga } from "../../estilo2d/Acabamento";
import { ESC, Grade, Lembranca, Palco, ROSTO_AVO, ROSTO_DIEGO, Som, frente, perfil, vivo } from "./comum";
import { T, TF } from "./tempo";

type P = { t0: number };

const SOMBRA = {
  ...EXAMINADOR,
  pele: "#140a10",
  peleSombra: "#140a10",
  camisa: "#140a10",
  camisaSombra: "#140a10",
  manga: "#140a10",
  calca: "#140a10",
  calcaSombra: "#140a10",
  tenis: "#140a10",
  sola: "#140a10",
  corCabelo: "#140a10",
  corCabeloSombra: "#140a10",
  sobrancelha: "#140a10",
  brilhoCabelo: "#140a10",
  gravata: "#140a10",
  olhos: "#140a10",
};

// S01 — prova normal: esqueceu o próprio nome
export const S01: React.FC<P> = () => {
  const f = useCurrentFrame();
  const treme = Math.sin(f * 1.7) * 2;
  const pose = frente(560, { agacha: 70, inclina: 6 + treme * 0.3, cabeca: 10, bracoD: { ombro: 40, cotovelo: -70 }, maoD: "bola", bracoE: { ombro: 36, cotovelo: -60 } });
  const rosto = vivo({ ...ROSTO_BASE, olhos: 1.2, sobrancelha: -14, sobrancelhaY: 10, sorriso: -0.5, olhar: [0, 1] }, f, "s1");
  const cam = { x: 560, y: 1000, zoom: k(f, [[0, 1.15], [110, 1.35]]) };
  const [hx, hy] = posCabeca(pose);
  return (
    <>
      <Palco cam={cam}>
        <Fundo saturacao={0.6}><Sala /></Fundo>
        <Boneco2D id="s1" d={LUCAS} pose={pose} rosto={rosto} />
        <Carteira x={560} escala={0.75} />
        <Gota x={hx + 140} y={hy - 90} f={f} de={18} />
        <Simbolo texto="?" x={hx - 170} y={hy - 200} f={f} de={52} />
      </Palco>
      {/* folha da prova com o nome em branco */}
      <div style={{ position: "absolute", left: 640, top: 1200, transform: `rotate(4deg) scale(${interpolate(f, [30, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, background: "#fff", border: "6px solid #1d1424", borderRadius: 12, padding: "16px 24px", fontFamily: "Fredoka", fontWeight: 700, fontSize: 44, color: "#1d1424" }}>
        NOME: <span style={{ color: "#e8343f" }}>_______ ?</span>
      </div>
      <Som src="plim" de={52} volume={0.4} />
    </>
  );
};

// S02 — prova em que errar custa a vida
export const S02: React.FC<P> = () => {
  const f = useCurrentFrame();
  const pose = frente(560, { cabeca: k(f, [[0, 0], [20, -6]]), bracoE: { ombro: 10, cotovelo: -10 }, bracoD: { ombro: 10, cotovelo: -10 } });
  const rosto = vivo({ ...ROSTO_BASE, olhos: 1.28, sobrancelha: -18, sobrancelhaY: 18, sorriso: -0.9, boca: 0 }, f, "s2");
  const sh = tremor(f, 3);
  const sombraPose = frente(560, { escala: ESC * 1.9, y: CHAO_Y + 380, cruzado: 1 });
  const [sx, sy] = posCabeca(sombraPose);
  return (
    <>
      <Palco cam={{ x: 560 + sh.x, y: 900 + sh.y, zoom: k(f, [[0, 1.6], [115, 1.9]]) }}>
        <Fundo saturacao={0.6}><Sala /></Fundo>
        <rect x={-800} y={-600} width={3000} height={3000} fill="#5a0a14" opacity={0.55} />
        {/* sombra gigante do examinador surgindo atrás */}
        <g opacity={k(f, [[10, 0], [40, 0.95]])} transform={`translate(0 ${k(f, [[10, 120], [50, 0, CURVA.sai]])})`}>
          <Boneco2D id="s2sombra" d={SOMBRA} pose={sombraPose} rosto={{ ...ROSTO_BASE, olhos: 0, sorriso: 0 }} />
          {[-1, 1].map((sd) => (
            <path key={sd} transform={`translate(${sx + sd * 50 * ESC * 1.9} ${sy - 12 * ESC * 1.9}) rotate(${sd * 14})`} d="M -34 0 Q 0 -22 34 0 Q 0 10 -34 0 Z" fill="#ff2a3a" />
          ))}
        </g>
        <Boneco2D id="s2" d={LUCAS} pose={pose} rosto={rosto} />
        <LinhasFoco f={f} cx={560} cy={700} forca={0.5} cor="#ff6a6a" raio={420} />
      </Palco>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 30%, rgba(30,0,0,0.85) 100%)" }} />
      <Som src="rumble" de={0} volume={0.6} />
    </>
  );
};

// S03 — mundo Hunter: hoje é a Prova Hunter
export const S03: React.FC<P> = () => {
  const f = useCurrentFrame();
  const pose = frente(1100, { vira: 0.2, cabelo: Math.sin(f * 0.2) * 6, bracoE: { ombro: 16, cotovelo: -12 }, bracoD: { ombro: 16, cotovelo: -12 }, maoE: "punho", maoD: "punho" });
  const rosto = vivo({ ...ROSTO_BASE, sobrancelha: 12, sorriso: 0.3, olhos: 0.95 }, f, "s3");
  return (
    <>
      <Palco cam={{ x: 1100, y: k(f, [[0, 760], [120, 1000]]), zoom: k(f, [[0, 0.62], [120, 0.85]]) }}>
        <Fundo><RuaLonga camX={1100} /></Fundo>
        {/* portão da prova */}
        <g transform={`translate(1100 ${CHAO_Y})`}>
          <rect x={-520} y={-1150} width={110} height={1150} fill="#6d6377" stroke="#1d1424" strokeWidth={8} />
          <rect x={410} y={-1150} width={110} height={1150} fill="#6d6377" stroke="#1d1424" strokeWidth={8} />
          <rect x={-580} y={-1240} width={1160} height={130} rx={14} fill="#3d3463" stroke="#1d1424" strokeWidth={8} />
          <text x={0} y={-1150} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={84} fill="#ffd23f" stroke="#1d1424" strokeWidth={10} paintOrder="stroke">
            PROVA HUNTER
          </text>
        </g>
        {CANDIDATOS.map((d, i) => (
          <Boneco2D key={i} id={`s3c${i}`} d={d} pose={frente(560 + i * 260 + (i > 1 ? 300 : 0), { escala: ESC * 0.8, y: CHAO_Y - 30, vira: i % 2 ? -0.3 : 0.3 })} rosto={vivo(ROSTO_BASE, f, `s3c${i}`)} opacidade={0.95} />
        ))}
        <Boneco2D id="s3" d={LUCAS} pose={pose} rosto={rosto} />
      </Palco>
      <Selo texto="MUNDO HUNTER × HUNTER" de={6} ate={120} cor="#3d3463" />
      <Som src="whoosh" de={0} volume={0.4} />
      <Som src="brilho" de={8} volume={0.35} />
    </>
  );
};

// S04 — lembrança do avô
export const S04: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const falaDe = T("Quem respira") - t0;
  const falaAte = TF("perde a luta") - t0;
  const pose = frente(560, { vira: -0.2, bracoD: { ombro: k(f, [[falaDe, 20], [falaDe + 8, 120, CURVA.exagera]]), cotovelo: k(f, [[falaDe, -10], [falaDe + 8, -40]]) }, maoD: f > falaDe ? "aponta" : "bola", estica: 1 + respira(f) * 0.008 });
  const rosto = vivo({ ...ROSTO_AVO, sorriso: 0.6 }, f, "avo", falaDe, falaAte);
  return (
    <>
      <Lembranca>
        <Palco cam={{ x: 560, y: 850, zoom: k(f, [[0, 1.35], [124, 1.55]]) }}>
          <Fundo><RuaLonga camX={600} /></Fundo>
          <Boneco2D id="avo" d={AVO} pose={pose} rosto={rosto} />
        </Palco>
      </Lembranca>
      <Rotulo2 texto="vovô" x={300} y={480} de={6} tamanho={70} cor="#fff6dc" />
    </>
  );
};

// S05 — a fila de candidatos (câmera passa até o Diego)
export const S05: React.FC<P> = () => {
  const f = useCurrentFrame();
  const x = k(f, [[0, 500], [44, 1700, CURVA.suave]]);
  return (
    <Palco cam={{ x, y: 1000, zoom: 0.9 }}>
      <Fundo><RuaLonga camX={x} /></Fundo>
      {CANDIDATOS.map((d, i) => (
        <Boneco2D key={i} id={`s5c${i}`} d={d} pose={perfil(300 + i * 260, { estica: 1 + respira(f, i * 9) * 0.008 })} rosto={vivo(ROSTO_BASE, f, `s5c${i}`)} />
      ))}
      <Boneco2D id="s5d" d={DIEGO} pose={frente(1750, { cruzado: 1, cabeca: 6 })} rosto={{ ...ROSTO_DIEGO, olhos: 0 }} />
      <Cachorro x={2080} y={CHAO_Y + 30} escala={0.9} />
    </Palco>
  );
};

// S06 — Diego quase dormindo em pé
export const S06: React.FC<P> = () => {
  const f = useCurrentFrame();
  const cochila = Math.max(0, Math.sin(f * 0.08)) * 14;
  const pose = frente(560, { cruzado: 1, cabeca: 4 + cochila, inclina: cochila * 0.15, estica: 1 + respira(f) * 0.012 });
  const [hx, hy] = posCabeca(pose);
  return (
    <>
      <Palco cam={{ x: 560, y: 900, zoom: k(f, [[0, 1.2], [100, 1.4]]) }}>
        <Fundo><RuaLonga camX={1700} /></Fundo>
        <Cachorro x={860} y={CHAO_Y + 20} escala={0.85} />
        <Boneco2D id="s6" d={DIEGO} pose={pose} rosto={{ ...ROSTO_DIEGO, olhos: 0, sorriso: 0.1, canto: 0.3 }} />
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 18) % 54) / 54;
          return (
            <text key={i} x={hx + 150 + t * 90} y={hy - 140 - t * 160} fontFamily="Fredoka" fontWeight={700} fontSize={60 + i * 10} fill="#fff" stroke="#1d1424" strokeWidth={10} paintOrder="stroke" opacity={Math.sin(t * Math.PI)}>
              z
            </text>
          );
        })}
      </Palco>
      <Rotulo2 texto="Diego" x={300} y={420} de={2} tamanho={80} cor="#5fc27f" />
    </>
  );
};

// S07 — "Tenta não chorar, Cachinho."
export const S07: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const falaDe = T("Tenta não chorar") - t0;
  const falaAte = TF("chorar Cachinho") - t0;
  const pose = frente(1500, { cruzado: 1, vira: -0.5, cabeca: -4 });
  const rosto = vivo({ ...ROSTO_DIEGO, olhos: 0.5, canto: 1, olhar: [-1, 0] }, f, "s7", falaDe, falaAte);
  const lpose = frente(900, { vira: 0.5, bracoE: { ombro: 14, cotovelo: -8 }, bracoD: { ombro: 14, cotovelo: -8 } });
  const lrosto = vivo({ ...ROSTO_BASE, sobrancelha: 14, sorriso: -0.2, olhar: [1, 0] }, f, "s7l");
  const [hx, hy] = posCabeca(lpose);
  return (
    <Palco cam={{ x: 1250, y: 1000, zoom: 1.05 }}>
      <Fundo><RuaLonga camX={1250} /></Fundo>
      <Boneco2D id="s7l" d={LUCAS} pose={lpose} rosto={lrosto} />
      <Boneco2D id="s7" d={DIEGO} pose={pose} rosto={rosto} />
      <Veia x={hx + 80} y={hy - 90} f={f} de={falaAte - 4} escala={0.8} />
    </Palco>
  );
};

// S08 — "Tenta não se perder, Topete." + encarada
export const S08: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const falaDe = T("Tenta não se perder") - t0;
  const falaAte = TF("perder Topete") - t0;
  const lpose = frente(900, { vira: 0.5, inclina: 3, cabeca: -4, bracoD: { ombro: 60, cotovelo: -20 }, maoD: "aponta" });
  const lrosto = vivo({ ...ROSTO_BASE, sobrancelha: 14, canto: 1, sorriso: 0.5, olhar: [1, 0] }, f, "s8l", falaDe, falaAte);
  const dpose = frente(1500, { cruzado: 1, vira: -0.5, cabeca: -4 });
  const drosto = vivo({ ...ROSTO_DIEGO, olhos: 0.55, sobrancelha: 16, canto: 0.3, olhar: [-1, 0] }, f, "s8d");
  const [lx, ly] = posCabeca(lpose);
  const [dx, dy] = posCabeca(dpose);
  return (
    <>
      <Palco cam={{ x: 1200, y: 760, zoom: k(f, [[0, 1.3], [48, 1.5]]) }}>
        <Fundo><RuaLonga camX={1250} /></Fundo>
        <Boneco2D id="s8l" d={LUCAS} pose={lpose} rosto={lrosto} />
        <Boneco2D id="s8d" d={DIEGO} pose={dpose} rosto={drosto} />
        {f > falaAte - 6 ? (
          <path
            d={`M ${lx + 70} ${ly - 10} L ${(lx + dx) / 2 - 40} ${ly - 40} L ${(lx + dx) / 2 + 10} ${ly + 10} L ${dx - 70} ${dy - 10}`}
            stroke={random(`ra${Math.floor(f / 2)}`) > 0.5 ? "#ffd23f" : "#ffffff"}
            strokeWidth={14}
            fill="none"
            strokeLinejoin="bevel"
          />
        ) : null}
      </Palco>
      <Som src="clang" de={Math.max(0, falaAte - 6)} volume={0.25} />
    </>
  );
};

// S09 — Primeira fase: correr atrás do examinador
export const S09: React.FC<P> = () => {
  const f = useCurrentFrame();
  const camX = 1000 + f * 14;
  const run = (fase: number, x: number, extra = {}) => {
    const w = andarPerfil(f + fase, 1.2, 7);
    return perfil(x + f * 14, { y: CHAO_Y - w.bob, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: w.bracoD, inclina: 10, ...extra });
  };
  return (
    <>
      <Palco cam={{ x: camX, y: 1000, zoom: 0.8 }}>
        <Fundo><RuaLonga camX={camX} /></Fundo>
        <Boneco2D id="s9e" d={EXAMINADOR} pose={run(0, 1500, { inclina: 4 })} rosto={vivo({ ...ROSTO_BASE, olhos: 0.4, sorriso: 0.2 }, f, "ex")} />
        {CANDIDATOS.slice(0, 3).map((d, i) => (
          <Boneco2D key={i} id={`s9c${i}`} d={d} pose={run(i * 5, 1050 - i * 230)} rosto={vivo({ ...ROSTO_BASE, boca: 0.3 }, f, `s9c${i}`)} />
        ))}
        <Boneco2D id="s9d" d={DIEGO} pose={run(3, 1150)} rosto={vivo({ ...ROSTO_DIEGO, olhos: 0.5 }, f, "s9d")} />
        <Boneco2D id="s9l" d={LUCAS} pose={run(9, 880)} rosto={vivo({ ...ROSTO_BASE, sobrancelha: 8 }, f, "s9l")} />
      </Palco>
      <Selo texto="FASE 1: CORRIDA" de={2} ate={76} cor="#ff9b2f" />
      <Rotulo2 texto="examinador" x={800} y={560} de={20} tamanho={56} cor="#ffffff" />
    </>
  );
};

// S10 — Ninguém sabe por quanto tempo
export const S10: React.FC<P> = () => {
  const f = useCurrentFrame();
  const camX = 1200 + f * 16;
  return (
    <>
      <Palco cam={{ x: camX, y: 1050, zoom: 0.62 }}>
        <Fundo><RuaLonga camX={camX} /></Fundo>
        {[...CANDIDATOS, LUCAS, DIEGO, ...CANDIDATOS].map((d, i) => {
          const w = andarPerfil(f + i * 3, 1.1, 7);
          return <Boneco2D key={i} id={`s10_${i}`} d={d} pose={perfil(500 + i * 160 + f * 16, { y: CHAO_Y - w.bob + (i % 2) * 30, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: w.bracoD, inclina: 10 })} rosto={vivo({ ...ROSTO_BASE, boca: 0.25 }, f, `s10${i}`)} />;
        })}
      </Palco>
      <Placar titulo="TEMPO" valor={`??:${String(Math.floor(f / 3) % 60).padStart(2, "0")}`} x={540} y={430} de={4} />
    </>
  );
};

// S11 — Diego dispara na frente
export const S11: React.FC<P> = () => {
  const f = useCurrentFrame();
  const camX = 1000 + f * 14;
  const wl = andarPerfil(f, 1.1, 7);
  const wd = andarPerfil(f, 1.6, 4);
  const dx = k(f, [[0, 560], [14, 620], [40, 1900, CURVA.entra]]) + f * 14;
  return (
    <>
      <Palco cam={{ x: camX, y: 1000, zoom: 0.95 }}>
        <Fundo><RuaLonga camX={camX} /></Fundo>
        <Rastro x={dx} y={CHAO_Y} dir={1} forca={f > 14 ? 1 : 0} f={f} />
        <Boneco2D id="s11d" d={DIEGO} pose={perfil(dx, { y: CHAO_Y - wd.bob, peE: wd.peE, peD: wd.peD, bracoE: { ombro: -60, cotovelo: 30 }, bracoD: { ombro: -60, cotovelo: 30 }, inclina: 22 })} rosto={vivo({ ...ROSTO_DIEGO, olhos: 0.45, canto: 0.4 }, f, "s11d")} />
        <Boneco2D id="s11l" d={LUCAS} pose={perfil(950 + f * 14, { y: CHAO_Y - wl.bob, peE: wl.peE, peD: wl.peD, bracoE: wl.bracoE, bracoD: wl.bracoD, inclina: 9 })} rosto={vivo({ ...ROSTO_BASE, olhos: k(f, [[12, 1], [18, 1.25, CURVA.exagera]]), boca: 0.35, sobrancelhaY: 12 }, f, "s11l")} />
        <Poeira x={620 + 14 * 14} y={CHAO_Y} f={f} de={14} />
        <ObjetosFisica x={620 + 14 * 14} y={CHAO_Y - 40} f={f} de={14} n={12} chao={CHAO_Y + 30} velocidade={22} angulo={[-160, -110]} gravidade={0.6} semente="s11" desenho={(i) => <ellipse rx={14} ry={6} fill={["#a86a3a", "#c48a4a", "#8a5a30"][i % 3]} />} />
      </Palco>
      <Som src="whoosh" de={14} volume={0.5} />
    </>
  );
};

// S12 — vantagem real: corredores de longa distância (Lucas aponta pro gráfico)
export const S12: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const troca = T("o ser humano") - t0;
  const camX = 1000 + f * 12;
  const w = andarPerfil(f, 1, 8);
  if (f < troca) {
    return (
      <Palco cam={{ x: camX + 60, y: 900, zoom: 1.3 }}>
        <Fundo><RuaLonga camX={camX} /></Fundo>
        <Boneco2D id="s12" d={LUCAS} pose={perfil(1000 + f * 12, { y: CHAO_Y - w.bob, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: w.bracoD, inclina: 7 })} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.7, canto: 0.6 }, f, "s12")} />
      </Palco>
    );
  }
  const g = f - troca;
  const barras = [
    { nome: "Humano", v: 1, cor: "#f4c531" },
    { nome: "Cavalo", v: 0.82, cor: "#b07a52" },
    { nome: "Lobo", v: 0.74, cor: "#8c8597" },
    { nome: "Antílope", v: 0.42, cor: "#e39a3f" },
    { nome: "Guepardo", v: 0.12, cor: "#e8c24a" },
  ];
  const joia = g > T("do planeta") - t0 - troca;
  const aponta = k(g, [[4, 0], [14, 1, CURVA.exagera]]);
  const pose = frente(860, {
    y: 1580,
    escala: 0.56,
    vira: -0.45,
    cabeca: -6,
    bracoE: joia ? { ombro: 40, cotovelo: -110 } : { ombro: 14 + 136 * aponta, cotovelo: -8 + 8 * aponta },
    maoE: joia ? "joia" : aponta > 0.5 ? "aponta" : "bola",
    estica: 1 + Math.abs(Math.sin(g * 0.2)) * 0.02 * (joia ? 1 : 0),
  });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <Grade />
        <text x={540} y={380} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={60} fill="#fff">
          RESISTÊNCIA EM CORRIDA LONGA
        </text>
        {barras.map((b, i) => {
          const cresce = interpolate(g - i * 4, [0, 18], [0, b.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CURVA.exagera });
          const destaque = i === 0 && g > 20;
          return (
            <g key={b.nome} transform={`translate(70 ${470 + i * 118})`}>
              <text x={0} y={56} fontFamily="Fredoka" fontWeight={700} fontSize={46} fill="#fff">
                {b.nome}
              </text>
              <rect x={260} y={10} width={680 * cresce} height={64} rx={20} fill={b.cor} stroke={destaque ? "#ffffff" : "#1d1424"} strokeWidth={destaque ? 9 : 6} />
            </g>
          );
        })}
        <Boneco2D id="s12g" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, sorriso: joia ? 1 : 0.6, canto: 0.8, olhar: [-1, -1] }, g, "s12g")} />
        {joia ? <Brilhos x={860} y={1120} f={g} de={T("do planeta") - t0 - troca} raio={170} /> : null}
      </svg>
      <Rotulo2 texto="TOP 1!" x={880} y={470} de={22} tamanho={70} />
    </AbsoluteFill>
  );
};

// S13 — glândulas de suor (Lucas correndo no lugar, ligado ao corte da pele por uma lupa)
export const S13: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const troca = T("que resfriam") - t0;
  if (f < troca) {
    const w = andarPerfil(f, 0.9, 8);
    const lpose = perfil(230, { y: 1600, escala: 0.5, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: w.bracoD, inclina: 6 });
    const bracoX = 230 + 40 * 0.5;
    const bracoY = 1600 - 640 * 0.5;
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <Grade />
          {/* corte da pele (dentro de uma lupa) */}
          <defs>
            <clipPath id="lupaPele">
              <circle cx={620} cy={820} r={360} />
            </clipPath>
          </defs>
          <path d={`M ${bracoX + 30} ${bracoY - 10} L ${620 - 330} ${820 + 150} M ${bracoX + 40} ${bracoY + 20} L ${620 - 200} ${820 + 300}`} stroke="#fff" strokeWidth={5} strokeDasharray="14 12" opacity={0.7} />
          <circle cx={620} cy={820} r={386} fill="#e9eef0" stroke="#1d1424" strokeWidth={8} />
          <g clipPath="url(#lupaPele)">
            <rect x={200} y={440} width={900} height={800} fill="#9fd8ff" />
            <rect x={200} y={600} width={900} height={70} fill="#f2c39d" />
            <rect x={200} y={670} width={900} height={330} fill="#efa08f" />
            <rect x={200} y={1000} width={900} height={300} fill="#f6d77a" />
            {[380, 560, 740, 920].map((x, i) => {
              const sobe = ((f * 4 + i * 60) % 200) / 200;
              return (
                <g key={i}>
                  <path d={`M ${x} 670 L ${x} 860`} stroke="#5aa0d8" strokeWidth={12} />
                  <path d={`M ${x} 860 q -40 30 0 50 q 40 20 0 50 q -40 20 0 40`} stroke="#5aa0d8" strokeWidth={16} fill="none" strokeLinecap="round" />
                  <path d={`M ${x} ${600 - sobe * 140} q 18 22 0 34 q -18 -12 0 -34 Z`} fill="#bfe8ff" stroke="#1d1424" strokeWidth={4} opacity={1 - sobe} />
                </g>
              );
            })}
          </g>
          <circle cx={620} cy={820} r={360} fill="none" stroke="#1d1424" strokeWidth={8} />
          <Boneco2D id="s13r" d={LUCAS} pose={lpose} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.4, boca: 0.2 }, f, "s13r")} />
          <circle cx={bracoX + 30} cy={bracoY} r={46} fill="none" stroke="#ffd23f" strokeWidth={7} />
          <Gota x={230 + 100} y={1600 - 820 * 0.5} f={f} de={6} escala={0.6} />
        </svg>
        <Rotulo2 texto="2 a 4 milhões" x={620} y={330} de={T("dois e quatro milhões") - t0} tamanho={110} />
        <Rotulo2 texto="glândulas de suor" x={640} y={1440} de={T("glândulas") - t0} tamanho={60} cor="#ffffff" />
      </AbsoluteFill>
    );
  }
  const g = f - troca;
  const camX = 1000 + g * 12;
  const w = andarPerfil(g, 1, 8);
  const pose = perfil(1000 + g * 12, { y: CHAO_Y - w.bob, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: w.bracoD, inclina: 7 });
  const [hx, hy] = posCabeca(pose);
  return (
    <Palco cam={{ x: camX + 60, y: 900, zoom: 1.3 }}>
      <Fundo><RuaLonga camX={camX} /></Fundo>
      <Boneco2D id="s13" d={LUCAS} pose={pose} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.5, olhos: 0.8 }, g, "s13")} />
      <Gota x={hx - 120} y={hy - 60} f={g} de={2} escala={0.7} />
      {[0, 1, 2, 3].map((i) => {
        const t = ((g * 1.5 + i * 25) % 100) / 100;
        return <path key={i} d={`M ${hx + 260 - t * 500} ${hy + i * 120} q -40 -20 -80 0 q -40 20 -80 0`} stroke="#bfe8ff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={Math.sin(t * Math.PI)} />;
      })}
    </Palco>
  );
};

// S14 — ancestrais: caça por persistência (horas correndo até o animal cansar)
export const S14: React.FC<P> = () => {
  const f = useCurrentFrame();
  const camX = 1000 + f * 11;
  const cansado = interpolate(f, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const w = andarPerfil(f, 1, 8);
  const anX = 1560 + f * 11 - cansado * 330;
  const sombra = { ...LUCAS, camisa: "#3a1f2a", camisaSombra: "#3a1f2a", manga: "#3a1f2a", pele: "#3a1f2a", peleSombra: "#3a1f2a", calca: "#3a1f2a", calcaSombra: "#3a1f2a", tenis: "#3a1f2a", sola: "#3a1f2a", corCabelo: "#3a1f2a", corCabeloSombra: "#3a1f2a", numero: undefined };
  const lanca = (
    <g>
      <rect x={-6} y={-80} width={12} height={420} fill="#3a1f2a" />
      <path d="M -16 330 L 0 400 L 16 330 Z" fill="#3a1f2a" />
    </g>
  );
  return (
    <>
      <Palco cam={{ x: camX + 260, y: 1080, zoom: 1.0 }}>
        <Fundo saturacao={0.92} nevoa={0.04} cor="#ffd9a8"><Savana camX={camX - 1000} /></Fundo>
        {/* ondas de calor */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${camX - 300 + i * 260} ${CHAO_Y - 200 - ((f * 3 + i * 40) % 300)} q 30 -30 0 -60 q -30 -30 0 -60`} stroke="#fff1b8" strokeWidth={8} fill="none" opacity={0.35} strokeLinecap="round" />
        ))}
        <g transform={`translate(${anX} ${CHAO_Y - 40}) scale(1.35)`}>
          <Antilope fase={f} cansado={cansado} />
        </g>
        <Boneco2D id="s14" d={sombra} pose={perfil(1000 + f * 11, { y: CHAO_Y - 40 - w.bob, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: { ombro: 70, cotovelo: 50 }, inclina: 9 })} rosto={ROSTO_BASE} naMao={lanca} naMaoGira />
        <Poeira x={anX - 100} y={CHAO_Y - 40} f={f % 20} de={0} dur={20} />
      </Palco>
      <Rotulo2 texto="caça por persistência" x={540} y={420} de={10} tamanho={64} cor="#fff6dc" />
      <Rotulo2 texto="horas correndo..." x={540} y={540} de={40} tamanho={52} cor="#ffd23f" />
    </>
  );
};

// S15 — 40 km depois: divide a água
export const S15: React.FC<P> = () => {
  const f = useCurrentFrame();
  const oferece = k(f, [[30, 0], [44, 1, CURVA.exagera]]);
  const lpose = perfil(840, { agacha: 60, inclina: 18, bracoD: { ombro: 30 + 32 * oferece, cotovelo: 6 }, maoD: "punho" });
  const cpose = perfil(1350, { lado: -1, agacha: 340, inclina: 10, cabeca: 10, peE: { dx: 240, dy: 0 }, peD: { dx: 290, dy: 0 }, bracoE: { ombro: 26, cotovelo: 26 }, bracoD: { ombro: 34, cotovelo: 30 } });
  return (
    <>
      <Palco cam={{ x: 1080, y: 1060, zoom: 1.1 }}>
        <Fundo><RuaLonga camX={1300} /></Fundo>
        <Boneco2D id="s15c" d={CANDIDATOS[2]} pose={cpose} rosto={vivo({ ...ROSTO_BASE, olhos: k(f, [[0, 0.45], [50, 1]]), sorriso: k(f, [[0, -0.6], [50, 0.8]]), sobrancelha: -12 }, f, "s15c")} />
        <Boneco2D id="s15l" d={LUCAS} pose={lpose} rosto={vivo({ ...ROSTO_BASE, sorriso: 0.8 }, f, "s15l")} naMao={<Garrafa escala={0.9} />} />
        <Gota x={1300} y={980} f={f} de={0} escala={0.7} />
      </Palco>
      <Placar titulo="DISTÂNCIA" valor={`${Math.min(40, Math.round(k(f, [[0, 32], [24, 40, CURVA.sai]])))} km`} x={540} y={420} de={0} />
    </>
  );
};

// S16 — Diego correndo na direção errada
export const S16: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const aparece = T("correndo na direção") - t0;
  const wl = andarPerfil(f, 1, 8);
  const wd = andarPerfil(f, 1.4, 5);
  const dx = 2100 - Math.max(0, f - aparece + 10) * 26;
  const lolha = f > aparece + 6;
  return (
    <>
      <Palco cam={{ x: 1100, y: 1000, zoom: 0.92 }}>
        <Fundo><RuaLonga camX={1100} /></Fundo>
        {/* placa de chegada */}
        <g transform={`translate(1650 ${CHAO_Y})`}>
          <rect x={-10} y={-620} width={20} height={620} fill="#6e4b3a" />
          <rect x={-170} y={-700} width={340} height={110} rx={12} fill="#2e9b6a" stroke="#1d1424" strokeWidth={7} />
          <text x={0} y={-628} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={54} fill="#fff">
            CHEGADA →
          </text>
        </g>
        <Boneco2D id="s16l" d={LUCAS} pose={perfil(900, { y: CHAO_Y - wl.bob, peE: wl.peE, peD: wl.peD, bracoE: wl.bracoE, bracoD: wl.bracoD, inclina: 7 })} rosto={vivo({ ...ROSTO_BASE, olhos: lolha ? 1.25 : 0.9, boca: lolha ? 0.4 : 0, sobrancelhaY: lolha ? 14 : 0 }, f, "s16l")} />
        <Boneco2D id="s16d" d={DIEGO} pose={perfil(dx, { lado: -1, y: CHAO_Y - wd.bob, peE: wd.peE, peD: wd.peD, bracoE: wd.bracoE, bracoD: wd.bracoD, inclina: 14 })} rosto={vivo({ ...ROSTO_DIEGO, olhos: 0.5 }, f, "s16d")} />
        <Rastro x={dx} y={CHAO_Y} dir={-1} forca={f > aparece - 6 ? 0.8 : 0} f={f} />
      </Palco>
      <Simbolo texto="?!" x={300} y={600} f={f} de={aparece + 8} />
    </>
  );
};

// S17 — "Eu tava pegando um atalho."
export const S17: React.FC<P> = ({ t0 }) => {
  const f = useCurrentFrame();
  const falaDe = T("Eu tava pegando") - t0;
  const falaAte = TF("um atalho") - t0;
  const g = giro(f, 2, 8);
  const pose = g.trocou ? frente(1000, { vira: -0.4, largura: g.largura, bracoE: { ombro: 30, cotovelo: -120 }, bracoD: { ombro: 14, cotovelo: -8 }, cabeca: -8 }) : perfil(1000, { lado: -1, largura: g.largura });
  const [hx, hy] = posCabeca(pose);
  return (
    <Palco cam={{ x: 1000, y: 800, zoom: 1.6 }}>
      <Fundo><RuaLonga camX={1100} /></Fundo>
      <Boneco2D id="s17" d={DIEGO} pose={pose} rosto={vivo({ ...ROSTO_DIEGO, olhos: 0.5, olhar: [0.8, -0.6], canto: 0.9 }, f, "s17", falaDe, falaAte)} />
      <Gota x={hx + 150} y={hy - 120} f={f} de={falaAte - 6} escala={0.9} />
    </Palco>
  );
};

// S18 — Fôlego desbloqueado
export const S18: React.FC<P> = () => {
  const f = useCurrentFrame();
  const camX = 1000 + f * 12;
  const w = andarPerfil(f, 1, 8);
  return (
    <Palco cam={{ x: camX + 60, y: 980, zoom: 1.15 }}>
      <Fundo><RuaLonga camX={camX} /></Fundo>
      <Boneco2D id="s18" d={LUCAS} pose={perfil(1000 + f * 12, { y: CHAO_Y - w.bob, peE: w.peE, peD: w.peD, bracoE: w.bracoE, bracoD: { ombro: 150, cotovelo: 10 }, maoD: "punho", inclina: 6 })} rosto={vivo({ ...ROSTO_BASE, sorriso: 1, boca: 0.5 }, f, "s18")} />
      <Faiscas x={1000 + f * 12 + 40} y={CHAO_Y - 1000} f={f} de={2} cor="#ffd23f" />
    </Palco>
  );
};
