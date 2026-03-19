/**
 * Формат ціни в гривнях без Intl currency — однаковий вивід у Node (SSR) і в браузері,
 * щоб уникнути hydration mismatch (наприклад «₴» на сервері та «грн» у клієнті).
 */
export function formatPriceUah(value: number | string | bigint | { toString(): string }) {
  const n = typeof value === "number" ? value : Number(value);
  const rounded = Number.isFinite(n) ? Math.round(n) : 0;
  return formatUahInteger(rounded);
}

function formatUahInteger(amount: number): string {
  const sign = amount < 0 ? "−" : "";
  const abs = Math.abs(amount);
  if (!Number.isFinite(abs)) {
    return `${sign}0\u00a0₴`;
  }

  const groups: string[] = [];
  let n = Math.floor(abs);
  while (n >= 1000) {
    groups.unshift(String(n % 1000).padStart(3, "0"));
    n = Math.floor(n / 1000);
  }
  groups.unshift(String(n));

  return `${sign}${groups.join("\u00a0")}\u00a0₴`;
}
