# TODO - Sistema de Controle Financeiro

## Banco de Dados e Backend
- [x] Implementar schema completo do banco de dados (accounts, categories, transactions, attachments, recurring_transactions, goals, activity_logs)
- [x] Criar helpers de banco de dados para todas as entidades
- [x] Implementar rotas tRPC para categorias (CRUD completo)
- [x] Implementar rotas tRPC para transações (CRUD completo com filtros)
- [x] Implementar rotas tRPC para dashboard (resumos, gráficos, estatísticas)
- [ ] Implementar sistema de transações recorrentes (job agendado)
- [ ] Implementar upload de anexos (comprovantes, notas fiscais)
- [ ] Implementar geração de relatórios (PDF e Excel)
- [ ] Implementar logs de atividade
- [x] Criar testes unitários com Vitest

## Frontend - Componentes Base
- [x] Configurar tema dark mode e paleta de cores
- [x] Criar componente de layout com sidebar
- [x] Criar componente de cards de resumo financeiro
- [x] Criar componente de gráficos (linha, pizza)
- [x] Criar componente de tabela de transações
- [ ] Criar componente de filtros avançados
- [x] Criar componente de cards de categorias

## Frontend - Páginas
- [x] Implementar página Dashboard
- [x] Implementar página de Transações
- [x] Implementar página de Categorias
- [ ] Implementar página de Metas
- [ ] Implementar página de Relatórios
- [x] Implementar modal de nova transação
- [x] Implementar modal de nova categoria
- [x] Implementar modal de criação de conta
- [x] Implementar seed automático de categorias padrão
- [x] Implementar modal de edição de transação
- [x] Implementar modal de edição de categoria

## Funcionalidades Avançadas
- [ ] Implementar filtros por período (hoje, últimos 7 dias, mês atual, personalizado)
- [ ] Implementar sistema de alertas (gastos acima da média, despesas pendentes)
- [ ] Implementar notificações de limite de categoria
- [ ] Implementar sistema de metas financeiras
- [ ] Implementar exportação de relatórios em PDF
- [ ] Implementar exportação de relatórios em Excel
- [ ] Implementar múltiplas contas por usuário
- [ ] Implementar sistema de subcategorias

## UX/UI
- [ ] Implementar animações e microinterações
- [ ] Implementar estados de loading e feedback visual
- [ ] Implementar tratamento de erros
- [ ] Implementar responsividade mobile
- [ ] Implementar acessibilidade (a11y)
- [ ] Implementar toggle de tema (dark/light mode)

## Segurança e Validação
- [ ] Implementar validação de dados com Zod
- [ ] Implementar prevenção de duplicidade de transações
- [ ] Implementar controle de acesso por conta
- [ ] Implementar logs de auditoria

## Novas Funcionalidades Solicitadas
- [x] Implementar modal completo de criação de transações
- [x] Implementar modal completo de criação de categorias
- [x] Implementar modal de edição de transações
- [x] Implementar modal de edição de categorias
- [x] Adicionar validações de formulário
- [x] Adicionar seletor de ícones para categorias
- [x] Adicionar seletor de cores para categorias

## Novas Funcionalidades - Tema e Perfil
- [x] Implementar alternância entre tema claro e escuro
- [x] Adicionar botão de troca de tema na sidebar
- [x] Criar página de Perfil do usuário
- [x] Implementar edição de informações do perfil
- [x] Criar página de Configurações
- [x] Implementar gerenciamento de múltiplos usuários por conta
- [x] Adicionar funcionalidade de convidar novos usuários
- [x] Implementar controle de permissões por usuário

## Novas Funcionalidades - Cartões, Agenda, Metas e Relatórios
- [x] Atualizar schema do banco de dados para cartões de crédito
- [x] Criar helpers de banco de dados para cartões
- [x] Implementar rotas tRPC para cartões de crédito
- [x] Criar página de Cartões de Crédito com listagem
- [x] Implementar modal de criação de cartão (nome, últimos 4 dígitos, bandeira, cor, limite, datas)
- [x] Adicionar demonstrativo de gastos por cartão
- [x] Integrar cartões no modal de transações
- [x] Remover funcionalidade de Transações Agendadas
- [x] Atualizar schema para agenda/pagamentos futuros
- [x] Criar página de Agenda com calendário
- [x] Implementar funcionalidades de marcar como pago/prioridade
- [x] Atualizar schema para metas financeiras
- [x] Criar página de Metas com tipos (gastos, receitas, reserva)
- [x] Implementar acompanhamento de progresso de metas
- [x] Criar página de Relatórios com filtros avançados
- [x] Implementar visualizações e gráficos de relatórios

## Nova Solicitação - Agenda com Calendário Visual
- [x] Reimplementar página de Agenda com calendário mensal visual
- [x] Criar componente de calendário com grid de dias
- [x] Exibir pagamentos agendados nos dias correspondentes
- [x] Adicionar navegação entre meses (anterior/próximo)
- [x] Implementar modal de adicionar compromisso ao clicar em um dia
- [x] Exibir indicadores visuais de contas/pagamentos em cada dia
- [x] Permitir visualizar detalhes ao clicar em um compromisso

## Bugs Reportados
- [x] Corrigir erro de Select.Item com valor vazio na página de Metas
- [x] Corrigir erro de Select.Item com valor vazio na página de Relatórios
