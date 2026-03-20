import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Реєстрація",
  description: "Створення акаунту покупця в Октава.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/account");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="ui-surface p-8 sm:p-10">
        <h1 className="font-display text-3xl font-normal text-white">Реєстрація</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Створіть акаунт, щоб відстежувати замовлення та залишати відгуки.
        </p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="text-brand-300 hover:text-brand-200">
            На головну
          </Link>
        </p>
      </div>
    </div>
  );
}
