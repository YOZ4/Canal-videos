import { random } from "remotion";
import { Boneco2D, Chapeu, alcancar, posCabeca, posMao, type Pose } from "../../estilo2d/Boneco2D";
import { andar, trocaRosto } from "../../estilo2d/anim";
import { COMERCIANTES_1, COMERCIANTES_2, LUSTIG, LUSTIG_RUA, POISSON, type Design } from "../../estilo2d/personagens";
import { Calcamento, CeuParis, Documento, EtiquetaHUD, MesaToalha, Numero3D, PredisParis, SalaoHotel, Torre3D, TorrePlana } from "../../estilo2d/Cenarios1925";
import { Gota } from "../../estilo2d/Efeitos2D";
import { CURVA, M, P, RC, RL, RP, entraSai, k, lin, pisca, resp, tremor, vivo } from "./comum";

const W = 1080;
const H = 1920;
/** filtro de desfoque reutilizável */
export const Desf: React.FC<{ id: string; px: number; children: React.ReactNode }> = ({ id, px, children }) =>
  px < 0.3 ? (
    <>{children}</>
  ) : (
    <g filter={`url(#${id})`}>
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={px} />
        </filter>
      </defs>
      {children}
    </g>
  );

/** escala de uma camada em profundidade z (camZf = posição final da câmera) */
const esc = (z: number, camZ: number, camZf = -700) => (z - camZf) / Math.max(1, z - camZ);
const camada = (z: number, camZ: number, foco: [number, number], pan: [number, number]) => {
  const s = esc(z, camZ);
  return `translate(${foco[0] + pan[0]} ${foco[1] + pan[1]}) scale(${s}) translate(${-foco[0]} ${-foco[1]})`;
};

// ================= C01 / C12: a mesa da venda secreta (câmera 3D atravessando camadas) =================
const CAM_PERTO = -130; // E0: close no documento
const FOCO_DOC: [number, number] = [540, 1450];
/** posição do documento: u = 0 na mesa perto do Lustig, 1 = quadro do loop (E0), 1.15 = parado */
const docEm = (u: number) => {
  const t = Math.min(1, u / 1.15);
  return { x: 700 - 180 * t, y: 1170 + 280 * t, esc: 0.42 + 0.48 * t, rot: -12 + 8 * t, inclina: 18 * (1 - t) };
};
const MaoEmpurra: React.FC<{ x: number; y: number; sai: number }> = ({ x, y, sai }) => {
  // manga do paletó + mão aberta empurrando a borda de cima do documento (some subindo)
  const hx = x + 150 + sai * 120;
  const hy = y - 300 - sai * 520;
  return (
    <g opacity={1 - Math.max(0, sai - 0.8) * 5}>
      <path d={`M ${hx} ${hy} Q ${hx + 160} ${hy - 260} ${hx + 520} ${hy - 700}`} stroke="#1d1424" strokeWidth={118} fill="none" strokeLinecap="round" />
      <path d={`M ${hx} ${hy} Q ${hx + 160} ${hy - 260} ${hx + 520} ${hy - 700}`} stroke="#5a5f6b" strokeWidth={104} fill="none" strokeLinecap="round" />
      <circle cx={hx + 22} cy={hy - 30} r={46} fill="#f4f1ea" stroke="#1d1424" strokeWidth={6} />
      <ellipse cx={hx - 18} cy={hy + 20} rx={66} ry={54} fill="#f2c8a4" stroke="#1d1424" strokeWidth={7} />
      {[-40, -12, 16, 42].map((dx, i) => (
        <path key={i} d={`M ${hx - 30 + dx} ${hy + 50} q -4 22 0 40`} stroke="#1d1424" strokeWidth={22} strokeLinecap="round" fill="none" />
      ))}
      {[-40, -12, 16, 42].map((dx, i) => (
        <path key={`b${i}`} d={`M ${hx - 30 + dx} ${hy + 50} q -4 22 0 40`} stroke="#f2c8a4" strokeWidth={12} strokeLinecap="round" fill="none" />
      ))}
    </g>
  );
};

