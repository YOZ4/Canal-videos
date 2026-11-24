import { AbsoluteFill } from "remotion";
import { Boneco2D, PERFIL_BASE, ROSTO_BASE, type Pose } from "../../estilo2d/Boneco2D";
import { GOLPES, poseGolpe, type Golpe } from "../../estilo2d/golpes";
import { LUCAS } from "../../estilo2d/personagens";

/** folha de conferência da biblioteca de golpes: 8 momentos de cada golpe (contato marcado em vermelho) */
const LISTA = Object.values(GOLPES) as Golpe[];
export const FOLHA_G_W = 2600;
export const FOLHA_G_H = 120 + LISTA.length * 420;

export const FolhaGolpes: React.FC<{ so?: string; us?: number[] }> = ({ so, us: usFixos }) => (
  <AbsoluteFill style={{ background: "#e9e2d6" }}>
    <svg width={FOLHA_G_W} height={FOLHA_G_H}>
      {LISTA.filter((g) => !so || g.nome === so).map((g, li) => {
        const y0 = 120 + li * 420;
        const chao = y0 + 360;
        const us = new Array(8).fill(0).map((_, i) => Math.round((i * g.dur) / 7));
        const us2 = usFixos ?? us;
        return (
          <g key={g.nome}>
            <rect x={0} y={y0} width={FOLHA_G_W} height={410} fill={li % 2 ? "#e2dacb" : "#ece5da"} />
            <line x1={0} y1={chao} x2={FOLHA_G_W} y2={chao} stroke="#9a8f80" strokeWidth={4} />
            <text x={20} y={y0 + 50} fontFamily="Fredoka" fontWeight={700} fontSize={44} fill="#1d1424">{g.nome}</text>
            {us2.map((u, i) => {
              const base: Pose = { ...PERFIL_BASE, x: 420 + i * 290, y: chao, escala: 0.3, lado: 1 };
              const p = poseGolpe(g, u, base);
              const marco = g.contato ?? g.recebe ?? g.pouso;
              const contato = marco !== undefined && Math.abs(u - marco) <= 1;
              return (
                <g key={i}>
                  {contato ? <rect x={base.x - 140} y={y0 + 10} width={280} height={390} fill="none" stroke="#e8343f" strokeWidth={6} /> : null}
                  <Boneco2D id={`fg${li}-${i}`} d={LUCAS} pose={p} rosto={ROSTO_BASE} />
                  <text x={base.x} y={y0 + 400} textAnchor="middle" fontFamily="Fredoka" fontSize={26} fill="#5a4a3a">u={u}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
