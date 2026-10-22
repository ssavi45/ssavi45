"""Build web-sized images; keep original artwork untouched.

Requires Pillow: python -m pip install Pillow
Run from the repository root: python scripts/optimize_images.py
WebP encoding is lossless. Downsampling targets up to 3x the displayed logo size.
"""

from pathlib import Path
import json
import re

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "optimized"


def build(source, filename, max_size):
    with Image.open(ROOT / source) as original:
        image = ImageOps.exif_transpose(original).convert("RGBA")
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        target = OUTPUT / filename
        if target.suffix == ".png":
            image.save(target, optimize=True, compress_level=9)
        else:
            image.save(target, "WEBP", lossless=True, method=6, exact=True)
            # Older browsers that do not decode WebP receive a web-sized PNG.
            image.save(target.with_suffix(".png"), optimize=True, compress_level=9)
        # Check decoded pixels against the resized image, including transparency.
        with Image.open(target) as decoded:
            assert decoded.convert("RGBA").tobytes() == image.tobytes(), target
        return {
            "source": source,
            "path": target.relative_to(ROOT).as_posix(),
            "width": image.width,
            "height": image.height,
            "before": (ROOT / source).stat().st_size,
            "after": target.stat().st_size,
        }


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    references = set(re.findall(r'src="([^"]+)"', html))
    icons = sorted(
        path.relative_to(ROOT).as_posix()
        for path in (ROOT / "assets").glob("*.png")
        if path.relative_to(ROOT).as_posix() in references
        or f"assets/optimized/{path.stem}.webp" in references
        or f"assets/optimized/{path.stem}.png" in references
    )
    results = [build(icon, Path(icon).stem + ".webp", (192, 192)) for icon in icons]
    for source, filename, size in [
        ("favicon.png", "favicon-64.png", (64, 64)),
        ("ssavi_logo.png", "ssavi-logo.webp", (480, 480)),
        ("flyrank_logo.png", "flyrank-logo.webp", (780, 780)),
        ("verdant_logo.png", "verdant-logo.webp", (780, 780)),
        ("ssavi.png", "portrait-960.webp", (960, 960)),
    ]:
        results.append(build(source, filename, size))
    mobile = build("ssavi.png", "portrait-480.webp", (480, 480))
    print(json.dumps({"images": results, "portrait_small": mobile}))


if __name__ == "__main__":
    main()
