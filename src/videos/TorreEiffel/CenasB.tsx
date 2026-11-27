import { random } from "remotion";
import { Boneco2D, Chapeu, PERFIL_BASE, alcancar, posCabeca, posMao, type Pose } from "../../estilo2d/Boneco2D";
import { andar, andarPerfil, giro } from "../../estilo2d/anim";
import { COMERCIANTES_1, LUSTIG, LUSTIG_RUA, POISSON, POISSON_RUA, homem1925, type Design } from "../../estilo2d/personagens";
import { Anzol, Caderno, Calcamento, Carimbo, Carro1925, CeuParis, Cracha, Documento, Envelope, EtiquetaHUD, Nota, Peixe, PortaPolicia, PredisParis, SalaoHotel, Torre3D } from "../../estilo2d/Cenarios1925";
import { Gota, Poeira } from "../../estilo2d/Efeitos2D";
import { FilmeMudo } from "../../estilo2d/Pintura";
import { Desf } from "./CenasA";
import { CURVA, M, P, RL, RP, entraSai, lin, mistura, pisca, tremor, vivo } from "./comum";

const W = 1080;
const H = 1920;

// ================= C06: provisória + segredo =================
export const C06: React.FC<{ f: number }> = ({ f }) => {
  if (f >= 1836) return <C06Segredo f={f} />;
  const hitP = 1673;
  const ff = f >= hitP && f < hitP + 6 ? hitP : f;
  const tr = tremor(f, [[hitP, 10]]);
  const orbita = lin(ff, 1431, 1830, -15, 20, (x) => x);
  const bandeiras = ff >= 1570 && ff < 1660;
  const zoom = bandeiras ? 1.7 : ff < 1660 ? 1 : ff < 1722 ? lin(ff, 1660, 1722, 1, 1.1) : lin(ff, 1722, 1762, 1.1, 1.8, CURVA.suave);
  const focoY = bandeiras ? 700 : ff < 1722 ? 960 : lin(ff, 1722, 1762, 960, 900, CURVA.suave);
  const ferrugem = lin(ff, 1726, 1790, 0, 1);
  const claro = f >= 1830 ? (f - 1830) / 6 : 0;
  return (
    <>
    <FilmeMudo sepia={0.5} estrago={0.8} fps={8}>
      <svg width={W} height={H}>
        <g transform={`translate(${tr.x} ${tr.y}) translate(540 960) scale(${zoom}) translate(-540 ${-focoY})`}>
          <CeuParis tom="sepia" id="c6" />
          <g transform={`translate(${-orbita * 6} 0)`}>
            <Torre3D x={540} base={1240} h={1500} ang={orbita + 10} ferrugem={ferrugem} inclina={0.12} />
          </g>
          {/* bandeirinhas da exposição de 1889 */}
          {ferrugem < 0.5
            ? [520, 700].map((y, j) => (
                <g key={y} opacity={1 - ferrugem * 2}>
                  <path d={`M ${300 - orbita * 6} ${y} Q 540 ${y + 50} ${780 - orbita * 6} ${y}`} stroke="#4a3a2a" strokeWidth={3} fill="none" />
                  {new Array(9).fill(0).map((_, i) => {
                    const t = i / 8;
                    const bx = 300 - orbita * 6 + 480 * t;
                    const by = y + 50 * 4 * t * (1 - t) * 0.5 + 2;
                    return <path key={i} d={`M ${bx - 10} ${by} L ${bx + 10} ${by} L ${bx} ${by + 24 + Math.sin(f * 0.2 + i + j) * 3} Z`} fill={["#d6a070", "#f4e4c4", "#a08060"][i % 3]} stroke="#1d1424" strokeWidth={2} />;
                  })}
                </g>
              ))
            : null}
          <g transform={`translate(${-orbita * 14} 0)`}>
            <PredisParis base={1250} x0={-500} n={16} tom="sepia" />
          </g>
          <Calcamento y={1240} tom="sepia" id="c6c" />
          {/* notas e moedas voando em "caro demais" */}
          {f >= 1765
            ? new Array(14).fill(0).map((_, i) => {
                const t = (f - 1765 - i * 2) / 40;
                if (t < 0) return null;
                const x = 540 + (random(`n6x${i}`) - 0.3) * 200 + t * (500 + random(`n6v${i}`) * 500);
                const y = 900 + (random(`n6y${i}`) - 0.5) * 300 - t * 260 + t * t * 200;
                return i % 3 === 0 ? <circle key={i} cx={x} cy={y} r={18} fill="#e8c860" stroke="#1d1424" strokeWidth={4} /> : <Nota key={i} x={x} y={y} rot={t * 400 * (i % 2 ? 1 : -1)} esc={0.8} />;
              })
            : null}
        </g>
        <EtiquetaHUD texto="1889: SÓ PRA EXPOSIÇÃO" x={540} y={260} s={entraSai(f, 1440, 1650)} />
        <EtiquetaHUD texto="CONSERTO CARO DEMAIS" x={540} y={1400} s={entraSai(f, 1765, 1835)} cor="#ff6b6b" />
        {claro > 0 ? <rect width={W} height={H} fill="#fff4dc" opacity={Math.min(1, claro * 1.5)} /> : null}
      </svg>
    </FilmeMudo>
    {f >= hitP - 8 && f < 1830 ? (
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(${tr.x} ${tr.y})`} opacity={0.92}>
          <Carimbo texto="PROVISÓRIA" x={540} y={560} t={f - (hitP - 7)} rot={-8} tamanho={130} />
        </g>
      </svg>
    ) : null}
    </>
  );
};

const C06Segredo: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lin(f, 1836, 1985, 1.2, 1.35, (x) => x);
  const base = P(540, 1940, 1.0, { estica: 1 + 0.04 * M(f, 1860, "pesado") });
  const boca = posCabeca(base);
  const sobe = M(f, 1928, "natural");
  const alvo = alcancar(base, "E", [boca[0] - 4, boca[1] + 56], 50);
  const repouso = { ombro: 16, cotovelo: -10 };
  const braco = { ombro: repouso.ombro + (alvo.ombro - repouso.ombro) * sobe, cotovelo: repouso.cotovelo + (alvo.cotovelo - repouso.cotovelo) * sobe };
  const gesto = Math.max(0, M(f, 1842, "natural") - M(f, 1912, "natural"));
  const gestoC = Math.max(0, M(f, 1846, "natural") - M(f, 1916, "natural"));
  const olhaLado = f >= 1918 && f < 1924 ? -0.9 : f >= 1924 && f < 1930 ? 0.9 : 0;
  const rosto = f >= 1928 ? { ...RL.segredo, sobrancelhaY: 2 + 6 * M(f, 1932, "solto") } : { ...RL.calmo, olhar: [olhaLado, 0] as [number, number] };
  return (
    <svg width={W} height={H}>
      <g transform={`translate(540 960) scale(${zoom}) translate(-540 -800)`}>
        <Desf id="c6s" px={8}>
          <SalaoHotel f={f} id="s6" janelaX={820} quadroX={70} />
        </Desf>
        <Boneco2D id="lu6" d={LUSTIG} pose={vivo({ ...base, bracoE: braco, maoE: sobe > 0.3 ? "aponta" : "bola", maoNaFrente: sobe > 0.2 ? "E" : undefined, bracoD: { ombro: 16 + 24 * gesto, cotovelo: -10 - 85 * gestoC }, maoD: gesto > 0.4 ? "aberta" : "bola" }, f)} rosto={pisca(rosto, f, "lu6")} />
      </g>
      <rect width={W} height={H} fill="url(#vin6)" />
      <defs>
        <radialGradient id="vin6">
          <stop offset="0.6" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <EtiquetaHUD texto="SEGREDO" x={540} y={300} s={M(f, 1946, "solto")} tamanho={80} />
    </svg>
  );
};

// ================= C07: inspeção "oficial" =================
export const C07: React.FC<{ f: number }> = ({ f }) => {
  if (f >= 2358) return <C07Caderno f={f} />;
  if (f >= 2130) return <C07Base f={f} />;
  // dolly lateral seguindo o carro; torre cresce (dolly-in)
  const carroX = lin(f, 1985, 2130, -200, 1300, (x) => x);
  const camX = lin(f, 1985, 2130, 300, 900, CURVA.suave);
  const torreEsc = lin(f, 1985, 2130, 0.75, 1.0, CURVA.suave);
  const quica = (random(`q7${Math.floor(f / 3)}`) - 0.5) * 6;
  return (
    <svg width={W} height={H}>
      <CeuParis tom="dia" id="c7" />
      <g transform={`translate(${540 - camX * 0.05} 1220) scale(${torreEsc}) translate(-540 -1220)`}>
        <Torre3D x={620} base={1220} h={1500} ang={18} inclina={0.1} />
      </g>
      <g transform={`translate(${-camX * 0.35} 0)`}>
        <PredisParis base={1230} x0={-200} n={20} />
      </g>
      <g transform={`translate(${540 - camX} 0)`}>
        <Calcamento y={1220} id="c7c" />
        <Carro1925 x={carroX} y={1560} esc={1.0} roda={f * 9} balanco={quica} />
        {/* chapéus dentro do carro (balançam atrasados) */}
        {[-150, -30, 40].map((dx, i) => (
          <g key={i} transform={`translate(${carroX + dx} ${1470 + quica * 0.6 + Math.sin(f * 0.5 + i) * 2}) scale(0.26)`}>
            <Chapeu c={i === 0 ? { tipo: "fedora", cor: "#3a3d44", faixa: "#1f1a20" } : i === 1 ? { tipo: "coco", cor: "#2a2622" } : { tipo: "boina", cor: "#5a5e48" }} />
          </g>
        ))}
        {new Array(6).fill(0).map((_, i) => {
          const t = ((f + i * 9) % 54) / 54;
          return <circle key={i} cx={carroX - 260 - t * 160} cy={1560 - t * 40} r={10 + t * 26} fill="#9a9aa2" opacity={0.5 * (1 - t)} />;
        })}
      </g>
      <EtiquetaHUD texto={'INSPEÇÃO "OFICIAL"'} x={540} y={260} s={entraSai(f, 1992, 2120)} />
    </svg>
  );
};

const C07Base: React.FC<{ f: number }> = ({ f }) => {
  const aponta = f >= 2148 ? M(f, 2148, "natural") : 0;
  const abre = M(f, 2214, "natural");
  const abreE = M(f, 2218, "natural");
  const base = P(540, 1880, 0.95);
  const pose: Pose = vivo(
    {
      ...base,
      estica: 1 + 0.03 * abre,
      bracoD: abre > 0.05 ? { ombro: 118 + Math.sin(f * 0.11) * 3, cotovelo: -10 } : { ombro: 16 + (150 - 16) * aponta, cotovelo: -10 - 60 * Math.sin(Math.min(1, aponta) * Math.PI) },
      bracoE: abre > 0.05 ? { ombro: 16 + 84 * abreE + Math.sin(f * 0.09 + 1) * 3, cotovelo: -10 } : { ombro: 16, cotovelo: -10 },
      maoD: abre > 0.05 ? "aberta" : aponta > 0.3 ? "aponta" : "bola",
      maoE: abre > 0.3 ? "aberta" : "bola",
      cabeca: -6 * aponta,
    },
    f,
  );
  const inset = entraSai(f, 2256, 2352, "natural");
  return (
    <svg width={W} height={H}>
      <g transform="translate(0 520)">
        <CeuParis tom="dia" id="c7b" />
      </g>
      <g transform="translate(540 1500) scale(1.15) translate(-540 -1500)">
        <Torre3D x={540} base={2150} h={2600} ang={45} olhaCima={1} inclina={0.05} />
      </g>
      <Calcamento y={1700} id="c7bc" />
      {/* comerciantes pequenos atrás, olhando pra cima */}
      {COMERCIANTES_1.slice(0, 3).map((d, i) => (
        <Boneco2D key={i} id={`c7c${i}`} d={d} pose={vivo(P(160 + i * 150 + (i > 0 ? 560 : 0), 1720, 0.3, { cabeca: -8 }), f, i * 5)} rosto={{ ...pisca({ olhos: 1.1, olhar: [0, -1], sobrancelha: -6, sobrancelhaY: 6, sorriso: 0, boca: 0.2, canto: 0, bochecha: 0.4 }, f, `c7c${i}`) }} />
      ))}
      <Boneco2D id="lu7" d={LUSTIG_RUA} pose={pose} rosto={pisca(RL.vendedor, f, "lu7")} />
      {inset > 0.01 ? (
        <g transform={`translate(250 330) scale(${inset}) translate(-150 -190)`}>
          <defs>
            <clipPath id="ins7">
              <rect width={300} height={380} rx={18} />
            </clipPath>
          </defs>
          <rect width={300} height={380} rx={18} fill="#7a5a4a" />
          <g clipPath="url(#ins7)" filter="url(#sep7)">
            <defs>
              <filter id="sep7">
                <feColorMatrix type="matrix" values="0.5 0.45 0.15 0 0.05  0.4 0.42 0.12 0 0.03  0.3 0.3 0.1 0 0  0 0 0 1 0" />
              </filter>
            </defs>
            <Boneco2D id="po7i" d={POISSON} pose={P(150, 780, 0.55, { agacha: Math.abs(Math.sin(f * 0.4)) * 8, cabeca: -6 })} rosto={RP.rindo} />
          </g>
          <rect width={300} height={380} rx={18} fill="none" stroke="#d9b24a" strokeWidth={8} />
        </g>
      ) : null}
    </svg>
  );
};

const C07Caderno: React.FC<{ f: number }> = ({ f }) => {
  const base = P(540, 2200, 1.25, { bracoE: { ombro: 40, cotovelo: -110 }, bracoD: { ombro: 36 + Math.sin(f * 1.0) * 4, cotovelo: -118 + Math.sin(f * 1.3) * 6 }, maoE: "bola", maoD: "punho" });
  const pose = vivo(base, f);
  const mE = posMao(pose, "E");
  const mD = posMao(pose, "D");
  const zig = Math.sin(f * 1.05) * 12;
  const escreve = lin(f, 2364, 2434, 0, 1, (x) => x);
  return (
    <svg width={W} height={H}>
      <g transform={`translate(${tremor(f, [[f - 1, 2]]).x} 0)`}>
        <CeuParis tom="dia" id="c7n" />
        <Desf id="c7nd" px={6}>
          <PredisParis base={1100} x0={-300} />
          <Calcamento y={1100} id="c7nc" />
        </Desf>
        <Boneco2D id="po7" d={POISSON_RUA} pose={pose} rosto={f >= 2380 && f < 2420 ? RP.interessado : pisca(RP.interessado, f, "po7")} />
        <rect x={mE[0] + 70 - 130} y={mE[1] - 70 - 170} width={260} height={340} rx={12} fill="#7a2f2a" stroke="#1d1424" strokeWidth={7} transform={`rotate(-8 ${mE[0] + 70} ${mE[1] - 70})`} />
        <Caderno x={mE[0] + 70} y={mE[1] - 70} esc={0.9} escreve={escreve} rot={-8} />
        <g transform={`translate(${mD[0] - 40 + zig} ${mD[1] - 60}) rotate(-30)`}>
          <rect x={-10} y={-120} width={20} height={130} rx={4} fill="#e8c040" stroke="#1d1424" strokeWidth={5} />
          <path d="M -10 10 L 0 34 L 10 10 Z" fill="#f0d8b0" stroke="#1d1424" strokeWidth={4} />
        </g>
        {f >= 2390 ? <Gota x={posCabeca(pose)[0] + 150} y={posCabeca(pose)[1] - 60} f={f} de={2390} escala={0.6} /> : null}
      </g>
    </svg>
  );
};

// ================= C08: propina por baixo da mesa =================
const MESA_Y = 1440;
export const C08: React.FC<{ f: number }> = ({ f }) => {
  if (f >= 2790 && f < 3050) return <C08Pensa f={f} />;
  // câmera desce por baixo do tampo (2700–2740), volta (2775–2790)
  const desce = f < 2700 ? 0 : f < 2716 ? 0.45 * CURVA.entra((f - 2700) / 16) : f < 2775 ? 1 : 0;
  const push = f >= 2537 && f < 2700 ? lin(f, 2537, 2640, 1, 1.1) : f >= 3050 ? 1 : 1;
  const camY = 620 * desce;
  const zoom = 1.25 * push * (1 + 0.35 * desce);
  // aperto de mão (2556): Lustig bracoD, Poisson bracoE
  const lus0 = P(330, 1820, 0.95);
  const poi0 = P(760, 1820, 0.95);
  const meio: [number, number] = [545, 1260];
  const aperta = f >= 2548 && f < 2640;
  const sacode = aperta && f >= 2562 ? Math.sin(((f - 2562) / 12) * Math.PI * 2) * 14 * Math.max(0, 1 - (f - 2562) / 40) : 0;
  const aproxima = M(f, 2548, "natural") - M(f, 2630, "natural");
  const recuaP = f >= 2540 && f < 2548 ? Math.sin(((f - 2540) / 8) * Math.PI) : 0;
  const bL = alcancar(lus0, "D", [meio[0] - 20, meio[1] + sacode]);
  const bP = alcancar(poi0, "E", [meio[0] + 20, meio[1] + sacode]);
  const rep = { ombro: 16, cotovelo: -10 };
  const mixB = (a: { ombro: number; cotovelo: number }, b: { ombro: number; cotovelo: number }, t: number) => ({ ombro: a.ombro + (b.ombro - a.ombro) * t, cotovelo: a.cotovelo + (b.cotovelo - a.cotovelo) * t });
  // embaixo da mesa: Poisson passa o envelope (mão D dele) para a mão E do Lustig... usamos braços "de baixo"
  const sob = f >= 2710 && f < 2790;
  const passa = lin(f, 2746, 2775, 0, 1, CURVA.suave);
  const envX = 640 - 200 * passa;
  const envY = MESA_Y + 120;
  // inclina para pedir propina (2645)
  const inclinaL = (M(f, 2645, "natural") - M(f, 2700, "natural")) * 10;
  // entrega final (3058): Poisson empurra documento + envelope
  const entrega = f >= 3050;
  const empurra = M(f, 3058, "natural");
  const guarda = M(f, 3130, "natural");
  const lus: Pose = vivo({ ...lus0, inclina: inclinaL, bracoD: sob ? rep : aperta ? mixB(rep, bL, aproxima) : rep, maoD: aperta ? "aberta" : "bola" }, f);
  const poi: Pose = vivo(
    {
      ...poi0,
      bracoE: sob ? rep : aperta ? mixB(rep, bP, aproxima - recuaP * 0.3) : entrega ? mixB(rep, alcancar(poi0, "E", [580, MESA_Y - 20]), empurra) : rep,
      maoE: sob || aperta || entrega ? "aberta" : "bola",
      peE: { dx: 0, dy: sob ? -Math.abs(Math.sin(f * 0.5)) * 18 : 0 },
    },
    f,
  );
  const rostoL = f < 2556 ? RL.calmo : f < 2645 ? RL.vendedor : f < 3050 ? RL.propina : RL.vendedor;
  const rostoP = f < 2548 ? { ...RP.ganancioso, sorriso: 0.3 } : RP.ganancioso;
  const apaga = f >= 3214 ? (f < 3220 ? (Math.floor((f - 3214) / 2) % 2) * 0.6 : Math.min(1, (f - 3220) / 10)) : 0;
  return (
    <svg width={W} height={H}>
      <g transform={`translate(540 960) scale(${zoom}) translate(-540 ${-1250 - camY})`}>
        <SalaoHotel f={f} luz="abajur" semJanela id="s8" />
        <Boneco2D id="lu8" d={LUSTIG} pose={lus} rosto={pisca(rostoL, f, "lu8")} />
        <Boneco2D id="po8" d={POISSON} pose={poi} rosto={pisca(rostoP, f, "po8")} />
        {/* tampo da mesa: em cima vemos a toalha; por baixo o tampo escuro cobre tudo acima dele */}
        {desce < 0.5 ? (
          <g>
            <path d={`M -200 ${MESA_Y} L 1280 ${MESA_Y} L 1180 ${MESA_Y - 90 * (1 - desce * 2)} L -100 ${MESA_Y - 90 * (1 - desce * 2)} Z`} fill="#f4f1ea" stroke="#1d1424" strokeWidth={5} />
            <rect x={-200} y={MESA_Y} width={1480} height={260} fill="#ece8de" stroke="#1d1424" strokeWidth={5} />
            {/* abajur */}
            <g transform={`translate(930 ${MESA_Y - 60})`}>
              <circle r={260} fill="#ffb45a" opacity={0.18 * (1 - apaga)} />
              <rect x={-8} y={-150} width={16} height={150} fill="#5a4030" />
              <path d="M -70 -150 L 70 -150 L 44 -230 L -44 -230 Z" fill={apaga > 0.5 ? "#6a4a2a" : "#ffcf8a"} stroke="#1d1424" strokeWidth={5} />
              <ellipse cx={0} cy={4} rx={50} ry={10} fill="#5a4030" />
            </g>
            {entrega ? (
              <g transform={`translate(${780 - 220 * empurra - 300 * guarda} ${MESA_Y - 30}) scale(${1 - guarda * 0.6})`} opacity={1 - Math.max(0, guarda - 0.7) * 3}>
                <Documento x={0} y={-40} esc={0.22} rot={-80} sombra={false} />
                <Envelope x={60} y={0} esc={0.45} rot={-6} />
              </g>
            ) : null}
          </g>
        ) : (
          <g>
            <rect x={-600} y={-2000} width={2400} height={MESA_Y + 60 + 2000 - 80 * (desce - 0.5)} fill="#1a1020" />
            <rect x={-600} y={MESA_Y + 40 - 80 * (desce - 0.5)} width={2400} height={20} fill="#3a2418" />
            <rect x={-600} y={MESA_Y + 56 - 80 * (desce - 0.5)} width={2400} height={6} fill="#ffb45a" opacity={0.7} />
            {sob ? (
              <g strokeLinecap="round">
                <path d={`M ${lus0.x + 60} ${MESA_Y + 70} Q ${lus0.x + 110} ${envY} ${envX - 70} ${envY}`} stroke="#1d1424" strokeWidth={74} fill="none" />
                <path d={`M ${lus0.x + 60} ${MESA_Y + 70} Q ${lus0.x + 110} ${envY} ${envX - 70} ${envY}`} stroke="#5a5f6b" strokeWidth={60} fill="none" />
                <circle cx={envX - 60} cy={envY} r={34} fill="#f2c8a4" stroke="#1d1424" strokeWidth={6} />
                <path d={`M ${poi0.x - 60} ${MESA_Y + 70} Q ${poi0.x - 110} ${envY} ${envX + 70} ${envY}`} stroke="#1d1424" strokeWidth={74} fill="none" />
                <path d={`M ${poi0.x - 60} ${MESA_Y + 70} Q ${poi0.x - 110} ${envY} ${envX + 70} ${envY}`} stroke="#7a5a3a" strokeWidth={60} fill="none" />
                <Envelope x={envX} y={envY} esc={0.4} rot={-4 + Math.sin(f * 0.3) * 3} />
                <circle cx={envX + 60} cy={envY} r={34} fill="#f2c8a4" stroke="#1d1424" strokeWidth={6} />
              </g>
            ) : null}
          </g>
        )}
      </g>
      {desce > 0.5 ? <rect width={W} height={H} fill="#1a1020" opacity={0.25} /> : null}
      <EtiquetaHUD texto="VENCEDOR: POISSON" x={540} y={260} s={entraSai(f, 2556, 2635)} />
      <EtiquetaHUD texto="PROPINA" x={540} y={260} s={entraSai(f, 2693, 2780)} cor="#ff6b6b" tamanho={80} />
      {f >= 3072 ? (
        <g transform={`translate(540 300) scale(${M(f, 3072, "solto")})`}>
          <rect x={-330} y={-70} width={660} height={120} rx={22} fill="#1d1424" opacity={0.88} />
          <text x={-40} y={22} textAnchor="end" fontFamily="Roboto Condensed" fontWeight={800} fontSize={76} fill={f >= 3126 ? "#ffd23f" : "#8a8494"}>
            PREÇO
          </text>
          <text x={0} y={22} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={800} fontSize={76} fill="#f4f1ea">+</text>
          <text x={40} y={22} textAnchor="start" fontFamily="Roboto Condensed" fontWeight={800} fontSize={76} fill={f >= 3196 ? "#ff6b6b" : "#8a8494"}>
            PROPINA
          </text>
        </g>
      ) : null}
      {apaga > 0 ? <rect width={W} height={H} fill="#0a1424" opacity={apaga * 0.95} /> : null}
    </svg>
  );
};

const C08Pensa: React.FC<{ f: number }> = ({ f }) => {
  const base = P(540, 2050, 1.05);
  const esfrega = Math.sin(((f - 2800) / 10) * Math.PI) * 14;
  const cab = posCabeca(base);
  const alvoE = alcancar(base, "E", [cab[0] - 30 + esfrega, cab[1] + 380]);
  const alvoD = alcancar(base, "D", [cab[0] + 30 - esfrega, cab[1] + 384]);
  const acena = f >= 2960 && f < 3000 ? Math.sin(((f - 2960) / 20) * Math.PI * 2) * 6 : 0;
  const balao = M(f, 2810, "solto");
  return (
    <svg width={W} height={H}>
      <g transform={f >= 2905 ? "translate(540 960) scale(1.5) translate(-540 -1150)" : "translate(540 960) scale(1.15) translate(-540 -900)"}>
        <Desf id="c8p" px={7}>
          <SalaoHotel f={f} luz="abajur" id="s8p" janelaX={820} quadroX={70} />
        </Desf>
        <Boneco2D id="po8p" d={POISSON} pose={vivo({ ...base, bracoE: alvoE, bracoD: alvoD, maoE: "aberta", maoD: "aberta", cabeca: acena }, f)} rosto={pisca({ ...RP.ganancioso, sorriso: f >= 2960 ? 0.9 : 0.7 }, f, "po8p")} />
      </g>
      {balao > 0.01 ? (
        <g transform={`translate(760 380) scale(${balao})`}>
          {[[-120, 250, 18], [-80, 200, 26], [-30, 150, 34]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" stroke="#1d1424" strokeWidth={5} />
          ))}
          <path d="M -200 0 Q -220 -90 -130 -110 Q -100 -190 0 -170 Q 80 -220 150 -150 Q 240 -140 230 -50 Q 280 30 200 80 Q 160 150 60 120 Q -20 170 -100 120 Q -200 120 -200 0 Z" fill="#ffffff" stroke="#1d1424" strokeWidth={7} />
          <rect x={-70} y={-120} width={140} height={190} rx={10} fill="#d9b98a" stroke="#1d1424" strokeWidth={5} />
          <rect x={-30} y={-134} width={60} height={26} rx={6} fill="#8a8a92" stroke="#1d1424" strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M -40 ${-70 + i * 50} l 16 18 l 30 -34`} stroke={f > 2830 + i * 20 ? "#2e9b6a" : "#b8a080"} strokeWidth={10} fill="none" strokeLinecap="round" />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

// ================= C09: a isca (fundo do mar) =================
const CINZA: Design = homem1925({ nome: "golpista genérico", pele: "#b8bcc6", peleSombra: "#9aa0ac", paleto: "#8a8f9a", paletoSombra: "#767b86", lapela: "#6e737e", calca: "#7a7f8a", gravata: "#5a5f6a", cabelo: "curto", corCabelo: "#6a6e78" });
const CORRUPTO: Design = homem1925({ nome: "funcionário", pele: "#f2c8a4", peleSombra: "#dba886", paleto: "#2e3a52", paletoSombra: "#242e44", lapela: "#202a3e", calca: "#2a3448", gravata: "#7a1f2b", cabelo: "penteado", corCabelo: "#3a3038", bigodeTipo: "grosso" });
export const C09: React.FC<{ f: number }> = ({ f }) => {
  const nhac = 3420;
  const ff = f >= nhac && f < nhac + 6 ? nhac : f;
  const tr = tremor(f, [[nhac, 6], [3870, 8]]);
  const desce = M(f, 3238, "solto");
  const anzolY = -300 + 1300 * Math.min(1.08, desce) - (ff >= nhac ? 10 : 0);
  const balanca = Math.sin(f * 0.08) * 6;
  const raios = (
    <g opacity={0.15}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${100 + i * 230 + Math.sin(f * 0.02 + i) * 40} -100 L ${40 + i * 230} 2000 L ${200 + i * 230} 2000 Z`} fill="#7fc7ff" />
      ))}
    </g>
  );
  const fundo = (
    <>
      <defs>
        <linearGradient id="mar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#14304a" />
          <stop offset="1" stopColor="#081422" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#mar)" />
      {raios}
      {new Array(16).fill(0).map((_, i) => {
        const t = ((f * (0.6 + random(`b9${i}`)) + random(`b9y${i}`) * 2000) % 2000) / 2000;
        return <circle key={i} cx={random(`b9x${i}`) * W + Math.sin(f * 0.05 + i) * 10} cy={H - t * H} r={4 + random(`b9r${i}`) * 8} fill="none" stroke="#9fd4ff" strokeWidth={2} opacity={0.5} />;
      })}
    </>
  );
  // P27/P28: anzol, isca e peixe
  if (f < 3440) {
    const orb = ((ff - 3360) / 60) * Math.PI * 2;
    const frente = Math.sin(orb) > 0;
    const morde = ff >= 3402;
    const recua = ff >= 3402 && ff < 3412 ? (ff - 3402) / 10 : 0;
    const peixeX = morde ? 540 + 130 + 160 * recua - (ff >= 3412 ? Math.min(1, (ff - 3412) / 6) * 280 : 0) : 540 + Math.cos(orb) * 250;
    const peixeY = morde ? anzolY + 60 : anzolY + 80 + Math.sin(orb * 2) * 60;
    const peixeEsc = morde ? 0.75 : frente ? 0.8 : 0.55;
    const peixe = f >= 3360 ? <Peixe x={peixeX} y={peixeY} esc={peixeEsc} lado={morde ? 1 : Math.cos(orb + 0.01) < 0 ? 1 : -1} boca={morde && ff < 3420 ? 1 : 0} f={f} bigode={f >= 3390 && f < 3450} /> : null;
    return (
      <svg width={W} height={H}>
        <g transform={`translate(${tr.x} ${tr.y})`}>
          {fundo}
          {!frente ? peixe : null}
          <g transform={`translate(${balanca} 0)`}>
            <Anzol x={540} y={anzolY} />
            <Envelope x={430} y={anzolY + 70} esc={0.75} rot={Math.sin(f * 0.04) * 25} />
          </g>
          {frente || morde ? peixe : null}
        </g>
        <EtiquetaHUD texto="A PROPINA FOI A ISCA" x={540} y={260} s={M(f, 3294, "solto") * (f >= 3354 && f < 3366 ? 1.08 : 1)} />
        <EtiquetaHUD texto={'POISSON = "PEIXE" EM FRANCÊS'} x={540} y={1420} s={M(f, 3390, "solto")} tamanho={56} />
      </svg>
    );
  }
  // P29: golpista pega o dinheiro e some (puf)
  if (f < 3572) {
    const pega = M(f, 3481, "natural");
    const some = f >= 3535;
    const base = P(540, 1500, 0.7);
    return (
      <svg width={W} height={H}>
        {fundo}
        {!some ? (
          <Boneco2D id="g9" d={CINZA} pose={vivo({ ...base, bracoD: { ombro: 16 + 50 * pega, cotovelo: -10 - 60 * pega }, maoD: "punho" }, f)} rosto={{ olhos: 1, olhar: [f > 3500 ? (Math.floor(f / 10) % 2 ? 1 : -1) : 0, 0], sobrancelha: 6, sobrancelhaY: 0, sorriso: 0.4, boca: 0, canto: 0.6, bochecha: 0.3 }} />
        ) : (
          <g opacity={0.6}>
            <rect x={400} y={830} width={280} height={680} rx={60} fill="none" stroke="#c8ccd8" strokeWidth={6} strokeDasharray="22 18" />
          </g>
        )}
        {!some && pega > 0.3 ? new Array(4).fill(0).map((_, i) => <circle key={i} cx={posMao({ ...base, bracoD: { ombro: 66, cotovelo: -70 } }, "D")[0] + i * 12} cy={posMao({ ...base, bracoD: { ombro: 66, cotovelo: -70 } }, "D")[1] - 30 - i * 14} r={16} fill="#e8c860" stroke="#1d1424" strokeWidth={4} />) : null}
        <Poeira x={540} y={1200} f={f} de={3535} dur={14} largura={1.6} />
      </svg>
    );
  }
  // P30: golpista (some) x funcionário corrupto (mão estendida)
  if (f < 3790) {
    const aparece = M(f, 3673, "natural");
    return (
      <svg width={W} height={H}>
        {fundo}
        <rect x={140} y={830} width={280} height={680} rx={60} fill="none" stroke="#c8ccd8" strokeWidth={6} strokeDasharray="22 18" opacity={0.6} />
        {f >= 3600 ? <path d="M 200 1000 L 360 1160 M 360 1000 L 200 1160" stroke="#e04848" strokeWidth={26} strokeLinecap="round" transform={`translate(280 1080) scale(${M(f, 3600, "solto")}) translate(-280 -1080)`} /> : null}
        {aparece > 0.01 ? (
          <g transform={`translate(690 1500) scale(${aparece}) translate(-690 -1500)`}>
            <Boneco2D id="cor9" d={CORRUPTO} pose={vivo(P(690, 1500, 0.7, { bracoD: { ombro: 70, cotovelo: -40 }, maoD: "aberta" }), f)} rosto={{ olhos: 0.8, olhar: [-0.4, 0], sobrancelha: 8, sobrancelhaY: 0, sorriso: 0.2, boca: 0, canto: 0.4, bochecha: 0.3 }} />
          </g>
        ) : null}
        {f >= 3740 ? <path d="M 700 600 l 40 44 l 90 -100" stroke="#2e9b6a" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`translate(760 600) scale(${M(f, 3740, "solto")}) translate(-760 -600)`} /> : null}
      </svg>
    );
  }
  // P31: papel URGENTE + fila impaciente
  const brilho = f >= 4020 ? Math.min(1, (f - 4020) / 10) : 0;
  const claro = f >= 4044 ? (f - 4044) / 12 : 0;
  return (
    <svg width={W} height={H}>
      <g transform={`translate(${tr.x} ${tr.y})`}>
        {fundo}
        {[0, 1, 2, 3, 4].map((i) => (
          <Boneco2D key={i} id={`fi${i}`} d={CINZA} pose={vivo(P(120 + i * 210, 980, 0.28, { peD: { dx: 0, dy: Math.floor((f + i * 7) / 8) % 2 ? -14 : 0 }, bracoD: i % 2 ? { ombro: 35, cotovelo: -125 } : { ombro: 16, cotovelo: -10 } }), f, i)} rosto={{ olhos: 0.7, olhar: [0, 0.5], sobrancelha: 12, sobrancelhaY: 0, sorriso: -0.2, boca: 0, canto: 0, bochecha: 0.3 }} />
        ))}
        <g transform={f >= 3946 ? "translate(540 960) scale(1.6) translate(0 -180) scale(0.85)" : "translate(540 1300) scale(0.85)"}>
          {brilho > 0 ? <circle r={420} fill="#ffd23f" opacity={0.25 * brilho} /> : null}
          <Documento x={0} y={0} esc={1.05} rot={-3} carimbo={0} />
        </g>
        {f >= 3862 ? <g transform={f >= 3946 ? "translate(540 960) scale(1.6) translate(-540 -1130)" : ""}><Carimbo texto="URGENTE" x={560} y={1400} t={f - 3863} rot={-12} tamanho={130} /></g> : null}
      </g>
      {claro > 0 ? <rect width={W} height={H} fill="#ffffff" opacity={Math.min(1, claro * 1.5)} /> : null}
    </svg>
  );
};

// ================= C10: revelação e fuga =================
export const C10: React.FC<{ f: number }> = ({ f }) => {
  if (f < 4240) {
    const zoom = lin(f, 4126, 4190, 1.8, 1.2, CURVA.suave);
    const base10 = P(540, 1900, 1.0);
    const cab0 = posCabeca(base10);
    const lapel = M(f, 4147, "natural");
    const bLap = alcancar(base10, "E", [cab0[0] - 30, cab0[1] + 300], 80);
    const pose = vivo({ ...base10, bracoE: { ombro: 16 + (bLap.ombro - 16) * lapel, cotovelo: -10 + (bLap.cotovelo + 10) * lapel }, maoNaFrente: lapel > 0.3 ? "E" : undefined }, f);
    const cab = posCabeca(pose);
    const cx = lin(f, 4126, 4190, cab[0] - 130, 540, CURVA.suave);
    const cy = lin(f, 4126, 4190, cab[1] + 240, cab[1] + 160, CURVA.suave);
    const vira = lin(f, 4186, 4200, 0, 1, CURVA.suave);
    return (
      <svg width={W} height={H}>
        <g transform={`translate(540 960) scale(${zoom}) translate(${-cx} ${-cy})`}>
          <rect width={W} height={H} fill="#5a3a2a" />
          <rect x={90} y={300} width={900} height={760} rx={30} fill="#bfe3ff" stroke="#1d1424" strokeWidth={10} />
          <g>
            <defs>
              <clipPath id="jan10">
                <rect x={90} y={300} width={900} height={760} rx={30} />
              </clipPath>
            </defs>
            <g clipPath="url(#jan10)">
              {new Array(6).fill(0).map((_, i) => {
                const x = ((i * 360 - f * 3) % 2160 + 2160) % 2160 - 400;
                return <ellipse key={i} cx={x} cy={1000} rx={300} ry={160} fill="#9cc98a" stroke="#1d1424" strokeWidth={5} />;
              })}
              {new Array(4).fill(0).map((_, i) => {
                const x = ((i * 500 - f * 14) % 2000 + 2000) % 2000 - 200;
                return <rect key={i} x={x} y={500} width={18} height={560} fill="#6a4a3a" stroke="#1d1424" strokeWidth={3} />;
              })}
            </g>
          </g>
          <Boneco2D id="lu10" d={LUSTIG_RUA} pose={pose} rosto={pisca(f < 4150 ? RL.vendedor : { ...RL.vendedor, canto: 0.8, olhos: f >= 4215 && f < 4225 ? 0.1 : 0.78 }, f, "lu10")} />
          <Cracha x={cab[0] - 130} y={cab[1] + 240} vira={vira} esc={0.85} />
        </g>
        <EtiquetaHUD texto="VICTOR LUSTIG: GOLPISTA" x={540} y={260} s={M(f, 4200, "solto")} cor="#ff6b6b" />
      </svg>
    );
  }
  // P33: Lustig comemora na janela do trem, que vai embora
  const sai = lin(f, 4300, 4342, 0, 300, CURVA.entra);
  const ante = f >= 4253 && f < 4259 ? (f - 4253) / 6 : 0;
  const sobe = M(f, 4259, "solto");
  const base = P(540, 1500, 0.55, { agacha: 10 * ante, estica: 1 + 0.08 * sobe * Math.max(0, 1 - (f - 4259) / 30) });
  const pose = vivo({ ...base, bracoE: { ombro: 16 + 144 * sobe + Math.sin(f * 0.3) * 6 * sobe, cotovelo: -10 }, bracoD: { ombro: 16 + 144 * sobe + Math.sin(f * 0.3 + 1) * 6 * sobe, cotovelo: -10 }, maoE: sobe > 0.3 ? "aberta" : "bola", maoD: sobe > 0.3 ? "aberta" : "bola" }, f);
  const cab = posCabeca(pose);
  const chapeuY = f < 4262 ? 0 : f < 4300 ? -Math.sin(((f - 4262) / 38) * Math.PI) * 260 : 0;
  const chapeuRot = f >= 4262 && f < 4300 ? ((f - 4262) / 38) * 360 : 0;
  return (
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#3a2752" />
      <g stroke="#1d1424">
        <rect x={0} y={1350} width={W} height={14} fill="#5a4a6a" />
        <rect x={0} y={1400} width={W} height={14} fill="#5a4a6a" />
        {new Array(12).fill(0).map((_, i) => {
          const x = ((i * 110 - (f > 4300 ? (f - 4300) * 14 : 0)) % 1320 + 1320) % 1320 - 120;
          return <rect key={i} x={x} y={1340} width={40} height={84} fill="#4a3a2a" strokeWidth={3} />;
        })}
      </g>
      {new Array(4).fill(0).map((_, i) => {
        const t = ((f + i * 15) % 60) / 60;
        return <circle key={i} cx={300 + sai * 1.2 - t * 200} cy={380 - t * 220} r={30 + t * 50} fill="#d8d0e0" opacity={0.6 * (1 - t)} />;
      })}
      <g transform={`translate(${sai} 0) translate(540 1000) scale(1.2) translate(-540 -880)`}>
        <rect x={60} y={500} width={960} height={720} rx={30} fill="#5a3a2a" stroke="#1d1424" strokeWidth={10} />
        <rect x={140} y={560} width={800} height={480} rx={20} fill="#a0d2f4" stroke="#1d1424" strokeWidth={8} />
        <defs>
          <clipPath id="jan10b">
            <rect x={140} y={0} width={800} height={1040} />
          </clipPath>
        </defs>
        <g clipPath="url(#jan10b)">
          <Boneco2D id="lu10b" d={LUSTIG} pose={pose} rosto={pisca(sobe > 0.2 ? RL.feliz : RL.vendedor, f, "lu10b")} />
          <g transform={`translate(${cab[0]} ${cab[1] - 30 * 0.55 + chapeuY}) rotate(${chapeuRot}) scale(0.55)`}>
            <Chapeu c={LUSTIG_RUA.chapeu!} />
          </g>
        </g>
        <rect x={40} y={1040} width={1000} height={60} fill="#3a2418" stroke="#1d1424" strokeWidth={6} />
        {[200, 880].map((x) => (
          <circle key={x} cx={x} cy={1160} r={70} fill="#1d1424" />
        ))}
      </g>
      {f >= 4262
        ? new Array(12).fill(0).map((_, i) => {
            const t = (f - 4262 - i * 3) / 50;
            if (t < 0) return null;
            return <Nota key={i} x={540 + sai + (random(`n10${i}`) - 0.5) * 300 - t * (400 + random(`n10v${i}`) * 400)} y={700 - t * 300 + t * t * 500} rot={t * 360 * (i % 2 ? 1 : -1)} esc={0.7} />;
          })
        : null}
      <EtiquetaHUD texto="→ ÁUSTRIA" x={540} y={1440} s={M(f, 4288, "solto")} tamanho={90} />
    </svg>
  );
};

// ================= C11: vergonha =================
export const C11: React.FC<{ f: number }> = ({ f }) => {
  const zoom = f < 4416 ? 1 : lin(f, 4416, 4466, 1, 1.6, CURVA.suave);
  const chega = M(f, 4342, "pesado");
  const vermelho = lin(f, 4420, 4440, 0, 1);
  const d0: Design = { ...POISSON_RUA, pele: mistura(POISSON.pele, "#e86f5a", vermelho), peleSombra: mistura(POISSON.peleSombra, "#cc5a48", vermelho) };
  const cobre = f >= 4446 && f < 4512;
  const g = giro(f, 4512, 10);
  const virou = f >= 4517;
  const anda = f >= 4522;
  const x = 420 - (anda ? (f - 4522) * 7 : 0);
  const base = P(x, 1700 + (1 - chega) * 0, 0.6);
  const cab = posCabeca(base);
  const hesita = f >= 4360 && f < 4400 ? Math.sin(((f - 4360) / 40) * Math.PI) : 0;
  const bE = cobre ? alcancar(base, "E", [cab[0] - 75, cab[1] + 115], 90) : { ombro: 16, cotovelo: -10 };
  const bD = cobre ? alcancar(base, "D", [cab[0] + 75, cab[1] + 115], 90) : { ombro: 16 + 50 * hesita, cotovelo: -10 - 30 * hesita };
  const semChapeu: Design = { ...d0, chapeu: undefined };
  const w = andarPerfil(f / 2, 0.8, 12);
  const pose: Pose = virou
    ? { ...PERFIL_BASE, x, y: 1700 - (anda ? w.bob : 0), escala: 0.6, lado: -1, inclina: 8, cabeca: 10, peE: anda ? w.peE : PERFIL_BASE.peE, peD: anda ? w.peD : PERFIL_BASE.peD, bracoE: w.bracoE, bracoD: w.bracoD, largura: g.largura }
    : vivo({ ...base, bracoE: bE, bracoD: bD, maoE: cobre ? "aberta" : "bola", maoD: hesita > 0.3 || cobre ? "aberta" : "bola", maoNaFrente: cobre ? "ambas" : undefined, largura: f >= 4512 ? g.largura : 1 }, f);
  const rosto = pisca(f < 4416 ? RP.desconfiado : { ...RP.vergonha, vergonha: vermelho, olhar: f >= 4480 && f < 4500 ? [0.4, -0.3] : [0, 0.6] }, f, "po11");
  return (
    <svg width={W} height={H}>
      <g transform={`translate(540 960) scale(${zoom}) translate(${-540 + (zoom - 1) * -60} ${-960 + (zoom - 1) * -330})`}>
        <CeuParis tom="nublado" id="c11" />
        <g transform="translate(-20 0)">
          <Torre3D x={760} base={1200} h={1700} ang={10} inclina={0.1} />
        </g>
        <PredisParis base={1210} x0={-300} tom="nublado" />
        <Calcamento y={1200} tom="nublado" id="c11c" />
        <PortaPolicia x={800} base={1700} />
        <g filter="url(#desat11)">
          <defs>
            <filter id="desat11">
              <feColorMatrix type="saturate" values={String(1 - 0.15 * (1 - vermelho))} />
            </filter>
          </defs>
          <Boneco2D id="po11" d={cobre ? semChapeu : d0} pose={pose} rosto={rosto} />
        </g>
        {cobre ? (
          <g transform={`translate(${cab[0]} ${cab[1] + 150 - (f >= 4480 && f < 4500 ? 25 : 0)}) scale(0.85) rotate(-12)`}>
            <Chapeu c={POISSON_RUA.chapeu!} />
          </g>
        ) : null}
        {f >= 4460
          ? [0, 1].map((i) => <text key={i} x={300 + i * 520} y={1320 - i * 80} fontFamily="Roboto Condensed" fontWeight={800} fontSize={40} fill="#c8d0e0" opacity={(Math.floor((f + i * 20) / 20) % 2) * 0.7}>cri cri</text>)
          : null}
      </g>
      <rect width={W} height={H} fill="#c8d0e0" opacity={0.06} />
      <EtiquetaHUD texto="VERGONHA DEMAIS PRA DENUNCIAR" x={540} y={260} s={M(f, 4446, "natural")} tamanho={48} />
    </svg>
  );
};

export const _usa = [andar, COMERCIANTES_1, LUSTIG];
