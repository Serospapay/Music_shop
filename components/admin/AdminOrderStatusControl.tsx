"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/actions/adminOrders";

type AdminOrderStatusControlProps = {
  orderId: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
};

const options: Array<{
  value: AdminOrderStatusControlProps["status"];
  label: string;
}> = [
  { value: "PENDING", label: "Нове" },
  { value: "PAID", label: "Обробляється" },
  { value: "SHIPPED", label: "Відправлено" },
  { value: "DELIVERED", label: "Виконано" },
  { value: "CANCELLED", label: "Скасовано" },
];

export function AdminOrderStatusControl({ orderId, status }: AdminOrderStatusControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<AdminOrderStatusControlProps["status"]>(status);

  const onSave = () => {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, value);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Статус замовлення оновлено.");
      router.refresh();
    });
  };

  return (
    <div className="flex min-w-[180px] items-center gap-2">
      <select
        aria-label="Статус замовлення"
        value={value}
        onChange={(event) => setValue(event.target.value as AdminOrderStatusControlProps["status"])}
        disabled={isPending}
        className="ui-input h-9 min-w-[120px] py-1.5 text-xs"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onSave}
        disabled={isPending || value === status}
        className="ui-btn-outline-compact h-9 px-2.5 text-xs disabled:opacity-60"
      >
        Зберегти
      </button>
    </div>
  );
}
