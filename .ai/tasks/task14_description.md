# Task 14: Migrar hooks e utilitários

**Status**: pending
**Prioridade**: medium
**Dependências**: task10, task12

## Descrição
Migrar hooks customizados (`useAuth`, etc) e utilitários para estrutura Next.js. Adaptar `useAuth` para funcionar com Next.js e tRPC.

## Critérios de Aceitação
- [ ] `useAuth` hook adaptado para Next.js
- [ ] Todos os hooks migrados para `lib/hooks/` ou `hooks/`
- [ ] Utilitários migrados para `lib/utils.ts`
- [ ] tRPC client configurado para Next.js
- [ ] Todos os hooks funcionando corretamente

## Como Testar
1. Testar hook `useAuth` em componentes
2. Verificar que autenticação funciona via hooks
3. Testar outros hooks customizados
4. Verificar que tRPC está sendo usado corretamente

## Notas
- Adaptar `client/src/lib/trpc.ts` para Next.js
- Usar `@trpc/react-query` ou `@tanstack/react-query` com Next.js
- Garantir que hooks funcionam em Client Components

