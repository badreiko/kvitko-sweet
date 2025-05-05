// src/hooks/use-cart.ts
import { useState, useCallback, useEffect, createContext, useContext, ReactNode, createElement } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export function useCart() {
  // Инициализация состояния из localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Проверяем наличие сохраненной корзины в localStorage
    const savedCart = typeof window !== 'undefined' 
      ? localStorage.getItem('cart') 
      : null;
    
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Сохранение корзины в localStorage при каждом изменении
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Добавление товара в корзину
  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  // Удаление товара из корзины
  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Обновление количества товара
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  // Расчет общей стоимости
  const getTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // Получение общего количества товаров
  const getItemsCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Очистка корзины
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotal,
    getItemsCount,
    clearCart,
  };
}

// Тип для контекста корзины
type CartContextType = ReturnType<typeof useCart>;

// Создаем контекст
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Провайдер для корзины
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart();
  
  // Используем функциональный компонент без JSX
  return createElement(CartContext.Provider, { value: cart }, children);
}

// Хук для использования контекста корзины
export function useCartContext() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  
  return context;
}