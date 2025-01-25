import { CompletionRateCard } from "../CompletionRateCard";
import { SBUResponseRates } from "../SBUResponseRates";
import { CompletionTrends } from "../CompletionTrends";
import { ResponseRateDonutChart } from "../ResponseRateDonutChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type StatisticsSectionProps = {
  instanceStats?: {
    completionRate: number;
    totalAssignments: number;
    completedResponses: number;
  } | null;
  campaignId: string;
  selectedInstanceId?: string;
};

export function StatisticsSection({ 
  instanceStats, 
  campaignId, 
  selectedInstanceId 
}: StatisticsSectionProps) {
  // Query for gender distribution
  const { data: genderData } = useQuery({
    queryKey: ["gender-distribution", campaignId, selectedInstanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_assignments")
        .select(`
          id,
          user:profiles!survey_assignments_user_id_fkey (
            gender
          ),
          responses:survey_responses!survey_responses_assignment_id_fkey (
            id,
            campaign_instance_id
          )
        `)
        .eq("campaign_id", campaignId);

      if (selectedInstanceId) {
        query.eq("survey_responses.campaign_instance_id", selectedInstanceId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const genderStats: Record<string, { total: number; completed: number }> = {};
      
      data?.forEach((assignment) => {
        const gender = assignment.user?.gender || "Not Specified";
        if (!genderStats[gender]) {
          genderStats[gender] = { total: 0, completed: 0 };
        }
        genderStats[gender].total += 1;
        if (assignment.responses?.length > 0) {
          genderStats[gender].completed += 1;
        }
      });

      return Object.entries(genderStats).map(([name, stats]) => ({
        name,
        value: Math.round((stats.completed / stats.total) * 100)
      }));
    }
  });

  // Query for location distribution
  const { data: locationData } = useQuery({
    queryKey: ["location-distribution", campaignId, selectedInstanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_assignments")
        .select(`
          id,
          user:profiles!survey_assignments_user_id_fkey (
            location:locations!profiles_location_id_fkey (
              name
            )
          ),
          responses:survey_responses!survey_responses_assignment_id_fkey (
            id,
            campaign_instance_id
          )
        `)
        .eq("campaign_id", campaignId);

      if (selectedInstanceId) {
        query.eq("survey_responses.campaign_instance_id", selectedInstanceId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const locationStats: Record<string, { total: number; completed: number }> = {};
      
      data?.forEach((assignment) => {
        const location = assignment.user?.location?.name || "Not Specified";
        if (!locationStats[location]) {
          locationStats[location] = { total: 0, completed: 0 };
        }
        locationStats[location].total += 1;
        if (assignment.responses?.length > 0) {
          locationStats[location].completed += 1;
        }
      });

      return Object.entries(locationStats).map(([name, stats]) => ({
        name,
        value: Math.round((stats.completed / stats.total) * 100)
      }));
    }
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <CompletionRateCard completionRate={instanceStats?.completionRate} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <SBUResponseRates 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
        <CompletionTrends 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {genderData && (
          <ResponseRateDonutChart
            title="Response Rate by Gender"
            data={genderData}
          />
        )}
        {locationData && (
          <ResponseRateDonutChart
            title="Response Rate by Location"
            data={locationData}
          />
        )}
      </div>
    </>
  );
}