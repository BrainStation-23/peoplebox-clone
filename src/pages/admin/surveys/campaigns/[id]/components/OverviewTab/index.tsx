import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { CompletionRateCard } from "./CompletionRateCard";
import { ResponseRateChart } from "./ResponseRateChart";
import { StatusDistributionChart, type StatusData } from "./StatusDistributionChart";
import { RecentActivityList } from "./RecentActivityList";

interface OverviewTabProps {
  campaignId: string;
  selectedInstanceId?: string;
}

export function OverviewTab({ campaignId, selectedInstanceId }: OverviewTabProps) {
  // Fetch instance details including completion rate
  const { data: instanceStats } = useQuery({
    queryKey: ["instance-stats", selectedInstanceId],
    queryFn: async () => {
      if (!selectedInstanceId) return null;

      const { data: assignments, error: assignmentsError } = await supabase
        .from("survey_assignments")
        .select("id, status")
        .eq("campaign_id", campaignId);

      if (assignmentsError) throw assignmentsError;

      const { data: responses, error: responsesError } = await supabase
        .from("survey_responses")
        .select("assignment_id")
        .eq("campaign_instance_id", selectedInstanceId);

      if (responsesError) throw responsesError;

      // Calculate completion rate
      const totalAssignments = assignments?.length || 0;
      const completedResponses = responses?.length || 0;
      const completionRate = totalAssignments > 0 
        ? (completedResponses / totalAssignments) * 100 
        : 0;

      return {
        completionRate,
        totalAssignments,
        completedResponses
      };
    },
    enabled: !!selectedInstanceId,
  });

  // Fetch responses over time for the selected instance
  const { data: responseData } = useQuery({
    queryKey: ["instance-responses", selectedInstanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId);

      // Add instance filter if selected
      if (selectedInstanceId) {
        query.eq("campaign_instance_id", selectedInstanceId);
      }

      const { data, error } = await query.order("created_at");
      
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

  // Fetch assignment status distribution for the instance
  const { data: statusData } = useQuery({
    queryKey: ["instance-status-distribution", selectedInstanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_assignments")
        .select("status, id")
        .eq("campaign_id", campaignId);

      const { data, error } = await query;
      
      if (error) throw error;

      // If instance is selected, we need to check responses for this instance
      if (selectedInstanceId) {
        const { data: responses } = await supabase
          .from("survey_responses")
          .select("assignment_id")
          .eq("campaign_instance_id", selectedInstanceId);

        const completedAssignmentIds = new Set(responses?.map(r => r.assignment_id));

        // Update status based on instance responses
        data.forEach(assignment => {
          if (completedAssignmentIds.has(assignment.id)) {
            assignment.status = 'completed';
          } else {
            assignment.status = 'pending';
          }
        });
      }

      const distribution = data.reduce((acc: Record<string, number>, assignment) => {
        const status = assignment.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution).map(([name, value]): StatusData => ({
        name,
        value,
      }));
    },
  });

  // Fetch recent activity for the instance
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

      // Add instance filter if selected
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
      <div className="grid gap-4 md:grid-cols-2">
        <CompletionRateCard completionRate={instanceStats?.completionRate} />
      </div>
      <ResponseRateChart data={responseData || []} />
      <StatusDistributionChart data={statusData || []} />
      <RecentActivityList activities={recentActivity || []} />
    </div>
  );
}