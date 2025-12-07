import { updateFlowerForCustomBouquet } from '../firebase/services/bouquetFlowerService';

// ID цветка, который нужно обновить
const flowerId = 'B6EG0W5LSnbFLNNjsggh';

// Функция для обновления цветка
const updateFlower = async () => {
  try {
    console.log(`Обновление цветка ${flowerId} для использования в букетах...`);
    await updateFlowerForCustomBouquet(flowerId);
    console.log(`Цветок ${flowerId} успешно обновлен!`);
  } catch (error) {
    console.error('Ошибка при обновлении цветка:', error);
  }
};

// Вызываем функцию
updateFlower();
