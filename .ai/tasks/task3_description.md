# Task 3: Criar endpoint tRPC de registro

**Status**: completed
**Prioridade**: high
**Dependências**: task2

## Descrição
Criar endpoint `auth.register` no router tRPC que permite registrar novos usuários com nome, email e senha. O endpoint deve validar os dados, hash a senha, criar o usuário e gerar sessão JWT automaticamente.

## Critérios de Aceitação
- [ ] Endpoint `auth.register` criado em `server/routers.ts`
- [ ] Validação com Zod: nome (min 2 chars), email (formato válido), senha (min 6 chars)
- [ ] Verifica se email já existe no banco
- [ ] Hash da senha antes de salvar
- [ ] Gera `openId` único (pode ser UUID ou hash do email)
- [ ] Cria usuário no banco de dados
- [ ] Gera sessão JWT usando `sdk.createSessionToken`
- [ ] Define cookie de sessão na resposta
- [ ] Retorna dados do usuário (sem senha)
- [ ] Retorna erro apropriado para email duplicado

## Como Testar
1. Registrar novo usuário com dados válidos - deve criar usuário e retornar sessão
2. Tentar registrar com email duplicado - deve retornar erro
3. Tentar registrar com senha muito curta - deve retornar erro de validação
4. Tentar registrar com email inválido - deve retornar erro de validação
5. Verificar que senha não é armazenada em texto plano no banco
6. Verificar que cookie de sessão é definido após registro

## Notas
- Usar `nanoid` ou `crypto.randomUUID()` para gerar openId único
- Retornar apenas campos seguros do usuário (sem password)
- Usar `getSessionCookieOptions` para configurar cookie corretamente

