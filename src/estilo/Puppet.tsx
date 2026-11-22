import { useMemo } from "react";
import { interpolateColors } from "remotion";
import * as THREE from "three";

/**
 * Personagem "boneco" articulado, estilo 3D simples:
 * cabeça redonda, membros cilíndricos, rosto chapado.
 *
 * Todas as medidas em unidades da cena (altura total ≈ 4).
 * A origem (0,0,0) fica entre os pés, no chão.
 */

export type Vec3 = [number, number, number];

export type Pose = {
  /** deslocamento do quadril em relação à posição em pé */
  hips: Vec3;
  /** rotação do quadril inteiro (inclui pernas) */
  hipsRot: Vec3;
  torso: Vec3;
  head: Vec3;
  lShoulder: Vec3;
  lElbow: number;
  rShoulder: Vec3;
  rElbow: number;
  lHip: Vec3;
  lKnee: number;
  rHip: Vec3;
  rKnee: number;
};

export type Expression = {
  /** -1 bravo / 0 neutro / 1 preocupado */
  brows: number;
  /** -1 triste / 0 reto / 1 sorriso */
  smile: number;
  /** 0 fechada / 1 "O" aberta */
  mouthOpen: number;
  /** 0 fechados / 1 normais / 1.4 arregalados */
  eyes: number;
  /** direção do olhar (-1..1) */
  look: [number, number];
};

export type Look = {
  skin: string;
  shirt: string;
  shirtDark: string;
  shorts: string;
  shoes: string;
  hair: string;
  /** 0 = cabelo normal / 1 = cabelo dourado espetado */
  power: number;
};

export const LUCAS: Look = {
  skin: "#d9976a",
  shirt: "#1f9e8f",
  shirtDark: "#17796e",
  shorts: "#3e4a61",
  shoes: "#f4f1ea",
  hair: "#2b1d16",
  power: 0,
};

export const STAND: Pose = {
  hips: [0, 0, 0],
  hipsRot: [0, 0, 0],
  torso: [0, 0, 0],
  head: [0, 0, 0],
  lShoulder: [0, 0, 0.1],
  lElbow: 0.15,
  rShoulder: [0, 0, -0.1],
  rElbow: 0.15,
  lHip: [0, 0, 0.03],
  lKnee: 0,
  rHip: [0, 0, -0.03],
  rKnee: 0,
};

export const NEUTRAL: Expression = {
  brows: 0,
  smile: 0.3,
  mouthOpen: 0,
  eyes: 1,
  look: [0, 0],
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  hips: lerp3(a.hips, b.hips, t),
  hipsRot: lerp3(a.hipsRot, b.hipsRot, t),
  torso: lerp3(a.torso, b.torso, t),
  head: lerp3(a.head, b.head, t),
  lShoulder: lerp3(a.lShoulder, b.lShoulder, t),
  lElbow: lerp(a.lElbow, b.lElbow, t),
  rShoulder: lerp3(a.rShoulder, b.rShoulder, t),
  rElbow: lerp(a.rElbow, b.rElbow, t),
  lHip: lerp3(a.lHip, b.lHip, t),
  lKnee: lerp(a.lKnee, b.lKnee, t),
  rHip: lerp3(a.rHip, b.rHip, t),
  rKnee: lerp(a.rKnee, b.rKnee, t),
});

export const mixExpr = (a: Expression, b: Expression, t: number): Expression => ({
  brows: lerp(a.brows, b.brows, t),
  smile: lerp(a.smile, b.smile, t),
  mouthOpen: lerp(a.mouthOpen, b.mouthOpen, t),
  eyes: lerp(a.eyes, b.eyes, t),
  look: [lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t)],
});

// ---------- dimensões ----------
const HIP_Y = 1.38;
const THIGH = 0.66;
const SHIN = 0.62;
const UPPER_ARM = 0.6;
const FOREARM = 0.56;
const TORSO_H = 1.05;
const HEAD_R = 0.6;

const Mat: React.FC<{ color: string; emissive?: string; emissiveIntensity?: number }> = ({
  color,
  emissive = "#000000",
  emissiveIntensity = 0,
}) => (
  <meshStandardMaterial
    color={color}
    roughness={0.92}
    metalness={0}
    emissive={emissive}
    emissiveIntensity={emissiveIntensity}
  />
);

