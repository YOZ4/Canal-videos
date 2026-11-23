"""Trilha e efeitos do episódio "Egito: a areia molhada" (tudo sintetizado, determinístico).
Uso: python3 scripts/gerar_egito_audio.py
Saída: public/musica/egito.wav (75,6 s com as 4 partes do mapa de música) e public/sfx/eg-*.wav
Escala: Ré "hijaz" (frígio dominante) — soa egípcio sem copiar nenhuma música.
"""
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def salvar(caminho, x, ganho=0.9):
    x = np.asarray(x, float)
    pico = np.max(np.abs(x)) or 1
    x = (x / pico * ganho * 32767).astype(np.int16)
    with wave.open(caminho, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(x.tobytes())


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, ataque, queda):
    a = max(1, int(SR * ataque))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    return e * np.exp(-np.arange(n) / (SR * queda))


def passa_baixa(x, a):
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def lp_rapido(x, k):
    # média móvel (rápido) como passa-baixa
    k = max(1, int(k))
    return np.convolve(x, np.ones(k) / k, mode="same")


def nota(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------- música ----------------
DUR = 75.6
N = int(SR * DUR)
mix = np.zeros(N)
BPM = 104
B = 60 / BPM
# Ré hijaz: D Eb F# G A Bb C
ESC = [62, 63, 66, 67, 69, 70, 72, 74]


def add(sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    mix[i : i + len(sig)] += sig * g


def oud(f, d=0.5):
    # corda dedilhada (Karplus-Strong simplificado)
    n = int(SR * d)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * env(n, 0.002, d * 0.6)


def doum(d=0.35):
    tt = t(d)
    f = 70 * np.exp(-tt * 9) + 48
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.16)


def tek(d=0.12):
    x = rng.uniform(-1, 1, int(SR * d))
    x = x - lp_rapido(x, 6)
    return x * env(len(x), 0.001, 0.03)


def drone(d, f=73.4):
    tt = t(d)
    x = np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.5 * tt) + 0.3 * np.sin(2 * np.pi * f * 2.005 * tt)
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * tt)
    return x


# ritmo maqsum simplificado: D t t D t D t (em colcheias)
PADRAO = [("D", 0), ("t", 0.5), ("t", 1.5), ("D", 2), ("t", 2.5), ("D", 3), ("t", 3.5)]
MELODIA = [0, 1, 2, 1, 3, 2, 1, 0, 4, 3, 2, 1, 2, 1, 0, 0]


def parte_animada(t0, t1, ganho=1.0, sobe=False):
    compasso = 4 * B
    k = 0
    tt = t0
    while tt < t1 - 0.01:
        g = ganho * (1 + (0.6 * (tt - t0) / max(1, t1 - t0) if sobe else 0))
        for tipo, pos in PADRAO:
            add(doum() if tipo == "D" else tek(), tt + pos * B, (0.9 if tipo == "D" else 0.35) * g)
        # melodia de oud: 2 notas por compasso, variando
        for j in range(4):
            idx = MELODIA[(k * 4 + j) % len(MELODIA)]
            if (k + j) % 3 == 2:
                continue
            add(oud(nota(ESC[idx]), 0.45), tt + j * B, 0.22 * g)
        # baixo
        add(oud(nota(ESC[0] - 24), 0.9), tt, 0.25 * g)
        k += 1
        tt += compasso


parte_animada(0, 45.05)
# mistério: drone grave + sininhos raros
add(drone(14.6) * env(int(SR * 14.6), 0.8, 60), 45.05, 0.5)
for i, tt in enumerate([46.5, 49.8, 53.1, 56.8]):
    add(oud(nota(ESC[[4, 5, 2, 1][i]] + 12), 1.2), tt, 0.12)
parte_animada(59.4, 68.3, 1.0, sobe=True)
# vitória: acorde brilhante em 64,8
for m in [62, 66, 69, 74]:
    add(oud(nota(m + 12), 1.5), 64.8, 0.18)
# final misterioso que emenda no começo
add(drone(7.3, 73.4) * env(int(SR * 7.3), 0.6, 30), 68.3, 0.35)
for tt in [69.0, 71.2, 73.4]:
    add(oud(nota(ESC[1] + 12), 1.0), tt, 0.1)
