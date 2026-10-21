import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  /** Unique line id within the cart (productId:color:size) */
  id: string;
  productId: string;
  title: string;
  handle: string;
  imageUrl: string | null;
  color: string | null;
  size: string | null;
  priceColones: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  buyNowItem: CartItem | null;
  startBuyNow: (item: Omit<CartItem, 'quantity'>) => void;
  clearBuyNow: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      buyNowItem: null,
      startBuyNow: (item) => set({ buyNowItem: { ...item, quantity: 1 } }),
      clearBuyNow: () => set({ buyNowItem: null }),

      addItem: (item) => {
        const quantity = item.quantity ?? 1;
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity }] });
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'yms-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, buyNowItem: state.buyNowItem }),
    }
  )
);

export const SHIPPING_COST_COLONES = 3000;
