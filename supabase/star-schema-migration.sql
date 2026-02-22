-- ============================================================
-- STAR SCHEMA MIGRATION FOR PAWNING SYSTEM
-- ============================================================
-- This migration creates a proper star schema for analytics,
-- compliance tracking, and future expansion (multi-branch, jewelry POS).
--
-- NOTE: Existing POC tables (loans, customers) are preserved.
-- New star schema tables are created alongside them.
--
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: DROP ONLY STAR SCHEMA TABLES (if they exist)
-- ============================================================
-- Preserves existing POC tables: loans, customers

DROP TABLE IF EXISTS fact_compliance_event CASCADE;
DROP TABLE IF EXISTS fact_cash_position CASCADE;
DROP TABLE IF EXISTS fact_transactions CASCADE;
DROP TABLE IF EXISTS dim_loan CASCADE;
DROP TABLE IF EXISTS dim_item CASCADE;
DROP TABLE IF EXISTS dim_employee CASCADE;
DROP TABLE IF EXISTS dim_branch CASCADE;
DROP TABLE IF EXISTS dim_customer CASCADE;
DROP TABLE IF EXISTS dim_transaction_type CASCADE;
DROP TABLE IF EXISTS dim_date CASCADE;

-- NOTE: NOT dropping old flat tables - keeping them for POC
-- DROP TABLE IF EXISTS loans CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;

-- ============================================================
-- STEP 2: CREATE DIMENSION TABLES
-- ============================================================

