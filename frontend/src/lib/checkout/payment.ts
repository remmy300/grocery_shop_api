import type { CartItem } from "@/hooks/useCart";
import { CheckoutState, DeliveryMethod } from "@/types";

export const DELIVERY_FEES: Record<DeliveryMethod, number> = {
  standard: 0,
  express: 12.5,
};

export function getSubtotal(items: CartItem[]) {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

export function getShipping(deliveryMethod?: CheckoutState["deliveryMethod"]) {
  return deliveryMethod ? DELIVERY_FEES[deliveryMethod] : 0;
}

export function getTotal(items: CartItem[], deliveryMethod?: DeliveryMethod) {
  return getSubtotal(items) + getShipping(deliveryMethod);
}
