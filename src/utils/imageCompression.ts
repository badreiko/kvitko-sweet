// src/utils/imageCompression.ts
import imageCompression from 'browser-image-compression';

/**
 * Параметры сжатия изображения
 */
export interface CompressionOptions {
    /** Максимальный размер файла в МБ (по умолчанию 1 МБ) */
    maxSizeMB?: number;
    /** Максимальная ширина или высота в пикселях (по умолчанию 1920) */
    maxWidthOrHeight?: number;
    /** Использовать Web Worker для неблокирующего сжатия (по умолчанию true) */
    useWebWorker?: boolean;
    /** Качество сжатия от 0 до 1 (по умолчанию 0.8) */
    quality?: number;
    /** Callback для отслеживания прогресса сжатия (0-100) */
    onProgress?: (progress: number) => void;
    /** Конвертировать в определенный формат */
    fileType?: 'image/jpeg' | 'image/png' | 'image/webp';
    /** Сохранить EXIF данные (по умолчанию false) */
    preserveExif?: boolean;
}

/**
 * Результат сжатия изображения
 */
export interface CompressionResult {
    /** Сжатый файл */
    file: File;
    /** Оригинальный размер в байтах */
    originalSize: number;
    /** Сжатый размер в байтах */
    compressedSize: number;
    /** Процент сжатия */
    compressionRatio: number;
    /** Время сжатия в миллисекундах */
    compressionTime: number;
}

/**
 * Параметры сжатия по умолчанию
 */
const DEFAULT_OPTIONS: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    quality: 0.8,
    fileType: 'image/webp',
    preserveExif: false,
};

/**
 * Сжимает изображение перед загрузкой в Firebase Storage
 * 
 * @param file - Исходный файл изображения
 * @param options - Параметры сжатия
 * @returns Promise с результатом сжатия
 * 
 * @example
 * ```typescript
 * const result = await compressImage(file, {
 *   maxSizeMB: 0.5,
 *   maxWidthOrHeight: 1200,
 *   onProgress: (p) => console.log(`Сжатие: ${p}%`)
 * });
 * console.log(`Сжато с ${result.originalSize} до ${result.compressedSize} байт`);
 * ```
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<CompressionResult> {
    const startTime = performance.now();
    const originalSize = file.size;

    // Объединяем параметры по умолчанию с переданными
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Проверяем, является ли файл изображением
    if (!file.type.startsWith('image/')) {
        throw new Error(`Файл не является изображением: ${file.type}`);
    }

    // Если файл уже меньше целевого размера и не нужно конвертировать формат,
    // возвращаем оригинал
    const targetSizeBytes = (mergedOptions.maxSizeMB || 1) * 1024 * 1024;
    if (originalSize <= targetSizeBytes && !mergedOptions.fileType) {
        console.log(`[ImageCompression] Файл уже меньше ${mergedOptions.maxSizeMB}MB, сжатие не требуется`);
        return {
            file,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0,
            compressionTime: 0,
        };
    }

    console.log(`[ImageCompression] Начало сжатия: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

    try {
        // Параметры для библиотеки browser-image-compression
        const compressionOptions = {
            maxSizeMB: mergedOptions.maxSizeMB,
            maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
            useWebWorker: mergedOptions.useWebWorker,
            fileType: mergedOptions.fileType,
            initialQuality: mergedOptions.quality,
            preserveExif: mergedOptions.preserveExif,
            onProgress: mergedOptions.onProgress,
        };

        // Выполняем сжатие
        const compressedFile = await imageCompression(file, compressionOptions);

        const endTime = performance.now();
        const compressedSize = compressedFile.size;
        const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
        const compressionTime = endTime - startTime;

        console.log(`[ImageCompression] Завершено:`);
        console.log(`  - Оригинал: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  - Сжато: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  - Сжатие: ${compressionRatio.toFixed(1)}%`);
        console.log(`  - Время: ${compressionTime.toFixed(0)}ms`);

        return {
            file: compressedFile,
            originalSize,
            compressedSize,
            compressionRatio,
            compressionTime,
        };
    } catch (error) {
        console.error('[ImageCompression] Ошибка сжатия:', error);
        throw error;
    }
}

/**
 * Сжимает изображение с предустановленными параметрами для аватаров
 */
export async function compressAvatar(
    file: File,
    onProgress?: (progress: number) => void
): Promise<CompressionResult> {
    return compressImage(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 400,
        quality: 0.85,
        fileType: 'image/webp',
        onProgress,
    });
}

/**
 * Сжимает изображение с предустановленными параметрами для товаров
 */
export async function compressProductImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<CompressionResult> {
    return compressImage(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        quality: 0.85,
        fileType: 'image/webp',
        onProgress,
    });
}

/**
 * Сжимает изображение с предустановленными параметрами для блога
 */
export async function compressBlogImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<CompressionResult> {
    return compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        quality: 0.8,
        fileType: 'image/webp',
        onProgress,
    });
}

/**
 * Сжимает изображение с предустановленными параметрами для категорий
 */
export async function compressCategoryImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<CompressionResult> {
    return compressImage(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        quality: 0.85,
        fileType: 'image/webp',
        onProgress,
    });
}

/**
 * Форматирует размер файла в человекочитаемый формат
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Проверяет, поддерживается ли формат изображения
 */
export function isSupportedImageFormat(file: File): boolean {
    const supportedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/bmp',
        'image/gif',
    ];
    return supportedTypes.includes(file.type);
}

export default compressImage;
