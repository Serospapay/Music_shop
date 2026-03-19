"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="ui-page-eyebrow">Помилка</p>
      <h1 className="mt-3 font-display text-3xl font-normal text-white sm:text-4xl">Щось пішло не так</h1>
      <p className="ui-body mt-3">
        Спробуйте ще раз або поверніться на головну. Якщо проблема повторюється, зверніться до підтримки.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="ui-btn-primary-compact"
        >
          Спробувати знову
        </button>
        <Link href="/" className="ui-btn-outline">
          На головну
        </Link>
      </div>
    </div>
  );
}
