"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, createAdminSessionJwt } from "@/lib/admin-session";
import { shouldUseSecureCookie } from "@/lib/cookie-secure";
import { logAuditEvent } from "@/lib/audit-log";

export async function loginAdminAction(formData: FormData) {
  const nextPath = String(formData.get("next") ?? "/admin");

  const token = await createAdminSessionJwt();
  if (!token) {
    await logAuditEvent({
      action: "admin.login.token_failed",
      actor: "unknown",
      severity: "error",
    });
    redirect("/admin/login?error=config");
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  await logAuditEvent({
    action: "admin.login.success",
    actor: "admin",
  });

  redirect(nextPath.startsWith("/admin") ? nextPath : "/admin");
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  await logAuditEvent({
    action: "admin.logout.success",
    actor: "admin",
  });
  redirect("/admin/login");
}
