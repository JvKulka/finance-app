# Task 11: Migrar estrutura de banco de dados e Supabase

**Status**: pending
**Prioridade**: high
**Dependências**: task9

## Descrição
Migrar `server/db.ts` para estrutura Next.js e configurar Supabase com connection pooling para resolver problema de IPv4. Criar `lib/server/db.ts` e configurar variáveis de ambiente.

## Critérios de Aceitação
- [ ] `lib/server/db.ts` criado com todas as funções de banco
- [ ] Supabase configurado com connection pooling (porta 6543)
- [ ] Drizzle ORM funcionando com Next.js
- [ ] Todas as queries de banco funcionando
- [ ] Variáveis de ambiente configuradas para Vercel
- [ ] Teste de conexão com banco passando

## Como Testar
1. Testar conexão com banco de dados
2. Executar uma query simples (ex: `getUserByEmail`)
3. Verificar logs de conexão
4. Testar criação de usuário

## Notas
- Usar connection pooling do Supabase (porta 6543)
- Configurar `DATABASE_URL` com formato de pooling
- Manter todas as funções de banco existentes

