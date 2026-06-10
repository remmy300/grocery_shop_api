"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/lib/api";
import { fetchProducts } from "@/lib/products";

export const CART_QUERY_KEY = ["cart"] as const;

const API_BASE_URL = getApiBaseUrl();

const CART_URL = API_BASE_URL.endsWith("/api")
  ? `${API_BASE_URL}/cart`
  : `${API_BASE_URL}/api/cart`;

/* ───────────────── AUTH */

export const getAccessToken = () => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
  );
};

const isAuthenticated = () => !!getAccessToken();

const getAuthHeaders = () => {
  const token = getAccessToken();
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/* ───────────────── ERROR HANDLING */

const getErrorMessage = async (res: Response, fallback: string) => {
  try {
    const body = await res.json();
    return body?.message || body?.error || fallback;
  } catch {
    return fallback;
  }
};

/* ───────────────── TYPES */

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
}

/* ───────────────── HELPERS */

const toNumber = (value: number | string) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

/* ───────────────── API */

// Hydrating cart items

async function fetchCart(): Promise<ApiCart> {
  const token = getAccessToken();

  if (!token) {
    return getGuestCart();
  }

  const res = await fetch(CART_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch cart");
  }

  return res.json();
}
const GUEST_CART_KEY = "guest_cart";

function getGuestCart(): ApiCart {
  if (typeof window === "undefined") return { items: [] };

  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "");
  } catch {
    return { items: [] };
  }
}

function saveGuestCart(cart: ApiCart) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

async function addToCartApi(productId: number) {
  const token = getAccessToken();

  if (!token) {
    const cart = getGuestCart();

    const existing = cart.items.find((i) => i.productId === productId);

    if (existing) {
      existing.quantity += 1;
    } else {
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

  if (token) {
    const res = await fetch(CART_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (!res.ok) throw new Error("Failed");

    return res.json();
  }
}
async function updateItemApi(productId: number, quantity: number) {
  const token = getAccessToken();
  if (!token) {
    return getGuestCart();
  }

  const res = await fetch(`${CART_URL}/${productId}`, {
    method: "PATCH",
    headers: getAuthHeaders()!,
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to update item"));
  }

  return res.json();
}

export function useCartSyncOnLogin() {
  const run = async () => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    const guest = getGuestCart();

    if (!guest.items.length) return;

    await fetch(`${CART_URL}/merge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: guest.items }),
    });

    localStorage.removeItem(GUEST_CART_KEY);
  };

  return { run };
}

async function removeItemApi(productId: number) {
  const token = getAccessToken();
  if (!token) {
    return getGuestCart();
  }

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

async function clearCartApi() {
  const token = getAccessToken();
  if (!token) {
    return getGuestCart();
  }

  const res = await fetch(CART_URL, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to clear cart"));
  }

  return res.json();
}

/* ───────────────── HOOK */

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    enabled: true, //  only run if logged in
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  /* NORMALIZED ITEMS */

  const items: CartItem[] = useMemo(() => {
    return (cartQuery.data?.items ?? []).map((item) => {
      const product = productMap.get(item.productId);

      return {
        id: String(item.productId),
        name: product?.name ?? item.product?.name ?? "Unknown Product",
        imageUrl:
          product?.imageUrl ?? item.product?.imageUrl ?? "/placeholder.webp",
        price: product?.priceValue ?? toNumber(item.product?.price ?? 0),
        quantity: item.quantity,
        subtitle: product?.category ?? "",
      };
    });
  }, [cartQuery.data, productMap]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = items.length;
  const total = subtotal;

  /* ───────────────── MUTATIONS */

  const addToCart = useMutation({
    mutationFn: addToCartApi,

    onMutate: async (productId: number) => {
      console.log(" Optimistic add:", productId);

      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previous = queryClient.getQueryData<ApiCart>(CART_QUERY_KEY) ?? {
        items: [],
      };

      const items = [...previous.items];

      const idx = items.findIndex((it) => it.productId === productId);

      if (idx > -1) {
        items[idx] = {
          ...items[idx],
          quantity: items[idx].quantity + 1,
        };
      } else {
        items.unshift({
          productId,
          quantity: 1,
          product: { name: "", imageUrl: null, price: 0 },
        });
      }

      queryClient.setQueryData(CART_QUERY_KEY, { items });

      return { previous };
    },

    onError: (err, _productId, context) => {
      console.error(" Add to cart failed:", err);

      if (context?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },

    onSuccess: (data) => {
      console.log("Server cart:", data);
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  const updateItem = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => updateItemApi(productId, quantity),

    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  const removeItem = useMutation({
    mutationFn: removeItemApi,

    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  const clearCart = useMutation({
    mutationFn: clearCartApi,

    onSuccess: () => {
      queryClient.setQueryData(CART_QUERY_KEY, { items: [] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  /* ───────────────── RETURN */

  const isItemPending = useCallback(
    (productId: number) => {
      return (
        addToCart.isPending || updateItem.isPending || removeItem.isPending
      );
    },
    [addToCart.isPending, updateItem.isPending, removeItem.isPending],
  );

  return {
    items,
    subtotal,
    total,
    totalItems,

    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,

    addToCart: addToCart.mutate,
    updateItem: updateItem.mutate,
    removeItem: removeItem.mutate,
    clearCart: clearCart.mutate,

    isAdding: addToCart.isPending,
    isUpdating: updateItem.isPending,
    isRemoving: removeItem.isPending,
    isClearing: clearCart.isPending,

    isItemPending,
  };
}
