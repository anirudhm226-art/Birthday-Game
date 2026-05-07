"""Analyze the checkerboard pattern to find exact colors and tile size."""
from PIL import Image
import numpy as np

img = Image.open(r'c:\Priyanshi Game\Assets\Falling Assets\Heart.png').convert('RGBA')
px = np.array(img)
h, w = px.shape[:2]

# Sample the top-left corner (guaranteed to be checkerboard)
print(f"Image size: {w}x{h}")
print("\nTop-left 30x30 pixel colors (R,G,B,A):")
for y in range(min(20, h)):
    row_str = ""
    for x in range(min(30, w)):
        r, g, b, a = px[y, x]
        if a < 128:
            row_str += " . "
        elif r > 240 and g > 240 and b > 240:
            row_str += " W "
        elif 180 < r < 220 and 180 < g < 220 and 180 < b < 220:
            row_str += " G "
        else:
            row_str += " X "
    print(f"y={y:3d}: {row_str}")

# Get the exact two most common colors in the first row
print("\n\nExact colors in first 5 rows:")
from collections import Counter
colors = Counter()
for y in range(5):
    for x in range(w):
        r, g, b, a = px[y, x]
        if a > 128:
            colors[(r, g, b)] += 1

for color, count in colors.most_common(10):
    print(f"  RGB{color}: {count} pixels")

# Detect tile size by checking when the color alternates
print("\n\nRow 0 color transitions (first 60 pixels):")
prev = None
run_start = 0
for x in range(min(60, w)):
    r, g, b, a = px[0, x]
    key = 'W' if (r > 240 and g > 240 and b > 240) else ('G' if (180 < r < 220) else 'O')
    if key != prev and prev is not None:
        print(f"  {prev} from x={run_start} to x={x-1} (length {x - run_start})")
        run_start = x
    prev = key
print(f"  {prev} from x={run_start} to x={min(59, w-1)}")
