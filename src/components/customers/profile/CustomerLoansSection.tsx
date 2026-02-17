import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Package, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Customer } from "@/services/customer-service";

interface Loan {
  id: string;
  ticket_number: string;
  principal: number;
  item_category: string;
  item_description?: string;
  status: string;
  maturity_date: string;
  days_until_due?: number;
}

interface CustomerLoansSectionProps {
  customer: Customer;
  loans?: Loan[];
}

export function CustomerLoansSection({ customer, loans = [] }: CustomerLoansSectionProps) {
  const navigate = useNavigate();

  const activeLoans = loans.filter((l) => l.status === "active");
  const totalPrincipal = loans.reduce((sum, l) => sum + (l.principal || 0), 0);

  const getPaymentStatus = (loan: Loan): "current" | "due-soon" | "overdue" => {
    if (!loan.maturity_date) return "current";
    const daysUntilDue = Math.ceil(
      (new Date(loan.maturity_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= 7) return "due-soon";
    return "current";
  };

  const getPaymentStatusVariant = (status: "current" | "due-soon" | "overdue"): "success" | "warning" | "error" => {
    switch (status) {
      case "current": return "success";
      case "due-soon": return "warning";
      case "overdue": return "error";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "gold": return "💎";
      case "electronics": return "💻";
      case "mobile": return "📱";
      default: return "📦";
    }
  };

  const getDaysUntilDue = (loan: Loan): number => {
    if (!loan.maturity_date) return 0;
    return Math.ceil(
      (new Date(loan.maturity_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-brand-gold" />
          Loan History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-heading font-bold text-text-primary">
              {customer.active_loans_count || activeLoans.length}
            </p>
            <p className="text-xs text-text-tertiary">Active Loans</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-heading font-bold text-text-primary">
              {customer.total_loans_taken || loans.length}
            </p>
            <p className="text-xs text-text-tertiary">Total Loans</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-heading font-bold text-brand-gold">
              ₱{totalPrincipal.toLocaleString()}
            </p>
            <p className="text-xs text-text-tertiary">Total Principal</p>
          </div>
        </div>

        {/* Active Loans List */}
        {activeLoans.length > 0 ? (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-text-primary mb-3">Active Loans</p>
            <div className="space-y-3">
              {activeLoans.map((loan) => {
                const paymentStatus = getPaymentStatus(loan);
                const daysUntilDue = getDaysUntilDue(loan);

                return (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/loans`)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(loan.item_category)}</span>
                      <div>
                        <p className="font-medium text-text-primary text-sm">
                          {loan.ticket_number}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {loan.item_description || loan.item_category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-text-primary">
                        ₱{loan.principal.toLocaleString()}
                      </p>
                      <StatusBadge variant={getPaymentStatusVariant(paymentStatus)} className="text-xs">
                        {paymentStatus === "due-soon"
                          ? `Due in ${daysUntilDue}d`
                          : paymentStatus === "overdue"
                          ? `${Math.abs(daysUntilDue)}d overdue`
                          : "Current"
                        }
                      </StatusBadge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border-t border-border pt-4 text-center py-6">
            <Package className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
            <p className="text-text-secondary text-sm">No active loans</p>
          </div>
        )}

        {/* Create New Loan Button */}
        <Button
          className="w-full"
          onClick={() => navigate(`/loans/new?customerId=${customer.id}`)}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Create New Loan
        </Button>
      </CardContent>
    </Card>
  );
}
