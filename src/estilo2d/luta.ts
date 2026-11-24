import { posCabeca, posMao, posPe, type Pose } from "./Boneco2D";
import { mixPose } from "./anim";
import { duracaoCom, guardaViva, poseGolpe, relogioGolpe, tempoGolpe, type Golpe, type Ritmo } from "./golpes";

/**
 * SISTEMA DE COREOGRAFIA DE LUTA (etapa 2).
 *
 * Você descreve a luta como uma lista de LANCES ("quem faz o quê em quem e como o outro responde") e o sistema monta:
 *   preparação → execução → contato → IMPACTO (hit-stop) → reação do adversário → recuperação → continuação
 *
 *   const LUTA = criarLuta({ L: { base: LUCAS_BASE }, D: { base: DIEGO_BASE } }, [
 *     { quem: "L", golpe: GOLPES.avanca, em: 20 },
 *     { quem: "L", golpe: GOLPES.jab, alvo: "D", resposta: GOLPES.defesa, depois: 2 },
 *     { quem: "D", golpe: GOLPES.direto, alvo: "L", resposta: GOLPES.esquivaBaixa, noContato: 10 },
 *     { quem: "L", golpe: GOLPES.chuteAlto, alvo: "D", resposta: GOLPES.levaGolpe, forca: 1.4, ritmo: { preparo: 1.3 } },
 *   ]);
 *   LUTA.pose("L", f)   LUTA.camera(f)   LUTA.eventos   LUTA.estado("D", f)   LUTA.duracao
 *
 * O que ele resolve sozinho:
 *  - ALINHAMENTO: a resposta (defesa/esquiva/reação) é posicionada para que o "recebe" dela caia no contato do ataque.
 *  - ALCANCE: o avanço do golpe é ajustado para o punho/pé CHEGAR no alvo (cabeça, peito ou a guarda que bloqueia).
 *  - HIT-STOP: no contato o mundo congela 3–8 quadros (força), quem apanha treme e já mostra o desenho do impacto.
 *  - PÉS PLANTADOS: pé no chão fica preso no lugar; se o corpo se afasta demais, o pé dá um PASSO (nunca patina).
 *    Escorregar só de propósito (`desliza` no golpe, ou `escorrega: true` no lance) — e aí sai poeira.
 *  - CONTINUIDADE: a guarda "viva" entra e sai aos poucos (sem pulo de pose entre golpes); virar de lado tem giro.
 *  - CABELO: mola amortecida guiada pela aceleração da cabeça (balança ao golpear, apanhar, pousar).
 *  - CÂMERA: enquadra os dois o tempo todo (abre quando se afastam/sobem, fecha quando se aproximam), com atraso
 *    de cinegrafista, sem nunca cortar cabeça/pés.
 * Tempos: "tempo de luta" (sem os congelamentos) nos lances; tudo o que sai (pose, câmera, eventos) é em quadros de CENA.
 */

export type Lance = {
  quem: string;
  golpe: Golpe;
  /** início absoluto (tempo de luta) */
  em?: number;
  /** começa N quadros depois do FIM do lance anterior (padrão 2). Pode ser negativo (emenda) */
  depois?: number;
  /** começa N quadros depois do CONTATO (ou pouso) do lance anterior — continuação da luta */
  noContato?: number;
  alvo?: string;
  /** como o alvo responde: levaGolpe/queda (acerto), defesa (bloqueio), esquivaBaixa/esquivaTras (erra) */
  resposta?: Golpe;
  /** 0.5..2: tamanho do hit-stop, tremor, empurrão da reação */
  forca?: number;
  /** quadros de congelamento no contato (padrão pela força; 0 = sem) */
  hitstop?: number;
  /** escala de tempo por fase do ataque (preparo mais longo = mais peso) */
  ritmo?: Ritmo;
  /** escala de tempo por fase da resposta */
  ritmoResposta?: Ritmo;
  /** ajustar o avanço para o golpe chegar no alvo (padrão: sim em acertos e bloqueios) */
  alcance?: boolean;
  /** vira de lado no fim do golpe (depois de cruzar o adversário) */
  vira?: boolean;
  /** o alvo vira de lado no fim da resposta */
  viraAlvo?: boolean;
  /** a resposta escorrega no chão (bloqueio de golpe muito forte) */
  escorrega?: boolean;
};

