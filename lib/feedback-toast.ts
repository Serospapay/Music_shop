import { toast } from "sonner";

type ToastPayload = {
  title: string;
  description?: string;
};

export function showSuccessToast({ title, description }: ToastPayload) {
  toast.success(title, {
    description,
    duration: 2600,
  });
}

export function showErrorToast({ title, description }: ToastPayload) {
  toast.error(title, {
    description,
    duration: 3200,
  });
}
