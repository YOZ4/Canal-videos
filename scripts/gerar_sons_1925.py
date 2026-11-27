"""Trilha de jazz anos 20 + efeitos sonoros do episódio "Torre Eiffel" (sintetizados, determinísticos, sem internet).
   python3 scripts/gerar_sons_1925.py
 public/musica/jazz-1925.wav        jazz malandro (piano + contrabaixo + escovinha), 120 bpm, 64 s
 public/musica/jazz-1925-radio.wav  o mesmo jazz com filtro de rádio antigo (flashback)
 public/musica/jazz-1925-rapido.wav versão mais rápida e debochada (150 bpm), 30 s
 public/musica/drone-mar.wav        drone grave de mistério (fundo do mar), 16 s
 public/sfx/*.wav                   papel, cortina, carimbo, gargalhada, taca, buzina, sanfona, cadeira, tic, projetor,
                                    rangido, moedas, shh, motor, lapis, aperto, notas, kaching, bolhas, nhac, puf, flip,
                                    apito, ahem, grilo, relogio
"""
import wave, os
import numpy as np

SR = 44100
rng = np.random.default_rng(1925)


def salvar(caminho, x, ganho=0.9):
    x = np.asarray(x, dtype=float)
    x = x / (np.max(np.abs(x)) + 1e-9) * ganho
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with wave.open(caminho, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, ataque, queda):
    a = np.minimum(1, np.arange(n) / max(1, int(SR * ataque)))
    return a * np.exp(-np.arange(n) / (SR * queda))


def pb(x, a):  # passa-baixa 1 polo (a pode variar)
    y = np.zeros_like(x); v = 0.0
    a = np.broadcast_to(np.asarray(a, dtype=float), x.shape)
    for i in range(len(x)):
        v += a[i] * (x[i] - v); y[i] = v
    return y


def pa(x, a):
    return x - pb(x, a)


def hz(nota):  # midi -> Hz
    return 440.0 * 2 ** ((nota - 69) / 12)


# ---------------- jazz ----------------
def piano(freq, dur):
    d = t(dur)
    s = sum(np.sin(2 * np.pi * freq * k * d) * (0.6 ** (k - 1)) for k in range(1, 6))
    return s * env(len(d), 0.004, 0.35) * (1 + 0.002 * np.sin(2 * np.pi * 5 * d))


def baixo(freq, dur):
    d = t(dur)
    s = np.sin(2 * np.pi * freq * d) + 0.35 * np.sin(2 * np.pi * 2 * freq * d) + 0.12 * np.sin(2 * np.pi * 3 * freq * d)
    return s * env(len(d), 0.01, 0.22)


def escova(dur):
    d = t(dur)
    r = rng.standard_normal(len(d))
    return pa(r, 0.3) * env(len(d), 0.01, 0.06)


# progressão "golpe elegante" (ii-V-I em fá com cromatismos), acordes em midi
PROG = [
    [62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 71], [57, 61, 64, 67],
    [62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 70], [65, 69, 72, 76],
]
RAIZ = [38, 43, 36, 45, 38, 43, 36, 41]


def jazz(bpm, segundos, swing=0.62, semente=0):
    r = np.random.default_rng(semente)
    batida = 60 / bpm
    n = int(SR * segundos)
    out = np.zeros(n + SR * 2)
    compasso = 0
    tempo = 0.0
    while tempo < segundos:
        i = compasso % len(PROG)
        acorde = PROG[i]
        raiz = RAIZ[i]
        # contrabaixo andando (4 por compasso)
        andando = [raiz, raiz + 4, raiz + 7, raiz + 9 if r.random() < 0.5 else raiz + 6]
        for k in range(4):
            p = int(SR * (tempo + k * batida))
            b = baixo(hz(andando[k]), batida * 0.95) * 0.55
            out[p:p + len(b)] += b
            # escovinha com swing (ti-ka)
            e = escova(0.12) * (0.18 if k % 2 else 0.12)
            out[p:p + len(e)] += e
            p2 = int(SR * (tempo + k * batida + batida * swing))
            e2 = escova(0.08) * 0.08
            out[p2:p2 + len(e2)] += e2
        # piano: acorde no contratempo (charleston) + frase solta
        for pos in ([0, 1.5 * batida] if compasso % 2 == 0 else [batida * swing, 2.5 * batida]):
            p = int(SR * (tempo + pos))
            for nota in acorde:
                s = piano(hz(nota), 0.5) * 0.12
                out[p:p + len(s)] += s
        if compasso % 2 == 1:
            frase = [acorde[-1] + 12, acorde[-2] + 12, acorde[-1] + 14, acorde[-3] + 12]
            for k, nota in enumerate(frase):
                pos = k * batida * 0.5 + (batida * (swing - 0.5) if k % 2 else 0) + 2 * batida
                p = int(SR * (tempo + pos))
                s = piano(hz(nota), 0.3) * 0.13
                out[p:p + len(s)] += s
        tempo += 4 * batida
        compasso += 1
    out = out[:n]
    # fade nas pontas
    f = int(SR * 0.4)
    out[:f] *= np.linspace(0, 1, f)
    out[-f:] *= np.linspace(1, 0, f)
    return out


