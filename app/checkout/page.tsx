import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 space-y-2">
        <p className="ui-page-eyebrow">Оформлення</p>
        <h1 className="font-display text-3xl font-normal text-white sm:text-4xl">Замовлення</h1>
      </div>

      <CheckoutForm />
    </div>
  );
}
