"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { useCart } from "@/hooks/useCart";
import { useSettings } from "@/contexts/SettingsContext";

export type DeliveryMethod = "standard" | "express";
export type PaymentMethod = "mpesa" | "cod";

export type CheckoutAddress = {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  notes?: string;
};

export type CheckoutLocation = {
  lat: number;
  lng: number;
} | null;

export type CheckoutState = {
  deliveryMethod: DeliveryMethod | null;
  paymentMethod: PaymentMethod | null;
  address: CheckoutAddress | null;
  location: CheckoutLocation;
};

type CheckoutContextType = {
  state: CheckoutState;

  setDelivery: (method: DeliveryMethod) => void;
  setPayment: (method: PaymentMethod) => void;
  setAddress: (address: CheckoutAddress) => void;
  setLocation: (location: CheckoutLocation) => void;

  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;

  availablePaymentMethods: PaymentMethod[];
  belowMinOrder: boolean;
  canCheckout: boolean;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

/*  SHIPPING + TAX RULES  */

function getShippingFee(
  method: DeliveryMethod | null,
  deliveryFee: number,
  subtotal: number,
  freeDeliveryThreshold: number,
) {
  // Self pickup is always free
  if (method === "express") return 0;
  // Orders at/above the free-delivery threshold ship free
  if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) return 0;
  // Home delivery uses the admin-configured flat fee
  return deliveryFee;
}

function getTaxRate(settingsTaxRate: number) {
  return settingsTaxRate;
}

const SESSION_KEY = "checkout_state";

const defaultState: CheckoutState = {
  deliveryMethod: "standard",
  paymentMethod: "mpesa",
  address: { fullName: "", street: "", city: "", postalCode: "", phone: "" },
  location: null,
};

function loadPersistedState(): CheckoutState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

/*  PROVIDER  */

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { items, subtotal } = useCart();
  const { settings } = useSettings();

  // Always start with defaultState so server and client initial renders match.
  // Load from sessionStorage after mount to avoid hydration mismatch.
  const [state, setState] = useState<CheckoutState>(defaultState);

  useEffect(() => {
    setState(loadPersistedState());
  }, []);

  // Persist address/delivery/payment to sessionStorage on every change.
  // location (lat/lng) is not persisted — it's derived from the address via Maps.
  useEffect(() => {
    const { location: _loc, ...persistable } = state;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(persistable));
    } catch {
      // sessionStorage may be unavailable in private browsing
    }
  }, [state]);

  /*  STATE SETTERS  */

  const setDelivery = (method: DeliveryMethod) => {
    setState((prev) => ({
      ...prev,
      deliveryMethod: method,
    }));
  };

  const setPayment = (method: PaymentMethod) => {
    setState((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const setAddress = (address: CheckoutAddress) => {
    setState((prev) => ({
      ...prev,
      address,
    }));
  };

  const setLocation = (location: CheckoutLocation) => {
    setState((prev) => ({
      ...prev,
      location,
    }));
  };

  /* PRICING  */

  const shipping = useMemo(() => {
    return getShippingFee(
      state.deliveryMethod,
      settings.deliveryFee,
      subtotal,
      settings.freeDeliveryThreshold,
    );
  }, [state.deliveryMethod, settings.deliveryFee, subtotal, settings.freeDeliveryThreshold]);

  const taxes = useMemo(() => {
    const rate = getTaxRate(settings.taxRate) / 100;
    return subtotal * rate;
  }, [subtotal, settings.taxRate]);

  const total = useMemo(() => {
    return subtotal + shipping + taxes;
  }, [subtotal, shipping, taxes]);

  /*  VALIDATION */

  const availablePaymentMethods = useMemo<PaymentMethod[]>(() => {
    const methods: PaymentMethod[] = [];
    if (settings.mpesaEnabled) methods.push("mpesa");
    if (settings.codEnabled) methods.push("cod");
    return methods;
  }, [settings.mpesaEnabled, settings.codEnabled]);

  const belowMinOrder = useMemo(() => {
    return (
      settings.minOrderAmount > 0 && subtotal < settings.minOrderAmount
    );
  }, [settings.minOrderAmount, subtotal]);

  const canCheckout = useMemo(() => {
    return (
      items.length > 0 &&
      !belowMinOrder &&
      !!state.address?.fullName &&
      !!state.address?.street &&
      !!state.address?.phone &&
      !!state.paymentMethod &&
      availablePaymentMethods.includes(state.paymentMethod)
    );
  }, [
    items.length,
    belowMinOrder,
    state.address,
    state.paymentMethod,
    availablePaymentMethods,
  ]);

  /*  CONTEXT VALUE*/

  return (
    <CheckoutContext.Provider
      value={{
        state,

        setDelivery,
        setPayment,
        setAddress,
        setLocation,

        subtotal,
        shipping,
        taxes,
        total,

        availablePaymentMethods,
        belowMinOrder,
        canCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

/*  HOOK  */

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckout must be used inside CheckoutProvider");
  }

  return context;
}
