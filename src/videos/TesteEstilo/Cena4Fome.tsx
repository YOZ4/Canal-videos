import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Capim, Cena3D, Chao, Floresta, Luzes } from "../../estilo/Cenario";
import { Rotulo } from "../../estilo/Overlays";
import { LUCAS, NEUTRAL, Puppet, STAND, mixExpr, mixPose, type Expression, type Pose } from "../../estilo/Puppet";

const SKY = "linear-gradient(180deg, #f2b46b 0%, #f6d9a6 55%, #eee6cf 100%)";

const SENTADO: Pose = {
  ...STAND,
  hips: [0, -1.08, 0],
  torso: [0.22, 0, 0.05],
  head: [0.12, 0, 0.2],
  lHip: [-1.6, 0, 0.18],
  rHip: [-1.6, 0, -0.18],
  lKnee: 0.25,
  rKnee: 0.25,
  lShoulder: [0.1, 0, 0.32],
  rShoulder: [0.1, 0, -0.32],
  lElbow: 0.25,
  rElbow: 0.25,
};

// queda: começa em pé "derretendo"
const CAINDO: Pose = {
  ...STAND,
  hips: [0, -0.35, 0],
  torso: [0.25, 0, 0.1],
  head: [0.35, 0, 0.25],
  lKnee: 0.7,
  rKnee: 0.7,
  lHip: [-0.5, 0, 0.1],
  rHip: [-0.5, 0, -0.1],
  lShoulder: [0, 0, 0.25],
  rShoulder: [0, 0, -0.25],
};

const CANSADO: Expression = { ...NEUTRAL, eyes: 0.45, brows: 0.9, smile: -0.7, mouthOpen: 0, look: [0, -1] };

const Suor: React.FC<{ f: number }> = ({ f }) => (
  <>
    {[0, 1].map((i) => {
      const t = ((f + i * 25) % 50) / 50;
      return (
        <mesh key={i} position={[0.75 - i * 1.5, 2.55 - t * 0.5, 0.7]} scale={[0.07, 0.1, 0.07]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color="#bfe6ff" roughness={0.2} transparent opacity={1 - t} />
        </mesh>
      );
    })}
  </>
);

export const Cena4Fome: React.FC = () => {
  const f = useCurrentFrame();
  const fall = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const sit = interpolate(f, [8, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.bounce),
  });
  const pose = mixPose(mixPose(STAND, CAINDO, fall), SENTADO, sit);
  // respiração ofegante
  const breath = Math.sin(f * 0.45) * 0.04 * sit;
  const poseB: Pose = { ...pose, torso: [pose.torso[0] + breath, pose.torso[1], pose.torso[2]] };
  const expr = mixExpr(NEUTRAL, CANSADO, Math.min(1, f / 10));

  const z = interpolate(f, [0, 105], [10.5, 9.5]);
  const cam = { pos: [0.2, 2.3, z] as [number, number, number], target: [0, 1.35, 0] as [number, number, number], fov: 38 };

  // "ronco" da barriga: ondinhas 2D
  const ronco = f > 40 ? (f - 40) % 30 : -1;

  return (
    <AbsoluteFill>
      <Cena3D
        cam={cam}
        sky={SKY}
        fundo={
          <>
            <Luzes warm="#ffd9a8" />
            <Chao color="#94ad5b" />
            <Floresta green="#6f9a40" />
          </>
        }
        frente={
          <>
            <Luzes warm="#ffd9a8" />
            <Chao size={9} color="#94ad5b" />
            <Capim count={30} area={[7, 4]} seed="c4" />
            <Puppet pose={poseB} expr={expr} look={LUCAS} rotation={[0, 0.85, 0]} />
            {sit > 0.9 ? <Suor f={f} /> : null}
          </>
        }
      />
      {ronco >= 0 && ronco < 18 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${640 + i * 30} ${1200 - i * 30} q 30 ${-20 - i * 6} 0 ${-50 - i * 12}`}
              stroke="#ffffff"
              strokeWidth={9}
              strokeLinecap="round"
              fill="none"
              opacity={interpolate(ronco, [0, 4, 14, 18], [0, 1, 1, 0])}
            />
          ))}
        </svg>
      ) : null}
      <Rotulo text="ronc..." x={800} y={1080} from={42} size={62} color="#ffffff" />
      <Rotulo text="-9.000 kcal" x={540} y={330} from={30} size={96} />
    </AbsoluteFill>
  );
};