export const SalaMesa: React.FC<{ f: number; grupo: 1 | 2; camZ: number; docU: number; maoSai: number; cortina: number; lustig: Pose; rostoL: ReturnType<typeof pisca>; olharC: [number, number]; carimbo: number; engole?: number }> = ({
  f,
  grupo,
  camZ,
  docU,
  maoSai,
  cortina,
  lustig,
  rostoL,
  olharC,
  carimbo,
  engole = 0,
}) => {
  const prog = (camZ - CAM_PERTO) / (-700 - CAM_PERTO); // 0 perto, 1 final
  const pan: [number, number] = [0, -380 * (1 - prog)];
  const desfFundo = 10 * (1 - prog);
  const doc = docEm(docU);
  const coms = grupo === 1 ? COMERCIANTES_1 : COMERCIANTES_2;
  const brilhoJanela = 1 - cortina * 0.12;
  return (
    <svg width={W} height={H}>
      <g transform={camada(1500, camZ, FOCO_DOC, pan)}>
        <Desf id="dfp" px={desfFundo}>
          <SalaoHotel f={f} cortina={cortina} janelaX={820} quadroX={70} id="s1" />
        </Desf>
      </g>
      <g transform={camada(800, camZ, FOCO_DOC, pan)}>
        <Desf id="dfc" px={desfFundo * 0.8}>
          {coms.map((d, i) => {
            const x = 70 + i * 150;
            const engoliu = i === 2 ? engole : 0;
            return (
              <Boneco2D
                key={i}
                id={`c${grupo}${i}`}
                d={d}
                pose={vivo(P(x, 1330 + engoliu * 3, 0.34, { cabeca: (i - 2) * -1.5 }), f, i * 7)}
                rosto={pisca({ ...RC.serio, olhar: olharC }, f, `c${grupo}${i}`)}
              />
            );
          })}
        </Desf>
      </g>
      <g transform={camada(700, camZ, FOCO_DOC, pan)}>
        <Desf id="dfl" px={desfFundo * 0.6}>
          <Boneco2D id="lus1" d={LUSTIG} pose={lustig} rosto={rostoL} />
        </Desf>
      </g>
      <g transform={camada(650, camZ, FOCO_DOC, pan)}>
        <MesaToalha x0={-260} x1={790} y={1110} altura={150} />
      </g>
      <g transform={camada(300, camZ, FOCO_DOC, pan)}>
        <Desf id="dfd" px={prog > 0.85 ? (prog - 0.85) * 20 : 0}>
          <Documento x={doc.x} y={doc.y} esc={doc.esc} rot={doc.rot} inclina={doc.inclina} carimbo={carimbo} />
          {maoSai < 1 ? <MaoEmpurra x={doc.x} y={doc.y} sai={maoSai} /> : null}
        </Desf>
      </g>
      <rect width={W} height={H} fill="#ffcf8a" opacity={0.06 * brilhoJanela} />
    </svg>
  );
};

export const C01: React.FC<{ f: number }> = ({ f }) => {
  // câmera: fixa no close até 96, dolly-out até 206 (curva sai)
  const camZ = lin(f, 96, 206, CAM_PERTO, -700, CURVA.sai);
  const docU = f < 36 ? 1 + 0.15 * (1 - Math.pow(1 - f / 36, 2)) : 1.15;
  const maoSai = lin(f, 66, 110, 0, 1, CURVA.entra);
  // cortina: antecipação 160–170, puxa 172–200 (cortina segue 6 q atrás e balança)
  const cortina = Math.min(1.05, M(f, 178, "solto"));
  const base = P(910, 1330, 0.44, { bracoE: { ombro: 16, cotovelo: -10 } });
  const alvo: [number, number] = [1004, 700];
  const puxa = alcancar(base, "D", alvo);
  const t = M(f, 170, "natural");
  const recua = f >= 160 && f < 170 ? Math.sin(((f - 160) / 10) * Math.PI) : 0;
  const solta = M(f, 222, "natural");
  const braco = {
    ombro: 14 - 15 * recua + (puxa.ombro - 14) * Math.max(0, t - solta),
    cotovelo: -8 + (puxa.cotovelo + 8) * Math.max(0, t - solta),
  };
  const desliza = 1 - M(f, 60, "natural");
  const lustig = vivo({ ...base, bracoD: braco, maoD: t > 0.4 && solta < 0.5 ? "aberta" : "bola", bracoE: { ombro: 16 + 50 * desliza, cotovelo: -10 }, maoE: desliza > 0.3 ? "aberta" : "bola", cabeca: f >= 172 && f < 205 ? 4 : 0 }, f);
  const rosto = trocaRosto(f, [
    [0, { ...RL.vendedor, olhar: [0, 0.3] }],
    [172, { ...RL.calmo, olhar: [0.9, -0.3] }, 0.6],
    [204, { ...RL.calmo, olhar: [-0.3, 0.2] }, 0.4],
  ]).rosto;
  const carimbo = f < 216 ? 1 : 1 + 0.3 * Math.max(0, 1 - (f - 216) / 8);
  const tr = tremor(f, [[216, 4]]);
  return (
    <g transform={`translate(${tr.x} ${tr.y})`}>
      <SalaMesa f={f} grupo={1} camZ={camZ} docU={docU} maoSai={maoSai} cortina={cortina} lustig={lustig} rostoL={pisca(rosto, f, "lu1")} olharC={[0.4, 0.6]} carimbo={carimbo} engole={f >= 210 && f < 222 ? 1 : 0} />
    </g>
  );
};

