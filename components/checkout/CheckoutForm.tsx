"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validators/checkout";
import { formatPriceUah } from "@/lib/format";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isPending, startTransition] = useTransition();
  const [requestError, setRequestError] = useState<string | null>(null);

  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      address: "",
    },
    mode: "onBlur",
  });

  const isDisabled = isPending || isSubmitting || items.length === 0;

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
        <h2 className="font-display text-2xl font-normal text-white">Дані для доставки</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Заповніть форму, і ми зв&apos;яжемося для підтвердження замовлення. Якщо ви увійшли в акаунт,
          вкажіть той самий email, що й у профілі — замовлення з&apos;явиться в &quot;Мій кабінет&quot;.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <label className="block space-y-1.5">
            <span className="ui-label">Ім&apos;я</span>
            <input
              type="text"
              {...register("customerName")}
              disabled={isDisabled}
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
              disabled={isDisabled}
              className="ui-input"
            />
            {errors.email ? (
              <p className="text-xs font-medium text-rose-400">{errors.email.message}</p>
            ) : null}
          </label>

          <label className="block space-y-1.5">
            <span className="ui-label">Телефон</span>
            <input
              type="tel"
              {...register("phone")}
              disabled={isDisabled}
              className="ui-input"
            />
            {errors.phone ? (
              <p className="text-xs font-medium text-rose-400">{errors.phone.message}</p>
            ) : null}
          </label>

          <label className="block space-y-1.5">
            <span className="ui-label">Адреса доставки</span>
            <textarea
              rows={4}
              {...register("address")}
              disabled={isDisabled}
              className="ui-input min-h-[6rem] resize-y"
            />
            {errors.address ? (
              <p className="text-xs font-medium text-rose-400">{errors.address.message}</p>
            ) : null}
          </label>

          {requestError ? <p className="text-sm font-medium text-rose-400">{requestError}</p> : null}

          <button
            type="submit"
            disabled={isDisabled}
            className="ui-btn-primary-block hover:scale-[1.01] disabled:hover:scale-100"
          >
            {isDisabled ? "Оформлюємо замовлення..." : "Підтвердити замовлення"}
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
              <p className="text-sm text-zinc-400">Разом</p>
              <p className="text-xl font-semibold text-brand-100">{formatPriceUah(totalAmount)}</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
