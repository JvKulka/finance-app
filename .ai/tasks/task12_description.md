# Task 12: Migrar rotas e páginas para App Router

**Status**: pending
**Prioridade**: high
**Dependências**: task9, task10

## Descrição
Converter todas as páginas de `client/src/pages/` para Next.js App Router usando file-based routing. Migrar rotas de Wouter para estrutura de pastas do Next.js.

## Critérios de Aceitação
- [ ] Todas as páginas migradas para `app/`
- [ ] Rotas protegidas configuradas com middleware
- [ ] Rotas públicas funcionando (login, register)
- [ ] Layout principal criado (`app/layout.tsx`)
- [ ] Navegação funcionando corretamente
- [ ] Redirecionamentos de autenticação funcionando

## Como Testar
1. Acessar todas as rotas e verificar que renderizam
2. Testar redirecionamento quando não autenticado
3. Testar redirecionamento quando autenticado
4. Verificar que rotas protegidas requerem autenticação

## Notas
- Estrutura de rotas:
  - `/app/login/page.tsx`
  - `/app/register/page.tsx`
  - `/app/(dashboard)/page.tsx` (Dashboard)
  - `/app/(dashboard)/transactions/page.tsx`
  - etc.
- Usar route groups `(dashboard)` para layout compartilhado
- Criar middleware Next.js para autenticação

