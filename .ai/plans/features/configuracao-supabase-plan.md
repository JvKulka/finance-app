# Configuração do Banco de Dados Supabase

## Visão Geral
Configurar o banco de dados do zero usando Supabase diretamente, seguindo a referência do projeto gestao_cartorio. Implementar todas as funções de banco de dados usando o cliente Supabase ao invés de Drizzle ORM.

## Objetivos
- Instalar e configurar @supabase/supabase-js
- Criar cliente Supabase para servidor e cliente
- Criar schema do banco de dados no Supabase
- Implementar todas as funções de banco de dados usando Supabase
- Configurar variáveis de ambiente
- Testar conexão e operações básicas

## Requisitos Funcionais

### RF1: Instalação e Configuração do Supabase
- Instalar @supabase/supabase-js
- Criar cliente Supabase para o servidor (lib/supabase/server.ts)
- Criar cliente Supabase para o cliente (lib/supabase/client.ts)
- Configurar variáveis de ambiente necessárias

### RF2: Criação do Schema do Banco de Dados
Criar tabelas no Supabase:
- users (usuários)
- accounts (contas)
- categories (categorias)
- transactions (transações)
- creditCards (cartões de crédito)
- scheduledPayments (pagamentos agendados)
- goals (metas)
- activityLogs (logs de atividade)

### RF3: Implementação das Funções de Banco de Dados
Implementar todas as funções em lib/server/db.ts usando Supabase:
- Funções de usuário (getUserByEmail, getUserByOpenId, upsertUser)
- Funções de contas (getAccountsByUserId, getAccountById, createAccount, etc.)
- Funções de categorias
- Funções de transações
- Funções de cartões de crédito
- Funções de pagamentos agendados
- Funções de metas
- Funções de logs de atividade
- Funções de dashboard (summary, expensesByCategory)

### RF4: Configuração de Segurança
- Configurar Row Level Security (RLS) no Supabase
- Criar políticas de acesso para cada tabela
- Garantir que usuários só acessem seus próprios dados

## Requisitos Não Funcionais
- Performance: Usar connection pooling quando disponível
- Segurança: RLS habilitado em todas as tabelas
- Manutenibilidade: Código limpo e bem documentado

## Dependências
- @supabase/supabase-js instalado
- Projeto Supabase criado
- Variáveis de ambiente configuradas

## Notas de Implementação
- Usar Supabase Client para todas as operações
- Seguir padrões do projeto gestao_cartorio
- Manter compatibilidade com os tipos existentes
- Usar TypeScript para type safety

## Testes
- Testar conexão com Supabase
- Testar CRUD básico em cada tabela
- Testar políticas de segurança
- Verificar que todas as funções funcionam corretamente

