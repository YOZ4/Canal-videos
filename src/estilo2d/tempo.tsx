import { Freeze, useCurrentFrame } from "remotion";

/**
 * Câmera lenta VERDADEIRA (remapeamento de tempo). Nossas cenas são funções do quadro, então dá para calcular a cena
 * em "meio quadro", "um quarto de quadro" etc.: a ação desacelera de verdade (não congela nem repete quadros).
 *
 * `trechos`: velocidade do tempo ao longo do vídeo (quadros de SAÍDA). Ex.: [{ em: 80, vel: 1 }, { em: 90, vel: 0.2 }, { em: 110, vel: 0.2 }, { em: 116, vel: 1 }]
 * → normal até 80, desacelera progressivamente até 20% em 90, fica lento até 110 e acelera de volta até 116.
 * Entre dois trechos a velocidade muda com curva suave (smoothstep), sem tranco.
 */
export type Trecho = { em: number; vel: number };

const suave = (t: number) => t * t * (3 - 2 * t);

/** velocidade do tempo no quadro de saída f */
export const velocidadeEm = (f: number, trechos: Trecho[]): number => {
  if (!trechos.length) return 1;
  if (f <= trechos[0].em) return trechos[0].vel;
  for (let i = 1; i < trechos.length; i++) {
    const a = trechos[i - 1];
    const b = trechos[i];
    if (f <= b.em) return a.vel + (b.vel - a.vel) * suave((f - a.em) / Math.max(1e-6, b.em - a.em));
  }
  return trechos[trechos.length - 1].vel;
};

/** quadro da CENA (tempo da ação) correspondente ao quadro de saída f — integral da velocidade */
export const tempoCena = (f: number, trechos: Trecho[]): number => {
  let t = 0;
  const passo = 0.25;
  for (let x = 0; x < f; x += passo) t += velocidadeEm(x + passo / 2, trechos) * passo;
  return t;
};

/** duração de saída necessária para mostrar `dur` quadros de cena com esses trechos */
export const duracaoSaida = (dur: number, trechos: Trecho[]): number => {
  let f = 0;
  while (tempoCena(f, trechos) < dur && f < dur * 20) f++;
  return f;
};

/**
 * Envolve uma cena e toca ela no tempo remapeado. Os efeitos de câmera do Diretor e os sons ficam FORA
 * (no tempo de saída) para não serem desacelerados junto.
 */
export const CameraLenta: React.FC<{ trechos: Trecho[]; children: React.ReactNode }> = ({ trechos, children }) => {
  const f = useCurrentFrame();
  return <Freeze frame={tempoCena(f, trechos)}>{children}</Freeze>;
};

/** atalho: um momento de câmera lenta em volta do quadro `em` (desacelera em `entra`, segura `segura`, volta em `sai`) */
export const momentoLento = (em: number, vel = 0.2, entra = 10, segura = 18, sai = 8): Trecho[] => [
  { em: em - entra, vel: 1 },
  { em, vel },
  { em: em + segura, vel },
  { em: em + segura + sai, vel: 1 },
];
