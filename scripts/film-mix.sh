#!/usr/bin/env bash
# Final mix: picture + narration + bed.
#
# The bed is ducked under the voice by a sidechain compressor keyed off the
# narration, so it recedes whenever anyone is speaking and returns in the gaps.
# Video is the master; audio is padded or trimmed to it.
set -euo pipefail
cd "$(dirname "$0")/.."
V=film/recuse-silent.mp4
N=film/narration.mp3
M=film/music.mp3
[ -f "$V" ] || { echo "No $V - run npm run film && npm run film:cut"; exit 1; }
[ -f "$N" ] || { echo "No $N - run npm run voice"; exit 1; }

vd=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
[ -f "$M" ] || { echo "No bed yet, generating one to match ${vd%.*}s"; bash scripts/film-music.sh "${vd%.*}"; }

echo "Mixing"
ffmpeg -y -loglevel error -i "$V" -i "$N" -i "$M" \
  -filter_complex "\
    [1:a]afftdn=nf=-26,highpass=f=88,acompressor=threshold=-18dB:ratio=3:attack=8:release=180,\
         loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=0:${vd}[v0]; \
    [v0]asplit=2[voice][key]; \
    [2:a]apad,atrim=0:${vd}[bedraw]; \
    [bedraw][key]sidechaincompress=threshold=0.09:ratio=3.2:attack=25:release=520:makeup=1[bed]; \
    [voice][bed]amix=inputs=2:normalize=0:weights=1 0.85,\
         loudnorm=I=-15:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -shortest -c:v copy -c:a aac -b:a 192k film/recuse-demo.mp4

d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 film/recuse-demo.mp4)
printf "\n  film/recuse-demo.mp4  (%.0f:%02.0f)\n" "$(echo "$d/60" | bc)" "$(echo "$d%60" | bc)"
echo "  Voice normalised to -16 LUFS, bed ducked beneath it, mix at -15 LUFS."
