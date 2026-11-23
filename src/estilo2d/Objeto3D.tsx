import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import * as THREE from "three";
import { CONTORNO } from "./personagens";

/**
 * Objetos 3D no estilo do canal, para pôr POR CIMA (ou por baixo) de uma cena 2D:
 * sombreamento em faixas duras (toon, 3 tons), contorno escuro #1d1424 e luz vindo da esquerda
 * (sombra do lado direito, como nos bonecos). Os personagens continuam 2D.
 *
 * Regras (Remotion): tudo animado pelas props calculadas a partir de useCurrentFrame() de quem chama;
 * nunca useFrame() do react-three-fiber. Render: adicionar --gl=swangle (sem GPU, é lento: use em planos curtos).
 */

export type V3 = [number, number, number];
export type Cam3D = { pos: V3; alvo: V3; fov: number };

const CameraRig: React.FC<{ cam: Cam3D }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    camera.fov = cam.fov;
    camera.near = 0.1;
    camera.far = 500;
    camera.lookAt(...cam.alvo);
    camera.updateProjectionMatrix();
  }, [camera, ...cam.pos, ...cam.alvo, cam.fov]);
  return null;
};

/** luz do canal: principal quente de cima/esquerda, preenchimento frio fraco, recorte por trás */
export const Luzes3D: React.FC<{ forca?: number; cor?: string; recorte?: string }> = ({ forca = 1, cor = "#fff1dc", recorte = "#9fe3ff" }) => (
  <>
    <ambientLight intensity={0.35 * forca} />
    <directionalLight position={[-6, 8, 6]} intensity={2.2 * forca} color={cor} />
    <directionalLight position={[5, 1, 3]} intensity={0.25 * forca} color="#b7c6ff" />
    <directionalLight position={[2, 3, -8]} intensity={1.2 * forca} color={recorte} />
  </>
);

/**
 * Camada 3D transparente do tamanho do vídeo. Coloque depois do <svg> da cena para ficar na frente.
 * `cam` vem de quem chama (calcule pos/alvo a partir do quadro).
 */
export const Camada3D: React.FC<{ cam: Cam3D; children: React.ReactNode; luz?: boolean; estilo?: React.CSSProperties }> = ({
  cam,
  children,
  luz = true,
  estilo,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", ...estilo }}>
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: cam.fov, position: cam.pos }}>
        <CameraRig cam={cam} />
        {luz ? <Luzes3D /> : null}
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------- material de desenho (toon em faixas) ----------

const usarFaixas = (tons = 3) =>
  useMemo(() => {
    const dados = new Uint8Array(tons * 4);
    for (let i = 0; i < tons; i++) {
      const v = Math.round(70 + (i / (tons - 1)) * 185);
      dados.set([v, v, v, 255], i * 4);
    }
    const t = new THREE.DataTexture(dados, tons, 1, THREE.RGBAFormat);
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  }, [tons]);

/** material toon com sombra dura (3 tons por padrão; 2 = mais "anime") */
export const MaterialDesenho: React.FC<{ cor: string; tons?: number; emissiva?: string; brilho?: number }> = ({ cor, tons = 3, emissiva, brilho = 0 }) => {
  const faixas = usarFaixas(tons);
  return <meshToonMaterial color={cor} gradientMap={faixas} emissive={emissiva ?? "#000"} emissiveIntensity={brilho} />;
};

export type Forma = "esfera" | "caixa" | "cone" | "cilindro" | "toro" | "icosaedro" | "octaedro" | "capsula";

const Geometria: React.FC<{ forma: Forma; detalhe?: number }> = ({ forma, detalhe = 48 }) => {
  switch (forma) {
    case "esfera":
      return <sphereGeometry args={[1, detalhe, detalhe / 2]} />;
    case "caixa":
      return <boxGeometry args={[1.6, 1.6, 1.6]} />;
    case "cone":
      return <coneGeometry args={[1, 2, detalhe]} />;
    case "cilindro":
      return <cylinderGeometry args={[1, 1, 2, detalhe]} />;
    case "toro":
      return <torusGeometry args={[1, 0.38, detalhe / 2, detalhe]} />;
    case "icosaedro":
      return <icosahedronGeometry args={[1, 0]} />;
    case "octaedro":
      return <octahedronGeometry args={[1, 0]} />;
    case "capsula":
      return <capsuleGeometry args={[0.7, 1.2, detalhe / 4, detalhe / 2]} />;
  }
};

