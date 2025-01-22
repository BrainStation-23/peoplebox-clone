import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChartBar, Grid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function CampaignOverview() {
  const { data: campaignStats } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from('survey_campaigns')
        .select('status');
      
      if (error) throw error;
      
      const active = campaigns?.filter(c => c.status === 'active').length || 0;
      const total = campaigns?.length || 0;
      
      return { active, total };
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Campaign Overview</CardTitle>
        <Grid className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{campaignStats?.active || 0}</p>
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <ChartBar className="mr-1 h-4 w-4" />
              <span>Total Campaigns: {campaignStats?.total || 0}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button asChild className="flex-1">
              <Link to="/admin/surveys/campaigns">View All Campaigns</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/admin/surveys/campaigns/create">Create Campaign</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}