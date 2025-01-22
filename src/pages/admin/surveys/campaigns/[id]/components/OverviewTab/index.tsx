import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { CompletionRateCard } from "./CompletionRateCard";
import { ResponseRateChart } from "./ResponseRateChart";
import { StatusDistributionChart } from "./StatusDistributionChart";
import { RecentActivityList } from "./RecentActivityList";

export function OverviewTab({ campaignId }: { campaignId: string }) {
  // Fetch campaign details including completion rate
  const { data: campaign } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch responses over time
  const { data: responseData } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("created_at");
      
      if (error) throw error;

      // Group responses by date
      const groupedData = data.reduce((acc: any[], response) => {
        const date = format(new Date(response.created_at), "MMM d");
        const existingEntry = acc.find(entry => entry.date === date);
        
        if (existingEntry) {
          existingEntry.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
        
        return acc;
      }, []);

      return groupedData;
    },
  });

  // Fetch assignment status distribution
  const { data: statusData } = useQuery({
    queryKey: ["campaign-status-distribution", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select("status")
        .eq("campaign_id", campaignId);
      
      if (error) throw error;

      const distribution = data.reduce((acc: any, assignment) => {
        const status = assignment.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ["campaign-recent-activity", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(campaign_id),
          user:profiles!survey_responses_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <CompletionRateCard completionRate={campaign?.completion_rate} />
      </div>
      <ResponseRateChart data={responseData || []} />
      <StatusDistributionChart data={statusData || []} />
      <RecentActivityList activities={recentActivity || []} />
    </div>
  );
}