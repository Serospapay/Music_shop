import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const validateBodySchema = z.object({
  items: z.array(itemSchema).min(1),
});

function requireInternalAuth(authorization: string | undefined, token: string | undefined): boolean {
  if (!token?.trim()) {
    return false;
  }
  const expected = `Bearer ${token.trim()}`;
  return authorization === expected;
}

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok", service: "catalog-service" }));

/**
 * Внутрішній виклик від order-service: перевірка товарів і цін для замовлення
 */
app.post("/internal/validate-checkout-items", async (request, reply) => {
  const token = process.env.SERVICE_INTERNAL_TOKEN;
  if (!requireInternalAuth(request.headers.authorization, token)) {
    return reply.status(401).send({ ok: false, error: "Unauthorized" });
  }

  const parsed = validateBodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ ok: false, error: "Некоректне тіло запиту" });
  }

  const uniqueIds = Array.from(new Set(parsed.data.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, name: true, price: true, inStock: true },
  });

  if (products.length !== uniqueIds.length) {
    return reply.status(400).send({ ok: false, error: "PRODUCT_NOT_FOUND" });
  }

  const map = new Map(products.map((p) => [p.id, p]));
  for (const line of parsed.data.items) {
    const p = map.get(line.productId);
    if (!p?.inStock) {
      return reply.status(400).send({ ok: false, error: "OUT_OF_STOCK" });
    }
  }

  const lines = parsed.data.items.map((item) => {
    const p = map.get(item.productId)!;
    return {
      productId: item.productId,
      quantity: item.quantity,
      productName: p.name,
      unitPrice: Math.round(Number(p.price) * 100) / 100,
    };
  });

  return reply.send({ ok: true, lines });
});

const port = Number(process.env.PORT ?? 4001);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => {
    console.log(`catalog-service listening on ${host}:${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
