import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";
import { appRouter } from "../../../../server/routers";
import { createContext } from "../../../../lib/server/context";
import { getSessionCookieOptions, setCookie, clearCookie } from "../../../../lib/server/cookies";

async function handler(req: NextRequest) {
  const responseHeaders = new Headers();
  
  const context = await createContext({
    req,
    setCookie: (name: string, value: string, options: any) => {
      const cookieOptions = getSessionCookieOptions(req);
      const tempRes: { headers: Headers } = { headers: new Headers() };
      setCookie(tempRes, name, value, { ...cookieOptions, ...options });
      const setCookieHeader = tempRes.headers.get("Set-Cookie");
      if (setCookieHeader) {
        const existing = responseHeaders.get("Set-Cookie");
        if (existing) {
          responseHeaders.set("Set-Cookie", `${existing}, ${setCookieHeader}`);
        } else {
          responseHeaders.set("Set-Cookie", setCookieHeader);
        }
      }
    },
    clearCookie: (name: string, options: any) => {
      const cookieOptions = getSessionCookieOptions(req);
      const tempRes: { headers: Headers } = { headers: new Headers() };
      clearCookie(tempRes, name, cookieOptions);
      const setCookieHeader = tempRes.headers.get("Set-Cookie");
      if (setCookieHeader) {
        const existing = responseHeaders.get("Set-Cookie");
        if (existing) {
          responseHeaders.set("Set-Cookie", `${existing}, ${setCookieHeader}`);
        } else {
          responseHeaders.set("Set-Cookie", setCookieHeader);
        }
      }
    },
  });

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: req as any,
    router: appRouter,
    createContext: () => context,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

  // Copiar headers de cookies para a resposta
  responseHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export { handler as GET, handler as POST };

