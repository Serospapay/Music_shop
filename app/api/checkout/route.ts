import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { MongoClient, ObjectId } from "mongodb";
import { prisma } from "@/lib/prisma";
import { checkoutPayloadSchema } from "@/lib/validators/checkout";
import { sendAdminOrderNotification, sendOrderConfirmation } from "@/lib/notifications";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/network";
import { USER_COOKIE_NAME, verifyUserSessionJwt } from "@/lib/user-session";
import { getDeliveryFee, type DeliveryMethod, type PaymentMethod } from "@/lib/checkout-options";
import { logAuditEvent } from "@/lib/audit-log";

export const runtime = "nodejs";

type CheckoutResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

function isMongoReplicaSetError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2031";
}

function databaseNameFromUrl(url: string) {
  try {
    const normalized = url.replace(/^mongodb(\+srv)?:\/\//, "http://");
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/^\//, "").split("?")[0];
    if (path) {
      return path;
    }
  } catch {
    /* ignore */
  }
  return process.env.MONGO_DB_NAME?.trim() || "octave_shop";
}

type OrderServiceSuccess = {
  success: true;
  orderId: string;
  totalAmount: number;
  deliveryFee: number;
  items: { productId: string; name: string | null; quantity: number; unitPrice: number }[];
};

async function createOrderViaMicroservice(
  payload: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    customerComment: string;
    items: { productId: string; quantity: number }[];
    userId?: string;
  },
): Promise<OrderServiceSuccess | { success: false; error: string; status?: number }> {
  const baseUrl = process.env.ORDER_SERVICE_URL?.replace(/\/$/, "");
  const token = process.env.SERVICE_INTERNAL_TOKEN?.trim();
  if (!baseUrl || !token) {
    return { success: false, error: "Order service not configured" };
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerName: payload.customerName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        deliveryMethod: payload.deliveryMethod,
        paymentMethod: payload.paymentMethod,
        customerComment: payload.customerComment,
        items: payload.items,
        ...(payload.userId ? { userId: payload.userId } : {}),
      }),
    });
  } catch {
    return {
      success: false,
      error: "Сервіс замовлень недоступний. Перевірте, що order-service запущений і ORDER_SERVICE_URL вказує на нього.",
      status: 503,
    };
  }

  let data: OrderServiceSuccess & { success?: boolean; error?: string };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return {
      success: false,
      error: "Сервіс замовлень повернув некоректну відповідь.",
      status: 502,
    };
  }

  if (!res.ok || !data.success || !data.orderId) {
    return {
      success: false,
      error: data.error ?? "Не вдалося оформити замовлення.",
      status: res.status,
    };
  }

  return data;
}

