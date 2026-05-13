import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { hashPassword, verifyPassword } from "./_core/auth";
import { getSessionCookieOptions } from "../lib/server/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "../lib/server/trpc";
import * as db from "../lib/server/db";
import { getSiteOrigin } from "../lib/server/site-url";
import { supabaseServer } from "../lib/supabase/server";

export const appRouter = router({
  system: systemRouter,
  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // Por enquanto, retornar todos os usuários
      // Em produção, você pode querer filtrar por conta ou adicionar controle de acesso
      const users = await db.getAllUsers();
      return users.map(({ password, ...user }) => user);
    }),
    invite: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
          email: z.string().email("Correo electrónico inválido"),
          whatsapp: z.string().min(10, "El teléfono WhatsApp debe tener al menos 10 dígitos"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "El correo electrónico ya está en uso",
          });
        }
        // Gerar openId único
        const openId = nanoid(32);
        // Criar usuário sem senha (será definida no primeiro login)
        const newUser = await db.upsertUser({
          openId,
          name: input.name,
          email: input.email,
          whatsapp: input.whatsapp,
          loginMethod: "email",
          role: "user",
        });
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        if (input.id === ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No podés eliminarte a vos mismo",
          });
        }
        await db.deleteUser(input.id);
        return { success: true };
      }),
  }),
  auth: router({
    me: publicProcedure.query((opts) => {
      const u = opts.ctx.user;
      if (!u) return null;
      const hasLocalPassword = Boolean(u.password);
      const { password: _pw, ...safe } = u;
      return { ...safe, hasLocalPassword };
    }),
    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().optional(),
          newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.openId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        const dbUser = await db.getUserByOpenId(ctx.user.openId);
        if (!dbUser) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado" });
        }
        if (dbUser.password) {
          if (!input.currentPassword?.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "La contraseña actual es obligatoria",
            });
          }
          const ok = await verifyPassword(input.currentPassword, dbUser.password);
          if (!ok) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "La contraseña actual no es correcta",
            });
          }
          if (input.currentPassword === input.newPassword) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "La nueva contraseña debe ser distinta de la actual",
            });
          }
        }
        const passwordHash = await hashPassword(input.newPassword);
        await db.upsertUser({
          openId: dbUser.openId!,
          password: passwordHash,
        });
        return { success: true as const };
      }),
    /** Envia e-mail de recuperação (Supabase Auth). Sincroniza auth.users se ainda não existir. */
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email("Correo electrónico inválido") }))
      .mutation(async ({ ctx, input }) => {
        const email = input.email.trim();
        const appUser = await db.getUserByEmail(email);
        if (!appUser?.email || !appUser.password) {
          return { ok: true as const };
        }
        const origin = getSiteOrigin(ctx.req);
        const redirectTo = `${origin}/auth/recuperar-senha`;
        const bootstrapPassword = `${nanoid(28)}Aa1!`;
        const { error: createErr } = await supabaseServer.auth.admin.createUser({
          email: appUser.email,
          password: bootstrapPassword,
          email_confirm: true,
        });
        if (createErr) {
          const msg = createErr.message?.toLowerCase() ?? "";
          const benign =
            msg.includes("already been registered") ||
            msg.includes("already registered") ||
            msg.includes("duplicate") ||
            msg.includes("user already");
          if (!benign) {
            console.warn("[requestPasswordReset] createUser:", createErr.message);
          }
        }
        const { error: resetErr } = await supabaseServer.auth.resetPasswordForEmail(appUser.email, {
          redirectTo,
        });
        if (resetErr) {
          console.error("[requestPasswordReset] resetPasswordForEmail:", resetErr.message);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No se pudo enviar el correo de recuperación. Verificá la configuración de Auth y el correo en Supabase.",
          });
        }
        return { ok: true as const };
      }),
    /** Depois do link do e-mail: grava a nova senha na tabela users (login do app) e no Auth. */
    completePasswordRecovery: publicProcedure
      .input(
        z.object({
          accessToken: z.string().min(1),
          newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        })
      )
      .mutation(async ({ input }) => {
        const { data: userData, error } = await supabaseServer.auth.getUser(input.accessToken);
        if (error || !userData.user?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Enlace inválido o sesión expirada",
          });
        }
        const dbUser = await db.getUserByEmail(userData.user.email);
        if (!dbUser?.openId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No hay una cuenta de la aplicación asociada a este correo",
          });
        }
        const passwordHash = await hashPassword(input.newPassword);
        await db.upsertUser({
          openId: dbUser.openId,
          password: passwordHash,
        });
        const { error: upErr } = await supabaseServer.auth.admin.updateUserById(userData.user.id, {
          password: input.newPassword,
        });
        if (upErr) {
          console.error("[completePasswordRecovery] updateUserById:", upErr.message);
        }
        return { ok: true as const };
      }),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        await db.upsertUser({
          openId: ctx.user.openId!,
          name: input.name,
        });
        const updatedUser = await db.getUserByOpenId(ctx.user.openId!);
        if (!updatedUser) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return updatedUser;
      }),
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // Deletar todas as contas do usuário primeiro
      const accounts = await db.getAccountsByUserId(ctx.user.id);
      for (const account of accounts) {
        await db.deleteAccount(account.id);
      }
      // Deletar o usuário
      await db.deleteUser(ctx.user.id);
      // Limpar cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.clearCookie(COOKIE_NAME, cookieOptions);
      return { success: true };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.clearCookie(COOKIE_NAME, cookieOptions);
      return {
        success: true,
      } as const;
    }),
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
          email: z.string().email("Correo electrónico inválido"),
          password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          console.log("[Register] Iniciando registro para:", input.email);
          
          const existingUser = await db.getUserByEmail(input.email);
          if (existingUser) {
            console.log("[Register] Email já existe:", input.email);
            throw new TRPCError({
              code: "CONFLICT",
              message: "El correo electrónico ya está en uso",
            });
          }

          // Hash da senha
          console.log("[Register] Gerando hash da senha...");
          const passwordHash = await hashPassword(input.password);

          // Gerar openId único
          const openId = nanoid(32);
          console.log("[Register] OpenId gerado:", openId);

          // Criar usuário
          console.log("[Register] Criando usuário no banco...");
          await db.upsertUser({
            openId,
            name: input.name,
            email: input.email,
            password: passwordHash,
            loginMethod: "email",
            role: "user",
          });
          console.log("[Register] Usuário criado no banco");

          // Buscar usuário criado
          const user = await db.getUserByEmail(input.email);
          if (!user) {
            console.error("[Register] Erro: usuário não encontrado após criação");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al crear el usuario",
            });
          }
          console.log("[Register] Usuário encontrado:", user.id);

          const { error: authSyncErr } = await supabaseServer.auth.admin.createUser({
            email: input.email,
            password: input.password,
            email_confirm: true,
          });
          if (authSyncErr) {
            const m = authSyncErr.message?.toLowerCase() ?? "";
            if (!m.includes("already") && !m.includes("registered") && !m.includes("duplicate")) {
              console.warn("[Register] Supabase Auth sync:", authSyncErr.message);
            }
          }

          // Criar sessão JWT
          console.log("[Register] Criando sessão JWT...");
          const sessionToken = await sdk.createSessionToken(openId, {
            name: input.name,
            expiresInMs: ONE_YEAR_MS,
          });
          console.log("[Register] Sessão JWT criada");

          // Definir cookie de sessão
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.setCookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: Math.floor(ONE_YEAR_MS / 1000), // Converter para segundos
          });
          console.log("[Register] Cookie de sessão definido");

          // Retornar usuário (sem senha)
          const { password: _, ...userWithoutPassword } = user;
          console.log("[Register] Registro concluído com sucesso");
          return userWithoutPassword;
        } catch (error: any) {
          console.error("[Register] Erro durante registro:", error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Error al crear la cuenta",
          });
        }
      }),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Correo electrónico inválido"),
          password: z.string().min(1, "La contraseña es obligatoria"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciales inválidas",
          });
        }

        if (!user.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciales inválidas",
          });
        }

        const isValidPassword = await verifyPassword(input.password, user.password);
        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciales inválidas",
          });
        }

        // Atualizar lastSignedIn
        await db.upsertUser({
          openId: user.openId!,
          lastSignedIn: new Date(),
        });

        // Criar sessão JWT
        const sessionToken = await sdk.createSessionToken(user.openId!, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        // Definir cookie de sessão
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.setCookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: Math.floor(ONE_YEAR_MS / 1000), // Converter para segundos
        });

        // Retornar usuário (sem senha)
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
  }),

  // ============= ACCOUNTS =============
  accounts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAccountsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          type: z.enum(["personal", "business"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createAccount({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          type: z.enum(["personal", "business"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.id);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateAccount(input.id, {
          name: input.name,
          type: input.type,
        });
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const account = await db.getAccountById(input.id);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.deleteAccount(input.id);
      return { success: true };
    }),
  }),

  // ============= CATEGORIES =============
  categories: router({
    list: protectedProcedure.input(z.object({ accountId: z.number() })).query(async ({ ctx, input }) => {
      const account = await db.getAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getCategoriesByAccountId(input.accountId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          name: z.string().min(1).max(255),
          type: z.enum(["income", "expense"]),
          icon: z.string().max(100).optional(),
          color: z.string().max(50).optional(),
          isDefault: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.createCategory(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          icon: z.string().max(100).optional(),
          color: z.string().max(50).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const category = await db.getCategoryById(input.id);
        if (!category) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const account = await db.getAccountById(category.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...updateData } = input;
        await db.updateCategory(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const category = await db.getCategoryById(input.id);
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const account = await db.getAccountById(category.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.deleteCategory(input.id);
      return { success: true };
    }),
  }),

  // ============= TRANSACTIONS =============
  transactions: router({
    list: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          categoryId: z.number().optional(),
          type: z.enum(["income", "expense"]).optional(),
          status: z.enum(["paid", "pending"]).optional(),
          paymentMethod: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { accountId, ...filters } = input;
        return await db.getTransactionsWithRelationsByAccountId(accountId, filters);
      }),

    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          categoryId: z.number(),
          creditCardId: z.number().optional(),
          description: z.string().min(1).max(500),
          amount: z.number().int().positive(),
          type: z.enum(["income", "expense"]),
          transactionDate: z.string(),
          paymentMethod: z.string().max(100).optional(),
          status: z.enum(["paid", "pending"]).default("paid"),
          expenseType: z.enum(["fixed", "variable"]).optional(),
          isRecurring: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { transactionDate, ...transactionData } = input;
        // Parse date string (yyyy-MM-dd) as local date to avoid timezone issues
        const [year, month, day] = transactionDate.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        const newTransaction = await db.createTransaction({
          ...transactionData,
          userId: ctx.user.id,
          transactionDate: localDate,
        });
        await db.createActivityLog({
          userId: ctx.user.id,
          action: "CREATE_TRANSACTION",
          details: `Creó transacción: ${input.description}`,
        });
        return { success: true, transactionId: newTransaction.id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          categoryId: z.number().optional(),
          creditCardId: z.number().optional(),
          description: z.string().min(1).max(500).optional(),
          amount: z.number().int().positive().optional(),
          transactionDate: z.string().optional(),
          paymentMethod: z.string().max(100).optional(),
          status: z.enum(["paid", "pending"]).optional(),
          expenseType: z.enum(["fixed", "variable"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input.id);
        if (!transaction) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const account = await db.getAccountById(transaction.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, transactionDate, ...updateData } = input;
        // Parse date string (yyyy-MM-dd) as local date to avoid timezone issues
        let localDate: Date | undefined;
        if (transactionDate) {
          const [year, month, day] = transactionDate.split('-').map(Number);
          localDate = new Date(year, month - 1, day);
        }
        await db.updateTransaction(id, {
          ...updateData,
          transactionDate: localDate,
        });
        await db.createActivityLog({
          userId: ctx.user.id,
          action: "UPDATE_TRANSACTION",
          details: `Actualizó transacción ID: ${id}`,
        });
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const transaction = await db.getTransactionById(input.id);
      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const account = await db.getAccountById(transaction.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.deleteTransaction(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        action: "DELETE_TRANSACTION",
        details: `Eliminó transacción ID: ${input.id}`,
      });
      return { success: true };
    }),

    uploadAttachment: protectedProcedure
      .input(
        z.object({
          transactionId: z.number(),
          fileName: z.string(),
          filePath: z.string(),
          fileSize: z.number(),
          mimeType: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input.transactionId);
        if (!transaction) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const account = await db.getAccountById(transaction.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const attachment = await db.createTransactionAttachment({
          transactionId: input.transactionId,
          fileName: input.fileName,
          filePath: input.filePath,
          fileSize: input.fileSize,
          mimeType: input.mimeType || null,
        });
        return attachment;
      }),

    deleteAttachment: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const attachment = await db.getTransactionAttachmentById(input.id);
        if (!attachment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Adjunto no encontrado" });
        }
        
        const transaction = await db.getTransactionById(attachment.transactionId);
        if (!transaction) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const account = await db.getAccountById(transaction.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // Delete file from storage
        const { error: storageError } = await supabaseServer.storage
          .from('transaction-attachments')
          .remove([attachment.filePath]);
        
        if (storageError) {
          console.error("Erro ao deletar arquivo do storage:", storageError);
          // Continue mesmo se houver erro no storage
        }
        
        await db.deleteTransactionAttachment(input.id);
        return { success: true };
      }),

    getAttachments: protectedProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input.transactionId);
        if (!transaction) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const account = await db.getAccountById(transaction.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.getTransactionAttachments(input.transactionId);
      }),
  }),

  // ============= DASHBOARD =============
  dashboard: router({
    summary: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.getDashboardSummary(input.accountId, input.startDate, input.endDate);
      }),

    expensesByCategory: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.getExpensesByCategory(input.accountId, input.startDate, input.endDate);
      }),
  }),

  // ============= CREDIT CARDS =============
  creditCards: router({ 
    list: protectedProcedure.input(z.object({ accountId: z.number() })).query(async ({ ctx, input }) => {
      const account = await db.getAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getCreditCardsByAccountId(input.accountId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          name: z.string().min(1).max(255),
          lastFourDigits: z.string().length(4),
          brand: z.string().min(1).max(50),
          color: z.string().min(1).max(50),
          creditLimit: z.number().int().positive(),
          closingDay: z.number().int().min(1).max(31),
          dueDay: z.number().int().min(1).max(31),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.createCreditCard(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          lastFourDigits: z.string().length(4).optional(),
          brand: z.string().min(1).max(50).optional(),
          color: z.string().min(1).max(50).optional(),
          creditLimit: z.number().int().positive().optional(),
          closingDay: z.number().int().min(1).max(31).optional(),
          dueDay: z.number().int().min(1).max(31).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        await db.updateCreditCard(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCreditCard(input.id);
      return { success: true };
    }),

    expenses: protectedProcedure
      .input(
        z.object({
          cardId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        return await db.getCreditCardExpenses(input.cardId, input.startDate, input.endDate);
      }),
  }),

  // ============= SCHEDULED PAYMENTS =============
  scheduledPayments: router({
    list: protectedProcedure.input(z.object({ accountId: z.number() })).query(async ({ ctx, input }) => {
      const account = await db.getAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getScheduledPaymentsByAccountId(input.accountId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          categoryId: z.number(),
          creditCardId: z.number().optional(),
          description: z.string().min(1).max(500),
          amount: z.number().int().positive(),
          dueDate: z.string(),
          isRecurring: z.boolean().optional(),
          recurrenceFrequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
          isPriority: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { dueDate, ...paymentData } = input;
        await db.createScheduledPayment({
          ...paymentData,
          dueDate: new Date(dueDate),
          isPaid: false,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          description: z.string().min(1).max(500).optional(),
          amount: z.number().int().positive().optional(),
          dueDate: z.string().optional(),
          isPriority: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, dueDate, ...updateData } = input;
        await db.updateScheduledPayment(id, {
          ...updateData,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        });
        return { success: true };
      }),

    markAsPaid: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.markScheduledPaymentAsPaid(input.id);
      return { success: true };
    }),

    togglePriority: protectedProcedure
      .input(z.object({ id: z.number(), isPriority: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.toggleScheduledPaymentPriority(input.id, input.isPriority);
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteScheduledPayment(input.id);
      return { success: true };
    }),
  }),

  // ============= GOALS =============
  goals: router({
    list: protectedProcedure.input(z.object({ accountId: z.number() })).query(async ({ ctx, input }) => {
      const account = await db.getAccountById(input.accountId);
      if (!account || account.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getGoalsByAccountId(input.accountId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          categoryId: z.number().optional(),
          name: z.string().min(1).max(255),
          targetAmount: z.number().int().positive(),
          deadline: z.string().optional(),
          type: z.enum(["savings", "spending_limit", "income", "emergency_fund"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { deadline, ...goalData } = input;
        await db.createGoal({
          ...goalData,
          currentAmount: 0,
          deadline: deadline ? new Date(deadline) : undefined,
          status: "active",
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          targetAmount: z.number().int().positive().optional(),
          currentAmount: z.number().int().optional(),
          deadline: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, deadline, ...updateData } = input;
        await db.updateGoal(id, {
          ...updateData,
          deadline: deadline ? new Date(deadline) : undefined,
        });
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteGoal(input.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
