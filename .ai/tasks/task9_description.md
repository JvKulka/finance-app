# Task 9: Setup inicial do Next.js

**Status**: pending
**Prioridade**: high
**Dependências**: nenhuma

## Descrição
Configurar Next.js 14+ no projeto, instalando dependências necessárias e criando estrutura básica de pastas. Configurar TypeScript, Tailwind CSS e paths aliases compatíveis com a estrutura atual.

## Critérios de Aceitação
- [ ] Next.js 14+ instalado e configurado
- [ ] `next.config.js` criado com configurações apropriadas
- [ ] `tsconfig.json` atualizado para Next.js
- [ ] Tailwind CSS configurado e funcionando
- [ ] Paths aliases (`@/`) configurados
- [ ] Estrutura de pastas básica criada (`app/`, `components/`, `lib/`)
- [ ] Scripts do `package.json` atualizados (`dev`, `build`, `start`)

## Como Testar
1. Executar `npm run dev` e verificar que Next.js inicia sem erros
2. Acessar `http://localhost:3000` e verificar que a página carrega
3. Verificar que TypeScript compila sem erros
4. Verificar que Tailwind CSS está funcionando

## Notas
- Manter compatibilidade com React 19
- Usar App Router (não Pages Router)
- Configurar para suportar Server Components e Client Components

