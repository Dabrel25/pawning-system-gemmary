import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Camera, 
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { AvatarCustom } from "@/components/ui/avatar-custom.tsx";
import { LoanStatusBadge } from "@/components/ui/status-badge.tsx";
import { FormField } from "@/components/ui/form-field.tsx";
import { mockLoans } from "@/data/mock-data.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { toast } from "sonner";

export default function Redemption() {
  const navigate = useNavigate();
  const [ticketSearch, setTicketSearch] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<typeof mockLoans[0] | null>(null);
  const [ticketNotFound, setTicketNotFound] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [redemptionNotes, setRedemptionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Search for ticket
  const handleTicketSearch = (value: string) => {
    setTicketSearch(value);
    setTicketNotFound(false);

    if (value.length >= 5) {
      const found = mockLoans.find(
        (loan) =>
          loan.ticketNumber.toLowerCase().includes(value.toLowerCase()) &&
          loan.status === "active"
      );

      if (found) {
        setSelectedLoan(found);
      } else {
        setTicketNotFound(true);
        setSelectedLoan(null);
      }
    } else {
      setSelectedLoan(null);
    }
  };

  const totalDue = selectedLoan
    ? selectedLoan.totalDue + selectedLoan.penalties
    : 0;

  const change = amountReceived > totalDue ? amountReceived - totalDue : 0;
  const isInsufficientPayment = amountReceived > 0 && amountReceived < totalDue;

  const processRedemption = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    toast.success("Redemption completed!", {
      description: `Ticket #${selectedLoan?.ticketNumber} has been redeemed successfully`,
    });
    navigate("/loans");
  };

  const cancelRedemption = () => {
    setSelectedLoan(null);
    setTicketSearch("");
    setAmountReceived(0);
    setRedemptionNotes("");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-text-primary">
              Loan Redemption
            </h1>
            <p className="text-text-secondary text-sm">
              Process customer loan repayment
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-heading font-semibold">Redemption Details</h2>
            <p className="text-text-secondary text-sm">
              Scan or enter ticket number to process
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ticket Lookup */}
            {!selectedLoan && (
              <div className="space-y-4">
                <FormField label="Scan or Enter Ticket Number">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                      <Input
                        type="text"
                        placeholder="Enter ticket number or scan QR code"
                        className="pl-10 h-12"
                        value={ticketSearch}
                        onChange={(e) => handleTicketSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <Button variant="outline" size="icon" className="h-12 w-12">
                      <Camera className="w-5 h-5" />
                    </Button>
                  </div>
                </FormField>

                {ticketNotFound && (
                  <div className="flex items-center gap-2 text-error text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Ticket number not found or already redeemed</span>
                  </div>
                )}

                {/* Demo tickets */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-text-tertiary mb-3">Try these sample tickets:</p>
                  <div className="flex flex-wrap gap-2">
                    {mockLoans.slice(0, 3).map((loan) => (
                      <Button
                        key={loan.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTicketSearch(loan.ticketNumber);
                          setSelectedLoan(loan);
                        }}
                      >
                        {loan.ticketNumber}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loan Details */}
            {selectedLoan && (
              <div className="space-y-6">
                {/* Customer & Item Info */}
                <div className="bg-muted border border-border rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <AvatarCustom src={selectedLoan.customer.photo} size="lg" />
                    <div>
                      <p className="font-heading font-semibold text-lg">
                        {selectedLoan.customer.fullName}
                      </p>
                      <p className="text-text-tertiary">{selectedLoan.customer.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-text-tertiary text-sm mb-1">Ticket Number</p>
                      <p className="font-mono font-semibold">{selectedLoan.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-sm mb-1">Loan Date</p>
                      <p className="font-semibold">
                        {format(new Date(selectedLoan.loanDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-sm mb-1">Maturity Date</p>
                      <p className="font-semibold">
                        {format(new Date(selectedLoan.maturityDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-sm mb-1">Status</p>
                      <LoanStatusBadge
                        status={
                          selectedLoan.daysUntilDue <= 0
                            ? "overdue"
                            : selectedLoan.daysUntilDue <= 7
                            ? "due-soon"
                            : "active"
                        }
                        daysUntilDue={selectedLoan.daysUntilDue}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-heading font-semibold text-lg">Payment Details</h3>

                  <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Principal Amount</span>
                      <span className="font-mono">
                        ₱ {selectedLoan.principal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-text-secondary">Interest Charges</span>
                      <span className="font-mono">
                        ₱ {(selectedLoan.totalDue - selectedLoan.principal).toLocaleString()}
                      </span>
                    </div>

                    {selectedLoan.penalties > 0 && (
                      <div className="flex justify-between text-warning">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Penalty Charges ({Math.abs(selectedLoan.daysUntilDue)} days overdue)
                        </span>
                        <span className="font-mono">
                          ₱ {selectedLoan.penalties.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-lg font-heading font-semibold">
                        Total Amount Due
                      </span>
                      <span className="text-3xl font-heading font-bold text-primary">
                        ₱ {totalDue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <FormField label="Payment Method">
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="gcash">GCash</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {/* Amount Received */}
                <FormField label="Amount Received">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-semibold text-xl">
                      ₱
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-10 text-2xl font-heading font-bold h-16"
                      value={amountReceived || ""}
                      onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormField>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmountReceived(totalDue)}
                  >
                    Exact Amount (₱{totalDue.toLocaleString()})
                  </Button>
                </div>

                {/* Change Calculation */}
                {change > 0 && (
                  <div className="bg-success/10 border border-success rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-body font-medium text-text-primary">
                        Change to Return
                      </span>
                      <span className="text-2xl font-heading font-bold text-success">
                        ₱ {change.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Insufficient Payment Warning */}
                {isInsufficientPayment && (
                  <div className="bg-warning/10 border border-warning rounded-lg p-4">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-semibold">Insufficient payment</span>
                    </div>
                    <p className="text-sm text-text-tertiary mt-1">
                      Customer needs to pay ₱
                      {(totalDue - amountReceived).toLocaleString()} more
                    </p>
                  </div>
                )}

                {/* Notes */}
                <FormField label="Notes (Optional)">
                  <Textarea
                    rows={2}
                    placeholder="Add any notes about this redemption..."
                    value={redemptionNotes}
                    onChange={(e) => setRedemptionNotes(e.target.value)}
                  />
                </FormField>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {selectedLoan && (
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={cancelRedemption}>
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={processRedemption}
              disabled={amountReceived < totalDue || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Redemption
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
