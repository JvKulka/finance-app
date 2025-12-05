# Task 2: Criar helpers de autenticação no backend

**Status**: completed
**Prioridade**: high
**Dependências**: task1

## Descrição
Criar funções helper para hash e verificação de senhas, e funções para buscar usuário por email. Essas funções serão usadas pelos endpoints de registro e login.

## Critérios de Aceitação
- [ ] Função `hashPassword(password: string): Promise<string>` criada
- [ ] Função `verifyPassword(password: string, hash: string): Promise<boolean>` criada
- [ ] Função `getUserByEmail(email: string): Promise<User | undefined>` criada em `server/db.ts`
- [ ] Helpers usam bcryptjs corretamente
- [ ] Tratamento de erros implementado

## Como Testar
1. Testar hash de senha retorna string diferente da senha original
2. Testar verificação de senha retorna true para senha correta
3. Testar verificação de senha retorna false para senha incorreta
4. Testar busca por email retorna usuário quando existe
5. Testar busca por email retorna undefined quando não existe

## Notas
- Usar `bcryptjs.hash` com cost mínimo de 10
- Usar `bcryptjs.compare` para verificação
- Adicionar index no campo email se ainda não existir

