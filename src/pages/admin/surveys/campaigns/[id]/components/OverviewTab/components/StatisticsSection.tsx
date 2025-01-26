import { CompletionRateCard } from "../CompletionRateCard";
import { SBUResponseRates } from "../SBUResponseRates";
import { CompletionTrends } from "../CompletionTrends";

type StatisticsSectionProps = {
  instanceStats?: {
    completionRate: number;
    totalAssignments: number;
    completedResponses: number;
  } | null;
  campaignId: string;
  selectedInstanceId?: string;
};

export function StatisticsSection({ 
  instanceStats, 
  campaignId, 
  selectedInstanceId 
}: StatisticsSectionProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <CompletionRateCard completionRate={instanceStats?.completionRate} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <SBUResponseRates 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
        <CompletionTrends 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
      </div>
    </>
  );
}