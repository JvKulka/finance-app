-- Script de migração para adicionar colunas faltantes na tabela users
-- Execute este SQL no Supabase SQL Editor ANTES de executar o schema.sql completo

-- Adicionar coluna open_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'open_id'
  ) THEN
    ALTER TABLE users ADD COLUMN open_id VARCHAR(64) UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_users_open_id ON users(open_id);
  END IF;
END $$;

-- Adicionar coluna whatsapp se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp VARCHAR(20);
  END IF;
END $$;

