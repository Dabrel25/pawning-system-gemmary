import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, CheckCircle, XCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/services/customer-service";

interface CustomerContactSectionProps {
  customer: Customer;
}

const ADDRESS_PROOF_LABELS: Record<string, string> = {
  utility_bill: "Utility Bill",
  bank_statement: "Bank Statement",
  barangay_certificate: "Barangay Certificate",
};

export function CustomerContactSection({ customer }: CustomerContactSectionProps) {
  // Check if we have detailed address fields or just the simple address
  const hasDetailedAddress = customer.address_line_1 || customer.barangay || customer.city_municipality;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-brand-gold" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-text-primary">Current Address</p>
            {customer.is_address_verified ? (
              <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
                <XCircle className="w-3 h-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            {hasDetailedAddress ? (
              <>
                <p className="text-text-primary">{customer.address_line_1}</p>
                {customer.address_line_2 && (
                  <p className="text-text-primary">{customer.address_line_2}</p>
                )}
                <p className="text-text-secondary">
                  {customer.barangay && `${customer.barangay}, `}
                  {customer.city_municipality}
                </p>
                <p className="text-text-secondary">
                  {customer.province}
                  {customer.postal_code && ` • ${customer.postal_code}`}
                </p>
              </>
            ) : (
              <p className="text-text-primary">{customer.address || "No address on file"}</p>
            )}
          </div>
          {customer.address_proof_type && (
            <div className="flex items-center gap-2 mt-2 text-sm text-text-tertiary">
              <FileText className="w-4 h-4" />
              <span>Verified via {ADDRESS_PROOF_LABELS[customer.address_proof_type] || customer.address_proof_type}</span>
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs text-text-tertiary">Mobile Number</p>
              <p className="font-medium text-text-primary">{customer.phone}</p>
            </div>
          </div>

          {customer.alternate_phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">Alternate Number</p>
                <p className="font-medium text-text-primary">{customer.alternate_phone}</p>
              </div>
            </div>
          )}

          {customer.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">Email Address</p>
                <p className="font-medium text-text-primary">{customer.email}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
