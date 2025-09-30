import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TrainerCalendarPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Training Calendar</h1>
        <Card>
          <CardHeader>
            <CardTitle>My Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Training calendar coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
