"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CART_QUERY_KEY = ["cart"] as const;

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/+$/, "");

const CART_URL = API_BASE_URL.endsWith("/api")
  ? `${API_BASE_URL}/cart`
  : `${API_BASE_URL}/api/cart`;

/*  TYPES */

interface ApiCartItem {
  productId: number;
  quantity: number;
  product: {
    name: string;
    imageUrl: string | null;
    price: number | string;
  };
}

interface ApiCart {
  items: ApiCartItem[];
}

export interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtitle: string;
  originalPrice?: number;
}

const toNumber = (value: number | string) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

/* ───────────────── API */

async function fetchCart(): Promise<ApiCart> {
  const res = await fetch(CART_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch cart");
  }

  return res.json();
}

async function addToCartApi(productId: number) {
  const res = await fetch(CART_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      quantity: 1,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to add item");
  }

  return res.json();
}

async function updateItemApi(productId: number, quantity: number) {
  const res = await fetch(`${CART_URL}/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok) {
    throw new Error("Failed to update item");
  }

  return res.json();
}

async function removeItemApi(productId: number) {
  const res = await fetch(`${CART_URL}/${productId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to remove item");
  }

  return res.json();
}

async function clearCartApi() {
  const res = await fetch(CART_URL, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to clear cart");
  }
}

/* HOOK */

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    staleTime: 5000,
  });

  const items: CartItem[] = useMemo(() => {
    return (cartQuery.data?.items ?? []).map((item) => ({
      id: String(item.productId),
      name: item.product.name,
      imageUrl: item.product.imageUrl ?? "/placeholder.webp",
      price: toNumber(item.product.price),
      quantity: item.quantity,
      subtitle: "",
    }));
  }, [cartQuery.data]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = items.length;

  const total = subtotal;

  /* ADD */

  const addMutation = useMutation({
    mutationFn: addToCartApi,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  /* UPDATE */

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => updateItemApi(productId, quantity),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  /* REMOVE  */

  const removeMutation = useMutation({
    mutationFn: removeItemApi,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  /* CLEAR  */

  const clearMutation = useMutation({
    mutationFn: clearCartApi,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  const isItemPending = useCallback(
    (productId: number) => {
      const pendingUpdateProductId = updateMutation.variables?.productId;
      const pendingRemoveProductId = removeMutation.variables;

      return (
        (updateMutation.isPending && pendingUpdateProductId === productId) ||
        (removeMutation.isPending && pendingRemoveProductId === productId)
      );
    },
    [
      removeMutation.isPending,
      removeMutation.variables,
      updateMutation.isPending,
      updateMutation.variables,
    ],
  );

  return {
    items,
    subtotal,
    total,
    totalItems,

    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,

    addToCart: addMutation.mutate,
    updateItem: updateMutation.mutate,
    removeItem: removeMutation.mutate,
    clearCart: clearMutation.mutate,

    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isClearing: clearMutation.isPending,
    isClearPending: clearMutation.isPending,
    isItemPending,
  };
}
