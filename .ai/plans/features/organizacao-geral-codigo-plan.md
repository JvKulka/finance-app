# Organização Geral do Código

## Visão Geral
Realizar uma limpeza completa e reorganização do código do sistema de controle financeiro, removendo arquivos não utilizados, dependências obsoletas, estruturando corretamente o projeto Next.js e removendo toda configuração de banco de dados para iniciar do zero.

## Objetivos
- Limpar arquivos não utilizados e duplicados
- Remover dependências não utilizadas
- Estruturar corretamente o projeto Next.js
- Remover toda configuração de banco de dados
- Verificar e otimizar o tamanho da pasta node_modules
- Organizar a estrutura de pastas seguindo boas práticas

## Requisitos Funcionais

### RF1: Remover Arquivos Duplicados
- Remover pasta `client/` (projeto React/Vite separado não necessário)
- Remover componentes duplicados entre `components/` e `client/src/components/`
- Remover arquivos de configuração duplicados (`next.config.js` e `next.config.mjs`)
- Remover arquivos de banco de dados duplicados (`lib/server/db.ts` e `server/db.ts`)

### RF2: Remover Configuração de Banco de Dados
- Remover pasta `drizzle/` completa
- Remover arquivo `drizzle.config.ts`
- Remover arquivos de conexão com banco (`lib/server/db.ts`, `server/db.ts`)
- Remover imports e referências a banco de dados em todos os arquivos
- Remover documentação relacionada ao banco (arquivos .md sobre conexão)

### RF3: Remover Dependências Não Utilizadas
- Remover `mysql2`
- Remover `postgres`
- Remover `drizzle-orm` e `drizzle-kit`
- Remover `@supabase/supabase-js`
- Remover `@types/pg`
- Verificar e remover outras dependências não utilizadas

### RF4: Estruturar Projeto Next.js Corretamente
- Verificar estrutura de pastas do Next.js App Router
- Organizar componentes em `app/components/` ou manter em `components/` com imports corretos
- Verificar e corrigir configurações do Next.js
- Remover configurações desnecessárias
- Verificar paths no `tsconfig.json` e `next.config.mjs`

### RF5: Limpar Documentação
- Remover arquivos .md relacionados ao banco de dados:
  - COMO_EXECUTAR_SQL.md
  - COMO_OBTER_DATABASE_URL.md
  - CORRECAO_CONEXAO_SUPABASE.md
  - GUIA_CONNECTION_STRING.md
  - ONDE_ENCONTRAR_CONNECTION_STRING.md
  - SOLUCAO_ERRO_CONEXAO.md
  - SOLUCAO_FINAL_CONEXAO.md
  - SOLUCAO_HOSTNAME_NAO_ENCONTRADO.md
  - SUPABASE_SETUP.md
  - VERIFICACAO_TABELAS.md
  - supabase-schema.sql
- Manter apenas documentação relevante

### RF6: Verificar e Otimizar node_modules
- Identificar dependências pesadas desnecessárias
- Verificar se há pacotes duplicados
- Sugerir otimizações

## Requisitos Não Funcionais
- Performance: Manter apenas dependências necessárias
- Manutenibilidade: Código limpo e bem organizado
- Estrutura: Seguir padrões do Next.js 16

## Dependências
- Nenhuma

## Notas de Implementação
- Fazer backup antes de remover arquivos importantes
- Verificar imports antes de remover arquivos
- Testar que o projeto ainda compila após as mudanças
- Manter apenas a estrutura Next.js padrão

## Testes
- Verificar que o projeto compila sem erros
- Verificar que não há imports quebrados
- Verificar que a estrutura do Next.js está correta
- Verificar que não há dependências não utilizadas no package.json

