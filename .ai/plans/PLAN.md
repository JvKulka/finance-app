# Sistema de Controle Financeiro - Plano Principal

## Visão Geral

Sistema completo de controle financeiro pessoal e empresarial que permite gerenciar contas, transações, categorias, metas financeiras, cartões de crédito e relatórios detalhados.

## Objetivos do Projeto

- Fornecer uma interface intuitiva para gerenciamento financeiro
- Permitir rastreamento detalhado de receitas e despesas
- Oferecer visualizações e relatórios para análise financeira
- Suportar múltiplas contas e usuários
- Facilitar planejamento financeiro através de metas e agendamentos

## Funcionalidades Principais

### Implementadas
- ✅ Gerenciamento de contas (pessoal/empresarial)
- ✅ Gerenciamento de transações (receitas/despesas)
- ✅ Gerenciamento de categorias com ícones e cores
- ✅ Dashboard com resumos e gráficos
- ✅ Cartões de crédito
- ✅ Agenda de pagamentos futuros
- ✅ Metas financeiras
- ✅ Relatórios e análises
- ✅ Perfil e configurações de usuário
- ✅ Sistema de autenticação (OAuth Manus - temporariamente desabilitado)

### Planejadas
- 📋 Sistema de transações recorrentes (job agendado)
- 📋 Upload de anexos (comprovantes, notas fiscais)
- 📋 Geração de relatórios (PDF e Excel)
- 📋 Logs de atividade
- 📋 Filtros avançados por período
- 📋 Sistema de alertas (gastos acima da média)
- 📋 Notificações de limite de categoria
- 📋 Exportação de dados

## Arquitetura

- **Frontend**: React + TypeScript + Next.js 14+ (App Router)
- **Backend**: Next.js API Routes + tRPC
- **Banco de Dados**: Supabase PostgreSQL com Drizzle ORM
- **Autenticação**: Sistema customizado com email/senha + JWT
- **UI**: Radix UI + Tailwind CSS
- **Deploy**: Vercel

## Planos de Funcionalidades

Consulte os planos detalhados em `.ai/plans/features/` para funcionalidades específicas.

### Implementados
- ✅ Sistema de Login Integrado (`.ai/plans/features/sistema-login-integrado-plan.md`) - Sistema completo de autenticação com email e senha, substituindo OAuth Manus

### Em Progresso
- 🔄 Migração para Next.js (`.ai/plans/features/migracao-nextjs-plan.md`) - Migração completa para Next.js 14+ com Vercel para resolver problemas de IPv4 com Supabase

## Status Atual

O sistema está em desenvolvimento ativo. A maioria das funcionalidades core está implementada. Foco atual em melhorias de UX, testes e funcionalidades avançadas.

