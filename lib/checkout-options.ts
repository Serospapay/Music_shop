export const DELIVERY_METHOD_VALUES = [
  "NOVA_POSHTA_WAREHOUSE",
  "NOVA_POSHTA_COURIER",
  "UKRPOSHTA",
  "STORE_PICKUP",
] as const;

export type DeliveryMethod = (typeof DELIVERY_METHOD_VALUES)[number];

export const PAYMENT_METHOD_VALUES = ["CASH_ON_DELIVERY", "ONLINE_CARD", "BANK_TRANSFER"] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  NOVA_POSHTA_WAREHOUSE: "Нова Пошта (відділення)",
  NOVA_POSHTA_COURIER: "Нова Пошта (кур'єр)",
  UKRPOSHTA: "Укрпошта",
  STORE_PICKUP: "Самовивіз з магазину",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: "Післяплата при отриманні",
  ONLINE_CARD: "Оплата карткою онлайн",
  BANK_TRANSFER: "Безготівковий переказ",
};

export const DELIVERY_METHOD_FEES: Record<DeliveryMethod, number> = {
  NOVA_POSHTA_WAREHOUSE: 120,
  NOVA_POSHTA_COURIER: 180,
  UKRPOSHTA: 90,
  STORE_PICKUP: 0,
};

export function getDeliveryFee(method: DeliveryMethod): number {
  return DELIVERY_METHOD_FEES[method] ?? 0;
}
