/**
 * CSV Export Utility
 * Exports data to CSV format for integration with external systems
 */

interface ExportOptions {
  filename: string;
  headers?: Record<string, string>; // Map field names to display headers
  excludeFields?: string[]; // Fields to exclude from export
}

/**
 * Convert an array of objects to CSV string
 */
function objectsToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: Record<string, string>,
  excludeFields: string[] = []
): string {
  if (data.length === 0) return '';

  // Get all unique keys from the data, excluding specified fields
  const allKeys = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  ).filter((key) => !excludeFields.includes(key));

  // Create header row using custom headers if provided
  const headerRow = allKeys
    .map((key) => {
      const header = headers?.[key] || key;
      return escapeCSVField(header);
    })
    .join(',');

  // Create data rows
  const dataRows = data.map((obj) =>
    allKeys
      .map((key) => {
        const value = obj[key];
        return escapeCSVField(formatValue(value));
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape special characters in CSV fields
 */
function escapeCSVField(value: string): string {
  // If the value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format values for CSV export
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.join('; ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Trigger download of CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions
): void {
  const csvContent = objectsToCSV(data, options.headers, options.excludeFields);
  downloadCSV(csvContent, options.filename);
}

/**
 * Customer CSV Export Configuration
 */
export const CUSTOMER_CSV_CONFIG = {
  headers: {
    customer_id: 'Customer ID',
    full_name: 'Full Name',
    last_name: 'Last Name',
    first_name: 'First Name',
    middle_name: 'Middle Name',
    suffix: 'Suffix',
    date_of_birth: 'Date of Birth',
    gender: 'Gender',
    nationality: 'Nationality',
    id_type: 'ID Type',
    id_number: 'ID Number',
    id_expiry_date: 'ID Expiry Date',
    id_issuing_authority: 'ID Issuing Authority',
    phone: 'Phone',
    alternate_phone: 'Alternate Phone',
    email: 'Email',
    address: 'Address',
    address_line_1: 'Address Line 1',
    address_line_2: 'Address Line 2',
    barangay: 'Barangay',
    city_municipality: 'City/Municipality',
    province: 'Province',
    postal_code: 'Postal Code',
    occupation: 'Occupation',
    employer_business_name: 'Employer/Business',
    nature_of_work: 'Nature of Work',
    monthly_income_range: 'Monthly Income Range',
    source_of_income: 'Source of Income',
    is_pep: 'Is PEP',
    pep_details: 'PEP Details',
    kyc_status: 'KYC Status',
    risk_level: 'Risk Level',
    watchlist_status: 'Watchlist Status',
    created_at: 'Created At',
    updated_at: 'Updated At',
    activeLoansCount: 'Active Loans',
    totalLoansTaken: 'Total Loans',
  },
  excludeFields: [
    'customer_key',
    'photo',
    'id_front_photo',
    'id_back_photo',
    'signature',
    'is_current',
    'valid_from',
    'valid_to',
    'created_by',
    'updated_by',
    'kyc_verified_by',
    'kyc_verified_at',
    'watchlist_notes',
    'is_address_verified',
    'address_proof_type',
    'expected_transaction_frequency',
    'expected_transaction_value',
  ],
};

/**
 * Loan CSV Export Configuration
 */
export const LOAN_CSV_CONFIG = {
  headers: {
    loan_id: 'Ticket Number',
    customer_name: 'Customer Name',
    customer_phone: 'Customer Phone',
    item_category: 'Item Category',
    item_description: 'Item Description',
    principal: 'Principal (₱)',
    interest_rate: 'Interest Rate (%)',
    term_days: 'Term (Days)',
    service_fee: 'Service Fee (₱)',
    interest_amount: 'Interest Amount (₱)',
    total_due: 'Total Due (₱)',
    loan_date: 'Loan Date',
    maturity_date: 'Maturity Date',
    status: 'Status',
    days_until_due: 'Days Until Due',
    purpose_of_loan: 'Purpose of Loan',
    renewal_count: 'Renewal Count',
    created_at: 'Created At',
  },
  excludeFields: [
    'loan_key',
    'customer_key',
    'item_key',
    'branch_key',
    'created_by_employee_key',
    'parent_loan_key',
    'customer',
    'item',
    'branch',
    'grace_period_days',
    'auction_date',
    'renewed_at',
    'redeemed_at',
    'forfeited_at',
    'auctioned_at',
    'transacted_by',
    'relationship_to_customer',
    'authorization_document',
    'updated_at',
  ],
};

/**
 * Filter records by date range
 */
export function filterByDateRange<T extends Record<string, unknown>>(
  data: T[],
  dateRange: { from: Date; to: Date } | null,
  dateField: string = 'created_at'
): T[] {
  if (!dateRange) return data;

  const { from, to } = dateRange;
  // Set to start of day for from, end of day for to
  const fromDate = new Date(from);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  return data.filter((item) => {
    const itemDate = item[dateField];
    if (!itemDate) return false;
    const date = new Date(itemDate as string);
    return date >= fromDate && date <= toDate;
  });
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(
  customers: Record<string, unknown>[],
  dateRange: { from: Date; to: Date } | null = null,
  filenamePrefix = 'customers'
): number {
  // Filter by date range if provided
  const filteredCustomers = filterByDateRange(customers, dateRange, 'created_at');

  if (filteredCustomers.length === 0) {
    return 0;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const rangeSuffix = dateRange
    ? `_${dateRange.from.toISOString().slice(0, 10)}_to_${dateRange.to.toISOString().slice(0, 10)}`
    : '_all';

  exportToCSV(filteredCustomers, {
    filename: `${filenamePrefix}${rangeSuffix}_exported_${timestamp}`,
    headers: CUSTOMER_CSV_CONFIG.headers,
    excludeFields: CUSTOMER_CSV_CONFIG.excludeFields,
  });

  return filteredCustomers.length;
}

/**
 * Export loans to CSV
 */
export function exportLoansToCSV(
  loans: Record<string, unknown>[],
  dateRange: { from: Date; to: Date } | null = null,
  filenamePrefix = 'loans'
): number {
  // Filter by date range if provided (using loan_date)
  const filteredLoans = filterByDateRange(loans, dateRange, 'loan_date');

  if (filteredLoans.length === 0) {
    return 0;
  }

  // Flatten nested customer and item data
  const flattenedLoans = filteredLoans.map((loan) => {
    const customer = loan.customer as Record<string, unknown> | undefined;
    const item = loan.item as Record<string, unknown> | undefined;

    return {
      ...loan,
      customer_name: customer?.full_name || '',
      customer_phone: customer?.phone || '',
      item_category: item?.category || '',
      item_description: item?.description || '',
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const rangeSuffix = dateRange
    ? `_${dateRange.from.toISOString().slice(0, 10)}_to_${dateRange.to.toISOString().slice(0, 10)}`
    : '_all';

  exportToCSV(flattenedLoans, {
    filename: `${filenamePrefix}${rangeSuffix}_exported_${timestamp}`,
    headers: LOAN_CSV_CONFIG.headers,
    excludeFields: LOAN_CSV_CONFIG.excludeFields,
  });

  return filteredLoans.length;
}
