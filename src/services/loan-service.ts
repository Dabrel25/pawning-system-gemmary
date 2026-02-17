import { supabase } from '@/lib/supabase';
import type { DimLoan, DimItem, CreateLoanInput, CreateItemInput, LoanStatus } from '@/types';

// Database row types
export interface LoanRow {
  loan_key: number;
  loan_id: string;
  customer_key: number;
  item_key: number;
  branch_key: number;
  created_by_employee_key?: number;
  principal: number;
  interest_rate: number;
  term_days: number;
  service_fee: number;
  interest_amount: number;
  total_due: number;
  loan_date: string;
  maturity_date: string;
  grace_period_days?: number;
  auction_date?: string;
  status: LoanStatus;
  renewed_at?: string;
  redeemed_at?: string;
  forfeited_at?: string;
  auctioned_at?: string;
  purpose_of_loan?: string;
  transacted_by?: string;
  relationship_to_customer?: string;
  authorization_document?: string;
  parent_loan_key?: number;
  renewal_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  customer?: {
    customer_key: number;
    customer_id: string;
    full_name: string;
    phone: string;
    photo?: string;
  };
  item?: ItemRow;
}

export interface ItemRow {
  item_key: number;
  item_id: string;
  branch_key?: number;
  category: string;
  subcategory?: string;
  description?: string;
  photos?: string[];
  gold_type?: string;
  karat?: string;
  weight_grams?: number;
  purity_percentage?: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  imei?: string;
  item_condition?: string;
  accessories?: string[];
  appraisal_value: number;
  gold_price_per_gram?: number;
  appraised_by?: number;
  appraised_at?: string;
  storage_location?: string;
  vault_number?: string;
  shelf_number?: string;
  item_source?: string;
  ownership_proof?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Re-export for backwards compatibility
export type Loan = LoanRow;

/**
 * Generate a new loan ID (ticket number)
 */
async function generateLoanId(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_loan_id');

  if (error) {
    // Fallback to manual generation
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const { count } = await supabase
      .from('dim_loan')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().slice(0, 10));

    const seq = (count || 0) + 1;
    return `PT${dateStr}-${seq.toString().padStart(4, '0')}`;
  }

  return data;
}

/**
 * Generate a new item ID
 */
async function generateItemId(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_item_id');

  if (error) {
    // Fallback to manual generation
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const { count } = await supabase
      .from('dim_item')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString().slice(0, 10));

    const seq = (count || 0) + 1;
    return `ITM${dateStr}-${seq.toString().padStart(4, '0')}`;
  }

  return data;
}

/**
 * Create a new item in dim_item
 */
export async function createItem(item: CreateItemInput): Promise<ItemRow> {
  const itemId = await generateItemId();

  const insertData = {
    item_id: itemId,
    branch_key: item.branch_key,
    category: item.category,
    subcategory: item.subcategory,
    description: item.description,
    photos: item.photos,
    gold_type: item.gold_type,
    karat: item.karat,
    weight_grams: item.weight_grams,
    purity_percentage: item.purity_percentage,
    brand: item.brand,
    model: item.model,
    serial_number: item.serial_number,
    imei: item.imei,
    item_condition: item.item_condition,
    accessories: item.accessories,
    appraisal_value: item.appraisal_value,
    gold_price_per_gram: item.gold_price_per_gram,
    item_source: item.item_source,
    ownership_proof: item.ownership_proof,
    status: 'pawned',
  };

  const { data, error } = await supabase
    .from('dim_item')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating item:', error);
    throw new Error(`Failed to create item: ${error.message}`);
  }

  return data;
}

/**
 * Create a new loan in dim_loan
 */
export async function createLoan(loan: CreateLoanInput): Promise<LoanRow> {
  const loanId = await generateLoanId();

  const insertData = {
    loan_id: loanId,
    customer_key: loan.customer_key,
    item_key: loan.item_key,
    branch_key: loan.branch_key,
    created_by_employee_key: loan.created_by_employee_key,
    principal: loan.principal,
    interest_rate: loan.interest_rate,
    term_days: loan.term_days,
    service_fee: loan.service_fee || 0,
    interest_amount: loan.interest_amount,
    total_due: loan.total_due,
    loan_date: loan.loan_date || new Date().toISOString().slice(0, 10),
    maturity_date: loan.maturity_date,
    purpose_of_loan: loan.purpose_of_loan,
    transacted_by: loan.transacted_by,
    relationship_to_customer: loan.relationship_to_customer,
    authorization_document: loan.authorization_document,
    status: 'active',
    renewal_count: 0,
  };

  const { data, error } = await supabase
    .from('dim_loan')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating loan:', error);
    throw new Error(`Failed to create loan: ${error.message}`);
  }

  return data;
}

