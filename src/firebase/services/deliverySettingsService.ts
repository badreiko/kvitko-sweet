// src/firebase/services/deliverySettingsService.ts
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where
} from 'firebase/firestore';
import { db } from '../config';

// Интерфейсы
export interface DeliveryZone {
    id: string;
    name: string;
    time: string;
    price: number;
    freeOver?: number;
    type: 'prague' | 'surrounding';
    order: number;
    isActive: boolean;
}

export interface DeliveryOption {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string; // 'truck' | 'clock' | 'calendar' | 'package'
    order: number;
    isActive: boolean;
}

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: string; // 'credit-card' | 'map-pin' | 'package-check'
    order: number;
    isActive: boolean;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
}

// Константы для коллекций
const DELIVERY_ZONES_COLLECTION = 'deliveryZones';
const DELIVERY_OPTIONS_COLLECTION = 'deliveryOptions';
const PAYMENT_METHODS_COLLECTION = 'paymentMethods';
const FAQ_COLLECTION = 'faq';

// =============== ЗОНЫ ДОСТАВКИ ===============

export const getAllDeliveryZones = async (): Promise<DeliveryZone[]> => {
    try {
        const q = query(
            collection(db, DELIVERY_ZONES_COLLECTION),
            orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DeliveryZone[];
    } catch (error) {
        console.error('Error getting delivery zones:', error);
        throw error;
    }
};

export const getActiveDeliveryZones = async (type?: 'prague' | 'surrounding'): Promise<DeliveryZone[]> => {
    try {
        // Простой запрос без orderBy чтобы избежать составных индексов
        const q = query(
            collection(db, DELIVERY_ZONES_COLLECTION),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        let zones = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DeliveryZone[];

        // Фильтруем по типу и сортируем в JS
        if (type) {
            zones = zones.filter(z => z.type === type);
        }
        return zones.sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error('Error getting active delivery zones:', error);
        throw error;
    }
};

export const addDeliveryZone = async (zone: Omit<DeliveryZone, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, DELIVERY_ZONES_COLLECTION), zone);
        return docRef.id;
    } catch (error) {
        console.error('Error adding delivery zone:', error);
        throw error;
    }
};

export const updateDeliveryZone = async (id: string, zone: Partial<DeliveryZone>): Promise<void> => {
    try {
        const docRef = doc(db, DELIVERY_ZONES_COLLECTION, id);
        await updateDoc(docRef, zone);
    } catch (error) {
        console.error('Error updating delivery zone:', error);
        throw error;
    }
};

export const deleteDeliveryZone = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, DELIVERY_ZONES_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting delivery zone:', error);
        throw error;
    }
};

// =============== ОПЦИИ ДОСТАВКИ ===============

export const getAllDeliveryOptions = async (): Promise<DeliveryOption[]> => {
    try {
        const q = query(
            collection(db, DELIVERY_OPTIONS_COLLECTION),
            orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DeliveryOption[];
    } catch (error) {
        console.error('Error getting delivery options:', error);
        throw error;
    }
};

export const getActiveDeliveryOptions = async (): Promise<DeliveryOption[]> => {
    try {
        // Простой запрос без orderBy
        const q = query(
            collection(db, DELIVERY_OPTIONS_COLLECTION),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const options = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DeliveryOption[];

        // Сортируем в JS
        return options.sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error('Error getting active delivery options:', error);
        throw error;
    }
};

export const addDeliveryOption = async (option: Omit<DeliveryOption, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, DELIVERY_OPTIONS_COLLECTION), option);
        return docRef.id;
    } catch (error) {
        console.error('Error adding delivery option:', error);
        throw error;
    }
};

export const updateDeliveryOption = async (id: string, option: Partial<DeliveryOption>): Promise<void> => {
    try {
        const docRef = doc(db, DELIVERY_OPTIONS_COLLECTION, id);
        await updateDoc(docRef, option);
    } catch (error) {
        console.error('Error updating delivery option:', error);
        throw error;
    }
};

export const deleteDeliveryOption = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, DELIVERY_OPTIONS_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting delivery option:', error);
        throw error;
    }
};

// =============== СПОСОБЫ ОПЛАТЫ ===============

