import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StaffCashRegisterPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cash Register</h1>
        <Card>
          <CardHeader>
            <CardTitle>Cash Register</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Cash register coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
