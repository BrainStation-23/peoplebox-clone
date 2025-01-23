import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";

export default function UserDashboard() {
  const { data: pendingSurveysCount } = usePendingSurveysCount();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSurveysCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}