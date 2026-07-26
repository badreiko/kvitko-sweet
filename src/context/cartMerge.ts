/**
 * Минимальные поля, нужные для слияния позиций корзины.
 * Используется как структурное ограничение, без index signature —
 * чтобы конкретные типы (CartItem, OrderItem) подходили без правок.
 */
export type MergeableCartItem = {
  id: string;
  quantity: number;
};

/**
 * Сливает массив позиций корзины так, что одинаковые id суммируют quantity.
 * Используется при логине пользователя — серверная корзина + гостевая.
 */
export function mergeCartItems<T extends MergeableCartItem>(items: T[]): T[] {
  const merged: Record<string, T> = {};
  for (const item of items) {
    const existing = merged[item.id];
    if (existing) {
      merged[item.id] = { ...existing, quantity: existing.quantity + item.quantity };
    } else {
      merged[item.id] = { ...item };
    }
  }
  return Object.values(merged);
}
