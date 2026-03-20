import { asSpecText, unwrapPrismaJson } from "@/lib/json-fields";
import type { ProductSpecRow } from "@/lib/product-specs";

export type TechnicalSpecKV = {
  key: string;
  value: string;
};

export type CompatibilityEntry = {
  label: string;
  detail?: string;
};

/** Рядки з форми / legacy → формат Prisma `technicalSpecs` */
export function specsRowsToTechnical(rows: ProductSpecRow[]): { key: string; value: string }[] {
  return rows.map((r) => ({ key: r.label, value: r.value }));
}

/** Парсинг `technicalSpecs`: [{ "key": "...", "value": "..." }, ...] */
export function parseTechnicalSpecsJson(value: unknown): TechnicalSpecKV[] {
  const unwrapped = unwrapPrismaJson(value);
  if (!Array.isArray(unwrapped)) {
    return [];
  }
  const out: TechnicalSpecKV[] = [];
  for (const entry of unwrapped) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const rec = entry as Record<string, unknown>;
    const key =
      asSpecText(rec.key) ??
      asSpecText(rec.label) ??
      asSpecText(rec.name) ??
      asSpecText(rec.param) ??
      "";
    const val = asSpecText(rec.value) ?? asSpecText(rec.val) ?? "";
    if (!key || !val) {
      continue;
    }
    out.push({ key, value: val });
  }
  return out;
}

/** Парсинг `compatibility`: [{ "label": "...", "detail": "..." } | { "label", "value" }] */
export function parseCompatibilityJson(value: unknown): CompatibilityEntry[] {
  const unwrapped = unwrapPrismaJson(value);
  if (!Array.isArray(unwrapped)) {
    return [];
  }
  const out: CompatibilityEntry[] = [];
  for (const entry of unwrapped) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const rec = entry as Record<string, unknown>;
    const label = asSpecText(rec.label) ?? asSpecText(rec.name) ?? "";
    const detailRaw = asSpecText(rec.detail) ?? asSpecText(rec.value) ?? "";
    if (!label) {
      continue;
    }
    out.push({ label, detail: detailRaw });
  }
  return out;
}

/** Для вкладки характеристик: спочатку `technicalSpecs`, інакше legacy `specs` як key/value */
export function technicalSpecsForDisplay(
  technicalSpecsJson: unknown,
  legacySpecs: ProductSpecRow[],
): TechnicalSpecKV[] {
  const fromNew = parseTechnicalSpecsJson(technicalSpecsJson);
  if (fromNew.length > 0) {
    return fromNew;
  }
  return legacySpecs.map((r) => ({ key: r.label, value: r.value }));
}
