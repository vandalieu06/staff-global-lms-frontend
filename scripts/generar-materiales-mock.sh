#!/usr/bin/env bash
# Genera los materiales de muestra del prototipo en public/mock/materiales/ (spec 04).
# Requisitos: chromium (o google-chrome) y ffmpeg con libx264 y libmp3lame.
# Uso: ./scripts/generar-materiales-mock.sh
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
fuentes="$raiz/scripts/materiales"
salida="$raiz/public/mock/materiales"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

chrome="$(command -v chromium || command -v google-chrome || command -v google-chrome-stable || true)"
[[ -n "$chrome" ]] || { echo "Falta chromium o google-chrome" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "Falta ffmpeg" >&2; exit 1; }

mkdir -p "$salida"
headless=("$chrome" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files)

# PDF: HTML A4 impreso por Chrome.
for nombre in cap-1-procedimiento-operativo cap-2-prevencion-riesgos; do
  "${headless[@]}" --no-pdf-header-footer --print-to-pdf="$salida/$nombre.pdf" \
    "file://$fuentes/$nombre.html" 2>/dev/null
done

# Infografías: captura PNG de 1080×1350.
for nombre in cap-1-fichajes-globalapp cap-2-datos-personales; do
  "${headless[@]}" --window-size=1080,1350 --screenshot="$tmp/$nombre.png" \
    "file://$fuentes/$nombre.html" 2>/dev/null
  # Recomprime para que pese poco.
  ffmpeg -loglevel error -y -i "$tmp/$nombre.png" -compression_level 9 "$salida/$nombre.png"
done

# Vídeos: tarjeta de título de 20 s con barra de avance y un tono suave.
duracion=20
for nombre in cap-1-reporting-diario cap-2-aplicar-tester; do
  "${headless[@]}" --window-size=1280,720 --screenshot="$tmp/$nombre.png" \
    "file://$fuentes/tarjeta-$nombre.html" 2>/dev/null
  ffmpeg -loglevel error -y \
    -loop 1 -framerate 15 -i "$tmp/$nombre.png" \
    -f lavfi -i "sine=frequency=262:sample_rate=44100:duration=$duracion" \
    -filter_complex "[0:v]drawbox=x=0:y=ih-14:w=iw*t/$duracion:h=14:color=white@0.85:t=fill,format=yuv420p[v];[1:a]volume=0.12,afade=t=in:d=1,afade=t=out:st=$((duracion - 1)):d=1[a]" \
    -map "[v]" -map "[a]" -t "$duracion" \
    -c:v libx264 -preset slow -tune stillimage -crf 30 -movflags +faststart \
    -c:a aac -b:a 64k "$salida/$nombre.mp4"
done

# Audios: 20 s de tono con fundidos (marca de posición audible).
for nombre in cap-1-incidencias cap-2-marco-publicitario; do
  ffmpeg -loglevel error -y \
    -f lavfi -i "sine=frequency=330:sample_rate=44100:duration=$duracion" \
    -af "volume=0.12,afade=t=in:d=1,afade=t=out:st=$((duracion - 1)):d=1" \
    -c:a libmp3lame -b:a 64k "$salida/$nombre.mp3"
done

echo "Materiales generados en $salida:"
ls -l "$salida" | awk 'NR > 1 { printf "  %-40s %8d bytes\n", $9, $5 }'
du -sh "$salida" | awk '{ print "Total: " $1 }'
