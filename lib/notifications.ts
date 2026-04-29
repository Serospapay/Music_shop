import { formatPriceUah } from "@/lib/format";
import {
  DELIVERY_METHOD_LABELS,
  type DeliveryMethod,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/checkout-options";

type NotificationOrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type NotificationOrderDetails = {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  deliveryFee: number;
  customerComment?: string;
  totalAmount: number;
  items: NotificationOrderItem[];
};

export type SendOrderEmailResult = { sent: true } | { sent: false; reason: string };

function buildEmailHtml(orderDetails: NotificationOrderDetails) {
  const rows = orderDetails.items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${formatPriceUah(item.unitPrice)}</td></tr>`,
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="uk">
  <body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
    <h1>Підтвердження замовлення</h1>
    <p>Вітаємо, ${escapeHtml(orderDetails.customerName)}!</p>
    <p>Номер замовлення: <strong>${escapeHtml(orderDetails.orderId)}</strong></p>
    <p>Телефон: ${escapeHtml(orderDetails.phone)}</p>
    <p>Адреса: ${escapeHtml(orderDetails.address)}</p>
    <p>Доставка: ${escapeHtml(DELIVERY_METHOD_LABELS[orderDetails.deliveryMethod])}</p>
    <p>Оплата: ${escapeHtml(PAYMENT_METHOD_LABELS[orderDetails.paymentMethod])}</p>
    ${
      orderDetails.customerComment?.trim()
        ? `<p>Коментар: ${escapeHtml(orderDetails.customerComment.trim())}</p>`
        : ""
    }
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin-top:1rem">
      <thead><tr><th>Товар</th><th>К-сть</th><th>Ціна</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:1rem">Доставка: ${formatPriceUah(orderDetails.deliveryFee)}</p>
    <p><strong>Разом: ${formatPriceUah(orderDetails.totalAmount)}</strong></p>
  </body>
  </html>`;
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendOrderConfirmation(
  email: string,
  orderDetails: NotificationOrderDetails,
): Promise<SendOrderEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.error(
      JSON.stringify({
        channel: "notifications",
        event: "order_email_skipped",
        reason: "RESEND_API_KEY_or_RESEND_FROM_EMAIL_missing",
        orderId: orderDetails.orderId,
        to: email,
      }),
    );
    return { sent: false, reason: "Поштовий сервіс не налаштовано (RESEND)." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `Замовлення ${orderDetails.orderId.slice(-8)} — Октава`,
        html: buildEmailHtml(orderDetails),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(
        JSON.stringify({
          channel: "notifications",
          event: "order_email_failed",
          status: response.status,
          body: errText.slice(0, 500),
          orderId: orderDetails.orderId,
        }),
      );
      return { sent: false, reason: "Провайдер пошти відхилив запит." };
    }

    return { sent: true };
  } catch (error) {
    console.error(
      JSON.stringify({
        channel: "notifications",
        event: "order_email_error",
        message: error instanceof Error ? error.message : "UNKNOWN",
        orderId: orderDetails.orderId,
      }),
    );
    return { sent: false, reason: "Мережева помилка під час відправки листа." };
  }
}

export async function sendAdminOrderNotification(
  orderDetails: NotificationOrderDetails,
): Promise<SendOrderEmailResult> {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!adminEmail) {
    return { sent: false, reason: "ADMIN_NOTIFY_EMAIL не налаштовано." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return { sent: false, reason: "Поштовий сервіс не налаштовано (RESEND)." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [adminEmail],
        subject: `Нове замовлення ${orderDetails.orderId.slice(-8)} — у черзі на обробку`,
        html: buildEmailHtml(orderDetails),
      }),
    });

    if (!response.ok) {
      return { sent: false, reason: "Провайдер пошти відхилив запит." };
    }
    return { sent: true };
  } catch {
    return { sent: false, reason: "Мережева помилка під час відправки листа адміну." };
  }
}