# fade bem curto no fim (o loop recomeça animado)
mix[-int(SR * 0.3) :] *= np.linspace(1, 0, int(SR * 0.3))
salvar("public/musica/egito.wav", mix, 0.8)

# ---------------- efeitos ----------------
# água caindo (2 s, dá pra repetir): ruído chiado com gorgolejo
x = rng.uniform(-1, 1, int(SR * 2.0))
x = x - lp_rapido(x, 3)
x = lp_rapido(x, 2)
gorg = np.sin(2 * np.pi * 9 * t(2.0)) * 0.3 + 0.7
salvar("public/sfx/eg-agua.wav", x * gorg * env(len(x), 0.05, 50), 0.6)

# splash grande
d = 0.9
x = rng.uniform(-1, 1, int(SR * d))
x = lp_rapido(x, 3) * env(len(x), 0.002, 0.25)
x += np.sin(2 * np.pi * np.cumsum(220 * np.exp(-t(d) * 6) + 60) / SR) * env(len(x), 0.001, 0.08) * 0.6
salvar("public/sfx/eg-splash.wav", x)

# glub de lama: bolha grave subindo
d = 0.45
f = 90 + 260 * (t(d) / d) ** 2
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(int(SR * d), 0.01, 0.15)
salvar("public/sfx/eg-glub.wav", x)

# afundando: tom descendo + chiado
d = 1.2
f = 300 * np.exp(-t(d) * 2.2) + 50
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(int(SR * d), 0.02, 0.6)
x += lp_rapido(rng.uniform(-1, 1, int(SR * d)), 20) * 0.6 * env(int(SR * d), 0.05, 0.5)
salvar("public/sfx/eg-afunda.wav", x)

# boing (risadinha de desenho)
d = 0.5
f = 330 + 180 * np.sin(2 * np.pi * 9 * t(d)) * np.exp(-t(d) * 4)
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(int(SR * d), 0.005, 0.2)
salvar("public/sfx/eg-boing.wav", x)

# tick de contador
d = 0.04
x = np.sin(2 * np.pi * 2400 * t(d)) * env(int(SR * d), 0.0005, 0.008)
salvar("public/sfx/eg-tick.wav", x, 0.7)

# wah-wah (trombone triste): 3 notas descendo com vibrato
partes = []
for m, dd in [(58, 0.32), (57, 0.32), (56, 0.8)]:
    tt = t(dd)
    fr = nota(m) * (1 + 0.012 * np.sin(2 * np.pi * 6 * tt))
    s = np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(fr) / SR)
    s = lp_rapido(s, 12) * env(len(tt), 0.03, dd * 0.9) * (0.5 + 0.5 * np.minimum(1, tt / 0.12))
    partes.append(s)
salvar("public/sfx/eg-wahwah.wav", np.concatenate(partes))

# areia raspando (3 s, loop): ruído grave pulsando com a puxada
d = 3.0
x = lp_rapido(rng.uniform(-1, 1, int(SR * d)), 6)
x *= 0.55 + 0.45 * np.abs(np.sin(np.pi * t(d) / 1.0))
salvar("public/sfx/eg-areia.wav", x, 0.5)

# carimbo: pancada seca + madeira
d = 0.35
x = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t(d) * 18) + 70) / SR) * env(int(SR * d), 0.001, 0.07)
x += lp_rapido(rng.uniform(-1, 1, int(SR * d)), 4) * env(int(SR * d), 0.001, 0.02) * 0.8
salvar("public/sfx/eg-carimbo.wav", x)

# grito com eco: pancada grave + repetições abafadas (o grito em si é a narração)
d = 1.4
base = np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t(d) * 10) + 55) / SR) * env(int(SR * d), 0.001, 0.12)
x = base.copy()
for k, g in [(0.18, 0.5), (0.36, 0.28), (0.54, 0.15)]:
    i = int(SR * k)
    x[i:] += base[: len(x) - i] * g
salvar("public/sfx/eg-eco.wav", x)
print("ok")
