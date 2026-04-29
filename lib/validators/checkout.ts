import { z } from "zod";
import { DELIVERY_METHOD_VALUES, PAYMENT_METHOD_VALUES } from "@/lib/checkout-options";

export const checkoutFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Вкажіть ім'я (мінімум 2 символи)")
    .max(120, "Ім'я занадто довге"),
  email: z.string().trim().email("Вкажіть коректний email"),
  phone: z
    .string()
    .trim()
    .min(8, "Вкажіть коректний номер телефону")
    .max(24, "Номер телефону занадто довгий"),
  address: z
    .string()
    .trim()
    .min(8, "Вкажіть повну адресу доставки")
    .max(300, "Адреса занадто довга"),
  deliveryMethod: z.enum(DELIVERY_METHOD_VALUES, {
    required_error: "Оберіть спосіб доставки",
    invalid_type_error: "Оберіть спосіб доставки",
  }),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES, {
    required_error: "Оберіть спосіб оплати",
    invalid_type_error: "Оберіть спосіб оплати",
  }),
  customerComment: z.string().trim().max(500, "Коментар занадто довгий").default(""),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Некоректний товар"),
  quantity: z
    .number()
    .int("Некоректна кількість")
    .min(1, "Мінімум 1 одиниця")
    .max(99, "Максимум 99 одиниць на позицію"),
});

export const checkoutPayloadSchema = z.object({
  customerName: checkoutFormSchema.shape.customerName,
  email: checkoutFormSchema.shape.email,
  phone: checkoutFormSchema.shape.phone,
  address: checkoutFormSchema.shape.address,
  deliveryMethod: checkoutFormSchema.shape.deliveryMethod,
  paymentMethod: checkoutFormSchema.shape.paymentMethod,
  customerComment: checkoutFormSchema.shape.customerComment,
  items: z.array(checkoutItemSchema).min(1, "Кошик порожній"),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
