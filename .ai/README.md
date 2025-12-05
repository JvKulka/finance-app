# Task Magic - Sistema de Gerenciamento de Tarefas

Este diretório contém o sistema Task Magic para gerenciamento de tarefas baseado em arquivos.

## Estrutura

```
.ai/
├── plans/           # Planos e PRDs do projeto
│   ├── PLAN.md      # Plano principal do projeto
│   └── features/     # Planos detalhados de funcionalidades
├── tasks/           # Tarefas individuais
│   └── task{id}_description.md
├── TASKS.md         # Checklist principal (mantido sincronizado)
└── memory/          # Histórico arquivado
    ├── tasks/       # Tarefas arquivadas
    ├── plans/       # Planos arquivados
    ├── TASKS_LOG.md
    └── PLANS_LOG.md
```

## Como Usar

### Criar um Plano

Use o comando com @-tag no Cursor/Windsurf:

```
@.cursor/rules/.task-magic/plans.mdc Crie um plano para implementar exportação de relatórios em PDF
```

### Criar Tarefas

```
@.cursor/rules/.task-magic/tasks.mdc Gere tarefas a partir do plano em .ai/plans/features/export-pdf-plan.md
```

### Ver Status

Consulte `.ai/TASKS.md` para ver o status de todas as tarefas.

### Trabalhar em uma Tarefa

1. Abra o arquivo da tarefa em `.ai/tasks/task{id}_description.md`
2. Atualize o status para "inprogress"
3. Atualize também `.ai/TASKS.md`
4. Trabalhe na tarefa
5. Ao concluir, atualize o status para "completed" e mova para `.ai/memory/tasks/`

## Benefícios

- ✅ Contexto permanente para agentes de IA
- ✅ Histórico completo do que foi feito
- ✅ Tarefas pequenas e focadas evitam "AI loop of death"
- ✅ Fácil de versionar e rastrear mudanças
- ✅ Estruturado mas flexível

## Mais Informações

Consulte o repositório original: https://github.com/iannuttall/task-magic

