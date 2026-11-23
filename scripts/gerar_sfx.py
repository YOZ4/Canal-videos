"""Gera efeitos sonoros sintetizados extras em public/sfx/ (determinístico, sem internet).
   python3 scripts/gerar_sfx.py
 passo.wav      passo leve de corrida (tênis no asfalto)
 pisada.wav     pisada pesada (graves + estalo) — corrida brutal
 racha.wav      chão rachando (estalos secos em sequência)
 deslize.wav    freada/derrapagem (ruído filtrado que some)
 vento.wav      deslocamento rápido (whoosh grave e longo)
 lamina.wav     lâmina cortando o ar (agudo metálico)
"""
import wave, numpy as np, os
SR = 48000
rng = np.random.default_rng(7)
def salvar(nome, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    os.makedirs("public/sfx", exist_ok=True)
    with wave.open(f"public/sfx/{nome}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def t(d): return np.arange(int(SR * d)) / SR
def env(n, ataque, queda):
    a = np.minimum(1, np.arange(n) / max(1, int(SR * ataque)))
    return a * np.exp(-np.arange(n) / (SR * queda))
def passa_baixa(x, a):  # filtro de 1 polo simples
    y = np.zeros_like(x); v = 0.0
    a = np.broadcast_to(np.asarray(a, dtype=float), x.shape)
    for i in range(len(x)): v += a[i] * (x[i] - v); y[i] = v
    return y
# passo leve
d = t(0.12); r = rng.standard_normal(len(d))
salvar("passo", passa_baixa(r, 0.25) * env(len(d), 0.002, 0.025) + np.sin(2 * np.pi * 95 * d) * env(len(d), 0.001, 0.03) * 0.6)
# pisada pesada
d = t(0.55); r = rng.standard_normal(len(d))
grave = np.sin(2 * np.pi * (70 - 30 * d) * d) * env(len(d), 0.002, 0.16)
estalo = passa_baixa(r, 0.6) * env(len(d), 0.001, 0.02)
salvar("pisada", grave * 1.0 + estalo * 0.7 + passa_baixa(r, 0.05) * env(len(d), 0.01, 0.2) * 0.6)
# racha
d = t(0.5); x = np.zeros(len(d))
for k in range(9):
    i = int(SR * (0.02 + 0.05 * k + rng.random() * 0.02))
    n = int(SR * 0.03); x[i:i + n] += rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * 0.006)) * (1 - k / 11)
salvar("racha", passa_baixa(x, 0.5))
# deslize
d = t(0.7); r = rng.standard_normal(len(d))
salvar("deslize", passa_baixa(r, 0.12) * env(len(d), 0.03, 0.25) * (1 + 0.3 * np.sin(2 * np.pi * 23 * d)))
# vento
d = t(0.5); r = rng.standard_normal(len(d))
e = np.sin(np.pi * np.minimum(1, d / 0.5)) ** 2
salvar("vento", passa_baixa(r, 0.04 + 0.08 * e) * e)
# lamina
d = t(0.4); r = rng.standard_normal(len(d))
salvar("lamina", (passa_baixa(r, 0.9) - passa_baixa(r, 0.3)) * np.sin(np.pi * np.minimum(1, d / 0.25)) * np.exp(-d * 6) + np.sin(2 * np.pi * 2400 * d) * np.exp(-d * 14) * 0.15)
print("ok")
