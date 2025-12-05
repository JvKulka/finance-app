# Task 17: Limpeza e remoção de código antigo

**Status**: pending
**Prioridade**: low
**Dependências**: task9, task10, task11, task12, task13, task14, task15, task16

## Descrição
Remover código antigo não utilizado (Express, Vite, Wouter, etc) após confirmação de que tudo está funcionando. Limpar dependências não utilizadas do `package.json`.

## Critérios de Aceitação
- [ ] Código Express removido (se não usado)
- [ ] Código Vite removido
- [ ] Wouter removido
- [ ] Dependências não utilizadas removidas do `package.json`
- [ ] Arquivos de configuração antigos removidos (vite.config.ts, etc)
- [ ] Documentação atualizada

## Como Testar
1. Verificar que build ainda funciona após limpeza
2. Verificar que não há imports quebrados
3. Verificar que todas as funcionalidades ainda funcionam

## Notas
- Fazer backup antes de remover
- Remover apenas após confirmação de que tudo funciona
- Manter histórico no git

