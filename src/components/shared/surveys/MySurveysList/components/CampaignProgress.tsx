import { Progress } from "@/components/ui/progress";

interface CampaignProgressProps {
  campaign: {
    completion_rate: number | null;
  };
}

export default function CampaignProgress({ campaign }: CampaignProgressProps) {
  const rate = campaign.completion_rate ?? 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Campaign Progress</span>
        <span>{Math.round(rate)}%</span>
      </div>
      <Progress value={rate} />
    </div>
  );
}