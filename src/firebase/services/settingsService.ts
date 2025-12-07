import { doc, getDoc, setDoc } from 'firebase/firestore';
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

export interface SiteSettings {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
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

export const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<void> => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
        await setDoc(docRef, settings, { merge: true });
    } catch (error) {
        console.error("Error updating site settings:", error);
        throw error;
    }
};
