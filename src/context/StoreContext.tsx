import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Category, LocalCartItem, StoreSettings } from '../types.ts';

const CART_STORAGE_KEY = 'dapur_ibu_raka_cart_v1';

interface StoreContextValue {
  settings: StoreSettings;
  categories: Category[];
  loadingStore: boolean;
  refreshStore: () => Promise<void>;
  cart: LocalCartItem[];
  totalCartQuantity: number;
  addToCart: (productId: number, quantity: number, clientPrice?: number, productName?: string) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  replaceCart: (items: LocalCartItem[]) => void;
  clearCart: () => void;
  toastMessage: string | null;
  dismissToast: () => void;
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  brand_name: 'Dapur Ibu Raka Dimsum',
  description:
    'Dimsum artisanal buatan rumah yang diracik setiap pagi dari daging ayam pilihan, udang segar, dan bumbu alami tanpa bahan pengawet.',
  whatsapp_number: '6281234567890',
  address: 'Jl. Melati Kusuma No. 18, Kemang Timur, Jakarta Selatan 12730',
  operational_hours: 'Setiap Hari, 08.00 – 20.00 WIB',
  instagram: '@dapuriburaka.dimsum',
  tiktok: '@dapuriburaka',
  shipping_info: 'Pengiriman instan & sameday setiap hari. Gratis ongkir area kota untuk pembelian minimal Rp150.000.',
  shipping_fee: 10000,
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function readCartFromStorage(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => Number.isInteger(item?.productId) && item.productId > 0 && Number.isInteger(item?.quantity) && item.quantity > 0)
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        clientPrice: typeof item.clientPrice === 'number' ? item.clientPrice : undefined,
      }));
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [cart, setCart] = useState<LocalCartItem[]>(() => readCartFromStorage());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshStore = useCallback(async () => {
    try {
      const res = await fetch('/api/store');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.categories)) setCategories(data.categories);
      }
    } catch {
      // Fallback to default state on transient failure
    } finally {
      setLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const addToCart = useCallback((productId: number, quantity: number, clientPrice?: number, productName?: string) => {
    if (quantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity, clientPrice: clientPrice ?? i.clientPrice }
            : i
        );
      }
      return [...prev, { productId, quantity, clientPrice }];
    });
    setToastMessage(productName ? `${productName} ditambahkan ke keranjang` : 'Produk ditambahkan ke keranjang');
  }, []);

  const updateCartQuantity = useCallback((productId: number, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const replaceCart = useCallback((items: LocalCartItem[]) => {
    setCart(items);
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        loadingStore,
        refreshStore,
        cart,
        totalCartQuantity,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        replaceCart,
        clearCart,
        toastMessage,
        dismissToast: () => setToastMessage(null),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore harus digunakan di dalam StoreProvider');
  return ctx;
}
