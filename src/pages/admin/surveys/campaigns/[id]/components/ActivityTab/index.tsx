import { PendingRespondents } from "../OverviewTab/PendingRespondents";
import { RecentActivityList } from "../OverviewTab/RecentActivityList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActivityTabProps {
  campaignId: string;
  selectedInstanceId?: string;
}

export function ActivityTab({ campaignId, selectedInstanceId }: ActivityTabProps) {
  const { data: recentActivity } = useQuery({
    queryKey: ["instance-recent-activity", selectedInstanceId],
    queryFn: async () => {
      const query = supabase
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
        .eq("assignment.campaign_id", campaignId);

      if (selectedInstanceId) {
        query.eq("campaign_instance_id", selectedInstanceId);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <PendingRespondents 
        campaignId={campaignId} 
        instanceId={selectedInstanceId} 
      />
      <RecentActivityList activities={recentActivity || []} />
    </div>
  );
}