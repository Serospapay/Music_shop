export const RECENTLY_VIEWED_COOKIE_NAME = "oct_recently_viewed";
export const MAX_RECENTLY_VIEWED_PRODUCTS = 12;

export function parseRecentlyViewedCookie(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  const seen = new Set<string>();
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0 && id.length <= 64)
    .filter((id) => {
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  return ids.slice(0, MAX_RECENTLY_VIEWED_PRODUCTS);
}

export function buildRecentlyViewedCookieValue(productId: string, raw: string | undefined): string {
  const previous = parseRecentlyViewedCookie(raw).filter((id) => id !== productId);
  return [productId, ...previous].slice(0, MAX_RECENTLY_VIEWED_PRODUCTS).join(",");
}
