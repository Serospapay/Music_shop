import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Вхід",
  description: "Вхід до акаунту покупця Октава.",
};

type LoginPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const nextParam = searchParams.next;
  const nextRaw = Array.isArray(nextParam) ? nextParam[0] : nextParam;
  const safeNext =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/account";

  if (user) {
    redirect(safeNext);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="ui-surface p-8 sm:p-10">
        <h1 className="font-display text-3xl font-normal text-white">Вхід</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Увійдіть, щоб бачити історію покупок і залишати відгуки.
        </p>
        <LoginForm nextPath={safeNext} />
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="text-brand-300 hover:text-brand-200">
            На головну
          </Link>
        </p>
      </div>
    </div>
  );
}
