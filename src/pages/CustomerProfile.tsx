import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, AlertTriangle, Ban, CheckCircle, Loader2, UserX } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CustomerIdentitySection } from "@/components/customers/profile/CustomerIdentitySection";
import { CustomerContactSection } from "@/components/customers/profile/CustomerContactSection";
import { CustomerProfileSection } from "@/components/customers/profile/CustomerProfileSection";
import { CustomerLoansSection } from "@/components/customers/profile/CustomerLoansSection";
import { getCustomerByKey, type CustomerRow } from "@/services/customer-service";
import { getLoansByCustomer, type LoanRow } from "@/services/loan-service";

interface LoanForDisplay {
  id: string;
  ticket_number: string;
  principal: number;
  item_category: string;
  item_description?: string;
  status: string;
  maturity_date: string;
}

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [loans, setLoans] = useState<LoanForDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch customer by customer_key
        const customerKey = parseInt(id, 10);
        if (isNaN(customerKey)) {
          setIsLoading(false);
          return;
        }

        const customerData = await getCustomerByKey(customerKey);
        if (!customerData) {
          setIsLoading(false);
          return;
        }

        setCustomer(customerData);

        // Fetch customer's loans
        const loansData = await getLoansByCustomer(customerKey);

        // Map to display format
        const loansForDisplay: LoanForDisplay[] = loansData.map(loan => ({
          id: loan.loan_id,
          ticket_number: loan.loan_id,
          principal: loan.principal,
          item_category: loan.item?.category || 'unknown',
          item_description: loan.item?.description,
          status: loan.status,
          maturity_date: loan.maturity_date,
        }));

        setLoans(loansForDisplay);
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getWatchlistVariant = (status: string): "success" | "warning" | "error" => {
    switch (status) {
      case "clear": return "success";
      case "flagged": return "warning";
      case "blocked": return "error";
      default: return "success";
    }
  };

  const getWatchlistIcon = (status: string) => {
    switch (status) {
      case "clear": return <CheckCircle className="w-4 h-4" />;
      case "flagged": return <AlertTriangle className="w-4 h-4" />;
      case "blocked": return <Ban className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!customer) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <UserX className="w-16 h-16 text-text-tertiary mb-4" />
          <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
            Customer Not Found
          </h2>
          <p className="text-text-secondary mb-4">
            The customer you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/customers")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Map CustomerRow to the format expected by the profile components
  const customerForDisplay = {
    ...customer,
    id: customer.customer_id,
    active_loans_count: loans.filter(l => l.status === 'active').length,
    total_loans_taken: loans.length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/customers")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              {customer.photo ? (
                <img
                  src={customer.photo}
                  alt={customer.full_name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-border">
                  <span className="text-xl font-semibold text-primary">
                    {customer.full_name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-heading font-semibold text-text-primary">
                    {customer.full_name}
                  </h1>
                  <StatusBadge variant={getWatchlistVariant(customer.watchlist_status)}>
                    {getWatchlistIcon(customer.watchlist_status)}
                    <span className="ml-1 capitalize">{customer.watchlist_status}</span>
                  </StatusBadge>
                </div>
                <p className="text-text-secondary">
                  Customer since {customer.created_at
                    ? new Date(customer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Sections - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CustomerIdentitySection customer={customerForDisplay} />
          <CustomerContactSection customer={customerForDisplay} />
          <CustomerProfileSection customer={customerForDisplay} />
          <CustomerLoansSection customer={customerForDisplay} loans={loans} />
        </div>
      </div>
    </AppLayout>
  );
}
