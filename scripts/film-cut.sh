#!/usr/bin/env bash
# Assembles the recorded segments into one cut.
#
# Playwright writes a randomly-named .webm per context, so we glob each dir.
# FILM_XFADE sets the crossfade between segments in seconds; 0 gives hard cuts.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=film
XF="${FILM_XFADE:-0.5}"
[ -d "$OUT" ] || { echo "No $OUT/ - run: npm run film"; exit 1; }

echo "Normalising segments"
i=0
: > "$OUT/list.txt"
for dir in "$OUT"/[0-9]*; do
  [ -d "$dir" ] || continue
  src=$(find "$dir" -name '*.webm' | head -1)
  [ -n "$src" ] || { echo "  ! no video in $dir"; continue; }
  dst="$OUT/norm-$(printf %02d $i).mp4"
  # Playwright starts recording when the CONTEXT is created, before any
  # navigation, so every segment opens on white about:blank. Trim exactly the
  # setup the film recorded, leaving only painted picture.
  trim=$(python3 -c "
import json
try: print(json.load(open('$OUT/setup.json')).get('$(basename "$dir")', 1.6))
except Exception: print(1.6)")
  ffmpeg -y -loglevel error -ss "$trim" -i "$src" \
    -vf "fps=30,scale=1440:900:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -crf 18 -an "$dst"
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dst")
  printf "  %-22s %6.1fs\n" "$(basename "$dir")" "$dur"
  echo "file '$(basename "$dst")'" >> "$OUT/list.txt"
  i=$((i+1))
done

if [ "$(python3 -c "print(1 if float('$XF') > 0 else 0)")" = "1" ] && [ "$i" -gt 1 ]; then
  echo "Crossfading (${XF}s)"
  # xfade OVERLAPS clips, so each transition shortens the film. The manifest
  # below records each segment's post-transition contribution, and voice pads to
  # that, so the narration cannot drift away from the picture.
  python3 - "$OUT" "$XF" <<'PYEOF'
import json, os, subprocess, sys
out, xf = sys.argv[1], float(sys.argv[2])
norm = sorted(f for f in os.listdir(out) if f.startswith("norm-"))
dur = [float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
       "-of","csv=p=0", os.path.join(out,f)], capture_output=True, text=True).stdout)
       for f in norm]
inputs, filt, prev, off = [], [], "[0:v]", 0.0
for f in norm: inputs += ["-i", os.path.join(out, f)]
for n in range(1, len(norm)):
    off += dur[n-1] - xf
    lab = f"[v{n}]" if n < len(norm)-1 else "[out]"
    filt.append(f"{prev}[{n}:v]xfade=transition=fade:duration={xf}:offset={off:.3f}{lab}")
    prev = lab
graph = ";".join(filt)
subprocess.run(["ffmpeg","-y","-loglevel","error", *inputs,
                "-filter_complex", graph, "-map", "[out]",
                "-c:v","libx264","-preset","slow","-crf","18",
                os.path.join(out,"recuse-silent.mp4")], check=True)
segs = sorted(d for d in os.listdir(out) if d[0].isdigit() and os.path.isdir(os.path.join(out,d)))
m = {s: round(d - (xf if i < len(norm)-1 else 0), 3) for i,(s,d) in enumerate(zip(segs,dur))}
json.dump(m, open(os.path.join(out,"segments.json"),"w"), indent=2)
print("  manifest: " + ", ".join(f"{k} {v:.1f}s" for k,v in m.items()))
PYEOF
else
  python3 - "$OUT" <<'PYEOF'
import json, os, subprocess, sys
out = sys.argv[1]
segs = sorted(d for d in os.listdir(out) if d[0].isdigit() and os.path.isdir(os.path.join(out,d)))
norm = sorted(f for f in os.listdir(out) if f.startswith("norm-"))
m = {}
for seg, n in zip(segs, norm):
    d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",
                        os.path.join(out, n)], capture_output=True, text=True).stdout.strip()
    m[seg] = round(float(d), 3)
json.dump(m, open(os.path.join(out, "segments.json"), "w"), indent=2)
print("  manifest: " + ", ".join(f"{k} {v:.1f}s" for k, v in m.items()))
PYEOF
  echo "Concatenating"
  ffmpeg -y -loglevel error -f concat -safe 0 -i "$OUT/list.txt" -c copy "$OUT/recuse-silent.mp4"
fi

d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/recuse-silent.mp4")
printf "\n  %s  (%.1fs)\n" "$OUT/recuse-silent.mp4" "$d"
echo "  Next: npm run voice && npm run film:mix"
