# Configuração do Supabase Storage - Anexos de Transações

Este guia explica como configurar o bucket `transaction-attachments` no Supabase Storage para armazenar anexos de transações.

## 📋 Método 1: Via SQL Editor (Recomendado)

### Passo 1: Executar o Script SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `supabase/migrations/create_storage_bucket.sql`
4. Clique em **Run** (ou pressione Ctrl+Enter)

O script irá:
- ✅ Criar o bucket `transaction-attachments` como público
- ✅ Configurar políticas de acesso para usuários autenticados
- ✅ Permitir upload, leitura e exclusão de arquivos

### Passo 2: Verificar o Bucket

1. Vá em **Storage** no menu lateral do Supabase
2. Você deve ver o bucket `transaction-attachments` listado
3. Clique no bucket para verificar as configurações

## 📋 Método 2: Via Interface do Supabase

### Passo 1: Criar o Bucket

1. No painel do Supabase, vá em **Storage** (no menu lateral)
2. Clique em **New bucket**
3. Preencha:
   - **Name**: `transaction-attachments`
   - **Public bucket**: ✅ Marque esta opção (torna o bucket público)
4. Clique em **Create bucket**

### Passo 2: Configurar Políticas de Acesso

1. Com o bucket criado, clique em **Policies** (ou vá em **SQL Editor**)
2. Execute o seguinte SQL para criar as políticas:

```sql
-- Política de acesso: usuários autenticados podem fazer upload
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'transaction-attachments');

-- Política de acesso: usuários autenticados podem ler
CREATE POLICY "Usuários autenticados podem ler"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'transaction-attachments');

-- Política de acesso: usuários autenticados podem deletar
CREATE POLICY "Usuários autenticados podem deletar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'transaction-attachments');
```

## 🔒 Configurações de Segurança

### Opção 1: Bucket Público (Recomendado para desenvolvimento)

- ✅ Arquivos acessíveis via URL pública
- ✅ Mais simples de configurar
- ⚠️ Qualquer pessoa com a URL pode acessar o arquivo

### Opção 2: Bucket Privado (Recomendado para produção)

Se preferir um bucket privado, ajuste as políticas:

```sql
-- Atualizar bucket para privado
UPDATE storage.buckets 
SET public = false 
WHERE id = 'transaction-attachments';

-- Política para leitura com autenticação
CREATE POLICY "Usuários autenticados podem ler seus arquivos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transaction-attachments' AND
  -- Adicione validação adicional aqui se necessário
  true
);
```

## ✅ Verificação

Após configurar, teste o upload:

1. Execute o projeto: `npm run dev`
2. Crie uma nova transação
3. Tente fazer upload de um arquivo
4. Verifique se o arquivo aparece no bucket `transaction-attachments` no Supabase Storage

## 🛠️ Troubleshooting

### Erro: "Bucket não encontrado"

- Verifique se o bucket foi criado corretamente
- Confirme que o nome está exatamente como `transaction-attachments`

### Erro: "Acesso negado"

- Verifique se as políticas RLS estão configuradas
- Confirme que o bucket está marcado como público (se necessário)
- Verifique se o usuário está autenticado

### Arquivos não aparecem

- Verifique os logs do servidor
- Confirme que o upload está sendo feito para o bucket correto
- Verifique as permissões do bucket

## 📝 Notas Importantes

1. **Tamanho máximo**: O Supabase Storage tem limite de 50GB por projeto (plano gratuito)
2. **Tamanho por arquivo**: Configurei limite de 10MB por arquivo no código
3. **Backup**: Considere fazer backup regular dos arquivos importantes
4. **Custos**: Arquivos grandes podem gerar custos adicionais em planos pagos

