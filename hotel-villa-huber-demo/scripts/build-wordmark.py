"""
Ideiglenes Hotel Villa Huber wordmark generálása SVG-útvonalakká.
Betűk: Fraunces (SIL OFL) és Source Sans 3 (SIL OFL), a projekt @fontsource csomagjaiból.
Kimenet: public/brand/*.svg és src/components/brand/wordmark-paths.ts
Futtatás: python3 scripts/build-wordmark.py  (fonttools + brotli szükséges)
"""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
NM = ROOT / "node_modules/@fontsource-variable"

def load(path, axes):
    f = TTFont(path)
    return instantiateVariableFont(f, axes)

def run(font, text, size, x0, baseline, tracking_em=0.0):
    upm = font["head"].unitsPerEm
    scale = size / upm
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]
    kern = None
    d_parts = []
    x = x0
    for ch in text:
        gname = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x, baseline))
        gs[gname].draw(tpen)
        d = pen.getCommands()
        if d:
            d_parts.append(d)
        x += hmtx[gname][0] * scale + tracking_em * size
    return " ".join(d_parts), x - tracking_em * size

serif = load(NM / "fraunces/files/fraunces-latin-opsz-normal.woff2", {"wght": 520, "opsz": 72})
sans = load(NM / "source-sans-3/files/source-sans-3-latin-wght-normal.woff2", {"wght": 620})

# Lockup: "HOTEL" (sans, ritkított) a "Villa Huber" (serif) felett, balra zárva.
name_d, name_w = run(serif, "Villa Huber", 48, 0, 74)
hotel_d, hotel_w = run(sans, "HOTEL", 13, 2, 18, tracking_em=0.42)
width = round(max(name_w, hotel_w) + 2)
height = 86

# Monogram (kör alakú pecsét helyett egyszerű HVH-betűjel négyzetben, favicon célra)
mono_d, mono_w = run(serif, "VH", 30, 0, 0)

def fmt(d):
    # kerekítés a fájlméret miatt
    out = []
    num = ""
    for c in d:
        if c in "-.0123456789":
            num += c
        else:
            if num:
                out.append(f"{float(num):.1f}".rstrip("0").rstrip("."))
                num = ""
            out.append(c)
    if num:
        out.append(f"{float(num):.1f}".rstrip("0").rstrip("."))
    return "".join(out)

name_d, hotel_d, mono_d = fmt(name_d), fmt(hotel_d), fmt(mono_d)

INK = "#1e221f"; FOREST = "#2c4636"; BRONZE = "#9b6b3a"; PAPER = "#f6f1e7"

def wordmark_svg(main, accent):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" aria-labelledby="t">
  <title id="t">Hotel Villa Huber</title>
  <path fill="{accent}" d="{hotel_d}"/>
  <path fill="{main}" d="{name_d}"/>
</svg>
'''

out = ROOT / "public/brand"
out.mkdir(parents=True, exist_ok=True)
(out / "hvh-wordmark.svg").write_text(wordmark_svg(FOREST, BRONZE))
(out / "hvh-wordmark-ink.svg").write_text(wordmark_svg(INK, BRONZE))
(out / "hvh-wordmark-light.svg").write_text(wordmark_svg(PAPER, "#d9b98f"))

# Monogram a faviconhoz: 64×64, zöld alap, törtfehér betűk, középre igazítva
mx = (64 - mono_w) / 2
mono_centered, _ = run(serif, "VH", 30, mx, 43)
mono_centered = fmt(mono_centered)
(ROOT / "src/app/icon.svg").write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="12" fill="{FOREST}"/>
  <rect x="14" y="50" width="36" height="1.5" fill="{BRONZE}"/>
  <path fill="{PAPER}" d="{mono_centered}"/>
</svg>
''')

ts = f'''// Generálta: scripts/build-wordmark.py — kézzel ne szerkeszd.
export const WORDMARK_VIEWBOX = "0 0 {width} {height}";
export const WORDMARK_WIDTH = {width};
export const WORDMARK_HEIGHT = {height};
export const WORDMARK_HOTEL_PATH = {json.dumps(hotel_d)};
export const WORDMARK_NAME_PATH = {json.dumps(name_d)};
'''
(ROOT / "src/components/brand/wordmark-paths.ts").write_text(ts)
print("wordmark", width, height, "bytes", len(name_d) + len(hotel_d))
