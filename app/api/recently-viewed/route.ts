import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldUseSecureCookie } from "@/lib/cookie-secure";
import {
  buildRecentlyViewedCookieValue,
  RECENTLY_VIEWED_COOKIE_NAME,
} from "@/lib/recently-viewed";

type TrackPayload = {
  productId?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackPayload;
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    if (!productId) {
      return NextResponse.json({ success: false, error: "Некоректний ідентифікатор товару." }, { status: 400 });
    }

    const exists = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ success: false, error: "Товар не знайдено." }, { status: 404 });
    }

    const current = request.cookies.get(RECENTLY_VIEWED_COOKIE_NAME)?.value;
    const next = buildRecentlyViewedCookieValue(productId, current);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: RECENTLY_VIEWED_COOKIE_NAME,
      value: next,
      httpOnly: true,
      sameSite: "lax",
      secure: shouldUseSecureCookie(),
      path: "/",
      maxAge: 60 * 60 * 24 * 45,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Не вдалося оновити історію переглядів." }, { status: 500 });
  }
}
