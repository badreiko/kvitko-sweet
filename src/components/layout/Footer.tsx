import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Logo from "./Logo";
import { getSiteSettings, SiteSettings, defaultSettings } from "@/firebase/services/settingsService";

const Footer = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error loading footer settings:", error);
      }
    };
    loadSettings();
  }, []);

  return (
    <footer className="bg-muted/50 border-t border-border/50 pt-16 pb-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Logo className="mb-4" />
            <p className="text-muted-foreground mb-4">
              Květinové studio s ukrajinským nádechem. Nabízíme čerstvé květiny,
              originální kytice a dekorace pro každou příležitost.
            </p>
            <div className="flex gap-3 mt-2">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="w-10 h-10 rounded-full border border-border/50 bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-border/50 bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-5">Rychlé odkazy</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Katalog
                </Link>
              </li>
              <li>
                <Link to="/custom-bouquet" className="text-muted-foreground hover:text-foreground transition-colors">
                  Vlastní kytice
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-muted-foreground hover:text-foreground transition-colors">
                  Doručení
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  O nás
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-5">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {settings.address || "Adresa není nastavena"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {settings.contactPhone || "Telefon není nastaven"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {settings.contactEmail || "Email není nastaven"}
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Otevírací doba</h4>
              <p className="text-muted-foreground">Po-Pá: {settings.openingHours?.weekdays || "9:00 - 19:00"}</p>
              <p className="text-muted-foreground">So: {settings.openingHours?.saturday || "9:00 - 17:00"}</p>
              <p className="text-muted-foreground">Ne: {settings.openingHours?.sunday || "10:00 - 15:00"}</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-5">Odběr novinek</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Přihlaste se k odběru novinek a získejte 10% slevu na první nákup.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Váš e-mail" type="email" className="rounded-xl border-border/50 bg-background focus-visible:ring-primary/20" />
              <Button className="rounded-full shrink-0 px-4">Odebírat</Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {settings.siteName || "Kvitko Sweet"}. Všechna práva vyhrazena.
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Obchodní podmínky
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Ochrana soukromí
            </Link>
            <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;