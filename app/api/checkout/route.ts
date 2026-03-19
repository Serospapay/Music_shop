import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutPayloadSchema } from "@/lib/validators/checkout";
import { sendOrderConfirmation } from "@/lib/notifications";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/network";

export const runtime = "nodejs";

type CheckoutResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await consumeRateLimit({
      key: `checkout:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json<CheckoutResult>(
        { success: false, error: "Забагато спроб оформлення. Спробуйте пізніше." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as unknown;
    const parsedPayload = checkoutPayloadSchema.safeParse(body);

    if (!parsedPayload.success) {
      const errorMessage = parsedPayload.error.issues[0]?.message ?? "Некоректні дані замовлення.";
      return NextResponse.json<CheckoutResult>({ success: false, error: errorMessage }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const uniqueProductIds = Array.from(
        new Set(parsedPayload.data.items.map((item) => item.productId)),
      );
      const products = await tx.product.findMany({
        where: {
          id: { in: uniqueProductIds },
        },
        select: {
          id: true,
          name: true,
          price: true,
          inStock: true,
        },
      });

      if (products.length !== uniqueProductIds.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const productMap = new Map(products.map((product) => [product.id, product]));

      for (const line of parsedPayload.data.items) {
        const product = productMap.get(line.productId);
        if (!product?.inStock) {
          throw new Error("OUT_OF_STOCK");
        }
      }

      let totalAmount = 0;
      const orderItems = parsedPayload.data.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        const unitPrice = roundMoney(Number(product.price));
        totalAmount = roundMoney(totalAmount + unitPrice * item.quantity);

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: unitPrice,
          productName: product.name,
        };
      });

      const order = await tx.order.create({
        data: {
          customerName: parsedPayload.data.customerName,
          email: parsedPayload.data.email,
          phone: parsedPayload.data.phone,
          address: parsedPayload.data.address,
          totalAmount,
          status: "PENDING",
        },
        select: {
          id: true,
        },
      });

      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      return {
        orderId: order.id,
        totalAmount,
        items: orderItems.map((item) => ({
          productId: item.productId,
          name: item.productName,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };
    });

    const emailOutcome = await sendOrderConfirmation(parsedPayload.data.email, {
      orderId: result.orderId,
      customerName: parsedPayload.data.customerName,
      phone: parsedPayload.data.phone,
      address: parsedPayload.data.address,
      totalAmount: result.totalAmount,
      items: result.items,
    });

    if (!emailOutcome.sent) {
      console.error(
        JSON.stringify({
          channel: "checkout",
          event: "confirmation_email_not_sent",
          orderId: result.orderId,
          reason: emailOutcome.reason,
        }),
      );
    }

    return NextResponse.json<CheckoutResult>({ success: true, orderId: result.orderId }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json<CheckoutResult>(
        { success: false, error: "Деякі товари не знайдено. Оновіть кошик." },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return NextResponse.json<CheckoutResult>(
        {
          success: false,
          error: "Один або кілька товарів недоступні. Оновіть кошик і спробуйте ще раз.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json<CheckoutResult>(
      { success: false, error: "Не вдалося оформити замовлення. Спробуйте ще раз." },
      { status: 500 },
    );
  }
}
