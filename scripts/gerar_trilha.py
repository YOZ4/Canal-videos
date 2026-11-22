"""Gera uma trilha de fundo simples (sintetizada) para os vídeos.
Uso: python3 scripts/gerar_trilha.py public/musica/trilha-leve.wav [segundos]
Estilo: pop/lo-fi animado, 120 BPM, Dó maior (C - G - Am - F).
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 16.0
n = int(SR * dur)
mix = np.zeros(n)


def nota(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def add(sig, t0, ganho=1.0):
    i = int(t0 * SR)
    if i >= n:
        return
    sig = sig[: n - i]
    mix[i : i + len(sig)] += sig * ganho


def pluck(freq, d=0.35):
    t = np.arange(int(SR * d)) / SR
    env = np.exp(-t * 9)
    s = 0.6 * np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t) + 0.1 * np.sin(2 * np.pi * freq * 3 * t)
    return s * env * np.minimum(1, t * 400)


def baixo(freq, d=0.45):
    t = np.arange(int(SR * d)) / SR
    env = np.exp(-t * 3) * np.minimum(1, t * 200)
    tri = 2 * np.abs(2 * ((freq * t) % 1) - 1) - 1
    return tri * env


def bumbo():
    t = np.arange(int(SR * 0.3)) / SR
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)


rng = np.random.default_rng(3)


def chimbal():
    t = np.arange(int(SR * 0.06)) / SR
    ruido = rng.standard_normal(len(t))
    ruido = np.diff(np.concatenate([[0], ruido]))  # "highpass" simples
    return ruido * np.exp(-t * 70) * 0.5


def palma():
    t = np.arange(int(SR * 0.15)) / SR
    ruido = rng.standard_normal(len(t))
    return ruido * np.exp(-t * 30) * 0.4


# C, G, Am, F  (acordes em MIDI)
acordes = [
    [60, 64, 67, 72],
    [55, 59, 62, 67],
    [57, 60, 64, 69],
    [53, 57, 60, 65],
]
raizes = [36, 31, 33, 29]
padrao_arpejo = [0, 1, 2, 3, 2, 1, 2, 3]

compasso = 4 * BEAT
c = 0
t = 0.0
while t < dur:
    ac = acordes[c % 4]
    for i, idx in enumerate(padrao_arpejo):
        add(pluck(nota(ac[idx] + 12 * (i == 3))), t + i * BEAT / 2, 0.22)
    for b in range(4):
        add(baixo(nota(raizes[c % 4] + (12 if b == 2 else 0))), t + b * BEAT, 0.35)
        if b in (0, 2):
            add(bumbo(), t + b * BEAT, 0.55)
        if b in (1, 3):
            add(palma(), t + b * BEAT, 0.35)
        add(chimbal(), t + b * BEAT + BEAT / 2, 0.35)
    t += compasso
    c += 1

# fade in/out e normalização
fade = int(SR * 0.4)
mix[:fade] *= np.linspace(0, 1, fade)
mix[-fade * 2 :] *= np.linspace(1, 0, fade * 2)
mix = mix / np.max(np.abs(mix)) * 0.85
estereo = np.stack([mix, np.roll(mix, 220) * 0.96], axis=1)
dados = (estereo * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(dados.tobytes())
print("ok", sys.argv[1], dur, "s")
