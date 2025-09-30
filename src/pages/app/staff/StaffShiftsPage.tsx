import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StaffShiftsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Shifts</h1>
        <Card>
          <CardHeader>
            <CardTitle>Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Shifts management coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
