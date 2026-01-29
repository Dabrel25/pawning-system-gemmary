export interface Customer {
  id: string;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  email?: string;
  address: string;
  idType: 'drivers_license' | 'umid' | 'philhealth' | 'sss' | 'passport';
  idNumber: string;
  photo: string;
  idFrontPhoto: string;
  idBackPhoto: string;
  signature: string;
  watchlistStatus: 'clear' | 'flagged' | 'blocked';
  activeLoansCount: number;
  totalLoansTaken: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  category: 'gold' | 'electronics' | 'mobile' | 'other';
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
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  accessories?: string[];
}

export interface Loan {
  id: string;
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
  status: 'active' | 'renewed' | 'redeemed' | 'forfeited' | 'auctioned';
  paymentStatus: 'current' | 'due-soon' | 'overdue';
  daysUntilDue: number;
  penalties: number;
  branchId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  loanId: string;
  type: 'new_loan' | 'renewal' | 'partial_payment' | 'redemption' | 'forfeiture';
  amount: number;
  paymentMethod: 'cash' | 'bank-transfer' | 'gcash';
  notes?: string;
  processedBy: string;
  processedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'teller';
  branchId: string;
  photo?: string;
}

export interface Activity {
  id: string;
  type: 'new_loan' | 'redemption' | 'renewal' | 'new_customer';
  description: string;
  timestamp: string;
  user: string;
}
