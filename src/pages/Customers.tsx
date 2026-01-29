import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Users, Construction } from "lucide-react";

export default function Customers() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-text-primary">
            Customers
          </h1>
          <p className="text-text-secondary mt-1">
            Manage customer database and KYC records
          </p>
        </div>

        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                <Construction className="w-8 h-8 text-text-tertiary" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                Coming Soon
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                The customer management module is under development. You'll be able to
                view customer profiles, KYC documents, loan history, and more.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
