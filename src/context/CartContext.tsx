// src/context/CartContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback
} from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
  isCustomBouquet?: boolean;
  customBouquetData?: any;
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
  saveCartToDatabase: (items?: CartItem[]) => Promise<void>;
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

import { mergeCartItems } from './cartMerge';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Зеркало state в ref — нужно для безопасного persist в Firestore из
  // функций, которые могут отстреливаться в любой момент (race-safe). При
  // быстрых последовательных add/update вычисляем next-state внутри
  // setCart(prev => ...), а сохраняем актуальный снимок через ref.
  const cartRef = useRef<CartItem[]>([]);
  const loadingRef = useRef(true);
  // Если пользователь дёргает addToCart до завершения первичной загрузки,
  // помечаем флаг и не позволяем перезаписать серверную корзину.
  const hasPendingPrivateOpsRef = useRef(false);

  // Сохранение корзины — берёт actual cart из ref, не из closure.
  const saveCartToDatabase = useCallback(async (itemsToSave?: CartItem[]) => {
    const cartData = itemsToSave ?? cartRef.current;
    try {
      if (user) {
        const cartRef2 = doc(db, CARTS_COLLECTION, user.id);
        await updateDoc(cartRef2, {
          items: cartData,
          updatedAt: serverTimestamp()
        });
      } else {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [user]);

  // Загрузка корзины при инициализации или смене пользователя.
  useEffect(() => {
    let cancelled = false;
    const loadCart = async () => {
      setLoading(true);
      loadingRef.current = true;
      hasPendingPrivateOpsRef.current = false;
      try {
        if (user) {
          const cartFsRef = doc(db, CARTS_COLLECTION, user.id);
          const cartDoc = await getDoc(cartFsRef);
          if (cancelled) return;

          let serverItems: CartItem[] = [];
          if (cartDoc.exists()) {
            serverItems = cartDoc.data().items || [];
          } else {
            await setDoc(cartFsRef, { items: [], updatedAt: serverTimestamp() });
          }

          const guestCart = localStorage.getItem(GUEST_CART_KEY);
          let resolved: CartItem[];
          if (guestCart) {
            const guestItems: CartItem[] = JSON.parse(guestCart);
            if (guestItems.length > 0) {
              resolved = mergeCartItems([...serverItems, ...guestItems]);
              await updateDoc(cartFsRef, {
                items: resolved,
                updatedAt: serverTimestamp()
              });
              localStorage.removeItem(GUEST_CART_KEY);
            } else {
              resolved = serverItems;
            }
          } else {
            resolved = serverItems;
          }

          // Если за время загрузки уже были локальные изменения (быстрый
          // клик «Do košíku» во время load), мерджим их к серверной версии,
          // а не перезаписываем.
          if (hasPendingPrivateOpsRef.current && cartRef.current.length > 0) {
            resolved = mergeCartItems([...resolved, ...cartRef.current]);
            await updateDoc(cartFsRef, {
              items: resolved,
              updatedAt: serverTimestamp()
            });
          }

          cartRef.current = resolved;
          setCart(resolved);
        } else {
          const guestCart = localStorage.getItem(GUEST_CART_KEY);
          const resolved = guestCart ? JSON.parse(guestCart) : [];
          cartRef.current = resolved;
          setCart(resolved);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        cartRef.current = [];
        setCart([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    loadCart();
    return () => { cancelled = true; };
  }, [user]);

  // Добавление товара. Functional setState + ref гарантируют, что 5 быстрых
  // кликов дают +5, а не +1.
  const addToCart = useCallback(async (item: Omit<CartItem, "quantity">) => {
    let nextCart: CartItem[] = [];
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        nextCart = prev.map((it, i) =>
          i === idx ? { ...it, quantity: it.quantity + 1 } : it
        );
      } else {
        nextCart = [...prev, { ...item, quantity: 1 }];
      }
      cartRef.current = nextCart;
      return nextCart;
    });
    if (loadingRef.current) {
      hasPendingPrivateOpsRef.current = true;
      return; // persist отложен до конца loadCart
    }
    await saveCartToDatabase(nextCart);
  }, [saveCartToDatabase]);

  // Удаление товара.
  const removeFromCart = useCallback(async (itemId: string) => {
    let nextCart: CartItem[] = [];
    setCart(prev => {
      nextCart = prev.filter(item => item.id !== itemId);
      cartRef.current = nextCart;
      return nextCart;
    });
    if (loadingRef.current) {
      hasPendingPrivateOpsRef.current = true;
      return;
    }
    await saveCartToDatabase(nextCart);
  }, [saveCartToDatabase]);

  // Обновление количества.
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    let nextCart: CartItem[] = [];
    setCart(prev => {
      nextCart = prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      cartRef.current = nextCart;
      return nextCart;
    });
    if (loadingRef.current) {
      hasPendingPrivateOpsRef.current = true;
      return;
    }
    await saveCartToDatabase(nextCart);
  }, [saveCartToDatabase, removeFromCart]);

  const getTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getItemsCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Очистка корзины. Возвращает Promise — критично для checkout.
  const clearCart = useCallback(async () => {
    const emptyCart: CartItem[] = [];
    cartRef.current = emptyCart;
    setCart(emptyCart);
    await saveCartToDatabase(emptyCart);
  }, [saveCartToDatabase]);

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
