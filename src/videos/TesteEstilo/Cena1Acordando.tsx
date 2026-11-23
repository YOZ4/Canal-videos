import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Capim, Cena3D, Chao, Floresta, Luzes } from "../../estilo/Cenario";
import { LUCAS, NEUTRAL, Puppet, STAND, mixExpr, mixPose, type Expression, type Pose } from "../../estilo/Puppet";

const SKY = "linear-gradient(180deg, #8fbfe6 0%, #cfe4ef 55%, #e6eedc 100%)";

const ESPREGUICANDO: Pose = {
  ...STAND,
  torso: [-0.12, 0, 0],
  head: [-0.3, 0, 0.08],
  lShoulder: [0, 0, 2.75],
  rShoulder: [0, 0, -2.75],
  lElbow: 0.25,
  rElbow: 0.25,
};

const OLHANDO_MAOS: Pose = {
  ...STAND,
  torso: [0.08, 0, 0],
  head: [0.42, 0, 0],
  lShoulder: [-0.75, 0, 0.12],
  rShoulder: [-0.75, 0, -0.12],
  lElbow: 1.25,
  rElbow: 1.25,
};

const BOCEJO: Expression = { ...NEUTRAL, eyes: 0, mouthOpen: 1, brows: 0.4, smile: 0 };
const SURPRESO: Expression = { ...NEUTRAL, eyes: 1.4, mouthOpen: 0.55, brows: 0.9, smile: 0, look: [0, -1] };

export const Cena1Acordando: React.FC = () => {
  const f = useCurrentFrame();
  const ease = Easing.inOut(Easing.cubic);

  // 0-45 espreguiçando (braços sobem e balançam), 50-75 abaixa e olha as mãos
  const up = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const toHands = interpolate(f, [48, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const sway = Math.sin(f * 0.15) * 0.06 * (1 - toHands);

  let pose = mixPose(STAND, ESPREGUICANDO, up);
  pose = { ...pose, torso: [pose.torso[0], 0, sway] };
  pose = mixPose(pose, OLHANDO_MAOS, toHands);
  // mãos "abrindo e fechando" enquanto olha
  const wiggle = Math.sin(f * 0.5) * 0.08 * toHands;
  pose = { ...pose, lElbow: pose.lElbow + wiggle, rElbow: pose.rElbow - wiggle };

  const expr = mixExpr(mixExpr(NEUTRAL, BOCEJO, up), SURPRESO, toHands);

  // câmera: push-in lento
  const z = interpolate(f, [0, 120], [9.5, 7.2]);
  const y = interpolate(f, [0, 120], [2.6, 2.8]);
  const cam = { pos: [0.6, y, z] as [number, number, number], target: [0, 2.35, 0] as [number, number, number], fov: 38 };

  return (
    <Cena3D
      cam={cam}
      sky={SKY}
      fundo={
        <>
          <Luzes />
          <Chao />
          <Floresta />
        </>
      }
      frente={
        <>
          <Luzes />
          <Chao size={9} />
          <Capim count={30} area={[7, 4]} />
          <Puppet pose={pose} expr={expr} look={LUCAS} rotation={[0, 0.18, 0]} />
        </>
      }
    />
  );
};
