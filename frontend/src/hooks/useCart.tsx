"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/lib/api";

const CART_QUERY_KEY = ["cart"] as const;

const API_BASE_URL = getApiBaseUrl();

const CART_URL = API_BASE_URL.endsWith("/api")
  ? `${API_BASE_URL}/cart`
  : `${API_BASE_URL}/api/cart`;

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
  );
};

const getAuthHeaders = () => {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const getErrorMessage = async (res: Response, fallback: string) => {
  try {
    const body = (await res.json()) as { message?: string; error?: string };
    return body.message || body.error || fallback;
  } catch {
    return fallback;
  }
};

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
  const authHeaders = getAuthHeaders();

  if (!authHeaders) {
    return { items: [] };
  }

  const res = await fetch(CART_URL, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to fetch cart"));
  }

  return res.json();
}

async function addToCartApi(productId: number) {
  const authHeaders = getAuthHeaders();

  if (!authHeaders) {
    throw new Error("Please sign in before adding items to your cart");
  }

  const res = await fetch(CART_URL, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      quantity: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to add item"));
  }

  return res.json();
}

async function updateItemApi(productId: number, quantity: number) {
  const authHeaders = getAuthHeaders();

  if (!authHeaders) {
    throw new Error("Please sign in before updating your cart");
  }

  const res = await fetch(`${CART_URL}/${productId}`, {
    method: "PATCH",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to update item"));
  }

  return res.json();
}

async function removeItemApi(productId: number) {
  const authHeaders = getAuthHeaders();

  if (!authHeaders) {
    throw new Error("Please sign in before updating your cart");
  }

  const res = await fetch(`${CART_URL}/${productId}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to remove item"));
  }

  return res.json();
}

async function clearCartApi() {
  const authHeaders = getAuthHeaders();

  if (!authHeaders) {
    throw new Error("Please sign in before updating your cart");
  }

  const res = await fetch(CART_URL, {
    method: "DELETE",
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to clear cart"));
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
