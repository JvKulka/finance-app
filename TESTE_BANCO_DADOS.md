# Guia de Teste do Banco de Dados

Este guia ajuda você a testar se a conexão com o Supabase está funcionando corretamente.

## 📋 Pré-requisitos

1. ✅ Projeto Supabase criado
2. ✅ Schema SQL executado (tabelas criadas)
3. ✅ Variáveis de ambiente configuradas no arquivo `.env`

## 🔧 Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` na raiz do projeto contém:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[SEU_PROJETO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY]
JWT_SECRET=[SUA_CHAVE_SECRETA]
```

## 🧪 Teste 1: Script de Teste Automatizado

Execute o script de teste que verifica:
- ✅ Conexão com Supabase
- ✅ Existência de todas as tabelas
- ✅ Criação de usuário
- ✅ Criação de conta
- ✅ Criação de categoria
- ✅ Operações de leitura

```bash
npm run test:db
```

**O que o script faz:**
1. Testa a conexão básica
2. Verifica se todas as 8 tabelas existem
3. Cria um usuário de teste
4. Cria uma conta de teste
5. Cria uma categoria de teste
6. Testa operações de leitura
7. Limpa os dados de teste criados

## 🧪 Teste 2: Teste Manual via Aplicação

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse `http://localhost:3000`

3. Tente fazer:
   - **Registro de usuário**: Acesse `/register` e crie uma conta
   - **Login**: Acesse `/login` e faça login
   - **Dashboard**: Após login, você deve ver o dashboard

## 🧪 Teste 3: Verificar no Supabase Dashboard

1. Acesse o painel do Supabase
2. Vá em **Table Editor**
3. Verifique se as tabelas estão criadas:
   - `users`
   - `accounts`
   - `categories`
   - `transactions`
   - `credit_cards`
   - `scheduled_payments`
   - `goals`
   - `activity_logs`

4. Após executar o script de teste ou usar a aplicação, verifique se os dados foram inseridos

## 🐛 Troubleshooting

### Erro: "Missing NEXT_PUBLIC_SUPABASE_URL"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se as variáveis estão corretas
- Reinicie o servidor após alterar `.env`

### Erro: "Cliente Supabase não está configurado"
- Verifique se `@supabase/supabase-js` está instalado: `npm list @supabase/supabase-js`
- Se não estiver, instale: `npm install @supabase/supabase-js`

### Erro: "relation does not exist"
- Execute o `schema.sql` novamente no Supabase SQL Editor
- Verifique se todas as tabelas foram criadas no Table Editor

### Erro de conexão
- Verifique se o projeto Supabase está ativo
- Verifique se as credenciais estão corretas
- Verifique se não há bloqueios de firewall

### Erro de RLS (Row Level Security)
- As políticas RLS estão configuradas para permitir tudo temporariamente
- Se houver problemas, você pode temporariamente desabilitar RLS:
  ```sql
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  -- Repita para outras tabelas se necessário
  ```

## ✅ Checklist de Verificação

- [ ] Arquivo `.env` configurado
- [ ] Schema SQL executado no Supabase
- [ ] Todas as 8 tabelas existem no Table Editor
- [ ] Script de teste (`npm run test:db`) executa sem erros
- [ ] Aplicação inicia sem erros (`npm run dev`)
- [ ] É possível criar um usuário via `/register`
- [ ] É possível fazer login via `/login`
- [ ] Dashboard carrega após login

## 📊 Próximos Passos

Após confirmar que tudo está funcionando:

1. **Ajustar RLS**: Configure políticas de segurança adequadas
2. **Testar funcionalidades**: Teste criação de contas, transações, etc.
3. **Otimizar**: Adicione índices adicionais se necessário
4. **Backup**: Configure backups automáticos no Supabase

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

