import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Model } from "survey-core";
import { VisualizationPanel } from "survey-analytics";
import "survey-analytics/survey.analytics.min.css";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Response } from "./types";

export function ResponsesTab() {
  const { id: campaignId } = useParams();
  const [visualizationPanel, setVisualizationPanel] = useState<any>(null);

  const { data: surveyData } = useQuery({
    queryKey: ["campaign-survey", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select(`
          survey:surveys (
            id,
            name,
            json_data
          )
        `)
        .eq("id", campaignId)
        .single();

      if (error) throw error;
      return data.survey;
    },
  });

  const { data: responses, isLoading } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          created_at,
          updated_at,
          instance_number,
          assignment_id,
          user_id,
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
      return data as Response[];
    },
  });

  // Initialize visualization panel when data is available
  useState(() => {
    if (surveyData?.json_data && responses) {
      const survey = new Model(surveyData.json_data);
      const visPanel = new VisualizationPanel(
        survey,
        responses.map(r => r.response_data)
      );
      setVisualizationPanel(visPanel);
      
      // Render the panel
      const container = document.getElementById("visualizationContainer");
      if (container) {
        container.innerHTML = "";
        visPanel.render(container);
      }
    }
  }, [surveyData, responses]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!responses?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No responses found for this campaign.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div id="visualizationContainer" className="min-h-[500px]" />
    </div>
  );
}