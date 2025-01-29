import { Progress } from "@/components/ui/progress";

interface NpsData {
  rating: number;
  count: number;
}

interface NpsChartProps {
  data: NpsData[];
}

export function NpsChart({ data }: NpsChartProps) {
  // Calculate totals and segments
  const totalResponses = data.reduce((sum, item) => sum + item.count, 0);
  
  const segments = data.reduce((acc, item) => {
    if (item.rating <= 6) {
      acc.detractors += item.count;
    } else if (item.rating <= 8) {
      acc.passives += item.count;
    } else {
      acc.promoters += item.count;
    }
    return acc;
  }, { detractors: 0, passives: 0, promoters: 0 });

  // Calculate percentages
  const percentages = {
    detractors: (segments.detractors / totalResponses) * 100,
    passives: (segments.passives / totalResponses) * 100,
    promoters: (segments.promoters / totalResponses) * 100,
  };

  // Calculate NPS score
  const npsScore = Math.round(percentages.promoters - percentages.detractors);

  return (
    <div className="space-y-6">
      {/* NPS Score */}
      <div className="text-center">
        <div className="text-2xl font-semibold mb-1">NPS Score</div>
        <div className="text-4xl font-bold">{npsScore}</div>
      </div>

      {/* Segments */}
      <div className="space-y-4">
        {/* Promoters */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Promoters</span>
            <span className="font-medium">
              {Math.round(percentages.promoters)}% ({segments.promoters})
            </span>
          </div>
          <Progress 
            value={percentages.promoters} 
            className="bg-gray-100 h-2"
            indicatorClassName="bg-[#22c55e]"
          />
        </div>

        {/* Passives */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Passives</span>
            <span className="font-medium">
              {Math.round(percentages.passives)}% ({segments.passives})
            </span>
          </div>
          <Progress 
            value={percentages.passives} 
            className="bg-gray-100 h-2"
            indicatorClassName="bg-[#eab308]"
          />
        </div>

        {/* Detractors */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Detractors</span>
            <span className="font-medium">
              {Math.round(percentages.detractors)}% ({segments.detractors})
            </span>
          </div>
          <Progress 
            value={percentages.detractors} 
            className="bg-gray-100 h-2"
            indicatorClassName="bg-[#ef4444]"
          />
        </div>
      </div>

      {/* Total Responses */}
      <div className="text-center text-sm text-muted-foreground">
        Total Responses: {totalResponses}
      </div>
    </div>
  );
}