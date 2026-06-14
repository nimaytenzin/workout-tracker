#!/usr/bin/env python3
"""Generate PNG PWA icons for iOS home screen and manifest."""

from pathlib import Path

from PIL import Image, ImageDraw

BG = "#1a1f2e"
ACCENT = "#863bff"
ACCENT_SOFT = "#2a2040"


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)

    margin = round(size * 0.12)
    draw.rectangle(
        [margin, margin, size - margin, size - margin],
        fill=ACCENT_SOFT,
    )

    cx, cy = size // 2, size // 2
    s = size / 512

    # Lightning bolt (matches favicon motif)
    bolt = [
        (cx + 40 * s, cy + 90 * s),
        (cx - 70 * s, cy - 10 * s),
        (cx - 5 * s, cy - 10 * s),
        (cx - 50 * s, cy - 110 * s),
        (cx + 85 * s, cy + 25 * s),
        (cx + 15 * s, cy + 25 * s),
    ]
    draw.polygon(bolt, fill=ACCENT)

    return img


def main() -> None:
    out = Path(__file__).resolve().parent.parent / "public"
    for name, size in [
        ("apple-touch-icon.png", 180),
        ("pwa-192.png", 192),
        ("pwa-512.png", 512),
    ]:
        draw_icon(size).save(out / name, format="PNG", optimize=True)
        print(f"Wrote {out / name}")


if __name__ == "__main__":
    main()
