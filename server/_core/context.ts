import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../lib/server/db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    // Se falhar, user permanece null (rotas públicas ainda funcionam)
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