-- ------------------------------------------------------------
-- dim_date: Calendar dimension for time-based analytics
-- ------------------------------------------------------------
CREATE TABLE dim_date (
    date_key INTEGER PRIMARY KEY, -- Format: YYYYMMDD
    full_date DATE NOT NULL UNIQUE,
    day_of_week INTEGER NOT NULL, -- 1-7 (Sunday = 1)
    day_of_week_name VARCHAR(10) NOT NULL,
    day_of_month INTEGER NOT NULL,
    day_of_year INTEGER NOT NULL,
    week_of_year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name VARCHAR(10) NOT NULL,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    is_weekend BOOLEAN NOT NULL DEFAULT FALSE,
    is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
    holiday_name VARCHAR(100),
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dim_date_full_date ON dim_date(full_date);
CREATE INDEX idx_dim_date_year_month ON dim_date(year, month);

-- ------------------------------------------------------------
-- dim_branch: Branch/location dimension
-- ------------------------------------------------------------
CREATE TABLE dim_branch (
    branch_key SERIAL PRIMARY KEY,
    branch_id VARCHAR(20) NOT NULL UNIQUE, -- Natural/business key
    name VARCHAR(100) NOT NULL,
    address_line_1 VARCHAR(200),
    address_line_2 VARCHAR(200),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    opening_date DATE,
    closing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dim_branch_active ON dim_branch(is_active) WHERE is_active = TRUE;

-- ------------------------------------------------------------
-- dim_employee: Staff dimension
-- ------------------------------------------------------------
CREATE TABLE dim_employee (
    employee_key SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE, -- Natural/business key
    auth_user_id UUID, -- Link to Supabase auth.users if applicable
    branch_key INTEGER REFERENCES dim_branch(branch_key),
    full_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL, -- 'admin', 'manager', 'teller', 'appraiser'
    hire_date DATE,
    termination_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dim_employee_active ON dim_employee(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_dim_employee_branch ON dim_employee(branch_key);
CREATE INDEX idx_dim_employee_auth ON dim_employee(auth_user_id);

-- ------------------------------------------------------------
-- dim_customer: Customer dimension with SCD Type 2
-- ------------------------------------------------------------
CREATE TABLE dim_customer (
    customer_key SERIAL PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL, -- Natural/business key (not unique due to SCD2)

    -- Identity
    full_name VARCHAR(200) NOT NULL,
    last_name VARCHAR(100),
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    suffix VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(50) DEFAULT 'Filipino',
    gender VARCHAR(10),

    -- ID Information
    id_type VARCHAR(30) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    id_expiry_date DATE,
    id_issuing_authority VARCHAR(100),
    id_front_photo TEXT,
    id_back_photo TEXT,
    photo TEXT,
    signature TEXT,

    -- Contact Information
    address_line_1 VARCHAR(200),
    address_line_2 VARCHAR(200),
    barangay VARCHAR(100),
    city_municipality VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    email VARCHAR(100),
    is_address_verified BOOLEAN DEFAULT FALSE,
    address_proof_type VARCHAR(30),

    -- Profile Information
    occupation VARCHAR(30),
    employer_business_name VARCHAR(200),
    nature_of_work VARCHAR(100),
    monthly_income_range VARCHAR(20),
    source_of_income VARCHAR(50),

    -- PEP Status
    is_pep BOOLEAN DEFAULT FALSE,
    pep_details TEXT,

    -- Transaction Context
    expected_transaction_frequency VARCHAR(20),
    expected_transaction_value VARCHAR(20),

    -- KYC/AML Status
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, verified, rejected
    kyc_verified_at TIMESTAMPTZ,
    kyc_verified_by INTEGER REFERENCES dim_employee(employee_key),
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high
    watchlist_status VARCHAR(20) NOT NULL DEFAULT 'clear', -- clear, flagged, blocked
    watchlist_notes TEXT,

    -- SCD Type 2 Fields
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ DEFAULT '9999-12-31 23:59:59+00',

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES dim_employee(employee_key),
    updated_by INTEGER REFERENCES dim_employee(employee_key)
);

CREATE INDEX idx_dim_customer_current ON dim_customer(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_dim_customer_id ON dim_customer(customer_id);
CREATE INDEX idx_dim_customer_name ON dim_customer(full_name);
CREATE INDEX idx_dim_customer_phone ON dim_customer(phone);
CREATE INDEX idx_dim_customer_id_number ON dim_customer(id_number);
CREATE INDEX idx_dim_customer_watchlist ON dim_customer(watchlist_status);
CREATE INDEX idx_dim_customer_risk ON dim_customer(risk_level);

-- ------------------------------------------------------------
-- dim_transaction_type: Transaction classification
-- ------------------------------------------------------------
CREATE TABLE dim_transaction_type (
    type_key SERIAL PRIMARY KEY,
    type_code VARCHAR(30) NOT NULL UNIQUE,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    cash_flow_direction VARCHAR(10) NOT NULL, -- 'INFLOW', 'OUTFLOW', 'NEUTRAL'
    affects_loan_status BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dim_transaction_type_code ON dim_transaction_type(type_code);
CREATE INDEX idx_dim_transaction_type_active ON dim_transaction_type(is_active);

-- ------------------------------------------------------------
-- dim_item: Collateral/inventory dimension
-- ------------------------------------------------------------
CREATE TABLE dim_item (
    item_key SERIAL PRIMARY KEY,
    item_id VARCHAR(30) NOT NULL UNIQUE, -- Natural/business key
    branch_key INTEGER REFERENCES dim_branch(branch_key),

    -- Classification
    category VARCHAR(30) NOT NULL, -- 'gold', 'electronics', 'mobile', 'other'
    subcategory VARCHAR(50), -- 'necklace', 'ring', 'laptop', etc.

    -- General Fields
    description TEXT,
    photos TEXT[], -- Array of photo URLs

    -- Gold-specific
    gold_type VARCHAR(30), -- 'necklace', 'ring', 'bracelet', etc.
    karat VARCHAR(10), -- '10k', '14k', '18k', '21k', '22k', '24k'
    weight_grams DECIMAL(10, 3),
    purity_percentage DECIMAL(5, 2),

    -- Electronics-specific
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    imei VARCHAR(20),
    item_condition VARCHAR(20), -- 'excellent', 'good', 'fair', 'poor'
    accessories TEXT[],

    -- Valuation
    appraisal_value DECIMAL(12, 2) NOT NULL,
    gold_price_per_gram DECIMAL(10, 2),
    appraised_by INTEGER REFERENCES dim_employee(employee_key),
    appraised_at TIMESTAMPTZ,

    -- Storage
    storage_location VARCHAR(50),
    vault_number VARCHAR(20),
    shelf_number VARCHAR(20),

    -- Ownership/Source
    item_source VARCHAR(30), -- 'owned', 'inherited', 'gift', 'business_inventory'
    ownership_proof TEXT,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pawned', -- 'pawned', 'redeemed', 'forfeited', 'sold', 'returned'

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dim_item_category ON dim_item(category);
CREATE INDEX idx_dim_item_status ON dim_item(status);
CREATE INDEX idx_dim_item_branch ON dim_item(branch_key);
CREATE INDEX idx_dim_item_serial ON dim_item(serial_number) WHERE serial_number IS NOT NULL;

-- ------------------------------------------------------------
-- dim_loan: Pawn ticket/loan dimension
-- ------------------------------------------------------------
CREATE TABLE dim_loan (
    loan_key SERIAL PRIMARY KEY,
    loan_id VARCHAR(30) NOT NULL UNIQUE, -- Ticket number (natural key)
    customer_key INTEGER NOT NULL REFERENCES dim_customer(customer_key),
    item_key INTEGER NOT NULL REFERENCES dim_item(item_key),
    branch_key INTEGER NOT NULL REFERENCES dim_branch(branch_key),
    created_by_employee_key INTEGER REFERENCES dim_employee(employee_key),

    -- Loan Terms
    principal DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL, -- Monthly rate (e.g., 3.00 = 3%)
    term_days INTEGER NOT NULL,
    service_fee DECIMAL(10, 2) DEFAULT 0,

    -- Calculated at creation
    interest_amount DECIMAL(12, 2) NOT NULL,
    total_due DECIMAL(12, 2) NOT NULL,

    -- Dates
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    maturity_date DATE NOT NULL,
    grace_period_days INTEGER DEFAULT 30,
    auction_date DATE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'renewed', 'redeemed', 'forfeited', 'auctioned'

    -- Timestamps for status changes
    renewed_at TIMESTAMPTZ,
    redeemed_at TIMESTAMPTZ,
    forfeited_at TIMESTAMPTZ,
    auctioned_at TIMESTAMPTZ,

    -- Transaction context (for AMLA)
    purpose_of_loan VARCHAR(100),
    transacted_by VARCHAR(100), -- Name if third party
    relationship_to_customer VARCHAR(50),
    authorization_document TEXT,

    -- Parent loan (for renewals)
    parent_loan_key INTEGER REFERENCES dim_loan(loan_key),
    renewal_count INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dim_loan_customer ON dim_loan(customer_key);
CREATE INDEX idx_dim_loan_item ON dim_loan(item_key);
CREATE INDEX idx_dim_loan_status ON dim_loan(status);
CREATE INDEX idx_dim_loan_maturity ON dim_loan(maturity_date);
CREATE INDEX idx_dim_loan_branch ON dim_loan(branch_key);
CREATE INDEX idx_dim_loan_date ON dim_loan(loan_date);

-- ============================================================
-- STEP 3: CREATE FACT TABLES
-- ============================================================

-- ------------------------------------------------------------
-- fact_transactions: Every monetary event
-- ------------------------------------------------------------
CREATE TABLE fact_transactions (
    transaction_key SERIAL PRIMARY KEY,
    transaction_id VARCHAR(30) NOT NULL UNIQUE, -- TRX-YYMMDD-XXXX

    -- Dimension Keys
    date_key INTEGER NOT NULL REFERENCES dim_date(date_key),
    customer_key INTEGER NOT NULL REFERENCES dim_customer(customer_key),
    loan_key INTEGER REFERENCES dim_loan(loan_key),
    item_key INTEGER REFERENCES dim_item(item_key),
    branch_key INTEGER NOT NULL REFERENCES dim_branch(branch_key),
    employee_key INTEGER REFERENCES dim_employee(employee_key),
    type_key INTEGER NOT NULL REFERENCES dim_transaction_type(type_key),

    -- Measures
    principal DECIMAL(12, 2) DEFAULT 0,
    interest DECIMAL(12, 2) DEFAULT 0,
    service_fee DECIMAL(12, 2) DEFAULT 0,
    penalty DECIMAL(12, 2) DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    other_charges DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,

    -- Cash flow (positive = inflow, negative = outflow)
    net_cash_flow DECIMAL(12, 2) NOT NULL,

    -- Payment details
    payment_method VARCHAR(20), -- 'cash', 'bank_transfer', 'gcash', 'maya'
    reference_number VARCHAR(50),

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES dim_employee(employee_key)
);

CREATE INDEX idx_fact_transactions_date ON fact_transactions(date_key);
CREATE INDEX idx_fact_transactions_customer ON fact_transactions(customer_key);
CREATE INDEX idx_fact_transactions_loan ON fact_transactions(loan_key);
CREATE INDEX idx_fact_transactions_branch ON fact_transactions(branch_key);
CREATE INDEX idx_fact_transactions_type ON fact_transactions(type_key);
CREATE INDEX idx_fact_transactions_created ON fact_transactions(created_at);

-- ------------------------------------------------------------
-- fact_cash_position: Daily cash snapshot (for reconciliation)
-- ------------------------------------------------------------
CREATE TABLE fact_cash_position (
    position_key SERIAL PRIMARY KEY,
    date_key INTEGER NOT NULL REFERENCES dim_date(date_key),
    branch_key INTEGER NOT NULL REFERENCES dim_branch(branch_key),

    -- Opening balance
    opening_balance DECIMAL(14, 2) NOT NULL,

    -- Movements
    disbursements DECIMAL(14, 2) DEFAULT 0, -- Cash out (new loans)
    collections DECIMAL(14, 2) DEFAULT 0, -- Cash in (payments, redemptions)
    other_inflows DECIMAL(14, 2) DEFAULT 0,
    other_outflows DECIMAL(14, 2) DEFAULT 0,
    adjustments DECIMAL(14, 2) DEFAULT 0,

    -- Closing balance
    closing_balance DECIMAL(14, 2) NOT NULL,

    -- Verification
    verified_by INTEGER REFERENCES dim_employee(employee_key),
    verified_at TIMESTAMPTZ,
    notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(date_key, branch_key)
);

CREATE INDEX idx_fact_cash_position_date ON fact_cash_position(date_key);
CREATE INDEX idx_fact_cash_position_branch ON fact_cash_position(branch_key);

-- ------------------------------------------------------------
-- fact_compliance_event: KYC/AML audit trail
-- ------------------------------------------------------------
CREATE TABLE fact_compliance_event (
    event_key SERIAL PRIMARY KEY,
    event_id VARCHAR(30) NOT NULL UNIQUE,

    -- Dimension Keys
    date_key INTEGER NOT NULL REFERENCES dim_date(date_key),
    customer_key INTEGER NOT NULL REFERENCES dim_customer(customer_key),
    transaction_key INTEGER REFERENCES fact_transactions(transaction_key),
    branch_key INTEGER NOT NULL REFERENCES dim_branch(branch_key),
    employee_key INTEGER REFERENCES dim_employee(employee_key),

    -- Event details
    event_type VARCHAR(30) NOT NULL, -- 'KYC_VERIFICATION', 'WATCHLIST_SCREEN', 'PEP_CHECK', 'CTR_FILED', 'STR_FILED'
    event_subtype VARCHAR(30),

    -- Screening results
    screening_source VARCHAR(50), -- 'AMLC', 'UN_SANCTIONS', 'OFAC', 'INTERNAL'
    screening_result VARCHAR(20), -- 'CLEAR', 'MATCH', 'POTENTIAL_MATCH', 'ERROR'
    match_score DECIMAL(5, 2),
    matched_name TEXT,
    matched_reason TEXT,

    -- Risk assessment
    risk_score DECIMAL(5, 2),
    risk_factors TEXT[],

    -- Resolution
    resolution_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved', 'escalated'
    resolution_notes TEXT,
    resolved_by INTEGER REFERENCES dim_employee(employee_key),
    resolved_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fact_compliance_date ON fact_compliance_event(date_key);
CREATE INDEX idx_fact_compliance_customer ON fact_compliance_event(customer_key);
CREATE INDEX idx_fact_compliance_type ON fact_compliance_event(event_type);
CREATE INDEX idx_fact_compliance_result ON fact_compliance_event(screening_result);
CREATE INDEX idx_fact_compliance_resolution ON fact_compliance_event(resolution_status);

-- ============================================================
-- STEP 4: ROW LEVEL SECURITY (Permissive for now)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE dim_date ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_branch ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_transaction_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_loan ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_cash_position ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_compliance_event ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all authenticated users for now)
CREATE POLICY "Allow all for dim_date" ON dim_date FOR ALL USING (true);
CREATE POLICY "Allow all for dim_branch" ON dim_branch FOR ALL USING (true);
CREATE POLICY "Allow all for dim_employee" ON dim_employee FOR ALL USING (true);
CREATE POLICY "Allow all for dim_customer" ON dim_customer FOR ALL USING (true);
CREATE POLICY "Allow all for dim_transaction_type" ON dim_transaction_type FOR ALL USING (true);
CREATE POLICY "Allow all for dim_item" ON dim_item FOR ALL USING (true);
CREATE POLICY "Allow all for dim_loan" ON dim_loan FOR ALL USING (true);
CREATE POLICY "Allow all for fact_transactions" ON fact_transactions FOR ALL USING (true);
CREATE POLICY "Allow all for fact_cash_position" ON fact_cash_position FOR ALL USING (true);
CREATE POLICY "Allow all for fact_compliance_event" ON fact_compliance_event FOR ALL USING (true);

-- ============================================================
-- STEP 5: SEED DATA
-- ============================================================

-- ------------------------------------------------------------
-- Seed dim_date: Calendar 2024-2030
-- ------------------------------------------------------------
INSERT INTO dim_date (
    date_key, full_date, day_of_week, day_of_week_name, day_of_month,
    day_of_year, week_of_year, month, month_name, quarter, year,
    is_weekend, is_holiday, fiscal_year, fiscal_quarter
)
SELECT
    TO_CHAR(d, 'YYYYMMDD')::INTEGER AS date_key,
    d AS full_date,
    EXTRACT(DOW FROM d)::INTEGER + 1 AS day_of_week,
    TO_CHAR(d, 'Day') AS day_of_week_name,
    EXTRACT(DAY FROM d)::INTEGER AS day_of_month,
    EXTRACT(DOY FROM d)::INTEGER AS day_of_year,
    EXTRACT(WEEK FROM d)::INTEGER AS week_of_year,
    EXTRACT(MONTH FROM d)::INTEGER AS month,
    TO_CHAR(d, 'Month') AS month_name,
    EXTRACT(QUARTER FROM d)::INTEGER AS quarter,
    EXTRACT(YEAR FROM d)::INTEGER AS year,
    EXTRACT(DOW FROM d) IN (0, 6) AS is_weekend,
    FALSE AS is_holiday,
    EXTRACT(YEAR FROM d)::INTEGER AS fiscal_year,
    EXTRACT(QUARTER FROM d)::INTEGER AS fiscal_quarter
FROM generate_series('2024-01-01'::DATE, '2030-12-31'::DATE, '1 day'::INTERVAL) AS d;

-- Mark Philippine holidays (sample - expand as needed)
UPDATE dim_date SET is_holiday = TRUE, holiday_name = 'New Year''s Day' WHERE month = 1 AND day_of_month = 1;
UPDATE dim_date SET is_holiday = TRUE, holiday_name = 'Araw ng Kagitingan' WHERE month = 4 AND day_of_month = 9;
UPDATE dim_date SET is_holiday = TRUE, holiday_name = 'Labor Day' WHERE month = 5 AND day_of_month = 1;
UPDATE dim_date SET is_holiday = TRUE, holiday_name = 'Independence Day' WHERE month = 6 AND day_of_month = 12;
UPDATE dim_date SET is_holiday = TRUE, holiday_name = 'National Heroes Day' WHERE month = 8 AND day_of_month = 26;
UPDATE dim_date SET is_holiday = TRUE, holiday_name = 'Bonifacio Day' WHERE month = 11 AND day_of_month = 30;
UPDATE dim_date SET is_holiday = TRUE, holiday_name = 'Christmas Day' WHERE month = 12 AND day_of_month = 25;
UPDATE dim_date SET is_holiday = TRUE, holiday_name = 'Rizal Day' WHERE month = 12 AND day_of_month = 30;

-- ------------------------------------------------------------
-- Seed dim_transaction_type
-- ------------------------------------------------------------
INSERT INTO dim_transaction_type (type_code, type_name, description, cash_flow_direction, affects_loan_status, sort_order) VALUES
('NEW_LOAN', 'New Loan', 'New pawn loan disbursement', 'OUTFLOW', TRUE, 1),
('REDEMPTION', 'Redemption', 'Full loan redemption (principal + interest)', 'INFLOW', TRUE, 2),
('RENEWAL', 'Renewal', 'Loan renewal with interest payment', 'INFLOW', TRUE, 3),
('PARTIAL_PAYMENT', 'Partial Payment', 'Partial payment towards loan', 'INFLOW', FALSE, 4),
('INTEREST_PAYMENT', 'Interest Payment', 'Interest-only payment', 'INFLOW', FALSE, 5),
('PENALTY_PAYMENT', 'Penalty Payment', 'Late payment penalty', 'INFLOW', FALSE, 6),
('FEE_COLLECTION', 'Fee Collection', 'Service or miscellaneous fee', 'INFLOW', FALSE, 7),
('FORFEITURE', 'Forfeiture', 'Item forfeited due to non-payment', 'NEUTRAL', TRUE, 8),
('AUCTION_SALE', 'Auction Sale', 'Sale of forfeited item at auction', 'INFLOW', FALSE, 9),
('JEWELRY_SALE', 'Jewelry Sale', 'Direct sale of jewelry (retail)', 'INFLOW', FALSE, 10),
('PRENDA_PALIT', 'Prenda Palit', 'Trade-in: jewelry for cash + item', 'OUTFLOW', FALSE, 11),
('PALIT_PRENDA', 'Palit Prenda', 'Trade-in: cash + item for jewelry', 'INFLOW', FALSE, 12),
('ADJUSTMENT', 'Adjustment', 'Manual adjustment or correction', 'NEUTRAL', FALSE, 99);

-- ------------------------------------------------------------
-- Seed dim_branch: Default branch
-- ------------------------------------------------------------
INSERT INTO dim_branch (
    branch_id, name, address_line_1, city, province, phone, email, manager_name, is_active, opening_date
) VALUES (
    'BR-001',
    'Gemmary Bogo City Main',
    'J. Almirante corner R. Fernan St.',
    'Bogo City',
    'Cebu',
    '(032) 123-4567',
    'bogocity@gemmary.ph',
    'Juan Dela Cruz',
    TRUE,
    '2024-01-01'
);

-- ------------------------------------------------------------
-- Seed dim_employee: Default admin
-- ------------------------------------------------------------
INSERT INTO dim_employee (
    employee_id, branch_key, full_name, first_name, last_name, email, role, hire_date, is_active
) VALUES (
    'EMP-001',
    1, -- References the branch we just created
    'System Administrator',
    'System',
    'Administrator',
    'admin@gemmary.ph',
    'admin',
    '2024-01-01',
    TRUE
);

-- ============================================================
-- STEP 6: HELPER FUNCTIONS
-- ============================================================

-- Function to get current date_key
CREATE OR REPLACE FUNCTION get_current_date_key()
RETURNS INTEGER AS $$
BEGIN
    RETURN TO_CHAR(CURRENT_DATE, 'YYYYMMDD')::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Function to generate transaction ID
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS VARCHAR(30) AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(SUBSTRING(transaction_id FROM 13)::INTEGER), 0) + 1
    INTO seq_num
    FROM fact_transactions
    WHERE DATE(created_at) = CURRENT_DATE;

    RETURN 'TRX-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate loan ID (ticket number)
CREATE OR REPLACE FUNCTION generate_loan_id()
RETURNS VARCHAR(30) AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(SUBSTRING(loan_id FROM 10)::INTEGER), 0) + 1
    INTO seq_num
    FROM dim_loan
    WHERE DATE(created_at) = CURRENT_DATE;

    RETURN 'PT' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate item ID
CREATE OR REPLACE FUNCTION generate_item_id()
RETURNS VARCHAR(30) AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(SUBSTRING(item_id FROM 10)::INTEGER), 0) + 1
    INTO seq_num
    FROM dim_item
    WHERE DATE(created_at) = CURRENT_DATE;

    RETURN 'ITM' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate customer ID
CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS VARCHAR(20) AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COUNT(DISTINCT customer_id) + 1
    INTO seq_num
    FROM dim_customer;

    RETURN 'CUS-' || LPAD(seq_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to close old customer record (SCD Type 2)
CREATE OR REPLACE FUNCTION close_customer_record(p_customer_key INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE dim_customer
    SET is_current = FALSE,
        valid_to = NOW(),
        updated_at = NOW()
    WHERE customer_key = p_customer_key
    AND is_current = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================================
--
-- -- Check table counts
-- SELECT 'dim_date' as table_name, COUNT(*) as row_count FROM dim_date
-- UNION ALL
-- SELECT 'dim_branch', COUNT(*) FROM dim_branch
-- UNION ALL
-- SELECT 'dim_employee', COUNT(*) FROM dim_employee
-- UNION ALL
-- SELECT 'dim_transaction_type', COUNT(*) FROM dim_transaction_type;
--
-- -- Check date range
-- SELECT MIN(full_date) as start_date, MAX(full_date) as end_date FROM dim_date;
--
-- -- Check transaction types
-- SELECT type_code, type_name, cash_flow_direction FROM dim_transaction_type ORDER BY sort_order;
--
-- ============================================================
-- STEP 7: UNSC WATCHLIST TABLE FOR KYC SCREENING
-- ============================================================

DROP TABLE IF EXISTS watchlist_unsc CASCADE;

CREATE TABLE watchlist_unsc (
    record_id VARCHAR(20) PRIMARY KEY,
    primary_name VARCHAR(500) NOT NULL,
    alias_1 VARCHAR(500),
    alias_2 VARCHAR(500),
    alias_3 VARCHAR(500),
    alias_4 VARCHAR(500),
    alias_5 VARCHAR(500),
    alias_6 VARCHAR(500),
    alias_7 VARCHAR(500),
    alias_8 VARCHAR(500),
    alias_9 VARCHAR(500),
    alias_10 VARCHAR(500),
    dob VARCHAR(100),
    pob VARCHAR(500),
    nationality VARCHAR(200),
    passport_no TEXT,
    national_id TEXT,
    title VARCHAR(100),
    designation TEXT,
    address TEXT,
    listed_on VARCHAR(500),
    other_information TEXT,
    interpol_un_link TEXT,
    name_parts_raw TEXT,
    full_record_raw TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient searching
CREATE INDEX idx_watchlist_primary_name ON watchlist_unsc USING gin(to_tsvector('simple', primary_name));
CREATE INDEX idx_watchlist_aliases ON watchlist_unsc USING gin(to_tsvector('simple',
    COALESCE(alias_1, '') || ' ' ||
    COALESCE(alias_2, '') || ' ' ||
    COALESCE(alias_3, '') || ' ' ||
    COALESCE(alias_4, '') || ' ' ||
    COALESCE(alias_5, '')
));
CREATE INDEX idx_watchlist_nationality ON watchlist_unsc(nationality);
CREATE INDEX idx_watchlist_national_id ON watchlist_unsc(national_id);

-- Enable RLS
ALTER TABLE watchlist_unsc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for watchlist_unsc" ON watchlist_unsc FOR SELECT USING (true);

-- ============================================================
-- STEP 8: IMPORT UNSC WATCHLIST DATA
-- ============================================================
-- 726 records from UN Security Council Consolidated Sanctions List
--
-- NOTE: For Supabase SQL Editor, use the combined file instead:
--       supabase/full-migration.sql
--
-- This includes both the schema AND the watchlist data.
-- ============================================================

-- ============================================================
-- END OF MIGRATION
-- ============================================================