export const getAllPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
        const q = query(
            collection(db, PAYMENT_METHODS_COLLECTION),
            orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PaymentMethod[];
    } catch (error) {
        console.error('Error getting payment methods:', error);
        throw error;
    }
};

export const getActivePaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
        // Простой запрос без orderBy
        const q = query(
            collection(db, PAYMENT_METHODS_COLLECTION),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const methods = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PaymentMethod[];

        // Сортируем в JS
        return methods.sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error('Error getting active payment methods:', error);
        throw error;
    }
};

export const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, PAYMENT_METHODS_COLLECTION), method);
        return docRef.id;
    } catch (error) {
        console.error('Error adding payment method:', error);
        throw error;
    }
};

export const updatePaymentMethod = async (id: string, method: Partial<PaymentMethod>): Promise<void> => {
    try {
        const docRef = doc(db, PAYMENT_METHODS_COLLECTION, id);
        await updateDoc(docRef, method);
    } catch (error) {
        console.error('Error updating payment method:', error);
        throw error;
    }
};

export const deletePaymentMethod = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, PAYMENT_METHODS_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting payment method:', error);
        throw error;
    }
};

// =============== FAQ ===============

export const getAllFAQ = async (): Promise<FAQ[]> => {
    try {
        const q = query(
            collection(db, FAQ_COLLECTION),
            orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FAQ[];
    } catch (error) {
        console.error('Error getting FAQ:', error);
        throw error;
    }
};

export const getActiveFAQ = async (): Promise<FAQ[]> => {
    try {
        // Простой запрос без orderBy
        const q = query(
            collection(db, FAQ_COLLECTION),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const faqs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FAQ[];

        // Сортируем в JS
        return faqs.sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error('Error getting active FAQ:', error);
        throw error;
    }
};

export const addFAQ = async (faq: Omit<FAQ, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, FAQ_COLLECTION), faq);
        return docRef.id;
    } catch (error) {
        console.error('Error adding FAQ:', error);
        throw error;
    }
};

export const updateFAQ = async (id: string, faq: Partial<FAQ>): Promise<void> => {
    try {
        const docRef = doc(db, FAQ_COLLECTION, id);
        await updateDoc(docRef, faq);
    } catch (error) {
        console.error('Error updating FAQ:', error);
        throw error;
    }
};

export const deleteFAQ = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, FAQ_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        throw error;
    }
};

// =============== ИНИЦИАЛИЗАЦИЯ СТАТИЧЕСКИХ ДАННЫХ ===============

