import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../server/routers";

export function getTRPCClient() {
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/api/trpc`
          : "http://localhost:3000/api/trpc",
        fetch(input, init) {
          return fetch(input, {
            ...init,
            credentials: "include",
          });
        },
      }),
    ],
  });
}

