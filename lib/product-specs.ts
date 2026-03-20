import { asSpecText, unwrapPrismaJson } from "@/lib/json-fields";

export type ProductSpecRow = {
  label: string;
  value: string;
};

export function normalizeSpecsJson(value: unknown): ProductSpecRow[] {
  const unwrapped = unwrapPrismaJson(value);
  if (!Array.isArray(unwrapped)) {
    return [];
  }

  const rows: ProductSpecRow[] = [];
  for (const entry of unwrapped) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const rec = entry as Record<string, unknown>;
    const labelRaw =
      asSpecText(rec.label) ?? asSpecText(rec.key) ?? asSpecText(rec.name) ?? asSpecText(rec.param);
    const valRaw = asSpecText(rec.value) ?? asSpecText(rec.val);
    if (!labelRaw || !valRaw) {
      continue;
    }
    rows.push({ label: labelRaw, value: valRaw });
  }
  return rows;
}

/** Рядки форми «Назва: Значення» (двокрапка лише перша) */
export function parseSpecsLines(text: string): ProductSpecRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: ProductSpecRow[] = [];
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx <= 0) {
      continue;
    }
    const label = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!label || !value) {
      continue;
    }
    rows.push({ label, value });
  }
  return rows;
}

export function highlightsFromText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12);
}
