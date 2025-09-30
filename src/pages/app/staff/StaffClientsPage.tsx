import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StaffClientsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Card>
          <CardHeader>
            <CardTitle>Client Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Client management coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
