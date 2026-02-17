import { supabase } from '@/lib/supabase';
import type { DimCustomer, CreateCustomerInput } from '@/types';

// Database row type (snake_case from Supabase)
export interface CustomerRow {
  customer_key: number;
  customer_id: string;
  full_name: string;
  last_name?: string;
  first_name?: string;
  middle_name?: string;
  suffix?: string;
  date_of_birth?: string;
  nationality?: string;
  gender?: string;
  id_type: string;
  id_number: string;
  id_expiry_date?: string;
  id_issuing_authority?: string;
  id_front_photo?: string;
  id_back_photo?: string;
  photo?: string;
  signature?: string;
  address_line_1?: string;
  address_line_2?: string;
  barangay?: string;
  city_municipality?: string;
  province?: string;
  postal_code?: string;
  address: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  is_address_verified?: boolean;
  address_proof_type?: string;
  occupation?: string;
  employer_business_name?: string;
  nature_of_work?: string;
  monthly_income_range?: string;
  source_of_income?: string;
  is_pep?: boolean;
  pep_details?: string;
  expected_transaction_frequency?: string;
  expected_transaction_value?: string;
  kyc_status: string;
  kyc_verified_at?: string;
  kyc_verified_by?: number;
  risk_level: string;
  watchlist_status: string;
  watchlist_notes?: string;
  is_current: boolean;
  valid_from: string;
  valid_to?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

// Re-export CustomerRow as Customer for backwards compatibility
export type Customer = CustomerRow;

/**
 * Generate a new customer ID
 */
async function generateCustomerId(): Promise<string> {
  const { data, error } = await supabase
    .rpc('generate_customer_id');

  if (error) {
    // Fallback to manual generation
    const { count } = await supabase
      .from('dim_customer')
      .select('customer_id', { count: 'exact', head: true });

    const seq = (count || 0) + 1;
    return `CUS-${seq.toString().padStart(6, '0')}`;
  }

  return data;
}

/**
 * Create a new customer in dim_customer
 */
export async function createCustomer(
  customer: CreateCustomerInput
): Promise<CustomerRow> {
  // Generate customer_id
  const customerId = await generateCustomerId();

  const insertData = {
    customer_id: customerId,
    full_name: customer.full_name,
    last_name: customer.last_name,
    first_name: customer.first_name,
    middle_name: customer.middle_name,
    suffix: customer.suffix,
    date_of_birth: customer.date_of_birth,
    nationality: customer.nationality || 'Filipino',
    gender: customer.gender,
    id_type: customer.id_type,
    id_number: customer.id_number,
    id_expiry_date: customer.id_expiry_date,
    id_issuing_authority: customer.id_issuing_authority,
    id_front_photo: customer.id_front_photo,
    id_back_photo: customer.id_back_photo,
    photo: customer.photo,
    signature: customer.signature,
    address_line_1: customer.address_line_1,
    address_line_2: customer.address_line_2,
    barangay: customer.barangay,
    city_municipality: customer.city_municipality,
    province: customer.province,
    postal_code: customer.postal_code,
    address: customer.address,
    phone: customer.phone,
    alternate_phone: customer.alternate_phone,
    email: customer.email,
    is_address_verified: customer.is_address_verified || false,
    address_proof_type: customer.address_proof_type,
    occupation: customer.occupation,
    employer_business_name: customer.employer_business_name,
    nature_of_work: customer.nature_of_work,
    monthly_income_range: customer.monthly_income_range,
    source_of_income: customer.source_of_income,
    is_pep: customer.is_pep || false,
    pep_details: customer.pep_details,
    expected_transaction_frequency: customer.expected_transaction_frequency,
    expected_transaction_value: customer.expected_transaction_value,
    kyc_status: 'pending',
    risk_level: 'low',
    watchlist_status: customer.watchlist_status || 'clear',
    is_current: true,
  };

  const { data, error } = await supabase
    .from('dim_customer')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  return data;
}

/**
 * Search customers by name, phone, or ID number
 * Only returns current (is_current = true) records
 */
export async function searchCustomers(query: string): Promise<CustomerRow[]> {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('dim_customer')
    .select('*')
    .eq('is_current', true)
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,id_number.ilike.%${query}%`)
    .order('full_name')
    .limit(20);

  if (error) {
    console.error('Error searching customers:', error);
    throw new Error(`Failed to search customers: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a customer by customer_key
 * Only returns current (is_current = true) record
 */
export async function getCustomerByKey(customerKey: number): Promise<CustomerRow | null> {
  const { data, error } = await supabase
    .from('dim_customer')
    .select('*')
    .eq('customer_key', customerKey)
    .eq('is_current', true)
    .single();

  if (error) {
    console.error('Error fetching customer:', error);
    return null;
  }

  return data;
}

/**
 * Get a customer by customer_id (natural key)
 * Only returns current (is_current = true) record
 */
export async function getCustomerById(customerId: string): Promise<CustomerRow | null> {
  const { data, error } = await supabase
    .from('dim_customer')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_current', true)
    .single();

  if (error) {
    console.error('Error fetching customer:', error);
    return null;
  }

  return data;
}

/**
 * Get all current customers
 */
export async function getAllCustomers(): Promise<CustomerRow[]> {
  const { data, error } = await supabase
    .from('dim_customer')
    .select('*')
    .eq('is_current', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }

  return data || [];
}

/**
 * Update a customer (SCD Type 2)
 * Closes the old record and creates a new current record
 */
export async function updateCustomer(
  customerKey: number,
  updates: Partial<CreateCustomerInput>
): Promise<CustomerRow> {
  // Get the current record
  const currentRecord = await getCustomerByKey(customerKey);
  if (!currentRecord) {
    throw new Error('Customer not found');
  }

  // Close the old record
  const { error: closeError } = await supabase
    .from('dim_customer')
    .update({
      is_current: false,
      valid_to: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('customer_key', customerKey);

  if (closeError) {
    console.error('Error closing old customer record:', closeError);
    throw new Error(`Failed to update customer: ${closeError.message}`);
  }

  // Create new record with updates
  const newRecord = {
    customer_id: currentRecord.customer_id, // Keep same customer_id
    full_name: updates.full_name ?? currentRecord.full_name,
    last_name: updates.last_name ?? currentRecord.last_name,
    first_name: updates.first_name ?? currentRecord.first_name,
    middle_name: updates.middle_name ?? currentRecord.middle_name,
    suffix: updates.suffix ?? currentRecord.suffix,
    date_of_birth: updates.date_of_birth ?? currentRecord.date_of_birth,
    nationality: updates.nationality ?? currentRecord.nationality,
    gender: updates.gender ?? currentRecord.gender,
    id_type: updates.id_type ?? currentRecord.id_type,
    id_number: updates.id_number ?? currentRecord.id_number,
    id_expiry_date: updates.id_expiry_date ?? currentRecord.id_expiry_date,
    id_issuing_authority: updates.id_issuing_authority ?? currentRecord.id_issuing_authority,
    id_front_photo: updates.id_front_photo ?? currentRecord.id_front_photo,
    id_back_photo: updates.id_back_photo ?? currentRecord.id_back_photo,
    photo: updates.photo ?? currentRecord.photo,
    signature: updates.signature ?? currentRecord.signature,
    address_line_1: updates.address_line_1 ?? currentRecord.address_line_1,
    address_line_2: updates.address_line_2 ?? currentRecord.address_line_2,
    barangay: updates.barangay ?? currentRecord.barangay,
    city_municipality: updates.city_municipality ?? currentRecord.city_municipality,
    province: updates.province ?? currentRecord.province,
    postal_code: updates.postal_code ?? currentRecord.postal_code,
    address: updates.address ?? currentRecord.address,
    phone: updates.phone ?? currentRecord.phone,
    alternate_phone: updates.alternate_phone ?? currentRecord.alternate_phone,
    email: updates.email ?? currentRecord.email,
    is_address_verified: updates.is_address_verified ?? currentRecord.is_address_verified,
    address_proof_type: updates.address_proof_type ?? currentRecord.address_proof_type,
    occupation: updates.occupation ?? currentRecord.occupation,
    employer_business_name: updates.employer_business_name ?? currentRecord.employer_business_name,
    nature_of_work: updates.nature_of_work ?? currentRecord.nature_of_work,
    monthly_income_range: updates.monthly_income_range ?? currentRecord.monthly_income_range,
    source_of_income: updates.source_of_income ?? currentRecord.source_of_income,
    is_pep: updates.is_pep ?? currentRecord.is_pep,
    pep_details: updates.pep_details ?? currentRecord.pep_details,
    expected_transaction_frequency: updates.expected_transaction_frequency ?? currentRecord.expected_transaction_frequency,
    expected_transaction_value: updates.expected_transaction_value ?? currentRecord.expected_transaction_value,
    kyc_status: currentRecord.kyc_status,
    risk_level: currentRecord.risk_level,
    watchlist_status: updates.watchlist_status ?? currentRecord.watchlist_status,
    is_current: true,
    valid_from: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('dim_customer')
    .insert([newRecord])
    .select()
    .single();

  if (error) {
    console.error('Error creating new customer record:', error);
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  return data;
}

/**
 * Get customer history (all SCD Type 2 versions)
 */
export async function getCustomerHistory(customerId: string): Promise<CustomerRow[]> {
  const { data, error } = await supabase
    .from('dim_customer')
    .select('*')
    .eq('customer_id', customerId)
    .order('valid_from', { ascending: false });

  if (error) {
    console.error('Error fetching customer history:', error);
    throw new Error(`Failed to fetch customer history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get customer as they were at a specific point in time
 */
export async function getCustomerAtTime(
  customerId: string,
  timestamp: string
): Promise<CustomerRow | null> {
  const { data, error } = await supabase
    .from('dim_customer')
    .select('*')
    .eq('customer_id', customerId)
    .lte('valid_from', timestamp)
    .or(`valid_to.gt.${timestamp},valid_to.is.null`)
    .single();

  if (error) {
    console.error('Error fetching customer at time:', error);
    return null;
  }

  return data;
}

/**
 * Update customer watchlist status (simple update, no SCD)
 */
export async function updateWatchlistStatus(
  customerKey: number,
  status: 'clear' | 'flagged' | 'blocked',
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from('dim_customer')
    .update({
      watchlist_status: status,
      watchlist_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('customer_key', customerKey)
    .eq('is_current', true);

  if (error) {
    console.error('Error updating watchlist status:', error);
    throw new Error(`Failed to update watchlist status: ${error.message}`);
  }
}

/**
 * Update customer KYC status
 */
export async function updateKycStatus(
  customerKey: number,
  status: 'pending' | 'verified' | 'rejected',
  verifiedBy?: number
): Promise<void> {
  const updates: Record<string, unknown> = {
    kyc_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'verified') {
    updates.kyc_verified_at = new Date().toISOString();
    updates.kyc_verified_by = verifiedBy;
  }

  const { error } = await supabase
    .from('dim_customer')
    .update(updates)
    .eq('customer_key', customerKey)
    .eq('is_current', true);

  if (error) {
    console.error('Error updating KYC status:', error);
    throw new Error(`Failed to update KYC status: ${error.message}`);
  }
}

/**
 * Get customer loan statistics
 */
export async function getCustomerLoanStats(customerKey: number): Promise<{
  activeLoansCount: number;
  totalLoansTaken: number;
}> {
  // Count active loans
  const { count: activeCount, error: activeError } = await supabase
    .from('dim_loan')
    .select('*', { count: 'exact', head: true })
    .eq('customer_key', customerKey)
    .eq('status', 'active');

  if (activeError) {
    console.error('Error counting active loans:', activeError);
  }

  // Count total loans
  const { count: totalCount, error: totalError } = await supabase
    .from('dim_loan')
    .select('*', { count: 'exact', head: true })
    .eq('customer_key', customerKey);

  if (totalError) {
    console.error('Error counting total loans:', totalError);
  }

  return {
    activeLoansCount: activeCount || 0,
    totalLoansTaken: totalCount || 0,
  };
}
