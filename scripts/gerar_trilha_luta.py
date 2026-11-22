"""Trilha de luta sintetizada: 140 BPM, Lá menor, tambores graves + baixo pulsante + stabs.
Uso: python3 scripts/gerar_trilha_luta.py public/musica/trilha-luta.wav [segundos]
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 140
BEAT = 60 / BPM
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 16.0
n = int(SR * dur)
mix = np.zeros(n)
rng = np.random.default_rng(7)


def nota(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= n:
        return
    sig = sig[: n - i]
    mix[i : i + len(sig)] += sig * g


def tambor(f0=70, d=0.5):
    t = np.arange(int(SR * d)) / SR
    f = f0 + f0 * 1.5 * np.exp(-t * 25)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    ruido = rng.standard_normal(len(t)) * np.exp(-t * 40) * 0.3
    return s + ruido


def caixa():
    t = np.arange(int(SR * 0.2)) / SR
    r = rng.standard_normal(len(t))
    r = np.diff(np.concatenate([[0], r]))
    return (r * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t * 22)


def baixo(freq, d):
    t = np.arange(int(SR * d)) / SR
    saw = 2 * ((freq * t) % 1) - 1
    env = np.exp(-t * 6) * np.minimum(1, t * 300)
    # "lowpass" barato: média móvel
    k = 24
    saw = np.convolve(saw, np.ones(k) / k, mode="same")
    return saw * env


def stab(freqs, d=0.25):
    t = np.arange(int(SR * d)) / SR
    s = sum(np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * 2 * t) * 0.2 for f in freqs)
    return s * np.exp(-t * 12) * np.minimum(1, t * 500)


raizes = [45, 45, 41, 43]  # A A F G
acordes = [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
t = 0.0
c = 0
while t < dur:
    r = raizes[c % 4]
    for i in range(16):
        tt = t + i * BEAT / 4
        add(baixo(nota(r + (12 if i % 4 == 2 else 0)), BEAT / 4), tt, 0.28)
    for b in range(4):
        add(tambor(62 if b % 2 == 0 else 80), t + b * BEAT, 0.6)
        if b in (1, 3):
            add(caixa(), t + b * BEAT, 0.4)
    add(tambor(55, 0.7), t + 3.5 * BEAT, 0.5)
    add(stab([nota(m) for m in acordes[c % 4]]), t, 0.35)
    add(stab([nota(m) for m in acordes[c % 4]]), t + 1.5 * BEAT, 0.25)
    t += 4 * BEAT
    c += 1

fade = int(SR * 0.3)
mix[:fade] *= np.linspace(0, 1, fade)
mix[-fade * 2 :] *= np.linspace(1, 0, fade * 2)
mix = np.tanh(mix * 1.2)
mix = mix / np.max(np.abs(mix)) * 0.85
st = np.stack([mix, np.roll(mix, 180) * 0.95], axis=1)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", sys.argv[1])
