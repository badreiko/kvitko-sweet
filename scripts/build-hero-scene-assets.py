"""
Слои сцен Hero (src/lib/heroScenes/*.json) → лёгкие WebP в src/assets/hero-scenes/.

Исходники — PNG по 1–2.5 МБ (папка прототипа, в Git не хранится):
    python scripts/build-hero-scene-assets.py Halloween-Complete/assets

Каждый слой уменьшается до самого крупного размера, в котором он реально
стоит в сценах (сцена — 1000 единиц по ширине ≈ STAGE_PX пикселей), и
получает цветовой фильтр прототипа (saturate .82, brightness .94,
contrast 1.04) — чтобы браузеру не пересчитывать CSS-фильтр каждый кадр.
"""
import json
import math
import pathlib
import sys

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCENES = ROOT / 'src' / 'lib' / 'heroScenes'
OUT = ROOT / 'src' / 'assets' / 'hero-scenes'

# Ширина сцены в пикселях, под которую готовим слои: ~1100 px на экране
# при двойной плотности (Retina). Больше — тяжелее без заметной разницы.
STAGE_PX = 2200
# Размытые и полупрозрачные слои не требуют чёткости.
SOFT = {'background-gold': 0.45, 'background-green': 0.45, 'contact-shadow': 0.5}
QUALITY = 80


def css_filter(rgb: np.ndarray) -> np.ndarray:
    s, brightness, contrast = 0.82, 0.94, 1.04
    m = np.array([
        [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s],
        [0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s],
        [0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s],
    ])
    v = np.clip(rgb @ m.T, 0, 1)
    v = np.clip(v * brightness, 0, 1)
    return np.clip((v - 0.5) * contrast + 0.5, 0, 1)


def main(source_dir: str) -> None:
    widest: dict[str, float] = {}
    for scene in sorted(SCENES.glob('*.json')):
        for asset, _x, _y, w, *_rest in json.loads(scene.read_text(encoding='utf-8')):
            widest[asset] = max(widest.get(asset, 0), w)

    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for asset, w in sorted(widest.items()):
        src = pathlib.Path(source_dir) / f'{asset}.png'
        im = Image.open(src).convert('RGBA')
        target = min(im.width, math.ceil(w / 1000 * STAGE_PX * SOFT.get(asset, 1)))
        if target < im.width:
            im = im.resize((target, round(im.height * target / im.width)), Image.LANCZOS)
        data = np.asarray(im).astype(np.float32) / 255
        data[..., :3] = css_filter(data[..., :3])
        im = Image.fromarray((data * 255 + 0.5).astype(np.uint8))
        dest = OUT / f'{asset}.webp'
        im.save(dest, 'WEBP', quality=QUALITY, alpha_quality=85, method=6)
        size = dest.stat().st_size
        total += size
        print(f'{asset:22s} {im.width:5d}x{im.height:<5d} {size / 1024:7.1f} KB')
    for stale in OUT.glob('*.webp'):
        if stale.stem not in widest:
            stale.unlink()
            print(f'удалён лишний {stale.name}')
    print(f'итого {len(widest)} файлов, {total / 1024 / 1024:.2f} МБ')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'Halloween-Complete' / 'assets'))
