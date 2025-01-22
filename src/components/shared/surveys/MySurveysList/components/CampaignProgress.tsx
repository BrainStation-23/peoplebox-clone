import { Progress } from "@/components/ui/progress";

interface CampaignProgressProps {
  campaign: {
    completion_rate: number;
  };
}

export default function CampaignProgress({ campaign }: CampaignProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Campaign Progress</span>
        <span>{Math.round(campaign.completion_rate)}%</span>
      </div>
      <Progress value={campaign.completion_rate} />
    </div>
  );
}