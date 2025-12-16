-- Schema do Banco de Dados - Sistema de Controle Financeiro
-- Execute este SQL no Supabase SQL Editor

-- ============================================
-- EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
-- Remove tipos existentes se necessário (descomente se precisar recriar)
-- DROP TYPE IF EXISTS user_role CASCADE;
-- DROP TYPE IF EXISTS account_type CASCADE;
-- DROP TYPE IF EXISTS category_type CASCADE;
-- DROP TYPE IF EXISTS transaction_type CASCADE;
-- DROP TYPE IF EXISTS transaction_status CASCADE;
-- DROP TYPE IF EXISTS expense_type CASCADE;
-- DROP TYPE IF EXISTS frequency CASCADE;
-- DROP TYPE IF EXISTS goal_type CASCADE;
-- DROP TYPE IF EXISTS goal_status CASCADE;

-- Cria tipos apenas se não existirem
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE account_type AS ENUM ('personal', 'business');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE category_type AS ENUM ('income', 'expense');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('paid', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_type AS ENUM ('fixed', 'variable');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_type AS ENUM ('savings', 'spending_limit', 'income', 'emergency_fund');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) UNIQUE,
  name TEXT,
  email VARCHAR(320) UNIQUE,
  password VARCHAR(255),
  login_method VARCHAR(64),
  whatsapp VARCHAR(20),
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_signed_in TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Adicionar colunas se a tabela já existir
DO $$ 
BEGIN
  -- Adicionar open_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'open_id'
  ) THEN
    ALTER TABLE users ADD COLUMN open_id VARCHAR(64) UNIQUE;
  END IF;
  
  -- Adicionar whatsapp se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp VARCHAR(20);
  END IF;
END $$;

-- Adicionar colunas se a tabela já existir
DO $$ 
BEGIN
  -- Adicionar open_id se não existir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'open_id'
    ) THEN
      ALTER TABLE users ADD COLUMN open_id VARCHAR(64) UNIQUE;
    END IF;
    
    -- Adicionar whatsapp se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'whatsapp'
    ) THEN
      ALTER TABLE users ADD COLUMN whatsapp VARCHAR(20);
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users(open_id);

-- ============================================
-- TABELA: accounts
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type account_type DEFAULT 'personal' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- ============================================
-- TABELA: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type category_type NOT NULL,
  icon VARCHAR(100),
  color VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_account_id ON categories(account_id);

-- ============================================
-- TABELA: credit_cards
-- ============================================
CREATE TABLE IF NOT EXISTS credit_cards (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  last_four_digits VARCHAR(4) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  credit_limit INTEGER NOT NULL,
  closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_credit_cards_account_id ON credit_cards(account_id);

-- ============================================
-- TABELA: transactions
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  credit_card_id INTEGER REFERENCES credit_cards(id) ON DELETE SET NULL,
  description VARCHAR(500) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  type transaction_type NOT NULL,
  transaction_date DATE NOT NULL,
  payment_method VARCHAR(100),
  status transaction_status DEFAULT 'paid' NOT NULL,
  expense_type expense_type,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================
-- TABELA: transaction_attachments
-- ============================================
CREATE TABLE IF NOT EXISTS transaction_attachments (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transaction_attachments_transaction_id ON transaction_attachments(transaction_id);

-- ============================================
-- TABELA: scheduled_payments
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_payments (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  credit_card_id INTEGER REFERENCES credit_cards(id) ON DELETE SET NULL,
  description VARCHAR(500) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency frequency,
  is_priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduled_payments_account_id ON scheduled_payments(account_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_payments_due_date ON scheduled_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_payments_is_paid ON scheduled_payments(is_paid);

-- ============================================
-- TABELA: goals
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  target_amount INTEGER NOT NULL CHECK (target_amount > 0),
  current_amount INTEGER DEFAULT 0,
  deadline DATE,
  type goal_type NOT NULL,
  status goal_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_account_id ON goals(account_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);

-- ============================================
-- TABELA: activity_logs
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================
-- FUNÇÕES DE TRIGGER PARA updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON credit_cards;
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_payments_updated_at ON scheduled_payments;
CREATE TRIGGER update_scheduled_payments_updated_at BEFORE UPDATE ON scheduled_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (serão ajustadas conforme necessário)
-- Por enquanto, permitir tudo para autenticados (será ajustado depois)
-- NOTA: Como estamos usando autenticação customizada, as políticas RLS
-- precisarão ser ajustadas para funcionar com nosso sistema de autenticação

-- Política para users: usuários podem ver e editar apenas seus próprios dados
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR true); -- Temporário: permitir tudo

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR true); -- Temporário: permitir tudo

-- Política para accounts: usuários podem ver e editar apenas suas próprias contas
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (true); -- Temporário: permitir tudo

DROP POLICY IF EXISTS "Users can manage own accounts" ON accounts;
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (true); -- Temporário: permitir tudo

-- Políticas similares para outras tabelas (temporariamente permitindo tudo)
-- NOTA: Essas políticas precisarão ser ajustadas quando implementarmos
-- a autenticação adequada com Supabase Auth ou nosso sistema customizado

DROP POLICY IF EXISTS "Allow all on categories" ON categories;
CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on credit_cards" ON credit_cards;
CREATE POLICY "Allow all on credit_cards" ON credit_cards FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on transactions" ON transactions;
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on scheduled_payments" ON scheduled_payments;
CREATE POLICY "Allow all on scheduled_payments" ON scheduled_payments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on goals" ON goals;
CREATE POLICY "Allow all on goals" ON goals FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on activity_logs" ON activity_logs;
CREATE POLICY "Allow all on activity_logs" ON activity_logs FOR ALL USING (true);

