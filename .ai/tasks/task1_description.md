# Task 1: Instalar dependência bcryptjs e atualizar schema do banco

**Status**: completed
**Prioridade**: high
**Dependências**: nenhuma

## Descrição
Instalar a biblioteca bcryptjs para hash de senhas e atualizar o schema do banco de dados para incluir o campo `password` na tabela `users`. O campo `openId` deve ser mantido mas pode ser opcional ou gerado automaticamente.

## Critérios de Aceitação
- [ ] bcryptjs instalado no projeto
- [ ] Campo `password` adicionado ao schema `users` em `drizzle/schema.ts`
- [ ] Campo `password` é do tipo `varchar` com tamanho adequado para hash
- [ ] Campo `password` é nullable para manter compatibilidade com dados existentes
- [ ] Migration gerada com `drizzle-kit generate`
- [ ] Schema atualizado mantém todos os campos existentes

## Como Testar
1. Verificar que `bcryptjs` está no `package.json`
2. Verificar que o schema em `drizzle/schema.ts` tem o campo `password`
3. Executar `npm run db:push` e verificar que a migration é criada sem erros
4. Verificar que usuários existentes não são afetados

## Notas
- Usar `bcryptjs` ao invés de `bcrypt` para compatibilidade com Windows
- O hash bcrypt geralmente tem 60 caracteres, usar `varchar(255)` para segurança
- Manter `openId` como campo único mas permitir null temporariamente

