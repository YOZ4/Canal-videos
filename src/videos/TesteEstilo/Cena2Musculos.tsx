import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Rotulo } from "../../estilo/Overlays";

const W = 1080;
const FIBRAS = 7;

export const Cena2Musculos: React.FC = () => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [30, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.6)),
  });
  const zoom = interpolate(f, [0, 105], [1, 1.1]);

  const thin = 34;
  const thick = 74;
  const gapThin = 70;
  const gapThick = 84;
  const h = thin + (thick - thin) * grow;
  const gap = gapThin + (gapThick - gapThin) * grow;
  const total = gap * (FIBRAS - 1) + h;
  const top0 = 820 - total / 2;

  return (
    <AbsoluteFill style={{ background: "#26476b", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
          {/* grade de fundo */}
          {new Array(12).fill(0).map((_, i) => (
            <line key={`v${i}`} x1={i * 100 + 40} y1={0} x2={i * 100 + 40} y2={1920} stroke="#ffffff" strokeOpacity={0.07} strokeWidth={2} />
          ))}
          {new Array(20).fill(0).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 100 + 20} x2={W} y2={i * 100 + 20} stroke="#ffffff" strokeOpacity={0.07} strokeWidth={2} />
          ))}

          {/* bainha do músculo */}
          <rect x={60} y={top0 - 70} width={W - 120} height={total + 140} rx={90} fill="#f2c2b0" opacity={0.9} />
          <rect x={60} y={top0 - 70} width={W - 120} height={total + 140} rx={90} fill="none" stroke="#e39c86" strokeWidth={8} />

          {/* fibras */}
          {new Array(FIBRAS).fill(0).map((_, i) => {
            const y = top0 + i * gap;
            const wob = Math.sin(f * 0.25 + i) * 2 * grow;
            return (
              <g key={i}>
                <rect x={110} y={y + wob} width={W - 220} height={h} rx={h / 2} fill="#d9535f" />
                <rect x={130} y={y + wob + h * 0.15} width={W - 260} height={h * 0.22} rx={h * 0.11} fill="#ef8a8f" />
                {/* estrias */}
                {new Array(22).fill(0).map((__, j) => (
                  <line
                    key={j}
                    x1={150 + j * 37}
                    x2={150 + j * 37}
                    y1={y + wob + 6}
                    y2={y + wob + h - 6}
                    stroke="#b8414c"
                    strokeWidth={4}
                    strokeOpacity={0.55}
                  />
                ))}
                {/* "energia" amarela pulsando dentro */}
                {grow > 0.3
                  ? new Array(4).fill(0).map((__, k) => {
                      const px = 150 + ((f * (6 + k) + random(`p${i}${k}`) * 800) % 780);
                      return (
                        <circle key={k} cx={px} cy={y + wob + h / 2} r={6 + 4 * grow} fill="#ffe27a" opacity={0.9} />
                      );
                    })
                  : null}
              </g>
            );
          })}

          {/* medida (colchete) */}
          <g opacity={grow > 0.05 ? 1 : 0}>
            <line x1={W - 60} x2={W - 60} y1={top0} y2={top0 + total} stroke="#ffd23f" strokeWidth={7} />
            <line x1={W - 85} x2={W - 35} y1={top0} y2={top0} stroke="#ffd23f" strokeWidth={7} />
            <line x1={W - 85} x2={W - 35} y1={top0 + total} y2={top0 + total} stroke="#ffd23f" strokeWidth={7} />
          </g>
        </svg>
        <Rotulo text="10x" x={W - 150} y={top0 - 120} from={62} size={110} />
        <Rotulo text="fibra muscular" x={330} y={top0 - 130} from={8} size={54} color="#ffffff" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
