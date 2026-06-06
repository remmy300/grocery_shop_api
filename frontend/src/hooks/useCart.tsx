"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/lib/api";

const CART_QUERY_KEY = ["cart"] as const;
const GUEST_CART_KEY = "guestCart";

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

const isAuthenticated = () => !!getAccessToken();

const getGuestCart = (): ApiCart => {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : { items: [] };
  } catch {
    return { items: [] };
  }
};

const saveGuestCart = (cart: ApiCart) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
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
  const token = getAccessToken();

  // If authenticated, fetch from backend
  if (token) {
    const res = await fetch(CART_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch cart from server, using guest cart");
      return getGuestCart();
    }

    return res.json();
  }

  // Otherwise return guest cart from localStorage
  return getGuestCart();
}

async function addToCartApi(productId: number) {
  const token = getAccessToken();

  // For authenticated users, sync with backend
  if (token) {
    const res = await fetch(CART_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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

  // For guests, store in localStorage
  const cart = getGuestCart();
  const existingItem = cart.items.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Add placeholder product info (will be filled later)
    cart.items.push({
      productId,
      quantity: 1,
      product: {
        name: "",
        imageUrl: null,
        price: 0,
      },
    });
  }

  saveGuestCart(cart);
  return cart;
}

async function updateItemApi(productId: number, quantity: number) {
  const token = getAccessToken();

  // For authenticated users, sync with backend
  if (token) {
    const res = await fetch(`${CART_URL}/${productId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, "Failed to update item"));
    }

    return res.json();
  }

  // For guests, update localStorage
  if (quantity <= 0) {
    return removeItemApi(productId);
  }

  const cart = getGuestCart();
  const item = cart.items.find((item) => item.productId === productId);

  if (item) {
    item.quantity = quantity;
  }

  saveGuestCart(cart);
  return cart;
}

async function removeItemApi(productId: number) {
  const token = getAccessToken();

  // For authenticated users, sync with backend
  if (token) {
    const res = await fetch(`${CART_URL}/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, "Failed to remove item"));
    }

    return res.json();
  }

  // For guests, remove from localStorage
  const cart = getGuestCart();
  cart.items = cart.items.filter((item) => item.productId !== productId);
  saveGuestCart(cart);
  return cart;
}

async function clearCartApi() {
  const token = getAccessToken();

  // For authenticated users, sync with backend
  if (token) {
    const res = await fetch(CART_URL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, "Failed to clear cart"));
    }
  }

  // Clear guest cart
  clearGuestCart();
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

    // Optimistic update: immediately reflect the add in the cache
    onMutate: async (productId: number) => {
      console.log("Adding product (optimistic):", productId);

      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previous =
        (queryClient.getQueryData(CART_QUERY_KEY) as ApiCart) ?? getGuestCart();

      const items = [...(previous.items ?? [])];
      const idx = items.findIndex((it) => it.productId === productId);

      if (idx > -1) {
        items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 };
      } else {
        items.unshift({
          productId,
          quantity: 1,
          product: { name: "", imageUrl: null, price: 0 },
        });
      }

      const optimisticCart: ApiCart = { items };
      queryClient.setQueryData(CART_QUERY_KEY, optimisticCart);

      return { previous };
    },

    onError: (err, _productId, context: { previous?: ApiCart } | undefined) => {
      console.error("Add to cart failed, rolling back:", err);
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },

    onSuccess: (updatedCart) => {
      // Replace optimistic value with authoritative server response (or guest cart)
      console.log("Cart updated (server):", updatedCart);
      if (updatedCart) {
        queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      }
    },

    onSettled: () => {
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

    // Optimistic update for quantity changes
    onMutate: async ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previous =
        (queryClient.getQueryData(CART_QUERY_KEY) as ApiCart) ?? getGuestCart();

      const items = [...(previous.items ?? [])];
      const idx = items.findIndex((it) => it.productId === productId);

      if (quantity <= 0) {
        // treat as remove
        if (idx > -1) items.splice(idx, 1);
      } else if (idx > -1) {
        items[idx] = { ...items[idx], quantity };
      } else {
        items.unshift({
          productId,
          quantity,
          product: { name: "", imageUrl: null, price: 0 },
        });
      }

      const optimisticCart: ApiCart = { items };
      queryClient.setQueryData(CART_QUERY_KEY, optimisticCart);

      if (!isAuthenticated()) saveGuestCart(optimisticCart);

      return { previous };
    },

    onError: (err, vars, context: { previous?: ApiCart } | undefined) => {
      console.error("Update cart failed, rolling back:", err);
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
        if (!isAuthenticated()) saveGuestCart(context.previous);
      }
    },

    onSuccess: (updatedCart) => {
      if (updatedCart) {
        queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
        if (!isAuthenticated()) saveGuestCart(updatedCart as ApiCart);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  /* REMOVE  */

  const removeMutation = useMutation({
    mutationFn: removeItemApi,

    // Optimistic remove
    onMutate: async (productId: number) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previous =
        (queryClient.getQueryData(CART_QUERY_KEY) as ApiCart) ?? getGuestCart();

      const items = (previous.items ?? []).filter(
        (it) => it.productId !== productId,
      );
      const optimisticCart: ApiCart = { items };
      queryClient.setQueryData(CART_QUERY_KEY, optimisticCart);

      if (!isAuthenticated()) saveGuestCart(optimisticCart);

      return { previous };
    },

    onError: (err, _productId, context: { previous?: ApiCart } | undefined) => {
      console.error("Remove cart item failed, rolling back:", err);
      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
        if (!isAuthenticated()) saveGuestCart(context.previous);
      }
    },

    onSuccess: (updatedCart) => {
      if (updatedCart) {
        queryClient.setQueryData(CART_QUERY_KEY, updatedCart as ApiCart);
        if (!isAuthenticated()) saveGuestCart(updatedCart as ApiCart);
      }
    },

    onSettled: () => {
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
