"use client";

import { useCartContext } from "@/contexts/cartContext";

export function useCart() {
  return useCartContext();
}
