# Task 8: Atualizar rotas e navegação no frontend

**Status**: completed
**Prioridade**: medium
**Dependências**: task6, task7

## Descrição
Atualizar o sistema de rotas no frontend para incluir as páginas de login e registro, e atualizar a lógica de autenticação para usar o novo sistema.

## Critérios de Aceitação
- [ ] Rotas `/login` e `/register` adicionadas ao router
- [ ] `App.tsx` atualizado para redirecionar usuários não autenticados para `/login`
- [ ] `useAuth` atualizado se necessário (pode manter como está)
- [ ] Removida referência a `getLoginUrl` do OAuth
- [ ] `UnauthenticatedHome` atualizado ou removido (substituído por redirecionamento)
- [ ] Navegação funciona corretamente entre login/registro/dashboard
- [ ] Usuários autenticados são redirecionados para dashboard se tentarem acessar login/registro

## Como Testar
1. Acessar `/` sem estar autenticado - deve redirecionar para `/login`
2. Acessar `/login` - deve mostrar página de login
3. Acessar `/register` - deve mostrar página de registro
4. Fazer login - deve redirecionar para dashboard
5. Acessar `/login` estando autenticado - deve redirecionar para dashboard
6. Fazer logout - deve redirecionar para login
7. Verificar que rotas protegidas requerem autenticação

## Notas
- Usar wouter para rotas (já está no projeto)
- Manter lógica de autenticação existente em `useAuth`
- Atualizar `Router` em `App.tsx` para usar novas rotas

