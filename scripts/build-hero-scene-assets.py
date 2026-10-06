"""
Слои сцен Hero (src/lib/heroScenes/*.json) → лёгкие WebP в src/assets/hero-scenes/.

Исходники — PNG по 1–2.5 МБ (папка прототипа, в Git не хранится):
    python scripts/build-hero-scene-assets.py Halloween-Complete/assets

Каждый слой уменьшается до самого крупного размера, в котором он реально
стоит в сценах (сцена — 1000 единиц по ширине ≈ STAGE_PX пикселей), и
получает цветовой фильтр прототипа (saturate .82, brightness .94,
contrast 1.04) — чтобы браузеру не пересчитывать CSS-фильтр каждый кадр.

Затем для каждой сцены считается «кадр» (view) — границы всего видимого
с учётом поворота и прозрачности слоёв. Сайт показывает сцену ровно в этих
границах: ничего не обрезается, композиция только масштабируется.
Без исходников (папки нет) пересчитываются только кадры:
    python scripts/build-hero-scene-assets.py
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


# Пиксель слоя считается видимым, если его итоговая непрозрачность выше 8 %.
VISIBLE = 0.08
# Поля кадра в единицах сцены: запас на отталкивание цветков курсором.
PAD = 14


def read_scene(path: pathlib.Path) -> dict:
    data = json.loads(path.read_text(encoding='utf-8'))
    return data if isinstance(data, dict) else {'view': None, 'layers': data}


def write_scene(path: pathlib.Path, data: dict) -> None:
    rows = ',\n'.join('    ' + json.dumps(row) for row in data['layers'])
    text = '{\n  "view": ' + json.dumps(data['view']) + ',\n  "layers": [\n' + rows + '\n  ]\n}\n'
    path.write_text(text, encoding='utf-8')


def layer_bounds(asset: str, x: float, y: float, w: float, angle: float, opacity: float):
    """Границы видимой части слоя в единицах сцены."""
    im = Image.open(OUT / f'{asset}.webp').convert('RGBA')
    threshold = min(255, math.ceil(VISIBLE / max(opacity, 1e-3) * 255))
    mask = im.getchannel('A').point(lambda v: 255 if v >= threshold else 0)
    # CSS rotate(+a) — по часовой, PIL rotate(+deg) — против.
    rotated = mask.rotate(-math.degrees(angle), resample=Image.NEAREST, expand=True)
    box = rotated.getbbox()
    if not box:
        return None
    unit = w / im.width
    cx, cy = rotated.width / 2, rotated.height / 2
    return (x + (box[0] - cx) * unit, y + (box[1] - cy) * unit, x + (box[2] - cx) * unit, y + (box[3] - cy) * unit)


def update_views() -> None:
    for path in sorted(SCENES.glob('*.json')):
        data = read_scene(path)
        bounds = [b for row in data['layers'] if (b := layer_bounds(*row[:6]))]
        x0 = min(b[0] for b in bounds) - PAD
        y0 = min(b[1] for b in bounds) - PAD
        x1 = max(b[2] for b in bounds) + PAD
        # Снизу без поля: мох и тыквы стоят на нижнем крае секции.
        y1 = max(b[3] for b in bounds)
        data['view'] = [round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)]
        write_scene(path, data)
        print(f'{path.stem}: кадр {data["view"]} ({(x1 - x0) / (y1 - y0):.3f} : 1)')


def main(source_dir: str) -> None:
    widest: dict[str, float] = {}
    for scene in sorted(SCENES.glob('*.json')):
        for asset, _x, _y, w, *_rest in read_scene(scene)['layers']:
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
    source = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'Halloween-Complete' / 'assets')
    if source.is_dir():
        main(str(source))
    update_views()
