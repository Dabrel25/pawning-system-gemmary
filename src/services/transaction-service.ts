import { supabase } from '@/lib/supabase';
import type { FactTransaction, CreateTransactionInput, DimTransactionType } from '@/types';

// Database row type
export interface TransactionRow {
  transaction_key: number;
  transaction_id: string;
  date_key: number;
  customer_key: number;
  loan_key?: number;
  item_key?: number;
  branch_key: number;
  employee_key?: number;
  type_key: number;
  principal: number;
  interest: number;
  service_fee: number;
  penalty: number;
  discount: number;
  other_charges: number;
  total_amount: number;
  net_cash_flow: number;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  created_by?: number;
  // Joined data
  transaction_type?: {
    type_key: number;
    type_code: string;
    type_name: string;
    cash_flow_direction: string;
  };
  customer?: {
    customer_key: number;
    customer_id: string;
    full_name: string;
  };
  loan?: {
    loan_key: number;
    loan_id: string;
  };
}

// Transaction type codes
export const TRANSACTION_TYPES = {
  NEW_LOAN: 'NEW_LOAN',
  REDEMPTION: 'REDEMPTION',
  RENEWAL: 'RENEWAL',
  PARTIAL_PAYMENT: 'PARTIAL_PAYMENT',
  INTEREST_PAYMENT: 'INTEREST_PAYMENT',
  PENALTY_PAYMENT: 'PENALTY_PAYMENT',
  FEE_COLLECTION: 'FEE_COLLECTION',
  FORFEITURE: 'FORFEITURE',
  AUCTION_SALE: 'AUCTION_SALE',
  JEWELRY_SALE: 'JEWELRY_SALE',
  PRENDA_PALIT: 'PRENDA_PALIT',
  PALIT_PRENDA: 'PALIT_PRENDA',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;

/**
 * Get transaction type by code
 */
export async function getTransactionTypeByCode(
  typeCode: string
): Promise<DimTransactionType | null> {
  const { data, error } = await supabase
    .from('dim_transaction_type')
    .select('*')
    .eq('type_code', typeCode)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching transaction type:', error);
    return null;
  }

  return data;
}

/**
 * Get all active transaction types
 */
export async function getTransactionTypes(): Promise<DimTransactionType[]> {
  const { data, error } = await supabase
    .from('dim_transaction_type')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching transaction types:', error);
    return [];
  }

  return data || [];
}

/**
 * Generate a transaction ID
 */