j = jazz(120, 64, semente=1)
salvar("public/musica/jazz-1925.wav", j, 0.8)
salvar("public/musica/jazz-1925-radio.wav", pa(pb(j, 0.35), 0.05) + rng.standard_normal(len(j)) * 0.004, 0.7)
salvar("public/musica/jazz-1925-rapido.wav", jazz(150, 30, swing=0.66, semente=2), 0.8)
d = t(16.0)
drone = np.sin(2 * np.pi * 55 * d) * 0.6 + np.sin(2 * np.pi * 82.4 * d + np.sin(2 * np.pi * 0.2 * d)) * 0.35
drone += pb(rng.standard_normal(len(d)), 0.01) * 2
drone *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * d)
salvar("public/musica/drone-mar.wav", drone, 0.7)

# ---------------- efeitos ----------------
S = "public/sfx/"
r = lambda n: rng.standard_normal(n)
d = t(0.6); salvar(S + "papel.wav", pb(r(len(d)), 0.25 + 0.2 * np.sin(np.pi * d / 0.6)) * np.sin(np.pi * d / 0.6) ** 1.5)
d = t(0.7); salvar(S + "cortina.wav", pb(r(len(d)), 0.08) * np.sin(np.pi * d / 0.7) * (1 + 0.4 * np.sin(2 * np.pi * 14 * d)))
d = t(0.35); salvar(S + "carimbo.wav", np.sin(2 * np.pi * (90 - 40 * d) * d) * env(len(d), 0.001, 0.07) + pb(r(len(d)), 0.5) * env(len(d), 0.001, 0.015) * 0.8)
# gargalhada: "ha" com formantes (pulsos glotais filtrados)
d = t(1.6); x = np.zeros(len(d))
for k in range(7):
    i0 = int(SR * (0.02 + k * 0.2)); n = int(SR * 0.15)
    tt = np.arange(n) / SR
    f0 = 260 - k * 12
    puls = np.sign(np.sin(2 * np.pi * f0 * tt)) * 0.5 + np.sin(2 * np.pi * f0 * tt)
    voz = pb(puls, 0.25) + 0.5 * np.sin(2 * np.pi * 750 * tt) * puls * 0.3 + pb(r(n), 0.3) * 0.25
    x[i0:i0 + n] += voz * np.sin(np.pi * tt / 0.15) ** 0.7 * (1 - k * 0.08)
salvar(S + "gargalhada.wav", x, 0.8)
d = t(1.2); salvar(S + "taca.wav", sum(np.sin(2 * np.pi * f * d) * np.exp(-d * k) for f, k in ((2637, 4), (3951, 6), (5274, 9))) * env(len(d), 0.001, 2))
d = t(0.9); h = np.sign(np.sin(2 * np.pi * np.cumsum(np.where(d < 0.45, 330 + 120 * d / 0.45, 440 - 160 * (d - 0.45) / 0.45)) / SR))
salvar(S + "buzina.wav", pb(h, 0.2) * np.sin(np.pi * d / 0.9) ** 0.5)
d = t(4.0); ac = sum(np.sign(np.sin(2 * np.pi * hz(n) * d)) for n in (53, 57, 60, 65)) * 0.25
salvar(S + "sanfona.wav", pb(ac, 0.15) * (0.75 + 0.25 * np.sin(2 * np.pi * 5.5 * d)) * np.minimum(1, d / 0.3) * np.minimum(1, (4 - d) / 0.5))
d = t(0.45); salvar(S + "cadeira.wav", pb(r(len(d)), 0.15) * np.sin(np.pi * d / 0.45) * (1 + 0.8 * np.sin(2 * np.pi * 38 * d)))
d = t(0.05); salvar(S + "tic.wav", np.sin(2 * np.pi * 2200 * d) * env(len(d), 0.0005, 0.008))
d = t(4.0); x = np.zeros(len(d))
for k in range(int(4 * 18)):
    i0 = int(SR * k / 18); n = int(SR * 0.012); x[i0:i0 + n] += r(n) * 0.6
