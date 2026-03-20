import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Перевірка з’єднання з MongoDB (Prisma). Не відключає глобальний клієнт.
 */
export async function GET() {
  try {
    const productCount = await prisma.product.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      productCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Невідома помилка підключення до БД";
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error: message,
      },
      { status: 503 },
    );
  }
}
