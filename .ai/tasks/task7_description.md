# Task 7: Criar página de login no frontend

**Status**: completed
**Prioridade**: medium
**Dependências**: task4

## Descrição
Criar página/componente de login seguindo o design system existente. O formulário deve ter campos para email e senha, com validação e integração com o endpoint de login.

## Critérios de Aceitação
- [ ] Página/componente `Login.tsx` criado em `client/src/pages/`
- [ ] Formulário com campos: email, senha
- [ ] Validação de formulário com react-hook-form e zod
- [ ] Validação de email: formato válido
- [ ] Integração com `trpc.auth.login.useMutation`
- [ ] Estados de loading durante login
- [ ] Tratamento de erros com mensagens claras
- [ ] Redirecionamento para dashboard após login bem-sucedido
- [ ] Link para página de registro
- [ ] Design consistente com o restante da aplicação

## Como Testar
1. Fazer login com credenciais válidas - deve logar e redirecionar
2. Tentar login com credenciais inválidas - deve mostrar erro
3. Tentar login com email inválido - deve mostrar erro de validação
4. Verificar que loading é exibido durante login
5. Verificar que redirecionamento funciona após login
6. Verificar design está consistente com outras páginas
7. Verificar que link para registro funciona

## Notas
- Usar componentes UI existentes (Input, Button, Card, etc.)
- Usar tema dark/light existente
- Seguir padrão de validação usado em outros formulários do projeto
- Usar toast/notificação para feedback de sucesso/erro
- Considerar adicionar "Esqueci minha senha" (futuro)

