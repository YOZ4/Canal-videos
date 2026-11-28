import { AbsoluteFill } from "remotion";
import { ROSTO_BASE } from "../../estilo2d/Boneco2D";
import { SupinoOrbita } from "./supino3d";

export const TesteSupino: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <svg width={3240} height={1920}>
      {[{ yaw: 15, s: 0.2, a: 0 }, { yaw: 40, s: 0.6, a: 0 }, { yaw: 55, s: 1, a: 4 }].map((c, i) => (
        <g key={i} transform={`translate(${i * 1080} 0)`}>
          <clipPath id={`c${i}`}>
            <rect width={1080} height={1920} />
          </clipPath>
          <g clipPath={`url(#c${i})`} transform="translate(540 960) scale(0.85) translate(-330 -1150)">
            <SupinoOrbita f={10} cam={{ yaw: c.yaw, zoom: 1, x: 0, y: 0 }} sobe={c.s} anilhas={c.a} musculo={c.a ? 1 : 0} rosto={{ ...ROSTO_BASE, olhos: 0.5, sobrancelha: -10 }} />
          </g>
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
