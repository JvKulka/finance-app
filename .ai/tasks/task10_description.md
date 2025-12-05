# Task 10: Migrar tRPC para Next.js API Routes

**Status**: pending
**Prioridade**: high
**Dependências**: task9

## Descrição
Migrar o handler tRPC de Express para Next.js API Routes. Criar `/app/api/trpc/[trpc]/route.ts` e adaptar o contexto tRPC para funcionar com Next.js Request/Response.

## Critérios de Aceitação
- [ ] Handler tRPC criado em `/app/api/trpc/[trpc]/route.ts`
- [ ] Contexto tRPC adaptado para Next.js (usar `NextRequest` e `NextResponse`)
- [ ] Todos os routers existentes funcionando
- [ ] Autenticação via cookies funcionando
- [ ] Middleware de autenticação adaptado
- [ ] Testes de todas as rotas tRPC passando

## Como Testar
1. Testar chamada tRPC do cliente e verificar resposta
2. Verificar que autenticação funciona (cookies sendo setados)
3. Testar todas as rotas: `auth.me`, `auth.register`, `auth.login`, etc.
4. Verificar logs do servidor para erros

## Notas
- Usar `@trpc/server/adapters/next` ou criar adapter customizado
- Adaptar `server/_core/context.ts` para Next.js
- Manter compatibilidade com cookies e sessões JWT

