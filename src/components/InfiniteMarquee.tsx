import * as React from "react";
import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
    items: React.ReactNode[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}

export function InfiniteMarquee({
    items,
    direction = "left",
    speed = "normal",
    pauseOnHover = true,
    className,
}: InfiniteMarqueeProps) {
    const speedClass =
        speed === "fast" ? "animate-marquee-fast" :
            speed === "slow" ? "animate-marquee-slow" :
                "animate-marquee";

    return (
        <div
            className={cn(
                "flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
                className
            )}
        >
            <div
                className={cn(
                    "flex min-w-full shrink-0 gap-6 py-4 px-3",
                    direction === "left" ? speedClass : `${speedClass} [animation-direction:reverse]`,
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
            >
                {items.map((item, i) => (
                    <div key={`marquee-item-1-${i}`} className="shrink-0">
                        {item}
                    </div>
                ))}
            </div>

            {/* Дублируем элементы для создания эффекта бесконечности */}
            <div
                className={cn(
                    "flex min-w-full shrink-0 gap-6 py-4 px-3",
                    direction === "left" ? speedClass : `${speedClass} [animation-direction:reverse]`,
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
                aria-hidden="true"
            >
                {items.map((item, i) => (
                    <div key={`marquee-item-2-${i}`} className="shrink-0">
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
