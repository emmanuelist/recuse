#!/usr/bin/env bash
# Generates the music bed.
#
# Synthesised rather than sourced: no licensing question on a submission and
# nothing to attribute. Deliberately not music - no melody, no rhythm, no
# progression. A drone on a perfect fifth that should be felt, not noticed.
#
# Movement comes from DETUNING, not tremolo: two sines a fraction of a hertz
# apart beat against each other at exactly that difference, which gives cycles
# far slower than the tremolo filter allows (its floor is 0.1 Hz).
set -euo pipefail
cd "$(dirname "$0")/.."
DUR="${1:-180}"
OUT=film/music.mp3
mkdir -p film
FADE=$(( DUR > 14 ? DUR - 7 : DUR ))

ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=55:duration=$DUR"     `# A1 root` \
  -f lavfi -i "sine=frequency=55.07:duration=$DUR"  `# beats at 0.07 Hz, a 14s swell` \
  -f lavfi -i "sine=frequency=82.41:duration=$DUR"  `# E2, a fifth` \
  -f lavfi -i "sine=frequency=82.52:duration=$DUR"  `# beats at 0.11 Hz` \
  -f lavfi -i "sine=frequency=110:duration=$DUR"    `# A2, weight` \
  -f lavfi -i "sine=frequency=164.81:duration=$DUR" `# E3, the only near-audible pitch` \
  -filter_complex "\
    [0:a]volume=0.46[a0];[1:a]volume=0.46[a1]; \
    [2:a]volume=0.30[a2];[3:a]volume=0.30[a3]; \
    [4:a]volume=0.15[a4];[5:a]volume=0.05[a5]; \
    [a0][a1][a2][a3][a4][a5]amix=inputs=6:normalize=0[m]; \
    [m]lowpass=f=520,highpass=f=38,\
       aecho=0.8:0.85:520|1150:0.28|0.16,\
       afade=t=in:st=0:d=6,afade=t=out:st=$FADE:d=7,\
       loudnorm=I=-24:TP=-9:LRA=5[out]" \
  -map "[out]" -c:a libmp3lame -b:a 160k "$OUT"

d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
printf "  %s  (%.1fs)\n" "$OUT" "$d"
ffmpeg -hide_banner -i "$OUT" -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume" | sed 's/.*] /  /'
echo "  Listen before committing. A bed that gets noticed has failed."
