"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, MapPin, PackageCheck, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validators/checkout";
import {
  DELIVERY_METHOD_LABELS,
  DELIVERY_METHOD_VALUES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_VALUES,
  getDeliveryFee,
} from "@/lib/checkout-options";
import { formatPriceUah } from "@/lib/format";

type CheckoutFormProps = {
  defaultProfile?: {
    customerName: string;
    email: string;
  } | null;
};

export function CheckoutForm({ defaultProfile = null }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isPending, startTransition] = useTransition();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const itemsSubtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: defaultProfile?.customerName ?? "",
      email: defaultProfile?.email ?? "",
      phone: "",
      address: "",
      deliveryMethod: "NOVA_POSHTA_WAREHOUSE",
      paymentMethod: "CASH_ON_DELIVERY",
      customerComment: "",
    },
    mode: "onBlur",
  });

  const selectedDeliveryMethod = watch("deliveryMethod");
  const selectedPaymentMethod = watch("paymentMethod");
  const resolvedDeliveryMethod = selectedDeliveryMethod ?? "NOVA_POSHTA_WAREHOUSE";
  const resolvedPaymentMethod = selectedPaymentMethod ?? "CASH_ON_DELIVERY";

  const deliveryFee = useMemo(() => getDeliveryFee(resolvedDeliveryMethod), [resolvedDeliveryMethod]);
  const totalAmount = useMemo(() => itemsSubtotal + deliveryFee, [itemsSubtotal, deliveryFee]);

  const isDisabled = isPending || isSubmitting || items.length === 0 || !isConfirmed;

  const onSubmit = (values: CheckoutFormValues) => {
    setRequestError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            customerComment: values.customerComment ?? "",
            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          }),
        });
        const result = (await response.json()) as {
          success: boolean;
          orderId?: string;
          error?: string;
        };

        if (!response.ok || !result.success) {
          const message = result.error ?? "Не вдалося оформити замовлення.";
          setRequestError(message);
          toast.error(message);
          return;
        }

        if (!result.orderId) {
          const message = "Замовлення створено, але не отримано номер. Зверніться до підтримки.";
          setRequestError(message);
          toast.error(message);
          return;
        }

        clearCart();
        toast.success("Замовлення успішно оформлено.");
        router.push(`/checkout/success?orderId=${encodeURIComponent(result.orderId)}`);
      } catch {
        const message = "Сталася неочікувана помилка під час оформлення замовлення.";
        setRequestError(message);
        toast.error(message);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,360px]">
      <section className="ui-surface p-6 sm:p-8">
        <h2 className="font-display text-2xl font-normal text-white">Оформлення замовлення</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Заповніть коротку форму. Після підтвердження замовлення одразу створюється в статусі
          &quot;Нове&quot; і потрапляє адміну на обробку.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
          <div className="rounded-2xl border border-brand-500/15 bg-surface-900/40 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <UserRound className="h-4 w-4 text-brand-300" />
              1. Контакти отримувача
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="ui-label">Ім&apos;я</span>
                <input
                  type="text"
                  {...register("customerName")}
                  disabled={isPending || isSubmitting || items.length === 0}
                  className="ui-input"
                />
                {errors.customerName ? (
                  <p className="text-xs font-medium text-rose-400">{errors.customerName.message}</p>
                ) : null}
              </label>

              <label className="block space-y-1.5">
                <span className="ui-label">Email</span>
                <input
                  type="email"
                  {...register("email")}
                  disabled={isPending || isSubmitting || items.length === 0}
                  className="ui-input"
                />
                {errors.email ? (
                  <p className="text-xs font-medium text-rose-400">{errors.email.message}</p>
                ) : null}
              </label>
            </div>

            <label className="mt-4 block space-y-1.5">
              <span className="ui-label">Телефон</span>
              <input
                type="tel"
                {...register("phone")}
                disabled={isPending || isSubmitting || items.length === 0}
                className="ui-input"
                placeholder="+380..."
              />
              {errors.phone ? <p className="text-xs font-medium text-rose-400">{errors.phone.message}</p> : null}
            </label>
          </div>

          <div className="rounded-2xl border border-brand-500/15 bg-surface-900/40 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <MapPin className="h-4 w-4 text-brand-300" />
              2. Доставка
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DELIVERY_METHOD_VALUES.map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-500/15 bg-surface-900/50 p-3 transition hover:border-brand-400/35"
                >
                  <input
                    type="radio"
                    value={method}
                    {...register("deliveryMethod")}
                    disabled={isPending || isSubmitting || items.length === 0}
                    className="mt-1 h-4 w-4 accent-brand-400"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-zinc-100">{DELIVERY_METHOD_LABELS[method]}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      Тариф: {formatPriceUah(getDeliveryFee(method))}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {errors.deliveryMethod ? (
              <p className="mt-2 text-xs font-medium text-rose-400">{errors.deliveryMethod.message}</p>
            ) : null}

            <label className="mt-4 block space-y-1.5">
              <span className="ui-label">Адреса доставки / відділення</span>
              <textarea
                rows={4}
                {...register("address")}
                disabled={isPending || isSubmitting || items.length === 0}
                className="ui-input min-h-[6rem] resize-y"
                placeholder="Місто, вулиця/будинок або номер відділення"
              />
              {errors.address ? <p className="text-xs font-medium text-rose-400">{errors.address.message}</p> : null}
            </label>
          </div>

          <div className="rounded-2xl border border-brand-500/15 bg-surface-900/40 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <CreditCard className="h-4 w-4 text-brand-300" />
              3. Оплата та коментар
            </p>
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_METHOD_VALUES.map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-500/15 bg-surface-900/50 p-3 transition hover:border-brand-400/35"
                >
                  <input
                    type="radio"
                    value={method}
                    {...register("paymentMethod")}
                    disabled={isPending || isSubmitting || items.length === 0}
                    className="mt-1 h-4 w-4 accent-brand-400"
                  />
                  <span className="text-sm font-medium text-zinc-100">{PAYMENT_METHOD_LABELS[method]}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod ? (
              <p className="mt-2 text-xs font-medium text-rose-400">{errors.paymentMethod.message}</p>
            ) : null}

            <label className="mt-4 block space-y-1.5">
              <span className="ui-label">Коментар до замовлення (опційно)</span>
              <textarea
                rows={3}
                {...register("customerComment")}
                disabled={isPending || isSubmitting || items.length === 0}
                className="ui-input min-h-[5rem] resize-y"
                placeholder="Наприклад: зручний час дзвінка або уточнення по доставці"
              />
              {errors.customerComment ? (
                <p className="text-xs font-medium text-rose-400">{errors.customerComment.message}</p>
              ) : null}
            </label>
          </div>

          {requestError ? <p className="text-sm font-medium text-rose-400">{requestError}</p> : null}

          <label className="flex items-start gap-3 rounded-xl border border-brand-500/15 bg-surface-900/40 p-3">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(event) => setIsConfirmed(event.target.checked)}
              disabled={isPending || isSubmitting || items.length === 0}
              className="mt-0.5 h-4 w-4 accent-brand-400"
            />
            <span className="text-sm text-zinc-300">
              Підтверджую коректність даних і погоджуюсь на обробку замовлення адміністратором магазину.
            </span>
          </label>

          <button
            type="submit"
            disabled={isDisabled}
            className="ui-btn-primary-block hover:scale-[1.01] disabled:hover:scale-100"
          >
            {isPending || isSubmitting ? "Оформлюємо замовлення..." : "Підтвердити замовлення"}
          </button>
        </form>
      </section>

      <aside className="ui-surface h-fit p-5 lg:sticky lg:top-24">
        <h3 className="text-lg font-semibold text-white">Ваше замовлення</h3>

        {items.length === 0 ? (
          <div className="ui-surface-inset mt-4 p-4">
            <p className="text-sm text-zinc-400">Кошик порожній.</p>
            <Link
              href="/catalog"
              className="mt-3 inline-flex text-sm font-medium text-brand-200 transition-colors hover:text-brand-100"
            >
              Перейти до каталогу
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="ui-surface-inset p-3 text-sm text-zinc-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-2 font-medium">{item.name}</p>
                  <p className="shrink-0 text-zinc-400">x{item.quantity}</p>
                </div>
                <p className="mt-2 text-zinc-400">{formatPriceUah(item.price * item.quantity)}</p>
              </div>
            ))}

            <div className="mt-4 flex items-center justify-between border-t border-brand-500/10 pt-4">
              <p className="text-sm text-zinc-400">Товари</p>
              <p className="text-sm font-semibold text-zinc-200">{formatPriceUah(itemsSubtotal)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Доставка</p>
              <p className="text-sm font-semibold text-zinc-200">{formatPriceUah(deliveryFee)}</p>
            </div>
            <div className="flex items-center justify-between border-t border-brand-500/10 pt-4">
              <p className="text-sm text-zinc-300">До сплати</p>
              <p className="text-xl font-semibold text-brand-100">{formatPriceUah(totalAmount)}</p>
            </div>

            <div className="rounded-xl border border-brand-500/15 bg-surface-900/45 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-200">
                <PackageCheck className="h-3.5 w-3.5" />
                Обране оформлення
              </p>
              <p className="mt-2 text-xs text-zinc-400">{DELIVERY_METHOD_LABELS[resolvedDeliveryMethod]}</p>
              <p className="mt-1 text-xs text-zinc-400">{PAYMENT_METHOD_LABELS[resolvedPaymentMethod]}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">
              <p className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                Після підтвердження заявка одразу передається адміну в обробку
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
