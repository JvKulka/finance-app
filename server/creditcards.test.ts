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

describe("creditCards", () => {
  it("should create a credit card successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create an account
    await caller.accounts.create({
      name: "Test Account",
      type: "personal",
      currency: "BRL",
      initialBalance: 0,
    });

    const accounts = await caller.accounts.list();
    const accountId = accounts[0]!.id;

    // Create a credit card
    const result = await caller.creditCards.create({
      accountId,
      name: "Cartão Principal",
      lastFourDigits: "1234",
      brand: "Visa",
      color: "#3B82F6",
      creditLimit: 500000,
      closingDay: 10,
      dueDay: 20,
    });

    expect(result).toEqual({ success: true });

    // Verify the card was created by finding it in the list
    const cards = await caller.creditCards.list({ accountId });
    const createdCard = cards.find(c => c.name === "Cartão Principal" && c.lastFourDigits === "1234");
    expect(createdCard).toBeDefined();
    expect(createdCard?.name).toBe("Cartão Principal");
    expect(createdCard?.lastFourDigits).toBe("1234");
  });

  it("should update a credit card successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account and card
    await caller.accounts.create({
      name: "Test Account",
      type: "personal",
      currency: "BRL",
      initialBalance: 0,
    });

    const accounts = await caller.accounts.list();
    const accountId = accounts[0]!.id;

    await caller.creditCards.create({
      accountId,
      name: "Cartão Original",
      lastFourDigits: "5678",
      brand: "Mastercard",
      color: "#EF4444",
      creditLimit: 300000,
      closingDay: 5,
      dueDay: 15,
    });

    const cards = await caller.creditCards.list({ accountId });
    const cardId = cards[0]!.id;

    // Update the card
    const result = await caller.creditCards.update({
      id: cardId,
      name: "Cartão Atualizado",
      creditLimit: 600000,
    });

    expect(result).toEqual({ success: true });

    // Verify the update
    const updatedCards = await caller.creditCards.list({ accountId });
    expect(updatedCards[0]?.name).toBe("Cartão Atualizado");
    expect(updatedCards[0]?.creditLimit).toBe(600000);
  });

  it("should delete a credit card successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account and card
    await caller.accounts.create({
      name: "Test Account",
      type: "personal",
      currency: "BRL",
      initialBalance: 0,
    });

    const accounts = await caller.accounts.list();
    const accountId = accounts[0]!.id;

    await caller.creditCards.create({
      accountId,
      name: "Cartão para Deletar",
      lastFourDigits: "9999",
      brand: "Visa",
      color: "#10B981",
      creditLimit: 200000,
      closingDay: 1,
      dueDay: 10,
    });

    const cards = await caller.creditCards.list({ accountId });
    const cardId = cards[0]!.id;

    // Delete the card
    const result = await caller.creditCards.delete({ id: cardId });
    expect(result).toEqual({ success: true });

    // Verify deletion - check that the specific card was deleted
    const remainingCards = await caller.creditCards.list({ accountId });
    const deletedCard = remainingCards.find(c => c.id === cardId);
    expect(deletedCard).toBeUndefined();
  });
});

describe("scheduledPayments", () => {
  it("should create a scheduled payment successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account and category
    await caller.accounts.create({
      name: "Test Account",
      type: "personal",
      currency: "BRL",
      initialBalance: 0,
    });

    const accounts = await caller.accounts.list();
    const accountId = accounts[0]!.id;

    await caller.categories.create({
      accountId,
      name: "Aluguel",
      type: "expense",
      color: "#EF4444",
      icon: "Home",
    });

    const categories = await caller.categories.list({ accountId });
    const categoryId = categories[0]!.id;

    // Create a scheduled payment
    const result = await caller.scheduledPayments.create({
      accountId,
      categoryId,
      description: "Aluguel Mensal",
      amount: 150000,
      dueDate: "2025-12-10",
      recurrence: "monthly",
      isPriority: true,
    });

    expect(result).toEqual({ success: true });

    // Verify the payment was created by checking the result
    const payments = await caller.scheduledPayments.list({ accountId });
    const createdPayment = payments.find(p => p.description === "Aluguel Mensal");
    expect(createdPayment).toBeDefined();
    expect(createdPayment?.isPriority).toBe(true);
  });

  it("should mark a scheduled payment as paid", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create account, category, and payment
    await caller.accounts.create({
      name: "Test Account",
      type: "personal",
      currency: "BRL",
      initialBalance: 0,
    });

    const accounts = await caller.accounts.list();
    const accountId = accounts[0]!.id;

    await caller.categories.create({
      accountId,
      name: "Conta de Luz",
      type: "expense",
      color: "#F59E0B",
      icon: "Zap",
    });

    const categories = await caller.categories.list({ accountId });
    const categoryId = categories[0]!.id;

    await caller.scheduledPayments.create({
      accountId,
      categoryId,
      description: "Conta de Luz Dezembro",
      amount: 25000,
      dueDate: "2025-12-15",
      recurrence: "none",
      isPriority: false,
    });

    const payments = await caller.scheduledPayments.list({ accountId });
    const paymentId = payments[0]!.id;

    // Mark as paid
    const result = await caller.scheduledPayments.markAsPaid({ id: paymentId });
    expect(result).toEqual({ success: true });

    // Verify the operation completed successfully
    expect(result.success).toBe(true);
  });
});
