#!/bin/sh
# Tira de revisão: TODOS os quadros (ou N por segundo) de um trecho, lado a lado, com o tempo escrito.
#   sh scripts/tira.sh out/x.mp4 2.0 2.8 saida.jpg [fps=30] [recorte]
# recorte (opcional) = "L:A:x0:y0:x1:y1": janela de L×A px que anda em linha reta de (x0,y0) a (x1,y1)
#   durante o trecho — serve para seguir um pé, uma mão ou um objeto que se move (ex.: medir pé escorregando).
#   Para um recorte parado, repita o ponto: "500:400:300:1300:300:1300".
set -e
IN="$1"; T0="$2"; T1="$3"; OUT="$4"; FPS="${5:-30}"; REC="$6"
[ -n "$OUT" ] || { echo "uso: sh scripts/tira.sh video.mp4 t0 t1 saida.jpg [fps] [L:A:x0:y0:x1:y1]" >&2; exit 1; }
D=$(echo "$T1 $T0" | awk '{print $1-$2}')
N=$(echo "$D $FPS" | awk '{n=int($1*$2+0.5); if(n<1)n=1; print n}')
COLS=6; [ "$N" -lt 6 ] && COLS=$N
ROWS=$(( (N + COLS - 1) / COLS ))
if [ -n "$REC" ]; then
  L=$(echo "$REC" | cut -d: -f1); A=$(echo "$REC" | cut -d: -f2)
  X0=$(echo "$REC" | cut -d: -f3); Y0=$(echo "$REC" | cut -d: -f4)
  X1=$(echo "$REC" | cut -d: -f5); Y1=$(echo "$REC" | cut -d: -f6)
  CROP="crop=$L:$A:'$X0-$L/2+($X1-$X0)*t/$D':'$Y0-$A/2+($Y1-$Y0)*t/$D',"
  W=300
else
  CROP=""; W=240
fi
ffmpeg -hide_banner -loglevel error -y -ss "$T0" -t "$D" -i "$IN" \
  -vf "fps=$FPS,${CROP}scale=$W:-1,drawtext=text='%{pts\:flt\:$T0}s':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,tile=${COLS}x${ROWS}:padding=4:color=white" \
  -frames:v 1 -update 1 "$OUT"
echo "tira: $OUT ($N quadros, $COLS colunas)"
