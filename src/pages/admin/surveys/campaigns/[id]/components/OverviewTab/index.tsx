import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { StatisticsSection } from "./components/StatisticsSection";
import { ChartsSection } from "./components/ChartsSection";

interface OverviewTabProps {
  campaignId: string;
  selectedInstanceId?: string;
}

export function OverviewTab({ campaignId, selectedInstanceId }: OverviewTabProps) {
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

      if (selectedInstanceId) {
        query.eq("campaign_instance_id", selectedInstanceId);
      }

      const { data, error } = await query.order("created_at");
      if (error) throw error;

      return data.reduce((acc: any[], response) => {
        const date = format(new Date(response.created_at), "MMM d");
        const existingEntry = acc.find(entry => entry.date === date);
        
        if (existingEntry) {
          existingEntry.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
        
        return acc;
      }, []);
    },
  });

  const { data: statusData } = useQuery({
    queryKey: ["instance-status-distribution", selectedInstanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_assignments")
        .select("status, id")
        .eq("campaign_id", campaignId);

      const { data, error } = await query;
      if (error) throw error;

      if (selectedInstanceId) {
        const { data: responses } = await supabase
          .from("survey_responses")
          .select("assignment_id")
          .eq("campaign_instance_id", selectedInstanceId);

        const completedAssignmentIds = new Set(responses?.map(r => r.assignment_id));

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

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  return (
    <div className="space-y-6">
      <StatisticsSection 
        instanceStats={instanceStats}
        campaignId={campaignId}
        selectedInstanceId={selectedInstanceId}
      />
      
      <ChartsSection 
        statusData={statusData}
        responseData={responseData}
        campaignId={campaignId}
        selectedInstanceId={selectedInstanceId}
      />
    </div>
  );
}