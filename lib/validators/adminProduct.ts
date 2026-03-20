import { z } from "zod";

const optionalSku = z
  .string()
  .trim()
  .max(48, "SKU занадто довгий")
  .refine((s) => s === "" || /^[A-Za-z0-9\-_]+$/.test(s), {
    message: "SKU: лише латиниця, цифри, дефіс та підкреслення",
  });

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
  price: z.coerce.number().positive("Ціна має бути більшою за 0").max(100000000, "Некоректна ціна"),
  category: z
    .string()
    .trim()
    .min(2, "Категорія має містити мінімум 2 символи")
    .max(120, "Категорія занадто довга"),
  brand: z.string().trim().max(80, "Бренд занадто довгий").optional(),
  sku: optionalSku.optional(),
  highlightsText: z.string().max(4000, "Акценти занадто довгі").optional(),
  specsText: z.string().max(8000, "Характеристики занадто довгі").optional(),
  warrantyMonths: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? 12 : v),
    z.coerce.number().int().min(0, "Гарантія не може бути від'ємною").max(120, "Некоректний термін"),
  ),
  imageUrl: z.string().trim().max(2048, "URL зображення занадто довгий"),
  imageUrlsText: z.string().max(8000, "Список URL занадто довгий").optional(),
  inStock: z.boolean().default(true),
});

export type AdminProductValues = z.infer<typeof adminProductSchema>;
