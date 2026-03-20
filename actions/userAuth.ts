"use server";

import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { USER_COOKIE_NAME, createUserSessionJwt } from "@/lib/user-session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function setUserCookieAsync(token: string) {
  const store = await cookies();
  store.set({
    name: USER_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export type AuthActionResult = { success: true } | { success: false; message: string };

export async function registerUserAction(_prev: AuthActionResult | undefined, formData: FormData): Promise<AuthActionResult> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Некоректні дані" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  let userId: string;
  try {
    const created = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
      },
      select: { id: true },
    });
    userId = created.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, message: "Користувач з таким email уже зареєстрований." };
    }
    return { success: false, message: "Не вдалося створити акаунт. Спробуйте пізніше." };
  }

  const token = await createUserSessionJwt(userId, parsed.data.email.toLowerCase());
  if (!token) {
    return { success: false, message: "Помилка конфігурації сесії (USER_SESSION_SECRET)." };
  }

  await setUserCookieAsync(token);
  redirect("/account");
}

export async function loginUserAction(_prev: AuthActionResult | undefined, formData: FormData): Promise<AuthActionResult> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const nextRaw = String(formData.get("next") ?? "/account");
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/account";

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Некоректні дані" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    return { success: false, message: "Невірний email або пароль." };
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { success: false, message: "Невірний email або пароль." };
  }

  const token = await createUserSessionJwt(user.id, user.email);
  if (!token) {
    return { success: false, message: "Помилка конфігурації сесії." };
  }

  await setUserCookieAsync(token);
  redirect(next.startsWith("/") ? next : "/account");
}

export async function logoutUserAction() {
  const store = await cookies();
  store.delete(USER_COOKIE_NAME);
  redirect("/");
}
