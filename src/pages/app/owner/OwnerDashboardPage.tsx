import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const OwnerDashboardPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Owner dashboard coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
