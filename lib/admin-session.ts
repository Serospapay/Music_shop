import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "admin_session";

const JWT_ISSUER = "octave-admin";
const JWT_AUDIENCE = "octave-admin-panel";

/** Якщо не задано ADMIN_SESSION_SECRET / ADMIN_PASSWORD — підпис локальним ключем (демо; не для публічного продакшену). */
const FALLBACK_ADMIN_SIGNING_MATERIAL = "octave-local-insecure-admin-jwt-v1";

function getSigningKeyBytes(): Uint8Array {
  const material =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    FALLBACK_ADMIN_SIGNING_MATERIAL;
  return new TextEncoder().encode(`octave-admin-jwt-v1:${material}`);
}

export async function createAdminSessionJwt(): Promise<string | null> {
  const key = getSigningKeyBytes();

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key);
}

export async function verifyAdminSessionJwt(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const key = getSigningKeyBytes();

  try {
    await jwtVerify(token, key, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}
