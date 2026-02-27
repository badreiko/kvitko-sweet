import Layout from "@/components/layout/Layout";

export default function Privacy() {
    return (
        <Layout>
            <div className="container-custom py-24 min-h-[60vh]">
                <h1 className="text-4xl font-serif font-bold mb-8">Zásady zpracování osobních údajů</h1>
                <div className="prose prose-stone max-w-none">
                    <p className="lead text-lg text-muted-foreground mb-6">
                        Záleží nám na vašem soukromí. Zde se dozvíte, jak zpracováváme a chráníme vaše osobní údaje dle nařízení GDPR.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">1. Správce osobních údajů</h2>
                    <p>
                        Správcem vašich osobních údajů je: <br />
                        <strong>Yevheniia Hula</strong><br />
                        Sídlo: Táborská 750/20, 140 00, Praha 4 - Nusle<br />
                        IČO: 23484586<br />
                        Subjekt zapsaný v živnostenském rejstříku.<br /><br />
                        Budeme s vašimi osobními údaji nakládat podle níže specifikovaných pravidel.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">2. Jaké údaje zpracováváme?</h2>
                    <p>
                        Zpracováváme tyto údaje, které nám sami při nákupu či komunikaci poskytnete:<br />
                        <ul>
                            <li>Jméno a příjmení kupujícího</li>
                            <li>E-mailová adresa a telefonní číslo</li>
                            <li>Fakturační adresa</li>
                            <li>Doručovací adresa (včetně jména příjemce a telefonního čísla obdarovaného pro potřeby doručení kurýrem)</li>
                            <li>Záznamy o historii nákupů</li>
                            <li>IP adresa a informace o vašem internetovém prohlížeči.</li>
                        </ul>
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">3. Proč údaje zpracováváme? (Účel a právní základ)</h2>
                    <p>
                        Vaše osobní údaje zpracováváme z těchto legitimních důvodů:<br />
                        <strong>a) Vytvoření a doručení objednávky:</strong> Potřebujeme znát, komu kytici doručujeme a na jaké telefonní číslo kurýr zavolá. Právním základem je <em>plnění smlouvy</em>.<br />
                        <strong>b) Ze zákona:</strong> Podle zákona o účetnictví musíme uchovávat faktury s vašimi údaji. Právním základem je <em>plnění právní povinnosti</em>.<br />
                        <strong>c) Považujeme to za náš oprávněný zájem:</strong> Pro účely vyřizování případných budoucích reklamací nebo zjednodušenou komunikaci, zasílání novinek e-mailem našim stávajícím zákazníkům (tzv. přímý marketing, odhlášení je možné kdykoliv).
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">4. Komu vaše údaje předáváme?</h2>
                    <p>
                        Jsme vázáni mlčenlivostí, ale pro plnění objednávek používáme služby důvěryhodných spřízněných stran (externí dopravci kytic, externí účetní, nebo společnosti obstarávající provozní IT služby, např. pronajímatel serverů/platební systém). S vašimi daty třetí strany nakládají výhradně v rámci pokynů k plnění objednávky.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">5. Jak dlouho vaše osobní údaje uchováváme?</h2>
                    <p>
                        Vaše údaje uchováváme po dobu nezbytně nutnou k výkonu práv a povinností (běžně pro účely reklamací po dobu 3 let od uzavření smlouvy). Doklady daní se musí dle zákona uchovávat po dobu 10 let od konce zdaňovacího období, ve kterém se plnění uskutečnilo.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">6. Vaše práva vyplývající z GDPR</h2>
                    <p>
                        Máte právo k nám kdykoliv napsat žádost o:<br />
                        - <strong>Získání přístupu</strong> ke všem svým osobním údajům.<br />
                        - <strong>Opravu osobních údajů</strong>, pokud jsou zjevně nepřesné.<br />
                        - <strong>Výmaz osobních údajů ("právo na zapomnění")</strong>, za předpokladu, že zpracování již není nevyhnutelné splnění zákonné povinnosti majitele eshopu.<br />
                        <br />
                        Pokud máte pocit, že s vašimi daty nakládáme nesprávně, máte právo podat stížnost u Úřadu pro ochranu osobních údajů (ÚOOÚ).
                    </p>
                </div>
            </div>
        </Layout>
    );
}
