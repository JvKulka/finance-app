import type { NextRequest } from "next/server";
import type { User } from "./db";
import { COOKIE_NAME } from "../../shared/const";
import * as db from "./db";
import { sdk } from "../../server/_core/sdk";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: NextRequest;
  user: User | null;
  // Headers para cookies (será usado no handler)
  setCookie: (name: string, value: string, options: any) => void;
  clearCookie: (name: string, options: any) => void;
};

// Helper para parsear cookies do NextRequest
function parseCookies(cookieHeader: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  const parsed = parseCookieHeader(cookieHeader);
  Object.entries(parsed).forEach(([name, value]) => {
    cookies.set(name, value);
  });

  return cookies;
}

export async function createContext(
  opts: { req: NextRequest; setCookie?: (name: string, value: string, options: any) => void; clearCookie?: (name: string, options: any) => void }
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Parsear cookies do NextRequest
    const cookieHeader = opts.req.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);
    const sessionCookie = cookies.get(COOKIE_NAME);

    if (sessionCookie) {
      // Verificar sessão JWT
      const session = await sdk.verifySession(sessionCookie);

      if (session) {
        const sessionUserId = session.openId;
        const signedInAt = new Date();
        const foundUser = await db.getUserByOpenId(sessionUserId);

        if (foundUser) {
          // Atualizar lastSignedIn
          await db.upsertUser({
            openId: foundUser.openId!,
            lastSignedIn: signedInAt,
          });
          user = foundUser;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    // Se falhar, user permanece null (rotas públicas ainda funcionam)
    user = null;
  }

  return {
    req: opts.req,
    user,
    setCookie: opts.setCookie || (() => {}),
    clearCookie: opts.clearCookie || (() => {}),
  };
}

