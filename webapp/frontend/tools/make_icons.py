#!/usr/bin/env python3
"""Regenerate EVERY icon the site installs, from the two committed SVG sources.

ONE COMMAND FOR ALL OF THEM. Icons are the most visible brand asset there is (the tile on a home
screen, the tab favicon, the card in a shared link) and they are also the ones that get forgotten:
in a previous rebrand five of seven icon files sat on the retired palette for months, because each
was made by hand at a different time. Regenerating them all from one source removes that.

    python webapp/frontend/tools/make_icons.py

TWO THINGS THAT ARE EASY TO GET WRONG AND ARE HANDLED HERE:

  * iOS IGNORES the web manifest icons. It needs apple-touch-icon PNGs, and they must be OPAQUE,
    because iOS composites alpha to BLACK. A transparent PNG there produces a black tile with a
    logo floating in it. Every apple-touch variant below is flattened onto the canvas colour.

  * Chrome will not offer "install" unless BOTH 192 and 512 exist, and Android crops to a
    squircle, which is why there is a separate maskable source with its artwork inside the safe
    zone rather than one file reused at both purposes.

The social card is generated here too, from the same palette, so a palette change cannot leave the
link preview on the old brand.
"""
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.normpath(os.path.join(HERE, "..", "public"))

CANVAS = (12, 18, 51)  # --ink. The apple-touch flatten colour, and the card background.


def need(mod):
    try:
        return __import__(mod)
    except ImportError:
        sys.exit(
            "[X] %s is not installed.\n"
            "    pip install cairosvg pillow --break-system-packages" % mod
        )


def main():
    cairosvg = need("cairosvg")
    need("PIL")
    from PIL import Image, ImageDraw, ImageFont

    def render(svg_name, size):
        src = os.path.join(PUB, svg_name)
        if not os.path.exists(src):
            sys.exit("[X] missing source: %s" % src)
        png = cairosvg.svg2png(url=src, output_width=size, output_height=size)
        return Image.open(io.BytesIO(png)).convert("RGBA")

    def save(img, name):
        img.save(os.path.join(PUB, name))
        print("  %-28s %d bytes" % (name, os.path.getsize(os.path.join(PUB, name))))

    print("== icons ==")
    for s in (192, 512):
        save(render("icon.svg", s), "icon-%d.png" % s)
        save(render("icon-maskable.svg", s), "icon-maskable-%d.png" % s)

    # iOS: opaque, no alpha, three sizes because older devices ask for the smaller ones.
    for s in (180, 167, 152):
        flat = Image.new("RGB", (s, s), CANVAS)
        ic = render("icon.svg", s)
        flat.paste(ic, (0, 0), ic)
        name = "apple-touch-icon.png" if s == 180 else "apple-touch-icon-%d.png" % s
        save(flat, name)

    # favicon.ico: several sizes in one file so the browser picks what it needs.
    ico = render("icon.svg", 64)
    ico.save(os.path.join(PUB, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("  %-28s %d bytes" % ("favicon.ico", os.path.getsize(os.path.join(PUB, "favicon.ico"))))

    # ---- social card ------------------------------------------------------------------------
    # 1200x630 is what LinkedIn, Slack and X render. Text is kept large and short: the card is
    # usually seen at about a third of this size in a feed.
    print("== social card ==")
    W, H = 1200, 630
    card = Image.new("RGB", (W, H), CANVAS)
    d = ImageDraw.Draw(card)

    # A soft brand wash, drawn as concentric translucent ellipses rather than a real gradient,
    # because Pillow has no gradient primitive and this is indistinguishable at card size.
    # THE SAME FIELD AS THE HERO: an indigo base, a cyan glow from the top left and a magenta glow
    # from the bottom right. A link preview that does not look like the page it links to is a
    # wasted impression, so this is generated from the same three colours rather than eyeballed.
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(70, 0, -1):
        a = int(2 + i * 0.9)
        gd.ellipse([-420 + i * 7, -380 + i * 6, 900 - i * 5, 640 - i * 5], fill=(79, 70, 229, a))
        gd.ellipse([-260 + i * 5, -300 + i * 5, 560 - i * 4, 380 - i * 4], fill=(34, 211, 238, a // 2))
        gd.ellipse([760 + i * 4, 300 + i * 4, 1460 - i * 5, 960 - i * 5], fill=(192, 38, 211, a))
    card = Image.alpha_composite(card.convert("RGBA"), glow).convert("RGB")
    d = ImageDraw.Draw(card)

    logo = render("icon.svg", 104)
    card.paste(logo, (80, 74), logo)

    def font(px, bold=True):
        for p in (
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else
            "/System/Library/Fonts/Supplemental/Arial.ttf",
        ):
            try:
                return ImageFont.truetype(p, px)
            except Exception:
                continue
        return ImageFont.load_default()

    # PURE WHITE on the field. Measured: an off-white drops to 4.27:1 over the magenta stop and
    # fails, while white holds at 4.71:1 across every stop.
    W_ = (255, 255, 255)
    d.text((206, 96), "S4Biz", font=font(58), fill=W_)
    d.text((80, 250), "Sovereign AI, cloud and cyber,", font=font(62), fill=W_)
    d.text((80, 328), "architected and delivered", font=font(62), fill=(103, 232, 249))
    d.text((80, 406), "by one accountable team.", font=font(62), fill=W_)
    d.text(
        (80, 520),
        "AI  ·  Cloud transformation  ·  Cyber security  ·  s4biz.io",
        font=font(28, bold=False),
        fill=(214, 222, 255),
    )
    d.rectangle([0, H - 8, W, H], fill=(34, 211, 238))
    d.rectangle([W // 2, H - 8, W, H], fill=(192, 38, 211))
    card.save(os.path.join(PUB, "og.png"), optimize=True)
    print("  %-28s %d bytes" % ("og.png", os.path.getsize(os.path.join(PUB, "og.png"))))

    print("\nDone. All icons regenerated from icon.svg and icon-maskable.svg.")


if __name__ == "__main__":
    main()
