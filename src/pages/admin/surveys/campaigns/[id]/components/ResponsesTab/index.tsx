import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsesList } from "./ResponsesList";
import { Skeleton } from "@/components/ui/skeleton";

export function ResponsesTab() {
  const { id: campaignId } = useParams();

  const { data: responses, isLoading } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          instance_number,
          user:profiles!survey_responses_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          assignment:survey_assignments!survey_responses_assignment_id_fkey (
            id,
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("instance_number", { ascending: true })
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Group responses by instance number
  const groupedResponses = responses?.reduce((acc, response) => {
    const instanceNumber = response.instance_number || 0;
    if (!acc[instanceNumber]) {
      acc[instanceNumber] = [];
    }
    acc[instanceNumber].push(response);
    return acc;
  }, {} as Record<number, typeof responses>);

  return (
    <div className="space-y-6">
      <ResponsesList groupedResponses={groupedResponses || {}} />
    </div>
  );
}