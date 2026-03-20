"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerUserAction, type AuthActionResult } from "@/actions/userAuth";

const initial: AuthActionResult = { success: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="ui-btn-primary-block hover:scale-[1.01] disabled:hover:scale-100"
    >
      {pending ? "Створюємо акаунт..." : "Зареєструватися"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerUserAction, initial);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.success === false ? (
        <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {state.message}
        </p>
      ) : null}

      <label className="block space-y-1.5">
        <span className="ui-label">Ім&apos;я</span>
        <input type="text" name="name" required autoComplete="name" className="ui-input" />
      </label>

      <label className="block space-y-1.5">
        <span className="ui-label">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="ui-input"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="ui-label">Пароль</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="ui-input"
        />
        <span className="text-xs text-zinc-500">Мінімум 8 символів</span>
      </label>

      <SubmitButton />

      <p className="text-center text-sm text-zinc-500">
        Вже є акаунт?{" "}
        <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200">
          Увійти
        </Link>
      </p>
    </form>
  );
}
