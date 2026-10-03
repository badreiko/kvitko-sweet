import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/firebase/services/productService";
import { ProductCard } from "./ProductCard";

interface ProductCarouselProps {
    products: Product[];
}

/**
 * Карусель товаров для компьютера/планшета: ровно 4 (lg) или 3 (md) полные
 * карточки в ширину контейнера, листание стрелками, колесом/тачпадом и
 * свайпом (нативная прокрутка со snap). Без затемнения краёв — раньше
 * крайняя карточка пряталась под градиентом.
 */
export function ProductCarousel({ products }: ProductCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const updateArrows = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        setCanPrev(track.scrollLeft > 4);
        setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
    }, []);

    useEffect(() => {
        updateArrows();
        const track = trackRef.current;
        if (!track) return;
        track.addEventListener("scroll", updateArrows, { passive: true });
        window.addEventListener("resize", updateArrows);
        return () => {
            track.removeEventListener("scroll", updateArrows);
            window.removeEventListener("resize", updateArrows);
        };
    }, [products, updateArrows]);

    const scrollByPage = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-16 border border-dashed border-border/60 rounded-3xl bg-muted/10">
                <p className="text-muted-foreground">Zatím zde nejsou žádné produkty.</p>
            </div>
        );
    }

    const arrowClass =
        "absolute top-[38%] -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-background/95 shadow-lg border border-season-line flex items-center justify-center text-foreground hover:text-season-accent transition-colors disabled:opacity-0 disabled:pointer-events-none";

    return (
        <div className="relative">
            {/* pt-4: место для товара с эффектом объёма, выступающего над карточкой */}
            <div
                ref={trackRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory pt-4 pb-6 -mt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="snap-start shrink-0 basis-[calc((100%-3rem)/3)] lg:basis-[calc((100%-4.5rem)/4)]"
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            <button type="button" aria-label="Předchozí produkty" className={`${arrowClass} -left-5`} disabled={!canPrev} onClick={() => scrollByPage(-1)}>
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Další produkty" className={`${arrowClass} -right-5`} disabled={!canNext} onClick={() => scrollByPage(1)}>
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}
