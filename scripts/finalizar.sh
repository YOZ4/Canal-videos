#!/bin/sh
# Finaliza o MP4 do canal: granulado de filme + áudio no padrão do YouTube.
#   sh scripts/finalizar.sh out/bruto.mp4 out/final.mp4 [granulado=3]
# - granulado: força do ruído de filme (0 = nenhum; 2–4 é o natural; em fundo bem claro use menos).
#   Ele é aplicado aqui, no ffmpeg, e não desenhado nos quadros: o render fica mais rápido e o arquivo menor.
# - áudio: loudnorm em DUAS passadas até −14 LUFS (pico real −1,2 dB) + limitador com sobreamostragem 4x
#   (a codificação AAC cria picos entre amostras que o loudnorm não enxerga). No fim mostra o resultado medido.
set -e
LC_ALL=C; export LC_ALL
IN="$1"; OUT="$2"; GR="${3:-3}"
[ -n "$IN" ] && [ -n "$OUT" ] || { echo "uso: sh scripts/finalizar.sh entrada.mp4 saida.mp4 [granulado=3]" >&2; exit 1; }
[ -f "$IN" ] || { echo "não achei: $IN" >&2; exit 1; }
TMP="$OUT.tmp.mp4"

if [ "$GR" = "0" ]; then VF="null"; else VF="noise=c0s=$GR:allf=t"; fi

if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN" | grep -q .; then
  # passada 1: medir
  M=$(ffmpeg -hide_banner -nostats -i "$IN" -vn -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  val() { echo "$M" | sed -n "s/.*\"$1\" : \"\([^\"]*\)\".*/\1/p"; }
  MI=$(val input_i); MTP=$(val input_tp); MLRA=$(val input_lra); MTH=$(val input_thresh); OFF=$(val target_offset)
  AF="loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$MI:measured_TP=$MTP:measured_LRA=$MLRA:measured_thresh=$MTH:offset=$OFF:linear=true,aresample=192000,alimiter=limit=0.83:attack=1:release=50:level=false,aresample=48000"
  ffmpeg -hide_banner -loglevel error -y -i "$IN" -vf "$VF" -af "$AF" \
    -c:v libx264 -preset medium -crf 19 -tune grain -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$TMP"
else
  ffmpeg -hide_banner -loglevel error -y -i "$IN" -vf "$VF" -c:v libx264 -preset medium -crf 19 -tune grain -pix_fmt yuv420p -movflags +faststart "$TMP"
fi
mv "$TMP" "$OUT"

if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$OUT" | grep -q .; then
  R=$(ffmpeg -hide_banner -nostats -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p')
  I=$(echo "$R" | sed -n 's/^ *I: *\(-\{0,1\}[0-9.]*\) LUFS/\1/p' | head -1)
  P=$(echo "$R" | sed -n 's/^ *Peak: *\(-\{0,1\}[0-9.]*\) dBFS/\1/p' | head -1)
  echo "pronto: $OUT  |  volume ${I} LUFS (alvo −14)  |  pico real ${P} dB (alvo abaixo de −1)"
else
  echo "pronto: $OUT (sem áudio)"
fi