export const initializeDeliverySettings = async (): Promise<void> => {
    try {
        // Проверяем, есть ли уже данные
        const zones = await getAllDeliveryZones();
        if (zones.length > 0) {
            console.log('Delivery settings already initialized');
            return;
        }

        console.log('Initializing delivery settings...');

        // Зоны Праги
        const pragueZones = [
            { name: 'Praha 1', time: '2-3 hodiny', price: 149, freeOver: 1500, type: 'prague' as const, order: 1, isActive: true },
            { name: 'Praha 2', time: '2-3 hodiny', price: 149, freeOver: 1500, type: 'prague' as const, order: 2, isActive: true },
            { name: 'Praha 3', time: '2-3 hodiny', price: 149, freeOver: 1500, type: 'prague' as const, order: 3, isActive: true },
            { name: 'Praha 4', time: '2-3 hodiny', price: 149, freeOver: 1500, type: 'prague' as const, order: 4, isActive: true },
            { name: 'Praha 5', time: '2-3 hodiny', price: 149, freeOver: 1500, type: 'prague' as const, order: 5, isActive: true },
            { name: 'Praha 6', time: '2-3 hodiny', price: 149, freeOver: 1500, type: 'prague' as const, order: 6, isActive: true },
            { name: 'Praha 7', time: '2-3 hodiny', price: 149, freeOver: 1500, type: 'prague' as const, order: 7, isActive: true },
            { name: 'Praha 8', time: '2-3 hodiny', price: 149, freeOver: 1500, type: 'prague' as const, order: 8, isActive: true },
            { name: 'Praha 9', time: '3-4 hodiny', price: 199, freeOver: 1500, type: 'prague' as const, order: 9, isActive: true },
            { name: 'Praha 10', time: '3-4 hodiny', price: 199, freeOver: 1500, type: 'prague' as const, order: 10, isActive: true },
        ];

        // Пригородные зоны
        const surroundingZones = [
            { name: 'Do 10 km od Prahy', time: '3-5 hodin', price: 249, freeOver: 2000, type: 'surrounding' as const, order: 1, isActive: true },
            { name: '10-20 km od Prahy', time: '3-5 hodin', price: 349, freeOver: 2500, type: 'surrounding' as const, order: 2, isActive: true },
            { name: '20-30 km od Prahy', time: '4-6 hodin', price: 449, freeOver: 3000, type: 'surrounding' as const, order: 3, isActive: true },
        ];

        // Опции доставки
        const deliveryOptions = [
            { name: 'Standardní doručení', description: 'Doručení ve stejný den, pokud je objednávka zadána do 14:00', price: 149, icon: 'truck', order: 1, isActive: true },
            { name: 'Expresní doručení', description: 'Doručení do 2-3 hodin od objednávky', price: 249, icon: 'clock', order: 2, isActive: true },
            { name: 'Plánované doručení', description: 'Vyberte konkrétní datum a časové rozmezí', price: 199, icon: 'calendar', order: 3, isActive: true },
            { name: 'Osobní odběr', description: 'Vyzvednutí objednávky v naší prodejně', price: 0, icon: 'package', order: 4, isActive: true },
        ];

        // Способы оплаты
        const paymentMethods = [
            { name: 'Platební karta', description: 'Zaplaťte objednávku online platební kartou Visa, Mastercard, American Express.', icon: 'credit-card', order: 1, isActive: true },
            { name: 'Hotově při doručení', description: 'Zaplaťte objednávku hotově kurýrovi při převzetí.', icon: 'map-pin', order: 2, isActive: true },
            { name: 'Bankovní převod', description: 'Zaplaťte objednávku bankovním převodem. Objednávka bude zpracována po přijetí platby.', icon: 'package-check', order: 3, isActive: true },
        ];

        // FAQ
        const faqItems = [
            { question: 'Jak rychle doručujete?', answer: 'Pro Prahu standardní doručení probíhá ve stejný den, pokud je objednávka zadána do 14:00. Expresní doručení je k dispozici do 2-3 hodin od potvrzení objednávky. Pro okolí doručujeme do 3-6 hodin v závislosti na vzdálenosti.', order: 1, isActive: true },
            { question: 'Mohu si vybrat konkrétní čas doručení?', answer: 'Ano, můžete si vybrat plánované doručení a určit požadované datum a časový interval. Tato služba stojí 199 Kč.', order: 2, isActive: true },
            { question: 'Co dělat, když příjemce není doma?', answer: 'V případě nepřítomnosti příjemce se s ním kurýr spojí telefonicky. Pokud se nepodaří spojit, kurýr zanechá oznámení a květiny budou vráceny do obchodu. Kontaktujeme vás pro zorganizování opakovaného doručení.', order: 3, isActive: true },
            { question: 'Je možné doručit květiny anonymně?', answer: 'Ano, můžete uvést, že si přejete zachovat anonymitu. V tomto případě příjemce nebude vědět, kdo květiny poslal, pokud to neuvedete v kartičce se zprávou.', order: 4, isActive: true },
            { question: 'Doručujete i do jiných měst v České republice?', answer: 'V současné době zajišťujeme doručení pouze po Praze a nejbližším okolí v okruhu 30 km. Pro doručení do jiných měst nás prosím kontaktujte pro individuální kalkulaci.', order: 5, isActive: true },
        ];

        // Добавляем все данные
        for (const zone of [...pragueZones, ...surroundingZones]) {
            await addDeliveryZone(zone);
        }
        for (const option of deliveryOptions) {
            await addDeliveryOption(option);
        }
        for (const method of paymentMethods) {
            await addPaymentMethod(method);
        }
        for (const faq of faqItems) {
            await addFAQ(faq);
        }

        console.log('Delivery settings initialized successfully');
    } catch (error) {
        console.error('Error initializing delivery settings:', error);
        throw error;
    }
};
