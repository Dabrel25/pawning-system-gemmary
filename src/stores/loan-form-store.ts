import { create } from 'zustand';
import { Customer, Item } from '@/types';

interface LoanTerms {
  principal: number;
  interestRate: number;
  period: number;
  serviceFee: number;
}

interface LoanFormState {
  step: number;
  customerData: Partial<Customer>;
  itemData: Partial<Item>;
  loanTerms: Partial<LoanTerms>;
  setStep: (step: number) => void;
  setCustomerData: (data: Partial<Customer>) => void;
  setItemData: (data: Partial<Item>) => void;
  setLoanTerms: (data: Partial<LoanTerms>) => void;
  reset: () => void;
}

export const useLoanFormStore = create<LoanFormState>((set) => ({
  step: 1,
  customerData: {},
  itemData: {},
  loanTerms: {
    principal: 0,
    interestRate: 3,
    period: 30,
    serviceFee: 0,
  },
  setStep: (step) => set({ step }),
  setCustomerData: (data) =>
    set((state) => ({
      customerData: { ...state.customerData, ...data },
    })),
  setItemData: (data) =>
    set((state) => ({
      itemData: { ...state.itemData, ...data },
    })),
  setLoanTerms: (data) =>
    set((state) => ({
      loanTerms: { ...state.loanTerms, ...data },
    })),
  reset: () =>
    set({
      step: 1,
      customerData: {},
      itemData: {},
      loanTerms: {
        principal: 0,
        interestRate: 3,
        period: 30,
        serviceFee: 0,
      },
    }),
}));
