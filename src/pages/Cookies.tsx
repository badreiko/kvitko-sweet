import Layout from "@/components/layout/Layout";

export default function Cookies() {
    return (
        <Layout>
            <div className="container-custom py-24 min-h-[60vh]">
                <h1 className="text-4xl font-serif font-bold mb-8">Zásady používání souborů cookies</h1>
                <div className="prose prose-stone max-w-none">
                    <p className="lead text-lg text-muted-foreground mb-6">
                        Abychom vám usnadnili používání našeho e-shopu a mohli ho neustále zlepšovat, využíváme tzv. cookies.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">1. Co jsou to cookies?</h2>
                    <p>
                        Cookies jsou malé textové soubory, které se ukládají ve vašem prohlížeči nebo zařízení, když navštívíte náš web. Pomáhají nám pamatovat si vaše preference (např. zboží v košíku, jazyk nebo souhlas s cookies) a pochopit, jak náš web používáte.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">2. Jaké druhy cookies používáme?</h2>

                    <h3 className="text-xl font-serif font-medium mt-6 mb-2">A) Nezbytné (Funkční) cookies</h3>
                    <p>
                        Tyto cookies jsou naprosto nutné pro správné fungování webu. Bez nich byste nemohli např. přidat kytici do košíku nebo se přihlásit do svého účtu. Na tyto cookies nepožadujeme váš souhlas, protože bez nich by web vůbec nefungoval.
                    </p>

                    <h3 className="text-xl font-serif font-medium mt-6 mb-2">B) Analytické a sledovací cookies</h3>
                    <p>
                        Pomáhají nám měřit, co se na webu děje – kolik lidí si jakou kytici prohlíží, odkud k nám přišli a kde na stránce tráví nejvíce času. K tomu využíváme nástroje třetích stran (např. Google Analytics). Tyto cookies zapínáme, jen pokud nám k tomu dáte souhlas v našem vyskakovacím Cookie panelu.
                    </p>

                    <h3 className="text-xl font-serif font-medium mt-6 mb-2">C) Marketingové cookies</h3>
                    <p>
                        Díky těmto cookies vám můžeme zobrazovat relevantní reklamu na jiných webech a sociálních sítích (např. Facebook Pixel). Tyto cookies také spouštíme pouze tehdy, získáme-li k tomu váš dobrovolný souhlas prostřednictvím Cookie banneru.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">3. Jak můžete spravovat nebo odmítnout nastavení cookies?</h2>
                    <p>
                        Výchozí nastavení povolování nebo zakazování analytických a marketingových cookies můžete upravit přímo v našem Cookie banneru, jenž se vám zobrazí při první návštěvě stránky (případně jej můžete vyvolat promazáním historie cookies).
                        <br /><br />
                        Ukládání všech cookies (včetně těch technických) můžete také kompletně zablokovat přímo v nastavení vašeho webového prohlížeče (Chrome, Safari, Firefox, Edge atd.). Upozorňujeme však, že pokud v prohlížeči zakážete všechny cookies, náš web u vás nebude správně fungovat (nepůjde dokončit objednávku).
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">4. Správce a kontakt</h2>
                    <p>
                        Správcem dat shromážděných z cookies je majitel e-shopu <strong>Yevheniia Hula</strong>, IČO: 23484586, kontaktní adresa: Táborská 750/20, 140 00, Praha 4 - Nusle.<br />
                        Více informací o tom, jak nakládáme s vašimi dalšími osobními údaji, se dočtete na stránce <a href="/privacy" className="text-primary hover:underline">Zásady zpracování osobních údajů</a>.
                    </p>
                </div>
            </div>
        </Layout>
    );
}
