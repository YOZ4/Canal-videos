"""Trilha e efeitos do "Experimento de Asch" (tudo sintetizado, determinístico).
Uso: python3 scripts/gerar_asch_audio.py
Saída: public/musica/asch.wav (79,8 s, mapa de música do roteiro, já ABAIXA ~50% sob a narração) e public/sfx/as-*.wav
  0–46,1 s  tensa: piano grave em Ré menor + relógio; para em 45,2 (e some no silêncio súbito de 30,2)
  46,1–67,8 drone grave de mistério (luz azul)
  67,8–79,8 suave e esperançosa (Ré maior); termina no tique-taque pro loop
"""
import subprocess
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(51)


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


def lp(x, k):
    k = max(1, int(k))
    return np.convolve(x, np.ones(k) / k, mode="same")


def nota(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def piano(m, d=1.6, g=1.0):
    f = nota(m)
    tt = t(d)
    s = np.sin(2 * np.pi * f * tt) + 0.45 * np.sin(4 * np.pi * f * tt) + 0.18 * np.sin(6 * np.pi * f * tt) + 0.06 * np.sin(8 * np.pi * f * tt)
    return s * env(len(tt), 0.005, d * 0.35) * g


# ---------------- música ----------------
DUR = 79.8
N = int(SR * DUR)
mix = np.zeros(N)


def add(sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    mix[i : i + len(sig)] += sig * g


def tique(g=1.0, agudo=True):
    n = int(SR * 0.05)
    s = rng.uniform(-1, 1, n) * env(n, 0.0005, 0.006)
    s = s - lp(s, 6)
    tom = np.sin(2 * np.pi * (2400 if agudo else 1700) * t(0.05)) * env(n, 0.0005, 0.01)
    return (s * 0.6 + tom * 0.5) * g


# 1) tensa: Ré menor, piano grave em ostinato (colcheias pontuadas) + pedal grave; relógio por baixo
BPM = 84
B = 60 / BPM
OST = [50, 53, 57, 53, 50, 52, 53, 52]  # D F A F D E F E (grave)
k = 0
x = 0.0
while x < 45.2:
    if not (30.2 <= x < 31.9):  # silêncio súbito
        add(piano(OST[k % len(OST)], 1.4, 0.5), x)
        if k % 8 == 0:
            add(piano(38, 3.2, 0.8), x)  # pedal Ré grave
        if k % 16 == 12 and x > 20:
            add(piano(65 if (k // 16) % 2 else 64, 1.8, 0.28), x)  # nota aguda que incomoda
    x += B / 2
    k += 1
# relógio (tique-taque) por baixo de toda a parte tensa
x = 0.25
i = 0
while x < 45.0:
    if not (30.2 <= x < 31.9):
        add(tique(0.12, i % 2 == 0), x)
    x += 0.5
    i += 1

# 2) drone de mistério 46,1–67,8
dd = 67.8 - 46.1
tt = t(dd)
dr = np.sin(2 * np.pi * 36.7 * tt) + 0.6 * np.sin(2 * np.pi * 55.0 * tt + np.sin(2 * np.pi * 0.11 * tt)) + 0.25 * np.sin(2 * np.pi * 73.4 * tt)
ruido = lp(rng.uniform(-1, 1, len(tt)), 400) * 3
dr = (dr * 0.5 + ruido * 0.25) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * tt))
ent = np.minimum(1, tt / 2.0) * np.minimum(1, (dd - tt) / 1.5)
add(dr * ent, 46.1, 0.55)
for s0 in [50.0, 55.5, 61.0, 65.0]:  # sininhos raros
    add(piano(81, 2.5, 0.12), s0)

# 3) esperançosa 67,8–79,8: Ré maior, arpejo suave
ARP = [62, 66, 69, 74, 69, 66]
ACORDES = [[50, 57, 62], [47, 54, 59], [43, 50, 55], [45, 52, 57]]  # D Bm G A
x = 67.9
k = 0
while x < 78.2:
    add(piano(ARP[k % len(ARP)], 1.6, 0.32), x)
    if k % 6 == 0:
        for m in ACORDES[(k // 6) % len(ACORDES)]:
            add(piano(m, 3.0, 0.22), x)
    x += 0.36
    k += 1
# fim: tique-taque (o mesmo do começo) pro loop
x = 78.5
i = 0
while x < 79.75:
    add(tique(0.18, i % 2 == 0), x)
    x += 0.5
    i += 1

# ducking: abaixa ~50% onde a narração fala (envelope do áudio real)
try:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/narracao/asch.mp3", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    voz = np.frombuffer(raw, np.int16).astype(float) / 32768
    voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]
    e = lp(np.abs(voz), int(SR * 0.15))
    fala = np.clip(e / (np.percentile(e, 90) * 0.5), 0, 1)
    fala = lp(fala, int(SR * 0.25))
    mix *= 1 - 0.5 * fala
except Exception as ex:  # sem ffmpeg: sem ducking
    print("sem ducking:", ex)
salvar("public/musica/asch.wav", mix, 0.8)

# ---------------- efeitos ----------------
# papel (cartões levantando, em cascata): 7 farfalhadas curtas
n = int(SR * 0.6)
pap = np.zeros(n)
for j in range(7):
    i0 = int(SR * (0.02 + j * 0.05 + rng.uniform(0, 0.015)))
    m = int(SR * 0.09)
    r = rng.uniform(-1, 1, m) * env(m, 0.004, 0.03)
    r = r - lp(r, 3)
    pap[i0 : i0 + m] += r[: n - i0] * (0.8 + 0.2 * rng.random())
salvar("public/sfx/as-papel.wav", pap, 0.7)

# whoosh grave
d = 1.1
tt = t(d)
w = lp(rng.uniform(-1, 1, len(tt)), 60) * np.sin(np.pi * np.minimum(1, tt / d)) ** 2
w += 0.4 * np.sin(2 * np.pi * (90 - 40 * tt) * tt) * np.exp(-tt * 2)
salvar("public/sfx/as-whoosh-grave.wav", w, 0.8)

# tic da piscada
tic = np.sin(2 * np.pi * 1900 * t(0.04)) * env(int(SR * 0.04), 0.001, 0.008)
salvar("public/sfx/as-tic.wav", tic, 0.6)

# risadinha (3 "he" nasais curtos subindo)
ri = np.zeros(int(SR * 0.9))
for j, f0 in enumerate([310, 340, 370, 330]):
    i0 = int(SR * j * 0.17)
    m = int(SR * 0.12)
    tt = t(0.12)
    s = np.sign(np.sin(2 * np.pi * f0 * tt)) * 0.3 + np.sin(2 * np.pi * f0 * 2 * tt) * 0.4
    s = lp(s + rng.uniform(-0.3, 0.3, m), 8) * np.sin(np.pi * tt / 0.12)
    ri[i0 : i0 + m] += s
salvar("public/sfx/as-risadinha.wav", ri, 0.6)

# relógio (tique-taque 5 s)
rel = np.zeros(int(SR * 5))
for j in range(10):
    s = tique(1.0, j % 2 == 0)
    i0 = int(SR * j * 0.5)
    rel[i0 : i0 + len(s)] += s
salvar("public/sfx/as-relogio.wav", rel, 0.7)

# giz (traço riscando 0,7 s)
d = 0.7
tt = t(d)
gz = rng.uniform(-1, 1, len(tt))
gz = gz - lp(gz, 4)
gz *= (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 23 * tt))) * np.sin(np.pi * tt / d) ** 0.5
salvar("public/sfx/as-giz.wav", gz, 0.5)

# cadeiras rangendo (3 rangidos)
ca = np.zeros(int(SR * 1.4))
for j, (f0, f1) in enumerate([(220, 340), (180, 260), (260, 310)]):
    d = 0.35
    tt = t(d)
    fr = f0 + (f1 - f0) * tt / d
    s = np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 37 * tt))
    s = lp(s, 5) * np.sin(np.pi * tt / d)
    i0 = int(SR * (0.05 + j * 0.33))
    ca[i0 : i0 + len(s)] += s * (0.9 - j * 0.15)
