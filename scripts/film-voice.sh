#!/usr/bin/env bash
# Lays narration over the cut. Video is the master: audio is padded with
# silence or trimmed so the two end together and nothing drifts.
set -euo pipefail
cd "$(dirname "$0")/.."
AUDIO="${1:-}"
[ -n "$AUDIO" ] && [ -f "$AUDIO" ] || { echo "usage: npm run film:voice -- path/to/voice.m4a"; exit 1; }
V=film/recuse-silent.mp4
[ -f "$V" ] || { echo "No $V — run npm run film:cut first"; exit 1; }

vd=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
ad=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO")
printf "video %.1fs   narration %.1fs\n" "$vd" "$ad"

ffmpeg -y -loglevel error -i "$V" -i "$AUDIO" \
  -filter_complex "[1:a]afftdn=nf=-25,highpass=f=90,acompressor=threshold=-18dB:ratio=3:attack=8:release=180,loudnorm=I=-16:TP=-1.5:LRA=11,apad[a]" \
  -map 0:v -map "[a]" -shortest \
  -c:v copy -c:a aac -b:a 192k film/recuse-demo.mp4

d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 film/recuse-demo.mp4)
printf "\n  film/recuse-demo.mp4  (%.1fs)\n" "$d"
echo "  Light denoise, high-pass, compression and broadcast loudness applied."
