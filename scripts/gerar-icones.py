"""
Gera os ícones oficiais do SelectSys Jobs a partir da marca.

A marca é a travessia: o círculo é o mundo, a ponte liga os dois lados, o ponto
verde é o Brasil (origem) e o vermelho é o Japão (destino). Tudo aqui é
desenhado com essa geometria — nenhum arquivo de imagem externo entra.

    python scripts/gerar-icones.py

Saída em app/public/: favicon.png, favicon.ico, apple-touch-icon.png,
icon-192.png, icon-512.png, logo.png e og-image.png.
"""

from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, "app", "public")

# Cores da marca (espelham app/src/brand/brand.ts)
INK = (13, 16, 22, 255)
CREME = (244, 242, 236, 255)
ANEL = (58, 69, 96, 255)
VERDE = (31, 157, 87, 255)
SHU = (196, 69, 43, 255)

SUPER = 8  # supersampling: desenha grande e reduz, para a borda sair limpa


def _ponte(d: ImageDraw.ImageDraw, x0, y0, x1, y1, cx, cy, largura, cor):
    """
    Bézier quadrática da ponte, desenhada como POLÍGONO.

    `ImageDraw.line` com espessura grande serrilha a curva (cada segmento vira
    um retângulo próprio e as quinas aparecem). Deslocando a curva pela normal
    para os dois lados e preenchendo o contorno, a borda sai limpa.
    """
    n = 160
    centro = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        centro.append((u * u * x0 + 2 * u * t * cx + t * t * x1,
                       u * u * y0 + 2 * u * t * cy + t * t * y1))

    r = largura / 2
    esquerda, direita = [], []
    for i, (px, py) in enumerate(centro):
        ax, ay = centro[max(0, i - 1)]
        bx, by = centro[min(n, i + 1)]
        tx, ty = bx - ax, by - ay
        m = (tx * tx + ty * ty) ** 0.5 or 1.0
        nx, ny = -ty / m, tx / m          # normal unitária
        esquerda.append((px + nx * r, py + ny * r))
        direita.append((px - nx * r, py - ny * r))

    d.polygon(esquerda + direita[::-1], fill=cor)
    # Pontas arredondadas
    for (px, py) in (centro[0], centro[-1]):
        d.ellipse([px - r, py - r, px + r, py + r], fill=cor)


def marca(lado: int, fundo=INK, raio_cantos: float = 0.22, com_anel=True) -> Image.Image:
    """Desenha o símbolo num quadrado de `lado` px."""
    S = lado * SUPER
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if fundo is not None:
        r = int(S * raio_cantos)
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=r, fill=fundo)

    # Proporções tiradas do favicon.svg (viewBox 120)
    def p(v):
        return v / 120 * S

    # Proporção pensada para 16px: a ponte precisa dominar o quadro, senão
    # vira um borrão cinza na aba do navegador. O anel é suporte, não o assunto.
    if com_anel:
        d.ellipse([p(11), p(11), p(109), p(109)], outline=ANEL, width=int(p(3.0)))

    # Tabuleiro da ponte
    d.line([(p(30), p(74)), (p(90), p(74))], fill=CREME, width=int(p(4.6)))
    for x in (p(30), p(90)):
        d.ellipse([x - p(2.3), p(74) - p(2.3), x + p(2.3), p(74) + p(2.3)], fill=CREME)

    # Arco
    _ponte(d, p(33), p(74), p(87), p(74), p(60), p(21), p(11), CREME)

    # Origem (Brasil) e destino (Japão)
    d.ellipse([p(33) - p(10), p(74) - p(10), p(33) + p(10), p(74) + p(10)], fill=VERDE)
    d.ellipse([p(87) - p(10.8), p(74) - p(10.8), p(87) + p(10.8), p(74) + p(10.8)], fill=SHU)

    return img.resize((lado, lado), Image.LANCZOS)


