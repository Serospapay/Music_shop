import { z } from "zod";

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
  items: z.array(checkoutItemSchema).min(1, "Кошик порожній"),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