/**
 * Get all active loans with customer and item data
 */
export async function getActiveLoans(): Promise<LoanRow[]> {
  const { data, error } = await supabase
    .from('dim_loan')
    .select(`
      *,
      customer:dim_customer!inner(customer_key, customer_id, full_name, phone, photo),
      item:dim_item(*)
    `)
    .eq('status', 'active')
    .eq('customer.is_current', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active loans:', error);
    throw new Error(`Failed to fetch loans: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all loans (any status) with customer and item data
 */
export async function getAllLoans(): Promise<LoanRow[]> {
  const { data, error } = await supabase
    .from('dim_loan')
    .select(`
      *,
      customer:dim_customer!inner(customer_key, customer_id, full_name, phone, photo),
      item:dim_item(*)
    `)
    .eq('customer.is_current', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
    throw new Error(`Failed to fetch loans: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a loan by loan_key
 */
export async function getLoanByKey(loanKey: number): Promise<LoanRow | null> {
  const { data, error } = await supabase
    .from('dim_loan')
    .select(`
      *,
      customer:dim_customer!inner(customer_key, customer_id, full_name, phone, photo),
      item:dim_item(*)
    `)
    .eq('loan_key', loanKey)
    .eq('customer.is_current', true)
    .single();

  if (error) {
    console.error('Error fetching loan:', error);
    return null;
  }

  return data;
}

/**
 * Get a loan by loan_id (ticket number)
 */
export async function getLoanById(loanId: string): Promise<LoanRow | null> {
  const { data, error } = await supabase
    .from('dim_loan')
    .select(`
      *,
      customer:dim_customer!inner(customer_key, customer_id, full_name, phone, photo),
      item:dim_item(*)
    `)
    .eq('loan_id', loanId)
    .eq('customer.is_current', true)
    .single();

  if (error) {
    console.error('Error fetching loan:', error);
    return null;
  }

  return data;
}

/**
 * Get loans for a specific customer
 */
export async function getLoansByCustomer(customerKey: number): Promise<LoanRow[]> {
  const { data, error } = await supabase
    .from('dim_loan')
    .select(`
      *,
      item:dim_item(*)
    `)
    .eq('customer_key', customerKey)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer loans:', error);
    throw new Error(`Failed to fetch loans: ${error.message}`);
  }

  return data || [];
}

/**
 * Update loan status
 */
export async function updateLoanStatus(
  loanKey: number,
  status: LoanStatus
): Promise<LoanRow> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Set appropriate timestamp based on status
  if (status === 'redeemed') {
    updates.redeemed_at = new Date().toISOString();
  } else if (status === 'renewed') {
    updates.renewed_at = new Date().toISOString();
  } else if (status === 'forfeited') {
    updates.forfeited_at = new Date().toISOString();
  } else if (status === 'auctioned') {
    updates.auctioned_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('dim_loan')
    .update(updates)
    .eq('loan_key', loanKey)
    .select()
    .single();

  if (error) {
    console.error('Error updating loan:', error);
    throw new Error(`Failed to update loan: ${error.message}`);
  }

  // Also update item status if needed
  const loan = await getLoanByKey(loanKey);
  if (loan) {
    let itemStatus: string | null = null;
    if (status === 'redeemed') {
      itemStatus = 'redeemed';
    } else if (status === 'forfeited') {
      itemStatus = 'forfeited';
    } else if (status === 'auctioned') {
      itemStatus = 'sold';
    }

    if (itemStatus) {
      await supabase
        .from('dim_item')
        .update({ status: itemStatus, updated_at: new Date().toISOString() })
        .eq('item_key', loan.item_key);
    }
  }

  return data;
}

/**
 * Delete a loan (soft delete by setting status)
 */
export async function deleteLoan(loanKey: number): Promise<void> {
  // Get the loan first to update item status
  const loan = await getLoanByKey(loanKey);

  const { error } = await supabase
    .from('dim_loan')
    .delete()
    .eq('loan_key', loanKey);

  if (error) {
    console.error('Error deleting loan:', error);
    throw new Error(`Failed to delete loan: ${error.message}`);
  }

  // Also delete the item if loan was deleted
  if (loan?.item_key) {
    await supabase
      .from('dim_item')
      .delete()
      .eq('item_key', loan.item_key);
  }
}

/**
 * Renew a loan (create new loan, close old one)
 */
export async function renewLoan(
  loanKey: number,
  newTermDays: number,
  interestPaid: number
): Promise<LoanRow> {
  const currentLoan = await getLoanByKey(loanKey);
  if (!currentLoan) {
    throw new Error('Loan not found');
  }

  // Mark current loan as renewed
  await updateLoanStatus(loanKey, 'renewed');

  // Calculate new loan terms
  const interestAmount = Math.round(
    currentLoan.principal * (currentLoan.interest_rate / 100) * (newTermDays / 30)
  );
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + newTermDays);

  // Create new loan
  const newLoan = await createLoan({
    customer_key: currentLoan.customer_key,
    item_key: currentLoan.item_key,
    branch_key: currentLoan.branch_key,
    created_by_employee_key: currentLoan.created_by_employee_key,
    principal: currentLoan.principal,
    interest_rate: currentLoan.interest_rate,
    term_days: newTermDays,
    service_fee: currentLoan.service_fee,
    interest_amount: interestAmount,
    total_due: currentLoan.principal + interestAmount + (currentLoan.service_fee || 0),
    maturity_date: maturityDate.toISOString().slice(0, 10),
  });

  // Update parent loan reference and renewal count
  await supabase
    .from('dim_loan')
    .update({
      parent_loan_key: loanKey,
      renewal_count: currentLoan.renewal_count + 1,
    })
    .eq('loan_key', newLoan.loan_key);

  return newLoan;
}

/**
 * Get loans due within a certain number of days
 */
export async function getLoansDueSoon(days: number = 7): Promise<LoanRow[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const { data, error } = await supabase
    .from('dim_loan')
    .select(`
      *,
      customer:dim_customer!inner(customer_key, customer_id, full_name, phone, photo),
      item:dim_item(*)
    `)
    .eq('status', 'active')
    .eq('customer.is_current', true)
    .lte('maturity_date', futureDate.toISOString().slice(0, 10))
    .order('maturity_date', { ascending: true });

  if (error) {
    console.error('Error fetching due loans:', error);
    throw new Error(`Failed to fetch loans: ${error.message}`);
  }

  return data || [];
}

/**
 * Get overdue loans
 */
export async function getOverdueLoans(): Promise<LoanRow[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('dim_loan')
    .select(`
      *,
      customer:dim_customer!inner(customer_key, customer_id, full_name, phone, photo),
      item:dim_item(*)
    `)
    .eq('status', 'active')
    .eq('customer.is_current', true)
    .lt('maturity_date', today)
    .order('maturity_date', { ascending: true });

  if (error) {
    console.error('Error fetching overdue loans:', error);
    throw new Error(`Failed to fetch loans: ${error.message}`);
  }

  return data || [];
}

/**
 * Get loan statistics for dashboard
 */
export async function getLoanStats(): Promise<{
  activeLoans: number;
  totalCapitalOut: number;
  loansDueToday: number;
  dueSoonCount: number;
  overdueCount: number;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysStr = sevenDaysLater.toISOString().slice(0, 10);

  // Active loans count and total capital
  const { data: activeData, error: activeError } = await supabase
    .from('dim_loan')
    .select('principal')
    .eq('status', 'active');

  if (activeError) {
    console.error('Error fetching active loans:', activeError);
  }

  const activeLoans = activeData?.length || 0;
  const totalCapitalOut = activeData?.reduce(
    (sum, loan) => sum + Number(loan.principal),
    0
  ) || 0;

  // Due today count
  const { count: dueTodayCount } = await supabase
    .from('dim_loan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('maturity_date', today);

  // Due soon count (within 7 days, not including overdue)
  const { count: dueSoonCount } = await supabase
    .from('dim_loan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gt('maturity_date', today)
    .lte('maturity_date', sevenDaysStr);

  // Overdue count
  const { count: overdueCount } = await supabase
    .from('dim_loan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .lt('maturity_date', today);

  return {
    activeLoans,
    totalCapitalOut,
    loansDueToday: dueTodayCount || 0,
    dueSoonCount: dueSoonCount || 0,
    overdueCount: overdueCount || 0,
  };
}

/**
 * Get an item by item_key
 */
export async function getItemByKey(itemKey: number): Promise<ItemRow | null> {
  const { data, error } = await supabase
    .from('dim_item')
    .select('*')
    .eq('item_key', itemKey)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }

  return data;
}

/**
 * Update item status
 */
export async function updateItemStatus(
  itemKey: number,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('dim_item')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('item_key', itemKey);

  if (error) {
    console.error('Error updating item status:', error);
    throw new Error(`Failed to update item: ${error.message}`);
  }
}
