import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { USER_COOKIE_NAME, verifyUserSessionJwt } from "@/lib/user-session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;
  const session = await verifyUserSessionJwt(token);
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });

  return user;
}