export type EventoLuta =
  | { tipo: "contato"; f: number; resultado: "acerto" | "bloqueio" | "esquiva"; forca: number; x: number; y: number; quem: string; alvo: string; stop: number }
  | { tipo: "pouso"; f: number; x: number; y: number; quem: string; forte: boolean }
  | { tipo: "whoosh"; f: number; quem: string; forca: number }
  | { tipo: "deslize"; de: number; ate: number; quem: string }
  | { tipo: "passo"; f: number; x: number; quem: string };

export type Fase = "guarda" | "preparo" | "acao" | "contato" | "recupera" | "reacao" | "defesa" | "movimento";

type Seg = {
  g: Golpe;
  em: number;
  dur: number;
  ritmo?: Ritmo;
  base: Pose;
  empurra: number;
  extra: (u: number) => number;
  vira: boolean;
  escorrega: boolean;
};

type Ator = { id: string; base0: Pose; semente: number; segs: Seg[]; base: Pose; livre: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const suave = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const R_CABECA = 135;

/** pontos do corpo no mundo, considerando o giro (para câmera e efeitos) */
export const pontosCorpo = (p: Pose): [number, number][] => {
  const [cx, cy] = posCabeca(p);
  const r = R_CABECA * 1.3 * p.escala;
  const pts: [number, number][] = [
    [cx - r, cy - r],
    [cx + r, cy - r],
    [cx, cy + r * 0.5],
    posMao(p, "D"),
    posMao(p, "E"),
    posPe(p, "D"),
    posPe(p, "E"),
    [p.x, p.y + (-396 + p.agacha) * p.escala],
  ];
  if (!p.gira) return pts;
  const ox = p.x;
  const oy = p.y - (p.giraEm ?? 600) * p.escala;
  const a = (p.gira * p.lado * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [ox + (x - ox) * c - (y - oy) * s, oy + (x - ox) * s + (y - oy) * c]);
};

/** gira um ponto do corpo pelo `gira` da pose (posMao/posPe ignoram o giro) */
const comGiro = (p: Pose, [x, y]: [number, number]): [number, number] => {
  if (!p.gira) return [x, y];
  const ox = p.x;
  const oy = p.y - (p.giraEm ?? 600) * p.escala;
  const a = (p.gira * p.lado * Math.PI) / 180;
  return [ox + (x - ox) * Math.cos(a) - (y - oy) * Math.sin(a), oy + (x - ox) * Math.sin(a) + (y - oy) * Math.cos(a)];
};

/** ponto do membro que bate */
const pontoMembro = (p: Pose, m: Golpe["membro"]): [number, number] => comGiro(p, m === "peD" ? posPe(p, "D") : posMao(p, m === "maoE" ? "E" : "D"));

/** ponto do alvo (superfície da frente da cabeça/peito, do lado de quem ataca) */
const pontoAlvo = (v: Pose, mira: Golpe["mira"], deQueLado: number): [number, number] => {
  const [hx, hy] = posCabeca(v);
  if (mira === "peito") {
    const quadrilY = v.y + (-396 + v.agacha) * v.escala;
    return [v.x - deQueLado * 80 * v.escala, hy + (quadrilY - hy) * 0.5];
  }
  return [hx - deQueLado * R_CABECA * 0.85 * v.escala, hy];
};

export type OpcoesLuta = {
  /** fim da luta (tempo de luta); padrão: fim do último lance + 40 */
  fim?: number;
  /** margem lateral da câmera em px de tela (vídeo 1080 de largura) */
  margem?: number;
  zoomMin?: number;
  zoomMax?: number;
  /** altura (px de tela) onde fica o centro do grupo */
  centroY?: number;
};

export const criarLuta = (atoresIn: Record<string, { base: Pose; semente?: number }>, lances: Lance[], op: OpcoesLuta = {}) => {
  // ---------------------------------------------------------------- 1) montar os segmentos (tempo de luta)
  const atores: Record<string, Ator> = {};
  Object.entries(atoresIn).forEach(([id, a], i) => {
    atores[id] = { id, base0: a.base, semente: a.semente ?? i * 3, segs: [], base: a.base, livre: 0 };
  });
  const stops: { c: number; dur: number }[] = [];
  const eventosLuta: (EventoLuta & { t?: number })[] = [];
  const contatos: { t: number; lance: Lance; seg: Seg; resp?: Seg }[] = [];

  /** pose "crua" de um ator no tempo de luta t (sem tremor/pés/cabelo) */
  const poseLutaRaw = (a: Ator, t: number): Pose => {
    let ultimoFim = -999;
    let base = a.base0;
    let viraFim = -999;
    for (let i = 0; i < a.segs.length; i++) {
      const s = a.segs[i];
      if (t < s.em) {
        // guarda entre golpes: a "vida" entra e sai aos poucos
        const amp = suave(Math.min((t - ultimoFim) / 10, (s.em - t) / 5, 1));
        return largura(guardaViva(t, base, a.semente, ultimoFim < -900 ? suave((s.em - t) / 5) : amp), t, viraFim);
      }
      if (t < s.em + s.dur) {
        let u = tempoGolpe(s.g, t - s.em, s.ritmo);
        if (s.g.tipo === "reacao" && u >= (s.g.recebe ?? 0)) u = Math.max(u, (s.g.recebe ?? 0) + 1.5); // estalo do impacto
        const p = poseGolpe(s.g, u, s.base, s.empurra, s.extra);
        const fim = s.em + s.dur;
        const l = s.vira ? Math.max(0.12, suave((fim - t) / 4)) : 1;
        return largura(p, t, viraFim, l);
      }
      ultimoFim = s.em + s.dur;
      base = { ...s.base, x: s.base.x + ((s.g.desloca ?? 0) * s.empurra + s.extra(s.g.dur)) * s.base.lado * s.base.escala };
      if (s.vira) {
        base = { ...base, lado: (base.lado * -1) as 1 | -1 };
        viraFim = ultimoFim;
      }
    }
    return largura(guardaViva(t, base, a.semente, suave((t - ultimoFim) / 10)), t, viraFim);
  };
  const largura = (p: Pose, t: number, viraFim: number, l = 1): Pose => {
    const depois = t >= viraFim && t < viraFim + 4 ? Math.max(0.12, suave((t - viraFim) / 4)) : 1;
    const k = Math.min(l, depois);
    return k < 1 ? { ...p, largura: p.largura * k } : p;
  };

  const baseAgora = (a: Ator): Pose => {
    let b = a.base0;
    for (const s of a.segs) {
      b = { ...s.base, x: s.base.x + ((s.g.desloca ?? 0) * s.empurra + s.extra(s.g.dur)) * s.base.lado * s.base.escala };
      if (s.vira) b = { ...b, lado: (b.lado * -1) as 1 | -1 };
    }
    return b;
  };

  let ultimo: { fim: number; marco: number } = { fim: 0, marco: 0 };
  for (const l of lances) {
    const a = atores[l.quem];
    let em = l.em ?? (l.noContato !== undefined ? ultimo.marco + l.noContato : ultimo.fim + (l.depois ?? 2));
    if (em < a.livre) em = a.livre; // não começa um golpe no meio do outro
    const forca = l.forca ?? 1;
    const seg: Seg = { g: l.golpe, em, dur: duracaoCom(l.golpe, l.ritmo), ritmo: l.ritmo, base: baseAgora(a), empurra: 1, extra: () => 0, vira: !!l.vira, escorrega: false };
    a.segs.push(seg);
    a.livre = em + seg.dur;
    const marcoU = l.golpe.contato ?? l.golpe.pouso;
    const tContato = em + relogioGolpe(l.golpe, marcoU ?? l.golpe.dur, l.ritmo);
    if (l.golpe.prep !== undefined && l.golpe.tipo === "ataque") eventosLuta.push({ tipo: "whoosh", f: 0, t: em + relogioGolpe(l.golpe, l.golpe.prep, l.ritmo) - 1, quem: l.quem, forca });

    let resp: Seg | undefined;
    if (l.alvo && l.resposta && l.golpe.contato !== undefined) {
      const v = atores[l.alvo];
      const r = l.resposta;
      const emR = Math.max(v.livre, tContato - relogioGolpe(r, r.recebe ?? 0, l.ritmoResposta));
      const reacao = r.tipo === "reacao";
      resp = { g: r, em: emR, dur: duracaoCom(r, l.ritmoResposta), ritmo: l.ritmoResposta, base: baseAgora(v), empurra: reacao || r.nome === "defesa" ? forca : 1, extra: () => 0, vira: !!l.viraAlvo, escorrega: !!l.escorrega };
      v.segs.push(resp);
      v.livre = emR + resp.dur;
      const erra = r.nome.startsWith("esquiva");
      // alcance automático: o membro chega no alvo (acerto) ou na guarda (bloqueio)
      if ((l.alcance ?? !erra) && l.golpe.membro) {
        const vp = poseLutaRaw(v, reacao ? tContato - 0.5 : tContato); // acerto: mira onde a cabeça ESTAVA
        const ap = poseLutaRaw(a, tContato);
        const alvoPt: [number, number] = r.nome === "defesa" ? [posMao(vp, "D")[0] - a.base.lado * 20 * vp.escala, posMao(vp, "D")[1]] : pontoAlvo(vp, l.golpe.mira, seg.base.lado);
        const m = pontoMembro(ap, l.golpe.membro);
        const err = clamp(((alvoPt[0] - m[0]) * seg.base.lado) / seg.base.escala, -180, 240);
        const g = l.golpe;
        const p0 = g.prep ?? 0;
        const c0 = g.contato ?? 0;
        seg.extra = (u: number) => err * suave((u - p0) / Math.max(1, c0 - p0));
      }
      const stop = erra ? 0 : (l.hitstop ?? (reacao ? Math.round(3 + 2.5 * forca) : 3));
      if (stop > 0) stops.push({ c: tContato, dur: stop });
      contatos.push({ t: tContato, lance: l, seg, resp });
    }
    ultimo = { fim: em + seg.dur, marco: tContato };
  }
  stops.sort((x, y) => x.c - y.c);
  const fimLuta = op.fim ?? Math.max(...Object.values(atores).map((a) => a.livre)) + 40;

  // ---------------------------------------------------------------- 2) relógio: cena ↔ luta (congelamentos)
  const totalStops = stops.reduce((s, x) => s + x.dur, 0);
  const duracao = Math.ceil(fimLuta + totalStops);
  /** quadro de cena → tempo de luta (+ congelamento atual) */
  const relogio = (fs: number): { t: number; stop?: { c: number; dur: number; k: number } } => {
    let acc = 0;
    for (const s of stops) {
      const ini = s.c + acc;
      if (fs < ini) break;
      if (fs < ini + s.dur) return { t: s.c, stop: { ...s, k: fs - ini } };
      acc += s.dur;
    }
    return { t: fs - acc };
  };
  /** tempo de luta → quadro de cena */
  const cena = (t: number) => t + stops.filter((s) => s.c < t).reduce((x, s) => x + s.dur, 0);

  // eventos em quadros de cena
  const eventos: EventoLuta[] = [];
  for (const e of eventosLuta) if (e.tipo === "whoosh" && e.t !== undefined) eventos.push({ tipo: "whoosh", f: cena(e.t), quem: e.quem, forca: e.forca });
  for (const c of contatos) {
    const a = atores[c.lance.quem];
    const ap = poseLutaRaw(a, c.t);
    const [x, y] = pontoMembro(ap, c.lance.golpe.membro);
    const r = c.lance.resposta!;
    const resultado = r.nome.startsWith("esquiva") ? "esquiva" : r.tipo === "reacao" ? "acerto" : "bloqueio";
    const st = stops.find((s) => s.c === c.t);
    eventos.push({ tipo: "contato", f: cena(c.t), resultado, forca: c.lance.forca ?? 1, x, y, quem: c.lance.quem, alvo: c.lance.alvo!, stop: st?.dur ?? 0 });
  }
  for (const a of Object.values(atores))
    for (const s of a.segs) {
      if (s.g.pouso !== undefined) {
        const t = s.em + relogioGolpe(s.g, s.g.pouso, s.ritmo);
        const p = poseLutaRaw(a, t);
        eventos.push({ tipo: "pouso", f: cena(t), x: p.x, y: a.base0.y, quem: a.id, forte: s.g.tipo === "reacao" });
      }
      const dz = s.g.desliza ?? (s.escorrega ? [s.g.recebe ?? 0, (s.g.recebe ?? 0) + 8] : undefined);
      if (dz) eventos.push({ tipo: "deslize", de: cena(s.em + relogioGolpe(s.g, dz[0], s.ritmo)), ate: cena(s.em + relogioGolpe(s.g, dz[1], s.ritmo)), quem: a.id });
    }

  // ---------------------------------------------------------------- 3) quadros inteiros: tremor, pés plantados, cabelo
  const N = duracao + 2;
  const cache: Record<string, Pose[]> = {};
  const estadoSeg = (a: Ator, t: number) => a.segs.find((s) => t >= s.em && t < s.em + s.dur);

  const calcular = () => {
    if (Object.keys(cache).length) return;
    // quem apanha em cada congelamento
    const vitimaDe = (c: number) => contatos.find((x) => x.t === c);
    for (const a of Object.values(atores)) {
      const arr: Pose[] = [];
      const chao = a.base0.y;
      const LIMITE = 40; // unidades: mais que isso longe do pé plantado → dá um passo
      const PASSO = 5;
      type EstPe = { preso: boolean; x: number; passo?: { de: number; ini: number } };
      const est: Record<"E" | "D", EstPe> = { E: { preso: false, x: 0 }, D: { preso: false, x: 0 } };
      let cab = 0;
      let cabV = 0;
      const hx: number[] = [];
      for (let f = 0; f < N; f++) {
        const { t, stop } = relogio(f);
        let p = poseLutaRaw(a, t);
        // tremor do congelamento: quem apanha vibra forte, quem bate vibra pouco
        if (stop) {
          const ct = vitimaDe(stop.c);
          const fz = ct?.lance.forca ?? 1;
          const ehVitima = ct?.lance.alvo === a.id;
          const ehAtacante = ct?.lance.quem === a.id;
          const amp = ehVitima ? 7 + 5 * fz : ehAtacante ? 2.5 : 0;
          const dec = 1 - stop.k / (stop.dur + 1);
          p = { ...p, x: p.x + (Math.floor(stop.k) % 2 ? 1 : -1) * amp * dec * p.escala * 1.6 };
        }
        // ---- pés plantados
        const s = estadoSeg(a, t);
        const u = s ? tempoGolpe(s.g, t - s.em, s.ritmo) : 0;
        const dz = s ? s.g.desliza ?? (s.escorrega ? [s.g.recebe ?? 0, (s.g.recebe ?? 0) + 8] : undefined) : undefined;
        const deslizando = !!dz && u >= dz[0] && u <= dz[1];
        const giroOk = Math.abs((((p.gira % 360) + 540) % 360) - 180) < 12; // gira ≈ 0 (mod 360)
        const fator = p.escala * p.lado * p.largura / Math.sqrt(p.estica);
        const novos: Partial<Pose> = {};
        const ordem: ("E" | "D")[] = ["E", "D"];
        // quem está mais longe do seu lugar dá o passo primeiro
        const rawX = (q: "E" | "D") => p.x + (q === "E" ? p.peE.dx : p.peD.dx) * fator;
        ordem.sort((q1, q2) => Math.abs(rawX(q2) - est[q2].x) - Math.abs(rawX(q1) - est[q1].x));
        for (const q of ordem) {
          const pe = q === "E" ? p.peE : p.peD;
          const outro = est[q === "E" ? "D" : "E"];
          const alvoX = rawX(q);
          const h = (p.y - chao) / p.escala + pe.dy;
          const noChao = h > -4 && giroOk && p.largura > 0.9 && !deslizando;
          const e = est[q];
          let x = alvoX;
          let dy = pe.dy;
          if (e.passo) {
            const k = (f - e.passo.ini) / PASSO;
            if (k >= 1 || !noChao) {
              e.passo = undefined;
              e.preso = noChao;
              e.x = alvoX;
              if (noChao) eventos.push({ tipo: "passo", f, x: alvoX, quem: a.id });
            } else {
              x = e.passo.de + (alvoX - e.passo.de) * suave(k);
              dy = Math.min(dy, -Math.sin(k * Math.PI) * 30);
            }
          } else if (noChao) {
            if (!e.preso) {
              e.preso = true;
              e.x = alvoX;
            } else {
              const longe = Math.abs(alvoX - e.x) / p.escala;
              const parado = !s; // na guarda: ajeita pés que ficaram fora do lugar
              if ((longe > LIMITE && (!outro.passo || longe > LIMITE * 2.5)) || (parado && longe > 22 && !outro.passo)) {
                e.passo = { de: e.x, ini: f };
                e.preso = false;
              } else x = e.x;
            }
          } else e.preso = false;
          novos[q === "E" ? "peE" : "peD"] = { ...pe, dx: (x - p.x) / fator, dy };
        }
        p = { ...p, ...novos };
        // ---- cabelo: mola guiada pela aceleração da cabeça (e pelo giro do corpo)
        const [cx] = posCabeca(p);
        hx.push(cx + p.gira * 1.2);
        const n = hx.length;
        const acel = n >= 3 ? hx[n - 1] - 2 * hx[n - 2] + hx[n - 3] : 0;
        const vel = n >= 2 ? hx[n - 1] - hx[n - 2] : 0;
        if (!stop) {
          cabV += -0.2 * cab - 0.3 * cabV - 0.32 * acel - 0.03 * vel;
          cab = clamp(cab + cabV, -20, 20);
        }
        arr.push({ ...p, cabelo: p.cabelo + cab * p.lado });
      }
      cache[a.id] = arr;
    }
    // ---- câmera: enquadra todos (com atraso de cinegrafista)
    const margem = op.margem ?? 150;
    const zMin = op.zoomMin ?? 0.72;
    const zMax = op.zoomMax ?? 1.22;
    const centroY = op.centroY ?? 880;
    const alvos = new Array(N).fill(0).map((_, f) => {
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const id of Object.keys(atores)) {
        for (const [x, y] of pontosCorpo(cache[id][f])) {
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
      }
      y1 = Math.max(y1, atores[Object.keys(atores)[0]].base0.y);
      const z = clamp(Math.min((1080 - 2 * margem) / (x1 - x0), 1150 / (y1 - y0)), zMin, zMax);
      return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z };
    });
    const cam: { x: number; y: number; zoom: number }[] = [];
    let c = { ...alvos[0] };
    let v = { x: 0, y: 0, z: 0 };
    const w = 0.22; // rigidez (mola criticamente amortecida)
    for (let f = 0; f < N; f++) {
      const a = alvos[Math.min(N - 1, f + 3)]; // olha 3 quadros à frente (o cinegrafista antecipa um pouco)
      for (const k of ["x", "y", "z"] as const) {
        const ac = w * w * (a[k] - c[k]) - 2 * w * v[k];
        v[k] += ac;
        c[k] += v[k];
      }
      // nunca deixar o grupo sair do quadro: se a mola atrasar demais, puxa
      const zoom = c.z;
      cam.push({ x: c.x, y: c.y + (960 - centroY) / zoom, zoom });
    }
    cache.__cam = cam as unknown as Pose[];
  };

  const interp = <T>(arr: T[], f: number, mix: (a: T, b: T, k: number) => T): T => {
    const i = clamp(Math.floor(f), 0, arr.length - 1);
    const j = Math.min(arr.length - 1, i + 1);
    const k = clamp(f - i, 0, 1);
    return k < 1e-3 ? arr[i] : mix(arr[i], arr[j], k);
  };

  return {
    /** duração total em quadros de CENA (inclui os congelamentos) */
    duracao,
    /** contatos, pousos, whooshes, deslizes e passos automáticos (quadros de cena) */
    get eventos() {
      calcular();
      return eventos;
    },
    /** tempo de luta → quadro de cena */
    cena,
    relogio,
    /** pose final do ator no quadro de cena f (aceita quadro fracionado — câmera lenta) */
    pose: (id: string, f: number): Pose => {
      calcular();
      return interp(cache[id], f, mixPose);
    },
    /** câmera que enquadra a luta (para o Palco: {x, y, zoom}) */
    camera: (f: number) => {
      calcular();
      const arr = cache.__cam as unknown as { x: number; y: number; zoom: number }[];
      return interp(arr, f, (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, zoom: a.zoom + (b.zoom - a.zoom) * k }));
    },
    /** em que fase o ator está (para escolher a expressão do rosto) */
    estado: (id: string, f: number): { fase: Fase; golpe?: string; u: number } => {
      const { t } = relogio(f);
      const s = estadoSeg(atores[id], t);
      if (!s) return { fase: "guarda", u: 0 };
      const u = tempoGolpe(s.g, t - s.em, s.ritmo);
      const g = s.g;
      if (g.tipo === "reacao") return { fase: "reacao", golpe: g.nome, u };
      if (g.tipo === "defesa") return { fase: "defesa", golpe: g.nome, u };
      if (g.tipo === "movimento") return { fase: "movimento", golpe: g.nome, u };
      const prep = g.prep ?? 0;
      const c = g.contato ?? prep;
      return { fase: u < prep ? "preparo" : u < c ? "acao" : u < c + 5 ? "contato" : "recupera", golpe: g.nome, u };
    },
    /** primeiro quadro de cena em que `id` está no golpe `golpe` com u ≥ `u` (para câmera lenta, sons, cortes) */
    quando: (id: string, golpe: string, u = 0, depoisDe = 0): number => {
      for (let f = depoisDe; f < duracao; f += 0.25) {
        const { t } = relogio(f);
        const s = estadoSeg(atores[id], t);
        if (s && s.g.nome === golpe && tempoGolpe(s.g, t - s.em, s.ritmo) >= u) return f;
      }
      return -1;
    },
    /** congelamento (hit-stop) ativo no quadro de cena f */
    congelado: (f: number) => !!relogio(f).stop,
  };
};

export type Luta = ReturnType<typeof criarLuta>;
