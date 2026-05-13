# Configuração do Supabase - Sistema de Controle Financeiro

Este guia explica como configurar o banco de dados Supabase do zero para o sistema de controle financeiro.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: Nome do projeto (ex: "sistema-controle-financeiro")
   - **Database Password**: Escolha uma senha forte (anote esta senha!)
   - **Region**: Escolha a região mais próxima
5. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Obter Credenciais

1. No painel do Supabase, vá em **Settings** > **API**
2. Anote as seguintes informações:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - ⚠️ Mantenha secreta!

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[SEU_PROJETO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY]
SUPABASE_DB_PASSWORD=[SENHA_DO_BANCO]

# JWT
JWT_SECRET=[GERE_UMA_CHAVE_SECRETA]
```

**Como gerar JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Criar Schema do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `supabase/schema.sql`
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Aguarde a execução completar

O schema criará:
- ✅ Todas as tabelas necessárias
- ✅ Índices para performance
- ✅ Triggers para `updated_at`
- ✅ Row Level Security (RLS) básico

### 5. Verificar Tabelas Criadas

1. Vá em **Table Editor** no painel do Supabase
2. Você deve ver as seguintes tabelas:
   - `users`
   - `accounts`
   - `categories`
   - `credit_cards`
   - `transactions`
   - `scheduled_payments`
   - `goals`
   - `activity_logs`

### 6. Testar Conexão

Execute o projeto:

```bash
npm run dev
```

O sistema deve conectar ao Supabase automaticamente.

## 🔒 Segurança (Row Level Security)

As políticas RLS estão configuradas de forma básica. Para produção, você deve:

1. Ajustar as políticas RLS no Supabase
2. Implementar autenticação adequada
3. Garantir que usuários só acessem seus próprios dados

**Nota**: As políticas atuais permitem acesso amplo. Ajuste conforme necessário.

## 📊 Estrutura do Banco

### Tabelas Principais

- **users**: Usuários do sistema
- **accounts**: Contas financeiras (pessoal/empresarial)
- **categories**: Categorias de receitas/despesas
- **transactions**: Transações financeiras
- **credit_cards**: Cartões de crédito
- **scheduled_payments**: Pagamentos agendados
- **goals**: Metas financeiras
- **activity_logs**: Logs de atividade

### Relacionamentos

- `accounts` → `users` (muitos para um)
- `categories` → `accounts` (muitos para um)
- `transactions` → `accounts`, `categories`, `credit_cards` (muitos para um)
- `scheduled_payments` → `accounts`, `categories`, `credit_cards`
- `goals` → `accounts`, `categories`
- `activity_logs` → `users`

## 🛠️ Troubleshooting

### Erro de Conexão

- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo
- Verifique se a senha do banco está correta

### Erro ao Criar Schema

- Execute o SQL em partes se houver erro
- Verifique se não há tabelas duplicadas
- Confira os logs de erro no Supabase

### RLS Bloqueando Acesso

- Temporariamente, você pode desabilitar RLS nas tabelas
- Ou ajustar as políticas para permitir acesso durante desenvolvimento

### Recuperação de senha (Supabase Auth)

O e-mail de “esqueci a senha” usa **Supabase Auth** (`resetPasswordForEmail`). Configure:

1. **Authentication → URL configuration**: **Site URL** com a URL base do app (ex.: `http://localhost:3000` em dev).
2. **Redirect URLs**: inclua `{Site URL}/auth/recuperar-senha` (ex.: `http://localhost:3000/auth/recuperar-senha` e o equivalente em produção).
3. Opcional (recomendado em produção): variável **`NEXT_PUBLIC_APP_URL`** com a mesma URL base (sem barra final), para o servidor montar o `redirectTo` corretamente.
4. **Authentication → Emails**: confirme SMTP ou o provedor padrão para o envio dos e-mails.

## 📚 Recursos

- [Documentação do Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