def _fonte(tamanho: int):
    for nome in ("segoeuib.ttf", "arialbd.ttf", "seguisb.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(nome, tamanho)
        except OSError:
            continue
    return ImageFont.load_default()


def logo_horizontal(altura: int = 256) -> Image.Image:
    """Lockup: símbolo + logotipo, fundo transparente."""
    simbolo = marca(altura, fundo=None, com_anel=True)
    fonte = _fonte(int(altura * 0.42))
    largura = int(altura * 4.4)
    img = Image.new("RGBA", (largura, altura), (0, 0, 0, 0))
    img.paste(simbolo, (0, 0), simbolo)
    d = ImageDraw.Draw(img)
    x = int(altura * 1.22)
    y = int(altura * 0.30)
    d.text((x, y), "SelectSys", font=fonte, fill=(20, 24, 31, 255))
    dx = d.textlength("SelectSys ", font=fonte)
    d.text((x + dx, y), "Jobs", font=fonte, fill=SHU)
    return img


def og_image() -> Image.Image:
    """Cartão social 1200×630 — o que aparece quando o link é compartilhado."""
    L, A = 1200, 630
    img = Image.new("RGB", (L, A), INK[:3])
    d = ImageDraw.Draw(img)

    # Halo suave atrás da marca
    for i in range(120, 0, -1):
        f = i / 120
        cor = (int(13 + 22 * f), int(16 + 28 * f), int(22 + 40 * f))
        d.ellipse([L * 0.5 - i * 3.4, A * 0.42 - i * 3.4, L * 0.5 + i * 3.4, A * 0.42 + i * 3.4], fill=cor)

    simbolo = marca(210, fundo=None, com_anel=True)
    img.paste(simbolo, (int(L / 2 - 105), 92), simbolo)

    f_nome = _fonte(72)
    f_sub = _fonte(30)
    nome = "SelectSys Jobs"
    w = d.textlength(nome, font=f_nome)
    d.text(((L - w) / 2, 336), nome, font=f_nome, fill=CREME[:3])

    sub = "Brasil  →  Japão"
    w2 = d.textlength(sub, font=f_sub)
    d.text(((L - w2) / 2, 430), sub, font=f_sub, fill=(140, 152, 176))

    tag = "Cada etapa da travessia, visível."
    w3 = d.textlength(tag, font=f_sub)
    d.text(((L - w3) / 2, 486), tag, font=f_sub, fill=(96, 108, 130))

    # Fio da travessia no rodapé: verde → âmbar → vermelho
    y = A - 12
    for x in range(L):
        f = x / L
        if f < 0.5:
            g = f * 2
            cor = (int(31 + (201 - 31) * g), int(157 + (154 - 157) * g), int(87 + (46 - 87) * g))
        else:
            g = (f - 0.5) * 2
            cor = (int(201 + (196 - 201) * g), int(154 + (69 - 154) * g), int(46 + (43 - 46) * g))
        d.line([(x, y), (x, A)], fill=cor)
    return img


def main():
    os.makedirs(SAIDA, exist_ok=True)
    gerados = []

    for nome, lado in (("favicon.png", 512), ("icon-192.png", 192), ("icon-512.png", 512),
                       ("apple-touch-icon.png", 180)):
        caminho = os.path.join(SAIDA, nome)
        marca(lado).save(caminho)
        gerados.append((nome, lado, lado))

    # .ico com os tamanhos que o Windows e o Vercel realmente leem
    ico = os.path.join(SAIDA, "favicon.ico")
    marca(256).save(ico, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    gerados.append(("favicon.ico", "multi", ""))

    logo = logo_horizontal(256)
    logo.save(os.path.join(SAIDA, "logo.png"))
    gerados.append(("logo.png", logo.width, logo.height))

    og = og_image()
    og.save(os.path.join(SAIDA, "og-image.png"))
    gerados.append(("og-image.png", og.width, og.height))

    for nome, w, h in gerados:
        tam = os.path.getsize(os.path.join(SAIDA, nome))
        print(f"  {nome:24} {str(w)+'x'+str(h) if h else w:12} {tam:>8,} bytes")


if __name__ == "__main__":
    main()
