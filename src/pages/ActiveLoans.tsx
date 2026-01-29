import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Download, ChevronRight, RefreshCw, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { AvatarCustom } from "@/components/ui/avatar-custom.tsx";
import { LoanStatusBadge } from "@/components/ui/status-badge.tsx";
import { mockLoans } from "@/data/mock-data.ts";
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

  // Filter loans
  const filteredLoans = mockLoans.filter((loan) => {
    const matchesSearch =
      loan.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.customer.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && loan.daysUntilDue > 7) ||
      (statusFilter === "due-soon" && loan.daysUntilDue <= 7 && loan.daysUntilDue > 0) ||
      (statusFilter === "overdue" && loan.daysUntilDue <= 0);

    return matchesSearch && matchesStatus;
  });

  const totalCapital = filteredLoans.reduce((acc, loan) => acc + loan.principal, 0);

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
            <Button variant="outline">
              <Download className="w-5 h-5 mr-2" />
              Export
            </Button>
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
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              onClick={() => navigate(`/loans/${loan.id}`)}
              className="bg-card border-l-4 border-l-accent rounded-lg p-6 shadow-card hover:shadow-card-hover cursor-pointer transition-all duration-200 hover:border-l-primary"
            >
              <div className="flex items-start gap-4">
                {/* Customer Photo */}
                <AvatarCustom src={loan.customer.photo} size="lg" />

                {/* Loan Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-heading font-semibold text-lg text-text-primary">
                        {loan.customer.fullName}
                      </p>
                      <p className="text-text-tertiary text-sm">
                        Ticket: <span className="font-mono">{loan.ticketNumber}</span>
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
                        ₱{loan.principal.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-xs mb-1">Total Due</p>
                      <p className="font-heading font-semibold text-primary">
                        ₱{loan.totalDue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-xs mb-1">Maturity Date</p>
                      <p className="font-semibold text-text-primary">
                        {format(new Date(loan.maturityDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-xs mb-1">Item</p>
                      <p className="font-semibold text-text-primary capitalize">
                        {loan.item.category}
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
                </div>
              </div>
            </div>
          ))}

          {filteredLoans.length === 0 && (
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
