import { supabase } from '@/lib/supabase';

export interface Loan {
  id?: string;
  ticket_number: string;
  customer_id: string;
  status: 'active' | 'redeemed' | 'renewed' | 'forfeited';

  // Item details
  item_category: string;
  item_description?: string;
  item_photos?: string[];
  appraisal_value: number;

  // Gold specific
  gold_type?: string;
  gold_weight?: number;
  gold_karat?: string;

  // Electronics specific
  brand?: string;
  model?: string;
  serial_number?: string;
  item_condition?: string;

  // Loan terms
  principal: number;
  interest_rate: number;
  period_days: number;
  service_fee?: number;
  interest_amount: number;
  total_due: number;

  // Dates
  created_at?: string;
  maturity_date: string;
  redeemed_at?: string;
  renewed_at?: string;
  forfeited_at?: string;

  // Joined customer data
  customer?: {
    id: string;
    full_name: string;
    phone: string;
    photo?: string;
  };
}

export async function createLoan(loan: Omit<Loan, 'id' | 'created_at' | 'customer'>): Promise<Loan> {
  const { data, error } = await supabase
    .from('loans')
    .insert([loan])
    .select()
    .single();

  if (error) {
    console.error('Error creating loan:', error);
    throw new Error(`Failed to create loan: ${error.message}`);
  }

  return data;
}

export async function getActiveLoans(): Promise<Loan[]> {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      customer:customers(id, full_name, phone, photo)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active loans:', error);
    throw new Error(`Failed to fetch loans: ${error.message}`);
  }

  return data || [];
}

export async function getAllLoans(): Promise<Loan[]> {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      customer:customers(id, full_name, phone, photo)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
    throw new Error(`Failed to fetch loans: ${error.message}`);
  }

  return data || [];
}

export async function updateLoanStatus(
  loanId: string,
  status: Loan['status']
): Promise<Loan> {
  const updates: Record<string, any> = { status };

  if (status === 'redeemed') {
    updates.redeemed_at = new Date().toISOString();
  } else if (status === 'renewed') {
    updates.renewed_at = new Date().toISOString();
  } else if (status === 'forfeited') {
    updates.forfeited_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('loans')
    .update(updates)
    .eq('id', loanId)
    .select()
    .single();

  if (error) {
    console.error('Error updating loan:', error);
    throw new Error(`Failed to update loan: ${error.message}`);
  }

  return data;
}

export async function deleteLoan(loanId: string): Promise<void> {
  const { error } = await supabase
    .from('loans')
    .delete()
    .eq('id', loanId);

  if (error) {
    console.error('Error deleting loan:', error);
    throw new Error(`Failed to delete loan: ${error.message}`);
  }
}
