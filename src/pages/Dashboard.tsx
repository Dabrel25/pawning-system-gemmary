import { format } from "date-fns";
import { Plus, TrendingUp, ArrowDownCircle, Package, Wallet, PlusCircle, CheckCircle, RefreshCw, ChevronRight, Clock, AlertTriangle, User, FileText, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { StatCard } from "@/components/ui/stat-card.tsx";
import { QuickActionCard } from "@/components/ui/quick-action-card.tsx";
import { AvatarCustom } from "@/components/ui/avatar-custom.tsx";
import { LoanStatusBadge } from "@/components/ui/status-badge.tsx";
import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { mockLoans, mockActivities, dashboardStats } from "@/data/mock-data.ts";
import { Activity } from "@/types";

// Get loans due soon (within 7 days)
const dueLoans = mockLoans
  .filter((loan) => loan.daysUntilDue <= 7 && loan.status === "active")
  .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "new_loan":
      return <Coins className="w-4 h-4 text-primary" />;
    case "redemption":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "renewal":
      return <RefreshCw className="w-4 h-4 text-warning" />;
    case "new_customer":
      return <User className="w-4 h-4 text-info" />;
    default:
      return <FileText className="w-4 h-4 text-text-tertiary" />;
  }
};

export default function Dashboard() {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-text-primary">
              {greeting()}, Juan
            </h1>
            <p className="text-text-secondary mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")} • Branch: Main Office
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
            value={`₱${dashboardStats.cashDisbursedToday.toLocaleString()}`}
            change="+12%"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            label="Cash Collected Today"
            value={`₱${dashboardStats.cashCollectedToday.toLocaleString()}`}
            change="+8%"
            changeType="positive"
            icon={ArrowDownCircle}
          />
          <StatCard
            label="Active Loans"
            value={dashboardStats.activeLoans.toString()}
            subtext={`${dashboardStats.loansDueToday} due today`}
            icon={Package}
          />
          <StatCard
            label="Total Capital Out"
            value={`₱${dashboardStats.totalCapitalOut.toLocaleString()}`}
            subtext={`Across ${dashboardStats.activeLoans} loans`}
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
              {dueLoans.slice(0, 5).map((loan) => (
                <Link
                  key={loan.id}
                  to={`/loans/${loan.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <AvatarCustom src={loan.customer.photo} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                      {loan.customer.fullName}
                    </p>
                    <p className="text-sm text-text-tertiary">
                      <span className="font-mono">{loan.ticketNumber}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-primary">
                      ₱{loan.totalDue.toLocaleString()}
                    </p>
                    <LoanStatusBadge
                      status={loan.daysUntilDue <= 0 ? "overdue" : "due-soon"}
                      daysUntilDue={loan.daysUntilDue}
                    />
                  </div>
                </Link>
              ))}
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
                  <p className="text-text-tertiary text-sm">Last 24 hours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="p-2 rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      {activity.description}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {activity.user} •{" "}
                      {format(new Date(activity.timestamp), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
