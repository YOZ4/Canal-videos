import { random } from "remotion";
import * as THREE from "three";
import { Camada3D, Solido3D, type Cam3D, type V3 } from "../../estilo2d/Objeto3D";

/**
 * Parte 3D do remake (campo rochoso ao entardecer): chão, rachaduras, pedras flutuando, onda de choque.
 * Mesmas cores do fundo 2D, toon de 2 tons (sombra dura), contorno escuro e luz de recorte DOURADA da aura.
 * Personagens continuam 2D — o Lucas é desenhado entre a camada 3D de trás e a da frente, no ponto exato
 * onde o chão 3D aparece na tela (`projeta`), então ele "pisa" no chão 3D.
 */
export const W = 1080;
export const H = 1920;
export const COR = { chao: "#b98a5a", chaoEsc: "#8f6540", pedra: "#8a6a52", pedra2: "#a07e60", racha: "#3a2418", ouro: "#ffc21f", ouroClaro: "#fff4b0" };

/** projeção igual à da câmera do Three (fov vertical, aspecto 1080×1920): mundo → tela (px) + profundidade */
export const projeta = (cam: Cam3D, p: V3): [number, number, number] => {
  const f = new THREE.Vector3(...cam.alvo).sub(new THREE.Vector3(...cam.pos)).normalize();
  const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  const u = new THREE.Vector3().crossVectors(r, f);
  const d = new THREE.Vector3(...p).sub(new THREE.Vector3(...cam.pos));
  const xc = d.dot(r);
  const yc = d.dot(u);
  const zc = d.dot(f);
  const t = Math.tan(((cam.fov / 2) * Math.PI) / 180);
  const nx = xc / (zc * t * (W / H));
  const ny = yc / (zc * t);
  return [((nx + 1) / 2) * W, ((1 - ny) / 2) * H, zc];
};

// ------------------------------------------------------------------ pedras
export type Pedra = { pos: V3; rot: V3; esc: number; cor: string };
const N_PEDRAS = 16;
/** pedras em volta do Lucas: no chão → sobem uma a uma, flutuam girando → arremessadas na explosão. `g` = quadro "de 2 em 2" */
export const pedrasAura = (g: number, sobeDe: number, explode: number): Pedra[] =>
  new Array(N_PEDRAS).fill(0).map((_, i) => {
    const a = random(`pa${i}`) * Math.PI * 2;
    const raio = 1.3 + random(`pr${i}`) * 2.4;
    const esc = 0.12 + random(`pe${i}`) * 0.22;
    const de = sobeDe + i * 3 + Math.round(random(`pd${i}`) * 6);
    const u = Math.max(0, g - de);
    // sobe com antecipação (treme no chão 6 q), depois sobe desacelerando e flutua
    const treme = g >= de - 6 && g < de ? (random(`pt${i}${g}`) - 0.5) * 0.05 : 0;
    const alturaAlvo = 0.6 + random(`ph${i}`) * 2.2;
    const sobe = 1 - Math.exp(-u / 14);
    const bob = Math.sin(g * 0.12 + i) * 0.06 * sobe;
    let y = esc * 0.6 + sobe * alturaAlvo + bob;
    let rx = raio;
    const giro = u * (0.03 + random(`pg${i}`) * 0.05);
    // explosão: voam pra fora e pra cima (desaceleram)
    if (g >= explode) {
      const e = g - explode;
      const v = 1 - Math.exp(-e / 7);
      rx = raio + v * (6 + random(`pv${i}`) * 8);
      y += v * (1 + random(`pu${i}`) * 2) - Math.max(0, e - 10) * 0.02;
    }
    return { pos: [Math.cos(a) * rx + treme, y, Math.sin(a) * rx], rot: [giro, giro * 1.3 + i, giro * 0.7], esc, cor: i % 3 ? COR.pedra : COR.pedra2 };
  });

/** pedras flutuando ao longo do caminho da câmera (plano final, câmera avançando em profundidade) */
export const pedrasCaminho = (g: number): Pedra[] =>
  new Array(14).fill(0).map((_, i) => {
    const z = 1.5 + i * 1.05 + random(`cz${i}`) * 0.6;
    const lado = i % 2 ? 1 : -1;
    // corredor livre pra câmera passar (ela vai de x 0,7 a 0,2): nenhuma pedra a menos de ~1 unidade do caminho
    const x = lado * (1.35 + random(`cx${i}`) * 1.6);
    const y = 0.4 + random(`cy${i}`) * 2.4 + Math.sin(g * 0.1 + i) * 0.08;
    const esc = 0.1 + random(`ce${i}`) * 0.2;
    const giro = g * (0.03 + random(`cg${i}`) * 0.04);
    return { pos: [x, y, z], rot: [giro, giro * 1.2 + i, 0], esc, cor: i % 3 ? COR.pedra : COR.pedra2 };
  });

const Pedras: React.FC<{ lista: Pedra[] }> = ({ lista }) => (
  <>
    {lista.map((p, i) => (
      <Solido3D key={i} forma="icosaedro" cor={p.cor} pos={p.pos} rot={p.rot} escala={[p.esc, p.esc * 0.8, p.esc]} contorno={0.09} tons={2} />
    ))}
  </>
);

