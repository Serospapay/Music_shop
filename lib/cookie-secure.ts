/**
 * Чи ставити прапор Secure на httpOnly-cookies.
 * На http:// (зокрема localhost у Docker при NODE_ENV=production) Secure-cookies
 * браузер ігнорує — сесія не зберігається й вхід здається «зламаним».
 */
export function shouldUseSecureCookie(): boolean {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (site.startsWith("https://")) {
    return true;
  }
  if (site.startsWith("http://")) {
    return false;
  }
  return process.env.NODE_ENV === "production";
}
