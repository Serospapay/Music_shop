"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { loginUserAction, type AuthActionResult } from "@/actions/userAuth";

const initial: AuthActionResult = { success: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="ui-btn-primary-block hover:scale-[1.01] disabled:hover:scale-100"
    >
      {pending ? "Вхід..." : "Увійти"}
    </button>
  );
}

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useFormState(loginUserAction, initial);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={nextPath} />
      {state.success === false ? (
        <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {state.message}
        </p>
      ) : null}

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
          autoComplete="current-password"
          className="ui-input"
        />
      </label>

      <SubmitButton />

      <p className="text-center text-sm text-zinc-500">
        Немає акаунту?{" "}
        <Link href="/register" className="font-medium text-brand-300 hover:text-brand-200">
          Зареєструватися
        </Link>
      </p>
    </form>
  );
}
