import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, random, useVideoConfig } from "remotion";
import * as THREE from "three";
import type { Vec3 } from "./Puppet";

// ---------- câmera compartilhada entre as camadas ----------

export type Cam = { pos: Vec3; target: Vec3; fov: number };

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    camera.fov = cam.fov;
    camera.lookAt(...cam.target);
    camera.updateProjectionMatrix();
  }, [camera, cam.pos[0], cam.pos[1], cam.pos[2], cam.target[0], cam.target[1], cam.target[2], cam.fov]);
  return null;
};

export const Luzes: React.FC<{ intensity?: number; warm?: string }> = ({
  intensity = 1,
  warm = "#fff1dc",
}) => (
  <>
    <hemisphereLight args={["#dff1ff", "#6f8a4a", 1.1 * intensity]} />
    <directionalLight position={[5, 9, 7]} intensity={1.7 * intensity} color={warm} />
    <directionalLight position={[-6, 3, -4]} intensity={0.35 * intensity} color="#a9c8ff" />
  </>
);

/**
 * Cena com profundidade de campo "falsa": o fundo é renderizado
 * num canvas separado e desfocado via CSS; o primeiro plano fica nítido.
 */
export const Cena3D: React.FC<{
  cam: Cam;
  sky: string;
  blur?: number;
  fundo: React.ReactNode;
  frente: React.ReactNode;
}> = ({ cam, sky, blur = 7, fundo, frente }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: sky }}>
      <AbsoluteFill style={{ filter: `blur(${blur}px)`, transform: "scale(1.03)" }}>
        <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov, near: 0.1, far: 200 }}>
          <CameraRig cam={cam} />
          {fundo}
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} camera={{ fov: cam.fov, near: 0.1, far: 200 }}>
          <CameraRig cam={cam} />
          {frente}
        </ThreeCanvas>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- elementos do cenário ----------

export const Arvore: React.FC<{ position: Vec3; scale?: number; seed: number; green?: string }> = ({
  position,
  scale = 1,
  seed,
  green = "#5f9e3f",
}) => {
  const blobs = useMemo(
    () =>
      new Array(5).fill(0).map((_, i) => ({
        p: [
          (random(`${seed}x${i}`) - 0.5) * 1.6,
          3.2 + random(`${seed}y${i}`) * 1.4,
          (random(`${seed}z${i}`) - 0.5) * 1.2,
        ] as Vec3,
        r: 0.9 + random(`${seed}r${i}`) * 0.6,
        c: new THREE.Color(green).offsetHSL(0, 0, (random(`${seed}c${i}`) - 0.5) * 0.12).getStyle(),
      })),
    [seed, green],
  );
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 3.2, 8]} />
        <meshStandardMaterial color="#e8dcc6" roughness={1} />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.p}>
          <icosahedronGeometry args={[b.r, 1]} />
          <meshStandardMaterial color={b.c} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
};

export const Floresta: React.FC<{ green?: string }> = ({ green }) => {
  const trees = useMemo(() => {
    const list: { p: Vec3; s: number; seed: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const ang = -1.25 + (i / 25) * 2.5 + (random(`a${i}`) - 0.5) * 0.08;
      const dist = 13 + random(`d${i}`) * 10;
      list.push({
        p: [Math.sin(ang) * dist, 0, -Math.cos(ang) * dist + 2],
        s: 0.85 + random(`s${i}`) * 0.5,
        seed: i,
      });
    }
    return list;
  }, []);
  return (
    <>
      {trees.map((t) => (
        <Arvore key={t.seed} position={t.p} scale={t.s} seed={t.seed} green={green} />
      ))}
      {/* morros ao fundo */}
      {[-30, -8, 18, 40].map((x, i) => (
        <mesh key={i} position={[x, -4, -45]} scale={[22, 9, 8]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#8fb27a" roughness={1} />
        </mesh>
      ))}
    </>
  );
};

export const Chao: React.FC<{ color?: string; size?: number }> = ({ color = "#86b45a", size = 140 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[size, 48]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

export const Capim: React.FC<{ count?: number; area?: [number, number]; seed?: string }> = ({
  count = 40,
  area = [10, 6],
  seed = "g",
}) => {
  const tufts = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        p: [
          (random(`${seed}x${i}`) - 0.5) * area[0],
          0,
          (random(`${seed}z${i}`) - 0.5) * area[1] - 1,
        ] as Vec3,
        h: 0.25 + random(`${seed}h${i}`) * 0.3,
        r: random(`${seed}r${i}`) * Math.PI,
      })),
    [count, area, seed],
  );
  return (
    <>
      {tufts.map((t, i) => (
        <group key={i} position={t.p} rotation={[0, t.r, 0]}>
          {[-0.25, 0, 0.25].map((lean, j) => (
            <mesh key={j} position={[lean * 0.2, t.h / 2, 0]} rotation={[0, 0, lean]}>
              <coneGeometry args={[0.025, t.h, 4]} />
              <meshStandardMaterial color="#6d9c45" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
};