salvar("public/sfx/as-cadeiras.wav", ca, 0.6)


def batida(g=1.0):
    d = 0.18
    tt = t(d)
    return (np.sin(2 * np.pi * (58 - 20 * tt) * tt) * env(len(tt), 0.003, 0.05)) * g


# batimento cardíaco (lub-dub, 72 bpm, 5 s)
co = np.zeros(int(SR * 5))
x = 0.0
while x < 4.8:
    i0 = int(SR * x)
    for off, g in [(0, 1.0), (0.16, 0.7)]:
        s = batida(g)
        j0 = i0 + int(SR * off)
        co[j0 : j0 + len(s)] += s[: len(co) - j0]
    x += 60 / 72
salvar("public/sfx/as-coracao.wav", co, 0.9)

# batimento acelerando (72 → 150 bpm) e PARA no fim (4,8 s: 38,2 → 43,0)
co2 = np.zeros(int(SR * 4.8))
x = 0.0
while x < 4.75:
    bpm = 72 + (150 - 72) * (x / 4.8) ** 1.4
    i0 = int(SR * x)
    for off, g in [(0, 1.0), (0.13, 0.7)]:
        s = batida(g)
        j0 = i0 + int(SR * off)
        if j0 < len(co2):
            co2[j0 : j0 + len(s)] += s[: len(co2) - j0]
    x += 60 / bpm
