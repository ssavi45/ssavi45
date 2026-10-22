# Deployment

The portfolio is a static site: no Node server, database, or frontend runtime is needed.
Current Chrome, Edge, Firefox, and Safari are the browser targets. Older browsers
receive static fallbacks where optional APIs or effects are unavailable.

## Build and preview

Run these commands from the repository root:

    python scripts/build_site.py
    python -m http.server 8000 --directory dist

Open http://localhost:8000. The build verifies referenced assets, including
case-sensitive filenames for Linux hosting, and copies only the files the site
uses. The original large artwork is retained in the repository.

Python 3.9+ is needed for the build, not for hosting the site.

## GitHub Pages

The existing branch-based Pages setup can still publish directly from the root.
Commit index.html, assets/site.js, assets/fonts, and .nojekyll together.
If using an existing Pages Actions workflow, upload dist as the Pages artifact
after running the build command. No workflow or live hosting settings are
changed by the build script.

CNAME retains shoumik.pro.bd. HTTP currently redirects to HTTPS. Keep
Settings → Pages → Enforce HTTPS enabled.
See [GitHub's HTTPS instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

GitHub Pages controls response compression and cache headers. An _headers file
or a .htaccess file will not configure Pages caching. On another static host,
enable Brotli/gzip, revalidate HTML, and cache versioned assets. Do not set
immutable year-long caching on the current unversioned filenames.

## Assets and fonts

Images use local optimized copies with explicit dimensions, responsive portrait
sizes, and lazy loading below the fold. The hero image and primary fonts are
preloaded. All five font faces are local WOFF2 files using font-display: swap;
their Open Font Licenses are included.

Picture elements choose lossless WebP in supporting browsers and web-sized PNG
fallbacks in older browsers. Only the selected format is requested; both formats
are included in the deployment folder.

To regenerate images: python scripts/optimize_images.py (requires Pillow).
To refresh local fonts: python scripts/vendor_fonts.py (requires network access).

Decorative contact canvases initialize near the viewport and pause off-screen or
in hidden tabs. Reduced-motion preferences receive a static presentation.
Content remains visible with JavaScript disabled or observer APIs unavailable.

Latency still depends on the connection, device, browser cache, and hosting edge.
