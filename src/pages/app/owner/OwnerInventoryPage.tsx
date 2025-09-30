import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const OwnerInventoryPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Inventory management coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