salvar("public/sfx/as-coracao-rapido.wav", co2, 0.9)

# cochicho (ruído de "sss" e "chh" em sílabas)
d = 1.3
tt = t(d)
ch = rng.uniform(-1, 1, len(tt))
ch = ch - lp(ch, 3)
silabas = 0.5 + 0.5 * np.sin(2 * np.pi * 5.5 * tt) ** 2
ch *= silabas * np.minimum(1, tt / 0.05) * np.minimum(1, (d - tt) / 0.2)
salvar("public/sfx/as-cochicho.wav", ch, 0.5)

# carimbo (pancada seca)
d = 0.25
tt = t(d)
cb = np.sin(2 * np.pi * (140 - 60 * tt) * tt) * env(len(tt), 0.001, 0.04) + rng.uniform(-1, 1, len(tt)) * env(len(tt), 0.0005, 0.01) * 0.6
salvar("public/sfx/as-carimbo.wav", cb, 0.8)

# risadas abafadas (grupo, 2,5 s, passado por passa-baixa forte)
d = 2.5
rs = np.zeros(int(SR * d))
for j in range(14):
    f0 = rng.uniform(180, 320)
    i0 = int(SR * rng.uniform(0, d - 0.3))
    m = int(SR * 0.15)
    tt = t(0.15)
    s = np.sign(np.sin(2 * np.pi * f0 * tt)) * np.sin(np.pi * tt / 0.15)
    rs[i0 : i0 + m] += s * rng.uniform(0.4, 1)
rs = lp(lp(rs, 30), 30) * np.minimum(1, np.arange(len(rs)) / (SR * 0.3)) * np.minimum(1, (len(rs) - np.arange(len(rs))) / (SR * 0.6))
salvar("public/sfx/as-risadas.wav", rs, 0.6)

# pop grave
d = 0.25
tt = t(d)
pg = np.sin(2 * np.pi * (180 - 300 * tt) * tt) * env(len(tt), 0.001, 0.05)
salvar("public/sfx/as-pop-grave.wav", pg, 0.8)

# acorde positivo (Ré maior brilhante)
ac = np.zeros(int(SR * 2.5))
for j, m in enumerate([62, 66, 69, 74, 78]):
    s = piano(m, 2.4, 0.6)
    i0 = int(SR * j * 0.04)
    ac[i0 : i0 + len(s)] += s[: len(ac) - i0]
salvar("public/sfx/as-acorde.wav", ac, 0.7)
print("ok: public/musica/asch.wav + public/sfx/as-*.wav")
