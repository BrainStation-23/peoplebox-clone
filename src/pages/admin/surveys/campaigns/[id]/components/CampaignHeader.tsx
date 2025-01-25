import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Edit, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExportButton } from "./ExportButton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CampaignHeaderProps {
  campaign: any;
  isLoading?: boolean;
  statusData?: any[];
  completionRate?: number;
  responseData?: any[];
  genderData?: any[];
  locationData?: any[];
  employmentData?: any[];
}

export function CampaignHeader({ 
  campaign, 
  isLoading,
  statusData,
  completionRate,
  responseData,
  genderData,
  locationData,
  employmentData,
}: CampaignHeaderProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/admin/surveys/campaigns")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
          <h1 className="text-2xl font-bold">{campaign?.name}</h1>
          <Badge variant={campaign?.status === 'active' ? 'default' : 'secondary'}>
            {campaign?.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate(`/admin/surveys/campaigns/${campaign?.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit Campaign
          </Button>
          <ExportButton
            campaignName={campaign?.name || "Campaign Report"}
            statusData={statusData}
            completionRate={completionRate}
            responseData={responseData}
            genderData={genderData}
            locationData={locationData}
            employmentData={employmentData}
          />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Start Date:</span>
          <span className="font-medium">
            {campaign?.starts_at ? format(new Date(campaign.starts_at), 'MMM d, yyyy') : 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>End Date:</span>
          <span className="font-medium">
            {campaign?.ends_at ? format(new Date(campaign.ends_at), 'MMM d, yyyy') : 'N/A'}
          </span>
        </div>
        {campaign?.description && (
          <div className="flex items-center gap-2">
            <span>Description:</span>
            <span className="font-medium">{campaign.description}</span>
          </div>
        )}
      </div>
    </div>
  );
}