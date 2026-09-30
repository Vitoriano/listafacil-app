"""Gera a logo do Lista Fácil em alta resolução (sacola redesenhada como vetor
a partir das medidas do assets/icon.png original de 500 px) e exporta os assets
do Google Play e do ícone adaptativo Android.

Uso: python3 play/generate.py
"""
from PIL import Image, ImageDraw, ImageFont

BRAND_RED = (234, 29, 44)      # #EA1D2C (cor primária do app / adaptiveIcon)
WHITE = (255, 255, 255)
SS = 4                         # supersampling para antialias

# Geometria da sacola no sistema do icon.png (500 px). Stroke = 13.
S = 13
BAG = dict(x0=174, x1=312, y0=163, y1=297)           # retângulo externo
HANDLE = dict(cx=243, cy=156, r_out=37, r_in=24, leg_l=(206, 218, 187), leg_r=(268, 280, 175))
TOP_GAP = (219, 230)                                 # abertura na borda superior
RIGHT_GAP = (260, 284)                               # abertura na borda direita
HEAD_H = (219, 265, 209, 221)                        # barra horizontal da seta (x0,x1,y0,y1)
HEAD_V = (219, 231, 209, 255)                        # barra vertical da seta
SHAFT = dict(x_from=232, y_from=222, y_join=247, y_end=259)  # haste a 45° que se funde à borda direita


