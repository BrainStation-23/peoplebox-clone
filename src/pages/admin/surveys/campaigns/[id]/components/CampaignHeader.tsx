import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface CampaignHeaderProps {
  campaign: {
    name: string;
    description: string | null;
    status: string;
    created_at: string;
  } | undefined;
  isLoading: boolean;
  stats?: {
    totalAssignments: number;
    completionRate: number;
  };
}

export function CampaignHeader({ campaign, isLoading, stats }: CampaignHeaderProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-muted-foreground mt-1">{campaign.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
          {campaign.status}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(campaign.created_at), 'MMM d, yyyy')}
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assignments</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{stats.totalAssignments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Completion Rate</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{stats.completionRate}%</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}