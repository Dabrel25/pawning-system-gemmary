// ============================================================
// TYPE DEFINITIONS FOR STAR SCHEMA
// ============================================================

// Customer Identity Types
export type IdType =
  | 'drivers_license'
  | 'passport'
  | 'umid'
  | 'sss'
  | 'philhealth'
  | 'voters_id'
  | 'tin'
  | 'postal_id'
  | 'prc_license';

export type AddressProofType = 'utility_bill' | 'bank_statement' | 'barangay_certificate';

export type OccupationType = 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired';

export type IncomeRange = '<10k' | '10k-30k' | '30k-50k' | '50k-100k' | '>100k' | 'undisclosed';

export type Gender = 'male' | 'female';

export type ItemSource = 'owned' | 'inherited' | 'gift' | 'business_inventory';

export type TransactionFrequency = 'first_time' | 'occasional' | 'regular';

export type TransactionValueRange = '<10k' | '10k-50k' | '50k-100k' | '>100k';

export type KycStatus = 'pending' | 'verified' | 'rejected';

export type RiskLevel = 'low' | 'medium' | 'high';

export type WatchlistStatus = 'clear' | 'flagged' | 'blocked';

export type LoanStatus = 'active' | 'renewed' | 'redeemed' | 'forfeited' | 'auctioned';

export type ItemStatus = 'pawned' | 'redeemed' | 'forfeited' | 'sold' | 'returned';

export type ItemCategory = 'gold' | 'electronics' | 'mobile' | 'other';

export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'gcash' | 'maya';

export type CashFlowDirection = 'INFLOW' | 'OUTFLOW' | 'NEUTRAL';

export type EmployeeRole = 'admin' | 'manager' | 'teller' | 'appraiser';

// ============================================================
// DIMENSION TABLE INTERFACES
// ============================================================

// dim_date
export interface DimDate {
  date_key: number;
  full_date: string;
  day_of_week: number;
  day_of_week_name: string;
  day_of_month: number;
  day_of_year: number;
  week_of_year: number;
  month: number;
  month_name: string;
  quarter: number;
  year: number;
  is_weekend: boolean;
  is_holiday: boolean;
  holiday_name?: string;
  fiscal_year?: number;
  fiscal_quarter?: number;
}

// dim_branch
export interface DimBranch {
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

// dim_employee
export interface DimEmployee {
  employee_key: number;
  employee_id: string;
  auth_user_id?: string;
  branch_key?: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role: EmployeeRole;
  hire_date?: string;
  termination_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  branch?: DimBranch;
}

// dim_customer (SCD Type 2)
export interface DimCustomer {
  customer_key: number;
  customer_id: string;

  // Identity
  full_name: string;
  last_name?: string;
  first_name?: string;
  middle_name?: string;
  suffix?: string;
  date_of_birth?: string;
  nationality?: string;
  gender?: Gender;

  // ID Information
  id_type: IdType;
  id_number: string;
  id_expiry_date?: string;
  id_issuing_authority?: string;
  id_front_photo?: string;
  id_back_photo?: string;
  photo?: string;
  signature?: string;

  // Contact Information
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
  address_proof_type?: AddressProofType;

  // Profile Information
  occupation?: OccupationType;
  employer_business_name?: string;
  nature_of_work?: string;
  monthly_income_range?: IncomeRange;
  source_of_income?: string;

  // PEP Status
  is_pep?: boolean;
  pep_details?: string;

  // Transaction Context
  expected_transaction_frequency?: TransactionFrequency;
  expected_transaction_value?: TransactionValueRange;

  // KYC/AML Status
  kyc_status: KycStatus;
  kyc_verified_at?: string;
  kyc_verified_by?: number;
  risk_level: RiskLevel;
  watchlist_status: WatchlistStatus;
  watchlist_notes?: string;

  // SCD Type 2 Fields
  is_current: boolean;
  valid_from: string;
  valid_to?: string;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

// dim_transaction_type
export interface DimTransactionType {
  type_key: number;
  type_code: string;
  type_name: string;
  description?: string;
  cash_flow_direction: CashFlowDirection;
  affects_loan_status: boolean;
  is_active: boolean;
  sort_order: number;
}

// dim_item
export interface DimItem {
  item_key: number;
  item_id: string;
  branch_key?: number;

