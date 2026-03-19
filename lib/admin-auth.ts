import { verifyAdminSessionJwt } from "@/lib/admin-session";

export async function isValidAdminSession(sessionToken?: string) {
  if (!sessionToken) {
    return false;
  }

  return verifyAdminSessionJwt(sessionToken);
}
