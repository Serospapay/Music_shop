"use client";

import { useRef } from "react";
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

type QuickLoginButtonProps = {
  onQuickLogin: () => void;
};

function QuickLoginButton({ onQuickLogin }: QuickLoginButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onQuickLogin}
      className="ui-btn-outline-compact w-full py-2.5 text-sm disabled:opacity-60"
    >
      {pending ? "Виконуємо вхід..." : "Швидкий вхід демо-користувачем"}
    </button>
  );
}

type LoginFormProps = {
  nextPath: string;
  quickLoginCredentials?: {
    email: string;
    password: string;
  };
};

export function LoginForm({ nextPath, quickLoginCredentials }: LoginFormProps) {
  const [state, formAction] = useFormState(loginUserAction, initial);
  const formRef = useRef<HTMLFormElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const onQuickLogin = () => {
    if (!quickLoginCredentials || !formRef.current || !emailRef.current || !passwordRef.current) {
      return;
    }
    emailRef.current.value = quickLoginCredentials.email;
    passwordRef.current.value = quickLoginCredentials.password;
    formRef.current.requestSubmit();
  };

  return (
    <form ref={formRef} action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={nextPath} />
      {state.success === false ? (
        <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {state.message}
        </p>
      ) : null}

      <label className="block space-y-1.5">
        <span className="ui-label">Email</span>
        <input
          ref={emailRef}
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
          ref={passwordRef}
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="ui-input"
        />
      </label>

      <SubmitButton />
      {quickLoginCredentials ? <QuickLoginButton onQuickLogin={onQuickLogin} /> : null}

      <p className="text-center text-sm text-zinc-500">
        Немає акаунту?{" "}
        <Link href="/register" className="font-medium text-brand-300 hover:text-brand-200">
          Зареєструватися
        </Link>
      </p>
    </form>
  );
}
