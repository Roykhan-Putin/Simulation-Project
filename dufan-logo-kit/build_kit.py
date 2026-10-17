import os
import subprocess

kit_dir = r"d:\Kuliah\Mini Project\logo-design-skill\dufan-logo-kit"
master_dir = os.path.join(kit_dir, "master")
web_dir = os.path.join(kit_dir, "web-icons")
png_dir = os.path.join(kit_dir, "png")
scripts_dir = r"d:\Kuliah\Mini Project\logo-design-skill\skills\logo-design\scripts"

# Brand colors
COLOR_PRIMARY = "#0072F5"   # Dufan Electric Azure (Modern, energetic, high contrast)
COLOR_SPARK = "#FFB800"     # Fantasy Spark Gold (Joy, magic, warmth)
COLOR_DARK = "#0F172A"      # Deep slate for text / dark variants
COLOR_WHITE = "#FFFFFF"

# Geometry definition for the Joyful D:
# D body path (excluding star):
d_body_path = """M 64 36
    L 132 36
    C 188 36 216 76 216 128
    C 216 180 188 220 132 220
    L 64 220
    A 24 24 0 0 1 40 196
    L 40 60
    A 24 24 0 0 1 64 36
    Z
    M 90 118
    C 112 118 140 118 170 118
    C 172 118 174 122 172 126
    C 158 168 124 178 90 178
    C 87 178 84 175 84 171
    L 84 125
    C 84 120 87 118 90 118
    Z"""

star_path = """M 132 58
    Q 132 78 112 78
    Q 132 78 132 98
    Q 132 78 152 78
    Q 132 78 132 58
    Z"""

# Single-color compound path (star is cutout hole via evenodd)
single_compound_d = f"""{d_body_path}\n    {star_path}"""

# -------------------------------------------------------------------------
# 1. SYMBOLS
# -------------------------------------------------------------------------

# Black master symbol (100% production grade)
svg_symbol_black = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-black">
  <title id="title-black">DUFAN Logo Symbol - Black</title>
  <path fill="#000000" fill-rule="evenodd" d="{single_compound_d}"/>
</svg>'''

# White / reversed symbol
svg_symbol_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-white">
  <title id="title-white">DUFAN Logo Symbol - White</title>
  <path fill="#FFFFFF" fill-rule="evenodd" d="{single_compound_d}"/>
</svg>'''

# Mono brand blue symbol
svg_symbol_mono = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-mono">
  <title id="title-mono">DUFAN Logo Symbol - Brand Azure</title>
  <path fill="{COLOR_PRIMARY}" fill-rule="evenodd" d="{single_compound_d}"/>
</svg>'''

# Two-color primary brand symbol (Electric Azure + Gold Star)
svg_symbol_color = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-color">
  <title id="title-color">DUFAN Logo Symbol - Full Color</title>
  <!-- D Body with open smile counter -->
  <path fill="{COLOR_PRIMARY}" fill-rule="evenodd" d="{d_body_path}"/>
  <!-- Fantasy Spark in Gold -->
  <path fill="{COLOR_SPARK}" d="{star_path}"/>
</svg>'''

with open(os.path.join(master_dir, "dufan-symbol-master.svg"), "w", encoding="utf-8") as f:
    f.write(svg_symbol_black)
with open(os.path.join(master_dir, "dufan-symbol-color.svg"), "w", encoding="utf-8") as f:
    f.write(svg_symbol_color)
with open(os.path.join(master_dir, "dufan-symbol-mono.svg"), "w", encoding="utf-8") as f:
    f.write(svg_symbol_mono)
with open(os.path.join(master_dir, "dufan-symbol-black.svg"), "w", encoding="utf-8") as f:
    f.write(svg_symbol_black)
with open(os.path.join(master_dir, "dufan-symbol-white.svg"), "w", encoding="utf-8") as f:
    f.write(svg_symbol_white)

# -------------------------------------------------------------------------
# 2. WORDMARK GEOMETRY & HORIZONTAL LOCKUPS
# -------------------------------------------------------------------------
wordmark_paths = """<path d="M 0 80 L 38 80 C 62 80 74 94 74 128 C 74 162 62 176 38 176 L 0 176 Z M 20 98 L 20 158 L 36 158 C 48 158 54 148 54 128 C 54 108 48 98 36 98 Z"/>
    <path d="M 92 80 L 112 80 L 112 144 C 112 154 118 160 126 160 C 134 160 140 154 140 144 L 140 80 L 160 80 L 160 144 C 160 164 148 176 126 176 C 104 176 92 164 92 144 Z"/>
    <path d="M 180 80 L 242 80 L 242 98 L 200 98 L 200 120 L 236 120 L 236 138 L 200 138 L 200 176 L 180 176 Z"/>
    <path d="M 297 80 L 319 80 L 344 176 L 322 176 L 316 152 L 278 152 L 272 176 L 250 176 Z M 283 134 L 311 134 L 297 98 Z"/>
    <path d="M 354 80 L 374 80 L 406 148 L 406 80 L 426 80 L 426 176 L 406 176 L 374 108 L 374 176 L 354 176 Z"/>"""

