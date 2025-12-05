# Solução para Loop de Recarregamento

## Problema Identificado

O erro mostra:
- `[Auth] Session payload missing required fields` - O JWT não tem os campos necessários
- `tRPC failed on accounts.list: Please login (10001)` - Erro de autenticação
- Loop de recarregamento infinito

## Causa Raiz

1. **JWT com campos faltando**: O `appId` pode estar vazio se `VITE_APP_ID` não estiver configurado
2. **Loop de redirecionamento**: O `FinanceLayout` estava redirecionando, mas o middleware também, causando loop
3. **Cookie não sendo lido**: O cookie pode não estar sendo enviado corretamente

## Correções Aplicadas

### 1. JWT com appId Fallback
- Adicionado fallback para `appId` se não estiver configurado
- Validação mais flexível do payload do JWT

### 2. Removido Loop de Redirecionamento
- Removido `useEffect` de redirecionamento do `FinanceLayout`
- O middleware já cuida do redirecionamento

### 3. Validação de JWT_SECRET
- Adicionada validação para garantir que `JWT_SECRET` está configurado

## Próximos Passos

1. **Verificar variáveis de ambiente**:
   ```env
   JWT_SECRET=[DEVE ESTAR CONFIGURADO]
   NEXT_PUBLIC_SUPABASE_URL=[SUA_URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_KEY]
   SUPABASE_SERVICE_ROLE_KEY=[SUA_KEY]
   ```

2. **Limpar cookies antigos**:
   - Abra DevTools > Application > Cookies
   - Delete o cookie `app_session_id`
   - Recarregue a página

3. **Fazer login novamente**:
   - Após limpar cookies, faça login novamente
   - O novo JWT será criado com os campos corretos

4. **Verificar no console**:
   - Não deve mais aparecer `Session payload missing required fields`
   - As requisições devem funcionar

## Se o Problema Persistir

1. Verifique se `JWT_SECRET` está no `.env`
2. Verifique se o cookie está sendo definido (DevTools > Application > Cookies)
3. Verifique se o cookie está sendo enviado nas requisições (Network > Headers > Cookie)
4. Limpe o cache do navegador e cookies
5. Reinicie o servidor de desenvolvimento

