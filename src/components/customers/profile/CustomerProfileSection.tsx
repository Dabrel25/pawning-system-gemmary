import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building2, Wallet, TrendingUp, AlertTriangle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/services/customer-service";

interface CustomerProfileSectionProps {
  customer: Customer;
}

const OCCUPATION_LABELS: Record<string, string> = {
  employed: "Employed",
  self_employed: "Self-Employed",
  unemployed: "Unemployed",
  student: "Student",
  retired: "Retired",
};

const INCOME_LABELS: Record<string, string> = {
  "<10k": "Below ₱10,000",
  "10k-30k": "₱10,000 - ₱30,000",
  "30k-50k": "₱30,000 - ₱50,000",
  "50k-100k": "₱50,000 - ₱100,000",
  ">100k": "Above ₱100,000",
  "undisclosed": "Undisclosed",
};

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
};

const FREQUENCY_LABELS: Record<string, string> = {
  first_time: "First Time",
  occasional: "Occasional (few times/year)",
  regular: "Regular (monthly)",
};

const VALUE_LABELS: Record<string, string> = {
  "<10k": "Below ₱10,000",
  "10k-50k": "₱10,000 - ₱50,000",
  "50k-100k": "₱50,000 - ₱100,000",
  ">100k": "Above ₱100,000",
};

export function CustomerProfileSection({ customer }: CustomerProfileSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="w-5 h-5 text-brand-gold" />
          Customer Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personal */}
        {customer.gender && (
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs text-text-tertiary">Gender</p>
              <p className="font-medium text-text-primary">
                {GENDER_LABELS[customer.gender] || customer.gender}
              </p>
            </div>
          </div>
        )}

        {/* Occupation & Income */}
        <div className="space-y-3">
          {customer.occupation && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">Occupation</p>
                <p className="font-medium text-text-primary">
                  {OCCUPATION_LABELS[customer.occupation] || customer.occupation}
                </p>
              </div>
            </div>
          )}

          {customer.employer_business_name && (
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">Employer / Business</p>
                <p className="font-medium text-text-primary">{customer.employer_business_name}</p>
              </div>
            </div>
          )}

          {customer.nature_of_work && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">Nature of Work</p>
                <p className="font-medium text-text-primary">{customer.nature_of_work}</p>
              </div>
            </div>
          )}

          {customer.monthly_income_range && (
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">Monthly Income Range</p>
                <p className="font-medium text-text-primary">
                  {INCOME_LABELS[customer.monthly_income_range] || customer.monthly_income_range}
                </p>
              </div>
            </div>
          )}

          {customer.source_of_income && (
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">Source of Income</p>
                <p className="font-medium text-text-primary">{customer.source_of_income}</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Pattern */}
        {(customer.expected_transaction_frequency || customer.expected_transaction_value) && (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-text-primary mb-3">Expected Transaction Pattern</p>
            <div className="space-y-3">
              {customer.expected_transaction_frequency && (
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <p className="text-xs text-text-tertiary">Frequency</p>
                    <p className="font-medium text-text-primary">
                      {FREQUENCY_LABELS[customer.expected_transaction_frequency] || customer.expected_transaction_frequency}
                    </p>
                  </div>
                </div>
              )}
              {customer.expected_transaction_value && (
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <p className="text-xs text-text-tertiary">Expected Value</p>
                    <p className="font-medium text-text-primary">
                      {VALUE_LABELS[customer.expected_transaction_value] || customer.expected_transaction_value}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PEP Status */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-primary">Politically Exposed Person (PEP)</span>
            </div>
            {customer.is_pep ? (
              <Badge variant="destructive">Yes</Badge>
            ) : (
              <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                No
              </Badge>
            )}
          </div>
          {customer.is_pep && customer.pep_details && (
            <p className="mt-2 text-sm text-text-secondary bg-error/10 p-2 rounded">
              {customer.pep_details}
            </p>
          )}
        </div>

        {/* Show message if no profile data */}
        {!customer.gender && !customer.occupation && !customer.monthly_income_range && (
          <div className="text-center py-4 text-text-tertiary text-sm">
            No profile information available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