export const C12: React.FC<{ f: number }> = ({ f }) => {
  // geral (cortina aberta, grupo 2), depois dolly-in até o quadro do loop (E0)
  const camZ = lin(f, 4710, 4874, -700, CAM_PERTO, CURVA.suave);
  const docU = lin(f, 4720, 4874, 0, 1, (x) => x * x);
  const maoSai = f < 4720 ? 1.2 : 0;
  const base = P(910, 1330, 0.44, { bracoE: { ombro: 16, cotovelo: -10 } });
  const punho = f >= 4600 && f < 4640 ? Math.sin(((f - 4600) / 40) * Math.PI) : 0;
  const empurra = M(f, 4712, "natural");
  const lustig = vivo({ ...base, bracoD: { ombro: 20 + 20 * punho, cotovelo: -60 * punho - 8 }, bracoE: { ombro: 16 + 50 * empurra, cotovelo: -10 }, maoE: empurra > 0.3 ? "aberta" : "bola" }, f);
  return (
    <svg width={W} height={H}>
      <SalaMesa f={f} grupo={2} camZ={camZ} docU={docU} maoSai={maoSai} cortina={0} lustig={lustig} rostoL={pisca(f > 4700 ? { ...RL.vendedor, olhar: [0, 0.3] } : RL.calmo, f, "lu12")} olharC={[0.4, 0.6]} carimbo={1} />
      <EtiquetaHUD texto="MESES DEPOIS… DE NOVO" x={540} y={260} s={entraSai(f, 4562, 4700)} />
    </svg>
  );
};

// ================= C02: Poisson ri =================
export const C02: React.FC<{ f: number }> = ({ f }) => {
  const ri = f >= 342;
  const decai = lin(f, 440, 510, 1, 0.3);
  const sacode = ri ? Math.abs(Math.sin((f - 342) * 0.4)) * 10 * decai : 0;
  const segura = f >= 314 && f < 342;
  const inclina = M(f, 262, "natural");
  const pre = f >= 330 && f < 342 ? (f - 330) / 12 : 0;
  const rosto = ri ? { ...RP.rindo, sorriso: 1 - 0.3 * (1 - decai) } : segura ? { ...RP.segura, canto: 0.3 + (Math.floor(f / 4) % 2) * 0.1, olhos: 0.55 - pre * 0.25 } : RP.desconfiado;
  const limpa = f >= 500 ? M(f, 500, "natural") - M(f, 530, "natural") : 0;
  const pose: Pose = vivo(
    P(540, 1880 + inclina * 18, 1.0 + inclina * 0.05, {
      agacha: sacode,
      estica: 1 + pre * 0.03 + (ri ? Math.sin((f - 342) * 0.25) * 0.02 : 0),
      cabeca: ri ? -8 * decai : 0,
      bracoE: { ombro: 18 + (ri ? 14 * decai : 0), cotovelo: ri ? -70 * decai : -8 },
      bracoD: limpa > 0.05 ? alcancar(P(540, 1880 + 18, 1.05), "D", [posCabeca(P(540, 1898, 1.05))[0] + 70, posCabeca(P(540, 1898, 1.05))[1] - 10]) : { ombro: 18 + (ri ? 14 * decai : 0), cotovelo: ri ? -70 * decai : -8 },
      maoE: ri ? "punho" : "bola",
      maoD: ri ? "punho" : "bola",
      maoNaFrente: limpa > 0.05 ? "D" : undefined,
    }),
    f,
  );
  const tr = tremor(f, [[342, 8], [352, 5]]);
  const cab = posCabeca(pose);
  // inset do Lustig (canto superior direito)
  const inset = entraSai(f, 420, 528, "natural");
  const taca = f >= 420 ? Math.min(1, (f - 420) / 12) : 0;
  return (
    <svg width={W} height={H}>
      <g transform={`translate(${tr.x} ${tr.y}) translate(540 960) scale(1.35) translate(-540 -880)`}>
        <g transform={`translate(${(f - 252) * 0.06} 0)`}>
          <Desf id="c2f" px={6}>
            <SalaoHotel f={f} semJanela id="s2" />
          </Desf>
        </g>
        <Boneco2D id="poi2" d={POISSON} pose={pose} rosto={pisca(rosto, f, "po2")} />
        {ri && f > 380 && f < 470 ? <Gota x={cab[0] + 70} y={cab[1] - 20} f={f} de={380} escala={0.35} /> : null}
      </g>
      {inset > 0.01 ? (
        <g transform={`translate(830 330) scale(${inset}) translate(-150 -190)`}>
          <defs>
            <clipPath id="ins2">
              <rect width={300} height={380} rx={18} />
            </clipPath>
          </defs>
          <rect width={300} height={380} rx={18} fill="#7a2f3a" />
          <g clipPath="url(#ins2)">
            <Boneco2D
              id="luIns"
              d={LUSTIG}
              pose={vivo(P(150, 760, 0.55, { bracoD: { ombro: 40 + 20 * taca, cotovelo: -110 - 10 * taca } }), f)}
              rosto={{ ...RL.calmo, olhos: f >= 470 && f < 482 ? 0.1 : 0.9 }}
              naMao={
                <g transform="translate(0 -40)">
                  <path d="M -22 -60 L 22 -60 L 6 -10 L 6 20 L 18 26 L -18 26 L -6 20 L -6 -10 Z" fill="#fff6dd" fillOpacity={0.8} stroke="#1d1424" strokeWidth={5} />
                  <path d="M -16 -50 L 16 -50 L 6 -22 L -6 -22 Z" fill="#d9a43a" />
                </g>
              }
            />
          </g>
          <rect width={300} height={380} rx={18} fill="none" stroke="#d9b24a" strokeWidth={8} />
        </g>
      ) : null}
    </svg>
  );
};

