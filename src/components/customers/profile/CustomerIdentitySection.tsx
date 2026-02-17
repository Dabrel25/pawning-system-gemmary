import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Flag, CreditCard, Building2 } from "lucide-react";
import { format } from "date-fns";
import type { Customer } from "@/services/customer-service";

interface CustomerIdentitySectionProps {
  customer: Customer;
}

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

export function CustomerIdentitySection({ customer }: CustomerIdentitySectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-brand-gold" />
          Primary Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Last Name</p>
            <p className="font-medium text-text-primary">{customer.last_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">First Name</p>
            <p className="font-medium text-text-primary">{customer.first_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Middle Name</p>
            <p className="font-medium text-text-primary">{customer.middle_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Suffix</p>
            <p className="font-medium text-text-primary">{customer.suffix || "—"}</p>
          </div>
        </div>

        {/* Full Name Display */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Full Name</p>
          <p className="font-semibold text-text-primary text-lg">{customer.full_name}</p>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs text-text-tertiary">Date of Birth</p>
              <p className="font-medium text-text-primary">
                {customer.date_of_birth
                  ? format(new Date(customer.date_of_birth), "MMMM d, yyyy")
                  : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Flag className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs text-text-tertiary">Nationality</p>
              <p className="font-medium text-text-primary">{customer.nationality || "Filipino"}</p>
            </div>
          </div>
        </div>

        {/* ID Information */}
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-text-primary mb-3">Government ID</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">ID Type</p>
                <p className="font-medium text-text-primary">
                  {ID_TYPE_LABELS[customer.id_type] || customer.id_type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-text-tertiary" />
              <div>
                <p className="text-xs text-text-tertiary">ID Number</p>
                <p className="font-medium text-text-primary">{customer.id_number}</p>
              </div>
            </div>
            {customer.id_expiry_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-text-tertiary" />
                <div>
                  <p className="text-xs text-text-tertiary">ID Expiry Date</p>
                  <p className="font-medium text-text-primary">
                    {format(new Date(customer.id_expiry_date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}
            {customer.id_issuing_authority && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-text-tertiary" />
                <div>
                  <p className="text-xs text-text-tertiary">Issuing Authority</p>
                  <p className="font-medium text-text-primary">{customer.id_issuing_authority}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ID Photos */}
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-text-primary mb-3">Verification Documents</p>
          <div className="grid grid-cols-2 gap-3">
            {customer.id_front_photo && (
              <div>
                <p className="text-xs text-text-tertiary mb-1">ID Front</p>
                <div className="aspect-video bg-muted rounded-lg border border-border overflow-hidden">
                  <img
                    src={customer.id_front_photo}
                    alt="ID Front"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {customer.id_back_photo && (
              <div>
                <p className="text-xs text-text-tertiary mb-1">ID Back</p>
                <div className="aspect-video bg-muted rounded-lg border border-border overflow-hidden">
                  <img
                    src={customer.id_back_photo}
                    alt="ID Back"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {customer.signature && (
              <div>
                <p className="text-xs text-text-tertiary mb-1">Signature Specimen</p>
                <div className="aspect-video bg-muted rounded-lg border border-border overflow-hidden">
                  <img
                    src={customer.signature}
                    alt="Signature"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
            {!customer.id_front_photo && !customer.id_back_photo && !customer.signature && (
              <div className="col-span-2 text-center py-6 text-text-tertiary text-sm">
                No verification documents uploaded
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
