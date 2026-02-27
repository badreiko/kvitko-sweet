import Layout from "@/components/layout/Layout";

export default function Terms() {
    return (
        <Layout>
            <div className="container-custom py-24 min-h-[60vh]">
                <h1 className="text-4xl font-serif font-bold mb-8">Obchodní podmínky</h1>
                <div className="prose prose-stone max-w-none">
                    <p className="lead text-lg text-muted-foreground mb-6">
                        Tyto obchodní podmínky upravují vzájemná práva a povinnosti mezi prodávajícím a kupujícím.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">1. Základní ustanovení</h2>
                    <p>
                        Tyto obchodní podmínky (dále jen „obchodní podmínky“) podnikající fyzické osoby:<br /><br />
                        <strong>Jméno a příjmení:</strong> Yevheniia Hula<br />
                        <strong>Sídlo:</strong> Táborská 750/20, 140 00, Praha 4 - Nusle<br />
                        <strong>IČO:</strong> 23484586<br />
                        <strong>Zapsaná v:</strong> živnostenském rejstříku (Vznik oprávnění 09.07.2025). Úřad příslušný podle § 71 odst. 2 živnostenského zákona: Úřad městské části Praha 4<br /><br />
                        (dále jen „prodávající“) upravují v souladu s ustanovením § 1751 odst. 1 zákona č. 89/2012 Sb., občanský zákoník, ve znění pozdějších předpisů (dále jen „občanský zákoník“) vzájemná práva a povinnosti smluvních stran vzniklé v souvislosti nebo na základě kupní smlouvy (dále jen „kupní smlouva“) uzavírané mezi prodávajícím a jinou fyzickou osobou (dále jen „kupující“) prostřednictvím internetového obchodu prodávajícího na adrese kvitko-sweet.cz (případně jiné příslušné doméně).
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">2. Předmět prodeje a specifika květinového zboží</h2>
                    <p>
                        Předmětem prodeje je řezaná květina, hrnková květina, kytice a doplňkový sortiment, prodávající se věnuje činnosti: Poskytování služeb pro zemědělství, zahradnictví a floristiky, velkoobchod a maloobchod.<br />
                        Vzhled a složení kytic se může nepatrně lišit od fotografií na e-shopu v závislosti na aktuální sezónní dostupnosti květin. Prodávající si vyhrazuje právo nahradit chybějící květiny jinými v obdobné kvalitě a cenové relaci tak, aby byl zachován celkový charakter a barevnost kytice.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">3. Objednávka a uzavření smlouvy</h2>
                    <p>
                        Kupující odesláním objednávky přes webové rozhraní e-shopu podává závazný návrh na uzavření kupní smlouvy. Kupní smlouva je uzavřena přijetím objednávky prodávajícím (potvrzením e-mailem a zaplacením).
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">4. Cena zboží a Platební podmínky</h2>
                    <p>
                        Veškeré ceny zboží jsou konečné. Cenu zboží a případné náklady spojené s dodáním zboží dle kupní smlouvy může kupující uhradit způsoby nabídnutými v nákupním košíku (např. platba kartou online, převodem, nebo v hotovosti při osobním odběru).
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">5. Odstoupení od smlouvy a Reklamace</h2>
                    <p>
                        <strong>Vyloučení práva na odstoupení do 14 dnů:</strong> V souladu s § 1837 písm. c) a d) občanského zákoníku zákazník <strong>nemůže</strong> odstoupit od smlouvy na dodávku zboží, které podléhá rychlé zkáze (řezané květiny a kytice) a u zboží, které bylo upraveno podle osobního přání zákazníka.<br /><br />
                        <strong>Reklamace (Práva z vadného plnění):</strong> Vzhledem k povaze zboží (kazící se zboží) doporučujeme případné vady (uvádání květin, mechanické poškození z dopravy) reklamovat bez zbytečného odkladu. Pro úspěšné vyřízení reklamace prosím pošlete fotografii kytice ihned při převzetí nebo nejpozději do 24 hodin od doručení.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">6. Doručování</h2>
                    <p>
                        Zboží je doručováno na adresu uvedenou kupujícím. Pokud kupující v dohodnutém čase nezajistí osobu k převzetí, prodávající nenese odpovědnost za znehodnocení. Opakované doručení může být zpoplatněno navíc.
                    </p>

                    <h2 className="text-2xl font-serif font-semibold mt-8 mb-4">7. Závěrečná ustanovení</h2>
                    <p>
                        Tyto obchodní podmínky nabývají platnosti a účinnosti dnem jejich zveřejnění na e-shopu. Vztahy neupravené těmito podmínkami se řídí občanským zákoníkem a zákonem o ochraně spotřebitele.
                    </p>
                </div>
            </div>
        </Layout>
    );
}
