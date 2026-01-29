import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Construction } from "lucide-react";

export default function Reports() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-text-primary">
            Reports
          </h1>
          <p className="text-text-secondary mt-1">
            View business analytics and generate reports
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
                The reporting module is under development. You'll be able to generate
                daily/weekly/monthly reports, view analytics, and export data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
