from PIL import Image, ImageDraw

size = 512
img = Image.new("RGBA", (size, size), "#0d1016")
draw = ImageDraw.Draw(img)

cx, cy = 256, 256
r = 190

# Outer orbital ring
draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline="#3a4560", width=12)

# Bridge arc
draw.arc([cx - 130, cy - 80, cx + 130, cy + 80], start=180, end=360, fill="#f4f2ec", width=18)

# Green dot (Brasil)
g_x, g_y = cx - 130, cy + 40
g_r = 28
draw.ellipse([g_x - g_r, g_y - g_r, g_x + g_r, g_y + g_r], fill="#1f9d57")

# Red dot (Japão)
r_x, r_y = cx + 130, cy + 40
r_r = 30
draw.ellipse([r_x - r_r, r_y - r_r, r_x + r_r, r_y + r_r], fill="#c4452b")

targets = [
    "public/logo.png",
    "public/favicon.png",
    "public/favicon.ico",
    "favicon.png",
    "favicon.ico",
    "app/public/logo.png",
    "app/public/favicon.png",
    "app/public/favicon.ico",
    "app/public/apple-touch-icon.png",
    "app/public/og-image.png"
]

for target in targets:
    img.save(target)
    print(f"Saved {target}")
