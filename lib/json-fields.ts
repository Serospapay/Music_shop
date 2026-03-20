/**
 * Prisma/Mongo інколи повертає Json як рядок або вкладені типи — нормалізуємо для парсерів PDP.
 */
export function unwrapPrismaJson(value: unknown): unknown {
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) {
      return value;
    }
    try {
      return JSON.parse(t) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

export function asSpecText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "Так" : "Ні";
  }
  return null;
}
