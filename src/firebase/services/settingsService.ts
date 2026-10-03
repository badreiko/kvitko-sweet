import { deleteField, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config';

export interface OpeningHours {
    weekdays: string;
    saturday: string;
    sunday: string;
}

export interface SectionImages {
    deliverySection?: string[];
    customBouquet?: string[];
    heroSection?: string[];
}

export type HeroThemeId = 'default' | 'spring' | 'summer' | 'autumn' | 'winter' | 'halloween' | 'christmas';

export interface HeroThemeContent {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    primaryLabel: string;
    secondaryLabel: string;
    desktopImage?: string;
    /** Устарело: отдельная мобильная картинка больше не настраивается; читается только как запасная. */
    mobileImage?: string;
    imageAlt: string;
    imageFit: 'cover' | 'contain';
    /** Пропорция области картинки (для всех экранов); 'auto' — высота по экрану. */
    imageRatio: HeroImageRatio;
    /** Подпись под букетом: маленькая строка + курсивный заголовок. */
    signatureKicker: string;
    signatureTitle: string;
    /** Свечение, арка и наклон букета за курсором (как в осеннем примере). */
    decorations: boolean;
    /** Финальная фраза внизу главной: строки через « / », вторая — курсивом. */
    closingLine: string;
}

export type HeroImageRatio = 'auto' | '1:1' | '4:5' | '3:4' | '2:3' | '4:3' | '3:2' | '16:9';

export type HeroHolidayId = 'halloween' | 'christmas';

/** Период праздника в формате MM-DD (по времени Праги), включительно. */
export interface HeroHolidayPeriod {
    enabled: boolean;
    start: string;
    end: string;
}

export interface HeroSettings {
    mode: 'manual' | 'auto';
    selectedTheme: HeroThemeId;
    /** Общий выключатель праздничных тем; работает поверх любого режима. */
    holidaysEnabled: boolean;
    holidays: Record<HeroHolidayId, HeroHolidayPeriod>;
    themes: Partial<Record<HeroThemeId, Partial<HeroThemeContent>>>;
}

export interface SiteSettings {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    companyIco?: string;
    companyDic?: string;
    companyRegistry?: string;
    enableMaintenance: boolean;
    currency: string;
    currencySymbol: string;
    taxRate: number;
    minOrderAmount: number;
    freeShippingThreshold: number;
    enableStockManagement: boolean;
    openingHours: OpeningHours;
    mapEmbedUrl: string;
    sectionImages: SectionImages;
    heroSettings?: HeroSettings;
    facebookUrl?: string;
    instagramUrl?: string;
}

const SETTINGS_COLLECTION = 'settings';
const GENERAL_DOC_ID = 'general';

export const defaultSettings: SiteSettings = {
    siteName: "Kvitko Sweet",
    siteDescription: "Магазин цветов и подарков",
    contactEmail: "info@kvitko-sweet.cz",
    contactPhone: "+420 123 456 789",
    address: "Прага, Чехия",
    companyIco: "",
    companyDic: "",
    companyRegistry: "",
    enableMaintenance: false,
    currency: "CZK",
    currencySymbol: "Kč",
    taxRate: 21,
    minOrderAmount: 500,
    freeShippingThreshold: 2000,
    enableStockManagement: true,
    openingHours: {
        weekdays: "9:00 - 19:00",
        saturday: "9:00 - 17:00",
        sunday: "10:00 - 15:00"
    },
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.9058953816!2d14.4194153!3d50.0874654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b94e9e08e3b33%3A0x7acff08b90e9352!2sWenceslas%20Square!5e0!3m2!1sen!2scz!4v1651234567890!5m2!1sen!2scz",
    sectionImages: {},
    facebookUrl: "",
    instagramUrl: ""
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { ...defaultSettings, ...docSnap.data() } as SiteSettings;
        } else {
            // Initialize with defaults if not exists
            await setDoc(docRef, defaultSettings);
            return defaultSettings;
        }
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return defaultSettings;
    }
};

/**
 * getSiteSettings при ошибке сети возвращает сам объект defaultSettings.
 * Так можно отличить «настроек нет / не загрузились» от реальных данных.
 */
export const isFallbackSettings = (settings: SiteSettings): boolean => settings === defaultSettings;

export const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<void> => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
        // Replace supplied top-level maps, so removing a nested image URL persists.
        await setDoc(docRef, settings, { mergeFields: Object.keys(settings) });
    } catch (error) {
        console.error("Error updating site settings:", error);
        throw error;
    }
};

/**
 * Точечно записывает (или удаляет при url = null) одно изображение темы Hero.
 * Остальные поля heroSettings не трогаются — несохранённые правки текста
 * в админке не уходят на сайт вместе с загрузкой картинки.
 */
export const updateHeroThemeImage = async (
    theme: HeroThemeId,
    field: 'desktopImage' | 'mobileImage',
    url: string | null,
): Promise<void> => {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
    await updateDoc(docRef, { [`heroSettings.themes.${theme}.${field}`]: url ?? deleteField() });
};
