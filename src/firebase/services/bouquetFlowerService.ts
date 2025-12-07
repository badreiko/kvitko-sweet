import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import { compressProductImage, formatFileSize } from '@/utils/imageCompression';

// Импорт интерфейса MultiLanguageText из flowerService
import { MultiLanguageText } from './flowerService';

// Типы элементов для букета
export enum ItemType {
  FLOWER = 'flower',     // Цветок
  WRAPPING = 'wrapping', // Упаковка
  ADDITION = 'addition'  // Дополнение
}

// Тип для цветка для букета
export interface FlowerForBouquet {
  id: string;
  name: MultiLanguageText; // Теперь name является объектом MultiLanguageText
  type: string;
  color: string;
  price: number;
  imageUrl?: string;
  description?: string;
  stockQuantity?: number;
  inStock?: boolean;
  forCustomBouquet: boolean; // Флаг, указывающий, что цветок используется для составления букетов
  itemType: ItemType;    // Вид элемента: цветок, упаковка или дополнение
  createdAt: Date;
}

// Константы для коллекций
const BOUQUET_FLOWERS_COLLECTION = 'bouquetFlowers';

// Получение всех цветов для букетов
export const getAllFlowersForBouquet = async (): Promise<FlowerForBouquet[]> => {
  try {
    console.log('getAllFlowersForBouquet: Запрос цветов для букетов');

    // Получаем все элементы из коллекции flowers
    const flowersQuery = query(collection(db, 'flowers'));
    const flowersSnapshot = await getDocs(flowersQuery);
    console.log(`getAllFlowersForBouquet: Найдено ${flowersSnapshot.docs.length} элементов в коллекции flowers`);

    const allDocs = flowersSnapshot.docs;
    console.log(`getAllFlowersForBouquet: Всего найдено ${allDocs.length} элементов`);

    const flowers = allDocs.map(doc => {
      const data = doc.data();
      console.log(`getAllFlowersForBouquet: Обработка цветка ${doc.id}:`, data);

      // Проверяем, что name является объектом MultiLanguageText
      // Если это строка, преобразуем ее в объект MultiLanguageText
      let name = data.name;
      console.log(`getAllFlowersForBouquet: Тип поля name: ${typeof name}`);

      if (typeof name === 'string') {
        console.log(`getAllFlowersForBouquet: Преобразование строки "${name}" в объект MultiLanguageText`);
        name = { cs: name };
      }

      // Добавляем поле forCustomBouquet, если его нет
      const forCustomBouquet = data.forCustomBouquet !== undefined ? data.forCustomBouquet : true;

      // Добавляем поле itemType, если его нет
      const itemType = data.itemType !== undefined ? data.itemType : ItemType.FLOWER;

      const flower = {
        id: doc.id,
        ...data,
        name: name, // Убедимся, что name имеет правильный формат
        forCustomBouquet: forCustomBouquet, // Убедимся, что поле forCustomBouquet существует
        itemType: itemType, // Убедимся, что поле itemType существует
        createdAt: data.createdAt?.toDate() || new Date()
      };

      console.log(`getAllFlowersForBouquet: Результат обработки цветка ${doc.id}:`, flower);
      return flower;
    }) as FlowerForBouquet[];

    console.log('getAllFlowersForBouquet: Все цветы для букетов:', flowers);
    return flowers;
  } catch (error) {
    console.error('Error getting flowers for bouquet: ', error);
    throw error;
  }
};

// Добавление поля forCustomBouquet к существующему цветку
export const updateFlowerForCustomBouquet = async (flowerId: string): Promise<void> => {
  try {
    console.log(`updateFlowerForCustomBouquet: Обновление цветка ${flowerId} для использования в букетах`);

    const flowerRef = doc(db, BOUQUET_FLOWERS_COLLECTION, flowerId);

    // Устанавливаем поле forCustomBouquet в true
    await updateDoc(flowerRef, {
      forCustomBouquet: true,
      updatedAt: new Date()
    });

    console.log(`updateFlowerForCustomBouquet: Цветок ${flowerId} успешно обновлен`);
  } catch (error) {
    console.error('Error updating flower for custom bouquet: ', error);
    throw error;
  }
};

