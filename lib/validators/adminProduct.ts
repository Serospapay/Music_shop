import { z } from "zod";

export const adminProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Назва має містити мінімум 2 символи")
    .max(160, "Назва занадто довга"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug має містити мінімум 2 символи")
    .max(180, "Slug занадто довгий")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug має бути у форматі my-product-slug"),
  description: z
    .string()
    .trim()
    .min(10, "Опис має містити мінімум 10 символів")
    .max(2000, "Опис занадто довгий"),
  price: z
    .coerce
    .number()
    .positive("Ціна має бути більшою за 0")
    .max(100000000, "Некоректна ціна"),
  category: z
    .string()
    .trim()
    .min(2, "Категорія має містити мінімум 2 символи")
    .max(120, "Категорія занадто довга"),
  imageUrl: z
    .string()
    .trim()
    .max(2048, "URL зображення занадто довгий"),
  inStock: z.boolean().default(true),
});

export type AdminProductValues = z.infer<typeof adminProductSchema>;
