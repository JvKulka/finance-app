# Guia de Deploy na Vercel

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente na Vercel:

### Banco de Dados (Supabase)
- `DATABASE_URL` - URL completa de conexão do Supabase (recomendado usar connection pooling)
- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `SUPABASE_DB_PASSWORD` - Senha do banco de dados (opcional se usar DATABASE_URL)
- `SUPABASE_PROJECT_REF` - Referência do projeto (opcional, extraído automaticamente)

### Autenticação
- `JWT_SECRET` - Chave secreta para assinatura de tokens JWT

### Aplicação
- `NEXT_PUBLIC_APP_URL` - URL da aplicação (ex: https://seu-app.vercel.app)

## Como Configurar

1. Acesse o dashboard da Vercel: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em Settings > Environment Variables
4. Adicione cada variável acima
5. Para produção, marque "Production"
6. Para preview, marque "Preview"
7. Para desenvolvimento, marque "Development"

## Connection Pooling do Supabase

Para resolver problemas de IPv4, use a URL de connection pooling do Supabase:

1. Acesse o Supabase Dashboard
2. Vá em Settings > Database
3. Copie a "Connection string" da seção "Connection pooling"
4. Use essa URL como `DATABASE_URL`

A URL deve ter o formato:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## Deploy

1. Conecte seu repositório GitHub/GitLab à Vercel
2. A Vercel detectará automaticamente que é um projeto Next.js
3. Configure as variáveis de ambiente
4. Faça push para a branch principal
5. A Vercel fará o deploy automaticamente

## Build Local

Para testar o build localmente antes de fazer deploy:

```bash
npm run build
npm start
```

## Troubleshooting

### Erro de conexão com banco
- Verifique se `DATABASE_URL` está configurada corretamente
- Use connection pooling (porta 6543) ao invés de conexão direta (porta 5432)
- Verifique se o projeto Supabase está ativo

### Erro de autenticação
- Verifique se `JWT_SECRET` está configurada
- Certifique-se de que os cookies estão sendo enviados (credentials: "include")

### Build falha
- Verifique os logs de build na Vercel
- Teste o build localmente primeiro
- Verifique se todas as dependências estão no `package.json`

