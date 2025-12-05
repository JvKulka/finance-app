# Task 16: Configurar deploy Vercel e variáveis de ambiente

**Status**: pending
**Prioridade**: high
**Dependências**: task9, task11

## Descrição
Configurar projeto para deploy na Vercel, incluindo `vercel.json`, variáveis de ambiente e configurações de build. Garantir que Supabase connection pooling funcione na Vercel.

## Critérios de Aceitação
- [ ] `vercel.json` configurado (se necessário)
- [ ] Variáveis de ambiente documentadas para Vercel
- [ ] Build de produção funcionando (`npm run build`)
- [ ] Configuração de Supabase com connection pooling
- [ ] Documentação de deploy criada
- [ ] Teste de build local passando

## Como Testar
1. Executar `npm run build` e verificar que compila sem erros
2. Testar build localmente
3. Verificar que todas as variáveis de ambiente estão documentadas
4. Preparar para deploy na Vercel

## Notas
- Vercel suporta Next.js nativamente
- Configurar `DATABASE_URL` com connection pooling na Vercel
- Documentar todas as variáveis necessárias

