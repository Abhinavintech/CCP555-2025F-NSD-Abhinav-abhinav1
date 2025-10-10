#!/usr/bin/env python3
"""
Simple utility to convert .txt 'screenshot' files into PNG images.
Saves PNG files next to the .txt files with the same basename.

Usage:
  python3 Labs/fragments/scripts/txt_to_png.py

This script uses Pillow. Install with:
  python3 -m pip install --user pillow
"""
import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except Exception as e:
    print("Pillow is required. Install with: python3 -m pip install --user pillow")
    raise

BASE = Path(__file__).resolve().parents[1] / "docs" / "screenshots"
if not BASE.exists():
    print(f"Screenshots directory not found: {BASE}")
    raise SystemExit(1)

FONT = None
# Try to load a truetype monospace font if available, else fall back to default
try:
    FONT = ImageFont.truetype("DejaVuSansMono.ttf", 14)
except Exception:
    try:
        FONT = ImageFont.truetype("Courier_New.ttf", 14)
    except Exception:
        FONT = ImageFont.load_default()

for txt in sorted(BASE.glob("*.txt")):
    print(f"Rendering {txt.name} -> PNG")
    s = txt.read_text(encoding="utf8")
    # Strip leading/trailing code fences if present
    s = s.strip()
    if s.startswith("```") and s.endswith("```"):
        # remove first and last fence lines
        parts = s.splitlines()
        if len(parts) >= 3:
            parts = parts[1:-1]
            s = "\n".join(parts)
    lines = s.splitlines() or [""]

    # Compute image size
    test_img = Image.new("RGB", (1, 1))
    draw = ImageDraw.Draw(test_img)
    max_w = 0
    # Compute a compatible text size. Prefer textbbox, then textsize, then fallback.
    def text_size(txt):
        try:
            # Pillow >=8: textbbox returns (x0, y0, x1, y1)
            bbox = draw.textbbox((0, 0), txt, font=FONT)
            return bbox[2] - bbox[0], bbox[3] - bbox[1]
        except Exception:
            pass
        try:
            # older Pillow: textsize
            return draw.textsize(txt, font=FONT)
        except Exception:
            pass
        # final fallback: use font.getmask
        try:
            mask = FONT.getmask(txt)
            return mask.size
        except Exception:
            return (len(txt) * 8, 16)

    _, h = text_size("A")
    line_height = h + 6
    for line in lines:
        w, _ = text_size(line)
        if w > max_w:
            max_w = w
    padding_x = 20
    padding_y = 20
    img_w = max(200, max_w + padding_x)
    img_h = max(100, line_height * len(lines) + padding_y)

    img = Image.new("RGB", (img_w, img_h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    y = 10
    for line in lines:
        draw.text((10, y), line, fill=(20, 20, 20), font=FONT)
        y += line_height

    out = txt.with_suffix(".png")
    img.save(out)
    print(f"Saved {out}")

print("Done.")
