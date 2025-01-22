import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CampaignTable } from "./components/CampaignTable";
import { CampaignSearchBar } from "./components/CampaignSearchBar";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'starts_at' | 'ends_at' | null>('starts_at');
  const { toast } = useToast();

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select(`
          *,
          survey:surveys(name),
          created_by:profiles(email)
        `)
        .order(sortBy || 'created_at', { ascending: sortOrder === 'asc' });
      
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('survey_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
    refetch();
  };

  const handleSort = (field: 'starts_at' | 'ends_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredCampaigns = campaigns?.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.survey.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="flex gap-4 items-center">
        <CampaignSearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : filteredCampaigns?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No campaigns found</h3>
          <p className="text-muted-foreground">Create your first campaign to get started.</p>
        </div>
      ) : (
        <CampaignTable 
          campaigns={filteredCampaigns || []} 
          onDelete={handleDelete}
          sortOrder={sortOrder}
          sortBy={sortBy}
          onSort={handleSort}
        />
      )}
    </div>
  );
}