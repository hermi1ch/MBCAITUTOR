#!/usr/bin/env python3
"""Slice 小信 expressions and build a full garden plate without a second boy."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "character"
EXPRESSIONS = SRC / "expressions.png"
HERO = SRC / "hero.png"
POSES = ("idle", "talking", "nod", "think", "explain")


def is_studio_cream(r: int, g: int, b: int, a: int) -> bool:
    if a < 8:
        return True
    # Studio plate is warm cream, not peach skin and not gold trim.
    return r >= 228 and g >= 218 and b >= 198 and (r + g + b) >= 680 and abs(r - g) <= 28


def flood_key(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pix = img.load()
    w, h = img.size
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not seen[y * w + x]:
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = pix[x, y]
        if not is_studio_cream(r, g, b, a):
            continue
        pix[x, y] = (0, 0, 0, 0)
        push(x + 1, y)
        push(x - 1, y)
        push(x, y + 1)
        push(x, y - 1)
        push(x + 1, y + 1)
        push(x - 1, y - 1)
        push(x + 1, y - 1)
        push(x - 1, y + 1)
    return img


def slice_expressions() -> None:
    sheet = Image.open(EXPRESSIONS).convert("RGBA")
    w, h = sheet.size
    col_w = w / 5
    # Right inset is larger on "think" to drop the next pose's hand;
    # smaller on "explain" so the bamboo book stays in frame.
    insets = {
        "idle": (0.04, 0.06),
        "talking": (0.04, 0.06),
        "nod": (0.04, 0.06),
        "think": (0.04, 0.18),
        "explain": (0.05, 0.01),
    }
    for i, name in enumerate(POSES):
        left_in, right_in = insets[name]
        left = int(round(i * col_w + col_w * left_in))
        right = int(round((i + 1) * col_w - col_w * right_in))
        pose = drop_studio_floor(flood_key(sheet.crop((left, 0, right, h))))
        if name == "think":
            tw, th = pose.size
            pose = pose.crop((0, 0, max(1, tw - 16), th))
        pose.save(SRC / f"{name}.png", "PNG")
        print(f"wrote {name}.png {pose.size}")


def drop_studio_floor(img: Image.Image) -> Image.Image:
    """The expressions plate has a pale oval under the shoes — key that out."""
    pix = img.load()
    w, h = img.size
    for y in range(int(h * 0.78), h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a < 8:
                continue
            pale = r > 188 and g > 180 and b > 168 and abs(r - g) < 28 and abs(g - b) < 28
            if pale:
                pix[x, y] = (0, 0, 0, 0)
    return img


def boy_mask(hero_bgr):
    import cv2
    import numpy as np

    h, w = hero_bgr.shape[:2]
    rect = (int(w * 0.28), int(h * 0.04), int(w * 0.42), int(h * 0.96))
    mask = np.zeros((h, w), np.uint8)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(hero_bgr, mask, rect, bgd, fgd, 5, cv2.GC_INIT_WITH_RECT)
    boy = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype("uint8")
    n, labels, stats, _ = cv2.connectedComponentsWithStats(boy, 8)
    if n > 1:
        largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        boy = np.where(labels == largest, 255, 0).astype("uint8")
    boy = cv2.dilate(boy, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (71, 71)))
    shift = np.zeros_like(boy)
    shift[:, 40:] = boy[:, :-40]
    return cv2.bitwise_or(boy, shift)


def build_garden() -> None:
    """Full hero garden with 小信 removed so the pose sprite can stand on the path."""
    import cv2
    import numpy as np

    hero = cv2.imread(str(HERO))
    if hero is None:
        raise SystemExit(f"missing {HERO}")
    boy = boy_mask(hero)
    h, w = hero.shape[:2]
    out = hero.copy()
    for y in range(h):
        marked = boy[y] > 0
        if not marked.any():
            continue
        xs = np.where(marked)[0]
        x0, x1 = int(xs.min()), int(xs.max())
        xl, xr = x0 - 2, x1 + 2
        if xl < 0 or xr >= w:
            continue
        left = out[y, xl].astype(np.float32)
        right = out[y, xr].astype(np.float32)
        span = max(1, xr - xl)
        t = ((np.arange(x0, x1 + 1) - xl) / span).astype(np.float32)
        out[y, x0 : x1 + 1] = (1 - t)[:, None] * left + t[:, None] * right
    blur = cv2.GaussianBlur(out, (31, 31), 0)
    out[boy.astype(bool)] = blur[boy.astype(bool)]
    cv2.imwrite(str(SRC / "garden.jpg"), out, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print(f"wrote garden.jpg {w}x{h}")


if __name__ == "__main__":
    slice_expressions()
    build_garden()
