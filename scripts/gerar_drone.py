"""Drone de explicação: grave contínuo + pulsos eletrônicos. Uso: gerar_drone.py saida.wav segundos"""
import sys, wave
import numpy as np
SR = 44100
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 26
t = np.arange(int(SR * dur)) / SR
d = 0.35 * np.sin(2 * np.pi * 55 * t) + 0.2 * np.sin(2 * np.pi * 82.5 * t + 0.4 * np.sin(2 * np.pi * 0.2 * t)) + 0.12 * np.sin(2 * np.pi * 110 * t)
d *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.25 * t)
pulso = np.zeros_like(t)
beat = 60 / 100
for k in np.arange(0, dur, beat / 2):
    i = int(k * SR)
    n = int(0.12 * SR)
    if i + n < len(t):
        tt = np.arange(n) / SR
        f = 880 if int(k / (beat / 2)) % 4 == 0 else 660
        pulso[i : i + n] += 0.18 * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 30)
mix = d + pulso
fade = int(SR * 0.5)
mix[:fade] *= np.linspace(0, 1, fade)
mix[-fade:] *= np.linspace(1, 0, fade)
mix = mix / np.max(np.abs(mix)) * 0.8
st = np.stack([mix, np.roll(mix, 300) * 0.95], axis=1)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok")
