import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("transactions router", () => {
  it("should create a new transaction", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create an account
    await caller.accounts.create({
      name: "Test Account",
      type: "personal",
    });

    const accounts = await caller.accounts.list();
    const accountId = accounts[0].id;

    // Create a category
    await caller.categories.create({
      accountId,
      name: "Test Category",
      type: "expense",
      color: "#FF0000",
    });

    const categories = await caller.categories.list({ accountId });
    const categoryId = categories[0].id;

    // Create a transaction
    const result = await caller.transactions.create({
      accountId,
      categoryId,
      description: "Test Transaction",
      amount: 10000, // R$ 100.00
      type: "expense",
      transactionDate: "2025-01-01",
      status: "paid",
    });

    expect(result).toEqual({ success: true });
  });

  it("should list transactions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const accounts = await caller.accounts.list();
    const accountId = accounts[0].id;

    const transactions = await caller.transactions.list({ accountId });

    expect(transactions).toBeDefined();
    expect(Array.isArray(transactions)).toBe(true);
  });

  it("should get dashboard summary", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const accounts = await caller.accounts.list();
    const accountId = accounts[0].id;

    const summary = await caller.dashboard.summary({
      accountId,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });

    expect(summary).toBeDefined();
    expect(summary).toHaveProperty("income");
    expect(summary).toHaveProperty("expense");
    expect(summary).toHaveProperty("balance");
  });
});
