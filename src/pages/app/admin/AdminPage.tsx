import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Card>
          <CardHeader>
            <CardTitle>System Administration</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Admin panel coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