async function generateTransactionId(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_transaction_id');

  if (error) {
    // Fallback to manual generation
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const { count } = await supabase
      .from('fact_transactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().slice(0, 10));

    const seq = (count || 0) + 1;
    return `TRX-${dateStr}-${seq.toString().padStart(4, '0')}`;
  }

  return data;
}

/**
 * Get current date_key (YYYYMMDD format)
 */
function getCurrentDateKey(): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`, 10);
}

/**
 * Create a new transaction in fact_transactions
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<TransactionRow> {
  const transactionId = await generateTransactionId();
  const dateKey = getCurrentDateKey();

  const insertData = {
    transaction_id: transactionId,
    date_key: dateKey,
    customer_key: input.customer_key,
    loan_key: input.loan_key,
    item_key: input.item_key,
    branch_key: input.branch_key,
    employee_key: input.employee_key,
    type_key: input.type_key,
    principal: input.principal || 0,
    interest: input.interest || 0,
    service_fee: input.service_fee || 0,
    penalty: input.penalty || 0,
    discount: input.discount || 0,
    other_charges: input.other_charges || 0,
    total_amount: input.total_amount,
    net_cash_flow: input.net_cash_flow,
    payment_method: input.payment_method,
    reference_number: input.reference_number,
    notes: input.notes,
    created_by: input.employee_key,
  };

  const { data, error } = await supabase
    .from('fact_transactions')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data;
}

/**
 * Create a NEW_LOAN transaction
 */
export async function createNewLoanTransaction(params: {
  customerKey: number;
  loanKey: number;
  itemKey: number;
  branchKey: number;
  employeeKey?: number;
  principal: number;
  serviceFee: number;
  paymentMethod?: string;
  notes?: string;
}): Promise<TransactionRow> {
  const transactionType = await getTransactionTypeByCode(TRANSACTION_TYPES.NEW_LOAN);
  if (!transactionType) {
    throw new Error('Transaction type NEW_LOAN not found');
  }

  // For NEW_LOAN, cash flows OUT (negative)
  const totalAmount = params.principal + params.serviceFee;
  const netCashFlow = -params.principal; // Money goes out

  return createTransaction({
    customer_key: params.customerKey,
    loan_key: params.loanKey,
    item_key: params.itemKey,
    branch_key: params.branchKey,
    employee_key: params.employeeKey,
    type_key: transactionType.type_key,
    principal: params.principal,
    service_fee: params.serviceFee,
    total_amount: totalAmount,
    net_cash_flow: netCashFlow,
    payment_method: params.paymentMethod || 'cash',
    notes: params.notes,
  });
}

/**
 * Create a REDEMPTION transaction
 */
export async function createRedemptionTransaction(params: {
  customerKey: number;
  loanKey: number;
  itemKey: number;
  branchKey: number;
  employeeKey?: number;
  principal: number;
  interest: number;
  penalty?: number;
  discount?: number;
  paymentMethod?: string;
  notes?: string;
}): Promise<TransactionRow> {
  const transactionType = await getTransactionTypeByCode(TRANSACTION_TYPES.REDEMPTION);
  if (!transactionType) {
    throw new Error('Transaction type REDEMPTION not found');
  }

  // For REDEMPTION, cash flows IN (positive)
  const totalAmount = params.principal + params.interest + (params.penalty || 0) - (params.discount || 0);
  const netCashFlow = totalAmount; // Money comes in

  return createTransaction({
    customer_key: params.customerKey,
    loan_key: params.loanKey,
    item_key: params.itemKey,
    branch_key: params.branchKey,
    employee_key: params.employeeKey,
    type_key: transactionType.type_key,
    principal: params.principal,
    interest: params.interest,
    penalty: params.penalty,
    discount: params.discount,
    total_amount: totalAmount,
    net_cash_flow: netCashFlow,
    payment_method: params.paymentMethod || 'cash',
    notes: params.notes,
  });
}

/**
 * Create a RENEWAL transaction
 */
export async function createRenewalTransaction(params: {
  customerKey: number;
  loanKey: number;
  itemKey: number;
  branchKey: number;
  employeeKey?: number;
  interestPaid: number;
  penalty?: number;
  paymentMethod?: string;
  notes?: string;
}): Promise<TransactionRow> {
  const transactionType = await getTransactionTypeByCode(TRANSACTION_TYPES.RENEWAL);
  if (!transactionType) {
    throw new Error('Transaction type RENEWAL not found');
  }

  // For RENEWAL, interest payment flows IN (positive)
  const totalAmount = params.interestPaid + (params.penalty || 0);
  const netCashFlow = totalAmount; // Interest money comes in

  return createTransaction({
    customer_key: params.customerKey,
    loan_key: params.loanKey,
    item_key: params.itemKey,
    branch_key: params.branchKey,
    employee_key: params.employeeKey,
    type_key: transactionType.type_key,
    interest: params.interestPaid,
    penalty: params.penalty,
    total_amount: totalAmount,
    net_cash_flow: netCashFlow,
    payment_method: params.paymentMethod || 'cash',
    notes: params.notes,
  });
}

/**
 * Create a FORFEITURE transaction
 */
export async function createForfeitureTransaction(params: {
  customerKey: number;
  loanKey: number;
  itemKey: number;
  branchKey: number;
  employeeKey?: number;
  principal: number;
  interest: number;
  notes?: string;
}): Promise<TransactionRow> {
  const transactionType = await getTransactionTypeByCode(TRANSACTION_TYPES.FORFEITURE);
  if (!transactionType) {
    throw new Error('Transaction type FORFEITURE not found');
  }

  // For FORFEITURE, no cash flows (neutral)
  const totalAmount = params.principal + params.interest;
  const netCashFlow = 0; // No cash movement

  return createTransaction({
    customer_key: params.customerKey,
    loan_key: params.loanKey,
    item_key: params.itemKey,
    branch_key: params.branchKey,
    employee_key: params.employeeKey,
    type_key: transactionType.type_key,
    principal: params.principal,
    interest: params.interest,
    total_amount: totalAmount,
    net_cash_flow: netCashFlow,
    notes: params.notes,
  });
}

/**
 * Get transactions for a specific loan
 */
export async function getTransactionsByLoan(loanKey: number): Promise<TransactionRow[]> {
  const { data, error } = await supabase
    .from('fact_transactions')
    .select(`
      *,
      transaction_type:dim_transaction_type(type_key, type_code, type_name, cash_flow_direction)
    `)
    .eq('loan_key', loanKey)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching loan transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get transactions for a specific customer
 */
export async function getTransactionsByCustomer(
  customerKey: number
): Promise<TransactionRow[]> {
  const { data, error } = await supabase
    .from('fact_transactions')
    .select(`
      *,
      transaction_type:dim_transaction_type(type_key, type_code, type_name, cash_flow_direction),
      loan:dim_loan(loan_key, loan_id)
    `)
    .eq('customer_key', customerKey)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get today's transactions for a branch
 */
export async function getTodaysTransactions(
  branchKey: number
): Promise<TransactionRow[]> {
  const dateKey = getCurrentDateKey();

  const { data, error } = await supabase
    .from('fact_transactions')
    .select(`
      *,
      transaction_type:dim_transaction_type(type_key, type_code, type_name, cash_flow_direction),
      customer:dim_customer!inner(customer_key, customer_id, full_name)
    `)
    .eq('branch_key', branchKey)
    .eq('date_key', dateKey)
    .eq('customer.is_current', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching today\'s transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get cash flow summary for today
 */
export async function getTodayCashFlow(branchKey: number): Promise<{
  disbursements: number;
  collections: number;
  netCashFlow: number;
  transactionCount: number;
}> {
  const dateKey = getCurrentDateKey();

  const { data, error } = await supabase
    .from('fact_transactions')
    .select('net_cash_flow, total_amount')
    .eq('branch_key', branchKey)
    .eq('date_key', dateKey);

  if (error) {
    console.error('Error fetching cash flow:', error);
    return {
      disbursements: 0,
      collections: 0,
      netCashFlow: 0,
      transactionCount: 0,
    };
  }

  const transactions = data || [];

  const disbursements = transactions
    .filter((t) => t.net_cash_flow < 0)
    .reduce((sum, t) => sum + Math.abs(t.net_cash_flow), 0);

  const collections = transactions
    .filter((t) => t.net_cash_flow > 0)
    .reduce((sum, t) => sum + t.net_cash_flow, 0);

  const netCashFlow = transactions.reduce((sum, t) => sum + t.net_cash_flow, 0);

  return {
    disbursements,
    collections,
    netCashFlow,
    transactionCount: transactions.length,
  };
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(
  branchKey: number,
  limit: number = 10
): Promise<TransactionRow[]> {
  const { data, error } = await supabase
    .from('fact_transactions')
    .select(`
      *,
      transaction_type:dim_transaction_type(type_key, type_code, type_name, cash_flow_direction),
      customer:dim_customer!inner(customer_key, customer_id, full_name)
    `)
    .eq('branch_key', branchKey)
    .eq('customer.is_current', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return data || [];
}

/**
 * Get transaction statistics for dashboard
 */
export async function getTransactionStats(branchKey: number): Promise<{
  todayDisbursements: number;
  todayCollections: number;
  todayTransactionCount: number;
  weeklyDisbursements: number;
  weeklyCollections: number;
}> {
  const todayStats = await getTodayCashFlow(branchKey);

  // Get weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoKey = parseInt(
    weekAgo.toISOString().slice(0, 10).replace(/-/g, ''),
    10
  );

  const { data: weekData, error: weekError } = await supabase
    .from('fact_transactions')
    .select('net_cash_flow')
    .eq('branch_key', branchKey)
    .gte('date_key', weekAgoKey);

  if (weekError) {
    console.error('Error fetching weekly stats:', weekError);
  }

  const weekTransactions = weekData || [];

  const weeklyDisbursements = weekTransactions
    .filter((t) => t.net_cash_flow < 0)
    .reduce((sum, t) => sum + Math.abs(t.net_cash_flow), 0);

  const weeklyCollections = weekTransactions
    .filter((t) => t.net_cash_flow > 0)
    .reduce((sum, t) => sum + t.net_cash_flow, 0);

  return {
    todayDisbursements: todayStats.disbursements,
    todayCollections: todayStats.collections,
    todayTransactionCount: todayStats.transactionCount,
    weeklyDisbursements,
    weeklyCollections,
  };
}
