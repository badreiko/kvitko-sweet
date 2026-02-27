import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if the user has already consented or declined
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            // Small delay so it slides in nicely after load
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "accepted");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookieConsent", "declined");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-full duration-500 ease-out sm:pb-6 pointer-events-none">
            <div className="container-custom max-w-4xl mx-auto pointer-events-auto">
                <div className="bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">

                    <button
                        onClick={handleDecline}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                        aria-label="Zavřít"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex-1 pr-6">
                        <h3 className="font-serif font-bold text-lg mb-2">Používáme Cookies 🍪</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Naše webová stránka používá soubory cookies k zajištění správného fungování,
                            analýze návštěvnosti a personalizaci reklam podle vašich preferencí.
                            Kliknutím na „Souhlasím se vším“ nám udělíte souhlas s jejich použitím.
                            Více informací naleznete v našich{" "}
                            <Link to="/cookies" className="text-primary hover:underline font-medium">Zásadách používání cookies</Link>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0">
                        <Button
                            variant="outline"
                            className="rounded-full w-full sm:w-auto"
                            onClick={handleDecline}
                        >
                            Odmítnout nesouhlasím
                        </Button>
                        <Button
                            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md w-full sm:w-auto"
                            onClick={handleAccept}
                        >
                            Souhlasím se vším
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
