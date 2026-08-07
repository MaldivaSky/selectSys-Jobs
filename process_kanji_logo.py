from PIL import Image

orig_path = "SelectSys Jobs App-selection1.png"
img = Image.open(orig_path).convert("RGBA")

# Adjust box to capture full badge with padding: (200, 70, 480, 350)
box = (200, 70, 480, 350)
cropped = img.crop(box)

icon = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
cropped_resized = cropped.resize((450, 450), Image.Resampling.LANCZOS)
icon.paste(cropped_resized, (31, 31), cropped_resized)

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

for t in targets:
    icon.save(t)
    print(f"Saved {t}")
