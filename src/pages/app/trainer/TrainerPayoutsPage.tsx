import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TrainerPayoutsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payouts</h1>
        <Card>
          <CardHeader>
            <CardTitle>My Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Payouts tracking coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
