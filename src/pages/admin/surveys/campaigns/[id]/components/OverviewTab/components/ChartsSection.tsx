import { StatusDistributionChart } from "../StatusDistributionChart";
import { ResponseRateChart } from "../ResponseRateChart";
import { ResponseByGenderChart } from "../ResponseByGenderChart";
import { ResponseByLocationChart } from "../ResponseByLocationChart";
import { ResponseByEmploymentTypeChart } from "../ResponseByEmploymentTypeChart";
import type { StatusData } from "../StatusDistributionChart";

type ChartsSectionProps = {
  statusData: StatusData[] | undefined;
  responseData: { date: string; count: number; }[] | undefined;
  campaignId: string;
  selectedInstanceId?: string;
};

export function ChartsSection({ 
  statusData, 
  responseData, 
  campaignId, 
  selectedInstanceId 
}: ChartsSectionProps) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <StatusDistributionChart data={statusData || []} />
        <ResponseRateChart data={responseData || []} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ResponseByGenderChart 
          campaignId={campaignId} 
          instanceId={selectedInstanceId}
        />
        <ResponseByLocationChart 
          campaignId={campaignId} 
          instanceId={selectedInstanceId}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ResponseByEmploymentTypeChart 
          campaignId={campaignId} 
          instanceId={selectedInstanceId}
        />
      </div>
    </>
  );
}