// ================= C03: Paris 1925 (crane + whip) =================
export const C03: React.FC<{ f: number }> = ({ f }) => {
  const sobe = lin(f, 540, 690, 0, 1, CURVA.suave);
  const whip = f >= 690 && f < 702 ? (f - 690) / 12 : f >= 702 ? 1 : 0;
  const camY = -1100 * sobe + 1100 * CURVA.entra(whip) * 1.0;
  const camada = (fator: number) => `translate(0 ${-camY * fator})`;
  const borrao = f >= 690 && f < 704 ? 30 * Math.sin((Math.min(1, (f - 690) / 14)) * Math.PI) : 0;
  const lustigVisivel = f >= 696;
  // Lustig: mostra o papel (bracoD) em 736, ajeita a gravata (bracoE) em 780
  const base = P(560, 1840, 0.72);
  const mostra = M(f, 744, "natural");
  const ante = f >= 736 && f < 744 ? Math.sin(((f - 736) / 8) * Math.PI) : 0;
  const gravata = f >= 780 && f < 830 ? 1 : 0;
  const ajeita = gravata ? Math.abs(Math.sin(((f - 780) / 25) * Math.PI)) : 0;
  const peito = posCabeca(base);
  const alvoGrav = alcancar(base, "E", [peito[0] + 6, peito[1] + 160 + ajeita * 20]);
  const pose: Pose = vivo(
    {
      ...base,
      bracoD: { ombro: 20 + 62 * mostra - 14 * ante, cotovelo: -30 - 60 * ante + 26 * mostra },
      bracoE: gravata ? alvoGrav : { ombro: 16, cotovelo: -10 },
      maoE: gravata ? "bola" : "bola",
      maoNaFrente: gravata ? "E" : undefined,
      cabeca: gravata ? -3 : 0,
    },
    f,
  );
  const mao = posMao(pose, "D");
  const rosto = f < 780 ? RL.vendedor : RL.calmo;
  return (
    <svg width={W} height={H}>
      <g filter={borrao > 0.5 ? "url(#whipC3)" : undefined}>
        <defs>
          <filter id="whipC3" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation={`2 ${borrao}`} />
          </filter>
        </defs>
        <g transform={camada(0.08)}>
          <CeuParis tom="dia" id="c3" />
        </g>
        <g transform={camada(0.35)}>
          <TorrePlana x={760} base={1200} h={1750} />
        </g>
        <g transform={camada(0.7)}>
          <Desf id="c3p" px={lustigVisivel ? 4 : 0}>
            <PredisParis base={1210} x0={-300} />
          </Desf>
        </g>
        <g transform={camada(1)}>
          <Calcamento y={1200} id="c3c" />
          {lustigVisivel ? (
            <g>
              <Boneco2D id="lu3" d={LUSTIG_RUA} pose={pose} rosto={pisca(rosto, f, "lu3")} />
              {mostra > 0.05 ? <Documento x={mao[0] + 70} y={mao[1] - 40} esc={0.38} rot={6 + Math.sin(f * 0.4) * 2 * Math.max(0, 1 - (f - 752) / 10)} sombra={false} /> : null}
            </g>
          ) : null}
        </g>
      </g>
      <EtiquetaHUD texto="PARIS • 1925" x={540} y={300} s={entraSai(f, 546, 680) * (f >= 583 && f < 595 ? 1.08 : 1)} tamanho={80} />
    </svg>
  );
};

