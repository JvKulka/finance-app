"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "@/lib/trpc/client";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider } from "@/contexts/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          fetch(input, init) {
            return fetch(input, {
              ...(init ?? {}),
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  // Configurar redirecionamento para login em caso de erro não autorizado
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      const error = event.query.state.error;
      if (error instanceof TRPCClientError && error.message === UNAUTHED_ERR_MSG) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
  });

  queryClient.getMutationCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      const error = event.mutation.state.error;
      if (error instanceof TRPCClientError && error.message === UNAUTHED_ERR_MSG) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
          <ThemeProvider defaultTheme="light" switchable={true}>
            {children}
          </ThemeProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

