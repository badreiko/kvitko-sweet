// src/firebase/services/testimonialService.ts
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
    limit,
    Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import { compressImage, formatFileSize } from '@/utils/imageCompression';

// Константы для коллекций
const TESTIMONIALS_COLLECTION = 'testimonials';

// Интерфейс для отзыва
export interface Testimonial {
    id: string;
    name: string;
    comment: string;
    rating: number; // 1-5
    imageUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

// Интерфейс для создания отзыва
export interface CreateTestimonialData {
    name: string;
    comment: string;
    rating: number;
    isActive?: boolean;
}

/**
 * Получение всех отзывов (для админ-панели)
 */
export const getAllTestimonials = async (): Promise<Testimonial[]> => {
    try {
        const q = query(
            collection(db, TESTIMONIALS_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate()
            } as Testimonial;
        });
    } catch (error) {
        console.error('Error getting testimonials:', error);
        throw error;
    }
};

/**
 * Получение активных отзывов (для публичной страницы)
 */
export const getActiveTestimonials = async (maxCount: number = 10): Promise<Testimonial[]> => {
    try {
        const q = query(
            collection(db, TESTIMONIALS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(maxCount)
        );

        const querySnapshot = await getDocs(q);
        const testimonials = querySnapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate()
                } as Testimonial;
            })
            .filter(t => t.isActive !== false); // Фильтруем только активные

        return testimonials;
    } catch (error) {
        console.error('Error getting active testimonials:', error);
        throw error;
    }
};

/**
 * Получение отзыва по ID
 */
export const getTestimonialById = async (id: string): Promise<Testimonial | null> => {
    try {
        const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate()
            } as Testimonial;
        }

        return null;
    } catch (error) {
        console.error('Error getting testimonial:', error);
        throw error;
    }
};

/**
 * Добавление нового отзыва
 */
export const addTestimonial = async (
    testimonialData: CreateTestimonialData,
    imageFile?: File,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        console.log('[TestimonialService] Добавление отзыва:', testimonialData);

        // Создаем документ в Firestore
        const docRef = await addDoc(collection(db, TESTIMONIALS_COLLECTION), {
            ...testimonialData,
            isActive: testimonialData.isActive ?? true,
            createdAt: Timestamp.now()
        });

        console.log(`[TestimonialService] Отзыв создан с ID: ${docRef.id}`);

        // Если есть изображение, сжимаем и загружаем его
        if (imageFile) {
            console.log(`[TestimonialService] Сжатие изображения: ${formatFileSize(imageFile.size)}`);

            // Сжимаем изображение
            const compressionResult = await compressImage(imageFile, {
                maxSizeMB: 0.3,
                maxWidthOrHeight: 500,
                quality: 0.85,
                fileType: 'image/webp',
                onProgress
            });

            console.log(`[TestimonialService] Сжато: ${formatFileSize(compressionResult.compressedSize)} (${compressionResult.compressionRatio.toFixed(1)}%)`);

            // Загружаем сжатое изображение
            const timestamp = Date.now();
            const imageRef = ref(storage, `testimonials/${docRef.id}/${timestamp}.webp`);
            await uploadBytes(imageRef, compressionResult.file);
            const imageUrl = await getDownloadURL(imageRef);

            // Обновляем документ с URL изображения
            await updateDoc(docRef, { imageUrl });
            console.log(`[TestimonialService] Изображение загружено: ${imageUrl}`);
        }

        return docRef.id;
    } catch (error) {
        console.error('Error adding testimonial:', error);
        throw error;
    }
};

/**
 * Обновление отзыва
 */
export const updateTestimonial = async (
    id: string,
    testimonialData: Partial<CreateTestimonialData>,
    imageFile?: File,
    onProgress?: (progress: number) => void
): Promise<void> => {
    try {
        console.log(`[TestimonialService] Обновление отзыва ${id}:`, testimonialData);

        const testimonialRef = doc(db, TESTIMONIALS_COLLECTION, id);

        // Если есть новое изображение
        if (imageFile) {
            console.log(`[TestimonialService] Сжатие нового изображения: ${formatFileSize(imageFile.size)}`);

            // Сжимаем изображение
            const compressionResult = await compressImage(imageFile, {
                maxSizeMB: 0.3,
                maxWidthOrHeight: 500,
                quality: 0.85,
                fileType: 'image/webp',
                onProgress
            });

            console.log(`[TestimonialService] Сжато: ${formatFileSize(compressionResult.compressedSize)}`);

            // Удаляем старое изображение (если есть)
            const existingTestimonial = await getTestimonialById(id);
            if (existingTestimonial?.imageUrl) {
                try {
                    const oldImageRef = ref(storage, existingTestimonial.imageUrl);
                    await deleteObject(oldImageRef);
                    console.log('[TestimonialService] Старое изображение удалено');
                } catch (e) {
                    console.warn('[TestimonialService] Не удалось удалить старое изображение:', e);
                }
            }

            // Загружаем новое изображение
            const timestamp = Date.now();
            const imageRef = ref(storage, `testimonials/${id}/${timestamp}.webp`);
            await uploadBytes(imageRef, compressionResult.file);
            const imageUrl = await getDownloadURL(imageRef);

            // Добавляем URL в данные для обновления
            (testimonialData as any).imageUrl = imageUrl;
        }

        // Обновляем документ
        await updateDoc(testimonialRef, {
            ...testimonialData,
            updatedAt: Timestamp.now()
        });

        console.log(`[TestimonialService] Отзыв ${id} обновлен`);
    } catch (error) {
        console.error('Error updating testimonial:', error);
        throw error;
    }
};

/**
 * Удаление отзыва
 */
export const deleteTestimonial = async (id: string): Promise<void> => {
    try {
        console.log(`[TestimonialService] Удаление отзыва ${id}`);

        // Получаем отзыв для удаления изображения
        const testimonial = await getTestimonialById(id);

        if (testimonial?.imageUrl) {
            try {
                const imageRef = ref(storage, testimonial.imageUrl);
                await deleteObject(imageRef);
                console.log('[TestimonialService] Изображение удалено');
            } catch (e) {
                console.warn('[TestimonialService] Не удалось удалить изображение:', e);
            }
        }

        // Удаляем документ
        await deleteDoc(doc(db, TESTIMONIALS_COLLECTION, id));
        console.log(`[TestimonialService] Отзыв ${id} удален`);
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        throw error;
    }
};

/**
 * Переключение статуса активности отзыва
 */
export const toggleTestimonialStatus = async (id: string, isActive: boolean): Promise<void> => {
    try {
        const testimonialRef = doc(db, TESTIMONIALS_COLLECTION, id);
        await updateDoc(testimonialRef, {
            isActive,
            updatedAt: Timestamp.now()
        });
        console.log(`[TestimonialService] Статус отзыва ${id} изменен на ${isActive ? 'активный' : 'неактивный'}`);
    } catch (error) {
        console.error('Error toggling testimonial status:', error);
        throw error;
    }
};
