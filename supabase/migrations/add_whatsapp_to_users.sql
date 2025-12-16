-- Adicionar coluna whatsapp na tabela users
-- Execute este SQL no Supabase SQL Editor se a tabela já existir

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