// ================= C04: seis comerciantes + 7.300 t =================
const SEIS: Design[] = [...COMERCIANTES_1, POISSON];
export const C04: React.FC<{ f: number }> = ({ f }) => {
  const push = lin(f, 1098, 1170, 0, 1, CURVA.suave) + lin(f, 1170, 1260, 0, 0.12);
  const close = f >= 1260;
  const zoom = close ? 1.6 : 0.72 + 0.78 * push;
  const foco: [number, number] = close ? [540, 1060] : [540 + 0 * push, 1000 + 60 * push];
  const venda = 1272;
  const hit = f >= venda && f < venda + 8;
  const ff = hit ? venda : f; // hit-stop
  const tr = tremor(f, [[venda, 6]]);
  const torreAng = lin(ff, 1098, 1260, 0, 360, CURVA.suave) + (ff > 1260 ? (ff - 1260) * 0.4 : 0);
  // valor do contador
  const valor = ff < 1098 ? 0 : ff < 1130 ? Math.round(lin(ff, 1098, 1130, 0, 7000, CURVA.sai) / 100) * 100 : Math.round(lin(ff, 1130, 1190, 7000, 7300, CURVA.sai) / 10) * 10;
  const torrePos = lin(f, 1040, 1066, -80, 0, CURVA.entra);
  const quica = f >= 1066 && f < 1080 ? Math.sin(((f - 1066) / 14) * Math.PI) * 3 : 0;
  const lustigApoia = M(f, 1098, "natural");
  const lus: Pose = vivo(P(820, 1340, 0.44, { inclina: -6 * lustigApoia, bracoE: { ombro: 30 + 20 * lustigApoia, cotovelo: -30 }, maoE: "aberta" }), f);
  return (
    <svg width={W} height={H}>
      <g transform={`translate(${tr.x} ${tr.y}) translate(540 960) scale(${zoom / 0.72}) translate(${-foco[0]} ${-foco[1]})`}>
        <g transform="translate(540 960) scale(0.72) translate(-540 -960)">
          <SalaoHotel f={f} janelaX={820} quadroX={70} id="s4" />
          {SEIS.map((d, i) => {
            const chega = 864 + i * 10;
            const andando = f < chega;
            const xFinal = 40 + i * 128;
            const x = andando ? xFinal - (chega - f) * 9 : xFinal;
            const w = andar(f / 2 + i * 3, 0.8, 7);
            const senta = M(f, chega, "pesado");
            const sobe = f >= chega - 4 && f < chega ? (f - chega + 4) / 4 : 0;
            const y = 1330 + 80 * senta - 4 * sobe;
            const poisson = i === 5;
            const r = poisson ? (f > 1000 ? RP.rindo : RP.desconfiado) : RC.curioso;
            return (
              <Boneco2D
                key={i}
                id={`s4c${i}`}
                d={d}
                pose={vivo(
                  P(x, y, 0.34, {
                    peE: andando ? w.peE : { dx: 0, dy: 0 },
                    peD: andando ? w.peD : { dx: 0, dy: 0 },
                    estica: 1 - 0.04 * Math.max(0, senta - 0.8) * 5 * (f - chega < 12 ? 1 : 0),
                    cruzado: poisson && f > 940 ? M(f, 940, "natural") : 0,
                    cabeca: andando ? w.balanco : 0,
                  }),
                  f,
                  i * 5,
                )}
                rosto={pisca({ ...r, olhar: [0.7, 0.2] }, f, `s4c${i}`)}
              />
            );
          })}
          <Boneco2D id="lu4" d={LUSTIG} pose={lus} rosto={pisca(f > 1090 ? RL.vendedor : RL.calmo, f, "lu4")} />
          <MesaToalha x0={-260} x1={760} y={1110} altura={150} />
          {f >= 1040 ? (
            <g transform={`translate(0 ${torrePos - quica})`}>
              <ellipse cx={540} cy={1112} rx={70} ry={10} fill="#000" opacity={0.2} />
              <Torre3D x={540} base={1112} h={300} ang={torreAng} inclina={0.22} />
            </g>
          ) : null}
          {/* etiqueta vermelha "À VENDA" pendurada na mini torre */}
          {f >= 1262 ? (
            <g transform={`translate(560 ${1040 - Math.max(0, 1 - (f - 1262) / 10) * 300}) scale(${f < venda ? 2.4 - (f - 1262) * 0.14 : hit ? 1.12 : 1} ${hit ? 0.9 : 1}) rotate(${-8 + Math.sin(f * 0.2) * (f > venda + 8 ? 3 : 0)})`}>
              <line x1={-30} y1={-40} x2={-6} y2={-6} stroke="#1d1424" strokeWidth={3} />
              <rect x={-6} y={-12} width={110} height={44} rx={8} fill="#d63b3b" stroke="#1d1424" strokeWidth={4} />
              <text x={49} y={18} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={22} fill="#fff">À VENDA</text>
            </g>
          ) : null}
        </g>
      </g>
      <EtiquetaHUD texto="6 COMERCIANTES" x={540} y={260} s={entraSai(f, 852, 1000) * (f >= 864 && f < 924 && (f - 864) % 10 < 3 ? 1.06 : 1)} />
      <Numero3D texto={`${valor.toLocaleString("pt-BR")} t`} sub="DE FERRO" x={540} y={320} prog={f < 1098 ? 0 : Math.min(1.05, M(f, 1098, "solto")) * (f >= 1255 ? Math.max(0, 1 - (f - 1255) / 8) : 1)} />
      {f >= venda ? <EtiquetaHUD texto="À VENDA" x={540} y={1430} s={M(f, venda, "solto")} cor="#ff6b6b" tamanho={86} /> : null}
      {f >= 1098 && f < 1260
        ? new Array(10).fill(0).map((_, i) => {
            const t = ((f - 1098 + i * 17) % 80) / 80;
            return <circle key={i} cx={420 + random(`dp${i}`) * 240} cy={420 - t * 220} r={5 + (i % 3) * 2} fill="#ffd23f" opacity={1 - t} />;
          })
        : null}
    </svg>
  );
};