async function createOrderViaMonolith(
  parsedPayload: ReturnType<typeof checkoutPayloadSchema.parse>,
  orderUserId: string | undefined,
): Promise<OrderServiceSuccess> {
  const uniqueProductIds = Array.from(new Set(parsedPayload.items.map((item) => item.productId)));
  const products = await prisma.product.findMany({
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

  for (const line of parsedPayload.items) {
    const product = productMap.get(line.productId);
    if (!product?.inStock) {
      throw new Error("OUT_OF_STOCK");
    }
  }

  let itemsSubtotal = 0;
  const orderItems = parsedPayload.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const unitPrice = roundMoney(Number(product.price));
    itemsSubtotal = roundMoney(itemsSubtotal + unitPrice * item.quantity);

    return {
      productId: item.productId,
      quantity: item.quantity,
      price: unitPrice,
      productName: product.name,
    };
  });
  const deliveryFee = roundMoney(getDeliveryFee(parsedPayload.deliveryMethod));
  const totalAmount = roundMoney(itemsSubtotal + deliveryFee);

  try {
    const order = await prisma.order.create({
      data: {
        customerName: parsedPayload.customerName,
        email: parsedPayload.email,
        phone: parsedPayload.phone,
        address: parsedPayload.address,
        deliveryMethod: parsedPayload.deliveryMethod,
        paymentMethod: parsedPayload.paymentMethod,
        customerComment: parsedPayload.customerComment || null,
        deliveryFee,
        adminQueuedAt: new Date(),
        totalAmount,
        status: "PENDING",
        userId: orderUserId,
      },
      select: {
        id: true,
      },
    });

    await prisma.orderItem.createMany({
      data: orderItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    return {
      success: true,
      orderId: order.id,
      totalAmount,
      deliveryFee,
      items: orderItems.map((item) => ({
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    };
  } catch (error) {
    if (!isMongoReplicaSetError(error)) {
      throw error;
    }

    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL_MISSING");
    }
    const client = new MongoClient(url);
    await client.connect();
    try {
      const db = client.db(databaseNameFromUrl(url));
      const orderCollection = db.collection("Order");
      const orderItemCollection = db.collection("OrderItem");
      const now = new Date();

      const insertedOrder = await orderCollection.insertOne({
        customerName: parsedPayload.customerName,
        email: parsedPayload.email,
        phone: parsedPayload.phone,
        address: parsedPayload.address,
        deliveryMethod: parsedPayload.deliveryMethod,
        paymentMethod: parsedPayload.paymentMethod,
        customerComment: parsedPayload.customerComment || null,
        deliveryFee,
        adminQueuedAt: now,
        totalAmount,
        status: "PENDING",
        createdAt: now,
        ...(orderUserId ? { userId: new ObjectId(orderUserId) } : {}),
      });

      if (orderItems.length > 0) {
        await orderItemCollection.insertMany(
          orderItems.map((item) => ({
            orderId: insertedOrder.insertedId,
            productId: new ObjectId(item.productId),
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
        );
      }

      return {
        success: true,
        orderId: insertedOrder.insertedId.toHexString(),
        totalAmount,
        deliveryFee,
        items: orderItems.map((item) => ({
          productId: item.productId,
          name: item.productName,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };
    } finally {
      await client.close();
    }
  }
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

    const userToken = request.cookies.get(USER_COOKIE_NAME)?.value;
    const userSession = await verifyUserSessionJwt(userToken);
    let orderUserId: string | undefined;
    if (userSession) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userSession.userId },
        select: { id: true, email: true },
      });
      if (dbUser && dbUser.email.toLowerCase() === parsedPayload.data.email.trim().toLowerCase()) {
        orderUserId = dbUser.id;
      }
    }

    const useMicroservices =
      Boolean(process.env.ORDER_SERVICE_URL?.trim()) && Boolean(process.env.SERVICE_INTERNAL_TOKEN?.trim());

    let result: OrderServiceSuccess;
    if (useMicroservices) {
      const remote = await createOrderViaMicroservice({
        customerName: parsedPayload.data.customerName,
        email: parsedPayload.data.email,
        phone: parsedPayload.data.phone,
        address: parsedPayload.data.address,
        deliveryMethod: parsedPayload.data.deliveryMethod,
        paymentMethod: parsedPayload.data.paymentMethod,
        customerComment: parsedPayload.data.customerComment,
        items: parsedPayload.data.items,
        userId: orderUserId,
      });
      if (!remote.success) {
        const st = remote.status ?? 500;
        const shouldFallbackToMonolith = st >= 500;
        if (shouldFallbackToMonolith) {
          try {
            result = await createOrderViaMonolith(parsedPayload.data, orderUserId);
          } catch (fallbackError) {
            if (fallbackError instanceof Error && fallbackError.message === "PRODUCT_NOT_FOUND") {
              return NextResponse.json<CheckoutResult>(
                { success: false, error: "Деякі товари не знайдено. Оновіть кошик." },
                { status: 400 },
              );
            }
            if (fallbackError instanceof Error && fallbackError.message === "OUT_OF_STOCK") {
              return NextResponse.json<CheckoutResult>(
                {
                  success: false,
                  error: "Один або кілька товарів недоступні. Оновіть кошик і спробуйте ще раз.",
                },
                { status: 400 },
              );
            }
            throw fallbackError;
          }
        } else {
          const status =
            st === 400 ? 400 : st === 503 ? 503 : st === 502 ? 502 : st && st >= 400 ? st : 500;
          return NextResponse.json<CheckoutResult>(
            { success: false, error: remote.error },
            { status },
          );
        }
      } else {
        result = remote;
      }
    } else {
      try {
        result = await createOrderViaMonolith(parsedPayload.data, orderUserId);
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
        throw error;
      }
    }

    const emailOutcome = await sendOrderConfirmation(parsedPayload.data.email, {
      orderId: result.orderId,
      customerName: parsedPayload.data.customerName,
      phone: parsedPayload.data.phone,
      address: parsedPayload.data.address,
      deliveryMethod: parsedPayload.data.deliveryMethod,
      paymentMethod: parsedPayload.data.paymentMethod,
      customerComment: parsedPayload.data.customerComment,
      deliveryFee: result.deliveryFee,
      totalAmount: result.totalAmount,
      items: result.items.map((item) => ({
        productId: item.productId,
        name: item.name ?? "Товар",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
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

    const adminEmailOutcome = await sendAdminOrderNotification({
      orderId: result.orderId,
      customerName: parsedPayload.data.customerName,
      phone: parsedPayload.data.phone,
      address: parsedPayload.data.address,
      deliveryMethod: parsedPayload.data.deliveryMethod,
      paymentMethod: parsedPayload.data.paymentMethod,
      customerComment: parsedPayload.data.customerComment,
      deliveryFee: result.deliveryFee,
      totalAmount: result.totalAmount,
      items: result.items.map((item) => ({
        productId: item.productId,
        name: item.name ?? "Товар",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
    if (!adminEmailOutcome.sent) {
      console.error(
        JSON.stringify({
          channel: "checkout",
          event: "admin_order_email_not_sent",
          orderId: result.orderId,
          reason: adminEmailOutcome.reason,
        }),
      );
    }

    await logAuditEvent({
      action: "checkout.order.queued_for_admin",
      actor: orderUserId ?? parsedPayload.data.email.toLowerCase(),
      details: {
        orderId: result.orderId,
        deliveryMethod: parsedPayload.data.deliveryMethod,
        paymentMethod: parsedPayload.data.paymentMethod,
        status: "PENDING",
      },
    });

    return NextResponse.json<CheckoutResult>({ success: true, orderId: result.orderId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json<CheckoutResult>(
      { success: false, error: "Не вдалося оформити замовлення. Спробуйте ще раз." },
      { status: 500 },
    );
  }
}
