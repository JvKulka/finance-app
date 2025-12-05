# Task 6: Criar página de registro no frontend

**Status**: completed
**Prioridade**: medium
**Dependências**: task3

## Descrição
Criar página/componente de registro seguindo o design system existente. O formulário deve ter campos para nome, email, senha e confirmar senha, com validação e integração com o endpoint de registro.

## Critérios de Aceitação
- [ ] Página/componente `Register.tsx` criado em `client/src/pages/`
- [ ] Formulário com campos: nome, email, senha, confirmar senha
- [ ] Validação de formulário com react-hook-form e zod
- [ ] Validação de senha: mínimo 6 caracteres
- [ ] Validação de confirmação de senha: deve coincidir
- [ ] Validação de email: formato válido
- [ ] Integração com `trpc.auth.register.useMutation`
- [ ] Estados de loading durante registro
- [ ] Tratamento de erros com mensagens claras
- [ ] Redirecionamento para dashboard após registro bem-sucedido
- [ ] Link para página de login
- [ ] Design consistente com o restante da aplicação

## Como Testar
1. Preencher formulário com dados válidos - deve registrar e redirecionar
2. Tentar registrar com email duplicado - deve mostrar erro
3. Tentar registrar com senhas não coincidentes - deve mostrar erro
4. Tentar registrar com senha muito curta - deve mostrar erro
5. Verificar que loading é exibido durante registro
6. Verificar que redirecionamento funciona após registro
7. Verificar design está consistente com outras páginas

## Notas
- Usar componentes UI existentes (Input, Button, Card, etc.)
- Usar tema dark/light existente
- Seguir padrão de validação usado em outros formulários do projeto
- Usar toast/notificação para feedback de sucesso/erro

