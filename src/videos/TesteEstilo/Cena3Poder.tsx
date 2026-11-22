import { useMemo } from "react";
import { Easing, interpolate, interpolateColors, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Capim, Cena3D, Chao, Floresta, Luzes } from "../../estilo/Cenario";
import { LUCAS, NEUTRAL, Puppet, STAND, mixExpr, mixPose, type Expression, type Pose } from "../../estilo/Puppet";

const BASE_CARREGANDO: Pose = {
  ...STAND,
  hips: [0, -0.18, 0],
  torso: [0.12, 0, 0],
  head: [0.05, 0, 0],
  lHip: [0, 0, 0.28],
  rHip: [0, 0, -0.28],
  lKnee: 0.35,
  rKnee: 0.35,
  lShoulder: [0.15, 0, 0.5],
  rShoulder: [0.15, 0, -0.5],
  lElbow: 0.35,
  rElbow: 0.35,
};

const VITORIA: Pose = {
  ...BASE_CARREGANDO,
  hips: [0, -0.08, 0],
  torso: [-0.05, 0, 0],
  head: [-0.08, 0, 0],
  lShoulder: [-0.2, 0, 0.75],
  rShoulder: [-0.2, 0, -0.75],
  lElbow: 0.9,
  rElbow: 0.9,
};

const GRITANDO: Expression = { ...NEUTRAL, brows: -1, eyes: 0.75, mouthOpen: 1, smile: 0 };
const CONFIANTE: Expression = { ...NEUTRAL, brows: -0.7, eyes: 1, mouthOpen: 0, smile: 0.8 };

const Aura: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t <= 0) return null;
  return (
    <group position={[0, 2, 0]}>
      {[0, 1, 2].map((i) => {
        const s = (1 + i * 0.18) * (1 + 0.05 * Math.sin(f * 0.7 + i * 2)) * t;
        return (
          <mesh key={i} scale={[s * 1.25, s * 2.1, s * 1.1]}>
            <sphereGeometry args={[1.1, 32, 24]} />
            <meshBasicMaterial
              color={i === 0 ? "#fff5b8" : "#ffc929"}
              transparent
              opacity={0.13 - i * 0.03}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.BackSide}
            />
          </mesh>
        );
      })}
      {/* riscos de energia subindo */}
      {new Array(16).fill(0).map((_, i) => {
        const ang = random(`a${i}`) * Math.PI * 2;
        const r = 1.1 + random(`r${i}`) * 0.6;
        const y = ((f * (0.08 + random(`v${i}`) * 0.06) + random(`y${i}`) * 4) % 4.5) - 2.3;
        return (
          <mesh key={i} position={[Math.cos(ang) * r, y, Math.sin(ang) * r * 0.6]} scale={[0.03 * t, 0.45 * t, 0.03 * t]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#fff6c8" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

const Pedras: React.FC<{ f: number; charge: number }> = ({ f, charge }) => {
  const rocks = useMemo(
    () =>
      new Array(14).fill(0).map((_, i) => ({
        x: (random(`rx${i}`) - 0.5) * 5,
        z: (random(`rz${i}`) - 0.5) * 3,
        s: 0.07 + random(`rs${i}`) * 0.12,
        sp: 0.6 + random(`rp${i}`) * 0.8,
        d: random(`rd${i}`) * 25,
      })),
    [],
  );
  return (
    <>
      {rocks.map((r, i) => {
        const local = Math.max(0, f - r.d);
        const y = Math.min(3.5, local * 0.025 * r.sp) * charge;
        if (y <= 0.01) return null;
        return (
          <mesh key={i} position={[r.x, y + Math.sin(f * 0.4 + i) * 0.05, r.z]} rotation={[f * 0.05 + i, f * 0.03, 0]} scale={r.s}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#8c7a63" roughness={1} flatShading />
          </mesh>
        );
      })}
    </>
  );
};

export const Cena3Poder: React.FC<{ poderEm: number }> = ({ poderEm }) => {
  const f = useCurrentFrame();
  const charge = interpolate(f, [0, poderEm], [0, 1], { extrapolateRight: "clamp" });
  const p = interpolate(f, [poderEm - 3, poderEm + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shaking = f < poderEm + 8;
  const shake = shaking ? charge * 0.06 : 0.01;

  const pose = mixPose(BASE_CARREGANDO, VITORIA, interpolate(f, [poderEm, poderEm + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  }));
  // tremedeira nos punhos enquanto carrega
  const tremor = Math.sin(f * 2.3) * 0.04 * charge * (1 - p);
  const poseT: Pose = { ...pose, lElbow: pose.lElbow + tremor, rElbow: pose.rElbow - tremor };
  const expr = mixExpr(mixExpr(NEUTRAL, GRITANDO, Math.min(1, charge * 3)), CONFIANTE, p);

  // céu: normal -> tempestade (carregando) -> dourado (poder)
  const storm = Math.min(1, charge * 1.4);
  const top = interpolateColors(p, [0, 1], [interpolateColors(storm, [0, 1], ["#8fbfe6", "#3b335c"]), "#ff9a3c"]);
  const mid = interpolateColors(p, [0, 1], [interpolateColors(storm, [0, 1], ["#cfe4ef", "#6d5d86"]), "#ffd36b"]);
  const bot = interpolateColors(p, [0, 1], [interpolateColors(storm, [0, 1], ["#e6eedc", "#8f8a8a"]), "#fff0b8"]);
  const sky = `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bot} 100%)`;
  const light = interpolate(storm, [0, 1], [1, 0.55]) + p * 0.5;

  // câmera baixa, aproximando
  const z = interpolate(f, [0, 120], [8.5, 6.4]);
  const jx = Math.sin(f * 3.7) * shake;
  const jy = Math.cos(f * 4.3) * shake;
  const cam = { pos: [jx, 1.3 + jy, z] as [number, number, number], target: [0, 2.3 + jy, 0] as [number, number, number], fov: 40 };

  return (
    <Cena3D
      cam={cam}
      sky={sky}
      blur={8}
      fundo={
        <>
          <Luzes intensity={light} />
          <Chao color={interpolateColors(storm, [0, 1], ["#86b45a", "#6e8250"])} />
          <Floresta green={interpolateColors(storm, [0, 1], ["#5f9e3f", "#47703a"])} />
        </>
      }
      frente={
        <>
          <Luzes intensity={light} />
          <pointLight position={[0, 2.2, 2]} intensity={p * 3.5} distance={7} color="#ffcc4d" />
          <Chao size={9} color={interpolateColors(storm, [0, 1], ["#86b45a", "#6e8250"])} />
          <Capim count={30} area={[7, 4]} seed="c3" />
          <Pedras f={f} charge={charge} />
          <Puppet pose={poseT} expr={expr} look={{ ...LUCAS, power: p }} />
          <Aura t={p} f={f} />
        </>
      }
    />
  );
};