  // Classification
  category: ItemCategory;
  subcategory?: string;

  // General Fields
  description?: string;
  photos?: string[];

  // Gold-specific
  gold_type?: string;
  karat?: string;
  weight_grams?: number;
  purity_percentage?: number;

  // Electronics-specific
  brand?: string;
  model?: string;
  serial_number?: string;
  imei?: string;
  item_condition?: ItemCondition;
  accessories?: string[];

  // Valuation
  appraisal_value: number;
  gold_price_per_gram?: number;
  appraised_by?: number;
  appraised_at?: string;

  // Storage
  storage_location?: string;
  vault_number?: string;
  shelf_number?: string;

  // Ownership/Source
  item_source?: ItemSource;
  ownership_proof?: string;

  // Status
  status: ItemStatus;

  // Audit
  created_at: string;
  updated_at: string;
}

// dim_loan
export interface DimLoan {
  loan_key: number;
  loan_id: string;
  customer_key: number;
  item_key: number;
  branch_key: number;
  created_by_employee_key?: number;

  // Loan Terms
  principal: number;
  interest_rate: number;
  term_days: number;
  service_fee: number;

  // Calculated
  interest_amount: number;
  total_due: number;

  // Dates
  loan_date: string;
  maturity_date: string;
  grace_period_days?: number;
  auction_date?: string;

  // Status
  status: LoanStatus;

  // Timestamps
  renewed_at?: string;
  redeemed_at?: string;
  forfeited_at?: string;
  auctioned_at?: string;

  // Transaction context
  purpose_of_loan?: string;
  transacted_by?: string;
  relationship_to_customer?: string;
  authorization_document?: string;

  // Parent loan
  parent_loan_key?: number;
  renewal_count: number;

  // Audit
  created_at: string;
  updated_at: string;

  // Joined data
  customer?: DimCustomer;
  item?: DimItem;
  branch?: DimBranch;
}

// ============================================================
// FACT TABLE INTERFACES
// ============================================================

// fact_transactions
export interface FactTransaction {
  transaction_key: number;
  transaction_id: string;

  // Dimension Keys
  date_key: number;
  customer_key: number;
  loan_key?: number;
  item_key?: number;
  branch_key: number;
  employee_key?: number;
  type_key: number;

  // Measures
  principal: number;
  interest: number;
  service_fee: number;
  penalty: number;
  discount: number;
  other_charges: number;
  total_amount: number;
  net_cash_flow: number;

  // Payment details
  payment_method?: PaymentMethod;
  reference_number?: string;

  // Notes
  notes?: string;

  // Audit
  created_at: string;
  created_by?: number;

  // Joined data
  customer?: DimCustomer;
  loan?: DimLoan;
  item?: DimItem;
  branch?: DimBranch;
  employee?: DimEmployee;
  transaction_type?: DimTransactionType;
}

// fact_cash_position
export interface FactCashPosition {
  position_key: number;
  date_key: number;
  branch_key: number;

  opening_balance: number;
  disbursements: number;
  collections: number;
  other_inflows: number;
  other_outflows: number;
  adjustments: number;
  closing_balance: number;

  verified_by?: number;
  verified_at?: string;
  notes?: string;

  created_at: string;
  updated_at: string;
}

// fact_compliance_event
export interface FactComplianceEvent {
  event_key: number;
  event_id: string;

  date_key: number;
  customer_key: number;
  transaction_key?: number;
  branch_key: number;
  employee_key?: number;

  event_type: string;
  event_subtype?: string;

  screening_source?: string;
  screening_result?: string;
  match_score?: number;
  matched_name?: string;
  matched_reason?: string;

  risk_score?: number;
  risk_factors?: string[];

  resolution_status: 'pending' | 'resolved' | 'escalated';
  resolution_notes?: string;
  resolved_by?: number;
  resolved_at?: string;

  created_at: string;
}

// ============================================================
// LEGACY INTERFACES (for backwards compatibility during transition)
// ============================================================

// Legacy Customer interface (maps to dim_customer for UI)
export interface Customer {
  id: string; // Maps to customer_id
  customer_key?: number;

  // Identity
  fullName: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  suffix?: string;
  dateOfBirth: string;
  nationality?: string;

