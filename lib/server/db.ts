import { supabaseServer } from '../supabase/server';

// ============================================
// TIPOS
// ============================================

export type User = {
  id: number;
  openId: string | null;
  name: string | null;
  email: string | null;
  password: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

export type Account = {
  id: number;
  userId: number;
  name: string;
  type: "personal" | "business";
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: number;
  accountId: number;
  name: string;
  type: "income" | "expense";
  icon?: string | null;
  color?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Transaction = {
  id: number;
  userId: number;
  accountId: number;
  categoryId: number;
  creditCardId?: number | null;
  description: string;
  amount: number;
  type: "income" | "expense";
  transactionDate: Date;
  paymentMethod?: string | null;
  status: "paid" | "pending";
  expenseType?: "fixed" | "variable" | null;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreditCard = {
  id: number;
  accountId: number;
  name: string;
  lastFourDigits: string;
  brand: string;
  color: string;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduledPayment = {
  id: number;
  accountId: number;
  categoryId: number;
  creditCardId?: number | null;
  description: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  isRecurring: boolean;
  recurrenceFrequency?: "daily" | "weekly" | "monthly" | "yearly" | null;
  isPriority: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Goal = {
  id: number;
  accountId: number;
  categoryId?: number | null;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date | null;
  type: "savings" | "spending_limit" | "income" | "emergency_fund";
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
};

export type ActivityLog = {
  id: number;
  userId: number;
  action: string;
  details?: string | null;
  createdAt: Date;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    openId: row.open_id,
    name: row.name,
    email: row.email,
    password: row.password,
    loginMethod: row.login_method,
    role: row.role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    lastSignedIn: new Date(row.last_signed_in),
  };
}

function mapAccountFromDb(row: any): Account {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapCategoryFromDb(row: any): Category {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapTransactionFromDb(row: any): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    categoryId: row.category_id,
    creditCardId: row.credit_card_id,
    description: row.description,
    amount: row.amount,
    type: row.type,
    transactionDate: new Date(row.transaction_date),
    paymentMethod: row.payment_method,
    status: row.status,
    expenseType: row.expense_type,
    isRecurring: row.is_recurring,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapCreditCardFromDb(row: any): CreditCard {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    lastFourDigits: row.last_four_digits,
    brand: row.brand,
    color: row.color,
    creditLimit: row.credit_limit,
    closingDay: row.closing_day,
    dueDay: row.due_day,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapScheduledPaymentFromDb(row: any): ScheduledPayment {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id,
    creditCardId: row.credit_card_id,
    description: row.description,
    amount: row.amount,
    dueDate: new Date(row.due_date),
    isPaid: row.is_paid,
    isRecurring: row.is_recurring,
    recurrenceFrequency: row.recurrence_frequency,
    isPriority: row.is_priority,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapGoalFromDb(row: any): Goal {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id,
    name: row.name,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    deadline: row.deadline ? new Date(row.deadline) : null,
    type: row.type,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapActivityLogFromDb(row: any): ActivityLog {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    details: row.details,
    createdAt: new Date(row.created_at),
  };
}

// ============================================
// USER FUNCTIONS
// ============================================

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;
  return mapUserFromDb(data);
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('open_id', openId)
    .single();

  if (error || !data) return null;
  return mapUserFromDb(data);
}

export async function upsertUser(data: Partial<User>): Promise<User> {
  const insertData: any = {};
  
  if (data.openId !== undefined) insertData.open_id = data.openId;
  if (data.name !== undefined) insertData.name = data.name;
  if (data.email !== undefined) insertData.email = data.email;
  if (data.password !== undefined) insertData.password = data.password;
  if (data.loginMethod !== undefined) insertData.login_method = data.loginMethod;
  if (data.role !== undefined) insertData.role = data.role;
  if (data.lastSignedIn !== undefined) insertData.last_signed_in = data.lastSignedIn.toISOString();

  let query = supabaseServer.from('users');

  if (data.openId) {
    // Upsert by open_id
    const { data: result, error } = await query
      .upsert(insertData, { onConflict: 'open_id' })
      .select()
      .single();
    
    if (error) throw error;
    return mapUserFromDb(result);
  } else if (data.email) {
    // Upsert by email
    const { data: result, error } = await query
      .upsert(insertData, { onConflict: 'email' })
      .select()
      .single();
    
    if (error) throw error;
    return mapUserFromDb(result);
  } else {
    // Insert new
    const { data: result, error } = await query
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    return mapUserFromDb(result);
  }
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapUserFromDb);
}

export async function deleteUser(userId: number): Promise<void> {
  const { error } = await supabaseServer
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}

// ============================================
// ACCOUNT FUNCTIONS
// ============================================

export async function getAccountsByUserId(userId: number): Promise<Account[]> {
  const { data, error } = await supabaseServer
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapAccountFromDb);
}

export async function getAccountById(id: number): Promise<Account | null> {
  const { data, error } = await supabaseServer
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapAccountFromDb(data);
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account> {
  const { data: result, error } = await supabaseServer
    .from('accounts')
    .insert({
      user_id: data.userId,
      name: data.name,
      type: data.type,
    })
    .select()
    .single();

  if (error) throw error;
  return mapAccountFromDb(result);
}

export async function updateAccount(id: number, data: Partial<Account>): Promise<void> {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;

  const { error } = await supabaseServer
    .from('accounts')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAccount(id: number): Promise<void> {
  const { error } = await supabaseServer
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

export async function getCategoriesByAccountId(accountId: number): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from('categories')
    .select('*')
    .eq('account_id', accountId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapCategoryFromDb);
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const { data, error } = await supabaseServer
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapCategoryFromDb(data);
}

export async function createCategory(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
  const { data: result, error } = await supabaseServer
    .from('categories')
    .insert({
      account_id: data.accountId,
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
      is_default: data.isDefault ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCategoryFromDb(result);
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<void> {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.color !== undefined) updateData.color = data.color;

  const { error } = await supabaseServer
    .from('categories')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabaseServer
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

export async function getTransactionsByAccountId(
  accountId: number,
  filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    type?: "income" | "expense";
    status?: "paid" | "pending";
    paymentMethod?: string;
  }
): Promise<Transaction[]> {
  let query = supabaseServer
    .from('transactions')
    .select('*')
    .eq('account_id', accountId);

  if (filters?.startDate) {
    query = query.gte('transaction_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('transaction_date', filters.endDate);
  }
  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.paymentMethod) {
    query = query.eq('payment_method', filters.paymentMethod);
  }

  query = query.order('transaction_date', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return (data || []).map(mapTransactionFromDb);
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const { data, error } = await supabaseServer
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapTransactionFromDb(data);
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> {
  const { data: result, error } = await supabaseServer
    .from('transactions')
    .insert({
      user_id: data.userId,
      account_id: data.accountId,
      category_id: data.categoryId,
      credit_card_id: data.creditCardId,
      description: data.description,
      amount: data.amount,
      type: data.type,
      transaction_date: data.transactionDate.toISOString().split('T')[0],
      payment_method: data.paymentMethod,
      status: data.status,
      expense_type: data.expenseType,
      is_recurring: data.isRecurring,
    })
    .select()
    .single();

  if (error) throw error;
  return mapTransactionFromDb(result);
}

export async function updateTransaction(id: number, data: Partial<Transaction>): Promise<void> {
  const updateData: any = {};
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
  if (data.creditCardId !== undefined) updateData.credit_card_id = data.creditCardId;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.transactionDate !== undefined) updateData.transaction_date = data.transactionDate.toISOString().split('T')[0];
  if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.expenseType !== undefined) updateData.expense_type = data.expenseType;

  const { error } = await supabaseServer
    .from('transactions')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteTransaction(id: number): Promise<void> {
  const { error } = await supabaseServer
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

export async function getDashboardSummary(accountId: number, startDate: string, endDate: string): Promise<any> {
  const { data, error } = await supabaseServer
    .from('transactions')
    .select('type, amount')
    .eq('account_id', accountId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .eq('status', 'paid');

  if (error) throw error;

  const income = (data || [])
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = (data || [])
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export async function getExpensesByCategory(accountId: number, startDate: string, endDate: string): Promise<any> {
  const { data, error } = await supabaseServer
    .from('transactions')
    .select('category_id, amount, categories(name, color)')
    .eq('account_id', accountId)
    .eq('type', 'expense')
    .eq('status', 'paid')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (error) throw error;

  const grouped = (data || []).reduce((acc: any, t: any) => {
    const catId = t.category_id;
    if (!acc[catId]) {
      acc[catId] = {
        categoryId: catId,
        categoryName: t.categories?.name || 'Sem categoria',
        categoryColor: t.categories?.color || '#888888',
        total: 0,
      };
    }
    acc[catId].total += t.amount;
    return acc;
  }, {});

  return Object.values(grouped);
}

// ============================================
// CREDIT CARD FUNCTIONS
// ============================================

export async function getCreditCardsByAccountId(accountId: number): Promise<CreditCard[]> {
  const { data, error } = await supabaseServer
    .from('credit_cards')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapCreditCardFromDb);
}

export async function createCreditCard(data: Omit<CreditCard, "id" | "createdAt" | "updatedAt">): Promise<CreditCard> {
  const { data: result, error } = await supabaseServer
    .from('credit_cards')
    .insert({
      account_id: data.accountId,
      name: data.name,
      last_four_digits: data.lastFourDigits,
      brand: data.brand,
      color: data.color,
      credit_limit: data.creditLimit,
      closing_day: data.closingDay,
      due_day: data.dueDay,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCreditCardFromDb(result);
}

export async function updateCreditCard(id: number, data: Partial<CreditCard>): Promise<void> {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.lastFourDigits !== undefined) updateData.last_four_digits = data.lastFourDigits;
  if (data.brand !== undefined) updateData.brand = data.brand;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.creditLimit !== undefined) updateData.credit_limit = data.creditLimit;
  if (data.closingDay !== undefined) updateData.closing_day = data.closingDay;
  if (data.dueDay !== undefined) updateData.due_day = data.dueDay;

  const { error } = await supabaseServer
    .from('credit_cards')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCreditCard(id: number): Promise<void> {
  const { error } = await supabaseServer
    .from('credit_cards')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getCreditCardExpenses(cardId: number, startDate: string, endDate: string): Promise<any> {
  const { data, error } = await supabaseServer
    .from('transactions')
    .select('*')
    .eq('credit_card_id', cardId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapTransactionFromDb);
}

// ============================================
// SCHEDULED PAYMENT FUNCTIONS
// ============================================

export async function getScheduledPaymentsByAccountId(accountId: number): Promise<ScheduledPayment[]> {
  const { data, error } = await supabaseServer
    .from('scheduled_payments')
    .select('*')
    .eq('account_id', accountId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapScheduledPaymentFromDb);
}

export async function createScheduledPayment(data: Omit<ScheduledPayment, "id" | "createdAt" | "updatedAt">): Promise<ScheduledPayment> {
  const { data: result, error } = await supabaseServer
    .from('scheduled_payments')
    .insert({
      account_id: data.accountId,
      category_id: data.categoryId,
      credit_card_id: data.creditCardId,
      description: data.description,
      amount: data.amount,
      due_date: data.dueDate.toISOString().split('T')[0],
      is_paid: data.isPaid,
      is_recurring: data.isRecurring,
      recurrence_frequency: data.recurrenceFrequency,
      is_priority: data.isPriority,
    })
    .select()
    .single();

  if (error) throw error;
  return mapScheduledPaymentFromDb(result);
}

export async function updateScheduledPayment(id: number, data: Partial<ScheduledPayment>): Promise<void> {
  const updateData: any = {};
  if (data.description !== undefined) updateData.description = data.description;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate.toISOString().split('T')[0];
  if (data.isPriority !== undefined) updateData.is_priority = data.isPriority;

  const { error } = await supabaseServer
    .from('scheduled_payments')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

export async function markScheduledPaymentAsPaid(id: number): Promise<void> {
  const { error } = await supabaseServer
    .from('scheduled_payments')
    .update({ is_paid: true })
    .eq('id', id);

  if (error) throw error;
}

export async function toggleScheduledPaymentPriority(id: number, isPriority: boolean): Promise<void> {
  const { error } = await supabaseServer
    .from('scheduled_payments')
    .update({ is_priority: isPriority })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteScheduledPayment(id: number): Promise<void> {
  const { error } = await supabaseServer
    .from('scheduled_payments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// GOAL FUNCTIONS
// ============================================

export async function getGoalsByAccountId(accountId: number): Promise<Goal[]> {
  const { data, error } = await supabaseServer
    .from('goals')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapGoalFromDb);
}

export async function createGoal(data: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal> {
  const { data: result, error } = await supabaseServer
    .from('goals')
    .insert({
      account_id: data.accountId,
      category_id: data.categoryId,
      name: data.name,
      target_amount: data.targetAmount,
      current_amount: data.currentAmount ?? 0,
      deadline: data.deadline ? data.deadline.toISOString().split('T')[0] : null,
      type: data.type,
      status: data.status ?? 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return mapGoalFromDb(result);
}

export async function updateGoal(id: number, data: Partial<Goal>): Promise<void> {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.targetAmount !== undefined) updateData.target_amount = data.targetAmount;
  if (data.currentAmount !== undefined) updateData.current_amount = data.currentAmount;
  if (data.deadline !== undefined) updateData.deadline = data.deadline ? data.deadline.toISOString().split('T')[0] : null;
  if (data.status !== undefined) updateData.status = data.status;

  const { error } = await supabaseServer
    .from('goals')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteGoal(id: number): Promise<void> {
  const { error } = await supabaseServer
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// ACTIVITY LOG FUNCTIONS
// ============================================

export async function createActivityLog(data: Omit<ActivityLog, "id" | "createdAt">): Promise<ActivityLog> {
  const { data: result, error } = await supabaseServer
    .from('activity_logs')
    .insert({
      user_id: data.userId,
      action: data.action,
      details: data.details,
    })
    .select()
    .single();

  if (error) throw error;
  return mapActivityLogFromDb(result);
}
