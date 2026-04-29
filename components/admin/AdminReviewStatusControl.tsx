"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateReviewStatusAction } from "@/actions/adminReviewActions";

type AdminReviewStatusControlProps = {
  reviewId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const options: Array<{ value: AdminReviewStatusControlProps["status"]; label: string }> = [
  { value: "PENDING", label: "Очікує" },
  { value: "APPROVED", label: "Схвалено" },
  { value: "REJECTED", label: "Відхилено" },
];

export function AdminReviewStatusControl({ reviewId, status }: AdminReviewStatusControlProps) {
  const router = useRouter();
  const [value, setValue] = useState<AdminReviewStatusControlProps["status"]>(status);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      const result = await updateReviewStatusAction(reviewId, value);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Статус відгуку оновлено.");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Статус відгуку"
        value={value}
        onChange={(event) => setValue(event.target.value as AdminReviewStatusControlProps["status"])}
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
