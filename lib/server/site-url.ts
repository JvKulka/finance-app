import type { NextRequest } from "next/server";

/**
 * Origem pública do site (para redirectTo do Supabase Auth).
 * Preferir NEXT_PUBLIC_APP_URL em produção (ex.: https://app.exemplo.com).
 */
export function getSiteOrigin(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host?.includes("localhost") || host?.startsWith("127.") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}
