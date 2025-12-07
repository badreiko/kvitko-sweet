// src/components/FadeSlider.tsx
import { useState, useEffect } from 'react';

interface FadeSliderProps {
    images: string[];
    fallbackImage?: string;
    interval?: number; // в миллисекундах
    alt?: string;
    className?: string;
}

/**
 * Компонент слайдера с плавным переходом (fade) между изображениями.
 * Автоматически переключает изображения по таймеру.
 */
export function FadeSlider({
    images,
    fallbackImage,
    interval = 5000,
    alt = 'Slider image',
    className = ''
}: FadeSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Определяем список изображений для показа
    const displayImages = images.length > 0 ? images : (fallbackImage ? [fallbackImage] : []);

    useEffect(() => {
        // Если только одно изображение или нет изображений - не запускаем таймер
        if (displayImages.length <= 1) return;

        const timer = setInterval(() => {
            setIsTransitioning(true);

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % displayImages.length);
                setIsTransitioning(false);
            }, 500); // Время перехода
        }, interval);

        return () => clearInterval(timer);
    }, [displayImages.length, interval]);

    // Если нет изображений - ничего не показываем
    if (displayImages.length === 0) {
        return null;
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <img
                src={displayImages[currentIndex]}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
            />

            {/* Индикаторы (точки) */}
            {displayImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {displayImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setIsTransitioning(true);
                                setTimeout(() => {
                                    setCurrentIndex(index);
                                    setIsTransitioning(false);
                                }, 500);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-white w-4'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Перейти к изображению ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FadeSlider;