// ---------- rosto ----------

const onHead = (x: number, y: number, lift = 0.01): Vec3 => {
  const z = Math.sqrt(Math.max(0, HEAD_R * HEAD_R - x * x - y * y)) + lift;
  return [x, y, z];
};

const Face: React.FC<{ e: Expression }> = ({ e }) => {
  const ink = "#1b1414";
  const eyeH = 0.085 * Math.max(0.08, e.eyes);
  const eyeW = 0.055 * (e.eyes > 1 ? 1 + (e.eyes - 1) * 0.6 : 1);
  const lx = e.look[0] * 0.03;
  const ly = e.look[1] * 0.03;
  // sobrancelhas: bravo = pontas internas para baixo
  const browRot = e.brows * 0.35;
  const mouthW = 0.12;
  return (
    <group>
      {[1, -1].map((s) => {
        const ep = onHead(0.17 * s + lx, 0.06 + ly, 0.0);
        const bp = onHead(0.19 * s, 0.24 + Math.abs(e.brows) * -0.02 + (e.eyes > 1 ? 0.03 : 0), 0.0);
        const yaw = Math.atan2(ep[0], ep[2]);
        return (
          <group key={s}>
            {/* olho: elipse preta "pintada" */}
            <mesh position={ep} rotation={[-0.1, yaw, 0]} scale={[eyeW, eyeH, 0.02]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color={ink} />
            </mesh>
            {/* brilho */}
            {e.eyes > 0.5 ? (
              <mesh
                position={[ep[0] + 0.018, ep[1] + 0.03, ep[2] + 0.015]}
                scale={[0.016, 0.016, 0.01]}
              >
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ) : null}
            {/* sobrancelha */}
            <mesh
              position={bp}
              rotation={[-0.25, yaw, -browRot * s]}
              scale={[0.11, 0.022, 0.02]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={ink} />
            </mesh>
          </group>
        );
      })}
      {/* nariz */}
      <mesh position={onHead(0, -0.06, -0.02)} scale={[0.05, 0.045, 0.05]}>
        <sphereGeometry args={[1, 12, 12]} />
        <Mat color="#c98457" />
      </mesh>
      {/* boca */}
      {e.mouthOpen > 0.15 ? (
        <mesh
          position={onHead(0, -0.22, 0)}
          rotation={[-0.4, 0, 0]}
          scale={[0.05 + e.mouthOpen * 0.02, 0.04 + e.mouthOpen * 0.05, 0.02]}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#3a1212" />
        </mesh>
      ) : (
        <group position={onHead(0, -0.2, 0)} rotation={[-0.38, 0, 0]}>
          {Math.abs(e.smile) < 0.1 ? (
            <mesh scale={[mouthW, 0.016, 0.02]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={ink} />
            </mesh>
          ) : (
            <mesh
              rotation={[0, 0, e.smile > 0 ? Math.PI : 0]}
              position={[0, e.smile > 0 ? 0.05 * Math.abs(e.smile) : -0.05 * Math.abs(e.smile), 0]}
              scale={[1, Math.min(1, Math.abs(e.smile) + 0.25), 1]}
            >
              <torusGeometry args={[0.07, 0.011, 6, 20, Math.PI]} />
              <meshBasicMaterial color={ink} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};

// ---------- cabelo ----------

const HAIR_SPIKES: [number, number][] = [
  [0, 0], [22, 0], [22, 60], [22, 120], [22, 180], [22, 240], [22, 300],
  [45, 30], [45, 90], [45, 150], [45, 210], [45, 270], [45, 330],
  [68, 0], [68, 50], [68, 110], [68, 160], [68, 200], [68, 250], [68, 310],
];

// cachinhos: pontos espalhados na parte de cima/trás da cabeça (sem cobrir a testa)
const CURLS = (() => {
  const out: THREE.Vector3[] = [];
  const n = 160;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    const v = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    const testa = v.z > 0.35 && v.y < 0.62;
    if (v.y > 0.12 && !testa) out.push(v);
    else if (v.y > -0.25 && v.z < -0.3) out.push(v); // nuca
  }
  return out;
})();

const Hair: React.FC<{ look: Look }> = ({ look }) => {
  const p = look.power;
  const color = interpolateColors(p, [0, 1], [look.hair, "#ffe640"]);
  const emissive = interpolateColors(p, [0, 1], ["#000000", "#ffc400"]);
  const dirs = useMemo(
    () =>
      HAIR_SPIKES.map(([tilt, yaw]) => {
        const th = THREE.MathUtils.degToRad(tilt);
        const ph = THREE.MathUtils.degToRad(yaw);
        return new THREE.Vector3(
          Math.sin(th) * Math.sin(ph),
          Math.cos(th),
          Math.sin(th) * Math.cos(ph),
        ).normalize();
      }),
    [],
  );
  const up = new THREE.Vector3(0, 1, 0);
  const curl = 1 - Math.min(1, p * 1.5);
  return (
    <group>
      {/* base do cabelo: cobre topo e nuca, deixa a testa livre */}
      <mesh rotation={[-0.5 + p * 0.32, 0, 0]}>
        <sphereGeometry args={[HEAD_R + 0.03, 40, 28, 0, Math.PI * 2, 0, 1.45]} />
        <Mat color={color} emissive={emissive} emissiveIntensity={p * 0.8} />
      </mesh>
      {curl > 0
        ? CURLS.map((d, i) => (
            <mesh key={i} position={d.clone().multiplyScalar(HEAD_R + 0.035).toArray()} scale={0.085 * curl}>
              <sphereGeometry args={[1, 10, 8]} />
              <Mat color={color} />
            </mesh>
          ))
        : null}
      {p > 0
        ? dirs.map((d, i) => {
            const dir = d.clone().lerp(d.clone().multiplyScalar(0.35).add(up), 0.65).normalize();
            const len = (0.55 + 0.35 * Math.abs(Math.sin(i * 1.7))) * p;
            const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
            const eul = new THREE.Euler().setFromQuaternion(q);
            const pos = dir.clone().multiplyScalar(HEAD_R * 0.8 + len * 0.45);
            return (
              <mesh key={i} position={[pos.x, pos.y, pos.z - 0.05]} rotation={[eul.x, eul.y, eul.z]}>
                <coneGeometry args={[0.17, len, 8]} />
                <Mat color={color} emissive={emissive} emissiveIntensity={p * 0.8} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

// ---------- membros ----------

const Limb: React.FC<{ len: number; r: number; color: string }> = ({ len, r, color }) => (
  <>
    <mesh position={[0, -len / 2, 0]}>
      <cylinderGeometry args={[r, r * 0.92, len, 16]} />
      <Mat color={color} />
    </mesh>
    <mesh position={[0, -len, 0]}>
      <sphereGeometry args={[r * 0.92, 16, 12]} />
      <Mat color={color} />
    </mesh>
  </>
);

const Arm: React.FC<{ side: 1 | -1; shoulder: Vec3; elbow: number; look: Look }> = ({
  side,
  shoulder,
  elbow,
  look,
}) => (
  <group position={[0.47 * side, TORSO_H - 0.12, 0]} rotation={shoulder}>
    {/* manga */}
    <mesh position={[0, -0.12, 0]}>
      <cylinderGeometry args={[0.16, 0.15, 0.32, 16]} />
      <Mat color={look.shirt} />
    </mesh>
    <mesh>
      <sphereGeometry args={[0.16, 16, 12]} />
      <Mat color={look.shirt} />
    </mesh>
    <Limb len={UPPER_ARM} r={0.1} color={look.skin} />
    <group position={[0, -UPPER_ARM, 0]} rotation={[-elbow, 0, 0]}>
      <Limb len={FOREARM} r={0.085} color={look.skin} />
      {/* mão */}
      <mesh position={[0, -FOREARM - 0.08, 0]} scale={[0.85, 1.15, 0.6]}>
        <sphereGeometry args={[0.11, 16, 12]} />
        <Mat color={look.skin} />
      </mesh>
    </group>
  </group>
);

const Leg: React.FC<{ side: 1 | -1; hip: Vec3; knee: number; look: Look }> = ({
  side,
  hip,
  knee,
  look,
}) => (
  <group position={[0.19 * side, 0, 0]} rotation={hip}>
    {/* perna do short */}
    <mesh position={[0, -0.2, 0]}>
      <cylinderGeometry args={[0.18, 0.17, 0.42, 16]} />
      <Mat color={look.shorts} />
    </mesh>
    <Limb len={THIGH} r={0.115} color={look.skin} />
    <group position={[0, -THIGH, 0]} rotation={[knee, 0, 0]}>
      <Limb len={SHIN} r={0.105} color={look.skin} />
      {/* tênis */}
      <group position={[0, -SHIN - 0.02, 0.07]}>
        <mesh scale={[0.15, 0.1, 0.27]}>
          <sphereGeometry args={[1, 16, 12]} />
          <Mat color={look.shoes} />
        </mesh>
        <mesh position={[0, -0.06, 0]} scale={[0.155, 0.035, 0.28]}>
          <sphereGeometry args={[1, 16, 8]} />
          <Mat color="#c94b3b" />
        </mesh>
      </group>
    </group>
  </group>
);

// ---------- corpo ----------

export const Puppet: React.FC<{
  pose: Pose;
  expr: Expression;
  look?: Look;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
}> = ({ pose, expr, look = LUCAS, position, rotation, scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group
        position={[pose.hips[0], HIP_Y + pose.hips[1], pose.hips[2]]}
        rotation={pose.hipsRot}
      >
        {/* quadril / short */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.4, 0.38, 0.34, 20]} />
          <Mat color={look.shorts} />
        </mesh>
        <Leg side={1} hip={pose.lHip} knee={pose.lKnee} look={look} />
        <Leg side={-1} hip={pose.rHip} knee={pose.rKnee} look={look} />

        {/* tronco */}
        <group position={[0, 0.12, 0]} rotation={pose.torso}>
          <mesh position={[0, TORSO_H / 2, 0]} scale={[1, 1, 0.72]}>
            <cylinderGeometry args={[0.44, 0.38, TORSO_H, 24]} />
            <Mat color={look.shirt} />
          </mesh>
          {/* ombros arredondados */}
          <mesh position={[0, TORSO_H - 0.02, 0]} scale={[1, 0.32, 0.72]}>
            <sphereGeometry args={[0.44, 24, 12]} />
            <Mat color={look.shirt} />
          </mesh>
          {/* gola */}
          <mesh position={[0, TORSO_H + 0.08, 0]}>
            <torusGeometry args={[0.15, 0.035, 8, 20]} />
            <Mat color={look.shirtDark} />
          </mesh>
          {/* bolso no peito (detalhe da camiseta do Lucas) */}
          <mesh position={[0.2, TORSO_H * 0.68, 0.305]} rotation={[0, 0.35, 0]} scale={[0.13, 0.14, 0.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <Mat color={look.shirtDark} />
          </mesh>
          <Arm side={1} shoulder={pose.lShoulder} elbow={pose.lElbow} look={look} />
          <Arm side={-1} shoulder={pose.rShoulder} elbow={pose.rElbow} look={look} />

          {/* pescoço + cabeça */}
          <mesh position={[0, TORSO_H + 0.12, 0]}>
            <cylinderGeometry args={[0.12, 0.13, 0.24, 12]} />
            <Mat color={look.skin} />
          </mesh>
          <group position={[0, TORSO_H + 0.2, 0]} rotation={pose.head}>
            <group position={[0, HEAD_R * 0.92, 0]}>
              <mesh scale={[1, 1.02, 0.96]}>
                <sphereGeometry args={[HEAD_R, 40, 32]} />
                <Mat color={look.skin} />
              </mesh>
              {/* orelhas */}
              {[1, -1].map((s) => (
                <mesh key={s} position={[HEAD_R * 0.97 * s, -0.02, 0]} scale={[0.06, 0.12, 0.09]}>
                  <sphereGeometry args={[1, 12, 12]} />
                  <Mat color={look.skin} />
                </mesh>
              ))}
              <Face e={expr} />
              <Hair look={look} />
            </group>
          </group>
        </group>
      </group>

      {/* sombra no chão (estilo "blob") */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pose.hips[0], 0.01, pose.hips[2] + 0.05]}>
        <circleGeometry args={[0.75, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
};
