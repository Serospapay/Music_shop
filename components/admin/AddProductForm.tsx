"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createProductAction, updateProductAction } from "@/actions/adminProducts";
import { adminProductSchema, type AdminProductValues } from "@/lib/validators/adminProduct";

type AddProductFormProps = {
  mode?: "create" | "edit";
  productId?: string;
  initialValues?: AdminProductValues;
};

const emptyDefaults: AdminProductValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  category: "",
  brand: "",
  sku: "",
  highlightsText: "",
  specsText: "",
  warrantyMonths: 12,
  imageUrl: "",
  imageUrlsText: "",
  inStock: true,
};

export function AddProductForm({ mode = "create", productId, initialValues }: AddProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdminProductValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: initialValues ?? emptyDefaults,
    mode: "onBlur",
  });

  const uploadProductImage = async () => {
    if (!selectedFile) {
      return null;
    }

    const uploadForm = new FormData();
    uploadForm.append("file", selectedFile);

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      const json = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !json.url) {
        throw new Error(json.error ?? "Не вдалося завантажити файл.");
      }

      return json.url;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (values: AdminProductValues) => {
    setServerMessage(null);
    startTransition(async () => {
      try {
        let imageUrl = values.imageUrl;
        const uploadedPath = await uploadProductImage();
        if (uploadedPath) {
          imageUrl = uploadedPath;
        }

        const submitPayload = {
          ...values,
          imageUrl,
        };
        const result =
          mode === "edit" && productId
            ? await updateProductAction(productId, submitPayload)
            : await createProductAction(submitPayload);
        if (!result.success) {
          setServerMessage({ type: "error", text: result.message });
          toast.error(result.message);
          return;
        }

        setServerMessage({ type: "success", text: result.message });
        toast.success(result.message);
        setSelectedFile(null);
        if (mode === "edit") {
          router.push("/admin/products");
          router.refresh();
        } else {
          reset();
          router.refresh();
        }
      } catch (error) {
        const text =
          error instanceof Error
            ? error.message
            : mode === "edit"
              ? "Не вдалося оновити товар."
              : "Не вдалося додати товар.";
        setServerMessage({ type: "error", text });
        toast.error(text);
      }
    });
  };

  const isDisabled = isPending || isSubmitting || isUploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="ui-label">Назва</span>
          <input
            type="text"
            {...register("name")}
            disabled={isDisabled}
            className="ui-input"
          />
          {errors.name ? <p className="text-xs text-rose-400">{errors.name.message}</p> : null}
        </label>

        <label className="space-y-1.5">
          <span className="ui-label">Slug</span>
          <input
            type="text"
            {...register("slug")}
            disabled={isDisabled}
            className="ui-input"
          />
          {errors.slug ? <p className="text-xs text-rose-400">{errors.slug.message}</p> : null}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="ui-label">Бренд</span>
          <input
            type="text"
            {...register("brand")}
            disabled={isDisabled}
            className="ui-input"
            placeholder="Наприклад: Fender"
          />
          {errors.brand ? <p className="text-xs text-rose-400">{errors.brand.message}</p> : null}
        </label>

        <label className="space-y-1.5">
          <span className="ui-label">SKU (необов&apos;язково)</span>
          <input
            type="text"
            {...register("sku")}
            disabled={isDisabled}
            className="ui-input"
            placeholder="Наприклад: OCT-MY-001"
          />
          {errors.sku ? <p className="text-xs text-rose-400">{errors.sku.message}</p> : null}
          <p className="text-xs text-zinc-500">Якщо порожньо — згенерується з slug.</p>
        </label>
      </div>

      <label className="space-y-1.5">
        <span className="ui-label">Опис</span>
        <textarea
          rows={4}
          {...register("description")}
          disabled={isDisabled}
          className="ui-input min-h-[6rem] resize-y"
        />
        {errors.description ? <p className="text-xs text-rose-400">{errors.description.message}</p> : null}
      </label>

      <label className="space-y-1.5">
        <span className="ui-label">Акценти (по одному рядку)</span>
        <textarea
          rows={4}
          {...register("highlightsText")}
          disabled={isDisabled}
          className="ui-input min-h-[5rem] resize-y font-mono text-sm"
          placeholder={"Короткий пункт 1\nКороткий пункт 2"}
        />
        {errors.highlightsText ? <p className="text-xs text-rose-400">{errors.highlightsText.message}</p> : null}
      </label>

      <label className="space-y-1.5">
        <span className="ui-label">Характеристики (рядок: «Назва: Значення»)</span>
        <textarea
          rows={6}
          {...register("specsText")}
          disabled={isDisabled}
          className="ui-input min-h-[7rem] resize-y font-mono text-sm"
          placeholder={'Тип: Електрогітара\nКорпус: Ольха\nМензур: 25.5"'}
        />
        {errors.specsText ? <p className="text-xs text-rose-400">{errors.specsText.message}</p> : null}
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="space-y-1.5">
          <span className="ui-label">Ціна</span>
          <input
            type="number"
            step="1"
            min="1"
            {...register("price", { valueAsNumber: true })}
            disabled={isDisabled}
            className="ui-input"
          />
          {errors.price ? <p className="text-xs text-rose-400">{errors.price.message}</p> : null}
        </label>

        <label className="space-y-1.5">
          <span className="ui-label">Категорія</span>
          <input
            type="text"
            {...register("category")}
            disabled={isDisabled}
            className="ui-input"
          />
          {errors.category ? <p className="text-xs text-rose-400">{errors.category.message}</p> : null}
        </label>

        <label className="space-y-1.5">
          <span className="ui-label">Гарантія (міс.)</span>
          <input
            type="number"
            step="1"
            min="0"
            max="120"
            {...register("warrantyMonths", { valueAsNumber: true })}
            disabled={isDisabled}
            className="ui-input"
          />
          {errors.warrantyMonths ? <p className="text-xs text-rose-400">{errors.warrantyMonths.message}</p> : null}
        </label>
      </div>

      <label className="flex items-end space-x-2 rounded-xl border border-brand-500/20 bg-surface-900 px-3 py-2.5">
        <input
          type="checkbox"
          {...register("inStock")}
          disabled={isDisabled}
          className="h-4 w-4 accent-brand-500"
        />
        <span className="text-sm text-zinc-300">В наявності</span>
      </label>

      <label className="space-y-1.5">
        <span className="ui-label">URL основного зображення</span>
        <input
          type="url"
          {...register("imageUrl")}
          disabled={isDisabled}
          className="ui-input"
        />
        {errors.imageUrl ? <p className="text-xs text-rose-400">{errors.imageUrl.message}</p> : null}
      </label>

      <label className="space-y-1.5">
        <span className="ui-label">Додаткові зображення (URL, по одному в рядку)</span>
        <textarea
          rows={4}
          {...register("imageUrlsText")}
          disabled={isDisabled}
          className="ui-input min-h-[5rem] resize-y font-mono text-sm"
          placeholder={"https://…\n/uploads/…"}
        />
        {errors.imageUrlsText ? <p className="text-xs text-rose-400">{errors.imageUrlsText.message}</p> : null}
      </label>

      <label className="space-y-1.5">
        <span className="ui-label">Або завантажити файл для основного фото</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          disabled={isDisabled}
          className="ui-input-file"
        />
        {selectedFile ? (
          <p className="text-xs text-zinc-400">Файл для завантаження: {selectedFile.name}</p>
        ) : null}
      </label>

      {serverMessage ? (
        <p className={`text-sm font-medium ${serverMessage.type === "error" ? "text-rose-400" : "text-emerald-400"}`}>
          {serverMessage.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isDisabled}
        className="ui-btn-primary-block hover:scale-[1.01] disabled:hover:scale-100"
      >
        {isDisabled ? "Збереження..." : mode === "edit" ? "Зберегти зміни" : "Додати товар"}
      </button>
    </form>
  );
}
