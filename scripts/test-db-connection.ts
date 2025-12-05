/**
 * Script de teste para verificar conexão com Supabase
 * Execute com: npx tsx scripts/test-db-connection.ts
 */

import { supabaseServer } from '../lib/supabase/server';
import * as db from '../lib/server/db';

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  try {
    // Teste 1: Verificar se o cliente Supabase está configurado
    console.log('1. Verificando configuração do cliente Supabase...');
    if (!supabaseServer) {
      throw new Error('Cliente Supabase não está configurado');
    }
    console.log('   ✅ Cliente Supabase configurado\n');

    // Teste 2: Testar conexão básica
    console.log('2. Testando conexão básica...');
    const { data, error } = await supabaseServer.from('users').select('count').limit(1);
    if (error) {
      throw error;
    }
    console.log('   ✅ Conexão com banco de dados funcionando\n');

    // Teste 3: Verificar se as tabelas existem
    console.log('3. Verificando se as tabelas existem...');
    const tables = ['users', 'accounts', 'categories', 'transactions', 'credit_cards', 'scheduled_payments', 'goals', 'activity_logs'];
    
    for (const table of tables) {
      const { error: tableError } = await supabaseServer.from(table).select('*').limit(1);
      if (tableError) {
        console.log(`   ❌ Tabela "${table}" não encontrada: ${tableError.message}`);
      } else {
        console.log(`   ✅ Tabela "${table}" existe`);
      }
    }
    console.log('');

    // Teste 4: Testar criação de usuário
    console.log('4. Testando criação de usuário...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = await db.upsertUser({
      email: testEmail,
      name: 'Usuário de Teste',
      password: 'test123',
      loginMethod: 'email',
      role: 'user',
    });
    console.log(`   ✅ Usuário criado com ID: ${testUser.id}\n`);

    // Teste 5: Testar busca de usuário
    console.log('5. Testando busca de usuário...');
    const foundUser = await db.getUserByEmail(testEmail);
    if (!foundUser) {
      throw new Error('Usuário não foi encontrado após criação');
    }
    console.log(`   ✅ Usuário encontrado: ${foundUser.name} (${foundUser.email})\n`);

    // Teste 6: Testar criação de conta
    console.log('6. Testando criação de conta...');
    const testAccount = await db.createAccount({
      userId: testUser.id,
      name: 'Conta de Teste',
      type: 'personal',
    });
    console.log(`   ✅ Conta criada com ID: ${testAccount.id}\n`);

    // Teste 7: Testar busca de contas
    console.log('7. Testando busca de contas...');
    const accounts = await db.getAccountsByUserId(testUser.id);
    if (accounts.length === 0) {
      throw new Error('Nenhuma conta encontrada');
    }
    console.log(`   ✅ ${accounts.length} conta(s) encontrada(s)\n`);

    // Teste 8: Testar criação de categoria
    console.log('8. Testando criação de categoria...');
    const testCategory = await db.createCategory({
      accountId: testAccount.id,
      name: 'Categoria de Teste',
      type: 'expense',
      isDefault: false,
    });
    console.log(`   ✅ Categoria criada com ID: ${testCategory.id}\n`);

    // Teste 9: Limpeza (opcional - remover dados de teste)
    console.log('9. Limpando dados de teste...');
    await db.deleteCategory(testCategory.id);
    await db.deleteAccount(testAccount.id);
    // Nota: Não deletamos o usuário para manter histórico, mas você pode adicionar se quiser
    console.log('   ✅ Dados de teste removidos\n');

    console.log('🎉 Todos os testes passaram! O banco de dados está funcionando corretamente.\n');

  } catch (error: any) {
    console.error('❌ Erro durante os testes:\n');
    console.error('Mensagem:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

// Executar testes
testConnection();

