import { useRef, type CSSProperties, type PointerEvent } from 'react';

interface HeroArtProps {
  desktopImage?: string;
  alt: string;
  fit: 'cover' | 'contain';
  decorations: boolean;
  signatureKicker?: string;
  signatureTitle?: string;
  /** Пропорция (ширина / высота) на всех экранах; null — высота по экрану. */
  ratio?: number | null;
  /**
   * Предпросмотр в админке: устройство задаётся явно, а не медиазапросами,
   * потому что окно админки всегда «компьютерное».
   */
  preview?: { device: 'desktop' | 'mobile'; height: number };
  /** Наклон за курсором. */
  interactive?: boolean;
  /** Пока настройки не загружены — не показываем запасную картинку, чтобы не мигала. */
  pending?: boolean;
}

/**
 * Букет Hero с декором из сезонного примера: тёплое свечение, тонкая арка,
 * подпись и лёгкий 3D-наклон за курсором мыши. Используется и на главной,
 * и в предпросмотре админки, чтобы вид совпадал.
 *
 * Размер области: без пропорции — ширина колонки и высота по экрану
 * (.hero-art__frame в index.css); с пропорцией — область получает
 * aspect-ratio и сужается так, чтобы не превышать максимальную высоту.
 */
export function HeroArt({
  desktopImage,
  alt,
  fit,
  decorations,
  signatureKicker,
  signatureTitle,
  ratio = null,
  preview,
  interactive = true,
  pending = false,
}: HeroArtProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tilt = (x: number, y: number) => {
    rootRef.current?.style.setProperty('--tilt-x', x.toFixed(3));
    rootRef.current?.style.setProperty('--tilt-y', y.toFixed(3));
  };
  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    tilt(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
  };
  const decorated = decorations && fit === 'contain';
  const hasSignature = decorated && Boolean(signatureTitle?.trim());

  let rootClass = 'hero-art';
  let rootStyle: CSSProperties | undefined;
  let frameStyle: CSSProperties | undefined;
  if (preview) {
    if (ratio) {
      rootStyle = { width: `min(100%, ${Math.round(preview.height * ratio)}px)`, marginInline: 'auto' };
      frameStyle = { aspectRatio: String(ratio) };
    } else {
      frameStyle = { height: preview.height };
    }
  } else {
    rootClass += ' hero-art--sized';
    if (ratio) {
      rootClass += ' hero-art--ratio';
      rootStyle = { '--hero-ratio': String(ratio) } as CSSProperties;
    }
  }
  if (decorated) rootClass += ' hero-art--decor';

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={rootStyle}
      onPointerMove={interactive && decorated ? handleMove : undefined}
      onPointerLeave={interactive && decorated ? () => tilt(0, 0) : undefined}
    >
      {decorated && (
        <>
          <div className="hero-art__glow" aria-hidden="true" />
          <div className="hero-art__arch" aria-hidden="true" />
        </>
      )}
      <div className="hero-art__subject">
        <picture
          className={`hero-art__frame block w-full ${fit === 'cover' ? 'overflow-hidden rounded-xl shadow-xl' : ''}`}
          style={frameStyle}
        >
          {!pending && desktopImage && (
            <>
              <img
                src={desktopImage}
                alt={alt}
                loading="eager"
                // React 18 не знает fetchPriority — передаём атрибут в нижнем регистре.
                {...{ fetchpriority: 'high' }}
                decoding="async"
                draggable={false}
                className={`h-full w-full select-none ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
              />
            </>
          )}
        </picture>
      </div>
      {hasSignature && (
        <div className="hero-art__signature">
          {signatureKicker?.trim() && <span>{signatureKicker}</span>}
          <strong>{signatureTitle}</strong>
        </div>
      )}
    </div>
  );
}
