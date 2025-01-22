import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type ActivityItem = {
  created_at: string;
  user: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
};

type RecentActivityListProps = {
  activities: ActivityItem[];
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities?.map((activity) => (
              <div 
                key={activity.created_at}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium">
                    {activity.user.first_name} {activity.user.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.user.email}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(activity.created_at), "MMM d, yyyy HH:mm")}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}