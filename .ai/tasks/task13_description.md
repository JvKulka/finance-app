# Task 13: Migrar componentes e UI

**Status**: pending
**Prioridade**: medium
**Dependências**: task12

## Descrição
Migrar todos os componentes de `client/src/components/` para `components/` e adaptar para Next.js (Server Components vs Client Components). Manter todas as estilizações e funcionalidades.

## Critérios de Aceitação
- [ ] Todos os componentes migrados para `components/`
- [ ] Componentes marcados como `'use client'` quando necessário
- [ ] Todos os componentes UI (Radix UI) funcionando
- [ ] ThemeContext adaptado para Next.js
- [ ] FinanceLayout funcionando
- [ ] Todos os estilos aplicados corretamente

## Como Testar
1. Verificar que todos os componentes renderizam
2. Testar interações (cliques, formulários, etc)
3. Verificar que temas (dark/light) funcionam
4. Verificar que todos os componentes UI funcionam

## Notas
- Componentes que usam hooks, estado ou eventos devem ser Client Components
- Componentes puramente de apresentação podem ser Server Components
- Manter estrutura de pastas similar

