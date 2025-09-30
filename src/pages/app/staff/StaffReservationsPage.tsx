import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StaffReservationsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manage Reservations</h1>
        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Staff reservations management coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
