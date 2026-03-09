const DEFAULT_APP_URL = "https://velamini.com";

function normalize(url?: string | null): string {
  if (!url) return DEFAULT_APP_URL;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getServerAppUrl(origin?: string): string {
  const envAppUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  return normalize(envAppUrl || origin || DEFAULT_APP_URL);
}

export const PUBLIC_APP_URL = normalize(process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL);
