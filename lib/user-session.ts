import { SignJWT, jwtVerify } from "jose";

export const USER_COOKIE_NAME = "user_session";

const JWT_ISSUER = "octave-user";
const JWT_AUDIENCE = "octave-shop";

/** Якщо не задано USER_SESSION_SECRET / ADMIN_SESSION_SECRET / ADMIN_PASSWORD — демо fallback (не для публічного продакшену). */
const FALLBACK_USER_SIGNING_MATERIAL = "octave-local-insecure-user-jwt-v1";

function getUserSigningKeyBytes(): Uint8Array {
  const material =
    process.env.USER_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    FALLBACK_USER_SIGNING_MATERIAL;
  return new TextEncoder().encode(`octave-user-jwt-v1:${material}`);
}

export async function createUserSessionJwt(userId: string, email: string): Promise<string | null> {
  const key = getUserSigningKeyBytes();

  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function verifyUserSessionJwt(
  token: string | undefined,
): Promise<{ userId: string; email: string } | null> {
  if (!token) {
    return null;
  }

  const key = getUserSigningKeyBytes();

  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    });
    const userId = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!userId || !email) {
      return null;
    }
    return { userId, email };
  } catch {
    return null;
  }
}
