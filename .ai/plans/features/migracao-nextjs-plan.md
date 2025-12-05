# Migração para Next.js com Vercel

## Visão Geral

Migração completa do sistema de Express + Vite para Next.js 14+ (App Router) com deploy na Vercel. Esta migração resolve o problema de IPv4 com Supabase (Next.js usa connection pooling nativamente) e mantém todas as funcionalidades e estilizações existentes.

## Objetivos

- Migrar de Express + Vite para Next.js App Router
- Configurar deploy na Vercel
- Resolver problema de conexão IPv4 com Supabase usando connection pooling
- Manter todas as funcionalidades existentes (100% de compatibilidade)
- Preservar todas as estilizações (Tailwind CSS + Radix UI)
- Manter estrutura de tRPC funcionando
- Garantir que autenticação continue funcionando

## Requisitos Funcionais

### RF1: Estrutura Next.js
- Configurar Next.js 14+ com App Router
- Criar estrutura de pastas: `app/`, `app/api/`, `components/`, `lib/`
- Migrar componentes React de `client/src/` para estrutura Next.js
- Configurar TypeScript e paths aliases

### RF2: API Routes e tRPC
- Migrar tRPC de Express para Next.js API Routes
- Criar `/app/api/trpc/[trpc]/route.ts` para handler tRPC
- Manter todos os routers existentes funcionando
- Preservar contexto e autenticação tRPC

### RF3: Rotas e Navegação
- Converter rotas de Wouter para Next.js App Router
- Migrar `/client/src/pages/` para `/app/` com file-based routing
- Manter rotas protegidas e públicas
- Implementar middleware de autenticação Next.js

### RF4: Banco de Dados e Supabase
- Configurar Supabase com connection pooling (resolver IPv4)
- Migrar `server/db.ts` para estrutura Next.js
- Manter Drizzle ORM funcionando
- Configurar variáveis de ambiente para Vercel

### RF5: Autenticação
- Migrar sistema de autenticação para Next.js
- Manter cookies e sessões JWT funcionando
- Adaptar `useAuth` hook para Next.js
- Preservar páginas de Login e Register

### RF6: Estilização e UI
- Manter Tailwind CSS configurado
- Preservar todos os componentes Radix UI
- Manter ThemeContext funcionando
- Garantir que todos os estilos sejam aplicados corretamente

### RF7: Deploy Vercel
- Configurar `vercel.json` se necessário
- Configurar variáveis de ambiente na Vercel
- Garantir que build funcione corretamente
- Configurar domínio e SSL

## Requisitos Não Funcionais

- **Performance**: Manter ou melhorar performance atual
- **Segurança**: Manter todas as medidas de segurança existentes
- **UX**: Zero mudanças visuais ou de experiência do usuário
- **Compatibilidade**: 100% das funcionalidades devem continuar funcionando
- **Manutenibilidade**: Código deve seguir padrões Next.js

## Dependências

- Next.js 14+ instalado
- Todas as dependências atuais (Radix UI, tRPC, Drizzle, etc)
- Configuração do Supabase com connection pooling
- Variáveis de ambiente configuradas

## Notas de Implementação

### Estrutura de Migração

**De:**
```
client/src/          → app/
server/              → app/api/ + lib/server/
client/src/pages/    → app/
client/src/components/ → components/
```

**Para:**
```
app/
  ├── (auth)/
  │   ├── login/
  │   └── register/
  ├── (dashboard)/
  │   ├── page.tsx (Dashboard)
  │   ├── transactions/
  │   ├── categories/
  │   └── ...
  ├── api/
  │   └── trpc/
  │       └── [trpc]/
  │           └── route.ts
  ├── layout.tsx
  └── page.tsx
components/
lib/
  ├── server/ (server-side code)
  └── client/ (client-side utilities)
```

### Pontos de Atenção

1. **tRPC**: Next.js App Router requer adaptação do handler tRPC
2. **Server Components vs Client Components**: Identificar o que precisa ser client component
3. **Cookies**: Next.js tem API diferente para cookies
4. **Middleware**: Usar Next.js middleware para autenticação
5. **Supabase**: Usar connection pooling via variáveis de ambiente
6. **Build**: Garantir que todas as dependências sejam compatíveis

### Preservação de Funcionalidades

- ✅ Todas as páginas devem funcionar
- ✅ Todas as rotas tRPC devem funcionar
- ✅ Autenticação deve funcionar
- ✅ Banco de dados deve funcionar
- ✅ Todos os componentes UI devem funcionar
- ✅ Temas (dark/light) devem funcionar

## Testes

- [ ] Todas as rotas acessíveis
- [ ] Autenticação funcionando (login/register/logout)
- [ ] Todas as páginas renderizando corretamente
- [ ] Todas as chamadas tRPC funcionando
- [ ] Banco de dados conectando corretamente
- [ ] Estilizações aplicadas corretamente
- [ ] Build de produção funcionando
- [ ] Deploy na Vercel funcionando