def draw_glyph(size_px, glyph_px, center, color=WHITE, canvas=None):
    """Desenha a sacola com `glyph_px` de largura (medida externa) centrada em `center`."""
    scale = glyph_px / (BAG['x1'] - BAG['x0'] + 1)
    gx0, gy0 = BAG['x0'], 119                       # bbox do glifo no icon.png: 174..312 x 119..297
    gw, gh = 312 - 174 + 1, 297 - 119 + 1
    ox = center[0] - gw * scale / 2
    oy = center[1] - gh * scale / 2

    def P(x, y):
        return ((x - gx0) * scale + ox) * SS, ((y - gy0) * scale + oy) * SS

    big = Image.new('RGBA', (size_px[0] * SS, size_px[1] * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)

    def rect(x0, y0, x1, y1):
        d.rectangle([P(x0, y0), P(x1 + 1, y1 + 1)], fill=color)

    # Borda superior (com abertura), esquerda, inferior
    rect(BAG['x0'], BAG['y0'], TOP_GAP[0] - 1, BAG['y0'] + S - 1)
    rect(TOP_GAP[1] + 1, BAG['y0'], BAG['x1'], BAG['y0'] + S - 1)
    rect(BAG['x0'], BAG['y0'], BAG['x0'] + S - 1, BAG['y1'])
    rect(BAG['x0'], BAG['y1'] - S + 1, BAG['x1'], BAG['y1'])
    # Borda direita (com abertura onde a seta sai)
    rect(BAG['x1'] - S + 1, BAG['y0'], BAG['x1'], RIGHT_GAP[0] - 1)
    rect(BAG['x1'] - S + 1, RIGHT_GAP[1] + 1, BAG['x1'], BAG['y1'])

    # Alça: anel superior (semicírculo) + pernas
    h = HANDLE
    d.pieslice([P(h['cx'] - h['r_out'], h['cy'] - h['r_out']), P(h['cx'] + h['r_out'], h['cy'] + h['r_out'])],
               180, 360, fill=color)
    d.pieslice([P(h['cx'] - h['r_in'], h['cy'] - h['r_in']), P(h['cx'] + h['r_in'], h['cy'] + h['r_in'])],
               180, 360, fill=(0, 0, 0, 0))
    rect(h['leg_l'][0], h['cy'], h['leg_l'][1], h['leg_l'][2])
    rect(h['leg_r'][0], h['cy'], h['leg_r'][1], h['leg_r'][2])

    # Seta: cabeça em "L" + haste a 45° recortada na borda direita
    rect(HEAD_H[0], HEAD_H[2], HEAD_H[1], HEAD_H[3])
    rect(HEAD_V[0], HEAD_V[2], HEAD_V[1], HEAD_V[3])
    half = S / (2 ** 0.5)          # meia-largura horizontal da banda a 45° (13/√2 ≈ 9.2)
    x0, y0 = SHAFT['x_from'], SHAFT['y_from']
    yj, ye, xr = SHAFT['y_join'], SHAFT['y_end'] + 1, BAG['x1'] + 1
    # Banda desce a 45°; a partir de y_join preenche até a borda direita e termina reto em y_end.
    poly = [
        P(x0 - half, y0), P(x0 + half, y0),
        P(x0 + half + (yj - y0), yj), P(xr, yj),
        P(xr, ye), P(x0 - half + (ye - y0), ye),
    ]
    d.polygon(poly, fill=color)

    small = big.resize(size_px, Image.LANCZOS)
    if canvas is not None:
        canvas.alpha_composite(small)
        return canvas
    return small


def font(size, weight='Medium'):
    # Helvetica Neue (macOS). Índices do .ttc: 0 Regular, 1 Bold, ... tenta pelo nome.
    for idx in range(12):
        try:
            f = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', size, index=idx)
            if weight.lower() in f.getname()[1].lower():
                return f
        except Exception:
            break
    return ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', size, index=0)


def solid(size, color):
    return Image.new('RGBA', size, color + (255,))


def wordmark(canvas, text, center, size, color=WHITE, weight='Medium'):
    d = ImageDraw.Draw(canvas)
    f = font(size, weight)
    bbox = d.textbbox((0, 0), text, font=f)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((center[0] - w / 2 - bbox[0], center[1] - h / 2 - bbox[1]), text, font=f, fill=color)


# 1) Ícone do Google Play (512, sem alpha, full-bleed) e versão 1024
for px in (512, 1024):
    img = solid((px, px), BRAND_RED)
    draw_glyph((px, px), int(px * 0.52), (px / 2, px / 2), canvas=img)
    img.convert('RGB').save(f'play/icon-{px}.png')

# 2) Gráfico de destaque 1024x500 (sem alpha): glifo + wordmark
fg = solid((1024, 500), BRAND_RED)
draw_glyph((1024, 500), 230, (300, 250), canvas=fg)
wordmark(fg, 'Lista Fácil', (660, 232), 96, weight='Regular')
wordmark(fg, 'Compare preços e economize', (660, 310), 34, color=(255, 220, 222), weight='Regular')
fg.convert('RGB').save('play/feature-graphic-1024x500.png')

# 3) Logo completa (glifo + nome) em 1024, como o icon.png original, e versão branca transparente
full = solid((1024, 1024), BRAND_RED)
draw_glyph((1024, 1024), 300, (512, 440), canvas=full)
wordmark(full, 'Lista Fácil', (512, 735), 104, weight='Regular')
full.convert('RGB').save('play/logo-1024.png')

trans = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
draw_glyph((1024, 1024), 300, (512, 440), canvas=trans)
wordmark(trans, 'Lista Fácil', (512, 735), 104, weight='Regular')
trans.save('play/logo-white-transparent-1024.png')

# 4) Ícone adaptativo Android (1024): foreground dentro da zona segura (~66% central),
#    background sólido e monocromático (glifo branco em transparente)
afg = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
draw_glyph((1024, 1024), 470, (512, 512), canvas=afg)
afg.save('play/android-icon-foreground.png')
solid((1024, 1024), BRAND_RED).save('play/android-icon-background.png')
afg.save('play/android-icon-monochrome.png')

# 5) Ícone iOS 1024 (sem alpha, mesma composição do Play)
ios = solid((1024, 1024), BRAND_RED)
draw_glyph((1024, 1024), int(1024 * 0.52), (512, 512), canvas=ios)
ios.convert('RGB').save('play/ios-icon-1024.png')
print('ok')
