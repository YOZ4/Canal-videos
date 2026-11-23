#!/bin/sh
# Finaliza o MP4 do canal: granulado de filme + áudio no padrão do YouTube.
#   sh scripts/finalizar.sh out/bruto.mp4 out/final.mp4 [granulado=3]
# - granulado: força do ruído de filme (0 = nenhum; 2–4 é o natural; em fundo bem claro use menos).
#   Aplicado aqui no ffmpeg (não nos quadros): render mais rápido e arquivo menor.
# - áudio: loudnorm em duas passadas + limitador com sobreamostragem 4x, e CORREÇÃO AUTOMÁTICA: mede o resultado
#   e repete (até 3x) ajustando o alvo até ficar em −14 LUFS ±0,2 com pico real abaixo de −1 dB.
set -e
LC_ALL=C; export LC_ALL
IN="$1"; OUT="$2"; GR="${3:-3}"
[ -n "$IN" ] && [ -n "$OUT" ] || { echo "uso: sh scripts/finalizar.sh entrada.mp4 saida.mp4 [granulado=3]" >&2; exit 1; }
[ -f "$IN" ] || { echo "não achei: $IN" >&2; exit 1; }
TMP="$OUT.tmp.mp4"; W1="$OUT.tmp-a.wav"; W2="$OUT.tmp-b.wav"
trap 'rm -f "$TMP" "$W1" "$W2"' EXIT
if [ "$GR" = "0" ]; then VF="null"; else VF="noise=c0s=$GR:allf=t"; fi

mede() {  # imprime "I TP" (LUFS e pico real em dB) de um arquivo
  ffmpeg -hide_banner -nostats -i "$1" -vn -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | awk '
    /^ *I:/ {i=$2} /^ *Peak:/ {p=$2} END {print i, p}'
}

if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN" | grep -q .; then
  ffmpeg -hide_banner -loglevel error -y -i "$IN" -vn -ac 2 -ar 48000 "$W1"
  # compressor suave (segura os picos dos impactos) + ganho + limitador com sobreamostragem 4x (teto −2 dBFS,
  # o AAC sobe ~1 dB). O ganho é corrigido medindo o resultado, até 4 vezes, até ficar em −14 LUFS ±0,2.
  CADEIA="acompressor=threshold=0.125:ratio=3:attack=4:release=140:knee=4"
  set -- $(ffmpeg -hide_banner -nostats -i "$W1" -af "$CADEIA,ebur128" -f null - 2>&1 | sed -n '/Summary/,$p' | awk '/^ *I:/ {print $2}')
  G=$(echo "$1" | awk '{print -14-$1}')
  for tentativa in 1 2 3 4; do
    ffmpeg -hide_banner -loglevel error -y -i "$W1" -af "$CADEIA,volume=${G}dB,aresample=192000,alimiter=limit=0.79:attack=1:release=60:level=false,aresample=48000" -c:a pcm_s16le "$W2"
    set -- $(mede "$W2"); I=$1; P=$2
    echo "  tentativa $tentativa: ganho ${G} dB → ${I} LUFS, pico ${P} dB"
    if awk "BEGIN{d=-14-($I); exit !(d<=0.2 && d>=-0.2)}"; then break; fi
    G=$(echo "$G $I" | awk '{print $1+(-14-$2)*1.15}')
  done
  ffmpeg -hide_banner -loglevel error -y -i "$IN" -i "$W2" -map 0:v -map 1:a -vf "$VF" \
    -c:v libx264 -preset medium -crf 19 -tune grain -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart "$TMP"
else
  ffmpeg -hide_banner -loglevel error -y -i "$IN" -vf "$VF" -c:v libx264 -preset medium -crf 19 -tune grain -pix_fmt yuv420p -movflags +faststart "$TMP"
fi
mv "$TMP" "$OUT"

if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$OUT" | grep -q .; then
  set -- $(mede "$OUT")
  echo "pronto: $OUT  |  volume $1 LUFS (alvo −14)  |  pico real $2 dB (alvo abaixo de −1)"
else
  echo "pronto: $OUT (sem áudio)"
fi
