import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const OwnerPricingPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Pricing Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Pricing management coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
