# Variáveis de Ambiente - Sistema de Controle Financeiro

## OAuth - Plataforma Manus

Este projeto usa a **plataforma Manus** para autenticação OAuth. Para obter as credenciais necessárias:

### Onde conseguir as credenciais:

1. **Acesse o portal da Manus**
   - URL: `https://manus.computer` ou `https://manuspre.computer` (ambiente de desenvolvimento)
   - Você precisa ter uma conta na plataforma Manus

2. **Crie ou acesse seu projeto**
   - No painel da Manus, crie um novo projeto ou acesse um existente
   - Cada projeto tem um **App ID** (também chamado de Project ID)

3. **Obtenha as informações necessárias:**
   - **App ID**: Encontrado no painel do projeto (geralmente na seção de configurações)
   - **OAuth Portal URL**: URL base do portal de autenticação (ex: `https://portal.manus.computer`)
   - **OAuth Server URL**: URL da API OAuth (ex: `https://api.manus.computer`)

### Variáveis necessárias:

#### Frontend (client):
```env
VITE_OAUTH_PORTAL_URL=https://portal.manus.computer
VITE_APP_ID=seu-app-id-aqui
```

#### Backend (server):
```env
OAUTH_SERVER_URL=https://api.manus.computer
VITE_APP_ID=seu-app-id-aqui
JWT_SECRET=sua-chave-secreta-jwt
OWNER_OPEN_ID=seu-open-id-aqui
```

### Outras variáveis importantes:

#### Banco de Dados (Supabase PostgreSQL):
```env
DATABASE_URL=postgresql://postgres:[SENHA]@[PROJETO].supabase.co:5432/postgres
```

**Como obter a URL de conexão do Supabase:**
1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá em **Settings** > **Database**
3. Role até **Connection string** > **URI**
4. Copie a string de conexão e substitua `[YOUR-PASSWORD]` pela senha do seu banco
5. A URL terá o formato: `postgresql://postgres.xxxxx:[SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

#### Servidor:
```env
PORT=3000  # Opcional, padrão é 3000
```

#### Forge API (Opcional - para funcionalidades de IA):
```env
BUILT_IN_FORGE_API_URL=https://forge.manus.im/v1
BUILT_IN_FORGE_API_KEY=sua-chave-api-forge
```

#### Analytics (Opcional):
```env
VITE_ANALYTICS_ENDPOINT=https://analytics.exemplo.com
VITE_ANALYTICS_WEBSITE_ID=seu-website-id
```

## Como configurar:

1. **Crie um arquivo `.env` na raiz do projeto** (copie de `.env.example` se existir)

2. **Preencha as variáveis** com suas credenciais da Manus

3. **Para desenvolvimento local sem OAuth:**
   - Você pode deixar as variáveis OAuth vazias
   - O sistema criará automaticamente um usuário mock em desenvolvimento
   - Isso permite testar o sistema sem configurar OAuth

## Exemplo de arquivo .env:

```env
# OAuth - Manus
VITE_OAUTH_PORTAL_URL=https://portal.manus.computer
VITE_APP_ID=meu-projeto-123
OAUTH_SERVER_URL=https://api.manus.computer

# Segurança
JWT_SECRET=minha-chave-secreta-super-segura-123456789
OWNER_OPEN_ID=meu-open-id-123

# Banco de Dados - Supabase
DATABASE_URL=postgresql://postgres:[SENHA]@[PROJETO].supabase.co:5432/postgres

# Servidor
PORT=3000
```

## Importante:

- ⚠️ **NUNCA** commite o arquivo `.env` no Git
- O arquivo `.env` já deve estar no `.gitignore`
- Use `.env.example` como template (sem valores sensíveis)
- Em produção, use variáveis de ambiente do seu provedor de hospedagem

## Links úteis:

- Plataforma Manus: https://manus.computer
- Documentação Manus: (consulte a documentação oficial da Manus)

