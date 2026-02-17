import { supabase } from '@/lib/supabase';
import type { DimBranch, DimEmployee } from '@/types';

// Database row types
export interface BranchRow {
  branch_key: number;
  branch_id: string;
  name: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active: boolean;
  opening_date?: string;
  closing_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeRow {
  employee_key: number;
  employee_id: string;
  auth_user_id?: string;
  branch_key?: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role: string;
  hire_date?: string;
  termination_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  branch?: BranchRow;
}

export interface CreateBranchInput {
  name: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  opening_date?: string;
}

export interface CreateEmployeeInput {
  branch_key: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role: string;
  hire_date?: string;
}

// ============================================================
// BRANCH OPERATIONS
// ============================================================

/**
 * Get all active branches
 */
export async function getAllBranches(): Promise<BranchRow[]> {
  const { data, error } = await supabase
    .from('dim_branch')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching branches:', error);
    throw new Error(`Failed to fetch branches: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a branch by branch_key
 */
export async function getBranchByKey(branchKey: number): Promise<BranchRow | null> {
  const { data, error } = await supabase
    .from('dim_branch')
    .select('*')
    .eq('branch_key', branchKey)
    .single();

  if (error) {
    console.error('Error fetching branch:', error);
    return null;
  }

  return data;
}

/**
 * Get a branch by branch_id
 */
export async function getBranchById(branchId: string): Promise<BranchRow | null> {
  const { data, error } = await supabase
    .from('dim_branch')
    .select('*')
    .eq('branch_id', branchId)
    .single();

  if (error) {
    console.error('Error fetching branch:', error);
    return null;
  }

  return data;
}

/**
 * Get the default branch (first active branch)
 */
export async function getDefaultBranch(): Promise<BranchRow | null> {
  const { data, error } = await supabase
    .from('dim_branch')
    .select('*')
    .eq('is_active', true)
    .order('branch_key')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching default branch:', error);
    return null;
  }

  return data;
}

/**
 * Generate a new branch ID
 */
async function generateBranchId(): Promise<string> {
  const { count } = await supabase
    .from('dim_branch')
    .select('*', { count: 'exact', head: true });

  const seq = (count || 0) + 1;
  return `BR-${seq.toString().padStart(3, '0')}`;
}

/**
 * Create a new branch
 */
export async function createBranch(input: CreateBranchInput): Promise<BranchRow> {
  const branchId = await generateBranchId();

  const insertData = {
    branch_id: branchId,
    name: input.name,
    address_line_1: input.address_line_1,
    address_line_2: input.address_line_2,
    city: input.city,
    province: input.province,
    postal_code: input.postal_code,
    phone: input.phone,
    email: input.email,
    manager_name: input.manager_name,
    is_active: true,
    opening_date: input.opening_date || new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await supabase
    .from('dim_branch')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating branch:', error);
    throw new Error(`Failed to create branch: ${error.message}`);
  }

  return data;
}

/**
 * Update a branch
 */
export async function updateBranch(
  branchKey: number,
  updates: Partial<CreateBranchInput>
): Promise<BranchRow> {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('dim_branch')
    .update(updateData)
    .eq('branch_key', branchKey)
    .select()
    .single();

  if (error) {
    console.error('Error updating branch:', error);
    throw new Error(`Failed to update branch: ${error.message}`);
  }

  return data;
}

/**
 * Deactivate a branch (soft delete)
 */
export async function deactivateBranch(branchKey: number): Promise<void> {
  const { error } = await supabase
    .from('dim_branch')
    .update({
      is_active: false,
      closing_date: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq('branch_key', branchKey);

  if (error) {
    console.error('Error deactivating branch:', error);
    throw new Error(`Failed to deactivate branch: ${error.message}`);
  }
}

// ============================================================
// EMPLOYEE OPERATIONS
// ============================================================

/**
 * Get all active employees
 */
export async function getAllEmployees(): Promise<EmployeeRow[]> {
  const { data, error } = await supabase
    .from('dim_employee')
    .select(`
      *,
      branch:dim_branch(*)
    `)
    .eq('is_active', true)
    .order('full_name');

  if (error) {
    console.error('Error fetching employees:', error);
    throw new Error(`Failed to fetch employees: ${error.message}`);
  }

  return data || [];
}

/**
 * Get employees by branch
 */
export async function getEmployeesByBranch(branchKey: number): Promise<EmployeeRow[]> {
  const { data, error } = await supabase
    .from('dim_employee')
    .select('*')
    .eq('branch_key', branchKey)
    .eq('is_active', true)
    .order('full_name');

  if (error) {
    console.error('Error fetching employees:', error);
    throw new Error(`Failed to fetch employees: ${error.message}`);
  }

  return data || [];
}

/**
 * Get an employee by employee_key
 */
export async function getEmployeeByKey(employeeKey: number): Promise<EmployeeRow | null> {
  const { data, error } = await supabase
    .from('dim_employee')
    .select(`
      *,
      branch:dim_branch(*)
    `)
    .eq('employee_key', employeeKey)
    .single();

  if (error) {
    console.error('Error fetching employee:', error);
    return null;
  }

  return data;
}

/**
 * Get an employee by auth user ID
 */
export async function getEmployeeByAuthId(authUserId: string): Promise<EmployeeRow | null> {
  const { data, error } = await supabase
    .from('dim_employee')
    .select(`
      *,
      branch:dim_branch(*)
    `)
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching employee by auth ID:', error);
    return null;
  }

  return data;
}

/**
 * Get the default employee (first admin)
 */
export async function getDefaultEmployee(): Promise<EmployeeRow | null> {
  const { data, error } = await supabase
    .from('dim_employee')
    .select(`
      *,
      branch:dim_branch(*)
    `)
    .eq('is_active', true)
    .order('employee_key')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching default employee:', error);
    return null;
  }

  return data;
}

/**
 * Generate a new employee ID
 */
async function generateEmployeeId(): Promise<string> {
  const { count } = await supabase
    .from('dim_employee')
    .select('*', { count: 'exact', head: true });

  const seq = (count || 0) + 1;
  return `EMP-${seq.toString().padStart(3, '0')}`;
}

/**
 * Create a new employee
 */
export async function createEmployee(input: CreateEmployeeInput): Promise<EmployeeRow> {
  const employeeId = await generateEmployeeId();

  const insertData = {
    employee_id: employeeId,
    branch_key: input.branch_key,
    full_name: input.full_name,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: input.phone,
    role: input.role,
    hire_date: input.hire_date || new Date().toISOString().slice(0, 10),
    is_active: true,
  };

  const { data, error } = await supabase
    .from('dim_employee')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating employee:', error);
    throw new Error(`Failed to create employee: ${error.message}`);
  }

  return data;
}

/**
 * Update an employee
 */
export async function updateEmployee(
  employeeKey: number,
  updates: Partial<CreateEmployeeInput>
): Promise<EmployeeRow> {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('dim_employee')
    .update(updateData)
    .eq('employee_key', employeeKey)
    .select()
    .single();

  if (error) {
    console.error('Error updating employee:', error);
    throw new Error(`Failed to update employee: ${error.message}`);
  }

  return data;
}

/**
 * Deactivate an employee (soft delete)
 */
export async function deactivateEmployee(employeeKey: number): Promise<void> {
  const { error } = await supabase
    .from('dim_employee')
    .update({
      is_active: false,
      termination_date: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq('employee_key', employeeKey);

  if (error) {
    console.error('Error deactivating employee:', error);
    throw new Error(`Failed to deactivate employee: ${error.message}`);
  }
}

/**
 * Link an employee to a Supabase auth user
 */
export async function linkEmployeeToAuth(
  employeeKey: number,
  authUserId: string
): Promise<void> {
  const { error } = await supabase
    .from('dim_employee')
    .update({
      auth_user_id: authUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('employee_key', employeeKey);

  if (error) {
    console.error('Error linking employee to auth:', error);
    throw new Error(`Failed to link employee: ${error.message}`);
  }
}
