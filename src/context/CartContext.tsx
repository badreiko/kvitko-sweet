// src/context/CartContext.tsx
import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode, 
  useCallback 
} from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  getTotal: () => number;
  getItemsCount: () => number;
  clearCart: () => Promise<void>;
  saveCartToDatabase: () => Promise<void>;
}

const CARTS_COLLECTION = 'carts';
const GUEST_CART_KEY = 'guest_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Загрузка корзины при инициализации или смене пользователя
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          // Загружаем корзину авторизованного пользователя из Firestore
          const cartRef = doc(db, CARTS_COLLECTION, user.id);
          const cartDoc = await getDoc(cartRef);
          
          if (cartDoc.exists()) {
            setCart(cartDoc.data().items || []);
          } else {
            // Создаем пустую корзину для нового пользователя
            await setDoc(cartRef, { items: [], updatedAt: serverTimestamp() });
            setCart([]);
          }
          
          // Если была локальная корзина гостя, переносим товары
          const guestCart = localStorage.getItem(GUEST_CART_KEY);
          if (guestCart) {
            const guestItems = JSON.parse(guestCart);
            if (guestItems.length > 0) {
              // Объединяем корзины
              const mergedCart = mergeCartItems([...cart, ...guestItems]);
              setCart(mergedCart);
              await updateDoc(cartRef, { 
                items: mergedCart,
                updatedAt: serverTimestamp()
              });
              
              // Очищаем локальную корзину гостя
              localStorage.removeItem(GUEST_CART_KEY);
            }
          }
        } else {
          // Загружаем корзину гостя из localStorage
          const guestCart = localStorage.getItem(GUEST_CART_KEY);
          if (guestCart) {
            setCart(JSON.parse(guestCart));
          } else {
            setCart([]);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Объединение товаров в корзине и суммирование количества
  const mergeCartItems = (items: CartItem[]): CartItem[] => {
    const mergedItems: Record<string, CartItem> = {};
    
    items.forEach(item => {
      if (mergedItems[item.id]) {
        mergedItems[item.id].quantity += item.quantity;
      } else {
        mergedItems[item.id] = { ...item };
      }
    });
    
    return Object.values(mergedItems);
  };

  // Сохранение корзины
  const saveCartToDatabase = async () => {
    try {
      if (user) {
        // Сохраняем в Firestore для авторизованного пользователя
        const cartRef = doc(db, CARTS_COLLECTION, user.id);
        await updateDoc(cartRef, { 
          items: cart,
          updatedAt: serverTimestamp()
        });
      } else {
        // Сохраняем в localStorage для гостя
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Добавление товара в корзину
  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    try {
      const existingItemIndex = cart.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Обновляем количество, если товар уже в корзине
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += 1;
        setCart(updatedCart);
      } else {
        // Добавляем новый товар
        setCart(prev => [...prev, { ...item, quantity: 1 }]);
      }
      
      await saveCartToDatabase();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  // Удаление товара из корзины
  const removeFromCart = async (itemId: string) => {
    try {
      const updatedCart = cart.filter(item => item.id !== itemId);
      setCart(updatedCart);
      await saveCartToDatabase();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Обновление количества товара
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const updatedCart = cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      
      setCart(updatedCart);
      await saveCartToDatabase();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  // Расчет общей суммы
  const getTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // Получение общего количества товаров
  const getItemsCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Очистка корзины
  const clearCart = async () => {
    try {
      setCart([]);
      await saveCartToDatabase();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotal,
    getItemsCount,
    clearCart,
    saveCartToDatabase
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
