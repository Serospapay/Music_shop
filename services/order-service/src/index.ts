import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const deliveryMethodValues = [
  "NOVA_POSHTA_WAREHOUSE",
  "NOVA_POSHTA_COURIER",
  "UKRPOSHTA",
  "STORE_PICKUP",
] as const;

const paymentMethodValues = ["CASH_ON_DELIVERY", "ONLINE_CARD", "BANK_TRANSFER"] as const;

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(8).max(24),
  address: z.string().trim().min(8).max(300),
  deliveryMethod: z.enum(deliveryMethodValues),
  paymentMethod: z.enum(paymentMethodValues),
  customerComment: z.string().trim().max(500).default(""),
  items: z.array(checkoutItemSchema).min(1),
  userId: z.string().optional(),
});

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

function getDeliveryFee(method: (typeof deliveryMethodValues)[number]): number {
  switch (method) {
    case "NOVA_POSHTA_COURIER":
      return 180;
    case "UKRPOSHTA":
      return 90;
    case "STORE_PICKUP":
      return 0;
    case "NOVA_POSHTA_WAREHOUSE":
    default:
      return 120;
  }
}

function requireInternalAuth(authorization: string | undefined, token: string | undefined): boolean {
  if (!token?.trim()) {
    return false;
  }
  return authorization === `Bearer ${token.trim()}`;
}

async function validateLinesViaCatalog(
  items: { productId: string; quantity: number }[],
): Promise<
  | {
      ok: true;
      lines: { productId: string; quantity: number; productName: string; unitPrice: number }[];
    }
  | { ok: false; error: string }
> {
  const catalogUrl = process.env.CATALOG_SERVICE_URL?.replace(/\/$/, "");
  const token = process.env.SERVICE_INTERNAL_TOKEN;
  if (!catalogUrl || !token) {
    return { ok: false, error: "CATALOG_SERVICE_URL or SERVICE_INTERNAL_TOKEN not set" };
  }

  let res: Response;
  try {
    res = await fetch(`${catalogUrl}/internal/validate-checkout-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });
  } catch {
    return { ok: false, error: "CATALOG_UNREACHABLE" };
  }

  let data: {
    ok?: boolean;
    lines?: { productId: string; quantity: number; productName: string; unitPrice: number }[];
    error?: string;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, error: "CATALOG_UNREACHABLE" };
  }

  if (!res.ok || !data.ok || !data.lines) {
    const code = data.error ?? "VALIDATION_FAILED";
    return { ok: false, error: code };
  }

  return { ok: true, lines: data.lines };
}

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok", service: "order-service" }));

app.post("/orders", async (request, reply) => {
  const token = process.env.SERVICE_INTERNAL_TOKEN;
  if (!requireInternalAuth(request.headers.authorization, token)) {
    return reply.status(401).send({ success: false, error: "Unauthorized" });
  }

  const parsed = createOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({
      success: false,
      error: parsed.error.issues[0]?.message ?? "Некоректні дані",
    });
  }

  const validation = await validateLinesViaCatalog(parsed.data.items);
  if (!validation.ok) {
    if (validation.error === "PRODUCT_NOT_FOUND") {
      return reply.status(400).send({
        success: false,
        error: "Деякі товари не знайдено. Оновіть кошик.",
      });
    }
    if (validation.error === "OUT_OF_STOCK") {
      return reply.status(400).send({
        success: false,
        error: "Один або кілька товарів недоступні. Оновіть кошик і спробуйте ще раз.",
      });
    }
    if (validation.error === "CATALOG_UNREACHABLE") {
      return reply.status(503).send({
        success: false,
        error: "Каталог тимчасово недоступний. Спробуйте пізніше.",
      });
    }
    if (
      validation.error === "CATALOG_SERVICE_URL or SERVICE_INTERNAL_TOKEN not set" ||
      validation.error === "VALIDATION_FAILED"
    ) {
      return reply.status(500).send({
        success: false,
        error: "Не вдалося перевірити товари в каталозі.",
      });
    }
    return reply.status(500).send({
      success: false,
      error: "Не вдалося перевірити товари в каталозі.",
    });
  }

  let itemsSubtotal = 0;
  const orderItems = validation.lines.map((line) => {
    const lineTotal = roundMoney(line.unitPrice * line.quantity);
    itemsSubtotal = roundMoney(itemsSubtotal + lineTotal);
    return {
      productId: line.productId,
      quantity: line.quantity,
      price: line.unitPrice,
      productName: line.productName,
    };
  });
  const deliveryFee = roundMoney(getDeliveryFee(parsed.data.deliveryMethod));
  const totalAmount = roundMoney(itemsSubtotal + deliveryFee);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName: parsed.data.customerName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          address: parsed.data.address,
          deliveryMethod: parsed.data.deliveryMethod,
          paymentMethod: parsed.data.paymentMethod,
          customerComment: parsed.data.customerComment || null,
          deliveryFee,
          adminQueuedAt: new Date(),
          totalAmount,
          status: "PENDING",
          userId: parsed.data.userId,
        },
        select: { id: true },
      });

      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: created.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      return created;
    });

    return reply.status(201).send({
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
    });
  } catch (e) {
    request.log.error(e);
    return reply.status(500).send({ success: false, error: "Не вдалося створити замовлення." });
  }
});

const port = Number(process.env.PORT ?? 4002);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => {
    console.log(`order-service listening on ${host}:${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
