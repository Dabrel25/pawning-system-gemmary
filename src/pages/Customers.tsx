import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Eye, Phone, Mail, MapPin, Loader2, RefreshCw, CreditCard, Calendar, Download } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarCustom } from "@/components/ui/avatar-custom";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAllCustomers, getCustomerLoanStats, type CustomerRow } from "@/services/customer-service";
import { exportCustomersToCSV } from "@/lib/csv-export";
import { ExportDialog } from "@/components/ui/export-dialog";
import { toast } from "sonner";

const ID_TYPE_LABELS: Record<string, string> = {
  drivers_license: "Driver's License",
  passport: "Passport",
  umid: "UMID",
  sss: "SSS",
  philhealth: "PhilHealth",
  voters_id: "Voter's ID",
  tin: "TIN",
  postal_id: "Postal ID",
  prc_license: "PRC License",
};

interface CustomerWithStats extends CustomerRow {
  activeLoansCount: number;
  totalLoansTaken: number;
}

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const data = await getAllCustomers();

      // Fetch loan stats for each customer
      const customersWithStats = await Promise.all(
        data.map(async (customer) => {
          const stats = await getCustomerLoanStats(customer.customer_key);
          return {
            ...customer,
            activeLoansCount: stats.activeLoansCount,
            totalLoansTaken: stats.totalLoansTaken,
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleRefresh = () => {
    fetchCustomers(true);
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.id_number?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );
  });

  const getWatchlistVariant = (status: string): "success" | "warning" | "error" => {
    switch (status) {
      case 'clear':
        return 'success';
      case 'flagged':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'success';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-text-primary">
              Customers
            </h1>
            <p className="text-text-secondary mt-1">
              {filteredCustomers.length} customers in database
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <ExportDialog
              title="Export Customers"
              description="Export customer data to CSV for external systems integration."
              totalRecords={filteredCustomers.length}
              disabled={isLoading || filteredCustomers.length === 0}
              onExport={(dateRange) => {
                const count = exportCustomersToCSV(filteredCustomers, dateRange);
                if (count === 0) {
                  toast.error("No customers found in selected date range");
                } else {
                  toast.success(`Exported ${count} customers to CSV`);
                }
              }}
            />
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <Input
                type="text"
                placeholder="Search by name, phone, ID number, or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <div className="space-y-3">
          {isLoading && (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-text-secondary">Loading customers...</p>
            </div>
          )}

          {!isLoading && filteredCustomers.length === 0 && (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Users className="w-12 h-12 mx-auto mb-4 text-text-tertiary opacity-50" />
              <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                No customers found
              </h3>
              <p className="text-text-secondary">
                {searchQuery ? "Try adjusting your search" : "Customers will appear here once created"}
              </p>
            </div>
          )}

          {!isLoading && filteredCustomers.map((customer) => (
            <Card key={customer.customer_key} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Customer Photo */}
                  <div className="flex-shrink-0">
                    <AvatarCustom src={customer.photo} size="lg" />
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-text-primary truncate">
                          {customer.full_name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {ID_TYPE_LABELS[customer.id_type] || customer.id_type}: {customer.id_number}
                        </p>
                      </div>
                      <StatusBadge variant={getWatchlistVariant(customer.watchlist_status)}>
                        {customer.watchlist_status.charAt(0).toUpperCase() + customer.watchlist_status.slice(1)}
                      </StatusBadge>
                    </div>

                    {/* Contact Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Phone className="w-4 h-4 text-text-tertiary" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Mail className="w-4 h-4 text-text-tertiary" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary sm:col-span-2">
                          <MapPin className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-text-primary">
                          {customer.activeLoansCount} active
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-text-secondary">
                          {customer.totalLoansTaken} total loans
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Calendar className="w-4 h-4 text-text-tertiary" />
                        <span className="text-xs text-text-tertiary">
                          Joined {customer.created_at ? format(new Date(customer.created_at), "MMM yyyy") : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/customers/${customer.customer_key}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
