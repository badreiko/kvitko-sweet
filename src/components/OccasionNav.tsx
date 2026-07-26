// src/components/OccasionNav.tsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import homeBirthdayIcon from "@/assets/icons/home/home-birthday.webp";
import homeWeddingIcon from "@/assets/icons/home/home-wedding.webp";
import homeValentineIcon from "@/assets/icons/home/home-valentine.webp";
import homeThanksIcon from "@/assets/icons/home/home-thanks.webp";
import homeOtherGiftIcon from "@/assets/icons/home/home-other-gift.webp";

/**
 * Список поводов покупки цветов. Ключи используются как значение
 * фильтра `?occasion=` в каталоге. Соответствующее поле продукта —
 * `Product.occasions: string[]`.
 *
 * Специфика цветочного бизнеса: 40% покупок делаются по поводу, а не по
 * типу товара. Клиент ищет «на день рождения», а не «розы» — occasion
 * nav помогает быстро определиться.
 */
const OCCASIONS = [
  {
    key: "birthday",
    icon: homeBirthdayIcon,
    title: "Narozeniny",
    subtitle: "Klasika i překvapení",
    accent: "from-amber-500/10 to-orange-500/10",
  },
  {
    key: "wedding",
    icon: homeWeddingIcon,
    title: "Svatba",
    subtitle: "Kytice pro nevěsty",
    accent: "from-rose-500/10 to-pink-500/10",
  },
  {
    key: "valentine",
    icon: homeValentineIcon,
    title: "Valentýn",
    subtitle: "Vyznání lásky",
    accent: "from-red-500/10 to-rose-500/10",
  },
  {
    key: "thanks",
    icon: homeThanksIcon,
    title: "Poděkování",
    subtitle: "Když prostě záleží",
    accent: "from-green-500/10 to-emerald-500/10",
  },
] as const;

export function OccasionNav() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-custom">
        <div className="text-center mb-8 md:mb-10">
          {/* Размер приведён к остальным «средним» секциям главной
              (Featured Products, Categories, Testimonials) — text-3xl md:text-4xl.
              Раньше было text-2xl md:text-3xl — секция визуально «терялась». */}
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-3">
            Kupujete podle <span className="text-primary italic">příležitosti?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nechte nás pomoct s výběrem. Klikněte na příležitost — ukážeme kytice, které se pro ni hodí.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {OCCASIONS.map((o) => {
            return (
              <Link
                key={o.key}
                to={`/catalog?occasion=${o.key}`}
                className={`group relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/60 bg-gradient-to-br ${o.accent} hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 md:p-6 flex flex-col items-start gap-3 min-h-[130px] md:min-h-[160px]`}
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <img
                    src={o.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-8 w-8 md:h-9 md:w-9 object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <h3 className="font-serif font-bold text-lg md:text-xl leading-tight text-foreground">
                    {o.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {o.subtitle}
                  </p>
                </div>
                <ArrowRight className="absolute top-5 right-5 md:top-6 md:right-6 h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>

        <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <img
            src={homeOtherGiftIcon}
            alt=""
            aria-hidden="true"
            className="h-6 w-6 object-contain"
          />
          <span>Nebo dárek na jinou příležitost — napište nám a poradíme.</span>
        </div>
      </div>
    </section>
  );
}

export default OccasionNav;
