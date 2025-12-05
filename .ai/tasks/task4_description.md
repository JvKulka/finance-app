# Task 4: Criar endpoint tRPC de login

**Status**: completed
**Prioridade**: high
**Dependências**: task2

## Descrição
Criar endpoint `auth.login` no router tRPC que permite fazer login com email e senha. O endpoint deve validar credenciais, verificar hash da senha e gerar sessão JWT.

## Critérios de Aceitação
- [ ] Endpoint `auth.login` criado em `server/routers.ts`
- [ ] Validação com Zod: email e senha obrigatórios
- [ ] Busca usuário por email
- [ ] Verifica se usuário existe
- [ ] Verifica hash da senha com `verifyPassword`
- [ ] Atualiza `lastSignedIn` do usuário
- [ ] Gera sessão JWT usando `sdk.createSessionToken`
- [ ] Define cookie de sessão na resposta
- [ ] Retorna dados do usuário (sem senha)
- [ ] Retorna erro genérico para credenciais inválidas (não revela se email existe)

## Como Testar
1. Fazer login com credenciais válidas - deve criar sessão e retornar usuário
2. Tentar login com email inexistente - deve retornar erro de credenciais inválidas
3. Tentar login com senha incorreta - deve retornar erro de credenciais inválidas
4. Verificar que cookie de sessão é definido após login
5. Verificar que `lastSignedIn` é atualizado
6. Verificar que mensagem de erro não revela se email existe ou não

## Notas
- Por segurança, usar mensagem genérica "Credenciais inválidas" para ambos os casos
- Atualizar `lastSignedIn` após login bem-sucedido
- Usar `getSessionCookieOptions` para configurar cookie corretamente

