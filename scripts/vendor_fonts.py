"""Download the portfolio's Latin WOFF2 fonts and their OFL licenses."""

import json
from pathlib import Path
import re
from urllib.parse import urlencode
from urllib.request import ProxyHandler, Request, build_opener

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "fonts"
FAMILIES = [
    "DM Mono:wght@400;500",
    "DM Sans:opsz,wght@9..40,400..700",
    "Instrument Serif:ital@0;1",
]


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    opener = build_opener(ProxyHandler({}))
    agent = "Mozilla/5.0 AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"

    def get(url):
        with opener.open(Request(url, headers={"User-Agent": agent}), timeout=30) as response:
            return response.read()

    query = urlencode([("family", f) for f in FAMILIES] + [("display", "swap")])
    remote_css = get("https://fonts.googleapis.com/css2?" + query).decode()
    rules = []
    for match in re.finditer(r"/\* latin \*/\s*(@font-face\s*\{[^}]+\})", remote_css):
        rule = match.group(1)
        family = re.search(r"font-family:\s*'([^']+)'", rule).group(1)
        style = re.search(r"font-style:\s*([^;]+)", rule).group(1)
        weight = re.search(r"font-weight:\s*([^;]+)", rule).group(1)
        url = re.search(r"url\(([^)]+)\)", rule).group(1)
        filename = family.lower().replace(" ", "-") + "-" + style + "-" + weight.replace(" ", "-") + ".woff2"
        (DEST / filename).write_bytes(get(url))
        rules.append(rule.replace(url, "assets/fonts/" + filename))
    if len(rules) != 5:
        raise RuntimeError("Expected five font faces; inspect the Google Fonts response.")
    for family in ["dmmono", "dmsans", "instrumentserif"]:
        (DEST / (family + "-OFL.txt")).write_bytes(
            get(f"https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt")
        )
    print(json.dumps({"css": "\n".join(rules), "bytes": sum(p.stat().st_size for p in DEST.glob("*.woff2"))}))


if __name__ == "__main__":
    main()
