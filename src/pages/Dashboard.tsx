import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { Plus, TrendingUp, ArrowDownCircle, Package, Wallet, PlusCircle, CheckCircle, RefreshCw, ChevronRight, Clock, User, FileText, Coins, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { StatCard } from "@/components/ui/stat-card.tsx";
import { QuickActionCard } from "@/components/ui/quick-action-card.tsx";
import { AvatarCustom } from "@/components/ui/avatar-custom.tsx";
import { LoanStatusBadge } from "@/components/ui/status-badge.tsx";
import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { getLoansDueSoon, getLoanStats, type LoanRow } from "@/services/loan-service";
import { getTransactionStats, getRecentActivity, type TransactionRow } from "@/services/transaction-service";
import { getDefaultBranch } from "@/services/branch-service";

interface DashboardData {
  cashDisbursedToday: number;
  cashCollectedToday: number;
  activeLoans: number;
  loansDueToday: number;
  totalCapitalOut: number;
  dueSoonCount: number;
  overdueCount: number;
}

interface ActivityItem {
  id: string;
  type: 'new_loan' | 'redemption' | 'renewal' | 'new_customer';
  description: string;
  timestamp: string;
  user: string;
}

const getActivityIcon = (typeCode: string) => {
  switch (typeCode) {
    case "NEW_LOAN":
      return <Coins className="w-4 h-4 text-primary" />;
    case "REDEMPTION":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "RENEWAL":
      return <RefreshCw className="w-4 h-4 text-warning" />;
    default:
      return <FileText className="w-4 h-4 text-text-tertiary" />;
  }
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardData>({
    cashDisbursedToday: 0,
    cashCollectedToday: 0,
    activeLoans: 0,
    loansDueToday: 0,
    totalCapitalOut: 0,
    dueSoonCount: 0,
    overdueCount: 0,
  });
  const [dueLoans, setDueLoans] = useState<LoanRow[]>([]);
  const [recentActivity, setRecentActivity] = useState<TransactionRow[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get default branch
        const defaultBranch = await getDefaultBranch();
        const branchKey = defaultBranch?.branch_key || 1;

        // Fetch all data in parallel
        const [loanStats, transactionStats, dueSoonLoans, activity] = await Promise.all([
          getLoanStats(),
          getTransactionStats(branchKey),
          getLoansDueSoon(7),
          getRecentActivity(branchKey, 10),
        ]);

        setStats({
          cashDisbursedToday: transactionStats.todayDisbursements,
          cashCollectedToday: transactionStats.todayCollections,
          activeLoans: loanStats.activeLoans,
          loansDueToday: loanStats.loansDueToday,
          totalCapitalOut: loanStats.totalCapitalOut,
          dueSoonCount: loanStats.dueSoonCount,
          overdueCount: loanStats.overdueCount,
        });

        // Add days until due calculation
        const loansWithDays = dueSoonLoans.map(loan => ({
          ...loan,
          daysUntilDue: differenceInDays(new Date(loan.maturity_date), new Date()),
        }));
        setDueLoans(loansWithDays.sort((a, b) => a.daysUntilDue - b.daysUntilDue));

        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-text-primary">
              {greeting()}
            </h1>
            <p className="text-text-secondary mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")} • Branch: Bogo City
            </p>
          </div>
          <Link to="/loans/new">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              New Loan
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Cash Disbursed Today"
            value={`₱${stats.cashDisbursedToday.toLocaleString()}`}
            icon={TrendingUp}
          />
          <StatCard
            label="Cash Collected Today"
            value={`₱${stats.cashCollectedToday.toLocaleString()}`}
            icon={ArrowDownCircle}
          />
          <StatCard
            label="Active Loans"
            value={stats.activeLoans.toString()}
            subtext={`${stats.loansDueToday} due today`}
            icon={Package}
          />
          <StatCard
            label="Total Capital Out"
            value={`₱${stats.totalCapitalOut.toLocaleString()}`}
            subtext={`Across ${stats.activeLoans} loans`}
            icon={Wallet}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="New Loan"
            description="Create new pawn transaction"
            icon={PlusCircle}
            iconColor="text-primary"
            href="/loans/new"
          />
          <QuickActionCard
            title="Redemption"
            description="Process loan repayment"
            icon={CheckCircle}
            iconColor="text-success"
            href="/loans/redeem"
          />
          <QuickActionCard
            title="Renewal"
            description="Extend loan period"
            icon={RefreshCw}
            iconColor="text-warning"
            href="/loans/renew"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Due Today / Soon */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-text-primary">
                    Due Soon
                  </h3>
                  <p className="text-text-tertiary text-sm">
                    {dueLoans.length} loans maturing within 7 days
                  </p>
                </div>
                <Link to="/loans?filter=due-soon">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dueLoans.slice(0, 5).map((loan) => {
                const daysUntilDue = differenceInDays(new Date(loan.maturity_date), new Date());
                return (
                  <Link
                    key={loan.loan_key}
                    to={`/loans/${loan.loan_key}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <AvatarCustom src={loan.customer?.photo} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                        {loan.customer?.full_name || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-text-tertiary">
                        <span className="font-mono">{loan.loan_id}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-primary">
                        ₱{Number(loan.total_due).toLocaleString()}
                      </p>
                      <LoanStatusBadge
                        status={daysUntilDue <= 0 ? "overdue" : "due-soon"}
                        daysUntilDue={daysUntilDue}
                      />
                    </div>
                  </Link>
                );
              })}
              {dueLoans.length === 0 && (
                <div className="text-center py-8 text-text-tertiary">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No loans due within 7 days</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-text-primary">
                    Recent Activity
                  </h3>
                  <p className="text-text-tertiary text-sm">Latest transactions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.transaction_key}
                  className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="p-2 rounded-full bg-muted">
                    {getActivityIcon(activity.transaction_type?.type_code || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      {activity.transaction_type?.type_name || 'Transaction'} - {activity.customer?.full_name || 'Customer'}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      ₱{Number(activity.total_amount).toLocaleString()} •{" "}
                      {format(new Date(activity.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-text-tertiary">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