/**
 * Sólido no estilo do canal: forma + material toon + contorno (casca invertida).
 * `contorno` = espessura relativa (0.04 fino · 0.07 normal · 0.1 grosso).
 */
export const Solido3D: React.FC<{
  forma: Forma;
  cor: string;
  pos?: V3;
  rot?: V3;
  escala?: number | V3;
  contorno?: number;
  tons?: number;
  emissiva?: string;
  brilho?: number;
  opacidade?: number;
}> = ({ forma, cor, pos = [0, 0, 0], rot = [0, 0, 0], escala = 1, contorno = 0.06, tons = 3, emissiva, brilho, opacidade = 1 }) => {
  const s: V3 = typeof escala === "number" ? [escala, escala, escala] : escala;
  // a casca é escalada em volta do centro da forma; formas sem volume (toro) usam casca proporcional
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh>
        <Geometria forma={forma} />
        {opacidade < 1 ? (
          <meshToonMaterial color={cor} transparent opacity={opacidade} />
        ) : (
          <MaterialDesenho cor={cor} tons={tons} emissiva={emissiva} brilho={brilho} />
        )}
      </mesh>
      {contorno > 0 ? (
        <mesh scale={1 + contorno}>
          <Geometria forma={forma} />
          <meshBasicMaterial color={CONTORNO} side={THREE.BackSide} transparent={opacidade < 1} opacity={opacidade} />
        </mesh>
      ) : null}
    </group>
  );
};

/**
 * Esfera de energia (Kamehameha/Genki-dama do canal): núcleo claro + camadas transparentes somando luz
 * + anéis girando. `carga` 0..1 faz crescer e pulsar; `f` é o quadro (para girar/pulsar).
 */
export const EsferaEnergia3D: React.FC<{ f: number; pos?: V3; raio?: number; cor?: string; clara?: string; carga?: number; aneis?: number }> = ({
  f,
  pos = [0, 0, 0],
  raio = 1,
  cor = "#2fc6ff",
  clara = "#e9fbff",
  carga = 1,
  aneis = 3,
}) => {
  const pulsa = 1 + Math.sin(f * 0.5) * 0.04 * carga + Math.sin(f * 1.3) * 0.02 * carga;
  const r = raio * carga * pulsa;
  if (r <= 0.001) return null;
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[r * 0.62, 48, 24]} />
        <meshBasicMaterial color={clara} />
      </mesh>
      {[0.8, 1, 1.25, 1.6].map((k, i) => (
        <mesh key={i} scale={1 + Math.sin(f * 0.4 + i) * 0.03}>
          <sphereGeometry args={[r * k, 48, 24]} />
          <meshBasicMaterial color={cor} transparent opacity={[0.55, 0.32, 0.16, 0.07][i]} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {new Array(aneis).fill(0).map((_, i) => (
        <mesh key={`a${i}`} rotation={[0.9 + i * 0.7 + f * 0.03 * (i % 2 ? -1 : 1), f * (0.05 + i * 0.02), i * 1.1]}>
          <torusGeometry args={[r * (1.15 + i * 0.12), r * 0.025, 8, 96]} />
          <meshBasicMaterial color={clara} transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

/** planeta toon com contorno e anel opcional */
export const Planeta3D: React.FC<{ f: number; pos?: V3; raio?: number; cor?: string; corAnel?: string; anel?: boolean; giro?: number; inclina?: number }> = ({
  f,
  pos = [0, 0, 0],
  raio = 1,
  cor = "#e0603a",
  corAnel = "#ffd23f",
  anel = true,
  giro = 0.01,
  inclina = 0.45,
}) => (
  <group position={pos} rotation={[inclina, 0, 0.25]}>
    <group rotation={[0, f * giro, 0]}>
      <Solido3D forma="esfera" cor={cor} escala={raio} contorno={0.05} />
    </group>
    {anel ? (
      <Solido3D forma="toro" cor={corAnel} escala={[raio * 1.55, raio * 1.55, raio * 0.07]} rot={[Math.PI / 2, 0, 0]} contorno={0.12} />
    ) : null}
  </group>
);

/** helper: câmera orbitando o alvo (ângulo em graus, altura em unidades) */
export const orbita = (angGraus: number, distancia: number, altura: number, alvo: V3 = [0, 0, 0], fov = 35): Cam3D => {
  const a = (angGraus * Math.PI) / 180;
  return { pos: [alvo[0] + Math.sin(a) * distancia, alvo[1] + altura, alvo[2] + Math.cos(a) * distancia], alvo, fov };
};
