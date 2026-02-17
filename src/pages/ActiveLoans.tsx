import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Download, RefreshCw, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { AvatarCustom } from "@/components/ui/avatar-custom.tsx";
import { LoanStatusBadge } from "@/components/ui/status-badge.tsx";
import { getActiveLoans, deleteLoan, type LoanRow } from "@/services/loan-service";
import { exportLoansToCSV } from "@/lib/csv-export";
import { ExportDialog } from "@/components/ui/export-dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

export default function ActiveLoans() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch loans from Supabase
  const fetchLoans = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const data = await getActiveLoans();
      setLoans(data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleRefresh = () => {
    fetchLoans(true);
  };

  const handleDelete = async (loanKey: number) => {
    if (!confirm("Are you sure you want to delete this loan?")) {
      return;
    }

    setDeletingId(loanKey);
    try {
      await deleteLoan(loanKey);
      toast.success("Loan deleted successfully");
      fetchLoans(true);
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error("Failed to delete loan");
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate days until due for each loan
  const loansWithDays = loans.map(loan => ({
    ...loan,
    daysUntilDue: differenceInDays(new Date(loan.maturity_date), new Date()),
  }));

  // Filter loans
  const filteredLoans = loansWithDays.filter((loan) => {
    const matchesSearch =
      loan.loan_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.customer?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.customer?.phone || '').includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && loan.daysUntilDue > 7) ||
      (statusFilter === "due-soon" && loan.daysUntilDue <= 7 && loan.daysUntilDue > 0) ||
      (statusFilter === "overdue" && loan.daysUntilDue <= 0);

    return matchesSearch && matchesStatus;
  });

  const totalCapital = filteredLoans.reduce((acc, loan) => acc + Number(loan.principal), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-text-primary">
              Active Loans
            </h1>
            <p className="text-text-secondary mt-1">
              {filteredLoans.length} active loans • ₱{totalCapital.toLocaleString()} deployed
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <ExportDialog
              title="Export Loans"
              description="Export loan data to CSV for external systems integration."
              totalRecords={filteredLoans.length}
              disabled={isLoading || filteredLoans.length === 0}
              onExport={(dateRange) => {
                // Add days_until_due to each loan for export
                const loansForExport = filteredLoans.map((loan) => ({
                  ...loan,
                  days_until_due: loan.daysUntilDue,
                }));
                const count = exportLoansToCSV(loansForExport, dateRange);
                if (count === 0) {
                  toast.error("No loans found in selected date range");
                } else {
                  toast.success(`Exported ${count} loans to CSV`);
                }
              }}
            />
            <Link to="/loans/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                New Loan
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <Input
                  type="text"
                  placeholder="Search by ticket number, customer name, or phone..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="due-soon">Due Soon (7 days)</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loans List */}
        <div className="space-y-3">
          {isLoading && (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-text-secondary">Loading loans...</p>
            </div>
          )}

          {!isLoading && filteredLoans.map((loan) => (
            <div
              key={loan.loan_key}
              className="bg-card border-l-4 border-l-accent rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:border-l-primary"
            >
              <div className="flex items-start gap-4">
                {/* Customer Photo */}
                <AvatarCustom src={loan.customer?.photo} size="lg" />

                {/* Loan Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-heading font-semibold text-lg text-text-primary">
                        {loan.customer?.full_name || 'Unknown Customer'}
                      </p>
                      <p className="text-text-tertiary text-sm">
                        Ticket: <span className="font-mono">{loan.loan_id}</span>
                      </p>
                    </div>
                    <LoanStatusBadge
                      status={
                        loan.daysUntilDue <= 0
                          ? "overdue"
                          : loan.daysUntilDue <= 7
                          ? "due-soon"
                          : "active"
                      }
                      daysUntilDue={loan.daysUntilDue}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-text-tertiary text-xs mb-1">Principal</p>
                      <p className="font-heading font-semibold text-text-primary">
                        ₱{Number(loan.principal).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-xs mb-1">Total Due</p>
                      <p className="font-heading font-semibold text-primary">
                        ₱{Number(loan.total_due).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-xs mb-1">Maturity Date</p>
                      <p className="font-semibold text-text-primary">
                        {format(new Date(loan.maturity_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-xs mb-1">Item</p>
                      <p className="font-semibold text-text-primary capitalize">
                        {loan.item?.category || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/loans/renew");
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Renew
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/loans/redeem");
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Redeem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    disabled={deletingId === loan.loan_key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(loan.loan_key);
                    }}
                  >
                    {deletingId === loan.loan_key ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && filteredLoans.length === 0 && (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Search className="w-12 h-12 mx-auto mb-4 text-text-tertiary opacity-50" />
              <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                No loans found
              </h3>
              <p className="text-text-secondary">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-text-tertiary text-sm">
            Showing 1-{filteredLoans.length} of {filteredLoans.length} loans
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
