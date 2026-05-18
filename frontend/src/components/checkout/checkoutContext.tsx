"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { CheckoutState } from "@/types";

import { useCart } from "@/hooks/useCart";
type CheckoutContextType = {
  state: CheckoutState;

  setDelivery: (method: CheckoutState["deliveryMethod"]) => void;

  setPayment: (method: CheckoutState["paymentMethod"]) => void;

  setAddress: (address: CheckoutState["address"]) => void;

  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function CheckoutProvider({ children }: Props) {
  const { subtotal } = useCart();

  const [state, setState] = useState<CheckoutState>({
    deliveryMethod: "standard",
    paymentMethod: "card",

    address: {
      fullName: "",
      street: "",
      city: "",
      postalCode: "",
      phone: "",
    },
  });

  const setDelivery = (method: CheckoutState["deliveryMethod"]) => {
    setState((prev) => ({
      ...prev,
      deliveryMethod: method,
    }));
  };

  const setPayment = (method: CheckoutState["paymentMethod"]) => {
    setState((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const setAddress = (address: CheckoutState["address"]) => {
    setState((prev) => ({
      ...prev,
      address,
    }));
  };

  /*
    DYNAMIC TOTALS
  */

  const shipping = useMemo(() => {
    if (subtotal >= 100) {
      return 0;
    }

    if (state.deliveryMethod === "express") {
      return 12.5;
    }

    return 4.99;
  }, [subtotal, state.deliveryMethod]);

  const taxRate = state.address?.city === "Nairobi" ? 0.16 : 0.1;

  const taxes = subtotal * taxRate;

  const total = useMemo(() => {
    return subtotal + shipping + taxes;
  }, [subtotal, shipping, taxes]);

  return (
    <CheckoutContext.Provider
      value={{
        state,

        setDelivery,
        setPayment,
        setAddress,

        subtotal,
        shipping,
        taxes,
        total,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckout must be used inside CheckoutProvider");
  }

  return context;
}
