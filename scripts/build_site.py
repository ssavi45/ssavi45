"""Validate local asset references and build a small, static deployment folder.

Run: python scripts/build_site.py
Only browser-referenced files and font licenses are copied; original large
artwork, development scripts, and Git metadata stay out of the deployment.
"""

from html import unescape
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
import shutil
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "dist"


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for key in ("src", "href", "poster"):
            if values.get(key):
                self.paths.add(values[key])
        for key in ("srcset", "imagesrcset"):
            for entry in values.get(key, "").split(","):
                if entry.strip():
                    self.paths.add(entry.strip().split()[0])


def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    references = References()
    references.feed(html)
    references.paths.update(re.findall(r"url\(\s*['\"]?([^)'\"\s]+)", html))
    files = {Path("index.html"), Path("CNAME"), Path(".nojekyll")}
    for reference in references.paths:
        parsed = urlsplit(unescape(reference))
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        decoded_path = unquote(parsed.path.lstrip("/"))
        if decoded_path.startswith("#"):
            continue  # Fragment references inside encoded inline SVG filters.
        relative = Path(decoded_path)
        source = (ROOT / relative).resolve()
        if not source.is_relative_to(ROOT) or not source.is_file():
            raise ValueError(f"Missing or invalid asset: {reference}")
        files.add(relative)
    files.update(p.relative_to(ROOT) for p in (ROOT / "assets" / "fonts").glob("*-OFL.txt"))
    # Reject case mismatches that Windows would accept but Linux hosting would not.
    for relative in files:
        current = ROOT
        for part in relative.parts:
            if part not in {p.name for p in current.iterdir()}:
                raise ValueError(f"Asset path has incorrect case: {relative}")
            current /= part
    DEST.mkdir(exist_ok=True)
    manifest = {}
    for relative in sorted(files):
        target = DEST / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / relative, target)
        data = target.read_bytes()
        manifest[relative.as_posix()] = {
            "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()
        }
    (DEST / "asset-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Validated and copied {len(files)} files; {sum(v['bytes'] for v in manifest.values()) / 1_000_000:.2f} MB to {DEST}")


if __name__ == "__main__":
    main()
