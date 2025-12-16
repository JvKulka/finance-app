-- Criar bucket de storage para anexos de transações
-- Execute este SQL no Supabase SQL Editor

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction-attachments', 'transaction-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remover políticas antigas se existirem (para evitar duplicatas)
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem ler" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar" ON storage.objects;

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

