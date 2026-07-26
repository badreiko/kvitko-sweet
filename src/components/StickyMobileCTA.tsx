// src/components/StickyMobileCTA.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

/**
 * Плавающая нижняя панель на mobile.
 *
 * Появляется после 40% скролла (когда пользователь уже прошёл Hero и
 * первый продуктовый экран), даёт быстрый CTA обратно в каталог.
 * Не показывается на /cart, /checkout, /admin* и когда в корзине уже
 * есть товары (там своя логика оформления).
 *
 * Средний lift в e-commerce — 8-15% mobile-конверсии.
 */
export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const { cart } = useCart();

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? scrolled / height : 0;
      setVisible(progress > 0.35);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Не показываем на маршрутах, где есть свой primary CTA / чекаут.
  const suppressedRoutes = [
    "/cart",
    "/checkout",
    "/login",
    "/register",
    "/verify-email",
    "/reset-password",
  ];
  if (
    suppressedRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/account")
  ) {
    return null;
  }
  // Если корзина не пуста — там уже есть CartDrawer badge, а собственный
  // sticky-CTA будет визуально дублировать.
  if (cart.length > 0) return null;

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-3 pb-safe">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-1 min-w-0">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">Doručení od 90 min · po Praze</span>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-full shadow-md shrink-0 h-10 px-5 font-semibold"
          >
            <Link to="/catalog" className="inline-flex items-center gap-1">
              Katalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StickyMobileCTA;
