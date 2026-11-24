import { AbsoluteFill, random } from "remotion";
import * as THREE from "three";
import { Boneco2D, POSE_BASE, posCabeca, type Pose } from "../../estilo2d/Boneco2D";
import { CURVA, respira } from "../../estilo2d/anim";
import { AURA_DIEGO, AURA_LUCAS, AuraForte } from "../../estilo2d/Aura";
import { CHAO_Y, Cozinha } from "../../estilo2d/Cenario2D";
import { Brilhos } from "../../estilo2d/Efeitos2D";
import { Fundo } from "../../estilo2d/Acabamento";
import { Camada3D, MaterialDesenho, type Cam3D } from "../../estilo2d/Objeto3D";
import { CONTORNO, DIEGO, LUCAS } from "../../estilo2d/personagens";
import { Rotulo2, Selo } from "../../estilo2d/UI";
import { projeta } from "../SaiyajinRemake/mundo3d";
import { Cena, camK, ip, mola, planos, R, S, T, useF, vivo } from "./base";

/**
 * Ato 8 — Nen (copo d'água). O copo é 3D toon (câmera gira em volta enquanto a água sobe acima da borda e
 * transborda — o 2D não faz isso bem); mãos, aura e personagens continuam 2D, postos pela projeção da câmera.
 */
const ESC = 0.72;
const frente = (x: number, p: Partial<Pose> = {}): Pose => ({ ...POSE_BASE, x, y: CHAO_Y, escala: ESC, ...p });

const A8_0 = T("Segunda fase");
const COPO = T("Um copo cheio");
const MAOS = T("Você coloca as mãos");
const SOBE = T("e a água sobe");
const TENSAO = T("Isso é tensão");
const CONT = T("Só que a água");
const TRANSB = T("até transbordar");
const REFORCO = T("Tipo Reforço");
const DOLADO = T("Do lado o copo");
const ENCARAM = T("Vocês se encaram");
export const A8_FIM = T("Fase final");

