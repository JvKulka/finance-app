# Task 5: Atualizar sistema de autenticação para remover OAuth

**Status**: completed
**Prioridade**: high
**Dependências**: task3, task4

## Descrição
Remover toda a dependência do OAuth Manus do sistema. Isso inclui atualizar `createContext`, `authenticateRequest`, remover rotas OAuth e limpar código relacionado.

## Critérios de Aceitação
- [ ] Função `authenticateRequest` atualizada para não usar OAuth SDK
- [ ] Função usa apenas verificação de JWT local
- [ ] `createContext` atualizado para usar autenticação local
- [ ] Removida função `getOrCreateMockUser` (não é mais necessária)
- [ ] Rotas OAuth removidas de `server/_core/index.ts`
- [ ] `registerOAuthRoutes` removido ou comentado
- [ ] Imports do SDK OAuth removidos onde não são mais necessários
- [ ] Sistema funciona apenas com autenticação local

## Como Testar
1. Verificar que não há mais chamadas ao SDK OAuth
2. Verificar que `authenticateRequest` funciona apenas com JWT local
3. Verificar que rotas protegidas funcionam após login local
4. Verificar que não há erros relacionados a OAuth no console
5. Testar que sistema funciona sem variáveis de ambiente OAuth

## Notas
- Manter apenas a parte do SDK que gera/verifica JWT (não precisa do OAuth service)
- Pode simplificar o SDK removendo métodos OAuth não utilizados
- Manter estrutura de sessão JWT existente

