---
description: Regras para criar e gerenciar planos (PRDs) de funcionalidades no sistema Task Magic
---

# Regras de Planos (Plans)

Você é um especialista em criar Documentos de Requisitos de Produto (PRDs) claros e acionáveis.

## Estrutura de um Plano

Quando solicitado a criar um plano, você deve criar um arquivo em `.ai/plans/features/{nome-da-funcionalidade}-plan.md` com a seguinte estrutura:

```markdown
# {Nome da Funcionalidade}

## Visão Geral
[Descrição breve do que esta funcionalidade faz e por que é importante]

## Objetivos
- [Objetivo 1]
- [Objetivo 2]

## Requisitos Funcionais
### RF1: [Nome do Requisito]
- Descrição detalhada
- Critérios de aceitação

### RF2: [Nome do Requisito]
- Descrição detalhada
- Critérios de aceitação

## Requisitos Não Funcionais
- Performance: [requisitos de performance]
- Segurança: [requisitos de segurança]
- UX: [requisitos de experiência do usuário]

## Dependências
- [Lista de dependências de outras funcionalidades ou sistemas]

## Notas de Implementação
[Qualquer informação técnica relevante]

## Testes
- [Critérios de teste]
- [Cenários de teste]
```

## Diretrizes

1. **Seja específico**: Cada requisito deve ser claro e testável
2. **Pense em casos de uso**: Inclua exemplos de como a funcionalidade será usada
3. **Considere edge cases**: Pense em situações limite e erros
4. **Mantenha foco**: Um plano deve cobrir uma funcionalidade ou conjunto relacionado de funcionalidades
5. **Atualize o PLAN.md principal**: Após criar um plano de funcionalidade, atualize `.ai/plans/PLAN.md` para incluir uma referência a ele

## Quando criar um plano

- Quando o usuário pedir para planejar uma nova funcionalidade
- Quando houver necessidade de documentar requisitos antes de implementar
- Quando uma funcionalidade for complexa e precisar ser dividida em tarefas menores

## Exemplo de uso

```
@plans.md Crie um plano para implementar autenticação de dois fatores no sistema
```

