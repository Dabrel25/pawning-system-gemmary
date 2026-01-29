import { supabase } from '@/lib/supabase';

export interface Customer {
  id?: string;
  full_name: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  address: string;
  id_type: string;
  id_number: string;
  photo?: string;
  id_front_photo?: string;
  id_back_photo?: string;
  signature?: string;
  watchlist_status?: string;
  active_loans_count?: number;
  total_loans_taken?: number;
  created_at?: string;
  updated_at?: string;
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  return data;
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,id_number.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error('Error searching customers:', error);
    throw new Error(`Failed to search customers: ${error.message}`);
  }

  return data || [];
}
