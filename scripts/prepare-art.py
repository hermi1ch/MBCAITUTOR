#!/usr/bin/env python3
"""Slice 小信 expressions and build a garden plate without a second boy."""

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


def build_garden() -> None:
    """Use the right-hand pavilion/pond from the hero so the plate has no center seam."""
    hero = Image.open(HERO).convert("RGB")
    w, h = hero.size
    garden = hero.crop((int(w * 0.70), 0, w, h))
    garden.save(SRC / "garden.jpg", "JPEG", quality=90)
    print(f"wrote garden.jpg {garden.size}")


if __name__ == "__main__":
    slice_expressions()
    build_garden()