/** rachaduras do chão saindo do Lucas (crescem com `abre` 0..1) */
const Rachas: React.FC<{ abre: number }> = ({ abre }) => (
  <>
    {new Array(9).fill(0).map((_, i) => {
      const a = (i / 9) * Math.PI * 2 + random(`ra${i}`) * 0.5;
      const L = (1.2 + random(`rl${i}`) * 2.6) * abre;
      if (L < 0.05) return null;
      return (
        <mesh key={i} position={[Math.cos(a) * (0.35 + L / 2), 0.012, Math.sin(a) * (0.35 + L / 2)]} rotation={[0, -a, 0]}>
          <boxGeometry args={[L, 0.01, 0.06 + random(`rw${i}`) * 0.05]} />
          <meshBasicMaterial color={COR.racha} />
        </mesh>
      );
    })}
  </>
);

/** chão + sombra do Lucas + rachaduras + onda de choque (camada de trás) */
const Chao: React.FC<{ rachas: number; onda: number; brilhoChao: number }> = ({ rachas, onda, brilhoChao }) => (
  <>
    <mesh position={[0, -0.05, 0]}>
      <cylinderGeometry args={[60, 60, 0.1, 64]} />
      <meshToonMaterial color={COR.chao} />
    </mesh>
    {/* manchas mais escuras (textura do chão) */}
    {new Array(14).fill(0).map((_, i) => (
      <mesh key={i} position={[(random(`mx${i}`) - 0.5) * 30, 0.004, (random(`mz${i}`) - 0.5) * 30]} rotation={[-Math.PI / 2, 0, random(`mr${i}`) * 3]}>
        <circleGeometry args={[0.6 + random(`ms${i}`) * 1.6, 7]} />
        <meshBasicMaterial color={COR.chaoEsc} transparent opacity={0.35} />
      </mesh>
    ))}
    {/* sombra de contato do Lucas */}
    <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.55, 1]}>
      <circleGeometry args={[0.55, 32]} />
      <meshBasicMaterial color="#2a1a14" transparent opacity={0.45} />
    </mesh>
    {/* chão iluminado pela aura */}
    {brilhoChao > 0 ? (
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 40]} />
        <meshBasicMaterial color={COR.ouro} transparent opacity={0.28 * brilhoChao} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    ) : null}
    <Rachas abre={rachas} />
    {onda > 0 && onda < 1 ? (
      <Solido3D forma="toro" cor={COR.ouroClaro} pos={[0, 0.15, 0]} rot={[Math.PI / 2, 0, 0]} escala={[0.6 + onda * 11, 0.6 + onda * 11, 0.5]} contorno={0.05} tons={2} emissiva={COR.ouro} brilho={1.2} opacidade={1 - onda} />
    ) : null}
    {/* montanhas distantes (mesas) */}
    {[-30, -12, 8, 26].map((x, i) => (
      <mesh key={`m${i}`} position={[x, 3, -45 - i * 4]}>
        <boxGeometry args={[14 + i * 3, 6 + (i % 2) * 3, 3]} />
        <meshBasicMaterial color="#7a4e5e" />
      </mesh>
    ))}
  </>
);

export type Cena3D = {
  cam: Cam3D;
  pedras: Pedra[];
  rachas?: number;
  onda?: number;
  brilhoChao?: number;
  recorte?: number;
};

/** profundidade do Lucas (origem) na câmera — pedras mais perto vão pra camada da frente */
const profLucas = (cam: Cam3D) => projeta(cam, [0, 1, 0])[2];

/** luz do 3D: quente do pôr do sol (esquerda/cima) + recorte DOURADO da aura (por trás) */
const Luzes: React.FC<{ recorte: number }> = ({ recorte }) => (
  <>
    <ambientLight intensity={0.42} color="#ffe2c4" />
    <directionalLight position={[-7, 9, 5]} intensity={2.0} color="#ffd9a8" />
    <directionalLight position={[4, 2, 4]} intensity={0.25} color="#b7a6ff" />
    <directionalLight position={[0, 3, -6]} intensity={0.6 + recorte * 2.4} color={COR.ouro} />
    <pointLight position={[0, 1, 0]} intensity={recorte * 6} distance={7} color={COR.ouro} />
  </>
);

/** camada 3D de TRÁS (chão, rachas, onda, pedras atrás do Lucas) */
export const Fundo3D: React.FC<{ c: Cena3D }> = ({ c }) => {
  const zL = profLucas(c.cam);
  return (
    <Camada3D cam={c.cam} luz={false}>
      <Luzes recorte={c.recorte ?? 0} />
      <Chao rachas={c.rachas ?? 0} onda={c.onda ?? 0} brilhoChao={c.recorte ?? 0} />
      <Pedras lista={c.pedras.filter((p) => projeta(c.cam, p.pos)[2] >= zL)} />
    </Camada3D>
  );
};
/** camada 3D da FRENTE (pedras entre a câmera e o Lucas) */
export const Frente3D: React.FC<{ c: Cena3D }> = ({ c }) => {
  const zL = profLucas(c.cam);
  const frente = c.pedras.filter((p) => {
    const z = projeta(c.cam, p.pos)[2];
    return z < zL && z > 0.3;
  });
  if (!frente.length) return null;
  return (
    <Camada3D cam={c.cam} luz={false}>
      <Luzes recorte={c.recorte ?? 0} />
      <Pedras lista={frente} />
    </Camada3D>
  );
};
