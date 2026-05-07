from PIL import Image
import numpy as np
from collections import deque
import os, sys

def is_checker(r, g, b, a):
    if a < 128:
        return True
    is_white = r > 240 and g > 240 and b > 240
    is_gray = (185 < r < 220) and (185 < g < 220) and (185 < b < 220) and abs(int(r)-int(g)) < 12 and abs(int(g)-int(b)) < 12
    return is_white or is_gray

def process(path):
    img = Image.open(path).convert('RGBA')
    px = np.array(img)
    h, w = px.shape[:2]
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()

    # Seed edges
    for x in range(w):
        for y in [0, h-1]:
            if is_checker(px[y,x,0], px[y,x,1], px[y,x,2], px[y,x,3]):
                queue.append((y, x))
                visited[y, x] = True
    for y in range(h):
        for x in [0, w-1]:
            if not visited[y, x] and is_checker(px[y,x,0], px[y,x,1], px[y,x,2], px[y,x,3]):
                queue.append((y, x))
                visited[y, x] = True

    count = 0
    while queue:
        cy, cx = queue.popleft()
        px[cy, cx, 3] = 0
        count += 1
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = cy+dy, cx+dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                visited[ny, nx] = True
                if is_checker(px[ny,nx,0], px[ny,nx,1], px[ny,nx,2], px[ny,nx,3]):
                    queue.append((ny, nx))

    result = Image.fromarray(px)
    result.save(path)
    sys.stdout.write(f"  {path}: removed {count} pixels\n")
    sys.stdout.flush()

folder = r'c:\Priyanshi Game\Assets\Falling Assets'
for f in ['Heart.png', 'Grapes.png', 'Cheesecake.png', 'Angry Dog.png']:
    p = os.path.join(folder, f)
    sys.stdout.write(f"Processing {f}...\n")
    sys.stdout.flush()
    process(p)

sys.stdout.write("Done!\n")
sys.stdout.flush()
