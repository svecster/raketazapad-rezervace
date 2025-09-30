import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const OwnerFinancePage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <Card>
          <CardHeader>
            <CardTitle>Finance</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Financial reports coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