  // ID Information
  idType: IdType;
  idNumber: string;
  idExpiryDate?: string;
  idIssuingAuthority?: string;
  idFrontPhoto?: string;
  idBackPhoto?: string;
  photo?: string;
  signature?: string;

  // Contact Information
  addressLine1?: string;
  addressLine2?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  postalCode?: string;
  address: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  isAddressVerified?: boolean;
  addressProofType?: AddressProofType;

  // Profile Information
  occupation?: OccupationType;
  employerBusinessName?: string;
  natureOfWork?: string;
  monthlyIncomeRange?: IncomeRange;
  sourceOfIncome?: string;
  gender?: Gender;

  // PEP Status
  isPep?: boolean;
  pepDetails?: string;

  // Transaction Context
  expectedTransactionFrequency?: TransactionFrequency;
  expectedTransactionValue?: TransactionValueRange;
  purposeOfLoan?: string;
  transactedBy?: string;
  relationshipToCustomer?: string;

  // KYC/AML Status
  kycStatus?: KycStatus;
  riskLevel?: RiskLevel;
  watchlistStatus: WatchlistStatus;

  // Stats (computed)
  activeLoansCount: number;
  totalLoansTaken: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Legacy Item interface (maps to dim_item for UI)
export interface Item {
  id: string; // Maps to item_id
  item_key?: number;
  category: ItemCategory;
  photos: string[];
  appraisalValue: number;
  description?: string;
  // Gold specific
  goldType?: string;
  weight?: number;
  karat?: string;
  pricePerGram?: number;
  // Electronics specific
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition?: ItemCondition;
  accessories?: string[];
  // Transaction context
  itemSource?: ItemSource;
  itemOwnershipProof?: string;
}

// Legacy Loan interface (maps to dim_loan for UI)
export interface Loan {
  id: string; // Maps to loan_id (ticket number)
  loan_key?: number;
  ticketNumber: string;
  customerId: string;
  customer: Customer;
  itemId: string;
  item: Item;
  principal: number;
  interestRate: number;
  loanPeriodDays: number;
  serviceFee: number;
  loanDate: string;
  maturityDate: string;
  totalDue: number;
  status: LoanStatus;
  paymentStatus: 'current' | 'due-soon' | 'overdue';
  daysUntilDue: number;
  penalties: number;
  branchId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Transaction context
  purposeOfLoan?: string;
  transactedBy?: string;
  relationshipToCustomer?: string;
  authorizationDocument?: string;
}

// Legacy Transaction interface
export interface Transaction {
  id: string;
  loanId: string;
  type: 'new_loan' | 'renewal' | 'partial_payment' | 'redemption' | 'forfeiture';
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  processedBy: string;
  processedAt: string;
}

// Legacy Branch interface
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

// Legacy User interface (maps to dim_employee)
export interface User {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  branchId: string;
  photo?: string;
}

// Legacy Activity interface
export interface Activity {
  id: string;
  type: 'new_loan' | 'redemption' | 'renewal' | 'new_customer';
  description: string;
  timestamp: string;
  user: string;
}

// ============================================================
// INPUT TYPES FOR CREATING RECORDS
// ============================================================

export interface CreateCustomerInput {
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
  watchlist_status?: string;
}

export interface CreateItemInput {
  branch_key: number;
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
  item_source?: string;
  ownership_proof?: string;
}

export interface CreateLoanInput {
  customer_key: number;
  item_key: number;
  branch_key: number;
  created_by_employee_key?: number;
  principal: number;
  interest_rate: number;
  term_days: number;
  service_fee?: number;
  interest_amount: number;
  total_due: number;
  loan_date?: string;
  maturity_date: string;
  purpose_of_loan?: string;
  transacted_by?: string;
  relationship_to_customer?: string;
  authorization_document?: string;
}

export interface CreateTransactionInput {
  customer_key: number;
  loan_key?: number;
  item_key?: number;
  branch_key: number;
  employee_key?: number;
  type_key: number;
  principal?: number;
  interest?: number;
  service_fee?: number;
  penalty?: number;
  discount?: number;
  other_charges?: number;
  total_amount: number;
  net_cash_flow: number;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export interface DashboardStats {
  cashDisbursedToday: number;
  cashCollectedToday: number;
  activeLoans: number;
  loansDueToday: number;
  totalCapitalOut: number;
  dueSoonCount: number;
  overdueCount: number;
}