salvar(S + "projetor.wav", pb(x, 0.4) + pb(r(len(d)), 0.02) * 0.6)
d = t(1.0); salvar(S + "rangido.wav", pb(np.sign(np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(2 * np.pi * 1.3 * d)) / SR)), 0.1) * np.sin(np.pi * d) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * d)))
d = t(1.0); x = np.zeros(len(d))
for k in range(10):
    i0 = int(SR * (0.03 + rng.random() * 0.8)); tt = t(0.25)
    m = sum(np.sin(2 * np.pi * f * tt) for f in (3000 + rng.random() * 1500, 5200 + rng.random() * 800)) * np.exp(-tt * 18)
    x[i0:i0 + len(m)] += m[: len(x) - i0]
salvar(S + "moedas.wav", x)
d = t(0.8); salvar(S + "shh.wav", pa(r(len(d)), 0.5) * np.sin(np.pi * d / 0.8) ** 0.8)
d = t(2.5); motor = np.zeros(len(d))
for k in range(int(2.5 * 11)):
    i0 = int(SR * k / 11); tt = t(0.07); motor[i0:i0 + len(tt)] += np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 40)
salvar(S + "motor.wav", motor + pb(r(len(d)), 0.03) * 0.5)
d = t(1.2); salvar(S + "lapis.wav", pa(pb(r(len(d)), 0.5), 0.1) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 6 * d))))
d = t(0.2); salvar(S + "aperto.wav", pb(r(len(d)), 0.35) * env(len(d), 0.002, 0.03))
d = t(0.5); salvar(S + "notas.wav", pa(r(len(d)), 0.2) * np.abs(np.sin(2 * np.pi * 9 * d)) * np.sin(np.pi * d / 0.5))
d = t(1.2); kc = pb(r(len(d)), 0.5) * env(len(d), 0.001, 0.03)
kc[int(SR * 0.12):] += (np.sin(2 * np.pi * 1568 * d) + 0.6 * np.sin(2 * np.pi * 2093 * d))[: len(d) - int(SR * 0.12)] * np.exp(-d[: len(d) - int(SR * 0.12)] * 3)
salvar(S + "kaching.wav", kc)
d = t(2.0); x = np.zeros(len(d))
for k in range(14):
    i0 = int(SR * rng.random() * 1.8); tt = t(0.08); f0 = 400 + rng.random() * 600
    x[i0:i0 + len(tt)] += np.sin(2 * np.pi * np.cumsum(f0 + 2500 * tt) / SR) * np.sin(np.pi * tt / 0.08)
salvar(S + "bolhas.wav", x)
d = t(0.25); salvar(S + "nhac.wav", pb(r(len(d)), 0.4) * env(len(d), 0.001, 0.03) + np.sin(2 * np.pi * 180 * d) * env(len(d), 0.001, 0.05))
d = t(0.5); salvar(S + "puf.wav", pb(r(len(d)), 0.12) * env(len(d), 0.005, 0.12))
d = t(0.25); salvar(S + "flip.wav", pa(r(len(d)), 0.3) * np.sin(np.pi * d / 0.25) * np.abs(np.sin(2 * np.pi * 20 * d)))
d = t(1.6); ap = sum(np.sin(2 * np.pi * f * d) for f in (hz(74), hz(77), hz(81)))
salvar(S + "apito.wav", (ap + pb(r(len(d)), 0.2) * 0.4) * np.minimum(1, d / 0.08) * np.minimum(1, (1.6 - d) / 0.3))
d = t(0.6); f0 = 140 - 30 * d
salvar(S + "ahem.wav", pb(np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)), 0.15) * np.where(d < 0.2, np.sin(np.pi * d / 0.2), np.sin(np.pi * np.clip((d - 0.25) / 0.35, 0, 1))) + pb(r(len(d)), 0.3) * 0.1)
d = t(3.0); x = np.zeros(len(d))
for k in range(9):
    i0 = int(SR * (0.1 + k * 0.33)); tt = t(0.12)
    x[i0:i0 + len(tt)] += np.sin(2 * np.pi * 4600 * tt) * (np.sin(2 * np.pi * 60 * tt) > 0) * np.sin(np.pi * tt / 0.12)
salvar(S + "grilo.wav", x, 0.5)
d = t(1.2); x = np.zeros(len(d))
for k in range(4):
    i0 = int(SR * k * 0.25); tt = t(0.04); x[i0:i0 + len(tt)] += np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 120)
salvar(S + "relogio.wav", x + pa(r(len(d)), 0.3) * np.exp(-((d - 1.0) ** 2) / 0.005) * 0.4)
print("ok")