// ------------------------------------------------------------------ copo 3D
const AGUA = "#6cc4ff";
const AGUA_CLARA = "#bfe8ff";
/** casca escura (contorno) de uma malha */
const Casca: React.FC<{ children: React.ReactNode; s?: number }> = ({ children, s = 1.04 }) => (
  <mesh scale={s}>
    {children}
    <meshBasicMaterial color={CONTORNO} side={THREE.BackSide} />
  </mesh>
);
type EstadoCopo = { domo: number; transborda: number; f: number };
const Copo3D: React.FC<EstadoCopo> = ({ domo, transborda, f }) => {
  const H = 2.6;
  const nivel = 2.42;
  const domoH = domo * 0.42;
  const folhaY = H + domoH + 0.04;
  const folhaSai = transborda > 0.35 ? ip(transborda, [0.35, 1], [0, 1]) : 0;
  return (
    <group>
      {/* mesa */}
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[9, 0.32, 5]} />
        <MaterialDesenho cor="#b07a4c" tons={2} />
      </mesh>
      {/* poça */}
      {transborda > 0 ? (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0 + transborda * 1.6, 40]} />
          <meshBasicMaterial color={AGUA} transparent opacity={0.85} />
        </mesh>
      ) : null}
      {/* água dentro */}
      <group position={[0, nivel / 2 + 0.06, 0]}>
        <mesh>
          <cylinderGeometry args={[0.93, 0.8, nivel, 48]} />
          <MaterialDesenho cor={AGUA} tons={2} />
        </mesh>
      </group>
      {/* domo acima da borda (tensão superficial) */}
      {domo > 0.01 ? (
        <group position={[0, H, 0]} scale={[1, domoH / 0.97, 1]}>
          <Casca s={1.03}>
            <sphereGeometry args={[0.97, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </Casca>
          <mesh>
            <sphereGeometry args={[0.97, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <MaterialDesenho cor={AGUA} tons={2} />
          </mesh>
          <mesh position={[-0.35, 0.55, 0.45]} scale={[0.22, 0.12, 0.12]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ) : null}
      {/* filetes escorrendo pelos lados */}
      {transborda > 0
        ? new Array(7).fill(0).map((_, i) => {
            const a = (i / 7) * Math.PI * 2 + 0.3;
            const L = Math.min(H, transborda * (2.2 + random(`fl${i}`) * 1.2) * H * 0.6);
            return (
              <mesh key={i} position={[Math.cos(a) * 1.04, H - L / 2, Math.sin(a) * 1.04]}>
                <capsuleGeometry args={[0.07 + random(`fr${i}`) * 0.04, L, 6, 12]} />
                <meshBasicMaterial color={AGUA} />
              </mesh>
            );
          })
        : null}
      {/* vidro (aberto em cima) */}
      <mesh position={[0, H / 2, 0]}>
        <cylinderGeometry args={[1.0, 0.86, H, 48, 1, true]} />
        <meshToonMaterial color="#ffffff" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Casca s={1.025}>
        <cylinderGeometry args={[1.0, 0.86, H, 48, 1, true]} />
      </Casca>
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.035, 8, 64]} />
        <meshBasicMaterial color={CONTORNO} />
      </mesh>
      {/* folha por cima (sobe com o domo; escorrega quando transborda) */}
      <group position={[0.1 + folhaSai * 1.4, folhaY - folhaSai * 1.2, 0.1]} rotation={[0.08 + folhaSai * 0.6, f * 0.01 + folhaSai * 2, -0.06 - folhaSai * 0.9]}>
        <group scale={[0.62, 0.05, 0.3]}>
          <Casca s={1.12}>
            <sphereGeometry args={[1, 24, 12]} />
          </Casca>
          <mesh>
            <sphereGeometry args={[1, 24, 12]} />
            <MaterialDesenho cor="#5fb84a" tons={2} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
const camCopo = (f: number, de: number, ate: number, close = 0): Cam3D => {
  const u = CURVA.suave(ip(f, [de, ate], [0, 1]));
  const ang = (-22 + 44 * u) * (Math.PI / 180);
  const dist = 12.5 - close * 3.5;
  const alvoY = 1.5 + close * 0.8;
  return { pos: [Math.sin(ang) * dist, 3.6 + close * 0.4, Math.cos(ang) * dist], alvo: [0, alvoY, 0], fov: 30 };
};
/** cena do copo 3D: fundo 2D + aura 2D (atrás) + copo 3D + mãos 2D (na frente, nos lados do vidro projetados) */
const CenaCopo: React.FC<{ f: number; cam: Cam3D; estado: EstadoCopo; maos: number; aura: number; dono: "L" | "D" }> = ({ f, cam, estado, maos, aura, dono }) => {
  const pele = dono === "L" ? LUCAS.pele : DIEGO.pele;
  const cores = dono === "L" ? AURA_LUCAS : AURA_DIEGO;
  const [bx, by] = projeta(cam, [0, 0, 0]);
  const [tx, ty] = projeta(cam, [0, 2.6, 0]);
  const lados = [-1, 1].map((s) => projeta(cam, [s * 1.15, 1.5, 0]));
  const t = aura > 0.6 ? { x: (random(`cp${f}`) - 0.5) * 6 * aura, y: (random(`cq${f}`) - 0.5) * 6 * aura } : { x: 0, y: 0 };
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #3a3156, #17121f)", transform: `translate(${t.x}px, ${t.y}px)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <AuraForte x={(bx + tx) / 2} chao={by + 40} altura={(by - ty) * 2.4} f={f} forca={aura} caos={0.15} cor={cores.cor} clara={cores.clara} id={`ca${dono}`} />
      </svg>
      <Camada3D cam={cam} luz>
        <Copo3D {...estado} />
      </Camada3D>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {maos > 0
          ? lados.map(([lx, ly], i) => {
              const s = i === 0 ? -1 : 1;
              const fora = s * (1 - maos) * 700;
              const hx = lx + s * 70 + fora;
              return (
                <g key={i}>
                  <path d={`M ${s > 0 ? 1180 : -100} ${ly + 160} Q ${hx + s * 200} ${ly + 120} ${hx} ${ly}`} stroke={CONTORNO} strokeWidth={118} fill="none" strokeLinecap="round" />
                  <path d={`M ${s > 0 ? 1180 : -100} ${ly + 160} Q ${hx + s * 200} ${ly + 120} ${hx} ${ly}`} stroke={pele} strokeWidth={102} fill="none" strokeLinecap="round" />
                  {[-36, -12, 12, 36].map((dy) => (
                    <g key={dy}>
                      <path d={`M ${hx} ${ly + dy} L ${hx - s * 70} ${ly + dy * 1.25}`} stroke={CONTORNO} strokeWidth={36} strokeLinecap="round" />
                      <path d={`M ${hx} ${ly + dy} L ${hx - s * 70} ${ly + dy * 1.25}`} stroke={pele} strokeWidth={24} strokeLinecap="round" />
                    </g>
                  ))}
                </g>
              );
            })
          : null}
        {aura > 0.3 ? <Brilhos x={(bx + tx) / 2} y={ty - 80} f={f} de={0} raio={360} cor={cores.clara} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ moléculas de mãos dadas (tensão superficial)
const Moleculas: React.FC<{ f: number; de: number }> = ({ f, de }) => {
  const n = 9;
  const u = f - de;
  const pontos = new Array(n).fill(0).map((_, i) => {
    const t = i / (n - 1);
    const x = 140 + t * 800;
    const y = 1000 - Math.sin(t * Math.PI) * 300 + Math.sin(u * 0.12 + i) * 6;
    return [x, y] as [number, number];
  });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      {/* "película": as mãos dadas (traços entre vizinhos se desenham em cascata) */}
      {pontos.slice(1).map(([x, y], i) => {
        const [px, py] = pontos[i];
        const p = ip(u, [14 + i * 5, 26 + i * 5], [0, 1], CURVA.sai);
        return <line key={i} x1={px} y1={py} x2={px + (x - px) * p} y2={py + (y - py) * p} stroke="#e8f7ff" strokeWidth={16} strokeLinecap="round" opacity={0.95} />;
      })}
      {pontos.map(([x, y], i) => {
        const s = mola(u, i * 3, { mass: 0.6, stiffness: 220, damping: 11 });
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <circle r={52} fill={AGUA} stroke={CONTORNO} strokeWidth={8} />
            <circle cx={-34} cy={-30} r={20} fill="#ffffff" stroke={CONTORNO} strokeWidth={5} />
            <circle cx={34} cy={-30} r={20} fill="#ffffff" stroke={CONTORNO} strokeWidth={5} />
            <circle cx={-10} cy={4} r={6} fill={CONTORNO} />
            <circle cx={10} cy={4} r={6} fill={CONTORNO} />
            <path d="M -12 20 Q 0 30 12 20" stroke={CONTORNO} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      {/* água "lá embaixo" puxando pra dentro */}
      <rect x={0} y={1080} width={1080} height={600} fill={AGUA} opacity={0.5} />
      {new Array(6).fill(0).map((_, i) => (
        <path key={i} d={`M ${200 + i * 140} 1300 L ${200 + i * 140} ${1180 + Math.sin(u * 0.2 + i) * 10}`} stroke="#e8f7ff" strokeWidth={8} markerEnd="" opacity={0.6} />
      ))}
    </svg>
  );
};

// ------------------------------------------------------------------ ato 8
const A8P = (f: number) => {
  const r = respira(f, 2);
  return {
    L: frente(330, { vira: 0.3, estica: 1 + r * 0.01, cabeca: 6, bracoE: { ombro: 24, cotovelo: -40 }, bracoD: { ombro: 24, cotovelo: -40 } }),
    D: frente(880, { vira: -0.3, cruzado: 1, estica: 1 + respira(f, 7) * 0.01 }),
  };
};
export const A8: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useF(t0);
  const p = A8P(f);
  return planos(f, [
    [
      A8_0,
      () => (
        <>
          <Cena cam={camK(f, [[A8_0, { x: 600, y: 1000, zoom: 0.85 }], [COPO, { x: 600, y: 980, zoom: 0.98 }, S]])}>
            <Fundo saturacao={0.6}><Cozinha /></Fundo>
            {[330, 880].map((x) => (
              <g key={x}>
                <rect x={x - 190} y={CHAO_Y - 330} width={380} height={40} rx={10} fill="#c98f5a" stroke={CONTORNO} strokeWidth={7} />
                <rect x={x - 170} y={CHAO_Y - 290} width={24} height={290} fill="#8a6440" />
                <rect x={x + 146} y={CHAO_Y - 290} width={24} height={290} fill="#8a6440" />
              </g>
            ))}
            <Boneco2D id="a8l" d={LUCAS} pose={p.L} rosto={vivo({ ...R.normal, olhar: [0.6, 0.6] }, f, "a8l")} />
            <Boneco2D id="a8d" d={DIEGO} pose={p.D} rosto={vivo(R.meioFechado, f, "a8d")} />
          </Cena>
          <Selo texto="FASE 2 · DESCOBRIR O NEN" de={A8_0 + 2} ate={COPO - 4} cor="#7d5bd6" />
        </>
      ),
    ],
    [
      COPO,
      () => {
        const maos = f >= MAOS ? mola(f, MAOS, { mass: 1, stiffness: 90, damping: 15 }) : 0;
        const domo = f >= SOBE ? ip(f, [SOBE, SOBE + 50], [0, 1], CURVA.sai) : 0;
        const aura = f >= MAOS ? ip(f, [MAOS + 10, SOBE + 30], [0.1, 0.65]) : 0;
        return (
          <>
            <CenaCopo f={f} cam={camCopo(f, COPO, TENSAO, ip(f, [SOBE, TENSAO], [0, 0.5], S))} estado={{ domo, transborda: 0, f }} maos={maos} aura={aura} dono="L" />
            {f < MAOS ? <Rotulo2 texto="copo cheio + folha" x={540} y={360} de={COPO + 4} tamanho={64} cor="#fff" /> : null}
            {f >= SOBE + 20 ? <Rotulo2 texto="acima da borda!" x={540} y={360} de={SOBE + 20} tamanho={64} cor={AGUA_CLARA} /> : null}
          </>
        );
      },
    ],
    [
      TENSAO,
      () => (
        <AbsoluteFill style={{ background: "#103a5a" }}>
          <Moleculas f={f} de={TENSAO} />
          <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: "Fredoka", fontWeight: 700, fontSize: 96, color: "#fff", WebkitTextStroke: "10px #1d1424", paintOrder: "stroke fill", transform: `scale(${mola(f, TENSAO + 2)})` }}>
            TENSÃO SUPERFICIAL
          </div>
          <div style={{ position: "absolute", top: 1420, width: "100%", textAlign: "center", fontFamily: "Patrick Hand", fontSize: 72, color: AGUA_CLARA, opacity: ip(f, [T("se agarram"), T("se agarram") + 10], [0, 1]) }}>
            moléculas de mãos dadas = película
          </div>
        </AbsoluteFill>
      ),
    ],
    [
      CONT,
      () => {
        const transborda = f >= TRANSB - 6 ? ip(f, [TRANSB - 6, REFORCO], [0, 1], CURVA.sai) : 0;
        const domo = ip(f, [CONT, TRANSB - 6, TRANSB + 6], [1, 1.35, 0.7]);
        return <CenaCopo f={f} cam={camCopo(f, CONT, REFORCO, ip(f, [CONT, TRANSB], [0.5, 0.2], S))} estado={{ domo, transborda, f }} maos={1} aura={ip(f, [CONT, TRANSB], [0.65, 1])} dono="L" />;
      },
    ],
    [
      REFORCO,
      () => {
        const flex = mola(f, REFORCO - 2, { mass: 0.8, stiffness: 170, damping: 11 });
        const pose = frente(540, { vira: 0.15, agacha: 20 - flex * 10, estica: 1 + flex * 0.03, bracoD: { ombro: 20 + flex * 80, cotovelo: -20 - flex * 120 }, biceps: flex, bracoE: { ombro: 20, cotovelo: -40 }, maoD: "punho", maoE: "punho" });
        const [hx, hy] = posCabeca(pose);
        return (
          <>
            <Cena cam={camK(f, [[REFORCO, { x: 540, y: 1100, zoom: 1.15 }], [DOLADO, { x: 540, y: 1060, zoom: 1.3 }, S]])} fundo="#141024">
              <AuraForte x={540} chao={CHAO_Y} altura={1100} f={f} forca={0.9} caos={0.2} cor={AURA_LUCAS.cor} clara={AURA_LUCAS.clara} id="ref" />
              <Boneco2D id="a8r" d={LUCAS} pose={pose} rosto={vivo(R.feliz, f, "a8r")} cel={{ luz: -90, sombra: 30, recorte: 10, corRecorte: AURA_LUCAS.cor }} />
              <Brilhos x={hx} y={hy} f={f} de={REFORCO} raio={300} cor={AURA_LUCAS.clara} />
            </Cena>
            <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: "Fredoka", fontWeight: 700, fontSize: 150, color: "#ffd23f", WebkitTextStroke: "14px #1d1424", paintOrder: "stroke fill", transform: `scale(${2.2 - 1.2 * mola(f, REFORCO + 4, { mass: 0.6, stiffness: 260, damping: 12 })}) rotate(-6deg)`, opacity: Math.min(1, (f - REFORCO - 4) / 3) }}>
              REFORÇO
            </div>
          </>
        );
      },
    ],
    [
      DOLADO,
      () => {
        const transborda = ip(f, [DOLADO + 20, ENCARAM], [0, 1], CURVA.sai);
        return (
          <>
            <CenaCopo f={f} cam={camCopo(f, DOLADO, ENCARAM + 30, 0.15)} estado={{ domo: ip(f, [DOLADO, DOLADO + 20], [0.6, 1.3]), transborda, f }} maos={1} aura={0.9} dono="D" />
            <Rotulo2 texto="copo do Diego" x={540} y={360} de={DOLADO + 4} tamanho={64} cor={AURA_DIEGO.clara} />
          </>
        );
      },
    ],
    [
      ENCARAM,
      () => {
        const z = 1 + (f - ENCARAM) * 0.004;
        const olho = (d: typeof LUCAS, x: number, cor: string, id: string, olhar: number) => {
          const pose = frente(x, { vira: olhar * 0.3 });
          const [hx, hy] = posCabeca(pose);
          return (
            <svg width={1080} height={960} style={{ position: "absolute" }}>
              <rect width={1080} height={960} fill={cor} />
              <g transform={`translate(540 480) scale(${4.2 * z}) translate(${-hx} ${-hy + 10})`}>
                <Boneco2D id={id} d={d} pose={pose} rosto={vivo({ ...R.foco, olhar: [olhar, 0] }, f, id)} />
              </g>
            </svg>
          );
        };
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", top: 0, height: 960, width: "100%", overflow: "hidden" }}>{olho(LUCAS, 540, "#1d3a6a", "enL", 0.7)}</div>
            <div style={{ position: "absolute", top: 960, height: 960, width: "100%", overflow: "hidden" }}>{olho(DIEGO, 540, "#1d4a2e", "enD", -0.7)}</div>
            <div style={{ position: "absolute", top: 948, height: 24, width: "100%", background: "#ffd23f", boxShadow: "0 0 30px #ffd23f" }} />
          </AbsoluteFill>
        );
      },
    ],
  ]);
};
