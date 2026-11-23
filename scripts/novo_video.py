"""Cria a estrutura de um vídeo novo do canal a partir de narração + roteiro.

Uso:
  python3 scripts/novo_video.py <NomeDoVideo> <audio.mp3> <roteiro.txt>

Faz:
  1. copia o áudio para public/narracao/<slug>.mp3 e o roteiro para roteiros/<slug>.txt
  2. alinha roteiro x áudio -> src/videos/<Nome>/alinhamento.json
  3. cria src/videos/<Nome>/tempo.ts (T, TF, LEGENDAS) e <Nome>.tsx (esqueleto com 1 cena por frase)
  4. gera trilha leve do tamanho do áudio (public/musica/trilha-<slug>.wav)
  5. registra a composição em src/Root.tsx
"""
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata

if len(sys.argv) < 4:
    print(__doc__)
    sys.exit(1)

nome, audio, roteiro = sys.argv[1], sys.argv[2], sys.argv[3]
if not re.match(r"^[A-Z][A-Za-z0-9]+$", nome):
    sys.exit("Nome deve ser PascalCase, ex.: Cacadores2")
slug = re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFD", nome).encode("ascii", "ignore").decode().lower()).strip("-")
raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pasta = os.path.join(raiz, "src", "videos", nome)
if os.path.exists(pasta):
    sys.exit(f"Já existe: {pasta}")

os.makedirs(os.path.join(raiz, "public", "narracao"), exist_ok=True)
os.makedirs(os.path.join(raiz, "roteiros"), exist_ok=True)
os.makedirs(pasta)
mp3 = os.path.join(raiz, "public", "narracao", f"{slug}.mp3")
txt = os.path.join(raiz, "roteiros", f"{slug}.txt")
if audio.lower().endswith(".mp3"):
    shutil.copy(audio, mp3)
else:
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", audio, "-b:a", "192k", mp3], check=True)
shutil.copy(roteiro, txt)

# 2. alinhamento
alin = os.path.join(pasta, "alinhamento.json")
subprocess.run([sys.executable, os.path.join(raiz, "scripts", "alinhar.py"), mp3, txt, alin], check=True)
dados = json.load(open(alin, encoding="utf-8"))
dur = dados["duracao"]

# 3. tempo.ts (reaproveita o do Cacadores, trocando só os destaques)
modelo = open(os.path.join(raiz, "src", "videos", "Cacadores", "tempo.ts"), encoding="utf-8").read()
modelo = re.sub(r'const DESTAQUES = new Set\(\n\s*".*?"\.split\(\n\s*" ",\n\s*\),\n\);', 'const DESTAQUES = new Set(\n  // palavras (sem acento, minúsculas) que aparecem em laranja na legenda — edite à vontade\n  "".split(" ").filter(Boolean),\n);', modelo, flags=re.S)
open(os.path.join(pasta, "tempo.ts"), "w", encoding="utf-8").write(modelo)

# frases -> cenas iniciais
frases = []
atual = []
for p in dados["palavras"]:
    atual.append(p["w"])
    if re.search(r'[.?!]["”]?$', p["w"]):
        frases.append(" ".join(atual))
        atual = []
if atual:
    frases.append(" ".join(atual))


def inicio(frase):
    palavras = [w for w in re.findall(r"\S+", frase)][:3]
    return " ".join(re.sub(r'["“”(),:;!?.…]', "", w) for w in palavras)


cenas = []
for i, fr in enumerate(frases):
    cenas.append((f"C{i + 1:02d}", inicio(fr), fr))

linhas_cenas = []
for i, (cid, ini, fr) in enumerate(cenas):
    linhas_cenas.append(
        f'''// "{fr.replace('"', "'")}"
const {cid}: React.FC<{{ t0: number }}> = () => {{
  const f = useCurrentFrame();
  return (
    <Palco cam={{{{ x: 560, y: 1000, zoom: k(f, [[0, 1], [90, 1.08]]) }}}}>
      <Praca camX={{600}} />
      <Boneco2D id="{cid.lower()}" d={{LUCAS}} pose={{frente(560)}} rosto={{vivo(ROSTO_BASE, f, "{cid.lower()}")}} />
    </Palco>
  );
}};
'''
    )

lista = "\n".join(f'  [{cid}, {"0" if i == 0 else f"T({json.dumps(ini, ensure_ascii=False)})"}],' for i, (cid, ini, _) in enumerate(cenas))
principal = f'''import {{ AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame }} from "remotion";
import {{ Boneco2D, ROSTO_BASE }} from "../../estilo2d/Boneco2D";
import {{ Praca }} from "../../estilo2d/Cenario2D";
import {{ k }} from "../../estilo2d/anim";
import {{ LUCAS }} from "../../estilo2d/personagens";
import {{ LegendaPalavra }} from "../../estilo2d/UI";
import {{ Palco, frente, vivo }} from "../Cacadores/comum";
import {{ DURACAO, LEGENDAS, T }} from "./tempo";

export {{ DURACAO }};

// ===== cenas (esqueleto: 1 por frase — substitua pelo conteúdo de cada uma) =====
{"".join(linhas_cenas)}
/** [componente, frame em que a cena começa] — T("trecho") = quando o trecho é falado */
const CENAS: [React.FC<{{ t0: number }}>, number][] = [
{lista}
];

export const {nome}: React.FC = () => (
  <AbsoluteFill style={{{{ background: "#000" }}}}>
    {{CENAS.map(([Cena, de], i) => {{
      const ate = i + 1 < CENAS.length ? CENAS[i + 1][1] : DURACAO;
      return (
        <Sequence key={{i}} from={{de}} durationInFrames={{Math.max(1, ate - de)}}>
          <Cena t0={{de}} />
        </Sequence>
      );
    }})}}
    <LegendaPalavra palavras={{LEGENDAS}} />
    <Html5Audio src={{staticFile("narracao/{slug}.mp3")}} volume={{1}} />
    <Html5Audio
      src={{staticFile("musica/trilha-{slug}.wav")}}
      volume={{(f) => interpolate(f, [0, 20, DURACAO - 30, DURACAO], [0, 0.1, 0.1, 0], {{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }})}}
    />
  </AbsoluteFill>
);
'''
open(os.path.join(pasta, f"{nome}.tsx"), "w", encoding="utf-8").write(principal)

# 4. trilha
subprocess.run([sys.executable, os.path.join(raiz, "scripts", "gerar_trilha.py"), os.path.join(raiz, "public", "musica", f"trilha-{slug}.wav"), str(round(dur + 2))], check=True)

# 5. Root.tsx
root_p = os.path.join(raiz, "src", "Root.tsx")
root = open(root_p, encoding="utf-8").read()
imp = f'import {{ {nome}, DURACAO as DUR_{nome.upper()} }} from "./videos/{nome}/{nome}";\n'
root = root.replace('import { Composition } from "remotion";\n', 'import { Composition } from "remotion";\n' + imp, 1)
comp = f'      <Composition id="{nome}" component={{{nome}}} durationInFrames={{DUR_{nome.upper()}}} fps={{30}} width={{1080}} height={{1920}} />\n'
root = root.replace("    <>\n", "    <>\n" + comp, 1)
open(root_p, "w", encoding="utf-8").write(root)

print(f"\nPronto: src/videos/{nome}/ ({len(cenas)} cenas, {dur:.1f}s)")
print(f"Prévia:  npx remotion studio   |   Render: npx remotion render {nome} out/{slug}.mp4 --browser-executable=...")