def make_horizontal_svg(symbol_markup, wordmark_color, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="lockup-title">
  <title id="lockup-title">{title}</title>
  <g id="symbol" transform="translate(28, 28) scale(0.78125)">
    {symbol_markup}
  </g>
  <g id="wordmark" fill="{wordmark_color}" transform="translate(260, 0)">
    {wordmark_paths}
  </g>
</svg>'''

# Two-color horizontal lockup
symbol_color_inner = f'''<path fill="{COLOR_PRIMARY}" fill-rule="evenodd" d="{d_body_path}"/>
    <path fill="{COLOR_SPARK}" d="{star_path}"/>'''

svg_h_color = make_horizontal_svg(symbol_color_inner, COLOR_DARK, "DUFAN Logo - Horizontal Color")
svg_h_mono = make_horizontal_svg(f'<path fill="{COLOR_PRIMARY}" fill-rule="evenodd" d="{single_compound_d}"/>', COLOR_PRIMARY, "DUFAN Logo - Horizontal Azure Mono")
svg_h_black = make_horizontal_svg(f'<path fill="#000000" fill-rule="evenodd" d="{single_compound_d}"/>', "#000000", "DUFAN Logo - Horizontal Black")
svg_h_white = make_horizontal_svg(f'<path fill="#FFFFFF" fill-rule="evenodd" d="{single_compound_d}"/>', "#FFFFFF", "DUFAN Logo - Horizontal White")

with open(os.path.join(master_dir, "dufan-horizontal-color.svg"), "w", encoding="utf-8") as f:
    f.write(svg_h_color)
with open(os.path.join(master_dir, "dufan-horizontal-mono.svg"), "w", encoding="utf-8") as f:
    f.write(svg_h_mono)
with open(os.path.join(master_dir, "dufan-horizontal-black.svg"), "w", encoding="utf-8") as f:
    f.write(svg_h_black)
with open(os.path.join(master_dir, "dufan-horizontal-white.svg"), "w", encoding="utf-8") as f:
    f.write(svg_h_white)

# -------------------------------------------------------------------------
# 3. STACKED VERTICAL LOCKUPS (512x512)
# -------------------------------------------------------------------------
# Symbol scaled and centered on top, wordmark centered below
def make_stacked_svg(symbol_markup, wordmark_color, title):
    # Wordmark width is ~426. To center on 512, offset = (512 - 426*0.7) / 2 ≈ 107
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-labelledby="stacked-title">
  <title id="stacked-title">{title}</title>
  <!-- Symbol scaled to 230x230, centered at (141, 50) -->
  <g id="symbol" transform="translate(141, 44) scale(0.8984)">
    {symbol_markup}
  </g>
  <!-- Wordmark scaled by 0.76 (width ≈ 324), centered at x=94, y=260 -->
  <g id="wordmark" fill="{wordmark_color}" transform="translate(94, 260) scale(0.76)">
    {wordmark_paths}
  </g>
</svg>'''

svg_s_color = make_stacked_svg(symbol_color_inner, COLOR_DARK, "DUFAN Logo - Stacked Color")
svg_s_mono = make_stacked_svg(f'<path fill="{COLOR_PRIMARY}" fill-rule="evenodd" d="{single_compound_d}"/>', COLOR_PRIMARY, "DUFAN Logo - Stacked Mono")
svg_s_black = make_stacked_svg(f'<path fill="#000000" fill-rule="evenodd" d="{single_compound_d}"/>', "#000000", "DUFAN Logo - Stacked Black")
svg_s_white = make_stacked_svg(f'<path fill="#FFFFFF" fill-rule="evenodd" d="{single_compound_d}"/>', "#FFFFFF", "DUFAN Logo - Stacked White")

with open(os.path.join(master_dir, "dufan-stacked-color.svg"), "w", encoding="utf-8") as f:
    f.write(svg_s_color)
with open(os.path.join(master_dir, "dufan-stacked-mono.svg"), "w", encoding="utf-8") as f:
    f.write(svg_s_mono)
with open(os.path.join(master_dir, "dufan-stacked-black.svg"), "w", encoding="utf-8") as f:
    f.write(svg_s_black)
with open(os.path.join(master_dir, "dufan-stacked-white.svg"), "w", encoding="utf-8") as f:
    f.write(svg_s_white)

print("Generated all Master SVGs (Symbol, Horizontal, Stacked in Color, Mono, Black, White)")
