import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { Campaign } from "@/types/survey";

interface CampaignHeaderProps {
  campaign: Campaign | null;
  isLoading: boolean;
}

export function CampaignHeader({ campaign, isLoading }: CampaignHeaderProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-muted-foreground mt-1">{campaign.description}</p>
        )}
      </div>
      <Button asChild variant="outline">
        <Link to={`/admin/surveys/campaigns/${campaign.id}/edit`}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Campaign
        </Link>
      </Button>
    </div>
  );
}