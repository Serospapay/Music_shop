import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ім'я мінімум 2 символи").max(80, "Ім'я занадто довге"),
  email: z.string().trim().email("Некоректний email").max(120),
  password: z.string().min(8, "Пароль мінімум 8 символів").max(128, "Пароль занадто довгий"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Некоректний email"),
  password: z.string().min(1, "Введіть пароль"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
