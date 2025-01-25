import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExportButton } from "./ExportButton";

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
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
      </div>
    );
  }

  return (
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
      </div>
      
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
  );
}