// ================= C05: pergunta aberta (2x2) =================
const RETRATOS: Design[] = [COMERCIANTES_1[0], COMERCIANTES_1[1], COMERCIANTES_1[2], POISSON];
export const C05: React.FC<{ f: number }> = ({ f }) => {
  const pisc = f >= 1380 && f < 1388;
  const inclina = M(f, 1395, "natural") * 4;
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#14203a" />
      {RETRATOS.map((d, i) => {
        const cx = i % 2 === 0 ? 270 : 810;
        const cy = i < 2 ? 560 : 1180;
        const s = M(f, 1314 + i * 8, "solto");
        const r = i === 3 ? RP.interessado : RC.curioso;
        return (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
            <defs>
              <clipPath id={`ret${i}`}>
                <rect x={cx - 230} y={cy - 280} width={460} height={500} rx={24} />
              </clipPath>
            </defs>
            <g clipPath={`url(#ret${i})`}>
              <Boneco2D id={`r5${i}`} d={d} pose={vivo(P(cx, cy + 760, 0.78, { cabeca: (i % 2 ? -1 : 1) * inclina }), f, i * 9)} rosto={{ ...r, olhar: [i % 2 ? -0.5 : 0.5, i < 2 ? 0.5 : -0.5], olhos: pisc ? 0.05 : r.olhos }} />
            </g>
            <rect x={cx - 230} y={cy - 280} width={460} height={500} rx={24} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.5} />
          </g>
        );
      })}
      <EtiquetaHUD texto="POR QUE ALGUÉM ACREDITARIA?" x={540} y={850} s={M(f, 1318, "solto") * (f >= 1367 && f < 1380 ? 1.07 : 1)} tamanho={66} />
    </svg>
  );
};

export { Chapeu };
export const _k = k;
export const _resp = resp;