// Добавление нового цветка для букетов
export const addFlowerForBouquet = async (flower: Omit<FlowerForBouquet, 'id'>, imageFile?: File): Promise<string> => {
  try {
    console.log('addFlowerForBouquet: Начало добавления цветка для букета:', flower);
    console.log('addFlowerForBouquet: Файл изображения:', imageFile);

    // Убедимся, что в данных есть поле itemType
    const flowerData = {
      ...flower,
      forCustomBouquet: true,
      itemType: flower.itemType || ItemType.FLOWER, // По умолчанию - цветок
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('addFlowerForBouquet: Данные цветка для сохранения в Firestore:', flowerData);

    // Создаем запись цветка в Firestore
    const docRef = await addDoc(collection(db, BOUQUET_FLOWERS_COLLECTION), flowerData);
    console.log(`addFlowerForBouquet: Цветок добавлен в Firestore с ID: ${docRef.id}`);

    // Если есть файл изображения, сжимаем и загружаем его
    if (imageFile) {
      console.log(`[BouquetFlowerService] Сжатие изображения: ${formatFileSize(imageFile.size)}`);

      // Сжимаем изображение
      const compressedResult = await compressProductImage(imageFile);
      console.log(`[BouquetFlowerService] Сжато: ${formatFileSize(compressedResult.compressedSize)}`);

      const imageRef = ref(storage, `bouquet_flowers/${docRef.id}.webp`);

      // Загружаем сжатый файл
      await uploadBytes(imageRef, compressedResult.file);

      // Получаем URL загруженного изображения
      const imageUrl = await getDownloadURL(imageRef);

      // Обновляем запись цветка с URL изображения
      await updateDoc(docRef, { imageUrl });
      console.log(`[BouquetFlowerService] Изображение загружено: ${imageUrl}`);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding flower for bouquet: ', error);
    throw error;
  }
};

// Получение цветка для букета по ID
export const getFlowerForBouquetById = async (id: string): Promise<FlowerForBouquet | null> => {
  try {
    const docRef = doc(db, BOUQUET_FLOWERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        name: typeof data.name === 'string' ? { cs: data.name } : data.name,
        itemType: data.itemType || ItemType.FLOWER,
        createdAt: data.createdAt.toDate()
      } as FlowerForBouquet;
    }

    return null;
  } catch (error) {
    console.error('Error getting flower for bouquet: ', error);
    throw error;
  }
};

// Обновление цветка для букета
export const updateFlowerForBouquet = async (id: string, flower: Partial<FlowerForBouquet>, imageFile?: File): Promise<void> => {
  try {
    const flowerRef = doc(db, BOUQUET_FLOWERS_COLLECTION, id);

    // Если есть файл изображения, сжимаем и загружаем его
    if (imageFile) {
      console.log(`[BouquetFlowerService] Сжатие нового изображения: ${formatFileSize(imageFile.size)}`);

      // Сжимаем изображение
      const compressedResult = await compressProductImage(imageFile);
      console.log(`[BouquetFlowerService] Сжато: ${formatFileSize(compressedResult.compressedSize)}`);

      const imageRef = ref(storage, `bouquet_flowers/${id}.webp`);

      await uploadBytes(imageRef, compressedResult.file);
      const imageUrl = await getDownloadURL(imageRef);

      flower.imageUrl = imageUrl;
    }

    // Обновляем данные цветка
    await updateDoc(flowerRef, {
      ...flower,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating flower for bouquet: ', error);
    throw error;
  }
};

// Удаление цветка для букета
export const deleteFlowerForBouquet = async (id: string): Promise<void> => {
  try {
    // Получаем данные цветка, чтобы удалить изображение, если оно есть
    const flowerRef = doc(db, BOUQUET_FLOWERS_COLLECTION, id);
    const flowerSnap = await getDoc(flowerRef);

    if (flowerSnap.exists()) {
      const flowerData = flowerSnap.data();

      // Если у цветка есть изображение, удаляем его из Storage
      if (flowerData.imageUrl) {
        try {
          // Извлекаем путь к изображению из URL
          const imageUrl = flowerData.imageUrl;
          const imageRef = ref(storage, imageUrl);

          await deleteObject(imageRef);
          console.log(`Изображение цветка ${id} удалено из Storage`);
        } catch (imageError) {
          console.error('Ошибка при удалении изображения: ', imageError);
          // Продолжаем удаление цветка, даже если не удалось удалить изображение
        }
      }

      // Удаляем цветок из Firestore
      await deleteDoc(flowerRef);
      console.log(`Цветок ${id} удален из Firestore`);
    }
  } catch (error) {
    console.error('Error deleting flower for bouquet: ', error);
    throw error;
  }
};

// Получение доступных цветов для букета (с учетом наличия на складе)
export const getAvailableFlowersForBouquet = async (): Promise<FlowerForBouquet[]> => {
  try {
    const flowers = await getAllFlowersForBouquet();
    return flowers.filter(flower => flower.inStock);
  } catch (error) {
    console.error('Error getting available flowers for bouquet: ', error);
    throw error;
  }
};
