import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Check,
  Loader2,
  MessageSquare,
  ShoppingCart,
  Flower2,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import { getSiteSettings, SiteSettings, defaultSettings } from "@/firebase/services/settingsService";

const subjects = [
  { value: "general", label: "Obecný dotaz", icon: MessageSquare },
  { value: "order", label: "Objednávka", icon: ShoppingCart },
  { value: "custom", label: "Vlastní kytice", icon: Flower2 },
  { value: "other", label: "Jiné", icon: HelpCircle },
];

const faqItems = [
  {
    q: "Jak dlouho dopředu je třeba objednat?",
    a: "Pro běžné objednávky doporučujeme alespoň 24 hodin předem. Pro větší akce (svatby atp.) doporučujeme rezervovat několik týdnů dopředu."
  },
  {
    q: "Jaké jsou možnosti doručení?",
    a: "Doručujeme po celé Praze a okolí. Můžete si také vyzvednout osobně v naší prodejně."
  },
  {
    q: "Mohu objednat na konkrétní čas?",
    a: "Ano, nabízíme doručení v konkrétním 2hodinovém okně za příplatek. Kontaktujte nás pro více informací."
  },
  {
    q: "Jak dlouho vydrží vaše květiny?",
    a: "Naše květiny jsou vždy čerstvé a při správné péči vydrží 7–14 dní. Ke každé kytici přikládáme návod na péči."
  },
];

export default function Contact() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "general", message: "" });
    }, 1500);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 pt-20 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border/50 text-sm font-medium text-muted-foreground mb-6 shadow-sm">
              <Mail className="h-4 w-4 text-primary" /> Jsme tu pro vás
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight">
              Kontaktujte <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic font-light pr-2">nás</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Máte dotaz nebo chcete objednat květiny? Neváhejte nás kontaktovat – rádi vám poradíme.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content: Form + Info cards */}
      <section className="py-20">
        <div className="container-custom">
          {/* Two cards side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch mb-16">

            {/* LEFT: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <h2 className="text-2xl font-serif font-bold mb-8">Napište nám</h2>
              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
                      >
                        <Check className="h-10 w-10 text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-serif font-bold mb-3">Zpráva odeslána!</h3>
                      <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
                        Děkujeme za vaši zprávu. Budeme vás kontaktovat co nejdříve.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="rounded-full px-8 border-border/50"
                      >
                        Odeslat další zprávu
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {/* Name + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Jméno a příjmení <span className="text-red-500">*</span></Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Jan Novák"
                            required
                            className="rounded-xl border-border/50 bg-background focus-visible:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">E-mail <span className="text-red-500">*</span></Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="jan@email.cz"
                            required
                            className="rounded-xl border-border/50 bg-background focus-visible:ring-primary/20"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Telefon <span className="text-muted-foreground font-normal">(nepovinné)</span></Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+420 123 456 789"
                          className="rounded-xl border-border/50 bg-background focus-visible:ring-primary/20"
                        />
                      </div>

                      {/* Subject */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Předmět zprávy</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {subjects.map(({ value, label, icon: Icon }) => {
                            const isActive = formData.subject === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, subject: value }))}
                                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border text-sm font-medium transition-all duration-300 ${isActive
                                  ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                                  : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/30"
                                  }`}
                              >
                                <Icon className="h-5 w-5" />
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">Zpráva <span className="text-red-500">*</span></Label>
                        <Textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Napište nám..."
                          required
                          className="rounded-xl border-border/50 bg-background focus-visible:ring-primary/20 resize-none text-base"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full h-14 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Odesílání...</>
                        ) : (
                          <><Send className="mr-2 h-4 w-4" /> Odeslat zprávu</>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* RIGHT: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 flex flex-col"
            >
              <h2 className="text-2xl font-serif font-bold mb-8">Kontaktní informace</h2>
              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] divide-y divide-border/50 flex-1">
                {/* Address */}
                <div className="flex items-start gap-5 pb-6">
                  <div className="bg-primary/10 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Adresa</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{settings.address}</p>
                    <p className="text-muted-foreground text-sm">110 00 Praha 1</p>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-start gap-5 py-6">
                  <div className="bg-primary/10 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Telefon</p>
                    <a href={`tel:${settings.contactPhone}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      {settings.contactPhone}
                    </a>
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-start gap-5 py-6">
                  <div className="bg-primary/10 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">E-mail</p>
                    <a href={`mailto:${settings.contactEmail}`} className="text-muted-foreground text-sm hover:text-primary transition-colors break-all">
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>
                {/* Opening Hours */}
                <div className="flex items-start gap-5 pt-6">
                  <div className="bg-primary/10 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-primary mt-0.5">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-3">Otevírací doba</p>
                    <div className="space-y-2 text-sm">
                      {[
                        { day: "Pondělí – Pátek", hours: settings.openingHours?.weekdays || "9:00 – 19:00" },
                        { day: "Sobota", hours: settings.openingHours?.saturday || "9:00 – 17:00" },
                        { day: "Neděle", hours: settings.openingHours?.sunday || "10:00 – 15:00" },
                      ].map(({ day, hours }) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="text-muted-foreground">{day}</span>
                          <span className="font-medium bg-muted/50 px-2.5 py-0.5 rounded-lg text-xs">{hours}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      * O svátcích může být otevírací doba upravena.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map – full width, centered below both cards */}
          {settings.mapEmbedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-2xl font-serif font-bold mb-6 text-center">
                Kde nás <span className="text-primary italic">najdete</span>
              </h2>
              <div className="rounded-3xl overflow-hidden border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full h-[420px]">
                <iframe
                  src={settings.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa"
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-3">Často kladené otázky</h2>
            <p className="text-muted-foreground">Odpovědi na nejčastější dotazy našich zákazníků.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen
                    ? "bg-background border-primary/30 shadow-sm"
                    : "bg-background/60 border-border/50 hover:border-primary/30 hover:bg-background"
                    }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                  >
                    <h3 className={`font-semibold text-base transition-colors ${isOpen ? "text-primary" : "text-foreground"}`}>
                      {item.q}
                    </h3>
                    <div className={`flex-shrink-0 ml-4 h-7 w-7 rounded-full border flex items-center justify-center transition-all ${isOpen ? "border-primary/50 text-primary rotate-45" : "border-border/50 text-muted-foreground"}`}>
                      <span className="text-lg leading-none">+</span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}