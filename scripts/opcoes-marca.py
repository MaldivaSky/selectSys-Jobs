"""
Opções de marca para o SelectSys Jobs — folha de comparação.

Cada opção usa a MESMA paleta (verde Brasil, shu japonês, tinta) e conta a
mesma história: a travessia Brasil → Japão. O que muda é o símbolo.
Renderiza em 16 / 32 / 64 px (uso real) e em 200 px (apresentação).

    python scripts/opcoes-marca.py
"""

from __future__ import annotations
import os
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, "marca-opcoes")

INK = (13, 16, 22, 255)
CREME = (244, 242, 236, 255)
ANEL = (58, 69, 96, 255)
VERDE = (31, 157, 87, 255)
SHU = (196, 69, 43, 255)
SUPER = 8


def _curva(d, x0, y0, x1, y1, cx, cy, larg, cor):
    n = 160
    c = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        c.append((u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1))
    r = larg / 2
    esq, dir_ = [], []
    for i, (px, py) in enumerate(c):
        ax, ay = c[max(0, i - 1)]
        bx, by = c[min(n, i + 1)]
        tx, ty = bx - ax, by - ay
        m = (tx * tx + ty * ty) ** 0.5 or 1
        nx, ny = -ty / m, tx / m
        esq.append((px + nx * r, py + ny * r))
        dir_.append((px - nx * r, py - ny * r))
    d.polygon(esq + dir_[::-1], fill=cor)
    for p_ in (c[0], c[-1]):
        d.ellipse([p_[0] - r, p_[1] - r, p_[0] + r, p_[1] + r], fill=cor)


def _fonte(tam, negrito=True):
    nomes = ["YuGothB.ttc", "meiryob.ttc", "msgothic.ttc", "YuGothM.ttc", "segoeuib.ttf", "arialbd.ttf"]
    for n in nomes:
        try:
            return ImageFont.truetype(n, tam)
        except OSError:
            continue
    return ImageFont.load_default()


def base(lado, fundo=INK):
    S = lado * SUPER
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if fundo:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.2), fill=fundo)
    return img, d, (lambda v: v / 120 * S)


# ── A · Atual: anel + ponte (arquivo standalone) ───────────────────────────
def opcao_a(lado):
    img, d, p = base(lado)
    d.ellipse([p(30), p(28), p(90), p(88)], outline=ANEL, width=max(1, int(p(2.4))))
    _curva(d, p(42), p(70), p(78), p(70), p(60), p(38), p(4), CREME)
    d.ellipse([p(37), p(65), p(47), p(75)], fill=VERDE)
    d.ellipse([p(72.5), p(64.5), p(83.5), p(75.5)], fill=SHU)
    return img.resize((lado, lado), Image.LANCZOS)


# ── B · Hinomaru: o sol cheio como destino, a ponte chegando nele ──────────
def opcao_b(lado):
    img, d, p = base(lado)
    d.ellipse([p(58), p(26), p(102), p(70)], fill=SHU)            # sol do Japão
    _curva(d, p(22), p(88), p(80), p(88), p(51), p(38), p(7), CREME)
    d.ellipse([p(14), p(80), p(30), p(96)], fill=VERDE)           # Brasil
    return img.resize((lado, lado), Image.LANCZOS)


# ── C · Hanko 選: o kanji de "selecionar" no carimbo ───────────────────────
def opcao_c(lado):
    img, d, p = base(lado)
    S = lado * SUPER
    d.ellipse([p(16), p(16), p(104), p(104)], fill=SHU)
    f = _fonte(int(p(62)))
    txt = "選"
    cx = (p(16) + p(104)) / 2
    cy = (p(16) + p(104)) / 2
    bb = d.textbbox((0, 0), txt, font=f)
    d.text((cx - (bb[2] - bb[0]) / 2 - bb[0], cy - (bb[3] - bb[1]) / 2 - bb[1]), txt, font=f, fill=CREME)
    return img.resize((lado, lado), Image.LANCZOS)


# ── D · Ponte sobre o sol: arco creme cruzando o disco vermelho ────────────
def opcao_d(lado):
    img, d, p = base(lado)
    d.ellipse([p(34), p(34), p(86), p(86)], fill=SHU)
    _curva(d, p(20), p(78), p(100), p(78), p(60), p(20), p(9), CREME)
    d.ellipse([p(12), p(70), p(30), p(88)], fill=VERDE)
    d.ellipse([p(91), p(69), p(111), p(89)], fill=(232, 120, 93, 255))
    return img.resize((lado, lado), Image.LANCZOS)


# ── E · Torii: o portal japonês desenhado com a ponte ──────────────────────
def opcao_e(lado):
    img, d, p = base(lado)
    d.ellipse([p(52), p(22), p(88), p(58)], fill=SHU)             # sol atrás
    w = p(6)
    d.rounded_rectangle([p(18), p(40), p(102), p(40) + w], radius=w / 2, fill=CREME)   # kasagi
    d.rounded_rectangle([p(26), p(56), p(94), p(56) + w * 0.8], radius=w / 2, fill=CREME)  # nuki
    d.rounded_rectangle([p(32), p(40), p(32) + w, p(98)], radius=w / 2, fill=CREME)    # pilar esq
    d.rounded_rectangle([p(82), p(40), p(82) + w, p(98)], radius=w / 2, fill=CREME)    # pilar dir
    d.ellipse([p(27), p(92), p(43), p(108)], fill=VERDE)
    return img.resize((lado, lado), Image.LANCZOS)


OPCOES = [
    ("A", "Atual — anel + ponte", opcao_a),
    ("B", "Hinomaru — sol como destino", opcao_b),
    ("C", "Hanko 選 — o kanji de selecionar", opcao_c),
    ("D", "Ponte sobre o sol", opcao_d),
    ("E", "Torii — o portal da travessia", opcao_e),
]


def folha():
    os.makedirs(SAIDA, exist_ok=True)
    tamanhos = [200, 64, 32, 16]
    lin_h = 240
    L = 1000
    A = lin_h * len(OPCOES) + 90
    img = Image.new("RGB", (L, A), (247, 248, 245))
    d = ImageDraw.Draw(img)
    f_t = _fonte(26)
    f_p = _fonte(17)
    f_s = _fonte(14)

    d.text((40, 30), "SelectSys Jobs — opções de marca", font=f_t, fill=(20, 24, 31))

    y = 84
    for letra, nome, fn in OPCOES:
        d.rectangle([40, y, L - 40, y + lin_h - 18], fill=(255, 255, 255), outline=(224, 226, 220))
        d.text((60, y + 20), f"{letra} · {nome}", font=f_p, fill=(20, 24, 31))
        x = 60
        for t in tamanhos:
            ic = fn(t)
            img.paste(ic, (x, y + 62 + (200 - t) // 2), ic if ic.mode == "RGBA" else None)
            d.text((x, y + 62 + 205), f"{t}px", font=f_s, fill=(97, 106, 102))
            x += t + 46
            ic.save(os.path.join(SAIDA, f"opcao-{letra}-{t}.png"))
        y += lin_h

    cam = os.path.join(SAIDA, "comparacao.png")
    img.save(cam)
    print("folha:", cam)
    return cam


if __name__ == "__main__":
    folha()
