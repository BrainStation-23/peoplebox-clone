import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignHeader } from "./components/CampaignHeader";
import { CampaignTabs, TabPanel } from "./components/CampaignTabs";
import { AssignmentInstanceList } from "./components/AssignmentInstanceList";
import { OverviewTab } from "./components/OverviewTab";
import { ResponsesTab } from "./components/ResponsesTab";
import { ActivityTab } from "./components/ActivityTab";
import { InstanceSelector } from "./components/InstanceSelector";

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();

  const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["campaign-assignments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          status,
          due_date,
          user:profiles!survey_assignments_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            user_sbus (
              is_primary,
              sbu:sbus (
                id,
                name
              )
            )
          )
        `)
        .eq("campaign_id", id);

      if (error) throw error;
      return data;
    },
  });

  if (!id) return null;

  return (
    <div className="space-y-6">
      <CampaignHeader 
        campaign={campaign} 
        isLoading={isLoadingCampaign}
      />

      <div className="flex justify-end">
        <InstanceSelector
          campaignId={id}
          selectedInstanceId={selectedInstanceId}
          onInstanceSelect={setSelectedInstanceId}
        />
      </div>

      <CampaignTabs>
        <TabPanel value="overview">
          <OverviewTab 
            campaignId={id} 
            selectedInstanceId={selectedInstanceId}
          />
        </TabPanel>
        <TabPanel value="assignments">
          <AssignmentInstanceList 
            assignments={assignments || []}
            isLoading={isLoadingAssignments}
            campaignId={id}
            surveyId={campaign?.survey_id}
          />
        </TabPanel>
        <TabPanel value="responses">
          <ResponsesTab instanceId={selectedInstanceId} />
        </TabPanel>
        <TabPanel value="activity">
          <ActivityTab 
            campaignId={id}
            selectedInstanceId={selectedInstanceId}
          />
        </TabPanel>
        <TabPanel value="reports">
          <h2>Reports Content</h2>
        </TabPanel>
      </CampaignTabs>
    </div>
  );
}