# Task 15: Configurar autenticação e middleware Next.js

**Status**: pending
**Prioridade**: high
**Dependências**: task10, task11, task12

## Descrição
Criar middleware Next.js para autenticação e adaptar sistema de cookies/sessões para Next.js. Garantir que rotas protegidas funcionem corretamente.

## Critérios de Aceitação
- [ ] `middleware.ts` criado na raiz do projeto
- [ ] Middleware protegendo rotas `/dashboard/*` e similares
- [ ] Cookies funcionando com Next.js
- [ ] Sessões JWT sendo verificadas
- [ ] Redirecionamentos funcionando (não autenticado → login)
- [ ] Redirecionamentos funcionando (autenticado → dashboard)

## Como Testar
1. Acessar rota protegida sem autenticação → deve redirecionar para login
2. Fazer login → deve redirecionar para dashboard
3. Acessar login estando autenticado → deve redirecionar para dashboard
4. Verificar que cookies estão sendo setados corretamente

## Notas
- Usar `NextRequest` e `NextResponse` no middleware
- Adaptar `server/_core/cookies.ts` para Next.js
- Manter compatibilidade com sistema de sessões JWT existente

