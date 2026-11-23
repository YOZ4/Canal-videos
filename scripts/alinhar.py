"""Alinha um roteiro (texto) com a narração (áudio) sem transcrição automática.
Detecta trechos de fala pelas pausas e distribui as palavras do roteiro entre eles
por programação dinâmica (duração esperada ~ nº de letras; pausas preferem pontuação).
Saída: JSON com [{"w": palavra, "s": inicio_seg, "e": fim_seg}, ...]
Uso: python3 scripts/alinhar.py audio.mp3 roteiro.txt saida.json
"""
import json
import re
import subprocess
import sys

import numpy as np

audio, texto, saida = sys.argv[1:4]
SR = 16000
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", audio, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(float) / 32768
hop = int(SR * 0.01)
e = np.array([np.sqrt(np.mean(a[i : i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
db = 20 * np.log10(e + 1e-9)
fala = db > -38
# suaviza: fecha buracos < 0.15s
min_gap = 15
i = 0
segs = []
n = len(fala)
while i < n:
    if fala[i]:
        j = i
        while j < n and fala[j]:
            j += 1
        segs.append([i, j])
        i = j
    else:
        i += 1
merged = []
for s in segs:
    if merged and s[0] - merged[-1][1] < min_gap:
        merged[-1][1] = s[1]
    else:
        merged.append(s)
merged = [s for s in merged if s[1] - s[0] >= 6]
segs = [(s[0] / 100, s[1] / 100) for s in merged]

palavras = re.findall(r"\S+", open(texto, encoding="utf-8").read())
peso = [max(1, len(re.sub(r"[^\wÀ-ú]", "", w))) + 1 for w in palavras]
pont = [1 if re.search(r"[.?!:,;…\"]$", w) else 0 for w in palavras]
fim_frase = [1 if re.search(r"[.?!\"]$", w) else 0 for w in palavras]
total_fala = sum(b - a_ for a_, b in segs)
taxa = total_fala / sum(peso)
W, S = len(palavras), len(segs)
cum = np.concatenate([[0], np.cumsum(peso)])
INF = 1e18
dp = np.full((S + 1, W + 1), INF)
prev = np.zeros((S + 1, W + 1), dtype=int)
dp[0][0] = 0
for s in range(1, S + 1):
    dur = segs[s - 1][1] - segs[s - 1][0]
    for j in range(1, W + 1):
        best = INF
        bi = 0
        lo = max(s - 1, j - 60)
        for i0 in range(lo, j):
            if dp[s - 1][i0] >= INF:
                continue
            esperado = (cum[j] - cum[i0]) * taxa
            custo = ((dur - esperado) / max(0.25, dur)) ** 2
            # fim do trecho sem pontuação é penalizado
            if not pont[j - 1]:
                custo += 0.6
            elif fim_frase[j - 1]:
                custo -= 0.15
            c = dp[s - 1][i0] + custo
            if c < best:
                best, bi = c, i0
        dp[s][j] = best
        prev[s][j] = bi
# volta
res = []
j = W
cortes = []
for s in range(S, 0, -1):
    i0 = prev[s][j]
    cortes.append((s - 1, i0, j))
    j = i0
cortes.reverse()
for s, i0, j in cortes:
    a_, b = segs[s]
    tot = cum[j] - cum[i0]
    t = a_
    for k in range(i0, j):
        d = (b - a_) * peso[k] / tot
        res.append({"w": palavras[k], "s": round(t, 3), "e": round(t + d, 3)})
        t += d
json.dump({"duracao": len(a) / SR, "trechos": segs, "palavras": res}, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("trechos:", S, "palavras:", W, "taxa s/letra:", round(taxa, 4))
