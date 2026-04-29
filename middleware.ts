import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionJwt } from "@/lib/admin-session";
import { USER_COOKIE_NAME, verifyUserSessionJwt } from "@/lib/user-session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/account")) {
    const sessionToken = request.cookies.get(USER_COOKIE_NAME)?.value ?? "";
    const session = await verifyUserSessionJwt(sessionToken);
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value ?? "";
  const isValid = await verifyAdminSessionJwt(sessionToken);

  if (!isValid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
