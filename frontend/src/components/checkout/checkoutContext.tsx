"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { useCart } from "@/hooks/useCart";

export type DeliveryMethod = "standard" | "express";
export type PaymentMethod = "mpesa" | "card" | "cod";

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

  canCheckout: boolean;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

/*  SHIPPING RULES  */

function getShippingFee(method: DeliveryMethod | null, subtotal: number) {
  if (subtotal >= 1000) return 0;

  switch (method) {
    case "express":
      return 250;
    case "standard":
    default:
      return 100;
  }
}

function getTaxRate(city?: string) {
  if (!city) return 0.16;
  return city.toLowerCase() === "nairobi" ? 0.16 : 0.1;
}

/*  PROVIDER  */

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { items, subtotal } = useCart();

  const [state, setState] = useState<CheckoutState>({
    deliveryMethod: "standard",
    paymentMethod: "mpesa",
    address: {
      fullName: "",
      street: "",
      city: "",
      postalCode: "",
      phone: "",
    },
    location: null,
  });

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
    return getShippingFee(state.deliveryMethod, subtotal);
  }, [state.deliveryMethod, subtotal]);

  const taxes = useMemo(() => {
    const rate = getTaxRate(state.address?.city ?? undefined);
    return subtotal * rate;
  }, [subtotal, state.address?.city]);

  const total = useMemo(() => {
    return subtotal + shipping + taxes;
  }, [subtotal, shipping, taxes]);

  /*  VALIDATION */

  const canCheckout = useMemo(() => {
    return (
      items.length > 0 &&
      !!state.address?.street &&
      !!state.address?.phone &&
      !!state.paymentMethod
    );
  }, [items.length, state.address, state.paymentMethod]);

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
