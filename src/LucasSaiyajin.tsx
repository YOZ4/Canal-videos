import { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import * as THREE from "three";

const fontFamily = "Luckiest Guy";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/LuckiestGuy-Regular.woff2"),
  format: "woff2",
});

// Momento da transformação (em frames, 30fps)
const POWER_START = 120;
const POWER_END = 150;

// ---------- Materiais cartoon ----------

const useToonGradient = () =>
  useMemo(() => {
    const data = new Uint8Array([90, 170, 255]);
    const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, []);

type PartProps = {
  geo: React.ReactNode;
  color: string;
  gradient: THREE.Texture;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  outline?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

// Uma peça do personagem com contorno preto (técnica "inverted hull")
const Part: React.FC<PartProps> = ({
  geo,
  color,
  gradient,
  position,
  rotation,
  scale = [1, 1, 1],
  outline = 0.05,
  emissive = "#000000",
  emissiveIntensity = 0,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        {geo}
        <meshToonMaterial
          color={color}
          gradientMap={gradient}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {outline > 0 ? (
        <mesh scale={1 + outline}>
          {geo}
          <meshBasicMaterial color="#1a1026" side={THREE.BackSide} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---------- Cabelo ----------

const HEAD_Y = 1.3;
const HEAD_R = 0.75;

// direções (em graus) dos espetos de cabelo: [inclinação a partir do topo, giro]
const SPIKES: [number, number][] = [
  [0, 0],
  [30, 90],
  [30, 30],
  [30, 150],
  [35, -30],
  [35, -90],
  [35, -150],
  [35, 210],
  [55, 60],
  [55, 120],
  [55, 180],
  [55, -60],
  [55, -120],
  [65, 0],
  [62, 30],
  [62, -30],
  [75, 110],
  [75, 180],
  [75, -110],
];

const Hair: React.FC<{ t: number; frame: number; gradient: THREE.Texture }> = ({
  t,
  frame,
  gradient,
}) => {
  const color = interpolateColors(t, [0, 1], ["#3b2417", "#ffd21f"]);
  const emissive = interpolateColors(t, [0, 1], ["#000000", "#ff9d00"]);

  const spikes = useMemo(() => {
    return SPIKES.map(([tilt, yaw]) => {
      const th = THREE.MathUtils.degToRad(tilt);
      // yaw 0 = frente (+z)
      const ph = THREE.MathUtils.degToRad(yaw);
      return new THREE.Vector3(
        Math.sin(th) * Math.sin(ph),
        Math.cos(th),
        Math.sin(th) * Math.cos(ph),
      ).normalize();
    });
  }, []);

  const up = new THREE.Vector3(0, 1, 0);

  return (
    <group position={[0, HEAD_Y, 0]}>
      {/* "capacete" de cabelo */}
      <Part
        gradient={gradient}
        color={color}
        emissive={emissive}
        emissiveIntensity={t * 0.6}
        rotation={[-0.35, 0, 0]}
        geo={<sphereGeometry args={[HEAD_R + 0.04, 40, 40, 0, Math.PI * 2, 0, 1.25]} />}
      />
      {spikes.map((baseDir, i) => {
        // no modo normal os espetos são curtos; transformado, ficam longos e apontam pra cima
        const dir = baseDir
          .clone()
          .lerp(baseDir.clone().multiplyScalar(0.45).add(up), t * 0.75)
          .normalize();
        // na frente (franja) ficam mais curtos para não cobrir o rosto
        const front = Math.max(0, baseDir.z) * (1 - baseDir.y);
        const wiggle = t * 0.04 * Math.sin(frame * 0.9 + i * 1.7);
        const len = (0.38 + t * 0.42) * (1 - front * 0.7) + wiggle;
        const radius = 0.2 + t * 0.03;
        const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
        const e = new THREE.Euler().setFromQuaternion(q);
        const pos = dir.clone().multiplyScalar(HEAD_R * 0.78 + len / 2);
        return (
          <Part
            key={i}
            gradient={gradient}
            color={color}
            emissive={emissive}
            emissiveIntensity={t * 0.6}
            position={[pos.x, pos.y, pos.z]}
            rotation={[e.x, e.y, e.z]}
            outline={0.08}
            geo={<coneGeometry args={[radius, len, 12]} />}
          />
        );
      })}
    </group>
  );
};

// ---------- Rosto ----------

const Eye: React.FC<{ side: 1 | -1; t: number; blink: number; gradient: THREE.Texture }> = ({
  side,
  t,
  blink,
  gradient,
}) => {
  const iris = interpolateColors(t, [0, 1], ["#2a1a12", "#14c7b5"]);
  return (
    <group position={[0.27 * side, HEAD_Y + 0.08, 0.63]} scale={[1, blink, 1]}>
      <Part
        gradient={gradient}
        color="#ffffff"
        scale={[0.17, 0.22, 0.1]}
        outline={0.12}
        geo={<sphereGeometry args={[1, 24, 24]} />}
      />
      <mesh position={[0, -0.02, 0.07]} scale={[0.1, 0.13, 0.05]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial color={iris} />
      </mesh>
      <mesh position={[0, -0.02, 0.1]} scale={[0.05, 0.065, 0.03]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#0b0b10" />
      </mesh>
      <mesh position={[0.04 * side, 0.05, 0.12]} scale={0.03}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

const Face: React.FC<{ t: number; frame: number; gradient: THREE.Texture }> = ({
  t,
  frame,
  gradient,
}) => {
  // piscadas em momentos fixos
  const blinkAt = [45, 100, 210, 265];
  const blink = blinkAt.reduce((acc, b) => {
    const d = Math.abs(frame - b);
    return d < 4 ? Math.min(acc, interpolate(d, [0, 4], [0.1, 1])) : acc;
  }, 1);

  // sobrancelhas: neutras -> determinadas
  const browAngle = interpolate(t, [0, 1], [0.08, 0.38]);
  const browY = interpolate(t, [0, 1], [HEAD_Y + 0.37, HEAD_Y + 0.31]);

  return (
    <group>
      <Eye side={1} t={t} blink={blink} gradient={gradient} />
      <Eye side={-1} t={t} blink={blink} gradient={gradient} />
      {[1, -1].map((s) => (
        <mesh key={s} position={[0.28 * s, browY, 0.69]} rotation={[0, 0, browAngle * s]}>
          <boxGeometry args={[0.24, 0.05, 0.05]} />
          <meshBasicMaterial color="#2a1a12" />
        </mesh>
      ))}
      {/* nariz */}
      <Part
        gradient={gradient}
        color="#f2b48c"
        position={[0, HEAD_Y - 0.08, 0.74]}
        scale={[0.07, 0.06, 0.06]}
        outline={0}
        geo={<sphereGeometry args={[1, 16, 16]} />}
      />
      {/* sorriso */}
      <mesh position={[0, HEAD_Y - 0.2, 0.69]} rotation={[0.25, 0, Math.PI]}>
        <torusGeometry args={[0.13, 0.025, 10, 24, Math.PI]} />
        <meshBasicMaterial color="#5a1f1f" />
      </mesh>
      {/* bochechas */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0.46 * s, HEAD_Y - 0.13, 0.55]} scale={[0.11, 0.07, 0.04]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#ff8fa3" transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- Aura ----------

const Aura: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t <= 0) return null;
  return (
    <group position={[0, 0.3, 0]}>
      {[0, 1, 2].map((i) => {
        const pulse = 1 + 0.06 * Math.sin(frame * 0.6 + i * 2.1);
        const s = (1.15 + i * 0.22) * pulse * t;
        return (
          <mesh key={i} scale={[s * 1.05, s * 1.6, s * 1.05]}>
            <sphereGeometry args={[1.25, 32, 32]} />
            <meshBasicMaterial
              color={i === 0 ? "#fff3a0" : "#ffc21a"}
              transparent
              opacity={0.1 - i * 0.025}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}
      {/* faíscas subindo */}
      {new Array(14).fill(0).map((_, i) => {
        const speed = 0.04 + (i % 4) * 0.012;
        const y = ((frame * speed + i * 0.37) % 4) - 1.8;
        const ang = i * 2.399 + frame * 0.03;
        const r = 1.0 + (i % 3) * 0.25;
        return (
          <mesh
            key={`s${i}`}
            position={[Math.cos(ang) * r, y, Math.sin(ang) * r]}
            scale={[0.04 * t, 0.18 * t, 0.04 * t]}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#fffbe0" />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Personagem ----------

const Lucas: React.FC<{ frame: number; t: number; enter: number }> = ({ frame, t, enter }) => {
  const gradient = useToonGradient();
  const skin = "#ffcfa8";
  const shirt = interpolateColors(t, [0, 1], ["#2f7cf6", "#ff6a1a"]);
  const pants = "#24306b";

  // giro contínuo: 3 voltas completas em 10s
  const rotY = (frame / 100) * Math.PI * 2;
  // pulinho/respiração
  const bob = Math.sin(frame * 0.18) * 0.06;
  // tremedeira enquanto carrega o poder
  const shaking = frame >= POWER_START && frame < POWER_END + 6;
  const shake = shaking ? 0.05 * Math.sin(frame * 3.1) : 0;
  // braços: relaxados -> punhos cerrados para baixo, tipo "carregando"
  const armZ = interpolate(t, [0, 1], [0.45, 0.18]);
  const armX = Math.sin(frame * 0.18) * 0.12 * (1 - t);

  return (
    <group
      position={[shake, -1.0 + bob, 0]}
      rotation={[0, rotY, 0]}
      scale={enter * 0.9}
    >
      {/* cabeça */}
      <Part gradient={gradient} color={skin} position={[0, HEAD_Y, 0]} geo={<sphereGeometry args={[HEAD_R, 48, 48]} />} />
      {/* orelhas */}
      {[1, -1].map((s) => (
        <Part
          key={s}
          gradient={gradient}
          color={skin}
          position={[0.74 * s, HEAD_Y - 0.02, 0]}
          scale={[0.1, 0.17, 0.12]}
          outline={0.12}
          geo={<sphereGeometry args={[1, 16, 16]} />}
        />
      ))}
      <Face t={t} frame={frame} gradient={gradient} />
      <Hair t={t} frame={frame} gradient={gradient} />

      {/* pescoço */}
      <Part gradient={gradient} color={skin} position={[0, 0.58, 0]} outline={0} geo={<cylinderGeometry args={[0.15, 0.17, 0.2, 16]} />} />
      {/* tronco */}
      <Part gradient={gradient} color={shirt} position={[0, 0.12, 0]} geo={<capsuleGeometry args={[0.42, 0.45, 8, 24]} />} />
      {/* faixa/cinto */}
      <Part gradient={gradient} color="#1b1b2e" position={[0, -0.2, 0]} outline={0.02} geo={<cylinderGeometry args={[0.44, 0.44, 0.1, 24]} />} />
      {/* estrela no peito */}
      <mesh position={[0, 0.25, 0.42]} rotation={[0, 0, Math.PI / 2]}>
        <circleGeometry args={[0.12, 5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* braços */}
      {[1, -1].map((s) => (
        <group key={s} position={[0.5 * s, 0.4, 0]} rotation={[armX * s, 0, armZ * s]}>
          <Part gradient={gradient} color={shirt} position={[0, -0.05, 0]} scale={[1.15, 1, 1.15]} geo={<sphereGeometry args={[0.16, 16, 16]} />} />
          <Part gradient={gradient} color={skin} position={[0, -0.38, 0]} geo={<capsuleGeometry args={[0.11, 0.42, 6, 16]} />} />
          <Part gradient={gradient} color={skin} position={[0, -0.72, 0]} geo={<sphereGeometry args={[0.15, 20, 20]} />} />
        </group>
      ))}

      {/* pernas */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Part gradient={gradient} color={pants} position={[0.2 * s, -0.62, 0]} geo={<capsuleGeometry args={[0.15, 0.38, 6, 16]} />} />
          <Part
            gradient={gradient}
            color="#e8352e"
            position={[0.2 * s, -1.02, 0.07]}
            scale={[1, 0.65, 1.4]}
            geo={<sphereGeometry args={[0.19, 20, 20]} />}
          />
        </group>
      ))}

      <Aura t={t} frame={frame} />
    </group>
  );
};

// ---------- Composição ----------

export const LucasSaiyajin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 11, stiffness: 120 } });
  const titleIn = spring({ frame: frame - 8, fps, config: { damping: 12 } });
  const t = interpolate(frame, [POWER_START + 15, POWER_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash = interpolate(frame, [POWER_END - 4, POWER_END, POWER_END + 12], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const charge = interpolate(frame, [POWER_START, POWER_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgTop = interpolateColors(t, [0, 1], ["#7b2ff7", "#ff7a00"]);
  const bgBottom = interpolateColors(t, [0, 1], ["#12c2e9", "#ffd200"]);
  const glow = interpolateColors(t, [0, 1], ["rgba(255,255,255,0.35)", "rgba(255,245,170,0.75)"]);
  const raySpeed = 0.4 + t * 1.6;

  const nameIn = spring({ frame: frame - 25, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${bgTop} 0%, ${bgBottom} 100%)` }}>
      {/* raios girando */}
      <AbsoluteFill
        style={{
          opacity: 0.18 + t * 0.12,
          background: `repeating-conic-gradient(from ${frame * raySpeed}deg at 50% 58%, rgba(255,255,255,0.9) 0deg 9deg, transparent 9deg 22deg)`,
        }}
      />
      {/* brilho atrás do personagem */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 58%, ${glow} 0%, transparent ${42 + charge * 10}%)`,
        }}
      />

      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0.2, 9], fov: 40 }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 6]} intensity={1.6} />
        <directionalLight position={[-5, 2, -4]} intensity={0.5} color="#9ad0ff" />
        <pointLight position={[0, 0, 2.5]} intensity={t * 2.5} color="#ffd25a" distance={8} />
        <Lucas frame={frame} t={t} enter={enter} />
      </ThreeCanvas>

      {/* título */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily,
          fontSize: 112,
          lineHeight: 1.08,
          color: "white",
          WebkitTextStroke: "14px #1a1026",
          paintOrder: "stroke fill",
          textShadow: "0 10px 0 rgba(26,16,38,0.55)",
          transform: `translateY(${(1 - titleIn) * -320}px) scale(${0.6 + titleIn * 0.4}) rotate(${Math.sin(frame * 0.08) * 1.5}deg)`,
        }}
      >
        E se você virasse um{" "}
        <span style={{ color: "#ffd21f" }}>Saiyajin?</span>
      </div>

      {/* nome do personagem */}
      <div
        style={{
          position: "absolute",
          bottom: 190,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          transform: `scale(${nameIn})`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 84,
            color: "#1a1026",
            background: "white",
            padding: "14px 60px 4px",
            borderRadius: 999,
            border: "8px solid #1a1026",
            boxShadow: "0 10px 0 rgba(26,16,38,0.55)",
            letterSpacing: 4,
          }}
        >
          LUCAS
        </div>
      </div>

      {/* flash da transformação */}
      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
