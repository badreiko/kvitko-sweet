import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Product } from "@/firebase/services/productService";
import { ProductCard } from "./ProductCard";

interface ProductCarouselProps {
    products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
    const [width, setWidth] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (carouselRef.current && innerRef.current) {
            setWidth(innerRef.current.scrollWidth - carouselRef.current.offsetWidth);
        }

        const handleResize = () => {
            if (carouselRef.current && innerRef.current) {
                setWidth(innerRef.current.scrollWidth - carouselRef.current.offsetWidth);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [products]);

    // Если товаров мало, нет смысла в карусели, показываем обычную сетку
    if (products.length <= 4) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden cursor-grab active:cursor-grabbing w-full pb-8" ref={carouselRef}>
            <motion.div
                ref={innerRef}
                drag="x"
                dragConstraints={{ right: 0, left: -width }}
                whileTap={{ cursor: "grabbing" }}
                className="flex gap-6 px-4 md:px-0"
            >
                {products.map((product) => (
                    <motion.div
                        key={product.id}
                        className="min-w-[80vw] sm:min-w-[280px] md:min-w-[320px] shrink-0"
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </motion.div>

            {/* Индикация свайпа для десктопа/мобилки */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-full bg-gradient-to-l from-background to-transparent pointer-events-none hidden md:block" />
        </div>
    );
}
