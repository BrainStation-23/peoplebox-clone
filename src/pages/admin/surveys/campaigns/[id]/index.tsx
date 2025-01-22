import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignSurveyDialog } from "../../components/AssignSurvey";
import { AssignmentInstanceList } from "./components/AssignmentInstanceList";

export default function CampaignDetailsPage() {
  const { id } = useParams();

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select(`
          *,
          survey:surveys(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['campaign-assignments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_assignments')
        .select(`
          *,
          user:profiles(id, email, first_name, last_name),
          sbu_assignments:survey_sbu_assignments(
            sbu:sbus(id, name)
          )
        `)
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (campaignLoading) {
    return <div>Loading...</div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-muted-foreground mt-2">{campaign.description}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.status}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Schedule Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.is_recurring ? 'Recurring' : 'One-time'}
            </div>
            {campaign.is_recurring && (
              <div className="text-muted-foreground">
                {campaign.recurring_frequency}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="new-assignment">New Assignment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assignments">
          <AssignmentInstanceList 
            assignments={assignments || []}
            isLoading={assignmentsLoading}
          />
        </TabsContent>
        
        <TabsContent value="new-assignment">
          <AssignSurveyDialog 
            surveyId={campaign.survey_id}
            campaignId={campaign.id}
            isRecurring={campaign.is_recurring}
            recurringFrequency={campaign.recurring_frequency}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}