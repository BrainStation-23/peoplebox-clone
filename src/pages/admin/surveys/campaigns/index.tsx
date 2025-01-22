import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CampaignTable } from "./components/CampaignTable";

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select(`
          *,
          survey:surveys(name),
          created_by:profiles(email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Survey Campaigns</h1>
        <Button asChild>
          <Link to="/admin/surveys/campaigns/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : campaigns?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No campaigns found</h3>
          <p className="text-muted-foreground">Create your first campaign to get started.</p>
        </div>
      ) : (
        <CampaignTable campaigns={campaigns || []} />
      )}
    </div>
  );
}