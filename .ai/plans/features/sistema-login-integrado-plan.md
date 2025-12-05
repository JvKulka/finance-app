# Sistema de Login Integrado

## Visão Geral

Implementar um sistema de autenticação completo integrado ao código atual, removendo a dependência do OAuth da Manus. O sistema permitirá que usuários se registrem e façam login usando email e senha, mantendo a mesma estrutura de sessão JWT já existente.

## Objetivos

- Remover completamente a dependência do OAuth Manus
- Implementar registro de usuários com email e senha
- Implementar login com email e senha
- Manter compatibilidade com o sistema de sessões JWT existente
- Manter o design consistente com o restante da aplicação
- Garantir segurança com hash de senhas (bcrypt)

## Requisitos Funcionais

### RF1: Atualização do Schema de Usuários
- Adicionar campo `password` (hash) na tabela `users`
- Tornar `openId` opcional ou gerar automaticamente
- Manter compatibilidade com dados existentes
- Critérios de aceitação:
  - Campo `password` adicionado ao schema
  - Migration criada e testada
  - Dados existentes não são afetados

### RF2: Endpoint de Registro
- Criar endpoint tRPC `auth.register`
- Validar email único
- Hash de senha com bcrypt
- Criar usuário no banco de dados
- Gerar sessão JWT automaticamente após registro
- Critérios de aceitação:
  - Usuário pode se registrar com email e senha
  - Email duplicado retorna erro apropriado
  - Senha é armazenada com hash seguro
  - Sessão é criada automaticamente após registro

### RF3: Endpoint de Login
- Criar endpoint tRPC `auth.login`
- Validar email e senha
- Verificar hash de senha
- Gerar sessão JWT
- Atualizar `lastSignedIn`
- Critérios de aceitação:
  - Usuário pode fazer login com email e senha válidos
  - Credenciais inválidas retornam erro apropriado
  - Sessão JWT é criada e retornada
  - Cookie de sessão é configurado corretamente

### RF4: Interface de Registro
- Criar página/componente de registro
- Formulário com campos: nome, email, senha, confirmar senha
- Validação de formulário
- Integração com endpoint de registro
- Redirecionamento após registro bem-sucedido
- Critérios de aceitação:
  - Interface segue o design existente
  - Validações funcionam corretamente
  - Mensagens de erro são claras
  - Redirecionamento funciona após registro

### RF5: Interface de Login
- Criar página/componente de login
- Formulário com campos: email, senha
- Validação de formulário
- Integração com endpoint de login
- Redirecionamento após login bem-sucedido
- Link para página de registro
- Critérios de aceitação:
  - Interface segue o design existente
  - Validações funcionam corretamente
  - Mensagens de erro são claras
  - Redirecionamento funciona após login

### RF6: Remoção do OAuth Manus
- Remover rotas OAuth do servidor
- Remover dependências do SDK Manus
- Remover código de autenticação OAuth
- Atualizar contexto de autenticação
- Limpar variáveis de ambiente relacionadas
- Critérios de aceitação:
  - Nenhuma referência ao OAuth Manus no código
  - Sistema funciona sem OAuth
  - Código limpo e organizado

### RF7: Atualização do Sistema de Autenticação
- Modificar `createContext` para usar autenticação local
- Atualizar `authenticateRequest` para não depender de OAuth
- Manter compatibilidade com JWT existente
- Remover usuário mock de desenvolvimento
- Critérios de aceitação:
  - Autenticação funciona com JWT local
  - Contexto é criado corretamente
  - Sessões são validadas adequadamente

## Requisitos Não Funcionais

- **Segurança**: 
  - Senhas devem ser hasheadas com bcrypt (cost mínimo 10)
  - JWT deve usar secret seguro
  - Validação de entrada robusta
  - Proteção contra ataques comuns (SQL injection, XSS)
  
- **Performance**: 
  - Hash de senha não deve bloquear requisições
  - Validação de sessão deve ser rápida
  
- **UX**: 
  - Interface deve seguir o design system existente
  - Mensagens de erro devem ser claras e úteis
  - Feedback visual durante processos assíncronos
  - Transições suaves entre estados

- **Compatibilidade**: 
  - Manter estrutura de sessão JWT existente
  - Não quebrar funcionalidades existentes
  - Dados existentes devem continuar funcionando

## Dependências

- Biblioteca `bcrypt` ou `bcryptjs` para hash de senhas
- Biblioteca `zod` para validação (já existe no projeto)
- Sistema de sessão JWT existente (já implementado)

## Notas de Implementação

1. **Schema**: O campo `openId` pode ser gerado automaticamente como UUID ou hash do email para manter unicidade
2. **Migração**: Criar migration para adicionar campo `password` sem quebrar dados existentes
3. **Backward Compatibility**: Usuários existentes podem precisar redefinir senha ou usar fluxo de recuperação
4. **Design**: Usar componentes UI existentes (Input, Button, Card, etc.) para manter consistência
5. **Rotas**: Criar rotas `/login` e `/register` no frontend
6. **Validação**: Usar Zod para validar email e senha no backend e frontend

## Testes

- Teste de registro com email válido
- Teste de registro com email duplicado
- Teste de registro com senha fraca
- Teste de login com credenciais válidas
- Teste de login com credenciais inválidas
- Teste de sessão após login
- Teste de logout
- Teste de proteção de rotas autenticadas
- Teste de hash de senha (verificar que senha não é armazenada em texto plano)

