import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCurrentUser } from "@/lib/user-auth";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 space-y-2">
        <p className="ui-page-eyebrow">Оформлення</p>
        <h1 className="font-display text-3xl font-normal text-white sm:text-4xl">Замовлення</h1>
        <p className="text-sm text-zinc-400">
          Займає до 1 хвилини. Після підтвердження замовлення автоматично потрапляє адміну в чергу обробки.
        </p>
      </div>

      <CheckoutForm
        defaultProfile={
          user
            ? {
                customerName: user.name,
                email: user.email,
              }
            : null
        }
      />
    </div>
  );
}
