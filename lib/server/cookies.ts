import type { NextRequest, NextResponse } from "next/server";

function isSecureRequest(req: NextRequest): boolean {
  const url = req.url;
  if (url.startsWith("https://")) return true;

  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (!forwardedProto) return false;

  return forwardedProto.toLowerCase() === "https";
}

export function getSessionCookieOptions(
  req: NextRequest
): {
  httpOnly: boolean;
  path: string;
  sameSite: "none" | "lax" | "strict";
  secure: boolean;
  maxAge?: number;
} {
  const isSecure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // Em desenvolvimento (http), usar "lax" para permitir cookies
    // Em produção (https), usar "none" para funcionar em iframes/cross-origin
    sameSite: isSecure ? "none" : "lax",
    secure: isSecure,
  };
}

export function setCookie(
  res: NextResponse | { headers: Headers },
  name: string,
  value: string,
  options: ReturnType<typeof getSessionCookieOptions> & { maxAge?: number }
): NextResponse | { headers: Headers } {
  const cookieOptions = [
    `${name}=${value}`,
    `Path=${options.path}`,
    `HttpOnly`,
    `SameSite=${options.sameSite}`,
  ];

  if (options.secure) {
    cookieOptions.push(`Secure`);
  }

  if (options.maxAge !== undefined) {
    cookieOptions.push(`Max-Age=${options.maxAge}`);
  }

  // Se já existe Set-Cookie, adicionar ao array
  const existing = res.headers.get("Set-Cookie");
  if (existing) {
    res.headers.set("Set-Cookie", `${existing}, ${cookieOptions.join("; ")}`);
  } else {
    res.headers.set("Set-Cookie", cookieOptions.join("; "));
  }
  return res;
}

export function clearCookie(
  res: NextResponse | { headers: Headers },
  name: string,
  options: ReturnType<typeof getSessionCookieOptions>
): NextResponse | { headers: Headers } {
  return setCookie(res, name, "", { ...options, maxAge: -1 });
}

