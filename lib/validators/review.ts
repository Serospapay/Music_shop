import { z } from "zod";

export const reviewSubmitSchema = z.object({
  productId: z.string().min(1, "Некоректний товар"),
  rating: z.number().int().min(1).max(5),
  text: z
    .string()
    .trim()
    .min(10, "Відгук мінімум 10 символів")
    .max(2000, "Відгук занадто довгий"),
});

export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;
