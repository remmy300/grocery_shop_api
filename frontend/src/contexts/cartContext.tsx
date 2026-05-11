"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  subtitle: string;
};

type CartContextType = {
  items: CartItem[];

  subtotal: number;
  carbonOffset: number;
  total: number;

  addItem: (item: CartItem) => void;

  removeItem: (productId: string) => void;

  updateQuantity: (productId: string, quantity: number) => void;

  clearCart: () => void;

  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const CartProvider = ({ children }: Props) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // ACTIONS

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existingItem = prev.find((p) => p.id === item.id);

      if (existingItem) {
        return prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                quantity: p.quantity + item.quantity,
              }
            : p,
        );
      }

      return [...prev, item];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // CALCULATIONS

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const carbonOffset = useMemo(() => {
    if (items.length === 0) return 0;

    return 1.5;
  }, [items]);

  const total = useMemo(() => {
    return subtotal + carbonOffset;
  }, [subtotal, carbonOffset]);

  const itemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,

        subtotal,
        carbonOffset,
        total,

        addItem,
        removeItem,
        updateQuantity,
        clearCart,

        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// HOOK
export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartContext must be used inside CartProvider");
  }

  return context;
}

export const useCart = useCartContext;
