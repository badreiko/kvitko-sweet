import { forwardRef, lazy, Suspense, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import MagneticButton from '@/components/MagneticButton';
import type { HeroThemeContent, HeroThemeId } from '@/firebase/services/settingsService';
import { mobileCropBox, type HeroSceneId } from '@/lib/heroScenes';

// Слои и физика сцены грузятся отдельным файлом — только если тема со сценой.
const HeroScene = lazy(() => import('@/components/home/HeroScene'));

interface HeroSceneSectionProps {
  themeId: HeroThemeId;
  content: HeroThemeContent;
  scene: HeroSceneId;
  /** Настройки загружены — до этого не показываем ни текст, ни сцену. */
  ready: boolean;
}

/** Обрезка сцены на телефоне (см. HERO_SCENES.mobileCrop) — через CSS-переменные. */
function cropStyle(scene: HeroSceneId): CSSProperties {
  const box = mobileCropBox(scene);
  return {
    '--crop-ratio': String(box.ratio),
    '--crop-left': box.left,
    '--crop-top': box.top,
    '--crop-width': box.width,
    '--crop-height': box.height,
  } as CSSProperties;
}

/**
 * Hero темы в режиме «Сцена»: текст слева, справа живая сцена из слоёв
 * (на телефоне — сцена под текстом). Тексты — из настроек темы в админке.
 */
export const HeroSceneSection = forwardRef<HTMLElement, HeroSceneSectionProps>(function HeroSceneSection(
  { themeId, content, scene, ready },
  ref,
) {
  const [pulse, setPulse] = useState(0);
  const lastPulse = useRef(0);
  // Наведение на кнопку пускает волну по цветам — не чаще раза в 3 секунды.
  const wave = () => {
    const now = Date.now();
    if (now - lastPulse.current < 3000) return;
    lastPulse.current = now;
    setPulse(value => value + 1);
  };
  const kicker = content.signatureKicker?.trim();
  const caption = content.signatureTitle?.trim();

  return (
    <section
      ref={ref}
      data-theme-palette={themeId}
      className="hero-theme hero-theme--scene hero-scene-layout relative overflow-hidden flex flex-col lg:justify-center pt-8 md:pt-12 lg:py-14"
    >
      {/* Мягкая подложка под текстом: цветы сцены не мешают читать (только компьютер). */}
      <div className="hero-scene-veil" aria-hidden="true" />

      <div className={`container-custom w-full relative z-10 pointer-events-none transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hero-scene-copy pointer-events-auto space-y-4 md:space-y-6"
        >
          <p className="hero-eyebrow">{content.eyebrow}</p>
          <h1 className="font-serif font-normal text-[2.75rem] sm:text-6xl lg:text-[3.6rem] xl:text-7xl leading-[0.98] tracking-tight text-foreground mt-0">
            {content.title}
            <span className="block italic" style={{ color: 'var(--theme-accent)' }}>{content.highlight}</span>
          </h1>
          {content.description?.trim() && (
            <p className="text-base md:text-lg text-muted-foreground max-w-md">{content.description}</p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1 md:pt-2">
            <MagneticButton className="w-full sm:w-auto">
              <Button
                size="lg"
                className="rounded-full px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto h-12"
                onPointerEnter={wave}
                onFocus={wave}
                asChild
              >
                <Link to="/catalog">
                  {content.primaryLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </MagneticButton>
            {content.secondaryLabel?.trim() && (
              <Link
                to="/custom-bouquet"
                className="text-sm text-muted-foreground hover:text-season-accent transition-colors inline-flex items-center gap-1 underline underline-offset-4 decoration-season-line hover:decoration-current"
              >
                {content.secondaryLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {(kicker || caption) && (
            <p className="hero-scene-caption pt-2 md:pt-4">
              {kicker && <span className="hero-scene-kicker">{kicker}</span>}
              {caption}
            </p>
          )}
        </motion.div>
      </div>

      <div className="hero-scene-frame mt-4 lg:mt-0" style={cropStyle(scene)}>
        {ready && (
          <Suspense fallback={null}>
            <HeroScene scene={scene} pulse={pulse} />
          </Suspense>
        )}
      </div>

    </section>
  );
});
